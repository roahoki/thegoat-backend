const Router = require('koa-router');
const fixtures = require('./routes/fixtures.js');
const landing = require('./routes/landing.js');
const requests = require('./routes/requests.js');
const usuario = require('./models/usuario.js');
const users = require('./routes/users.js');

const router = new Router();

router.use("/", landing.routes());
router.use("/fixtures", fixtures.routes());
router.use("/requests", requests.routes());
router.use("/users", users.routes());

module.exports = router;