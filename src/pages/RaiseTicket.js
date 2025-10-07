import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import MyTickets from "../pages/MyTickets";

const RaiseTicket = () => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("description", description);
      if (screenshot) formData.append("screenshot", screenshot);

      await api.post("/tickets", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("Ticket submitted successfully!");
      setSubject("");
      setDescription("");
      setScreenshot(null);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error submitting ticket");
    }
    setLoading(false);
  };

  return (
    <Box
      display="flex"
      flexDirection={{ xs: "column", md: "row" }}
      gap={4}
      maxWidth="1200px"
      mx="auto"
      mt={1}
    >
      {/* Left Side: Ask for Support */}
      <Box flex={1}>
        <Typography variant="h5" mb={0} textAlign="center" fontWeight={'bold'}>
          Ask for Support
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Subject"
            fullWidth
            margin="normal"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />

          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          {/* Upload + Submit in one line */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <Button variant="contained" component="label">
              Upload Screenshot
              <input
                type="file"
                hidden
                onChange={(e) => setScreenshot(e.target.files[0])}
                accept="image/*"
              />
            </Button>

            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Submit Ticket"}
            </Button>
          </Box>

          {screenshot && (
            <Typography mt={1} textAlign="left" fontSize="0.9rem">
              {screenshot.name}
            </Typography>
          )}

          {message && (
            <Typography mt={2} color="primary">
              {message}
            </Typography>
          )}
        </form>
      </Box>

      {/* Right Side: My Tickets */}
      <Box flex={2}>
        <MyTickets />
      </Box>
    </Box>
  );
};

export default RaiseTicket;
