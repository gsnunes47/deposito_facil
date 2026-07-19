import * as jwtHelper from '../../helpers/jwtHelper.js';
import { type NextFunction, type Request, type Response } from 'express';

class authMiddleware {
  static verify(request: Request, response: Response, next: NextFunction) {
    const token = request.cookies.token;

    if (!token) {
      response.status(401).json({ message: 'Não autorizado' });
    } else {
      const decoded = jwtHelper.verifyToken(token);

      if (!decoded.valid) {
        return response.status(401).json({
          message: 'Não autorizado',
        });
      } else {
        request.user = decoded;
        next();
      }
    }
  }
}

export default authMiddleware;
