import React, { useEffect, useState, useRef } from "react";

function App() {
  const [data, setData] = useState([]);
  const [sheetData, setSheetData] = useState([]);

  const [takeaway, setTakeaway] = useState("");
  const [action, setAction] = useState("");
  const [commentary, setCommentary] = useState("");

  const smoothedScoreRef = useRef(0);

  const API_BASE = "https://macro-backend-cq9c.onrender.com";

  // 🔄 MARKET DATA (AUTO)
  const fetchPrices = async () => {
    try {
      const prices = await (await fetch(API_BASE + "/api/prices")).json();
      if (Array.isArray(prices)) setData(prices);

      const sheet = await (await fetch(API_BASE + "/api/sheet")).json();
      if (Array.isArray(sheet)) setSheetData(sheet);
    } catch {}
  };

  // 🤖 AI (MANUAL BUTTON)
  const fetchAI = async () => {
    try {
      const exp = await (await fetch(API_BASE + "/api/explain")).json();
      setTakeaway(exp.takeaway || "");
      setAction(exp.action || "");
      setCommentary(exp.commentary || "");
    } catch {}
  };

  useEffect(() => {
    fetchPrices();
    const i = setInterval(fetchPrices, 60000); // slower refresh
    return () => clearInterval(i);
  }, []);

  // 🔧 HELPERS
  const get = (name) =>
    data.find(d => d.name === name)?.pctChange || 0;

  const usd = get("USD/CHF");
  const spx = get("SPX Futures");
  const vix = get("VIX");
  const rates = get("US 10Y");
  const oil = get("Oil");
  const gold = get("Gold");
  const btc = get("Bitcoin");

  const t = 0.3;

  // 🔥 MULTI-FACTOR MODEL
  const factors = [
    { name: "USD", val: usd, score: usd > t ? -1.5 : usd < -t ? 1.5 : 0 },
    { name: "SPX", val: spx, score: spx > t ? 2 : spx < -t ? -2 : 0 },
    { name: "VIX", val: vix, score: vix > t ? -2 : vix < -t ? 1 : 0 },
    { name: "Rates", val: rates, score: rates > t ? -1 : rates < -t ? 1 : 0 },
    { name: "Oil", val: oil, score: oil > t ? 1 : oil < -t ? -1 : 0 },
    { name: "Gold", val: gold, score: gold > t ? -1 : gold < -t ? 0.5 : 0 },
    { name: "BTC", val: btc, score: btc > t ? 1.5 : btc < -t ? -1.5 : 0 }
  ];

  let rawScore = factors.reduce((s, f) => s + f.score, 0);

  // 🔥 SMOOTHING
  const alpha = 0.3;
  smoothedScoreRef.current =
    alpha * rawScore + (1 - alpha) * smoothedScoreRef.current;

  const score = smoothedScoreRef.current;

  // 🔥 PROBABILITY (LOGISTIC)
  const probability = 100 / (1 + Math.exp(-score));

  const regime =
    score > 3 ? "RISK ON" :
    score < -3 ? "RISK OFF" :
    "NEUTRAL";

  // 🔥 TOP DRIVERS
  const topDrivers = factors
    .filter(f => Math.abs(f.score) > 0)
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
    .slice(0, 3)
    .map(f => f.name + (f.val > t ? "↑" : f.val < -t ? "↓" : ""))
    .join(" ");

  // 🔥 SUGGESTION
  let suggestion = "HOLD";
  if (score > 3 && probability > 70) suggestion = "ADD RISK";
  if (score < -3 && probability > 70) suggestion = "REDUCE RISK";

  const formatPrice = v =>
    typeof v === "number" ? v.toFixed(2) : "—";

  const formatPct = v =>
    typeof v === "number" ? v.toFixed(2) + "%" : "—";

  return (
    <div style={{
      maxWidth: 420,
      margin: "0 auto",
      padding: 12,
      background: "#020617",
      color: "#e2e8f0"
    }}>
      <h2>Macro Terminal</h2>

      {/* INDICATORS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {data.map((d, i) => (
          <div key={i}>
            <div>{d.name}</div>
            <div style={{ fontSize: 24 }}>{formatPrice(d.price)}</div>
            <div style={{
              color: d.pctChange > 0 ? "#22c55e" : "#ef4444"
            }}>
              {formatPct(d.pctChange)}
            </div>
          </div>
        ))}
      </div>

      {/* GOOGLE SHEET */}
      <div style={{ marginTop: 10 }}>
        {sheetData.map((row, i) => (
          <div key={i}>
            {row.key}: {row.value}
          </div>
        ))}
      </div>

      {/* 🤖 BUTTON */}
      <button
        onClick={fetchAI}
        style={{
          marginTop: 10,
          padding: 8,
          background: "#38bdf8",
          color: "black",
          border: "none",
          cursor: "pointer"
        }}
      >
        Refresh AI
      </button>

      {/* AI OUTPUT */}
      <div style={{ marginTop: 10 }}>
        <div><b>Takeaway:</b> {takeaway}</div>
        <div><b>Action:</b> {action}</div>
        <div>{commentary}</div>
      </div>

      {/* 🔥 SIGNAL ENGINE */}
      <div style={{ marginTop: 20 }}>
        <div>REGIME: {regime}</div>
        <div>WEIGHTED SIGNAL: {score.toFixed(2)}</div>

        <div style={{ fontSize: 12 }}>
          -5 Risk-Off Extreme | 0 Neutral | +5 Risk-On Extreme
        </div>

        <div>PROBABILITY: {probability.toFixed(0)}%</div>
        <div>DRIVERS: {topDrivers}</div>
        <div><b>SUGGESTION: {suggestion}</b></div>
      </div>

    </div>
  );
}

export default App;