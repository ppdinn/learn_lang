import React, { useEffect, useState } from 'react';
import { Typography, Card, CardContent, CircularProgress, LinearProgress, Box, Avatar, Button, Grid, Fade, TextField, Snackbar, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getCurrentUser, getCourses, getLessons, User, Course, Lesson, updateProfile, changePassword } from '../services/api';
import SchoolIcon from '@mui/icons-material/School';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Link } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Record<number, Lesson[]>>({});
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({ firstName: '', lastName: '', patronymic: '' });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [snackbar, setSnackbar] = useState('');

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
      // Загружаем уроки для каждого курса пользователя
      const userCourses = coursesData.filter((c: Course) => userData.progress?.courses?.includes(c.id));
      const lessonsObj: Record<number, Lesson[]> = {};
      for (const course of userCourses) {
        const lessonsRes = await getLessons(course.id);
        lessonsObj[course.id] = lessonsRes.data;
      }
      setLessons(lessonsObj);
    }).finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        patronymic: user.full_name || '',
      });
    }
  }, [user]);

  const handleProfileSave = async () => {
    try {
      const res = await updateProfile({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        full_name: profileData.patronymic
      });
      setUser(res.data);
      setEditMode(false);
      setSnackbar('Профиль обновлён!');
    } catch {
      setSnackbar('Ошибка обновления профиля');
    }
  };

  const handlePasswordChange = async () => {
    try {
      await changePassword(passwords.oldPassword, passwords.newPassword);
      setPasswords({ oldPassword: '', newPassword: '' });
      setSnackbar('Пароль успешно изменён!');
    } catch {
      setSnackbar('Ошибка смены пароля');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={6}><CircularProgress size={48} /></Box>;
  if (!token || !user) return null;

  const userCourses = courses.filter(c => user.progress?.courses?.includes(c.id));
  const completedLessons = (courseId: number) => lessons[courseId]?.length ? 1 : 0;

  // Получить инициалы пользователя
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Box>
      <Card sx={{
        mb: 4,
        borderRadius: 4,
        boxShadow: '0 4px 32px 0 rgba(80,80,120,0.10)',
        p: { xs: 2, sm: 4 },
        background: 'linear-gradient(90deg, #ede7f6 0%, #e0f7fa 100%)',
        position: 'relative',
        overflow: 'visible',
      }}>
        <Box display="flex" alignItems="center" gap={3}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 72, height: 72, fontSize: 36, boxShadow: 2 }}>
            {getInitials(user.username)}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h4" fontWeight={700} mb={1}>{t('profilePage')}</Typography>
            <Typography variant="body1" color="text.secondary" fontSize={18}>{user.last_name || ''} {user.first_name || ''} {user.full_name || ''}</Typography>
            <Typography variant="body2" color="text.secondary">Email: {user.email}</Typography>
            <Box mt={2}>
              {editMode ? (
                <Box display="flex" gap={2} mb={2}>
                  <TextField label="Фамилия" value={profileData.lastName} onChange={e => setProfileData(p => ({ ...p, lastName: e.target.value }))} size="small" />
                  <TextField label="Имя" value={profileData.firstName} onChange={e => setProfileData(p => ({ ...p, firstName: e.target.value }))} size="small" />
                  <TextField label="Отчество" value={profileData.patronymic} onChange={e => setProfileData(p => ({ ...p, patronymic: e.target.value }))} size="small" />
                </Box>
              ) : (
                <Button variant="outlined" color="primary" size="small" onClick={() => setEditMode(true)}>Редактировать</Button>
              )}
            </Box>
            <Box mt={3}>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>Смена пароля</Typography>
              <Box display="flex" gap={2} mb={2}>
                <TextField label="Старый пароль" type="password" value={passwords.oldPassword} onChange={e => setPasswords(p => ({ ...p, oldPassword: e.target.value }))} size="small" />
                <TextField label="Новый пароль" type="password" value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} size="small" />
                <Button variant="contained" color="secondary" size="small" onClick={handlePasswordChange}>Сменить</Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>
      <Snackbar open={!!snackbar} autoHideDuration={2500} onClose={() => setSnackbar('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%' }}>{snackbar}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage; 