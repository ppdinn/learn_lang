import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, IconButton, Divider, Stack, CircularProgress, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getLesson, updateLesson, deleteLesson, createSection, updateSection, deleteSection, Lesson, Section } from '../services/api';

const LessonEditPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState('');
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionContent, setSectionContent] = useState('');

  useEffect(() => {
    if (!courseId || !lessonId) return;
    getLesson(Number(courseId), Number(lessonId))
      .then(res => setLesson(res.data))
      .catch(() => setError('Урок не найден'))
      .finally(() => setLoading(false));
  }, [courseId, lessonId]);

  const handleSave = async () => {
    if (!lesson || !courseId) return;
    try {
      const res = await updateLesson(Number(courseId), lesson.id, {
        title: lesson.title,
        description: lesson.description
      });
      setLesson(res.data);
      setSnackbar('Урок сохранён!');
    } catch (e) {
      setSnackbar('Ошибка при сохранении урока');
    }
  };

  const handleDelete = async () => {
    if (!lesson || !courseId) return;
    try {
      await deleteLesson(Number(courseId), lesson.id);
      navigate('/courses');
    } catch (e) {
      setSnackbar('Ошибка при удалении урока');
    }
  };

  const addSection = async () => {
    if (!sectionTitle.trim() && !sectionContent.trim() || !lesson || !courseId) return;
    try {
      const newSection = await createSection(Number(courseId), lesson.id, {
        title: sectionTitle,
        content: sectionContent,
        order: lesson.sections.length + 1
      });
      setLesson({ ...lesson, sections: [...lesson.sections, newSection.data] });
      setSectionTitle('');
      setSectionContent('');
      setSnackbar('Секция добавлена!');
    } catch (e) {
      setSnackbar('Ошибка при добавлении секции');
    }
  };

  const removeSection = async (sid: number) => {
    if (!lesson || !courseId) return;
    try {
      await deleteSection(Number(courseId), lesson.id, sid);
      setLesson({ ...lesson, sections: lesson.sections.filter(s => s.id !== sid) });
      setSnackbar('Секция удалена!');
    } catch (e) {
      setSnackbar('Ошибка при удалении секции');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={6}><CircularProgress size={48} /></Box>;
  if (error) return <Typography color="error" mt={4}>{error}</Typography>;
  if (!lesson) return null;

  return (
    <Box maxWidth={700} mx="auto" mt={5}>
      <Typography variant="h4" fontWeight={700} mb={3}>Редактировать урок</Typography>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <TextField
          label="Название урока"
          value={lesson.title}
          onChange={e => setLesson({ ...lesson, title: e.target.value })}
          fullWidth
          sx={{ mb: 3 }}
        />
        <TextField
          label="Общее описание"
          value={lesson.description}
          onChange={e => setLesson({ ...lesson, description: e.target.value })}
          fullWidth
          sx={{ mb: 3 }}
        />
        <Divider sx={{ mb: 3 }} />
        <Typography variant="h6" mb={2}>Секции урока</Typography>
        <Stack spacing={2} mb={3}>
          {lesson.sections.map(section => (
            <Paper key={section.id} sx={{ p: 2, borderRadius: 2, position: 'relative' }}>
              <IconButton size="small" sx={{ position: 'absolute', top: 8, right: 8 }} onClick={() => removeSection(section.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
              <Typography variant="subtitle1" fontWeight={600}>{section.title}</Typography>
              <Typography variant="body2" color="text.secondary">{section.content}</Typography>
            </Paper>
          ))}
        </Stack>
        <Box display="flex" gap={2} mb={2}>
          <TextField
            label="Заголовок секции"
            value={sectionTitle}
            onChange={e => setSectionTitle(e.target.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Текст секции"
            value={sectionContent}
            onChange={e => setSectionContent(e.target.value)}
            sx={{ flex: 2 }}
          />
          <IconButton color="primary" onClick={addSection} sx={{ alignSelf: 'center' }}>
            <AddIcon />
          </IconButton>
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
      <Snackbar open={!!snackbar} autoHideDuration={2500} onClose={() => setSnackbar('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%' }}>{snackbar}</Alert>
      </Snackbar>
    </Box>
  );
};

export default LessonEditPage; 