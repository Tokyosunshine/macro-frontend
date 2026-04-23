import React, { useEffect, useState, useRef } from "react";

function App() {
  const [data, setData] = useState([]);
  const [takeaway, setTakeaway] = useState("");
  const [action, setAction] = useState("");
  const [commentary, setCommentary] = useState("");
  const [confidence, setConfidence] = useState(null);

  const prevSignalRef = useRef(null);
  const smoothedScoreRef = useRef(0);

  const API_BASE = "https://macro-backend-cq9c.onrender.com";

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/prices`);
      const prices = await res.json();
      setData(prices || []);

      const expRes = await fetch(`${API_BASE}/api/explain`);
      const exp = await expRes.json();

      setTakeaway(exp?.takeaway || "");
      setAction(exp?.action || "");
      setCommentary(exp?.commentary || "");
      setConfidence(exp?.confidence ?? null);
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 SAFE helper
  const get = (name) => {
    const found = data.find(d => d.name === name);
    return found && typeof found.pctChange === "number"
      ? found.pctChange
      : 0;
  };

  const usd = get("USD/CHF");
  const gold = get("Gold");
  const spx = get("SPX Futures");
  const vix = get("VIX");
  const btc = get("Bitcoin");
  const oil = get("Oil");

  // 🔥 weighted signal
  let rawScore = 0;
  rawScore += usd > 0 ? -1.5 : 1.5;
  rawScore += gold > 0 ? -1 : 1;
  rawScore += spx > 0 ? 2 : -2;
  rawScore += vix > 0 ? -2 : 1;
  rawScore += btc > 0 ? 1 : -1;
  rawScore += oil > 0 ? 0.5 : -0.5;

  // 🧠 smoothing
  const alpha = 0.3;
  smoothedScoreRef.current =
    alpha * rawScore + (1 - alpha) * smoothedScoreRef.current;

  const score = smoothedScoreRef.current;

  let signal = "NEUTRAL";
  if (score > 2.5) signal = "RISK ON";
  if (score < -2.5) signal = "RISK OFF";

  // 📊 regime
  let regime = "NEUTRAL";
  if (vix > 1 && spx < 0) regime = "RISK-OFF SHOCK";
  else if (oil > 0 && spx > 0) regime = "INFLATIONARY GROWTH";
  else if (usd > 0 && gold < 0) regime = "REAL YIELD PRESSURE";
  else if (spx > 0 && vix < 0) regime = "LIQUIDITY RISK-ON";

  // 🔄 transition
  const prevSignal = prevSignalRef.current;
  let transition = "";

  if (prevSignal && prevSignal !== signal) {
    transition = `${prevSignal} → ${signal}`;
  }

  prevSignalRef.current = signal;

  // 🔮 predictive
  let predictive = "NO EDGE";
  if (score > 3.5 && spx > 0) predictive = "BULLISH MOMENTUM";
  if (score < -3.5 && spx < 0) predictive = "BEARISH MOMENTUM";

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

      {/* 🔄 TRANSITION */}
      {transition && (
        <div style={{ marginTop: 5, color: "#facc15" }}>
          Transition: {transition}
        </div>
      )}

      {/* 🎯 CONFIDENCE */}
      <div style={{ marginTop: 8 }}>
        <div>CONFIDENCE</div>
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

      {/* 🧠 SYSTEM */}
      <div style={{ marginTop: 15 }}>
        <div style={{ color: "#38bdf8" }}>MACRO REGIME</div>
        <div style={{ fontSize: 18 }}>{regime}</div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={{ color: "#38bdf8" }}>WEIGHTED SIGNAL</div>
        <div>Score: {score.toFixed(2)}</div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={{ color: "#38bdf8" }}>PREDICTIVE SIGNAL</div>
        <div style={{
          fontSize: 18,
          color:
            predictive.includes("BULLISH") ? "#22c55e" :
            predictive.includes("BEARISH") ? "#ef4444" :
            "#94a3b8"
        }}>
          {predictive}
        </div>
      </div>

    </div>
  );
}

export default App;