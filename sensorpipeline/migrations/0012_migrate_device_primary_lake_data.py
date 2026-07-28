from django.db import migrations


def migrate_primary_lake(apps, schema_editor):
    Device = apps.get_model('sensorpipeline', 'Device')
    Lake = apps.get_model('sensorpipeline', 'Lake')
    for device in Device.objects.exclude(primary_lake='').exclude(primary_lake__isnull=True):
        name = device.primary_lake.strip()
        if not name:
            continue
        lake, _ = Lake.objects.get_or_create(name=name)
        device.primary_lake_lake = lake
        device.save(update_fields=['primary_lake_lake'])


def reverse_migrate_primary_lake(apps, schema_editor):
    Device = apps.get_model('sensorpipeline', 'Device')
    for device in Device.objects.exclude(primary_lake_lake__isnull=True):
        device.primary_lake = device.primary_lake_lake.name
        device.save(update_fields=['primary_lake'])


class Migration(migrations.Migration):

    dependencies = [
        ('sensorpipeline', '0011_device_primary_lake_lake'),
    ]

    operations = [
        migrations.RunPython(migrate_primary_lake, reverse_migrate_primary_lake),
    ]
