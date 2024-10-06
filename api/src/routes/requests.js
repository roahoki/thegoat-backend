const Router = require("koa-router");
const { Request, Usuario, Fixture, ExternalRequest, Team } = require("../models");
const router = new Router();
const { v4: uuidv4 } = require('uuid');
const mqtt = require('mqtt');
const axios = require('axios');
const fs = require('fs');
const dotenv = require('dotenv');
const moment = require('moment');

// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Configuración de conexión MQTT
const mqttClient = mqtt.connect({
  host: process.env.BROKER_HOST,
  port: process.env.BROKER_PORT,
  username: process.env.BROKER_USER,
  password: process.env.BROKER_PASSWORD
});

mqttClient.on("error", (err) => {
    mqttClient.end();
});

// Función auxiliar para reservar bonos
async function reservarBonos(fixture_id, quantity, transaction) {
    // Buscar el fixture para reservar los bonos
    const fixture = await Fixture.findOne({ where: { id: fixture_id }, transaction });

    if (!fixture) {
        throw new Error("Fixture not found");
    }

    // Verificar si hay suficientes bonos disponibles
    if (fixture.bonos_disponibles < quantity) {
        throw new Error("Not enough bonos available");
    }

    // Reservar los bonos reduciendo la cantidad disponible
    fixture.bonos_disponibles -= quantity;
    await fixture.save({ transaction });
}


// Endpoint para crear una nueva request
router.post("/", async (ctx) => {
    const t = await Request.sequelize.transaction();  // Iniciar transacción

    try {
        const { group_id, fixture_id, league_name, round, date, result, deposit_token, datetime, quantity, usuarioId, status, request_id: incoming_request_id } = ctx.request.body;

        // console.log(`______________________________________________\n\tIncoming request:User id${user_id}_____________________________`);

        if (!group_id || !fixture_id || !league_name || !round || !date || !result || !datetime || typeof quantity !== 'number' || quantity <= 0) {
            ctx.status = 400;
            ctx.body = { message: "Invalid request format." };
            return;
        }

        const clientIP = ctx.request.ip;
        const ipResponse = await axios.get(`http://ip-api.com/json/${clientIP}`);
        const { city, region, country } = ipResponse.data;

        let request_id;
      
        if (group_id == '15' && usuarioId && typeof request_id === 'undefined') {
            // console.log("HOLA ME LLEGO DEL GRUPO 15");

            // Generar un nuevo UUID para la request interna
            request_id = uuidv4();

            // Reservar los bonos reduciendo la cantidad disponible
            await reservarBonos(fixture_id, quantity, t);

            // Crear la nueva request en la base de datos con estado 'sent'
            const newRequest = await Request.create({
                request_id,
                group_id,
                fixture_id,
                league_name,
                round,
                date,
                result,
                deposit_token: deposit_token || "",  // Por defecto vacío si no se pasa
                datetime,
                quantity,
                seller: 0,  // Siempre es 0
                usuarioId,
                status: "sent",
                ip_address: clientIP,  // Agregar IP del cliente
                location: `${city}, ${region}, ${country}`
            }, { transaction: t });

            // Commit de la transacción
            await t.commit();

            // Preparar el payload para el mensaje MQTT
            const messagePayload = {
                request_id,
                group_id,
                fixture_id,
                league_name,
                round,
                date,
                result,
                deposit_token: "",  // Siempre vacío
                datetime,
                quantity,
                seller: 0
            };

            // Publicar el mensaje en el canal fixtures/requests
            mqttClient.publish('fixtures/requests', JSON.stringify(messagePayload), { qos: 0 }, (error) => {
                if (error) {
                    console.error('Error al publicar en el broker:', error);
                    ctx.status = 500;
                    ctx.body = { message: "Failed to publish message to broker." };
                } else {
                    // console.log('Mensaje publicado en el canal fixtures/requests:\n\n\n PAYLOAD \n\n\n', messagePayload);
                    ctx.status = 201;
                    ctx.body = { message: "Request successfully created and message sent to broker!", request: newRequest };
                }
            });

    
        } else if (group_id !== '15') {
            // Si el group_id no es 15, manejar como ExternalRequest
            request_id = incoming_request_id;

            const externalRequest = await ExternalRequest.create({
                request_id,
                group_id,
                fixture_id,
                league_name,
                round,
                date,
                result,
                deposit_token: deposit_token || "",  // Por defecto vacío si no se pasa
                datetime,
                quantity,
                seller: 0,  // Siempre es 0
                status: "pending"  // Cambiar a 'pending' cuando se crea la external request
            }, { transaction: t });

            // Reservar los bonos reduciendo la cantidad disponible para las external requests también
            await reservarBonos(fixture_id, quantity, t);

            // Commit de la transacción
            await t.commit();

            ctx.status = 201;
            ctx.body = { message: "External request successfully created!", externalRequest };

        } else {
            // Si el group_id es 15, pero la request ya existe o no tiene user_id

            ctx.status = 400;
            ctx.body = { message: "Invalid request. Either user_id is missing, or the request already exists." };
        }

    } catch (error) {
        await t.rollback();
        console.error("Error creating request:", error);
        if (error.message === "Fixture not found" || error.message === "Not enough bonos available") {
            ctx.status = 404;
            ctx.body = { error: error.message };
        } else {
            ctx.status = 500;
            ctx.body = { message: "An error occurred while creating the request." };
        }
    }
});

