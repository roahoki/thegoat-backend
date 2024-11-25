const Router = require("koa-router");
const { AdminRequest, Request } = require("../models"); 
const router = new Router();

// Obtener bonos de admin
router.get('/bonds', async (ctx) => {
    try {
        const adminBonds = await AdminRequest.findAll({
            where: { status: 'accepted' }, 
        });
        ctx.status = 200;
        ctx.body = { adminBonds };
    } catch (error) {
        console.error('Error fetching admin bonds:', error);
        ctx.status = 500;
        ctx.body = { error: 'An error occurred while fetching admin bonds.' };
    }
});

// Disponibilizar un bono
router.patch('/bonds/:id/avail', async (ctx) => {
    const { id } = ctx.params;
    try {
        const bond = await AdminRequest.findByPk(id);
        if (!bond) {
            ctx.status = 404;
            ctx.body = { error: 'Bond not found' };
            return;
        }

        bond.status = 'available';
        await bond.save();

        ctx.status = 200;
        ctx.body = { message: 'Bond has been made available', bond };
    } catch (error) {
        console.error('Error updating bond status:', error);
        ctx.status = 500;
        ctx.body = { error: 'An error occurred while updating bond status.' };
    }
});

// Obtener bonos de admin disponibles
router.get('/bonds/avail', async (ctx) => {
    try {
        const adminBonds = await AdminRequest.findAll({
            where: { status: 'available' }, 
        });
        ctx.status = 200;
        ctx.body = { adminBonds };
    } catch (error) {
        console.error('Error fetching available admin bonds:', error);
        ctx.status = 500;
        ctx.body = { error: 'An error occurred while fetching available admin bonds.' };
    }
});

// Comprar bonos al admin
router.post('/bonds/:bondId/buy', async (ctx) => {
    const { bondId } = ctx.params;
    const { quantity, userId } = ctx.request.body;

    try {
        const bond = await AdminRequest.findByPk(bondId);

        if (!bond) {
            ctx.status = 404;
            ctx.body = { error: 'Bond not found' };
            return;
        }

        if (bond.quantity < quantity) {
            ctx.status = 400;
            ctx.body = { error: 'Not enough bonds available.' };
            return;
        }

        bond.quantity -= quantity;
        if (bond.quantity === 0) {
            await bond.destroy();
        } else {
            await bond.save();
        }

        const request = await Request.create({
            user_id: userId,
            fixture_id: bond.fixture_id,
            league_name: bond.league_name,
            round: bond.round,
            date: bond.date,
            result: bond.result,
            quantity: quantity,
            datetime: bond.datetime,
            seller: 15, 
            status: 'accepted', 
            group_id: bond.group_id,
            wallet: bond.wallet,
        });

        ctx.status = 200;
        ctx.body = {
            message: 'Bond purchased successfully.',
            bond: request, // Retornar la información del bono agregado al usuario
        };

    } catch (error) {
        console.error('Error purchasing bond:', error);
        ctx.status = 500;
        ctx.body = { error: 'Failed to purchase bond.' };
    }
});


module.exports = router;