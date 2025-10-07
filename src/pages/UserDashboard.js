import React, { useState } from "react";
import logo from "../Assest/OmSai-Credit-Collection-Servicess-logo-02.png";

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
  Badge,
  InputBase,
  Menu,
  MenuItem,
  Button,
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
  ExitToApp,
} from "@mui/icons-material";

import LessonViewer from "../pages/LessonViewer";
import QuizTake from "../pages/QuizTake";
import ProfilePage from "./ProfilePage";
import LoginHistory from "./LoginHistory";
import LearningHistory from "../components/LearningHistory";
import RaiseTicket from "../pages/RaiseTicket";
import Help from "../pages/Help";
import UserLessonStats from "../pages/UserLessonStats";
import UserNotifications from "../pages/UserNotifications";
import Dashboardviewmore from "../pages/Dashboardviewmore";

const drawerWidth = 240;

const ResultPage = () => {
  const [selectedMenu, setSelectedMenu] = useState("Dashboard");
  const [openNotifications, setOpenNotifications] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());

    if (query.toLowerCase().includes("course")) {
      setSelectedMenu("My Courses");
    } else if (query.toLowerCase().includes("assessment")) {
      setSelectedMenu("Assessments");
    } else if (query.toLowerCase().includes("lesson")) {
      setSelectedMenu("Dashboard");
    } else if (query.toLowerCase().includes("login")) {
      setSelectedMenu("Login History");
    } else if (query.toLowerCase().includes("profile")) {
      setSelectedMenu("Profile");
    } else if (query.toLowerCase().includes("help")) {
      setSelectedMenu("Help");
    } else if (
      query.toLowerCase().includes("ticket") ||
      query.toLowerCase().includes("support")
    ) {
      setSelectedMenu("Support / Tickets");
    }
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
  <Box
    component="img"
    src={logo}
    alt="Logo"
    sx={{
      width: 200, // adjust width as needed
      height: "auto",
      objectFit: "contain",
    }}
  />
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
                <ListItemIcon sx={{ color: "#003366" }}>{item.icon}</ListItemIcon>
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
          sx={{ bgcolor: "#fff", borderBottom: "1px solid #ddd", px: 2, flexShrink: 0 }}
        >
          <Toolbar sx={{ position: "relative", justifyContent: "center" }}>
            {/* Search Bar */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#f1f3f4",
                px: 2,
                borderRadius: "20px",
                flexGrow: 1,
                maxWidth: "500px",
              }}
            >
              <InputBase
                placeholder="What do you want to learn?"
                fullWidth
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                sx={{ fontSize: "0.9rem" }}
              />
            </Box>

            {/* Right side buttons */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                position: "absolute",
                right: 20,
              }}
            >
              <IconButton
                color="primary"
                onClick={() => {
                  setOpenNotifications(true);
                  setHasUnreadNotifications(false);
                }}
              >
                <Badge
                  color="error"
                  variant="dot"
                  invisible={!hasUnreadNotifications}
                >
                  <Notifications />
                </Badge>
              </IconButton>

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

        {/* Notifications Drawer */}
        <Drawer
          anchor="right"
          open={openNotifications}
          onClose={() => setOpenNotifications(false)}
        >
          <Box sx={{ width: 350, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              🔔 Notifications
            </Typography>
            <UserNotifications />
          </Box>
        </Drawer>

        {/* Scrollable Content */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
          {selectedMenu === "Dashboard" && (
            <>
              <Dashboardviewmore setSelectedMenu={setSelectedMenu} />
              <UserLessonStats />
            </>
          )}
          {selectedMenu === "My Courses" && <LessonViewer />}
          {selectedMenu === "Assessments" && <QuizTake />}
          {selectedMenu === "Learning History" && <LearningHistory />}
          {selectedMenu === "Help" && <Help />}
          {selectedMenu === "Login History" && <LoginHistory />}
          {selectedMenu === "Profile" && <ProfilePage />}
          {selectedMenu === "Support / Tickets" && <RaiseTicket />}
        </Box>
      </Box>
    </Box>
  );
};

export default ResultPage;
