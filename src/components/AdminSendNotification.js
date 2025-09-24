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
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const AdminNotificationsPage = () => {
  const { token } = useAuth();

  const [form, setForm] = useState({
    userId: "all", // "all" for all users or specific user._id
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

  // Fetch all notifications for admin
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

  // Fetch all users for dropdowns
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

  // Auto-fill Team Leader & Designation on user select
  useEffect(() => {
    if (form.userId === "all") {
      setForm((prev) => ({ ...prev, teamLeader: "all", designation: "all" }));
    } else {
      const selectedUser = users.find((u) => u._id === form.userId);
      if (selectedUser) {
        setForm((prev) => ({
          ...prev,
          teamLeader: selectedUser.teamLeader || "",
          designation: selectedUser.designation || "",
        }));
      }
    }
  }, [form.userId, users]);

  // Send Notification
  const handleSubmit = async () => {
    try {
      const payload = {
        targetType: form.userId === "all" ? "all" : "user",
        targetValue: form.userId === "all" ? null : form.userId,
        teamLeader: form.teamLeader,
        designation: form.designation,
        title: form.title,
        message: form.message,
        type: form.type,
      };

      await api.post("/notifications/send", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Notification sent successfully");

      setForm({
        userId: "all",
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

  // Delete Notification
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
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Send Notification
      </Typography>

      {/* User Dropdown */}
      <TextField
        select
        label="Select User"
        fullWidth
        margin="normal"
        value={form.userId}
        onChange={(e) => setForm({ ...form, userId: e.target.value })}
      >
        <MenuItem value="all">All Users</MenuItem>
        {users.map((u) => (
          <MenuItem key={u._id} value={u._id}>
            {u.fullName} ({u.employeeId})
          </MenuItem>
        ))}
      </TextField>

      {/* Team Leader Dropdown */}
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

      {/* Designation Dropdown */}
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

      {/* Title */}
      <TextField
        label="Title"
        fullWidth
        margin="normal"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      {/* Message */}
      <TextField
        label="Message"
        fullWidth
        margin="normal"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
      />

      {/* Type */}
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

      <Button variant="contained" sx={{ mt: 2, mb: 4 }} onClick={handleSubmit}>
        Send
      </Button>

      {/* Notifications Table */}
      <Typography variant="h6" gutterBottom>
        All Notifications
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Table>
          <TableHead>
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
                <TableCell>{n.userId?.teamLeader || n.teamLeader || "-"}</TableCell>
                <TableCell>{n.userId?.designation || n.designation || "-"}</TableCell>
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
    </Box>
  );
};

export default AdminNotificationsPage;
