package com.triply.triplybackend.service;

import com.triply.triplybackend.model.Ride;
import com.triply.triplybackend.model.User;
import com.triply.triplybackend.model.Review;
import com.triply.triplybackend.payload.requests.ReviewRequest;
import com.triply.triplybackend.repository.ReviewRepository;
import com.triply.triplybackend.repository.RideRepository;
import com.triply.triplybackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RideRepository rideRepository;

    @Transactional
    public Review addReview(Long reviewerId, ReviewRequest request) {
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("Reviewer not found"));
        User reviewee = userRepository.findById(request.getRevieweeId())
                .orElseThrow(() -> new RuntimeException("Reviewee not found"));
        Ride ride = rideRepository.findById(request.getRideId())
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (reviewRepository.existsByReviewerIdAndRideIdAndRevieweeId(reviewerId, ride.getId(), reviewee.getId())) {
            throw new RuntimeException("You have already reviewed this user for this ride.");
        }

        Review review = new Review();
        review.setReviewer(reviewer);
        review.setReviewee(reviewee);
        review.setRide(ride);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        review = reviewRepository.save(review);
        updateUserRating(reviewee, request.getRating());

        return review;
    }

    private void updateUserRating(User user, int newRating) {
        double currentAvg = user.getAverageRating() != null ? user.getAverageRating() : 0.0;
        int currentCount = user.getReviewCount() != null ? user.getReviewCount() : 0;

        double newTotal = (currentAvg * currentCount) + newRating;
        int newCount = currentCount + 1;
        double newAvg = newTotal / newCount;

        user.setAverageRating(newAvg);
        user.setReviewCount(newCount);
        userRepository.save(user);
    }

    public List<Review> getReviewsForUser(Long userId) {
        return reviewRepository.findByRevieweeId(userId);
    }
}
