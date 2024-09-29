const Router = require('koa-router');
const router = new Router();
const { Usuario } = require('../models');

// Endpoint to handle login or registration
router.post('/login', async (ctx) => {
  const { email, name, auth0Token } = ctx.request.body;

  // Validate input
  if (!email || !name || !auth0Token) {
    ctx.status = 400;
    ctx.body = { error: 'Missing required fields.' };
    return;
  }

  try {
    // Find or create the user
    const [user, created] = await Usuario.findOrCreate({
      where: { email },
      defaults: { name, auth0Token },
    });

    if (!created) {
      // Update the auth0Token if the user already exists
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

module.exports = router;
