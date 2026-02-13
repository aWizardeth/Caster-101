export default function TokenCard({ token, chain, baseTokens = [] }) {
  const handleClick = () => {
    if (chain === 'chia') {
      if (token.assetId === 'Native') {
        window.open('https://www.coingecko.com/en/coins/chia', '_blank');
      } else {
        window.open(`https://www.tibetswap.io/swap?asset_id=${token.assetId}`, '_blank');
      }
    } else if (chain === 'base') {
      window.open(`https://dexscreener.com/base/${token.contract}`, '_blank');
    }
  };

  // For Chia tokens, calculate arbitrage vs Base
  let arbDisplay = null;
  if (chain === 'chia' && baseTokens.length > 0) {
    // Find matching Base token (by symbol)
    const matchingBaseToken = baseTokens.find(b => {
      // Handle BYC/WIZ special case
      if (token.displayName === '$BYC' && b.name === 'Wizard Bucks') return true;
      return b.symbol === token.symbol;
    });

    if (matchingBaseToken && matchingBaseToken.price > 0 && token.price > 0) {
      const diff = matchingBaseToken.price - token.price;
      const diffPercent = (diff / matchingBaseToken.price) * 100;
      
      let arbColor, arbText, arbIcon;
      if (diff > 0) {
        arbColor = '#4ade80';
        arbText = `${Math.abs(diffPercent).toFixed(1)}% cheaper`;
        arbIcon = '🟢';
      } else if (diff < 0) {
        arbColor = '#ef4444';
        arbText = `${Math.abs(diffPercent).toFixed(1)}% premium`;
        arbIcon = '🔴';
      } else {
        arbColor = 'rgba(255,255,255,0.3)';
        arbText = '0.0% diff';
        arbIcon = '⚪';
      }

      arbDisplay = (
        <div style={{ fontSize: '11px', color: arbColor, fontWeight: 700, marginTop: '4px', textAlign: 'center' }}>
          {arbIcon} {arbText}
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
            vs Base: ${matchingBaseToken.price.toFixed(6)}
          </div>
        </div>
      );
    }
  }

  // Format price based on value
  const formatPrice = (price) => {
    if (!price) return '0.00';
    if (price < 0.0001) return price.toFixed(10);
    if (price < 0.001) return price.toFixed(8);
    if (price < 0.01) return price.toFixed(8);
    if (price < 1) return price.toFixed(6);
    return price.toFixed(2);
  };

  // Format market cap
  const formatMcap = (mcap) => {
    if (!mcap || mcap === 0) return '—';
    if (mcap > 1e6) return '$' + (mcap / 1e6).toFixed(1) + 'M';
    if (mcap > 1e3) return '$' + (mcap / 1e3).toFixed(0) + 'K';
    return '$' + mcap.toFixed(0);
  };

  return (
    <div style={{
      padding: '10px 12px',
      border: chain === 'chia' ? '2px solid rgba(74, 222, 128, 0.7)' : '2px solid rgba(0, 82, 255, 0.7)',
      borderRadius: '6px',
      background: chain === 'chia' ? 'rgba(74, 222, 128, 0.05)' : 'rgba(0, 82, 255, 0.05)',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.2s ease',
    }}
    onClick={handleClick}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = chain === 'chia' 
        ? '0 4px 12px rgba(74, 222, 128, 0.3)' 
        : '0 4px 12px rgba(0, 82, 255, 0.3)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}>
      {/* Emoji */}
      <div style={{ fontSize: '32px', marginBottom: '6px' }}>{token.symbol}</div>
      
      {/* Price */}
      <div style={{ fontWeight: 700, color: '#4ade80', fontSize: '14px', marginBottom: '4px' }}>
        ${formatPrice(token.price)}
      </div>
      
      {/* Change or Arbitrage */}
      {chain === 'base' ? (
        <div style={{ 
          fontSize: '13px', 
          fontWeight: 700, 
          color: token.change24h >= 0 ? '#4ade80' : '#ef4444' 
        }}>
          {token.change24h >= 0 ? '↑' : '↓'} {Math.abs(token.change24h || 0).toFixed(1)}%
        </div>
      ) : (
        arbDisplay || <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>—</div>
      )}
      
      {/* Market Cap */}
      <div style={{
        fontSize: '11px',
        color: 'rgba(255,255,255,0.5)',
        marginTop: '8px',
        paddingTop: '8px',
        borderTop: '1px solid rgba(255,255,255,0.08)'
      }}>
        MCap: <span style={{ color: 'rgba(251,191,36,0.85)', fontWeight: 600 }}>{formatMcap(token.marketCap)}</span>
      </div>
    </div>
  );
}

