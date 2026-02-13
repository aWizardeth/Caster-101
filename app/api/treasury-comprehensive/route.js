// treasury-comprehensive.js - Next.js API Route
// Base: LP valuation using actual pool reserves via RPC
// Chia: tokens + NFTs with pricing

import { NextResponse } from 'next/server';

const HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
};

// Multiple RPC endpoints — round-robin on failure
const BASE_RPCS = [
    'https://base-rpc.publicnode.com',
    'https://base.llamarpc.com',
    'https://base.meowrpc.com',
];
let _rpcIdx = 0;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function safeFetch(url, opts = {}, ms = 10000) {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), ms);
    try {
        const r = await fetch(url, {
            ...opts,
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json', ...(opts.headers || {}) },
            signal: c.signal
        });
        clearTimeout(t);
        return r;
    } catch (e) { clearTimeout(t); throw e; }
}

async function getEthPrice() {
    try {
        const r = await safeFetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', {}, 5000);
        if (r.ok) { const d = await r.json(); return d.ethereum?.usd || 2500; }
    } catch {}
    return 2500;
}

async function ethCall(to, data) {
    for (let attempt = 0; attempt < 3; attempt++) {
        const rpc = BASE_RPCS[(_rpcIdx + attempt) % BASE_RPCS.length];
        try {
            const r = await safeFetch(rpc, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to, data }, 'latest'] })
            }, 6000);
            if (!r.ok) { _rpcIdx++; continue; }
            const d = await r.json();
            if (d.error) { _rpcIdx++; continue; }
            return d.result || null;
        } catch { _rpcIdx++; await sleep(150); }
    }
    return null;
}

// Batch RPC
async function ethCallBatch(calls) {
    const rpc = BASE_RPCS[_rpcIdx % BASE_RPCS.length];
    const body = calls.map((c, i) => ({
        jsonrpc: '2.0', id: c.id !== undefined ? c.id : i,
        method: 'eth_call', params: [{ to: c.to, data: c.data }, 'latest']
    }));
    try {
        const r = await safeFetch(rpc, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }, 10000);
        if (!r.ok) return calls.map(() => null);
        const results = await r.json();
        const map = {};
        for (const res of (Array.isArray(results) ? results : [])) map[res.id] = res.result || null;
        return calls.map((c, i) => map[c.id !== undefined ? c.id : i] || null);
    } catch { return calls.map(() => null); }
}

function hexAddr(h) { return (!h || h === '0x' || h.length < 42) ? null : '0x' + h.slice(-40); }
function hexInt(h)  { try { return (!h || h === '0x') ? 0 : parseInt(h, 16); } catch { return 0; } }
function hexBig(h)  { try { return (!h || h === '0x') ? 0n : BigInt(h); } catch { return 0n; } }

function decodeString(hex) {
    if (!hex || hex === '0x') return null;
    try {
        const raw = Buffer.from(hex.slice(2), 'hex');
        const len = parseInt(raw.slice(32, 64).toString('hex'), 16);
        return raw.slice(64, 64 + len).toString('utf8').replace(/\x00/g, '').trim();
    } catch { return null; }
}

async function getDexPrices(tokenAddresses) {
    const pm = {};
    const unique = [...new Set(tokenAddresses.filter(Boolean).map(a => a.toLowerCase()))];
    for (let i = 0; i < unique.length; i += 20) {
        const batch = unique.slice(i, i + 20);
        try {
            let pairs = [];
            const r = await safeFetch(`https://api.dexscreener.com/tokens/v1/base/${batch.join(',')}`, {}, 10000);
            if (r.ok) {
                const d = await r.json();
                pairs = Array.isArray(d) ? d : (d.pairs || []);
            }
            if (!pairs.length) {
                const r2 = await safeFetch(`https://api.dexscreener.com/latest/dex/tokens/${batch.join(',')}`, {}, 10000);
                if (r2.ok) { const d = await r2.json(); pairs = d.pairs || []; }
            }
            for (const pair of pairs) {
                if (pair.chainId && pair.chainId !== 'base') continue;
                const ca = (pair.baseToken?.address || '').toLowerCase();
                const price = parseFloat(pair.priceUsd || 0);
                const liq = parseFloat(pair.liquidity?.usd || 0);
                if (ca && price > 0 && (!pm[ca] || liq > (pm[ca].liq || 0)))
                    pm[ca] = { price, liq, sym: pair.baseToken?.symbol || '' };
            }
        } catch (e) { console.warn('[BASE] DexScreener:', e.message); }
        if (i + 20 < unique.length) await sleep(300);
    }
    return pm;
}

