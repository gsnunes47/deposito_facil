import { type NextFunction, type Request, type Response } from 'express'

class roleMiddleware {

    static verify(request: Request, response: Response, next: NextFunction) {

        const requiredRole = 'admin'

        if (!request.user) {
            return response.status(401).json({ message: 'Usuário não encontrado' })
        }

        if (request.user.accessLevel !== requiredRole) {
            return response.status(403).json({ message: 'Acesso negado: nível de acesso insuficiente' })
        }

        next()
    }

}

export default roleMiddleware
