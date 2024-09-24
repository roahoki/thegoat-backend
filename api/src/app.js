const Koa = require('koa');
const { koaBody } = require('koa-body');
const KoaLogger = require('koa-logger');
const router = require('./routes.js');
const orm = require('./models');

const app = new Koa();

app.context.orm = orm;

app.use(KoaLogger());
app.use(koaBody());

app.use(router.routes());

app.use(async (ctx) => {
	ctx.body = "Endopoint no habilitado";
}
);

module.exports = app;
