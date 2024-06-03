from rest_framework import serializers
from .models import Reading, AnalogReading

class ReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reading
        fields = '__all__'

class AnalogReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalogReading
        fields = '__all__'