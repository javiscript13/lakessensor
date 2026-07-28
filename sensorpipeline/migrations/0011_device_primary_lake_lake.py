from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sensorpipeline', '0010_lakesample_ammonium_lakesample_conductivity_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='device',
            name='primary_lake_lake',
            field=models.ForeignKey(
                null=True,
                blank=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='devices',
                to='sensorpipeline.lake',
            ),
        ),
    ]
