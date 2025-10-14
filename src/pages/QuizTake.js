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
  LinearProgress,
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
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [remaining, setRemaining] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  // Fetch all quizzes
  useEffect(() => {
    api
      .get("/quiz", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setQuizzes(res.data || []))
      .catch((err) =>
        alert(err.response?.data?.message || "Failed to load quizzes")
      );
  }, [token]);

  // Fetch a quiz
  const fetchQuiz = async (id) => {
    try {
      const res = await api.get(`/quiz/take/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedQuiz(res.data);
      setAnswers(new Array(res.data.questions.length).fill(null));
      setResult(null);
      setCurrentQ(0);
      setRemaining(res.data.duration || null);
    } catch (err) {
      alert("Failed to load quiz");
    }
  };

  // Timer effect
  useEffect(() => {
    if (remaining === null) return;
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

  const handleSelect = (qIdx, optionIdx) => {
    const newAns = [...answers];
    newAns[qIdx] = optionIdx;
    setAnswers(newAns);
  };

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    try {
      const res = await api.post(
        "/quiz/submit",
        { quizId: selectedQuiz._id, answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Submit failed");
    }
  };

  // ================================ Result Screen ================================
  if (result) {
    return (
      <Box
        sx={{
          maxWidth: 600,
          mx: "auto",
          mt: 6,
          textAlign: "center",
          p: 4,
          borderRadius: 3,
          background:
            result.status === "pass"
              ? "linear-gradient(135deg, #D4EDDA, #A5D6A7)"
              : "linear-gradient(135deg, #FDECEA, #FFCDD2)",
          boxShadow: 4,
        }}
      >
        {result.status === "pass" ? (
          <>
            <Typography variant="h4" color="success.main">
              🎉 Congratulations!
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              You Passed with {result.score}% Marks!
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h5" color="error.main">
              ❌ Try Again
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              You scored {result.score}%.
            </Typography>
            <Button
              sx={{
                mt: 3,
                background: "linear-gradient(135deg, #e53935, #ef5350)",
                color: "white",
                "&:hover": {
                  background: "linear-gradient(135deg, #c62828, #ef5350)",
                },
              }}
              variant="contained"
              onClick={() => {
                setSelectedQuiz(null);
                setResult(null);
              }}
            >
              Reattempt
            </Button>
          </>
        )}
      </Box>
    );
  }

  // ================================ Quiz Taking Screen ================================
  if (selectedQuiz) {
    const q = selectedQuiz.questions[currentQ];
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        <Typography
          variant="h4"
          sx={{ mb: 1, color: "#1565C0", fontWeight: "600",fontSize:"20px" }}
        >
          {selectedQuiz.lessonId?.title}
        </Typography>
        {selectedQuiz.duration > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ color: "#388E3C" }}>
              ⏱ Time Left: {formatTime(remaining)}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(remaining / selectedQuiz.duration) * 100}
              sx={{
                mt: 1,
                height: 8,
                borderRadius: 2,
                background: "#E0E0E0",
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(90deg, #43A047, #66BB6A)",
                },
              }}
            />
          </Box>
        )}

        <Card sx={{ borderRadius: 3, p: 2, boxShadow: 3 }}>
          <Typography variant="h6">
            {currentQ + 1}. {q.question}
          </Typography>
          <RadioGroup
            value={answers[currentQ] ?? ""}
            onChange={(e) => handleSelect(currentQ, Number(e.target.value))}
          >
            {q.options.map((opt, i) => (
              <FormControlLabel
                key={i}
                value={String(i)}
                control={<Radio color="primary" />}
                label={opt}
              />
            ))}
          </RadioGroup>
        </Card>

        {/* Navigation */}
        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
          <Button
            disabled={currentQ === 0}
            variant="outlined"
            onClick={() => setCurrentQ((q) => q - 1)}
          >
            ← Previous
          </Button>

          {currentQ < selectedQuiz.questions.length - 1 ? (
            <Button
              variant="contained"
              sx={{
                background: "linear-gradient(135deg, #1976D2, #42A5F5)",
                color: "white",
                "&:hover": {
                  background: "linear-gradient(135deg, #1565C0, #2196F3)",
                },
              }}
              onClick={() => setCurrentQ((q) => q + 1)}
            >
              Next →
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              sx={{
                background: "linear-gradient(135deg, #2E7D32, #66BB6A)",
                color: "white",
              }}
              onClick={handleSubmit}
            >
              ✅ Finish & Submit
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  // ================================ Quiz List Screen ================================
  return (
    <Box p={3} sx={{ maxWidth: 1200, mx: "auto" }}>
      <Typography
        variant="h4"
        sx={{ textAlign: "center", mb: 4, color: "#000",fontSize:"25px" }}
      >
        🧩 Available Assessments
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 3,
        }}
      >
        {quizzes.map((q) => (
          <Card
            key={q._id}
            sx={{
              borderRadius: 3,
              p: 2,
              textAlign: "center",
              transition: "all 0.3s ease",
              background: "linear-gradient(135deg, #E3F2FD, #E8F5E9)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "#1565C0",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={q.lessonId?.title || "Untitled Lesson"}
              >
                {q.lessonId?.title || "Untitled Lesson"}
              </Typography>

              <Typography variant="body2">
                📝 Questions: {q.questions?.length || "—"}
              </Typography>
              <Typography variant="body2">🎯 Pass: {q.passPercentage}%</Typography>
              <Typography variant="body2">
                ⏱ {q.duration ? Math.floor(q.duration / 60) + " min" : "No limit"}
              </Typography>
              {q.locked && (
                <Typography sx={{ mt: 1 }} color="error">
                  🔒 Complete lesson to unlock
                </Typography>
              )}
            </CardContent>

            <CardActions sx={{ p: 0, mt: 2 }}>
              <Button
                fullWidth
                variant="contained"
                sx={{
                  height: 45,
                  borderRadius: 2,
                  background: q.locked
                    ? "linear-gradient(135deg, #BDBDBD, #E0E0E0)"
                    : "linear-gradient(135deg, #43A047, #66BB6A)",
                  color: q.locked ? "black" : "white",
                  fontWeight: "bold",
                  "&:hover": {
                    background: q.locked
                      ? "linear-gradient(135deg, #9E9E9E, #BDBDBD)"
                      : "linear-gradient(135deg, #2E7D32, #43A047)",
                  },
                }}
                onClick={() => fetchQuiz(q._id)}
                disabled={q.locked}
              >
                {q.locked ? "Locked" : "Start Now"}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      {quizzes.length === 0 && (
        <Typography sx={{ mt: 2, textAlign: "center" }}>No quizzes available.</Typography>
      )}
    </Box>
  );
}
