# Nodes

## Node 1 (client_1):

This node is configured to connect to the Mosquitto MQTT broker.
It listens for messages on the "temperature" topic.
It publishes random temperature and humidity values to the "temperature" topic every 5 seconds.


## Node 2 (client_2):

Similar to Node 1, Node 2 is configured to connect to the Mosquitto MQTT broker.
It listens for messages on the "temperature" topic.
It publishes random temperature and humidity values to the "temperature" topic every 8 seconds.

## Node 3 (client_3):

This node is configured to connect to the Mosquitto MQTT broker.
Node 3 only publishes random temperature and humidity values to the "temperature" topic every 10 seconds.
It does not subscribe to any topic.


### TL;DR
- Each node communicates with the Mosquitto broker using MQTT.
- Nodes 1 and 2 both listen for and publish messages on the "temperature" topic.
- Node 3 only publishes messages and does not subscribe to any topic.


## How to run

Go to the root folder <code>./distributed-systems</code> and run command:

````
docker-compose up -d
````


If you make changes to the node.js apps code, run with <code>--build</code> flag due to Docker cache:

````
docker-compose up  --build -d
````

<code>docker-compose.yml</code> has environment values added to the nodes. Feel free to modify them, or create own <code>.env</code> values with the help of <code>.env.example</code>