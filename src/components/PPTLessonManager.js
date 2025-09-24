import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, List, ListItem, IconButton, Link, Divider
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PPTLessonManager = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [courses, setCourses] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const [lessons, setLessons] = useState([]);
  const [form, setForm] = useState({ title: '', ppt: null, thumbnail: null });

  const getFileUrl = (filePath) => {
    if (!filePath) return '';
    return filePath.startsWith('http')
      ? filePath
      : `${process.env.REACT_APP_BACKEND_URL}/uploads/${filePath}`;
  };

  // Fetch all courses initially
  useEffect(() => {
    api.get('/course').then(res => {
      const allCourses = res.data;
      setCourses(allCourses);
      const cats = [...new Set(allCourses.map(c => c.category))].filter(Boolean);
      setCategories(cats);
    });
  }, []);

  // Fetch all lessons initially (so they show below without selecting a course)
  useEffect(() => {
    const fetchAllLessons = async () => {
      try {
        const res = await api.get('/lesson', { headers: { Authorization: `Bearer ${token}` } });
        setLessons(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllLessons();
  }, [token]);

  // Update subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      const subs = courses
        .filter(c => c.category === selectedCategory)
        .map(c => c.subcategory)
        .filter(Boolean);
      setSubcategories([...new Set(subs)]);
      setSelectedSubcategory('');
      setSelectedCourse('');
    } else {
      setSubcategories([]);
      setSelectedSubcategory('');
      setSelectedCourse('');
    }
  }, [selectedCategory, courses]);

  // Clear selected course when subcategory changes
  useEffect(() => {
    if (selectedSubcategory) setSelectedCourse('');
  }, [selectedSubcategory]);

  // Fetch lessons for selected course
  const fetchLessonsForCourse = async (courseId) => {
    try {
      const res = await api.get(`/lesson/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
      setLessons(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedCourse) fetchLessonsForCourse(selectedCourse);
  }, [selectedCourse]);

  const handleFileChange = (e, type) => {
    setForm({ ...form, [type]: e.target.files[0] });
  };

  const handleSubmit = async () => {
    if (!form.ppt || !form.thumbnail || !selectedCourse) {
      return alert("Please select course, PPT, and thumbnail");
    }

    const formData = new FormData();
    formData.append('courseId', selectedCourse);
    formData.append('ppt', form.ppt);
    formData.append('thumbnail', form.thumbnail);
    if (form.title) formData.append('title', form.title);

    try {
      await api.post('/lesson', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });

      setForm({ title: '', ppt: null, thumbnail: null });
      // Fetch all lessons again to display below
      const res = await api.get('/lesson', { headers: { Authorization: `Bearer ${token}` } });
      setLessons(res.data);
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/lesson/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const res = await api.get('/lesson', { headers: { Authorization: `Bearer ${token}` } });
      setLessons(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Upload PPT Lessons with Thumbnails
      </Typography>

      {/* Category Dropdown */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat, idx) => (
            <MenuItem key={idx} value={cat}>{cat}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Subcategory Dropdown */}
      <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedCategory}>
        <InputLabel>Subcategory</InputLabel>
        <Select
          value={selectedSubcategory}
          onChange={(e) => setSelectedSubcategory(e.target.value)}
        >
          {subcategories.map((sub, idx) => (
            <MenuItem key={idx} value={sub}>{sub}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Course Dropdown */}
      <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedSubcategory}>
        <InputLabel>Course</InputLabel>
        <Select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          {courses
            .filter(c => c.category === selectedCategory && c.subcategory === selectedSubcategory)
            .map(c => (
              <MenuItem key={c._id} value={c._id}>{c.title}</MenuItem>
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

      {/* File Inputs */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">Upload PPT:</Typography>
        <input
          type="file"
          accept=".ppt,.pptx,.pdf"
          onChange={(e) => handleFileChange(e, 'ppt')}
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">Upload Thumbnail (Image):</Typography>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, 'thumbnail')}
        />
      </Box>

      <Button variant="contained" onClick={handleSubmit}>
        Upload Lesson
      </Button>

      <Divider sx={{ my: 3 }} />

      {/* All Lessons List */}
      <Typography variant="h6" gutterBottom>
        All Uploaded Lessons
      </Typography>

      {lessons.length === 0 && (
        <Typography color="text.secondary">No lessons uploaded yet.</Typography>
      )}

      <List sx={{ mt: 2 }}>
        {lessons.map((lesson) => (
          <ListItem
            key={lesson._id}
            secondaryAction={
              <IconButton onClick={() => handleDelete(lesson._id)}>
                <Delete />
              </IconButton>
            }
          >
            <Box>
              <Typography>{lesson.title || 'Untitled Lesson'}</Typography>
              <Typography variant="body2" color="text.secondary">
                Course: {courses.find(c => c._id === lesson.courseId)?.title || 'Unknown'}
              </Typography>

              {lesson.ppt && lesson.thumbnail && (
                <Box sx={{ my: 1 }}>
                  <Link
                    href={getFileUrl(lesson.ppt)}
                    target="_blank"
                    rel="noopener"
                    download
                  >
                    <img
                      src={getFileUrl(lesson.thumbnail)}
                      alt="Thumbnail"
                      width={120}
                      style={{ cursor: 'pointer', borderRadius: 4 }}
                    />
                  </Link>
                </Box>
              )}

              {!lesson.ppt && (
                <Typography color="error">No PPT uploaded</Typography>
              )}
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default PPTLessonManager;
