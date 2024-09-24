const Router = require("koa-router");
const { Fixture, Team, League, Goal, Odd } = require("../models"); 
const router = new Router();
const { Op } = require("sequelize");
const axios = require('axios');

// Endpoint para recibir los datos del listener
router.post("/update", async (ctx) => {
    try {
        const fixturesData = ctx.request.body.fixtures;

        // Log para verificar la estructura recibida
        console.log('Received data:', ctx.request.body);

        if (!fixturesData || !Array.isArray(fixturesData)) {
            ctx.status = 400;
            ctx.body = { message: "Invalid data format received" };
            return;
        }

        for (const fixtureData of fixturesData) {
            // Upsert League
            await League.upsert({
                id: fixtureData.league.id,
                name: fixtureData.league.name,
                country: fixtureData.league.country,
                logo: fixtureData.league.logo,
                flag: fixtureData.league.flag,
                season: fixtureData.league.season,
                round: fixtureData.league.round,
            });

            // Upsert Home Team
            await Team.upsert({
                id: fixtureData.teams.home.id,
                name: fixtureData.teams.home.name,
                logo: fixtureData.teams.home.logo,
            });

            // Upsert Away Team
            await Team.upsert({
                id: fixtureData.teams.away.id,
                name: fixtureData.teams.away.name,
                logo: fixtureData.teams.away.logo,
            });

            // Upsert Fixture
            await Fixture.upsert({
                id: fixtureData.fixture.id,
                league_id: fixtureData.league.id,
                home_team_id: fixtureData.teams.home.id,
                away_team_id: fixtureData.teams.away.id,
                referee: fixtureData.fixture.referee,
                timezone: fixtureData.fixture.timezone,
                date: fixtureData.fixture.date,
                timestamp: fixtureData.fixture.timestamp,
                status_long: fixtureData.fixture.status.long,
                status_short: fixtureData.fixture.status.short,
                status_elapsed: fixtureData.fixture.status.elapsed,
            });

            // Upsert Goals
            await Goal.upsert({
                fixture_id: fixtureData.fixture.id,
                home: fixtureData.goals.home,
                away: fixtureData.goals.away,
            });

            // Manejar Odds
            for (const oddData of fixtureData.odds) {
                for (const valueData of oddData.values) {
                    await Odd.upsert({
                        fixture_id: fixtureData.fixture.id,
                        name: oddData.name,
                        value: valueData.value,
                        odd: parseFloat(valueData.odd)  // Convierte el string a decimal
                    });
                }
            }
        }

        ctx.status = 201;
        ctx.body = { message: "Fixtures successfully stored or updated!" };
    } catch (error) {
        console.error("Error saving fixtures:", error);
        ctx.status = 500;
        ctx.body = { message: "An error occurred while saving fixtures." };
    }
});

router.get("/data", async (ctx) => {
    const { page = 1, count = 25, home, visit, date } = ctx.query;
    console.log('Query Values: ', ctx.query);

    // Get today's date in UTC format
    const today = new Date().toISOString().split('T')[0];

    // Initialize empty filtering conditions
    let where = {};

    // If any filter parameters are provided, add the NS condition
    if (home || visit || date) {
        where.status_short = 'NS'; // Only upcoming fixtures (Not Started)
    }

    // Filter by date if provided
    if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setUTCHours(23, 59, 59, 999);

        where.date = {
            [Op.between]: [startDate.toISOString(), endDate.toISOString()],
        };
    } else if (home || visit) {
        // Include today's and future fixtures if no date filter is applied but home/visit is provided
        where.date = {
            [Op.gte]: today,
        };
    }

    // Filter by home team if provided
    if (home) {
        const homeTeam = await Team.findOne({ where: { name: home } });
        if (homeTeam) {
            where.home_team_id = homeTeam.id;
            console.log('Home Team ID: ', homeTeam.id);
        } else {
            ctx.status = 404;
            ctx.body = { error: `Home team '${home}' not found` };
            return;
        }
    }

    // Filter by away team if provided
    if (visit) {
        const awayTeam = await Team.findOne({ where: { name: visit } });
        if (awayTeam) {
            where.away_team_id = awayTeam.id;
            console.log('Away Team ID: ', awayTeam.id);
        } else {
            ctx.status = 404;
            ctx.body = { error: `Away team '${visit}' not found` };
            return;
        }
    }

    // Ensure the count is at most 25
    const limit = Math.min(parseInt(count), 25);

    // Fetch fixtures based on the constructed 'where' condition
    const fixtures = await Fixture.findAndCountAll({
        where,
        include: [
            {
                model: Team,
                as: "homeTeam",
            },
            {
                model: Team,
                as: "awayTeam",
            },
            {
                model: League,
                as: "league",
            },
        ],
        order: [['updatedAt', 'DESC']],
        limit,
        offset: (page - 1) * limit,
    });

    ctx.body = {
        fixtures: fixtures.rows,
        total: fixtures.count,
        page: parseInt(page),
        count: parseInt(count),
    };
});





router.get("/data/:id", async (ctx) => {
    const { id } = ctx.params;

    const fixture = await Fixture.findOne({
        where: { id },
        include: [
            { model: Team, as: "homeTeam" },
            { model: Team, as: "awayTeam" },
            { model: League, as: "league" },
        ],
    });

    if (!fixture) {
        ctx.status = 404;
        ctx.body = { error: "Fixture not found" };
        return;
    }

    ctx.body = fixture;
});










module.exports = router;
