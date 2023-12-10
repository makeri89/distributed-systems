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
  ERROR_CHANNEL_TO_LISTEN
} = process.env;

const mqttClient = new MqttHandler(
  NODE_NAME,
  MQTT_BROKER,
  parseInt(MQTT_PORT, 10),
  MQTT_TOPIC_TO_PUBLISH,
  MQTT_TOPIC_TO_LISTEN,
  parseInt(TEMPERATURE_INTERVAL, 10),
  ERROR_CHANNEL_TO_LISTEN
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mqttClient.connect();

const server = app.listen(PORT, () => {
  console.log(`App running on port ${server.address().port}`);
});
