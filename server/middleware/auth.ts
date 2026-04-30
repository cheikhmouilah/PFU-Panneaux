import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key', (err, user) => {
        if (err) {
            console.error('❌ JWT Verification Error:', err.message);
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};
