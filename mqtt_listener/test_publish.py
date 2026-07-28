"""Publishes one fake sensor reading to MQTT_TOPIC, simulating the IoT device.

For testing mqtt_client.py end-to-end (including the outbox queue) without
physical hardware. Run from inside the mqtt container, which already has the
right env vars and paho-mqtt installed:

    docker compose -f local.yml exec mqtt python test_publish.py
"""
import os
import time

import paho.mqtt.client as mqtt

MQTT_SERVER = os.environ["MQTT_SERVER"]
MQTT_PORT = int(os.environ["MQTT_PORT"])
MQTT_TOPIC = os.environ["MQTT_TOPIC"]

# index: [0]=unused [1]=lat [2]=long [3]=elevation [4]=session [5]=waterTemp
# [6]=airTemp [7]=airHumidity [8]=ph [9]=deviceMAC
FAKE_PAYLOAD = "test,14.643,-90.506,1560,1,25.3,22.1,65.0,7.2,AA:BB:CC:DD:EE:FF"

# No client_id/clean_session here on purpose: this is a one-off, ephemeral
# publisher and must not collide with mqtt_client.py's persistent MQTT_CLIENT_ID.
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1)
client.connect(MQTT_SERVER, MQTT_PORT)
client.loop_start()
result = client.publish(MQTT_TOPIC, FAKE_PAYLOAD, qos=1)
result.wait_for_publish(timeout=5)
print(f"Published fake reading to {MQTT_TOPIC}: {FAKE_PAYLOAD}")  # noqa: T201
time.sleep(1)
client.loop_stop()
client.disconnect()
