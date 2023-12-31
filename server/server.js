const express = require('express')
const path = require('path')
const cors = require('cors');
const dotenv = require('dotenv')
dotenv.config();
const connectionDB = require("./mongo");
const botRoute = require('./botScript')


const app = express()
const port = process.env.PORT || 4000
app.use(cors());
const buildPath = path.join(__dirname, '../build')

connectionDB()
app.use(express.static(buildPath))
app.use(express.json())

app.use('/bot',botRoute)

// gets the static files from the build folder
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, '/index.html'))
})



// Showing that the server is online and running and listening for changes
app.listen(port, () => {
  console.log(`Server is online on port: ${port}`)
})
