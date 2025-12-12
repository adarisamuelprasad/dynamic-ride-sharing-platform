package com.triply.triplybackend.payload.requests;

public class VehicleRequest {
    private String model;
    private String plateNumber;
    private Integer capacity;
    private Boolean acAvailable;
    private Boolean sunroofAvailable;
    private String imageUrl;

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

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    private java.util.List<String> extraImages;

    public java.util.List<String> getExtraImages() {
        return extraImages;
    }

    public void setExtraImages(java.util.List<String> extraImages) {
        this.extraImages = extraImages;
    }
}
