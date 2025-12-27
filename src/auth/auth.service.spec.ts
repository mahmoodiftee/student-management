import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let jwtService: JwtService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn().mockReturnValue('mock-token'),
                        verify: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateUser', () => {
        it('should return user object if credentials are correct', async () => {
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            const result = await service.validateUser('admin@college.com', 'admin123');
            expect(result).toBeDefined();
            expect(result.email).toBe('admin@college.com');
            expect(result.password).toBeUndefined();
        });

        it('should return null if user not found', async () => {
            const result = await service.validateUser('nonexistent@example.com', 'password');
            expect(result).toBeNull();
        });

        it('should return null if password is incorrect', async () => {
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);
            const result = await service.validateUser('admin@college.com', 'wrongpassword');
            expect(result).toBeNull();
        });
    });

    describe('login', () => {
        it('should return access token and user info', async () => {
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            const result = await service.login('admin@college.com', 'admin123');
            expect(result.access_token).toBe('mock-token');
            expect(result.user).toBeDefined();
            expect(result.user.email).toBe('admin@college.com');
        });

        it('should throw UnauthorizedException for invalid credentials', async () => {
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);
            await expect(service.login('admin@college.com', 'wrong')).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('register', () => {
        it('should register a new user and return token', async () => {
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
            const result = await service.register('new@example.com', 'password123', 'New User');
            expect(result.access_token).toBe('mock-token');
            expect(result.user.email).toBe('new@example.com');
        });

        it('should throw UnauthorizedException if user already exists', async () => {
            await expect(service.register('admin@college.com', 'password', 'Admin')).rejects.toThrow(UnauthorizedException);
        });
    });
});
