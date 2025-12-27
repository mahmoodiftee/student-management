import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createStudentDto: CreateStudentDto) {
        return this.studentsService.create(createStudentDto);
    }

    @Get()
    findAll() {
        return this.studentsService.findAll();
    }

    @Get('count')
    async getCount() {
        const count = await this.studentsService.getStudentCount();
        return { count };
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.studentsService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
        return this.studentsService.update(id, updateStudentDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.studentsService.remove(id);
    }

    @Post(':id/assign-hobby')
    @HttpCode(HttpStatus.ACCEPTED)
    async assignHobby(@Param('id') id: string) {
        await this.studentsService.assignHobbyManually(id);
        return { message: 'Hobby assignment queued' };
    }
}
