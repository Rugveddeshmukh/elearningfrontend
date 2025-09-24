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

      const { data } = await api.post("/tickets", formData, {
        headers: { "Content-Type": "multipart/form-data",
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
    <>
    <Box maxWidth="600px" mx="auto" mt={4}>
      <Typography variant="h5" mb={2}>Raise a Support Ticket</Typography>
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
        <Button variant="contained" component="label" sx={{ mt: 1 }}>
          Upload Screenshot
          <input
            type="file"
            hidden
            onChange={(e) => setScreenshot(e.target.files[0])}
            accept="image/*"
          />
        </Button>
        {screenshot && <Typography mt={1}>{screenshot.name}</Typography>}
        <Box mt={2}>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Submit Ticket"}
          </Button>
        </Box>
        {message && <Typography mt={2}>{message}</Typography>}
      </form>
    </Box>
    <MyTickets/>
    </>
  );
};

export default RaiseTicket;
