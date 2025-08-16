import React, { useEffect, useState } from "react";
import { Box, MenuItem, Select, InputLabel, FormControl, Typography } from "@mui/material";
import api from "../utils/api";

const UserCourseSelector = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [courses, setCourses] = useState([]);

  // Fetch all categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/course/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Error loading categories", err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      const fetchSubcategories = async () => {
        try {
          const res = await api.get(`/course/subcategories/${selectedCategory}`);
          setSubcategories(res.data);
        } catch (err) {
          console.error("Error loading subcategories", err);
        }
      };

      fetchSubcategories();
    } else {
      setSubcategories([]);
      setSelectedSubcategory("");
    }
  }, [selectedCategory]);

  // Fetch courses when subcategory changes
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/course");
        const filtered = res.data.filter(
          (course) =>
            course.category === selectedCategory &&
            course.subcategory === selectedSubcategory
        );
        setCourses(filtered);
      } catch (err) {
        console.error("Error loading courses", err);
      }
    };

    if (selectedCategory && selectedSubcategory) {
      fetchCourses();
    } else {
      setCourses([]);
    }
  }, [selectedCategory, selectedSubcategory]);

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
       Courses
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={selectedCategory}
          label="Category"
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat, idx) => (
            <MenuItem key={idx} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedCategory}>
        <InputLabel>Subcategory</InputLabel>
        <Select
          value={selectedSubcategory}
          label="Subcategory"
          onChange={(e) => setSelectedSubcategory(e.target.value)}
        >
          {subcategories.map((subcat, idx) => (
            <MenuItem key={idx} value={subcat}>
              {subcat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {courses.length > 0 && (
        <Box mt={3}>
          <Typography variant="subtitle1">Available Courses:</Typography>
          {courses.map((course) => (
            <Typography key={course._id} variant="body1">
              - {course.title}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default UserCourseSelector;
