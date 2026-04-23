import React, { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState([]);
  const [explanation, setExplanation] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [error, setError] = useState(null);

  const API_BASE = "https://macro-backend-cq9c.onrender.com";

  const fetchData = async () => {
    try {
      setError(null);

      const res = await fetch(`${API_BASE}/api/prices`);
      const prices = await res.json();
      setData(prices);

      const expRes = await fetch(`${API_BASE}/api/explain`);
      const expJson = await expRes.json();
      setExplanation(expJson.explanation);

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "0 auto",
        padding: 15,
        backgroundColor: "#020617",
        color: "#e2e8f0",
        minHeight: "100vh",
        fontFamily: "Arial"
      }}
    >
      <h1 style={{ fontSize: 22, marginBottom: 5 }}>
        Macro Terminal V2
      </h1>

      <p style={{ fontSize: 12, color: "#94a3b8" }}>
        Last updated: {lastUpdated}
      </p>

      {error && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          {error}
        </p>
      )}

      {/* 📊 MARKET DATA */}
      {data.map((item, i) => (
        <div
          key={i}
          style={{
            padding: 15,
            marginBottom: 10,
            border: "1px solid #1e293b",
            borderRadius: 8,
            backgroundColor: "#020617"
          }}
        >
          <h2 style={{ marginBottom: 5 }}>{item.name}</h2>

          <p style={{ fontSize: 20 }}>
            {item.price ? item.price.toFixed(4) : "—"}
          </p>

          <p
            style={{
              color:
                item.pctChange > 0
                  ? "#22c55e"
                  : item.pctChange < 0
                  ? "#ef4444"
                  : "#94a3b8",
              fontWeight: "bold"
            }}
          >
            {item.pctChange
              ? item.pctChange.toFixed(2) + "%"
              : "—"}
          </p>
        </div>
      ))}

      {/* 🤖 AI COMMENTARY */}
      <div
        style={{
          backgroundColor: "#0f172a",
          padding: 15,
          borderRadius: 8,
          marginTop: 20,
          border: "1px solid #1e293b"
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: "#38bdf8",
            marginBottom: 6,
            letterSpacing: 1
          }}
        >
          AI MACRO COMMENTARY
        </div>

        <div
          style={{
            fontSize: 15,
            lineHeight: 1.6
          }}
        >
          {explanation || "Loading analysis..."}
        </div>
      </div>
    </div>
  );
}

export default App;