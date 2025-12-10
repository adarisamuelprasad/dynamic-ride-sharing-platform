package com.triply.triplybackend.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private String model;

    @Column(nullable = false)
    private String plateNumber;

    @Column(nullable = false)
    private Integer capacity;

    // Optional attributes
    private Boolean acAvailable = false;
    private Boolean sunroofAvailable = false;

    // Store as comma separated URLs or single URL for now
    private String imageUrl;

    @ElementCollection
    @CollectionTable(name = "vehicle_images", joinColumns = @JoinColumn(name = "vehicle_id"))
    @Column(name = "image_url")
    private java.util.List<String> extraImages = new java.util.ArrayList<>();

    public Vehicle() {
    }

    public Vehicle(User user, String model, String plateNumber, Integer capacity, Boolean acAvailable,
            Boolean sunroofAvailable, String imageUrl) {
        this.user = user;
        this.model = model;
        this.plateNumber = plateNumber;
        this.capacity = capacity;
        this.acAvailable = acAvailable;
        this.sunroofAvailable = sunroofAvailable;
        this.imageUrl = imageUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public java.util.List<String> getExtraImages() {
        return extraImages;
    }

    public void setExtraImages(java.util.List<String> extraImages) {
        this.extraImages = extraImages;
    }
}
