from django.contrib import admin
from .models import Device, Reading, AnalogReading, ReadingSession, Lake, LakeSample


@admin.register(ReadingSession)
class ReadingSessionAdmin(admin.ModelAdmin):
    list_display = ["id", "device", "deleted_at", "deleted_by"]
    list_filter = ["deleted_at"]


@admin.register(LakeSample)
class LakeSampleAdmin(admin.ModelAdmin):
    list_display = ["id", "lake", "created_by", "deleted_at", "deleted_by"]
    list_filter = ["deleted_at"]


admin.site.register(Device)
admin.site.register(AnalogReading)
admin.site.register(Reading)
admin.site.register(Lake)
