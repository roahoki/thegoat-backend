const Router = require('koa-router');
const fixtures = require('./routes/fixtures.js');
const landing = require('./routes/landing.js');
const requests = require('./routes/requests.js');
const usuario = require('./models/usuario.js');
const users = require('./routes/users.js');
const workers = require('./routes/workers.js');
const jobs = require('./routes/jobs.js');

const router = new Router();

router.use("/", landing.routes());
router.use("/fixtures", fixtures.routes());
router.use("/requests", requests.routes());
router.use("/users", users.routes());
router.use("/workers", workers.routes());
router.use("/jobs", jobs.routes());

module.exports = router;