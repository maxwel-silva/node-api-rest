'use strict'

const mongoose = require('../../database/index')

const TaskSchema = new mongoose.Schema({

  title: {
    type: String,
    require: true,
  },

  // [Pertence]

  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    require: true,
  },

  // [Atribuído]

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true,
  },

  completed: {
    type: Boolean,
    require: true,
    default: false,
  },

  createAt: {
    type: Date,
    default: Date.now,
  },
})

const Task = mongoose.model('Task', TaskSchema)

module.exports = Task