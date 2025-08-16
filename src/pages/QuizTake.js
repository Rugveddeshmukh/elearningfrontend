
import React, { useEffect, useState, useRef } from 'react';
import { Button, Typography, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function QuizTake() {
  const { id  } = useParams();  
  const { token } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [remaining, setRemaining] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/quiz/take/${id}`, {
          headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` }
        });
        
        setQuiz(res.data);
        setAnswers(new Array(res.data.questions.length).fill(null));
        if (res.data.duration && res.data.duration > 0) {
          setRemaining(res.data.duration);
        } else {
          setRemaining(null);
        }
      } catch (err) {
        console.error(err);          
        alert('Failed to load quiz');
        navigate(-1);
      }
    };
    fetchQuiz();
    
  }, [id]);

  useEffect(() => {
    if (remaining === null) return;

    
    if (startedAt === null) {
      
      return;
    }

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
   
  }, [startedAt]);

  const handleStart = () => {
    setStartedAt(new Date().toISOString());
    
  };

  const handleSelect = (qIdx, optionIdx) => {
    const a = [...answers];
    a[qIdx] = optionIdx;
    setAnswers(a);
  };

  const handleSubmit = async (auto = false) => {
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      const res = await api.post('/quiz/submit', {
        id ,
        answers,
        startedAt
      }, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` }
      });

      alert(`Result: ${res.data.status.toUpperCase()} — Score: ${res.data.score}`);
      
      navigate('/my-quizzes'); 
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Submit failed');
    }
  };

  if (!quiz) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: 16 }}>
      <Typography variant="h5">{quiz.courseName}</Typography>
      <Typography>Pass percentage: {quiz.passPercentage}%</Typography>

      {quiz.duration > 0 && (
        <div style={{ marginTop: 12, marginBottom: 12 }}>
          <Typography>
            Time limit: {Math.floor(quiz.duration / 60)} minutes
          </Typography>
          <Typography variant="h6">
            Timer: {remaining === null ? 'Not started' : formatTime(remaining)}
          </Typography>
        </div>
      )}

      {!startedAt ? (
        <Button variant="contained" onClick={handleStart}>Start Quiz</Button>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(false);
        }}
      >
        {quiz.questions.map((q, i) => (
          <div key={q._id || i} style={{ marginTop: 16, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
            <Typography>{i + 1}. {q.question}</Typography>
            <RadioGroup value={answers[i] ?? ''} onChange={(e) => handleSelect(i, Number(e.target.value))}>
              {q.options.map((opt, j) => (
                <FormControlLabel key={j} value={String(j)} control={<Radio />} label={opt} />
              ))}
            </RadioGroup>
          </div>
        ))}

        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Submit
        </Button>
      </form>
    </div>
  );
}
