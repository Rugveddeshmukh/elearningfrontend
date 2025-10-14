import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [searchText, setSearchText] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const { token } = useAuth();

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleReply = async (ticketId) => {
    try {
      await api.put(
        `/tickets/${ticketId}/reply`,
        { reply: replyText[ticketId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTickets();
      setReplyText({ ...replyText, [ticketId]: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseTicket = async (ticketId) => {
    try {
      await api.put(`/tickets/${ticketId}/close`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!ticketToDelete) return;
    try {
      await api.delete(`/tickets/${ticketToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTickets();
      setDeleteDialogOpen(false);
      setTicketToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const openDeleteDialog = (ticket) => {
    setTicketToDelete(ticket);
    setDeleteDialogOpen(true);
  };

  if (loading) return <CircularProgress />;

  // Filter tickets based on search
  const filteredTickets = tickets.filter((ticket) =>
    ticket.userId?.fullName?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Box maxWidth="95%" mx="auto" mt={1}>
      {/* Header + Search */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          label="Search by Name"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ width: 250 }}
        />
        <Typography
          variant="h5"
          textAlign="center"
          sx={{ fontWeight: "bold", color: "#003366" }}
        >
          All User Tickets
        </Typography>
        <Box width={250} /> {/* Placeholder to keep title centered */}
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
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
              <TableCell>User</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Screenshot</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Admin Response</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTickets.map((ticket) => (
              <TableRow key={ticket._id}>
                <TableCell>{ticket.userId?.fullName || "Unknown User"}</TableCell>
                <TableCell>{ticket.subject}</TableCell>
                <TableCell sx={{ textAlign: "left" }}>{ticket.description}</TableCell>
                <TableCell>
                  {ticket.screenshot ? (
                    <a
                      href={ticket.screenshot}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#1976d2", textDecoration: "none" }}
                    >
                      View
                    </a>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell
                  sx={{
                    color:
                      ticket.status === "closed"
                        ? "red"
                        : ticket.status === "resolved"
                        ? "green"
                        : "orange",
                    fontWeight: "bold",
                    textTransform: "capitalize",
                  }}
                >
                  {ticket.status}
                </TableCell>
                <TableCell sx={{ textAlign: "left" }}>
                  {ticket.adminResponse || "Pending"}
                </TableCell>
                <TableCell>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <TextField
                      size="small"
                      value={replyText[ticket._id] || ""}
                      onChange={(e) =>
                        setReplyText({ ...replyText, [ticket._id]: e.target.value })
                      }
                      placeholder="Type reply..."
                      sx={{ backgroundColor: "#fff", borderRadius: 1 }}
                    />
                    <Box display="flex" gap={1} justifyContent="center">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleReply(ticket._id)}
                        sx={{ textTransform: "none", backgroundColor: "#1976d2" }}
                      >
                        Reply
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="warning"
                        onClick={() => handleCloseTicket(ticket._id)}
                        sx={{ textTransform: "none" }}
                      >
                        Close
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => openDeleteDialog(ticket)}
                        sx={{ textTransform: "none" }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Are you sure you want to delete this ticket?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontWeight: "bold", mt: 1 }}>
            {ticketToDelete?.userId?.fullName || "Unknown User"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTickets;
