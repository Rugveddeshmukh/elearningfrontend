import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  CardMedia,
  Grid,
  CircularProgress,
} from "@mui/material";
import api from "../utils/api"; // your axios instance
import { useAuth } from "../context/AuthContext";

export default function CertificateTemplateUpload() {
  const { token } = useAuth();

  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);

  // Fetch existing templates
  const fetchTemplates = async () => {
    try {
      const res = await api.get("/certificates", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTemplates(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fetch templates");
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file) return alert("Please select a file");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);

      const res = await api.post("/certificates/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Template uploaded successfully!");
      setFile(null);
      setName("");
      fetchTemplates();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Upload Certificate Template
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="Template Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button variant="contained" component="label">
          Select File
          <input type="file" hidden accept="image/*" onChange={handleFileChange} />
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Upload"}
        </Button>
      </Box>

      {file && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          Selected file: {file.name}
        </Typography>
      )}

      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
        Uploaded Templates
      </Typography>
      <Grid container spacing={2}>
        {templates.map((t) => (
          <Grid item xs={12} sm={6} md={4} key={t._id}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={t.url}
                alt={t.name}
              />
              <CardContent>
                <Typography variant="body1">{t.name}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {templates.length === 0 && (
        <Typography sx={{ mt: 2 }}>No templates uploaded yet.</Typography>
      )}
    </Box>
  );
}
