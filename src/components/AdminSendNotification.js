import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  CircularProgress,
  Checkbox,
  ListItemText,
  Paper,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const AdminNotificationsPage = () => {
  const { token } = useAuth();

  const [form, setForm] = useState({
    userId: ["all"],
    teamLeader: "all",
    designation: "all",
    title: "",
    message: "",
    type: "course",
  });

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [designations, setDesignations] = useState([]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Get Notifications Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await api.get("/admin/all-users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allUsers = Array.isArray(res.data) ? res.data : res.data.users || [];
      setUsers(allUsers);
      setTeamLeaders([...new Set(allUsers.map((u) => u.teamLeader).filter(Boolean))]);
      setDesignations([...new Set(allUsers.map((u) => u.designation).filter(Boolean))]);
    } catch (err) {
      console.error("Get Users Error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUserData();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchTL = form.teamLeader === "all" || u.teamLeader === form.teamLeader;
    const matchDes = form.designation === "all" || u.designation === form.designation;
    return matchTL && matchDes;
  });

  const handleSubmit = async () => {
    try {
      const payload = {
        targetType: form.userId.includes("all") ? "all" : "users",
        targetValue: form.userId.includes("all") ? null : form.userId,
        title: form.title,
        message: form.message,
        type: form.type,
      };

      await api.post("/notifications/send", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Notification sent successfully");

      setForm({
        userId: ["all"],
        teamLeader: "all",
        designation: "all",
        title: "",
        message: "",
        type: "course",
      });

      fetchNotifications();
    } catch (err) {
      console.error("Error sending notification:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;

    try {
      await api.delete(`/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Delete Notification Error:", err);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 4,
        bgcolor: "#f9f9f9",
        minHeight: "100vh",
      }}
    >
      {/* Send Notification Card */}
      <Paper
        sx={{
          p: 4,
          width: { xs: "95%", sm: "700px" },
          borderRadius: 3,
          boxShadow: 4,
          mb: 5,
          textAlign: "center",
        }}
      >
        <Typography
          variant="h5"
          sx={{ color: "#003366", fontWeight: "bold", mb: 3 }}
        >
          Send Notification
        </Typography>

        <TextField
          select
          label="Team Leader"
          fullWidth
          margin="normal"
          value={form.teamLeader}
          onChange={(e) => setForm({ ...form, teamLeader: e.target.value })}
        >
          <MenuItem value="all">All Team Leaders</MenuItem>
          {teamLeaders.map((tl, idx) => (
            <MenuItem key={idx} value={tl}>
              {tl}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Designation"
          fullWidth
          margin="normal"
          value={form.designation}
          onChange={(e) => setForm({ ...form, designation: e.target.value })}
        >
          <MenuItem value="all">All Designations</MenuItem>
          {designations.map((d, idx) => (
            <MenuItem key={idx} value={d}>
              {d}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Select Users"
          fullWidth
          margin="normal"
          SelectProps={{
            multiple: true,
            renderValue: (selected) =>
              selected.includes("all")
                ? "Select All"
                : users
                    .filter((u) => selected.includes(u._id))
                    .map((u) => `${u.fullName} (${u.employeeId})`)
                    .join(", "),
          }}
          value={form.userId}
          onChange={(e) => {
            let value = e.target.value;
            if (value.includes("all")) {
              value = ["all"];
            }
            setForm({ ...form, userId: value });
          }}
        >
          <MenuItem value="all">
            <Checkbox checked={form.userId.includes("all")} />
            <ListItemText primary="Select All" />
          </MenuItem>
          {filteredUsers.map((u) => (
            <MenuItem key={u._id} value={u._id}>
              <Checkbox checked={form.userId.includes(u._id)} />
              <ListItemText primary={`${u.fullName} (${u.employeeId})`} />
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <TextField
          label="Message"
          fullWidth
          margin="normal"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
        <TextField
          select
          label="Type"
          fullWidth
          margin="normal"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <MenuItem value="course">Course Update</MenuItem>
          <MenuItem value="result">Result Declared</MenuItem>
          <MenuItem value="certificate">Certificate Available</MenuItem>
          <MenuItem value="general">General</MenuItem>
        </TextField>

        <Button
          variant="contained"
          sx={{
            mt: 3,
            bgcolor: "#003366",
            "&:hover": { bgcolor: "#002244" },
            textTransform: "none",
          }}
          onClick={handleSubmit}
        >
          Send Notification
        </Button>
      </Paper>

      {/* Notifications Table */}
      <Paper
        sx={{
          p: 3,
          width: { xs: "95%", md: "95%" },
          borderRadius: 3,
          boxShadow: 4,
          overflowX: "auto",
        }}
      >
        <Typography
          variant="h5"
          sx={{ color: "#003366", fontWeight: "bold", textAlign: "center", mb: 3 }}
        >
          All Notifications
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table
           sx={{
              borderCollapse: "collapse",
              width: "100%",
              "& th, & td": {
              border: "1px solid #cfd8dc",
              padding: "8px 10px",
              textAlign: "center",
              fontSize: "14px",
            },
              "& th": {
              backgroundColor: "#f1f5f9",
              fontWeight: "bold",
              color: "#003366",
             },
            "& tr:nth-of-type(even)": {
            backgroundColor: "#f9fafb",
           },
          "& tr:hover": {
           backgroundColor: "#e8f0fe",
         },
         }}
          >
            <TableHead >
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Team Leader</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications.map((n) => (
                <TableRow key={n._id}>
                  <TableCell>{n.title}</TableCell>
                  <TableCell>{n.message}</TableCell>
                  <TableCell>{n.type}</TableCell>
                  <TableCell>{n.userId ? n.userId.fullName : "All Users"}</TableCell>
                  <TableCell>{n.userId?.teamLeader || "All Team Leaders"}</TableCell>
                  <TableCell>{n.userId?.designation || "All Designations"}</TableCell>
                  <TableCell>{new Date(n.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <IconButton color="error" onClick={() => handleDelete(n._id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
};

export default AdminNotificationsPage;
