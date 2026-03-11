from rest_framework import serializers
from .models import Reading, AnalogReading, ReadingSession


def _avg_nonzero(readings, field):
    values = [float(getattr(r, field)) for r in readings if getattr(r, field) != 0]
    return round(sum(values) / len(values), 2) if values else None


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
    readings = ReadingSerializer(source='related_readings', many=True, read_only=True)
    avg_lat = serializers.SerializerMethodField()
    avg_long = serializers.SerializerMethodField()
    avg_elevation = serializers.SerializerMethodField()
    avg_water_temp = serializers.SerializerMethodField()
    avg_air_temp = serializers.SerializerMethodField()
    avg_air_humidity = serializers.SerializerMethodField()
    avg_ph = serializers.SerializerMethodField()

    class Meta:
        model = ReadingSession
        fields = '__all__'

    def get_oldest_reading_time(self, obj):
        oldest = obj.related_readings.order_by('id').first()
        return oldest.read_date if oldest else None

    def get_avg_lat(self, obj):
        return _avg_nonzero(obj.related_readings.all(), 'lat')

    def get_avg_long(self, obj):
        return _avg_nonzero(obj.related_readings.all(), 'long')

    def get_avg_elevation(self, obj):
        return _avg_nonzero(obj.related_readings.all(), 'elevation')

    def get_avg_water_temp(self, obj):
        return _avg_nonzero(obj.related_readings.all(), 'water_temp')

    def get_avg_air_temp(self, obj):
        return _avg_nonzero(obj.related_readings.all(), 'air_temp')

    def get_avg_air_humidity(self, obj):
        return _avg_nonzero(obj.related_readings.all(), 'air_humidity')

    def get_avg_ph(self, obj):
        return _avg_nonzero(obj.related_readings.all(), 'ph')
