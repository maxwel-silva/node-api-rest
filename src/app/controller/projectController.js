'use strict'

const express = require('express')
const authMiddleware = require('../middleware/auth')

const Project = require('../model/project')
const Task = require('../model/task')

const router = express.Router()

router.use(authMiddleware)

router.post('/', async (request, response) => {
  try {

    const { title, description, tasks } = request.body

    const project = await Project.create({ title, description, user: request.userId })

    await Promise.all(tasks.map(async task => {
      const projectTask = new Task({ ...task, project: project._id })

      await projectTask.save()

      project.tasks.push(projectTask)
    }))

    await project.save()

    return response.status(200).send({ project })

  } catch (error) {
    return response.status(400).send({ error: 'Error creating new project' })
  }
})

router.get('/', async (request, response) => {
  try {
    
    const { page = 1 } = request.query

    const projects = await Project.paginate({}, { page, limit: 5 })

    return response.status(200).send({ projects })

  } catch (error) {
    return response.status(400).send({ error: 'Error loading projects' })
  }
})

router.get('/:projectId', async (request, response) => {
  try {

    const project = await Project.findById(request.params.projectId).populate(['user', 'tasks'])

    return response.status(200).send({ project })

  } catch (error) {
    return response.status(400).send({ error: 'Error loading project' })
  }
})

router.put('/:projectId', async (request, response) => {
  try {

    const { title, description, tasks } = request.body

    const project = await Project.findByIdAndUpdate(request.params.projectId, {
      title,
      description,

    }, { new: true })

    project.task = []
    await Task.remove({ project: project._id })

    await Promise.all(tasks.map(async task => {
      const projectTask = new Task({ ...task, project: project._id })

      await projectTask.save()
      project.tasks.push(projectTask)
    }))

    await project.save()

    return response.status(200).send({ project })

  } catch (error) {
    return response.status(400).send({ error: 'Error updating project' })
  }
})

router.delete('/:projectId', async (request, response) => {
  try {

    await Project.findByIdAndRemove(request.params.projectId);

    return response.status(200).send({ successfully: 'Project deleting' })

  } catch (error) {
    return response.status(400).send({ error: 'Error deleting project' })
  }
})

module.exports = (app) => app.use('/projects', router)