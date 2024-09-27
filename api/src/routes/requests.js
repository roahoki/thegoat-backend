const Router = require("koa-router");
const { Request, Usuario, Fixture, ExternalRequest } = require("../models");
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

router.post("/", async (ctx) => {
    const t = await Request.sequelize.transaction();  // Iniciar transacción
    try {
        const { group_id, fixture_id, league_name, round, date, result, deposit_token, datetime, quantity, user_id, status } = ctx.request.body;

        // Generar un nuevo UUID para la request
        const request_id = uuidv4();

        // Si el group_id es 15, manejar como request interna
        if (group_id == '15') {
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
                user_id,
                status: "sent"  // Cambiar a 'sent' cuando se crea la request
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
                    console.log('Mensaje publicado en el canal fixtures/requests:', messagePayload);
                    ctx.status = 201;
                    ctx.body = { message: "Request successfully created and message sent to broker!", request: newRequest };
                }
            });

        } else {
            // Si el group_id no es 15, guardar como ExternalRequest
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
        }

    } catch (error) {
        await t.rollback();
        console.error("Error creating request:", error);
        if (error.message == "Fixture not found" || error.message == "Not enough bonos available") {
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

// Endpoint para obtener una request por ID
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

// Endpoint para manejar la validación de una request
router.patch("/validate", async (ctx) => {
    const t = await Request.sequelize.transaction();  // Iniciar transacción
    try {
        const { request_id, group_id, seller, valid } = ctx.request.body;

        let requestModel;

        // Determinar si es una request interna o externa
        console.log("Id de grupo", group_id)
        if (group_id == "15") {
            // Si el group_id es 15, usamos el modelo Request
            console.log("Entre al if")
            requestModel = Request;
        } else {
            // Si el group_id no es 15, usamos el modelo ExternalRequest
            requestModel = ExternalRequest;
        }

        // Verificar si la request existe en el modelo correspondiente
        const request = await requestModel.findOne({ where: { request_id }, transaction: t });

        if (!request) {
            ctx.status = 404;
            ctx.body = { error: `${group_id == '15' ? 'Request' : 'External Request'} not found` };
            return;
        }

        // Buscar el fixture asociado
        const fixture = await Fixture.findOne({ where: { id: request.fixture_id }, transaction: t });

        if (!fixture) {
            ctx.status = 404;
            ctx.body = { error: "Fixture not found" };
            return;
        }

        // Actualizar el estado de la request basado en el valor de "valid"
        const newStatus = valid ? "accepted" : "rejected";

        // Si la request es rechazada, restaurar los bonos
        if (!valid) {
            fixture.bonos_disponibles += request.quantity;
            await fixture.save({ transaction: t });
        }

        // Actualizar la request con el nuevo estado en el modelo correspondiente
        await request.update({ status: newStatus }, { transaction: t });

        // Commit de la transacción
        await t.commit();

        ctx.status = 200;
        ctx.body = { message: `${group_id == '15' ? 'Request' : 'External Request'} has been ${newStatus}`, request };

    } catch (error) {
        await t.rollback();  // Revertir si hay algún error
        console.error("Error validating request:", error);
        ctx.status = 500;
        ctx.body = { message: "An error occurred while validating the request." };
    }
});


module.exports = router;
