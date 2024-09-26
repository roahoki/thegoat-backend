// routes/auth.js
const express = require('express');
const router = express.Router();
const { Usuario } = require('../models');

// Endpoint to handle login or registration
router.post('/login', async (req, res) => {
  const { email, name, auth0Token } = req.body;

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

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred.' });
  }
});

module.exports = router;
