# TripLy Ride Share - Backend Integration Guide

## ✅ Integration Complete!

The `triply-ride-share` frontend has been successfully integrated with the `triply-backend` Spring Boot API.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd "c:\Users\samue\One Drive official\OneDrive\Desktop\Internships\Infosys Spring Board\RideShare\triply-ride-share"
npm install
```

### 2. Start the Backend

Open a terminal and run:

```bash
cd "c:\Users\samue\One Drive official\OneDrive\Desktop\Internships\Infosys Spring Board\RideShare\triply-backend"
mvn spring-boot:run
```

Or use the Maven wrapper:
```bash
.\mvnw.cmd spring-boot:run
```

**Backend will run on**: `http://localhost:8080`

### 3. Start the Frontend

Open another terminal and run:

```bash
cd "c:\Users\samue\One Drive official\OneDrive\Desktop\Internships\Infosys Spring Board\RideShare\triply-ride-share"
npm run dev
```

**Frontend will run on**: `http://localhost:5173`

---

## 📁 What Was Added

### New Service Files

All services are located in `src/services/`:

1. **`authService.ts`** - Authentication & user management
   - `login(email, password)` - User login
   - `register(payload)` - User registration
   - `logout()` - Clear session
   - `isLoggedIn()` - Check auth status
   - `getToken()` - Get JWT token

2. **`rideService.ts`** - Ride management
   - `searchRides(params)` - Search for rides
   - `getAllRides()` - Get all rides
   - `postRide(rideData)` - Post a new ride (drivers only)

3. **`bookingService.ts`** - Booking management
   - `bookRide(rideId, seatsBooked)` - Book a ride
   - `getMyBookings()` - Get user's bookings

4. **`adminService.ts`** - Admin operations
   - `getAllUsers()` - Get all users
   - `updateUser(userId, userData)` - Update user
   - `deleteUser(userId)` - Delete user
   - `blockUser(userId, blocked)` - Block/unblock user
   - `verifyDriver(userId)` - Verify driver
   - `getAllRides()` - Get all rides (admin view)
   - `getAllBookings()` - Get all bookings (admin view)

5. **`axiosConfig.ts`** - HTTP interceptors
   - Automatically adds JWT token to all requests
   - Handles 401 errors (redirects to login)

### Updated Files

- **`package.json`** - Added `axios` dependency
- **`App.tsx`** - Imported axios configuration

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:8080
```

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register

### Rides
- `GET /api/rides/search?source=X&destination=Y` - Search rides (public)
- `GET /api/rides` - Get all rides (auth required)
- `POST /api/rides/post` - Post a ride (auth required, drivers only)

### Bookings
- `POST /api/bookings/book` - Book a ride (auth required)
- `GET /api/bookings/my` - Get my bookings (auth required)

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user
- `POST /api/admin/users/{id}/block?blocked=true` - Block user
- `POST /api/admin/users/{id}/verify-driver` - Verify driver
- `GET /api/admin/rides` - Get all rides
- `GET /api/admin/bookings` - Get all bookings

---

## 🔐 Test Credentials

### Admin Account
- **Email**: `admin@example.com`
- **Password**: `Admin123!`

### Passenger Account
- **Email**: `vibha@example.com`
- **Password**: `Password123!`

### Driver Account
- **Email**: `ranvitha@example.com`
- **Password**: `Password123!`

---

## 💡 Usage Examples

### Login Example

```typescript
import { authService } from '@/services/authService';
import { toast } from 'sonner';

try {
  const user = await authService.login('vibha@example.com', 'Password123!');
  toast.success(`Welcome back, ${user.name}!`);
  // Redirect based on role
  if (user.role === 'ROLE_ADMIN') {
    navigate('/admin');
  } else {
    navigate('/dashboard');
  }
} catch (error) {
  toast.error('Login failed. Please check your credentials.');
}
```

### Search Rides Example

```typescript
import { rideService } from '@/services/rideService';

const searchRides = async () => {
  try {
    const rides = await rideService.searchRides({
      source: 'Mumbai',
      destination: 'Pune',
      date: '2025-12-06'
    });
    console.log('Found rides:', rides);
  } catch (error) {
    console.error('Search failed:', error);
  }
};
```

### Book Ride Example

```typescript
import { bookingService } from '@/services/bookingService';
import { toast } from 'sonner';

const bookRide = async (rideId: number, seats: number) => {
  try {
    const booking = await bookingService.bookRide(rideId, seats);
    toast.success('Ride booked successfully!');
    return booking;
  } catch (error) {
    toast.error('Booking failed. Please try again.');
  }
};
```

### Post Ride Example (Driver)

```typescript
import { rideService } from '@/services/rideService';
import { toast } from 'sonner';

const postRide = async () => {
  try {
    const ride = await rideService.postRide({
      source: 'Bengaluru',
      destination: 'Mysuru',
      departureTime: '2025-12-06T10:00:00',
      availableSeats: 3,
      farePerSeat: 450
    });
    toast.success('Ride posted successfully!');
    return ride;
  } catch (error) {
    toast.error('Failed to post ride.');
  }
};
```

---

## 🛠️ TypeScript Interfaces

All TypeScript interfaces are defined in the service files:

### User/Auth Types
```typescript
interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  role: string;
  name: string;
}
```

### Ride Types
```typescript
interface Ride {
  id: number;
  source: string;
  destination: string;
  departureTime: string;
  availableSeats: number;
  farePerSeat: number;
  driver: {
    id: number;
    name: string;
    vehicleModel: string;
    licensePlate: string;
    driverVerified: boolean;
  };
}
```

### Booking Types
```typescript
interface Booking {
  id: number;
  seatsBooked: number;
  status: string;
  passenger: { id: number; name: string; email: string };
  ride: Ride;
}
```

---

## 🔄 Authentication Flow

1. User logs in via `authService.login()`
2. JWT token is stored in `localStorage`
3. `axiosConfig` automatically adds token to all API requests
4. If token expires (401 error), user is redirected to login

---

## ⚠️ Important Notes

1. **CORS**: Backend is configured to allow requests from `http://localhost:5173`
2. **Database**: Backend uses H2 in-memory database (data resets on restart)
3. **JWT Token**: Expires after 24 hours (86400000 ms)
4. **Auto-Seeding**: Backend automatically creates test users on startup

---

## 🐛 Troubleshooting

### Backend not starting?
- Check if port 8080 is available
- Ensure Java 17+ is installed
- Check `application.properties` for database config

### Frontend can't connect to backend?
- Verify backend is running on `http://localhost:8080`
- Check browser console for CORS errors
- Ensure axios is installed: `npm install`

### 401 Unauthorized errors?
- Check if user is logged in
- Verify token is being sent in headers
- Token might have expired - try logging in again

---

## 📚 Next Steps

1. **Install dependencies**: `npm install`
2. **Start backend**: Run Spring Boot application
3. **Start frontend**: `npm run dev`
4. **Test login**: Use test credentials
5. **Explore features**: Search rides, book rides, post rides

---

## 🎉 You're All Set!

The frontend is now fully integrated with the backend. All API calls are configured and ready to use!
