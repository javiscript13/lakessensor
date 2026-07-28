from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sensorpipeline', '0013_remove_device_primary_lake'),
    ]

    operations = [
        migrations.RenameField(
            model_name='device',
            old_name='primary_lake_lake',
            new_name='primary_lake',
        ),
    ]
