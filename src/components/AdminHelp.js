import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Paper,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const AdminHelp = () => {
  const { token } = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [manuals, setManuals] = useState([]);
  const [loading, setLoading] = useState(true);

  // FAQ states
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  // Manual states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const fetchData = async () => {
    try {
      const faqRes = await api.get("/help/faqs");
      const manualRes = await api.get("/help/manuals");
      setFaqs(faqRes.data);
      setManuals(manualRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add FAQ
  const handleAddFAQ = async () => {
    try {
      await api.post(
        "/help/faqs",
        { question, answer },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestion("");
      setAnswer("");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete FAQ
  const handleDeleteFAQ = async (id) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await api.delete(`/help/faqs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Add Manual
  const handleAddManual = async () => {
    if (!title || !content) return alert("Please enter title and content");
    try {
      await api.post(
        "/help/manuals",
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      setContent("");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Manual
  const handleDeleteManual = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Manual?")) return;
    try {
      await api.delete(`/help/manuals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        maxWidth: 1200,
        p: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* Add FAQ */}
        <Paper sx={{ p: 3, borderRadius: 2, textAlign: "center", }} elevation={3}>
          <Typography
            variant="h5"
            mb={2}
            sx={{ color: "#003366", fontWeight: "bold" }}
          >
            Add FAQ
          </Typography>
          <TextField
            label="Question"
            fullWidth
            margin="normal"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <TextField
            label="Answer"
            fullWidth
            margin="normal"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleAddFAQ}
            sx={{
              mt: 2,
              fontWeight:"bold",
              background:"#2E7D32"
            }}
          >
            Add FAQ
          </Button>
        </Paper>

        {/* FAQ List */}
        <Paper sx={{ p: 3, borderRadius: 2, textAlign: "center" }} elevation={2}>
          <Typography
            variant="h5"
            mb={2}
            sx={{ color: "#003366", fontWeight: "bold" }}
          >
            FAQs
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {faqs.length > 0 ? (
              faqs.map((faq) => (
                <ListItem
                  key={faq._id}
                  sx={{
                    borderBottom: "1px solid #ddd",
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleDeleteFAQ(faq._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primaryTypographyProps={{
                      fontWeight: "bold",
                      color: "#003366",
                    }}
                    primary={faq.question}
                    secondary={faq.answer}
                  />
                </ListItem>
              ))
            ) : (
              <Typography color="text.secondary">No FAQs added yet.</Typography>
            )}
          </List>
        </Paper>

        {/* Add User Manual */}
        <Paper sx={{ p: 3, borderRadius: 2, textAlign: "center" }} elevation={3}>
          <Typography
            variant="h5"
            mb={2}
            sx={{ color: "#003366", fontWeight: "bold" }}
          >
            Add User Manual
          </Typography>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Content"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{
              mt: 2,
              fontWeight:"bold",
              background:"#2E7D32"
            }}
            onClick={handleAddManual}
          >
            Save Manual
          </Button>
        </Paper>

        {/* User Manual List */}
        <Paper sx={{ p: 3, borderRadius: 2, textAlign: "center" }} elevation={2}>
          <Typography
            variant="h5"
            mb={2}
            sx={{ color: "#003366", fontWeight: "bold" }}
          >
            User Manuals
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {manuals.length > 0 ? (
              manuals.map((m) => (
                <ListItem
                  key={m._id}
                  sx={{
                    borderBottom: "1px solid #ddd",
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleDeleteManual(m._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primaryTypographyProps={{
                      fontWeight: "bold",
                      color: "#003366",
                    }}
                    primary={m.title}
                    secondary={m.content}
                  />
                </ListItem>
              ))
            ) : (
              <Typography color="text.secondary">
                No User Manuals added yet.
              </Typography>
            )}
          </List>
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminHelp;
