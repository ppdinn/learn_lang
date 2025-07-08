#!/usr/bin/env python
import requests
import json

BASE_URL = 'http://localhost:8000'

def test_api():
    print("Testing API endpoints...")
    
    # Тест регистрации
    print("\n1. Testing registration...")
    register_data = {
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'testpass123',
        'first_name': 'Test',
        'last_name': 'User',
        'role': 'student'
    }
    
    try:
        response = requests.post(f'{BASE_URL}/auth/register/', json=register_data)
        print(f"Registration status: {response.status_code}")
        if response.status_code == 201:
            print("Registration successful!")
            user_data = response.json()
            token = user_data['token']
        else:
            print(f"Registration failed: {response.text}")
            return
    except Exception as e:
        print(f"Registration error: {e}")
        return
    
    # Тест входа
    print("\n2. Testing login...")
    login_data = {
        'username': 'testuser',
        'password': 'testpass123'
    }
    
    try:
        response = requests.post(f'{BASE_URL}/auth/login/', json=login_data)
        print(f"Login status: {response.status_code}")
        if response.status_code == 200:
            print("Login successful!")
        else:
            print(f"Login failed: {response.text}")
    except Exception as e:
        print(f"Login error: {e}")
    
    # Тест получения текущего пользователя
    print("\n3. Testing get current user...")
    headers = {'Authorization': f'Bearer {token}'}
    
    try:
        response = requests.get(f'{BASE_URL}/auth/user/', headers=headers)
        print(f"Get user status: {response.status_code}")
        if response.status_code == 200:
            user = response.json()
            print(f"Current user: {user['username']} ({user['role']})")
        else:
            print(f"Get user failed: {response.text}")
    except Exception as e:
        print(f"Get user error: {e}")
    
    # Тест создания курса
    print("\n4. Testing course creation...")
    course_data = {
        'title': 'Test Course',
        'description': 'This is a test course'
    }
    
    try:
        response = requests.post(f'{BASE_URL}/courses/', json=course_data, headers=headers)
        print(f"Create course status: {response.status_code}")
        if response.status_code == 201:
            course = response.json()
            course_id = course['id']
            print(f"Course created with ID: {course_id}")
        else:
            print(f"Create course failed: {response.text}")
            return
    except Exception as e:
        print(f"Create course error: {e}")
        return
    
    # Тест получения курсов
    print("\n5. Testing get courses...")
    try:
        response = requests.get(f'{BASE_URL}/courses/', headers=headers)
        print(f"Get courses status: {response.status_code}")
        if response.status_code == 200:
            courses = response.json()
            print(f"Found {len(courses)} courses")
        else:
            print(f"Get courses failed: {response.text}")
    except Exception as e:
        print(f"Get courses error: {e}")
    
    # Тест создания урока
    print("\n6. Testing lesson creation...")
    lesson_data = {
        'title': 'Test Lesson',
        'description': 'This is a test lesson',
        'order': 1
    }
    
    try:
        response = requests.post(f'{BASE_URL}/courses/{course_id}/lessons/', json=lesson_data, headers=headers)
        print(f"Create lesson status: {response.status_code}")
        if response.status_code == 201:
            lesson = response.json()
            lesson_id = lesson['id']
            print(f"Lesson created with ID: {lesson_id}")
        else:
            print(f"Create lesson failed: {response.text}")
    except Exception as e:
        print(f"Create lesson error: {e}")
    
    print("\nAPI testing completed!")

if __name__ == "__main__":
    test_api() 