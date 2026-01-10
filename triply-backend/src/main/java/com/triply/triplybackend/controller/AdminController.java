package com.triply.triplybackend.controller;

import com.triply.triplybackend.model.User;
import com.triply.triplybackend.model.Ride;
import com.triply.triplybackend.model.Booking;
import com.triply.triplybackend.model.ERole;
import com.triply.triplybackend.model.Review;
import com.triply.triplybackend.payload.requests.AdminUpdateUserRequest;
import com.triply.triplybackend.repository.UserRepository;
import com.triply.triplybackend.repository.RideRepository;
import com.triply.triplybackend.repository.BookingRepository;
import com.triply.triplybackend.repository.ReviewRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository users;

    @Autowired
    private RideRepository rides;

    @Autowired
    private BookingRepository bookings;

    @Autowired
    private ReviewRepository reviews;

    @GetMapping("/users")
    public Page<User> allUsers(Pageable pageable) {
        return users.findAll(pageable);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody AdminUpdateUserRequest body) {
        return users.findById(id)
                .map(u -> {
                    if (body.getName() != null)
                        u.setName(body.getName());
                    if (body.getPhone() != null)
                        u.setPhone(body.getPhone());
                    if (body.getBlocked() != null)
                        u.setBlocked(body.getBlocked());
                    if (body.getDriverVerified() != null)
                        u.setDriverVerified(body.getDriverVerified());
                    if (body.getVehicleModel() != null)
                        u.setVehicleModel(body.getVehicleModel());
                    if (body.getLicensePlate() != null)
                        u.setLicensePlate(body.getLicensePlate());
                    if (body.getCapacity() != null)
                        u.setCapacity(body.getCapacity());
                    if (body.getRole() != null) {
                        try {
                            u.setRole(ERole.valueOf(body.getRole()));
                        } catch (IllegalArgumentException ignored) {
                        }
                    }
                    users.save(u);
                    return ResponseEntity.ok(u);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!users.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        users.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{id}/block")
    public ResponseEntity<?> blockUser(@PathVariable Long id, @RequestParam boolean blocked) {
        return users.findById(id)
                .map(u -> {
                    u.setBlocked(blocked);
                    users.save(u);
                    return ResponseEntity.ok().build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/users/{id}/verify-driver")
    public ResponseEntity<?> verifyDriver(@PathVariable Long id) {
        return users.findById(id)
                .map(u -> {
                    u.setDriverVerified(true);
                    users.save(u);
                    return ResponseEntity.ok().build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/rides")
    public Page<Ride> allRides(Pageable pageable) {
        return rides.findAll(pageable);
    }

    @GetMapping("/bookings")
    public Page<Booking> allBookings(Pageable pageable) {
        return bookings.findAll(pageable);
    }

    @GetMapping("/rude-activity")
    public Page<Review> rudeActivity(Pageable pageable) {
        // Fetch reviews with rating < 3 as "rude" behavior indicator
        return reviews.findByRatingLessThan(3, pageable);
    }

    @GetMapping("/payments")
    public List<Map<String, Object>> payments() {
        // Payments are not modeled yet; return empty list for now
        return Collections.emptyList();
    }

    @Autowired
    private com.triply.triplybackend.repository.PaymentRepository paymentRepository;

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics(@RequestParam(required = false) String period) {
        try {
            LocalDateTime endDate = LocalDateTime.now();
            LocalDateTime startDate;

            // Determine time range based on period
            switch (period != null ? period : "month") {
                case "today":
                    startDate = endDate.toLocalDate().atStartOfDay();
                    break;
                case "week":
                    startDate = endDate.minusWeeks(1);
                    break;
                case "month":
                    startDate = endDate.minusMonths(1);
                    break;
                case "10days":
                    startDate = endDate.minusDays(10);
                    break;
                case "quarter":
                    startDate = endDate.minusMonths(3);
                    break;
                case "year":
                    startDate = endDate.minusYears(1);
                    break;
                default:
                    startDate = endDate.minusMonths(1);
            }

            // Get all data within time range
            // Note: Since Booking and Ride don't have createdAt, we'll use departureTime
            // for rides
            // and include all bookings and payments
            List<Ride> ridesInRange = rides.findAll().stream()
                    .filter(r -> r.getDepartureTime() != null &&
                            r.getDepartureTime().isAfter(startDate) &&
                            r.getDepartureTime().isBefore(endDate))
                    .toList();

            List<com.triply.triplybackend.model.Payment> paymentsInRange = paymentRepository.findAll().stream()
                    .filter(p -> p.getCreatedAt() != null &&
                            p.getCreatedAt().isAfter(startDate) &&
                            p.getCreatedAt().isBefore(endDate))
                    .toList();

            // Get bookings in range (filter by Ride departure time as proxy for booking
            // time)
            List<Booking> bookingsInRange = bookings.findAll().stream()
                    .filter(b -> b.getRide() != null &&
                            b.getRide().getDepartureTime() != null &&
                            b.getRide().getDepartureTime().isAfter(startDate) &&
                            b.getRide().getDepartureTime().isBefore(endDate))
                    .toList();

            // Calculate financial metrics
            double totalRevenue = paymentsInRange.stream()
                    .filter(p -> "PAID".equals(p.getStatus()))
                    .mapToDouble(com.triply.triplybackend.model.Payment::getAmount)
                    .sum();

            double pendingRevenue = paymentsInRange.stream()
                    .filter(p -> "PENDING".equals(p.getStatus()) || "UNPAID".equals(p.getStatus()))
                    .mapToDouble(com.triply.triplybackend.model.Payment::getAmount)
                    .sum();

            long confirmedBookings = bookingsInRange.stream()
                    .filter(b -> "CONFIRMED".equals(b.getStatus()))
                    .count();

            long cancelledBookings = bookingsInRange.stream()
                    .filter(b -> "CANCELLED".equals(b.getStatus()))
                    .count();

            long activeRides = ridesInRange.stream()
                    .filter(r -> r.getAvailableSeats() > 0)
                    .count();

            // Get unique drivers and passengers
            long activeDrivers = ridesInRange.stream()
                    .map(r -> r.getDriver().getId())
                    .distinct()
                    .count();

            long activePassengers = bookingsInRange.stream()
                    .map(b -> b.getPassenger().getId())
                    .distinct()
                    .count();

            // Create response
            Map<String, Object> analytics = new java.util.HashMap<>();
            analytics.put("period", period != null ? period : "month");
            analytics.put("startDate", startDate);
            analytics.put("endDate", endDate);

            Map<String, Object> financial = new java.util.HashMap<>();
            financial.put("totalRevenue", totalRevenue);
            financial.put("pendingRevenue", pendingRevenue);
            financial.put("totalTransactions", paymentsInRange.size());
            financial.put("paidTransactions",
                    paymentsInRange.stream().filter(p -> "PAID".equals(p.getStatus())).count());
            analytics.put("financial", financial);

            Map<String, Object> activity = new java.util.HashMap<>();
            activity.put("totalRides", ridesInRange.size());
            activity.put("activeRides", activeRides);
            activity.put("totalBookings", bookingsInRange.size());
            activity.put("confirmedBookings", confirmedBookings);
            activity.put("cancelledBookings", cancelledBookings);
            activity.put("activeDrivers", activeDrivers);
            activity.put("activePassengers", activePassengers);
            analytics.put("activity", activity);

            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error generating analytics: " + e.getMessage());
        }
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new java.util.HashMap<>();

        long totalUsers = users.count();
        long totalRides = rides.count();
        long totalBookings = bookings.count();

        // Calculate total revenue from PAID payments
        double totalRevenue = paymentRepository.findAll().stream()
                .filter(p -> "PAID".equals(p.getStatus()))
                .mapToDouble(com.triply.triplybackend.model.Payment::getAmount)
                .sum();

        stats.put("totalUsers", totalUsers);
        stats.put("totalRides", totalRides);
        stats.put("totalBookings", totalBookings);
        stats.put("totalRevenue", totalRevenue);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/dashboard-charts")
    public ResponseEntity<List<Map<String, Object>>> getDashboardCharts() {
        List<Map<String, Object>> chartData = new java.util.ArrayList<>();
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(6); // Last 7 days including today

        // Get raw data
        List<com.triply.triplybackend.model.Payment> payments = paymentRepository.findAll();
        List<Booking> allBookings = bookings.findAll();

        // Iterate through each of the last 7 days
        for (int i = 0; i < 7; i++) {
            java.time.LocalDate date = startDate.plusDays(i).toLocalDate();
            Map<String, Object> daily = new java.util.HashMap<>();
            daily.put("name", date.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM")));

            // Calculate daily revenue
            double dailyRevenue = payments.stream()
                    .filter(p -> p.getCreatedAt() != null &&
                            p.getCreatedAt().toLocalDate().isEqual(date) &&
                            "PAID".equals(p.getStatus()))
                    .mapToDouble(com.triply.triplybackend.model.Payment::getAmount)
                    .sum();

            // Calculate daily bookings (using Ride departure time as proxy)
            long dailyBookings = allBookings.stream()
                    .filter(b -> b.getRide() != null &&
                            b.getRide().getDepartureTime() != null &&
                            b.getRide().getDepartureTime().toLocalDate().isEqual(date))
                    .count();

            daily.put("revenue", dailyRevenue);
            daily.put("bookings", dailyBookings);
            chartData.add(daily);
        }

        return ResponseEntity.ok(chartData);
    }

    @Autowired
    private com.triply.triplybackend.service.ReportService reportService;

    @GetMapping("/reports/summary")
    public ResponseEntity<byte[]> downloadSummaryReport() {
        // Get all bookings for comprehensive report
        List<Booking> allBookings = bookings.findAll();

        // Generate CSV
        String csvContent = reportService.generateComprehensiveCSV(allBookings);
        byte[] csvBytes = csvContent.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=triply_detailed_report.csv")
                .contentType(org.springframework.http.MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
}
