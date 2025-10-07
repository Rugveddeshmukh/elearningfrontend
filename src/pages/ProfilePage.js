import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "@mui/material";

const ProfilePage = () => {
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await api.get("/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Profile fetch error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  if (loading) return <p>Loading profile...</p>;
  if (!user) return <p>No profile found. Please login.</p>;

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "50px auto",
        borderRadius: "12px",
        fontFamily: "Arial, sans-serif",
        overflow: "hidden", // ensures header gradient is clipped
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      {/* Top Header with Avatar and Gradient Background */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "30px",
          background: "linear-gradient(90deg, #cce4f6 0%, #fff0e5 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <Avatar
            alt={user.fullName}
            src={user.avatar || ""}
            sx={{ width: 60, height: 60 }}
          />
          <h2 style={{ margin: 0, color: "#003366" }}>
            Welcome {user.fullName || "N/A"}
          </h2>
        </div>
      </div>

      {/* Profile Info Grid */}
      <div
        style={{
          padding: "30px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          backgroundColor: "#fff",
        }}
      >
        <div>
          <label style={{ fontWeight: "bold", color: "#555" }}>Employee ID</label>
          <div style={fieldStyle}>{user.employeeId || "N/A"}</div>
        </div>
        <div>
          <label style={{ fontWeight: "bold", color: "#555" }}>Full Name</label>
          <div style={fieldStyle}>{user.fullName || "N/A"}</div>
        </div>
        <div>
          <label style={{ fontWeight: "bold", color: "#555" }}>Email</label>
          <div style={fieldStyle}>{user.email || "N/A"}</div>
        </div>
        <div>
          <label style={{ fontWeight: "bold", color: "#555" }}>Contact No</label>
          <div style={fieldStyle}>{user.contactNo || "N/A"}</div>
        </div>
        <div>
          <label style={{ fontWeight: "bold", color: "#555" }}>Team Leader</label>
          <div style={fieldStyle}>{user.teamLeader || "N/A"}</div>
        </div>
        <div>
          <label style={{ fontWeight: "bold", color: "#555" }}>Designation</label>
          <div style={fieldStyle}>{user.designation || "N/A"}</div>
        </div>
      </div>
    </div>
  );
};

// Reusable field style
const fieldStyle = {
  marginTop: "5px",
  padding: "10px 12px",
  borderRadius: "8px",
  backgroundColor: "#f5f5f5",
  color: "#333",
};

export default ProfilePage;
