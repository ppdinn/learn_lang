import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';

interface CreateLessonFormProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { title: string; content: string }) => void;
}

const CreateLessonForm: React.FC<CreateLessonFormProps> = ({ open, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ title, content });
    setTitle('');
    setContent('');
    onClose();
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Создать урок</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box mb={2}>
            <TextField
              label="Название урока"
              value={title}
              onChange={e => setTitle(e.target.value)}
              fullWidth
              required
            />
          </Box>
          <TextField
            label="Описание/Содержание"
            value={content}
            onChange={e => setContent(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Отмена</Button>
          <Button type="submit" variant="contained" color="primary">Создать</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateLessonForm; 