// src/components/UserQuizStats.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const COLORS = ["#2ecc71", "#e74c3c", "#f39c12"];

const UserQuizStats = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pass: 0, fail: 0, pending: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/quiz/user/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching quiz stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  const pieData = [
    { name: "Pass", value: stats.pass },
    { name: "Fail", value: stats.fail },
    { name: "Pending", value: stats.pending },
  ];

  const barData = [
    {
      name: "Quizzes",
      Pass: stats.pass,
      Fail: stats.fail,
      Pending: stats.pending,
    },
  ];

  return (
    <Box p={3} display="flex" justifyContent="left">
      <Card sx={{ width: "100%", maxWidth: 600, boxShadow: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#34495e" }}
          >
            📊 Your Quiz Performance
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {/* Chart Section */}
          <Box display="flex" flexDirection="column" alignItems="center" gap={4}>
            {/* Pie Chart (commented for now) */}
            {/* <Box sx={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                 <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart> 
              </ResponsiveContainer>
            </Box> */}

            {/* Bar Chart (Active) */}
            <Box sx={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Pass" fill="#2ecc71" />
                  <Bar dataKey="Fail" fill="#e74c3c" />
                  <Bar dataKey="Pending" fill="#f39c12" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserQuizStats;
