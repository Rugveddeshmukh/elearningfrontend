import React, { useEffect, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const LESSON_COLORS = ["#21925b", "#eac049 ", "#e42718"];
const QUIZ_COLORS = ["#21925b", "#e42718", "#eac049"];

const UserLessonStats = () => {
  const { token } = useAuth();

  const [lessonStats, setLessonStats] = useState({
    completed: 0,
    "in-progress": 0,
    "not-started": 0,
  });

  const [quizStats, setQuizStats] = useState({ pass: 0, fail: 0, pending: 0 });
  

  useEffect(() => {
    const fetchLessonStats = async () => {
      try {
        const res = await api.get("/course");
        let lessonsStatus = { completed: 0, "in-progress": 0, "not-started": 0 };

        for (const course of res.data) {
          const lessonRes = await api.get(`/lesson/${course._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          lessonRes.data.forEach((lesson) => {
            lessonsStatus[lesson.userStatus] =
              (lessonsStatus[lesson.userStatus] || 0) + 1;
          });
        }

        setLessonStats(lessonsStatus);
      } catch (err) {
        console.error("Error fetching lesson stats:", err);
      }
    };

    const fetchQuizStats = async () => {
      try {
        const res = await api.get("/quiz/user/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuizStats(res.data);
      } catch (err) {
        console.error("Error fetching quiz stats:", err);
      }
    };

    fetchLessonStats();
    fetchQuizStats();
  }, [token]);

  const lessonPieData = [
    { name: "Completed", value: lessonStats.completed },
    { name: "In Progress", value: lessonStats["in-progress"] },
    { name: "Not Started", value: lessonStats["not-started"] },
  ];

  const quizPieData = [
    { name: "Pass", value: quizStats.pass },
    { name: "Fail", value: quizStats.fail },
    { name: "Pending", value: quizStats.pending },
  ];

  return (
    <Box p={3} display="flex" justifyContent="center" gap={4} flexWrap="wrap">
      {/* Left: My Learning Progress */}
      <Box textAlign="center">
        <Typography variant="h6" gutterBottom>
          📊 My Learning Progress
        </Typography>
        <Paper
          elevation={3}
          sx={{ p: 2, display: "flex", justifyContent: "center", width: 500 ,borderRadius: "15px",}}
        >
          <PieChart width={300} height={300}>
            <Pie
              data={lessonPieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {lessonPieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={LESSON_COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </Paper>
      </Box>

      {/* Right: My Assessment Performance */}
      <Box textAlign="center">
        <Typography variant="h6" gutterBottom>
          📊 My Assessment Progress
        </Typography>
        <Paper
          elevation={3}
          sx={{ p: 2, display: "flex", justifyContent: "center", width: 500,borderRadius: "15px", }}
        >
          <PieChart width={300} height={300}>
            <Pie
              data={quizPieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {quizPieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={QUIZ_COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </Paper>
      </Box>
    </Box>
  );
};

export default UserLessonStats;
