from django.urls import path
from .views import GetWeatherDataView

urlpatterns = [
    path('weather-data/', GetWeatherDataView.as_view(), name='weather-data'),
]
