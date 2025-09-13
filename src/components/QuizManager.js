import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem,Card, CardContent, CardActions } from '@mui/material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function AdminQuizUpload() {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [passPercentage, setPassPercentage] = useState(60);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [file, setFile] = useState(null);

  // Fetch courses on mount
  useEffect(() => {
    api.get('/course', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCourses(res.data || []))
      .catch(err => console.error(err));
  }, [token]);

  // Fetch lessons when course changes
  useEffect(() => {
    if (!courseId) {
      setLessons([]);
      setLessonId('');
      return;
    }

    api.get(`/lesson/${courseId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setLessons(res.data || []))
      .catch(err => console.error('Error fetching lessons', err));
  }, [courseId, token]);

  useEffect(() => {
    api.get('/quiz', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setQuizzes(res.data || []))
      .catch(err => console.error('Error fetching quizzes', err));
  }, [token]);

  const handleSubmit = async () => {
    if (!file) return alert('Please select a CSV file');
    if (!lessonId) return alert('Please select a lesson');

    const fd = new FormData();
    fd.append('lessonId', lessonId);
    fd.append('passPercentage', passPercentage);
    fd.append('durationMinutes', durationMinutes);
    fd.append('file', file);

    try {
      const res = await api.post('/quiz/upload-csv', fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      const uploadedLesson = lessons.find(l => l._id === lessonId);
      alert('Uploaded Quiz successfully: ' + (uploadedLesson?.title || 'OK'));
      setQuizzes(prev => [...prev, res.data.quiz]);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await api.delete(`/quiz/${quizId}`, { headers: { Authorization: `Bearer ${token}` } });
      setQuizzes(prev => prev.filter(q => q._id !== quizId));
      alert("Quiz deleted successfully");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <Box p={3} sx={{ maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h6">Upload Quiz CSV</Typography>

      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Select Course</InputLabel>
        <Select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          {courses.map(c => (
            <MenuItem key={c._id} value={c._id}>{c.title}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Select Lesson</InputLabel>
        <Select value={lessonId} onChange={(e) => setLessonId(e.target.value)}>
          {lessons.length > 0 ? lessons.map(l => (
            <MenuItem key={l._id} value={l._id}>{l.title}</MenuItem>
          )) : <MenuItem value="">No lessons available</MenuItem>}
        </Select>
      </FormControl>

      <TextField
        type="number"
        label="Pass Percentage"
        fullWidth
        sx={{ mt: 2 }}
        value={passPercentage}
        onChange={(e) => setPassPercentage(e.target.value)}
      />

      <TextField
        type="number"
        label="Duration (minutes, 0 = no limit)"
        fullWidth
        sx={{ mt: 2 }}
        value={durationMinutes}
        onChange={(e) => setDurationMinutes(e.target.value)}
      />

      <Box sx={{ mt: 2 }}>
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </Box>

      <Button sx={{ mt: 2 }} variant="contained" onClick={handleSubmit}>Upload</Button>

      {/* Quiz List */}
      <Typography variant="h6" sx={{ mt: 4 }}>All Quizzes</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 2, mt: 2 }}>
        {quizzes.map(q => (
          <Card key={q._id} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1">{q.lessonId?.title || "Untitled Lesson"}</Typography>
              <Typography variant="body2">Questions: {q.questions?.length || "—"}</Typography>
              <Typography variant="body2">Pass: {q.passPercentage}%</Typography>
            </CardContent>
            <CardActions>
              <Button color="error" onClick={() => handleDelete(q._id)}>Delete</Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
