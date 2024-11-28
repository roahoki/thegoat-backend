const Router = require("koa-router");
const { AdminRequest, Request, User } = require("../models"); 
const router = new Router();

const getUserById = async (userId) => {
    return await User.findOne({
        where: { id: userId },
        attributes: ['id', 'isAdmin'],
    });
};


// Obtener bonos de admin
router.get('/bonds', async (ctx) => {
    const { userId } = ctx.query; // Obtener el userId desde los query parameters
    console.log("I'm here, userId:", userId);
    console.log("I'm here, ctx.query:", ctx.query);
    try {
        // Validar que el userId esté presente
        if (!userId) {
            ctx.status = 400;
            ctx.body = { error: 'userId query parameter is required.' };
            return;
        }

        // Verificar que el usuario sea administrador
        const user = await getUserById(userId);
        if (!user || !user.isAdmin) {
            ctx.status = 403;
            ctx.body = { error: 'Access denied. Admins only.' };
            return;
        }

        // Obtener los bonos del administrador
        const adminBonds = await AdminRequest.findAll({
            where: { status: 'accepted' },
        });
        console.log("I'm looking for the adminBonds:", adminBonds);
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
    const { userId } = ctx.query; // Obtenemos el userId desde los query params

    try {
        // Validar que el userId esté presente
        if (!userId) {
            ctx.status = 400;
            ctx.body = { error: 'userId query parameter is required.' };
            return;
        }

        // Verificar si el usuario es administrador
        const user = await getUserById(userId);
        if (!user || !user.isAdmin) {
            ctx.status = 403;
            ctx.body = { error: 'Access denied. Admins only.' };
            return;
        }

        // Buscar el bono por ID
        const bond = await AdminRequest.findByPk(id);
        if (!bond) {
            ctx.status = 404;
            ctx.body = { error: 'Bond not found.' };
            return;
        }

        // Actualizar el estado del bono
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

        // Calcular precio con descuento
        const pricePerBond = 1000;
        const totalPrice = pricePerBond * quantity * ((100 - bond.discount) / 100);

        // Obtener el usuario
        const user = await User.findByPk(userId);

        if (!user) {
            ctx.status = 404;
            ctx.body = { error: 'User not found' };
            return;
        }

        // Verificar si el usuario tiene suficiente dinero en el wallet
        if (user.wallet < totalPrice) {
            ctx.status = 400;
            ctx.body = { error: 'Insufficient funds in wallet.' };
            return;
        }

        // Restar el precio total del wallet del usuario
        console.log(user.wallet, "wallet antes");
        console.log(totalPrice, "total price");
        user.wallet -= totalPrice;
        await user.save();
        console.log(user.wallet, "wallet despues");

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


router.patch('/bonds/:bondId/discount', async (ctx) => {
    const { bondId } = ctx.params;
    const { userId, discount } = ctx.request.body;

    if (!userId) {
        ctx.status = 400;
        ctx.body = { error: 'userId is required.' };
        return;
    }
  
    if (![10, 20, 30].includes(discount)) {
      ctx.status = 400;
      ctx.body = { error: 'Invalid discount value. Only 10%, 20%, and 30% are allowed.' };
      return;
    }
  
    try {
        const user = await User.findOne({ where: { id: userId } });
        if (!user || !user.isAdmin) {
            ctx.status = 403;
            ctx.body = { error: 'Access denied. Admins only.' };
            return;
        }

        const bond = await AdminRequest.findByPk(bondId);
  
        if (!bond) {
            ctx.status = 404;
            ctx.body = { error: 'Bond not found' };
            return;
        }

        bond.discount = discount;
        await bond.save();

        ctx.status = 200;
        ctx.body = { message: 'Discount applied successfully.', bond };
    } catch (error) {
      console.error('Error applying discount:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to apply discount.' };
    }
  });
  

module.exports = router;