const Router = require('koa-router');
const router = new Router();
const axios = require('axios');
const { Job } = require('../models');

// GET /workers
// Esta función se encarga de hacer un request al backend de workers para verificar que esté funcionando.
router.get('/heartbeat', async (ctx) => {
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

// POST /workers 
// Esta función se encarga de hacer un request al backend de workers para sumar un número.
// También se encarga de guardar el job_id en la base de datos.
router.post('/sum', async (ctx) => {
    try {
        const { user_id, number } = ctx.request.body;

        if (!user_id || !number) {
            ctx.status = 400;
            ctx.body = { error: 'Missing required fields: user_id or number' };
            return;
        }

        console.log('\n\n\n\n\n\nREQUESTING SUM TO WORKERS BACKEND');

        const requestBody = { number: number };
        const response = await axios.post('http://producer:8000/sum', requestBody);


        console.log('Response from workers backend:', response.data.job_id);
        const job_id = response.data.job_id;

        // agregar una fila a la tabla jobs
        const job = await Job.create({ job_id, user_id });
        console.log('\n\n\n\n))))))))))))))))))))))))))))))))))))))))))))))))))))))Job created:');
        ctx.body = response.data;

    } catch (error) {
        console.error('Error communicating with workers backend:', error);
        ctx.status = 500;
        ctx.body = { error: 'An error occurred while communicating with the workers backend.' };
    }
});

// GET /workers/:user_id
// Esta función se encarga de buscar el resultado de un job en la base de datos, por lo que primero se
// busca el job más reciente con el user_id dado, luego se revisa si state es true, si es true se responde
// con el resultado del job, si es false se consulta al workers backend por el estado del job y se  
// actualiza el estado del job en la base de datos, si el estado es true se responde con el resultado del job, si el estado es false se responde con un mensaje de que el job está en proceso.
router.get('/sum/:user_id', async (ctx) => {
    try {
        const { user_id } = ctx.params;

        if (!user_id) {
            ctx.status = 400;
            ctx.body = { error: 'Missing required fields: user_id' };
            return;
        }

        // Recuperar el job más reciente sin importar su estado
        let job = await Job.findOne({ where: { user_id }, order: [['createdAt', 'DESC']] });

        if (!job) {
            ctx.status = 404;
            ctx.body = { error: 'No job found for the given user_id' };
            return;
        }

        // Verificar si el estado del job es true
        if (job.state) {
            ctx.body = { result: job.result };
        } else {
            // Consultar al backend de workers por el estado del job
            const jobStatus = await checkJobStatusFromBackend(job.job_id);

            // Actualizar el estado del job en la base de datos
            job.state = jobStatus.state ? true : false;
            job.result = jobStatus.result;
            await job.save();

            if (jobStatus.state) {
                ctx.body = { result: job.result };
            } else {
                ctx.body = { message: 'Job is still in process' };
            }
        }

    } catch (error) {
        console.error('Error retrieving job from database:', error);
        ctx.status = 500;
        ctx.body = { error: 'An error occurred while retrieving the job from the database.' };
    }
});

// Función para consultar el estado del job en el backend de workers
async function checkJobStatusFromBackend(jobId) {
    try {
        const response = await axios.get(`http://producer:8000/sum/${jobId}`);
        const { ready, result } = response.data;
        console.log('\n\n\n\n\n\n\n\n#######################################################Response from workers backend:', response.data);
        

        if (ready) {
            return { state: true, result: result };
        } else {
            return { state: false};
        }
    } catch (error) {
        console.error('Error checking job status from backend:', error);
        throw new Error('Error checking job status from backend');
    }
}


// POST /workers/recommendation
// Esta función se encarga de hacer un request al backend de workers para obtener una recomendación.
router.post('/recommendation', async (ctx) => {
    pass;
});


// GET /workers/recommendation/:user_id
// Esta función se encarga buscar el resultado de un job de recomendación en la base de datos
router.get('/recommendation/:user_id', async (ctx) => {
    pass;
});



module.exports = router;
