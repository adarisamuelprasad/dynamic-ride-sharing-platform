package com.triply.triplybackend.repository;

import com.triply.triplybackend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByRevieweeId(Long revieweeId);

    List<Review> findByRideId(Long rideId);

    // Helper to check if a user has already reviewed a ride target?
    // Usually valid to check if reviewer + ride + reviewee combo exists
    boolean existsByReviewerIdAndRideIdAndRevieweeId(Long reviewerId, Long rideId, Long revieweeId);

    org.springframework.data.domain.Page<Review> findByRatingLessThan(Integer rating,
            org.springframework.data.domain.Pageable pageable);
}
