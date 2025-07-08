from django.urls import path
from . import views

urlpatterns = [
    # Курсы
    path('', views.CourseListCreateView.as_view(), name='course-list-create'),
    path('<int:pk>/', views.CourseDetailView.as_view(), name='course-detail'),
    
    # Уроки
    path('<int:course_id>/lessons/', views.LessonListCreateView.as_view(), name='lesson-list-create'),
    path('<int:course_id>/lessons/<int:lesson_id>/', views.LessonDetailView.as_view(), name='lesson-detail'),
    
    # Секции уроков
    path('<int:course_id>/lessons/<int:lesson_id>/sections/', views.SectionListCreateView.as_view(), name='section-list-create'),
    
    # Тесты
    path('<int:course_id>/lessons/<int:lesson_id>/tests/', views.TestListCreateView.as_view(), name='test-list-create'),
    path('<int:course_id>/lessons/<int:lesson_id>/tests/<int:test_id>/', views.TestDetailView.as_view(), name='test-detail'),
    
    # Вопросы
    path('<int:course_id>/lessons/<int:lesson_id>/tests/<int:test_id>/questions/', views.QuestionListCreateView.as_view(), name='question-list-create'),
    
    # Ответы
    path('<int:course_id>/lessons/<int:lesson_id>/tests/<int:test_id>/questions/<int:question_id>/answers/', views.AnswerListCreateView.as_view(), name='answer-list-create'),
    
    # Дополнительные endpoints
    path('<int:course_id>/lessons/', views.get_lessons_for_course, name='get-lessons-for-course'),
    path('<int:course_id>/lessons/<int:lesson_id>/tests/', views.get_tests_for_lesson, name='get-tests-for-lesson'),
    
    # Итоговые тесты курса
    path('<int:course_id>/final-tests/', views.CourseTestListCreateView.as_view(), name='course-final-test-list-create'),
    path('<int:course_id>/final-tests/<int:test_id>/', views.CourseTestDetailView.as_view(), name='course-final-test-detail'),
    
    # Универсальный доступ к тесту по id
    path('api/tests/<int:test_id>/', views.get_test_by_id, name='get-test-by-id'),
    
    # Отправка результата теста
    path('api/tests/<int:test_id>/submit/', views.submit_test_result, name='submit-test-result'),
    
    # Получение результатов теста
    path('api/tests/<int:test_id>/results/', views.get_test_results, name='get-test-results'),
] 