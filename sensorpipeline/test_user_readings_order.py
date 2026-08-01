import pytest
from django.core.cache import cache
from django.urls import reverse
from rest_framework.test import APIClient

from lakessensor.users.tests.factories import UserFactory
from sensorpipeline.models import AnalogReading, Device, ReadingSession


@pytest.fixture(autouse=True)
def _reset_throttle_cache():
    cache.clear()


@pytest.fixture()
def owner(db):
    return UserFactory()


@pytest.fixture()
def device(owner):
    return Device.objects.create(
        nickname="owner-device", mac="AA:BB:CC:DD:EE:FF", model_name="v1", user=owner,
    )


@pytest.mark.django_db()
def test_sessions_without_analog_come_first_newest_first(device, owner):
    session_a = ReadingSession.objects.create(device=device)
    session_b = ReadingSession.objects.create(device=device)
    session_c = ReadingSession.objects.create(device=device)
    session_d = ReadingSession.objects.create(device=device)
    AnalogReading.objects.create(digital_reading=session_c, forel_ule_scale=5, secchi_depth=10)
    AnalogReading.objects.create(digital_reading=session_d, forel_ule_scale=5, secchi_depth=10)

    client = APIClient()
    client.force_authenticate(user=owner)
    response = client.get(reverse("user-readings"))

    ids = [s["id"] for s in response.json()]
    assert ids == [session_b.id, session_a.id, session_d.id, session_c.id]
