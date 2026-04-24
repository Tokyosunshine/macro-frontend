import React, { useEffect, useState, useRef } from "react";

function App() {
  const [data, setData] = useState([]);
  const [sheetData, setSheetData] = useState([]);
  const [takeaway, setTakeaway] = useState("");
  const [action, setAction] = useState("");
  const [commentary, setCommentary] = useState("");

  const smoothedScoreRef = useRef(0);

  const API_BASE = "https://macro-backend-cq9c.onrender.com";

  const fetchData = async () => {
    try {
      const pricesRes = await fetch(API_BASE + "/api/prices");
      const prices = await pricesRes.json();
      if (Array.isArray(prices)) setData(prices);

      const sheetRes = await fetch(API_BASE + "/api/sheet");
      const sheet = await sheetRes.json();
      if (Array.isArray(sheet)) setSheetData(sheet);

      const expRes = await fetch(API_BASE + "/api/explain");
      const exp = await expRes.json();

      if (exp) {
        setTakeaway(exp.takeaway || "");
        setAction(exp.action || "");
        setCommentary(exp.commentary || "");
      }
    } catch (e) {
      console.log("Fetch error", e);
    }
  };

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 30000);
    return () => clearInterval(i);
  }, []);

  // SAFE HELPERS
  const formatPrice = (v) =>
    typeof v === "number" ? v.toFixed(2) : "—";

  const formatPct = (v) =>
    typeof v === "number" ? v.toFixed(2) + "%" : "—";

  const safeLower = (v) =>
    typeof v === "string" ? v.toLowerCase() : "";

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

      {/* TOP INDICATORS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {data.map(function(d, i) {
          return (
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
          );
        })}
      </div>

      {/* GOOGLE SHEET */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
        marginTop: 10
      }}>
        {sheetData.map(function(row, i) {
          var val = row.value || "";
          var lower = safeLower(val);

          var color = "#e2e8f0";
          if (lower.indexOf("long") !== -1) color = "#22c55e";
          if (lower.indexOf("short") !== -1) color = "#ef4444";
          if (row.key === "Last Update") color = "#38bdf8";

          return (
            <div key={i}>
              <div style={{ fontSize: 20 }}>{row.key || "—"}</div>
              <div style={{ fontSize: 28, color: color }}>
                {val || "—"}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI */}
      <div style={{ marginTop: 10 }}>
        <div>TAKEAWAY</div>
        <div>{takeaway || "—"}</div>
      </div>

      <div>
        <div>ACTION</div>
        <div>{action || "—"}</div>
      </div>

      <div style={{ marginTop: 10 }}>
        {commentary || "—"}
      </div>

      {/* BOTTOM INDICATORS */}
      <div style={{ marginTop: 20 }}>
        <div style={{ color: "#38bdf8", marginBottom: 6 }}>
          MARKET SNAPSHOT
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12
        }}>
          {data.map(function(d, i) {
            return (
              <div key={"b-" + i}>
                <div style={{ fontSize: 16 }}>{d.name}</div>
                <div style={{ fontSize: 22 }}>{formatPrice(d.price)}</div>
                <div style={{
                  fontSize: 18,
                  color: d.pctChange > 0 ? "#22c55e" : "#ef4444"
                }}>
                  {formatPct(d.pctChange)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

export default App;