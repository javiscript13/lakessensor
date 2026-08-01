from http import HTTPStatus

import pytest
from django.core.cache import cache
from django.urls import reverse
from rest_framework.test import APIClient

from lakessensor.users.tests.factories import UserFactory
from sensorpipeline.models import Lake
from sensorpipeline.models import LakeSample


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
def lake(db):
    return Lake.objects.create(name="Lago de Atitlán")


@pytest.fixture()
def lake_sample(lake, owner):
    return LakeSample.objects.create(
        lake=lake,
        sampling_date="2026-07-01",
        analysis_date="2026-07-02",
        laboratory="lab",
        analyst="analyst",
        created_by=owner,
    )


@pytest.mark.django_db()
def test_get_lake_sample_detail_is_blocked(owner, lake_sample):
    # Same MRO quirk as AnalogReadingView - GET on the <pk> URL used to
    # silently fall through to the list action. Blocked rather than fixed
    # to actually retrieve by id, since nothing calls it that way.
    client = APIClient()
    client.force_authenticate(user=owner)

    response = client.get(reverse("lake-sample-detail", args=[lake_sample.id]))

    assert response.status_code == HTTPStatus.METHOD_NOT_ALLOWED


@pytest.mark.django_db()
def test_owner_can_list_own_lake_samples(owner, lake_sample):
    client = APIClient()
    client.force_authenticate(user=owner)

    response = client.get(reverse("lake-samples"))

    assert response.status_code == HTTPStatus.OK
    assert any(s["id"] == lake_sample.id for s in response.json())


@pytest.mark.django_db()
def test_other_user_does_not_see_lake_sample_in_list(other_user, lake_sample):
    client = APIClient()
    client.force_authenticate(user=other_user)

    response = client.get(reverse("lake-samples"))

    assert response.status_code == HTTPStatus.OK
    assert all(s["id"] != lake_sample.id for s in response.json())


@pytest.mark.django_db()
def test_other_user_cannot_patch_lake_sample(other_user, lake_sample):
    client = APIClient()
    client.force_authenticate(user=other_user)

    response = client.patch(
        reverse("lake-sample-detail", args=[lake_sample.id]), {"laboratory": "hijacked"}, format="json",
    )

    assert response.status_code == HTTPStatus.NOT_FOUND
    lake_sample.refresh_from_db()
    assert lake_sample.laboratory == "lab"
