package com.triply.triplybackend.controller;

import com.triply.triplybackend.repository.RideRepository;
import com.triply.triplybackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RideRepository rideRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getStats() {
        long activeRiders = userRepository.count();
        long ridesShared = rideRepository.count();

        List<String> sources = rideRepository.findDistinctSources();
        List<String> destinations = rideRepository.findDistinctDestinations();
        Set<String> uniqueCities = new HashSet<>(sources);
        uniqueCities.addAll(destinations);

        Map<String, Object> response = new HashMap<>();
        response.put("activeRiders", activeRiders);
        response.put("ridesShared", ridesShared);
        response.put("cities", uniqueCities.size());

        return ResponseEntity.ok(response);
    }
}
