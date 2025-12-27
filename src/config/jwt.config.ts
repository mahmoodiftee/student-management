import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const jwtConfig = (): JwtModuleOptions => {
    const configService = new ConfigService();

    return {
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
        signOptions: {
            //@ts-ignore
            expiresIn: configService.get<string>('JWT_EXPIRATION') || '1d',
        },
    };
};
