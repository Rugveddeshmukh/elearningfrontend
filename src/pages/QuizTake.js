import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

// Format timer display
function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function QuizzesAndTake() {
  const { token } = useAuth();

  // Quiz state
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [remaining, setRemaining] = useState(null);
  const timerRef = useRef(null);
  const [currentQ, setCurrentQ] = useState(0); 
  const [result, setResult] = useState(null); 

  // ================================
  // Fetch all quizzes on load
  // ================================
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await api.get("/quiz", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuizzes(res.data || []);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to load quizzes");
      }
    };

    fetchQuizzes();
  }, [token]);

  // ================================
  // Fetch one quiz
  // ================================
  const fetchQuiz = async (quizId) => {
    try {
      const res = await api.get(`/quiz/take/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSelectedQuiz(res.data);
      setAnswers(new Array(res.data.questions.length).fill(null));
      setCurrentQ(0);
      setResult(null);

      if (res.data.duration && res.data.duration > 0) {
        setRemaining(res.data.duration);
      } else {
        setRemaining(null);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load quiz");
      setSelectedQuiz(null);
    }
  };

  // ================================
  // Timer effect
  // ================================
  useEffect(() => {
    if (remaining === null) return; // no time limit

    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [selectedQuiz]);

  // ================================
  // Handlers
  // ================================
  const handleSelect = (qIdx, optionIdx) => {
    const a = [...answers];
    a[qIdx] = optionIdx;
    setAnswers(a);
  };

  const handleSubmit = async (auto = false) => {
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      const res = await api.post(
        "/quiz/submit",
        {
          quizId: selectedQuiz._id,
          answers,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Submit failed");
    }
  };

  // ================================
  // Render result screen
  // ================================
  if (result) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", p: 3, textAlign: "center" }}>
        {result.status === "pass" ? (
          <>
            <Typography variant="h4" color="success.main">
              🎉 Congratulations!
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
               Passed  {result.score}%
            </Typography>
          </>
        ) : (
          <>
            {/* <Typography variant="h4" color="error.main">
              ❌ Better luck next time
            </Typography> */}
            <Typography variant="h6" sx={{ mt: 2 }}>
              You scored {result.score}%. Please try again.
            </Typography>
            <Button
              sx={{ mt: 3 }}
              variant="contained"
              onClick={() => {
                setSelectedQuiz(null);
                setResult(null);
              }}
            >
              Please Reattempt the Assessment
            </Button>
          </>
        )}
      </Box>
    );
  }

  // ================================
  // Render quiz-taking screen
  // ================================
  if (selectedQuiz) {
    const q = selectedQuiz.questions[currentQ];
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
        <Typography variant="h5">{selectedQuiz.lessonId?.title}</Typography>
        {/* <Typography sx={{ mb: 1 }}>
          Pass percentage: {selectedQuiz.passPercentage}%
        </Typography> */}

        {selectedQuiz.duration > 0 && (
          <Box sx={{ my: 2 }}>
            {/* <Typography>
              Time limit: {Math.floor(selectedQuiz.duration / 60)} minutes
            </Typography> */}
            <Typography variant="h6">Time: {formatTime(remaining)}</Typography>
          </Box>
        )}

        {/* One question at a time */}
        <Box sx={{ mt: 2, p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
          <Typography>
            {currentQ + 1}. {q.question}
          </Typography>
          <RadioGroup
            value={answers[currentQ] ?? ""}
            onChange={(e) => handleSelect(currentQ, Number(e.target.value))}
          >
            {q.options.map((opt, j) => (
              <FormControlLabel
                key={j}
                value={String(j)}
                control={<Radio />}
                label={opt}
              />
            ))}
          </RadioGroup>
        </Box>

        {/* Navigation */}
        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
          <Button
            disabled={currentQ === 0}
            variant="outlined"
            onClick={() => setCurrentQ((q) => q - 1)}
          >
            Prev
          </Button>

          {currentQ < selectedQuiz.questions.length - 1 ? (
            <Button variant="contained" onClick={() => setCurrentQ((q) => q + 1)}>
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              onClick={() => handleSubmit(false)}
            >
              Finish & Submit
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  // ================================
  // Render quiz list (Grid of Cards)
  // ================================
  return (
    <Box p={3} sx={{ maxWidth: 1200, mx: "auto" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 3,
          mt: 2,
        }}
      >
        {quizzes.map((q) => (
          <Card
            key={q._id}
            sx={{
              borderRadius: 3,
              boxShadow: 3,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "0.2s",
              "&:hover": { boxShadow: 6, transform: "translateY(-3px)" },
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {q.lessonId?.title || q.lessonId} 
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Questions: {q.questions?.length || "—"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pass: {q.passPercentage}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Time: {q.duration ? Math.floor(q.duration / 60) + " min" : "No limit"}
              </Typography>
              {q.locked && (
               <Typography sx={{ mt: 1 }} color="error">
                 🔒 Complete lesson to unlock quiz
               </Typography>
              )}
            </CardContent>

            <CardActions>
              <Button
               fullWidth
               variant="contained"
               sx={{ borderRadius: 2 }}
               onClick={() => fetchQuiz(q._id)}
               disabled={q.locked}
            >
               {q.locked ? "Locked" : "Start Now!"}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      {quizzes.length === 0 && (
        <Typography sx={{ mt: 2 }}>No quizzes available.</Typography>
      )}
    </Box>
  );
}
