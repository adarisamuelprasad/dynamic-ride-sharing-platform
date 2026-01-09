import { useEffect, useState } from "react";
import { bookingService } from "@/services/bookingService";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Clock } from "lucide-react";

const DriverRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await bookingService.getDriverRequests();
            // Filter only for PENDING requests
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch requests", error);
            toast.error("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (bookingId, status) => {
        try {
            await bookingService.respondToBooking(bookingId, status);
            toast.success(`Request ${status.toLowerCase()} successfully`);
            fetchRequests();
        } catch (error) {
            toast.error("Failed to update request");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading requests...</div>;

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <h1 className="mb-6 font-display text-2xl font-bold">Ride Requests</h1>

            {requests.length === 0 ? (
                <Card className="p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="rounded-full bg-muted p-4">
                            <Clock className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">No pending requests at the moment.</p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-4">
                    {requests.map((booking) => (
                        <Card key={booking.id} className="overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-lg">{booking.passenger?.name || "Unknown Passenger"}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Requesting {booking.seatsBooked} seat(s) for {booking.ride?.source} → {booking.ride?.destination}
                                        </p>
                                        <div className="flex gap-2 text-xs font-medium">
                                            <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                                                {new Date(booking.ride?.departureTime).toLocaleString()}
                                            </span>
                                            <span className="bg-muted px-2 py-1 rounded">
                                                Fare: ₹{booking.ride?.farePerSeat * booking.seatsBooked}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4 sm:mt-0 items-center">
                                        {booking.status === 'PENDING' ? (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    className="border-red-500 text-red-600 hover:bg-red-50"
                                                    onClick={() => handleRespond(booking.id, 'REJECTED')}
                                                >
                                                    <X className="mr-2 h-4 w-4" />
                                                    Reject
                                                </Button>
                                                <Button
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleRespond(booking.id, 'APPROVED')}
                                                >
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Accept
                                                </Button>
                                            </>
                                        ) : (
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold 
                                                ${booking.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {booking.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DriverRequests;
