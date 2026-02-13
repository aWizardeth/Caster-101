// chia-cat-prices API route for Next.js
// MODE 1: emoji market prices (default) - Spacescan → Dexie fallback
// MODE 2: treasury wallets (?mode=treasury&wallets=...)

import { NextResponse } from 'next/server';
import { CACHE_CONTROL, INPUTS, TIMEOUTS, UA_HEADERS, URLS, getPrivateHeaders } from '@/lib/api-inputs';

const CAT_IDS = INPUTS.catIds;
const sleep = ms => new Promise(res => setTimeout(res, ms));

async function timedFetch(url, ms, provider) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    try {
        const r = await fetch(url, { 
            headers: { ...UA_HEADERS, ...getPrivateHeaders(provider) }, 
            signal: ctrl.signal 
        });
        clearTimeout(timer);
        return r;
    } catch (e) { 
        clearTimeout(timer); 
        throw e; 
    }
}

// Retry fetch with exponential backoff for 429 errors
async function retryFetch(url, ms, provider, maxRetries = 3) {
    for (let i = 0; i <= maxRetries; i++) {
        try {
            const resp = await timedFetch(url, ms, provider);
            if (resp.status === 429 && i < maxRetries) {
                const backoff = 3000 * Math.pow(2, i); // 3s, 6s, 12s
                console.log(`[treasury] 429 rate limit, waiting ${backoff}ms before retry ${i+1}/${maxRetries}`);
                await sleep(backoff);
                continue;
            }
            return resp;
        } catch (e) {
            if (i === maxRetries) throw e;
            await sleep(1500 * (i + 1));
        }
    }
}

// ── TREASURY MODE ────────────────────────────────────────────────────────────

async function fetchTreasuryWallets(wallets) {
    console.log(`[fetchTreasuryWallets] Called with ${wallets.length} wallets`);
    const results = [];
    for (const wallet of wallets) {
        console.log(`[fetchTreasuryWallets] Processing wallet: ${wallet.slice(0, 10)}...${wallet.slice(-8)}`);
        const walletData = { wallet, xchBal: 0, nfts: [], tokens: [] };
        try {
            // XCH Balance - try xchscan first, fallback to spacescan
            try {
                const balResp = await timedFetch(URLS.xchscanBalance(wallet), 15000);
                if (balResp.ok) {
                    const balData = await balResp.json();
                    walletData.xchBal = parseFloat(balData?.xch || 0);
                }
            } catch (e) { 
                console.warn(`[treasury] xchscan balance failed: ${e.message}, trying spacescan...`);
                // Fallback to Spacescan
                try {
                    const balResp = await timedFetch(URLS.spacescanXchBalance(wallet), 10000, 'spacescan');
                    if (balResp.ok) {
                        const balData = await balResp.json();
                        walletData.xchBal = parseFloat(balData?.xch || 0);
                    }
                } catch (e2) {
                    console.warn(`[treasury] spacescan balance also failed: ${e2.message}`);
                }
            }
            await sleep(3000); // Increased to 3s to avoid rate limiting

            // NFTs via Spacescan (best effort)
            try {
                const nftUrl = URLS.spacescanNftBalance(wallet);
                console.log(`[treasury] Fetching NFTs from: ${nftUrl}`);
                const nftResp = await retryFetch(nftUrl, TIMEOUTS.spacescanDefault, 'spacescan');
                console.log(`[treasury] NFT response status: ${nftResp.status}`);
                if (nftResp.ok) {
                    const nftData = await nftResp.json();
                    console.log(`[treasury] NFT data structure:`, nftData);
                    walletData.nfts = (nftData?.balance || []).map(n => ({
                        nft_id: n.nft_id || '', 
                        name: n.name || '',
                        collection_id: n.collection_id || '', 
                        preview_url: n.preview_url || ''
                    }));
                    console.log(`[treasury] Mapped ${walletData.nfts.length} NFTs`);
                } else {
                    console.warn(`[treasury] NFT fetch failed with status: ${nftResp.status}`);
                }
            } catch (e) {
                console.error(`[treasury] NFT fetch error: ${e.message}`);
            }
            await sleep(3000); // Increased to 3s to avoid rate limiting

            // Tokens via Spacescan (best effort)
            try {
                const tokUrl = URLS.spacescanTokenBalance(wallet);
                console.log(`[treasury] Fetching tokens from: ${tokUrl}`);
                const tokResp = await retryFetch(tokUrl, TIMEOUTS.spacescanTokenBalance, 'spacescan');
                console.log(`[treasury] Token response status: ${tokResp.status}`);
                if (tokResp.ok) {
                    const tokData = await tokResp.json();
                    console.log(`[treasury] Token data structure:`, tokData);
                    const rawTokens = tokData?.data || [];
                    console.log(`[treasury] Raw token count: ${rawTokens.length}`);
                    walletData.tokens = rawTokens
                        .filter(t => parseFloat(t.balance || 0) > 0)
                        .map(t => ({
                            asset_id: t.asset_id || '', 
                            name: t.name || t.symbol || '',
                            symbol: t.symbol || t.name || '', 
                            balance: parseFloat(t.balance || 0),
                            price: parseFloat(t.price || 0), 
                            total_value: parseFloat(t.total_value || 0)
                        }));
                    console.log(`[treasury] Filtered/mapped ${walletData.tokens.length} tokens`);
                } else {
                    console.warn(`[treasury] Token fetch failed with status: ${tokResp.status}`);
                }
            } catch (e) {
                console.error(`[treasury] Token fetch error: ${e.message}`);
            }
            await sleep(3000); // Increased to 3s to avoid rate limiting

            console.log(`[treasury] ${wallet.slice(-8)}: ${walletData.xchBal.toFixed(4)} XCH, ${walletData.nfts.length} NFTs, ${walletData.tokens.length} tokens`);
        } catch (err) {
            console.error(`[treasury] Error: ${err.message}`);
        }
        results.push(walletData);
    }
    return results;
}

