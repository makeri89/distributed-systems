const mqtt = require("mqtt");

const DEFAULT_TEMPERATURE = 50;
const HARD_LIMIT = 200;

class MqttHandler {
  constructor(
    nodeName,
    broker,
    port,
    topicToPublish,
    topicsToListen,
    temperatureIntervalInMilliseconds,
    errorTopic = 'error',
    onlyPublish = false
  ) {
    this.mqttClient = null;
    this.nodeName = nodeName;
    this.broker = broker;
    this.port = port;
    this.topicToPublish = topicToPublish;
    this.topicsToListen = topicsToListen;
    this.temperatureIntervalInMilliseconds = temperatureIntervalInMilliseconds;
    this.errorTopic = errorTopic;
    this.temperatureIntervalId = null;
    this.isSendingPaused = false;
    this.currentTemperature = DEFAULT_TEMPERATURE;
    this.onlyPublish = onlyPublish;
    this.onlyLower = false;
  }

  async connect() {
    this.mqttClient = mqtt.connect(`${this.broker}:${this.port}`);

    this.mqttClient.on("connect", () => {
      console.log(`MQTT client connected`);
      this.startPublishingTemperatures();
    });

    if(!this.onlyPublish) {
      this.topicsToListen.forEach((topic) => {
        console.log(`Subscribing to topic: ${topic}`);
        this.mqttClient.subscribe(topic, { qos: 2 });
      });
    }

    console.log(`${this.nodeName} subscribed to topics: ${this.topicsToListen}`);

    // This triggers when something is published to any of the subscribed topics
    this.mqttClient.on("message", (topic, message) => {
      if (topic === this.errorTopic) {
        console.log(`Received error message: ${message}`);
        const receivedObject = JSON.parse(message.toString());
        if (receivedObject.erroringNode === this.nodeName && receivedObject.errors > 0 && !this.isSendingPaused) {
          console.log(`Received error message from self. Pausing sending.`)
          this.pauseSending();
        }
      } else {
        try {
          const receivedObject = JSON.parse(message.toString());
          console.log(
            `TOPIC: "${topic}". FROM: "${receivedObject.sender}" SENT: temp: ${receivedObject.temperature}, timestamp ${receivedObject.timestamp}"`
          );
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      }
    });

    this.mqttClient.on("error", (err) => {
      console.error(err);
      this.pauseSending();
    });

    this.mqttClient.on("close", () => {
      console.log(`MQTT client disconnected`);
      this.pauseSending();
    });
  }

  sendMessage(topic, message) {
    this.mqttClient.publish(topic, message);
  }

  startPublishingTemperatures() {
    this.temperatureIntervalId = setInterval(() => {
      if (!this.isSendingPaused) {
        const randomIncrease = Math.floor(Math.random() * 5) + 3; // Generates a number between 3 and 7

        if (this.onlyLower) {
          this.currentTemperature -= randomIncrease;
        } else if (Math.random() < 0.75) {
          this.currentTemperature += randomIncrease;
        } else {
          this.currentTemperature -= randomIncrease;
        }

        // This is an artificial limit just for demo purposes
        if (this.currentTemperature > HARD_LIMIT) {
          this.onlyLower = true;
        } else if (this.currentTemperature < DEFAULT_TEMPERATURE) {
          this.onlyLower = false;
        }

        const messageObject = {
          sender: this.nodeName,
          temperature: this.currentTemperature,
          timestamp: new Date().toISOString(),
        };

        const messageString = JSON.stringify(messageObject);
        this.sendMessage(this.topicToPublish, messageString);
      }
    }, this.temperatureIntervalInMilliseconds);
  }

  pauseSending() {
    this.isSendingPaused = true;
    this.currentTemperature = DEFAULT_TEMPERATURE;
    clearInterval(this.temperatureIntervalId);
    const coolOffPeriod = Math.floor(Math.random() * 10000) + 10000; // Generates a number between 10 000 and 20 000
    const messageObject = {
      sender: this.nodeName,
      message: "Cooling down... Returning in 10 seconds.",
      coolOffPeriod,
      timestamp: new Date().toISOString(),
    };
    const messageString = JSON.stringify(messageObject);
    this.sendMessage("pause", messageString);

    // Resume sending after 10 seconds
    setTimeout(() => {
      console.log("Resuming temperature sending.");
      this.isSendingPaused = false;
      this.startPublishingTemperatures();
    }, coolOffPeriod);
  }
}

module.exports = MqttHandler;
