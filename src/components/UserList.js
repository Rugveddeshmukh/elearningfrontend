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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const { token } = useAuth();

  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-12-31");
  const [searchTerm, setSearchTerm] = useState("");

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Edit dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    contactNo: "",
    designation: "",
    teamLeader: "",
  });

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

  useEffect(() => {
    fetchUsers();
  }, [startDate, endDate]);

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/admin/users/${userToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

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

  const handleEditOpen = (user) => {
    setUserToEdit(user);
    setEditForm({
      fullName: user.fullName || "",
      email: user.email || "",
      contactNo: user.contactNo || "",
      designation: user.designation || "",
      teamLeader: user.teamLeader || "",
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    try {
      await api.put(
        `/admin/users/${userToEdit._id}/edit`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditDialogOpen(false);
      setUserToEdit(null);
      fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Paper sx={{ p: 2.1, mt: 1, overflowX: "auto" }}>
      {/* Title */}
      <Box display="flex" justifyContent="center" mb={0}>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: "#003366", textAlign: "center" }}
        >
          User List
        </Typography>
      </Box>

      {/* Search + Date Filter Section */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
        gap={2}
        flexWrap="wrap"
      >
        <TextField
          type="text"
          label="Search by Name"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 200 }}
        />

        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <TextField
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Button variant="contained" onClick={fetchUsers}>
            Filter
          </Button>
        </Box>
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
            "& th": { backgroundColor: "#f1f5f9", fontWeight: "bold", color: "#003366" },
            "& tr:nth-of-type(even)": { backgroundColor: "#f9fafb" },
            "& tr:hover": { backgroundColor: "#e8f0fe" },
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
                "Online Status",
                "Approve Date",
                "Last Login",
                "Actions",
              ].map((header) => (
                <TableCell key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} sx={{ textAlign: "center", border: "1px solid #ccc" }}>
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const lastLogin = user.loginHistory?.length
                  ? `${new Date(
                      user.loginHistory[user.loginHistory.length - 1].timestamp
                    ).toLocaleString()} | Device: ${
                      user.loginHistory[user.loginHistory.length - 1].deviceType || "Unknown"
                    } | IP: ${user.loginHistory[user.loginHistory.length - 1].ip || "N/A"}`
                  : "N/A";

                return (
                  <TableRow key={user._id}>
                    <TableCell>{user.employeeId}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.contactNo}</TableCell>
                    <TableCell>{user.teamLeader}</TableCell>
                    <TableCell>{user.designation}</TableCell>
                    <TableCell>
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
                      </Button>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="contained"
                        onClick={() => handleToggleStatus(user._id)}
                        sx={{
                          backgroundColor: user.isBlocked ? "red" : "blue",
                          "&:hover": { backgroundColor: user.isBlocked ? "red" : "blue" },
                        }}
                      >
                        {user.isBlocked ? "Inactive" : "Active"}
                      </Button>
                    </TableCell>

                    <TableCell>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor: user.isOnline ? "green" : "gray",
                          }}
                        />
                        {user.isOnline ? "Online" : "Offline"}
                      </Box>
                    </TableCell>

                    <TableCell>
                      {user.isApproved && user.approvedAt
                        ? new Date(user.approvedAt).toLocaleDateString()
                        : "Pending"}
                    </TableCell>

                    <TableCell>{lastLogin}</TableCell>

                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEditOpen(user)}>
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => {
                          setUserToDelete(user);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Are you sure you want to delete this user?</DialogTitle>
        <DialogContent>
          <Typography>{userToDelete?.fullName}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit User Details</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Full Name"
            value={editForm.fullName}
            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
            fullWidth
          />
          <TextField
            label="Email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            fullWidth
          />
          <TextField
            label="Contact No"
            value={editForm.contactNo}
            onChange={(e) => setEditForm({ ...editForm, contactNo: e.target.value })}
            fullWidth
          />
          <TextField
            label="Designation"
            value={editForm.designation}
            onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
            fullWidth
          />
          <TextField
            label="Team Leader"
            value={editForm.teamLeader}
            onChange={(e) => setEditForm({ ...editForm, teamLeader: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleEditSave}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UserList;
