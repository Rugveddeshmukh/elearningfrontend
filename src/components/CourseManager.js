import React, { useState, useEffect } from "react";
import {
  Box, Button, TextField, Typography,
  Card, CardContent, CardActions, IconButton, Divider
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const CourseManager = () => {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: "", category: "", subcategory: "" });
  const [editId, setEditId] = useState(null);
  const { token } = useAuth();

  const fetchCourses = async () => {
    try {
      const res = await api.get("/course");
      setCourses(res.data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSubmit = async () => {
    const payload = { category: form.category, subcategory: form.subcategory, title: form.title };

    try {
      if (editId) {
        await api.put(`/course/${editId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        setEditId(null);
      } else {
        await api.post("/course", payload, { headers: { Authorization: `Bearer ${token}` } });
      }

      setForm({ title: "", category: "", subcategory: "" });
      fetchCourses();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleEdit = (course) => {
    setForm({ category: course.category, subcategory: course.subcategory, title: course.title });
    setEditId(course._id);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/course/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchCourses();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <Box p={1} sx={{ maxWidth: 1200, mx: "auto" }}>
      {/* Centered Title */}
      <Typography variant="h5" mb={1} sx={{ textAlign: "center", fontWeight: "bold", color: "#003366" }}>
        Course Management
      </Typography>

      {/* Form */}
      <Box mb={4} display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <TextField
          label="Subcategory"
          value={form.subcategory}
          onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
        />
        <TextField
          label="Course Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Button variant="contained" onClick={handleSubmit} sx={{ width: "30%", alignSelf: "center" }}>
          {editId ? "Update Course" : "Add Course"}
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Courses Grid */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 2
      }}>
        {courses.map((course) => (
          <Card key={course._id} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Category: {course.category}</Typography>
              <Typography variant="body2" color="text.secondary">Subcategory: {course.subcategory}</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>{course.title}</Typography>
            </CardContent>
            <CardActions>
              <IconButton onClick={() => handleEdit(course)}><Edit /></IconButton>
              <IconButton onClick={() => handleDelete(course._id)}><Delete /></IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default CourseManager;
