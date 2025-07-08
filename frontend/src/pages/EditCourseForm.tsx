import React, { useState, useEffect } from 'react';
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
  Alert,
  IconButton
} from '@mui/material';
import { updateCourse, deleteCourse, Course } from '../services/api';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

interface EditCourseFormProps {
  open: boolean;
  onClose: () => void;
  course: Course | null;
  onCourseUpdated: (course: Course) => void;
  onCourseDeleted: () => void;
}

const EditCourseForm: React.FC<EditCourseFormProps> = ({ 
  open, 
  onClose, 
  course, 
  onCourseUpdated, 
  onCourseDeleted 
}) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description);
    }
  }, [course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !title.trim()) {
      setError('Название курса обязательно');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await updateCourse(course.id, {
        title: title.trim(),
        description: description.trim()
      });
      
      onCourseUpdated(response.data);
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка при обновлении курса');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!course) return;

    setLoading(true);
    setError('');

    try {
      await deleteCourse(course.id);
      onCourseDeleted();
      handleClose();
      navigate('/courses');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка при удалении курса');
    } finally {
      setLoading(false);
      setDeleteConfirm(false);
    }
  };

  const handleClose = () => {
    setError('');
    setLoading(false);
    setDeleteConfirm(false);
    onClose();
  };

  if (!course) return null;

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={600}>
              Редактировать курс
            </Typography>
            <IconButton 
              color="error" 
              onClick={() => setDeleteConfirm(true)}
              disabled={loading}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
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
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight={600} color="error">
            Удалить курс?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить курс "{course.title}"? 
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteConfirm(false)} disabled={loading}>
            Отмена
          </Button>
          <Button 
            onClick={handleDelete}
            variant="contained" 
            color="error"
            disabled={loading}
            sx={{ fontWeight: 600 }}
          >
            {loading ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
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

export default EditCourseForm; 