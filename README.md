# PWP SPRING 2026

# Smart Home

# Group information

- Student 1. Vladislav Ekushev (Vladislav.Ekushev@student.oulu.fi)
- Student 2. Jessica Suarez Cribillero (Jessica.SuarezCribillero@student.oulu.fi)
- Student 3. Ibrahim Odetunde (IBRAHIM.ODETUNDE@student.oulu.fi)

**Remember to include all required documentation and HOWTOs, including how to create and populate the database, how to run and test the API, the url to the entrypoint, instructions on how to setup and run the client, instructions on how to setup and run the axiliary service and instructions on how to deploy the api in a production environment**

## Running and seeding the database

Install project with Node.JS 22+ (use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) for version management) and Yarn 1.22.22 (should be pre-installed with node)

```bash
# nvm use lts
yarn
```

Look at the schemas at `libs/database/schema` and SQL init migration at `libs/database/drizzle/0000_init.sql`.

> [!IMPORTANT]
> You need to update `.env` file with your PostgreSQL connection details to continue. Most importantly, you need to define `POSTGRES_URL`, but you can always start with copying the template:
> ```bash
> cat .env.template > .env
> # Update the variables in .env if you use your own Postgres instance
> ```

> [!TIP]
> If you have Docker installed, copy the env template and use `docker compose up -d` to run preconfigured Postgres DB


To seed the database, run the seed script:

```bash
yarn db:seed
```

To view database structure and seed data, run Drizzle Studio:

```bash
yarn db:studio
```

### Dependencies

- Drizzle ORM
- Nx (monorepo management)

### Database

- PostgreSQL 16.4
