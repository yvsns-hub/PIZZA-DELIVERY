import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { memoryUsers } from '../store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'pizza_secret_jwt_auth_key_2026_xyz';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: 'customer' | 'admin' | 'delivery';
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Centrally authenticates incoming JWT bearer tokens.
 * - Missing token -> 401 Unauthorized
 * - Invalid or expired token -> 401 Unauthorized
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err || !decoded) {
      return res.status(401).json({ error: 'Invalid or expired authentication token. Please sign in again.' });
    }

    // Verify user exists in system
    const user = memoryUsers.find((u) => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User session revoked or user not found.' });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  });
}

/**
 * Role-based authorization middleware.
 * - Authenticated user lacking role -> 403 Forbidden
 */
export function requireRole(...allowedRoles: Array<'customer' | 'admin' | 'delivery'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Insufficient privileges. Required role: [${allowedRoles.join(', ')}].`,
      });
    }

    next();
  };
}

export const requireAdmin = requireRole('admin');
export const requireDelivery = requireRole('delivery', 'admin');
