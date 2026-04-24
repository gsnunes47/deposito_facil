import "dotenv/config"
import express from 'express'
import cookieParser from 'cookie-parser'
import authRouter from './routing/routers/authRouter.js'
import usersRouter from './routing/routers/userRouter.js'
import tenantRouter from './routing/routers/tenantRouter.js'
import authMiddleware from "./routing/middlewares/authMiddleware.js";
import tenantMiddleware from "./routing/middlewares/tenantMiddleware.js"

const app = express()
const PORT = 3000
app.use(express.json())
app.use(cookieParser())

//rota de login sem middleware de autenticação
app.use('/api/login', authRouter)

//middlewares
app.use(authMiddleware.verify)
app.use(tenantMiddleware.verify)

// routes
app.use('/api/tenant', tenantRouter)
app.use('/api/users', usersRouter)

app.listen(PORT, () => {
    console.log(`Rodando na porta: ${PORT}`)
})
