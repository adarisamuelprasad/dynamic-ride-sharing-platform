package com.triply.triplybackend.payload.requests;

public class UpdateProfileRequest {
    private String name;
    private String phone;
    // Email is specifically excluded as it cannot be changed

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
}
