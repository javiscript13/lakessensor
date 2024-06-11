import json
import os
import datetime

import paho.mqtt.client as mqtt
import requests


def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")  # noqa: T201


def on_message(client, userdata, msg):
    reading = msg.payload.decode("UTF-8").split(",")
    item = {
        "device": 1,
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
    print(json.dumps(item))
    endpoint = os.environ["READINGS_ENDPOINT"]
    try:
        response = requests.post(endpoint, json=item, timeout=5)
        print("Status Code", response.status_code)  # noqa: T201
    except requests.Timeout as e:
        print("Django server not available", e)  # noqa: T201


def disconnect(self):
    client.disconnect()


client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1)
client.on_connect = on_connect
client.on_message = on_message
client.connect(os.environ["MQTT_SERVER"], int(os.environ["MQTT_PORT"]))
client.subscribe(os.environ["MQTT_TOPIC"])
client.loop_forever()
