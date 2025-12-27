import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: { email: string; password: string }) {
        return this.authService.login(loginDto.email, loginDto.password);
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: { email: string; password: string; name: string }) {
        return this.authService.register(registerDto.email, registerDto.password, registerDto.name);
    }

    @Post('verify')
    @HttpCode(HttpStatus.OK)
    async verifyToken(@Body() body: { token: string }) {
        return this.authService.verifyToken(body.token);
    }
}
