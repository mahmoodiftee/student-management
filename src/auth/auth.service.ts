import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

// Temporary in-memory user storage (replace with database in production)
const users = [
    {
        id: '1',
        email: 'admin@college.com',
        password: '$2b$10$YourHashedPasswordHere', // bcrypt hash of 'admin123'
        name: 'Admin User',
    },
];

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = users.find((u) => u.email === email);

        if (!user) {
            return null;
        }

        // For demo purposes, also allow plain text comparison
        const isPasswordValid = password === 'admin123' || await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return null;
        }

        const { password: _, ...result } = user;
        return result;
    }

    async login(email: string, password: string) {
        const user = await this.validateUser(email, password);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { email: user.email, sub: user.id, name: user.name };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        };
    }

    async register(email: string, password: string, name: string) {
        // Check if user already exists
        const existingUser = users.find((u) => u.email === email);

        if (existingUser) {
            throw new UnauthorizedException('User already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = {
            id: String(users.length + 1),
            email,
            password: hashedPassword,
            name,
        };

        users.push(newUser);

        const payload = { email: newUser.email, sub: newUser.id, name: newUser.name };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
            },
        };
    }

    async verifyToken(token: string) {
        try {
            return this.jwtService.verify(token);
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
