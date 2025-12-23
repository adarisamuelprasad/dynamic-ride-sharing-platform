package com.triply.triplybackend.service;

import com.triply.triplybackend.model.Booking;
import com.triply.triplybackend.model.Payment;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.util.List;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

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

    public byte[] generatePaymentPDF(List<Payment> payments) {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            doc.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(doc, page)) {
                content.setFont(PDType1Font.HELVETICA_BOLD, 16);
                content.beginText();
                content.newLineAtOffset(50, 750);
                content.showText("Payment Report");
                content.endText();

                float y = 720;
                content.setFont(PDType1Font.HELVETICA, 10);
                for (Payment p : payments) {
                    if (y < 80) {
                        content.close();
                        page = new PDPage(PDRectangle.LETTER);
                        doc.addPage(page);
                        y = 750;
                        content.saveGraphicsState();
                    }
                    String route = "N/A";
                    if (p.getBooking() != null && p.getBooking().getRide() != null) {
                        route = p.getBooking().getRide().getSource() + " -> " + p.getBooking().getRide().getDestination();
                    }
                    String line = String.format("%s | %s | %s | %.2f | %s",
                            p.getCreatedAt(), p.getTransactionId(), route, p.getAmount(), p.getStatus());
                    content.beginText();
                    content.newLineAtOffset(50, y);
                    content.showText(line);
                    content.endText();
                    y -= 14;
                }
            }

            doc.save(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate payment PDF", e);
        }
    }

    public byte[] generatePaymentReceiptPDF(com.triply.triplybackend.model.Booking booking, Payment payment) {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            doc.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(doc, page)) {
                float y = 750;

                // Header
                content.setFont(PDType1Font.HELVETICA_BOLD, 18);
                content.beginText();
                content.newLineAtOffset(50, y);
                content.showText("TripLy Ride Payment Receipt");
                content.endText();
                y -= 30;

                content.setFont(PDType1Font.HELVETICA, 12);
                content.beginText();
                content.newLineAtOffset(50, y);
                content.showText("Receipt No: " + (payment != null ? payment.getTransactionId() : "N/A"));
                content.endText();
                y -= 16;

                content.beginText();
                content.newLineAtOffset(50, y);
                content.showText("Date: " + java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")
                        .format(payment != null ? payment.getCreatedAt() : java.time.LocalDateTime.now()));
                content.endText();
                y -= 30;

                // Ride & parties
                content.setFont(PDType1Font.HELVETICA_BOLD, 13);
                content.beginText();
                content.newLineAtOffset(50, y);
                content.showText("Ride Details");
                content.endText();
                y -= 18;

                content.setFont(PDType1Font.HELVETICA, 11);
                String route = booking.getRide().getSource() + " -> " + booking.getRide().getDestination();
                String depart = booking.getRide().getDepartureTime() != null
                        ? booking.getRide().getDepartureTime().toString()
                        : "Not set";
                String driver = booking.getRide().getDriver() != null ? booking.getRide().getDriver().getName() : "N/A";
                String car = booking.getRide().getVehicleModel() != null ? booking.getRide().getVehicleModel() : "N/A";

                String[] lines = new String[] {
                        "Route: " + route,
                        "Departure: " + depart,
                        "Driver: " + driver,
                        "Vehicle: " + car,
                        "Seats booked: " + booking.getSeatsBooked()
                };
                for (String line : lines) {
                    content.beginText();
                    content.newLineAtOffset(50, y);
                    content.showText(line);
                    content.endText();
                    y -= 14;
                }
                y -= 10;

                // Parties
                content.setFont(PDType1Font.HELVETICA_BOLD, 13);
                content.beginText();
                content.newLineAtOffset(50, y);
                content.showText("Passenger");
                content.endText();
                y -= 16;
                content.setFont(PDType1Font.HELVETICA, 11);
                content.beginText();
                content.newLineAtOffset(50, y);
                content.showText(booking.getPassenger().getName() + " (" + booking.getPassenger().getEmail() + ")");
                content.endText();
                y -= 18;

                // Payment summary
                content.setFont(PDType1Font.HELVETICA_BOLD, 13);
                content.beginText();
                content.newLineAtOffset(50, y);
                content.showText("Payment Summary");
                content.endText();
                y -= 16;

                double amount = payment != null ? payment.getAmount() : (booking.getFareAmount() != null ? booking.getFareAmount() : 0.0);
                String status = payment != null ? payment.getStatus() : "PENDING";
                String method = booking.getPaymentMethod() != null ? booking.getPaymentMethod() : "N/A";
                String summary = String.format("Amount Paid: ₹%.2f | Method: %s | Status: %s", amount, method, status);

                content.setFont(PDType1Font.HELVETICA, 11);
                content.beginText();
                content.newLineAtOffset(50, y);
                content.showText(summary);
                content.endText();
                y -= 16;

                content.beginText();
                content.newLineAtOffset(50, y);
                content.showText("Booking ID: " + booking.getId());
                content.endText();
                y -= 14;

                content.beginText();
                content.newLineAtOffset(50, y);
                content.showText("Ride ID: " + booking.getRide().getId());
                content.endText();
                y -= 20;

                content.setFont(PDType1Font.HELVETICA_OBLIQUE, 9);
                content.beginText();
                content.newLineAtOffset(50, y);
                content.showText("Thank you for riding with TripLy.");
                content.endText();
            }

            doc.save(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate payment receipt PDF", e);
        }
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

    public byte[] generateBookingPDF(List<Booking> bookings) {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            doc.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(doc, page)) {
                content.setFont(PDType1Font.HELVETICA_BOLD, 16);
                content.beginText();
                content.newLineAtOffset(50, 750);
                content.showText("Booking Report");
                content.endText();

                float y = 720;
                content.setFont(PDType1Font.HELVETICA, 10);
                for (Booking b : bookings) {
                    if (y < 80) {
                        content.close();
                        page = new PDPage(PDRectangle.LETTER);
                        doc.addPage(page);
                        y = 750;
                        content.saveGraphicsState();
                    }
                    String line = String.format("Booking %d | Ride %d | %s -> %s | %s seats | ₹%.2f | %s",
                            b.getId(),
                            b.getRide().getId(),
                            b.getRide().getSource(),
                            b.getRide().getDestination(),
                            b.getSeatsBooked(),
                            b.getFareAmount(),
                            b.getStatus());
                    content.beginText();
                    content.newLineAtOffset(50, y);
                    content.showText(line);
                    content.endText();
                    y -= 14;
                }
            }

            doc.save(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate booking PDF", e);
        }
    }
}
