
import React, { useState, useEffect } from 'react';
import { Typography, Button, TextField, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function QuizCSVUpload() {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [courseName, setCourseName] = useState('');
  const [passPercentage, setPassPercentage] = useState(60);
  const [durationMinutes, setDurationMinutes] = useState(0); // 0 = no limit
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/course'); 
        setCourses(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  const onFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (ext !== 'csv') {
      alert('Please upload a CSV file only.');
      e.target.value = null;
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !courseName) return alert('Please fill in required fields.');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseName', courseName);
    formData.append('passPercentage', passPercentage);
    formData.append('durationMinutes', durationMinutes);

    setLoading(true);
    try {
      const res = await api.post('/quiz/uploadCSV', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token || localStorage.getItem('token')}`
        }
      });
      alert('Upload successful');
      console.log(res.data);
      setFile(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 640, margin: 'auto', padding: 20 }}>
      <Typography variant="h5" gutterBottom>Upload Quiz CSV</Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Course</InputLabel>
        <Select value={courseName} onChange={(e) => setCourseName(e.target.value)} required>
          {courses.map((c) => (
            <MenuItem key={c._id} value={c.title || c.name || c._id}>
              {c.title || c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        type="number"
        label="Pass Percentage"
        fullWidth
        value={passPercentage}
        onChange={(e) => setPassPercentage(Number(e.target.value))}
        required
        sx={{ mb: 2 }}
      />

      <TextField
        type="number"
        label="Duration (minutes, 0 = no limit)"
        fullWidth
        value={durationMinutes}
        onChange={(e) => setDurationMinutes(Number(e.target.value))}
        sx={{ mb: 2 }}
      />

      <input accept=".csv" type="file" onChange={onFileChange} style={{ display: 'block', marginBottom: 12 }} />

      <Button type="submit" variant="contained" disabled={loading} fullWidth>
        {loading ? 'Uploading...' : 'Upload CSV'}
      </Button>
    </form>
  );
}
