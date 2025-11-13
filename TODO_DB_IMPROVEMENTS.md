# Database Design Improvements Implementation TODO

## Phase 1: Indexing Strategy
- [ ] Add indexes to User model: email (already unique), role, verified
- [ ] Add indexes to Membership model: user + status + endDate, endDate
- [ ] Add indexes to Checkin model: checkinTime, user + checkinTime, checkoutTime
- [ ] Add indexes to Archive model: year + type

## Phase 2: Schema Enhancements
- [ ] Add createdBy and updatedBy fields to all models for audit trail
- [ ] Add validation: checkoutTime must be after checkinTime in Checkin model
- [ ] Add TTL indexes for temporary tokens (verificationToken, resetToken)
- [ ] Add virtual field for session duration in Checkin model

## Phase 3: Data Integrity
- [ ] Implement cascading deletes (when user deleted, handle memberships and checkins)
- [ ] Add soft deletes with deletedAt field
- [ ] Encrypt sensitive tokens

## Phase 4: Performance Optimizations
- [ ] Implement cursor-based pagination for large datasets
- [ ] Add aggregation pipelines for analytics queries
- [ ] Add caching layer consideration (Redis)

## Phase 5: New Collections (Optional)
- [ ] Create Payments collection for payment tracking
- [ ] Create AuditLog collection for security logging

## Phase 6: Migration and Testing
- [ ] Create migration scripts for existing data
- [ ] Update application code to use new fields and optimizations
- [ ] Test performance improvements
- [ ] Update DATABASE_DESIGN.md to reflect implemented changes
