jest.mock('../src/utils/auth', () => ({
    getUserFromRequest: jest.fn()
}));

import { authenticate, requireAuth, requireAdmin, requireOwnerOrAdmin } from '../src/middleware/auth';
import { getUserFromRequest } from '../src/utils/auth';

const mockGetUserFromRequest = getUserFromRequest as jest.Mock;

describe('Auth Middleware', () => {
    let req: any;
    let res: any;
    let next: jest.Mock;

    beforeEach(() => {
        req = { headers: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('authenticate', () => {
        test('should attach user to req when getUserFromRequest returns a user', async () => {
            const user = { id: 'u1', role: 'USER' };
            mockGetUserFromRequest.mockResolvedValue(user);

            await authenticate(req, res, next);

            expect(req.user).toEqual(user);
            expect(next).toHaveBeenCalledWith();
        });

        test('should not attach user to req when getUserFromRequest returns null', async () => {
            mockGetUserFromRequest.mockResolvedValue(null);

            await authenticate(req, res, next);

            expect(req.user).toBeUndefined();
            expect(next).toHaveBeenCalledWith();
        });

        test('should call next with error when getUserFromRequest throws', async () => {
            const error = new Error('JWT verify error');
            mockGetUserFromRequest.mockRejectedValue(error);

            await authenticate(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('requireAuth', () => {
        test('should call next when req.user is set', () => {
            req.user = { id: 'u1', role: 'USER' };

            requireAuth(req, res, next);

            expect(next).toHaveBeenCalledWith();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should return 401 when req.user is missing', () => {
            requireAuth(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('requireAdmin', () => {
        test('should call next when req.user is ADMIN', () => {
            req.user = { id: 'u1', role: 'ADMIN' };

            requireAdmin(req, res, next);

            expect(next).toHaveBeenCalledWith();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should return 401 when req.user is missing', () => {
            requireAdmin(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
            expect(next).not.toHaveBeenCalled();
        });

        test('should return 403 when req.user is not ADMIN', () => {
            req.user = { id: 'u1', role: 'USER' };

            requireAdmin(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Admin role required' });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('requireOwnerOrAdmin', () => {
        test('should return 401 when req.user is missing', async () => {
            const getOwnerId = jest.fn();
            const middleware = requireOwnerOrAdmin(getOwnerId);

            await middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
            expect(next).not.toHaveBeenCalled();
        });

        test('should call next immediately if user is ADMIN', async () => {
            req.user = { id: 'u_admin', role: 'ADMIN' };
            const getOwnerId = jest.fn();
            const middleware = requireOwnerOrAdmin(getOwnerId);

            await middleware(req, res, next);

            expect(next).toHaveBeenCalledWith();
            expect(getOwnerId).not.toHaveBeenCalled();
        });

        test('should call next if user is owner', async () => {
            req.user = { id: 'u1', role: 'USER' };
            const getOwnerId = jest.fn().mockResolvedValue('u1');
            const middleware = requireOwnerOrAdmin(getOwnerId);

            await middleware(req, res, next);

            expect(getOwnerId).toHaveBeenCalledWith(req);
            expect(next).toHaveBeenCalledWith();
        });

        test('should return 403 if user is not owner and not admin', async () => {
            req.user = { id: 'u2', role: 'USER' };
            const getOwnerId = jest.fn().mockResolvedValue('u1');
            const middleware = requireOwnerOrAdmin(getOwnerId);

            await middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized' });
            expect(next).not.toHaveBeenCalled();
        });

        test('should call next with error when getOwnerId throws', async () => {
            req.user = { id: 'u1', role: 'USER' };
            const error = new Error('DB error');
            const getOwnerId = jest.fn().mockRejectedValue(error);
            const middleware = requireOwnerOrAdmin(getOwnerId);

            await middleware(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
