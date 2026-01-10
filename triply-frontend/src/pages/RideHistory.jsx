import { useEffect, useState } from "react";
import { bookingService } from "@/services/bookingService";
import BookingCard from "@/components/BookingCard";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RideHistory = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookingHistory = async () => {
            try {
                const data = await bookingService.getMyBookings();
                // Only show COMPLETED and CANCELLED bookings (history)
                const completedBookings = data.filter(b =>
                    b.status === 'COMPLETED' || b.status === 'CANCELLED'
                );
                setBookings(completedBookings);
            } catch (err) {
                console.error("Failed to fetch booking history", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookingHistory();
    }, []);

    const handleViewDetails = (booking) => {
        if (booking.status === 'CONFIRMED') {
            navigate('/payment-success', {
                state: {
                    ride: booking.ride,
                    bookingId: booking.id,
                    bookingDetails: booking,
                    transactionId: 'PREVIOUS',
                    amount: booking.fareAmount
                }
            });
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading history...</div>;
    }

    return (
        <div className="mx-auto max-w-6xl px-4 pt-24 pb-8">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <History className="h-8 w-8 text-primary" />
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Booking <span className="gradient-text">History</span>
                    </h1>
                </div>
                <p className="text-muted-foreground">
                    View your completed and past bookings.
                </p>
            </div>

            {bookings.length === 0 ? (
                <Card glass className="p-8 text-center">
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="rounded-full bg-muted p-4">
                            <Calendar className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">No booking history</h3>
                            <p className="text-muted-foreground">Your completed bookings will appear here.</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {bookings.map((booking, index) => (
                        <div key={booking.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                            <BookingCard
                                booking={booking}
                                onViewDetails={handleViewDetails}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RideHistory;
