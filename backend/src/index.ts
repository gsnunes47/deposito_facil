import "dotenv/config"
import express from 'express'
import usersRouter from './routers/users.js'

const app = express()
const PORT = 3000
app.use(express.json())

// routes
app.use('/api/users', usersRouter)

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`)
})
