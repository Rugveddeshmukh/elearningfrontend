import React, { useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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

  const { login } = useAuth();
  const navigate = useNavigate();

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
        navigate(
          res.data.user.role === "admin"
            ? "/admin/dashboard"
            : "/user/dashboard"
        );
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

  const styles = {
    container: {
      maxWidth: "420px",
      margin: "60px auto",
      padding: "30px",
      border: "1px solid #ddd",
      borderRadius: "12px",
      boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
      fontFamily: "Arial, sans-serif",
      background: "#fff",
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
      <h2 style={styles.heading}>{isLogin ? "Login" : "Sign Up"}</h2>

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            {/* Employee ID */}
            <input
              name="employeeId"
              placeholder="Employee ID"
              onChange={handleChange}
              style={styles.input}
              value={form.employeeId}
            />

            {/* Full Name */}
            <input
              name="fullName"
              placeholder="Full Name"
              onChange={handleChange}
              style={styles.input}
              value={form.fullName}
            />

            {/* Contact No */}
            <input
              name="contactNo"
              placeholder="Contact No"
              onChange={handleChange}
              style={styles.input}
              value={form.contactNo}
            />

            {/* Team Leader (dropdown – फक्त user साठी) */}
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

            {/* Designation (dropdown – फक्त user साठी) */}
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

        {/* Email */}
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          style={styles.input}
          value={form.email}
        />

        {/* Password */}
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          style={styles.input}
          value={form.password}
        />

        {/* Submit button */}
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
  );
};

export default AuthPage;
