import React, { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState([]);
  const [takeaway, setTakeaway] = useState("");
  const [action, setAction] = useState("");
  const [commentary, setCommentary] = useState("");
  const [confidence, setConfidence] = useState(null);

  const API_BASE = "https://macro-backend-cq9c.onrender.com";

  const fetchData = async () => {
    const res = await fetch(`${API_BASE}/api/prices`);
    const prices = await res.json();
    setData(prices);

    const expRes = await fetch(`${API_BASE}/api/explain`);
    const exp = await expRes.json();

    setTakeaway(exp.takeaway);
    setAction(exp.action);
    setCommentary(exp.commentary);
    setConfidence(exp.confidence);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔥 MACRO ENGINE

  const get = (name) =>
    data.find(d => d.name === name)?.pctChange || 0;

  const usd = get("USD/CHF");
  const gold = get("Gold");
  const spx = get("SPX Futures");
  const vix = get("VIX");
  const btc = get("Bitcoin");
  const oil = get("Oil");

  let score = 0;

  score += usd > 0 ? -1.5 : 1.5;
  score += gold > 0 ? -1 : 1;
  score += spx > 0 ? 2 : -2;
  score += vix > 0 ? -2 : 1;
  score += btc > 0 ? 1 : -1;
  score += oil > 0 ? 0.5 : -0.5;

  const signal =
    score > 2 ? "RISK ON" :
    score < -2 ? "RISK OFF" :
    "NEUTRAL";

  let regime = "NEUTRAL";

  if (vix > 1 && spx < 0) regime = "RISK-OFF SHOCK";
  else if (oil > 0 && spx > 0) regime = "INFLATIONARY GROWTH";
  else if (usd > 0 && gold < 0) regime = "REAL YIELD PRESSURE";
  else if (spx > 0 && vix < 0) regime = "RISK-ON LIQUIDITY";

  let predictive = "NO EDGE";

  if (score > 3) predictive = "SHORT-TERM BULLISH";
  if (score < -3) predictive = "SHORT-TERM BEARISH";

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
            <div style={{ fontSize: 28 }}>{d.price?.toFixed(2)}</div>
            <div style={{
              fontSize: 22,
              color: d.pctChange > 0 ? "lime" : "red"
            }}>
              {d.pctChange?.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>

      {/* 🔥 SIGNAL */}
      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 12 }}>SIGNAL</div>
        <div style={{ fontSize: 22 }}>{signal}</div>
      </div>

      {/* 🎯 CONFIDENCE */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 12 }}>CONFIDENCE</div>
        <div style={{ fontSize: 20 }}>
          {confidence ? confidence + "%" : "—"}
        </div>
      </div>

      {/* 🔑 TAKEAWAY */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 12 }}>TAKEAWAY</div>
        <div>{takeaway}</div>
      </div>

      {/* 🎯 ACTION */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 12 }}>ACTION</div>
        <div>{action}</div>
      </div>

      {/* 🤖 COMMENTARY */}
      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 12 }}>COMMENTARY</div>
        <div style={{ lineHeight: 1.6 }}>{commentary}</div>
      </div>

      {/* 🧠 SYSTEM OUTPUT */}
      <div style={{ marginTop: 15 }}>
        <div style={{ fontSize: 12, color: "#38bdf8" }}>
          MACRO REGIME
        </div>
        <div style={{ fontSize: 18, fontWeight: "bold" }}>
          {regime}
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 12, color: "#38bdf8" }}>
          WEIGHTED SIGNAL
        </div>
        <div style={{ fontSize: 18 }}>
          Score: {score.toFixed(2)} → {signal}
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 12, color: "#38bdf8" }}>
          PREDICTIVE SIGNAL
        </div>
        <div style={{
          fontSize: 18,
          fontWeight: "bold",
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