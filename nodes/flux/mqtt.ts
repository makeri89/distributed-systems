import mqtt from 'mqtt'

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || ''

export const client = mqtt.connect(MQTT_BROKER_URL)

export const publishMessage = (topic: string, erroringNodeName: string, errors: number) => {
  console.log('publishing message: ', erroringNodeName)
  const messageToPublish = {
    erroringNode: erroringNodeName,
    errors,
    timestamp: new Date().toISOString()
  }
  client.publish(topic, JSON.stringify(messageToPublish))
}