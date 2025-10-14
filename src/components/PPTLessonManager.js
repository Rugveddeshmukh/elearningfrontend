import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const PPTLessonManager = () => {
  const { token } = useAuth();

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [lessons, setLessons] = useState([]);
  const [form, setForm] = useState({ title: "", ppt: null, thumbnail: null });
  const [searchTerm, setSearchTerm] = useState("");

  // 🔹 Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);

  const getFileUrl = (filePath) => {
    if (!filePath) return "";
    return filePath.startsWith("http")
      ? filePath
      : `${process.env.REACT_APP_BACKEND_URL}/uploads/${filePath}`;
  };

  // 🔹 Fetch Courses
  useEffect(() => {
    api.get("/course").then((res) => {
      const allCourses = res.data;
      setCourses(allCourses);
      const cats = [...new Set(allCourses.map((c) => c.category))].filter(Boolean);
      setCategories(cats);
    });
  }, []);

  // 🔹 Fetch All Lessons Initially
  useEffect(() => {
    const fetchAllLessons = async () => {
      try {
        const res = await api.get("/lesson", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLessons(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllLessons();
  }, [token]);

  // 🔹 Handle Category & Subcategory Logic
  useEffect(() => {
    if (selectedCategory) {
      const subs = courses
        .filter((c) => c.category === selectedCategory)
        .map((c) => c.subcategory)
        .filter(Boolean);
      setSubcategories([...new Set(subs)]);
      setSelectedSubcategory("");
      setSelectedCourse("");
    } else {
      setSubcategories([]);
      setSelectedSubcategory("");
      setSelectedCourse("");
    }
  }, [selectedCategory, courses]);

  useEffect(() => {
    if (selectedSubcategory) setSelectedCourse("");
  }, [selectedSubcategory]);

  const fetchLessonsForCourse = async (courseId) => {
    try {
      const res = await api.get(`/lesson/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLessons(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedCourse) fetchLessonsForCourse(selectedCourse);
  }, [selectedCourse]);

  // 🔹 File Change Handler
  const handleFileChange = (e, type) => {
    setForm({ ...form, [type]: e.target.files[0] });
  };

  // 🔹 Submit Handler
  const handleSubmit = async () => {
    if (!form.ppt || !form.thumbnail || !selectedCourse) {
      return alert("Please select course, PPT, and thumbnail");
    }

    const formData = new FormData();
    formData.append("courseId", selectedCourse);
    formData.append("ppt", form.ppt);
    formData.append("thumbnail", form.thumbnail);
    if (form.title) formData.append("title", form.title);

    try {
      await api.post("/lesson", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setForm({ title: "", ppt: null, thumbnail: null });

      const res = await api.get("/lesson", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLessons(res.data);
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    }
  };

  // 🔹 Delete Confirmation Handlers
  const openDeleteDialog = (lesson) => {
    setLessonToDelete(lesson);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!lessonToDelete) return;
    try {
      await api.delete(`/lesson/${lessonToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const res = await api.get("/lesson", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLessons(res.data);
      setDeleteDialogOpen(false);
      setLessonToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Filter Lessons by Search
  const filteredLessons = lessons.filter((lesson) =>
    lesson.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 1, maxWidth: 1200, mx: "auto" }}>
      {/* Page Title */}
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          color: "#003366",
          mb: 3,
        }}
      >
        Lesson Upload with Preview
      </Typography>

      {/* Category Selection */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat, idx) => (
            <MenuItem key={idx} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Subcategory */}
      <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedCategory}>
        <InputLabel>Subcategory</InputLabel>
        <Select
          value={selectedSubcategory}
          onChange={(e) => setSelectedSubcategory(e.target.value)}
        >
          {subcategories.map((sub, idx) => (
            <MenuItem key={idx} value={sub}>
              {sub}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Course */}
      <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedSubcategory}>
        <InputLabel>Course</InputLabel>
        <Select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          {courses
            .filter(
              (c) =>
                c.category === selectedCategory &&
                c.subcategory === selectedSubcategory
            )
            .map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.title}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      {/* Lesson Title */}
      <TextField
        label="Lesson Title"
        fullWidth
        required
        sx={{ mb: 2 }}
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      {/* File Upload Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <p style={{ marginBottom: "25px" }}>Only PPT Uploaded</p>
        <input
          type="file"
          accept=".ppt,.pptx,.pdf"
          onChange={(e) => handleFileChange(e, "ppt")}
        />
        <p style={{ marginBottom: "25px" }}>Only Thumbnail (Images)</p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "thumbnail")}
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            width: "25%",
            fontWeight: "bold",
            background: "#2E7D32",
          }}
        >
          Submit
        </Button>
      </Box>

      {/* All Lessons Header + Search (Same Line) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          flexWrap: "wrap",
          mt: 5,
          mb: 3,
        }}
      >
        {/* Centered Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "#003366",
            textAlign: "center",
            flex: 1,
            fontSize:"24px",
          }}
        >
          All Lessons
        </Typography>

        {/* Right-Aligned Search */}
        <Box
          sx={{
            position: { xs: "static", sm: "absolute" },
            right: { sm: 0 },
            mt: { xs: 1, sm: 0 },
          }}
        >
          <TextField
            size="small"
            placeholder="Search lesson..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: { xs: "100%", sm: "250px" },
              backgroundColor: "#fff",
            }}
          />
        </Box>
      </Box>

      {/* Lessons Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 2,
          justifyContent: "center",
        }}
      >
        {filteredLessons.length > 0 ? (
          filteredLessons.map((lesson) => (
            <Card
              key={lesson._id}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                },
              }}
            >
              {lesson.thumbnail && (
                <Box sx={{ width: "100%", height: 140 }}>
                  <img
                    src={getFileUrl(lesson.thumbnail)}
                    alt="Thumbnail"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              )}

              <CardContent sx={{ p: 2 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {lesson.title || "Untitled Lesson"}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {courses.find((c) => c._id === lesson.courseId)?.title ||
                    "Unknown Course"}
                </Typography>
              </CardContent>

              <CardActions sx={{ justifyContent: "center", p: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => openDeleteDialog(lesson)}
                  sx={{
                    backgroundColor: "#2E7D32",
                    color: "#fff",
                    fontWeight: "bold",
                    "&:hover": { backgroundColor: "#1B5E20" },
                    borderRadius: "20px",
                    px: 3,
                  }}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          ))
        ) : (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: "center", mt: 3 }}
          >
            No lessons found.
          </Typography>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Are you sure you want to delete this lesson?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontWeight: "bold", mt: 1 }}>
            {lessonToDelete?.title || "Untitled Lesson"}
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

export default PPTLessonManager;
