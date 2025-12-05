package com.triply.triplybackend.controller;

import com.triply.triplybackend.repository.RideRepository;
import com.triply.triplybackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RideRepository rideRepository;

    @GetMapping("/stats")
    public StatsDTO getStats() {
        long activeRiders = userRepository.count();
        long ridesShared = rideRepository.count();

        List<String> sources = rideRepository.findDistinctSources();
        List<String> destinations = rideRepository.findDistinctDestinations();
        Set<String> cities = new HashSet<>(sources);
        cities.addAll(destinations);

        return new StatsDTO(activeRiders, ridesShared, cities.size());
    }

    // Simple DTO
    public static class StatsDTO {
        private long activeRiders;
        private long ridesShared;
        private int cities;

        public StatsDTO(long activeRiders, long ridesShared, int cities) {
            this.activeRiders = activeRiders;
            this.ridesShared = ridesShared;
            this.cities = cities;
        }

        public long getActiveRiders() {
            return activeRiders;
        }

        public void setActiveRiders(long activeRiders) {
            this.activeRiders = activeRiders;
        }

        public long getRidesShared() {
            return ridesShared;
        }

        public void setRidesShared(long ridesShared) {
            this.ridesShared = ridesShared;
        }

        public int getCities() {
            return cities;
        }

        public void setCities(int cities) {
            this.cities = cities;
        }
    }
}
