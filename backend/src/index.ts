import express from 'express'
import usersRouter from './routers/users.js'

const app = express()

app.use('/api/users', usersRouter)

const PORT = 3000

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`)
})
