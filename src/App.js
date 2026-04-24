import React, { useEffect, useState, useRef } from "react";

function App() {
  const [data, setData] = useState([]);
  const [sheetData, setSheetData] = useState([]);
  const [takeaway, setTakeaway] = useState("");
  const [action, setAction] = useState("");
  const [commentary, setCommentary] = useState("");

  const smoothedScoreRef = useRef(0);

  const API_BASE = "https://macro-backend-cq9c.onrender.com";

  const fetchData = async () => {
    try {
      const prices = await (await fetch(API_BASE + "/api/prices")).json();
      if (Array.isArray(prices)) setData(prices);

      const sheet = await (await fetch(API_BASE + "/api/sheet")).json();
      if (Array.isArray(sheet)) setSheetData(sheet);

      const exp = await (await fetch(API_BASE + "/api/explain")).json();
      setTakeaway(exp.takeaway || "");
      setAction(exp.action || "");
      setCommentary(exp.commentary || "");
    } catch {}
  };

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 30000);
    return () => clearInterval(i);
  }, []);

  const get = (name) =>
    data.find(d => d.name === name)?.pctChange || 0;

  const usd = get("USD/CHF");
  const spx = get("SPX Futures");
  const vix = get("VIX");

  // 🔥 SIGNAL ENGINE
  const t = 0.3;

  let rawScore = 0;
  rawScore += usd > t ? -1.5 : usd < -t ? 1.5 : 0;
  rawScore += spx > t ? 2 : spx < -t ? -2 : 0;
  rawScore += vix > t ? -2 : vix < -t ? 1 : 0;

  const alpha = 0.3;
  smoothedScoreRef.current =
    alpha * rawScore + (1 - alpha) * smoothedScoreRef.current;

  const score = smoothedScoreRef.current;

  const regime =
    score > 2.5 ? "RISK ON" :
    score < -2.5 ? "RISK OFF" :
    "NEUTRAL";

  const conviction = Math.min(100, Math.abs(score) * 20);

  const drivers = [
    usd < -t ? "USD↓" : usd > t ? "USD↑" : null,
    spx > t ? "SPX↑" : spx < -t ? "SPX↓" : null,
    vix > t ? "VIX↑" : vix < -t ? "VIX↓" : null
  ].filter(Boolean).join(" ");

  const formatPrice = v =>
    typeof v === "number" ? v.toFixed(2) : "—";

  const formatPct = v =>
    typeof v === "number" ? v.toFixed(2) + "%" : "—";

  // 🎨 COLOR FOR SIGNAL
  const getSignalColor = (s) => {
    if (s > 3) return "#22c55e";      // strong green
    if (s > 1) return "#86efac";      // light green
    if (s < -3) return "#ef4444";     // strong red
    if (s < -1) return "#fca5a5";     // light red
    return "#e2e8f0";                 // neutral
  };

  return (
    <div style={{
      maxWidth: 420,
      margin: "0 auto",
      padding: 12,
      background: "#020617",
      color: "#e2e8f0"
    }}>
      <h2>Macro Terminal</h2>

      {/* TOP INDICATORS */}
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

      {/* GOOGLE SHEET */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
        {sheetData.map((row, i) => (
          <div key={i}>
            <div style={{ fontSize: 20 }}>{row.key}</div>
            <div style={{ fontSize: 28 }}>{row.value}</div>
          </div>
        ))}
      </div>

      {/* AI */}
      <div style={{ marginTop: 10 }}>
        <div>TAKEAWAY</div>
        <div>{takeaway}</div>
      </div>

      <div>
        <div>ACTION</div>
        <div>{action}</div>
      </div>

      <div style={{ marginTop: 10 }}>
        {commentary}
      </div>

      {/* 🔥 SIGNAL LAYER */}
      <div style={{ marginTop: 20 }}>
        <div style={{ color: "#38bdf8" }}>MACRO REGIME</div>
        <div style={{ fontSize: 22 }}>{regime}</div>

        <div style={{ marginTop: 6 }}>WEIGHTED SIGNAL</div>
        <div style={{
          fontSize: 24,
          color: getSignalColor(score)
        }}>
          {score.toFixed(2)}
        </div>

        {/* 📊 LEGEND */}
        <div style={{
          fontSize: 12,
          color: "#94a3b8",
          marginTop: 4
        }}>
          -5 Extreme Risk-Off | -3 Risk-Off | 0 Neutral | +3 Risk-On | +5 Extreme Risk-On
        </div>

        <div style={{ marginTop: 6 }}>CONVICTION</div>
        <div>{conviction.toFixed(0)}%</div>

        <div>DRIVERS</div>
        <div>{drivers || "—"}</div>
      </div>

    </div>
  );
}

export default App;