'use client';

export default function Book() {
  return (
    <div style={{
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      background: 'rgba(0,0,0,0.6)',
      padding: '40px',
      borderRadius: '12px'
    }}>
      
      {/* Quick Links */}
      <div style={{
        marginBottom: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '100%',
        maxWidth: '340px'
      }}>
        <a href="https://love.awizard.dev/" target="_blank" rel="noopener noreferrer"
          style={{
            justifyContent: 'center',
            padding: '10px 16px',
            border: '2px solid rgba(217, 70, 239, 0.8)',
            color: '#d946ef',
            background: 'rgba(217, 70, 239, 0.1)',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(217, 70, 239, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(217, 70, 239, 0.1)'}>
          ❤️ aWizard
        </a>
        <a href="https://warp.awizard.dev" target="_blank" rel="noopener noreferrer"
          style={{
            justifyContent: 'center',
            padding: '10px 16px',
            border: '2px solid rgba(217, 70, 239, 0.8)',
            color: '#d946ef',
            background: 'rgba(217, 70, 239, 0.1)',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(217, 70, 239, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(217, 70, 239, 0.1)'}>
          ⚡ warp.awizard.dev
        </a>
        <a href="https://discord.gg/awizard" target="_blank" rel="noopener noreferrer"
          style={{
            justifyContent: 'center',
            padding: '10px 16px',
            border: '2px solid rgba(88, 101, 242, 0.8)',
            color: '#5865F2',
            background: 'rgba(88, 101, 242, 0.1)',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(88, 101, 242, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(88, 101, 242, 0.1)'}>
          💬 discord.gg/awizard
        </a>
        <a href="https://mintgarden.io/aWizard" target="_blank" rel="noopener noreferrer"
          style={{
            justifyContent: 'center',
            padding: '10px 16px',
            border: '2px solid rgba(251, 191, 36, 0.7)',
            color: '#fbbf24',
            background: 'rgba(251, 191, 36, 0.1)',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(251, 191, 36, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(251, 191, 36, 0.1)'}>
          🍃 aWizard mintgarden
        </a>
        <a href="https://mintgarden.io/profile/astercast-15a3f45ca34abd78b76241dd346ed1acc696dad22768735a7b929a54679d5922?tab=collections"
          target="_blank" rel="noopener noreferrer"
          style={{
            justifyContent: 'center',
            padding: '10px 16px',
            border: '2px solid rgba(251, 191, 36, 0.7)',
            color: '#fbbf24',
            background: 'rgba(251, 191, 36, 0.1)',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(251, 191, 36, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(251, 191, 36, 0.1)'}>
          🍃 astercast mintgarden
        </a>
        <a href="https://open.spotify.com/artist/4pYearnilXYOKzJk4qFTxE" target="_blank" rel="noopener noreferrer"
          style={{
            justifyContent: 'center',
            padding: '10px 16px',
            border: '2px solid rgba(29, 185, 84, 0.8)',
            color: '#1db954',
            background: 'rgba(29, 185, 84, 0.1)',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(29, 185, 84, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(29, 185, 84, 0.1)'}>
          🎵 Spotify
        </a>
        <a href="https://x.com/aWizardxch" target="_blank" rel="noopener noreferrer"
          style={{
            justifyContent: 'center',
            padding: '10px 16px',
            background: 'rgba(0,0,0,0.8)',
            border: '2px solid rgba(255, 255, 255, 0.7)',
            color: '#fff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}>
          ✖ FOLLOW US
        </a>
      </div>

      {/* Twitter Timeline */}
      <div style={{ width: '100%', maxWidth: '680px', marginTop: '16px' }}>
        
        {/* Section header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
          justifyContent: 'center'
        }}>
          <div style={{
            height: '1px',
            flex: 1,
            background: 'linear-gradient(to right, transparent, rgba(29,161,242,0.35))',
            maxWidth: '120px'
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1da1f2">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span style={{
              fontSize: '12px',
              color: 'rgba(29,161,242,0.85)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: 700
            }}>Latest from @aWizardxch</span>
          </div>
          <div style={{
            height: '1px',
            flex: 1,
            background: 'linear-gradient(to left, transparent, rgba(29,161,242,0.35))',
            maxWidth: '120px'
          }} />
        </div>

        {/* Twitter Card */}
        <div style={{
          position: 'relative',
          background: 'rgba(5,10,20,0.92)',
          borderRadius: '17px',
          overflow: 'hidden',
          border: '1px solid rgba(29,161,242,0.22)',
          backdropFilter: 'blur(12px)'
        }}>
          {/* Profile header */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(29,161,242,0.13), rgba(120,80,255,0.10))',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(29,161,242,0.13)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1da1f2, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 0 14px rgba(29,161,242,0.4)'
            }}>🧙</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'white', letterSpacing: '0.3px' }}>aWizard</div>
              <div style={{ fontSize: '12px', color: 'rgba(29,161,242,0.75)', marginTop: '1px' }}>@aWizardxch</div>
            </div>
            <a href="https://twitter.com/aWizardxch" target="_blank" rel="noopener noreferrer"
              style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: '20px',
                padding: '7px 16px',
                color: 'white',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(29,161,242,0.25)';
                e.currentTarget.style.borderColor = 'rgba(29,161,242,0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.5)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
              }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622z"/>
              </svg>
              Follow
            </a>
          </div>

          {/* Twitter widget container */}
          <div style={{ minHeight: '460px', padding: '20px' }}>
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
              Twitter widget loads here (requires Twitter SDK in production)
              <div style={{ marginTop: '16px' }}>
                <a href="https://twitter.com/aWizardxch" target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    background: 'rgba(29,161,242,0.18)',
                    border: '1px solid rgba(29,161,242,0.45)',
                    borderRadius: '24px',
                    padding: '10px 22px',
                    color: '#1da1f2',
                    fontSize: '13px',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#1da1f2">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622z"/>
                  </svg>
                  View @aWizardxch on X
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer link */}
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <a href="https://twitter.com/aWizardxch" target="_blank" rel="noopener noreferrer"
            style={{
              fontSize: '11px',
              color: 'rgba(29,161,242,0.55)',
              textDecoration: 'none',
              letterSpacing: '0.5px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1da1f2'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(29,161,242,0.55)'}>
            Follow @aWizardxch on X →
          </a>
        </div>

      </div>

    </div>
  );
}
