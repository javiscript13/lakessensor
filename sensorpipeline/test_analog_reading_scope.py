from http import HTTPStatus

import pytest
from django.core.cache import cache
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from lakessensor.users.tests.factories import UserFactory
from sensorpipeline.models import AnalogReading
from sensorpipeline.models import Device
from sensorpipeline.models import ReadingSession


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
def superuser(db):
    return UserFactory(is_superuser=True, is_staff=True)


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


@pytest.fixture()
def other_device(other_user):
    return Device.objects.create(
        nickname="other-device", mac="11:22:33:44:55:66", model_name="v1", user=other_user,
    )


@pytest.fixture()
def other_session(other_device):
    return ReadingSession.objects.create(device=other_device)


@pytest.mark.django_db()
def test_get_analog_detail_is_blocked(owner, analog_reading):
    # GET on the <pk> URL used to silently fall through to the list action
    # (MRO quirk from combining ListCreateAPIView + RetrieveUpdateAPIView).
    # Nothing calls it that way, so it's blocked rather than fixed to
    # actually retrieve by id.
    client = APIClient()
    client.force_authenticate(user=owner)

    response = client.get(reverse("analog-detail", args=[analog_reading.id]))

    assert response.status_code == HTTPStatus.METHOD_NOT_ALLOWED


@pytest.mark.django_db()
def test_owner_can_list_own_analog_readings(owner, analog_reading):
    client = APIClient()
    client.force_authenticate(user=owner)

    response = client.get(reverse("analog"))

    assert response.status_code == HTTPStatus.OK
    assert any(a["id"] == analog_reading.id for a in response.json())


@pytest.mark.django_db()
def test_non_owner_does_not_see_analog_reading_in_list(other_user, analog_reading):
    client = APIClient()
    client.force_authenticate(user=other_user)

    response = client.get(reverse("analog"))

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


@pytest.mark.django_db()
def test_cannot_create_analog_reading_for_others_session(owner, other_session):
    client = APIClient()
    client.force_authenticate(user=owner)

    response = client.post(
        reverse("analog"),
        {"digitalReading": other_session.id, "forelUleScale": 5, "secchiDepth": 10},
        format="json",
    )

    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert not AnalogReading.objects.filter(digital_reading=other_session).exists()


@pytest.mark.django_db()
def test_can_create_analog_reading_for_own_session(owner, device):
    own_session = ReadingSession.objects.create(device=device)
    client = APIClient()
    client.force_authenticate(user=owner)

    response = client.post(
        reverse("analog"),
        {"digitalReading": own_session.id, "forelUleScale": 5, "secchiDepth": 10},
        format="json",
    )

    assert response.status_code == HTTPStatus.CREATED


@pytest.mark.django_db()
def test_superuser_sees_analog_readings_from_other_users(superuser, analog_reading):
    client = APIClient()
    client.force_authenticate(user=superuser)

    response = client.get(reverse("analog"))

    assert response.status_code == HTTPStatus.OK
    assert any(a["id"] == analog_reading.id for a in response.json())


@pytest.mark.django_db()
def test_superuser_can_patch_analog_reading_from_other_user(superuser, analog_reading):
    client = APIClient()
    client.force_authenticate(user=superuser)

    response = client.patch(
        reverse("analog-detail", args=[analog_reading.id]), {"secchiDepth": 99}, format="json",
    )

    assert response.status_code == HTTPStatus.OK
    analog_reading.refresh_from_db()
    assert analog_reading.secchi_depth == 99


@pytest.mark.django_db()
def test_superuser_can_create_analog_reading_for_others_session(superuser, other_session):
    client = APIClient()
    client.force_authenticate(user=superuser)

    response = client.post(
        reverse("analog"),
        {"digitalReading": other_session.id, "forelUleScale": 5, "secchiDepth": 10},
        format="json",
    )

    assert response.status_code == HTTPStatus.CREATED
    assert AnalogReading.objects.filter(digital_reading=other_session).exists()
