const Router = require('koa-router');
const router = new Router();
const { Usuario } = require('../models');

// POST /users/login
router.post('/login', async (ctx) => {
  const { email, name, auth0Token } = ctx.request.body;

  // Validate input
  if (!email || !name || !auth0Token) {
    ctx.status = 400;
    ctx.body = { error: 'Missing required fields.' };
    return;
  }

  try {
    const [user, created] = await Usuario.findOrCreate({
      where: { email },
      defaults: { name, auth0Token },
    });

    if (!created) {
      user.auth0Token = auth0Token;
      await user.save();
    }

    ctx.status = 200;
    ctx.body = { user };
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { error: 'An error occurred while logging in.' };
  }
});

// GET /users/wallet
router.get('/wallet', async (ctx) => {
  const { id, auth0Token } = ctx.request.query;

  // Validate input
  if (!id || !auth0Token) {
    ctx.status = 400;
    ctx.body = { error: 'Missing required fields.' };
    return;
  }

  try {
    const user = await Usuario.findOne({
      where: { id },
    });

    if (!user) {
      ctx.status = 404;
      ctx.body = { error: 'User not found.' };
      return;
    }

    // Optional: Verify auth0Token

    ctx.status = 200;
    ctx.body = { billetera: user.billetera };
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { error: 'An error occurred while retrieving the user info.' };
  }
});

// PUT /users/wallet
router.put('/wallet', async (ctx) => {
  const { user_id, auth0Token, amount } = ctx.request.body;

  // Validate input
  if (!user_id || !auth0Token || amount == null) {
    ctx.status = 400;
    ctx.body = { error: 'Missing required fields.' };
    return;
  }

  try {
    const user = await Usuario.findOne({
      where: { id: user_id },
    });

    if (!user) {
      ctx.status = 404;
      ctx.body = { error: 'User not found.' };
      return;
    }

    // Optional: Verify auth0Token

    // Update the user's billetera
    user.billetera += amount;
    await user.save();

    ctx.status = 200;
    ctx.body = { user };
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { error: 'An error occurred while updating the user info.' };
  }
});

module.exports = router;
