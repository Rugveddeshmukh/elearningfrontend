import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Pagination,
  CircularProgress,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const AdminLearningHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState(""); // Search user name
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState(""); // Name to show in dialog
  const [selectedId, setSelectedId] = useState(null); // ID to delete
  const logsPerPage = 10;
  const { token } = useAuth();

  const fetchHistory = async () => {
    try {
      const res = await api.get("/admin/learning-history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data || []);
    } catch (err) {
      console.error("Error fetching admin history:", err.response?.data || err.message);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchHistory();
  }, [token]);

  const openDeleteDialog = (id, userName) => {
    setSelectedId(id);
    setSelectedUserName(userName);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedId) return;
    try {
      await api.delete(`/admin/learning-history/${selectedId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory((prev) => prev.filter((item) => item._id !== selectedId));
      setDeleteDialogOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  // 🔹 Filter by user name and sort newest first
  const filteredHistory = history
    .filter((h) => h.userName?.toLowerCase().includes(searchText.toLowerCase()))
    .sort((a, b) => new Date(b.lessonStartDate) - new Date(a.lessonStartDate));

  const indexOfLastLog = page * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredHistory.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredHistory.length / logsPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Box maxWidth="1200px" mx="auto" mt={2}>
      {/* Header + Search */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          label="Search by Name"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ minWidth: 250 }}
        />
        <Typography variant="h5" fontWeight="bold" textAlign="center" color="#003366">
          All Learning History
        </Typography>
        <Box width="250px" /> {/* Placeholder to keep center title */}
      </Box>

      <TableContainer component={Paper}>
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
                "User Name",
                "Email",
                "Course",
                "Lesson",
                "Start Date",
                "End Date",
                "Lesson Status",
                "Quiz Score",
                "Quiz Status",
                "Quiz Date",
                "Action",
              ].map((header) => (
                <TableCell key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {currentLogs.map((h, idx) => (
              <TableRow
                key={h._id}
                sx={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#f9f9f9" }}
              >
                <TableCell>{h.userName}</TableCell>
                <TableCell>{h.userEmail}</TableCell>
                <TableCell>{h.courseTitle}</TableCell>
                <TableCell>{h.lessonTitle}</TableCell>
                <TableCell>
                  {h.lessonStartDate
                    ? new Date(h.lessonStartDate).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  {h.lessonEndDate
                    ? new Date(h.lessonEndDate).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>{h.lessonStatus}</TableCell>
                <TableCell>{h.quizScore ?? "-"}</TableCell>
                <TableCell>
                  {h.quizStatus
                    ? h.quizStatus === "pass"
                      ? "✅ Pass"
                      : "❌ Fail"
                    : "-"}
                </TableCell>
                <TableCell>
                  {h.quizDate ? new Date(h.quizDate).toLocaleString() : "-"}
                </TableCell>
                <TableCell>
                  <Tooltip title="Delete this user history">
                    <IconButton
                      color="error"
                      onClick={() => openDeleteDialog(h._id, h.userName)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={1}
        sx={{
          border: "1px solid #ccc",
          backgroundColor: "#fff",
          padding: "8px 16px",
          borderRadius: "4px",
        }}
      >
        <Typography>
          Showing{" "}
          {filteredHistory.length === 0 ? 0 : indexOfFirstLog + 1}-
          {Math.min(indexOfLastLog, filteredHistory.length)} of {filteredHistory.length}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Are you sure you want to delete this user?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontWeight: 'bold', mt: 1 }}>
            {selectedUserName || 'N/A'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteConfirm}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminLearningHistory;
