const Router = require("koa-router");
const { tx } = require('../config/webpayConfig'); 
const { Request } = require('../models');

const trxRouter = new Router();

trxRouter.post('/create', async (ctx) => {
  try {
    const { request_id, quantity } = ctx.request.body;
    console.log(request_id, quantity, "Id y cantidad en webpay")

    // Busca la request asociada
    const request = await Request.findByPk(request_id);

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
      request.request_id.slice(0, 26),  // ID de la transacción en Webpay
      "test-iic2173",  // Nombre del comercio (para ambiente de prueba usa "test-iic2173")
      amount,  // Monto total
      process.env.REDIRECT_URL || 'http://localhost:5173/completed-purchaseeee'  // URL de retorno (donde Webpay redirige después del pago)
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


trxRouter.post('/commit', async (ctx) => {
  const { token } = ctx.request.body;
  if (!token || token === "") {
      ctx.body = {
          message: "Transacción anulada por el usuario"
      };
      ctx.status = 200;
      return;
  }

  try {
      // Confirmar la transacción con Webpay usando el token
      const confirmedTx = await tx.commit(token);  // 'tx' es la instancia de Webpay

      if (confirmedTx.response_code !== 0) {  // Rechaza la compra si el código de respuesta es distinto de 0
          const trx = await Request.update({
              status: "rejected"  // Cambia el estado de la request a 'rejected'
          }, {
              where: { deposit_token: token },
              returning: true,
              plain: true,
          });

          ctx.body = {
              message: "Transacción ha sido rechazada",
              request: trx
          };
          ctx.status = 200;
      } else {
          // Si la transacción es exitosa, actualiza el estado de la request a 'completed'
          const trx = await Request.update({
              status: "completed"
          }, {
              where: { deposit_token: token },
              returning: true,
              plain: true,
          });

          ctx.body = {
              message: "Transacción ha sido aceptada",
              request: trx
          };
          ctx.status = 200;
      }
  } catch (error) {
      console.error('Error committing transaction:', error);
      ctx.status = 500;
      ctx.body = { message: "Error processing the transaction" };
  }
});


module.exports = trxRouter;



