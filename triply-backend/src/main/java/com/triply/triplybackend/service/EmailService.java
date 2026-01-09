package com.triply.triplybackend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // true = html

            mailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
            System.err.println("Failed to send email to " + to);
        }
    }

    public void sendTicketEmail(String to, String subject, String body, byte[] pdfAttachment) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            // Multipart mode
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);

            if (pdfAttachment != null) {
                helper.addAttachment("Ticket.pdf", new ByteArrayResource(pdfAttachment));
            }

            mailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
            System.err.println("Failed to send ticket email to " + to);
        }
    }
}
