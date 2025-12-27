import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Student } from './students.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class StudentsService {
    constructor(
        @InjectRepository(Student)
        private studentsRepository: Repository<Student>,
        private redisService: RedisService,
        @InjectQueue('hobby-queue') private hobbyQueue: Queue,
    ) { }

    async create(createStudentDto: CreateStudentDto): Promise<Student> {
        // Check if student ID already exists
        const existingStudent = await this.studentsRepository.findOne({
            where: { studentId: createStudentDto.studentId },
        });

        if (existingStudent) {
            throw new ConflictException(`Student with ID ${createStudentDto.studentId} already exists`);
        }

        // Create student
        const student = this.studentsRepository.create({
            ...createStudentDto,
            admissionDate: new Date(createStudentDto.admissionDate),
        });

        const savedStudent = await this.studentsRepository.save(student);

        // Increment Redis counter
        await this.redisService.incrementStudentCount();

        // Queue hobby assignment
        await this.hobbyQueue.add('assign-hobby', { studentId: savedStudent.id });

        return savedStudent;
    }

    async findAll(): Promise<Student[]> {
        return this.studentsRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Student> {
        const student = await this.studentsRepository.findOne({ where: { id } });

        if (!student) {
            throw new NotFoundException(`Student with ID ${id} not found`);
        }

        return student;
    }

    async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
        const student = await this.findOne(id);

        // Check if studentId is being updated and if it conflicts
        if (updateStudentDto.studentId && updateStudentDto.studentId !== student.studentId) {
            const existingStudent = await this.studentsRepository.findOne({
                where: { studentId: updateStudentDto.studentId },
            });

            if (existingStudent) {
                throw new ConflictException(`Student with ID ${updateStudentDto.studentId} already exists`);
            }
        }

        // Update student
        Object.assign(student, updateStudentDto);

        if (updateStudentDto.admissionDate) {
            student.admissionDate = new Date(updateStudentDto.admissionDate);
        }

        const updatedStudent = await this.studentsRepository.save(student);

        // If hobby is being updated manually, queue the hobby assignment to trigger socket event
        if (updateStudentDto.hobby !== undefined) {
            await this.hobbyQueue.add('assign-hobby', {
                studentId: updatedStudent.id,
                manualUpdate: true,
            });
        }

        return updatedStudent;
    }

    async remove(id: string): Promise<void> {
        const student = await this.findOne(id);

        // Soft delete
        await this.studentsRepository.softDelete(id);

        // Decrement Redis counter
        await this.redisService.decrementStudentCount();
    }

    async getStudentCount(): Promise<number> {
        return this.redisService.getStudentCount();
    }

    async assignHobbyManually(id: string): Promise<void> {
        const student = await this.findOne(id);
        await this.hobbyQueue.add('assign-hobby', {
            studentId: student.id,
            manualUpdate: true,
        });
    }
}
