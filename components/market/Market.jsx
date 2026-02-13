'use client';

import { useEffect, useState } from 'react';
import QuickLinks from './QuickLinks';
import SearchBar from './SearchBar';
import TokenCard from './TokenCard';

const TRACKED_TOKENS = [
  // Chia Network
  { id: 'xch', symbol: 'XCH', name: 'Chia', chain: 'Chia', assetId: 'Native' },
  { id: 'caster-chia', symbol: '✨❤️‍🔥🧙‍♂️', name: 'Caster', chain: 'Chia', assetId: 'a09af8b0d12b27772c64f89cf0d1db95186dca5b1871babc5108ff44f36305e6' },
  { id: 'spellpower-chia', symbol: '⚡️🪄', name: 'Spellpower', chain: 'Chia', assetId: 'eb2155a177b6060535dd8e72e98ddb0c77aea21fab53737de1c1ced3cb38e4c4' },
  { id: 'byc-chia', symbol: '💸', name: 'Bytecash', displayName: '$BYC', chain: 'Chia', assetId: 'ae1536f56760e471ad85ead45f00d680ff9cca73b8cc3407be778f1c0c606eac' },
  { id: 'love-chia', symbol: '❤️', name: 'Love', chain: 'Chia', assetId: '70010d83542594dd44314efbae75d82b3d9ae7d946921ed981a6cd08f0549e50' },
  { id: 'sprout-chia', symbol: '🌱', name: 'Sprout', chain: 'Chia', assetId: 'ab558b1b841365a24d1ff2264c55982e55664a8b6e45bc107446b7e667bb463b' },
  { id: 'pizza-chia', symbol: '🍕', name: 'Pizza', chain: 'Chia', assetId: 'dd37f678dda586fad9b1daeae1f7c5c137ffa6d947e1ed5c7b4f3c430da80638' },
  
  // Base Network
  { id: 'wxch-base', symbol: 'wXCH', name: 'Wrapped XCH', chain: 'Base', contract: '0x36be1d329444aef5d28df3662ec5b4f965cd93e9' },
  { id: 'caster-base', symbol: '✨❤️‍🔥🧙‍♂️', name: 'Caster', chain: 'Base', contract: '0x09Aa909Eea859f712f2Ae3dd1872671D2363f6f4' },
  { id: 'spellpower-base', symbol: '⚡️🪄', name: 'Spellpower', chain: 'Base', contract: '0x145F14b876051DC443dd18D5f8a7C48c5db75847' },
  { id: 'wiz-base', symbol: '🧙💸', name: 'Wizard Bucks', chain: 'Base', contract: '0x39916e508e389FBB4dDC3d1a38a5801f4eE253c7' },
  { id: 'love-base', symbol: '❤️', name: 'Love', chain: 'Base', contract: '0x817cAb331aaA4c24b4e32024FCa093AD40CBa208' },
  { id: 'sprout-base', symbol: '🌱', name: 'Sprout', chain: 'Base', contract: '0xd1b771CB462a4B0e4d56Bb68b4bF832994CC8820' },
  { id: 'pizza-base', symbol: '🍕', name: 'Pizza', chain: 'Base', contract: '0x84070f2c685b3d4B63c66f0B13fB83Fa6ccb4035' }
];

