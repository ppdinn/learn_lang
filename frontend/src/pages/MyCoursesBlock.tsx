import React, { useEffect, useState } from 'react';
import { Typography, Card, CircularProgress, LinearProgress, Box, Avatar, Button, Grid, Fade } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getCurrentUser, getCourses, getLessons, User, Course, Lesson } from '../services/api';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Link } from 'react-router-dom';

const MyCoursesBlock: React.FC = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Record<number, Lesson[]>>({});
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
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
      const userCourses = coursesData.filter((c: Course) => userData.progress?.courses?.includes(c.id));
      const lessonsObj: Record<number, Lesson[]> = {};
      for (const course of userCourses) {
        const lessonsRes = await getLessons(course.id);
        lessonsObj[course.id] = lessonsRes.data;
      }
      setLessons(lessonsObj);
    }).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress size={40} /></Box>;
  if (!token || !user) return null;

  const userCourses = courses.filter(c => user.progress?.courses?.includes(c.id));
  const completedLessons = (courseId: number) => lessons[courseId]?.length ? 1 : 0;

  return (
    <Box>
      <Typography variant="h5" mb={3} fontWeight={600}>{t('myCourses') || 'Мои курсы'}</Typography>
      {userCourses.length === 0 && (
        <Card sx={{ p: 3, mb: 2, borderRadius: 3, textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="body1">{t('noCourses') || 'Нет курсов'}</Typography>
        </Card>
      )}
      <Grid container spacing={3}>
        {userCourses.map(course => (
          <Grid key={course.id} size={{ xs: 12, sm: 6 }}>
            <Fade in timeout={500}>
              <Card sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                boxShadow: '0 2px 12px 0 rgba(80,80,120,0.08)',
                p: 2.5,
                height: '100%',
                transition: 'box-shadow 0.2s, transform 0.2s',
                '&:hover': {
                  boxShadow: '0 6px 24px 0 rgba(80,80,120,0.16)',
                  transform: 'translateY(-2px) scale(1.02)',
                },
              }}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 44, height: 44 }}>
                    <MenuBookIcon />
                  </Avatar>
                  <Box flexGrow={1}>
                    <Typography variant="h6" fontWeight={600}>{course.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{course.description}</Typography>
                  </Box>
                </Box>
                <Box mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    {t('progress')}: {completedLessons(course.id)} / {lessons[course.id]?.length || 0}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={lessons[course.id]?.length ? (completedLessons(course.id) / lessons[course.id].length) * 100 : 0}
                    sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                  />
                </Box>
                <Button
                  component={Link}
                  to={`/courses/${course.id}`}
                  variant="contained"
                  color="primary"
                  endIcon={<ArrowForwardIosIcon fontSize="small" />}
                  sx={{ borderRadius: 2, fontWeight: 600, mt: 'auto' }}
                >
                  {t('openCourse') || 'Открыть'}
                </Button>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyCoursesBlock; 