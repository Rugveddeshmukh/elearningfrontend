// components/UserList.js
import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  Delete,
  Edit,
  History,
} from "@mui/icons-material";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const { token } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/all-users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleDelete = async (userId) => {
    await api.delete(`/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
  };

  const handleViewLoginHistory = (history) => {
    setLoginHistory(history);
    setOpenHistoryDialog(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Paper sx={{ p: 4, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Registered User List
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>DOB</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{new Date(user.dateOfBirth).toLocaleDateString()}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell align="center">
                  <Tooltip title="View Login History">
                    <IconButton onClick={() => handleViewLoginHistory(user.loginHistory)}>
                      <History />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton color="primary">
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(user._id)} color="error">
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Login History Modal */}
      <Dialog
        open={openHistoryDialog}
        onClose={() => setOpenHistoryDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>User Login History</DialogTitle>
        <DialogContent>
          {loginHistory.length > 0 ? (
            <List>
              {loginHistory.map((entry, i) => (
                <ListItem key={i}>
                  <ListItemText
                    primary={`Device: ${entry.device || "Unknown"}`}
                    secondary={`IP: ${entry.ip || "N/A"} | Time: ${new Date(entry.timestamp).toLocaleString()}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No login history found.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistoryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UserList;
