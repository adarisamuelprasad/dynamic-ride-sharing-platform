package com.triply.triplybackend.payload;

import com.triply.triplybackend.model.Payment;
import java.util.List;

public class PaymentReportResponse {
    private Double totalRevenue;
    private Long totalTransactions;
    private Double walletBalance;
    private Double totalEarnings;
    private Double totalSpent;
    private List<Payment> transactions;
    private List<Payment> earningsHistory;

    // Getters and Setters
    public Double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(Long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public Double getWalletBalance() {
        return walletBalance;
    }

    public void setWalletBalance(Double walletBalance) {
        this.walletBalance = walletBalance;
    }

    public Double getTotalEarnings() {
        return totalEarnings;
    }

    public void setTotalEarnings(Double totalEarnings) {
        this.totalEarnings = totalEarnings;
    }

    public Double getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(Double totalSpent) {
        this.totalSpent = totalSpent;
    }

    public List<Payment> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<Payment> transactions) {
        this.transactions = transactions;
    }

    public List<Payment> getEarningsHistory() {
        return earningsHistory;
    }

    public void setEarningsHistory(List<Payment> earningsHistory) {
        this.earningsHistory = earningsHistory;
    }
}
