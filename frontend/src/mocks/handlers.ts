import { http } from 'msw';

declare global {
  interface Window {
    __mockCurrentUser?: any;
  }
}

const mockUser = {
  id: 1,
  username: 'demo',
  email: 'demo@example.com',
  firstName: 'Иван',
  lastName: 'Иванов',
  patronymic: 'Иванович',
  progress: { courses: [1] },
  role: 'admin',
};

const mockStudent = {
  id: 2,
  username: 'student',
  email: 'student@example.com',
  firstName: 'Петр',
  lastName: 'Петров',
  patronymic: 'Петрович',
  progress: { courses: [1] },
  role: 'student',
};

const mockCourses = [
  { id: 1, title: 'Английский для начинающих', description: 'Базовый курс английского языка.' },
  { id: 2, title: 'English Intermediate', description: 'Intermediate English course.' },
];

const mockLessons = {
  1: [
    { id: 1, title: 'Lesson 1: Приветствие', content: 'Hello! Hi! Good morning!', course: 1 },
    { id: 2, title: 'Lesson 2: Семья', content: 'Family members vocabulary', course: 1 },
  ],
  2: [
    { id: 1, title: 'Lesson 1: Travel', content: 'Travel vocabulary', course: 2 },
  ],
};

// Динамические уроки и тесты (в памяти)
let mockLessonsDynamic: any[] = [
  { id: 100, title: 'Пример урока', content: 'Содержимое урока', sections: [
    { id: 1, title: 'Введение', content: 'Текст введения' }
  ] }
];
let mockTestsDynamic: any[] = [
  { id: 100, title: 'Пример теста', description: 'Описание теста', questions: [
    { id: 1, text: 'Вопрос 1?', answers: [
      { id: 1, text: 'Ответ 1', correct: true },
      { id: 2, text: 'Ответ 2', correct: false }
    ] }
  ] }
];

