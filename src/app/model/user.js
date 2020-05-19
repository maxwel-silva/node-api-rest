'use strict'

const mongoose = require('../../database/index')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({

  name: {
    type: String,
    require: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true,
    select: false,
  },

  passwordResetToken: {
    type: String,
    select: false,
  },

  passwordResetExpires: {
    type: Date,
    select: false,
  },

  createAt: {
    type: Date,
    default: Date.now,
  },
})

UserSchema.pre('save', async function (next) {
  const hash = await bcrypt.hash(this.password, 1)
  this.password = hash
  next()
})

const User = mongoose.model('User', UserSchema)

module.exports = User