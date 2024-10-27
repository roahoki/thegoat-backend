const Router = require('koa-router');
const fixtures = require('./routes/fixtures.js');
const landing = require('./routes/landing.js');
const requests = require('./routes/requests.js');

const users = require('./routes/users.js');
const webpay = require('./routes/webpay.js');

const router = new Router();

router.use("/", landing.routes());
router.use("/fixtures", fixtures.routes());
router.use("/requests", requests.routes());
router.use("/users", users.routes());
router.use("/webpay", webpay.routes());

module.exports = router;