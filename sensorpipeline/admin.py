from django.contrib import admin
from .models import Device, Reading, AnalogReading

admin.site.register(Device)
admin.site.register(Reading)
admin.site.register(AnalogReading)
