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
  Button,
  Paper,
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
      setError(null);
      if (!token) throw new Error('No token found. Please login.');

      const query = [];
      if (startDate) query.push(`start=${encodeURIComponent(startDate)}`);
      if (endDate) query.push(`end=${encodeURIComponent(endDate)}`);
      const queryStr = query.length > 0 ? `?${query.join('&')}` : '';

      const res = await api.get(`/quiz/admin/stats${queryStr}`, {
        headers: { Authorization: `Bearer ${token}` },
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
    <Box maxWidth="95%" mx="auto" mt={2}>
      {/* Header */}
      <Typography
        variant="h5"
        mb={2}
        color="#003366"
        fontWeight={'bold'}
        textAlign={'center'}
      >
        Quiz Stats
      </Typography>

      {/* Date Filter aligned right */}
      <Box
        display="flex"
        gap={2}
        alignItems="center"
        flexWrap="wrap"
        justifyContent="flex-end"
        mb={1}
      >
        <TextField
          label="Start Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="End Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        />
        <Button
          variant="contained"
          onClick={fetchStats}
          size="medium"
          sx={{
            bgcolor: '#003366',
            '&:hover': { bgcolor: '#002244' },
            textTransform: 'none',
          }}
        >
          FILTER
        </Button>
      </Box>

      {loading ? (
        <Box p={3} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box p={3}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table
            sx={{
              borderCollapse: 'collapse',
              width: '100%',
              "& th, & td": {
                border: '1px solid #cfd8dc',
                padding: '8px 10px',
                textAlign: 'center',
                fontSize: '14px',
              },
              "& th": {
                backgroundColor: '#f1f5f9',
                fontWeight: 'bold',
                color: '#003366',
              },
              "& tr:nth-of-type(even)": {
                backgroundColor: '#f9fafb',
              },
              "& tr:hover": {
                backgroundColor: '#e8f0fe',
              },
            }}
          >
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
                  <TableCell colSpan={6} align="center">
                    No quizzes found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default AdminQuizStats;
