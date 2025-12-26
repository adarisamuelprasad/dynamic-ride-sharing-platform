import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import BookingCard from "@/components/BookingCard";
import { toast } from "sonner";
import { bookingService, Booking } from "@/services/bookingService";
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

const MyBookings = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBookingDetails, setSelectedBookingDetails] = useState<Booking | null>(null);
    const navigate = useNavigate();

    const fetchBookings = async () => {
        try {
            const data = await bookingService.getMyBookings();
            setBookings(data);
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

    const handleCancelBooking = async (bookingId: number) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;

        try {
            await bookingService.cancelBooking(bookingId);
            toast.success("Booking cancelled successfully");
            fetchBookings(); // Refresh list to show updated status
        } catch (error) {
            console.error("Failed to cancel booking", error);
            toast.error("Failed to cancel booking");
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading bookings...</div>;
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
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
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {bookings.map((booking, index) => (
                            <div
                                key={booking.id}
                                className="animate-fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <BookingCard
                                    booking={{
                                        ...booking,
                                        status: booking.status as "CONFIRMED" | "PENDING" | "CANCELLED"
                                    }}
                                    onCancel={handleCancelBooking}
                                    onViewDetails={setSelectedBookingDetails}
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
                                        selectedBookingDetails.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {selectedBookingDetails.status}
                                </span>
                            </div>

                            {/* Ride Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground uppercase">From</Label>
                                    <p className="font-semibold">{selectedBookingDetails.ride.source}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground uppercase">To</Label>
                                    <p className="font-semibold">{selectedBookingDetails.ride.destination}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground uppercase">Date</Label>
                                    <p className="font-medium">
                                        {new Date(selectedBookingDetails.ride.departureTime).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground uppercase">Time</Label>
                                    <p className="font-medium">
                                        {new Date(selectedBookingDetails.ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                                            <span className="text-muted-foreground">Name:</span> {selectedBookingDetails.ride.driver.name}
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Phone:</span> {selectedBookingDetails.ride.driver.phone}
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Vehicle:</span> {selectedBookingDetails.ride.driver.vehicleModel || 'N/A'}
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Plate:</span> {selectedBookingDetails.ride.driver.licensePlate || selectedBookingDetails.ride.vehiclePlate || 'N/A'}
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

                    <DialogFooter className="gap-2 sm:justify-between">
                        {selectedBookingDetails?.status === 'CONFIRMED' && (
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto"
                                onClick={() => {
                                    navigate('/payment-success', {
                                        state: {
                                            amount: selectedBookingDetails.fareAmount,
                                            ride: selectedBookingDetails.ride,
                                            bookingId: selectedBookingDetails.id,
                                            bookingDetails: { seats: selectedBookingDetails.seatsBooked },
                                            transactionId: 'VIEW_RECEIPT'
                                        }
                                    });
                                }}
                            >
                                View Ticket / Receipt
                            </Button>
                        )}
                        <Button variant="ghost" onClick={() => setSelectedBookingDetails(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MyBookings;
