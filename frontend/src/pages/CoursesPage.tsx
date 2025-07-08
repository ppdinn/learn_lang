import React, { useEffect, useState } from 'react';
import { Typography, Card, CardContent, CardActions, Button, CircularProgress, Box, Avatar, Fade, Grid, Snackbar, Alert, Stack, Paper, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getCourses, Course, User, getFinalTests } from '../services/api';
import { Link as RouterLink } from 'react-router-dom';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CreateCourseForm from './CreateCourseForm';
import EditCourseForm from './EditCourseForm';

const CoursesPage: React.FC = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user: User | null = userStr ? JSON.parse(userStr) : null;
  const [lessons, setLessons] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [snackbar, setSnackbar] = useState('');
  const [finalTestMap, setFinalTestMap] = useState<Record<number, number>>({});

  useEffect(() => {
    getCourses()
      .then(async res => {
        setCourses(res.data);
        // Для каждого курса загружаем итоговый тест
        const map: Record<number, number> = {};
        await Promise.all(res.data.map(async (course: any) => {
          try {
            const finalTestsRes = await getFinalTests(course.id);
            if (finalTestsRes.data && finalTestsRes.data.length > 0) {
              map[course.id] = finalTestsRes.data[0].id;
            }
          } catch {}
        }));
        setFinalTestMap(map);
      })
      .catch(err => console.error('Error loading courses:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCourseCreated = (course: Course) => {
    setCourses(prev => [...prev, course]);
    setSnackbar('Курс успешно создан!');
  };

  const handleCourseUpdated = (course: Course) => {
    setCourses(prev => prev.map(c => c.id === course.id ? course : c));
    setSnackbar('Курс успешно обновлен!');
  };

  const handleCourseDeleted = () => {
    setSnackbar('Курс успешно удален!');
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setEditFormOpen(true);
  };

  const isTeacherOrAdmin = user && (user.role === 'teacher' || user.role === 'admin');

  if (loading) return <Box display="flex" justifyContent="center" mt={6}><CircularProgress size={48} /></Box>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700} letterSpacing={1}>{t('coursesCatalog')}</Typography>
      </Box>
      
      {isTeacherOrAdmin && (
        <Box mb={3} display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateFormOpen(true)}
            sx={{ fontWeight: 600, borderRadius: 2 }}
          >
            Создать курс
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ fontWeight: 600, borderRadius: 2 }}
            component={RouterLink}
            to="/lesson-builder"
          >
            Создать урок
          </Button>
        </Box>
      )}
      <Grid container spacing={4}>
        {courses.map(course => (
          <Grid key={course.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Fade in timeout={600}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                boxShadow: '0 4px 24px 0 rgba(80,80,120,0.10)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.03)',
                  boxShadow: '0 8px 32px 0 rgba(80,80,120,0.16)',
                },
              }}>
                <Box display="flex" justifyContent="center" alignItems="center" pt={3}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <MenuBookIcon fontSize="large" />
                  </Avatar>
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>{course.title}</Typography>
                  <Typography variant="body2" color="text.secondary" minHeight={48}>{course.description}</Typography>
                </CardContent>
                <CardActions sx={{ pb: 2, px: 2 }}>
                  {user && user.role === 'student' && finalTestMap[course.id] && (
                    <Button
                      component={RouterLink}
                      to={`/tests/${finalTestMap[course.id]}/pass`}
                      variant="outlined"
                      color="secondary"
                      sx={{ fontWeight: 600, borderRadius: 2, mr: 1 }}
                    >
                      Пройти итоговый тест
                    </Button>
                  )}
                  {user && user.role === 'student' && (
                    <Button
                      component={RouterLink}
                      to={`/courses/${course.id}`}
                      variant="contained"
                      color="primary"
                      sx={{ fontWeight: 600, borderRadius: 2 }}
                    >
                      Смотреть урок
                    </Button>
                  )}
                  {isTeacherOrAdmin && (
                    <Box display="flex" gap={1}>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditCourse(course)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <Button
                        component={RouterLink}
                        to={`/courses/${course.id}`}
                        variant="contained"
                        color="primary"
                        fullWidth
                        endIcon={<MenuBookIcon />}
                        sx={{ fontWeight: 600, borderRadius: 2 }}
                      >
                        {t('openCourse') || 'Открыть'}
                      </Button>
                    </Box>
                  )}
                </CardActions>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* Формы создания и редактирования курсов */}
      <CreateCourseForm
        open={createFormOpen}
        onClose={() => setCreateFormOpen(false)}
        onCourseCreated={handleCourseCreated}
      />
      
      <EditCourseForm
        open={editFormOpen}
        onClose={() => setEditFormOpen(false)}
        course={editingCourse}
        onCourseUpdated={handleCourseUpdated}
        onCourseDeleted={handleCourseDeleted}
      />

      {/* Snackbar для уведомлений */}
      <Snackbar 
        open={!!snackbar} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackbar}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CoursesPage; 