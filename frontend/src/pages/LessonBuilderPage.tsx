import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, IconButton, Divider, Stack, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { createLesson, createSection, Section } from '../services/api';

interface FormSection {
  id: number;
  title: string;
  content: string;
  video?: File;
  videoUrl?: string;
}

const LessonBuilderPage: React.FC = () => {
  const [lessonTitle, setLessonTitle] = useState('');
  const [sections, setSections] = useState<FormSection[]>([]);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionContent, setSectionContent] = useState('');
  const [sectionVideo, setSectionVideo] = useState<File | null>(null);
  const [sectionVideoUrl, setSectionVideoUrl] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState('');

  const addSection = () => {
    if (!sectionTitle.trim() && !sectionContent.trim()) return;
    setSections(prev => [
      ...prev,
      {
        id: Date.now(),
        title: sectionTitle,
        content: sectionContent,
        video: sectionVideo || undefined,
        videoUrl: sectionVideoUrl || undefined,
      },
    ]);
    setSectionTitle('');
    setSectionContent('');
    setSectionVideo(null);
    setSectionVideoUrl(null);
  };

  const removeSection = (id: number) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const handleSave = async () => {
    try {
      // Создаем урок
      const lesson = await createLesson(1, { // TODO: получить courseId из параметров
        title: lessonTitle,
        description: 'Урок созданный через конструктор'
      });
      
      // Создаем секции
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        await createSection(1, lesson.data.id, {
          title: section.title,
          content: section.content,
          order: i + 1
        });
      }
      
      setSnackbar('Урок сохранён!');
      setLessonTitle('');
      setSections([]);
    } catch (e) {
      setSnackbar('Ошибка при сохранении урока');
    }
  };

  return (
    <Box maxWidth={700} mx="auto" mt={5}>
      <Typography variant="h4" fontWeight={700} mb={3}>Конструктор урока</Typography>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <TextField
          label="Название урока"
          value={lessonTitle}
          onChange={e => setLessonTitle(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        />
        <Divider sx={{ mb: 3 }} />
        <Typography variant="h6" mb={2}>Секции урока</Typography>
        <Stack spacing={2} mb={3}>
          {sections.map(section => (
            <Paper key={section.id} sx={{ p: 2, borderRadius: 2, position: 'relative' }}>
              <IconButton size="small" sx={{ position: 'absolute', top: 8, right: 8 }} onClick={() => removeSection(section.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
              <Typography variant="subtitle1" fontWeight={600}>{section.title}</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>{section.content}</Typography>
              {section.videoUrl && (
                <Box mt={1}>
                  <video src={section.videoUrl} controls style={{ maxWidth: '100%', maxHeight: 220 }} />
                </Box>
              )}
              {section.video && !section.videoUrl && (
                <Typography variant="caption" color="text.secondary">{section.video.name}</Typography>
              )}
            </Paper>
          ))}
        </Stack>
        <Box mb={2} display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Заголовок секции"
            value={sectionTitle}
            onChange={e => setSectionTitle(e.target.value)}
            fullWidth
          />
          <TextField
            label="Текст секции"
            value={sectionContent}
            onChange={e => setSectionContent(e.target.value)}
            fullWidth
            multiline
            minRows={7}
          />
          <Box>
            <Button variant="outlined" component="label">
              Загрузить видео
              <input
                type="file"
                accept="video/*"
                hidden
                onChange={e => {
                  const file = e.target.files?.[0] || null;
                  setSectionVideo(file);
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setSectionVideoUrl(url);
                  } else {
                    setSectionVideoUrl(null);
                  }
                }}
              />
            </Button>
            {sectionVideo && (
              <Typography variant="body2" ml={2} display="inline">{sectionVideo.name}</Typography>
            )}
            {sectionVideoUrl && (
              <Box mt={2}>
                <video src={sectionVideoUrl} controls style={{ maxWidth: '100%', minHeight: 220, maxHeight: 360, borderRadius: 8, boxShadow: '0 2px 16px 0 rgba(80,80,120,0.10)' }} />
              </Box>
            )}
          </Box>
          <Box display="flex" justifyContent="flex-end">
            <IconButton color="primary" onClick={addSection}>
              <AddIcon />
            </IconButton>
          </Box>
        </Box>
        <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 2, fontWeight: 600, borderRadius: 2 }}>
          Сохранить урок
        </Button>
      </Paper>
      <Snackbar open={!!snackbar} autoHideDuration={2500} onClose={() => setSnackbar('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snackbar === 'Урок сохранён!' ? 'success' : 'error'} sx={{ width: '100%' }}>{snackbar}</Alert>
      </Snackbar>
    </Box>
  );
};

export default LessonBuilderPage; 