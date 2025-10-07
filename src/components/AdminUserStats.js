import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

// Gradient colors for cards
const CARD_GRADIENTS = [
  "linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)", // blue
  "linear-gradient(135deg, #66bb6a 0%, #388e3c 100%)", // green
  "linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)", // orange
  "linear-gradient(135deg, #ef5350 0%, #c62828 100%)", // red
];

// Vibrant colors for pie charts
const PIE_COLORS = ["#42a5f5", "#66bb6a", "#ffa726", "#ef5350"];

const AdminDashboardStats = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);

  const [userStats, setUserStats] = useState({ totalUsers: 0, activeUsers: 0, inactiveUsers: 0, lessonAccessUsers: 0 });
  const [lessonStats, setLessonStats] = useState({ totalLessons: 0 });
  const [quizStats, setQuizStats] = useState({ totalUploaded: 0 });
  const [ticketStats, setTicketStats] = useState({ totalTickets: 0, openTickets: 0, closedTickets: 0 });

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogData, setDialogData] = useState([]);

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        const userRes = await api.get("/admin/users", { headers: { Authorization: `Bearer ${token}` } });
        setUserStats(prev => ({
          ...prev,
          totalUsers: userRes.data.totalUsers || 0,
          activeUsers: userRes.data.activeUsers || 0,
          inactiveUsers: userRes.data.inactiveUsers || 0
        }));

        const lessonRes = await api.get("/admin/lessons/stats", { headers: { Authorization: `Bearer ${token}` } });
        setLessonStats({ totalLessons: lessonRes.data.totalLessons || 0 });
        setUserStats(prev => ({ ...prev, lessonAccessUsers: lessonRes.data.lessonAccessUsers || 0 }));

        const quizRes = await api.get("/quiz/admin/summary", { headers: { Authorization: `Bearer ${token}` } });
        setQuizStats({ totalUploaded: quizRes.data.totalUploaded || 0 });

        const ticketRes = await api.get("/tickets/count", { headers: { Authorization: `Bearer ${token}` } });
        setTicketStats({
          totalTickets: ticketRes.data.totalTickets || 0,
          openTickets: ticketRes.data.openTickets || 0,
          closedTickets: ticketRes.data.closedTickets || 0,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchAllStats();
  }, [token]);

  const handleCardClick = async (type) => {
    try {
      setDialogTitle(type);
      setOpenDialog(true);

      let res;
      switch (type) {
        case "Active Users":
          res = await api.get("/admin/users/active", { headers: { Authorization: `Bearer ${token}` } });
          setDialogData(res.data.users || []);
          break;
        case "Inactive Users":
          res = await api.get("/admin/users/inactive", { headers: { Authorization: `Bearer ${token}` } });
          setDialogData(res.data.users || []);
          break;
        case "Lesson Access Users":
          res = await api.get("/admin/users/lesson-access", { headers: { Authorization: `Bearer ${token}` } });
          setDialogData(res.data.users || []);
          break;
        case "Total Attempts":
          res = await api.get("/admin/quiz/attempted", { headers: { Authorization: `Bearer ${token}` } });
          setDialogData(res.data.users || []);
          break;
        case "Total Passed":
          res = await api.get("/admin/quiz/passed", { headers: { Authorization: `Bearer ${token}` } });
          setDialogData(res.data.users || []);
          break;
        case "Total Failed":
          res = await api.get("/admin/quiz/failed", { headers: { Authorization: `Bearer ${token}` } });
          setDialogData(res.data.users || []);
          break;
        case "Open Tickets":
          res = await api.get("/admin/tickets/open", { headers: { Authorization: `Bearer ${token}` } });
          setDialogData(res.data.tickets || []);
          break;
        case "Closed Tickets":
          res = await api.get("/admin/tickets/closed", { headers: { Authorization: `Bearer ${token}` } });
          setDialogData(res.data.tickets || []);
          break;
        default:
          setDialogData([]);
      }
    } catch (err) {
      console.error("Error loading dialog data:", err);
      setDialogData([]);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const renderCard = (index, title, value) => (
    <Card
      sx={{
        borderRadius: 3,
        height: 180,
        width: 270,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        color: "white",
        background: CARD_GRADIENTS[index],
        boxShadow: "0 10px 25px rgba(0,0,0,0.3), 0 6px 10px rgba(0,0,0,0.2)",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "scale(1.08)",
          boxShadow: "0 15px 30px rgba(0,0,0,0.4), 0 10px 15px rgba(0,0,0,0.3)",
        },
      }}
    >
      <CardContent sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: "600", letterSpacing: "0.5px" }}>{title}</Typography>
        <Typography variant="h3" sx={{ fontWeight: "bold", mt: 1 }}>{value}</Typography>
      </CardContent>
    </Card>
  );

  const userPieData = [
    { name: "Active Users", value: userStats.activeUsers },
    { name: "Inactive Users", value: userStats.inactiveUsers },
    { name: "Lesson Access Users", value: userStats.lessonAccessUsers },
  ];

  const ticketPieData = [
    { name: "Open Tickets", value: ticketStats.openTickets },
    { name: "Closed Tickets", value: ticketStats.closedTickets },
  ];

  return (
    <Box p={3} display="flex" flexDirection="column" alignItems="center">
      {/* Top Row: Summary Cards */}
      <Grid container spacing={3} justifyContent="center" mb={4}>
        {renderCard(0, "Total Registered Users", userStats.totalUsers)}
        {renderCard(1, "Total Lessons Uploaded", lessonStats.totalLessons)}
        {renderCard(2, "Total Assessments Uploaded", quizStats.totalUploaded)}
        {renderCard(3, "Total Tickets", ticketStats.totalTickets)}
      </Grid>

      {/* Pie Charts */}
      <Grid container spacing={4} justifyContent="center" sx={{ maxWidth: 1500 }}>
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              width: 510,
              height: 400,
              p: 2,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              transition: "transform 0.3s",
              background: "transparent",
              "&:hover": { transform: "scale(1.03)" },
            }}
            onClick={() => handleCardClick("Active Users")}
          >
            <Typography variant="h6" textAlign="center" mb={2}>
              User Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={userPieData} dataKey="value" nameKey="name" outerRadius={110} label>
                  {userPieData.map((entry, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card
            sx={{
              width: 510,
              height: 400,
              p: 2,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              background: "transparent",
              transition: "transform 0.3s",
              "&:hover": { transform: "scale(1.03)" },
            }}
            onClick={() => handleCardClick("Open Tickets")}
          >
            <Typography variant="h6" textAlign="center" mb={2}>
              Ticket Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={ticketPieData} dataKey="value" nameKey="name" outerRadius={110} label>
                  {ticketPieData.map((entry, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog Box */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent dividers>
          {dialogData.length > 0 ? (
            <List>
              {dialogData.map((item, index) => (
                <ListItem key={item._id || index}>
                  <ListItemText
                    primary={item.fullName || `Record ${index + 1}`}
                    secondary={
                      item.email
                        ? `${item.email} — ${item.isBlocked ? "Inactive" : "Active"}`
                        : item.status || ""
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No data available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboardStats;
