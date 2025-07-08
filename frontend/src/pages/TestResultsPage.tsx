import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTestResults } from '../services/api';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';

const TestResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getTestResults(Number(id))
      .then(res => setResults(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Box display="flex" justifyContent="center" mt={6}><CircularProgress size={48} /></Box>;

  return (
    <Box maxWidth={700} mx="auto" mt={5}>
      <Typography variant="h4" fontWeight={700} mb={3}>Результаты теста</Typography>
      {results.length === 0 ? (
        <Typography color="text.secondary">Нет попыток прохождения теста.</Typography>
      ) : (
        results.map(result => (
          <Paper key={result.id} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Пользователь: {result.user}
            </Typography>
            <Typography>Баллы: {result.score}</Typography>
            <Typography color="text.secondary">{new Date(result.created_at).toLocaleString()}</Typography>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default TestResultsPage; 