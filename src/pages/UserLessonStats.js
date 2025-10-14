import React, { useEffect, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const LESSON_COLORS = ["#00C49F", "#FFBB28", "#FF4444"]; // Green, Yellow, Red
const QUIZ_COLORS = ["#00C49F", "#FF4444", "#8884D8"];   // Green, Red, Purple

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
    <Box
      sx={{
        minHeight: "80vh", 
        p: 2,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 5,
        flexWrap: "wrap",
        borderRadius:'15px',
       
      }}
    >
      {/* Left Card: Learning Progress */}
      <Paper
        elevation={2}
        sx={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          p: 3,
          borderRadius: "10px",
          width: 400,
          color: "#fff",
          textAlign: "center",
          boxShadow: "0 px 20px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "linear-gradient(180deg, #001F3F 0%, #002B5B 100%)",
        }}
      >
        <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: "#fff" }}>
          My Learning Progress
        </Typography>

        <Box display="flex" justifyContent="center">
          <PieChart width={250} height={250}>
            <Pie
              data={lessonPieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              label
            >
              {lessonPieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={LESSON_COLORS[index]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{  color: "#fff" }} />
          </PieChart>
        </Box>

        <Box mt={1} display="flex" gap={2} justifyContent="center">
          <Typography variant="body2" sx={{ color: LESSON_COLORS[0] }}>
            ✅ Completed: {lessonStats.completed}
          </Typography>
          <Typography variant="body2" sx={{ color: LESSON_COLORS[1] }}>
            🔄 In Progress: {lessonStats["in-progress"]}
          </Typography>
          <Typography variant="body2" sx={{ color: LESSON_COLORS[2] }}>
            ⏸️ Not Started: {lessonStats["not-started"]}
          </Typography>
        </Box>
      </Paper>

      {/* Right Card: Assessment Progress */}
      <Paper
        elevation={2}
        sx={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          p: 3,
          borderRadius: "10px",
          width: 400,
          color: "#fff",
          textAlign: "center",
          boxShadow: "0 px 20px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "linear-gradient(180deg, #001F3F 0%, #002B5B 100%)",
        }}
      >
        <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: "#fff" }}>
          My Assessment Progress
        </Typography>

        <Box display="flex" justifyContent="center" mb={1}>
          <PieChart width={250} height={250}>
            <Pie
              data={quizPieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              label
            >
              {quizPieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={QUIZ_COLORS[index]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{  color: "#fff" }} />
          </PieChart>
        </Box>

        <Box mt={1} display="flex" gap={2} justifyContent="center">
          <Typography variant="body2" sx={{ color: QUIZ_COLORS[0] }}>
            ✅ Pass: {quizStats.pass}
          </Typography>
          <Typography variant="body2" sx={{ color: QUIZ_COLORS[1] }}>
            ❌ Fail: {quizStats.fail}
          </Typography>
          <Typography variant="body2" sx={{ color: QUIZ_COLORS[2] }}>
            ⏳ Pending: {quizStats.pending}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default UserLessonStats;
