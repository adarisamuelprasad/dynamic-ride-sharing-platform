import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import RideCard from "@/components/RideCard";
import BookingCard from "@/components/BookingCard";
import { Search, MapPin, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";

// Mock data
const mockRides = [
  {
    id: 1,
    source: "Mumbai",
    destination: "Pune",
    departureTime: "2024-12-20T09:00:00",
    availableSeats: 3,
    farePerSeat: 450,
    driver: { name: "Ranvitha", vehicleModel: "Honda City" },
  },
  {
    id: 2,
    source: "Delhi",
    destination: "Jaipur",
    departureTime: "2024-12-21T07:30:00",
    availableSeats: 2,
    farePerSeat: 650,
    driver: { name: "Amit", vehicleModel: "Maruti Swift" },
  },
  {
    id: 3,
    source: "Bangalore",
    destination: "Mysore",
    departureTime: "2024-12-22T06:00:00",
    availableSeats: 4,
    farePerSeat: 300,
    driver: { name: "Priya", vehicleModel: "Toyota Innova" },
  },
];

const mockBookings = [
  {
    id: 101,
    seatsBooked: 2,
    status: "CONFIRMED" as const,
    ride: { source: "Mumbai", destination: "Pune" },
    passenger: { name: "Vibha" },
  },
  {
    id: 102,
    seatsBooked: 1,
    status: "PENDING" as const,
    ride: { source: "Chennai", destination: "Coimbatore" },
    passenger: { name: "Vibha" },
  },
];

const Dashboard = () => {
  const [search, setSearch] = useState({ source: "", destination: "", date: "" });
  const [results, setResults] = useState(mockRides);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate search
    setTimeout(() => {
      const filtered = mockRides.filter((ride) => {
        const matchSource = !search.source || 
          ride.source.toLowerCase().includes(search.source.toLowerCase());
        const matchDest = !search.destination || 
          ride.destination.toLowerCase().includes(search.destination.toLowerCase());
        return matchSource && matchDest;
      });
      setResults(filtered);
      setLoading(false);
      toast.success(`Found ${filtered.length} rides`);
    }, 500);
  };

  const handleBook = (ride: typeof mockRides[0]) => {
    toast.success(`Booking confirmed for ${ride.source} → ${ride.destination}`);
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
            {results.length}
          </span>
        </div>
        
        {results.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((ride, index) => (
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

      {/* My Bookings */}
      <div>
        <h2 className="mb-4 font-display text-xl font-bold text-foreground">My Bookings</h2>
        {mockBookings.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockBookings.map((booking, index) => (
              <div 
                key={booking.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
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
    </div>
  );
};

export default Dashboard;
