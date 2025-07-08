import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Box,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import { createCourse, Course } from '../services/api';

interface CreateCourseFormProps {
  open: boolean;
  onClose: () => void;
  onCourseCreated: (course: Course) => void;
}

const CreateCourseForm: React.FC<CreateCourseFormProps> = ({ open, onClose, onCourseCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Название курса обязательно');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await createCourse({
        title: title.trim(),
        description: description.trim()
      });
      
      onCourseCreated(response.data);
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка при создании курса');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Создать новый курс
          </Typography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box mb={3}>
              <TextField
                label="Название курса"
                value={title}
                onChange={e => setTitle(e.target.value)}
                fullWidth
                required
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                label="Описание курса"
                value={description}
                onChange={e => setDescription(e.target.value)}
                fullWidth
                multiline
                minRows={4}
                variant="outlined"
                placeholder="Опишите содержание курса, цели обучения и требования к студентам..."
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose} disabled={loading}>
              Отмена
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading || !title.trim()}
              sx={{ fontWeight: 600 }}
            >
              {loading ? 'Создание...' : 'Создать курс'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={4000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateCourseForm; 