// ── EMOJI MARKET MODE ────────────────────────────────────────────────────────

async function getSpacescanPrice(assetId) {
    try {
        const r = await timedFetch(URLS.spacescanCatInfo(assetId), TIMEOUTS.fast, 'spacescan');
        if (!r.ok) return null;
        const d = await r.json();
        const price = parseFloat(d?.data?.amount_price || 0);
        if (price <= 0) return null;
        // Use circulating supply if available, otherwise use total supply
        const supply = parseFloat(d?.data?.circulating_supply || d?.data?.total_supply || 0);
        const mcap = supply > 0 ? supply * price : parseFloat(d?.data?.market_cap || 0);
        return { price, change: parseFloat(d?.data?.pricepercentage || 0), mcap, source: 'spacescan' };
    } catch (_) { 
        return null; 
    }
}

async function getDexieBestAsk(assetId, xchUsd) {
    try {
        const r = await timedFetch(URLS.dexieOffers(assetId), 7000);
        if (!r.ok) return null;
        const d = await r.json();
        const offers = (d.offers || []).filter(o => o.price > 0);
        if (!offers.length) return null;
        return { 
            price: Math.min(...offers.map(o => o.price)) * xchUsd, 
            change: 0, 
            mcap: 0, 
            source: 'dexie' 
        };
    } catch (_) { 
        return null; 
    }
}

// ── HANDLER ──────────────────────────────────────────────────────────────────

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const t0 = Date.now();

    // TREASURY MODE
    if (searchParams.get('mode') === 'treasury' && searchParams.get('wallets')) {
        const wallets = searchParams.get('wallets').split(',').map(w => w.trim()).filter(Boolean);
        console.log(`[TREASURY API] Starting fetch for ${wallets.length} wallets:`, wallets);
        try {
            const walletData = await fetchTreasuryWallets(wallets);
            console.log(`[TREASURY API] Completed fetch. Returning ${walletData.length} wallet results`);
            return NextResponse.json(
                { ok: true, wallets: walletData, elapsed_ms: Date.now() - t0 },
                {
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Cache-Control': CACHE_CONTROL.short
                    }
                }
            );
        } catch (err) {
            console.error('[TREASURY API] Error:', err);
            return NextResponse.json(
                { ok: false, error: err.message },
                { 
                    status: 500,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Cache-Control': CACHE_CONTROL.short
                    }
                }
            );
        }
    }

    // EMOJI MARKET MODE
    try {
        const xchRespP = timedFetch(URLS.coingeckoSimplePrice('chia'), 6000)
            .then(r => r.ok ? r.json() : {})
            .catch(() => ({}));

        // Also fetch Dexie tickers in parallel (for fallback)
        const dexieTickersP = timedFetch(URLS.dexieTickers(), 8000)
            .then(r => r.ok ? r.json() : {})
            .catch(() => ({}));

        // Try Spacescan sequentially
        const catResults = [];
        for (let i = 0; i < CAT_IDS.length; i++) {
            if (i > 0) await sleep(250);
            catResults.push(await getSpacescanPrice(CAT_IDS[i]));
        }

        const xchResp = await xchRespP;
        const xchUsd = xchResp?.chia?.usd || 3;
        const dexieTickers = await dexieTickersP;

        // Build Dexie ticker map
        const tickerMap = {};
        for (const tick of (dexieTickers.tickers || [])) {
            const bid = (tick.base_id || '').toLowerCase();
            const lp = parseFloat(tick.last_price || 0);
            if (bid && lp > 0) tickerMap[bid] = lp * xchUsd;
        }

        const prices = {}, changes = {}, mcaps = {}, sources = {};
        const dexieNeeded = [];

        for (let i = 0; i < CAT_IDS.length; i++) {
            const id = CAT_IDS[i], r = catResults[i];
            if (r) { 
                prices[id] = r.price; 
                changes[id] = r.change; 
                mcaps[id] = r.mcap; 
                sources[id] = r.source; 
            } else {
                // Try Dexie ticker first
                const tp = tickerMap[id.toLowerCase()];
                if (tp > 0) { 
                    prices[id] = tp; 
                    changes[id] = 0; 
                    mcaps[id] = 0; 
                    sources[id] = 'dexie'; 
                } else {
                    dexieNeeded.push(id);
                }
            }
        }

        // Individual Dexie offers for anything still missing
        if (dexieNeeded.length > 0) {
            const dr = await Promise.all(dexieNeeded.map(id => getDexieBestAsk(id, xchUsd)));
            for (let i = 0; i < dexieNeeded.length; i++) {
                const id = dexieNeeded[i], r = dr[i];
                prices[id] = r?.price || 0; 
                changes[id] = r?.change || 0;
                mcaps[id] = r?.mcap || 0; 
                sources[id] = r?.source || 'none';
            }
        }

        return NextResponse.json(
            { prices, changes, mcaps, xch_usd: xchUsd, sources, success: true },
            {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': CACHE_CONTROL.short
                }
            }
        );
    } catch (e) {
        return NextResponse.json(
            { prices: {}, changes: {}, mcaps: {}, xch_usd: 3, success: false, error: e.message },
            {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': CACHE_CONTROL.short
                }
            }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}
