import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';

interface CreateTestFormProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { title: string; description: string }) => void;
}

const CreateTestForm: React.FC<CreateTestFormProps> = ({ open, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ title, description });
    setTitle('');
    setDescription('');
    onClose();
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Создать тест</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box mb={2}>
            <TextField
              label="Название теста"
              value={title}
              onChange={e => setTitle(e.target.value)}
              fullWidth
              required
            />
          </Box>
          <TextField
            label="Описание"
            value={description}
            onChange={e => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={2}
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

export default CreateTestForm; 