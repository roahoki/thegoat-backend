const Router = require('koa-router');
const router = new Router();
const axios = require('axios');
const { Job, Request, Fixture, Odd, Team, League } = require('../models');
const { Op } = require("sequelize");

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
            const subRoute = 'sum'
            const jobStatus = await checkJobStatusFromBackend(job.job_id, subRoute);
            
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
async function checkJobStatusFromBackend(jobId, subRoute) {
    try {
        const response = await axios.get(`http://producer:8000/${subRoute}/${jobId}`);
        const { ready, result } = response.data;
       

        if (ready == true) {
            return { ready: true, result: result };
        } else {
            return { ready: false};
        }    
    } catch (error) {
        console.error('Error checking job status from backend:', error);
        throw new Error('Error checking job status from backend');
    }    
}    

router.post('/recommendation', async (ctx) => {
    try {
        const { user_id } = ctx.request.body;
        if (!user_id) {
            ctx.status = 400;
            ctx.body = { error: 'Missing required fields: user_id' };
            return;
        }
        const requests = await Request.findAll({
            where: { 
                user_id: user_id,
                status: { [Op.or]: ["won", "lost"] }
              }
            });
        
        
        const fixtures = await Fixture.findAll({
                        where: {
                            status_short: {
                                [Op.eq]: 'NS'
                            }
                        },
                        include: [
                            { model: Team, as: "homeTeam" },
                            { model: Team, as: "awayTeam" },
                            { model: League, as: "league" },
                            { model: Odd, as: "odds" },
                        ],
                        order: [['updatedAt', 'DESC']],
                    });

        const fixtureIds = requests.map(request => request['fixture_id']);
        const old_fixtures = await Fixture.findAll({
            where: {
                id: { [Op.in]: fixtureIds }
            },
            include: [
                { model: Team, as: "homeTeam" },
                { model: Team, as: "awayTeam" },
                { model: League, as: "league" },
                { model: Odd, as: "odds" },
            ],
            order: [['updatedAt', 'DESC']],
        });
        
        const requestBody = { bets_results: requests, upcoming_fixtures: fixtures, old_fixtures: old_fixtures };
        console.log(requestBody,` EL REQUEST BODY BODY \n \n \n \n \n \n`);
        const response = await axios.post('http://producer:8000/recommendation', requestBody);


        console.log('Response from workers backend:', response.data.job_id);
        const job_id = response.data.job_id;

        // agregar una fila a la tabla jobs
        const job = await Job.create({ job_id, user_id });
        console.log('\n\n\n\n))))))))))))))))))))))))))))))))))))))))))))))))))))))Job created:');
        console.log(job);
        ctx.body = response.data;

    } catch (error) {
        console.error('Error communicating with workers backend:', error);
        ctx.status = 500;
        ctx.body = { error: 'An error occurred while communicating with the workers backend.' };
    }    
});    

// GET /workers/recommendation/:user_id
// Esta función se encarga buscar el resultado de un job de recomendación en la base de datos
router.get('/recommendation/:user_id', async (ctx) => {
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

        
        console.log(`\n \n \n \n \n ${job.state} RESULTADO JOB GET ${ job.result}\n \n \n \n \n`);
        // Verificar si el estado del job es true
        if (job.state == true) {
           
            ctx.body = { result: job.result };
        } else {
            // Consultar al backend de workers por el estado del job
            const subRoute = 'recommendation'
            const jobStatus = await checkJobStatusFromBackend(job.job_id, subRoute);
            console.log(jobStatus.ready, jobStatus.result);
            if (jobStatus.ready == true) {
                // Actualizar el estado y resultado del job en la base de datos
                job.state = true;
                job.result = JSON.stringify(jobStatus.result); // Serialize result to JSON
                await job.save();
                ctx.body = { result: jobStatus.result }; // Return the actual result
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





module.exports = router;
