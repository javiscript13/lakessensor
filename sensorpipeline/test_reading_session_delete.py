from http import HTTPStatus

import pytest
from django.core.cache import cache
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from lakessensor.users.tests.factories import UserFactory
from sensorpipeline.models import Device
from sensorpipeline.models import Reading
from sensorpipeline.models import ReadingSession


@pytest.fixture(autouse=True)
def _reset_throttle_cache():
    # DRF's rate throttling stores counters in the default cache, which
    # persists across tests in the same process - clear it so one test's
    # requests don't trip another test's throttle limit.
    cache.clear()


@pytest.fixture()
def owner(db):
    return UserFactory()


@pytest.fixture()
def other_user(db):
    return UserFactory()


@pytest.fixture()
def superuser(db):
    return UserFactory(is_superuser=True, is_staff=True)


@pytest.fixture()
def device(owner):
    return Device.objects.create(
        nickname="owner-device",
        mac="AA:BB:CC:DD:EE:FF",
        model_name="v1",
        user=owner,
    )


@pytest.fixture()
def session(device):
    return ReadingSession.objects.create(device=device)


@pytest.fixture()
def reading(session, device):
    return Reading.objects.create(
        device=device,
        reading_session=session,
        device_session=1,
        read_date="2026-07-31T12:00:00+00:00",
        lat=14.7,
        long=-90.6,
        elevation=1560,
        water_temp=25.3,
        air_temp=22.1,
        air_humidity=65.0,
        ph=7.2,
    )


@pytest.mark.django_db()
def test_owner_can_soft_delete_session(owner, session, reading):
    client = APIClient()
    client.force_authenticate(user=owner)

    response = client.delete(reverse("session-delete", args=[session.id]))

    assert response.status_code == HTTPStatus.NO_CONTENT
    session.refresh_from_db()
    assert session.deleted_at is not None
    assert session.deleted_by == owner
    assert Reading.objects.filter(id=reading.id).exists()


@pytest.mark.django_db()
def test_non_owner_cannot_delete_session(other_user, session):
    client = APIClient()
    client.force_authenticate(user=other_user)

    response = client.delete(reverse("session-delete", args=[session.id]))

    assert response.status_code == HTTPStatus.NOT_FOUND
    session.refresh_from_db()
    assert session.deleted_at is None


@pytest.mark.django_db()
def test_superuser_can_delete_any_session(superuser, session):
    client = APIClient()
    client.force_authenticate(user=superuser)

    response = client.delete(reverse("session-delete", args=[session.id]))

    assert response.status_code == HTTPStatus.NO_CONTENT
    session.refresh_from_db()
    assert session.deleted_at is not None
    assert session.deleted_by == superuser


@pytest.mark.django_db()
def test_anonymous_cannot_delete_session(session):
    client = APIClient()

    response = client.delete(reverse("session-delete", args=[session.id]))

    assert response.status_code == HTTPStatus.UNAUTHORIZED
    session.refresh_from_db()
    assert session.deleted_at is None


@pytest.mark.django_db()
def test_deleted_session_excluded_from_readings_lists(owner, session, reading):
    session.deleted_at = timezone.now()
    session.save()

    client = APIClient()
    all_readings = client.get(reverse("all-readings")).json()
    assert all(s["id"] != session.id for s in all_readings)

    client.force_authenticate(user=owner)
    user_readings = client.get(reverse("user-readings")).json()
    assert all(s["id"] != session.id for s in user_readings)


@pytest.mark.django_db()
def test_is_owner_field_in_all_readings(owner, other_user, session, reading):
    client = APIClient()

    client.force_authenticate(user=owner)
    body = client.get(reverse("all-readings")).json()
    assert next(s for s in body if s["id"] == session.id)["isOwner"] is True

    client.force_authenticate(user=other_user)
    body = client.get(reverse("all-readings")).json()
    assert next(s for s in body if s["id"] == session.id)["isOwner"] is False

    client.force_authenticate(user=None)
    body = client.get(reverse("all-readings")).json()
    assert next(s for s in body if s["id"] == session.id)["isOwner"] is False


@pytest.mark.django_db()
def test_can_delete_field_in_all_readings(owner, other_user, superuser, session, reading):
    client = APIClient()

    client.force_authenticate(user=owner)
    body = client.get(reverse("all-readings")).json()
    assert next(s for s in body if s["id"] == session.id)["canDelete"] is True

    client.force_authenticate(user=other_user)
    body = client.get(reverse("all-readings")).json()
    assert next(s for s in body if s["id"] == session.id)["canDelete"] is False

    client.force_authenticate(user=superuser)
    body = client.get(reverse("all-readings")).json()
    assert next(s for s in body if s["id"] == session.id)["canDelete"] is True

    client.force_authenticate(user=None)
    body = client.get(reverse("all-readings")).json()
    assert next(s for s in body if s["id"] == session.id)["canDelete"] is False
