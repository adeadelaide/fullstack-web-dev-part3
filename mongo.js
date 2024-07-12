const mongoose = require('mongoose')

// parse command line arguments
if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

// connect to atlas
const url = process.env.MONGODB_URL
mongoose.set('strictQuery', false)
mongoose.connect(url)

// define schema and model
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})
const Person = mongoose.model('Person', personSchema)

// define functions
const addPerson = (name, number) => {
  const person = new Person({
    name,
    number,
  })

  person.save().then((result) => {
    console.log(`added ${name} with number ${number} to phonebook`)
    mongoose.connection.close()
  })
}

const getPersons = () => {
  Person.find({}).then((persons) => {
    console.log('Phonebook:')

    persons.forEach((person) => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
}

// choose action
if (process.argv.length === 3) {
  getPersons()
} else {
  if (process.argv.length < 5) {
    console.log('missing name and/or number argument')
    process.exit(1)
  }

  const name = process.argv[3]
  const number = process.argv[4]
  addPerson(name, number)
}