// ─── BASE wallet ─────────────────────────────────────────────────────────────

async function fetchBase(address) {
    console.log(`[BASE] ${address}`);
    const tokens = [], priceMap = {};
    const ethPrice = await getEthPrice();
    priceMap['0x4200000000000000000000000000000000000006'] = ethPrice;

    try {
        const r = await safeFetch(`https://base.blockscout.com/api/v2/addresses/${address}`, {}, 8000);
        if (r.ok) {
            const d = await r.json();
            const b = parseFloat(d.coin_balance || 0) / 1e18;
            if (b > 0.0001) tokens.push({ symbol: 'ETH', name: 'Ethereum', balance: b, price: ethPrice, value: b * ethPrice, type: 'native' });
        }
    } catch (e) { console.warn('[BASE] ETH:', e.message); }

    let allItems = [];
    try {
        const r = await safeFetch(`https://base.blockscout.com/api/v2/addresses/${address}/token-balances`, {}, 12000);
        if (r.ok) { const d = await r.json(); allItems = Array.isArray(d) ? d : (d.items || []); }
    } catch (e) { console.warn('[BASE] ERC20:', e.message); }

    const lpItems = [], erc20Items = [];
    for (const item of allItems) {
        const tok = item.token || {}, dec = parseInt(tok.decimals || '18', 10) || 18;
        const bal = parseFloat(item.value || 0) / Math.pow(10, dec);
        if (bal < 0.000001) continue;
        const sym = tok.symbol || '', nm = tok.name || '';
        if (sym === '9mm-LP' || sym.includes('-LP') || sym.includes('UNI-V2') || (nm.includes(' LPs') && !nm.includes('Staked')))
            lpItems.push({ tok, dec, bal });
        else
            erc20Items.push({ tok, dec, bal });
    }
    console.log(`[BASE] ${erc20Items.length} erc20, ${lpItems.length} LP`);

    const needsPricing = [];
    for (const { tok, bal } of erc20Items) {
        const price = parseFloat(tok.exchange_rate || 0);
        const ca = (tok.address_hash || tok.address || '').toLowerCase();
        if (price > 0) {
            priceMap[ca] = price;
            tokens.push({ symbol: tok.symbol || '?', name: tok.name || tok.symbol, balance: bal, price, value: bal * price, type: 'erc20', contract: ca });
        } else if (ca) {
            needsPricing.push({ sym: tok.symbol || '?', name: tok.name || tok.symbol, bal, contract: ca });
        }
    }
    if (needsPricing.length > 0) {
        const pm = await getDexPrices(needsPricing.map(t => t.contract));
        for (const t of needsPricing) {
            const price = pm[t.contract]?.price || 0;
            if (price > 0) priceMap[t.contract] = price;
            tokens.push({ symbol: t.sym, name: t.name, balance: t.bal, price, value: t.bal * price, type: 'erc20', contract: t.contract });
        }
    }

    // ── LP positions: batched RPC calls ──────────
    const BATCH_SIZE = 5;
    const lpMeta = [];
    for (let i = 0; i < lpItems.length; i += BATCH_SIZE) {
        const chunk = lpItems.slice(i, i + BATCH_SIZE);
        const allCalls = chunk.flatMap(({ tok }, ci) => {
            const ca = (tok.address_hash || tok.address || '').toLowerCase();
            return [
                { id: ci * 5 + 0, to: ca, data: '0x0dfe1681' }, // token0()
                { id: ci * 5 + 1, to: ca, data: '0xd21220a7' }, // token1()
                { id: ci * 5 + 2, to: ca, data: '0x0902f1ac' }, // getReserves()
                { id: ci * 5 + 3, to: ca, data: '0x18160ddd' }, // totalSupply()
                { id: ci * 5 + 4, to: ca, data: '0x313ce567' }, // decimals()
            ];
        });
        const results = await ethCallBatch(allCalls);
        for (let ci = 0; ci < chunk.length; ci++) {
            const { tok, bal } = chunk[ci];
            const ca = (tok.address_hash || tok.address || '').toLowerCase();
            const t0h    = results[ci * 5 + 0];
            const t1h    = results[ci * 5 + 1];
            const resHex = results[ci * 5 + 2];
            const tsh    = results[ci * 5 + 3];
            const lpdh   = results[ci * 5 + 4];
            const t0 = hexAddr(t0h), t1 = hexAddr(t1h);
            const lpDec = hexInt(lpdh) || 18;
            const ts = tsh ? Number(hexBig(tsh)) / Math.pow(10, lpDec) : 0;
            const r0 = resHex ? Number(hexBig('0x' + resHex.slice(2, 66))) : 0;
            const r1 = resHex ? Number(hexBig('0x' + resHex.slice(66, 130))) : 0;
            lpMeta.push({ ca, bal, t0, t1, r0, r1, ts, lpDec });
        }
        if (i + BATCH_SIZE < lpItems.length) await sleep(250);
    }
    console.log(`[BASE] ${lpMeta.length} LP pairs resolved`);

    // Get symbol+decimals for underlying tokens
    const lpTokenAddrs = [...new Set(lpMeta.flatMap(lp => [lp.t0, lp.t1].filter(Boolean)).map(a => a.toLowerCase()))];
    const tokInfo = {};
    if (lpTokenAddrs.length > 0) {
        const tokCalls = lpTokenAddrs.flatMap((ta, i) => [
            { id: i * 2,     to: ta, data: '0x313ce567' }, // decimals()
            { id: i * 2 + 1, to: ta, data: '0x95d89b41' }, // symbol()
        ]);
        const tokResults = await ethCallBatch(tokCalls);
        for (let i = 0; i < lpTokenAddrs.length; i++) {
            const ta = lpTokenAddrs[i];
            tokInfo[ta] = {
                dec: hexInt(tokResults[i * 2]) || 18,
                sym: decodeString(tokResults[i * 2 + 1]) || ta.slice(-6),
            };
        }
    }

    const lpPrices = await getDexPrices(lpTokenAddrs);
    for (const [ca, price] of Object.entries(priceMap)) {
        if (price > 0 && !lpPrices[ca]) lpPrices[ca] = { price };
    }

    for (const lp of lpMeta) {
        const ti0 = lp.t0 ? (tokInfo[lp.t0.toLowerCase()] || { dec: 18, sym: '?' }) : { dec: 18, sym: '?' };
        const ti1 = lp.t1 ? (tokInfo[lp.t1.toLowerCase()] || { dec: 18, sym: '?' }) : { dec: 18, sym: '?' };
        const pairName = `${ti0.sym}/${ti1.sym}`;
        const rv0 = lp.r0 / Math.pow(10, ti0.dec);
        const rv1 = lp.r1 / Math.pow(10, ti1.dec);
        const p0 = lp.t0 ? (lpPrices[lp.t0.toLowerCase()]?.price || 0) : 0;
        const p1 = lp.t1 ? (lpPrices[lp.t1.toLowerCase()]?.price || 0) : 0;
        let poolUsd = rv0 * p0 + rv1 * p1;
        if (poolUsd === 0 && p0 > 0) poolUsd = rv0 * p0 * 2;
        else if (poolUsd === 0 && p1 > 0) poolUsd = rv1 * p1 * 2;
        const share = lp.ts > 0 ? lp.bal / lp.ts : 0;
        const userValue = share * poolUsd;
        tokens.push({
            symbol: pairName, name: `${pairName} LP`, balance: lp.bal,
            price: lp.bal > 0 ? userValue / lp.bal : 0,
            value: userValue, type: 'lp', contract: lp.ca,
            totalLiqUsd: poolUsd, userSharePct: (share * 100).toFixed(4),
            pairName, token0: lp.t0, token1: lp.t1, price0: p0, price1: p1,
        });
    }

    const total = tokens.reduce((s, t) => s + (t.value || 0), 0);
    console.log(`[BASE] $${total.toFixed(2)}, ${tokens.length} tokens`);
    return { tokens, total };
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain');
    const address = searchParams.get('address');

    if (!chain) {
        return NextResponse.json({ error: 'Missing chain' }, { status: 400, headers: HEADERS });
    }

    try {
        if (chain === 'base') {
            if (!address) return NextResponse.json({ error: 'Missing address' }, { status: 400, headers: HEADERS });
            const result = await fetchBase(address);
            return NextResponse.json(result, { headers: { ...HEADERS, 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } });
        }

        return NextResponse.json({ error: 'Invalid chain' }, { status: 400, headers: HEADERS });
    } catch (err) {
        console.error('[API Error]', err);
        return NextResponse.json({ tokens: [], total: 0, error: err.message }, { status: 200, headers: HEADERS });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 200, headers: HEADERS });
}
