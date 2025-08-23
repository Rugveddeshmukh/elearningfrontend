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
} from "@mui/material";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const BACKEND_URL = "https://backend-gels.vercel.app";

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

  // Helper to return full file URL
  const getFileUrl = (filePath) => {
    if (!filePath) return "";
    return filePath.startsWith("http")
      ? filePath
      : `${BACKEND_URL}/uploads/${filePath}`;
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

  // Fetch subcategories
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

  // Fetch lessons per course
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

  // 1️⃣ PPT View Mode
  if (showPPT) {
    return (
      <Box p={3}>
        <Button variant="outlined" onClick={() => setShowPPT(null)} sx={{ mb: 2 }}>
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

  // 2️⃣ Active Lesson Details
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

        <Card sx={{ display: "flex", borderRadius: 2, overflow: "hidden",width:'90%' }}>
          {/* Left Side Thumbnail */}
          <Box sx={{ width: "40%" }}>
            <CardMedia
              component="img"
              height="100%"
              image={getFileUrl(activeLesson.thumbnail)}
              alt={activeLesson.title}
              style={{ objectFit: "cover", height: "100%" }}
            />
          </Box>

          {/* Right Side Title */}
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

        {/* Modules Section */}
        <Typography
          variant="h6"
          sx={{
            backgroundColor: "#f5f7fa",
            padding: "15px 15px",
            borderRadius: "4px 4px 0 0",
            fontWeight: 600,
            border: "1px solid #ddd",
            borderBottom: "none",
             width:'87%',
            marginTop: "40px",
          }}
        >
          Modules
        </Typography>

        {/* Single Module Card */}
        <Box>
          <Card
            sx={{
              display: "flex",
               width:'87%',
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
            onClick={() => setShowPPT(activeLesson)}
          >
            {/* Left side Icon */}
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

            {/* Right side Texts */}
            <Box>
              <Typography variant="subtitle1" fontWeight="600">
                {activeLesson.moduleName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activeLesson.title}
              </Typography>
            </Box>
          </Card>
        </Box>
      </Box>
    );
  }

  // 3️⃣ Default View (Courses + Lessons)
  return (
    <Box p={3}>
      {/* Category + Subcategory Dropdown */}
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

      {/* Lessons list */}
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
                      "&:hover": { transform: "scale(1.03)" },
                    }}
                    onClick={() => setActiveLesson(lesson)}
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
