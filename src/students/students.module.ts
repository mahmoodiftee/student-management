import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { Student } from './students.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Student]),
        BullModule.registerQueue({
            name: 'hobby-queue',
        }),
    ],
    controllers: [StudentsController],
    providers: [StudentsService],
    exports: [StudentsService],
})
export class StudentsModule { }
