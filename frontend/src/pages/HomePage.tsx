import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Avatar, 
  Button, 
  Chip, 
  LinearProgress, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Fade,
  CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getCurrentUser, getCourses, getLessons, User, Course, Lesson } from '../services/api';
import { Link } from 'react-router-dom';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Record<number, Lesson[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    Promise.all([
      getCurrentUser().then(res => res.data),
      getCourses().then(res => res.data),
    ]).then(async ([userData, coursesData]) => {
      setUser(userData);
      setCourses(coursesData);
      
      // Загружаем уроки для всех курсов
      const lessonsObj: Record<number, Lesson[]> = {};
      for (const course of coursesData) {
        try {
          const lessonsRes = await getLessons(course.id);
          lessonsObj[course.id] = lessonsRes.data;
        } catch (error) {
          lessonsObj[course.id] = [];
        }
      }
      setLessons(lessonsObj);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!user) return null;

  // Статистика
  const userCourses = courses.filter(c => user.progress?.courses?.includes(c.id));
  const totalLessons = userCourses.reduce((sum, course) => sum + (lessons[course.id]?.length || 0), 0);
  const completedLessons = userCourses.reduce((sum, course) => {
    const courseLessons = lessons[course.id] || [];
    return sum + courseLessons.filter(lesson => user.progress?.completedLessons?.includes(lesson.id)).length;
  }, 0);
  const averageScore = user.progress?.averageScore || 85;

  // Последняя активность (моковые данные)
  const recentActivity = [
    { type: 'lesson', text: 'Завершён урок "Грамматика Present Simple"', time: '2 часа назад', course: 'Английский для начинающих' },
    { type: 'test', text: 'Пройден тест "Лексика: Семья"', time: 'Вчера', score: '85%' },
    { type: 'course', text: 'Начат курс "Французский язык"', time: '3 дня назад' }
  ];

  // Достижения (моковые данные)
  const achievements = [
    { title: 'Неделя подряд', description: '7 дней подряд изучения', icon: '🔥' },
    { title: 'Первый тест', description: 'Первый пройденный тест', icon: '🎯' },
    { title: 'Упорство', description: '5 уроков подряд', icon: '💪' }
  ];

  return (
    <Box>
      {/* Приветствие */}
      <Fade in timeout={600}>
        <Card sx={{ 
          mb: 4, 
          borderRadius: 4, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 3
        }}>
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 64, height: 64 }}>
              <SchoolIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700} mb={1}>
                Добро пожаловать, {user.first_name || user.username}!
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Продолжайте изучать языки и достигайте новых высот
              </Typography>
            </Box>
          </Box>
        </Card>
      </Fade>

      {/* Статистика */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Fade in timeout={700}>
            <Card sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="h4" color="primary" fontWeight={700}>
                {userCourses.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Курсов в изучении
              </Typography>
            </Card>
          </Fade>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Fade in timeout={800}>
            <Card sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="h4" color="secondary" fontWeight={700}>
                {completedLessons}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Завершённых уроков
              </Typography>
            </Card>
          </Fade>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Fade in timeout={900}>
            <Card sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="h4" color="success.main" fontWeight={700}>
                8
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Пройденных тестов
              </Typography>
            </Card>
          </Fade>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Fade in timeout={1000}>
            <Card sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="h4" color="warning.main" fontWeight={700}>
                {averageScore}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Средний балл
              </Typography>
            </Card>
          </Fade>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Быстрые действия */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Fade in timeout={1100}>
            <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={600} mb={3} display="flex" alignItems="center" gap={1}>
                <PlayArrowIcon color="primary" />
                Быстрые действия
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                {userCourses.slice(0, 2).map(course => (
                  <Button
                    key={course.id}
                    component={Link}
                    to={`/courses/${course.id}`}
                    variant="outlined"
                    startIcon={<MenuBookIcon />}
                    sx={{ 
                      justifyContent: 'flex-start', 
                      p: 2,
                      height: 48,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      borderRadius: 2
                    }}
                  >
                    Продолжить: {course.title}
                  </Button>
                ))}
                <Button
                  component={Link}
                  to="/courses"
                  variant="contained"
                  startIcon={<TrendingUpIcon />}
                  sx={{ 
                    justifyContent: 'flex-start', 
                    p: 2,
                    height: 48,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    borderRadius: 2
                  }}
                >
                  Посмотреть все курсы
                </Button>
              </Box>
            </Card>
          </Fade>
        </Grid>

        {/* Последняя активность */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Fade in timeout={1200}>
            <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={600} mb={3} display="flex" alignItems="center" gap={1}>
                <AccessTimeIcon color="primary" />
                Последняя активность
              </Typography>
              <List>
                {recentActivity.map((activity, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      {activity.type === 'lesson' && <MenuBookIcon color="success" />}
                      {activity.type === 'test' && <AssignmentIcon color="primary" />}
                      {activity.type === 'course' && <SchoolIcon color="secondary" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.text}
                      secondary={activity.time}
                    />
                    {activity.score && (
                      <Chip label={activity.score} color="success" size="small" />
                    )}
                  </ListItem>
                ))}
              </List>
            </Card>
          </Fade>
        </Grid>

        {/* Достижения */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Fade in timeout={1300}>
            <Card sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={3} display="flex" alignItems="center" gap={1}>
                <EmojiEventsIcon color="primary" />
                Ваши достижения
              </Typography>
              <Grid container spacing={2}>
                {achievements.map((achievement, index) => (
                  <Grid size={{ xs: 12, sm: 4 }} key={index}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                      <Typography variant="h4" mb={1}>{achievement.icon}</Typography>
                      <Typography variant="body2" fontWeight={600}>{achievement.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{achievement.description}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Fade>
        </Grid>

        {/* Рекомендуемые курсы */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Fade in timeout={1400}>
            <Card sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={3} display="flex" alignItems="center" gap={1}>
                <StarIcon color="primary" />
                Рекомендуем вам
              </Typography>
              {courses.slice(0, 2).map(course => (
                <Box key={course.id} mb={2}>
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <MenuBookIcon />
                      </Avatar>
                      <Box flexGrow={1}>
                        <Typography variant="subtitle1" fontWeight={600}>{course.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{course.description}</Typography>
                      </Box>
                      <Button
                        component={Link}
                        to={`/courses/${course.id}`}
                        variant="contained"
                        size="medium"
                        endIcon={<ArrowForwardIosIcon />}
                        sx={{ 
                          minWidth: 100,
                          height: 40,
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          borderRadius: 2,
                          textTransform: 'none',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            transform: 'translateY(-1px)'
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        Начать
                      </Button>
                    </Box>
                  </Paper>
                </Box>
              ))}
            </Card>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage; 