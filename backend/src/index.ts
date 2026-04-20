import "dotenv/config"
import express from 'express'
import usersRouter from './routers/userRouter.js'
import tenantRouter from './routers/tenantRouter.js'
import authRouter from './routers/authRouter.js'

const app = express()
const PORT = 3000
app.use(express.json())

// routes
app.use('/api/users', usersRouter)
app.use('/api/tenant', tenantRouter)
app.use('/api/login', authRouter)

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`)
})
