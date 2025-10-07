import React, { useState } from "react";
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";

import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  History as HistoryIcon,
  HelpOutline as HelpIcon,
  AccountCircle as CertificateIcon,
  Explore as UserIcon,
  CalendarMonth as CalendarIcon,
  CloudDownload as DownloadIcon,
  Feedback as FeedbackIcon,
  UploadFile as UploadIcon,
  Report as ReportIcon,
  Assignment as TicketsIcon,
  ExitToApp,
} from "@mui/icons-material";

import UserList from "../components/UserList";
import ProfilePage from "./ProfilePage";
import CourseManager from "../components/CourseManager";
import PPTLessonManager from "../components/PPTLessonManager";
import QuizManager from "../components/QuizManager";
import AdminQuizStats from "../components/AdminQuizStats";
import AdminTickets from "../components/AdminTickets";
import AdminHelp from "../components/AdminHelp";
import AdminSendNotification from "../components/AdminSendNotification";
import DownloadUsersExcel from "../DownloadReport/DownloadUsersExcel";
import DownloadQuizExcel from "../DownloadReport/DownloadQuizExcel";
import AdminUserStats from "../components/AdminUserStats";

const drawerWidth = 240;

const ResultPage = () => {
  const [selectedMenu, setSelectedMenu] = useState("Dashboard");
  const [anchorEl, setAnchorEl] = useState(null);

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon /> },
    { text: "User Management", icon: <UserIcon /> },
    { text: "Course Management", icon: <SchoolIcon /> },
    { text: "Lesson Management", icon: <HistoryIcon /> },
    { text: "Assessment Management", icon: <HelpIcon /> },
    { text: "Assessment Status Tracker", icon: <CalendarIcon /> },
    { text: "Certificates", icon: <CertificateIcon /> },
    { text: "Reports & Analytics", icon: <ReportIcon /> },
    { text: "Notifications Manager", icon: <ReportIcon /> },
    // { text: "Reviews & Feedback", icon: <FeedbackIcon /> },
    { text: "Help Document Upload", icon: <UploadIcon /> },
    { text: "Download Reports", icon: <DownloadIcon /> },
    { text: "Support Tickets", icon: <TicketsIcon /> },
  ];

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#fff",
            color: "#333",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Toolbar
          sx={{
            background: "#003366",
            color: "#fff",
            justifyContent: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Admin Dashboard
          </Typography>
        </Toolbar>

        {/* Menu List */}
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => handleMenuClick(item.text)}
                sx={{
                  backgroundColor:
                    selectedMenu === item.text ? "#e6f0ff" : "inherit",
                  "&:hover": { backgroundColor: "#e6f0ff" },
                }}
              >
                <ListItemIcon sx={{ color: "#003366" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Logout Button */}
        <Box sx={{ p: 2 }}>
          <Button
            variant="contained"
            startIcon={<ExitToApp />}
            fullWidth
            sx={{
              bgcolor: "#e53935",
              color: "#fff",
              textTransform: "none",
              borderRadius: "30px",
              py: 1.5,
              "&:hover": { bgcolor: "#d32f2f" },
            }}
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                });
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
              } catch (err) {
                console.error("Logout failed:", err);
              }
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          bgcolor: "#f4f6f8",
        }}
      >
        {/* Topbar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: "#fff",
            borderBottom: "1px solid #ddd",
            px: 2,
            flexShrink: 0,
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography
              variant="h6"
              sx={{ color: "#003366", fontWeight: "bold" }}
            >
              {selectedMenu}
            </Typography>

            {/* Profile Avatar Only */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                sx={{ ml: 2, cursor: "pointer", bgcolor: "#003366" }}
                onClick={handleProfileClick}
              />

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileClose}
              >
                <MenuItem
                  onClick={() => {
                    setSelectedMenu("Profile");
                    handleProfileClose();
                  }}
                >
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={async () => {
                    try {
                      await fetch("/api/auth/logout", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                      });
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      window.location.href = "/login";
                    } catch (err) {
                      console.error("Logout failed:", err);
                    }
                    handleProfileClose();
                  }}
                >
                  Log Out
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Scrollable Content */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
          {selectedMenu === "Dashboard" && <AdminUserStats />}
          {selectedMenu === "User Management" && <UserList />}
          {selectedMenu === "Course Management" && <CourseManager />}
          {selectedMenu === "Lesson Management" && <PPTLessonManager />}
          {selectedMenu === "Assessment Management" && <QuizManager />}
          {selectedMenu === "Assessment Status Tracker" && <AdminQuizStats />}
          {selectedMenu === "Certificates" && (
            <Typography variant="h5">Coming Soon</Typography>
          )}
          {selectedMenu === "Reports & Analytics" && (
            <Typography variant="h5">Comming Soon</Typography>
          )}
          {selectedMenu === "Notifications Manager" && <AdminSendNotification />}
          {selectedMenu === "Reviews & Feedback" && (
            <Typography variant="h5">User Feedback & Ratings</Typography>
          )}
          {selectedMenu === "Help Document Upload" && <AdminHelp />}
          {selectedMenu === "Profile" && <ProfilePage />}
          {selectedMenu === "Download Reports" && (
            <>
              <DownloadUsersExcel />
              <DownloadQuizExcel />
            </>
          )}
          {selectedMenu === "Support Tickets" && <AdminTickets />}
        </Box>
      </Box>
    </Box>
  );
};

export default ResultPage;
