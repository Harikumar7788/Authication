const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'goodreads.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

// Get Books API
app.get('/books/', async (request, response) => {
  const getBooksQuery = `
  SELECT
    *
  FROM
    book
  ORDER BY
    book_id;`
  const booksArray = await db.all(getBooksQuery)
  response.send(booksArray)
})

app.post('/users/', async (request, response) => {
  const {username, name, password, location, gender} = request.query
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)
  const checkUserQuery = `
  SELECT * 
  FROM 
  user
  WHERE 
  username = '${username}';
  `
  const responseChecker = await db.get(checkUserQuery)
  if (responseChecker === undefined) {
    const newUserQuery = `
    INSERT INTO user (username, name,password,gender,location)
    VALUES 
    (
      '${username}',
      '${name}',
      '${hashedPassword}',
      '${gender}',
      '${location}',
    );`
    await db.run(newUserQuery)
    response.send('User Created Successfully')
  } else {
    response.send('Already User Exist')
  }
})
