import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import backgroundImg from "../Assest/woman-holding-chalkboard-with.jpg";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    employeeId: "",
    fullName: "",
    email: "",
    password: "",
    contactNo: "",
    teamLeader: "",
    designation: "",
  });

  const { login, token, user } = useAuth();
  const navigate = useNavigate();

  // 🔐 जर user आधीच logged-in असेल तर लगेच dashboard वर redirect करा
  useEffect(() => {
    if (token && user) {
      const dashboardPath =
        user.role === "admin" ? "/admin/dashboard" : "/user/dashboard";
      navigate(dashboardPath, { replace: true }); // history replace करतो → back button login वर जाणार नाही
    }
  }, [token, user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await api.post("/auth/login", {
          email: form.email,
          password: form.password,
        });

        login(res.data.token);

        startAutoPing(res.data.token);

        const dashboardPath =
          res.data.user.role === "admin"
            ? "/admin/dashboard"
            : "/user/dashboard";

        navigate(dashboardPath, { replace: true }); 
      } else {
        await api.post("/auth/register", form);
        alert("Signup successful! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        const code = err.response.data.code;
        if (code === "PENDING_APPROVAL") {
          alert("Your account is pending admin approval. Please wait.");
        } else if (code === "ACCOUNT_INACTIVE") {
          alert("Your account is inactive. Please contact admin.");
        } else {
          alert("Access denied. Please contact admin.");
        }
      } else {
        alert(err.response?.data?.message || "Something went wrong");
      }
    }
  };

  const startAutoPing = (userToken) => {
    if (window.userPingInterval) clearInterval(window.userPingInterval);

    const interval = setInterval(async () => {
      try {
        await api.post(
          "/auth/ping",
          {},
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
      } catch {
        console.log("Ping failed");
      }
    }, 30000);

    window.userPingInterval = interval;
  };

  useEffect(() => {
    const handleUnload = async () => {
      try {
        if (token) {
          await api.post(
            "/auth/logout",
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        if (window.userPingInterval) clearInterval(window.userPingInterval);
      } catch {
        console.log("Logout on tab close failed");
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [token]);

  // 🧭 Styles
  const styles = {
    container: {
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Arial, sans-serif",
      backgroundImage: `url(${backgroundImg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      overflow: "hidden",
    },
    formBox: {
      maxWidth: "420px",
      width: "100%",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
      background: "rgba(255,255,255,0.95)",
    },
    heading: {
      fontSize: "22px",
      fontWeight: "600",
      marginBottom: "20px",
      textAlign: "center",
      color: "#333",
    },
    input: {
      width: "95%",
      padding: "12px",
      marginBottom: "15px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      fontSize: "14px",
      outline: "none",
    },
    button: {
      width: "100%",
      padding: "12px",
      background: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "0.3s",
    },
    toggleText: {
      marginTop: "15px",
      fontSize: "14px",
      textAlign: "center",
      color: "#555",
    },
    link: {
      color: "#2563eb",
      cursor: "pointer",
      fontWeight: "500",
      textDecoration: "underline",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h2 style={styles.heading}>{isLogin ? "Login" : "Sign Up"}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                name="employeeId"
                placeholder="Employee ID"
                onChange={handleChange}
                style={styles.input}
                value={form.employeeId}
              />
              <input
                name="fullName"
                placeholder="Full Name"
                onChange={handleChange}
                style={styles.input}
                value={form.fullName}
              />
              <input
                name="contactNo"
                placeholder="Contact No"
                onChange={handleChange}
                style={styles.input}
                value={form.contactNo}
              />
              <select
                name="teamLeader"
                onChange={handleChange}
                style={styles.input}
                value={form.teamLeader}
              >
                <option value="">Select Team Leader</option>
                <option value="TL1">Team Leader 1</option>
                <option value="TL2">Team Leader 2</option>
                <option value="TL3">Team Leader 3</option>
              </select>
              <select
                name="designation"
                onChange={handleChange}
                style={styles.input}
                value={form.designation}
              >
                <option value="">Select Designation</option>
                <option value="Developer">Developer</option>
                <option value="Tester">Tester</option>
                <option value="Manager">Manager</option>
                <option value="Support">Support</option>
              </select>
            </>
          )}

          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            style={styles.input}
            value={form.email}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            style={styles.input}
            value={form.password}
          />

          <button type="submit" style={styles.button}>
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p style={styles.toggleText}>
          {isLogin ? "New user?" : "Already have an account?"}{" "}
          <span style={styles.link} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Create an account" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
