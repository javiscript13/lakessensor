from decimal import Decimal

from django.core.validators import MaxValueValidator
from django.core.validators import MinValueValidator
from django.db import models
from django.utils.translation import gettext as _
from django.conf import settings


class Lake(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Device(models.Model):
    id = models.AutoField(primary_key=True, editable=False)
    nickname = models.CharField(max_length=35, unique=True)
    mac = models.CharField(max_length=17)
    model_name = models.CharField(max_length=25)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="devices"
    )
    primary_lake = models.ForeignKey(
        Lake, on_delete=models.PROTECT, related_name="devices", null=True, blank=True
    )

    def __str__(self):
        return f"{self.mac}"

class ReadingSession(models.Model):
    id = models.AutoField(primary_key=True, editable=False)
    device = models.ForeignKey(Device, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.id}"

class Reading(models.Model):
    id = models.AutoField(primary_key=True, editable=False)
    device = models.ForeignKey(Device, on_delete=models.CASCADE)
    reading_session = models.ForeignKey(
        ReadingSession, on_delete=models.CASCADE, related_name='related_readings'
    )
    device_session = models.PositiveIntegerField()
    read_date = models.DateTimeField("date read")
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    long = models.DecimalField(max_digits=9, decimal_places=6)
    elevation = models.DecimalField(max_digits=8, decimal_places=4)
    water_temp = models.DecimalField(max_digits=4, decimal_places=2)
    air_temp = models.DecimalField(max_digits=4, decimal_places=2)
    air_humidity = models.DecimalField(max_digits=4, decimal_places=2)
    ph = models.DecimalField(max_digits=4, decimal_places=2)

    def __str__(self):
        return f"{self.id}"

class LakeSample(models.Model):
    lake = models.ForeignKey(Lake, on_delete=models.PROTECT, related_name='samples')
    lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    long = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    sampling_date = models.DateField()
    analysis_date = models.DateField()
    laboratory = models.CharField(max_length=100)
    analyst = models.CharField(max_length=100)
    observations = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='lake_samples'
    )
    conductivity = models.DecimalField(
        max_digits=7, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0")), MaxValueValidator(Decimal("10000"))]
    )
    total_dissolved_solids = models.DecimalField(
        max_digits=7, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0")), MaxValueValidator(Decimal("10000"))]
    )
    nitrates = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0")), MaxValueValidator(Decimal("100"))]
    )
    nitrites = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0")), MaxValueValidator(Decimal("20"))]
    )
    phosphates = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0")), MaxValueValidator(Decimal("50"))]
    )
    ammonium = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0")), MaxValueValidator(Decimal("50"))]
    )
    total_phosphorus = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0")), MaxValueValidator(Decimal("50"))]
    )
    total_nitrogen = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0")), MaxValueValidator(Decimal("200"))]
    )
    sulfates = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(Decimal("0")), MaxValueValidator(Decimal("2000"))]
    )

    def __str__(self):
        return f"{self.lake} - {self.sampling_date}"

class AnalogReading(models.Model):
    class ReadingChoices(models.TextChoices):
        INSIDE = "IN", _("Dentro del lago")
        SHORELINE = "SL", _("Orilla del lago")

    id = models.AutoField(primary_key=True, editable=False)
    digital_reading = models.OneToOneField(
        ReadingSession, on_delete=models.CASCADE, related_name='analog_reading'
    )
    rain_past24hrs = models.BooleanField(default=False)
    reading_place = models.CharField(
        max_length=2,
        choices=ReadingChoices.choices,
        default=ReadingChoices.SHORELINE,
    )
    forel_ule_scale = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(21)],
    )
    secchi_depth = models.PositiveSmallIntegerField()

    def __str__(self):
        return f"{self.id}"
