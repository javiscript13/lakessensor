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
def superuser(db):
    return UserFactory(is_superuser=True, is_staff=True)


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


@pytest.mark.django_db()
def test_superuser_sees_lake_samples_from_other_users(superuser, lake_sample):
    client = APIClient()
    client.force_authenticate(user=superuser)

    response = client.get(reverse("lake-samples"))

    assert response.status_code == HTTPStatus.OK
    assert any(s["id"] == lake_sample.id for s in response.json())


@pytest.mark.django_db()
def test_superuser_can_patch_lake_sample_from_other_user(superuser, lake_sample):
    client = APIClient()
    client.force_authenticate(user=superuser)

    response = client.patch(
        reverse("lake-sample-detail", args=[lake_sample.id]), {"laboratory": "fixed"}, format="json",
    )

    assert response.status_code == HTTPStatus.OK
    lake_sample.refresh_from_db()
    assert lake_sample.laboratory == "fixed"


@pytest.mark.django_db()
def test_owner_can_soft_delete_lake_sample(owner, lake_sample):
    client = APIClient()
    client.force_authenticate(user=owner)

    response = client.delete(reverse("lake-sample-detail", args=[lake_sample.id]))

    assert response.status_code == HTTPStatus.NO_CONTENT
    lake_sample.refresh_from_db()
    assert lake_sample.deleted_at is not None
    assert lake_sample.deleted_by == owner


@pytest.mark.django_db()
def test_non_owner_cannot_delete_lake_sample(other_user, lake_sample):
    client = APIClient()
    client.force_authenticate(user=other_user)

    response = client.delete(reverse("lake-sample-detail", args=[lake_sample.id]))

    assert response.status_code == HTTPStatus.NOT_FOUND
    lake_sample.refresh_from_db()
    assert lake_sample.deleted_at is None


@pytest.mark.django_db()
def test_superuser_can_delete_any_lake_sample(superuser, lake_sample):
    client = APIClient()
    client.force_authenticate(user=superuser)

    response = client.delete(reverse("lake-sample-detail", args=[lake_sample.id]))

    assert response.status_code == HTTPStatus.NO_CONTENT
    lake_sample.refresh_from_db()
    assert lake_sample.deleted_at is not None
    assert lake_sample.deleted_by == superuser


@pytest.mark.django_db()
def test_anonymous_cannot_delete_lake_sample(lake_sample):
    client = APIClient()

    response = client.delete(reverse("lake-sample-detail", args=[lake_sample.id]))

    assert response.status_code == HTTPStatus.UNAUTHORIZED
    lake_sample.refresh_from_db()
    assert lake_sample.deleted_at is None


@pytest.mark.django_db()
def test_deleted_lake_sample_excluded_from_lists(owner, lake_sample):
    client = APIClient()
    client.force_authenticate(user=owner)
    client.delete(reverse("lake-sample-detail", args=[lake_sample.id]))

    own_list = client.get(reverse("lake-samples")).json()
    assert all(s["id"] != lake_sample.id for s in own_list)

    all_samples = APIClient().get(reverse("all-lake-samples")).json()
    assert all(s["id"] != lake_sample.id for s in all_samples)


@pytest.mark.django_db()
def test_can_delete_field_in_all_lake_samples(owner, other_user, superuser, lake_sample):
    client = APIClient()

    client.force_authenticate(user=owner)
    body = client.get(reverse("all-lake-samples")).json()
    assert next(s for s in body if s["id"] == lake_sample.id)["canDelete"] is True
    assert next(s for s in body if s["id"] == lake_sample.id)["isOwner"] is True

    client.force_authenticate(user=other_user)
    body = client.get(reverse("all-lake-samples")).json()
    assert next(s for s in body if s["id"] == lake_sample.id)["canDelete"] is False
    assert next(s for s in body if s["id"] == lake_sample.id)["isOwner"] is False

    client.force_authenticate(user=superuser)
    body = client.get(reverse("all-lake-samples")).json()
    assert next(s for s in body if s["id"] == lake_sample.id)["canDelete"] is True
    assert next(s for s in body if s["id"] == lake_sample.id)["isOwner"] is False

    client.force_authenticate(user=None)
    body = client.get(reverse("all-lake-samples")).json()
    assert next(s for s in body if s["id"] == lake_sample.id)["canDelete"] is False
