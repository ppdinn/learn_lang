import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, IconButton, Divider, Stack, Checkbox, FormControlLabel, CircularProgress, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { getTestById, Test, Answer, Question, updateTest, updateFinalTest, deleteTest, deleteFinalTest } from '../services/api';

const TestEditPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [answerText, setAnswerText] = useState('');
  const [saving, setSaving] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  useEffect(() => {
    if (!id) return;
    getTestById(Number(id))
      .then(res => setTest(res.data))
      .catch(() => setError('Тест не найден'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!test) return;
    setSaving(true);
    try {
      let updated;
      if ((test as any).lesson) {
        // Тест урока
        updated = await updateTest((test as any).lesson, (test as any).lesson, test.id, test);
      } else if ((test as any).course) {
        // Итоговый тест курса
        updated = await updateFinalTest((test as any).course, test.id, test);
      } else {
        throw new Error('Неизвестный тип теста');
      }
      setTest(updated.data);
      setSnackbar('Тест сохранён!');
    } catch (e) {
      setSnackbar('Ошибка при сохранении теста');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!test) return;
    try {
      if ((test as any).lesson) {
        // Тест урока
        await deleteTest((test as any).lesson, (test as any).lesson, test.id);
      } else if ((test as any).course) {
        // Итоговый тест курса
        await deleteFinalTest((test as any).course, test.id);
      } else {
        throw new Error('Неизвестный тип теста');
      }
      setSnackbar('Тест удалён!');
      setTimeout(() => navigate('/courses'), 1000);
    } catch (e) {
      setSnackbar('Ошибка при удалении теста');
    }
  };

  const addAnswer = () => {
    if (!answerText.trim()) return;
    setAnswers(prev => [...prev, { id: Date.now(), text: answerText, is_correct: false }]);
    setAnswerText('');
  };

  const toggleCorrect = (id: number) => {
    setAnswers(prev => prev.map(a => a.id === id ? { ...a, is_correct: !a.is_correct } : a));
  };

  const removeAnswer = (id: number) => {
    setAnswers(prev => prev.filter(a => a.id !== id));
  };

  const addQuestion = () => {
    if (!questionText.trim() || answers.length < 2 || !test) return;
    setTest(prev => prev ? {
      ...prev,
      questions: [
        ...prev.questions,
        { id: Date.now(), text: questionText, answers: [...answers] }
      ]
    } : null);
    setQuestionText('');
    setAnswers([]);
    setPendingSave(true);
  };

  const removeQuestion = (qid: number) => {
    if (!test) return;
    setTest(prev => prev ? {
      ...prev,
      questions: prev.questions.filter(q => q.id !== qid)
    } : null);
    setPendingSave(true);
  };

  useEffect(() => {
    if (!test || !test.id || !pendingSave) return;
    handleSave();
    setPendingSave(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test?.questions]);

  if (loading) return <Box display="flex" justifyContent="center" mt={6}><CircularProgress size={48} /></Box>;
  if (error) return <Typography color="error" mt={4}>{error}</Typography>;
  if (!test) return null;

  return (
    <Box maxWidth={800} mx="auto" mt={5}>
      <Typography variant="h4" fontWeight={700} mb={3}>Редактировать тест</Typography>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <TextField
          label="Название теста"
          value={test.title}
          onChange={e => setTest({ ...test, title: e.target.value })}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Описание теста"
          value={test.description}
          onChange={e => setTest({ ...test, description: e.target.value })}
          fullWidth
          sx={{ mb: 3 }}
        />
        <Divider sx={{ mb: 3 }} />
        <Typography variant="h6" mb={2}>Вопросы</Typography>
        <Stack spacing={2} mb={3}>
          {test.questions.map(q => (
            <Paper key={q.id} sx={{ p: 2, borderRadius: 2, position: 'relative' }}>
              <IconButton size="small" sx={{ position: 'absolute', top: 8, right: 8 }} onClick={() => removeQuestion(q.id)}>
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
            <Button variant="outlined" color="primary" onClick={addAnswer} startIcon={<AddIcon />}>Добавить вариант</Button>
          </Stack>
          <Stack spacing={1} mb={1}>
            {answers.map(a => (
              <Box key={a.id} display="flex" alignItems="center" gap={1}>
                <Checkbox checked={a.is_correct} onChange={() => toggleCorrect(a.id)} />
                <Typography>{a.text}</Typography>
                <IconButton size="small" onClick={() => removeAnswer(a.id)}><DeleteIcon fontSize="small" /></IconButton>
              </Box>
            ))}
          </Stack>
          <Button variant="contained" color="secondary" onClick={addQuestion} sx={{ mt: 1, fontWeight: 600, borderRadius: 2 }}>
            Добавить вопрос
          </Button>
        </Box>
        <Box display="flex" gap={2} mt={2}>
          <Button variant="contained" color="primary" onClick={handleSave} sx={{ fontWeight: 600, borderRadius: 2 }} disabled={saving}>
            Сохранить
          </Button>
          <Button variant="outlined" color="error" onClick={handleDelete} sx={{ fontWeight: 600, borderRadius: 2 }}>
            Удалить
          </Button>
          <Button variant="outlined" color="success" component={Link} to={`/tests/${test?.id}/results`} sx={{ fontWeight: 600, borderRadius: 2 }}>
            Результаты теста
          </Button>
        </Box>
      </Paper>
      <Snackbar open={!!snackbar} autoHideDuration={2500} onClose={() => setSnackbar('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%' }}>{snackbar}</Alert>
      </Snackbar>
    </Box>
  );
};

export default TestEditPage; 