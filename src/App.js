import React, { useEffect, useState, useRef } from "react";

function App() {
  const [data, setData] = useState([]);
  const [sheetData, setSheetData] = useState([]);
  const [takeaway, setTakeaway] = useState("");
  const [action, setAction] = useState("");
  const [commentary, setCommentary] = useState("");

  const smoothedScoreRef = useRef(0);

  const API_BASE = "https://macro-backend-cq9c.onrender.com";

  // 🔄 FETCH
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

  // 🔧 HELPERS
  const get = (name) =>
    data.find(d => d.name === name)?.pctChange || 0;

  const getSheet = (key) =>
    sheetData.find(r => r.key === key)?.value || "";

  const usd = get("USD/CHF");
  const spx = get("SPX Futures");
  const vix = get("VIX");

  // 🧠 1. ADAPTIVE WEIGHTS (VIX regime)
  let w_spx = 2;
  let w_usd = 1.5;
  let w_vix = 2;

  if (vix > 1) {
    w_spx *= 0.7;   // dampen equities in high vol
    w_usd *= 1.2;   // USD matters more
  }

  const t = 0.3;

  // 🔥 RAW SIGNAL CONTRIBUTIONS
  const contributions = [
    {
      name: "USD",
      value: usd,
      score: usd > t ? -w_usd : usd < -t ? w_usd : 0
    },
    {
      name: "SPX",
      value: spx,
      score: spx > t ? w_spx : spx < -t ? -w_spx : 0
    },
    {
      name: "VIX",
      value: vix,
      score: vix > t ? -w_vix : vix < -t ? w_vix : 0
    }
  ];

  let rawScore = contributions.reduce((sum, c) => sum + c.score, 0);

  // 🧠 2. SHEET INFLUENCE
  const position = getSheet("Portfolio").toLowerCase();
  const bias = getSheet("Bias").toLowerCase();

  if (position.includes("defensive")) rawScore *= 0.7;
  if (bias.includes("risk on")) rawScore += 1;
  if (bias.includes("risk off")) rawScore -= 1;

  // 🔥 SMOOTHING
  const alpha = 0.3;
  smoothedScoreRef.current =
    alpha * rawScore + (1 - alpha) * smoothedScoreRef.current;

  const score = smoothedScoreRef.current;

  // 🧠 3. LOGISTIC PROBABILITY (REAL MODEL)
  const probability = 100 / (1 + Math.exp(-score));

  const regime =
    score > 2.5 ? "RISK ON" :
    score < -2.5 ? "RISK OFF" :
    "NEUTRAL";

  // 🧠 4. TOP DRIVERS (RANKED)
  const topDrivers = contributions
    .filter(c => Math.abs(c.score) > 0)
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
    .slice(0, 2)
    .map(c =>
      c.name +
      (c.value > t ? "↑" : c.value < -t ? "↓" : "")
    )
    .join(" ");

  // 🧠 5. POSITION SUGGESTION
  let suggestion = "HOLD";
  if (score > 3 && probability > 70) suggestion = "ADD RISK";
  if (score < -3 && probability > 70) suggestion = "REDUCE RISK";

  // 🎨
  const getSignalColor = (s) => {
    if (s > 3) return "#22c55e";
    if (s > 1) return "#86efac";
    if (s < -3) return "#ef4444";
    if (s < -1) return "#fca5a5";
    return "#e2e8f0";
  };

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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
        {sheetData.map((row, i) => (
          <div key={i}>
            <div style={{ fontSize: 20 }}>{row.key}</div>
            <div style={{ fontSize: 28 }}>{row.value}</div>
          </div>
        ))}
      </div>

      {/* 🤖 AI */}
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

      {/* 🔥 HEDGE FUND SIGNAL LAYER */}
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

        <div style={{ fontSize: 12, color: "#94a3b8" }}>
          -5 Extreme Risk-Off | 0 Neutral | +5 Extreme Risk-On
        </div>

        <div style={{ marginTop: 6 }}>PROBABILITY</div>
        <div>{probability.toFixed(0)}%</div>

        <div>TOP DRIVERS</div>
        <div>{topDrivers || "—"}</div>

        <div>SUGGESTION</div>
        <div style={{ fontWeight: "bold" }}>{suggestion}</div>
      </div>

    </div>
  );
}

export default App;