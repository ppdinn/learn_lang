import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Добавляем интерцептор для автоматической подстановки токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Типы данных
export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role: 'student' | 'teacher' | 'admin';
  progress?: any;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  author: User;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  video?: string;
  order: number;
  sections: Section[];
  created_at: string;
  updated_at: string;
  content?: string; // Для обратной совместимости
}

export interface Section {
  id: number;
  title: string;
  content: string;
  video?: string;
  order: number;
}

export interface Test {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

export interface Question {
  id: number;
  text: string;
  answers: Answer[];
}

export interface Answer {
  id: number;
  text: string;
  is_correct: boolean;
}

// Аутентификация
export const login = (username: string, password: string) =>
  api.post('/auth/login/', { username, password });

export const register = (username: string, email: string, password: string, first_name?: string, last_name?: string, role?: string) =>
  api.post('/auth/register/', { username, email, password, first_name, last_name, role });

export const logout = () => api.post('/auth/logout/');

export const getCurrentUser = () => api.get<User>('/auth/user/');

// Курсы и уроки
export const getCourses = () => api.get<Course[]>('/courses/');
export const getCourse = (id: number) => api.get<Course>(`/courses/${id}/`);
export const createCourse = (data: Partial<Course>) => api.post<Course>('/courses/', data);
export const updateCourse = (id: number, data: Partial<Course>) => api.put<Course>(`/courses/${id}/`, data);
export const deleteCourse = (id: number) => api.delete(`/courses/${id}/`);

export const getLessons = (courseId: number) => api.get<Lesson[]>(`/courses/${courseId}/lessons/`);
export const getLesson = (courseId: number, lessonId: number) => api.get<Lesson>(`/courses/${courseId}/lessons/${lessonId}/`);
export const createLesson = (courseId: number, data: Partial<Lesson>) => api.post<Lesson>(`/courses/${courseId}/lessons/`, data);
export const updateLesson = (courseId: number, lessonId: number, data: Partial<Lesson>) =>
  api.put<Lesson>(`/courses/${courseId}/lessons/${lessonId}/`, data);
export const deleteLesson = (courseId: number, lessonId: number) => api.delete(`/courses/${courseId}/lessons/${lessonId}/`);

// Секции
export const createSection = (courseId: number, lessonId: number, data: Partial<Section>) =>
  api.post<Section>(`/courses/${courseId}/lessons/${lessonId}/sections/`, data);
export const updateSection = (courseId: number, lessonId: number, sectionId: number, data: Partial<Section>) =>
  api.put<Section>(`/courses/${courseId}/lessons/${lessonId}/sections/${sectionId}/`, data);
export const deleteSection = (courseId: number, lessonId: number, sectionId: number) =>
  api.delete(`/courses/${courseId}/lessons/${lessonId}/sections/${sectionId}/`);

// Тесты
export const getTests = (courseId: number, lessonId: number) => api.get<Test[]>(`/courses/${courseId}/lessons/${lessonId}/tests/`);
export const getTest = (courseId: number, lessonId: number, testId: number) => api.get<Test>(`/courses/${courseId}/lessons/${lessonId}/tests/${testId}/`);
export const createTest = (courseId: number, lessonId: number, data: Partial<Test>) =>
  api.post<Test>(`/courses/${courseId}/lessons/${lessonId}/tests/`, data);
export const updateTest = (courseId: number, lessonId: number, testId: number, data: Partial<Test>) =>
  api.put<Test>(`/courses/${courseId}/lessons/${lessonId}/tests/${testId}/`, data);
export const deleteTest = (courseId: number, lessonId: number, testId: number) =>
  api.delete(`/courses/${courseId}/lessons/${lessonId}/tests/${testId}/`);

// Вопросы
export const createQuestion = (courseId: number, lessonId: number, testId: number, data: Partial<Question>) =>
  api.post<Question>(`/courses/${courseId}/lessons/${lessonId}/tests/${testId}/questions/`, data);
export const updateQuestion = (courseId: number, lessonId: number, testId: number, questionId: number, data: Partial<Question>) =>
  api.put<Question>(`/courses/${courseId}/lessons/${lessonId}/tests/${testId}/questions/${questionId}/`, data);
export const deleteQuestion = (courseId: number, lessonId: number, testId: number, questionId: number) =>
  api.delete(`/courses/${courseId}/lessons/${lessonId}/tests/${testId}/questions/${questionId}/`);

// Ответы
export const createAnswer = (courseId: number, lessonId: number, testId: number, questionId: number, data: Partial<Answer>) =>
  api.post<Answer>(`/courses/${courseId}/lessons/${lessonId}/tests/${testId}/questions/${questionId}/answers/`, data);
export const updateAnswer = (courseId: number, lessonId: number, testId: number, questionId: number, answerId: number, data: Partial<Answer>) =>
  api.put<Answer>(`/courses/${courseId}/lessons/${lessonId}/tests/${testId}/questions/${questionId}/answers/${answerId}/`, data);
export const deleteAnswer = (courseId: number, lessonId: number, testId: number, questionId: number, answerId: number) =>
  api.delete(`/courses/${courseId}/lessons/${lessonId}/tests/${testId}/questions/${questionId}/answers/${answerId}/`);

// Профиль
export const updateProfile = (data: Partial<User>) => api.put<User>('/auth/profile/', data);
export const changePassword = (oldPassword: string, newPassword: string) => api.post('/auth/change-password/', { oldPassword, newPassword });

// Итоговые тесты курса
export const getFinalTests = (courseId: number) => api.get<Test[]>(`/courses/${courseId}/final-tests/`);
export const getFinalTest = (courseId: number, testId: number) => api.get<Test>(`/courses/${courseId}/final-tests/${testId}/`);
export const createFinalTest = (courseId: number, data: Partial<Test>) => api.post<Test>(`/courses/${courseId}/final-tests/`, data);
export const updateFinalTest = (courseId: number, testId: number, data: Partial<Test>) => api.put<Test>(`/courses/${courseId}/final-tests/${testId}/`, data);
export const deleteFinalTest = (courseId: number, testId: number) => api.delete(`/courses/${courseId}/final-tests/${testId}/`);

export const getTestById = (testId: number) => api.get<Test>(`/courses/api/tests/${testId}/`);

export const submitTestResult = (testId: number, score: number, answers: any) => api.post(`/courses/api/tests/${testId}/submit/`, { score, answers });

export const getTestResults = (testId: number) => api.get(`/courses/api/tests/${testId}/results/`); 