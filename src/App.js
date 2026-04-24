import React, { useEffect, useState, useRef } from "react";

function App() {
  const [data, setData] = useState([]);
  const [sheetData, setSheetData] = useState([]);
  const [takeaway, setTakeaway] = useState("");
  const [action, setAction] = useState("");
  const [commentary, setCommentary] = useState("");
  const [confidence, setConfidence] = useState(null);

  const smoothedScoreRef = useRef(0);

  const API_BASE = "https://macro-backend-cq9c.onrender.com";

  const fetchData = async () => {
    const prices = await (await fetch(`${API_BASE}/api/prices`)).json();
    setData(prices);

    const sheet = await (await fetch(`${API_BASE}/api/sheet`)).json();
    setSheetData(sheet);

    const exp = await (await fetch(`${API_BASE}/api/explain`)).json();

    setTakeaway(exp.takeaway);
    setAction(exp.action);
    setCommentary(exp.commentary);
    setConfidence(exp.confidence);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const get = (name) =>
    data.find(d => d.name === name)?.pctChange || 0;

  const usd = get("USD/CHF");
  const spx = get("SPX Futures");
  const vix = get("VIX");

  const t = 0.3;

  let rawScore = 0;
  rawScore += usd > t ? -1.5 : usd < -t ? 1.5 : 0;
  rawScore += spx > t ? 2 : spx < -t ? -2 : 0;
  rawScore += vix > t ? -2 : vix < -t ? 1 : 0;

  const alpha = 0.3;
  smoothedScoreRef.current =
    alpha * rawScore + (1 - alpha) * smoothedScoreRef.current;

  const score = smoothedScoreRef.current;

  const signal =
    score > 2.5 ? "RISK ON" :
    score < -2.5 ? "RISK OFF" :
    "NEUTRAL";

  const probability = Math.min(100, Math.abs(score) * 20);

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 12, background: "#020617", color: "#e2e8f0" }}>
      <h2>Macro Terminal</h2>

      {/* INDICATORS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {data.map((d, i) => (
          <div key={i}>
            <div style={{ fontSize: 20 }}>{d.name}</div>
            <div style={{ fontSize: 28 }}>{d.price?.toFixed(2)}</div>
            <div style={{
              fontSize: 22,
              color: d.pctChange > 0 ? "#22c55e" : "#ef4444"
            }}>
              {d.pctChange?.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>

      {/* GOOGLE SHEET (same style) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
        {sheetData.map((row, i) => (
          <div key={i}>
            <div style={{ fontSize: 20 }}>{row.key}</div>
            <div style={{ fontSize: 28 }}>{row.value}</div>
          </div>
        ))}
      </div>

      {/* SIGNAL */}
      <div style={{ marginTop: 10 }}>
        <div>SIGNAL</div>
        <div style={{ fontSize: 22 }}>{signal}</div>

        <div style={{ fontSize: 12, color: "#94a3b8" }}>
          Drivers:
          {usd > t && " USD↑"}
          {vix > t && " VIX↑"}
          {spx < -t && " SPX↓"}
        </div>
      </div>

      {/* PROBABILITY */}
      <div style={{ marginTop: 5 }}>
        PROBABILITY: {probability.toFixed(0)}%
      </div>

      {/* LEGEND */}
      <div style={{ fontSize: 12, color: "#94a3b8" }}>
        &lt; -3 Risk-Off | -2 to 2 Neutral | &gt; 3 Risk-On
      </div>

      {/* AI */}
      <div style={{ marginTop: 10 }}>
        TAKEAWAY: {takeaway}
      </div>

      <div>ACTION: {action}</div>

      <div style={{ marginTop: 10 }}>{commentary}</div>
    </div>
  );
}

export default App;