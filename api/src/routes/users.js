const Router = require('koa-router');
const router = new Router();
const { Usuario, Request } = require('../models');

// GET /users
router.get('/', async (ctx) => {
  try {
    const users = await Usuario.findAll();
    ctx.status = 200;
    ctx.body = { users };
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { error: 'An error occurred while retrieving users.' };
  }
});

// GET /users/:id
router.get('/:id', async (ctx) => {
  const { id } = ctx.params;

  // Validate input
  if (!id) {
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

    ctx.status = 200;
    ctx.body = { user };
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { error: 'An error occurred while retrieving the user info.' };
  }
});

router.get('/wallet/:id', async (ctx) => {
  const { id } = ctx.params;
  const authHeader = ctx.headers['authorization'];

  if (!authHeader) {
    ctx.status = 401;
    ctx.body = { error: 'Authorization header missing.' };
    return;
  }

  // El encabezado Authorization debería tener el formato: "Bearer <token>"
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    ctx.status = 400;
    ctx.body = { error: 'Invalid Authorization header format. Expected "Bearer <token>".' };
    return;
  }

  const receivedToken = tokenParts[1];

  // Validar la entrada
  if (!id || !receivedToken) {
    ctx.status = 400;
    ctx.body = { error: 'Missing required fields.' };
    return;
  }

  try {
    const user = await Usuario.findOne({
      where: { id: parseInt(id, 10) }, // Convertir id a entero
    });

    if (!user) {
      ctx.status = 404;
      ctx.body = { error: 'User not found.' };
      return;
    }

    // Comparar el token recibido con el token almacenado en el modelo de usuario
    if (user.auth0Token !== receivedToken) {
      ctx.status = 401;
      ctx.body = { error: 'Invalid Auth0 token.' };
      return;
    }

    // Si el token es válido, devolver el saldo
    ctx.status = 200;
    ctx.body = { billetera: user.billetera };
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { error: 'An error occurred while retrieving the user info.' };
  }
});


// GET /users/:id/requests
router.get('/:id/requests', async (ctx) => {
  const { id } = ctx.params;

  // Validate input
  if (!id) {
    ctx.status = 400;
    ctx.body = { error: 'Missing required fields.' };
    return;
  }

  try {
    const requests = await Request.findAll({
      where: { usuarioId: id },
    });

    if (!requests.length) {
      ctx.status = 404;
      ctx.body = { error: 'No requests found for this user.' };
      return;
    }

    ctx.status = 200;
    ctx.body = { requests };
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { error: 'An error occurred while retrieving the requests.' };
  }
});

// POST /users/login
router.post('/login', async (ctx) => {
  const { email, name, auth0Token } = ctx.request.body;

  
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

// PUT /users/wallet
router.put('/wallet', async (ctx) => {
  const { user_id, amount } = ctx.request.body;
  const authHeader = ctx.headers['authorization'];

  // Validate input
  if (!user_id || !amount) {
    ctx.status = 400;
    ctx.body = { error: 'Missing required fields.' };
    return;
  }

  if (isNaN(amount)) {
    ctx.status = 400;
    ctx.body = { error: 'Amount must be a number.' };
    return;
  }

  if (!authHeader) {
    ctx.status = 401;
    ctx.body = { error: 'Authorization header missing.' };
    return;
  }

  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    ctx.status = 400;
    ctx.body = { error: 'Invalid Authorization header format. Expected "Bearer <token>".' };
    return;
  }

  const receivedToken = tokenParts[1];

  try {
    const user = await Usuario.findOne({
      where: { id: user_id },
    });

    if (!user) {
      ctx.status = 404;
      ctx.body = { error: 'User not found.' };
      return;
    }

    if (user.auth0Token !== receivedToken) {
      ctx.status = 401;
      ctx.body = { error: 'Invalid Auth0 token.' };
      return;
    }

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