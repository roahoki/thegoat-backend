const mqtt = require("mqtt");
const axios = require("axios");
const fs = require("fs");

var mqttClient;

const mqttHost = "broker.iic2173.org";
const port = "9000";
const user = "students";
const password = "iic2173-2024-2-students";
const protocol = "mqtt";

function connectToBroker() {
    const clientId = "client_THEGOAT";
    const hostURL = `${protocol}://${mqttHost}:${port}`;

    const options = {
        keepalive: 60,
        clientId: clientId,
        protocolId: "MQTT",
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 4000,
        username: user,
        password: password
    };

    mqttClient = mqtt.connect(hostURL, options);

    mqttClient.on("error", (err) => {
        console.log("You had an Error: ", err);
        mqttClient.end();
    });

    // Received Message
    mqttClient.on("message", (topic, message, packet) => {
        console.log("Message Received: " + message.toString() + "\nOn topic: " + topic);

        fs.writeFileSync('output.txt', message.toString(), 'utf8');

        // Parsear el mensaje a objeto JSON
        const parsedMessage = JSON.parse(message.toString());

        // Enviar el mensaje como JSON a la API
        axios.post('http://api:3000/fixtures/update', parsedMessage, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                console.log('Message sent to API:', response.data);
            })
            .catch(error => {
                console.error('Error sending message to API:', error);
            });
    });

}

function subscribeToTopic(topic) {
    console.log(`Subscribing to Topic: ${topic}`);

    mqttClient.subscribe(topic, { qos: 0 }, (err) => {
        if (err) {
            console.log(`Failed to subscribe to topic: ${topic}`);
        } else {
            console.log(`Successfully subscribed to topic: ${topic}`);
        }
    });
}

connectToBroker();
subscribeToTopic("fixtures/info");
