import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { MenuBook as MenuBookIcon } from "@mui/icons-material";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const BACKEND_URL = "https://backend-lb3d.vercel.app/";

const PPTLessonViewer = ({ setSelectedMenu }) => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [allCourses, setAllCourses] = useState([]);
  const [lessonsByCourse, setLessonsByCourse] = useState({});
  const [activeLesson, setActiveLesson] = useState(null);

  const getFileUrl = (filePath) => {
    if (!filePath) return "";
    return filePath.startsWith("http")
      ? filePath
      : `${BACKEND_URL}/uploads/${filePath}`;
  };

  const updateLessonStatus = async (lessonId, status) => {
    try {
      await api.put(
        `/lesson/${lessonId}/progress`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

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

  const handleActiveLessonClick = (lesson) => {
    setActiveLesson(lesson);
    setSelectedMenu("My Courses");

    if (!lesson.userStatus || lesson.userStatus === "not-started") {
      setLessonsByCourse((prev) => {
        const updated = { ...prev };
        for (const courseId in updated) {
          updated[courseId] = updated[courseId].map((l) =>
            l._id === lesson._id ? { ...l, userStatus: "in-progress" } : l
          );
        }
        return updated;
      });
      updateLessonStatus(lesson._id, "in-progress");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await api.get("/course");
        setAllCourses(courseRes.data);
      } catch (err) {
        console.error("Error loading courses", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchLessons = async () => {
      const lessonsMap = {};
      for (const course of allCourses) {
        try {
          const res = await api.get(`/lesson/${course._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          lessonsMap[course._id] = res.data.map((lesson) => ({
            ...lesson,
            userStatus: lesson.userStatus || "not-started",
          }));
        } catch (err) {
          console.error(`Error loading lessons for course ${course.title}`, err);
        }
      }
      setLessonsByCourse(lessonsMap);
    };

    if (allCourses.length > 0) fetchLessons();
  }, [allCourses, token]);

  const allLessons = allCourses.flatMap(
    (course) => lessonsByCourse[course._id] || []
  );

  const visibleLessons = allLessons.slice(0, 4);

  return (
    <Box
      p={1}
      sx={{
        backgroundColor: "#fff",
        border: "1px solid #ddd",
        borderRadius: 2,
        width: "100%",
        maxWidth: "1200px",
        mx: "auto",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MenuBookIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            My Courses
          </Typography>
        </Box>
        {allLessons.length > 4 && (
          <Button
            variant="text"
            onClick={() => setSelectedMenu("My Courses")}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            View More →
          </Button>
        )}
      </Box>

      <Divider sx={{ borderColor: "#ccc", marginBottom: 1 }} />

      {/* Course Grid */}
      <Grid
        container
        spacing={2}
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {visibleLessons.length === 0 ? (
          <Typography variant="body1" sx={{ m: 2 }}>
            No lessons available.
          </Typography>
        ) : (
          visibleLessons.map((lesson) => (
            <Grid
              item
              key={lesson._id}
              sx={{
                flex: "1 1 100%", // mobile full width
                maxWidth: "100%",
                "@media (min-width:600px)": {
                  flex: "1 1 48%", // tablets → 2 cards per row
                  maxWidth: "48%",
                },
                "@media (min-width:900px)": {
                  flex: "1 1 31%", // small desktops → 3 cards per row
                  maxWidth: "31%",
                },
                "@media (min-width:1200px)": {
                  flex: "1 1 23%", // large desktops → 4 cards per row
                  maxWidth: "23%",
                },
              }}
            >
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: 3,
                  cursor: "pointer",
                  height: "280px",
                  display: "flex",
                  flexDirection: "column",
                  transition: "0.3s",
                  "&:hover": { transform: "scale(1.03)" },
                }}
                onClick={() => handleActiveLessonClick(lesson)}
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={getFileUrl(lesson.thumbnail)}
                  alt={lesson.title}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ textAlign: "center", flexGrow: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "16px",
                      mb: 1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {lesson.title}
                  </Typography>
                  {lesson.userStatus && (
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        marginBottom: 1,
                        color: lesson.userStatus === "completed" ? "green" : "#4caf50",
                      }}
                    >
                      {lesson.userStatus === "completed"
                      ? "Completed"
                      : lesson.userStatus === "in-progress"
                      ? "In Progress"
                      : "Not Started"}
                    </Typography>
                  )}
                  <Box
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#e0e0e0",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width:
                          lesson.userStatus === "completed"
                            ? "100%"
                            : lesson.userStatus === "in-progress"
                            ? "50%"
                            : "0%",
                        backgroundColor:
                          lesson.userStatus === "completed"
                            ? "#4caf50"
                            : "#4caf50",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default PPTLessonViewer;
