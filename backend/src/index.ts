import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routing/routers/authRouter.js';
import produtosRouter from './routing/routers/produtosRouter.js';
import vendaRouter from './routing/routers/vendaRouter.js';
import clienteRouter from './routing/routers/clienteRouter.js';
import pagamentoRouter from './routing/routers/pagamentoRouter.js';
import pagamentoEncomendaRouter from './routing/routers/pagamentoEncomendaRouter.js';
import despesaRouter from './routing/routers/despesaRouter.js';
import fornecedorRouter from './routing/routers/fornecedorRouter.js';
import encomendaRouter from './routing/routers/encomendaRouter.js';
import usersRouter from './routing/routers/userRouter.js';
import tenantRouter from './routing/routers/tenantRouter.js';
import authMiddleware from './routing/middlewares/authMiddleware.js';
import roleMiddleware from './routing/middlewares/roleMiddleware.js';

//configuração
const app = express();
const PORT = 8080;

app.use(
  cors({
    origin: ['http://localhost:3000', 'https://depositofacil.app.br'],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

//rota de login sem middleware de autenticação
app.use('/login', authRouter);

//middlewares
app.use(authMiddleware.verify);

// routes
app.use('/produtos', produtosRouter);
app.use('/cliente', clienteRouter);
app.use('/venda', vendaRouter);
app.use('/pagamento', pagamentoRouter);
app.use('/pagamentoEncomenda', pagamentoEncomendaRouter);
app.use('/despesa', despesaRouter);
app.use('/fornecedor', fornecedorRouter);
app.use('/encomenda', encomendaRouter);

app.listen(PORT, () => {
  console.log(`Rodando na porta: ${PORT}`);
});
