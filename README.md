## Features

### 1. CRUD Operations
Full student lifecycle management with:
- **Create**: Add new student records with automatic hobby assignment.
- **Read**: Retrieve all students or specific records by ID.
- **Update**: Modify student details (triggers background hobby refresh).
- **Delete**: **Soft Delete** implementation to preserve data integrity.

### 2. Redis Caching
- **Student Counter**: Real-time tracking of total student counts in Redis.
- **Atomic Operations**: Counter increments on creation and decrements on deletion.

### 3. Redis Queue (Background Jobs)
- **Hobby Assignment**: Uses Bull (Redis-backed queue) to assign random hobbies after creation or modification.
- **Hobby List**: Randomly selects from *Reading, Travelling, Movies, Games*.
- **Asynchronous**: Tasks are processed out-of-band to ensure snappy API responses.

### 4. Real-Time Communication (Socket.IO)

- **Broadcasting**: Real-time updates are delivered to all clients joined in the `students` room.
- **Event**: The `student-updated` event broadcasts the entire student object whenever a hobby is assigned or updated.

#### How is it working?

The implementation follows a **Producer → Consumer → Broadcaster** pattern:

1. **Trigger (Producer)**  
   When a student is created or updated via the REST API (`StudentsService`), a job is added to a Redis queue called `hobby-queue`.

2. **Process (Consumer)**  
   A background worker (`HobbyProcessor`) listens to the queue, picks up the job, and executes the required business logic (for example, assigning a random hobby).

3. **Broadcast (Broadcaster)**  
   After processing is completed, the `HobbyProcessor` invokes the `SocketGateway`.

4. **Emission (Socket.IO)**  
   The `SocketGateway` emits a `student-updated` event to the `students` room.  
   Any client connected to the WebSocket server and joined to this room receives the updated student data instantly.

### 5. Security & Compliance
- **JWT Authentication**: Secured routes requiring valid Bearer tokens.
- **Input Validation**: Strict validation for all requests (e.g., age 16-100, valid date formats).
- **Rate Limiting**: Applied globally (10 requests per minute) to prevent abuse.
- **Security Headers**: Integrated Helmet for standard web protection.
- **CORS**: Configurable cross-origin resource sharing.

### 6. Dockerization
- **Full Stack**: Containerized application using `Dockerfile` and `docker-compose.yml`.
- **Services**: Includes NestJS App, PostgreSQL, and Redis.

### 7. Testing
- **Coverage**: >50% test coverage achieved using Jest.
- **Suites**: Includes Unit Tests for Services/Processors and Integration Tests for Controllers.

---

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [TypeORM](https://typeorm.io/)
- **Cache/Queue**: [Redis](https://redis.io/) with [Bull](https://optimalbits.github.io/bull/)
- **Real-time**: [Socket.IO](https://socket.io/)
- **Auth**: [Passport JWT](http://www.passportjs.org/)
- **Validation**: [class-validator](https://github.com/typestack/class-validator)

---

## Steps to make it up and running

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.
- OR Node.js v18+, PostgreSQL, and Redis installed locally.

### Running with Docker
The easiest way to start the entire system is using Docker Compose:

1. **Clone the repo**
   ```bash
   git clone https://github.com/mahmoodiftee/student-management.git
   cd college-student-manager
   ```

2. **Start the services**
   ```bash
   docker-compose up --build
   ```
   The API will be available at `http://localhost:3000`.

### Local Development
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Setup environment**
   Copy `.env.example` to `.env` and fill in your local DB and Redis credentials.
3. **Run the app**
   ```bash
   npm run start:dev
   ```

---

## API Endpoints

### Authentication
- `POST /auth/register`: Create a new administrative account.
- `POST /auth/login`: Obtain a JWT token.

### Students
- `GET /students`: List all students.
- `GET /students/:id`: Get detailed view.
- `POST /students`: Create new record.
- `PUT /students/:id`: Update existing record.
- `DELETE /students/:id`: Soft delete record.
- `GET /students/count`: Get global student count (from Redis).

---

## Testing & Coverage

We maintain high quality through comprehensive testing.

- **Run all tests**: `npm test`
- **Check coverage**: `npm run test:cov`

**Coverage Result:**
- **Statements**: 56.4% (Meets >50% requirement)
- **Tests Passed**: 37 total (Services, Controllers, and Processors)

---

## Deliverables

- **Source Code**: Included in this repository.
- **Postman Collection**: [postman_collection.json](./postman_collection.json)
- **Coverage Report**: Available in the `/coverage` directory after running `npm run test:cov`.
- **Environment Example**: [.env.example](./.env.example)
