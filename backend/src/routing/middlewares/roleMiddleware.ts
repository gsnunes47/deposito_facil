import { type NextFunction, type Request, type Response } from 'express';

class roleMiddleware {
  static allow(...allowedRoles: string[]) {
    return (request: Request, response: Response, next: NextFunction) => {
      if (!request.user) {
        return response.status(401).json({ message: 'Usuário não encontrado' });
      }

      if (!allowedRoles.includes(request.user.accessLevel)) {
        return response.status(403).json({
          message: 'Acesso negado: nível de acesso insuficiente',
        });
      }

      next();
    };
  }

  static verify(request: Request, response: Response, next: NextFunction) {
    return roleMiddleware.allow('admin')(request, response, next);
  }
}

export default roleMiddleware;
