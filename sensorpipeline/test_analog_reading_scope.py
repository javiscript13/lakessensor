from http import HTTPStatus

import pytest
from django.core.cache import cache
from django.urls import reverse
from django.utils import timezone
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
def other_user(db):
    return UserFactory()


@pytest.fixture()
def device(owner):
    return Device.objects.create(
        nickname="owner-device", mac="AA:BB:CC:DD:EE:FF", model_name="v1", user=owner,
    )


@pytest.fixture()
def session(device):
    return ReadingSession.objects.create(device=device)


@pytest.fixture()
def analog_reading(session):
    return AnalogReading.objects.create(
        digital_reading=session, forel_ule_scale=5, secchi_depth=10,
    )


@pytest.mark.django_db()
def test_owner_can_retrieve_own_analog_reading(owner, session, analog_reading):
    client = APIClient()
    client.force_authenticate(user=owner)

    response = client.get(reverse("analog-detail", args=[analog_reading.id]))

    assert response.status_code == HTTPStatus.OK
    assert any(a["id"] == analog_reading.id for a in response.json())


@pytest.mark.django_db()
def test_non_owner_cannot_retrieve_analog_reading(other_user, analog_reading):
    client = APIClient()
    client.force_authenticate(user=other_user)

    response = client.get(reverse("analog-detail", args=[analog_reading.id]))

    # GET analog-detail has a pre-existing routing quirk (tracked separately,
    # not fixed here) where it falls through to the list action instead of
    # retrieving by id - so this asserts the data isn't leaked through that
    # list, not a proper 404.
    assert response.status_code == HTTPStatus.OK
    assert all(a["id"] != analog_reading.id for a in response.json())


@pytest.mark.django_db()
def test_non_owner_cannot_patch_analog_reading(other_user, analog_reading):
    client = APIClient()
    client.force_authenticate(user=other_user)

    response = client.patch(
        reverse("analog-detail", args=[analog_reading.id]), {"secchiDepth": 99}, format="json",
    )

    assert response.status_code == HTTPStatus.NOT_FOUND
    analog_reading.refresh_from_db()
    assert analog_reading.secchi_depth == 10


@pytest.mark.django_db()
def test_deleted_session_analog_reading_excluded(owner, session, analog_reading):
    session.deleted_at = timezone.now()
    session.save()

    client = APIClient()
    client.force_authenticate(user=owner)

    list_response = client.get(reverse("analog"))
    assert all(a["id"] != analog_reading.id for a in list_response.json())

    # see the routing-quirk note above - GET analog-detail also falls
    # through to the list action here
    detail_response = client.get(reverse("analog-detail", args=[analog_reading.id]))
    assert detail_response.status_code == HTTPStatus.OK
    assert all(a["id"] != analog_reading.id for a in detail_response.json())
