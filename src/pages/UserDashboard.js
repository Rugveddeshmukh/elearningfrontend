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
  Dashboard,
  School,
  History,
  HelpOutline,
  SupportAgent,
  Notifications,
  Explore,
  CalendarMonth,
} from "@mui/icons-material";

import LessonViewer from "../pages/LessonViewer";
import QuizTake from "../pages/QuizTake";
import ProfilePage from "./ProfilePage";
import LoginHistory from "./LoginHistory";
import LearningHistory from "../components/LearningHistory";

const drawerWidth = 240;

const ResultPage = () => {
  const [selectedMenu, setSelectedMenu] = useState("Dashboard");

  
  const menuItems = [
    { text: "Dashboard", icon: <Dashboard /> },
    { text: "My Courses", icon: <Explore /> },
    { text: "Assessments", icon: <School /> },
    { text: "Learning History", icon: <History /> },
    { text: "Help", icon: <HelpOutline /> },
    { text: "Login History", icon: <CalendarMonth /> },
    { text: "Support / Tickets", icon: <SupportAgent /> },
  ];

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
  };

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

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "#f4f6f8", p: 3 }}>
        {/* Topbar */}
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar sx={{ justifyContent: "flex-end" }}>
            <Typography variant="h6" sx={{ flexGrow: 1, color: "#003366" }}>
              {selectedMenu}
            </Typography>
            <IconButton color="primary">
              <Notifications />
            </IconButton>

            {/* Avatar वर क्लिक केलं की Profile उघडेल ✅ */}
            <Avatar
              sx={{ ml: 2, cursor: "pointer" }}
              onClick={() => setSelectedMenu("Profile")}
            />
          </Toolbar>
        </AppBar>

        {/* Content Display */}
        <Box sx={{ mt: 4 }}>
          {selectedMenu === "Dashboard" && (
            <Typography variant="h4" align="center" color="#003366">
              Welcome to the Dashboard
            </Typography>
          )}

          {selectedMenu === "My Courses" && <LessonViewer />}

          {selectedMenu === "Assessments" && <QuizTake />}

          {selectedMenu === "Learning History" && <LearningHistory/> }

          {selectedMenu === "Help" && (
            <Typography variant="body1"></Typography>
          )}

          {selectedMenu === "Login History" && <LoginHistory />}

          {selectedMenu === "Profile" && <ProfilePage />}

          {selectedMenu === "Support / Tickets" && (
            <Typography variant="body1"></Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ResultPage;
