import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  CircularProgress,
  Pagination,
} from "@mui/material";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const ticketsPerPage = 10;
  const { token } = useAuth();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await api.get("/tickets/mytickets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTickets(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchTickets();
  }, [token]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  // Pagination calculation
  const indexOfLastTicket = page * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(tickets.length / ticketsPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Box maxWidth="1200px" mx="auto" mt={0}>
      <Typography variant="h5" mb={2} textAlign="center" fontWeight={'bold'}>
        My Support Tickets
      </Typography>

      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ borderCollapse: "collapse" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
              {["Subject", "Description", "Screenshot", "Status", "Admin Response"].map(
                (header) => (
                  <TableCell
                    key={header}
                    sx={{
                      border: "1px solid #ccc",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    {header}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {currentTickets.map((ticket, idx) => (
              <TableRow
                key={ticket._id}
                sx={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#f9f9f9" }}
              >
                <TableCell sx={{ border: "1px solid #ccc" }}>{ticket.subject}</TableCell>
                <TableCell sx={{ border: "1px solid #ccc" }}>{ticket.description}</TableCell>
                <TableCell sx={{ border: "1px solid #ccc", textAlign: "center" }}>
                  {ticket.screenshot ? (
                    <a href={ticket.screenshot} target="_blank" rel="noreferrer">
                      <img
                        src={ticket.screenshot}
                        alt="Screenshot"
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                        }}
                      />
                    </a>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell sx={{ border: "1px solid #ccc" }}>{ticket.status}</TableCell>
                <TableCell sx={{ border: "1px solid #ccc" }}>
                  {ticket.adminResponse || "Pending"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Showing X-Y */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={0}
        sx={{
          border: "1px solid #ccc",
          backgroundColor: "#fff",
          padding: "8px 16px",
          borderRadius: "4px",
        }}
      >
        <Typography>
          Showing {tickets.length === 0 ? 0 : indexOfFirstTicket + 1}-
          {Math.min(indexOfLastTicket, tickets.length)}
        </Typography>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        )}
      </Box>
    </Box>
  );
};

export default MyTickets;
