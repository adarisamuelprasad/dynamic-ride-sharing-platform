import { useEffect, useState } from "react";
import { bookingService, Booking } from "@/services/bookingService";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, User, MapPin } from "lucide-react";

const DriverRequests = () => {
    const [requests, setRequests] = useState<Booking[]>([]);
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

    const handleRespond = async (bookingId: number, status: 'APPROVED' | 'REJECTED') => {
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
                <div className="grid gap-4">
                    {requests.map((booking) => (
                        <Card key={booking.id} className="overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-primary" />
                                            <span className="font-semibold">{booking.passenger?.name}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            To: {booking.ride.destination}
                                        </p>
                                        <div className="flex gap-2 text-xs text-muted-foreground mt-2">
                                            <span className="bg-muted px-2 py-1 rounded">
                                                {booking.seatsBooked} Seat(s)
                                            </span>
                                            <span className="bg-muted px-2 py-1 rounded">
                                                Fare: ₹{booking.fareAmount}
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
                                                ${booking.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                    booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                                                        booking.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                            'bg-gray-100 text-gray-700'}`}>
                                                {booking.status === 'APPROVED' ? 'Accepted' : booking.status}
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
