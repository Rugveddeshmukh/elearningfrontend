import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

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
    <div style={{ maxWidth: "500px", margin: "50px auto", fontFamily: "Arial" }}>
      <h2> Profile</h2>
      <div>
        <strong>Full Name:</strong> {user.fullName}
      </div>
      <div>
        <strong>Email:</strong> {user.email}
      </div>
      <div>
        <strong>Date of Birth:</strong>{" "}
        {new Date(user.dateOfBirth).toLocaleDateString()}
      </div>
      <div>
        <strong>Account Created:</strong>{" "}
        {new Date(user.createdAt).toLocaleString()}
      </div>
    </div>
  );
};

export default ProfilePage;
