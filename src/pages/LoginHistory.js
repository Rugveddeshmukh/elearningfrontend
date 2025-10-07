import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, CircularProgress, Pagination } from "@mui/material";

const LoginHistoryPage = () => {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const logsPerPage = 10;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await api.get("/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistory(res.data.loginHistory || []);
      } catch (err) {
        console.error("History fetch error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  // Pagination calculation
  const indexOfLastLog = page * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = history.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(history.length / logsPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Box maxWidth="1200px" mx="auto" mt={0}>
      <Typography variant="h5" mb={2} textAlign="center" fontWeight={'bold'}>
        Login History
      </Typography>

      {history.length > 0 ? (
        <>
          <TableContainer component={Paper} elevation={3}>
            <Table sx={{ borderCollapse: "collapse" }}>
              <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
                <TableRow>
                  {["IP Address", "Device Type", "Location", "Login Time", "Logout Time", "Status"].map((header) => (
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
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {currentLogs.map((log, index) => (
                  <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                    <TableCell sx={{ border: "1px solid #ccc", textAlign: "center" }}>{log.ip}</TableCell>
                    <TableCell sx={{ border: "1px solid #ccc", textAlign: "center" }}>{log.deviceType}</TableCell>
                    <TableCell sx={{ border: "1px solid #ccc", textAlign: "center" }}>{log.location}</TableCell>
                    <TableCell sx={{ border: "1px solid #ccc", textAlign: "center" }}>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell sx={{ border: "1px solid #ccc", textAlign: "center" }}>{log.signOutTime ? new Date(log.signOutTime).toLocaleString() : "Active"}</TableCell>
                    <TableCell sx={{ border: "1px solid #ccc", textAlign: "center", color: log.status === "Success" ? "green" : "red" }}>{log.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Showing X-Y of Z and Pagination */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={0} sx={{ border: "1px solid #ccc", backgroundColor: "#fff", padding: "8px 16px", borderRadius: "4px" }}>
            <Typography>
              Showing {history.length === 0 ? 0 : indexOfFirstLog + 1}-{Math.min(indexOfLastLog, history.length)}
            </Typography>

            {totalPages > 1 && (
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            )}
          </Box>
        </>
      ) : (
        <Typography textAlign="center">No login history available.</Typography>
      )}
    </Box>
  );
};

export default LoginHistoryPage;
