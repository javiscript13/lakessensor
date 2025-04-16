from django.core.validators import MaxValueValidator
from django.core.validators import MinValueValidator
from django.db import models
from django.utils.translation import gettext as _
from django.conf import settings


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
    primary_lake = models.CharField(max_length=300)

    def __str__(self):
        return f"{self.mac}"


class Reading(models.Model):
    id = models.AutoField(primary_key=True, editable=False)
    device = models.ForeignKey(Device, on_delete=models.CASCADE)
    session = models.PositiveIntegerField()
    read_date = models.DateTimeField("date read")
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    long = models.DecimalField(max_digits=9, decimal_places=6)
    elevation = models.DecimalField(max_digits=8, decimal_places=4)
    water_temp = models.DecimalField(max_digits=3, decimal_places=1)
    air_temp = models.DecimalField(max_digits=3, decimal_places=1)
    air_humidity = models.DecimalField(max_digits=3, decimal_places=1)
    ph = models.DecimalField(max_digits=3, decimal_places=1)

    def __str__(self):
        return f"{self.id}"


class AnalogReading(models.Model):
    class ReadingChoices(models.TextChoices):
        INSIDE = "IN", _("Dentro del lago")
        SHORELINE = "SL", _("Orilla del lago")

    id = models.AutoField(primary_key=True, editable=False)
    digital_reading = models.ForeignKey(Reading, on_delete=models.CASCADE)
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
