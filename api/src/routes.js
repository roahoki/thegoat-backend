const Router = require('koa-router');
const fixtures = require('./routes/fixtures.js');
const landing = require('./routes/landing.js');

const router = new Router();

router.use("/", landing.routes());
router.use("/fixtures", fixtures.routes());


module.exports = router;