import { type NextFunction, type Request, type Response } from 'express';

class PlatformAdminMiddleware {
  static verify(request: Request, response: Response, next: NextFunction) {
    if (request.user?.accessLevel !== 'platform_admin') {
      return response.status(403).json({ message: 'Acesso negado' });
    }

    next();
  }
}

export default PlatformAdminMiddleware;
