const Router = require("koa-router");
const { tx } = require('../config/webpayConfig'); 
const { Request } = require('../models');
const mqtt = require('mqtt');
const dotenv = require('dotenv');

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
  console.log(err);
  mqttClient.end();
});

const trxRouter = new Router();

trxRouter.post('/create', async (ctx) => {
  try {
    const { request_id, quantity } = ctx.request.body;
    console.log(request_id, quantity, "Id y cantidad en webpay")

    // Busca la request asociada
    console.log("Inicio de búsqueda de request");
    const request = await Request.findByPk(request_id);
    console.log("Fin de búsqueda de request");

    if (!request) {
      ctx.body = {
        message: 'Request no encontrada'
      };
      ctx.status = 404;
      return;
    }

    // Calcula el monto total
    const amount = quantity * 1000;  // Ajusta el cálculo del monto según sea necesario

    console.log("Inicio de creación de transacción en Webpay");
    console.log("link redireccion", process.env.REDIRECT_URL)

    // USO: tx.create(transactionId, nombreComercio, monto, urlRetorno)
    const transactionResponse = await tx.create(
      request.request_id.slice(0, 26),  // ID de la transacción en Webpay
      "test-iic2173",  // Nombre del comercio (para ambiente de prueba usa "test-iic2173")
      amount,  // Monto total
      process.env.REDIRECT_URL  // URL de retorno (donde Webpay redirige después del pago)
    );

    console.log("Fin de creación de transacción en Webpay");

    // Actualiza la request con el token de WebPay
    await Request.update(
        { 
          deposit_token: transactionResponse.token,  // Guarda el token en el request
          status: 'pending payment' 
        },
        { where: { request_id: request.request_id } }
      );

    // Devuelve la URL y el token al frontend para redirigir al usuario a WebPay
    ctx.body = { token: transactionResponse.token, url: transactionResponse.url };
    ctx.status = 201;
  } catch (e) {
    console.error(e);
    ctx.status = 500;
    ctx.body = { message: 'Error al iniciar la transacción' };
  }
});



trxRouter.post('/commit', async (ctx) => {
  const { token } = ctx.request.body;
  console.log(token, "toooken");

  if (!token) {
    const request = await Request.findOne({ 
      where: { status: 'pending payment' }
    });

    if (request) {
      await request.update({ status: "rejected" });

      // Publicar en el canal de validación
      const validationPayload = {
        request_id: request.request_id,
        group_id: request.group_id,
        seller: 0,
        valid: false
      };

      mqttClient.publish('fixtures/validation', JSON.stringify(validationPayload));

      ctx.body = { message: "Transacción anulada correctamente", request };
      ctx.status = 200;
    } else {
      ctx.body = { message: "No se encontró ninguna request pendiente." };
      ctx.status = 404;
    }
    return;
  }

  try {
    // Confirmar la transacción usando el token
    const confirmedTx = await tx.commit(token);

    if (confirmedTx.response_code !== 0) {
      // Actualizar la request a rechazada
      await Request.update({ status: "rejected" }, { where: { deposit_token: token } });

      // Buscar la request actualizada para obtener los campos necesarios
      const trx = await Request.findOne({ where: { deposit_token: token } });

      if (!trx) {
        ctx.status = 404;
        ctx.body = { message: "Request no encontrada después de la actualización." };
        return;
      }

      // Publicar el rechazo en el canal de validación
      const validationPayload = {
        request_id: trx.request_id,
        group_id: trx.group_id,
        seller: 0,
        valid: false
      };

      mqttClient.publish('fixtures/validation', JSON.stringify(validationPayload));

      ctx.body = { message: "Transacción rechazada", request: trx };
      ctx.status = 200;
    } else {
      // Actualizar la request a completada
      await Request.update({ status: "accepted" }, { where: { deposit_token: token } });

      // Buscar la request actualizada para obtener los campos necesarios
      const trx = await Request.findOne({ where: { deposit_token: token } });

      if (!trx) {
        ctx.status = 404;
        ctx.body = { message: "Request no encontrada después de la actualización." };
        return;
      }

      // Publicar la aceptación en el canal fixtures/validation
      const validationPayload = {
        request_id: trx.request_id,
        group_id: trx.group_id,
        seller: 0,
        valid: true
      };

      mqttClient.publish('fixtures/validation', JSON.stringify(validationPayload));

      ctx.body = { message: "Transacción aceptada", request: trx };
      ctx.status = 200;
    }
  } catch (error) {
    console.error('Error confirming transaction:', error);
    ctx.status = 500;
    ctx.body = { message: "Error procesando la transacción" };
  }
});



module.exports = trxRouter;



