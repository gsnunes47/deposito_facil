import { type NextFunction, type Request, type Response } from 'express';

class tenantMiddleware {
  static verify(request: Request, response: Response, next: NextFunction) {
    if (!request.user) {
      return response.status(401).json({ message: 'Usuário não encontrado' });
    }

    const userTenant = request.user as { tenantId: string };
    request.tenantId = userTenant.tenantId;
    console.log(`Tenant ID: ${request.tenantId}`); // Log do tenantId para depuração

    next();
  }
}

export default tenantMiddleware;
