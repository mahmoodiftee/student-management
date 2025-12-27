import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import Redis from 'ioredis';

jest.mock('ioredis');

describe('RedisService', () => {
    let service: RedisService;
    let configService: ConfigService;
    let redisMock: any;

    beforeEach(async () => {
        redisMock = {
            incr: jest.fn(),
            decr: jest.fn(),
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            exists: jest.fn(),
            disconnect: jest.fn(),
        };
        (Redis as unknown as jest.Mock).mockReturnValue(redisMock);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RedisService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockImplementation((key: string) => {
                            if (key === 'REDIS_HOST') return 'localhost';
                            if (key === 'REDIS_PORT') return 6379;
                            return null;
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<RedisService>(RedisService);
        configService = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should increment student count', async () => {
        redisMock.incr.mockResolvedValue(1);
        const result = await service.incrementStudentCount();
        expect(redisMock.incr).toHaveBeenCalledWith('students:count');
        expect(result).toBe(1);
    });

    it('should decrement student count', async () => {
        redisMock.decr.mockResolvedValue(0);
        const result = await service.decrementStudentCount();
        expect(redisMock.decr).toHaveBeenCalledWith('students:count');
        expect(result).toBe(0);
    });

    it('should get student count', async () => {
        redisMock.get.mockResolvedValue('5');
        const result = await service.getStudentCount();
        expect(redisMock.get).toHaveBeenCalledWith('students:count');
        expect(result).toBe(5);
    });

    it('should return 0 if student count is null', async () => {
        redisMock.get.mockResolvedValue(null);
        const result = await service.getStudentCount();
        expect(result).toBe(0);
    });

    it('should set a value with TTL', async () => {
        await service.set('test', 'value', 100);
        expect(redisMock.set).toHaveBeenCalledWith('test', 'value', 'EX', 100);
    });

    it('should set a value without TTL', async () => {
        await service.set('test', 'value');
        expect(redisMock.set).toHaveBeenCalledWith('test', 'value');
    });

    it('should delete a key', async () => {
        await service.del('test');
        expect(redisMock.del).toHaveBeenCalledWith('test');
    });

    it('should check if key exists', async () => {
        redisMock.exists.mockResolvedValue(1);
        const result = await service.exists('test');
        expect(redisMock.exists).toHaveBeenCalledWith('test');
        expect(result).toBe(true);
    });
});
