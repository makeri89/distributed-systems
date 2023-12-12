const express = require("express");
require("dotenv").config();

const bodyParser = require("body-parser");
const MqttHandler = require("./mqttHandler");

const app = express();

const {
  NODE_NAME,
  MQTT_BROKER,
  MQTT_PORT,
  PORT,
  MQTT_TOPIC_TO_PUBLISH,
  MQTT_TOPIC_TO_LISTEN,
  TEMPERATURE_INTERVAL,
  ERROR_CHANNEL_TO_LISTEN,
  PUBLISH_ONLY
} = process.env;

const topicToListen = MQTT_TOPIC_TO_LISTEN || '';

const mqttClient = new MqttHandler(
  NODE_NAME,
  MQTT_BROKER,
  parseInt(MQTT_PORT, 1883),
  MQTT_TOPIC_TO_PUBLISH,
  topicToListen.split(' '),
  parseInt(TEMPERATURE_INTERVAL, 10),
  ERROR_CHANNEL_TO_LISTEN,
  Boolean(PUBLISH_ONLY)
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mqttClient.connect();

const server = app.listen(PORT, () => {
  console.log(`App running on port ${server.address().port}`);
});
