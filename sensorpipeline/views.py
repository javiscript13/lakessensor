from .models import Reading, AnalogReading, Device
from .serializers import ReadingSerializer, AnalogReadingSerializer
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class ReadingCreate(generics.CreateAPIView):
    serializer_class = ReadingSerializer

    def create(self, request, *args, **kwargs):
        device = Device.objects.get(mac=request.data["device"])
        data = request.data.copy()
        data['device'] = device.id
        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        try:
            self.perform_create(serializer)
        except Exception as e:
            return Response(
                {"error": str(e)}, 
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
    serializer_class = ReadingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Reading.objects.filter(device__user=self.request.user)
    
class AllReadings(generics.ListAPIView):
    queryset = Reading.objects.all().distinct("session")
    serializer_class = ReadingSerializer