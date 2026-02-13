'use client';

import { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="search-bar">
      <span className="search-icon">🔮</span>
      <input
        type="text"
        className="search-input"
        placeholder="search chia or base asset"
        value={query}
        onChange={handleChange}
      />
    </div>
  );
}
