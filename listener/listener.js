const mqtt = require("mqtt");
const axios = require("axios");
const fs = require("fs");
const dotenv = require("dotenv");
const { log } = require("console");

dotenv.config();

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

    // Recibir mensajes
    mqttClient.on("message", (topic, message, packet) => {
        // console.log("Message Received: " + message.toString() + "\nOn topic: " + topic);

        // Guardar el mensaje en un archivo
        fs.writeFileSync('output.txt', message.toString(), 'utf8');

        // Parsear el mensaje a objeto JSON
        const parsedMessage = JSON.parse(message.toString());

        // Lógica común para procesar los mensajes
        let apiEndpoint = '';

        if (topic === "fixtures/info") {
            console.log("Procesando mensaje de fixtures/info...");
            apiEndpoint = 'http://api:3000/fixtures/update';
            axios.post(apiEndpoint, parsedMessage, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                // console.log(`Message sent to API for topic ${topic}:`, response.data);
                console.log('update fixtures success');
            })
            .catch(error => {
                console.error(`Error sending message to API for topic ${topic}:`, error);
            });
            
        } else if (topic === "fixtures/validation") {
            console.log("Procesando mensaje de fixtures/validation...");
            const apiEndpoint = 'http://api:3000/requests/validate';
            let attempts = 0;
            const maxRetries = 3;
        
            const sendValidation = () => {
                axios.patch(apiEndpoint, parsedMessage, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    // console.log(`Message sent to API for topic ${topic}:`, response.data);
                    console.log('VALIDATION SENT');

                })
                .catch(error => {
                    console.error(`Error sending message to API for topic ${topic}:`, error);
                    attempts++;
                    if (attempts < maxRetries) {
                        console.log(`Retrying... Attempts left: ${maxRetries - attempts}`);
                        setTimeout(sendValidation, 1000);
                    }
                });
            };
        
            sendValidation();

        } else if (topic === "fixtures/requests") {
            console.log("Procesando mensaje de fixtures/requests...");
            apiEndpoint = 'http://api:3000/requests';
            axios.post(apiEndpoint, parsedMessage, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                console.log(`Message sent to API for topic ${topic}:`, response.data);
                // console.log('Request success');
            })
            .catch(error => {
                console.error(`Error sending message to API for topic ${topic}:`, error);
            });

        } else if (topic === "fixtures/history") {
            console.log("Procesando mensaje de fixtures/history...");
            apiEndpoint = 'http://api:3000/requests/history';
            axios.post(apiEndpoint, parsedMessage, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                // console.log(`Message sent to API for topic ${topic}:`, response.data);
                console.log('History success');
            })
            .catch(error => {
                console.error(`Error sending message to API for topic ${topic}:`, error);
            });

        }else {
            console.log("Tópico no reconocido:", topic);
            return;  // Salir si el tópico no es reconocido
        }

        // Enviar el mensaje a la API correspondiente
    
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
subscribeToTopic("fixtures/validation");
subscribeToTopic("fixtures/requests");
subscribeToTopic("fixtures/history");

