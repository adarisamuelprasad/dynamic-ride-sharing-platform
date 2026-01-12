package com.triply.triplybackend.payload.requests;

import java.time.LocalDateTime;
import java.util.List;

public class RideRequest {

    private String source;
    private String destination;
    private LocalDateTime departureTime;
    private int availableSeats;
    private double farePerSeat;
    private Double sourceLat;
    private Double sourceLng;
    private Double destLat;
    private Double destLng;
    private Long vehicleId;

    private Boolean smokingAllowed;
    private Boolean petsAllowed;
    private Boolean instantBooking;
    private Boolean maxTwoInBack;

    // Optional vehicle override/update fields
    private String model;
    private String plateNumber;
    private String imageUrl;
    private List<String> extraImages;
    private Boolean acAvailable;
    private Boolean sunroofAvailable;

    public RideRequest() {
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public LocalDateTime getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(LocalDateTime departureTime) {
        this.departureTime = departureTime;
    }

    public int getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(int availableSeats) {
        this.availableSeats = availableSeats;
    }

    public double getFarePerSeat() {
        return farePerSeat;
    }

    public void setFarePerSeat(double farePerSeat) {
        this.farePerSeat = farePerSeat;
    }

    public Double getSourceLat() {
        return sourceLat;
    }

    public void setSourceLat(Double sourceLat) {
        this.sourceLat = sourceLat;
    }

    public Double getSourceLng() {
        return sourceLng;
    }

    public void setSourceLng(Double sourceLng) {
        this.sourceLng = sourceLng;
    }

    public Double getDestLat() {
        return destLat;
    }

    public void setDestLat(Double destLat) {
        this.destLat = destLat;
    }

    public Double getDestLng() {
        return destLng;
    }

    public void setDestLng(Double destLng) {
        this.destLng = destLng;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public Boolean getSmokingAllowed() {
        return smokingAllowed;
    }

    public void setSmokingAllowed(Boolean smokingAllowed) {
        this.smokingAllowed = smokingAllowed;
    }

    public Boolean getPetsAllowed() {
        return petsAllowed;
    }

    public void setPetsAllowed(Boolean petsAllowed) {
        this.petsAllowed = petsAllowed;
    }

    public Boolean getInstantBooking() {
        return instantBooking;
    }

    public void setInstantBooking(Boolean instantBooking) {
        this.instantBooking = instantBooking;
    }

    public Boolean getMaxTwoInBack() {
        return maxTwoInBack;
    }

    public void setMaxTwoInBack(Boolean maxTwoInBack) {
        this.maxTwoInBack = maxTwoInBack;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getPlateNumber() {
        return plateNumber;
    }

    public void setPlateNumber(String plateNumber) {
        this.plateNumber = plateNumber;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<String> getExtraImages() {
        return extraImages;
    }

    public void setExtraImages(List<String> extraImages) {
        this.extraImages = extraImages;
    }

    public Boolean getAcAvailable() {
        return acAvailable;
    }

    public void setAcAvailable(Boolean acAvailable) {
        this.acAvailable = acAvailable;
    }

    public Boolean getSunroofAvailable() {
        return sunroofAvailable;
    }

    public void setSunroofAvailable(Boolean sunroofAvailable) {
        this.sunroofAvailable = sunroofAvailable;
    }

    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
