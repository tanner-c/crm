import prisma from '../prisma/client';
import jwt from 'jsonwebtoken';

/**
 * Checks if the user making the request is an admin.
 * Returns true if admin, otherwise false.
 */
export const isAdmin = async (request: any): Promise<boolean> => {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return false;
        }
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        return user?.role === 'ADMIN';
    } catch {
        return false;
    }
};

/**
 * Extracts the user from the request based on the JWT token.
 * Returns the user object if valid, otherwise null.
 */
export const getUserFromRequest = async (request: any) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        return user;
    } catch {
        return null;
    }
};

/**
 * Checks if the request is authenticated by verifying the JWT token.
 * Returns true if authenticated, otherwise false.
 */
export const isAuthenticated = async (request: any): Promise<boolean> => {
    const user = await getUserFromRequest(request);
    return user !== null;
};