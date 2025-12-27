import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { HobbyProcessor } from './hobby.processor';
import { Student } from '../students/students.entity';
import { SocketModule } from '../socket/socket.module';

@Module({
    imports: [
        BullModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                redis: {
                    host: configService.get<string>('REDIS_HOST') || 'localhost',
                    port: configService.get<number>('REDIS_PORT') || 6379,
                    password: configService.get<string>('REDIS_PASSWORD'),
                },
            }),
            inject: [ConfigService],
        }),
        BullModule.registerQueue({
            name: 'hobby-queue',
        }),
        TypeOrmModule.forFeature([Student]),
        SocketModule,
    ],
    providers: [HobbyProcessor],
    exports: [BullModule],
})
export class QueueModule { }
