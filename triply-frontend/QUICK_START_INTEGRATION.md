# 🚀 Triply Ride Share - Quick Start Guide

## ✅ Integration Status: COMPLETE

The **triply-ride-share** frontend is now fully integrated with the **triply-backend** Spring Boot API!

---

## 📦 What Was Done

### 1. Added Backend Integration Services
Created 5 TypeScript service files in `src/services/`:
- ✅ `authService.ts` - Login, Register, Logout
- ✅ `rideService.ts` - Search, Get, Post rides
- ✅ `bookingService.ts` - Book rides, Get bookings
- ✅ `adminService.ts` - Admin operations
- ✅ `axiosConfig.ts` - Auto token injection & error handling

### 2. Updated Dependencies
- ✅ Added `axios` to package.json
- ✅ Imported axios config in App.tsx

### 3. Created Documentation
- ✅ `BACKEND_INTEGRATION.md` - Complete integration guide

---

## 🎯 Next Steps

### Step 1: Install Dependencies (if not done)
```bash
cd "c:\Users\samue\One Drive official\OneDrive\Desktop\Internships\Infosys Spring Board\RideShare\triply-ride-share"
npm install
```

### Step 2: Start the Backend
```bash
cd "c:\Users\samue\One Drive official\OneDrive\Desktop\Internships\Infosys Spring Board\RideShare\triply-backend"
mvn spring-boot:run
```

### Step 3: Start the Frontend
```bash
cd "c:\Users\samue\One Drive official\OneDrive\Desktop\Internships\Infosys Spring Board\RideShare\triply-ride-share"
npm run dev
```

### Step 4: Open Browser
Navigate to: **http://localhost:5173**

---

## 🔐 Test Credentials

| Role      | Email                  | Password      |
|-----------|------------------------|---------------|
| Admin     | admin@example.com      | Admin123!     |
| Passenger | vibha@example.com      | Password123!  |
| Driver    | ranvitha@example.com   | Password123!  |

---

## 🌐 URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **H2 Console**: http://localhost:8080/h2-console (if enabled)

---

## 📚 Available Services

### Authentication
```typescript
import { authService } from '@/services/authService';

// Login
const user = await authService.login(email, password);

// Register
const user = await authService.register({
  email, password, name, phone, role: 'PASSENGER'
});

// Logout
authService.logout();

// Check if logged in
const isLoggedIn = authService.isLoggedIn();
```

### Rides
```typescript
import { rideService } from '@/services/rideService';

// Search rides
const rides = await rideService.searchRides({
  source: 'Mumbai',
  destination: 'Pune'
});

// Post a ride (drivers only)
const ride = await rideService.postRide({
  source, destination, departureTime,
  availableSeats, farePerSeat
});
```

### Bookings
```typescript
import { bookingService } from '@/services/bookingService';

// Book a ride
const booking = await bookingService.bookRide(rideId, seatsBooked);

// Get my bookings
const bookings = await bookingService.getMyBookings();
```

### Admin
```typescript
import { adminService } from '@/services/adminService';

// Get all users
const users = await adminService.getAllUsers();

// Block a user
await adminService.blockUser(userId, true);

// Verify driver
await adminService.verifyDriver(userId);
```

---

## ✨ Features

- ✅ JWT Authentication with auto token injection
- ✅ Automatic 401 error handling (redirects to login)
- ✅ TypeScript interfaces for all API responses
- ✅ Toast notifications (using sonner)
- ✅ React Query for data fetching
- ✅ Shadcn/UI components
- ✅ Tailwind CSS styling

---

## 🎨 Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Shadcn/UI
- React Router DOM
- Axios
- React Query
- Sonner (toast notifications)

**Backend:**
- Spring Boot 3.4.12
- Spring Security + JWT
- H2 Database (in-memory)
- JPA/Hibernate

---

## 🐛 Common Issues

### Port Already in Use
- Backend (8080): Stop other Java applications
- Frontend (5173): Stop other Vite servers

### Cannot Find Module 'axios'
- Run: `npm install`

### 401 Unauthorized
- User not logged in
- Token expired - login again

### CORS Errors
- Ensure backend is running
- Check backend CORS configuration

---

## 📖 Full Documentation

See `BACKEND_INTEGRATION.md` for:
- Detailed API documentation
- Usage examples
- TypeScript interfaces
- Troubleshooting guide

---

## 🎉 You're Ready!

Everything is set up and ready to go. Just start both servers and begin testing!

**Happy Coding! 🚗💨**
