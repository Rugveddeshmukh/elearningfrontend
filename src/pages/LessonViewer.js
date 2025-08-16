import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  List,
  ListItem,
  CardMedia,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button
} from '@mui/material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = 'http://localhost:5000';

const PPTLessonViewer = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [lessonsByCourse, setLessonsByCourse] = useState({});
  const [activeLesson, setActiveLesson] = useState(null);

  // Helper to return full file URL
  const getFileUrl = (filePath) => {
    if (!filePath) return '';
    return filePath.startsWith('http')
      ? filePath
      : `${BACKEND_URL}/uploads/${filePath}`;
  };

  // Fetch categories & courses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, courseRes] = await Promise.all([
          api.get('/course/categories'),
          api.get('/course'),
        ]);
        setCategories(['All Categories', ...categoryRes.data]);
        setAllCourses(courseRes.data);
        setFilteredCourses(courseRes.data);
      } catch (err) {
        console.error('Error loading categories or courses', err);
      }
    };
    fetchData();
  }, []);

  // Fetch subcategories
  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'All Categories') {
      const fetchSubcategories = async () => {
        try {
          const res = await api.get(`/course/subcategories/${selectedCategory}`);
          setSubcategories(res.data);
        } catch (err) {
          console.error('Error loading subcategories', err);
        }
      };
      fetchSubcategories();
    } else {
      setSubcategories([]);
      setSelectedSubcategory('');
    }
  }, [selectedCategory]);

  // Filter courses
  useEffect(() => {
    if (selectedCategory === 'All Categories') {
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

  if (activeLesson) {
    // Show PPT Viewer
    return (
      <Box p={3}>
        <Button variant="outlined" onClick={() => setActiveLesson(null)} sx={{ mb: 2 }}>
          ← Back to Lessons
        </Button>
        <Typography variant="h5" gutterBottom>
          {activeLesson.title}
        </Typography>
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(getFileUrl(activeLesson.ppt))}`}
          width="100%"
          height="600px"
          frameBorder="0"
          title="PPT Viewer"
        />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Category Dropdown */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={selectedCategory}
          label="Category"
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedSubcategory('');
          }}
        >
          {categories.map((cat, idx) => (
            <MenuItem key={idx} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Subcategory Dropdown */}
      {subcategories.length > 0 && selectedCategory !== 'All Categories' && (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Subcategory</InputLabel>
          <Select
            value={selectedSubcategory}
            label="Subcategory"
            onChange={(e) => setSelectedSubcategory(e.target.value)}
          >
            {subcategories.map((subcat, idx) => (
              <MenuItem key={idx} value={subcat}>
                {subcat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Courses + Lessons */}
      {filteredCourses.map((course) => (
        <Box key={course._id} mb={5}>
          {/* <Typography variant="h5" gutterBottom>
            📘 {course.title}
          </Typography> */}

          <List>
            {(lessonsByCourse[course._id] || []).length === 0 ? (
              <Typography variant="body1">No lessons available.</Typography>
            ) : (
              lessonsByCourse[course._id].map((lesson) => (
                <ListItem key={lesson._id} sx={{ display: 'block', mb: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <CardMedia
                        component="img"
                        height="120"
                        image={getFileUrl(lesson.thumbnail)}
                        alt={`${lesson.title} Thumbnail`}
                        sx={{ objectFit: 'cover', borderRadius: 1, cursor: 'pointer' }}
                        onClick={() => setActiveLesson(lesson)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={9}>
                      <Typography variant="h6">
                        {lesson.title || 'Untitled Lesson'}
                      </Typography>
                    </Grid>
                  </Grid>
                </ListItem>
              ))
            )}
          </List>
        </Box>
      ))}

      {selectedCategory !== 'All Categories' &&
        selectedSubcategory &&
        filteredCourses.length === 0 && (
          <Typography variant="body1">
            No courses found for the selected category/subcategory.
          </Typography>
        )}
    </Box>
  );
};

export default PPTLessonViewer;
