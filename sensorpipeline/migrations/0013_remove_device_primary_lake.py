from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sensorpipeline', '0012_migrate_device_primary_lake_data'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='device',
            name='primary_lake',
        ),
    ]
