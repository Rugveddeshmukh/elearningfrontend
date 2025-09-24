import React, { useState } from 'react';
import { Button, TextField, Box,Card,
  CardContent,
  Typography, } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const DownloadQuizExcel = () => {
  const { token } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const downloadFilteredExcel = async () => {
    if (!token) {
      alert("Please login to download.");
      return;
    }

    try {
      setLoading(true);

      // Build query for date filter
      const query = [];
      if (startDate) query.push(`start=${encodeURIComponent(startDate)}`);
      if (endDate) query.push(`end=${encodeURIComponent(endDate)}`);
      const queryStr = query.length > 0 ? `?${query.join('&')}` : '';

      // Fetch filtered stats from backend
      const res = await api.get(`/quiz/admin/stats${queryStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const filteredStats = res.data || [];
      if (filteredStats.length === 0) {
        alert("No data found for the selected date range.");
        return;
      }

      // Prepare data for Excel
      const dataToExport = filteredStats.flatMap((quiz) =>
        (quiz.userStats ?? []).map((u) => ({
          'User Name': u.user?.fullName || 'N/A',
          'Lesson': quiz.lessonId?.title || '-',
          'User Pass': u.pass,
          'User Fail': u.fail,
          'User Attempts': u.totalAttempts,
          'User Avg Score': u.averageScore
        }))
      );

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Filtered Quiz Stats');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, `Quiz_Stats_${startDate || 'start'}_${endDate || 'end'}.xlsx`);
    } catch (err) {
      console.error("Failed to download Excel:", err);
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="flex-start" mt={-20} ml={80}>
      <Card
        sx={{
          display: "inline-block",
          p: 2,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Assessment Report
          </Typography>

    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" mb={2}>
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
      <Button
        variant="contained"
        color="success" 
        onClick={downloadFilteredExcel}
        disabled={loading}
      >
        {loading ? 'Downloading...' : 'Download Excel'}
      </Button>
    </Box>
     </CardContent>
     </Card>
    </Box>
  );
};

export default DownloadQuizExcel;
