// src/App.js
import React, { useState, useMemo } from 'react';
import logo from './logo.svg';
import './App.css';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import CardForm from './components/CardForm';
import CashbackFields from './components/CashbackFields';
import PointFields from './components/PointFields';
import BonusFields from './components/BonusFields';

function App() {
  // ─── State ─────────────────────────────────────────────────────────
  const [years, setYears] = useState(5);
  const [annualSpend, setAnnualSpend] = useState(
    Array(5).fill({ Generic: 6000 })
  );
  const [annualFee, setAnnualFee] = useState(95);
  const [waivedYears, setWaivedYears] = useState(new Set([0]));
  const [categories, setCategories] = useState([]); // holds card configs
  const [dollarPerPoint, setDollarPerPoint] = useState(0.017);

  // ─── Handlers ─────────────────────────────────────────────────────
  const addCard = card => {
    setCategories(prev => [
      ...prev,
      { ...card, cashRates: {}, pointRates: {}, welcomeBonuses: [] }
    ]);
  };
  const updateSpend = (y, cat, val) => {
    setAnnualSpend(prev => {
      const copy = [...prev];
      copy[y] = { ...copy[y], [cat]: Number(val) };
      return copy;
    });
  };
  const toggleWaived = i => {
    setWaivedYears(prev => {
      const copy = new Set(prev);
      copy.has(i) ? copy.delete(i) : copy.add(i);
      return copy;
    });
  };

  // ─── Compute ROI Series ────────────────────────────────────────────
  const data = useMemo(() => {
    let cum = 0;
    return Array.from({ length: years }, (_, y) => {
      const row = annualSpend[y] || {};
      const yearSpend = Object.values(row).reduce((a, b) => a + b, 0);
      cum += yearSpend;

      // sum across all cards
      let totalNet = 0;
      categories.forEach(card => {
        const { cashRates, pointRates, welcomeBonuses } = card;
        // points & cashback
        let pts = 0, cb = 0;
        Object.entries(row).forEach(([cat, amt]) => {
          pts += (pointRates[cat] || 0) * amt;
          cb  += (cashRates[cat] || 0) * amt;
        });
        const ptsValue = pts * dollarPerPoint;
        // bonuses
        let bonusVal = 0;
        welcomeBonuses.forEach(({ threshold, points, cash }) => {
          const prev = cum - yearSpend;
          if (prev < threshold && cum >= threshold) {
            bonusVal += points * dollarPerPoint + cash;
          }
        });
        const fee = waivedYears.has(y) ? 0 : card.annualFee;
        totalNet += ptsValue + cb + bonusVal - fee;
      });

      const ROI = yearSpend > 0 ? (totalNet / yearSpend) * 100 : 0;
      return { year: y + 1, ROI: Number(ROI.toFixed(2)) };
    });
  }, [years, annualSpend, categories, waivedYears, annualFee, dollarPerPoint]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Credit Card ROI Calculator</h1>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 12 }}
        className="app-container"
      >
        {/* Add Card Form */}
        <CardForm onAdd={addCard} />

        {/* Dynamic Card Configuration */}
        {categories.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="card-config"
          >
            <h2>{card.name} — {card.type} Card</h2>
            {card.type === 'cash' ? (
              <CashbackFields
                values={card.cashRates}
                onChange={(cat, val) => {
                  setCategories(prev => {
                    const copy = [...prev];
                    copy[i].cashRates = { ...copy[i].cashRates, [cat]: val };
                    return copy;
                  });
                }}
              />
            ) : (
              <PointFields
                values={card.pointRates}
                onChange={(cat, val) => {
                  setCategories(prev => {
                    const copy = [...prev];
                    copy[i].pointRates = { ...copy[i].pointRates, [cat]: val };
                    return copy;
                  });
                }}
              />
            )}
            <BonusFields onAdd={bonus => {
              setCategories(prev => {
                const copy = [...prev];
                copy[i].welcomeBonuses = [...copy[i].welcomeBonuses, bonus];
                return copy;
              });
            }} />
          </motion.div>
        ))}

        {/* ROI Chart */}
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} padding={{ right: 20 }}>
              <XAxis dataKey="year" stroke="#888" />
              <YAxis unit="%" stroke="#888" />
              <Tooltip formatter={value => `${value.toFixed(2)}%`} />
              <Legend />
              <Line
                dataKey="ROI"
                stroke="#ffd700"
                isAnimationActive
                animationDuration={800}
                animationEasing="ease-out"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

export default App;
