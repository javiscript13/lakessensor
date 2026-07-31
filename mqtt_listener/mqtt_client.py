import json
import os
import datetime
import sqlite3
import threading
import time

import paho.mqtt.client as mqtt
import requests

READINGS_ENDPOINT = os.environ["READINGS_ENDPOINT"]
MQTT_API_KEY = os.environ["MQTT_API_KEY"]
# Tells Django this internal request is already equivalent to HTTPS, so
# SECURE_SSL_REDIRECT doesn't 301-redirect it to https://django:8000 (which
# has no TLS listener and would hang until timeout). Safe because Django's
# port is never published to the host/internet - only reachable from inside
# this docker network - so nothing outside this stack can spoof this header
# straight to Django.
API_HEADERS = {"X-Api-Key": MQTT_API_KEY, "X-Forwarded-Proto": "https"}

OUTBOX_DB_PATH = os.environ.get("OUTBOX_DB_PATH", "/app/outbox.db")
OUTBOX_RETRY_INTERVAL = 30  # seconds, how often to retry queued readings

# Without a GPS fix, the device's RTC hasn't been set from satellite time yet
# and reports a stale/default date. Anything older than this is treated as
# "no fix" and Django falls back to its own clock for read_date.
GPS_MIN_VALID_YEAR = 2026


def init_outbox():
    conn = sqlite3.connect(OUTBOX_DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS pending_readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            payload TEXT NOT NULL,
            queued_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def enqueue(item):
    conn = sqlite3.connect(OUTBOX_DB_PATH)
    conn.execute(
        "INSERT INTO pending_readings (payload, queued_at) VALUES (?, ?)",
        (json.dumps(item), datetime.datetime.now().isoformat()),
    )
    conn.commit()
    conn.close()


def send_reading(item):
    """POSTs a reading to Django. Raises requests.Timeout / ConnectionError on failure."""
    response = requests.post(READINGS_ENDPOINT, json=item, headers=API_HEADERS, timeout=5)
    print("Status Code", response.status_code)  # noqa: T201


def flush_outbox():
    conn = sqlite3.connect(OUTBOX_DB_PATH)
    try:
        rows = conn.execute("SELECT id, payload FROM pending_readings ORDER BY id").fetchall()
        for row_id, payload in rows:
            try:
                send_reading(json.loads(payload))
            except (requests.Timeout, requests.exceptions.ConnectionError) as e:
                print(f"Outbox flush stopped, Django still unavailable: {e}")  # noqa: T201
                return
            conn.execute("DELETE FROM pending_readings WHERE id = ?", (row_id,))
            conn.commit()
            print(f"Outbox: sent queued reading {row_id}")  # noqa: T201
    finally:
        conn.close()


def outbox_worker():
    while True:
        time.sleep(OUTBOX_RETRY_INTERVAL)
        flush_outbox()


def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")  # noqa: T201
    client.subscribe(os.environ["MQTT_TOPIC"], qos=1)


def on_message(client, userdata, msg):
    # Captured at receipt time, not when Django eventually processes this -
    # if Django is down the reading sits in the outbox and gets replayed
    # later, so this is the closest available approximation to when the
    # reading was actually taken whenever the GPS fix isn't usable.
    received_at = datetime.datetime.now(datetime.timezone.utc)
    try:
        reading = msg.payload.decode("UTF-8").split(",")
        lat = float(reading[1])
        long_ = float(reading[2])
        # The device's GPS module supplies this as a unix epoch (UTC seconds).
        # When there's no GPS fix, lat/long report 0 and the RTC hasn't been
        # set from satellite time, so the epoch decodes to a stale date.
        gps_date = datetime.datetime.fromtimestamp(int(reading[0]), tz=datetime.timezone.utc)
        gps_date_valid = (lat != 0 or long_ != 0) and gps_date.year >= GPS_MIN_VALID_YEAR
        item = {
            "device": reading[9],
            "session": int(reading[4]),
            "readDate": (gps_date if gps_date_valid else received_at).isoformat(),
            "lat": lat,
            "long": long_,
            "elevation": float(reading[3]),
            "waterTemp": float(reading[5]),
            "airTemp": float(reading[6]),
            "airHumidity": float(reading[7]),
            "ph": float(reading[8]),
        }
    except (IndexError, ValueError) as e:
        print(f"Malformed payload, skipping: {msg.payload!r} — {e}")  # noqa: T201
        return

    print(json.dumps(item))  # noqa: T201
    last_error = None
    for attempt in range(3):
        try:
            send_reading(item)
            break
        except (requests.Timeout, requests.exceptions.ConnectionError) as e:
            last_error = e
            print(f"Attempt {attempt+1} failed: {e}")  # noqa: T201
            if attempt < 2:
                time.sleep(3 ** attempt)
    else:
        print(f"Django server not available after 3 attempts: {last_error}. Queuing locally.")  # noqa: T201
        enqueue(item)


init_outbox()
threading.Thread(target=outbox_worker, daemon=True).start()

client = mqtt.Client(
    mqtt.CallbackAPIVersion.VERSION1,
    client_id=os.environ["MQTT_CLIENT_ID"],
    clean_session=False,
)
client.on_connect = on_connect
client.on_message = on_message
client.reconnect_delay_set(min_delay=1, max_delay=120)

CONNECT_RETRY_MAX_DELAY = 60
delay = 1
while True:
    try:
        client.connect(os.environ["MQTT_SERVER"], int(os.environ["MQTT_PORT"]))
        break
    except OSError as e:
        print(f"Initial MQTT connect failed: {e}. Retrying in {delay}s")  # noqa: T201
        time.sleep(delay)
        delay = min(delay * 2, CONNECT_RETRY_MAX_DELAY)

client.loop_forever()
