from rest_framework import serializers
from .models import Reading, AnalogReading, ReadingSession

class AnalogReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalogReading
        fields = '__all__'

class ReadingSerializer(serializers.ModelSerializer):
    device_name = serializers.CharField(source="device.nickname", read_only=True)
    session = serializers.IntegerField(source="device_session")

    class Meta:
        model = Reading
        fields = '__all__'

class ReadingSessionSerializer(serializers.ModelSerializer):
    device_name = serializers.CharField(source="device.nickname", read_only=True)
    oldest_reading_time = serializers.SerializerMethodField()
    analog_reading = AnalogReadingSerializer(read_only=True)
    class Meta:
        model = ReadingSession
        fields = '__all__'

    def get_oldest_reading_time(self, obj):
        oldest = obj.related_readings.order_by('id').first()
        return oldest.read_date if oldest else None