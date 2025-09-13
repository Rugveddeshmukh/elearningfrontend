import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const LoginHistoryPage = () => {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await api.get("/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setHistory(res.data.loginHistory || []);
      } catch (err) {
        console.error("History fetch error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  if (loading) return <p>Loading login history...</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", fontFamily: "Arial" }}>
      <h2>Login History</h2>
      {history.length > 0 ? (
        <ul>
          {history.map((log, index) => (
            <li key={index}>
              IP: {log.ip}, Device: {log.device}, Time:{" "}
              {new Date(log.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No login history available.</p>
      )}
    </div>
  );
};

export default LoginHistoryPage;
