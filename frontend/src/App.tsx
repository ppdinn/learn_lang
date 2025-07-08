import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, Navigate, Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container, Menu, MenuItem, IconButton, Avatar, Divider, ListItemIcon, ListItemText } from '@mui/material';
import { useTranslation } from 'react-i18next';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CoursePage from './pages/CoursePage';
import LessonPage from './pages/LessonPage';
import ProfilePage from './pages/ProfilePage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LanguageIcon from '@mui/icons-material/Language';
import SchoolIcon from '@mui/icons-material/School';
import { getCurrentUser, User } from './services/api';
import { CircularProgress } from '@mui/material';
import LessonBuilderPage from './pages/LessonBuilderPage';
import TestBuilderPage from './pages/TestBuilderPage';
import LessonEditPage from './pages/LessonEditPage';
import TestEditPage from './pages/TestEditPage';
import FinalTestPage from './pages/FinalTestPage';
import TestPassPage from './pages/TestPassPage';
import TestResultsPage from './pages/TestResultsPage';

const ProtectedRoute: React.FC<{ roles?: User['role'][] }> = ({ roles }) => {
  const userStr = localStorage.getItem('user');
  const user: User | null = userStr ? JSON.parse(userStr) : null;
  const isAuth = !!localStorage.getItem('token') && !!user;
  if (!isAuth) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
};

const App: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
    if (!token) {
      setUser(null);
      setCheckingAuth(false);
      return;
    }
    getCurrentUser()
      .then((res) => {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      .finally(() => setCheckingAuth(false));
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLangAnchor(null);
  };
  const handleLangMenu = (event: React.MouseEvent<HTMLElement>) => setLangAnchor(event.currentTarget);
  const handleLangClose = () => setLangAnchor(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  if (checkingAuth) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress size={60} /></Box>;
  }

  return (
    <Box>
      <AppBar position="sticky" elevation={3} sx={{ bgcolor: 'background.paper', color: 'primary.main', boxShadow: '0 2px 16px 0 rgba(80,80,120,0.08)', fontFamily: 'Inter, system-ui, Arial, sans-serif' }}>
        <Toolbar sx={{ fontFamily: 'Inter, system-ui, Arial, sans-serif', fontSize: '1.13rem' }}>
          <IconButton edge="start" color="primary" sx={{ mr: 2 }} component={Link} to="/">
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
              <SchoolIcon sx={{ color: 'white' }} />
            </Avatar>
          </IconButton>
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1, fontFamily: 'Inter, system-ui, Arial, sans-serif' }}>
            {t('appTitle')}
          </Typography>
          {user && <Typography sx={{ mr: 2, fontWeight: 600, color: 'primary.dark', fontFamily: 'Inter, system-ui, Arial, sans-serif' }}>{user.role.toUpperCase()}</Typography>}
          {user && <Button color="primary" variant="text" component={Link} to="/" sx={{ mx: 1, fontWeight: 700, fontSize: '1.15rem', letterSpacing: '0.07em', fontFamily: 'Inter, system-ui, Arial, sans-serif', '&:hover': { bgcolor: 'primary.50' } }}>{t('home')}</Button>}
          {user && <Button color="primary" variant="text" component={Link} to="/courses" sx={{ mx: 1, fontWeight: 700, fontSize: '1.15rem', letterSpacing: '0.07em', fontFamily: 'Inter, system-ui, Arial, sans-serif', '&:hover': { bgcolor: 'primary.50' } }}>{t('courses')}</Button>}
          {user && <Button color="primary" variant="text" component={Link} to="/profile" sx={{ mx: 1, fontWeight: 700, fontSize: '1.15rem', letterSpacing: '0.07em', fontFamily: 'Inter, system-ui, Arial, sans-serif', '&:hover': { bgcolor: 'primary.50' } }}>{t('profile')}</Button>}
          {!user && <Button color="primary" variant="outlined" component={Link} to="/login" sx={{ mx: 1, fontWeight: 700, fontSize: '1.15rem', letterSpacing: '0.07em', fontFamily: 'Inter, system-ui, Arial, sans-serif' }}>{t('login') || 'Вход'}</Button>}
          {!user && <Button color="secondary" variant="contained" component={Link} to="/register" sx={{ mx: 1, fontWeight: 700, fontSize: '1.15rem', letterSpacing: '0.07em', fontFamily: 'Inter, system-ui, Arial, sans-serif' }}>{t('register') || 'Регистрация'}</Button>}
          {user && <Button color="primary" variant="outlined" onClick={handleLogout} sx={{ mx: 1, fontWeight: 700, fontSize: '1.15rem', letterSpacing: '0.07em', fontFamily: 'Inter, system-ui, Arial, sans-serif' }}>{t('logout') || 'Выйти'}</Button>}
          <Divider orientation="vertical" flexItem sx={{ mx: 2, borderColor: 'primary.100' }} />
          <IconButton
            color="primary"
            onClick={handleLangMenu}
            sx={{ ml: 1, bgcolor: 'primary.50', borderRadius: 2, p: 1.1, transition: 'background 0.2s', '&:hover': { bgcolor: 'primary.100' } }}
            aria-label={t('changeLanguage') || 'Сменить язык'}
          >
            <LanguageIcon sx={{ fontSize: 28 }} />
          </IconButton>
          <Menu
            anchorEl={langAnchor}
            open={Boolean(langAnchor)}
            onClose={handleLangClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { minWidth: 160, borderRadius: 2, fontFamily: 'Inter, system-ui, Arial, sans-serif' } }}
          >
            <MenuItem selected={i18n.language === 'ru'} onClick={() => changeLanguage('ru')} sx={{ fontFamily: 'Inter, system-ui, Arial, sans-serif', fontSize: '1.08rem' }}>
              <ListItemIcon sx={{ minWidth: 32 }}><span role="img" aria-label="ru">🇷🇺</span></ListItemIcon>
              <ListItemText primary="Русский" sx={{ fontFamily: 'Inter, system-ui, Arial, sans-serif' }} />
            </MenuItem>
            <MenuItem selected={i18n.language === 'en'} onClick={() => changeLanguage('en')} sx={{ fontFamily: 'Inter, system-ui, Arial, sans-serif', fontSize: '1.08rem' }}>
              <ListItemIcon sx={{ minWidth: 32 }}><span role="img" aria-label="en">🇬🇧</span></ListItemIcon>
              <ListItemText primary="English" sx={{ fontFamily: 'Inter, system-ui, Arial, sans-serif' }} />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4, mb: 4, maxWidth: 'md' }}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:courseId" element={<CoursePage />} />
            <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/settings" element={<ProfileSettingsPage />} />
            <Route path="/courses/:courseId/final-tests/:testId" element={<FinalTestPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={['teacher', 'admin']} />}>
            <Route path="/lesson-builder" element={<LessonBuilderPage />} />
            <Route path="/test-builder" element={<TestBuilderPage />} />
            <Route path="/lessons/:id/edit" element={<LessonEditPage />} />
            <Route path="/tests/:id/edit" element={<TestEditPage />} />
          </Route>
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/register" element={<RegisterPage setUser={setUser} />} />
          <Route path="/tests/:id/pass" element={<TestPassPage />} />
          <Route path="/tests/:id/results" element={<TestResultsPage />} />
        </Routes>
      </Container>
    </Box>
  );
};

export default App;
