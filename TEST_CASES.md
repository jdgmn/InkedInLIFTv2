# Condensed Test Cases - Boundary & Extreme Values

## 1. User Registration

### Email Validation
- **Empty email**: `""` → Error: "email, password, firstName and lastName are required"
- **Invalid format**: `"invalid-email"` → Error: "Invalid email format"
- **Max length**: `"a"@example.com` (1 char before @) → Valid
- **Extreme**: `"user@subdomain.domain.co.uk"` → Valid

### Password Validation
- **Min-1 length**: `"Password1"` (7 chars) → Error: "Password must be at least 8 characters long"
- **No uppercase**: `"password123"` → Error: "Password must contain at least one uppercase letter"
- **No lowercase**: `"PASSWORD123"` → Error: "Password must contain at least one lowercase letter"
- **No number**: `"Password"` → Error: "Password must contain at least one number"
- **Valid min**: `"Password1"` (8 chars, all criteria) → Valid
- **Extreme length**: 128+ chars → Valid (if no limit set)
- **Client role no password**: Role "client" can register without password → Valid (password optional for clients)

### Name Fields
- **Empty firstName**: `""` → Error: "firstName is required"
- **Min-1 firstName**: `"A"` (1 char) → Valid (model allows 2+ but no validation)
- **Max firstName**: 50+ chars → Error: "First name cannot exceed 50 characters"
- **Empty lastName**: `""` → Error: "lastName is required"
- **Min-1 lastName**: `"A"` → Valid
- **Max lastName**: 50+ chars → Error: "Last name cannot exceed 50 characters"

### Role Assignment
- **Admin creation**: Admin user creates account → Role defaults to "client" unless admin specifies
- **Role validation**: Invalid role `"invalid"` → Error: enum validation
- **Receptionist permissions**: Receptionist role can access user management → Valid
- **Client password optional**: When creating user with role "client", password is not required → Valid

## 2. Check-in Functionality

### Email Validation
- **Empty email**: `""` → Error: "Email is required for check-in"
- **Invalid format**: `"invalid-email"` → Error: "Invalid email format"
- **Valid email**: `"test@example.com"` → Success (must be registered user)
- **Unregistered email**: `"unregistered@example.com"` → Error: "User not found" or similar

### Name Validation
- **Empty name**: `""` → Valid (name optional if email provided)
- **Extreme length**: 1000+ chars → Valid (no limit)

### Both Empty
- **Empty payload**: `{}` → Error: "Email is required for check-in"

### Checkout Functionality
- **Checkout existing checkin**: PUT /api/checkins/:id/checkout → Sets checkoutTime
- **Checkout already checked out**: Attempt to checkout again → Error or no-op
- **Invalid checkin ID**: `"invalid-id"` → Error: "Checkin not found"

## 3. Membership Creation

### Authorization
- **No token**: No Authorization header → Error: "Not authorized, token missing"
- **Invalid token**: `"Bearer invalid-token"` → Error: "Invalid token"
- **Expired token**: Valid but expired JWT → Error: "Invalid token"

### Price Validation
- **Negative price**: `-100.00` → Valid (no validation)
- **Zero price**: `0.00` → Valid
- **Extreme price**: `999999.99` → Valid
- **Non-numeric**: `"abc"` → Error (MongoDB validation)

### Required Fields
- **Missing email**: No email field → Error: "User not found" or validation error
- **Missing membershipType**: No type → Error
- **Invalid membershipType**: `"invalid"` → Error: enum validation

## 4. User Management (Admin & Receptionist)

### Update User
- **Empty email**: `""` → Error: "Invalid email format"
- **Duplicate email**: Existing user's email → Error: "Email already exists"
- **Invalid role**: `"invalid"` → Error: enum validation
- **Password too short**: `"short"` → Error: "Password must be at least 8 characters long"
- **Receptionist editing**: Receptionist can edit users → Valid

### Delete User
- **Invalid ID**: `"invalid-id"` → Error: "User not found"
- **Non-existent ID**: Valid format but no user → Error: "User not found"
- **Receptionist deleting**: Receptionist can delete users → Valid

### User Creation (Dashboard)
- **Empty fields**: Missing required fields → Error: "All fields are required"
- **Invalid email**: `"invalid"` → Error: "Invalid email format"
- **Duplicate email**: Existing email → Error: "Email already exists"
- **Role selection**: Admin/Receptionist/Client roles → Valid
- **Receptionist creating**: Receptionist can create users → Valid
- **Verified checkbox**: Checked → User created verified, no email verification needed
- **Verified unchecked**: User created unverified, email verification sent

## 5. Email Verification

### Verification Token
- **Invalid token**: `"invalid-token"` → Error: "Invalid verification token"
- **Expired token**: Valid but expired → Error: "Verification token has expired"
- **Already verified**: Valid token for verified user → Error: "Account already verified"

## 6. Dashboard & Analytics

