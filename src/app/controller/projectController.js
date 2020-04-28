'use strict'

const express = require('express');
const authMiddleware = require('../middleware/auth')

const Project = require = require('../model/project')
//const Task = require('../model/task')

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (request, response) => {
  try {

    const projects = await Project.find()

    return response.status(200).send({successfully: true, projects})

  } catch (error) {

    return response.status(400).send({ error: 'Error loading projects' })
  }
});

router.get('/:projectId', async (request, response) => {
  response.send({ user: request.userId })
});

router.post('/', async (request, response) => {
  try {

    const project = await Project.create(request.body)

    return response.status(200).send({ successfully: true, project })

  } catch (error) {
    return response.status(400).send({ error: 'Error creating new project' })
  }
});

router.put('/:projectId', async (request, response) => {
  response.send({ user: request.userId })
});

router.delete('/:projectId', async (request, response) => {
  response.send({ user: request.userId })
});

module.exports = (app) => app.use('/projects', router);