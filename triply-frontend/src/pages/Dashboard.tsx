import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import RideCard from "@/components/RideCard";
import BookingCard from "@/components/BookingCard";
import { Search, MapPin, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { rideService, Ride } from "@/services/rideService";
import { bookingService, Booking } from "@/services/bookingService";
import { paymentService } from "@/services/paymentService";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import StripePaymentForm from "@/components/StripePaymentForm";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Use env-driven publishable key; falls back to mock placeholder
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

const Dashboard = () => {
  const [search, setSearch] = useState({ source: "", destination: "", date: "" });
  const [rides, setRides] = useState<Ride[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [myRides, setMyRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isLoggedIn());
  const [selectedRideForBooking, setSelectedRideForBooking] = useState<Ride | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [pendingBookingId, setPendingBookingId] = useState<number | null>(null);
  const [bookingLocations, setBookingLocations] = useState({
    pickupLat: 0,
    pickupLng: 0,
    dropoffLat: 0,
    dropoffLng: 0
  });
  const navigate = useNavigate();

  const fetchRides = async (searchParams?: any) => {
    try {
      const data = await rideService.searchRides(searchParams || { source: search.source, destination: search.destination });
      setRides(data);
    } catch (error) {
      console.error("Failed to fetch rides", error);
    }
  };

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    }
  };

  const fetchOfferedRides = async () => {
    try {
      const data = await rideService.getMyRides();
      setMyRides(data);
    } catch (error) {
      console.error("Failed to fetch offered rides", error);
    }
  };

  useEffect(() => {
    // Initial fetch of rides
    fetchRides({});

    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe((user) => {
      const loggedIn = !!user;
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        fetchBookings();
      } else {
        setBookings([]);
      }
    });

    if (authService.isLoggedIn()) {
      fetchBookings();
      if (authService.currentUser?.role === 'ROLE_DRIVER' || authService.currentUser?.role === 'DRIVER') {
        fetchOfferedRides();
      }
    }

    return unsubscribe;
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const searchParams: any = {
        source: search.source,
        destination: search.destination
      };
      if (search.date) {
        searchParams.date = search.date;
      }

      const allRides = await rideService.searchRides(searchParams);

      // Client side date filtering if API doesn't fully support it yet or for exact match
      let filtered = allRides;
      if (search.date) {
        filtered = allRides.filter(r => r.departureTime && r.departureTime.startsWith(search.date));
      }
      setRides(filtered);

      toast.success(`Found ${filtered.length} rides`);
    } catch (error) {
      toast.error("Failed to search rides");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (ride: Ride) => {
    if (!isLoggedIn) {
      toast.error("Please login to book a ride");
      navigate("/login");
      return;
    }

    const currentUser = authService.currentUser;
    if (currentUser?.role === 'ROLE_DRIVER' || currentUser?.role === 'DRIVER') {
      toast.error("Drivers cannot book rides. Please log in as a Passenger to book.");
      return;
    }

    setSelectedRideForBooking(ride);
    setBookingLocations({
      pickupLat: ride.sourceLat || 0,
      pickupLng: ride.sourceLng || 0,
      dropoffLat: ride.destLat || 0,
      dropoffLng: ride.destLng || 0
    });
    setIsPaymentModalOpen(true);
  };

  const confirmBooking = async () => {
    if (!selectedRideForBooking) return;

    setBookingLoading(true);
    try {
      const result = await bookingService.bookRide(
        selectedRideForBooking.id,
        1,
        paymentMethod,
        bookingLocations
      );

      // Handle different response types (Direct Booking vs Stripe Response)
      const isStripeResponse = (result as any).clientSecret;

      if (isStripeResponse) {
        setClientSecret((result as any).clientSecret);
        setPendingBookingId((result as any).booking.id);
        // Don't close modal, it will transition to Stripe form
      } else {
        toast.success(`Booking confirmed for ${selectedRideForBooking.source} → ${selectedRideForBooking.destination}`);
        setIsPaymentModalOpen(false);
        setSelectedRideForBooking(null);
        fetchBookings();
        fetchRides();
      }
    } catch (error: any) {
      toast.error(error.response?.data || "Failed to book ride");
    } finally {
      if (!clientSecret) setBookingLoading(false);
    }
  };

  const handleStripeSuccess = async (paymentIntentId: string) => {
    try {
      await paymentService.confirmStripePayment(paymentIntentId);
      toast.success("Payment confirmed and wallet updated");
      setIsPaymentModalOpen(false);
      setClientSecret(null);
      setSelectedRideForBooking(null);
      fetchBookings();
      fetchRides();
    } catch (error: any) {
      toast.error(error?.response?.data || "Payment confirmed but wallet update failed");
      console.error(error);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await bookingService.cancelBooking(bookingId);
      toast.success("Booking cancelled successfully");
      fetchBookings(); // Refresh list to show updated status
      fetchRides(); // Update seat availability
    } catch (error) {
      console.error("Failed to cancel booking", error);
      toast.error("Failed to cancel booking");
    }
  };

  const handleCompleteRide = async (rideId: number) => {
    try {
      await rideService.completeRide(rideId);
      toast.success("Ride marked as completed! Earnings added to wallet.");
      fetchOfferedRides();
    } catch (error) {
      console.error("Failed to complete ride", error);
      toast.error("Failed to complete ride");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Find Your <span className="gradient-text">Perfect Ride</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Search available rides and book your seat instantly
        </p>
      </div>

      {/* Search Section */}
      <Card glass className="mb-8 animate-fade-in">
        <CardContent className="p-6">
          <form onSubmit={handleSearch}>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="source" className="text-foreground">From</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                  <Input
                    id="source"
                    placeholder="Enter city"
                    className="pl-10"
                    value={search.source}
                    onChange={(e) => setSearch({ ...search, source: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination" className="text-foreground">To</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
                  <Input
                    id="destination"
                    placeholder="Enter city"
                    className="pl-10"
                    value={search.destination}
                    onChange={(e) => setSearch({ ...search, destination: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-foreground">Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    className="pl-10"
                    value={search.date}
                    onChange={(e) => setSearch({ ...search, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
                  {loading ? (
                    "Searching..."
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Grid */}
      <div className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold text-foreground">Available Rides</h2>
          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
            {rides.length}
          </span>
        </div>

        {rides.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rides.map((ride, index) => (
              <div
                key={ride.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <RideCard ride={ride} onBook={handleBook} />
              </div>
            ))}
          </div>
        ) : (
          <Card glass className="p-8 text-center">
            <p className="text-muted-foreground">No rides found. Try different filters.</p>
          </Card>
        )}
      </div>

      {/* My Bookings - Only visible if logged in */}
      {isLoggedIn && (
        <div className="animate-fade-in">
          <h2 className="mb-4 font-display text-xl font-bold text-foreground">My Bookings</h2>
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
                  />
                </div>
              ))}
            </div>
          ) : (
            <Card glass className="p-8 text-center">
              <p className="text-muted-foreground">No bookings yet. Find a ride above!</p>
            </Card>
          )}
        </div>
      )}
      {/* My Offered Rides - Only visible if driver */}
      {isLoggedIn && (authService.currentUser?.role === 'ROLE_DRIVER' || authService.currentUser?.role === 'DRIVER') && (
        <div className="mt-12 animate-fade-in">
          <h2 className="mb-4 font-display text-xl font-bold text-foreground">My Offered Rides</h2>
          {myRides.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myRides.map((ride, index) => (
                <div
                  key={ride.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Card glass className="overflow-hidden">
                    <CardContent className="p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Ride #{ride.id}</span>
                        <div className="flex gap-2 items-center">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ride.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                            ride.status === 'CANCELLED' ? 'bg-destructive/10 text-destructive' :
                              'bg-primary/10 text-primary'
                            }`}>
                            {ride.status || 'POSTED'}
                          </span>
                        </div>
                      </div>
                      <div className="mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-foreground">{ride.source}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-semibold text-foreground">{ride.destination}</span>
                      </div>
                      <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5 border-r pr-4">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(ride.departureTime).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          ₹{ride.farePerSeat}
                        </div>
                      </div>

                      {ride.status === 'POSTED' && (
                        <div className="flex gap-2 border-t pt-4">
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleCompleteRide(ride.id)}
                          >
                            Mark Complete
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              if (confirm("Cancel this ride?")) {
                                rideService.cancelRide(ride.id).then(() => {
                                  toast.success("Ride cancelled");
                                  fetchOfferedRides();
                                });
                              }
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <Card glass className="p-8 text-center">
              <p className="text-muted-foreground">You haven't offered any rides yet.</p>
            </Card>
          )}
        </div>
      )}

      {/* Payment Selection Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={(open) => {
        setIsPaymentModalOpen(open);
        if (!open) { setClientSecret(null); setBookingLoading(false); }
      }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{clientSecret ? "Complete Payment" : "Confirm Booking"}</DialogTitle>
            <DialogDescription>
              {clientSecret
                ? "Please enter your card details to finalize the booking."
                : `You are booking a ride from ${selectedRideForBooking?.source} to ${selectedRideForBooking?.destination}.`}
            </DialogDescription>
          </DialogHeader>

          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripePaymentForm
                clientSecret={clientSecret}
                amount={selectedRideForBooking?.farePerSeat || 0}
                onSuccess={handleStripeSuccess}
                onCancel={() => { setClientSecret(null); setBookingLoading(false); }}
              />
            </Elements>
          ) : (
            <>
              <div className="py-4">
                <Label className="text-sm font-medium mb-2 block text-muted-foreground">Payment Method</Label>
                <PaymentMethodSelector
                  selectedMethod={paymentMethod}
                  onSelect={setPaymentMethod}
                />
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsPaymentModalOpen(false)} disabled={bookingLoading}>
                  Cancel
                </Button>
                <Button variant="gradient" onClick={confirmBooking} disabled={bookingLoading}>
                  {bookingLoading ? "Processing..." : "Confirm Booking"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
