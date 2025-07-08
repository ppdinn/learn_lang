import React, { useEffect, useState } from 'react';
import { Typography, Card, CardContent, CircularProgress, Box, Avatar, Fade, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert } from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import { getLesson, Lesson, updateLesson, getTests, Test, deleteTest } from '../services/api';
import { useTranslation } from 'react-i18next';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import axios from 'axios';

const LessonPage: React.FC = () => {
  const { t } = useTranslation();
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editVideoPreview, setEditVideoPreview] = useState<string | null>(null);
  const [editVideoFile, setEditVideoFile] = useState<File | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [snackbar, setSnackbar] = useState('');
  const [tests, setTests] = useState<Test[]>([]);

  // Получаем user из localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (!courseId || !lessonId) return;
    getLesson(Number(courseId), Number(lessonId))
      .then(res => setLesson(res.data))
      .finally(() => setLoading(false));
    getTests(Number(courseId), Number(lessonId)).then(res => setTests(res.data));

    // Автообновление тестов при создании нового теста
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'lessonTestCreated' && e.newValue) {
        const [cid, lid] = e.newValue.split(':');
        if (cid === String(courseId) && lid === String(lessonId)) {
          getTests(Number(courseId), Number(lessonId)).then(res => setTests(res.data));
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [courseId, lessonId]);

  const handleEditOpen = () => {
    if (!lesson) return;
    setEditTitle(lesson.title);
    // Получаем контент из первой секции или используем description
    const content = lesson.sections?.[0]?.content || lesson.description || '';
    setEditContent(content);
    setEditVideoPreview(lesson.video || null);
    setEditVideoFile(null);
    setEditOpen(true);
  };
  const handleEditClose = () => setEditOpen(false);
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setVideoUploading(true);
    setEditVideoFile(file);
    
    // Создаем превью для отображения
    const reader = new FileReader();
    reader.onload = () => {
      setEditVideoPreview(reader.result as string);
      setVideoUploading(false);
    };
    reader.readAsDataURL(file);
  };
  const handleEditSave = async () => {
    if (!lesson || !courseId) return;
    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('description', editContent);
      
      if (editVideoFile) {
        formData.append('video', editVideoFile);
      }
      
      const res = await axios.put(`http://localhost:8000/courses/${courseId}/lessons/${lesson.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setLesson(res.data);
      setSnackbar('Урок обновлён!');
      setEditOpen(false);
    } catch (e) {
      setSnackbar('Ошибка при обновлении урока');
    }
  };

  const handleDeleteTest = async (testId: number) => {
    if (!courseId || !lessonId) return;
    try {
      await deleteTest(Number(courseId), Number(lessonId), testId);
      setSnackbar('Тест удалён!');
      // Обновляем список тестов
      const updatedTests = tests.filter(test => test.id !== testId);
      setTests(updatedTests);
    } catch (e) {
      setSnackbar('Ошибка при удалении теста');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={6}><CircularProgress size={48} /></Box>;
  if (!lesson) return <Typography color="error">{t('lessonNotFound') || 'Урок не найден'}</Typography>;

  return (
    <Fade in timeout={500}>
      <Card sx={{
        borderRadius: 4,
        boxShadow: '0 4px 32px 0 rgba(80,80,120,0.10)',
        p: { xs: 2, sm: 4 },
        background: 'linear-gradient(90deg, #e0f7fa 0%, #ede7f6 100%)',
        minHeight: 320,
        maxWidth: 700,
        mx: 'auto',
      }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48, boxShadow: 1 }}>
            <MenuBookIcon fontSize="medium" />
          </Avatar>
          <Typography variant="h4" fontWeight={700}>{lesson.title}</Typography>
          {user && (user.role === 'admin' || user.role === 'teacher') && (
            <Button variant="outlined" color="primary" sx={{ ml: 3, height: 40, fontWeight: 600 }} onClick={handleEditOpen}>
              Редактировать урок
            </Button>
          )}
        </Box>
        <CardContent sx={{ px: 0 }}>
          {/* Отображаем секции урока */}
          {lesson.sections && lesson.sections.length > 0 ? (
            lesson.sections.map((section, index) => (
              <Box key={section.id} mb={3}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  {section.title}
                </Typography>
                <Typography variant="body1" fontSize={18} color="text.primary" sx={{ whiteSpace: 'pre-line' }}>
                  {section.content}
                </Typography>
                {section.video && (
                  <Box mt={2}>
                    <video src={section.video} controls style={{ maxWidth: '100%', borderRadius: 8, boxShadow: '0 2px 16px 0 rgba(80,80,120,0.10)' }} />
                  </Box>
                )}
              </Box>
            ))
          ) : (
            <>
              <Typography variant="body1" fontSize={18} color="text.primary" sx={{ whiteSpace: 'pre-line' }}>
                {lesson.description}
              </Typography>
              {lesson.video && (
                <Box mt={3}>
                  <video src={lesson.video} controls style={{ maxWidth: '100%', borderRadius: 8, boxShadow: '0 2px 16px 0 rgba(80,80,120,0.10)' }} />
                </Box>
              )}
            </>
          )}
          {/* Отображение тестов урока */}
          <Box mt={4}>
            <Typography variant="h5" mb={2}>Тесты урока</Typography>
            {tests.length === 0 ? (
              <Typography color="text.secondary">Нет тестов для этого урока.</Typography>
            ) : (
              tests.map(test => (
                <Box key={test.id} mb={2}>
                  <Typography variant="subtitle1" fontWeight={600}>{test.title}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>{test.description}</Typography>
                  {user && (user.role === 'admin' || user.role === 'teacher') && (
                    <Box display="flex" gap={1}>
                      <Button component={Link} to={`/tests/${test.id}/edit`} variant="outlined" color="primary" size="small">
                        Редактировать тест
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small"
                        onClick={() => handleDeleteTest(test.id)}
                        sx={{ fontWeight: 600, borderRadius: 2 }}
                      >
                        Удалить тест
                      </Button>
                    </Box>
                  )}
                  {user && user.role === 'student' && (
                    <Button component={Link} to={`/tests/${test.id}/pass`} variant="contained" color="success" size="small" sx={{ ml: 2 }}>
                      Пройти тест
                    </Button>
                  )}
                </Box>
              ))
            )}
          </Box>
        </CardContent>
        {/* Диалог редактирования урока */}
        <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
          <DialogTitle>Редактировать урок</DialogTitle>
          <DialogContent>
            <TextField
              label="Название урока"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Содержание урока"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              fullWidth
              multiline
              minRows={4}
              sx={{ mb: 2 }}
            />
            <Button variant="outlined" component="label" disabled={videoUploading} sx={{ mb: 2 }}>
              {videoUploading ? 'Загрузка...' : 'Загрузить видео'}
              <input type="file" accept="video/*" hidden onChange={handleVideoChange} />
            </Button>
            {editVideoPreview && (
              <Box mt={2}>
                <video src={editVideoPreview} controls style={{ maxWidth: '100%', borderRadius: 8, boxShadow: '0 2px 16px 0 rgba(80,80,120,0.10)' }} />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Отмена</Button>
            <Button onClick={handleEditSave} variant="contained" color="primary">Сохранить</Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={!!snackbar} autoHideDuration={2500} onClose={() => setSnackbar('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity={snackbar === 'Урок обновлён!' ? 'success' : 'error'} sx={{ width: '100%' }}>{snackbar}</Alert>
        </Snackbar>
      </Card>
    </Fade>
  );
};

export default LessonPage; 