// Endpoint para obtener todas las requests
router.get("/", async (ctx) => {
    const { page = 1, count = 25, user_id, status } = ctx.query;

    let where = {};

    // Filtro por user_id si es proporcionado
    if (user_id) {
        where.user_id = user_id;
    }

    // Filtro por status si es proporcionado
    if (status) {
        where.status = status;
    }

    // Limitar el número máximo de resultados a 25
    const limit = Math.min(parseInt(count), 25);

    try {
        // Buscar las requests con los filtros aplicados
        const requests = await Request.findAndCountAll({
            where,
            include: [{ model: Usuario, as: 'usuario' }],  // Incluir datos del usuario si es necesario
            order: [['createdAt', 'DESC']],
            limit,
            offset: (page - 1) * limit,
        });

        ctx.body = {
            requests: requests.rows,
            total: requests.count,
            page: parseInt(page),
            count: parseInt(count),
        };
    } catch (error) {
        console.error("Error fetching requests:", error);
        ctx.status = 500;
        ctx.body = { error: "An error occurred while fetching requests." };
    }
});

// Endpoint para obtener una request por ID
router.get("/:id", async (ctx) => {
    const { id } = ctx.params;

    try {
        const request = await Request.findOne({
            where: { request_id: id },
            include: [{ model: Usuario, as: 'usuario' }]
        });

        if (!request) {
            ctx.status = 404;
            ctx.body = { error: "Request not found" };
            return;
        }

        ctx.body = request;
    } catch (error) {
        console.error("Error fetching request by ID:", error);
        ctx.status = 500;
        ctx.body = { error: "An error occurred while fetching the request." };
    }
});

// Endpoint para manejar la validación de las requests
router.patch("/validate", async (ctx) => {

    let t;

    try { 
        const { request_id, group_id, seller, valid } = ctx.request.body;
        // Start transaction
        t = await Request.sequelize.transaction();

        // Determine which model to use
        const requestModel = group_id == "15" ? Request : ExternalRequest;

        // Find the request
        const request = await requestModel.findOne({ where: { request_id }, transaction: t });
        if (!request) {
            ctx.status = 404;
            ctx.body = { error: `${group_id == '15' ? 'Request' : 'External Request'} not found` };
            return;
        }

        // Find the associated fixture
        const fixture = await Fixture.findOne({ where: { id: request.fixture_id }, transaction: t });
        if (!fixture) {
            ctx.status = 404;
            ctx.body = "Fixture not found";
            return;
        }

        const newStatus = valid ? "accepted" : "rejected";

        // Handle rejected requests
        if (!valid) {
            fixture.bonos_disponibles += request.quantity;
            await fixture.save({ transaction: t });
        }

        // Handle accepted requests for group 15
        if (group_id == "15" && valid) {
            const usuario = await Usuario.findOne({ where: { id: request.usuarioId }, transaction: t });
            if (!usuario) {
                ctx.status = 404;
                ctx.body = { error: "Usuario not found" };
                return;
            }

            usuario.billetera -= 1000 * request.quantity;
            if (usuario.billetera < 0) {
                ctx.status = 402;
                ctx.body = { error: "Insufficient funds in the user's billetera." };
                return;
            }

            await usuario.save({ transaction: t });
        }

        // Update request status
        await request.update({ status: newStatus }, { transaction: t });

        // Commit transaction
        await t.commit();

        ctx.status = 200;
        ctx.body = { message: `${group_id == '15' ? 'Request' : 'External Request'} has been ${newStatus}`, request };

    } catch (error) {
        console.error("Error validating request:", error);
        ctx.status = 500;
        ctx.body = { message: "An error occurred while validating the request." };
    } finally {
        // Ensure transaction is rolled back if it wasn't committed
        if (t && !t.finished) {
            await t.rollback();
        }
    }
});

