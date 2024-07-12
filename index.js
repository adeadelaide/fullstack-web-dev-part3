const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')

// morgan middleware print request body
morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})

app.use(express.static('dist'))
app.use(express.json())
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms - :body',
  ),
)
app.use(cors())

// ============
// == routes ==
// ============
// app.get("/", (req, res) => {
//   res.send("<h1>phonebook by alice benedetti</h1>");
// });

// GET all persons
app.get('/api/persons', (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons)
  })
})

// GET one person
app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findById(id)
    .then((person) => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch((err) => next(err))
})

// POST one person
app.post('/api/persons', (req, res, next) => {
  let _person = req.body

  const id = Math.trunc(Math.random() * 1000)
  _person.id = id

  const person = Person({
    ..._person,
  })

  person
    .save()
    .then((savedPerson) => {
      res.json(savedPerson)
    })
    .catch((err) => {
      next(err)
    })
})

// PUT one person
app.put('/api/persons/:id', (req, res, next) => {
  let person = req.body
  const id = req.params.id

  Person.findByIdAndUpdate(id, person, {
    new: true,
    runValidators: true,
    context: 'query',
  })
    .then((updatedPerson) => {
      res.json(updatedPerson)
    })
    .catch((err) => next(err))
})

// DELETE one person
app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findByIdAndDelete(id)
    .then((result) => {
      res.status(204).end()
    })
    .catch((error) => next(error))
})

// GET info about the phonebook
app.get('/info', (req, res) => {
  Person.find({}).then((persons) => {
    let response = `Phonebook has info for ${persons.length} people`
    response += '<br />'
    const date = new Date()
    response += `Request was received on date ${date}`
    res.send(response)
  })
})

// unknown route handling
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// error handling
const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

// app start
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
