from decimal import Decimal
from http import HTTPStatus

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from lakessensor.users.tests.factories import UserFactory
from sensorpipeline.models import Device, Reading

API_KEY = "test-mqtt-key"


@pytest.fixture()
def api_client(settings):
    settings.MQTT_API_KEY = API_KEY
    client = APIClient()
    client.credentials(HTTP_X_API_KEY=API_KEY)
    return client


@pytest.fixture()
def device(db):
    return Device.objects.create(
        nickname="test-device",
        mac="AA:BB:CC:DD:EE:FF",
        model_name="v1",
        user=UserFactory(),
        default_latitude=Decimal("14.643000"),
        default_longitude=Decimal("-90.506000"),
    )


def reading_payload(**overrides):
    payload = {
        "device": "AA:BB:CC:DD:EE:FF",
        "session": 1,
        "lat": 14.7,
        "long": -90.6,
        "elevation": 1560,
        "waterTemp": 25.3,
        "airTemp": 22.1,
        "airHumidity": 65.0,
        "ph": 7.2,
    }
    payload.update(overrides)
    return payload


@pytest.mark.django_db()
def test_reading_create_requires_api_key(device):
    response = APIClient().post(reverse("readings"), reading_payload(), format="json")
    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert not Reading.objects.exists()


@pytest.mark.django_db()
def test_reading_create_rejects_unknown_device(api_client):
    response = api_client.post(
        reverse("readings"),
        reading_payload(device="00:00:00:00:00:00"),
        format="json",
    )
    assert response.status_code == HTTPStatus.NOT_FOUND


@pytest.mark.django_db()
def test_reading_create_success(api_client, device):
    response = api_client.post(reverse("readings"), reading_payload(), format="json")

    assert response.status_code == HTTPStatus.CREATED
    reading = Reading.objects.get()
    assert reading.device_id == device.id
    assert float(reading.lat) == 14.7
    assert float(reading.long) == -90.6
    assert reading.reading_session_id is not None


@pytest.mark.django_db()
def test_reading_create_uses_device_default_location_when_gps_is_zero(
    api_client, device
):
    response = api_client.post(
        reverse("readings"), reading_payload(lat=0, long=0), format="json"
    )

    assert response.status_code == HTTPStatus.CREATED
    reading = Reading.objects.get()
    assert reading.lat == device.default_latitude
    assert reading.long == device.default_longitude


@pytest.mark.django_db()
def test_reading_create_keeps_zero_when_device_has_no_default_location(api_client):
    device_without_default = Device.objects.create(
        nickname="no-default-device",
        mac="11:22:33:44:55:66",
        model_name="v1",
        user=UserFactory(),
    )

    response = api_client.post(
        reverse("readings"),
        reading_payload(device=device_without_default.mac, lat=0, long=0),
        format="json",
    )

    assert response.status_code == HTTPStatus.CREATED
    reading = Reading.objects.get()
    assert float(reading.lat) == 0
    assert float(reading.long) == 0
