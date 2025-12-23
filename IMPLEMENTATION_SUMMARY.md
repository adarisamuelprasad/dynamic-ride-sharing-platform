# Implementation Summary: Dynamic Fare Calculation & Live Ride Feed Fix

## Issues Fixed

### 1. Live Ride Feed Not Showing Database Data ✅
**Problem:** Database data was not visible in the live ride feed on the home page.

**Solution:**
- Added `@CrossOrigin` annotation to `RideController` to allow cross-origin requests from the frontend
- This ensures the frontend can properly fetch ride data from the backend API

**Files Modified:**
- `triply-backend/src/main/java/com/triply/triplybackend/controller/RideController.java`

---

## New Feature: Dynamic Fare Calculation ✅

### Implementation Overview

Implemented a comprehensive dynamic fare calculation system using Google Maps Distance Matrix API.

### Key Components

#### 1. Google Maps Service (`GoogleMapsService.java`)
- **Purpose:** Calculate accurate road distances using Google Maps Distance Matrix API
- **Features:**
  - Calls Google Maps API with source and destination coordinates
  - Automatically falls back to Haversine formula if API is unavailable
  - Returns distance in kilometers
- **Location:** `triply-backend/src/main/java/com/triply/triplybackend/service/GoogleMapsService.java`

#### 2. Updated Ride Service (`RideService.java`)
- **Changes:**
  - Integrated `GoogleMapsService` for distance calculation
  - Implemented dynamic fare formula: **Fare = Base Fare + (Rate per Km × Distance)**
  - Removed old Haversine method (now in GoogleMapsService)
- **Location:** `triply-backend/src/main/java/com/triply/triplybackend/service/RideService.java`

#### 3. Enhanced Booking Controller (`BookingController.java`)
- **Changes:**
  - Added clear documentation for proportional fare splitting
  - Multiple passengers automatically get proportional cost distribution
- **Location:** `triply-backend/src/main/java/com/triply/triplybackend/controller/BookingController.java`

#### 4. Configuration (`application.properties`)
- **Added:**
  - Google Maps API key configuration
  - Base fare setting (default: ₹50)
  - Rate per kilometer setting (default: ₹8/km)
- **Location:** `triply-backend/src/main/resources/application.properties`

---

## How Dynamic Fare Calculation Works

### Formula
```
Fare Per Seat = Base Fare + (Rate per Km × Distance)
```

### Example Calculation
- **Base Fare:** ₹50
- **Rate per Km:** ₹8
- **Distance:** 100 km (calculated via Google Maps API)
- **Fare Per Seat:** 50 + (8 × 100) = **₹850**

### Proportional Splitting
When multiple passengers book:
- **2 seats:** 2 × ₹850 = **₹1,700**
- **3 seats:** 3 × ₹850 = **₹2,550**

Each passenger pays the same amount per seat, ensuring fair cost distribution.

---

## Where to Use

### 1. Posting a Ride
**Automatic Calculation:**
- When posting a ride, if `farePerSeat` is 0 or not provided
- AND coordinates (sourceLat, sourceLng, destLat, destLng) are provided
- The system automatically calculates the fare using Google Maps API

**Usage:**
```json
POST /api/rides/post
{
  "source": "Bangalore",
  "destination": "Mysore",
  "sourceLat": 12.9716,
  "sourceLng": 77.5946,
  "destLat": 12.2958,
  "destLng": 76.6394,
  "farePerSeat": 0  // Will be auto-calculated
}
```

### 2. Booking a Ride
**Automatic Proportional Calculation:**
- When booking multiple seats, the total fare is automatically calculated
- Formula: `Total Fare = Number of Seats × Fare Per Seat`

**Usage:**
```json
POST /api/bookings/book
{
  "rideId": 1,
  "seatsBooked": 2  // Total fare = 2 × farePerSeat
}
```

---

## Configuration

### Step 1: Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable **Distance Matrix API**
4. Create an API key
5. (Optional) Restrict the key to Distance Matrix API

### Step 2: Configure in Application
**Option A: Environment Variable (Recommended)**
```bash
export GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Option B: application.properties**
```properties
google.maps.api.key=your_api_key_here
fare.base=50.0
fare.rate.per.km=8.0
```

### Step 3: Without API Key
- System automatically uses Haversine formula (straight-line distance)
- Less accurate but works without external dependencies
- No configuration needed

---

## Files Created/Modified

### Created Files
1. `triply-backend/src/main/java/com/triply/triplybackend/service/GoogleMapsService.java`
2. `triply-backend/DYNAMIC_FARE_CALCULATION.md` (Documentation)

### Modified Files
1. `triply-backend/src/main/java/com/triply/triplybackend/controller/RideController.java`
   - Added CORS annotation
2. `triply-backend/src/main/java/com/triply/triplybackend/service/RideService.java`
   - Integrated Google Maps service
   - Implemented dynamic fare calculation
3. `triply-backend/src/main/java/com/triply/triplybackend/controller/BookingController.java`
   - Enhanced documentation for proportional splitting
4. `triply-backend/src/main/resources/application.properties`
   - Added Google Maps and fare configuration

---

## Testing

### Test Dynamic Fare Calculation
1. **Post a ride with coordinates:**
   ```bash
   POST http://localhost:8082/api/rides/post
   {
     "source": "Bangalore",
     "destination": "Mysore",
     "sourceLat": 12.9716,
     "sourceLng": 77.5946,
     "destLat": 12.2958,
     "destLng": 76.6394,
     "departureTime": "2025-12-25T10:00:00",
     "availableSeats": 4,
     "farePerSeat": 0
   }
   ```

2. **Verify calculated fare:**
   - Check response - `farePerSeat` should be calculated automatically
   - Should be: Base Fare + (Rate × Distance)

### Test Live Ride Feed
1. **Start backend:** Ensure it's running on port 8082
2. **Start frontend:** Navigate to home page
3. **Verify:** Live Ride Feed should show all available rides from database

### Test Proportional Splitting
1. **Book multiple seats:**
   ```bash
   POST http://localhost:8082/api/bookings/book
   {
     "rideId": 1,
     "seatsBooked": 2
   }
   ```
2. **Verify payment amount:** Should be `2 × farePerSeat`

---

## Benefits

✅ **Accurate Pricing:** Real road distances instead of straight-line  
✅ **Fair Distribution:** Proportional cost splitting  
✅ **Flexible Configuration:** Easy to adjust rates  
✅ **Resilient:** Automatic fallback if API unavailable  
✅ **Transparent:** Clear calculation formula  

---

## Next Steps

1. **Set up Google Maps API key** (optional but recommended)
2. **Adjust fare rates** in `application.properties` as needed
3. **Test the implementation** with real coordinates
4. **Monitor API usage** if using Google Maps API

For detailed documentation, see `triply-backend/DYNAMIC_FARE_CALCULATION.md`

