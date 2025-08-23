import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function AdminQuizUpload() {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [passPercentage, setPassPercentage] = useState(60);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [file, setFile] = useState(null);

  useEffect(() => {
    api.get('/course', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setCourses(res.data || []));
  }, [token]);

  const handleSubmit = async () => {
    if (!file) return alert('Please select a CSV file');
    if (!courseName && !courseId) return alert('Pick a course or type course name');

    const fd = new FormData();
    if (courseId) fd.append('courseId', courseId);
    if (courseName) fd.append('courseName', courseName);
    fd.append('passPercentage', passPercentage);
    fd.append('durationMinutes', durationMinutes);
    fd.append('file', file);

    try {
      const res = await api.post('/quiz/upload-csv', fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Uploaded: ' + (res.data?.quiz?.courseName || 'OK'));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <Box p={3} sx={{ maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h6">Upload Quiz CSV</Typography>

      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Select Course</InputLabel>
        <Select
          value={courseId}
          label="Select Course"
          onChange={(e) => setCourseId(e.target.value)}
        >
          {courses.map(c => (
            <MenuItem key={c._id} value={c._id}>{c.title}</MenuItem>
          ))}
        </Select>
      </FormControl>

       <TextField
        label="Course Name (if not selecting)"
        fullWidth
        sx={{ mt: 2 }}
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
      /> 

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
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </Box>

      <Button sx={{ mt: 2 }} variant="contained" onClick={handleSubmit}>Upload</Button>
    </Box>
  );
}
