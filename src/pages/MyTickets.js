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
  CircularProgress,
} from "@mui/material";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await api.get("/tickets/mytickets",{
            headers: { Authorization: `Bearer ${token}` },
        });
        setTickets(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchTickets();
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Box maxWidth="900px" mx="auto" mt={4}>
      <Typography variant="h5" mb={2}>My Support Tickets</Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Subject</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Screenshot</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Admin Response</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket._id}>
                <TableCell>{ticket.subject}</TableCell>
                <TableCell>{ticket.description}</TableCell>
                <TableCell>
                    {ticket.screenshot ? (
                     <a href={ticket.screenshot} target="_blank" rel="noreferrer">
                        <img 
                          src={ticket.screenshot} 
                          alt="Screenshot" 
                          style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }}
                        />
                     </a>
                    ) : (
                     "N/A"
                    )}
                </TableCell>
                <TableCell>{ticket.status}</TableCell>
                <TableCell>{ticket.adminResponse || "Pending"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default MyTickets;
