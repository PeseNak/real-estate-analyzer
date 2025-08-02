from django.urls import path
from .views import get_city_data_view

urlpatterns = [
    path('get-data/<str:city_name>/', get_city_data_view, name='get-data'),
]
