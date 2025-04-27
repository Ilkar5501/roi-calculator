// src/components/CardForm.jsx
import React, { useState } from 'react';

export default function CardForm({ onAdd }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');  // '' | 'cash' | 'points'
  const [fee, setFee] = useState(0);
  const [waivedYears, setWaivedYears] = useState(new Set());

  const handleSubmit = e => {
    e.preventDefault();
    if (!name || !type) return alert('Name and type are required');
    onAdd({ name, type, fee, waivedYears });
    // reset
    setName(''); setType(''); setFee(0); setWaivedYears(new Set());
  };

  return (
    <form onSubmit={handleSubmit} className="card-form">
      <div>
        <label>Card Name</label>
        <input value={name} onChange={e => setName(e.target.value)} required/>
      </div>
      <div>
        <label>Type</label>
        <select value={type} onChange={e=>setType(e.target.value)} required>
          <option value="" disabled>Select…</option>
          <option value="cash">Cashback</option>
          <option value="points">Point</option>
        </select>
      </div>
      <div>
        <label>Annual Fee</label>
        <input
          type="number"
          value={fee}
          onChange={e=>setFee(+e.target.value)}
        />
      </div>
      {/* waivedYears UI omitted for brevity */}
      <button type="submit" disabled={!name||!type}>
        Add Card
      </button>
    </form>
  );
}
