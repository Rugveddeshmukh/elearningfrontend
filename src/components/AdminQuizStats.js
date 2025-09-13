import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AdminQuizStats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        if (!token) throw new Error('No token found. Please login.');

        const res = await api.get('/quiz/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch quiz stats:', err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) return <Box p={3}><CircularProgress /></Box>;
  if (error) return <Box p={3}><Typography color="error">{error}</Typography></Box>;

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>Quiz Stats</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User Name</TableCell>
            <TableCell>Lesson</TableCell>
            <TableCell>Total Attempts</TableCell>
            <TableCell>Pass</TableCell>
            <TableCell>Fail</TableCell>
            <TableCell>Score</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Time Taken (s)</TableCell>
            <TableCell>Time Expired</TableCell>
            <TableCell>Average Score</TableCell>
            <TableCell>Attempted At</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stats.length > 0 ? (
            stats.flatMap((quiz) =>
              quiz.attempts.map((a, i) => (
                <TableRow key={`${quiz._id}-${i}`}>
                  <TableCell>{a.user?.name || 'N/A'}</TableCell>
                  <TableCell>{quiz.lessonId?.title || '-'}</TableCell>
                  <TableCell>{quiz.totalAttempts ?? 0}</TableCell>
                  <TableCell>{quiz.passCount ?? 0}</TableCell>
                  <TableCell>{quiz.failCount ?? 0}</TableCell>
                  <TableCell>{a.score ?? '-'}</TableCell>
                  <TableCell>{a.status ?? '-'}</TableCell>
                  <TableCell>{a.timeTaken ?? '-'}</TableCell>
                  <TableCell>{a.timeExpired ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{quiz.averageScore ?? 0}</TableCell>
                  <TableCell>{a.attemptedAt ? new Date(a.attemptedAt).toLocaleString() : '-'}</TableCell>
                </TableRow>
              ))
            )
          ) : (
            <TableRow>
              <TableCell colSpan={11} align="center">No quizzes found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

export default AdminQuizStats;
