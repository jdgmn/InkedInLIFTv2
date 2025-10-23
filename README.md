# InkedInLIFTv2

Local dev setup and quick guide.

Prerequisites
- Node.js 18+ and npm
- MongoDB URI (Atlas or local)
- Optional: Gmail app password if using email notifications

Setup
1. Clone and open project folder.
2. Copy `.env` from `.env.example` or create `.env` with:
   PORT=3000
   MONGODB_URI=<your-mongodb-uri>
   JWT_SECRET=<a-strong-secret>
   BASE_URL=http://localhost:3000
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password

3. Install dependencies:
   npm install

4. Start in development:
   npm run dev
   or production:
   npm start

App overview
- Server: server.js (Express + EJS)
- Views: /views (login, register, dashboard, users, memberships, checkins)
- API routes: /api/users, /api/checkins, /api/memberships, /api/analytics
- Background jobs:
  - /cron/notificationScheduler.js (daily notifications)
  - /jobs/archiver.js (yearly archive on Jan 1)
- Models: /models (User, Membership, Checkin, Archive)

Quick flow
- Register at /register (verification email sent if EMAIL_* set)
- Login at / (stores JWT in localStorage)
- Visit /dashboard (client fetches analytics endpoints)
- Admin/receptionist can view /memberships, /checkins, /users

Key endpoints (server JSON)
- POST /api/users/register
- POST /api/users/login
- POST /api/users/forgot
- POST /api/users/reset/:token
- POST /api/checkins
- POST /api/memberships (protected)
- GET /api/analytics/dashboard (protected, admin)
- GET /api/analytics/expiring (protected)

Troubleshooting
- Ensure JWT_SECRET and MONGODB_URI are set.
- If emails fail, check EMAIL_USER/EMAIL_PASS and allow less-secure apps or use app password.
- Check server logs for detailed errors.

If you want, I can:
- add `.env.example`,
- add basic tests,
- or generate a small Postman collection for the API.

Found a couple hiccups, still under construction
