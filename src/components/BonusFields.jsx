// src/components/BonusFields.jsx
import React, { useState } from 'react';

export default function BonusFields({ onAdd }) {
  const [threshold, setThreshold] = useState(0);
  const [points,    setPoints]    = useState(0);
  const [cash,      setCash]      = useState(0);

  const handleAdd = e => {
    e.preventDefault();
    onAdd({ threshold, points, cash });
    setThreshold(0);
    setPoints(0);
    setCash(0);
  };

  return (
    <form onSubmit={handleAdd} className="bonus-form">
      <div>
        <label>Spend Threshold</label>
        <input
          type="number" value={threshold}
          onChange={e => setThreshold(+e.target.value)}
        />
      </div>
      <div>
        <label>Bonus Points</label>
        <input
          type="number" value={points}
          onChange={e => setPoints(+e.target.value)}
        />
      </div>
      <div>
        <label>Bonus Cash ($)</label>
        <input
          type="number" step="0.01" value={cash}
          onChange={e => setCash(+e.target.value)}
        />
      </div>
      <button type="submit">Add Bonus</button>
    </form>
  );
}
