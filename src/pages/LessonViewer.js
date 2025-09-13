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
  Chip,
} from "@mui/material";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const BACKEND_URL = "https://backend-2rol.vercel.app/";

const PPTLessonViewer = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [lessonsByCourse, setLessonsByCourse] = useState({});
  const [activeLesson, setActiveLesson] = useState(null);
  const [showPPT, setShowPPT] = useState(null);

  const getFileUrl = (filePath) => {
    if (!filePath) return "";
    return filePath.startsWith("http")
      ? filePath
      : `${BACKEND_URL}/uploads/${filePath}`;
  };

  // ✅ Update lesson status in backend (user-specific)
  const updateLessonStatus = async (lessonId, status) => {
    try {
      await api.put(
        `/lesson/${lessonId}/progress`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // locally update lessonsByCourse state
      setLessonsByCourse((prev) => {
        const updated = { ...prev };
        for (const courseId in updated) {
          updated[courseId] = updated[courseId].map((l) =>
            l._id === lessonId ? { ...l, userStatus: status } : l
          );
        }
        return updated;
      });
    } catch (err) {
      console.error("Failed to update lesson status", err);
    }
  };

  // When opening PPT
  const handleOpenPPT = (lesson) => {
    setShowPPT(lesson);
    updateLessonStatus(lesson._id, "in-progress");
  };

  // When closing PPT (mark completed)
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
          const res = await api.get(
            `/course/subcategories/${selectedCategory}`
          );
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

  // Filter courses
  useEffect(() => {
    if (selectedCategory === "All Categories") {
      setFilteredCourses(allCourses);
    } else if (selectedCategory && selectedSubcategory) {
      const filtered = allCourses.filter(
        (course) =>
          course.category === selectedCategory &&
          course.subcategory === selectedSubcategory
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses([]);
    }
  }, [selectedCategory, selectedSubcategory, allCourses]);

  // Fetch lessons per course (with user status)
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

    if (filteredCourses.length > 0) {
      fetchLessons();
    } else {
      setLessonsByCourse({});
    }
  }, [filteredCourses, token]);

  // =================== UI Rendering ===================

  if (showPPT) {
    return (
      <Box p={3}>
        <Button variant="outlined" onClick={handleClosePPT} sx={{ mb: 2 }}>
          ← Back
        </Button>
        <Typography variant="h5" gutterBottom>
          {showPPT.title}
        </Typography>
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
            getFileUrl(showPPT.ppt)
          )}`}
          width="100%"
          height="600px"
          frameBorder="0"
          title="PPT Viewer"
        />
      </Box>
    );
  }

  if (activeLesson) {
    return (
      <Box p={3}>
        <Button
          variant="outlined"
          onClick={() => setActiveLesson(null)}
          sx={{ mb: 2 }}
        >
          ← Back to Lessons
        </Button>

        <Card
          sx={{
            display: "flex",
            borderRadius: 2,
            overflow: "hidden",
            width: "90%",
          }}
        >
          <Box sx={{ width: "40%" }}>
            <CardMedia
              component="img"
              height="100%"
              image={getFileUrl(activeLesson.thumbnail)}
              alt={activeLesson.title}
              style={{ objectFit: "cover", height: "100%" }}
            />
          </Box>

          <Box
            sx={{
              width: "20%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              textAlign="center"
              fontSize="20px"
            >
              {activeLesson.title}
            </Typography>
          </Box>
        </Card>

        <Typography
          variant="h6"
          sx={{
            backgroundColor: "#f5f7fa",
            padding: "15px 15px",
            borderRadius: "4px 4px 0 0",
            fontWeight: 600,
            border: "1px solid #ddd",
            borderBottom: "none",
            width: "87%",
            marginTop: "40px",
          }}
        >
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
            <Box sx={{ mr: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: "#e74c3c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                📄
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight="600">
                  {activeLesson.moduleName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeLesson.title}
                </Typography>
              </Box>
              {activeLesson.userStatus && (
                <Chip
                  label={activeLesson.userStatus}
                  color={
                    activeLesson.userStatus === "completed"
                      ? "success"
                      : "warning"
                  }
                  size="small"
                />
              )}
            </Box>
          </Card>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth sx={{ minWidth: 250 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSubcategory("");
              }}
            >
              {categories.map((cat, idx) => (
                <MenuItem key={idx} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth sx={{ minWidth: 250 }}>
            <InputLabel>Subcategory</InputLabel>
            <Select
              value={selectedSubcategory}
              label="Subcategory"
              onChange={(e) => setSelectedSubcategory(e.target.value)}
            >
              {subcategories.length > 0 ? (
                subcategories.map((subcat, idx) => (
                  <MenuItem key={idx} value={subcat}>
                    {subcat}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="">Subcategories</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {filteredCourses.map((course) => (
        <Box key={course._id} mb={5}>
          <Grid container spacing={3}>
            {(lessonsByCourse[course._id] || []).length === 0 ? (
              <Typography variant="body1">No lessons available.</Typography>
            ) : (
              (lessonsByCourse[course._id] || []).map((lesson) => (
                <Grid item xs={12} sm={6} md={4} key={lesson._id}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      boxShadow: 3,
                      cursor: "pointer",
                      marginTop: "40px",
                      transition: "0.3s",
                      position: "relative",
                      "&:hover": { transform: "scale(1.03)" },
                    }}
                    onClick={() => handleActiveLessonClick(lesson)}
                  >
                    <CardMedia
                      component="img"
                      height="160"
                      image={getFileUrl(lesson.thumbnail)}
                      alt={lesson.title}
                    />
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: "bold",
                          textAlign: "center",
                          fontSize: "22px",
                        }}
                      >
                        {lesson.title}
                      </Typography>
                    </CardContent>
                    {lesson.userStatus && (
                      <Chip
                        label={lesson.userStatus}
                        color={
                          lesson.userStatus === "completed"
                            ? "success"
                            : "warning"
                        }
                        size="small"
                        sx={{ position: "absolute", top: 10, right: 10 }}
                      />
                    )}
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

export default PPTLessonViewer;
