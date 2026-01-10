import { useEffect, useState } from "react";
import { bookingService } from "@/services/bookingService";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, ChevronLeft, ChevronRight } from "lucide-react";

const DriverRequests = () => {
    const [allRequests, setAllRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('PENDING');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        // Filter requests based on active filter
        const filtered = allRequests.filter(req => req.status === activeFilter);
        setFilteredRequests(filtered);
        setCurrentPage(1); // Reset to page 1 when filter changes
    }, [activeFilter, allRequests]);

    const fetchRequests = async () => {
        try {
            const data = await bookingService.getDriverRequests();
            // Sort by creation date (latest first)
            const sorted = data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            setAllRequests(sorted);
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

    // Pagination logic
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRequests = filteredRequests.slice(startIndex, endIndex);

    const goToPage = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filterTabs = [
        { label: 'Pending', value: 'PENDING', color: 'text-yellow-600 border-yellow-600' },
        { label: 'Approved', value: 'APPROVED', color: 'text-green-600 border-green-600' },
        { label: 'Rejected', value: 'REJECTED', color: 'text-red-600 border-red-600' }
    ];

    if (loading) return <div className="p-8 text-center">Loading requests...</div>;

    return (
        <div className="mx-auto max-w-6xl px-4 pt-24 pb-8">
            <h1 className="mb-6 font-display text-2xl font-bold">Ride Requests</h1>

            {/* Filter Tabs */}
            <div className="mb-6 flex gap-2 border-b">
                {filterTabs.map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveFilter(tab.value)}
                        className={`px-4 py-2 font-medium transition-all ${activeFilter === tab.value
                                ? `${tab.color} border-b-2`
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {tab.label}
                        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                            {allRequests.filter(r => r.status === tab.value).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Requests List */}
            {currentRequests.length === 0 ? (
                <Card className="p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="rounded-full bg-muted p-4">
                            <Clock className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">No {activeFilter.toLowerCase()} requests.</p>
                    </div>
                </Card>
            ) : (
                <>
                    <div className="space-y-4">
                        {currentRequests.map((booking) => (
                            <Card key={booking.id} className="overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="space-y-1 flex-1">
                                            <h3 className="font-semibold text-lg">{booking.passenger?.name || "Unknown Passenger"}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Requesting {booking.seatsBooked} seat(s) for {booking.ride?.source} → {booking.ride?.destination}
                                            </p>
                                            <div className="flex gap-2 text-xs font-medium flex-wrap">
                                                <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                                                    {new Date(booking.ride?.departureTime).toLocaleString()}
                                                </span>
                                                <span className="bg-muted px-2 py-1 rounded">
                                                    Fare: ₹{booking.ride?.farePerSeat * booking.seatsBooked}
                                                </span>
                                                {booking.createdAt && (
                                                    <span className="bg-muted px-2 py-1 rounded text-muted-foreground">
                                                        Requested: {new Date(booking.createdAt).toLocaleDateString()}
                                                    </span>
                                                )}
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="flex gap-1">
                                {[...Array(totalPages)].map((_, i) => {
                                    const page = i + 1;
                                    // Show first page, last page, current page, and pages around current
                                    if (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => goToPage(page)}
                                                className="min-w-[40px]"
                                            >
                                                {page}
                                            </Button>
                                        );
                                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                                        return <span key={page} className="px-2">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {/* Page info */}
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        Showing {startIndex + 1}-{Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} requests
                    </div>
                </>
            )}
        </div>
    );
};

export default DriverRequests;
