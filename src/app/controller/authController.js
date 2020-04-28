'use strict'

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const mailer = require('../../modules/mailer')

const authConfig = require('../../config/auth.json')
const User = require('../model/user');

const router = express.Router();

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
  });
}

router.post('/register', async (request, response) => {
  const { email } = request.body;

  try {
    if (await User.findOne({ email }))
      return response.status(400).send({ error: 'User already exists' })

    const user = await User.create(request.body);

    user.password = undefined;

    return response.status(201).send({
      user, token: generateToken({ id: user.id })
    });
  } catch (error) {
    return response.status(400).send({ error: 'Registration failed' });
  }
});

router.post('/authenticate', async (request, response) => {
  const { email, password } = request.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return response.status(400).send({ error: 'User email not found' });
  }

  if (!await bcrypt.compare(password, user.password)) {
    return response.status(400).send({ error: 'Invalid password' });
  }

  user.password = undefined;

  response.send({
    user, token: generateToken({ id: user.id })
  });
});

router.post('/forgotPassword', async (request, response) => {
  const { email } = request.body;

  try {

    const user = await User.findOne({ email })

    if (!user) {
      return response.status(400).send({ error: 'User email not found' })
    }

    const token = crypto.randomBytes(20).toString('Hex');

    const now = new Date();
    now.setHours(now.getHours() + 1)

    await User.findByIdAndUpdate(user.id, {
      '$set': {
        passwordResetToken: token,
        passwordResetExpires: now,
      }
    });

    mailer.sendMail({
      to: email,
      from: 'lobogawa@gmail.com',
      template: 'auth/forgotPassword',
      context: { token },

    }, (error) => {

      if (error) {
        return response.status(400).send({ error: 'Connot send forgot password email' })

      } else {
        return response.status(200).send({ successfully: 'Your token was sent' })
      }
    });

  } catch (error) {
    response.status(400).send({ error: 'Error on forgot password, try again' })
  }
});

router.post('/resetPassword', async (request, response) => {

  const { email, token, password } = request.body;

  try {
    const user = await User.findOne({ email })
      .select('+passwordResetToken passwordReseteExpires');

    if (!user) {
      return response.status(400).send({ error: 'User email not found' });
    }

    if (token !== user.passwordResetToken) {
      return response.status(400).send({ error: 'Token invalid' })

    }

    const now = new Date();
    if (now > user.passwordResetExpires) {
      return response.status(400).send({ error: 'Token expired, generate a new one' })
    }

    user.password = password;

    await user.save();
    response.status(200).send({ successfully: 'Password redefined' })

  } catch (error) {
    response.status(400).send({ error: 'Cannot reset password, try again' })
  }
});

module.exports = (app) => app.use('/auth', router);