export const handlers = [
  // Login
  http.post('/auth/login/', async ({ request }) => {
    const data = await request.json();
    let user = mockUser;
    if (
      data &&
      typeof data === 'object' &&
      typeof data.username === 'string' &&
      typeof data.password === 'string' &&
      data.username === 'student' &&
      data.password === 'student1'
    ) {
      user = mockStudent;
    }
    if (typeof window !== 'undefined') {
      window.__mockCurrentUser = user;
    }
    return new Response(JSON.stringify({ token: 'mock-token', user }), { status: 200 });
  }),
  // Register
  http.post('/auth/register/', () => {
    return new Response(JSON.stringify({ token: 'mock-token', user: mockUser }), { status: 200 });
  }),
  // Logout
  http.post('/auth/logout/', () => {
    return new Response(null, { status: 200 });
  }),
  // Get current user (с завершающим слэшем)
  http.get('/auth/user/', () => {
    if (typeof window !== 'undefined' && window.__mockCurrentUser) {
      return new Response(JSON.stringify(window.__mockCurrentUser), { status: 200 });
    }
    return new Response(JSON.stringify(mockUser), { status: 200 });
  }),
  // Get courses (с завершающим слэшем)
  http.get('/courses/', () => {
    return new Response(JSON.stringify(mockCourses), { status: 200 });
  }),
  // Get course by id (без завершающего слэша)
  http.get('/courses/:courseId', ({ params }) => {
    const { courseId } = params;
    const course = mockCourses.find(c => c.id === Number(courseId));
    if (course) return new Response(JSON.stringify(course), { status: 200 });
    return new Response(null, { status: 404 });
  }),
  // Get course by id (с завершающим слэшем)
  http.get('/courses/:courseId/', ({ params }) => {
    const { courseId } = params;
    const course = mockCourses.find(c => c.id === Number(courseId));
    if (course) return new Response(JSON.stringify(course), { status: 200 });
    return new Response(null, { status: 404 });
  }),
  // Get lessons for course (без завершающего слэша)
  http.get('/courses/:courseId/lessons', ({ params }) => {
    const courseIdNum = Number(params.courseId);
    return new Response(JSON.stringify(mockLessons[courseIdNum as keyof typeof mockLessons] || []), { status: 200 });
  }),
  // Get lessons for course (с завершающим слэшем)
  http.get('/courses/:courseId/lessons/', ({ params }) => {
    const courseIdNum = Number(params.courseId);
    return new Response(JSON.stringify(mockLessons[courseIdNum as keyof typeof mockLessons] || []), { status: 200 });
  }),
  // Get lesson by id (без завершающего слэша)
  http.get('/courses/:courseId/lessons/:lessonId', ({ params }) => {
    const courseIdNum = Number(params.courseId);
    const lessonIdNum = Number(params.lessonId);
    const lessons = mockLessons[courseIdNum as keyof typeof mockLessons] || [];
    const lesson = lessons.find(l => l.id === lessonIdNum);
    if (lesson) return new Response(JSON.stringify(lesson), { status: 200 });
    return new Response(null, { status: 404 });
  }),
  // Get lesson by id (с завершающим слэшем)
  http.get('/courses/:courseId/lessons/:lessonId/', ({ params }) => {
    const courseIdNum = Number(params.courseId);
    const lessonIdNum = Number(params.lessonId);
    const lessons = mockLessons[courseIdNum as keyof typeof mockLessons] || [];
    const lesson = lessons.find(l => l.id === lessonIdNum);
    if (lesson) return new Response(JSON.stringify(lesson), { status: 200 });
    return new Response(null, { status: 404 });
  }),
  // Обновление урока внутри курса
  http.put('/courses/:courseId/lessons/:lessonId/', async ({ params, request }) => {
    const courseIdNum = Number(params.courseId);
    const lessonIdNum = Number(params.lessonId);
    const lessons = mockLessons[courseIdNum as keyof typeof mockLessons];
    if (!lessons) return new Response(null, { status: 404 });
    const idx = lessons.findIndex((l: any) => l.id === lessonIdNum);
    if (idx === -1) return new Response(null, { status: 404 });
    const data = await request.json();
    lessons[idx] = {
      ...(lessons[idx] || {}),
      ...(typeof data === 'object' && data !== null ? data : {}),
      id: lessonIdNum,
      course: courseIdNum,
    };
    return new Response(JSON.stringify(lessons[idx]), { status: 200 });
  }),
  // --- LESSONS ---
  http.get('/lessons/', () => {
    return new Response(JSON.stringify(mockLessonsDynamic), { status: 200 });
  }),
  http.post('/lessons/', async ({ request }) => {
    const data = await request.json();
    if (
      !data ||
      typeof data !== 'object' ||
      typeof data.title !== 'string' ||
      typeof data.content !== 'string' ||
      !Array.isArray(data.sections)
    ) {
      return new Response(JSON.stringify({ detail: 'Invalid data' }), { status: 400 });
    }
    const newLesson = { ...data, id: Date.now() };
    mockLessonsDynamic.push(newLesson);
    return new Response(JSON.stringify(newLesson), { status: 201 });
  }),
  http.get('/lessons/:id', ({ params }) => {
    const lesson = mockLessonsDynamic.find(l => l.id === Number(params.id));
    if (lesson) return new Response(JSON.stringify(lesson), { status: 200 });
    return new Response(null, { status: 404 });
  }),
  http.put('/lessons/:id', async ({ params, request }) => {
    const idx = mockLessonsDynamic.findIndex(l => l.id === Number(params.id));
    if (idx === -1) return new Response(null, { status: 404 });
    const data = await request.json();
    if (
      !data ||
      typeof data !== 'object' ||
      typeof data.title !== 'string' ||
      typeof data.content !== 'string' ||
      !Array.isArray(data.sections)
    ) {
      return new Response(JSON.stringify({ detail: 'Invalid data' }), { status: 400 });
    }
    mockLessonsDynamic[idx] = { ...mockLessonsDynamic[idx], ...data };
    return new Response(JSON.stringify(mockLessonsDynamic[idx]), { status: 200 });
  }),
  http.delete('/lessons/:id', ({ params }) => {
    mockLessonsDynamic = mockLessonsDynamic.filter(l => l.id !== Number(params.id));
    return new Response(null, { status: 204 });
  }),
  // --- TESTS ---
  http.get('/tests/', () => {
    return new Response(JSON.stringify(mockTestsDynamic), { status: 200 });
  }),
  http.post('/tests/', async ({ request }) => {
    const data = await request.json();
    if (
      !data ||
      typeof data !== 'object' ||
      typeof data.title !== 'string' ||
      typeof data.description !== 'string' ||
      !Array.isArray(data.questions)
    ) {
      return new Response(JSON.stringify({ detail: 'Invalid data' }), { status: 400 });
    }
    const newTest = { ...data, id: Date.now() };
    mockTestsDynamic.push(newTest);
    return new Response(JSON.stringify(newTest), { status: 201 });
  }),
  http.get('/tests/:id', ({ params }) => {
    const test = mockTestsDynamic.find(t => t.id === Number(params.id));
    if (test) return new Response(JSON.stringify(test), { status: 200 });
    return new Response(null, { status: 404 });
  }),
  http.put('/tests/:id', async ({ params, request }) => {
    const idx = mockTestsDynamic.findIndex(t => t.id === Number(params.id));
    if (idx === -1) return new Response(null, { status: 404 });
    const data = await request.json();
    if (
      !data ||
      typeof data !== 'object' ||
      typeof data.title !== 'string' ||
      typeof data.description !== 'string' ||
      !Array.isArray(data.questions)
    ) {
      return new Response(JSON.stringify({ detail: 'Invalid data' }), { status: 400 });
    }
    mockTestsDynamic[idx] = { ...mockTestsDynamic[idx], ...data };
    return new Response(JSON.stringify(mockTestsDynamic[idx]), { status: 200 });
  }),
  http.delete('/tests/:id', ({ params }) => {
    mockTestsDynamic = mockTestsDynamic.filter(t => t.id !== Number(params.id));
    return new Response(null, { status: 204 });
  }),
  // Update profile
  http.put('/auth/user/', async ({ request }) => {
    const data = await request.json();
    Object.assign(mockUser, data);
    return new Response(JSON.stringify(mockUser), { status: 200 });
  }),
  // Change password
  http.post('/auth/change-password/', async ({ request }) => {
    // В реальном API тут была бы проверка старого пароля
    // Для mock всегда успех
    return new Response(JSON.stringify({ detail: 'Пароль успешно изменён' }), { status: 200 });
  }),
]; 