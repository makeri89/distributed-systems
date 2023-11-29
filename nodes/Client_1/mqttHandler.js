const mqtt = require("mqtt");

class MqttHandler {
  constructor(
    nodeName,
    broker,
    port,
    topicToPublish,
    topicToListen,
    temperatureIntervalInMilliseconds
  ) {
    this.mqttClient = null;
    this.nodeName = nodeName;
    this.broker = broker;
    this.port = port;
    this.topicToPublish = topicToPublish;
    this.topicToListen = topicToListen;
    this.temperatureIntervalInMilliseconds = temperatureIntervalInMilliseconds;
  }

  async connect() {
    this.mqttClient = mqtt.connect(`${this.broker}:${this.port}`);

    this.mqttClient.on("connect", () => {
      console.log(`MQTT client connected`);
      this.startPublishingTemperatures();
    });

    this.mqttClient.subscribe(this.topicToListen, { qos: 0 });

    // This triggers when something is published to the "topicToListen" queue
    this.mqttClient.on("message", (topic, message) => {
      try {
        const receivedObject = JSON.parse(message.toString());
        console.log(
          `TOPIC: "${topic}". FROM: "${receivedObject.sender}" SENT: temp: ${receivedObject.temperature}, timestamp ${receivedObject.timestamp}"`
        );
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    });

    this.mqttClient.on("error", (err) => {
      console.error(err);
      this.mqttClient.end();
    });

    this.mqttClient.on("close", () => {
      console.log(`MQTT client disconnected`);
    });
  }

  sendMessage(topic, message) {
    // TODO: create logging
    this.mqttClient.publish(topic, message);
  }

  startPublishingTemperatures() {
    setInterval(() => {
      // TODO: think values thru
      const messageObject = {
        sender: this.nodeName,
        temperature: Math.floor(Math.random() * 100),
        humidity: Math.floor(Math.random() * 50),
        timestamp: new Date().toISOString(),
      };

      const messageString = JSON.stringify(messageObject);
      this.sendMessage(this.topicToPublish, messageString);
    }, this.temperatureIntervalInMilliseconds);
  }
}

module.exports = MqttHandler;
