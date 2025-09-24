import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Button,
  Box,
  TextField,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const DownloadUsersExcel = () => {
  const { token } = useAuth();

  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-12-31");

  const handleDownload = async () => {
    try {
      const res = await api.get("/admin/all-users", {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate, endDate },
      });

      const users = res.data.users;

      if (!users || users.length === 0) {
        alert("No users available to download.");
        return;
      }

      const data = users.map((user) => ({
        "Employee ID": user.employeeId,
        "Full Name": user.fullName,
        Email: user.email,
        "Contact No": user.contactNo,
        "Team Leader": user.teamLeader,
        Designation: user.designation,
        Approval: user.isApproved ? "Approved" : "Pending",
        Status: user.isBlocked ? "Inactive" : "Active",
        "Approve Date":
          user.isApproved && user.approvedAt
            ? new Date(user.approvedAt).toLocaleDateString()
            : "Pending",
        "Last Login":
          user.loginHistory && user.loginHistory.length > 0
            ? `${new Date(
                user.loginHistory[user.loginHistory.length - 1].timestamp
              ).toLocaleString()} | Device: ${
                user.loginHistory[user.loginHistory.length - 1].deviceType ||
                "Unknown"
              } | IP: ${
                user.loginHistory[user.loginHistory.length - 1].ip || "N/A"
              }`
            : "N/A",
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const fileData = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(fileData, "UserList.xlsx");
    } catch (err) {
      console.error("Error downloading Excel:", err);
    }
  };

  return (
    <Box display="flex" justifyContent="flex-start" mt={4}>
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
            📊 User List Report
          </Typography>
          <Box display="flex" gap={2} alignItems="center" mt={2}>
            <TextField
              type="date"
              label="Start Date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <TextField
              type="date"
              label="End Date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Button variant="contained" color="success" onClick={handleDownload}>
              Download Excel
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DownloadUsersExcel;
