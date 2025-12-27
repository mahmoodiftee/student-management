import { Test, TestingModule } from '@nestjs/testing';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('StudentsController', () => {
    let controller: StudentsController;
    let service: StudentsService;

    const mockStudent = {
        id: 'uuid-1',
        studentId: 'STU-001',
        name: 'John Doe',
        age: 20,
        gender: 'Male',
        course: 'CS',
        admissionDate: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [StudentsController],
            providers: [
                {
                    provide: StudentsService,
                    useValue: {
                        create: jest.fn().mockResolvedValue(mockStudent),
                        findAll: jest.fn().mockResolvedValue([mockStudent]),
                        findOne: jest.fn().mockResolvedValue(mockStudent),
                        update: jest.fn().mockResolvedValue(mockStudent),
                        remove: jest.fn().mockResolvedValue(undefined),
                        getStudentCount: jest.fn().mockResolvedValue(10),
                        assignHobbyManually: jest.fn().mockResolvedValue(undefined),
                    },
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<StudentsController>(StudentsController);
        service = module.get<StudentsService>(StudentsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create', async () => {
            const dto: CreateStudentDto = {
                studentId: 'STU-001',
                name: 'John Doe',
                age: 20,
                gender: 'Male',
                course: 'CS',
                admissionDate: '2024-01-01',
            };
            const result = await controller.create(dto);
            expect(service.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockStudent);
        });
    });

    describe('findAll', () => {
        it('should call service.findAll', async () => {
            const result = await controller.findAll();
            expect(service.findAll).toHaveBeenCalled();
            expect(result).toEqual([mockStudent]);
        });
    });

    describe('getCount', () => {
        it('should call service.getStudentCount', async () => {
            const result = await controller.getCount();
            expect(service.getStudentCount).toHaveBeenCalled();
            expect(result).toEqual({ count: 10 });
        });
    });

    describe('findOne', () => {
        it('should call service.findOne', async () => {
            const result = await controller.findOne('uuid-1');
            expect(service.findOne).toHaveBeenCalledWith('uuid-1');
            expect(result).toEqual(mockStudent);
        });
    });

    describe('update', () => {
        it('should call service.update', async () => {
            const dto: UpdateStudentDto = { name: 'Updated' };
            const result = await controller.update('uuid-1', dto);
            expect(service.update).toHaveBeenCalledWith('uuid-1', dto);
            expect(result).toEqual(mockStudent);
        });
    });

    describe('remove', () => {
        it('should call service.remove', async () => {
            await controller.remove('uuid-1');
            expect(service.remove).toHaveBeenCalledWith('uuid-1');
        });
    });

    describe('assignHobby', () => {
        it('should call service.assignHobbyManually', async () => {
            const result = await controller.assignHobby('uuid-1');
            expect(service.assignHobbyManually).toHaveBeenCalledWith('uuid-1');
            expect(result).toEqual({ message: 'Hobby assignment queued' });
        });
    });
});
