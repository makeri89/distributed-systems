const mqtt = require("mqtt");

class MqttHandler {
  constructor(
    nodeName,
    broker,
    port,
    topicToPublish,
    topicToListen,
    temperatureIntervalInMilliseconds,
    errorChannel,
  ) {
    this.mqttClient = null;
    this.nodeName = nodeName;
    this.broker = broker;
    this.port = port;
    this.topicToPublish = topicToPublish;
    this.topicToListen = topicToListen;
    this.temperatureIntervalInMilliseconds = temperatureIntervalInMilliseconds;
    this.errorChannel = errorChannel;
    this.temperatureIntervalId = null;
    this.isSendingPaused = false;
    this.currentTemperature = 50;
  }

  async connect() {
    this.mqttClient = mqtt.connect(`${this.broker}:${this.port}`);

    this.mqttClient.on("connect", () => {
      console.log(`MQTT client connected`);
      this.startPublishingTemperatures();
    });

    this.mqttClient.subscribe(this.topicToListen, { qos: 2 });
    this.mqttClient.subscribe(this.errorChannel, { qos: 2 });

    // This triggers when something is published to the "topicToListen" queue
    this.mqttClient.on("message", (topic, message) => {
      if (topic === this.errorChannel) {
        const receivedObject = JSON.parse(message.toString());
        console.log(
          `TOPIC: "${topic}". FROM: "${receivedObject.sender}", ERROR MESSAGE: "${receivedObject.errorMessage}", timestamp ${receivedObject.timestamp}"`
        );
      } else {
        try {
          const receivedObject = JSON.parse(message.toString());
          console.log(
            `TOPIC: "${topic}". FROM: "${receivedObject.sender}" SENT: temp: ${receivedObject.temperature}, timestamp ${receivedObject.timestamp}"`
          );

          // Check if the received temperature is higher than 100
          if (receivedObject.temperature > 100) {
            console.log(
              "Temperature is higher than 100. Pausing for 10 seconds."
            );
            this.pauseSending();
          }
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
    // TODO: create logging
    this.mqttClient.publish(topic, message);
  }

  startPublishingTemperatures() {
    this.temperatureIntervalId = setInterval(() => {
      if (!this.isSendingPaused) {
        const randomIncrease = Math.floor(Math.random() * 5) + 3; // Generates a number between 3 and 7

        if (Math.random() < 0.75) {
          this.currentTemperature += randomIncrease;
        } else {
          this.currentTemperature -= randomIncrease;
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
    this.currentTemperature = 50;
    clearInterval(this.temperatureIntervalId);
    const messageObject = {
      sender: this.nodeName,
      errorMessage: "Cooling down... Returning in 10 seconds.",
      timestamp: new Date().toISOString(),
    };
    const messageString = JSON.stringify(messageObject);
    this.sendMessage(this.errorChannel, messageString);

    // Resume sending after 10 seconds
    setTimeout(() => {
      console.log("Resuming temperature sending.");
      this.isSendingPaused = false;
      this.startPublishingTemperatures();
    }, 10000);
  }
}

module.exports = MqttHandler;
