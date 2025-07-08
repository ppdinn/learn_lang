from rest_framework import serializers
from .models import Course, Lesson, Section, Test, Question, Answer, TestResult
from users.serializers import UserSerializer

class CourseSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'author', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ['id', 'title', 'content', 'video', 'order']
        read_only_fields = ['id']

class LessonSerializer(serializers.ModelSerializer):
    sections = SectionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'description', 'video', 'order', 'sections', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def update(self, instance, validated_data):
        print(f"Updating lesson {instance.id} with data: {validated_data}")
        return super().update(instance, validated_data)

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'text', 'is_correct']
        read_only_fields = ['id']

class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True)
    
    class Meta:
        model = Question
        fields = ['id', 'text', 'answers']
        read_only_fields = ['id']

class TestSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, required=False)
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), required=False, allow_null=True)
    lesson = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = Test
        fields = ['id', 'title', 'description', 'questions', 'course', 'lesson']
        read_only_fields = ['id']

    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        test = Test.objects.create(**validated_data)
        for q_data in questions_data:
            answers_data = q_data.pop('answers', [])
            question = Question.objects.create(test=test, **q_data)
            for a_data in answers_data:
                Answer.objects.create(question=question, **a_data)
        return test

    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions', [])
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.save()
        # Удаляем старые вопросы и ответы
        instance.questions.all().delete()
        for q_data in questions_data:
            answers_data = q_data.pop('answers', [])
            question = Question.objects.create(test=instance, **q_data)
            for a_data in answers_data:
                Answer.objects.create(question=question, **a_data)
        return instance

class TestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestResult
        fields = ['id', 'user', 'test', 'score', 'answers', 'created_at']
        read_only_fields = ['id', 'created_at', 'user'] 