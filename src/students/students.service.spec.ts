import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bull';
import { Repository } from 'typeorm';
import { StudentsService } from './students.service';
import { Student } from './students.entity';
import { RedisService } from '../redis/redis.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('StudentsService', () => {
    let service: StudentsService;
    let repository: Repository<Student>;
    let redisService: RedisService;
    let queue: any;

    const mockStudent = {
        id: 'uuid-1',
        studentId: 'STU-001',
        name: 'John Doe',
        age: 20,
        gender: 'Male',
        course: 'CS',
        admissionDate: new Date(),
    } as Student;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StudentsService,
                {
                    provide: getRepositoryToken(Student),
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                        find: jest.fn(),
                        softDelete: jest.fn(),
                    },
                },
                {
                    provide: RedisService,
                    useValue: {
                        incrementStudentCount: jest.fn(),
                        decrementStudentCount: jest.fn(),
                        getStudentCount: jest.fn(),
                    },
                },
                {
                    provide: getQueueToken('hobby-queue'),
                    useValue: {
                        add: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<StudentsService>(StudentsService);
        repository = module.get<Repository<Student>>(getRepositoryToken(Student));
        redisService = module.get<RedisService>(RedisService);
        queue = module.get(getQueueToken('hobby-queue'));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new student', async () => {
            repository.findOne = jest.fn().mockResolvedValue(null);
            repository.create = jest.fn().mockReturnValue(mockStudent);
            repository.save = jest.fn().mockResolvedValue(mockStudent);

            const result = await service.create({
                studentId: 'STU-001',
                name: 'John Doe',
                age: 20,
                gender: 'Male',
                course: 'CS',
                admissionDate: '2024-01-01',
            });

            expect(result).toEqual(mockStudent);
            expect(redisService.incrementStudentCount).toHaveBeenCalled();
            expect(queue.add).toHaveBeenCalledWith('assign-hobby', { studentId: mockStudent.id });
        });

        it('should throw ConflictException if student exists', async () => {
            repository.findOne = jest.fn().mockResolvedValue(mockStudent);

            await expect(service.create({
                studentId: 'STU-001',
                name: 'John Doe',
                age: 20,
                gender: 'Male',
                course: 'CS',
                admissionDate: '2024-01-01',
            })).rejects.toThrow(ConflictException);
        });
    });

    describe('findAll', () => {
        it('should return an array of students', async () => {
            repository.find = jest.fn().mockResolvedValue([mockStudent]);
            const result = await service.findAll();
            expect(result).toEqual([mockStudent]);
        });
    });

    describe('findOne', () => {
        it('should return a student if found', async () => {
            repository.findOne = jest.fn().mockResolvedValue(mockStudent);
            const result = await service.findOne('uuid-1');
            expect(result).toEqual(mockStudent);
        });

        it('should throw NotFoundException if not found', async () => {
            repository.findOne = jest.fn().mockResolvedValue(null);
            await expect(service.findOne('uuid-1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should soft delete a student', async () => {
            service.findOne = jest.fn().mockResolvedValue(mockStudent);
            await service.remove('uuid-1');
            expect(repository.softDelete).toHaveBeenCalledWith('uuid-1');
            expect(redisService.decrementStudentCount).toHaveBeenCalled();
        });
    });
});
