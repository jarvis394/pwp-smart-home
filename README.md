# PWP SPRING 2026

# Smart Home

# Group information

- Student 1. Vladislav Ekushev (Vladislav.Ekushev@student.oulu.fi)
- Student 2. Jessica Suarez Cribillero (Jessica.SuarezCribillero@student.oulu.fi)
- Student 3. Ibrahim Odetunde (IBRAHIM.ODETUNDE@student.oulu.fi)

**Remember to include all required documentation and HOWTOs, including how to create and populate the database, how to run and test the API, the url to the entrypoint, instructions on how to setup and run the client, instructions on how to setup and run the axiliary service and instructions on how to deploy the api in a production environment**

## Project Information

This project uses NestJS, a progressive Node.Js framework. official documentation (https://docs.nestjs.com)

We followed key NestJS best practices:

- Modular design with separate feature modules (e.g., devices, auth, scenarios).
- DTOs and ValidationPipe for automatic request validation.
- Transport.RMQ for microservices communication via RabbitMQ.
- Dependency injection throughout the application.
- Centralized configuration with environment variables and @nestjs/config.
- Testing with @nestjs/testing and supertest.
- Structured error handling with custom exception filters.

## Running and seeding the database

Install project with Node.JS 22+ (use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) for version management) and Yarn 1.22.22 (should be pre-installed with node)

```bash
# nvm use lts
yarn
```

Look at the schemas at `libs/database/src/schema` and SQL init migration at `libs/database/src/drizzle/0000_init.sql`.

> [!IMPORTANT]
> You need to update `.env` file with your PostgreSQL connection details to continue. Most importantly, you need to define `POSTGRES_URL`, but you can always start with copying the template:
>
> ```bash
> cat .env.template > .env
> # Update the variables in .env if you use your own Postgres instance
> ```

> [!TIP]
> If you have Docker installed, copy the env template and use `docker compose up -d` to run preconfigured Postgres DB

First, apply migrations:

```bash
yarn db:migrate
```

Then, to seed the database, run the seed script:

```bash
yarn db:seed
```

To view database structure and seed data, run Drizzle Studio:

```bash
yarn db:studio
```

## Instructions for local machine without docker

If you do not have Docker installed and want to run it on a local machine instead:

- Download Postgresql and install on your local machine before continuing to the next stage. During Postgresql software installation, set a strong password and use the same password in your .env file

> [!IMPORTANT]
> You need to update `.env` file with your PostgreSQL connection details to continue. Most importantly, you need to define `POSTGRES_URL`, but you can always start with copying the template:
>
> ```bash
> cat .env.template > .env
> # Update the variables in .env if you use your own Postgres instance
> # Remember to make sure your RABBITMQ_URL variable is correct. for example RABBITMQ_URL=amqp://guest:guest@localhost:5672
> ```

- Click on start menu and find `pgAdmin` which is postgre Web GUI. Open it and click on the current server to connect.Enter the password (postgres) from the during installation to connect successfully.
- Right-click on Databases and click on Create - Database. Enter `smart_home` as the database and click on save.
- CD (Change directory) to the proect direct and follow the steps below

First, apply migrations:

```bash
yarn db:migrate
```

Then, to seed the database, run the seed script:

```bash
yarn db:seed
```

To view database structure and seed data, run Drizzle Studio:

```bash
yarn db:studio
```

This will generate a url to view the database and the seeded data.

## Running the Web API

Skip this step if using docker but if using Local computer, continue with the following steps

- Download and Install Erlang (https://www.erlang.org/downloads)
- Download and Install RabbitMQ Server (https://www.rabbitmq.com/docs/platforms), then start the service.

Run the command below

```bash
yarn dev
```

After running the command:

- WebAPI will run in Swagger on (http://localhost:5000/api)
- Client App will run on (http://localhost:4200/)

### Test Instructions

1. Use `POST /api/auth/register` with this specific user (seed in the testing application):

```json
{
  "email": "dl3@test.com",
  "password": "dl3test123",
  "firstName": "Test",
  "lastName": "User"
}
```

2. Run the test with the following command:

```bash
yarn test
```

For running tests with coverage, use

```bash
yarn test --coverage
```

3. A coverage test report will be generated at `apps/backend/coverage/index.html`. Simply use the command below to view the report

```bash
Start-Process "apps\backend\coverage\index.html"
```

[NOTE!]
Testing was kept simple in the Devices module. This is because the RabbitMQ message broker uses a ClientProxy to communicate with the Device module, and it will require a RabbitMQ instance and separate Device microservice to be simultaneously active during tests. Authentication was still verified in all device endpoints.

## Auxiliary Service

The implemented Auxiliary service is for auditing purpose, a log of device operations.

### Running the auxiliary service

To run the auxiliary service, run the command

```bash
yarn aux
```

The service starts and creates a log file `alerts.log` after the first device operation and stores the log of device operations going forward.

To read the event log live, run the command below on a separate terminal

```bash
Get-Content -Path alerts.log -Wait
```

### Testing the Auxiliary service

The auxiliary service tests can be done by using the general test command which generates test report of all applications

```bash
yarn test --coverage
```

Or use the command bbelow for only auxiliary service

```bash
yarn nx test auxiliary --coverage
```

Whichever command is used, the report can be viewed in an html document by using the command

```bash
Start-Process "apps/auxiliary/coverage/index.html"
```

## Building

Run build inside Docker:

```bash
yarn docker
```

Or build and run locally:

```bash
yarn build
yarn start
```

### Dependencies

- TypeScript
- NestJS
- Drizzle ORM
- React
- MUI (Material UI)
- Redux Toolkit
- Nx (monorepo management)
- Jest (testing framework)

### Database

- PostgreSQL 16.4
