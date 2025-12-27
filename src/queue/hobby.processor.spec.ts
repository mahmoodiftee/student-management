import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HobbyProcessor } from './hobby.processor';
import { Student } from '../students/students.entity';
import { SocketGateway } from '../socket/socket.gateway';
import { Repository } from 'typeorm';

describe('HobbyProcessor', () => {
    let processor: HobbyProcessor;
    let repository: Repository<Student>;
    let socketGateway: SocketGateway;

    const mockStudent: Partial<Student> = {
        id: 'uuid-1',
        studentId: 'STU-001',
        name: 'John Doe',
        age: 20,
        gender: 'Male',
        course: 'CS',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HobbyProcessor,
                {
                    provide: getRepositoryToken(Student),
                    useValue: {
                        findOne: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: SocketGateway,
                    useValue: {
                        emitStudentUpdated: jest.fn(),
                    },
                },
            ],
        }).compile();

        processor = module.get<HobbyProcessor>(HobbyProcessor);
        repository = module.get<Repository<Student>>(getRepositoryToken(Student));
        socketGateway = module.get<SocketGateway>(SocketGateway);
    });

    it('should be defined', () => {
        expect(processor).toBeDefined();
    });

    describe('handleHobbyAssignment', () => {
        it('should assign a random hobby and emit socket event', async () => {
            const job = { data: { studentId: 'uuid-1' } } as any;
            repository.findOne = jest.fn().mockResolvedValue({ ...mockStudent });
            repository.save = jest.fn().mockImplementation((s) => Promise.resolve(s));

            await processor.handleHobbyAssignment(job);

            expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
            expect(repository.save).toHaveBeenCalled();
            expect(socketGateway.emitStudentUpdated).toHaveBeenCalled();
        });

        it('should not assign random hobby if manualUpdate is true', async () => {
            const job = { data: { studentId: 'uuid-1', manualUpdate: true } } as any;
            const studentWithHobby = { ...mockStudent, hobby: 'Reading' };
            repository.findOne = jest.fn().mockResolvedValue(studentWithHobby);

            await processor.handleHobbyAssignment(job);

            expect(repository.save).not.toHaveBeenCalled();
            expect(socketGateway.emitStudentUpdated).toHaveBeenCalledWith(studentWithHobby);
        });

        it('should log error and return if student not found', async () => {
            const job = { data: { studentId: 'nonexistent' } } as any;
            repository.findOne = jest.fn().mockResolvedValue(null);

            await processor.handleHobbyAssignment(job);

            expect(repository.save).not.toHaveBeenCalled();
            expect(socketGateway.emitStudentUpdated).not.toHaveBeenCalled();
        });
    });
});
