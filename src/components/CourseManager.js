import React, { useState, useEffect } from "react";
import {
  Box, Button, TextField, Typography,
  List, ListItem, IconButton, Divider
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
    const payload = {
      title: form.title,
      category: form.category,
      subcategory: form.subcategory
    };

    try {
      if (editId) {
        await api.put(`/course/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEditId(null);
      } else {
        await api.post("/course", payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setForm({ title: "", category: "", subcategory: "" });
      fetchCourses();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleEdit = (course) => {
    setForm({
      title: course.title,
      category: course.category,
      subcategory: course.subcategory
    });
    setEditId(course._id);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/course/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCourses();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h5" mb={2}>
        Manage Courses
      </Typography>

      <Box mb={3} display="flex" flexDirection="column" gap={2}>
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
        <Button variant="contained" onClick={handleSubmit}>
          {editId ? "Update Course" : "Add Course"}
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <List>
        {courses.map((course) => (
          <ListItem key={course._id} sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="subtitle1">{course.title}</Typography>
              <Typography variant="body2">Category: {course.category}</Typography>
              <Typography variant="body2">Subcategory: {course.subcategory}</Typography>
            </Box>
            <Box>
              <IconButton onClick={() => handleEdit(course)}><Edit /></IconButton>
              <IconButton onClick={() => handleDelete(course._id)}><Delete /></IconButton>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default CourseManager;
