const Router = require('koa-router');
const router = new Router();
const axios = require('axios');

// GET /workers
router.get('/', async (ctx) => {
    try {
        console.log('Requesting to workers backend');
        const response = await axios.get('http://producer:8000/heartbeat');
        console.log('Response from workers backend:', response.data);
        ctx.body = response.data;
        
    } catch (error) {
        console.error('Error communicating with workers backend:', error);
        ctx.status = 500;
        ctx.body = { error: 'An error occurred while communicating with the workers backend.' };
    }
});

module.exports = router;
