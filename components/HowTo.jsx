'use client';

export default function HowTo() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{
          fontFamily: '"Cinzel Decorative", "MedievalSharp", fantasy',
          fontSize: '48px',
          color: '#ffd700',
          textShadow: '0 0 20px rgba(251, 191, 36, 0.8)',
          marginBottom: '16px'
        }}>🧙 Awizard Ecosystem</h1>
        <h2 style={{ fontSize: '24px', color: '#fbbf24', marginBottom: '8px' }}>
          Start Your Journey
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px' }}>
          The Awizard ecosystem rewards long-term participation across Chia assets, NFTs, and liquidity.<br />
          Grow your Spell Power by stacking, exploring, and contributing.
        </p>
      </div>

      {/* Discord Button */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <a 
          href="https://discord.gg/awizard" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(88,101,242,0.18)',
            border: '1px solid rgba(88,101,242,0.5)',
            borderRadius: '20px',
            padding: '8px 20px',
            color: '#7289da',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(88,101,242,0.32)';
            e.currentTarget.style.borderColor = 'rgba(88,101,242,0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(88,101,242,0.18)';
            e.currentTarget.style.borderColor = 'rgba(88,101,242,0.5)';
          }}>
          <svg width="16" height="12" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.317 1.492a19.84 19.84 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 1.492a.07.07 0 00-.032.027C.533 6.093-.32 10.557.099 14.964a.08.08 0 00.031.055 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" fill="#7289da"/>
          </svg>
          Join the Discord Server
        </a>
      </div>

      {/* YouTube Video */}
      <div style={{
        margin: '0 auto 40px auto',
        maxWidth: '660px',
        background: 'rgba(0, 0, 0, 0.5)',
        border: '2px solid rgba(251, 191, 36, 0.4)',
        borderRadius: '16px',
        padding: '14px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{
          position: 'relative',
          paddingBottom: '56.25%',
          height: 0,
          overflow: 'hidden',
          borderRadius: '8px'
        }}>
          <iframe
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            src="https://www.youtube.com/embed/V7CTinIJrNc"
            title="Awizard Tutorial"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {/* Community Note */}
      <div style={{
        marginBottom: '32px',
        padding: '16px 22px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px',
        fontSize: '13px',
        lineHeight: '1.7',
        color: 'rgba(255,255,255,0.42)',
        fontStyle: 'italic',
        textAlign: 'center',
        maxWidth: '780px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        The wizard community is a mix of builders, artists, collectors, and enthusiasts within the Chia ecosystem, united more by curiosity and creativity than by any single role. Before purchasing NFTs or tokens, it is advisable to understand how the Chia network operates, how Chia Asset Tokens function, and how the coinset model works as this foundation provides essential context and reduces unnecessary risk.
      </div>

      {/* Getting Started */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 30, 40, 0.8), rgba(15, 15, 25, 0.9))',
        border: '2px solid rgba(251, 191, 36, 0.4)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '40px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
      }}>
        <h3 style={{
          color: '#ffd700',
          fontSize: '28px',
          fontWeight: 900,
          marginBottom: '24px',
          textAlign: 'center'
        }}>Getting Started</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          {[
            { num: '1️⃣', title: 'Stack Chia', desc: 'Accumulate XCH according to your means. This is the foundation of your participation.', color: '#4ade80' },
            { num: '2️⃣', title: 'Collect NFTs', desc: 'aWizard NFTs unlock ecosystem utility, access, and reward eligibility. These include Wizard Magic, The Casting, and more.', color: '#a855f7' },
            { num: '3️⃣', title: 'Engage with Chia Asset Tokens (CATs)', desc: 'Build positions in ecosystem tokens and provide liquidity on Chia to earn yield while supporting markets.', color: '#0052ff' },
            { num: '4️⃣', title: 'Expand via Warp Bridge (Base)', desc: 'Bridge assets and provide CAT-to-CAT liquidity on Base through 9mmpro for additional opportunities.', color: '#fbbf24' },
            { num: '5️⃣', title: 'Optimize Yield', desc: 'Learn liquidity strategies and Merkl incentives to maximize rewards over time.', color: '#ef4444' }
          ].map((step, idx) => (
            <div key={idx} style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderLeft: `4px solid ${step.color}`,
              padding: '16px',
              borderRadius: '8px'
            }}>
              <div style={{ color: '#fbbf24', fontWeight: 900, marginBottom: '8px' }}>
                {step.num} {step.title}
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards & Progression */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 30, 40, 0.8), rgba(15, 15, 25, 0.9))',
        border: '2px solid rgba(168, 85, 247, 0.4)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '40px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
      }}>
        <h3 style={{
          color: '#a855f7',
          fontSize: '28px',
          fontWeight: 900,
          marginBottom: '24px',
          textAlign: 'center'
        }}>🔮 Rewards & Progression</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(74, 222, 128, 0.3)',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <div style={{ color: '#4ade80', fontWeight: 900, fontSize: '18px', marginBottom: '8px' }}>
              Soft Staking
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Hold ecosystem assets to earn passive rewards.
            </div>
          </div>
          
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: '18px', marginBottom: '8px' }}>
              Spell Power Leaderboard
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Your CAT and NFT holdings determine your rank. Wizards receive weekly Spell Power Tokens based on standing.
            </div>
          </div>
        </div>
        
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(88, 101, 242, 0.3)',
          padding: '20px',
          borderRadius: '8px'
        }}>
          <div style={{ color: '#5865F2', fontWeight: 900, fontSize: '18px', marginBottom: '8px' }}>
            🏰 Discord Integration
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Verify your wallet using the official guide, then use commands. Your on-chain activity becomes recognized and rewarded inside the server.
          </div>
        </div>
      </div>

      {/* Images */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
        <div style={{ textAlign: 'center' }}>
          <img 
            src="/images/discord-commands.png" 
            alt="Discord Commands" 
            style={{
              maxWidth: '100%',
              width: '100%',
              height: 'auto',
              border: '2px solid rgba(251, 191, 36, 0.4)',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
            }}
          />
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Discord Commands</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <img 
            src="/images/soft-staking-diagram.png" 
            alt="Soft Staking Diagram" 
            style={{
              maxWidth: '100%',
              width: '100%',
              height: 'auto',
              border: '2px solid rgba(74, 222, 128, 0.4)',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
            }}
          />
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Soft Staking Diagram</div>
        </div>
      </div>

      {/* Final Discord Button */}
      <div style={{ textAlign: 'center', margin: '32px 0 16px 0' }}>
        <a 
          href="https://discord.gg/awizard" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(88,101,242,0.18)',
            border: '1px solid rgba(88,101,242,0.5)',
            borderRadius: '20px',
            padding: '8px 20px',
            color: '#7289da',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(88,101,242,0.32)';
            e.currentTarget.style.borderColor = 'rgba(88,101,242,0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(88,101,242,0.18)';
            e.currentTarget.style.borderColor = 'rgba(88,101,242,0.5)';
          }}>
          <svg width="16" height="12" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.317 1.492a19.84 19.84 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 1.492a.07.07 0 00-.032.027C.533 6.093-.32 10.557.099 14.964a.08.08 0 00.031.055 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" fill="#7289da"/>
          </svg>
          Join the Discord Server
        </a>
      </div>

    </div>
  );
}
