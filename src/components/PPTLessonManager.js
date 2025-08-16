import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, List, ListItem, IconButton, Link
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PPTLessonManager = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [lessons, setLessons] = useState([]);
  const [form, setForm] = useState({ title: '', ppt: null, thumbnail: null });

  // Helper to handle local vs Cloudinary URLs
  const getFileUrl = (filePath) => {
    if (!filePath) return '';
    return filePath.startsWith('http')
      ? filePath
      : `${process.env.REACT_APP_BACKEND_URL}/uploads/${filePath}`;
  };

  useEffect(() => {
    api.get('/course').then(res => setCourses(res.data));
  }, []);

  useEffect(() => {
    if (courseId) {
      api.get(`/lesson/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setLessons(res.data));
    }
  }, [courseId, token]);

  const handleFileChange = (e, type) => {
    setForm({ ...form, [type]: e.target.files[0] });
  };

  const handleSubmit = async () => {
    if (!form.ppt || !form.thumbnail || !courseId) {
      return alert("Course, PPT, and Thumbnail are required");
    }

    const formData = new FormData();
    formData.append('courseId', courseId);
    formData.append('ppt', form.ppt);
    formData.append('thumbnail', form.thumbnail);
    if (form.title) formData.append('title', form.title);

    try {
      await api.post('/lesson', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setForm({ title: '', ppt: null, thumbnail: null });
      const updated = await api.get(`/lesson/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLessons(updated.data);
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/lesson/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const updated = await api.get(`/lesson/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setLessons(updated.data);
  };

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Upload PPT Lessons with Thumbnails
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Course</InputLabel>
        <Select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        >
          {courses.map((c) => (
            <MenuItem key={c._id} value={c._id}>
              {c.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Lesson Title (optional)"
        fullWidth
        sx={{ mb: 2 }}
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

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

      <List sx={{ mt: 4 }}>
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

              {/* Only show thumbnail if PPT exists */}
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

              {/* Optional: show message if no PPT */}
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
