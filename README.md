# distributed-systems

## General information

### Group members

- Markus Kaihola
- Elias Herranen
- Leevi Leinonen
- Oskari Nuottonen

### Group work style

- Evenings and weekends

## Project Overview

#### Industrial Machinery Monitoring with Edge Computing

This project aims to develop an industrial machinery monitoring system leveraging edge computing technology.
It features a practical, simplified model, exemplified through temperature measurements,
but is designed to accommodate more complex scenarios.
This system can be effectively deployed on shop floors, showcasing its adaptability to industrial environments.

### System Architecture: Event-Driven Pub/Sub Model

#### Overview

The system's architecture is built on an event-driven publish/subscribe (pub/sub) framework, utilizing the MQTT
protocol.
This design ensures efficient, real-time data communication and management across various components of the
system.

![distributed drawio](./distributed-systems.drawio.png)

#### Components and Workflow

1. **Edge Nodes in Industrial Factories**: These are the primary data-gathering components located in industrial
   settings.
   They collect data and communicate with a central broker via the MQTT protocol.

2. **Broker**: The broker acts as a central hub for data communication.
   It simplifies node discovery, as client nodes only need to know about the broker.
   It also ensures data consistency by queuing messages when immediate delivery isn't
   possible, ensuring they are sent later.

3. **Data Storage**: Comprising Telegraf and InfluxDB nodes.
   Telegraf subscribes to the MQTT broker, processes the incoming
   data, and forwards it to the InfluxDB node for storage.

4. **Data Handling Section**: This component is responsible for querying the InfluxDB node using Flux queries.
   It can also publish data back to the MQTT broker, making it accessible to client nodes.

5. **User-Facing Application (Grafana)**: This application interfaces with the InfluxDB to retrieve data.
   Grafana also allows setting up of alert thresholds for system administrators,
   notifying them in cases like system failures.

### Communication Protocols

1. **MQTT Protocol**: The core communication protocol for the edge application nodes connecting to the MQTT broker.

2. **HTTPS Protocol**: Utilized for more user-facing components of the system, ensuring secure data transmission.

## Setting up

To set up Telegraf, InfluxDB and Grafana for development, (at the moment) you need to do some manual work.
This will only need to be done once unless you delete the docker volume data.

First run

```bash
docker compose up influxdb
```

Then go to [http://localhost:8086](http://localhost:8086) to complete the InfluxDB setup.
During the setup, an admin token is created.
Copy the value of that to yourself.
You will also have to define the organization name, that can be anything.
Also create a new bucket (not the default bucket created on startup) and name something like `temperatures`.

Next, you can kill the running docker compose.

Next run

```bash
export INFLUXDB_TOKEN=<value-of-your-token>
```

Telegraf's configuration will then read the token from the environment. Now you can start all the services

```bash
docker compose up -d
```

Now go to [http://localhost:3000](http://localhost:3000) and set up the Grafana instance (default login is admin:admin).
Then go to set up a data source with the following values

#### Query language

Flux

### HTTP

- URL = http://influxdb:8086

### Auth

- Select Basic auth
    - User: Your influxdb username
    - Password: Your influxdb password

### InfluxDB Details

- Organization = Your influxdb organization name
- Token = Your influxdb admin token
- Default bucket = The bucket you created to influxdb

Then click Save and test. If all goes well, the connection should be up.

Next, you can go to the Explore tab to query the InfluxDB. An example query to select the temperature mean data:

```flux
from(bucket: "temps")
  |> range(start: -1h)
  |> filter(fn: (r) => r._field == "temperature")
  |> aggregateWindow(every: 5m, fn: mean)
```