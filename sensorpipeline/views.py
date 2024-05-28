from .models import Reading
from .serializers import ReadingSerializer
from rest_framework import generics

class ReadingCreate(generics.CreateAPIView):
    serializer_class = ReadingSerializer
