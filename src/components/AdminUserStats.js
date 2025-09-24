import React, { useEffect, useState } from "react";
import { Box, Grid, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const AdminDashboardStats = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);

  const [userStats, setUserStats] = useState({ totalUsers: 0, activeUsers: 0, inactiveUsers: 0 });
  const [lessonStats, setLessonStats] = useState({ totalLessons: 0, lessonAccessUsers: 0 });
  const [quizStats, setQuizStats] = useState({ totalUploaded: 0, totalAttempts: 0, passed: 0, failed: 0 });
  const [ticketStats, setTicketStats] = useState({ totalTickets: 0, openTickets: 0, closedTickets: 0 });

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        // Users stats
        const userRes = await api.get("/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserStats(userRes.data || { totalUsers: 0, activeUsers: 0, inactiveUsers: 0 });

        // Lessons stats
        const lessonRes = await api.get("/admin/lessons/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLessonStats(lessonRes.data || { totalLessons: 0, lessonAccessUsers: 0 });

        // Quiz stats
        const quizRes = await api.get("/quiz/admin/summary", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuizStats(quizRes.data || { totalUploaded: 0, totalAttempts: 0, passed: 0, failed: 0 });

        // Tickets stats
        const ticketRes = await api.get("/tickets/count", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTicketStats(ticketRes.data || { totalTickets: 0, openTickets: 0, closedTickets: 0 });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchAllStats();
  }, [token]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Grid container spacing={2}>
        {/* Users */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "#1976d2", color: "white", borderRadius: 3, height: 150, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6">Total Registered Users</Typography>
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>{userStats.totalUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "#2e7d32", color: "white", borderRadius: 3, height: 150, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6">Active Users</Typography>
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>{userStats.activeUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "#d32f2f", color: "white", borderRadius: 3, height: 150, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6">Inactive Users</Typography>
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>{userStats.inactiveUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Lessons */}
        <Grid item xs={12} sm={6}>
          <Card sx={{ bgcolor: "#1976d2", color: "white", borderRadius: 3, height: 150, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6">Total Lessons Uploaded</Typography>
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>{lessonStats.totalLessons}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ bgcolor: "#2e7d32", color: "white", borderRadius: 3, height: 150, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6">Lesson Access Users</Typography>
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>{lessonStats.lessonAccessUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Quizzes */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "#1976d2", color: "white", borderRadius: 3, height: 150, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6">Total Assessments Uploaded</Typography>
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>{quizStats.totalUploaded}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "#2e7d32", color: "white", borderRadius: 3, height: 150, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6">Total Assessments Attempted</Typography>
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>{quizStats.totalAttempts}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "#2e7d32", color: "white", borderRadius: 3, height: 150, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6">Total Passed</Typography>
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>{quizStats.passed}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "#d32f2f", color: "white", borderRadius: 3, height: 150, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6">Total Failed</Typography>
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>{quizStats.failed}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Tickets */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "#1976d2", color: "white", borderRadius: 3, height: 150, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6">Total Tickets</Typography>
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>{ticketStats.totalTickets}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "#2e7d32", color: "white", borderRadius: 3, height: 150, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6">Open Tickets</Typography>
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>{ticketStats.openTickets}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "#d32f2f", color: "white", borderRadius: 3, height: 150, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6">Closed Tickets</Typography>
              <Typography variant="h3" sx={{ fontWeight: "bold" }}>{ticketStats.closedTickets}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardStats;
