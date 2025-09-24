import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, List, ListItem, ListItemText } from "@mui/material";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const Help = () => {
  const [faqs, setFaqs] = useState([]);
  const [manuals, setManuals] = useState([]);
  const [search, setSearch] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const faqRes = await api.get("/help/faqs");
        const manualRes = await api.get("/help/manuals");
        setFaqs(faqRes.data);
        setManuals(manualRes.data);
      } catch (err) {
        console.error("Error fetching help data:", err);
      }
    };
    fetchData();
  }, [token]);

  const filteredFaqs = faqs.filter((f) =>
    f.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>Help & Support</Typography>

      {/* Search bar */}
      <TextField
        fullWidth
        label="Search FAQs"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* FAQs */}
      <Typography variant="h6">FAQs</Typography>
      <List>
        {filteredFaqs.map((f) => (
          <ListItem key={f._id}>
            <ListItemText primary={f.question} secondary={f.answer} />
          </ListItem>
        ))}
      </List>

      {/* User Manuals */}
      <Typography variant="h6" mt={4}>User Manuals</Typography>
      {manuals.map((m) => (
        <Box key={m._id} mb={2}>
          <Typography fontWeight="bold">{m.title}</Typography>
          <Typography>{m.content}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default Help;
