import React, { useEffect, useState } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, Button, TextField, CircularProgress } from "@mui/material";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
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
      await api.put(`/tickets/${ticketId}/reply`, { reply: replyText[ticketId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTickets();
      setReplyText({ ...replyText, [ticketId]: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = async (ticketId) => {
    try {
      await api.put(`/tickets/${ticketId}/close`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (ticketId) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      await api.delete(`/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box maxWidth="1000px" mx="auto" mt={4}>
      <Typography variant="h5" mb={2}>All User Tickets</Typography>
      <Paper>
        <Table>
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
            {tickets.map((ticket) => (
              <TableRow key={ticket._id}>
                <TableCell>{ticket.userId?.fullName || "Unknown User"}</TableCell>
                <TableCell>{ticket.subject}</TableCell>
                <TableCell>{ticket.description}</TableCell>
                <TableCell>
                  {ticket.screenshot ? (
                    <a href={ticket.screenshot} target="_blank" rel="noreferrer">View</a>
                  ) : "N/A"}
                </TableCell>
                <TableCell>{ticket.status}</TableCell>
                <TableCell>{ticket.adminResponse || "Pending"}</TableCell>
                <TableCell>
                  <Box display="flex" gap={1} alignItems="center">
                    <TextField
                      size="small"
                      value={replyText[ticket._id] || ""}
                      onChange={(e) => setReplyText({ ...replyText, [ticket._id]: e.target.value })}
                      placeholder="Type reply..."
                    />
                    <Button variant="contained" size="small" onClick={() => handleReply(ticket._id)}>Reply</Button>
                    <Button variant="outlined" size="small" color="error" onClick={() => handleClose(ticket._id)}>Close</Button>
                    <Button variant="outlined" size="small" color="error" onClick={() => handleDelete(ticket._id)}>Delete</Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default AdminTickets;
