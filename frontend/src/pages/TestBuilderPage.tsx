import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, IconButton, Divider, Stack, Checkbox, FormControlLabel, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

interface Answer {
  id: number;
  text: string;
  correct: boolean;
}
interface Question {
  id: number;
  text: string;
  answers: Answer[];
}

const TestBuilderPage: React.FC = () => {
  const [testTitle, setTestTitle] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionText, setQuestionText] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [answerText, setAnswerText] = useState('');
  const [snackbar, setSnackbar] = useState('');

  const addAnswer = () => {
    if (!answerText.trim()) return;
    setAnswers(prev => [...prev, { id: Date.now(), text: answerText, correct: false }]);
    setAnswerText('');
  };

  const toggleCorrect = (id: number) => {
    setAnswers(prev => prev.map(a => a.id === id ? { ...a, correct: !a.correct } : a));
  };

  const removeAnswer = (id: number) => {
    setAnswers(prev => prev.filter(a => a.id !== id));
  };

  const addQuestion = () => {
    if (!questionText.trim() || answers.length < 2) return;
    setQuestions(prev => [...prev, { id: Date.now(), text: questionText, answers }]);
    setQuestionText('');
    setAnswers([]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleSave = async () => {
    try {
      const payload = {
        title: testTitle,
        description: testDescription,
        questions: questions.map(q => ({
          id: q.id,
          text: q.text,
          answers: q.answers.map(a => ({ id: a.id, text: a.text, correct: a.correct })),
        })),
      };
      await axios.post('/tests/', payload);
      setSnackbar('Тест сохранён!');
      setTestTitle('');
      setTestDescription('');
      setQuestions([]);
    } catch (e) {
      setSnackbar('Ошибка при сохранении теста');
    }
  };

  return (
    <Box maxWidth={800} mx="auto" mt={5}>
      <Typography variant="h4" fontWeight={700} mb={3}>Конструктор теста</Typography>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <TextField
          label="Название теста"
          value={testTitle}
          onChange={e => setTestTitle(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Описание теста"
          value={testDescription}
          onChange={e => setTestDescription(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        />
        <Divider sx={{ mb: 3 }} />
        <Typography variant="h6" mb={2}>Вопросы</Typography>
        <Stack spacing={2} mb={3}>
          {questions.map(q => (
            <Paper key={q.id} sx={{ p: 2, borderRadius: 2, position: 'relative' }}>
              <IconButton size="small" sx={{ position: 'absolute', top: 8, right: 8 }} onClick={() => removeQuestion(q.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
              <Typography variant="subtitle1" fontWeight={600}>{q.text}</Typography>
              <Stack spacing={1} mt={1}>
                {q.answers.map(a => (
                  <Box key={a.id} display="flex" alignItems="center" gap={1}>
                    <FormControlLabel
                      control={<Checkbox checked={a.correct} disabled />}
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
                <Checkbox checked={a.correct} onChange={() => toggleCorrect(a.id)} />
                <Typography>{a.text}</Typography>
                <IconButton size="small" onClick={() => removeAnswer(a.id)}><DeleteIcon fontSize="small" /></IconButton>
              </Box>
            ))}
          </Stack>
          <Button variant="contained" color="secondary" onClick={addQuestion} sx={{ mt: 1, fontWeight: 600, borderRadius: 2 }}>
            Добавить вопрос
          </Button>
        </Box>
        <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 2, fontWeight: 600, borderRadius: 2 }}>
          Сохранить тест
        </Button>
      </Paper>
      <Snackbar open={!!snackbar} autoHideDuration={2500} onClose={() => setSnackbar('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snackbar === 'Тест сохранён!' ? 'success' : 'error'} sx={{ width: '100%' }}>{snackbar}</Alert>
      </Snackbar>
    </Box>
  );
};

export default TestBuilderPage; 