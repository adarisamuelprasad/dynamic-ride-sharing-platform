# Cancellation & Duplicate Booking Prevention

## Features Implemented

### 1. ✅ Duplicate Booking Prevention

**Problem:** Users could book the same ride multiple times.

**Solution:** System now checks if a user has already booked a ride before allowing another booking.

**Implementation:**
- Added `findByPassengerIdAndRideId()` method to `BookingRepository`
- `BookingController` checks for existing bookings before creating new ones
- Returns error message if user tries to book the same ride twice

**API Response:**
```json
{
  "error": "You have already booked this ride"
}
```

### 2. ✅ Booking Cancellation (Passengers)

**Endpoint:** `POST /api/bookings/cancel/{bookingId}`

**Features:**
- Passengers can cancel their own bookings
- Automatically restores seats to the ride
- Updates payment status to "REFUNDED"
- Updates booking status to "CANCELLED"

**Usage:**
```typescript
// Frontend
await bookingService.cancelBooking(bookingId);
```

**Backend Logic:**
1. Verifies booking belongs to authenticated user
2. Checks if already cancelled
3. Updates booking status to "CANCELLED"
4. Restores seats to ride: `availableSeats += seatsBooked`
5. Refunds payment if exists

### 3. ✅ Ride Cancellation (Drivers)

**Endpoint:** `DELETE /api/rides/{id}`

**Features:**
- Drivers can cancel their own rides
- Automatically cancels all bookings for that ride
- Refunds all payments
- Deletes the ride from database

**Usage:**
```typescript
// Frontend
await rideService.cancelRide(rideId);
```

**Backend Logic:**
1. Verifies ride belongs to authenticated driver
2. Finds all bookings for the ride
3. Cancels each booking (status = "CANCELLED")
4. Refunds all payments (status = "REFUNDED")
5. Deletes the ride

## API Endpoints

### Cancel Booking
```
POST /api/bookings/cancel/{bookingId}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "seatsBooked": 2,
  "status": "CANCELLED",
  "passenger": {...},
  "ride": {...}
}
```

### Cancel Ride
```
DELETE /api/rides/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Ride cancelled successfully"
}
```

## Frontend Integration

### Booking Service
```typescript
import { bookingService } from '@/services/bookingService';

// Cancel a booking
try {
  await bookingService.cancelBooking(bookingId);
  toast.success("Booking cancelled successfully");
} catch (error) {
  toast.error("Failed to cancel booking");
}
```

### Ride Service
```typescript
import { rideService } from '@/services/rideService';

// Cancel a ride
try {
  await rideService.cancelRide(rideId);
  toast.success("Ride cancelled successfully");
} catch (error) {
  toast.error("Failed to cancel ride");
}
```

## Database Changes

### Booking Status Values
- `CONFIRMED` - Active booking
- `CANCELLED` - Cancelled booking

### Payment Status Values
- `PAID` - Payment completed
- `REFUNDED` - Payment refunded (after cancellation)
- `FAILED` - Payment failed
- `PENDING` - Payment pending

## Error Handling

### Duplicate Booking
- **Status:** 400 Bad Request
- **Message:** "You have already booked this ride"

### Unauthorized Cancellation
- **Status:** 403 Forbidden
- **Message:** "You can only cancel your own bookings/rides"

### Already Cancelled
- **Status:** 400 Bad Request
- **Message:** "Booking is already cancelled"

## Testing

### Test Duplicate Prevention
```bash
# First booking - should succeed
POST /api/bookings/book
{
  "rideId": 1,
  "seatsBooked": 1
}

# Second booking for same ride - should fail
POST /api/bookings/book
{
  "rideId": 1,
  "seatsBooked": 1
}
# Response: "You have already booked this ride"
```

### Test Booking Cancellation
```bash
# Cancel booking
POST /api/bookings/cancel/1
Authorization: Bearer <token>

# Verify:
# - Booking status = "CANCELLED"
# - Ride availableSeats increased
# - Payment status = "REFUNDED"
```

### Test Ride Cancellation
```bash
# Cancel ride
DELETE /api/rides/1
Authorization: Bearer <token>

# Verify:
# - All bookings for ride are cancelled
# - All payments are refunded
# - Ride is deleted
```

## Security

- ✅ Only authenticated users can cancel
- ✅ Users can only cancel their own bookings
- ✅ Drivers can only cancel their own rides
- ✅ All operations are logged and validated

## Future Enhancements

Potential improvements:
- Cancellation fees (if cancelled within X hours)
- Partial refunds based on cancellation time
- Email notifications on cancellation
- Cancellation history/reason tracking
- Auto-cancellation for expired rides

