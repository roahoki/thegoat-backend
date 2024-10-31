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
        console.log(`\n\n\n\n\n\n\n\n#########   R E C O M M E D A T I O N - W O R K S - E N D P O I N T :  \n${ctx.request.body} \n \n ############################################## \n\n\n\n\n\n\n\n `);
        if (!user_id) {
            ctx.status = 400;
            ctx.body = { error: 'Missing required fields: user_id' };
            return;
        }
        // const requests = await Request.findAll({
        //     where: { 
        //         user_id: user_id,
        //         status: { [Op.or]: ["won", "won"] }
        //       }
        //     });
        const requests = [
            {
                "request_id": "b0a6bcf8-48d4-40e5-8996-819ab51fb8e6",
                "group_id": "15",
                "fixture_id": 1208118,
                "league_name": "Premier League",
                "round": "Regular Season - 10",
                "date": "2024-11-02",
                "result": "Arsenal",
                "deposit_token": "",
                "datetime": "2024-10-31T15:11:59.035Z",
                "quantity": 2,
                "seller": 0,
                "user_id": 2,
                "status": "won",
                "ip_address": "::ffff:172.19.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T15:11:59.364Z",
                "updatedAt": "2024-10-31T15:12:02.123Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Newcastle",
                "away_team_name": "Arsenal"
            },
            {
                "request_id": "5ff51f2b-3c6f-4f97-ac56-cd200015101b",
                "group_id": "15",
                "fixture_id": 1208120,
                "league_name": "Premier League",
                "round": "Regular Season - 10",
                "date": "2024-11-02",
                "result": "Southampton",
                "deposit_token": "",
                "datetime": "2024-10-31T15:14:38.456Z",
                "quantity": 3,
                "seller": 0,
                "user_id": 2,
                "status": "won",
                "ip_address": "::ffff:172.19.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T15:14:38.747Z",
                "updatedAt": "2024-10-31T15:14:40.676Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Southampton",
                "away_team_name": "Everton"
            },
            {
                "request_id": "64554310-2777-44fe-9daf-811217f45a4c",
                "group_id": "15",
                "fixture_id": 1208118,
                "league_name": "Premier League",
                "round": "Round 6",
                "date": "2024-09-30",
                "result": "Team A",
                "deposit_token": "",
                "datetime": "YYYY-MM-ddThh:mm:ss UTC",
                "quantity": 2,
                "seller": 0,
                "user_id": 2,
                "status": "lost",
                "ip_address": "::ffff:172.19.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T15:16:07.805Z",
                "updatedAt": "2024-10-31T15:16:07.805Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Newcastle",
                "away_team_name": "Arsenal"
            },
            {
                "request_id": "81857b5c-1827-4b9e-8297-8a556d8e5afe",
                "group_id": "15",
                "fixture_id": 1208118,
                "league_name": "Premier League",
                "round": "Regular Season - 10",
                "date": "2024-11-02",
                "result": "Newcastle",
                "deposit_token": "",
                "datetime": "2024-10-31T15:24:19.839Z",
                "quantity": 1,
                "seller": 0,
                "user_id": 2,
                "status": "won",
                "ip_address": "::ffff:172.19.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T15:24:20.196Z",
                "updatedAt": "2024-10-31T15:24:20.196Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Newcastle",
                "away_team_name": "Arsenal"
            },
            {
                "request_id": "c9723397-a3d0-469e-aeae-378e9992d35b",
                "group_id": "15",
                "fixture_id": 1208118,
                "league_name": "Premier League",
                "round": "Regular Season - 10",
                "date": "2024-11-02",
                "result": "Arsenal",
                "deposit_token": "",
                "datetime": "2024-10-31T15:24:42.402Z",
                "quantity": 3,
                "seller": 0,
                "user_id": 2,
                "status": "won",
                "ip_address": "::ffff:172.19.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T15:24:42.726Z",
                "updatedAt": "2024-10-31T15:24:42.726Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Newcastle",
                "away_team_name": "Arsenal"
            },
            {
                "request_id": "dc883b5a-2ae3-4f55-b2a3-e37f7869cf85",
                "group_id": "15",
                "fixture_id": 1208594,
                "league_name": "La Liga",
                "round": "Regular Season - 12",
                "date": "2024-11-03",
                "result": "Atletico Madrid",
                "deposit_token": "",
                "datetime": "2024-10-31T15:25:03.154Z",
                "quantity": 2,
                "seller": 0,
                "user_id": 2,
                "status": "won",
                "ip_address": "::ffff:172.19.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T15:25:03.480Z",
                "updatedAt": "2024-10-31T15:25:03.480Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Atletico Madrid",
                "away_team_name": "Las Palmas"
            },
            {
                "request_id": "3a36bae6-e7a7-40fb-98b2-2bc3cd1ef9ab",
                "group_id": "15",
                "fixture_id": 1208118,
                "league_name": "Premier League",
                "round": "Round 6",
                "date": "2024-09-30",
                "result": "Team A",
                "deposit_token": "",
                "datetime": "YYYY-MM-ddThh:mm:ss UTC",
                "quantity": 2,
                "seller": 0,
                "user_id": 2,
                "status": "lost",
                "ip_address": "::ffff:172.19.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T15:25:30.600Z",
                "updatedAt": "2024-10-31T15:25:30.600Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Newcastle",
                "away_team_name": "Arsenal"
            },
            {
                "request_id": "a01ff908-02c2-457b-8124-843464337919",
                "group_id": "15",
                "fixture_id": 1208118,
                "league_name": "Premier League",
                "round": "Round 6",
                "date": "2024-09-30",
                "result": "Team A",
                "deposit_token": "",
                "datetime": "YYYY-MM-ddThh:mm:ss UTC",
                "quantity": 2,
                "seller": 0,
                "user_id": 2,
                "status": "lost",
                "ip_address": "::ffff:172.19.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T15:26:43.306Z",
                "updatedAt": "2024-10-31T15:26:43.306Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Newcastle",
                "away_team_name": "Arsenal"
            },
            {
                "request_id": "bb6e567b-be0a-4020-91a9-ac14163ba8d1",
                "group_id": "15",
                "fixture_id": 1208118,
                "league_name": "Premier League",
                "round": "Regular Season - 10",
                "date": "2024-11-02",
                "result": "Newcastle",
                "deposit_token": "",
                "datetime": "2024-10-31T15:29:48.378Z",
                "quantity": 2,
                "seller": 0,
                "user_id": 2,
                "status": "won",
                "ip_address": "::ffff:172.19.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T15:29:48.767Z",
                "updatedAt": "2024-10-31T15:29:48.767Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Newcastle",
                "away_team_name": "Arsenal"
            },
            {
                "request_id": "2ba523ce-9434-4a9f-a8f0-147eaeb609fd",
                "group_id": "15",
                "fixture_id": 1208119,
                "league_name": "Premier League",
                "round": "Regular Season - 10",
                "date": "2024-11-02",
                "result": "West Ham",
                "deposit_token": "",
                "datetime": "2024-10-31T15:31:15.932Z",
                "quantity": 3,
                "seller": 0,
                "user_id": 2,
                "status": "won",
                "ip_address": "::ffff:172.19.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T15:31:16.248Z",
                "updatedAt": "2024-10-31T15:31:16.248Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Nottingham Forest",
                "away_team_name": "West Ham"
            },
            {
                "request_id": "78754bd0-2afb-4a14-8be2-23942284b41a",
                "group_id": "15",
                "fixture_id": 1208118,
                "league_name": "Premier League",
                "round": "Round 6",
                "date": "2024-09-30",
                "result": "Team A",
                "deposit_token": "",
                "datetime": "YYYY-MM-ddThh:mm:ss UTC",
                "quantity": 2,
                "seller": 0,
                "user_id": 2,
                "status": "lost",
                "ip_address": "::ffff:172.19.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T15:31:49.020Z",
                "updatedAt": "2024-10-31T15:31:49.020Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Newcastle",
                "away_team_name": "Arsenal"
            },
            {
                "request_id": "e99c307a-c8ee-43d6-994f-53f9108ca462",
                "group_id": "15",
                "fixture_id": 1208118,
                "league_name": "Premier League",
                "round": "Regular Season - 10",
                "date": "2024-11-02",
                "result": "Arsenal",
                "deposit_token": "",
                "datetime": "2024-10-31T15:34:02.780Z",
                "quantity": 2,
                "seller": 0,
                "user_id": 2,
                "status": "won",
                "ip_address": "::ffff:172.19.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T15:34:03.128Z",
                "updatedAt": "2024-10-31T15:34:03.128Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Newcastle",
                "away_team_name": "Arsenal"
            },
            {
                "request_id": "456c8d60-3512-4bf8-a8ca-35df98d85338",
                "group_id": "15",
                "fixture_id": 1208118,
                "league_name": "Premier League",
                "round": "Round 6",
                "date": "2024-09-30",
                "result": "Team A",
                "deposit_token": "",
                "datetime": "YYYY-MM-ddThh:mm:ss UTC",
                "quantity": 2,
                "seller": 0,
                "user_id": 2,
                "status": "lost",
                "ip_address": "::ffff:172.19.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T15:36:07.516Z",
                "updatedAt": "2024-10-31T15:36:07.516Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Newcastle",
                "away_team_name": "Arsenal"
            },
            {
                "request_id": "e7eaa2fd-ce3f-4aaa-87ea-12a0ffb94a15",
                "group_id": "15",
                "fixture_id": 1208118,
                "league_name": "Premier League",
                "round": "Regular Season - 10",
                "date": "2024-11-02",
                "result": "Arsenal",
                "deposit_token": "",
                "datetime": "2024-10-31T15:36:22.128Z",
                "quantity": 2,
                "seller": 0,
                "user_id": 2,
                "status": "won",
                "ip_address": "::ffff:172.19.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T15:36:22.487Z",
                "updatedAt": "2024-10-31T15:36:22.487Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Newcastle",
                "away_team_name": "Arsenal"
            },
            {
                "request_id": "09edc391-d641-4ca2-b906-c5b5ff03ac67",
                "group_id": "15",
                "fixture_id": 1208118,
                "league_name": "Premier League",
                "round": "Round 6",
                "date": "2024-09-30",
                "result": "Team A",
                "deposit_token": "",
                "datetime": "YYYY-MM-ddThh:mm:ss UTC",
                "quantity": 2,
                "seller": 0,
                "user_id": 2,
                "status": "lost",
                "ip_address": "::ffff:172.19.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T15:40:46.209Z",
                "updatedAt": "2024-10-31T15:40:46.209Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Newcastle",
                "away_team_name": "Arsenal"
            },
            {
                "request_id": "a781763c-b291-439e-8193-d98d2e2b7d1a",
                "group_id": "15",
                "fixture_id": 1208118,
                "league_name": "Premier League",
                "round": "Round 6",
                "date": "2024-09-30",
                "result": "Team A",
                "deposit_token": "",
                "datetime": "YYYY-MM-ddThh:mm:ss UTC",
                "quantity": 2,
                "seller": 0,
                "user_id": 2,
                "status": "lost",
                "ip_address": "::ffff:172.19.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T15:41:25.468Z",
                "updatedAt": "2024-10-31T15:41:25.468Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Newcastle",
                "away_team_name": "Arsenal"
            },
            {
                "request_id": "b5ff1239-414d-42d3-8d37-e1ba5d26c891",
                "group_id": "15",
                "fixture_id": 1208119,
                "league_name": "Premier League",
                "round": "Regular Season - 10",
                "date": "2024-11-02",
                "result": "West Ham",
                "deposit_token": "",
                "datetime": "2024-10-31T15:41:49.007Z",
                "quantity": 2,
                "seller": 0,
                "user_id": 2,
                "status": "won",
                "ip_address": "::ffff:172.19.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T15:41:49.312Z",
                "updatedAt": "2024-10-31T15:41:49.312Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Nottingham Forest",
                "away_team_name": "West Ham"
            },
            {
                "request_id": "9a8a16d1-362b-401b-88eb-00b0c5651fb1",
                "group_id": "15",
                "fixture_id": 1208118,
                "league_name": "Premier League",
                "round": "Round 6",
                "date": "2024-09-30",
                "result": "Team A",
                "deposit_token": "",
                "datetime": "YYYY-MM-ddThh:mm:ss UTC",
                "quantity": 2,
                "seller": 0,
                "user_id": 2,
                "status": "lost",
                "ip_address": "::ffff:172.19.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T15:45:26.009Z",
                "updatedAt": "2024-10-31T15:45:26.009Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Newcastle",
                "away_team_name": "Arsenal"
            },
            {
                "request_id": "a09edeaf-0285-4bcb-8260-5f82d7ad1c59",
                "group_id": "15",
                "fixture_id": 1208118,
                "league_name": "Premier League",
                "round": "Round 6",
                "date": "2024-09-30",
                "result": "Team A",
                "deposit_token": "",
                "datetime": "YYYY-MM-ddThh:mm:ss UTC",
                "quantity": 2,
                "seller": 0,
                "user_id": 2,
                "status": "lost",
                "ip_address": "::ffff:172.19.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T15:51:04.494Z",
                "updatedAt": "2024-10-31T15:51:04.494Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Newcastle",
                "away_team_name": "Arsenal"
            },
            {
                "request_id": "edebd592-4482-4acd-abe2-1dd9eee33970",
                "group_id": "15",
                "fixture_id": 1208118,
                "league_name": "Premier League",
                "round": "Round 6",
                "date": "2024-09-30",
                "result": "Team A",
                "deposit_token": "",
                "datetime": "YYYY-MM-ddThh:mm:ss UTC",
                "quantity": 2,
                "seller": 0,
                "user_id": 2,
                "status": "lost",
                "ip_address": "::ffff:172.19.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T15:56:36.540Z",
                "updatedAt": "2024-10-31T15:56:36.540Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Newcastle",
                "away_team_name": "Arsenal"
            },
            {
                "request_id": "8b73c641-1694-408f-92ef-c605e4688c89",
                "group_id": "15",
                "fixture_id": 1208118,
                "league_name": "Premier League",
                "round": "Round 6",
                "date": "2024-09-30",
                "result": "Team A",
                "deposit_token": "",
                "datetime": "YYYY-MM-ddThh:mm:ss UTC",
                "quantity": 2,
                "seller": 0,
                "user_id": 2,
                "status": "lost",
                "ip_address": "::ffff:172.20.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T15:58:04.668Z",
                "updatedAt": "2024-10-31T15:58:04.668Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Newcastle",
                "away_team_name": "Arsenal"
            },
            {
                "request_id": "50831828-563e-48f7-905b-70599e729a3f",
                "group_id": "15",
                "fixture_id": 1208118,
                "league_name": "Premier League",
                "round": "Regular Season - 10",
                "date": "2024-11-02",
                "result": "Newcastle",
                "deposit_token": "",
                "datetime": "2024-10-31T15:58:50.292Z",
                "quantity": 2,
                "seller": 0,
                "user_id": 2,
                "status": "won",
                "ip_address": "::ffff:172.20.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T15:58:50.600Z",
                "updatedAt": "2024-10-31T15:58:50.600Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Newcastle",
                "away_team_name": "Arsenal"
            },
            {
                "request_id": "12940790-d150-497f-bbe8-88024d24acf2",
                "group_id": "15",
                "fixture_id": 1208119,
                "league_name": "Premier League",
                "round": "Regular Season - 10",
                "date": "2024-11-02",
                "result": "Nottingham Forest",
                "deposit_token": "",
                "datetime": "2024-10-31T15:59:32.013Z",
                "quantity": 2,
                "seller": 0,
                "user_id": 2,
                "status": "won",
                "ip_address": "::ffff:172.20.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T15:59:32.351Z",
                "updatedAt": "2024-10-31T15:59:32.351Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Nottingham Forest",
                "away_team_name": "West Ham"
            },
            {
                "request_id": "cd046717-4d5e-4a3e-b61e-d2ba5f33e8f3",
                "group_id": "15",
                "fixture_id": 1208119,
                "league_name": "Premier League",
                "round": "Regular Season - 10",
                "date": "2024-11-02",
                "result": "Nottingham Forest",
                "deposit_token": "",
                "datetime": "2024-10-31T16:01:17.234Z",
                "quantity": 2,
                "seller": 0,
                "user_id": 2,
                "status": "won",
                "ip_address": "::ffff:172.20.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T16:01:17.645Z",
                "updatedAt": "2024-10-31T16:01:17.645Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Nottingham Forest",
                "away_team_name": "West Ham"
            },
            {
                "request_id": "5c830b00-ef2a-43a7-bd92-b02d9022f327",
                "group_id": "15",
                "fixture_id": 1208119,
                "league_name": "Premier League",
                "round": "Regular Season - 10",
                "date": "2024-11-02",
                "result": "Nottingham Forest",
                "deposit_token": "",
                "datetime": "2024-10-31T16:04:24.340Z",
                "quantity": 2,
                "seller": 0,
                "user_id": 2,
                "status": "won",
                "ip_address": "::ffff:172.22.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T16:04:24.724Z",
                "updatedAt": "2024-10-31T16:04:24.724Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Nottingham Forest",
                "away_team_name": "West Ham"
            },
            {
                "request_id": "ee29ca6d-31a9-4f52-9817-151c46322f27",
                "group_id": "15",
                "fixture_id": 1208119,
                "league_name": "Premier League",
                "round": "Regular Season - 10",
                "date": "2024-11-02",
                "result": "Nottingham Forest",
                "deposit_token": "",
                "datetime": "2024-10-31T16:06:22.859Z",
                "quantity": 2,
                "seller": 0,
                "user_id": 2,
                "status": "won",
                "ip_address": "::ffff:172.23.0.1",
                "location": "unknown, unknown, unknown",
                "wallet": true,
                "createdAt": "2024-10-31T16:06:23.288Z",
                "updatedAt": "2024-10-31T16:06:23.288Z",
                "user": {
                    "name": "Caua terra",
                    "email": "cauapaz@gmail.com"
                },
                "home_team_name": "Nottingham Forest",
                "away_team_name": "West Ham"
            }
        ];
        
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
