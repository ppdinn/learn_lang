from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('login/', views.login_view, name='user-login'),
    path('logout/', views.logout_view, name='user-logout'),
    path('user/', views.get_current_user, name='current-user'),
    path('profile/', views.update_profile, name='update-profile'),
    path('change-password/', views.change_password, name='change-password'),
] 