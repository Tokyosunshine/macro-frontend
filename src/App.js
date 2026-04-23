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
      padding: 10,
      background: "#020617",
      color: "#e2e8f0",
      minHeight: "100vh"
    }}>
      <h2 style={{ fontSize: 16 }}>Macro Terminal</h2>

      {/* GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8
      }}>
        {data.map((d, i) => (
          <div key={i} style={{ padding: 6 }}>
            <div style={{ fontSize: 10 }}>{d.name}</div>
            <div style={{ fontSize: 13 }}>
              {d.price?.toFixed(2)}
            </div>
            <div style={{
              fontSize: 11,
              color: d.pctChange > 0 ? "lime" : "red"
            }}>
              {d.pctChange?.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>

      {/* TAKEAWAY */}
      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 10, color: "#38bdf8" }}>
          KEY TAKEAWAY
        </div>
        <div>{takeaway}</div>
      </div>

      {/* ACTION */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 10, color: "#facc15" }}>
          ACTION
        </div>
        <div>{action}</div>
      </div>

      {/* COMMENTARY */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 10 }}>
          COMMENTARY
        </div>
        <div style={{ fontSize: 12 }}>
          {commentary}
        </div>
      </div>
    </div>
  );
}

export default App;