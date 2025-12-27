import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtAuthGuard } from './../src/auth/guards/jwt-auth.guard';

describe('StudentsController (e2e)', () => {
    let app: INestApplication;

    const mockStudent = {
        id: 'uuid-1',
        studentId: 'STU-001',
        name: 'John Doe',
        age: 20,
        gender: 'Male',
        course: 'CS',
        admissionDate: '2024-01-01',
    };

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true }) // Skip auth for e2e tests
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/students (POST)', () => {
        return request(app.getHttpServer())
            .post('/students')
            .send(mockStudent)
            .expect(201);
    });

    it('/students (GET)', () => {
        return request(app.getHttpServer())
            .get('/students')
            .expect(200);
    });

    it('/students/count (GET)', () => {
        return request(app.getHttpServer())
            .get('/students/count')
            .expect(200);
    });

    it('/students/:id (GET)', async () => {
        // First create a student
        const createRes = await request(app.getHttpServer())
            .post('/students')
            .send({ ...mockStudent, studentId: 'STU-E2E-1' });

        const id = createRes.body.id;

        return request(app.getHttpServer())
            .get(`/students/${id}`)
            .expect(200);
    });
});
