from rest_framework import serializers
from .models import Reading, AnalogReading

class AnalogReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalogReading
        fields = '__all__'

class ReadingSerializer(serializers.ModelSerializer):
    analog_reading = AnalogReadingSerializer(read_only=True)
    device_name = serializers.CharField(source="device.nickname", read_only=True)
    class Meta:
        model = Reading
        fields = '__all__'
