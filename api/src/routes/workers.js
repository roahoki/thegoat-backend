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

// POST /workers 
// Esta función se encarga de hacer un request al backend de workers para sumar un número.
// También se encarga de guardar el job_id en la base de datos.
// router.post('/sum', async (ctx) => {
//     try {
//         const { user_id, number } = ctx.request.body;

//         if (!user_id || !number) {
//             ctx.status = 400;
//             ctx.body = { error: 'Missing required fields: user_id or number' };
//             return;
//         }

//         console.log('\n\n\n\n\n\nREQUESTING SUM TO WORKERS BACKEND');

//         const requestBody = { number: number };
//         const response = await axios.post('http://producer:8000/sum', requestBody);


//         console.log('Response from workers backend:', response.data.job_id);
//         const job_id = response.data.job_id;

//         // agregar una fila a la tabla jobs
//         const job = await Job.create({ job_id, user_id });
//         console.log('\n\n\n\n))))))))))))))))))))))))))))))))))))))))))))))))))))))Job created:');
//         console.log(job);
//         ctx.body = response.data;

//     } catch (error) {
//         console.error('Error communicating with workers backend:', error);
//         ctx.status = 500;
//         ctx.body = { error: 'An error occurred while communicating with the workers backend.' };
//     }
// });



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
        console.log(`\n\n\n\n\n\n\n\n#########   R E C O M M E D A T I O N - W O R K S - E N D P O I N T :  \n${ctx.request.body} \n \n ############################################## \n\n\n\n\n\n\n\n `);
        if (!user_id) {
            ctx.status = 400;
            ctx.body = { error: 'Missing required fields: user_id' };
            return;
        }
        // const requests = await Request.findAll({
        //     where: { 
        //         user_id: user_id,
        //         status: { [Op.or]: ["won", "lost"] }
        //       }
        //     });
        const requests = [
                {
                    "request_id": "a09f4931-17bb-442c-b7ad-a14e6f235263",
                    "group_id": "15",
                    "fixture_id": 1208115,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "Leicester",
                    "deposit_token": "",
                    "datetime": "2024-10-28T22:43:04.718Z",
                    "quantity": 3,
                    "seller": 0,
                    "user_id": 2,
                    "status": "won",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-28T22:43:05.107Z",
                    "updatedAt": "2024-10-28T22:43:05.447Z"
                },
                {
                    "request_id": "49ab0ae8-355b-4b4b-9b8d-4b871554d4b5",
                    "group_id": "15",
                    "fixture_id": 1208118,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "Arsenal",
                    "deposit_token": "",
                    "datetime": "2024-10-28T18:20:11.639Z",
                    "quantity": 1,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-28T18:20:11.935Z",
                    "updatedAt": "2024-10-28T18:20:11.935Z"
                },
                {
                    "request_id": "ecdc6692-257e-4057-b40d-e1f30b4b8035",
                    "group_id": "15",
                    "fixture_id": 1208117,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-03",
                    "result": "Manchester United",
                    "deposit_token": "",
                    "datetime": "2024-10-28T18:24:50.637Z",
                    "quantity": 1,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-28T18:24:51.008Z",
                    "updatedAt": "2024-10-28T18:24:51.008Z"
                },
                {
                    "request_id": "4f5e6c47-0414-47ae-a0ed-82a180d74ad5",
                    "group_id": "15",
                    "fixture_id": 1208118,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "Newcastle",
                    "deposit_token": "01ab66db373a53b74fc907263b9afdc6bac2a76732ab8e99a05396e960e377a2",
                    "datetime": "2024-10-28T18:25:35.956Z",
                    "quantity": 3,
                    "seller": 0,
                    "user_id": 2,
                    "status": "won",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": false,
                    "createdAt": "2024-10-28T18:25:36.243Z",
                    "updatedAt": "2024-10-28T18:25:36.608Z"
                },
                {
                    "request_id": "4746ff4f-5be6-40c3-bac5-b4db0ce0308b",
                    "group_id": "15",
                    "fixture_id": 1208118,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "Newcastle",
                    "deposit_token": "",
                    "datetime": "2024-10-28T18:25:48.100Z",
                    "quantity": 3,
                    "seller": 0,
                    "user_id": 2,
                    "status": "won",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-28T18:25:48.392Z",
                    "updatedAt": "2024-10-28T18:25:48.728Z"
                },
                {
                    "request_id": "3f6b7d82-a0d0-4382-a574-733fae6d1755",
                    "group_id": "15",
                    "fixture_id": 1208119,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "Nottingham Forest",
                    "deposit_token": "",
                    "datetime": "2024-10-28T18:30:11.011Z",
                    "quantity": 1,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-28T18:30:11.296Z",
                    "updatedAt": "2024-10-28T18:30:11.296Z"
                },
                {
                    "request_id": "03254e25-8712-43a4-aceb-0d3c4168e9bd",
                    "group_id": "15",
                    "fixture_id": 1208118,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "Arsenal",
                    "deposit_token": "",
                    "datetime": "2024-10-28T18:31:20.510Z",
                    "quantity": 1,
                    "seller": 0,
                    "user_id": 2,
                    "status": "won",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-28T18:31:20.860Z",
                    "updatedAt": "2024-10-28T18:31:21.448Z"
                },
                {
                    "request_id": "2a798ae3-b026-4954-8edb-f74e0a5a40b9",
                    "group_id": "15",
                    "fixture_id": 1208598,
                    "league_name": "La Liga",
                    "round": "Regular Season - 12",
                    "date": "2024-11-01",
                    "result": "Mallorca",
                    "deposit_token": "",
                    "datetime": "2024-10-28T18:47:56.988Z",
                    "quantity": 1,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-28T18:47:57.348Z",
                    "updatedAt": "2024-10-28T18:47:57.348Z"
                },
                {
                    "request_id": "363d117e-dc50-44a5-b344-d00dcb4d5adf",
                    "group_id": "15",
                    "fixture_id": 1208598,
                    "league_name": "La Liga",
                    "round": "Regular Season - 12",
                    "date": "2024-11-01",
                    "result": "Mallorca",
                    "deposit_token": "",
                    "datetime": "2024-10-28T18:48:57.424Z",
                    "quantity": 1,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-28T18:48:57.711Z",
                    "updatedAt": "2024-10-28T18:48:57.711Z"
                },
                {
                    "request_id": "a3d01932-73ea-4d96-bfb0-2231481d42b3",
                    "group_id": "15",
                    "fixture_id": 1208598,
                    "league_name": "La Liga",
                    "round": "Regular Season - 12",
                    "date": "2024-11-01",
                    "result": "Alaves",
                    "deposit_token": "",
                    "datetime": "2024-10-28T18:54:20.480Z",
                    "quantity": 1,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-28T18:54:20.797Z",
                    "updatedAt": "2024-10-28T18:54:20.797Z"
                },
                {
                    "request_id": "67ac8af7-d849-47bb-a36f-d31b0cff7fac",
                    "group_id": "15",
                    "fixture_id": 1208601,
                    "league_name": "La Liga",
                    "round": "Regular Season - 12",
                    "date": "2024-11-03",
                    "result": "Real Sociedad",
                    "deposit_token": "",
                    "datetime": "2024-10-28T18:59:53.775Z",
                    "quantity": 2,
                    "seller": 0,
                    "user_id": 2,
                    "status": "won",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-28T18:59:54.145Z",
                    "updatedAt": "2024-10-28T18:59:54.584Z"
                },
                {
                    "request_id": "74612dc2-7e5c-4e25-98c2-50bece9f8e75",
                    "group_id": "15",
                    "fixture_id": 1208585,
                    "league_name": "La Liga",
                    "round": "Regular Season - 12",
                    "date": "2024-10-28",
                    "result": "Athletic Club",
                    "deposit_token": "",
                    "datetime": "2024-10-28T19:02:16.223Z",
                    "quantity": 1,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-28T19:02:16.536Z",
                    "updatedAt": "2024-10-28T19:02:16.536Z"
                },
                {
                    "request_id": "b983df08-e68f-486a-90b1-0d33b104ebf3",
                    "group_id": "15",
                    "fixture_id": 1208601,
                    "league_name": "La Liga",
                    "round": "Regular Season - 12",
                    "date": "2024-11-03",
                    "result": "Real Sociedad",
                    "deposit_token": "",
                    "datetime": "2024-10-28T19:02:46.360Z",
                    "quantity": 1,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-28T19:02:46.657Z",
                    "updatedAt": "2024-10-28T19:02:46.657Z"
                },
                {
                    "request_id": "6c166674-f102-4392-8a5b-3ea6e8604030",
                    "group_id": "15",
                    "fixture_id": 1208601,
                    "league_name": "La Liga",
                    "round": "Regular Season - 12",
                    "date": "2024-11-03",
                    "result": "Sevilla",
                    "deposit_token": "",
                    "datetime": "2024-10-28T19:03:02.764Z",
                    "quantity": 1,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-28T19:03:03.050Z",
                    "updatedAt": "2024-10-28T19:03:03.050Z"
                },
                {
                    "request_id": "6cf1fee0-bf38-412f-93d5-e50ac9ff2101",
                    "group_id": "15",
                    "fixture_id": 1208118,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "Newcastle",
                    "deposit_token": "",
                    "datetime": "2024-10-28T22:28:39.238Z",
                    "quantity": 1,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-28T22:28:39.557Z",
                    "updatedAt": "2024-10-28T22:28:39.557Z"
                },
                {
                    "request_id": "144dc307-d65f-4872-b137-bf9035b9d96e",
                    "group_id": "15",
                    "fixture_id": 1208118,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "Newcastle",
                    "deposit_token": "",
                    "datetime": "2024-10-28T22:30:28.634Z",
                    "quantity": 1,
                    "seller": 0,
                    "user_id": 2,
                    "status": "won",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-28T22:30:28.920Z",
                    "updatedAt": "2024-10-28T22:30:29.241Z"
                },
                {
                    "request_id": "7f450d16-be2a-4cdf-a0e2-9cb6bfca68c4",
                    "group_id": "15",
                    "fixture_id": 1208117,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-03",
                    "result": "Chelsea",
                    "deposit_token": "",
                    "datetime": "2024-10-28T22:54:40.299Z",
                    "quantity": 3,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-28T22:54:40.506Z",
                    "updatedAt": "2024-10-28T22:54:40.506Z"
                },
                {
                    "request_id": "a183389d-034f-4d03-b6e6-eba08bd840b7",
                    "group_id": "15",
                    "fixture_id": 1208117,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-03",
                    "result": "Chelsea",
                    "deposit_token": "",
                    "datetime": "2024-10-28T22:56:20.379Z",
                    "quantity": 2,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-28T22:56:20.679Z",
                    "updatedAt": "2024-10-28T22:56:20.679Z"
                },
                {
                    "request_id": "6b753cd2-ee4a-4530-8eb3-33759f3b6780",
                    "group_id": "15",
                    "fixture_id": 1208118,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "Newcastle",
                    "deposit_token": "",
                    "datetime": "2024-10-28T22:56:30.760Z",
                    "quantity": 3,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-28T22:56:31.041Z",
                    "updatedAt": "2024-10-28T22:56:31.041Z"
                },
                {
                    "request_id": "13d83a76-f7a3-42bf-9829-b12b4d86a0e4",
                    "group_id": "15",
                    "fixture_id": 1208119,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "West Ham",
                    "deposit_token": "",
                    "datetime": "2024-10-28T22:56:36.784Z",
                    "quantity": 4,
                    "seller": 0,
                    "user_id": 2,
                    "status": "won",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-28T22:56:37.078Z",
                    "updatedAt": "2024-10-28T22:56:37.413Z"
                },
                {
                    "request_id": "6ec9a2a2-c611-446a-99f0-04597f9cbaa3",
                    "group_id": "15",
                    "fixture_id": 1208121,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-03",
                    "result": "Aston Villa",
                    "deposit_token": "",
                    "datetime": "2024-10-28T22:58:16.182Z",
                    "quantity": 3,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-28T22:58:16.485Z",
                    "updatedAt": "2024-10-28T22:58:16.485Z"
                },
                {
                    "request_id": "8450e771-eb4f-48f1-b3c5-38f9434bd1e0",
                    "group_id": "15",
                    "fixture_id": 1208122,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "Wolves",
                    "deposit_token": "",
                    "datetime": "2024-10-28T22:58:26.194Z",
                    "quantity": 5,
                    "seller": 0,
                    "user_id": 2,
                    "status": "won",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-28T22:58:26.541Z",
                    "updatedAt": "2024-10-28T22:58:26.885Z"
                },
                {
                    "request_id": "cea12070-df0d-41af-8e77-1e6fa168c3ef",
                    "group_id": "15",
                    "fixture_id": 1208119,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "Nottingham Forest",
                    "deposit_token": "",
                    "datetime": "2024-10-29T12:10:11.613Z",
                    "quantity": 2,
                    "seller": 0,
                    "user_id": 2,
                    "status": "won",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-29T12:10:11.911Z",
                    "updatedAt": "2024-10-29T12:10:12.232Z"
                },
                {
                    "request_id": "06c68232-e011-4653-9dc6-b1a5935b2ac9",
                    "group_id": "15",
                    "fixture_id": 1208119,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "Nottingham Forest",
                    "deposit_token": "",
                    "datetime": "2024-10-29T12:35:49.845Z",
                    "quantity": 2,
                    "seller": 0,
                    "user_id": 2,
                    "status": "won",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-29T12:35:50.221Z",
                    "updatedAt": "2024-10-29T12:35:50.557Z"
                },
                {
                    "request_id": "cf8e8f45-72f9-4688-afb0-4fbe0f5bfd14",
                    "group_id": "15",
                    "fixture_id": 1208119,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "Nottingham Forest",
                    "deposit_token": "",
                    "datetime": "2024-10-29T12:37:27.237Z",
                    "quantity": 2,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-29T12:37:27.600Z",
                    "updatedAt": "2024-10-29T12:37:27.600Z"
                },
                {
                    "request_id": "450a8f64-2ae7-4e93-97ee-015ecb024b5a",
                    "group_id": "15",
                    "fixture_id": 1208118,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "Newcastle",
                    "deposit_token": "",
                    "datetime": "2024-10-29T12:37:52.657Z",
                    "quantity": 1,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-29T12:37:52.949Z",
                    "updatedAt": "2024-10-29T12:37:52.949Z"
                },
                {
                    "request_id": "fb3291de-afdb-456c-9ebf-3e0c86397106",
                    "group_id": "15",
                    "fixture_id": 1208118,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "Arsenal",
                    "deposit_token": "",
                    "datetime": "2024-10-29T12:37:58.850Z",
                    "quantity": 2,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-29T12:37:59.191Z",
                    "updatedAt": "2024-10-29T12:37:59.191Z"
                },
                {
                    "request_id": "0088e73d-4ca6-4804-a2bf-8be1f24aa67c",
                    "group_id": "15",
                    "fixture_id": 1208120,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "Everton",
                    "deposit_token": "",
                    "datetime": "2024-10-29T12:38:04.720Z",
                    "quantity": 3,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-29T12:38:05.067Z",
                    "updatedAt": "2024-10-29T12:38:05.067Z"
                },
                {
                    "request_id": "aae5736f-ea76-4d9a-a0f7-40ffa20239b3",
                    "group_id": "15",
                    "fixture_id": 1208120,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "Southampton",
                    "deposit_token": "",
                    "datetime": "2024-10-29T12:39:18.096Z",
                    "quantity": 2,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-29T12:39:18.427Z",
                    "updatedAt": "2024-10-29T12:39:18.427Z"
                },
                {
                    "request_id": "52a8e6cf-20d5-4cf5-940a-f430b2d5ce11",
                    "group_id": "15",
                    "fixture_id": 1208120,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "Everton",
                    "deposit_token": "",
                    "datetime": "2024-10-29T12:39:23.333Z",
                    "quantity": 3,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-29T12:39:23.487Z",
                    "updatedAt": "2024-10-29T12:39:23.487Z"
                },
                {
                    "request_id": "093bb35d-12b2-422b-963a-9ed4bf1257c7",
                    "group_id": "15",
                    "fixture_id": 1208118,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "Arsenal",
                    "deposit_token": "",
                    "datetime": "2024-10-29T12:39:33.187Z",
                    "quantity": 1,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-29T12:39:33.466Z",
                    "updatedAt": "2024-10-29T12:39:33.466Z"
                },
                {
                    "request_id": "04d3e56b-5951-4b70-b60c-3e9dad0efe96",
                    "group_id": "15",
                    "fixture_id": 1208119,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "Nottingham Forest",
                    "deposit_token": "",
                    "datetime": "2024-10-29T12:42:52.369Z",
                    "quantity": 2,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-29T12:42:52.736Z",
                    "updatedAt": "2024-10-29T12:42:52.736Z"
                },
                {
                    "request_id": "88b54d65-4568-42d8-8770-b2cbd4f504fb",
                    "group_id": "15",
                    "fixture_id": 1208119,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "West Ham",
                    "deposit_token": "",
                    "datetime": "2024-10-29T12:44:31.150Z",
                    "quantity": 1,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-29T12:44:31.526Z",
                    "updatedAt": "2024-10-29T12:44:31.526Z"
                },
                {
                    "request_id": "03378888-a2db-4a8b-8387-5996dc100c48",
                    "group_id": "15",
                    "fixture_id": 1208121,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-03",
                    "result": "Aston Villa",
                    "deposit_token": "",
                    "datetime": "2024-10-29T12:49:08.148Z",
                    "quantity": 3,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-29T12:49:08.475Z",
                    "updatedAt": "2024-10-29T12:49:08.475Z"
                },
                {
                    "request_id": "f95a4f7b-2543-4931-99f5-af9aed0e5ee7",
                    "group_id": "15",
                    "fixture_id": 1208115,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "Leicester",
                    "deposit_token": "",
                    "datetime": "2024-10-29T12:57:51.310Z",
                    "quantity": 2,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-29T12:57:51.638Z",
                    "updatedAt": "2024-10-29T12:57:51.638Z"
                },
                {
                    "request_id": "798e5f09-8027-4f1f-a724-51c09defdb2c",
                    "group_id": "15",
                    "fixture_id": 1208115,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "Leicester",
                    "deposit_token": "",
                    "datetime": "2024-10-29T12:58:46.381Z",
                    "quantity": 4,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-29T12:58:46.666Z",
                    "updatedAt": "2024-10-29T12:58:46.666Z"
                },
                {
                    "request_id": "5d6ec72d-f182-401f-a540-b851e9eba2de",
                    "group_id": "15",
                    "fixture_id": 1208119,
                    "league_name": "Premier League",
                    "round": "Regular Season - 10",
                    "date": "2024-11-02",
                    "result": "West Ham",
                    "deposit_token": "",
                    "datetime": "2024-10-29T13:01:52.408Z",
                    "quantity": 2,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-29T13:01:52.792Z",
                    "updatedAt": "2024-10-29T13:01:52.792Z"
                },
                {
                    "request_id": "b4ca2a8f-de0e-4579-9b4d-4bbf321b4d9f",
                    "group_id": "15",
                    "fixture_id": 1212921,
                    "league_name": "La Liga",
                    "round": "Regular Season - 12",
                    "date": "2024-11-03",
                    "result": "Barcelona",
                    "deposit_token": "",
                    "datetime": "2024-10-29T13:02:37.756Z",
                    "quantity": 5,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-29T13:02:38.108Z",
                    "updatedAt": "2024-10-29T13:02:38.108Z"
                },
                {
                    "request_id": "511f4b36-b618-47ca-a444-ae24869bfe73",
                    "group_id": "15",
                    "fixture_id": 1208594,
                    "league_name": "La Liga",
                    "round": "Regular Season - 12",
                    "date": "2024-11-03",
                    "result": "Las Palmas",
                    "deposit_token": "",
                    "datetime": "2024-10-29T13:03:02.482Z",
                    "quantity": 1,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-29T13:03:02.829Z",
                    "updatedAt": "2024-10-29T13:03:02.829Z"
                },
                {
                    "request_id": "ab58d05f-5af0-47ba-a8ed-9a0a4bfb807d",
                    "group_id": "15",
                    "fixture_id": 1212921,
                    "league_name": "La Liga",
                    "round": "Regular Season - 12",
                    "date": "2024-11-03",
                    "result": "Espanyol",
                    "deposit_token": "",
                    "datetime": "2024-10-29T13:03:07.053Z",
                    "quantity": 1,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-29T13:03:07.198Z",
                    "updatedAt": "2024-10-29T13:03:07.198Z"
                },
                {
                    "request_id": "4afa97bd-e784-4908-8712-867ef4ea2db8",
                    "group_id": "15",
                    "fixture_id": 1208597,
                    "league_name": "La Liga",
                    "round": "Regular Season - 12",
                    "date": "2024-11-02",
                    "result": "Valladolid",
                    "deposit_token": "",
                    "datetime": "2024-10-29T13:03:12.575Z",
                    "quantity": 1,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-29T13:03:12.865Z",
                    "updatedAt": "2024-10-29T13:03:12.865Z"
                },
                {
                    "request_id": "48c40121-911a-4519-87e7-76b0100c0074",
                    "group_id": "15",
                    "fixture_id": 1208598,
                    "league_name": "La Liga",
                    "round": "Regular Season - 12",
                    "date": "2024-11-01",
                    "result": "Mallorca",
                    "deposit_token": "",
                    "datetime": "2024-10-29T13:05:55.083Z",
                    "quantity": 1,
                    "seller": 0,
                    "user_id": 2,
                    "status": "won",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-29T13:05:55.377Z",
                    "updatedAt": "2024-10-29T13:05:55.803Z"
                },
                {
                    "request_id": "236ba974-5db4-4203-af97-318a53804f04",
                    "group_id": "15",
                    "fixture_id": 1212921,
                    "league_name": "La Liga",
                    "round": "Regular Season - 12",
                    "date": "2024-11-03",
                    "result": "Espanyol",
                    "deposit_token": "",
                    "datetime": "2024-10-29T13:07:08.662Z",
                    "quantity": 1,
                    "seller": 0,
                    "user_id": 2,
                    "status": "lost",
                    "ip_address": "::ffff:172.24.0.1",
                    "location": "unknown, unknown, unknown",
                    "wallet": true,
                    "createdAt": "2024-10-29T13:07:08.944Z",
                    "updatedAt": "2024-10-29T13:07:08.944Z"
                }
            ]
        
        const fixtures = await Fixture.findAll({
                        where: {
                            status_short: {
                                [Op.ne]: 'NS'
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
        console.log(`\n \n \n \n \n \n 'logro encontrar? REQUEST BODY REQUEST BODY: '${requestBody} \n \n \n \n \n \n`);
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
