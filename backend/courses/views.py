from django.shortcuts import render
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from .models import Course, Lesson, Section, Test, Question, Answer, TestResult
from .serializers import (
    CourseSerializer, LessonSerializer, SectionSerializer,
    TestSerializer, QuestionSerializer, AnswerSerializer, TestResultSerializer
)

class IsTeacherOrAdmin(permissions.BasePermission):
    """
    Разрешение для создания/редактирования/удаления курсов только преподавателями и администраторами
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role in ['teacher', 'admin']

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role in ['teacher', 'admin']

# Create your views here.

class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsTeacherOrAdmin]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsTeacherOrAdmin]

class LessonListCreateView(generics.ListCreateAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        return Lesson.objects.filter(course_id=course_id)
    
    def perform_create(self, serializer):
        course_id = self.kwargs.get('course_id')
        serializer.save(course_id=course_id)

class LessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_url_kwarg = 'lesson_id'
    
    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        lesson_id = self.kwargs.get('lesson_id')
        return Lesson.objects.filter(course_id=course_id, id=lesson_id)
    
    def update(self, request, *args, **kwargs):
        print(f"Update request data: {request.data}")
        print(f"Update request FILES: {request.FILES}")
        return super().update(request, *args, **kwargs)

class SectionListCreateView(generics.ListCreateAPIView):
    serializer_class = SectionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        lesson_id = self.kwargs.get('lesson_id')
        return Section.objects.filter(lesson_id=lesson_id)
    
    def perform_create(self, serializer):
        lesson_id = self.kwargs.get('lesson_id')
        serializer.save(lesson_id=lesson_id)

class TestListCreateView(generics.ListCreateAPIView):
    serializer_class = TestSerializer
    permission_classes = [IsTeacherOrAdmin]
    
    def get_queryset(self):
        lesson_id = self.kwargs.get('lesson_id')
        return Test.objects.filter(lesson_id=lesson_id)
    
    def perform_create(self, serializer):
        lesson_id = self.kwargs.get('lesson_id')
        serializer.save(lesson_id=lesson_id)

class TestDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TestSerializer
    permission_classes = [IsTeacherOrAdmin]
    lookup_url_kwarg = 'test_id'
    
    def get_queryset(self):
        lesson_id = self.kwargs.get('lesson_id')
        test_id = self.kwargs.get('test_id')
        return Test.objects.filter(lesson_id=lesson_id, id=test_id)

class QuestionListCreateView(generics.ListCreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        test_id = self.kwargs.get('test_id')
        return Question.objects.filter(test_id=test_id)
    
    def perform_create(self, serializer):
        test_id = self.kwargs.get('test_id')
        serializer.save(test_id=test_id)

class AnswerListCreateView(generics.ListCreateAPIView):
    serializer_class = AnswerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        question_id = self.kwargs.get('question_id')
        return Answer.objects.filter(question_id=question_id)
    
    def perform_create(self, serializer):
        question_id = self.kwargs.get('question_id')
        serializer.save(question_id=question_id)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_lessons_for_course(request, course_id):
    lessons = Lesson.objects.filter(course_id=course_id).order_by('order')
    serializer = LessonSerializer(lessons, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_tests_for_lesson(request, lesson_id):
    tests = Test.objects.filter(lesson_id=lesson_id)
    serializer = TestSerializer(tests, many=True)
    return Response(serializer.data)

class CourseTestListCreateView(generics.ListCreateAPIView):
    serializer_class = TestSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        return Test.objects.filter(course_id=course_id, lesson__isnull=True)

    def perform_create(self, serializer):
        course_id = self.kwargs.get('course_id')
        course = Course.objects.get(pk=course_id)
        serializer.save(course=course)

class CourseTestDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TestSerializer
    permission_classes = [IsTeacherOrAdmin]
    lookup_url_kwarg = 'test_id'

    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        test_id = self.kwargs.get('test_id')
        return Test.objects.filter(course_id=course_id, lesson__isnull=True, id=test_id)

@api_view(['GET'])
def get_test_by_id(request, test_id):
    from .models import Test
    try:
        test = Test.objects.get(id=test_id)
    except Test.DoesNotExist:
        return Response({'detail': 'Test not found'}, status=status.HTTP_404_NOT_FOUND)
    from .serializers import TestSerializer
    serializer = TestSerializer(test)
    return Response(serializer.data)

@api_view(['POST'])
def submit_test_result(request, test_id):
    from .models import Test, TestResult
    from .serializers import TestResultSerializer
    from users.models import User
    user = request.user
    try:
        test = Test.objects.get(id=test_id)
    except Test.DoesNotExist:
        return Response({'detail': 'Test not found'}, status=status.HTTP_404_NOT_FOUND)
    data = request.data
    score = data.get('score')
    answers = data.get('answers')
    if score is None or answers is None:
        return Response({'detail': 'score and answers required'}, status=status.HTTP_400_BAD_REQUEST)
    result = TestResult.objects.create(user=user, test=test, score=score, answers=answers)
    serializer = TestResultSerializer(result)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def get_test_results(request, test_id):
    from .models import TestResult
    from .serializers import TestResultSerializer
    results = TestResult.objects.filter(test_id=test_id).order_by('-created_at')
    serializer = TestResultSerializer(results, many=True)
    return Response(serializer.data)
