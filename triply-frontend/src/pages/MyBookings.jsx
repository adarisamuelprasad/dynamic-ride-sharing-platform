import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import BookingCard from "@/components/BookingCard";
import { toast } from "sonner";
import { bookingService } from "@/services/bookingService";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { ReviewModal } from "@/components/ReviewModal";

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewRideId, setReviewRideId] = useState(null);
    const [revieweeId, setRevieweeId] = useState(null);
    const [cancelDialog, setCancelDialog] = useState({ open: false, bookingId: null });
    const navigate = useNavigate();

    const fetchBookings = async () => {
        try {
            const data = await bookingService.getMyBookings();
            // Show PENDING, APPROVED, and CONFIRMED bookings
            // Only COMPLETED/CANCELLED go to Booking History
            const activeRequests = data.filter(b =>
                b.status === 'PENDING' || b.status === 'APPROVED' || b.status === 'CONFIRMED'
            );
            setBookings(activeRequests);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authService.isLoggedIn()) {
            navigate('/login');
            return;
        }
        fetchBookings();
    }, []);

    const handleCancelBooking = (bookingId) => {
        setCancelDialog({ open: true, bookingId });
    };

    const confirmCancel = async () => {
        if (!cancelDialog.bookingId) return;
        try {
            await bookingService.cancelBooking(cancelDialog.bookingId);
            toast.success("Booking cancelled successfully");
            fetchBookings(); // Refresh list to show updated status
        } catch (error) {
            console.error("Failed to cancel booking", error);
            toast.error("Failed to cancel booking");
        } finally {
            setCancelDialog({ open: false, bookingId: null });
        }
    };

    const handlePay = (booking) => {
        navigate('/payment', {
            state: {
                ride: booking.ride,
                bookingId: booking.id,
                amount: booking.ride?.farePerSeat || booking.fareAmount,
                rideDetails: booking.ride,
                bookingDetails: booking
            }
        });
    };

    const handleViewDetails = (booking) => {
        if (booking.status === 'CONFIRMED') {
            // Validate required data before navigating
            if (!booking.ride) {
                toast.error("Ride information not found");
                return;
            }

            // Navigate to ticket/invoice page
            navigate('/payment-success', {
                state: {
                    ride: booking.ride,
                    bookingId: booking.id,
                    bookingDetails: booking,
                    transactionId: booking.transactionId || 'CONFIRMED',
                    amount: booking.ride?.farePerSeat || booking.fareAmount || 0
                }
            });
        } else {
            setSelectedBookingDetails(booking);
        }
    };

    const handleRate = (booking) => {
        if (booking.ride && booking.ride.driver) {
            setReviewRideId(booking.ride.id);
            setRevieweeId(booking.ride.driver.id);
            setReviewModalOpen(true);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading bookings...</div>;
    }

    return (
        <div className="mx-auto max-w-6xl px-4 pt-24 pb-8">
            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-foreground">
                    My <span className="gradient-text">Bookings</span>
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Manage your upcoming and past rides
                </p>
            </div>

            <div className="animate-fade-in">
                {bookings.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {bookings.map((booking, index) => (
                            <div
                                key={booking.id}
                                className="animate-fade-in"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <BookingCard
                                    booking={booking}
                                    onViewDetails={handleViewDetails}
                                    onCancel={handleCancelBooking}
                                    onPay={handlePay}
                                    onRate={handleRate}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <Card glass className="p-8 text-center">
                        <p className="text-muted-foreground">No bookings yet. Find a ride in the dashboard!</p>
                        <Button variant="link" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
                    </Card>
                )}
            </div>

            {/* Booking Details Modal */}
            <Dialog open={!!selectedBookingDetails} onOpenChange={(open) => !open && setSelectedBookingDetails(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Booking Details</DialogTitle>
                        <DialogDescription>
                            Booking information for your ride to {selectedBookingDetails?.ride?.destination}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedBookingDetails && (
                        <div className="space-y-4">
                            {/* Status Badge */}
                            <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg">
                                <span className="text-sm font-medium">Status</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold 
                      ${selectedBookingDetails.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                        selectedBookingDetails.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                            selectedBookingDetails.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'}`}>
                                    {selectedBookingDetails.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <Label className="text-xs text-muted-foreground uppercase">Date</Label>
                                    <p className="font-medium">
                                        {new Date(selectedBookingDetails.ride.departureTime).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground uppercase">Time</Label>
                                    <p className="font-medium">
                                        {new Date(selectedBookingDetails.ride.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t my-2" />

                            {/* Driver Info */}
                            {selectedBookingDetails.ride.driver && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-foreground">Driver Details</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Name</span>
                                            <p>{selectedBookingDetails.ride.driver.name}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="border-t my-2" />

                            {/* Payment Info */}
                            <div className="bg-primary/5 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Fare Amount</span>
                                    <span className="font-bold">₹{selectedBookingDetails.fareAmount?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Payment Method</span>
                                    <span className="font-medium">{selectedBookingDetails.paymentMethod}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:justify-between flex-wrap">
                        {selectedBookingDetails?.status === 'APPROVED' && (
                            <Button
                                className="w-full sm:flex-row sm:items-center sm:justify-between"
                                onClick={() => handlePay(selectedBookingDetails)}
                            >
                                Pay Now
                            </Button>
                        )}
                        {selectedBookingDetails?.status === 'CONFIRMED' && (
                            <>
                                <Button
                                    variant="outline"
                                    className="w-full sm:flex-row sm:items-center sm:justify-between"
                                    onClick={() => {
                                        navigate('/payment-success', {
                                            state: {
                                                ride: selectedBookingDetails.ride,
                                                bookingId: selectedBookingDetails.id,
                                                bookingDetails: selectedBookingDetails,
                                                transactionId: 'PREVIOUS',
                                                amount: selectedBookingDetails.fareAmount
                                            }
                                        });
                                    }}
                                >
                                    View Ticket
                                </Button>
                                {new Date(selectedBookingDetails.ride.departureTime) < new Date() && (
                                    <Button
                                        variant="outline"
                                        className="w-full sm:flex-row sm:items-center sm:justify-between"
                                        onClick={() => {
                                            setReviewRideId(selectedBookingDetails.ride.id);
                                            setRevieweeId(selectedBookingDetails.ride.driver.id);
                                            setReviewModalOpen(true);
                                        }}
                                    >
                                        Rate Driver
                                    </Button>
                                )}
                            </>
                        )}
                        <Button variant="ghost" onClick={() => setSelectedBookingDetails(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ReviewModal
                isOpen={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                rideId={reviewRideId || 0}
                revieweeId={revieweeId || 0}
            />

            <AlertDialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog(prev => ({ ...prev, open }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel this booking? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Yes, Cancel
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default MyBookings;
