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

const BACKEND_URL = "http://localhost:5000";

const PPTLessonViewer = ({ setSelectedMenu }) => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [allCourses, setAllCourses] = useState([]);
  const [lessonsByCourse, setLessonsByCourse] = useState({});
  const [activeLesson, setActiveLesson] = useState(null);
  const [showPPT, setShowPPT] = useState(null);

  // File URL handler
  const getFileUrl = (filePath) => {
    if (!filePath) return "";
    return filePath.startsWith("http")
      ? filePath
      : `${BACKEND_URL}/uploads/${filePath}`;
  };

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

  // Fetch courses
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

  // Fetch lessons per course
  useEffect(() => {
    const fetchLessons = async () => {
      const lessonsMap = {};
      for (const course of allCourses) {
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

    if (allCourses.length > 0) {
      fetchLessons();
    }
  }, [allCourses, token]);

  const allLessons = allCourses.flatMap(
    (course) => lessonsByCourse[course._id] || []
  );

  const visibleLessons = allLessons.slice(0, 4);

  // =================== UI Rendering ===================

  // PPT Viewer
  if (showPPT) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "0px",
        }}
      >
        <Box
          sx={{
            width: "80%",
            maxWidth: "1000px",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: 5,
          }}
        >
          <Box
            sx={{
              backgroundColor: "#000",
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "5px 20px",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {showPPT.title}
            </Typography>
            <Button
              onClick={handleClosePPT}
              sx={{ color: "#fff", minWidth: "auto", padding: 0 }}
            >
              ✕
            </Button>
          </Box>

          <Box sx={{ backgroundColor: "#000" }}>
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                getFileUrl(showPPT.ppt)
              )}`}
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

  // Active lesson view
  if (activeLesson) {
    return (
      <Box p={3}>
        <Button
          variant="outlined"
          onClick={() => setActiveLesson(null)}
          sx={{ mb: 2 }}
        >
          ← Back to My Courses
        </Button>

        <Card
          sx={{
            display: "flex",
            borderRadius: 2,
            overflow: "hidden",
            width: "90%",
          }}
        >
          {/* Thumbnail */}
          <Box sx={{ width: "40%" }}>
            <CardMedia
              component="img"
              height="100%"
              image={getFileUrl(activeLesson.thumbnail)}
              alt={activeLesson.title}
              style={{ objectFit: "cover", height: "100%" }}
            />
          </Box>

          {/* Lesson details */}
          <Box
            sx={{
              width: "60%",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              p: 2,
            }}
          >
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
              {activeLesson.title}
            </Typography>

            <Typography sx={{ mb: 1, fontWeight: "bold" }}>
              About the Lesson
            </Typography>

            <Typography
              sx={{
                fontWeight: 500,
                color: "text.secondary",
              }}
            >
              {activeLesson.title}
            </Typography>

            {/* Status */}
            {activeLesson.userStatus && (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  marginLeft: "60px",
                  marginTop: "20px",
                  color:
                    activeLesson.userStatus === "completed" ? "green" : "green",
                }}
              >
                {activeLesson.userStatus === "completed"
                  ? "Completed"
                  : "In Progress"}
              </Typography>
            )}

            {/* Progress Bar */}
            <Box
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "#e0e0e0",
                overflow: "hidden",
                width: "30%",
                marginTop: "8px",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width:
                    activeLesson.userStatus === "completed"
                      ? "100%"
                      : activeLesson.userStatus === "in-progress"
                      ? "50%"
                      : "0%",
                  backgroundColor:
                    activeLesson.userStatus === "completed"
                      ? "#4caf50"
                      : activeLesson.userStatus === "in-progress"
                      ? "#4caf50"
                      : "#e0e0e0",
                  transition: "width 0.3s ease",
                }}
              />
            </Box>
          </Box>
        </Card>

        {/* Modules */}
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
            </Box>
          </Card>
        </Box>
      </Box>
    );
  }

  // Default Courses grid
  return (
    <Box
      p={1}
      sx={{
        backgroundColor: "#fff",
        border: "1px solid #ddd",
        borderRadius: 2,
        width: "100%",
        maxWidth: "1100px",
        mx: "auto",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 0,
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
      <Divider sx={{ borderColor: "#ccc", marginTop: "3px" }} />

      {/* Course Grid */}
      <Grid container spacing={3}>
        {visibleLessons.length === 0 ? (
          <Typography variant="body1">No lessons available.</Typography>
        ) : (
          visibleLessons.map((lesson) => (
            <Grid
              item
              key={lesson._id}
              sx={{
                flex: "0 0 23%",
                maxWidth: "23%",
                px: 1,
                mb: 3,
              }}
            >
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: 3,
                  cursor: "pointer",
                  marginTop: "40px",
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
                />
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "18px",
                      mb: 1,
                    }}
                  >
                    {lesson.title}
                  </Typography>

                  {lesson.userStatus && (
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        marginBottom: "10px",
                        color:
                          lesson.userStatus === "completed" ? "green" : "green",
                      }}
                    >
                      {lesson.userStatus === "completed"
                        ? "Completed"
                        : "In Progress"}
                    </Typography>
                  )}

                  {/* Progress bar */}
                  <Box
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#e0e0e0",
                      overflow: "hidden",
                      mb: 1,
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
                            : lesson.userStatus === "in-progress"
                            ? "#4caf50"
                            : "#e0e0e0",
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
