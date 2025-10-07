import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  TextField,
} from "@mui/material";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const BACKEND_URL = "http://localhost:5000";

const PPTLessonViewer = () => {
  const { token } = useAuth();

  // Categories and courses
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [lessonsByCourse, setLessonsByCourse] = useState({});
  const [activeLesson, setActiveLesson] = useState(null);
  const [showPPT, setShowPPT] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLessons, setFilteredLessons] = useState([]);

  const getFileUrl = (filePath) =>
    filePath ? (filePath.startsWith("http") ? filePath : `${BACKEND_URL}/uploads/${filePath}`) : "";

  // Update lesson status
  const updateLessonStatus = async (lessonId, status) => {
    try {
      await api.put(
        `/lesson/${lessonId}/progress`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLessonsByCourse((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((courseId) => {
          updated[courseId] = updated[courseId].map((lesson) =>
            lesson._id === lessonId ? { ...lesson, userStatus: status } : lesson
          );
        });
        return updated;
      });
    } catch (err) {
      console.error("Failed to update lesson status", err);
    }
  };

  const handleOpenPPT = (lesson) => {
    setShowPPT(lesson);
    updateLessonStatus(lesson._id, "in-progress");
  };

  const handleClosePPT = () => {
    if (showPPT) updateLessonStatus(showPPT._id, "completed");
    setShowPPT(null);
  };

  const handleActiveLessonClick = (lesson) => {
    setActiveLesson(lesson);
    updateLessonStatus(lesson._id, "in-progress");
  };

  const handleModuleClick = (lesson) => {
    setShowPPT(lesson);
    updateLessonStatus(lesson._id, "in-progress");
  };

  // Fetch categories & courses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, courseRes] = await Promise.all([
          api.get("/course/categories"),
          api.get("/course"),
        ]);
        setCategories(["All Categories", ...categoryRes.data]);
        setAllCourses(courseRes.data);
        setFilteredCourses(courseRes.data);
      } catch (err) {
        console.error("Error loading categories or courses", err);
      }
    };
    fetchData();
  }, []);

  // Fetch subcategories on category change
  useEffect(() => {
    if (selectedCategory && selectedCategory !== "All Categories") {
      const fetchSubcategories = async () => {
        try {
          const res = await api.get(`/course/subcategories/${selectedCategory}`);
          setSubcategories(res.data);
        } catch (err) {
          console.error("Error loading subcategories", err);
        }
      };
      fetchSubcategories();
    } else {
      setSubcategories([]);
      setSelectedSubcategory("");
    }
  }, [selectedCategory]);

  // Filter courses based on category & subcategory
  useEffect(() => {
    if (selectedCategory === "All Categories") {
      setFilteredCourses(allCourses);
    } else if (selectedCategory && selectedSubcategory) {
      setFilteredCourses(
        allCourses.filter(
          (course) =>
            course.category === selectedCategory &&
            course.subcategory === selectedSubcategory
        )
      );
    } else {
      setFilteredCourses([]);
    }
  }, [selectedCategory, selectedSubcategory, allCourses]);

  // Fetch lessons per filtered course
  useEffect(() => {
    const fetchLessons = async () => {
      const lessonsMap = {};
      for (const course of filteredCourses) {
        try {
          const res = await api.get(`/lesson/${course._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          lessonsMap[course._id] = res.data;
        } catch (err) {
          console.error(`Error loading lessons for course ${course.title}`, err);
        }
      }
      setLessonsByCourse(lessonsMap);
    };

    filteredCourses.length > 0 ? fetchLessons() : setLessonsByCourse({});
  }, [filteredCourses, token]);

  // Filter lessons by search query
  useEffect(() => {
    const allLessons = filteredCourses.flatMap(
      (course) => lessonsByCourse[course._id] || []
    );

    if (!searchQuery.trim()) setFilteredLessons(allLessons);
    else
      setFilteredLessons(
        allLessons.filter((lesson) =>
          lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
  }, [lessonsByCourse, filteredCourses, searchQuery]);

  // =================== UI Rendering ===================
  if (showPPT) {
    return (
      <Box display="flex" justifyContent="center" alignItems="flex-start">
        <Box sx={{ width: "80%", maxWidth: "1000px", borderRadius: 2, overflow: "hidden", boxShadow: 5 }}>
          <Box sx={{ backgroundColor: "#000", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", p: "5px 20px" }}>
            <Typography variant="h6" fontWeight="bold">{showPPT.title}</Typography>
            <Button onClick={handleClosePPT} sx={{ color: "#fff", minWidth: "auto", p: 0 }}>✕</Button>
          </Box>
          <Box sx={{ backgroundColor: "#000" }}>
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(getFileUrl(showPPT.ppt))}`}
              width="100%"
              height="600px"
              frameBorder="0"
              title="PPT Viewer"
              style={{ display: "block" }}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  if (activeLesson) {
    return (
      <Box p={3}>
        <Button variant="outlined" onClick={() => setActiveLesson(null)} sx={{ mb: 2 }}>← Back to My Courses</Button>

        {/* Lesson Card */}
        <Card sx={{ display: "flex", borderRadius: 2, overflow: "hidden", width: "90%" }}>
          <Box sx={{ width: "40%" }}>
            <CardMedia component="img" height="100%" image={getFileUrl(activeLesson.thumbnail)} alt={activeLesson.title} style={{ objectFit: "cover", height: "100%" }} />
          </Box>
          <Box sx={{ width: "60%", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", p: 2 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>{activeLesson.title}</Typography>
            <Typography sx={{ mb: 1, fontWeight: "bold" }}>About the Lesson</Typography>
            <Typography sx={{ fontWeight: 500, color: "text.secondary" }}>{activeLesson.title}</Typography>

            {activeLesson.userStatus && (
              <Typography variant="body2" sx={{ fontWeight: 600, ml: 7.5, mt: 2, color: "green" }}>
                {activeLesson.userStatus === "completed" ? "Completed" : "In Progress"}
              </Typography>
            )}

            <Box sx={{ height: 8, borderRadius: 4, backgroundColor: "#e0e0e0", overflow: "hidden", width: "30%", mt: 1 }}>
              <Box sx={{ height: "100%", width: activeLesson.userStatus === "completed" ? "100%" : activeLesson.userStatus === "in-progress" ? "50%" : "0%", backgroundColor: "#4caf50", transition: "width 0.3s ease" }} />
            </Box>
          </Box>
        </Card>

        {/* Module */}
        <Typography variant="h6" sx={{ backgroundColor: "#f5f7fa", p: 2, borderRadius: "4px 4px 0 0", fontWeight: 600, border: "1px solid #ddd", borderBottom: "none", width: "87%", mt: 5 }}>
          Modules
        </Typography>
        <Box>
          <Card
            sx={{
              display: "flex",
              width: "87%",
              alignItems: "center",
              justifyContent: "flex-start",
              border: "1px solid #ddd",
              borderTop: "none",
              borderRadius: "0 0 4px 4px",
              p: 2,
              mb: 2,
              boxShadow: "none",
              cursor: "pointer",
              "&:hover": { backgroundColor: "#f9f9f9" },
            }}
            onClick={() => handleModuleClick(activeLesson)}
          >
            <Box mr={2}>
              <Box sx={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#e74c3c", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 20, fontWeight: "bold" }}>📄</Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="600">{activeLesson.moduleName}</Typography>
                <Typography variant="body2" color="text.secondary">{activeLesson.title}</Typography>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>
    );
  }

  // Main Lessons Grid
  return (
    <Box p={3}>
      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth sx={{ minWidth: 250 }}>
            <InputLabel>Category</InputLabel>
            <Select value={selectedCategory} label="Category" onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubcategory(""); }}>
              {categories.map((cat, idx) => <MenuItem key={idx} value={cat}>{cat}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth sx={{ minWidth: 250 }}>
            <InputLabel>Subcategory</InputLabel>
            <Select value={selectedSubcategory} label="Subcategory" onChange={(e) => setSelectedSubcategory(e.target.value)}>
              {subcategories.length > 0 ? subcategories.map((subcat, idx) => <MenuItem key={idx} value={subcat}>{subcat}</MenuItem>) : <MenuItem value="">Subcategories</MenuItem>}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} md={3}>
          <TextField fullWidth label="What do you want to learn today?" variant="outlined" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </Grid>
      </Grid>

      {/* Lessons */}
      <Grid container spacing={3}>
        {filteredLessons.length === 0 ? (
          <Typography variant="body1">No lessons available.</Typography>
        ) : (
          filteredLessons.map((lesson) => (
            <Grid key={lesson._id} item sx={{ flex: "0 0 23%", maxWidth: "23%", px: 1, mb: 3 }}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: 3,
                  cursor: "pointer",
                  mt: "40px",
                  transition: "0.3s",
                  position: "relative",
                  "&:hover": { transform: "scale(1.03)" },
                }}
                onClick={() => handleActiveLessonClick(lesson)}
              >
                <CardMedia component="img" height="160" image={getFileUrl(lesson.thumbnail)} alt={lesson.title} />
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", textAlign: "center", fontSize: 22 }}>
                    {lesson.title}
                  </Typography>
                </CardContent>

                {lesson.userStatus && (
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: -2, mb: 1, textAlign: "center", color: "green" }}>
                    {lesson.userStatus === "completed" ? "Completed" : "In Progress"}
                  </Typography>
                )}

                <Box sx={{ height: 8, borderRadius: 4,width:'80%', mx: "auto", backgroundColor: "#e0e0e0", overflow: "hidden", mb: 1 }}>
                  <Box
                    sx={{
                      height: "100%",
                      width: lesson.userStatus === "completed" ? "100%" : lesson.userStatus === "in-progress" ? "50%" : "0%",
                      backgroundColor: "#4caf50",
                      transition: "width 0.3s ease",
                    }}
                  />
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default PPTLessonViewer;
