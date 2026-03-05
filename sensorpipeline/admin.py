from django.contrib import admin
from .models import Device, Reading, AnalogReading, ReadingSession

admin.site.register(Device)
admin.site.register(ReadingSession)
admin.site.register(AnalogReading)
admin.site.register(Reading)
