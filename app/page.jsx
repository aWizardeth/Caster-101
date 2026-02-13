'use client';

import { useState } from 'react';
import Market from '@/components/market/Market';
import Treasury from '@/components/Treasury';
import HowTo from '@/components/HowTo';
import Book from '@/components/Book';
import Bag from '@/components/Bag';
import './caster.css';

function CasterValley() {
  return (
    <div style={{ width: '100%', height: '80vh' }}>
      <iframe 
        src="/legacy/caster-valley.html" 
        title="Caster Valley" 
        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px' }}
        allow="fullscreen"
      />
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('market');

  const tabs = [
    { id: 'market', label: '📈 EMOJI MARKET 📈', component: Market },
    { id: 'bag', label: '💰 BAG 💰', component: Bag },
    { id: 'treasury', label: '🧙‍♂️ aWizard Treasury 🧙‍♂️', component: Treasury },
    { id: 'howto', label: '🎓 How to Wizard 🎓', component: HowTo },
    { id: 'book', label: '📜 BOOK OF WIZARD 📜', component: Book },
    { id: 'valley', label: '🏰 CASTER VALLEY 🏰', component: CasterValley }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Market;

  return (
    <div className="container">
      <div className="header">
        <div className="title">CASTER101</div>
      </div>

      <div className="tabs">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      <div className="content active">
        <ActiveComponent />
      </div>
    </div>
  );
}

