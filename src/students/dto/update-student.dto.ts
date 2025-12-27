import { IsOptional, IsString, IsNumber, Min, Max, IsDateString, IsIn, Matches } from 'class-validator';

export class UpdateStudentDto {
    @IsOptional()
    @IsString()
    @Matches(/^[A-Z0-9-]+$/, { message: 'Student ID must contain only uppercase letters, numbers, and hyphens' })
    studentId?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsNumber()
    @Min(16, { message: 'Age must be at least 16' })
    @Max(100, { message: 'Age must not exceed 100' })
    age?: number;

    @IsOptional()
    @IsString()
    @IsIn(['Male', 'Female', 'Other'], { message: 'Gender must be Male, Female, or Other' })
    gender?: string;

    @IsOptional()
    @IsString()
    course?: string;

    @IsOptional()
    @IsDateString({}, { message: 'Admission date must be a valid date in ISO format (YYYY-MM-DD)' })
    admissionDate?: string;

    @IsOptional()
    @IsString()
    hobby?: string;
}
