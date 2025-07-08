import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, InputAdornment, Snackbar, Alert, Select, MenuItem, SelectChangeEvent, Fade, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import LanguageIcon from '@mui/icons-material/Language';
import CloseIcon from '@mui/icons-material/Close';

const ProfileSettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [lang, setLang] = useState(i18n.language);

  const handleEmailChange = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(t('emailChanged'));
    setError('');
    setSnackbarOpen(true);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !newPassword) {
      setError(t('fillPasswordFields'));
      setSuccess('');
      setSnackbarOpen(true);
      return;
    }
    setSuccess(t('passwordChanged'));
    setError('');
    setPassword('');
    setNewPassword('');
    setSnackbarOpen(true);
  };

  const handleLangChange = (e: SelectChangeEvent<string>) => {
    const lng = e.target.value;
    setLang(lng);
    i18n.changeLanguage(lng);
    setSuccess(t('languageChanged'));
    setError('');
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <Fade in timeout={500}>
      <Box maxWidth={420} mx="auto" mt={8}>
        <Paper elevation={4} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 4, boxShadow: '0 4px 32px 0 rgba(80,80,120,0.10)' }}>
          <Typography variant="h5" mb={3} fontWeight={700} textAlign="center">{t('profileSettings')}</Typography>
          <form onSubmit={handleEmailChange}>
            <TextField
              label={t('email')}
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mb: 2, fontWeight: 600, borderRadius: 2 }}>{t('changeEmail')}</Button>
          </form>
          <form onSubmit={handlePasswordChange}>
            <TextField
              label={t('currentPassword')}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label={t('newPassword')}
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mb: 2, fontWeight: 600, borderRadius: 2 }}>{t('changePassword')}</Button>
          </form>
          <Typography variant="subtitle1" mt={2} mb={1} fontWeight={600}>{t('interfaceLanguage')}</Typography>
          <Select
            value={lang}
            onChange={handleLangChange}
            fullWidth
            startAdornment={<InputAdornment position="start"><LanguageIcon color="primary" /></InputAdornment>}
            sx={{ mb: 1, borderRadius: 2 }}
          >
            <MenuItem value="ru">Русский</MenuItem>
            <MenuItem value="en">English</MenuItem>
          </Select>
        </Paper>
        <Snackbar
          open={snackbarOpen && (!!success || !!error)}
          autoHideDuration={3500}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={!!success ? 'success' : 'error'}
            sx={{ width: '100%' }}
            action={
              <IconButton size="small" color="inherit" onClick={handleSnackbarClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            {success || error}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default ProfileSettingsPage; 