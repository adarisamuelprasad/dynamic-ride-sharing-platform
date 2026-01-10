package com.triply.triplybackend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String name;
    private String phone;

    @Enumerated(EnumType.STRING)
    private ERole role;

    // Driver-specific
    private String vehicleModel;
    private String licensePlate;
    private Integer capacity;

    private Boolean blocked = false;
    private Boolean driverVerified = false;
    private Double walletBalance = 0.0;

    private Double averageRating = 0.0;
    private Integer reviewCount = 0;

    public Double getWalletBalance() {
        return walletBalance;
    }

    public void setWalletBalance(Double walletBalance) {
        this.walletBalance = walletBalance;
    }

    public User() {
    }

    public User(Long id, String email, String password, String name, String phone,
            ERole role, String vehicleModel, String licensePlate, Integer capacity) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.name = name;
        this.phone = phone;
        this.role = role;
        this.vehicleModel = vehicleModel;
        this.licensePlate = licensePlate;
        this.capacity = capacity;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public ERole getRole() {
        return role;
    }

    public void setRole(ERole role) {
        this.role = role;
    }

    public Boolean getBlocked() {
        return blocked;
    }

    public void setBlocked(Boolean blocked) {
        this.blocked = blocked;
    }

    public Boolean getDriverVerified() {
        return driverVerified;
    }

    public void setDriverVerified(Boolean driverVerified) {
        this.driverVerified = driverVerified;
    }

    public String getVehicleModel() {
        return vehicleModel;
    }

    public void setVehicleModel(String vehicleModel) {
        this.vehicleModel = vehicleModel;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<Vehicle> vehicles = new java.util.ArrayList<>();

    public java.util.List<Vehicle> getVehicles() {
        return vehicles;
    }

    public void setVehicles(java.util.List<Vehicle> vehicles) {
        this.vehicles = vehicles;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }
}
