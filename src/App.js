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

  // 🔄 FETCH DATA (SAFE)
  const fetchData = async () => {
    try {
      const pricesRes = await fetch(`${API_BASE}/api/prices`);
      const prices = await pricesRes.json();
      setData(Array.isArray(prices) ? prices : []);

      const sheetRes = await fetch(`${API_BASE}/api/sheet`);
      const sheet = await sheetRes.json();
      setSheetData(Array.isArray(sheet) ? sheet : []);

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

  // 🔥 SAFE HELPER
  const get = (name) =>
    data.find(d => d.name === name)?.pctChange || 0;

  const usd = get("USD/CHF");
  const spx = get("SPX Futures");
  const vix = get("VIX");

  // 🔥 SIGNAL LOGIC
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

  // 🔧 SAFE FORMATTERS
  const formatPrice = (v) =>
    typeof v === "number" ? v.toFixed(2) : "—";

  const formatPct = (v) =>
    typeof v === "number" ? v.toFixed(2) + "%" : "—";

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

      {/* 📊 TOP INDICATORS */}
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
        {sheetData.map((row, i) => (
          <div key={i}>
            <div style={{ fontSize: 20 }}>
              {row.key || "—"}
            </div>
            <div style={{
              fontSize: 28,
              color:
                row.value?.toLowerCase()?.includes("long") ? "#22c55e" :
                row.value?.toLowerCase()?.includes("short") ? "#ef4444" :
                row.key === "Last Update" ? "#38bdf8" :
                "#e2e8f0"
            }}>
              {row.value || "—"}
            </div>
          </div>
        ))}
      </div>

      {/* 🔥 SIGNAL */}
      <div style={{ marginTop: 10 }}>
        <div>SIGNAL</div>
        <div style={{ fontSize: 22 }}>{signal}</div>
      </div>

      <div>PROBABILITY: {probability.toFixed(0)}%</div>

      {/* 🤖 AI */}
      <div style={{ marginTop: 10 }}>
        <div>TAKEAWAY</div>
        <div>{takeaway || "—"}</div>
      </div>

      <div>
        <div>ACTION</div>
        <div>{action || "—"}</div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div>{commentary || "—"}</div>
      </div>

      {/* 📊 BOTTOM INDICATORS */}
      <div style={{ marginTop: 20 }}>
        <div style={{ color: "#38bdf8", marginBottom: 6 }}>
          MARKET SNAPSHOT
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12
        }}>
          {data.map((d, i) => (
            <div key={"bottom-" + i}>
              <div style={{ fontSize: 16 }}>{d.name}</div>
              <div style={{ fontSize: 22 }}>{formatPrice(d.price)}</div>
              <div style={{
                fontSize: 18,
                color: d.pctChange > 0 ? "#22c55e" : "#ef4444"
              }}>
                {formatPct(d.pctChange)}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default App;