const mqtt = require("mqtt");
const axios = require("axios");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

var mqttClient;

const mqttHost = process.env.MQTT_HOST;
const port = process.env.MQTT_PORT;
const user = process.env.MQTT_USER;
const password = process.env.MQTT_PASSWORD;
const protocol = process.env.MQTT_PROTOCOL;
const api = process.env.API_URL;

function connectToBroker() {
    const clientId = "client_THEGOATEMI";
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
        // console.log("You had an Error: ", err);
        mqttClient.end();
    });
    
    // Recibir mensajes
    mqttClient.on("message", (topic, message, packet) => {

        // Parsear el mensaje a objeto JSON
        const parsedMessage = JSON.parse(message.toString());

        // Lógica común para procesar los mensajes
        let apiEndpoint = '';

        if (topic === "fixtures/info") {
            // console.log("Procesando mensaje de fixtures/info...");
            apiEndpoint = `${api}/fixtures/update`;
            axios.post(apiEndpoint, parsedMessage, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                console.log('.')
                // // console.log(`Message sent to API for topic ${topic}:`, response.data);
                // console.log('update fixtures success');
            })
            .catch(error => {
                console.log('.')
                // console.error(`Error sending message to API for topic ${topic}:`);
            });
            
        } else if (topic === "fixtures/validation") {
            if (parsedMessage.group_id != '15') {
                a = 1;
            } else {   
        
                const apiEndpoint = `${api}/requests/validate`;
                let attempts = 0;
                const maxRetries = 2;
        
                const sendValidation = () => {
                    axios.patch(apiEndpoint, parsedMessage, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => {
                        console.log('VALIDATION SENT');
                    })
                    .catch(error => {
                        attempts++;
                        if (attempts < maxRetries) {
                            console.log(`Retrying... Attempts left: ${maxRetries - attempts}`);
                            setTimeout(sendValidation, 1000);
                        }
                    });
                };
                sendValidation();
            }
        
        } else if (topic === "fixtures/requests") {

            apiEndpoint = `${api}/requests`;
        
            if (parsedMessage.group_id != '15') {
                a = 1;

            } else {
                axios.post(apiEndpoint, parsedMessage, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    console.log('Request success');
                })

                .catch(error => {
                    console.log("Ignoring error because it is our request coming back.");
                    console.error(`Error sending message to API for topic ${topic}`);
                });
            }

        } else if (topic === "fixtures/history") {
            // console.log("Procesando mensaje de fixtures/history...");
            apiEndpoint = `${api}/requests/history`;
            axios.post(apiEndpoint, parsedMessage, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                // // console.log(`Message sent to API for topic ${topic}:`, response.data);
                console.log('History success');
            })
            .catch(error => {
                // console.error(`Error sending message to API for topic ${topic}`);
            });

        // Añade lógica para manejar los tipos de mensajes adicionales
        } else if (topic === "fixtures/auctions") {
            const { type } = parsedMessage;

            if (type === "offer") {
                // Manejar ofertas iniciales
                apiEndpoint = `${api}/auctions/offers`;
                axios.post(apiEndpoint, parsedMessage, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    console.log('Offer sent to API');
                })
                .catch(error => {
                    console.error(`Error sending offer to API for topic ${topic}`);
                });

            } else if (type === "proposal") {
                // Manejar propuestas
                apiEndpoint = `${api}/auctions/proposals`;
                axios.post(apiEndpoint, parsedMessage, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    console.log('Proposal sent to API');
                })
                .catch(error => {
                    console.error(`Error sending proposal to API for topic ${topic}`);
                });

            } else if (type === "acceptance" || type === "rejection") {
                // Manejar respuestas a propuestas
                apiEndpoint = `${api}/auctions/proposals/responce`;
                axios.patch(apiEndpoint, parsedMessage, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} response sent to API`);
                })
                .catch(error => {
                    console.error(`Error sending ${type} response to API for topic ${topic}`);
                });
            } else {
                console.error(`Unknown auction type: ${type}`);
            }

        } else {
            // console.log("Tópico no reconocido:", topic);
            return;  // Salir si el tópico no es reconocido
        }

        // Enviar el mensaje a la API correspondiente
    
    });

}

function subscribeToTopic(topic) {
    // console.log(`Subscribing to Topic: ${topic}`);

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
subscribeToTopic("fixtures/auctions");
