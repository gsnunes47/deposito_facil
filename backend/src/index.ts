import "dotenv/config"
import express from 'express'
import cookieParser from 'cookie-parser'
import usersRouter from './routing/routers/userRouter.js'
import tenantRouter from './routing/routers/tenantRouter.js'
import authRouter from './routing/routers/authRouter.js'
import authMiddleware from "./routing/middlewares/authMiddleware.js";

const app = express()
const PORT = 3000
app.use(express.json())
app.use(cookieParser())

//rota de login sem middleware de autenticação
app.use('/api/login', authRouter)

//middlewares
app.use(authMiddleware.verify)

// routes
app.use('/api/users', usersRouter)
app.use('/api/tenant', tenantRouter)

app.listen(PORT, () => {
    console.log(`Rodando na porta: ${PORT}`)
})
