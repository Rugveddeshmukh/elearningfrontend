import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, Card, CardContent, CardActions, Divider
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

  useEffect(() => {
    api.get('/course').then(res => {
      const allCourses = res.data;
      setCourses(allCourses);
      const cats = [...new Set(allCourses.map(c => c.category))].filter(Boolean);
      setCategories(cats);
    });
  }, []);

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

  useEffect(() => {
    if (selectedSubcategory) setSelectedCourse('');
  }, [selectedSubcategory]);

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
    <Box sx={{ p: 1, maxWidth: 1200, mx: 'auto' }}>
      {/* Centered Title */}
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', color: '#003366', mb: 3 }}>
       Lesson Upload with Preview
      </Typography>

      {/* Category Dropdown */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          {categories.map((cat, idx) => (
            <MenuItem key={idx} value={cat}>{cat}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Subcategory Dropdown */}
      <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedCategory}>
        <InputLabel>Subcategory</InputLabel>
        <Select value={selectedSubcategory} onChange={(e) => setSelectedSubcategory(e.target.value)}>
          {subcategories.map((sub, idx) => (
            <MenuItem key={idx} value={sub}>{sub}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Course Dropdown */}
      <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedSubcategory}>
        <InputLabel>Course</InputLabel>
        <Select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
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

      {/* File Inputs + Button in one line */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <p style={{marginBottom:"25px"}}>Only PPT Uploaded</p>
        <input type="file" accept=".ppt,.pptx,.pdf" onChange={(e) => handleFileChange(e, 'ppt')} />
        <p style={{marginBottom:"25px"}}>Only Thumbnail (Images)</p>
        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'thumbnail')} />
        <Button variant="contained" onClick={handleSubmit} style={{width:'25%'}}>Submit</Button>
      </Box>

      {/* Centered All Uploaded Lessons */}
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', color: '#003366', mt: 5, mb: 3 }}>
        All Lessons
      </Typography>

      {/* Lessons Grid - 4 per row */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: 2
      }}>
        {lessons.map((lesson) => (
          <Card key={lesson._id} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1">{lesson.title || 'Untitled Lesson'}</Typography>
              <Typography variant="body2">
                Course: {courses.find(c => c._id === lesson.courseId)?.title || 'Unknown'}
              </Typography>
              {lesson.thumbnail && (
                <Box sx={{ mt: 1 }}>
                  <img src={getFileUrl(lesson.thumbnail)} alt="Thumbnail" width={120} style={{ borderRadius: 4 }} />
                </Box>
              )}
            </CardContent>
            <CardActions>
              <Button color="error" onClick={() => handleDelete(lesson._id)}>Delete</Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default PPTLessonManager;
