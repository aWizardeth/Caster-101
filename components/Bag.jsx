'use client';

// TODO: Add XCH wallet integration to bag search functionality using Chia blockchain API
// TODO: Implement wallet connection for direct Chia address lookups

import { useState } from 'react';

export default function Bag() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const trackAddress = async (addrOverride) => {
    const targetAddr = addrOverride || address;
    
    // Clear any previous errors first
    setError('');
    
    if (!targetAddr || !targetAddr.startsWith('0x') || targetAddr.length !== 42) {
      setError('Please enter a valid Base wallet address (0x...)');
      return;
    }

    setLoading(true);
    setData(null);

    try {
      const response = await fetch(`/api/treasury-comprehensive?address=${targetAddr}&chain=base`);
      if (!response.ok) throw new Error('Failed to fetch wallet data');
      
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to scan wallet');
    } finally {
      setLoading(false);
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

  const tokens = data?.tokens || [];
  const total = data?.total || tokens.reduce((s, t) => s + (t.value || 0), 0);
  const lpTokens = tokens.filter(t => t.type === 'lp');
  const regularTokens = tokens.filter(t => t.type !== 'lp');
  const lpValue = lpTokens.reduce((s, t) => s + (t.value || 0), 0);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ 
          fontFamily: "'Cinzel Decorative', 'MedievalSharp', fantasy", 
          fontSize: '36px', 
          color: '#ffd700', 
          textShadow: '0 0 20px rgba(251,191,36,0.8)',
          marginBottom: '8px'
        }}>💰 Track Ur Bag</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
          Enter any Base wallet address to see full holdings + LP positions
        </p>
      </div>

      {/* Address Input */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(20,20,30,0.9), rgba(10,10,20,0.95))',
        border: '2px solid rgba(251,191,36,0.4)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '28px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '18px',
              pointerEvents: 'none'
            }}>🔍</span>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && trackAddress()}
              placeholder="0x... Base wallet address"
              style={{
                width: '100%',
                padding: '14px 14px 14px 44px',
                background: 'rgba(0,0,0,0.4)',
                border: '2px solid rgba(251,191,36,0.3)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '14px',
                fontFamily: "'Inter', sans-serif",
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>
          <button
            onClick={trackAddress}
            disabled={loading}
            style={{
              padding: '14px 28px',
              background: loading ? 'rgba(100,100,100,0.5)' : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              border: 'none',
              borderRadius: '12px',
              color: '#000',
              fontSize: '15px',
              fontWeight: 900,
              cursor: loading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: "'Inter', sans-serif",
              boxShadow: '0 4px 16px rgba(251,191,36,0.4)'
            }}
          >
            {loading ? '⏳ Scanning...' : '✨ SCAN BAG'}
          </button>
        </div>

        {/* Quick presets */}
        <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', alignSelf: 'center' }}>
            Quick load:
          </span>
          <button
            onClick={() => {
              const addr = '0xEEDC069F861880eC1B5f41c9bC7a747DC1cE32b9';
              setAddress(addr);
              trackAddress(addr);
            }}
            style={{
              padding: '5px 12px',
              background: 'rgba(251,191,36,0.12)',
              border: '1px solid rgba(251,191,36,0.3)',
              borderRadius: '8px',
              color: '#fbbf24',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            🧙 0xEEDC...32b9
          </button>
        </div>

        {error && (
          <div style={{
            marginTop: '12px',
            padding: '10px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '13px'
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Results */}
      {data && (
        <>
          {/* Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '14px',
            marginBottom: '24px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.08))',
              border: '2px solid rgba(251,191,36,0.4)',
              borderRadius: '14px',
              padding: '18px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '6px'
              }}>Total Value</div>
              <div style={{
                fontSize: '28px',
                fontWeight: 900,
                color: '#fbbf24',
                fontFamily: "'Anton', 'Impact', sans-serif"
              }}>{formatUsd(total)}</div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(0,82,255,0.15), rgba(0,82,255,0.08))',
              border: '2px solid rgba(0,82,255,0.4)',
              borderRadius: '14px',
              padding: '18px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '6px'
              }}>Positions</div>
              <div style={{
                fontSize: '28px',
                fontWeight: 900,
                color: '#60a5fa',
                fontFamily: "'Anton', 'Impact', sans-serif"
              }}>{tokens.length}</div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(99,179,237,0.15), rgba(99,179,237,0.08))',
              border: '2px solid rgba(99,179,237,0.4)',
              borderRadius: '14px',
              padding: '18px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '6px'
              }}>LP Positions</div>
              <div style={{
                fontSize: '28px',
                fontWeight: 900,
                color: '#63b3ed',
                fontFamily: "'Anton', 'Impact', sans-serif"
              }}>{lpTokens.length}</div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(74,222,128,0.15), rgba(74,222,128,0.08))',
              border: '2px solid rgba(74,222,128,0.4)',
              borderRadius: '14px',
              padding: '18px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '6px'
              }}>LP Value</div>
              <div style={{
                fontSize: '28px',
                fontWeight: 900,
                color: '#4ade80',
                fontFamily: "'Anton', 'Impact', sans-serif"
              }}>{formatUsd(lpValue)}</div>
            </div>
          </div>

          {/* LP Positions */}
          {lpTokens.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '14px'
              }}>
                <div style={{
                  width: '3px',
                  height: '24px',
                  background: 'linear-gradient(180deg, #63b3ed, #3b82f6)',
                  borderRadius: '2px'
                }}></div>
                <span style={{
                  fontSize: '16px',
                  fontWeight: 900,
                  color: '#63b3ed',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>🔄 LP Positions</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                  {lpTokens.length} pools · {formatUsd(lpValue)}
                </span>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {lpTokens.map((tok, idx) => {
                  const val = tok.value || 0;
                  const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                  const share = tok.userSharePct ? parseFloat(tok.userSharePct) : 0;
                  const poolLiq = tok.totalLiqUsd || 0;

                  return (
                    <div
                      key={idx}
                      onClick={() => window.open('https://dex.9mm.pro', '_blank')}
                      style={{
                        background: 'linear-gradient(135deg, rgba(20,30,50,0.9), rgba(10,15,30,0.95))',
                        border: '2px solid rgba(99,179,237,0.35)',
                        borderRadius: '14px',
                        padding: '18px',
                        cursor: 'pointer',
                        transition: 'all 0.25s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(99,179,237,0.7)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(99,179,237,0.35)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '14px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '44px',
                            height: '44px',
                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            flexShrink: 0
                          }}>🔄</div>
                          <div>
                            <div style={{
                              fontSize: '17px',
                              fontWeight: 800,
                              color: 'white',
                              marginBottom: '2px'
                            }}>{tok.symbol}</div>
                            <div style={{
                              fontSize: '11px',
                              color: 'rgba(99,179,237,0.8)',
                              fontWeight: 600
                            }}>LP Position · 9mm.pro</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            fontSize: '22px',
                            fontWeight: 900,
                            color: '#63b3ed'
                          }}>{formatUsd(val)}</div>
                          <div style={{
                            fontSize: '11px',
                            color: 'rgba(255,255,255,0.4)',
                            marginTop: '2px'
                          }}>{pct}% of bag</div>
                        </div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr',
                        gap: '10px',
                        paddingTop: '12px',
                        borderTop: '1px solid rgba(255,255,255,0.06)'
                      }}>
                        <div>
                          <div style={{
                            fontSize: '10px',
                            color: 'rgba(255,255,255,0.4)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '4px'
                          }}>Your Share</div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: 'white'
                          }}>{share > 0 ? share.toFixed(3) + '%' : '—'}</div>
                        </div>
                        <div>
                          <div style={{
                            fontSize: '10px',
                            color: 'rgba(255,255,255,0.4)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '4px'
                          }}>Pool Liq</div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#63b3ed'
                          }}>{poolLiq > 0 ? formatUsd(poolLiq) : '—'}</div>
                        </div>
                        <div>
                          <div style={{
                            fontSize: '10px',
                            color: 'rgba(255,255,255,0.4)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '4px'
                          }}>Balance</div>
                          <div style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: 'white'
                          }}>{formatBal(tok.balance)} LP</div>
                        </div>
                        <div>
                          <div style={{
                            fontSize: '10px',
                            color: 'rgba(255,255,255,0.4)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '4px'
                          }}>LP Tokens</div>
                          <div style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: 'rgba(255,255,255,0.6)'
                          }}>{formatBal(tok.balance)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Regular Tokens */}
          {regularTokens.filter(t => (t.value || 0) >= 0.01).length > 0 && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '14px',
                marginTop: lpTokens.length > 0 ? '28px' : '0'
              }}>
                <div style={{
                  width: '3px',
                  height: '24px',
                  background: 'linear-gradient(180deg, #fbbf24, #f59e0b)',
                  borderRadius: '2px'
                }}></div>
                <span style={{
                  fontSize: '16px',
                  fontWeight: 900,
                  color: '#fbbf24',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>💎 Tokens</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                  {regularTokens.filter(t => (t.value || 0) >= 0.01).length} assets
                </span>
              </div>

              <div style={{ display: 'grid', gap: '10px' }}>
                {regularTokens
                  .filter(t => (t.value || 0) >= 0.01)
                  .map((tok, idx) => {
                    const val = tok.value || 0;
                    const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                    const isNative = tok.type === 'native';
                    const gradient = isNative
                      ? 'linear-gradient(135deg, #627eea, #4a5fd8)'
                      : 'linear-gradient(135deg, #fbbf24, #f59e0b)';
                    const borderCol = isNative ? 'rgba(99,102,241,0.35)' : 'rgba(251,191,36,0.25)';
                    const valCol = isNative ? '#818cf8' : '#fbbf24';
                    const priceStr = tok.price > 0
                      ? (tok.price < 0.001
                        ? '$' + tok.price.toFixed(8)
                        : '$' + tok.price.toLocaleString(undefined, { maximumSignificantDigits: 5 }))
                      : '—';

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (!isNative && tok.contract) {
                            window.open(`https://dex.9mm.pro/swap?outputCurrency=${tok.contract}`, '_blank');
                          }
                        }}
                        style={{
                          background: 'linear-gradient(135deg, rgba(20,20,30,0.85), rgba(10,10,20,0.9))',
                          border: `2px solid ${borderCol}`,
                          borderRadius: '12px',
                          padding: '14px 18px',
                          cursor: isNative ? 'default' : 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              background: gradient,
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              fontWeight: 900,
                              color: 'white',
                              flexShrink: 0
                            }}>{tok.symbol.slice(0, 3)}</div>
                            <div>
                              <div style={{
                                fontSize: '15px',
                                fontWeight: 800,
                                color: 'white'
                              }}>{tok.symbol}</div>
                              <div style={{
                                fontSize: '11px',
                                color: 'rgba(255,255,255,0.4)'
                              }}>{formatBal(tok.balance)} · {priceStr}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{
                              fontSize: '18px',
                              fontWeight: 800,
                              color: valCol
                            }}>{formatUsd(val)}</div>
                            <div style={{
                              fontSize: '11px',
                              color: 'rgba(255,255,255,0.35)'
                            }}>{pct}% of bag</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{
            fontSize: '40px',
            marginBottom: '16px',
            animation: 'pulse 1.5s infinite'
          }}>⚡</div>
          <div style={{
            fontSize: '16px',
            color: '#fbbf24',
            fontWeight: 700,
            marginBottom: '8px'
          }}>Scanning the chain...</div>
          <div style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.4)'
          }}>Fetching tokens, LP positions & pricing via DexScreener + RPC</div>
        </div>
      )}
    </div>
  );
}
