from .models import Reading, AnalogReading
from .serializers import ReadingSerializer, AnalogReadingSerializer
from rest_framework import generics, viewsets, mixins

class ReadingCreate(generics.CreateAPIView):
    serializer_class = ReadingSerializer

class AnalogReadingView(generics.ListCreateAPIView,
                        generics.RetrieveUpdateAPIView):
    serializer_class = AnalogReadingSerializer
    queryset = AnalogReading.objects.all()
    

