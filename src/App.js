import React, { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState([]);
  const [takeaway, setTakeaway] = useState("");
  const [action, setAction] = useState("");
  const [commentary, setCommentary] = useState("");

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

      {/* 📊 GRID */}
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
            {/* 🔤 LABEL (↑ bigger) */}
            <div style={{
              fontSize: 20,        // was 14 → +75%+
              fontWeight: "500",
              color: "#cbd5f5",
              marginBottom: 6
            }}>
              {d.name}
            </div>

            {/* 💰 PRICE (unchanged) */}
            <div style={{
              fontSize: 28,
              fontWeight: "bold",
              lineHeight: 1.1
            }}>
              {d.price ? d.price.toFixed(2) : "—"}
            </div>

            {/* 📈 % CHANGE (↑ bigger) */}
            <div style={{
              fontSize: 22,        // was 18 → +75% feel
              marginTop: 4,
              fontWeight: "600",
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

      {/* 🔑 TAKEAWAY */}
      <div style={{
        marginTop: 15,
        padding: 12,
        background: "#111827",
        borderRadius: 8
      }}>
        <div style={{ fontSize: 11, color: "#38bdf8" }}>
          KEY TAKEAWAY
        </div>
        <div style={{ fontSize: 16, fontWeight: "bold" }}>
          {takeaway}
        </div>
      </div>

      {/* 🎯 ACTION */}
      <div style={{
        marginTop: 10,
        padding: 12,
        background: "#111827",
        borderRadius: 8
      }}>
        <div style={{ fontSize: 11, color: "#facc15" }}>
          ACTION
        </div>
        <div style={{ fontSize: 16, fontWeight: "bold" }}>
          {action}
        </div>
      </div>

      {/* 🤖 COMMENTARY */}
      <div style={{
        marginTop: 15,
        padding: 12,
        background: "#0f172a",
        borderRadius: 8
      }}>
        <div style={{ fontSize: 11, color: "#38bdf8" }}>
          AI MACRO COMMENTARY
        </div>
        <div style={{
          fontSize: 14,
          lineHeight: 1.6,
          marginTop: 5
        }}>
          {commentary}
        </div>
      </div>
    </div>
  );
}

export default App;