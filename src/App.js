import React, { useEffect, useState, useRef } from "react";

function App() {
  const [data, setData] = useState([]);
  const [sheetData, setSheetData] = useState([]);
  const [backtest, setBacktest] = useState({});

  const [takeaway, setTakeaway] = useState("");
  const [action, setAction] = useState("");
  const [commentary, setCommentary] = useState("");

  const smoothedScoreRef = useRef(0);
  const persistenceRef = useRef(0);

  const API_BASE = "https://macro-backend-cq9c.onrender.com";

  const fetchPrices = async () => {
    const prices = await (await fetch(API_BASE + "/api/prices")).json();
    setData(prices);

    const sheet = await (await fetch(API_BASE + "/api/sheet")).json();
    setSheetData(sheet);

    const bt = await (await fetch(API_BASE + "/api/backtest")).json();
    setBacktest(bt);
  };

  const fetchAI = async () => {
    const exp = await (await fetch(API_BASE + "/api/explain")).json();
    setTakeaway(exp.takeaway || "");
    setAction(exp.action || "");
    setCommentary(exp.commentary || "");
  };

  useEffect(() => {
    fetchPrices();
    const i = setInterval(fetchPrices, 60000);
    return () => clearInterval(i);
  }, []);

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 12 }}>
      <h2>Macro Terminal</h2>

      <button onClick={fetchAI}>Refresh AI</button>

      <div>
        <b>Takeaway:</b> {takeaway}<br />
        <b>Action:</b> {action}
        <div>{commentary}</div>
      </div>

      {/* BACKTEST */}
      <div style={{ marginTop: 20 }}>
        <h3>Backtest (6M)</h3>
        <div>Total Return: {backtest.totalReturn}</div>
        <div>Hit Rate: {backtest.hitRate}</div>
        <div>Max Drawdown: {backtest.maxDrawdown}</div>
      </div>
    </div>
  );
}

export default App;