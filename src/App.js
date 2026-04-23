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

  return (
    <div style={{
      maxWidth: 420,
      margin: "0 auto",
      padding: 12,
      background: "#020617",
      color: "#e2e8f0",
      minHeight: "100vh",
      fontFamily: "Arial"
    }}>
      <h2 style={{ fontSize: 18 }}>Macro Terminal</h2>

      {/* 📊 INDICATORS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
        marginTop: 12
      }}>
        {data.map((d, i) => (
          <div key={i} style={{
            padding: 14,
            border: "1px solid #1e293b",
            borderRadius: 10
          }}>
            <div style={{
              fontSize: 20,
              color: "#cbd5f5",
              marginBottom: 6
            }}>
              {d.name}
            </div>

            <div style={{
              fontSize: 28,
              fontWeight: "bold"
            }}>
              {d.price ? d.price.toFixed(2) : "—"}
            </div>

            <div style={{
              fontSize: 22,
              color:
                d.pctChange > 0
                  ? "#22c55e"
                  : d.pctChange < 0
                  ? "#ef4444"
                  : "#94a3b8"
            }}>
              {d.pctChange ? d.pctChange.toFixed(2) + "%" : "—"}
            </div>
          </div>
        ))}
      </div>

      {/* 🎯 CONFIDENCE */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, color: "#38bdf8" }}>
          CONFIDENCE
        </div>
        <div style={{ fontSize: 20 }}>
          {confidence ? confidence + "%" : "—"}
        </div>
      </div>

      {/* 🔑 TAKEAWAY */}
      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 12 }}>KEY TAKEAWAY</div>
        <div style={{ fontSize: 16 }}>{takeaway}</div>
      </div>

      {/* 🎯 ACTION */}
      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 12 }}>ACTION</div>
        <div style={{ fontSize: 16 }}>{action}</div>
      </div>

      {/* 🤖 COMMENTARY */}
      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 12 }}>COMMENTARY</div>
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
          {commentary}
        </div>
      </div>

      {/* 📈 CHARTS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
        marginTop: 15
      }}>
        {data.map((d, i) => (
          <iframe
            key={i}
            src={`https://s.tradingview.com/widgetembed/?symbol=${d.symbol}&interval=60&theme=dark`}
            style={{ width: "100%", height: 150 }}
            title={d.name}
          />
        ))}
      </div>
    </div>
  );
}

export default App;