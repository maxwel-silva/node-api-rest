'use strict'

const express = require('express')
const app = express()
const cors = require('cors')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

require('./app/controller/index')(app)

app.listen(8080)