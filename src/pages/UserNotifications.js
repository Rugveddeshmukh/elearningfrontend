// src/components/UserNotifications.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Badge,
  IconButton,
  CircularProgress,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const UserNotifications = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data);
      } catch (err) {
        console.error("Error fetching notifications", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [token]);

  if (loading) return <CircularProgress />;

  // Count of unread notifications
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Handle marking a notification as read
  const handleRead = async (id) => {
    try {
      // Update local state immediately
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );

      // Update backend
      await api.put(`/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  return (
    <Box>
      {/* Notification Icon with numeric badge */}
      <Typography variant="h6" gutterBottom>
        <IconButton>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        Recent Alerts
      </Typography>

      <List>
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <ListItem
              key={n._id}
              button
              onClick={() => handleRead(n._id)}
              sx={{ backgroundColor: n.isRead ? "transparent" : "#e3f2fd" }}
            >
              <ListItemText
                primary={n.title}
                secondary={`${n.message} • ${new Date(n.createdAt).toLocaleString()}`}
              />
            </ListItem>
          ))
        ) : (
          <Typography>No notifications yet.</Typography>
        )}
      </List>
    </Box>
  );
};

export default UserNotifications;
