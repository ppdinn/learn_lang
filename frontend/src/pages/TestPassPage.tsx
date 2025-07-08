import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTest, Test, getTestById, submitTestResult } from '../services/api';
import { Box, Typography, Paper, Button, Radio, RadioGroup, FormControlLabel, CircularProgress, Snackbar, Alert, Checkbox, FormGroup } from '@mui/material';

const TestPassPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [qid: number]: number[] }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    getTestById(Number(id))
      .then(res => setTest(res.data))
      .catch(() => setSnackbar('Ошибка загрузки теста'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (qid: number, aid: number) => {
    setAnswers(prev => {
      const prevAnswers = prev[qid] || [];
      if (prevAnswers.includes(aid)) {
        // Убрать ответ
        return { ...prev, [qid]: prevAnswers.filter(id => id !== aid) };
      } else {
        // Добавить ответ
        return { ...prev, [qid]: [...prevAnswers, aid] };
      }
    });
  };

  const handleSubmit = async () => {
    if (!test) return;
    let correct = 0;
    test.questions.forEach(q => {
      const selected = answers[q.id] || [];
      const correctAnswers = q.answers.filter(a => a.is_correct).map(a => a.id);
      if (
        selected.length === correctAnswers.length &&
        selected.every(id => correctAnswers.includes(id))
      ) {
        correct++;
      }
    });
    setScore(correct);
    setSubmitted(true);
    try {
      await submitTestResult(test.id, correct, answers);
      setSnackbar('Результат отправлен!');
    } catch {
      setSnackbar('Ошибка при отправке результата');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={6}><CircularProgress size={48} /> </Box>;
  if (!test) return <Typography color="error">Тест не найден</Typography>;

  return (
    <Box maxWidth={700} mx="auto" mt={5}>
      <Typography variant="h4" fontWeight={700} mb={3}>{test.title}</Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>{test.description}</Typography>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        {test.questions.map(q => {
          const selected = answers[q.id] || [];
          const correctAnswers = q.answers.filter(a => a.is_correct).map(a => a.id);
          return (
            <Box key={q.id} mb={3}>
              <Typography variant="h6" mb={1}>{q.text}</Typography>
              <FormGroup>
                {q.answers.map(a => {
                  const isChecked = selected.includes(a.id);
                  const isCorrect = a.is_correct;
                  const isWrong = isChecked && !isCorrect;
                  return (
                    <FormControlLabel
                      key={a.id}
                      control={
                        <Checkbox
                          checked={isChecked}
                          disabled={submitted}
                          sx={submitted ? {
                            color: isCorrect ? 'success.main' : isWrong ? 'error.main' : undefined,
                            '&.Mui-checked': {
                              color: isCorrect ? 'success.main' : isWrong ? 'error.main' : undefined,
                            }
                          } : {}}
                        />
                      }
                      label={
                        <Box display="flex" alignItems="center">
                          <Typography
                            color={submitted ? (isCorrect ? 'success.main' : isWrong ? 'error.main' : 'text.primary') : 'text.primary'}
                          >
                            {a.text}
                          </Typography>
                          {submitted && isCorrect && (
                            <Typography ml={1} color="success.main" fontSize={14}>(верный)</Typography>
                          )}
                          {submitted && isWrong && (
                            <Typography ml={1} color="error.main" fontSize={14}>(неверно)</Typography>
                          )}
                        </Box>
                      }
                    />
                  );
                })}
              </FormGroup>
              {submitted && (
                <Box mt={1}>
                  <Typography variant="body2" color={selected.length === correctAnswers.length && selected.every(id => correctAnswers.includes(id)) ? 'success.main' : 'error.main'}>
                    {selected.length === 0
                      ? 'Вы не выбрали ответ'
                      : selected.length === correctAnswers.length && selected.every(id => correctAnswers.includes(id))
                        ? 'Ответ верный'
                        : 'Ответ неверный'}
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
        {!submitted ? (
          <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>Отправить ответы</Button>
        ) : (
          <Typography variant="h5" color="success.main" mt={2}>Ваш результат: {score} из {test.questions.length}</Typography>
        )}
      </Paper>
      <Snackbar open={!!snackbar} autoHideDuration={2500} onClose={() => setSnackbar('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="error" sx={{ width: '100%' }}>{snackbar}</Alert>
      </Snackbar>
    </Box>
  );
};

export default TestPassPage; 