# Dynamic Fare Calculation Feature

## Overview

The TripLy platform now includes a dynamic fare calculation system that uses Google Maps Distance Matrix API to calculate accurate travel distances and compute fares based on the formula:

**Fare = Base Fare + (Rate per Km × Distance)**

## How It Works

### 1. Distance Calculation
- When a ride is posted, if coordinates (latitude/longitude) are provided, the system uses **Google Maps Distance Matrix API** to calculate the actual road distance between source and destination.
- If the Google Maps API key is not configured or the API call fails, the system automatically falls back to the **Haversine formula** for straight-line distance calculation.

### 2. Fare Calculation Formula
```
Fare Per Seat = Base Fare + (Rate per Km × Distance in Km)
```

**Example:**
- Base Fare: ₹50
- Rate per Km: ₹8
- Distance: 100 km
- **Fare Per Seat = 50 + (8 × 100) = ₹850**

### 3. Proportional Fare Splitting
When multiple passengers book seats on the same ride:
- Each passenger pays the same fare per seat
- Total fare for a booking = Number of Seats × Fare Per Seat
- This ensures fair cost distribution where all passengers share the cost equally

**Example:**
- Fare Per Seat: ₹850
- 2 seats booked
- **Total Fare = 2 × 850 = ₹1,700**

## Configuration

### Application Properties

Edit `src/main/resources/application.properties`:

```properties
# Google Maps API Configuration
google.maps.api.key=YOUR_GOOGLE_MAPS_API_KEY
google.maps.distance.matrix.url=https://maps.googleapis.com/maps/api/distancematrix/json

# Fare Calculation Configuration
fare.base=50.0          # Base fare in ₹
fare.rate.per.km=8.0    # Rate per kilometer in ₹
```

### Setting Up Google Maps API Key

1. **Get API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the **Distance Matrix API**
   - Create credentials (API Key)
   - Restrict the API key to Distance Matrix API for security

2. **Set Environment Variable (Recommended):**
   ```bash
   export GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
   
   Or set it in `application.properties`:
   ```properties
   google.maps.api.key=your_api_key_here
   ```

3. **Without API Key:**
   - The system will automatically use the Haversine formula (straight-line distance)
   - This is less accurate but works without external API dependencies

## Implementation Details

### Files Modified/Created

1. **GoogleMapsService.java** (New)
   - Handles Google Maps Distance Matrix API calls
   - Falls back to Haversine formula if API is unavailable
   - Location: `src/main/java/com/triply/triplybackend/service/GoogleMapsService.java`

2. **RideService.java** (Modified)
   - Updated `postRide()` method to use GoogleMapsService
   - Implements dynamic fare calculation formula
   - Location: `src/main/java/com/triply/triplybackend/service/RideService.java`

3. **BookingController.java** (Modified)
   - Enhanced comments explaining proportional fare splitting
   - Location: `src/main/java/com/triply/triplybackend/controller/BookingController.java`

4. **RideController.java** (Modified)
   - Added CORS annotation to fix live ride feed data visibility
   - Location: `src/main/java/com/triply/triplybackend/controller/RideController.java`

5. **application.properties** (Modified)
   - Added Google Maps API configuration
   - Added fare calculation parameters
   - Location: `src/main/resources/application.properties`

## Usage

### Posting a Ride

When posting a ride, the system automatically calculates the fare if:
- `farePerSeat` is not provided or is ≤ 0
- Coordinates (sourceLat, sourceLng, destLat, destLng) are provided

**Request Example:**
```json
{
  "source": "Bangalore",
  "destination": "Mysore",
  "departureTime": "2025-12-25T10:00:00",
  "availableSeats": 4,
  "sourceLat": 12.9716,
  "sourceLng": 77.5946,
  "destLat": 12.2958,
  "destLng": 76.6394,
  "farePerSeat": 0  // Will be calculated automatically
}
```

**Response:**
The ride will include the calculated `farePerSeat` based on the actual road distance.

### Booking a Ride

When booking, the fare is automatically calculated proportionally:

**Request Example:**
```json
{
  "rideId": 1,
  "seatsBooked": 2
}
```

**Calculation:**
- If `farePerSeat` = ₹850
- Total fare = 2 × ₹850 = ₹1,700

## Benefits

1. **Accurate Pricing:** Uses real road distances instead of straight-line calculations
2. **Fair Distribution:** Proportional cost splitting ensures all passengers pay equally
3. **Flexible Configuration:** Easy to adjust base fare and rate per km
4. **Resilient:** Automatic fallback to Haversine if Google Maps API is unavailable
5. **Transparent:** Clear fare calculation formula for drivers and passengers

## Troubleshooting

### Rides Not Showing in Live Feed

**Issue:** Database data not visible in live ride feed

**Solution:**
- Added `@CrossOrigin` annotation to `RideController`
- Ensure backend is running on port 8082
- Check browser console for CORS errors
- Verify database connection in `application.properties`

### Google Maps API Errors

**Issue:** API calls failing

**Solutions:**
1. Verify API key is correct
2. Check if Distance Matrix API is enabled
3. Verify API key restrictions allow your server IP
4. Check API quota/billing in Google Cloud Console
5. System will automatically fall back to Haversine formula

### Fare Calculation Issues

**Issue:** Fare seems incorrect

**Solutions:**
1. Check `fare.base` and `fare.rate.per.km` in `application.properties`
2. Verify coordinates are correct (latitude/longitude)
3. Check if Google Maps API is returning valid distance
4. Review logs for any calculation errors

## Future Enhancements

Potential improvements:
- Support for intermediate stops (partial route fare calculation)
- Dynamic pricing based on demand (surge pricing)
- Different rates for different vehicle types
- Time-based fare adjustments (peak hours)
- Distance-based fare splitting for partial routes

