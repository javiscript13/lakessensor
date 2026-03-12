import json
import os
import datetime
import time

import paho.mqtt.client as mqtt
import requests

READINGS_ENDPOINT = os.environ["READINGS_ENDPOINT"]
MQTT_API_KEY = os.environ["MQTT_API_KEY"]
API_HEADERS = {"X-Api-Key": MQTT_API_KEY}


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
            response = requests.post(READINGS_ENDPOINT, json=item, headers=API_HEADERS, timeout=5)
            print("Status Code", response.status_code)  # noqa: T201
            break
        except (requests.Timeout, requests.exceptions.ConnectionError) as e:
            last_error = e
            print(f"Attempt {attempt+1} failed: {e}")  # noqa: T201
            if attempt < 2:
                time.sleep(3 ** attempt)
    else:
        print(f"Django server not available after 3 attempts: {last_error}")  # noqa: T201


client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1)
client.on_connect = on_connect
client.on_message = on_message
client.connect(os.environ["MQTT_SERVER"], int(os.environ["MQTT_PORT"]))
client.subscribe(os.environ["MQTT_TOPIC"])
client.loop_forever()
