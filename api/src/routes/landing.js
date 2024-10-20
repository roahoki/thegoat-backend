const Router = require("koa-router");

const router = new Router();

router.get("/", async (ctx) => {
    ctx.body = "THE GOAT BACKEND PROBANDO";
});

module.exports = router;
