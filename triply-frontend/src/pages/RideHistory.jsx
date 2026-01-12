import { useEffect, useState } from "react";
import { bookingService } from "@/services/bookingService";
import { rideService } from "@/services/rideService";
import { authService } from "@/services/authService";
import BookingCard from "@/components/BookingCard";
import RideCard from "@/components/RideCard";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, History, Car } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReviewModal } from "@/components/ReviewModal";

const RideHistory = () => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDriver, setIsDriver] = useState(false);
    const [sortBy, setSortBy] = useState("recent");
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = authService.currentUser;
                const isUserDriver = user?.role === 'ROLE_DRIVER' || user?.role === 'DRIVER';
                setIsDriver(isUserDriver);

                let data = [];
                if (isUserDriver) {
                    data = await rideService.getMyRides();
                } else {
                    const bookings = await bookingService.getMyBookings();
                    data = bookings.filter(b =>
                        b.status === 'COMPLETED' || b.status === 'CANCELLED' || (b.status === 'CONFIRMED' && b.ride?.status === 'COMPLETED')
                    );
                }
                setItems(data);
                setFilteredItems(data);
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        let sorted = [...items];
        if (sortBy === "recent") {
            sorted.sort((a, b) => new Date(b.departureTime || b.ride?.departureTime) - new Date(a.departureTime || a.ride?.departureTime));
        } else if (sortBy === "oldest") {
            sorted.sort((a, b) => new Date(a.departureTime || a.ride?.departureTime) - new Date(b.departureTime || b.ride?.departureTime));
        } else if (sortBy === "price_asc") {
            sorted.sort((a, b) => (a.farePerSeat || a.fareAmount) - (b.farePerSeat || b.fareAmount));
        } else if (sortBy === "price_desc") {
            sorted.sort((a, b) => (b.farePerSeat || b.fareAmount) - (a.farePerSeat || a.fareAmount));
        }
        setFilteredItems(sorted);
    }, [sortBy, items]);

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

    const handleRateDriver = (booking) => {
        setSelectedBookingForReview(booking);
        setReviewModalOpen(true);
    };

    if (loading) {
        return <div className="p-8 text-center">Loading history...</div>;
    }

    return (
        <div className="mx-auto max-w-6xl px-4 pt-24 pb-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        {isDriver ? <Car className="h-8 w-8 text-primary" /> : <History className="h-8 w-8 text-primary" />}
                        <h1 className="font-display text-3xl font-bold text-foreground">
                            {isDriver ? "Ride" : "Booking"} <span className="gradient-text">History</span>
                        </h1>
                    </div>
                    <p className="text-muted-foreground">
                        {isDriver ? "Manage your past and current rides." : "View your completed and past bookings."}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Sort by:</span>
                    <select
                        className="p-2 rounded-md border text-sm"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="recent">Recent</option>
                        <option value="oldest">Oldest</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                </div>
            </div>

            {filteredItems.length === 0 ? (
                <Card glass className="p-8 text-center">
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="rounded-full bg-muted p-4">
                            <Calendar className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">No history found</h3>
                            <p className="text-muted-foreground">
                                {isDriver ? "You haven't posted any rides yet." : "Your completed bookings will appear here."}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filteredItems.map((item, index) => (
                        <div key={item.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                            {isDriver ? (
                                <RideCard ride={item} />
                            ) : (
                                <BookingCard
                                    booking={item}
                                    onViewDetails={handleViewDetails}
                                    onRate={handleRateDriver}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}

            <ReviewModal
                isOpen={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                rideId={selectedBookingForReview?.ride?.id}
                revieweeId={selectedBookingForReview?.ride?.driver?.id}
            />
        </div>
    );
};

export default RideHistory;
