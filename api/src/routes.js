const Router = require('koa-router');
const fixtures = require('./routes/fixtures.js');
const landing = require('./routes/landing.js');
const requests = require('./routes/requests.js');

const users = require('./routes/users.js');
const webpay = require('./routes/webpay.js');
const workers = require('./routes/workers.js');
const jobs = require('./routes/jobs.js');
const admin = require('./routes/admin.js');
const auctions = require('./routes/auctions.js')

const router = new Router();

router.use("/", landing.routes());
router.use("/fixtures", fixtures.routes());
router.use("/requests", requests.routes());
router.use("/users", users.routes());
router.use("/webpay", webpay.routes());
router.use("/workers", workers.routes());
router.use("/jobs", jobs.routes());
router.use("/admin", admin.routes());
router.use("/auctions", auctions.routes());


module.exports = router;