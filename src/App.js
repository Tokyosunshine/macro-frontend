import React, { useEffect, useState, useRef } from "react";

function App() {
  const [data, setData] = useState([]);
  const [takeaway, setTakeaway] = useState("");
  const [action, setAction] = useState("");
  const [commentary, setCommentary] = useState("");
  const [confidence, setConfidence] = useState(null);

  const smoothedScoreRef = useRef(0);

  const API_BASE = "https://macro-backend-cq9c.onrender.com";

  const fetchData = async () => {
    const res = await fetch(`${API_BASE}/api/prices`);
    const prices = await res.json();
    setData(prices || []);

    const expRes = await fetch(`${API_BASE}/api/explain`);
    const exp = await expRes.json();

    setTakeaway(exp?.takeaway || "");
    setAction(exp?.action || "");
    setCommentary(exp?.commentary || "");
    setConfidence(exp?.confidence ?? null);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 helper
  const get = (name) =>
    data.find(d => d.name === name)?.pctChange || 0;

  const usd = get("USD/CHF");
  const gold = get("Gold");
  const spx = get("SPX Futures");
  const vix = get("VIX");
  const btc = get("Bitcoin");
  const oil = get("Oil");

  // 🔥 NOISE REDUCTION
  const t = 0.3;

  let rawScore = 0;
  rawScore += usd > t ? -1.5 : usd < -t ? 1.5 : 0;
  rawScore += gold > t ? -1 : gold < -t ? 1 : 0;
  rawScore += spx > t ? 2 : spx < -t ? -2 : 0;
  rawScore += vix > t ? -2 : vix < -t ? 1 : 0;
  rawScore += btc > t ? 1 : btc < -t ? -1 : 0;
  rawScore += oil > t ? 0.5 : oil < -t ? -0.5 : 0;

  // 🔥 smoothing
  const alpha = 0.3;
  smoothedScoreRef.current =
    alpha * rawScore + (1 - alpha) * smoothedScoreRef.current;

  const score = smoothedScoreRef.current;

  let signal =
    score > 2.5 ? "RISK ON" :
    score < -2.5 ? "RISK OFF" :
    "NEUTRAL";

  // 🔥 PROBABILITY MODEL
  const probability = Math.min(100, Math.abs(score) * 20);

  // 🔥 regime
  let regime = "NEUTRAL";
  if (vix > 1 && spx < 0) regime = "RISK-OFF SHOCK";
  else if (oil > 0 && spx > 0) regime = "INFLATIONARY GROWTH";
  else if (usd > 0 && gold < 0) regime = "REAL YIELD PRESSURE";
  else if (spx > 0 && vix < 0) regime = "LIQUIDITY RISK-ON";

  return (
    <div style={{
      maxWidth: 420,
      margin: "0 auto",
      padding: 12,
      background: "#020617",
      color: "#e2e8f0",
      minHeight: "100vh"
    }}>
      <h2>Macro Terminal</h2>

      {/* 📊 INDICATORS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12
      }}>
        {data.map((d, i) => (
          <div key={i}>
            <div style={{ fontSize: 20 }}>{d.name}</div>
            <div style={{ fontSize: 28 }}>
              {d.price ? d.price.toFixed(2) : "—"}
            </div>
            <div style={{
              fontSize: 22,
              color: d.pctChange > 0 ? "#22c55e" : "#ef4444"
            }}>
              {d.pctChange ? d.pctChange.toFixed(2) + "%" : "—"}
            </div>
          </div>
        ))}
      </div>

      {/* 🔥 SIGNAL */}
      <div style={{ marginTop: 10 }}>
        <div>SIGNAL</div>
        <div style={{ fontSize: 22 }}>{signal}</div>
      </div>

      {/* 🔥 PROBABILITY */}
      <div style={{ marginTop: 5 }}>
        <div>PROBABILITY</div>
        <div style={{ fontSize: 20 }}>
          {probability.toFixed(0)}%
        </div>
      </div>

      {/* 🎯 CONFIDENCE */}
      <div style={{ marginTop: 5 }}>
        <div>AI CONFIDENCE</div>
        <div style={{ fontSize: 20 }}>
          {confidence ? confidence + "%" : "—"}
        </div>
      </div>

      {/* 🔑 TAKEAWAY */}
      <div style={{ marginTop: 8 }}>
        <div>TAKEAWAY</div>
        <div>{takeaway}</div>
      </div>

      {/* 🎯 ACTION */}
      <div style={{ marginTop: 8 }}>
        <div>ACTION</div>
        <div>{action}</div>
      </div>

      {/* 🤖 COMMENTARY */}
      <div style={{ marginTop: 10 }}>
        <div>COMMENTARY</div>
        <div style={{ lineHeight: 1.6 }}>{commentary}</div>
      </div>

      {/* 🧠 MACRO */}
      <div style={{ marginTop: 15 }}>
        <div style={{ color: "#38bdf8" }}>MACRO REGIME</div>
        <div style={{ fontSize: 18 }}>{regime}</div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={{ color: "#38bdf8" }}>WEIGHTED SCORE</div>
        <div>{score.toFixed(2)}</div>
      </div>

    </div>
  );
}

export default App;