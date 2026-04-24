import React, { useEffect, useState, useRef } from "react";

function App() {
  const [data, setData] = useState([]);
  const [sheetData, setSheetData] = useState([]);

  const [takeaway, setTakeaway] = useState("");
  const [action, setAction] = useState("");
  const [commentary, setCommentary] = useState("");

  const smoothedScoreRef = useRef(0);
  const persistenceRef = useRef(0);

  const API_BASE = "https://macro-backend-cq9c.onrender.com";

  // 🔄 FETCH MARKET + SHEET
  const fetchPrices = async () => {
    try {
      const prices = await (await fetch(API_BASE + "/api/prices")).json();
      if (Array.isArray(prices)) setData(prices);

      const sheet = await (await fetch(API_BASE + "/api/sheet")).json();
      if (Array.isArray(sheet)) setSheetData(sheet);
    } catch {}
  };

  // 🤖 AI
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
    const i = setInterval(fetchPrices, 60000);
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
  const copper = get("Copper");

  const t = 0.3;

  const factors = [
    { name: "USD", val: usd, score: usd > t ? -1.5 : usd < -t ? 1.5 : 0 },
    { name: "SPX", val: spx, score: spx > t ? 2 : spx < -t ? -2 : 0 },
    { name: "VIX", val: vix, score: vix > t ? -2 : vix < -t ? 1 : 0 },
    { name: "Rates", val: rates, score: rates > t ? -1 : rates < -t ? 1 : 0 },
    { name: "Oil", val: oil, score: oil > t ? 1 : oil < -t ? -1 : 0 },
    { name: "Gold", val: gold, score: gold > t ? -1 : gold < -t ? 0.5 : 0 },
    { name: "BTC", val: btc, score: btc > t ? 1.5 : btc < -t ? -1.5 : 0 },
    { name: "Copper", val: copper, score: copper > t ? 1 : copper < -t ? -1 : 0 }
  ];

  let rawScore = factors.reduce((s, f) => s + f.score, 0);

  const alpha = 0.3;
  smoothedScoreRef.current =
    alpha * rawScore + (1 - alpha) * smoothedScoreRef.current;

  const score = smoothedScoreRef.current;

  const probability = 100 / (1 + Math.exp(-score));

  const regime =
    score > 3 ? "RISK ON" :
    score < -3 ? "RISK OFF" :
    "NEUTRAL";

  let phase = "TRANSITION";
  if (score > 2 && spx > 0 && vix < 0) phase = "EXPANSION";
  if (score < -2 && spx < 0 && vix > 0) phase = "CONTRACTION";
  if (Math.abs(score) < 1) phase = "LATE CYCLE";

  if (Math.abs(score) > 2) persistenceRef.current++;
  else persistenceRef.current = 0;

  const persistence =
    persistenceRef.current > 5 ? "STRONG TREND" :
    persistenceRef.current > 2 ? "TREND BUILDING" :
    "NO TREND";

  let warning = "NONE";
  if (score > 2 && vix > 0.5) warning = "RISK BUILDING";
  if (score < -2 && spx > 0.5) warning = "SHORT SQUEEZE RISK";

  const topDrivers = factors
    .filter(f => Math.abs(f.score) > 0)
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
    .slice(0, 3)
    .map(f => f.name + (f.val > t ? "↑" : f.val < -t ? "↓" : ""))
    .join(" ");

  let suggestion = "HOLD";
  if (score > 3 && probability > 70) suggestion = "ADD RISK";
  if (score < -3 && probability > 70) suggestion = "REDUCE RISK";

  let allocation = "50/50";
  if (score > 3) allocation = "80-90% Risk";
  else if (score > 1) allocation = "60-70% Risk";
  else if (score < -3) allocation = "10-20% Risk";
  else if (score < -1) allocation = "20-40% Risk";

  const formatPrice = v => typeof v === "number" ? v.toFixed(2) : "—";
  const formatPct = v => typeof v === "number" ? v.toFixed(2) + "%" : "—";

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 12, background: "#020617", color: "#e2e8f0" }}>
      <h2>Macro Terminal</h2>

      {/* 📊 INDICATORS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {data.map((d, i) => (
          <div key={i}>
            <div style={{ fontSize: 20 }}>{d.name}</div>
            <div style={{ fontSize: 28 }}>{formatPrice(d.price)}</div>
            <div style={{
              fontSize: 22,
              color: d.pctChange > 0 ? "#22c55e" : "#ef4444"
            }}>
              {formatPct(d.pctChange)}
            </div>
          </div>
        ))}
      </div>

      {/* 🧾 GOOGLE SHEET */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
        marginTop: 10
      }}>
        {sheetData.map((row, i) => {
          const val = row.value || "";
          return (
            <div key={i}>
              <div style={{ fontSize: 20 }}>{row.key}</div>
              <div style={{ fontSize: 28 }}>{val}</div>
            </div>
          );
        })}
      </div>

      <button onClick={fetchAI} style={{ marginTop: 10 }}>
        Refresh AI
      </button>

      <div style={{ marginTop: 10 }}>
        <b>Takeaway:</b> {takeaway}<br />
        <b>Action:</b> {action}
        <div>{commentary}</div>
      </div>

      {/* 🔥 SIGNAL ENGINE */}
      <div style={{ marginTop: 20 }}>
        <div>REGIME: {regime}</div>
        <div>PHASE: {phase}</div>
        <div>SIGNAL: {score.toFixed(2)}</div>
        <div>PROBABILITY: {probability.toFixed(0)}%</div>
        <div>PERSISTENCE: {persistence}</div>
        <div>WARNING: {warning}</div>
        <div>DRIVERS: {topDrivers}</div>
        <div>SUGGESTION: {suggestion}</div>
        <div><b>ALLOCATION: {allocation}</b></div>
      </div>
    </div>
  );
}

export default App;