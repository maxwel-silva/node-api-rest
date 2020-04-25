'use strict'

const express = require('express');
const User = require('../model/user');
const router = express.Router();

router.post('/register', async (request, response) => {
  const { email } = request.body;

  try {

    if (await User.findOne({ email }))
      return response.status(400).send({ error: 'User already exists' })

    const user = await User.create(request.body);

    user.password = undefined;

    return response.status(201).send({ user });

  } catch (error) {

    return response.status(400).send({ error: 'Registration failed' });
  }

});

module.exports = (app) => app.use('/auth', router);