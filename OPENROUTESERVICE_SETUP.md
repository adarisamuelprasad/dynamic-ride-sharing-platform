# OpenRouteService API Setup Guide

## Overview

TripLy now uses **OpenRouteService** as a free alternative to Google Maps API for calculating road distances. OpenRouteService provides free access to routing and distance calculation APIs without requiring a credit card.

## Why OpenRouteService?

✅ **Completely Free** - No credit card required  
✅ **Generous Free Tier** - 2,000 requests/day  
✅ **No API Key Required** - Works without key (uses Haversine fallback)  
✅ **Open Source** - Built on OpenStreetMap data  
✅ **Accurate** - Real road distance calculations  

## Setup Process

### Step 1: Get Free API Key (Optional but Recommended)

1. **Visit OpenRouteService:**
   - Go to [https://openrouteservice.org/dev/#/signup](https://openrouteservice.org/dev/#/signup)

2. **Create Account:**
   - Click "Sign Up" or "Get API Key"
   - Fill in your details (email, password)
   - Verify your email address

3. **Get Your API Key:**
   - After login, go to your dashboard
   - Copy your API key (starts with something like `5b3ce3597851110001cf6248...`)

### Step 2: Configure in Application

**Option A: Environment Variable (Recommended)**
```bash
# Windows (PowerShell)
$env:OPENROUTE_API_KEY="your_api_key_here"

# Windows (CMD)
set OPENROUTE_API_KEY=your_api_key_here

# Linux/Mac
export OPENROUTE_API_KEY=your_api_key_here
```

**Option B: application.properties**
```properties
openroute.api.key=your_api_key_here
```

### Step 3: Without API Key

If you don't set up an API key:
- System automatically uses **Haversine formula** (straight-line distance)
- Less accurate but works perfectly fine
- No external API calls needed
- No rate limits

## API Limits (Free Tier)

- **2,000 requests per day**
- **50 requests per minute**
- More than enough for development and small-scale production

## How It Works

### With API Key:
1. When a ride is posted with coordinates
2. System calls OpenRouteService Directions API
3. Gets actual road distance in meters
4. Converts to kilometers
5. Calculates fare: `Base Fare + (Rate × Distance)`

### Without API Key:
1. System uses Haversine formula
2. Calculates straight-line distance
3. Slightly less accurate but still functional
4. No external dependencies

## Testing

### Test with API Key:
```bash
# Post a ride with coordinates
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

The system will:
1. Call OpenRouteService API
2. Get road distance (e.g., 150 km)
3. Calculate fare: 50 + (8 × 150) = ₹1,250

### Test without API Key:
Same request, but system uses Haversine formula for distance calculation.

## Troubleshooting

### API Key Not Working?
1. **Check API key format** - Should be a long string
2. **Verify account status** - Make sure account is active
3. **Check rate limits** - Ensure you haven't exceeded daily limit
4. **System will auto-fallback** - Uses Haversine if API fails

### Getting Errors?
- Check application logs for API errors
- Verify API key is correct
- System automatically falls back to Haversine formula
- No action needed - it will work either way

## Comparison: OpenRouteService vs Google Maps

| Feature | OpenRouteService | Google Maps |
|---------|------------------|-------------|
| **Cost** | Free (2K/day) | Paid after free tier |
| **Credit Card** | Not required | Required |
| **Accuracy** | High (OSM data) | Very High |
| **Rate Limits** | 2K/day, 50/min | Varies by plan |
| **Setup** | Simple signup | Complex billing |

## Alternative: OSRM (Completely Free, No Signup)

If you want even more freedom, you can use OSRM (Open Source Routing Machine):
- No API key needed
- Self-hosted option available
- Completely free and open source

For now, OpenRouteService is the recommended option as it's the easiest to set up.

## Next Steps

1. **Get API key** (optional but recommended)
2. **Set environment variable** or add to `application.properties`
3. **Test the implementation** with real coordinates
4. **Monitor usage** if using API key (check dashboard)

For more information, visit: [https://openrouteservice.org/](https://openrouteservice.org/)