### Search Suggestions
- **Empty input**: `""` → No suggestions
- **Partial match**: `"test"` → Shows matching emails
- **Exact match**: `"test@example.com"` → Shows exact match
- **No matches**: `"nonexistent"` → No suggestions

### Quick Check-in (Dashboard)
- **Empty email**: `""` → Error: "Email is required for check-in"
- **Invalid email**: `"invalid"` → Error: "Please enter a valid email address"
- **Valid check-in**: `"test@example.com"` → Success (registered user only)
- **Unregistered email**: `"new@example.com"` → Error: "User not found"

### Check-ins Page
- **Checkout button**: Click checkout → Sets checkoutTime, hides checkout button
- **Hide checked-out filter**: Checkbox checked → Hides checked-out users from table
- **Checkout time display**: Shows checkout time in table for checked-out users

## 7. Self Check-in Page

### Form Validation
- **Empty email**: `""` → Client-side: "Email is required"
- **Invalid email**: `"invalid"` → Client-side: "Invalid email format"
- **Valid submission**: `"test@example.com"` → Success

## 8. Database Constraints

### User Model
- **Duplicate email**: Same email twice → Error: "Email already exists"
- **Max field lengths**: Exceed schema limits → Validation error

### Membership Model
- **Invalid status**: `"invalid"` → Enum validation error
- **Past endDate**: Date in past → Auto-expiry logic marks as expired

## 9. API Rate Limiting & Security

### Authentication
- **No JWT**: Missing token → 401 Unauthorized
- **Malformed JWT**: Invalid format → Error: "Invalid token"
- **Wrong secret**: Tampered token → Error: "Invalid token"
- **Cookie-based auth**: Token in cookies → Valid authentication

### Input Sanitization
- **SQL injection attempt**: `"' OR 1=1 --"` → No effect (MongoDB)
- **XSS attempt**: `"<script>alert(1)</script>"` → Sanitized in EJS

### Role-Based Access Control
- **Admin access**: Admin can access all routes → Valid
- **Receptionist access**: Receptionist can access users, memberships, checkins → Valid
- **Client access**: Client can only access self-checkin → Valid
- **Forbidden access**: Client trying admin routes → 403 Forbidden

## 10. Performance & Load (note: this is not applicable to our system)

### Large Dataset
- **1000+ users**: Query performance → Should handle without timeout
- **10000+ checkins**: Analytics queries → Should complete in <5s

### Concurrent Requests
- **Multiple registrations**: Race condition check → No duplicate emails
- **Simultaneous check-ins**: Database locking → All recorded

## 11. Navigation & UI Access Control

### Role-Based Navigation
- **Admin navigation**: Shows Users, Memberships, Check-ins, Self Check-in → Dashboard is analytics (no separate analytics nav)
- **Receptionist navigation**: Shows Users (dashboard), Memberships, Check-ins, Self Check-in → Users page is main dashboard
- **Client navigation**: Shows only Self Check-in → Limited access

### Dashboard Access
- **Admin dashboard**: Full analytics dashboard at /dashboard → Valid (analytics nav removed)
- **Receptionist dashboard**: Users page (as dashboard) → Valid
- **Client dashboard**: Redirected to self-checkin → Valid

## Execution Commands

```bash
# Test empty email registration
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"","password":"Password123","firstName":"Test","lastName":"User"}'

# Test invalid email check-in
curl -X POST http://localhost:3000/api/checkins \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","name":"Test User"}'

# Test no authorization membership
curl -X POST http://localhost:3000/api/memberships \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","membershipType":"monthly","price":"100.00","paymentStatus":"paid"}'

# Test password min-1
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@example.com","password":"Pass1","firstName":"Test","lastName":"User"}'

# Test receptionist login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rece@rece.com","password":"rece"}'

# Test receptionist accessing users page
curl -H "Cookie: token=<receptionist_token>" http://localhost:3000/users

# Test receptionist creating verified user (bypasses email verification)
curl -H "Cookie: token=<receptionist_token>" -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"Password123","firstName":"New","lastName":"User","role":"client","verified":true}'

# Test receptionist creating unverified user (sends email verification)
curl -H "Cookie: token=<receptionist_token>" -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser2@example.com","password":"Password123","firstName":"New","lastName":"User","role":"client","verified":false}'

# Test receptionist creating client without password
curl -H "Cookie: token=<receptionist_token>" -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"client@example.com","firstName":"Client","lastName":"User","role":"client","verified":true}'

# Test check-in with registered user
curl -H "Cookie: token=<admin_token>" -X POST http://localhost:3000/api/checkins \
  -H "Content-Type: application/json" \
  -d '{"email":"client@example.com"}'

# Test checkout
curl -H "Cookie: token=<admin_token>" -X PUT http://localhost:3000/api/checkins/<checkin_id>/checkout

# Test client forbidden access
curl -H "Cookie: token=<client_token>" http://localhost:3000/users

# Test admin accessing dashboard (analytics)
curl -H "Cookie: token=<admin_token>" http://localhost:3000/dashboard
