package com.triply.triplybackend.service;

import com.triply.triplybackend.model.Booking;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

@Service
public class TicketService {

    public byte[] generateTicketPdf(Booking booking) {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 20);
                contentStream.newLineAtOffset(50, 750);
                contentStream.showText("TripLy - Ride Ticket");
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA, 12);
                contentStream.setLeading(14.5f);
                contentStream.newLineAtOffset(50, 700);

                contentStream.showText("Booking ID: " + booking.getId());
                contentStream.newLine();
                contentStream.showText("Passenger: " + booking.getPassenger().getName());
                contentStream.newLine();
                contentStream.showText("From: " + booking.getRide().getSource());
                contentStream.newLine();
                contentStream.showText("To: " + booking.getRide().getDestination());
                contentStream.newLine();
                contentStream.showText("Date: "
                        + booking.getRide().getDepartureTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
                contentStream.newLine();
                contentStream.showText("Seats: " + booking.getSeatsBooked());
                contentStream.newLine();
                contentStream.showText("Total Fare: ₹" + booking.getFareAmount());
                contentStream.newLine();
                contentStream.showText("Payment Status: " + "PAID (" + booking.getPaymentMethod() + ")");
                contentStream.newLine();
                contentStream.newLine(); // extra space
                contentStream.showText("Driver: " + booking.getRide().getDriver().getName());
                contentStream.newLine();
                contentStream.showText("Vehicle: " + booking.getRide().getDriver().getVehicleModel() + " ("
                        + booking.getRide().getDriver().getLicensePlate() + ")");

                contentStream.endText();
            }

            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            document.save(byteArrayOutputStream);
            return byteArrayOutputStream.toByteArray();

        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}