export default function Market() {
  const [allTokens, setAllTokens] = useState([]);
  const [chiaTokens, setChiaTokens] = useState([]);
  const [baseTokens, setBaseTokens] = useState([]);
  const [filteredChia, setFilteredChia] = useState([]);
  const [filteredBase, setFilteredBase] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [xchPrice, setXchPrice] = useState(0);
  const [wxchPrice, setWxchPrice] = useState(0);
  const [sortBy, setSortBy] = useState('marketCap'); // name, marketCap, arbitrage
  const [showSortInfo, setShowSortInfo] = useState(false);

  useEffect(() => {
    // Fetch token data from APIs
    fetchMarketData();
  }, []);

  useEffect(() => {
    // Filter and sort tokens based on search query and sort order
    let filteredC = searchQuery
      ? chiaTokens.filter(t => 
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [...chiaTokens];
    
    let filteredB = searchQuery
      ? baseTokens.filter(t => 
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [...baseTokens];

    // Apply sorting
    if (sortBy === 'name') {
      // Sort by name, with Chia before Base for same-named tokens
      const toSortName = t => t.name === 'Bytecash' ? 'Wizard Bucks' : t.name;
      filteredC.sort((a, b) => toSortName(a).localeCompare(toSortName(b)));
      filteredB.sort((a, b) => toSortName(a).localeCompare(toSortName(b)));
    } else if (sortBy === 'marketCap') {
      // Sort by market cap descending
      filteredC.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
      filteredB.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
    } else if (sortBy === 'arbitrage') {
      // Sort Chia tokens by arbitrage opportunity
      filteredC.sort((a, b) => {
        const baseTokenA = filteredB.find(bt => bt.symbol === a.symbol || 
          (a.name === 'Bytecash' && bt.name === 'Wizard Bucks'));
        const baseTokenB = filteredB.find(bt => bt.symbol === b.symbol || 
          (b.name === 'Bytecash' && bt.name === 'Wizard Bucks'));
        
        const arbA = (baseTokenA && baseTokenA.price > 0 && a.price > 0)
          ? Math.abs(((baseTokenA.price - a.price) / baseTokenA.price) * 100)
          : 0;
        const arbB = (baseTokenB && baseTokenB.price > 0 && b.price > 0)
          ? Math.abs(((baseTokenB.price - b.price) / baseTokenB.price) * 100)
          : 0;
        
        return arbB - arbA;
      });
      // Sort Base to match Chia order
      const sortedBase = [];
      filteredC.forEach(ct => {
        const bt = filteredB.find(t => t.symbol === ct.symbol || 
          (ct.name === 'Bytecash' && t.name === 'Wizard Bucks'));
        if (bt) sortedBase.push(bt);
      });
      filteredB.forEach(t => {
        if (!sortedBase.includes(t)) sortedBase.push(t);
      });
      filteredB = sortedBase;
    }
    
    setFilteredChia(filteredC);
    setFilteredBase(filteredB);
  }, [searchQuery, chiaTokens, baseTokens, sortBy]);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const tokens = [...TRACKED_TOKENS];
      
      // Fetch Chia data
      const [xchData, chiaResponse] = await Promise.all([
        fetch(`https://api.coingecko.com/api/v3/simple/price?ids=chia&vs_currencies=usd&include_24hr_change=true&t=${Date.now()}`)
          .then(r => r.ok ? r.json() : {}).catch(() => ({})),
        fetch(`/api/chia-cat-prices?t=${Date.now()}`)
          .then(r => r.ok ? r.json() : {}).catch(() => ({}))
      ]);

      let xchPriceUSD = xchData.chia?.usd || 18.25;
      const xchChange = xchData.chia?.usd_24h_change || 0;

      // Fetch Base data from DexScreener with GeckoTerminal fallback
      const baseTokens = tokens.filter(t => t.chain === 'Base');
      const baseData = [];
      
      for (let i = 0; i < baseTokens.length; i++) {
        if (i > 0) await new Promise(res => setTimeout(res, 100)); // Rate limiting
        const token = baseTokens[i];
        let price = 0, change24h = 0, marketCap = 0;

        try {
          // Try DexScreener first
          const r = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token.contract.toLowerCase()}`);
          if (r.ok) {
            const d = await r.json();
            const pairs = d.pairs;
            if (pairs && Array.isArray(pairs)) {
              // Filter for valid quote tokens (WETH/USDC), sort by volume
              const validPairs = pairs.filter(p => {
                if (p.chainId !== 'base') return false;
                const quote = (p.quoteToken?.symbol || '').toUpperCase();
                return quote === 'WETH' || quote === 'USDC' || quote === 'ETH' || quote === 'USDT';
              });
              const best = validPairs.sort((a, b) => 
                (parseFloat(b.volume?.h24 || 0)) - (parseFloat(a.volume?.h24 || 0))
              )[0];
              if (best) {
                price = parseFloat(best.priceUsd || 0);
                change24h = parseFloat(best.priceChange?.h24 || 0);
                marketCap = parseFloat(best.fdv || best.marketCap || 0);
              }
            }
          }
        } catch (e) {
          console.warn(`DexScreener error for ${token.name}:`, e.message);
        }

        // GeckoTerminal fallback if DexScreener had no pairs
        if (price === 0) {
          try {
            const gtR = await fetch(
              `https://api.geckoterminal.com/api/v2/networks/base/tokens/${token.contract.toLowerCase()}`
            );
            if (gtR.ok) {
              const gtD = await gtR.json();
              const attr = gtD?.data?.attributes || {};
              const gtP = parseFloat(attr.price_usd || 0);
              if (gtP > 0) {
                price = gtP;
                marketCap = parseFloat(attr.fdv_usd || attr.market_cap_usd || 0);
                console.log(`✅ ${token.name} via GeckoTerminal: $${price.toFixed(10)}`);
              }
            }
          } catch (gte) {
            console.warn(`GeckoTerminal error for ${token.name}:`, gte.message);
          }
        }

        if (price > 0) {
          console.log(`✅ ${token.name}: $${price.toFixed(10)} mcap:$${marketCap.toFixed(0)}`);
        } else {
          console.warn(`⚠️ ${token.name}: no price from DexScreener or GeckoTerminal`);
        }

        baseData.push({ ...token, price, change24h, marketCap });
      }
      
      // Process Chia batch prices
      const chiaBatchPrices = chiaResponse.prices || {};
      const chiaBatchChanges = chiaResponse.changes || {};
      const chiaBatchMcaps = chiaResponse.mcaps || {};

      // Combine all data
      const enrichedTokens = tokens.map(token => {
        if (token.chain === 'Chia') {
          if (token.assetId === 'Native') {
            return { ...token, price: xchPriceUSD, change24h: xchChange, marketCap: 0 };
          }
          const price = chiaBatchPrices[token.assetId] || 0;
          const change = chiaBatchChanges[token.assetId] || 0;
          const mcap = chiaBatchMcaps[token.assetId] || 0;
          return { ...token, price, change24h: change, marketCap: mcap };
        }
        
        if (token.chain === 'Base') {
          const baseToken = baseData.find(b => b.id === token.id);
          if (baseToken) return baseToken;
        }
        
        return { ...token, price: 0, change24h: 0, marketCap: 0 };
      });

      // Separate XCH and wXCH for featured boxes
      const xchToken = enrichedTokens.find(t => t.symbol === 'XCH');
      const wxchToken = enrichedTokens.find(t => t.symbol === 'wXCH');
      
      if (xchToken) setXchPrice(xchToken.price);
      if (wxchToken) setWxchPrice(wxchToken.price);

      // Filter out XCH and wXCH from main lists
      const chiaList = enrichedTokens.filter(t => t.chain === 'Chia' && t.symbol !== 'XCH');
      const baseList = enrichedTokens.filter(t => t.chain === 'Base' && t.symbol !== 'wXCH');

      setAllTokens(enrichedTokens);
      setChiaTokens(chiaList);
      setBaseTokens(baseList);
      setFilteredChia(chiaList);
      setFilteredBase(baseList);
      
    } catch (error) {
      console.error('Failed to fetch market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  if (loading) {
    return <div className="loading">⏳ Loading market data...</div>;
  }

  return (
    <div>
      <QuickLinks />
      <SearchBar onSearch={handleSearch} />

      {/* Featured XCH and wXCH boxes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* XCH Featured Box */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 40, 35, 0.8), rgba(20, 30, 25, 0.9))',
          border: '1px solid rgba(74, 222, 128, 0.3)',
          borderRadius: '12px',
          padding: '14px 18px',
          cursor: 'pointer'
        }} onClick={() => window.open('https://www.coingecko.com/en/coins/chia', '_blank')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px'
              }}>🌱</div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: 'white' }}>XCH</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Chia Network</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#4ade80' }}>${xchPrice.toFixed(2)}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: xchPrice >= 18.25 ? '#4ade80' : '#ef4444' }}>
                {xchPrice >= 18.25 ? '🟢' : '🔴'} {(((xchPrice - 18.25) / 18.25) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* wXCH Featured Box */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(20, 28, 50, 0.85), rgba(15, 20, 40, 0.95))',
          border: '1px solid rgba(0, 82, 255, 0.3)',
          borderRadius: '12px',
          padding: '14px 18px',
          cursor: 'pointer'
        }} onClick={() => window.open('https://dexscreener.com/base/0x36be1d329444aef5d28df3662ec5b4f965cd93e9', '_blank')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                background: 'linear-gradient(135deg, #0052ff, #0033cc)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px'
              }}>⛓️</div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: 'white' }}>wXCH</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Wrapped XCH</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#4f87ff' }}>${wxchPrice.toFixed(2)}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: wxchPrice >= xchPrice ? '#4ade80' : '#ef4444' }}>
                {wxchPrice >= xchPrice ? '🟢' : '🔴'} {(((wxchPrice - xchPrice) / xchPrice) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter buttons with sorting */}
      <div className="filter-section" style={{ position: 'relative', marginBottom: '20px' }}>
        <button 
          className={`filter-btn ${sortBy === 'name' ? 'active' : ''}`}
          onClick={() => setSortBy('name')}
        >
          📝 Name
        </button>
        <button 
          className={`filter-btn ${sortBy === 'marketCap' ? 'active' : ''}`}
          onClick={() => setSortBy('marketCap')}
        >
          💰 Market Cap
        </button>
        <button 
          className={`filter-btn ${sortBy === 'arbitrage' ? 'active' : ''}`}
          onClick={() => setSortBy('arbitrage')}
        >
          💱 Arbitrage
        </button>
        
        {/* Info button */}
        <button
          onClick={() => setShowSortInfo(!showSortInfo)}
          style={{
            background: 'rgba(251, 191, 36, 0.15)',
            border: '1px solid rgba(251, 191, 36, 0.4)',
            color: '#fbbf24',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            fontSize: '16px',
            fontWeight: '900',
            cursor: 'pointer',
            marginLeft: '8px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(251, 191, 36, 0.25)';
            e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.6)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(251, 191, 36, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.4)';
          }}
        >
          ?
        </button>

        {/* Info tooltip */}
        {showSortInfo && (
          <div onClick={() => setShowSortInfo(false)} style={{
            position: 'absolute',
            top: '45px',
            right: '0',
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 30, 0.95))',
            border: '2px solid rgba(251, 191, 36, 0.5)',
            borderRadius: '12px',
            padding: '16px',
            width: '320px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 40px rgba(251, 191, 36, 0.2)',
            zIndex: 1000,
            backdropFilter: 'blur(12px)'
          }}>
            <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: '14px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              📊 Display Info
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ color: '#0052ff', fontWeight: 700 }}>🔵 Base Side:</span><br />
                Shows 24-hour price change percentage
              </div>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ color: '#4ade80', fontWeight: 700 }}>🌱 Chia Side:</span><br />
                Shows arbitrage opportunity vs Base price
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(251, 191, 36, 0.2)' }}>
                <span style={{ color: '#4ade80' }}>🟢</span> = Chia is cheaper<br />
                <span style={{ color: '#ef4444' }}>🔴</span> = Chia is more expensive<br />
                <span style={{ fontSize: '11px', fontStyle: 'italic', marginTop: '6px', display: 'block' }}>Tip: Click outside to close</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Emoji Market - Side by Side */}
      <div style={{
        background: 'rgba(0,0,0,0.6)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: 900,
          marginBottom: '20px',
          background: 'linear-gradient(90deg, #4ade80, #0052ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>📈 EMOJI MARKET 📈</h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px'
        }}>
          {/* Chia Column */}
          <div>
            <div style={{
              textAlign: 'center',
              fontSize: '18px',
              fontWeight: 900,
              color: '#4ade80',
              marginBottom: '16px',
              padding: '10px',
              background: 'linear-gradient(90deg, transparent, rgba(74, 222, 128, 0.2), transparent)',
              borderRadius: '8px'
            }}>🌱 Chia Network</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px'
            }}>
              {filteredChia.map((token, idx) => (
                <TokenCard key={idx} token={token} chain="chia" baseTokens={baseTokens} />
              ))}
            </div>
          </div>

          {/* Base Column */}
          <div>
            <div style={{
              textAlign: 'center',
              fontSize: '18px',
              fontWeight: 900,
              color: '#4f87ff',
              marginBottom: '16px',
              padding: '10px',
              background: 'linear-gradient(90deg, transparent, rgba(0, 82, 255, 0.2), transparent)',
              borderRadius: '8px'
            }}>⛓️ Base Network</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px'
            }}>
              {filteredBase.map((token, idx) => (
                <TokenCard key={idx} token={token} chain="base" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

