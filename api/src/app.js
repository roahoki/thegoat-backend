// app.js
const Koa = require('koa');
const KoaLogger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const router = require('./routes.js');
const orm = require('./models');
// const cors = require('@koa/cors'); // manejo desde la api gateway

const app = new Koa();

app.context.orm = orm;

app.use(KoaLogger());

// Usar cors middleware
// app.use(cors()); // manejo desde la api gateway

// Use bodyParser middleware
app.use(bodyParser());

app.use(router.routes());

// Handle unmatched routes
app.use(async (ctx) => {
  ctx.body = "Endpoint no habilitado";
});

module.exports = app;
