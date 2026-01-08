
# Milestone 2: Fare Calculation, Payment & Route Matching

## 1. Fix Payment Flow (Critical Bug)
- [x] Debug "Blank Screen" issue after payment.
    - [x] Check if `PaymentSuccess.tsx` exists and is registered in `App.tsx`.
    - [x] Verify `paymentService.ts` executes correctly.
    - [x] Ensure backend `PaymentController` handles the request.
    - [x] Added safety checks in `PaymentSuccess.tsx` to handle missing/invalid data gracefully.

## 2. Dynamic Fare Calculation
- [x] Verify `GoogleMapsService` integration in `RideService`.
- [x] Ensure `Distance Matrix` or routing API is effectively used for accurate fare.
- [x] Review the "Split Cost" requirement (currently per-seat fare).

## 3. Real-Time Updates
- [x] Verify `NotificationService` backend implementation.
- [x] Implement WebSocket client in Frontend (React Context or Hook).
- [x] Add notifications for:
    - [x] New Booking (for Driver)
    - [x] Booking Status Change (for Passenger)
    - [x] Ride Cancellation
- [x] Enabled `NotificationWrapper` in `App.tsx`.

## 4. Route Matching
- [x] Review `RideService.searchRide` logic.
- [ ] Enhance if needed to support better partial matching (optional/advanced).

## 5. Transaction History
- [x] Backend: `PaymentController` has history endpoints.
- [x] Frontend: Updated `PaymentHistory` page for Drivers and Passengers.

## 6. Admin Panel (from previous context, ensure it shows payments)
- [x] Ensure Admin can see all payments.
    - [x] Backend: Added `/api/payments/report` endpoint returning `PaymentReportResponse`.
    - [x] Frontend: Updated `paymentService.ts` to call `/report`.
    - [x] Verified `Payments.tsx` uses `paymentService.getReport`.
