// app.js
const Koa = require('koa');
const KoaLogger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const router = require('./routes.js');
const orm = require('./models');
const cors = require('@koa/cors');

const app = new Koa();

app.context.orm = orm;

app.use(KoaLogger());

// Use bodyParser middleware
app.use(bodyParser());

// app.use(async (ctx, next) => {
//   ctx.set('Access-Control-Allow-Origin', 'http://localhost:5173');
//   ctx.set('Access-Control-Allow-Credentials', 'true');
//   ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   await next();
// });
// =======
// Use CORS middleware
app.use(cors());


app.use(router.routes());

// Handle unmatched routes
app.use(async (ctx) => {
  ctx.body = "Endpoint no habilitado";
});

module.exports = app;

