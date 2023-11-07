# distributed-systems

## General information

### Group members

- Markus Kaihola
- Elias Herranen
- Leevi Leinonen
- Oskari Nuottonen

### Group work style

 - Evenings and weekends

 ## Project definition

Industrial machinery monitoring system utilizing edge computation

### Architecture

The architecture of the application will be an event based pub/sub system utilizing the MQTT protocol.

![distributed drawio](./distributed-systems.drawio.png)

The application consists of multiple areas of which not all need to be implemented at once to achieve a working product.

The core of the application consists of edges nodes running in industrial factories. These client nodes will communicate with a broker using the MQTT protocol. The MQTT broker simplifies the node discovery since the clients only need to know about the broker. The broker also quarantees consistency since it queues the messages that for some reason cannot be sent at the moment and will send them later.

The data storage part of the application consists of Telegraf and InfluxDB nodes. Telegraf will subscribe to the MQTT broker, parse the data and send it to the InfluxDB node.

Another part of the application is data handling section that queries the InfluxDB node with Flux queries. It can then publish data to MQTT broker and the client nodes can access the data.

An user facing application can be implemented with Grafana that queries data from the InfluxDB node. The Grafana node can define thresholds to alert the administrators of the system under certain conditions, like system failure.

### Communication mechanism

The main communication mechanisms are MQTT protocol in the core application nodes that connect to the MQTT broker and HTTPS protocol for the more user facing applications.
