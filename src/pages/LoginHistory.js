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
    <div style={{ maxWidth: "800px", margin: "50px auto", fontFamily: "Arial" }}>
      <h2>Login History</h2>
      {history.length > 0 ? (
        <table border="1" cellPadding="10" style={{ width: "100%", textAlign: "left" }}>
          <thead>
            <tr>
              <th>IP Address</th>
              <th>Device Type</th>
              <th>Location</th>
              <th>Login Time</th>
              <th>Logout Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((log, index) => (
              <tr key={index}>
                <td>{log.ip}</td>
                <td>{log.deviceType}</td>
                <td>{log.location}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.signOutTime ? new Date(log.signOutTime).toLocaleString() : "Active"}</td>
                <td style={{ color: log.status === "Success" ? "green" : "red" }}>
                  {log.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No login history available.</p>
      )}
    </div>
  );
};

export default LoginHistoryPage;
