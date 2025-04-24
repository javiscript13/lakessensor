from . import views
from django.urls import path

urlpatterns = [
    path("readings", views.ReadingCreate.as_view(), name="readings"),
    path("analog", views.AnalogReadingView.as_view(), name="analog"),
    path("user-readings", views.UserReadings.as_view(), name="user-readings"),
    path("all-readings", views.AllReadings.as_view(), name="all-readings")
]