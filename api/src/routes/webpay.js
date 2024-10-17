const Router = require("koa-router");
const { tx } = require('../config/webpayConfig'); 
const { Request } = require('../models');

const trxRouter = new Router();

trxRouter.post('/create', async (ctx) => {
  try {
    const { requestId, quantity } = ctx.request.body;
    console.log(requestId, quantity, "Id y cantidad en webpay")

    // Busca la request asociada
    const request = await Request.findByPk(requestId);

    if (!request) {
      ctx.body = {
        message: 'Request no encontrada'
      };
      ctx.status = 404;
      return;
    }

    // Calcula el monto total
    const amount = quantity * 1000;  // Ajusta el cálculo del monto según sea necesario

    // USO: tx.create(transactionId, nombreComercio, monto, urlRetorno)
    const transactionResponse = await tx.create(
      request.request_id,  // ID de la transacción en Webpay
      "test-iic2173",  // Nombre del comercio (para ambiente de prueba usa "test-iic2173")
      amount,  // Monto total
      process.env.REDIRECT_URL || 'http://localhost:5173/completed-purchase'  // URL de retorno (donde Webpay redirige después del pago)
    );

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

module.exports = trxRouter;



