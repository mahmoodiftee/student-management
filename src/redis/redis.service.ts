import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private client: Redis;
    private readonly STUDENT_COUNTER_KEY = 'students:count';

    constructor(private configService: ConfigService) {
        this.client = new Redis({
            host: this.configService.get<string>('REDIS_HOST') || 'localhost',
            port: this.configService.get<number>('REDIS_PORT') || 6379,
            password: this.configService.get<string>('REDIS_PASSWORD'),
        });
    }

    getClient(): Redis {
        return this.client;
    }

    // Student counter operations
    async incrementStudentCount(): Promise<number> {
        return this.client.incr(this.STUDENT_COUNTER_KEY);
    }

    async decrementStudentCount(): Promise<number> {
        return this.client.decr(this.STUDENT_COUNTER_KEY);
    }

    async getStudentCount(): Promise<number> {
        const count = await this.client.get(this.STUDENT_COUNTER_KEY);
        return count ? parseInt(count, 10) : 0;
    }

    // Generic cache operations
    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        if (ttl) {
            await this.client.set(key, value, 'EX', ttl);
        } else {
            await this.client.set(key, value);
        }
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    async exists(key: string): Promise<boolean> {
        const result = await this.client.exists(key);
        return result === 1;
    }

    onModuleDestroy() {
        this.client.disconnect();
    }
}
