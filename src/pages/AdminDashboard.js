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
} from "@mui/material";

import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  History as HistoryIcon,
  HelpOutline as HelpIcon,
  AccountCircle as CertificateIcon,
  SupportAgent as SupportIcon,
  Notifications as NotificationsIcon,
  Explore as UserIcon,
  CalendarMonth as CalendarIcon,
  CloudDownload as DownloadIcon,
  Feedback as FeedbackIcon,
  UploadFile as UploadIcon,
  Report as ReportIcon,
  Assignment as TicketsIcon,
} from "@mui/icons-material";

import TotalUser from "../components/totaluser"; 
import UserList from "../components/UserList";
import CourseManager from "../components/CourseManager";
import PPTLessonManager from "../components/PPTLessonManager";
import QuizManager from "../components/QuizManager";
import AdminQuizStats from "../components/AdminQuizStats";

const drawerWidth = 240;

const ResultPage = () => {
  const [selectedMenu, setSelectedMenu] = useState("Dashboard");

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon /> },
    { text: "User Management", icon: <UserIcon /> },
    { text: "Course Management", icon: <SchoolIcon /> },
    { text: "Lesson Management", icon: <HistoryIcon /> },
    { text: "Quiz Management", icon: <HelpIcon /> },
    { text: "Quiz Status Tracker", icon: <CalendarIcon /> },
    { text: "Certificates", icon: <CertificateIcon /> },
    { text: "Reports & Analytics", icon: <ReportIcon /> },
    { text: "Notifications Manager", icon: <NotificationsIcon /> },
    { text: "Reviews & Feedback", icon: <FeedbackIcon /> },
    { text: "Help Document Upload", icon: <UploadIcon /> },
    { text: "Download Reports", icon: <DownloadIcon /> },
    { text: "Support Tickets", icon: <TicketsIcon /> },
  ];

  const handleMenuClick = (menu) => setSelectedMenu(menu);

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#003366",
            color: "#fff",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => handleMenuClick(item.text)}
                sx={{
                  backgroundColor:
                    selectedMenu === item.text ? "#f37e81" : "inherit",
                  "&:hover": { backgroundColor: "#f37e81" },
                }}
              >
                <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "#f4f6f8", p: 3 }}>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar sx={{ justifyContent: "flex-end" }}>
            <Typography variant="h6" sx={{ flexGrow: 1, color: "#003366" }}>
              {selectedMenu}
            </Typography>
            <IconButton color="primary">
              <NotificationsIcon />
            </IconButton>
            <Avatar sx={{ ml: 2 }} />
          </Toolbar>
        </AppBar>

        {/* Dashboard Sections */}
        <Box sx={{ mt: 4 }}>
          {selectedMenu === "Dashboard" &&  <TotalUser />}

          {selectedMenu === "User Management" && <UserList/>}

          {selectedMenu === "Course Management" && <CourseManager/>}

          {selectedMenu === "Lesson Management" && <PPTLessonManager/>}

          {selectedMenu === "Quiz Management" && <QuizManager/>}

          {selectedMenu === "Quiz Status Tracker" && <AdminQuizStats/>
            
          }

          {selectedMenu === "Certificates" && (
            <Typography variant="h5">Certificate Management</Typography>
          )}

          {selectedMenu === "Reports & Analytics" && (
            <Typography variant="h5">Analytics & Insights</Typography>
          )}

          {selectedMenu === "Notifications Manager" && (
            <Typography variant="h5">Notifications Control Center</Typography>
          )}

          {selectedMenu === "Reviews & Feedback" && (
            <Typography variant="h5">User Feedback & Ratings</Typography>
          )}

          {selectedMenu === "Help Document Upload" && (
            <Typography variant="h5">Upload Help Guides</Typography>
          )}

          {selectedMenu === "Download Reports" && (
            <Typography variant="h5">Generate & Download Reports</Typography>
          )}

          {selectedMenu === "Support Tickets" && (
            <Typography variant="h5">Support Tickets & Issues</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ResultPage;
