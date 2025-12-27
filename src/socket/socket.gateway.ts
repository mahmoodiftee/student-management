import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
        credentials: true,
    },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger = new Logger(SocketGateway.name);
    private readonly STUDENTS_ROOM = 'students';

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
        // Automatically join the students room
        client.join(this.STUDENTS_ROOM);
        this.logger.log(`Client ${client.id} joined room: ${this.STUDENTS_ROOM}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join-students')
    handleJoinStudents(@ConnectedSocket() client: Socket) {
        client.join(this.STUDENTS_ROOM);
        this.logger.log(`Client ${client.id} manually joined room: ${this.STUDENTS_ROOM}`);
        return { event: 'joined', room: this.STUDENTS_ROOM };
    }

    // Emit student-updated event to all clients in the students room
    emitStudentUpdated(student: any) {
        this.logger.log(`Emitting student-updated event for student ${student.id}`);
        this.server.to(this.STUDENTS_ROOM).emit('student-updated', student);
    }

    // Additional helper methods for other events
    emitStudentCreated(student: any) {
        this.logger.log(`Emitting student-created event for student ${student.id}`);
        this.server.to(this.STUDENTS_ROOM).emit('student-created', student);
    }

    emitStudentDeleted(studentId: string) {
        this.logger.log(`Emitting student-deleted event for student ${studentId}`);
        this.server.to(this.STUDENTS_ROOM).emit('student-deleted', { id: studentId });
    }
}
