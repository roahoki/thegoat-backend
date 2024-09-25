const Router = require('koa-router');
const fixtures = require('./routes/fixtures.js');
const landing = require('./routes/landing.js');
const requests = require('./routes/requests.js');

const router = new Router();

router.use("/", landing.routes());
router.use("/fixtures", fixtures.routes());
router.use("/requests", requests.routes());

module.exports = router;