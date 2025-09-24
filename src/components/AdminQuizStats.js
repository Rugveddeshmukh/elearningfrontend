import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  TextField,
  Button
} from '@mui/material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AdminQuizStats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { token } = useAuth();

  const fetchStats = async () => {
    try {
      setLoading(true);
      if (!token) throw new Error('No token found. Please login.');

      // Date filter query params
      const query = [];
      if (startDate) query.push(`start=${encodeURIComponent(startDate)}`);
      if (endDate) query.push(`end=${encodeURIComponent(endDate)}`);
      const queryStr = query.length > 0 ? `?${query.join('&')}` : '';

      const res = await api.get(`/quiz/admin/stats${queryStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(res.data || []);
    } catch (err) {
      console.error('Failed to fetch quiz stats:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  return (
    <Box p={3}>
      {/* Header + Date Filter in single row */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap">
        <Typography variant="h4">Quiz Stats</Typography>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            size="small"
          />
          <TextField
            label="End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            size="small"
          />
          <Button variant="contained" onClick={fetchStats} size="medium">Filter</Button>
        </Box>
      </Box>

      {loading ? (
        <Box p={3}><CircularProgress /></Box>
      ) : error ? (
        <Box p={3}><Typography color="error">{error}</Typography></Box>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User Name</TableCell>
              <TableCell>Lesson</TableCell>
              <TableCell>User Pass</TableCell>
              <TableCell>User Fail</TableCell>
              <TableCell>User Attempts</TableCell>
              <TableCell>User Avg Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.length > 0 ? (
              stats.flatMap((quiz) =>
                (quiz.userStats ?? []).map((u, i) => (
                  <TableRow key={`${quiz._id}-${u.user._id}-${i}`}>
                    <TableCell>{u.user?.fullName || 'N/A'}</TableCell>
                    <TableCell>{quiz.lessonId?.title || '-'}</TableCell>
                    <TableCell>{u.pass}</TableCell>
                    <TableCell>{u.fail}</TableCell>
                    <TableCell>{u.totalAttempts}</TableCell>
                    <TableCell>{u.averageScore}</TableCell>
                  </TableRow>
                ))
              )
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">No quizzes found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default AdminQuizStats;
