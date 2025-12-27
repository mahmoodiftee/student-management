import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Job } from 'bull';
import { Student } from '../students/students.entity';
import { SocketGateway } from '../socket/socket.gateway';

@Processor('hobby-queue')
export class HobbyProcessor {
    private readonly logger = new Logger(HobbyProcessor.name);
    private readonly hobbies = ['Reading', 'Travelling', 'Movies', 'Games'];

    constructor(
        @InjectRepository(Student)
        private studentsRepository: Repository<Student>,
        private socketGateway: SocketGateway,
    ) { }

    @Process('assign-hobby')
    async handleHobbyAssignment(job: Job) {
        const { studentId, manualUpdate } = job.data;

        this.logger.log(`Processing hobby assignment for student ${studentId}`);

        try {
            const student = await this.studentsRepository.findOne({ where: { id: studentId } });

            if (!student) {
                this.logger.error(`Student ${studentId} not found`);
                return;
            }

            // Only assign random hobby if not a manual update
            if (!manualUpdate) {
                const randomHobby = this.hobbies[Math.floor(Math.random() * this.hobbies.length)];
                student.hobby = randomHobby;
                await this.studentsRepository.save(student);
                this.logger.log(`Assigned hobby "${randomHobby}" to student ${studentId}`);
            }

            // Trigger Socket.IO event with full student object
            this.socketGateway.emitStudentUpdated(student);

            return { success: true, studentId, hobby: student.hobby };
        } catch (error) {
            this.logger.error(`Failed to process hobby for student ${studentId}`, error);
            throw error;
        }
    }
}
