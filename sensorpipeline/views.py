from .models import Reading, AnalogReading, Device, ReadingSession, LakeSample, Lake
from .serializers import ReadingSerializer, AnalogReadingSerializer, ReadingSessionSerializer, ReadingSessionMapSerializer, LakeSampleSerializer, LakeSerializer
from rest_framework import generics, mixins, status
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.response import Response
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from django.conf import settings
from django.db.models import Count
from datetime import timedelta


class HasMqttApiKey(BasePermission):
    def has_permission(self, request, view):
        api_key = request.headers.get("X-Api-Key")
        return bool(api_key and api_key == settings.MQTT_API_KEY)


class ReadingCreate(generics.CreateAPIView):
    serializer_class = ReadingSerializer
    permission_classes = [HasMqttApiKey]
    session_max_gap = timedelta(hours=1) # readings sharing a device_session
                                          # split into a new session if the
                                          # gap between their read_dates
                                          # exceeds this

    def create(self, request, *args, **kwargs):
        try:
            device = Device.objects.get(mac=request.data["device"])
        except Device.DoesNotExist:
            return Response({"error": "Device not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()
        data['device'] = device.id
        data['device_session'] = request.data['session']

        if float(data.get('lat', 0)) == 0 and device.default_latitude is not None:
            data['lat'] = device.default_latitude
        if float(data.get('long', 0)) == 0 and device.default_longitude is not None:
            data['long'] = device.default_longitude

        # device_session comes from the device itself and resets whenever
        # firmware is reflashed, so a matching device_session isn't enough
        # on its own to prove it's the same real-world session - a stale
        # value could resurface after a reset. The read_date gap (capture
        # time, not arrival time - devices can buffer offline and send
        # readings hours late) is what actually distinguishes that case.
        read_date = parse_datetime(data['read_date']) if data.get('read_date') else None
        last_reading = Reading.objects.filter(
            device=device,
            device_session=data['device_session'],
        ).order_by('-id').first()

        if (last_reading and read_date and
                abs(read_date - last_reading.read_date) < self.session_max_gap):
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

    def get_queryset(self):
        queryset = AnalogReading.objects.filter(
            digital_reading__deleted_at__isnull=True,
        )
        if self.request.user.is_superuser:
            return queryset
        return queryset.filter(digital_reading__device__user=self.request.user)

    def get(self, request, *args, **kwargs):
        # ListCreateAPIView's get() (list) wins the MRO over
        # RetrieveUpdateAPIView's get() (retrieve-by-pk), so GET on the
        # <pk> URL would otherwise silently list instead of retrieving.
        # Nothing calls it that way today, so block it here rather than
        # implementing real retrieve semantics.
        if 'pk' in kwargs:
            return self.http_method_not_allowed(request, *args, **kwargs)
        return self.list(request, *args, **kwargs)

class LakeListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LakeSerializer
    queryset = Lake.objects.all().order_by('name')


class LakeSampleView(generics.ListCreateAPIView,
                     generics.RetrieveUpdateAPIView,
                     mixins.DestroyModelMixin):
    permission_classes = [IsAuthenticated]
    serializer_class = LakeSampleSerializer

    def get_queryset(self):
        queryset = LakeSample.objects.filter(deleted_at__isnull=True)
        if self.request.user.is_superuser:
            return queryset
        return queryset.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_destroy(self, instance):
        instance.deleted_at = timezone.now()
        instance.save(update_fields=['deleted_at'])

    def get(self, request, *args, **kwargs):
        # Same MRO quirk as AnalogReadingView.get() above - GET on the <pk>
        # URL would otherwise silently list instead of retrieving. Nothing
        # calls it that way today, so block it here for now.
        if 'pk' in kwargs:
            return self.http_method_not_allowed(request, *args, **kwargs)
        return self.list(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


class AllLakeSamples(generics.ListAPIView):
    queryset = LakeSample.objects.filter(deleted_at__isnull=True).select_related('lake')
    serializer_class = LakeSampleSerializer


class UserReadings(generics.ListAPIView):
    serializer_class = ReadingSessionMapSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            ReadingSession.objects.filter(
                device__user=self.request.user, deleted_at__isnull=True
            )
            .select_related('device')
            .prefetch_related('related_readings')
            # sessions without analog data yet first (newest first within
            # each group), so the ones still needing input are easiest to find
            .annotate(has_analog=Count('analog_reading'))
            .order_by('has_analog', '-id')
        )

class AllReadings(generics.ListAPIView):
    queryset = (
        ReadingSession.objects.filter(deleted_at__isnull=True)
        .select_related('device', 'analog_reading')
        .prefetch_related('related_readings')
    )
    serializer_class = ReadingSessionMapSerializer


class SessionReadings(generics.ListAPIView):
    serializer_class = ReadingSerializer

    def get_queryset(self):
        return Reading.objects.filter(reading_session_id=self.kwargs['pk'])


class ReadingSessionDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ReadingSession.objects.filter(deleted_at__isnull=True)
        if self.request.user.is_superuser:
            return queryset
        return queryset.filter(device__user=self.request.user)

    def perform_destroy(self, instance):
        instance.deleted_at = timezone.now()
        instance.save(update_fields=['deleted_at'])