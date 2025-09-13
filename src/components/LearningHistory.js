import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const LearningHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth(); // ✅ token घे

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        console.log("📡 Fetching learning history...");
        const res = await api.get("/user/learning-history", {
          headers: { Authorization: `Bearer ${token}` }, // ✅ token पाठव
        });
        console.log("✅ API Response:", res.data);
        setHistory(res.data);
      } catch (err) {
        console.error("❌ Error fetching history:", err.response?.data || err.message);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchHistory();
    } else {
      console.warn("⚠️ No token available, skipping fetch.");
      setLoading(false);
    }
  }, [token]);

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" sx={{ p: 2 }}>Learning History</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Course</TableCell>
            <TableCell>Lesson</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
            <TableCell>Lesson Status</TableCell>
            <TableCell>Quiz Score</TableCell>
            <TableCell>Quiz Status</TableCell>
            <TableCell>Quiz Date</TableCell> 
          </TableRow>
        </TableHead>
        <TableBody>
          {history.map((h, idx) => (
            <TableRow key={idx}>
              <TableCell>{h.courseTitle}</TableCell>
              <TableCell>{h.lessonTitle}</TableCell>
              <TableCell>{h.lessonStartDate ? new Date(h.lessonStartDate).toLocaleDateString() : "-"}</TableCell>
              <TableCell>{h.lessonEndDate ? new Date(h.lessonEndDate).toLocaleDateString() : "-"}</TableCell>
              <TableCell>{h.lessonStatus}</TableCell>
              <TableCell>{h.quizScore ?? "-"}</TableCell>
              <TableCell>{h.quizStatus ? (h.quizStatus === "pass" ? "✅ Pass" : "❌ Fail") : "-"}</TableCell>
              <TableCell>{h.quizDate ? new Date(h.quizDate).toLocaleString() : "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LearningHistory;
