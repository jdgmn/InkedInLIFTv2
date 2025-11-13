# InkedInLIFT Database Design Document

## Overview
This document outlines the database schema for the InkedInLIFT gym management system, built with MongoDB and Mongoose. The system manages users, memberships, check-ins, and archival data.

## Current Schema Analysis

### Collections

#### 1. Users Collection
**Schema:** User.js
- **Purpose:** Stores user account information and authentication details
- **Fields:**
  - email (String, required, unique, lowercase, validated)
  - firstName (String, required, 2-50 chars)
  - lastName (String, required, 2-50 chars)
  - role (String, enum: ["admin", "receptionist", "client"], default: "client")
  - passwordHash (String, optional for clients)
  - verified (Boolean, default: false)
  - verificationToken (String)
  - resetToken (String)
  - resetTokenExpiry (Date)
  - timestamps (createdAt, updatedAt)

**Current Issues:**
- passwordHash is optional but should be required for non-client roles
- No indexing on frequently queried fields (email, role)
- verificationToken and resetToken could be encrypted or have TTL

#### 2. Memberships Collection
**Schema:** Membership.js
- **Purpose:** Tracks user membership subscriptions
- **Fields:**
  - user (ObjectId ref to User, required)
  - membershipType (String, enum: ["monthly", "quarterly", "annual"], required)
  - price (Number, required, min: 0)
  - startDate (Date, default: now)
  - endDate (Date, auto-calculated)
  - paymentStatus (String, enum: ["paid", "pending", "failed"], default: "paid")
  - status (String, enum: ["active", "expired", "cancelled"], default: "active")
  - timestamps

**Methods:**
- isExpired(): checks if membership has passed endDate
- isActive(): checks if status is active and not expired

**Current Issues:**
- No compound indexing on user + status for active membership queries
- paymentStatus might be better as a separate Payment collection
- No renewal history tracking

#### 3. Checkins Collection
**Schema:** Checkin.js
- **Purpose:** Records user check-ins and check-outs at the gym
- **Fields:**
  - user (ObjectId ref to User, optional)
  - name (String, optional, max 100 chars)
  - email (String, optional, lowercase, validated)
  - checkinTime (Date, default: now)
  - checkoutTime (Date, optional)
  - isMember (Boolean, default: false)
  - timestamps

**Validation:** At least one of user, email, or name must be provided

**Current Issues:**
- Redundant data: name and email can be derived from user reference
- No indexing on checkinTime for time-based queries
- No session duration calculation
- isMember could be computed dynamically

#### 4. Archives Collection
**Schema:** Archive.js
- **Purpose:** Stores archived data for compliance and historical records
- **Fields:**
  - year (Number, required)
  - type (String, required) // e.g., "membership", "checkin"
  - data (Array, default: [])
  - archivedAt (Date, default: now)

**Current Issues:**
- Generic structure lacks proper typing
- No indexing on year/type for efficient retrieval
- Data array could be large and unoptimized

## Recommended Improvements

### 1. Indexing Strategy
Add the following indexes for better query performance:

```javascript
// User indexes
UserSchema.index({ email: 1 }); // Already unique, but explicit
UserSchema.index({ role: 1 });
UserSchema.index({ verified: 1 });

// Membership indexes
MembershipSchema.index({ user: 1, status: 1, endDate: 1 }); // For active membership queries
MembershipSchema.index({ endDate: 1 }); // For expiration queries

// Checkin indexes
CheckinSchema.index({ checkinTime: -1 }); // For recent checkins
CheckinSchema.index({ user: 1, checkinTime: -1 }); // For user checkin history
CheckinSchema.index({ checkoutTime: 1 }); // For active sessions

// Archive indexes
ArchiveSchema.index({ year: 1, type: 1 });
```

### 2. Schema Normalization
- **Remove redundant fields:** In Checkin schema, remove name and email since they can be populated from User
- **Add computed fields:** Add virtual fields for session duration in Checkin
- **Separate concerns:** Consider a Payment collection for payment tracking

### 3. Data Integrity
- **Add cascading deletes:** When a user is deleted, handle related memberships and checkins
- **Add constraints:** Ensure checkoutTime > checkinTime
- **Add TTL indexes:** For temporary tokens (verificationToken, resetToken)

### 4. Performance Optimizations
- **Pagination:** Implement cursor-based pagination for large datasets
- **Aggregation pipelines:** Use MongoDB aggregations for analytics queries
- **Caching:** Consider Redis for frequently accessed data

### 5. Security Enhancements
- **Encryption:** Encrypt sensitive tokens
- **Audit trail:** Add createdBy/updatedBy fields for tracking changes
- **Soft deletes:** Add deletedAt field instead of hard deletes

### 6. New Collections (Optional)
Consider adding:
- **Payments:** Separate collection for payment transactions
- **GymSessions:** More detailed session tracking with equipment usage
- **Notifications:** For email/SMS notifications
- **AuditLog:** For security and compliance logging

## Migration Plan
1. **Phase 1:** Add indexes to existing collections
2. **Phase 2:** Add new fields and constraints
3. **Phase 3:** Implement data cleanup and normalization
4. **Phase 4:** Add new collections if needed
5. **Phase 5:** Update application code to use optimizations

## Monitoring and Maintenance
- Set up MongoDB monitoring for slow queries
- Regular index usage analysis
- Periodic data archiving and cleanup
- Backup strategy implementation

This design provides a solid foundation for the gym management system while allowing for future scalability and feature additions.
