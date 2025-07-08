import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, InputAdornment, Snackbar, Alert, Fade, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { register, User } from '../services/api';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import CloseIcon from '@mui/icons-material/Close';

interface RegisterPageProps {
  setUser: (user: User) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await register(username, email, password);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      navigate('/profile');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.username?.[0] ||
                          err.response?.data?.email?.[0] ||
                          err.response?.data?.password?.[0] ||
                          'Registration failed';
      setError(errorMessage);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <Fade in timeout={500}>
      <Box maxWidth={400} mx="auto" mt={10}>
        <Paper elevation={4} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 4, boxShadow: '0 4px 32px 0 rgba(80,80,120,0.10)' }}>
          <Typography variant="h5" mb={3} fontWeight={700} textAlign="center">Регистрация</Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Имя пользователя"
              value={username}
              onChange={e => setUsername(e.target.value)}
              fullWidth
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Пароль"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, fontWeight: 600, borderRadius: 2 }}
              disabled={loading}
            >
              Зарегистрироваться
            </Button>
          </form>
        </Paper>
        <Snackbar
          open={snackbarOpen && !!error}
          autoHideDuration={3500}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity="error"
            sx={{ width: '100%' }}
            action={
              <IconButton size="small" color="inherit" onClick={handleSnackbarClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default RegisterPage; 