# InkedInLIFTv2

A comprehensive gym management system built with Node.js, Express, MongoDB, and EJS. Features user management, membership tracking, check-in system, analytics dashboard, and email verification.

## Features

### Core Functionality
- **User Registration & Authentication**: Secure signup with email verification and JWT-based login
- **Role-Based Access**: Admin, Receptionist, and Client roles with appropriate permissions
- **Membership Management**: Create and track memberships (Monthly, Quarterly, Annual)
- **Check-in System with Check-out**: Self check-in page and admin check-in and check-out functionality
- **Analytics Dashboard**: Revenue tracking, user growth metrics, peak hours analysis
- **Email Notifications**: Automated verification emails and membership reminders

### Recent Enhancements
- **Email Verification Bypass**: Temporary bypass functionality for testing (`/bypass`)
- **Search Suggestions**: Auto-complete for existing emails in dashboard (not on self-checkin)
- **Improved Dashboard Layout**: Quick check-in moved to top, better organization
- **Auto-expiry Logic**: Memberships automatically marked as expired when past end date
- **Enhanced UX**: Better edit prompts and payment status auto-updates

## Prerequisites
- Node.js 18+ and npm
- MongoDB URI (Atlas or local)
- Optional: Gmail app password for email notifications

## Setup

1. Clone and open project folder
2. Copy `.env` from `.env.example` or create `.env` with:
   ```
   PORT=3000
   MONGODB_URI=<your-mongodb-uri>
   JWT_SECRET=<a-strong-secret>
   BASE_URL=http://localhost:3000
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start in development:
   ```bash
   npm run dev
   ```
   or production:
   ```bash
   npm start
   ```

## Project Structure

- **Server**: `server.js` (Express + EJS)
- **Views**: `/views` (login, register, dashboard, users, memberships, checkins, selfcheckin)
- **API Routes**:
  - `/api/users` - User management
  - `/api/checkins` - Check-in operations
  - `/api/memberships` - Membership management
  - `/api/analytics` - Dashboard analytics
- **Background Jobs**:
  - `/cron/notificationScheduler.js` - Daily notifications
  - `/jobs/archiver.js` - Yearly archive on Jan 1
- **Models**: `/models` (User, Membership, Checkin, Archive)
- **Config**: `/config` (Database, Email setup)

## Quick Start Guide

1. **Register**: Visit `/register` (verification email sent if EMAIL_* configured)
2. **Login**: Visit `/` (stores JWT in localStorage)
3. **Dashboard**: Visit `/dashboard` (fetches analytics data)
4. **Admin Functions**: Access `/memberships`, `/checkins`, `/users` (role-restricted)

## API Endpoints

### Public Endpoints
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/verify/:token` - Email verification
- `POST /api/checkins` - Self check-in
- `GET /selfcheckin` - Self check-in page

### Protected Endpoints (JWT Required)
- `GET /api/users` - List users (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)
- `POST /api/memberships` - Create membership (admin/receptionist)
- `GET /api/memberships` - List memberships (admin/receptionist)
- `PUT /api/memberships/:id` - Update membership (admin/receptionist)
- `DELETE /api/memberships/:id` - Delete membership (admin/receptionist)
- `GET /api/checkins` - List check-ins (admin/receptionist)
- `DELETE /api/checkins/:id` - Delete check-in (admin/receptionist)
- `GET /api/analytics/*` - Analytics data (admin)


## Security Features

- JWT authentication with expiration
- Password strength validation (8+ chars, upper/lower/number)
- Email format validation
- Role-based access control
- Input sanitization
- SQL injection protection (MongoDB)

## Development Notes

- Uses EJS templating with Bootstrap 5
- Chart.js for analytics visualization
- Nodemailer for email functionality
- Cron jobs for automated tasks
- Comprehensive error handling and validation

## TO DO

- Front-End Streamlining
   - Dashboad and role-based default pages needs to be polished
   - Users page needs format fixing
   - self-check in page ui polishes
   - I left the seeder code, we should probably remove that one?
