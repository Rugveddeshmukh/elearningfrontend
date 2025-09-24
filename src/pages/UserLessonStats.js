import React, { useEffect, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const COLORS = ["#4caf50", "#ff9800", "#f44336"]; 

const UserLessonStats = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({ completed: 0, "in-progress": 0, "not-started": 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/course"); // get all courses
        let lessonsStatus = { completed: 0, "in-progress": 0, "not-started": 0 };

        // for each course → fetch lessons with userStatus
        for (const course of res.data) {
          const lessonRes = await api.get(`/lesson/${course._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          lessonRes.data.forEach((lesson) => {
            lessonsStatus[lesson.userStatus] = (lessonsStatus[lesson.userStatus] || 0) + 1;
          });
        }

        setStats(lessonsStatus);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, [token]);

  const pieData = [
    { name: "Completed", value: stats.completed },
    { name: "In Progress", value: stats["in-progress"] },
    { name: "Not Started", value: stats["not-started"] },
  ];

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        📊 My Learning Progress
      </Typography>

      <Box display="flex" flexWrap="wrap" gap={4}>
        {/* Pie Chart */}
        {/* <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="subtitle1" align="center">
            Lessons Distribution (Pie Chart)
          </Typography>
          <PieChart width={350} height={300}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </Paper> 

        {/* Bar Chart */}
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="subtitle1" align="center">
            Lessons Distribution (Bar Chart)
          </Typography>
          <BarChart width={400} height={300} data={pieData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#1976d2" />
          </BarChart>
        </Paper>
      </Box>
    </Box>
  );
};

export default UserLessonStats;
