package com.triply.triplybackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.core.ParameterizedTypeReference;

import java.util.Map;
import java.util.List;

@Service
public class GoogleMapsService {

    @Value("${openroute.api.key:}")
    private String apiKey;

    @Value("${openroute.directions.url:https://api.openrouteservice.org/v2/directions/driving-car}")
    private String directionsUrl;

    private final RestTemplate restTemplate;

    public GoogleMapsService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Calculate distance between two points using OpenRouteService API (Free)
     * Falls back to Haversine formula if API key is not configured
     * 
     * @param sourceLat Source latitude
     * @param sourceLng Source longitude
     * @param destLat   Destination latitude
     * @param destLng   Destination longitude
     * @return Distance in kilometers
     */
    public double calculateDistance(double sourceLat, double sourceLng, double destLat, double destLng) {
        // If API key is not configured, fall back to haversine formula
        if (apiKey == null || apiKey.isEmpty()) {
            return haversineDistance(sourceLat, sourceLng, destLat, destLng);
        }

        try {
            // OpenRouteService API format: coordinates as [[lon, lat], [lon, lat]] for V2
            String coordinates = "[[" + sourceLng + "," + sourceLat + "],[" + destLng + "," + destLat + "]]";
            String url = directionsUrl + "?coordinates=" + coordinates;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", apiKey);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            @SuppressWarnings("null")
            ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            Map<String, Object> response = responseEntity.getBody();

            if (response != null) {
                @SuppressWarnings("unchecked")
                List<Object> routes = (List<Object>) response.get("routes");
                if (routes != null && !routes.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> route = (Map<String, Object>) routes.get(0);
                    @SuppressWarnings("unchecked")
                    Map<String, Object> summary = (Map<String, Object>) route.get("summary");
                    if (summary != null) {
                        Object distance = summary.get("distance");
                        if (distance instanceof Number) {
                            // Distance is in meters, convert to kilometers
                            return ((Number) distance).doubleValue() / 1000.0;
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Log error and fall back to haversine
            System.err.println("Error calling OpenRouteService API: " + e.getMessage());
            e.printStackTrace();
        }

        // Fallback to haversine if API call fails
        return haversineDistance(sourceLat, sourceLng, destLat, destLng);
    }

    /**
     * Get coordinates for a given location name using Nominatim (OpenStreetMap) API
     * Free to use, no API key required for low volume.
     * 
     * @param locationName Location name (e.g., "Mumbai")
     * @return Array of [lat, lng] or null if not found
     */
    public double[] getCoordinates(String locationName) {
        try {
            // Nominatim API:
            // https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=1
            String url = "https://nominatim.openstreetmap.org/search?q=" + locationName + "&format=json&limit=1";

            // Nominatim requires a User-Agent header
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "TriplyRideSharingApp/1.0");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            @SuppressWarnings("null")
            ResponseEntity<List<Map<String, Object>>> responseEntity = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {
                    });

            List<Map<String, Object>> response = responseEntity.getBody();

            if (response != null && !response.isEmpty()) {
                Map<String, Object> firstResult = response.get(0);
                String latStr = (String) firstResult.get("lat");
                String lonStr = (String) firstResult.get("lon");

                if (latStr != null && lonStr != null) {
                    return new double[] { Double.parseDouble(latStr), Double.parseDouble(lonStr) };
                }
            }
        } catch (Exception e) {
            System.err.println("Error calling Nominatim Geocoding API: " + e.getMessage());
        }

        return null;
    }

    /**
     * Search for locations matching the query string (Autocomplete)
     * 
     * @param query Search query (e.g., "Shamsha")
     * @return List of location matches with display name and coordinates
     */
    public List<Map<String, Object>> autocomplete(String query) {
        try {
            // Nominatim API:
            // https://nominatim.openstreetmap.org/search?q={query}&format=json&addressdetails=1&limit=5
            String url = "https://nominatim.openstreetmap.org/search?q=" + query
                    + "&format=json&addressdetails=1&limit=5";

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "TriplyRideSharingApp/1.0");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            @SuppressWarnings("null")
            ResponseEntity<List<Map<String, Object>>> responseEntity = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {
                    });

            return responseEntity.getBody();
        } catch (Exception e) {
            System.err.println("Error calling Nominatim Autocomplete API: " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Haversine formula for calculating distance between two points on Earth
     * Used as fallback when OpenRouteService API is unavailable
     */
    private double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
