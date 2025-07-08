import React, { useEffect, useState } from 'react';
import { Typography, Card, CardContent, List, ListItem, ListItemButton, ListItemText, CircularProgress, Box, Avatar, Paper, Button, Fade, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert } from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import { getCourse, getLessons, Course, Lesson, getFinalTests, createFinalTest } from '../services/api';
import { useTranslation } from 'react-i18next';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import axios from 'axios';
import CreateLessonForm from './CreateLessonForm';
import CreateTestForm from './CreateTestForm';
import { createLesson, createTest } from '../services/api';

const CoursePage: React.FC = () => {
  const { t } = useTranslation();
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [snackbar, setSnackbar] = useState('');
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState<number | false>(false);
  const [finalTests, setFinalTests] = useState<any[]>([]);
  const [finalTestDialogOpen, setFinalTestDialogOpen] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    Promise.all([
      getCourse(Number(courseId)).then(res => setCourse(res.data)),
      getLessons(Number(courseId)).then(res => setLessons(res.data)),
      getFinalTests(Number(courseId)).then(res => setFinalTests(res.data)),
    ]).finally(() => setLoading(false));
  }, [courseId]);

  // Получаем user из localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleEditOpen = () => {
    if (!course) return;
    setEditTitle(course.title);
    setEditDescription(course.description);
    setEditOpen(true);
  };
  const handleEditClose = () => setEditOpen(false);
  const handleEditSave = async () => {
    if (!course) return;
    try {
      const res = await axios.put(`/courses/${course.id}/`, { title: editTitle, description: editDescription });
      setCourse(res.data);
      setSnackbar('Курс обновлён!');
      setEditOpen(false);
    } catch (e) {
      setSnackbar('Ошибка при обновлении курса');
    }
  };

  const handleCreateLesson = async (data: { title: string; content: string }) => {
    if (!courseId) return;
    try {
      await createLesson(Number(courseId), { title: data.title, description: data.content });
      setSnackbar('Урок создан!');
      // обновить список уроков
      const res = await getLessons(Number(courseId));
      setLessons(res.data);
    } catch {
      setSnackbar('Ошибка при создании урока');
    }
  };

  const handleCreateTest = async (lessonId: number | false, data: { title: string; description: string }) => {
    if (!courseId || !lessonId) return;
    try {
      await createTest(Number(courseId), Number(lessonId), { title: data.title, description: data.description });
      setSnackbar('Тест создан!');
      // Сообщаем другим вкладкам/страницам о создании теста
      localStorage.setItem('lessonTestCreated', `${courseId}:${lessonId}:${Date.now()}`);
    } catch {
      setSnackbar('Ошибка при создании теста');
    }
  };

  const handleCreateFinalTest = async (data: { title: string; description: string }) => {
    if (!courseId) return;
    try {
      await createFinalTest(Number(courseId), { title: data.title, description: data.description });
      setSnackbar('Итоговый тест создан!');
      // обновить список итоговых тестов
      const res = await getFinalTests(Number(courseId));
      setFinalTests(res.data);
    } catch {
      setSnackbar('Ошибка при создании итогового теста');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={6}><CircularProgress size={48} /></Box>;
  if (!course) return <Typography color="error">{t('courseNotFound') || 'Курс не найден'}</Typography>;

  return (
    <Box>
      <Card sx={{
        mb: 4,
        borderRadius: 4,
        boxShadow: '0 4px 32px 0 rgba(80,80,120,0.10)',
        p: { xs: 2, sm: 3 },
        background: 'linear-gradient(90deg, #ede7f6 0%, #e0f7fa 100%)',
        position: 'relative',
        overflow: 'visible',
      }}>
        <Box display="flex" alignItems="center" gap={3}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, boxShadow: 2 }}>
            <MenuBookIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700} mb={1}>{course.title}</Typography>
            <Typography variant="body1" color="text.secondary" fontSize={18}>{course.description}</Typography>
          </Box>
          {user && (user.role === 'admin' || user.role === 'teacher') && (
            <Box display="flex" gap={2} mt={2}>
              <Button variant="contained" color="primary" onClick={() => setLessonDialogOpen(true)}>
                Создать урок
              </Button>
              <Button variant="outlined" color="success" onClick={() => setFinalTestDialogOpen(true)}>
                Создать итоговый тест
              </Button>
            </Box>
          )}
        </Box>
      </Card>
      <Typography variant="h5" mb={3} fontWeight={600}>{t('lessonsList') || 'Список уроков'}</Typography>
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
        {lessons.map(lesson => (
          <Fade in timeout={500} key={lesson.id}>
            <Paper elevation={2} sx={{
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderRadius: 3,
              boxShadow: '0 2px 12px 0 rgba(80,80,120,0.08)',
              transition: 'box-shadow 0.2s, transform 0.2s',
              '&:hover': {
                boxShadow: '0 6px 24px 0 rgba(80,80,120,0.16)',
                transform: 'translateY(-2px) scale(1.02)',
              },
            }}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 44, height: 44 }}>
                <MenuBookIcon />
              </Avatar>
              <Box flexGrow={1}>
                <Typography variant="subtitle1" fontWeight={600}>{lesson.title}</Typography>
              </Box>
              <Button
                component={Link}
                to={`/courses/${course.id}/lessons/${lesson.id}`}
                variant="contained"
                color="primary"
                endIcon={<ArrowForwardIosIcon fontSize="small" />}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                {t('goToLesson') || 'Перейти'}
              </Button>
              {user && (user.role === 'admin' || user.role === 'teacher') && (
                <Button variant="contained" color="secondary" sx={{ ml: 2 }} onClick={() => { setTestDialogOpen(lesson.id); }}>
                  Создать тест
                </Button>
              )}
            </Paper>
          </Fade>
        ))}
      </Box>
      <Typography variant="h5" mb={2} fontWeight={600}>Итоговые тесты курса</Typography>
      {finalTests.length === 0 ? (
        <Typography color="text.secondary" mb={2}>Нет итоговых тестов для этого курса.</Typography>
      ) : (
        <Box mb={3}>
          {finalTests.map(test => (
            <Paper key={test.id} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>{test.title}</Typography>
                <Typography variant="body2" color="text.secondary">{test.description}</Typography>
              </Box>
              {user && user.role === 'student' ? (
                <Button component={Link} to={`/tests/${test.id}/pass`} variant="outlined" color="success">
                  Перейти к тесту
                </Button>
              ) : (
                <Button component={Link} to={`/courses/${course?.id}/final-tests/${test.id}`} variant="outlined" color="success">
                  Перейти к тесту
                </Button>
              )}
            </Paper>
          ))}
        </Box>
      )}
      {/* Диалог редактирования курса */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Редактировать курс</DialogTitle>
        <DialogContent>
          <TextField
            label="Название курса"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Описание курса"
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Отмена</Button>
          <Button onClick={handleEditSave} variant="contained" color="primary">Сохранить</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!snackbar} autoHideDuration={2500} onClose={() => setSnackbar('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snackbar === 'Курс обновлён!' ? 'success' : 'error'} sx={{ width: '100%' }}>{snackbar}</Alert>
      </Snackbar>
      <CreateLessonForm open={lessonDialogOpen} onClose={() => setLessonDialogOpen(false)} onCreate={handleCreateLesson} />
      <CreateTestForm open={!!testDialogOpen} onClose={() => setTestDialogOpen(false)} onCreate={data => handleCreateTest(testDialogOpen, data)} />
      <CreateTestForm open={finalTestDialogOpen} onClose={() => setFinalTestDialogOpen(false)} onCreate={handleCreateFinalTest} />
    </Box>
  );
};

export default CoursePage; 