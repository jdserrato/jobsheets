# Jobsheets - Job Application Tracker
A full-stack job application tracking web app built as a portfolio project.
Live site → https://jobsheets.ca/


## What It Does
JobSheets helps job seekers stay organized during their search by tracking every application in one place. Key features:

* **Add & manage applications** — company, role, location, date applied, job posting URL, and job description
* **Track status changes** — every time an application moves (e.g. Applied → Interview → Offer), the change is logged with a timestamp
* **Status history timeline** — see the full progression of any application at a glance
* **Stats dashboard** — at-a-glance metrics: total applications, response rate, applications submitted per week, number of applications in different stages of the hiring process
* **Secure auth** — register and log in; your data is private to your account
* **Mobile-friendly** — responsive layout that works on any screen size

## Tech Stack


| Layer  | Technology |
| ------------- |:-------------:|
| Framework      | Next.js 15    |
| Language      | TypeScript     |
| Styling     | Tailwind CSS    |
| Database     | PostgreSQL (local: Docker-production: Supabase)    |
| ORM| Prisma 5     |
| Auth    | Next.Auth.js    |
| Deployment     | Vercel     |

## Database Schema
Three models power the app
```
User
 └── Application (many per user)
       └── StatusHistory (one entry per status change)
```
* **User** — stores credentials and links to all their applications
* **Application** — one row per job applied to (company, role, salary range, joburl, job description, status)
* **StatusHistory** — an append-only log; every status change on an application writes a new row here, preserving the full history

## Running Locally
### 1. Clone the repository
```
git clone https://github.com/jdserrato/jobsheets.git
cd jobsheets
```
### 2. Install dependencies
```
npm install
```
### 3. Start the PostgreSQL database
The project includes a **docker-compose.yml** that spins up a local Postgres instance. Make sure Docker Desktop is running, then:
```
docker-compose up -d
```
This starts a Postgres container in the background on port 5432.
### 4. Configure environment variables
Create a .env file in the project root:
```
# Local database (Docker)
POSTGRES_PASSWORD=postgres 
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jobtracker?schema=public"

# NextAuth — generate a secret with: openssl rand -base64 32
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```
**⚠️ Never commit your .env file. It is already listed in .gitignore.**

### 5. Run database migrations
Prisma reads your schema and creates the tables in Postgres:
```
npx prisma migrate dev
```
### 6. Start the development server
```
npm run dev
```
Open http://localhost:3000 in your browser. Register an account and start tracking.

## Production Architecture
The production deployment at https://jobsheets.ca/ uses:
* Vercel — hosts the Next.js app, handles CI/CD on every push to main
* Supabase — managed PostgreSQL database with connection pooling via PgBouncer
* Environment variables — set in the Vercel dashboard (never stored in the repo)

## Project Structure
```
jobsheets/
├── app/
│   ├── api/            # REST API routes (applications CRUD, auth)
│   ├── applications/ 
│   ├── dashboard/      # Stats dashboard
│   ├── login/          # Login page
│   └── register/       # Registration page
├── components/         # Reusable UI components
├── prisma/
│   ├── schema.prisma   # Database models
│   └── migrations/     # Migration history
├── middleware.ts       # Route protection via NextAuth
├── docker-compose.yml  # Local Postgres setup
└── .env                # add your .env file

```
## Author
**Juan Diego Serrato**

B.Sc. Computer Science — Mount Royal University
* GitHub: https://github.com/jdserrato
* LinkedIn: https://www.linkedin.com/in/juan-diego-serrato-1870b2241/
* Live project: https://jobsheets.ca/

## License
**MIT** - feel free to fork and adapt for your own job search. 
