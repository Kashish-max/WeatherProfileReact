import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response

apiKey = settings.OPEN_WEATHER_API_KEY
urlWeatherApi = "https://api.openweathermap.org/data/2.5/weather"
urlOneCallApi = "https://api.openweathermap.org/data/2.5/onecall"


class GetWeatherDataView(APIView):
    def post(self, request):
        lat = request.data.get('lat')
        lon = request.data.get('lon')

        if not lat or not lon:
            return Response({'error': 'Invalid coordinates'})
        
        retries = 3
        attempt = 0
        name = None
        response_data = {}

        while attempt < retries and not name:
            try:
                # Make GET request to weather API
                weather_params = {'lat': lat, 'lon': lon, 'appid': apiKey}
                weather_response = requests.get(urlWeatherApi, params=weather_params)
                weather_data = weather_response.json()
                name = weather_data.get('name')

                if name:
                    break  # Exit the loop if name is obtained successfully
            except requests.exceptions.RequestException:
                pass  # Retry if an exception occurs

            attempt += 1

        if name:
            try:
                # Make GET request to One Call API
                onecall_params = {'lat': lat, 'lon': lon, 'appid': apiKey}
                onecall_response = requests.get(urlOneCallApi, params=onecall_params)
                onecall_data = onecall_response.json()

                # Prepare the response
                response_data = {'name': name, 'other': onecall_data}
                return Response(response_data)

            except requests.exceptions.RequestException as e:
                return Response({'error': str(e)})

        return Response({'error': 'Failed to retrieve data'}, status=response_data.status_code)