// Endpoint para manejar el mensaje del canal history
router.post("/history", async (ctx) => {
    const { fixtures } = ctx.request.body;

    // Iterar sobre cada fixture recibido en el mensaje
    for (const fixtureData of fixtures) {
        try {
            const fixture = fixtureData.fixture;
            const goals = fixtureData.goals;

            // Obtener el ID del fixture
            const fixtureId = fixture.id;

            // Buscar el fixture en la base de datos
            const dbFixture = await Fixture.findOne({
                where: { id: fixtureId },
                include: [
                    { model: Team, as: 'homeTeam' },  // Incluir el equipo local
                    { model: Team, as: 'awayTeam' }   // Incluir el equipo visitante
                ]
            });

            if (!dbFixture) {
                console.error("Fixture not found:", fixtureId);
                continue; // Salta al siguiente fixture si no se encuentra
            }

            // Determinar el nombre del equipo ganador basado en los goles
            let winningTeam = null;
            if (goals.home > goals.away) {
                winningTeam = dbFixture.homeTeam.name; // El equipo local ganó
            } else if (goals.away > goals.home) {
                winningTeam = dbFixture.awayTeam.name; // El equipo visitante ganó
            } else {
                winningTeam = "---"; // Empate
            }

            // Verificar si hay requests del grupo 15 para este fixture
            const requests = await Request.findAll({
                where: {
                    fixture_id: fixtureId,
                    group_id: "15",
                    status: "accepted"
                }
            });

            for (const request of requests) {
                try {
                    const expectedResult = request.result; // El resultado que apostaron (nombre del equipo)

                    // Verifica si el resultado esperado coincide con el resultado real
                    const hasWon = (expectedResult == winningTeam || (expectedResult == "---" && winningTeam == "---"));

                    // Cambiar el estado de la request
                    const newStatus = hasWon ? "won" : "lost";
                    await request.update({ status: newStatus });

                    // Si ganó la apuesta, actualizar la billetera del usuario
                    if (hasWon) {
                        const usuario = await Usuario.findOne({ where: { id: request.user_id } });
                        if (usuario) {
                            // Obtener los odds desde la fixture
                            const oddsArray = dbFixture.odds.find(odd => odd.name == "Match Winner");
                            const odds = oddsArray ? oddsArray.values : [];

                            // Determinar el odd correspondiente al resultado
                            let winningOdd = null;
                            if (winningTeam == dbFixture.homeTeam.name) {
                                winningOdd = odds.find(odd => odd.value == "Home");
                            } else if (winningTeam == dbFixture.awayTeam.name) {
                                winningOdd = odds.find(odd => odd.value == "Away");
                            } else if (winningTeam == "---") {
                                winningOdd = odds.find(odd => odd.value == "Draw");
                            }

                            if (winningOdd) {
                                const winnings = 1000 * request.quantity * parseFloat(winningOdd.odd); // Calcular las ganancias
                                usuario.billetera += winnings; // Agregar ganancias a la billetera
                                await usuario.save(); // Guardar los cambios en la billetera
                            }
                        }
                    }
                } catch (requestError) {
                    console.error("Error processing request for fixture:", fixtureId, "Error:", requestError);
                }
            }
        } catch (fixtureError) {
            console.error("Error processing fixture:", fixtureData.fixture.id, "Error:", fixtureError);
        }
    }

    ctx.status = 200;
    ctx.body = { message: "History processed successfully." };
});

router.get('/bond', async (ctx) => {
    try {
      const fixtures = await Fixtures.findAll(); // Assuming you're using Sequelize or similar ORM
  
      // Extract the relevant data
      const data = fixtures.map(fixture => ({
        fixture_id: fixture.id, // Assuming 'id' is the fixture ID field
        bonos_disponibles: fixture.bonos_disponibles // Assuming 'bonos_disponibles' is a field in the fixture
      }));
  
      // Return the data as JSON
      ctx.body = {
        success: true,
        data: data
      };
    } catch (error) {
      // Handle any errors
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: 'Failed to fetch fixtures',
        error: error.message
      };
    }
  });

module.exports = router;
