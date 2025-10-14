import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Pagination,
  CircularProgress,
} from "@mui/material";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const LearningHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const logsPerPage = 10;
  const { token } = useAuth();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        console.log("📡 Fetching learning history...");
        const res = await api.get("/user/learning-history", {
          headers: { Authorization: `Bearer ${token}` },
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

    if (token) fetchHistory();
    else setLoading(false);
  }, [token]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  // Pagination calculation
  const indexOfLastLog = page * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = history.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(history.length / logsPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Box maxWidth="1200px" mx="auto" mt={0}>
      <Typography
        variant="h6"
        fontSize={25}
        mb={2}
        fontWeight={"bold"}
        textAlign="center"
      >
        Learning History
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
            <TableRow>
              {[
                "Course",
                "Lesson",
                "Start Date",
                "End Date",
                "Lesson Status",
                "Quiz Score",
                "Quiz Status",
                "Quiz Date",
                "My Attempts", // ✅ New Column Added
              ].map((header) => (
                <TableCell
                  key={header}
                  sx={{
                    fontWeight: "bold",
                    textAlign: "center",
                    border: "1px solid #ccc",
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {currentLogs.map((h, idx) => (
              <TableRow
                key={idx}
                sx={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#f9f9f9" }}
              >
                <TableCell sx={{ border: "1px solid #ccc", textAlign: "center" }}>
                  {h.courseTitle}
                </TableCell>
                <TableCell sx={{ border: "1px solid #ccc", textAlign: "center" }}>
                  {h.lessonTitle}
                </TableCell>
                <TableCell sx={{ border: "1px solid #ccc", textAlign: "center" }}>
                  {h.lessonStartDate
                    ? new Date(h.lessonStartDate).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell sx={{ border: "1px solid #ccc", textAlign: "center" }}>
                  {h.lessonEndDate
                    ? new Date(h.lessonEndDate).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell sx={{ border: "1px solid #ccc", textAlign: "center" }}>
                  {h.lessonStatus}
                </TableCell>
                <TableCell sx={{ border: "1px solid #ccc", textAlign: "center" }}>
                  {h.quizScore ?? "-"}
                </TableCell>
                <TableCell sx={{ border: "1px solid #ccc", textAlign: "center" }}>
                  {h.quizStatus
                    ? h.quizStatus === "pass"
                      ? "✅ Pass"
                      : "❌ Fail"
                    : "-"}
                </TableCell>
                <TableCell sx={{ border: "1px solid #ccc", textAlign: "center" }}>
                  {h.quizDate ? new Date(h.quizDate).toLocaleString() : "-"}
                </TableCell>
                <TableCell sx={{ border: "1px solid #ccc", textAlign: "center" }}>
                  {h.totalAttempts ?? 0}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Showing X-Y of Z + Pagination */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={0}
        sx={{
          border: "1px solid #ccc",
          backgroundColor: "#fff",
          padding: "8px 16px",
          borderRadius: "4px",
        }}
      >
        <Typography>
          Showing{" "}
          {history.length === 0 ? 0 : indexOfFirstLog + 1}-
          {Math.min(indexOfLastLog, history.length)}
        </Typography>

        {totalPages > 1 && (
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        )}
      </Box>
    </Box>
  );
};

export default LearningHistory;
