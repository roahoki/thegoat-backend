const Router = require('koa-router');
const router = new Router();
const { Job } = require('../models');

// GET /jobs
router.get('/', async (ctx) => {
    try {
        console.log('Requesting to jobs backend');
        
        const jobs = await Job.findAll();
        ctx.status = 200;
        ctx.body = { jobs };
    } catch (error) {
        console.error(error);
        ctx.status = 500;
        ctx.body = { error: 'An error occurred while retrieving jobs.' };
    }
});

// GET /jobs/:user_id
router.get('/:user_id', async (ctx) => {
    const { user_id } = ctx.params;

    // Validate input
    if (!user_id) {
        ctx.status = 400;
        ctx.body = { error: 'Missing required fields.' };
        return;
    }

    try {
        const jobs = await Job.findAll({
            where: { user_id: user_id },
            order: [['createdAt', 'DESC']]
        });

        if (jobs.length === 0) {
            ctx.status = 404;
            ctx.body = { error: 'This user does not have jobs requested' };
            return;
        }

        ctx.status = 200;
        ctx.body = { jobs };
    } catch (error) {
        console.error(error);
        ctx.status = 500;
        ctx.body = { error: 'An error occurred while retrieving the job info.' };
    }
});

// POST /jobs
router.post('/', async (ctx) => {
    const { job_id, user_id, state, result } = ctx.request.body;

    // Validate input
    if (!job_id || !user_id || !state) {
        ctx.status = 400;
        ctx.body = { error: 'Missing required fields.' };
        return;
    }

    try {
        const newJob = await Job.create({ job_id, user_id, state, result });
        ctx.status = 201;
        ctx.body = { job: newJob };
    } catch (error) {
        console.error(error);
        ctx.status = 500;
        ctx.body = { error: 'An error occurred while creating the job.' };
    }
});

// PUT /jobs/:user_id
router.put('/:user_id', async (ctx) => {
    const { user_id } = ctx.params;
    const { state, result } = ctx.request.body;

    // Validate input
    if (!user_id) {
        ctx.status = 400;
        ctx.body = { error: 'Missing the right user_id' };
        return;
    }

    // Validate input
    if (!state) {
        ctx.status = 400;
        ctx.body = { error: 'Missing required fields: state' };
        return;
    }

    try {
        const job = await Job.findOne({
            where: { user_id: user_id },
            order: [['createdAt', 'DESC']]
        });

        if (!job) {
            ctx.status = 404;
            ctx.body = { error: 'Search by user_id result: Job not found.' };
            return;
        }

        console.log('Job found:', job);
        job.state = state;
        job.result = result;
        await job.save();

        ctx.status = 200;
        ctx.body = { job };
    } catch (error) {
        console.error(error);
        ctx.status = 500;
        ctx.body = { error: 'An error occurred while updating the job.' };
    }
});



// DELETE /jobs/:user_id
router.delete('/:user_id', async (ctx) => {
    const { user_id } = ctx.params;

    // Validate input
    if (!user_id) {
        ctx.status = 400;
        ctx.body = { error: 'Missing required fields.' };
        return;
    }

    try {
        const job = await Job.findOne({
            where: { user_id: user_id },
            order: [['createdAt', 'DESC']]
        });

        if (!job) {
            ctx.status = 404;
            ctx.body = { error: 'Job not found.' };
            return;
        }

        await job.destroy();
        ctx.status = 200;
        ctx.body = { message: 'Job deleted successfully.' };
    } catch (error) {
        console.error(error);
        ctx.status = 500;
        ctx.body = { error: 'An error occurred while deleting the job.' };
    }
});

module.exports = router;