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
  const [waivedYears, setWaivedYears] = useState(new Set([0]));
  const [cards, setCards] = useState([]); // holds card configs
  const [dollarPerPoint, setDollarPerPoint] = useState(0.017);

  // ─── Handlers ─────────────────────────────────────────────────────
  const addCard = card => {
    setCards(prev => [
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

  // ─── Compute ROI Series per card ───────────────────────────────────
  // data = [{ year: 1, 'Chase Sapphire': 4.5, 'Citi Double Cash': 3.2 }, ...]
  const data = useMemo(() => {
    // initialize array of years
    const arr = Array.from({ length: years }, (_, y) => ({ year: y + 1 }));

    cards.forEach(card => {
      let cum = 0;
      const key = card.name;
      arr.forEach((obj, y) => {
        const row = annualSpend[y] || {};
        const yearSpend = Object.values(row).reduce((a, b) => a + b, 0);
        cum += yearSpend;

        // calculate points + cashback for this card
        let pts = 0, cb = 0;
        Object.entries(row).forEach(([cat, amt]) => {
          pts += (card.pointRates[cat] || 0) * amt;
          cb  += (card.cashRates[cat] || 0) * amt;
        });
        const ptsValue = pts * dollarPerPoint;

        // apply welcome bonus if threshold crossed
        let bonusVal = 0;
        card.welcomeBonuses.forEach(({ threshold, points, cash }) => {
          const prev = cum - yearSpend;
          if (prev < threshold && cum >= threshold) {
            bonusVal += points * dollarPerPoint + cash;
          }
        });

        // subtract fee if not waived this year
        const fee = waivedYears.has(y) ? 0 : card.annualFee;
        const net = ptsValue + cb + bonusVal - fee;
        const ROI = yearSpend > 0 ? (net / yearSpend) * 100 : 0;

        obj[key] = Number(ROI.toFixed(2));
      });
    });

    return arr;
  }, [years, annualSpend, cards, waivedYears, dollarPerPoint]);

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
        {cards.map((card, i) => (
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
                  setCards(prev => {
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
                  setCards(prev => {
                    const copy = [...prev];
                    copy[i].pointRates = { ...copy[i].pointRates, [cat]: val };
                    return copy;
                  });
                }}
              />
            )}
            <BonusFields onAdd={bonus => {
              setCards(prev => {
                const copy = [...prev];
                copy[i].welcomeBonuses = [...copy[i].welcomeBonuses, bonus];
                return copy;
              });
            }} />
          </motion.div>
        ))}

        {/* ROI Chart with one line per card */}
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ right: 20 }}>
              <XAxis dataKey="year" stroke="#888" />
              <YAxis unit="%" stroke="#888" />
              <Tooltip formatter={v => `${v.toFixed(2)}%`} />
              <Legend />
              {cards.map((card, idx) => (
                <Line
                  key={card.name}
                  dataKey={card.name}
                  stroke={['#8884d8','#82ca9d','#ffc658','#d0ed57'][idx % 4]}
                  dot={false}
                  isAnimationActive
                  animationDuration={800}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

export default App;
