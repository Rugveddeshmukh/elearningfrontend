import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, TextField, Button, FormControl, InputLabel, 
  Select, MenuItem, Card, CardContent, CardActions,
  Dialog, DialogTitle, DialogContent, DialogActions as DialogAct
} from '@mui/material';
import { Delete } from "@mui/icons-material";
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
  const [searchTerm, setSearchTerm] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  // Fetch courses
  useEffect(() => {
    api.get('/course', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCourses(res.data || []))
      .catch(err => console.error(err));
  }, [token]);

  // Fetch lessons
  useEffect(() => {
    if (!courseId) { setLessons([]); setLessonId(''); return; }
    api.get(`/lesson/${courseId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setLessons(res.data || []))
      .catch(err => console.error(err));
  }, [courseId, token]);

  // Fetch quizzes
  useEffect(() => {
    api.get('/quiz', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setQuizzes(res.data || []))
      .catch(err => console.error(err));
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
      alert('Uploaded Assessment successfully: ' + (uploadedLesson?.title || 'OK'));
      setQuizzes(prev => [...prev, res.data.quiz]);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const openDeleteDialog = (quiz) => {
    setQuizToDelete(quiz);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!quizToDelete) return;
    try {
      await api.delete(`/quiz/${quizToDelete._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setQuizzes(prev => prev.filter(q => q._id !== quizToDelete._id));
      setDeleteDialogOpen(false);
      alert("Quiz deleted successfully");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <Box p={1} sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 'bold', color: "#003366", mb: 1 }}>
        Add Assessment CSV
      </Typography>

      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Select Course</InputLabel>
        <Select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          {courses.map(c => <MenuItem key={c._id} value={c._id}>{c.title}</MenuItem>)}
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

      <TextField type="number" label="Pass Percentage" fullWidth sx={{ mt: 2 }}
        value={passPercentage} onChange={(e) => setPassPercentage(e.target.value)} />

      <TextField type="number" label="Duration (minutes, 0 = no limit)" fullWidth sx={{ mt: 2 }}
        value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />

      <Box sx={{ mt: 2, display: "flex", justifyContent: "center", alignItems: "center", gap: 2 }}>
        <p style={{ marginBottom: "35px" }}>Only CSV file Uploaded</p>
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ width: "400px", height: "35px" }} />
        <Button variant="contained" onClick={handleSubmit} sx={{ width: "40%", height: "40px", fontWeight: "bold", background: "#2E7D32" }}>
          Submit
        </Button>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative", flexWrap: "wrap", mt: 5, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#003366", textAlign: "center", flex: 1, fontSize: "24px" }}>
          All Assessment
        </Typography>
        <Box sx={{ position: { xs: "static", sm: "absolute" }, right: { sm: 0 }, mt: { xs: 1, sm: 0 } }}>
          <TextField size="small" placeholder="Search lesson..." variant="outlined"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: { xs: "100%", sm: "250px" }, backgroundColor: "#fff" }} />
        </Box>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 2 }}>
        {quizzes.filter(q => q.lessonId?.title?.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(q => (
            <Card key={q._id} sx={{ borderRadius: 2, height: 170, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", textAlign: "center", p: 1 }}>
              <CardContent sx={{ flexGrow: 1, width: "100%", p: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {q.lessonId?.title || "Untitled Lesson"}
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  Questions: {q.questions?.length || "—"}
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  Pass: {q.passPercentage}%
                </Typography>
              </CardContent>

              <CardActions sx={{ justifyContent: "center", p: 2 }}>
                <Button variant="contained" onClick={() => openDeleteDialog(q)}
                  sx={{ backgroundColor: "#2E7D32", color: "#fff", fontWeight: "bold", "&:hover": { backgroundColor: "#1B5E20" }, borderRadius: "20px", px: 3 }}>
                  Delete
                </Button>
              </CardActions>
            </Card>
          ))}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Are you sure you want to delete this Assessment?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontWeight: "bold", mt: 1 }}>
            {quizToDelete?.lessonId?.title || "Untitled Lesson"}
          </Typography>
        </DialogContent>
        <DialogAct>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>OK</Button>
        </DialogAct>
      </Dialog>
    </Box>
  );
}
