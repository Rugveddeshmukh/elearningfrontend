import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const Help = () => {
  const [faqs, setFaqs] = useState([]);
  const [manuals, setManuals] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(false);
  const [selectedManual, setSelectedManual] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const faqRes = await api.get("/help/faqs");
        const manualRes = await api.get("/help/manuals");
        setFaqs(faqRes.data);
        setManuals(manualRes.data);
      } catch (err) {
        console.error("Error fetching help data:", err);
      }
    };
    fetchData();
  }, [token]);

  const filteredFaqs = faqs.filter((f) =>
    f.question.toLowerCase().includes(search.toLowerCase())
  );

  const handleFaqChange = (panel) => (_, isExpanded) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  return (
    <Box p={1} maxWidth="900px" mx="auto">
      {/* Page Title */}
      <Typography
        variant="h4"
        mb={3}
        textAlign="center"
        color="#333"
        sx={{ fontSize: "24px", fontWeight: "bold" }}
      >
        Help & Support
      </Typography>

      {/* Search */}
      <TextField
        fullWidth
        label="Search FAQs"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 4 }}
      />

      {/* FAQs Section */}
      <Typography
        variant="h6"
        mb={2}
        textAlign="center"
        color="#333"
        sx={{ fontSize: "24px", fontWeight: "bold" }}
      >
        Frequently Asked Questions
      </Typography>

      {filteredFaqs.length > 0 ? (
        filteredFaqs.map((f, index) => (
          <Accordion
            key={f._id}
            expanded={expandedFaq === index}
            onChange={handleFaqChange(index)}
            sx={{
              mb: 2,
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              "&:before": { display: "none" },
              transition: "all 0.3s ease",
            }}
          >
            <AccordionSummary
              expandIcon={
                expandedFaq === index ? (
                  <RemoveIcon sx={{ color: "black" }} />
                ) : (
                  <AddIcon sx={{ color: "black" }} />
                )
              }
              sx={{
                backgroundColor: expandedFaq === index ? "#f4c542" : "#fff",
                transition: "background-color 0.3s ease",
                "& .MuiAccordionSummary-content": { margin: "12px 0" },
              }}
            >
              <Typography fontWeight="bold" color="#000">
                {f.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                backgroundColor: "#fffaf0",
                color: "#333",
                lineHeight: 1.7,
              }}
            >
              <Typography>{f.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography color="text.secondary">
          No FAQs found for your search.
        </Typography>
      )}

      {/* User Manuals Section */}
      {manuals.length > 0 && (
        <>
          <Typography
            variant="h6"
            mt={5}
            mb={3}
            textAlign="center"
            color="#333"
            sx={{ fontSize: "24px", fontWeight: "bold" }}
          >
            User Manuals
          </Typography>

          {/* Unified Border Wrapper */}
          <Paper
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            {/* Sidebar */}
            <Box
              sx={{
                width: { xs: "100%", md: "260px" },
                borderRight: { xs: "none", md: "1px solid #ddd" },
                p: 2,
                backgroundColor: "#fff",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  color: "#003366",
                  textAlign: "center",
                }}
              >
                Manuals List
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {manuals.map((m) => (
                  <ListItemButton
                    key={m._id}
                    onClick={() => setSelectedManual(m)}
                    sx={{
                      mb: 1,
                      borderRadius: "8px",
                      backgroundColor:
                        selectedManual && selectedManual._id === m._id
                          ? "#f4c542"
                          : "transparent",
                      "&:hover": {
                        backgroundColor:
                          selectedManual && selectedManual._id === m._id
                            ? "#f4c542"
                            : "#f7f7f7",
                      },
                    }}
                  >
                    <ListItemText
                      primary={m.title}
                      primaryTypographyProps={{
                        fontWeight: "bold",
                        fontSize: "0.95rem",
                        color:
                          selectedManual && selectedManual._id === m._id
                            ? "#000"
                            : "#333",
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>

            {/* Content */}
            <Box
              sx={{
                flexGrow: 1,
                p: 3,
                backgroundColor: "#fff",
              }}
            >
              {selectedManual ? (
                <>
                  <Typography
                    variant="h5"
                    sx={{ mb: 2, color: "#003366", fontWeight: 600 }}
                  >
                    {selectedManual.title}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography sx={{ lineHeight: 1.8, color: "#333" }}>
                    {selectedManual.content}
                  </Typography>
                </>
              ) : (
                <Typography>Select a manual from the list</Typography>
              )}
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default Help;
