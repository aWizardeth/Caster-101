'use client';

import { useState, useEffect, useRef } from 'react';

// TODO: Add XCH wallet to bag search using Chia API
// TODO: Fix Chia API calls for consistent treasury loading - current issues with rate limiting

// Wrapper for Spacescan API calls - use proxy to avoid CORS issues with retry logic
const spacescanFetch = async (url, timeout = 12000, maxRetries = 3) => {
  const path = url.replace('https://api.spacescan.io/', '');
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const proxyUrl = `/api/spacescan-proxy?path=${encodeURIComponent(path)}`;
      console.log(`  🔗 Calling proxy (attempt ${attempt}/${maxRetries}): ${path}`);
      
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeout);
      const resp = await fetch(proxyUrl, { 
        headers: { Accept: 'application/json' }, 
        signal: ctrl.signal 
      });
      clearTimeout(timer);
      
      if (!resp.ok) {
        if (resp.status === 429) {
          console.warn(`  ⏱️ Rate limited (429) for ${path}, attempt ${attempt}/${maxRetries}`);
          if (attempt < maxRetries) {
            // Exponential backoff: 2s, 4s, 8s
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`  ⏳ Waiting ${delay/1000}s before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        console.warn(`  ❌ Proxy error for ${path}: HTTP ${resp.status}`);
        const errorText = await resp.text().catch(() => 'Unknown error');
        console.warn(`  ❌ Error details:`, errorText);
        return null;
      }
      
      const data = await resp.json();
      console.log(`  ✅ Proxy success for ${path}: ${JSON.stringify(data).slice(0, 100)}...`);
      return data;
      
    } catch(e) {
      lastError = e;
      console.warn(`  ❌ spacescanFetch error for ${path} (attempt ${attempt}/${maxRetries}):`, e.message);
      if (attempt < maxRetries) {
        const delay = 1500; // Fixed 1.5s delay for network errors
        console.log(`  ⏳ Retrying in ${delay/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error(`  ❌ All ${maxRetries} attempts failed for ${path}`);
  return null;
};

export default function Treasury() {
  const [loadingBase, setLoadingBase] = useState(true);
  const [loadingChia, setLoadingChia] = useState(true);
  const [baseTotal, setBaseTotal] = useState(0);
  const [chiaTotal, setChiaTotal] = useState(0);
  const [baseTokens, setBaseTokens] = useState([]);
  const [chiaTokens, setChiaTokens] = useState([]);
  const [nftCollections, setNftCollections] = useState([]);
  const [error, setError] = useState('');
  const isLoadingRef = useRef(false);

  // Treasury wallet addresses
  const BASE_WALLETS = [
    '0x8d8cb6D19E32115823Cf0008701A84fB07F43467',
    '0xEEDC069F861880eC1B5f41c9bC7a747DC1cE32b9'
  ];
  
  const CHIA_WALLETS = [
    'xch10na8nqys9afs0fl74vvd6xl3akgu77p8mvjsp2ywy7rhq2s0jqys3nf7dl',
    'xch1g477lha2wjjq9634kgqmryf4gplft9cjgv2vd29tq3ya26glwlkqp6pyex',
    'xch1el40ydk4v2ccdq2l8d28wvr8hnndar0xywfgqel36f85ps8gj9jqfrm64j'
  ];
  
  const CACHE_KEY = 'awiz_chia_treasury_v2';
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    loadTreasury();
  }, []);

  const loadTreasury = async () => {
    if (isLoadingRef.current) {
      console.log('⏳ Treasury already loading, skipping duplicate call');
      return;
    }
    
    isLoadingRef.current = true;
    setLoadingBase(true);
    setLoadingChia(true);
    setError('');

    // Load Base wallets first (fast - shows in ~6 seconds)
    loadBaseData();
    
    // Load Chia wallets in background (browser-direct calls, much faster)
    loadChiaDataDirect();
  };

  const loadBaseData = async () => {
    try {
      const baseResults = await Promise.all(
        BASE_WALLETS.map(addr => 
          fetch(`/api/treasury-comprehensive?address=${addr}&chain=base`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
      );

      const baseData = baseResults.filter(r => r && !r.error);
      const allBaseTokens = [];
      let baseTotalValue = 0;

      baseData.forEach(data => {
        if (data.tokens) {
          allBaseTokens.push(...data.tokens);
          baseTotalValue += data.total || 0;
        }
      });

      setBaseTokens(allBaseTokens);
      setBaseTotal(baseTotalValue);
    } catch (err) {
      console.error('Base treasury load error:', err);
    } finally {
      setLoadingBase(false);
    }
  };

  const loadChiaDataDirect = async () => {
    try {
      // Check cache first for instant display
      let cached = null;
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.ts && Date.now() - parsed.ts < CACHE_TTL) {
            console.log('⚡ Chia treasury from cache (' + Math.round((Date.now() - parsed.ts)/1000) + 's old)');
            cached = parsed.data;
            // Display cached data immediately
            if (cached) {
              setChiaTokens(cached.tokens || []);
              setChiaTotal(cached.total || 0);
              setNftCollections(cached.collections || []);
            }
          }
        }
      } catch(_) {}
      
      // Fetch XCH price
      let xchPrice = 3;
      try {
        const xchResp = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=chia&vs_currencies=usd');
        if (xchResp.ok) {
          const xchData = await xchResp.json();
          xchPrice = xchData?.chia?.usd || 3;
        }
      } catch (e) {
        console.warn('Failed to fetch XCH price, using default:', e);
      }
      
      // Fetch XCH balances from xchscan in parallel (fast, no rate limit)
      console.log('📡 Fetching Chia treasury (xchscan + Spacescan browser)...');
      const balanceResults = await Promise.all(
        CHIA_WALLETS.map(async (w) => {
          try {
            const ctrl = new AbortController();
            const timeout = setTimeout(() => ctrl.abort(), 20000); // 20s timeout
            const resp = await fetch(`https://xchscan.com/api/account/balance?address=${w}`, {
              signal: ctrl.signal
            });
            clearTimeout(timeout);
            if (resp.ok) {
              const data = await resp.json();
              const balance = parseFloat(data?.xch || 0);
              console.log(`  ✅ XCH balance for ${w.slice(-8)}: ${balance.toFixed(4)}`);
              return balance;
            }
            console.warn(`  ❌ XCH fetch failed for ${w.slice(-8)}: HTTP ${resp.status}`);
            return 0;
          } catch (e) {
            console.warn(`  ❌ XCH fetch failed for ${w.slice(-8)}:`, e.message);
            return 0;
          }
        })
      );
      console.log('  ✅ XCH balances:', balanceResults.map((b,i) => CHIA_WALLETS[i].slice(-8) + '=' + b.toFixed(4)));
      
      // Fetch tokens + NFTs from Spacescan via proxy (SEQUENTIAL with rate limiting)
      console.log(`  📡 Starting sequential wallet fetches (${CHIA_WALLETS.length} wallets) to respect rate limits...`);
      const results = [];
      
      for (let idx = 0; idx < CHIA_WALLETS.length; idx++) {
        const wallet = CHIA_WALLETS[idx];
        const xchBal = balanceResults[idx];
        let tokens = [], nfts = [];
        
        console.log(`  📡 Fetching wallet ${idx+1}/${CHIA_WALLETS.length}...`);

        // Add delay between wallets to respect rate limits (except for first wallet)
        if (idx > 0) {
          const rateDelay = 2000; // 2 seconds between wallets
          console.log(`  ⏳ Rate limiting delay: ${rateDelay/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, rateDelay));
        }

        // Fetch tokens first, then NFTs (sequential to avoid overwhelming API)
        try {
          // Fetch tokens
          const tokData = await spacescanFetch(`https://api.spacescan.io/address/token-balance/${wallet}`, 25000);
          if (tokData?.data) {
            tokens = tokData.data
              .filter(t => parseFloat(t.balance || 0) > 0)
              .map(t => ({
                asset_id: t.asset_id || '', 
                name: t.name || t.symbol || '',
                symbol: t.symbol || t.name || '', 
                balance: parseFloat(t.balance || 0),
                price: parseFloat(t.price || 0), 
                total_value: parseFloat(t.total_value || 0)
              }));
            console.log(`    ✅ Tokens: ${tokens.length}`);
          } else {
            console.log(`    ⚠️ No token data returned`);
          }

          // Small delay between token and NFT calls
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Fetch NFTs
          const nftData = await spacescanFetch(`https://api.spacescan.io/address/nft-balance/${wallet}`, 15000);
          if (nftData?.balance) {
            nfts = nftData.balance.map(n => ({
              nft_id: n.nft_id || '', 
              name: n.name || '',
              collection_id: n.collection_id || '', 
              preview_url: n.preview_url || ''
            }));
            console.log(`    ✅ NFTs: ${nfts.length}`);
          } else {
            console.log(`    ⚠️ No NFT data returned`);
          }

        } catch (e) {
          console.warn(`    ❌ Wallet ${idx+1} fetch failed:`, e.message);
        }

        console.log(`  ✅ ${wallet.slice(-8)}: ${xchBal.toFixed(4)} XCH, ${nfts.length} NFTs, ${tokens.length} tokens`);

        // Build wallet result
        const walletResult = {
          idx, wallet, xchBal, nfts,
          tokens: tokens.map(t => {
            // Enhanced name resolution: use name → symbol → readable fallback
            let name = (t.name || t.symbol || '').trim();
            if (!name) name = `Token ${(t.asset_id || '').slice(0,6).toUpperCase()}`;
            const sym = t.symbol || name.slice(0,8) || (t.asset_id || '').slice(0,8);
            const price = parseFloat(t.price || 0);
            const balance = parseFloat(t.balance || 0);
            const value = parseFloat(t.total_value || 0) || (balance * price);
            
            return {
              symbol: sym,
              name: name,
              assetId: t.asset_id,
              balance, price, value,
              type: 'cat',
              image: ''
            };
          })
        };
        
        results.push(walletResult);
      }
      
      console.log(`✅ All ${results.length} wallets fetched, building token map...`);
      
      // Build token map and NFT collections from results
      const tMap = new Map();
      const allNFTs = [];
      
      for (let i = 0; i < results.length; i++) {
        const w = results[i];
        console.log(`✅ W${i}: ${w.xchBal.toFixed(4)} XCH, ${w.nfts.length} NFTs, ${w.tokens.length} tokens`);
        
        // Add XCH balance
        if (w.xchBal > 0) {
          if (!tMap.has('XCH_NATIVE')) {
            tMap.set('XCH_NATIVE', {
              symbol: 'XCH',
              name: 'Chia',
              assetId: 'XCH_NATIVE',
              balance: 0,
              price: xchPrice,
              value: 0,
              type: 'native',
              image: ''
            });
          }
          const xchToken = tMap.get('XCH_NATIVE');
          xchToken.balance += w.xchBal;
          xchToken.value += w.xchBal * xchPrice;
        }
        
        // Add CAT/LP tokens
        for (const tok of w.tokens) {
          const key = tok.assetId || tok.symbol;
          if (tMap.has(key)) {
            const existing = tMap.get(key);
            existing.balance += tok.balance;
            existing.value += tok.value;
          } else {
            tMap.set(key, { ...tok });
          }
        }
        
        // Collect NFTs
        allNFTs.push(...w.nfts);
      }
      
      // Build NFT collections
      let mergedNFTCount = allNFTs.length;
      let mergedNFTCols = [];
      if (mergedNFTCount > 0) {
        const colMap = {};
        for (const nft of allNFTs) {
          const cid = nft.collection_id || 'uncategorized';
          if (!colMap[cid]) {
            colMap[cid] = {
              id: cid,
              name: (nft.name || '').replace(/\s*#\d+\s*$/, '').trim() || 'Unknown Collection',
              count: 0,
              image: nft.preview_url || '',
              nfts: []
            };
          }
          colMap[cid].count++;
          if (colMap[cid].nfts.length < 3) {
            colMap[cid].nfts.push({
              id: nft.nft_id || '',
              name: nft.name || '',
              image: nft.preview_url || ''
            });
          }
          // Set first image if not set
          if (!colMap[cid].image && nft.preview_url) {
            colMap[cid].image = nft.preview_url;
          }
        }
        mergedNFTCols = Object.values(colMap).sort((a, b) => b.count - a.count);
        console.log(`✅ NFTs: ${mergedNFTCount} in ${mergedNFTCols.length} collections`);
      }
      
      // Render everything
      const mergedChiaTokens = Array.from(tMap.values());
      const mergedChiaTotal = mergedChiaTokens.reduce((s, t) => s + (t.value || 0), 0);
      
      setChiaTokens(mergedChiaTokens);
      setChiaTotal(mergedChiaTotal);
      setNftCollections(mergedNFTCols);
      
      // Cache the fresh data
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          ts: Date.now(),
          data: {
            tokens: mergedChiaTokens,
            total: mergedChiaTotal,
            collections: mergedNFTCols
          }
        }));
      } catch(_) {}
      
      console.log(`✅ Chia treasury loaded: ${mergedChiaTokens.length} tokens, $${mergedChiaTotal.toFixed(2)}, ${mergedNFTCount} NFTs`);
    } catch (err) {
      console.error('Chia treasury load error:', err);
      setError('Failed to load Chia data');
    } finally {
      setLoadingChia(false);
      isLoadingRef.current = false;
    }
  };

  const formatUsd = (v) => {
    if (!v || v <= 0) return '$0';
    if (v >= 1e6) return '$' + (v/1e6).toFixed(2) + 'M';
    if (v >= 1e3) return '$' + (v/1e3).toFixed(1) + 'K';
    return '$' + v.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
  };

  const formatBal = (v) => {
    if (!v || v === 0) return '0';
    if (v >= 1e6) return (v/1e6).toFixed(2) + 'M';
    if (v >= 1e3) return (v/1e3).toFixed(1) + 'K';
    if (v >= 1) return v.toLocaleString(undefined, {maximumFractionDigits: 4});
    return v.toPrecision(4);
  };

  const grandTotal = baseTotal + chiaTotal;

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Main Header with Total Portfolio */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.9), rgba(10, 10, 20, 0.95))',
        border: '2px solid rgba(251, 191, 36, 0.6)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(251, 191, 36, 0.3), 0 0 40px rgba(251, 191, 36, 0.2)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '12px'
          }}>Total Portfolio Value</div>
          <div style={{
            fontSize: '56px',
            fontWeight: 900,
            color: '#fbbf24',
            textShadow: '0 0 40px rgba(251, 191, 36, 0.6)',
            marginBottom: '24px',
            letterSpacing: '2px'
          }}>{(loadingBase && loadingChia) ? '⏳ Loading...' : formatUsd(grandTotal)}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(0, 82, 255, 0.4)'
            }}>
              <span style={{ fontSize: '24px' }}>🔵</span>
              <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>Base Network</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>{formatUsd(baseTotal)}</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(74, 222, 128, 0.4)'
            }}>
              <span style={{ fontSize: '24px' }}>🌱</span>
              <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>Chia Network</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>{formatUsd(chiaTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Holdings View */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Base Holdings */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.8), rgba(10, 10, 20, 0.9))',
          borderRadius: '16px',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
            background: 'linear-gradient(135deg, rgba(0, 82, 255, 0.2), rgba(0, 82, 255, 0.1))',
            border: '2px solid rgba(0, 82, 255, 0.5)',
            borderBottom: '2px solid rgba(0, 82, 255, 0.3)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', fontWeight: 900, color: 'white', marginBottom: '12px' }}>
              <span style={{ fontSize: '24px' }}>🔵</span>
              <span>Base Network</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
              <span>{baseTokens.length} tokens</span>
              <span style={{ fontWeight: 700, color: '#4ade80' }}>{formatUsd(baseTotal)}</span>
            </div>
          </div>
          <div style={{ padding: '16px', maxHeight: '600px', overflowY: 'auto' }}>
            {loadingBase ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255, 255, 255, 0.5)' }}>
                ⏳ Loading Base holdings...
              </div>
            ) : baseTokens.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255, 255, 255, 0.5)' }}>
                No tokens found
              </div>
            ) : (
              baseTokens.sort((a, b) => (b.value || 0) - (a.value || 0)).map((token, idx) => (
                <div key={idx} style={{
                  background: 'linear-gradient(135deg, rgba(30, 30, 40, 0.7), rgba(15, 15, 25, 0.9))',
                  border: '2px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '10px',
                  transition: 'all 0.3s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'white', maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {token.symbol}{token.type === 'lp' ? ' (LP)' : ''}
                    </span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: token.type === 'lp' ? '#63b3ed' : '#4ade80' }}>
                      {formatUsd(token.value || 0)}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '8px' }}>
                    <span>Bal: {formatBal(token.balance)}</span>
                    <span>Price: {token.price > 0 ? '$' + (token.price < 0.001 ? token.price.toFixed(8) : token.price.toLocaleString(undefined, {maximumSignificantDigits: 5})) : '—'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chia Holdings */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.8), rgba(10, 10, 20, 0.9))',
          borderRadius: '16px',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
            background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.2), rgba(74, 222, 128, 0.1))',
            border: '2px solid rgba(74, 222, 128, 0.5)',
            borderBottom: '2px solid rgba(74, 222, 128, 0.3)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', fontWeight: 900, color: 'white', marginBottom: '12px' }}>
              <span style={{ fontSize: '24px' }}>🌱</span>
              <span>Chia Network</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
              <span>{chiaTokens.length} tokens</span>
              <span style={{ fontWeight: 700, color: '#4ade80' }}>{formatUsd(chiaTotal)}</span>
            </div>
          </div>
          <div style={{ padding: '16px', maxHeight: '600px', overflowY: 'auto' }}>
            {loadingChia && chiaTokens.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255, 255, 255, 0.5)' }}>
                ⏳ Loading Chia holdings... (this may take 30-60 seconds)
              </div>
            ) : chiaTokens.length === 0 && !loadingChia ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255, 255, 255, 0.5)' }}>
                No tokens found
              </div>
            ) : (
              <>
                {chiaTokens.sort((a, b) => (b.value || 0) - (a.value || 0)).map((token, idx) => (
                  <div key={idx} style={{
                    background: 'linear-gradient(135deg, rgba(30, 30, 40, 0.7), rgba(15, 15, 25, 0.9))',
                    border: '2px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: '12px',
                    padding: '14px',
                    marginBottom: '10px',
                    transition: 'all 0.3s'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'white', maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {token.symbol}{token.type === 'lp' ? ' (LP)' : ''}
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: token.type === 'lp' ? '#63b3ed' : '#4ade80' }}>
                        {formatUsd(token.value || 0)}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '8px' }}>
                      <span>Bal: {formatBal(token.balance)}</span>
                      <span>Price: {token.price > 0 ? '$' + (token.price < 0.001 ? token.price.toFixed(8) : token.price.toLocaleString(undefined, {maximumSignificantDigits: 5})) : '—'}</span>
                    </div>
                  </div>
                ))}
                {loadingChia && (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px' }}>
                    ⏳ Loading more wallets...
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>

      {/* NFT Section */}
      <div style={{ marginTop: '32px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.08))',
          border: '2px solid rgba(168, 85, 247, 0.4)',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🖼️</span>
            <span>NFT Collections</span>
          </div>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Total NFTs</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#a855f7' }}>{nftCollections.reduce((sum, col) => sum + col.count, 0)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Collections</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#a855f7' }}>{nftCollections.length}</div>
            </div>
          </div>
        </div>
        
        {loadingChia && nftCollections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255, 255, 255, 0.4)' }}>
            ⏳ Loading NFTs...
          </div>
        ) : nftCollections.length === 0 && !loadingChia ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255, 255, 255, 0.4)' }}>
            🎨 No NFT collections found
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '14px'
          }}>
            {nftCollections.map((col, idx) => (
              <div
                key={idx}
                onClick={() => window.open(`https://mintgarden.io/collections/${col.id}`, '_blank')}
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 30, 40, 0.8), rgba(15, 15, 25, 0.9))',
                  border: '2px solid rgba(168, 85, 247, 0.4)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(168,85,247,0.75)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 28px rgba(168,85,247,0.28)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ position: 'relative', width: '100%', paddingTop: '100%', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: 'rgba(168, 85, 247, 0.1)',
                    border: '1px solid rgba(168, 85, 247, 0.3)'
                  }}>
                    {col.image ? (
                      <img
                        src={col.image}
                        alt={col.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement.innerHTML += '<div style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;font-size:36px;">🖼️</div>';
                        }}
                      />
                    ) : (
                      <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>🖼️</div>
                    )}
                  </div>
                  <div style={{
                    position: 'absolute',
                    top: '-7px',
                    right: '-7px',
                    background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 800,
                    borderRadius: '9px',
                    padding: '2px 7px',
                    border: '2px solid rgba(10, 10, 20, 0.9)',
                    minWidth: '20px',
                    textAlign: 'center',
                    zIndex: 2
                  }}>
                    {col.count}
                  </div>
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', lineHeight: '1.35', wordBreak: 'break-word', marginBottom: '4px' }}>
                    {col.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(168, 85, 247, 0.7)', fontWeight: 600 }}>View on MintGarden ↗</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginTop: '20px',
          color: '#ef4444',
          textAlign: 'center'
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
