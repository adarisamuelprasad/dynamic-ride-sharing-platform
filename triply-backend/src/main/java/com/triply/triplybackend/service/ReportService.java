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
                        route = p.getBooking().getRide().getSource() + " -> "
                                + p.getBooking().getRide().getDestination();
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

    public byte[] generateTicketPDF(Payment payment) {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            doc.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(doc, page)) {
                content.setFont(PDType1Font.HELVETICA_BOLD, 18);
                content.beginText();
                content.newLineAtOffset(50, 750);
                content.showText("TRIPLY TICKET");
                content.endText();

                content.setFont(PDType1Font.HELVETICA, 12);
                float y = 700;
                String[] lines = {
                        "Booking ID: " + payment.getBooking().getId(),
                        "Transaction ID: " + payment.getTransactionId(),
                        "Amount: INR " + payment.getAmount(),
                        "Date: " + payment.getCreatedAt(),
                        "",
                        "Ride Details:",
                        "From: " + payment.getBooking().getRide().getSource(),
                        "To: " + payment.getBooking().getRide().getDestination(),
                        "Driver: " + payment.getBooking().getRide().getDriver().getName(),
                        "Vehicle: " + payment.getBooking().getRide().getDriver().getVehicleModel() + " ("
                                + payment.getBooking().getRide().getDriver().getLicensePlate() + ")",
                        "Departure: " + payment.getBooking().getRide().getDepartureTime(),
                        "",
                        "Passenger: " + payment.getBooking().getPassenger().getName(),
                        "Seats: " + payment.getBooking().getSeatsBooked(),
                        "",
                        "Status: PAID"
                };

                for (String line : lines) {
                    content.beginText();
                    content.newLineAtOffset(50, y);
                    content.showText(line);
                    content.endText();
                    y -= 20;
                }
            }

            doc.save(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate ticket PDF", e);
        }
    }

    public byte[] generateSummaryReportPDF(java.util.Map<String, Object> stats) {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            doc.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(doc, page)) {
                // Header
                content.setFont(PDType1Font.HELVETICA_BOLD, 22);
                content.beginText();
                content.newLineAtOffset(50, 750);
                content.showText("TripLy Platform Report");
                content.endText();

                content.setFont(PDType1Font.HELVETICA, 12);
                content.beginText();
                content.newLineAtOffset(50, 725);
                content.showText("Generated on: " + java.time.LocalDateTime.now()
                        .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
                content.endText();

                // Stats Section
                float y = 680;

                // Title
                content.setFont(PDType1Font.HELVETICA_BOLD, 16);
                content.beginText();
                content.newLineAtOffset(50, y);
                content.showText("Key Statistics");
                content.endText();
                y -= 30;

                content.setFont(PDType1Font.HELVETICA, 14);

                String[] lines = {
                        "Total Active Users: " + stats.get("totalUsers"),
                        "Total Rides Shared: " + stats.get("totalRides"),
                        "Total Bookings: " + stats.get("totalBookings"),
                        "Total Earnings (Revenue): " + String.format("%.2f", stats.get("totalRevenue"))
                };

                for (String line : lines) {
                    content.beginText();
                    content.newLineAtOffset(70, y);
                    content.showText(line);
                    content.endText();
                    y -= 25;
                }

                y -= 20;
                content.setStrokingColor(0, 0, 0); // Black line
                content.moveTo(50, y);
                content.lineTo(550, y);
                content.stroke();
            }

            doc.save(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate summary report PDF", e);
        }
    }

    public String generateComprehensiveCSV(List<Booking> bookings) {
        StringBuilder csv = new StringBuilder();
        // Header
        csv.append(
                "Booking ID,Passenger Name,Passenger Email,Driver Name,Driver Email,Source,Destination,Date,Seats,Fare,Status,Ride ID\n");

        for (Booking b : bookings) {
            String pName = (b.getPassenger() != null) ? b.getPassenger().getName() : "Unknown";
            String pEmail = (b.getPassenger() != null) ? b.getPassenger().getEmail() : "Unknown";

            String dName = "Unknown";
            String dEmail = "Unknown";
            String source = "Unknown";
            String dest = "Unknown";
            String date = "Unknown";
            Long rideId = null;

            if (b.getRide() != null) {
                rideId = b.getRide().getId();
                source = b.getRide().getSource();
                dest = b.getRide().getDestination();
                date = (b.getRide().getDepartureTime() != null) ? b.getRide().getDepartureTime().toString() : "Unknown";
                if (b.getRide().getDriver() != null) {
                    dName = b.getRide().getDriver().getName();
                    dEmail = b.getRide().getDriver().getEmail();
                }
            }

            // Escape fields that might contain commas
            pName = "\"" + pName.replace("\"", "\"\"") + "\"";
            pEmail = "\"" + pEmail.replace("\"", "\"\"") + "\"";
            dName = "\"" + dName.replace("\"", "\"\"") + "\"";
            dEmail = "\"" + dEmail.replace("\"", "\"\"") + "\"";
            source = "\"" + source.replace("\"", "\"\"") + "\"";
            dest = "\"" + dest.replace("\"", "\"\"") + "\"";

            csv.append(b.getId()).append(",")
                    .append(pName).append(",")
                    .append(pEmail).append(",")
                    .append(dName).append(",")
                    .append(dEmail).append(",")
                    .append(source).append(",")
                    .append(dest).append(",")
                    .append(date).append(",")
                    .append(b.getSeatsBooked()).append(",")
                    .append(b.getFareAmount()).append(",")
                    .append(b.getStatus()).append(",")
                    .append(rideId != null ? rideId : "").append("\n");
        }
        return csv.toString();
    }
}
