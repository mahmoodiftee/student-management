import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('students')
export class Student {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    studentId: string;

    @Column()
    name: string;

    @Column()
    age: number;

    @Column()
    gender: string;

    @Column()
    course: string;

    @Column({ nullable: true })
    hobby: string;

    @Column({ type: 'date' })
    admissionDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
