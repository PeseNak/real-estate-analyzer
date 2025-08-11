from django.urls import path
from .views import get_city_data_view, register_view, login_view

urlpatterns = [
    path('get-data/<str:city_name>/', get_city_data_view, name='get-data'),
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
]
