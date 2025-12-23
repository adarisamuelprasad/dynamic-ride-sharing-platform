package com.triply.triplybackend.service;

import com.triply.triplybackend.model.Booking;
import com.triply.triplybackend.model.Payment;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportService {

    public String generatePaymentCSV(List<Payment> payments) {
        StringBuilder csv = new StringBuilder();
        csv.append("Date,Transaction ID,Type,Route,Amount,Status\n");

        for (Payment p : payments) {
            String route = "N/A";
            if (p.getBooking() != null && p.getBooking().getRide() != null) {
                route = p.getBooking().getRide().getSource() + " -> " + p.getBooking().getRide().getDestination();
            }

            csv.append(p.getCreatedAt()).append(",")
                    .append(p.getTransactionId() != null ? p.getTransactionId() : "").append(",")
                    .append(p.getType()).append(",")
                    .append("\"").append(route).append("\"").append(",")
                    .append(p.getAmount()).append(",")
                    .append(p.getStatus()).append("\n");
        }

        return csv.toString();
    }

    public String generateBookingCSV(List<Booking> bookings) {
        StringBuilder csv = new StringBuilder();
        csv.append("Booking ID,Ride ID,Source,Destination,Departure Time,Seats,Fare,Status\n");

        for (Booking b : bookings) {
            csv.append(b.getId()).append(",")
                    .append(b.getRide().getId()).append(",")
                    .append("\"").append(b.getRide().getSource()).append("\"").append(",")
                    .append("\"").append(b.getRide().getDestination()).append("\"").append(",")
                    .append(b.getRide().getDepartureTime()).append(",")
                    .append(b.getSeatsBooked()).append(",")
                    .append(b.getFareAmount()).append(",")
                    .append(b.getStatus()).append("\n");
        }

        return csv.toString();
    }
}
