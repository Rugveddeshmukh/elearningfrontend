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
  Button,
  Box,
  TextField,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const { token } = useAuth();

  // Date range filters
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-12-31");

  // Fetch users from backend with date filter
  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/all-users", {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate, endDate },
      });
      setUsers(res.data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // Delete user
  const handleDelete = async (userId) => {
    await api.delete(`/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
  };

  // Approve user
  const handleApprove = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("Error approving user:", err);
    }
  };

  // Toggle active/inactive status
  const handleToggleStatus = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("Error toggling user status:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [startDate, endDate]);

  return (
    <Paper sx={{ p: 2.1, mt: 1, overflowX: "auto" }}>
      {/* Title - Center Aligned */}
      <Box display="flex" justifyContent="center" mb={0}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "#003366",
            textAlign: "center",
          }}
        >
          User List
        </Typography>
      </Box>

      {/* Date Filter Section */}
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={1} gap={2}>
        <TextField
          type="date"
          label="Start Date"
          size="small"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <TextField
          type="date"
          label="End Date"
          size="small"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <Button variant="contained" onClick={fetchUsers}>
          Filter
        </Button>
      </Box>

      {/* User Table */}
      <TableContainer>
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
          <TableHead>
            <TableRow>
              {[
                "Employee ID",
                "Full Name",
                "Email",
                "Contact No",
                "Team Leader",
                "Designation",
                "Approval",
                "Active/Inactive",
                "Approve Date",
                "Last Login",
                "Actions",
              ].map((header) => (
                <TableCell key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} sx={{ textAlign: "center", border: "1px solid #ccc" }}>
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const lastLogin =
                  user.loginHistory && user.loginHistory.length > 0
                    ? `${new Date(
                        user.loginHistory[user.loginHistory.length - 1].timestamp
                      ).toLocaleString()} | Device: ${
                        user.loginHistory[user.loginHistory.length - 1].deviceType || "Unknown"
                      } | IP: ${user.loginHistory[user.loginHistory.length - 1].ip || "N/A"}`
                    : "N/A";

                return (
                  <TableRow key={user._id}>
                    {[
                      user.employeeId,
                      user.fullName,
                      user.email,
                      user.contactNo,
                      user.teamLeader,
                      user.designation,
                      <Button
                        variant="contained"
                        onClick={() => handleApprove(user._id)}
                        disabled={user.isApproved}
                        sx={{
                          backgroundColor: user.isApproved ? "gray" : "green",
                          "&:hover": { backgroundColor: user.isApproved ? "gray" : "green" },
                        }}
                      >
                        {user.isApproved ? "Approved" : "Approve"}
                      </Button>,
                      <Button
                        variant="contained"
                        onClick={() => handleToggleStatus(user._id)}
                        sx={{
                          backgroundColor: user.isBlocked ? "red" : "blue",
                          "&:hover": { backgroundColor: user.isBlocked ? "red" : "blue" },
                        }}
                      >
                        {user.isBlocked ? "Inactive" : "Active"}
                      </Button>,
                      user.isApproved && user.approvedAt
                        ? new Date(user.approvedAt).toLocaleDateString()
                        : "Pending",
                      lastLogin,
                      <IconButton onClick={() => handleDelete(user._id)} color="error">
                        <Delete />
                      </IconButton>,
                    ].map((cell, index) => (
                      <TableCell key={index}>{cell}</TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default UserList;
