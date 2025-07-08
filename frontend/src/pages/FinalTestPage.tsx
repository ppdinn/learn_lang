import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getFinalTest, updateFinalTest, deleteFinalTest, Test, Question, Answer } from '../services/api';
import { Box, Typography, CircularProgress, Button, TextField, Paper, IconButton, Snackbar, Alert, Divider, Stack, FormControlLabel, Checkbox } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const FinalTestPage: React.FC = () => {
  const { courseId, testId } = useParams<{ courseId: string; testId: string }>();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [snackbar, setSnackbar] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [answerText, setAnswerText] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!courseId || !testId) return;
    getFinalTest(Number(courseId), Number(testId))
      .then(res => {
        setTest(res.data);
        setEditTitle(res.data.title);
        setEditDescription(res.data.description);
      })
      .catch(() => setSnackbar('Ошибка загрузки теста'))
      .finally(() => setLoading(false));
  }, [courseId, testId]);

  const handleSave = async () => {
    if (!courseId || !testId || !test) return;
    try {
      const res = await updateFinalTest(Number(courseId), Number(testId), {
        title: editTitle,
        description: editDescription,
        questions: test.questions,
      });
      setTest(res.data);
      setSnackbar('Тест сохранён!');
    } catch {
      setSnackbar('Ошибка при сохранении теста');
    }
  };

  const handleDelete = async () => {
    if (!courseId || !testId) return;
    try {
      await deleteFinalTest(Number(courseId), Number(testId));
      setSnackbar('Тест удалён');
      setTimeout(() => navigate(`/courses/${courseId}`), 1000);
    } catch {
      setSnackbar('Ошибка при удалении теста');
    }
  };

  const handleAddQuestion = () => {
    if (!questionText.trim() || answers.length < 2) {
      setSnackbar('Вопрос должен иметь текст и минимум 2 ответа');
      return;
    }
    setTest(prev => prev ? {
      ...prev,
      questions: [
        ...prev.questions,
        { id: Date.now(), text: questionText, answers: [...answers] }
      ]
    } : null);
    setQuestionText('');
    setAnswers([]);
  };

  const handleAddAnswer = () => {
    if (!answerText.trim()) return;
    setAnswers(prev => [...prev, { id: Date.now(), text: answerText, is_correct: isCorrect }]);
    setAnswerText('');
    setIsCorrect(false);
  };

  const handleDeleteQuestion = (qid: number) => {
    setTest(prev => prev ? {
      ...prev,
      questions: prev.questions.filter(q => q.id !== qid)
    } : null);
  };

  const handleDeleteAnswer = (qid: number, aid: number) => {
    setTest(prev => prev ? {
      ...prev,
      questions: prev.questions.map(q =>
        q.id === qid ? { ...q, answers: q.answers.filter(a => a.id !== aid) } : q
      )
    } : null);
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={6}><CircularProgress size={48} /></Box>;
  if (!test) return <Typography color="error">Тест не найден</Typography>;

  return (
    <Box maxWidth={800} mx="auto" mt={5}>
      <Typography variant="h4" fontWeight={700} mb={3}>Редактировать итоговый тест</Typography>
      {user && user.role === 'student' ? (
        <Button component={Link} to={`/tests/${test.id}/pass`} variant="contained" color="success" sx={{ mb: 2 }}>
          Пройти итоговый тест
        </Button>
      ) : (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <TextField
            label="Название теста"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Описание теста"
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
            fullWidth
            sx={{ mb: 3 }}
          />
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h6" mb={2}>Вопросы</Typography>
          <Stack spacing={2} mb={3}>
            {test.questions.map(q => (
              <Paper key={q.id} sx={{ p: 2, borderRadius: 2, position: 'relative' }}>
                <IconButton size="small" sx={{ position: 'absolute', top: 8, right: 8 }} onClick={() => handleDeleteQuestion(q.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <Typography variant="subtitle1" fontWeight={600}>{q.text}</Typography>
                <Stack spacing={1} mt={1}>
                  {q.answers.map(a => (
                    <Box key={a.id} display="flex" alignItems="center" gap={1}>
                      <FormControlLabel
                        control={<Checkbox checked={a.is_correct} disabled />}
                        label={a.text}
                      />
                      <IconButton size="small" onClick={() => handleDeleteAnswer(q.id, a.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            ))}
          </Stack>
          <Box mb={2}>
            <TextField
              label="Текст вопроса"
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              fullWidth
              sx={{ mb: 1 }}
            />
            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
              <TextField
                label="Вариант ответа"
                value={answerText}
                onChange={e => setAnswerText(e.target.value)}
                sx={{ flex: 1 }}
              />
              <Button variant={isCorrect ? 'contained' : 'outlined'} color="success" onClick={() => setIsCorrect(v => !v)}>
                Верный
              </Button>
              <Button variant="outlined" color="primary" onClick={handleAddAnswer} startIcon={<AddIcon />}>Добавить вариант</Button>
            </Stack>
            <Stack spacing={1} mb={1}>
              {answers.map(a => (
                <Box key={a.id} display="flex" alignItems="center" gap={1}>
                  <Checkbox checked={a.is_correct} onChange={() => setIsCorrect(v => !v)} />
                  <Typography>{a.text}</Typography>
                  <IconButton size="small" onClick={() => setAnswers(prev => prev.filter(ans => ans.id !== a.id))}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
              ))}
            </Stack>
            <Button variant="contained" color="secondary" onClick={handleAddQuestion} sx={{ mt: 1, fontWeight: 600, borderRadius: 2 }} startIcon={<AddIcon />}>Добавить вопрос</Button>
          </Box>
          <Box display="flex" gap={2} mt={2}>
            <Button variant="contained" color="primary" onClick={handleSave} sx={{ fontWeight: 600, borderRadius: 2 }}>
              Сохранить
            </Button>
            <Button variant="outlined" color="error" onClick={handleDelete} sx={{ fontWeight: 600, borderRadius: 2 }}>
              Удалить
            </Button>
          </Box>
        </Paper>
      )}
      <Snackbar open={!!snackbar} autoHideDuration={2500} onClose={() => setSnackbar('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snackbar.includes('ошиб') ? 'error' : 'success'} sx={{ width: '100%' }}>{snackbar}</Alert>
      </Snackbar>
    </Box>
  );
};

export default FinalTestPage; 