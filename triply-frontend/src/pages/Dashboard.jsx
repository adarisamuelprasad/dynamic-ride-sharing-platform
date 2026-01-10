import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import BookingCard from "@/components/BookingCard";
import { Search, MapPin, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { rideService } from "@/services/rideService";
import { bookingService } from "@/services/bookingService";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import RideCard from "@/components/RideCard";
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

const Dashboard = () => {
  const [search, setSearch] = useState({ source: "", destination: "", date: "" });
  const [rides, setRides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isLoggedIn());
  const navigate = useNavigate();

  const fetchRides = async (searchParams) => {
    try {
      const data = await rideService.searchRides(searchParams || { source: "", destination: "" });
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
    }

    return unsubscribe;
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const searchParams = {
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
        filtered = allRides.filter(r => r.departureTime.startsWith(search.date));
      }
      setRides(filtered);

      toast.success(`Found ${filtered.length} rides`);
    } catch (error) {
      toast.error("Failed to search rides");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="mx-auto max-w-6xl px-4 pt-24 pb-8">
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
                      <Search className="h-4 w-4 mr-2" />
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
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {rides.map((ride, index) => (
              <div
                key={ride.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <RideCard ride={ride} />
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
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {bookings.map((booking, index) => (
                <div
                  key={booking.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <BookingCard booking={booking} />
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


    </div>
  );
};

export default Dashboard;
