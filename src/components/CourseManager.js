import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  CardActions,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const CourseManager = () => {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: "", category: "", subcategory: "" });
  const [editId, setEditId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

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

  const openDeleteDialog = (course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;
    try {
      await api.delete(`/course/${courseToDelete._id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchCourses();
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Box p={1} sx={{ maxWidth: 1200, mx: "auto" }}>
      {/* Centered Title */}
      <Typography variant="h5" sx={{ fontWeight: "bold", color: "#003366", textAlign: "center", mb: 2 }}>
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
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{ width: "30%", alignSelf: "center", fontWeight: "bold", background: "#2E7D32" }}
        >
          {editId ? "Update Course" : "Add Course"}
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Search bar above grid */}
      <Box display="flex" justifyContent="flex-start" mb={2}>
        <TextField
          label="Search by Course Name"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ width: 250 }}
        />
      </Box>

      {/* Courses Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 2,
          justifyContent: "center",
        }}
      >
        {filteredCourses.map((course) => (
          <Card
            key={course._id}
            sx={{
              borderRadius: 3,
              height: 180,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
              textAlign: "center",
              transition: "0.3s",
              "&:hover": { transform: "translateY(-4px)", boxShadow: "0px 4px 10px rgba(0,0,0,0.2)" },
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Category: {course.category}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Subcategory: {course.subcategory}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", mt: 1 }}>
                {course.title}
              </Typography>
            </CardContent>

            <CardActions sx={{ justifyContent: "flex-end", p: 1 }}>
              <Button
                variant="contained"
                size="small"
                color="success"
                sx={{ textTransform: "none" }}
                onClick={() => openDeleteDialog(course)}
              >
                Delete
              </Button>
              <Button
                variant="outlined"
                size="small"
                sx={{ textTransform: "none" }}
                onClick={() => handleEdit(course)}
              >
                Edit
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Are you sure you want to delete this course?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontWeight: "bold", mt: 1 }}>
            {courseToDelete?.title || "Untitled Course"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseManager;
