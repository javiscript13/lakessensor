from .models import Reading, AnalogReading
from .serializers import ReadingSerializer, AnalogReadingSerializer
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

class ReadingCreate(generics.CreateAPIView):
    serializer_class = ReadingSerializer

class AnalogReadingView(generics.ListCreateAPIView,
                        generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AnalogReadingSerializer
    queryset = AnalogReading.objects.all()
    

