from .models import Reading, AnalogReading, Device, ReadingSession
from .serializers import ReadingSerializer, AnalogReadingSerializer, ReadingSessionSerializer
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.response import Response
from django.utils import timezone
from django.conf import settings
from datetime import timedelta


class HasMqttApiKey(BasePermission):
    def has_permission(self, request, view):
        api_key = request.headers.get("X-Api-Key")
        return bool(api_key and api_key == settings.MQTT_API_KEY)


class ReadingCreate(generics.CreateAPIView):
    serializer_class = ReadingSerializer
    permission_classes = [HasMqttApiKey]
    session_max_time = 5 #in minutes

    def create(self, request, *args, **kwargs):
        try:
            device = Device.objects.get(mac=request.data["device"])
        except Device.DoesNotExist:
            return Response({"error": "Device not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()
        data['device'] = device.id
        data['read_date'] = timezone.now().isoformat()
        data['device_session'] = request.data['session'] 
        

        last_accepted_time = timezone.now() - timedelta(minutes=self.session_max_time)
        last_reading = Reading.objects.filter(
            device=device,
        ).order_by('-id').first()
        first_session_reading_of_last = None
        if last_reading:
            first_session_reading_of_last = Reading.objects.filter(
                reading_session = last_reading.reading_session
            ).order_by('id').first()
        if (first_session_reading_of_last and 
            first_session_reading_of_last.read_date >= last_accepted_time):
            session = last_reading.reading_session
        else:
            session = ReadingSession.objects.create(device=device)
        
        data['reading_session'] = session.id

        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            self.perform_create(serializer)
        except Exception:
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class AnalogReadingView(generics.ListCreateAPIView,
                        generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AnalogReadingSerializer
    queryset = AnalogReading.objects.all()
    
class UserReadings(generics.ListAPIView):
    serializer_class = ReadingSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ReadingSession.objects.filter(
            device__user=self.request.user
        ).prefetch_related('related_readings')

class AllReadings(generics.ListAPIView):
    queryset = ReadingSession.objects.all().prefetch_related('related_readings').select_related('analog_reading')
    serializer_class = ReadingSessionSerializer