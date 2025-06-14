const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const dbConnect = require('./config/database')
const studentRoutes = require('./routes/student.routes')

dotenv.config({ path: './.env' })
dbConnect() // Connect to MongoDBconst app = express()
const port = process.env.PORT || 3000 

const app = express()
app.use(cors(
    {
        origin: '*', // Allow all origins
    }
)) 


app.use(express.urlencoded({ extended: true })) // Parse URL-encoded bodies
app.use('/api/', studentRoutes) //
app.use(express.json()) // Parse JSON bodies 



app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Server listening on port ${port}!`))