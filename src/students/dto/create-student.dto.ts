import { IsString, IsNotEmpty, IsNumber, Min, Max, IsDateString, IsIn, Matches } from 'class-validator';

export class CreateStudentDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^[A-Z0-9-]+$/, { message: 'Student ID must contain only uppercase letters, numbers, and hyphens' })
    studentId: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @Min(16, { message: 'Age must be at least 16' })
    @Max(100, { message: 'Age must not exceed 100' })
    age: number;

    @IsString()
    @IsNotEmpty()
    @IsIn(['Male', 'Female', 'Other'], { message: 'Gender must be Male, Female, or Other' })
    gender: string;

    @IsString()
    @IsNotEmpty()
    course: string;

    @IsDateString({}, { message: 'Admission date must be a valid date in ISO format (YYYY-MM-DD)' })
    admissionDate: string;
}
