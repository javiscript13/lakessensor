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
API_HEADERS = {"X-Api-Key": MQTT_API_KEY}

OUTBOX_DB_PATH = os.environ.get("OUTBOX_DB_PATH", "/app/outbox.db")
OUTBOX_RETRY_INTERVAL = 30  # seconds, how often to retry queued readings


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


def on_message(client, userdata, msg):
    try:
        reading = msg.payload.decode("UTF-8").split(",")
        item = {
            "device": reading[9],
            "session": int(reading[4]),
            "readDate": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "lat": float(reading[1]),
            "long": float(reading[2]),
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
client.connect(os.environ["MQTT_SERVER"], int(os.environ["MQTT_PORT"]))
client.subscribe(os.environ["MQTT_TOPIC"], qos=1)
client.loop_forever()
