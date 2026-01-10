package com.triply.triplybackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Autowired;

import com.triply.triplybackend.model.User;
import com.triply.triplybackend.model.ERole;
import com.triply.triplybackend.model.Ride;
import com.triply.triplybackend.repository.UserRepository;
import com.triply.triplybackend.repository.RideRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })
@EnableScheduling
public class TriplyBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(TriplyBackendApplication.class, args);
    }

    @Bean
    CommandLineRunner seed(
            @Autowired UserRepository users,
            @Autowired RideRepository rides,
            @Autowired com.triply.triplybackend.repository.BookingRepository bookings,
            @Autowired BCryptPasswordEncoder encoder) {
        return args -> {
            // --- 1. USERS ---

            // Admin
            if (users.findByEmail("admin@example.com").isEmpty()) {
                User admin = new User();
                admin.setEmail("admin@example.com");
                admin.setPassword(encoder.encode("admin"));
                admin.setName("Super Admin");
                admin.setRole(ERole.ROLE_ADMIN);
                users.save(admin);
            }

            // Driver 1: Samuel
            User samuel = users.findByEmail("samuel@driver.com").orElseGet(() -> {
                User u = new User();
                u.setEmail("samuel@driver.com");
                u.setPassword(encoder.encode("password"));
                u.setName("Samuel Prasad");
                u.setPhone("9876543210");
                u.setRole(ERole.ROLE_DRIVER);
                u.setVehicleModel("Toyota Innova Crysta");
                u.setLicensePlate("KA-01-AB-1234");
                u.setCapacity(6);
                u.setDriverVerified(true);
                return users.save(u);
            });

            // Driver 2: Sarah
            User sarah = users.findByEmail("sarah@driver.com").orElseGet(() -> {
                User u = new User();
                u.setEmail("sarah@driver.com");
                u.setPassword(encoder.encode("password"));
                u.setName("Sarah Jones");
                u.setPhone("9876543211");
                u.setRole(ERole.ROLE_DRIVER);
                u.setVehicleModel("Honda City");
                u.setLicensePlate("MH-02-XY-9876");
                u.setCapacity(4);
                u.setDriverVerified(false);
                return users.save(u);
            });

            // Passenger 1: John
            User john = users.findByEmail("john@passenger.com").orElseGet(() -> {
                User u = new User();
                u.setEmail("john@passenger.com");
                u.setPassword(encoder.encode("password"));
                u.setName("John Doe");
                u.setRole(ERole.ROLE_PASSENGER);
                return users.save(u);
            });

            // Passenger 2: Emily
            User emily = users.findByEmail("emily@passenger.com").orElseGet(() -> {
                User u = new User();
                u.setEmail("emily@passenger.com");
                u.setPassword(encoder.encode("password"));
                u.setName("Emily Blunt");
                u.setRole(ERole.ROLE_PASSENGER);
                return users.save(u);
            });

            // --- 2. RIDES ---

            // Only seed initial rides if DB is empty-ish
            if (rides.count() < 3) {
                // Ride 1
                Ride r1 = new Ride();
                r1.setSource("Bangalore");
                r1.setDestination("Mysore");
                r1.setDepartureTime(LocalDateTime.now().plusDays(1).withHour(8).withMinute(30));
                r1.setAvailableSeats(4);
                r1.setFarePerSeat(450.00);
                r1.setDriver(samuel);
                r1 = rides.save(r1);

                // Ride 2
                Ride r2 = new Ride();
                r2.setSource("Mumbai");
                r2.setDestination("Pune");
                r2.setDepartureTime(LocalDateTime.now().plusDays(2).withHour(10).withMinute(0));
                r2.setAvailableSeats(4);
                r2.setFarePerSeat(800.00);
                r2.setDriver(sarah);
                rides.save(r2);

                // Ride 3
                Ride r3 = new Ride();
                r3.setSource("Chennai");
                r3.setDestination("Pondicherry");
                r3.setDepartureTime(LocalDateTime.now().plusHours(5));
                r3.setAvailableSeats(6);
                r3.setFarePerSeat(600.00);
                r3.setDriver(samuel);
                rides.save(r3);

                // bookings for these rides
                if (bookings.count() == 0) {
                    com.triply.triplybackend.model.Booking b1 = new com.triply.triplybackend.model.Booking();
                    b1.setPassenger(john);
                    b1.setRide(r1);
                    b1.setSeatsBooked(1);
                    b1.setStatus("CONFIRMED");
                    bookings.save(b1);

                    com.triply.triplybackend.model.Booking b2 = new com.triply.triplybackend.model.Booking();
                    b2.setPassenger(emily);
                    b2.setRide(r1);
                    b2.setSeatsBooked(1);
                    b2.setStatus("PENDING");
                    bookings.save(b2);
                }
            }

            // --- 3. ADDITIONAL 8 DRIVERS & RIDES ---
            // Create these only if we don't have enough users (prevent duplicates)
            if (users.count() < 12) {
                String[] sources = { "Delhi", "Hyderabad", "Kolkata", "Ahmedabad", "Surat", "Pune", "Jaipur",
                        "Lucknow" };
                String[] destinations = { "Agra", "Warangal", "Durgapur", "Vadodara", "Vapi", "Nasik", "Ajmer",
                        "Kanpur" };
                String[] models = { "Maruti Suzuki Swift", "Hyundai Creta", "Tata Nexon", "Kia Seltos",
                        "Mahindra XUV700", "MG Hector", "Toyota Fortuner", "Renault Duster" };
                int[] prices = { 400, 500, 350, 450, 300, 600, 550, 250 };

                for (int i = 0; i < 8; i++) {
                    int finalI = i;
                    String email = "driver" + (i + 1) + "@triply.com";

                    User driver = users.findByEmail(email).orElseGet(() -> {
                        User u = new User();
                        u.setEmail(email);
                        u.setPassword(encoder.encode("password"));
                        u.setName("Driver " + (finalI + 1));
                        u.setPhone("900000000" + finalI);
                        u.setRole(ERole.ROLE_DRIVER);
                        u.setVehicleModel(models[finalI]);
                        u.setLicensePlate("TR-0" + (finalI + 1) + "-X-" + (1000 + finalI));
                        u.setCapacity(4);
                        u.setDriverVerified(true);
                        return users.save(u);
                    });

                    // Create ride for this driver
                    Ride ride = new Ride();
                    ride.setSource(sources[i]);
                    ride.setDestination(destinations[i]);
                    ride.setDepartureTime(LocalDateTime.now().plusDays(i + 1).withHour(8 + i));
                    ride.setAvailableSeats(3);
                    ride.setFarePerSeat((double) prices[i]);
                    ride.setDriver(driver);
                    rides.save(ride);
                }
            }
        };
    }
}
