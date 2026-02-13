export default function QuickLinks() {
  const links = [
    { href: 'https://dexie.space', icon: '🦢', text: 'dexie.space', title: 'Trade here' },
    { href: 'https://mintgarden.io', icon: '🍃', text: 'mintgarden.io', title: 'Chia NFT marketplace' },
    { href: 'https://dex.9mm.pro', icon: '🔫', text: 'dex.9mm.pro', title: 'Base warped tokens' },
    { href: 'https://circuitdao.com', icon: '💲', text: 'circuitdao.com', title: 'Stablecoin magic' },
    { href: 'https://wojak.ink', icon: '🎨', text: 'wojak.ink', title: 'Crazy' },
    { href: 'https://crate.ink', icon: '📦', text: 'crate.ink', title: 'Web3 minting on Chia' },
    { href: 'https://warp.awizard.dev', icon  : '⚡', text: 'warp.awizard.dev', title: 'Warp your bag', warp: true },
    { href: 'https://discord.gg/awizard', icon: '💬', text: 'discord.gg/awizard', title: 'Chat and verify wallet', discord: true }
  ];

  return (
    <div className="quick-links">
      {links.map((link, idx) => (
        <a
          key={idx}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className={`quick-link-btn ${link.warp ? 'warp-btn' : ''}`}
          title={link.title}
          style={link.discord ? { color: '#5865F2', boxShadow: '0 0 12px rgba(88, 101, 242, 0.4)' } : {}}
        >
          <span>{link.icon}</span>
          <span>{link.text}</span>
        </a>
      ))}
    </div>
  );
}
