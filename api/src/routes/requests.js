const Router = require("koa-router");
const { Request, Usuario } = require("../models");
const router = new Router();
const { v4: uuidv4 } = require('uuid');
const mqtt = require('mqtt');
const fs = require('fs');

// Configuración de conexión MQTT
const mqttClient = mqtt.connect({
  host: 'broker.iic2173.org',
  port: 9000,
  username: 'students',
  password: 'iic2173-2024-2-students'
});

mqttClient.on("error", (err) => {
    console.log("Error connecting to MQTT broker:", err);
    mqttClient.end();
});

// Endpoint para postear una nueva request
router.post("/", async (ctx) => {
    try {
        const { group_id, fixture_id, league_name, round, date, result, deposit_token, quantity, user_id, status } = ctx.request.body;

        // Generar un nuevo UUID para la request
        const request_id = uuidv4();

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
            datetime: new Date().toISOString(),  // Fecha y hora actual
            quantity,
            seller: 0,  // Siempre es 0
            user_id,
            status: "sent"  // Cambiar a 'sent' cuando se crea la request
        });

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
            datetime: new Date().toISOString(),
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
                console.log('Mensaje publicado en el canal fixtures/requests:', messagePayload);
                ctx.status = 201;
                ctx.body = { message: "Request successfully created and message sent to broker!", request: newRequest };
            }
        });

    } catch (error) {
        console.error("Error creating request:", error);
        ctx.status = 500;
        ctx.body = { message: "An error occurred while creating the request." };
    }
});

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
});
router.get("/:id", async (ctx) => {
    const { id } = ctx.params;

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
});

module.exports = router;
