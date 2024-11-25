const { User } = require('../models'); // Ajusta la ruta al modelo de usuario

const checkAdmin = async (ctx, next) => {
    console.log(ctx, "ctx");
    const user = await User.findOne({ where: { email: ctx.state.user.email } });
    if (user && user.isAdmin) {
        return next();
    }
    ctx.status = 403;
    ctx.body = { error: 'Access denied: Admins only.' };
};

module.exports = checkAdmin;
