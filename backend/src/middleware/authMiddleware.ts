import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyAccessToken } from '../utils/jwt';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Chýba autentifikačný token',
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.id,
      email: payload.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Neplatný alebo expirovaný token',
    });
  }
};
