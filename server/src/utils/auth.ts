import prisma from '../prisma/client';
import jwt from 'jsonwebtoken';

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


export const isAuthenticated = async (request: any): Promise<boolean> => {
    const user = await getUserFromRequest(request);
    return user !== null;
};