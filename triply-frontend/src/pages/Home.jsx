import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Shield, Wallet, MapPin, ArrowRight, Sparkles, Calendar, Activity, PawPrint, Cigarette, Zap, Armchair } from "lucide-react";

import { useEffect, useState } from "react";
import axios from "@/services/axiosConfig";
import { rideService } from "@/services/rideService";
import RideCard from "@/components/RideCard";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { bookingService } from "@/services/bookingService";

const Home = () => {
  const [stats, setStats] = useState({
    activeRiders: 0,
    ridesShared: 0,
    cities: 0
  });

  const [allRides, setAllRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [filterSource, setFilterSource] = useState("");
  const [filterDest, setFilterDest] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterPets, setFilterPets] = useState(false);
  const [filterSmoking, setFilterSmoking] = useState(false);
  const [filterInstant, setFilterInstant] = useState(false);
  const [filterMax2, setFilterMax2] = useState(false);
  const [sortOption, setSortOption] = useState("earliest");
  const [user, setUser] = useState(authService.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = authService.subscribe((u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load stats
        const statsRes = await axios.get('http://localhost:8081/api/stats');
        setStats({
          activeRiders: statsRes.data.activeRiders || 0,
          ridesShared: statsRes.data.ridesShared || 0,
          cities: statsRes.data.cities || 0
        });

        // Load all rides
        const ridesRes = await rideService.getAllRides();

        // Filter: Future dates only and available seats
        const now = new Date();
        const available = ridesRes.filter(r => new Date(r.departureTime) >= now && r.availableSeats > 0);

        // Sort by date upcoming
        const sorted = available.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());

        setAllRides(sorted);
        setFilteredRides(sorted);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const lowerSource = filterSource.toLowerCase();
    const lowerDest = filterDest.toLowerCase();

    let filtered = allRides.filter(ride =>
      ride.source.toLowerCase().includes(lowerSource) &&
      ride.destination.toLowerCase().includes(lowerDest)
    );

    if (filterDate) {
      filtered = filtered.filter(ride => ride.departureTime.startsWith(filterDate));
    }

    if (filterPets) filtered = filtered.filter(r => r.petsAllowed);
    if (filterSmoking) filtered = filtered.filter(r => r.smokingAllowed);
    if (filterInstant) filtered = filtered.filter(r => r.instantBooking);
    if (filterMax2) filtered = filtered.filter(r => r.maxTwoInBack);

    filtered.sort((a, b) => {
      if (sortOption === "earliest") {
        return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      } else if (sortOption === "price_asc") {
        return a.farePerSeat - b.farePerSeat;
      } else if (sortOption === "price_desc") {
        return b.farePerSeat - a.farePerSeat;
      } else if (sortOption === "seats") {
        return b.availableSeats - a.availableSeats;
      }
      return 0;
    });

    setFilteredRides([...filtered]); // Create new reference
  }, [filterSource, filterDest, filterDate, filterPets, filterSmoking, filterInstant, filterMax2, sortOption, allRides]);

  useEffect(() => {
    if (user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleBookRide = async (ride) => {
    if (!authService.isLoggedIn()) {
      navigate(`/login?redirect=/book&rideId=${ride.id}`);
      return;
    }

    const currentUser = authService.currentUser;
    if (currentUser?.role === 'ROLE_DRIVER' || currentUser?.role === 'DRIVER') {
      toast.error("Drivers cannot book rides. Please log in as Passenger to book.");
      return;
    }

    if (confirm(`Book a seat on this ride for ₹${ride.farePerSeat}?`)) {
      try {
        await bookingService.bookRide(ride.id, 1);
        toast.success("Ride booked successfully!");
        // Refresh data
        const ridesRes = await rideService.getAllRides();
        const now = new Date();
        const available = ridesRes.filter(r => new Date(r.departureTime) >= now && r.availableSeats > 0);
        const sorted = available.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
        setAllRides(sorted);
      } catch (error) {
        toast.error(typeof error.response?.data === 'string' ? error.response.data : 'Failed to book ride');
      }
    }
  };

  const features = [
    {
      icon: Search,
      title: "Smart Search",
      description: "Find rides easily by source, destination, and date with smart filters."
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "All drivers and passengers are verified for your safety."
    },
    {
      icon: Wallet,
      title: "Save Money",
      description: "Share rides and split costs with fellow travelers."
    }
  ];

  // --- ADMIN VIEW ---
  if (user?.role === 'ROLE_ADMIN') {
    return null;
  }

  // --- LOGGED IN USER VIEW (Passenger / Driver) ---
  if (user) {
    return (
      <div className="min-h-screen pt-0 px-12 pb-20">
        <div className="mx-auto max-w-7xl animate-fade-in">
          {/* Welcome Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                Welcome back, <span className="gradient-text">{user.name}</span>
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                {user.role === 'ROLE_DRIVER' || user.role === 'DRIVER'
                  ? "Ready to earn? Offer a ride today."
                  : "Find your perfect ride or post your own."}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              {(user.role === 'ROLE_DRIVER' || user.role === 'DRIVER') && (
                <Link to="/post-ride">
                  <Button variant="gradient" size="lg" className="shadow-lg shadow-primary/20">
                    Offer a New Ride
                  </Button>
                </Link>
              )}
              {(user.role === 'ROLE_PASSENGER' || user.role === 'PASSENGER') && (
                <Link to="/dashboard">
                  <Button variant="gradient" size="lg" className="shadow-lg shadow-primary/20">
                    Find a Ride
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Main Content Area - Ride Feed and Stats */}
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Quick Stats / Info */}
            <div className="hidden lg:block space-y-6">
              {/* Live Activity Feed */}
              <Card glass className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Live Feed
                  </h4>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                </div>

                <div className="space-y-4">
                  {allRides.slice(0, 4).map((r, i) => (
                    <div key={i} className="flex gap-3 items-start group cursor-pointer" onClick={() => handleBookRide(r)}>
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-primary/20 transition-transform" />
                      <div>
                        <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                          New ride: {r.source} to {r.destination}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(r.departureTime).toLocaleDateString()} • ₹{r.farePerSeat}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-[10px] text-muted-foreground text-center">
                      {stats.activeRiders} users online now
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Main Feed */}
            <div className="lg:col-span-3 space-y-6">
              <Card glass className="p-6 h-[650px] flex flex-col">
                <div className="mb-6">
                  <h3 className="font-display text-xl font-bold text-foreground mb-4">
                    Available Rides
                  </h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Filter Source"
                          value={filterSource}
                          onChange={(e) => setFilterSource(e.target.value)}
                          className="pl-9 bg-muted/20"
                        />
                      </div>
                      <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Filter Dest"
                          value={filterDest}
                          onChange={(e) => setFilterDest(e.target.value)}
                          className="pl-9 bg-muted/20"
                        />
                      </div>
                      <div className="relative flex-1 sm:max-w-[180px]">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="date"
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                          className="pl-9 bg-muted/20"
                        />
                      </div>
                    </div>

                    {/* Amenity Filters */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={filterPets ? "default" : "outline"}
                        size="sm"
                        className="h-8 text-xs rounded-full gap-1.5"
                        onClick={() => setFilterPets(!filterPets)}
                      >
                        <PawPrint className="h-3 w-3" /> Pets Allowed
                      </Button>
                      <Button
                        variant={filterSmoking ? "default" : "outline"}
                        size="sm"
                        className="h-8 text-xs rounded-full gap-1.5"
                        onClick={() => setFilterSmoking(!filterSmoking)}
                      >
                        <Cigarette className="h-3 w-3" /> Smoking OK
                      </Button>
                      <Button
                        variant={filterInstant ? "default" : "outline"}
                        size="sm"
                        className="h-8 text-xs rounded-full gap-1.5"
                        onClick={() => setFilterInstant(!filterInstant)}
                      >
                        <Zap className="h-3 w-3" /> Instant Book
                      </Button>
                      <Button
                        variant={filterMax2 ? "default" : "outline"}
                        size="sm"
                        className="h-8 text-xs rounded-full gap-1.5"
                        onClick={() => setFilterMax2(!filterMax2)}
                      >
                        <Armchair className="h-3 w-3" /> Max 2 in Back
                      </Button>
                    </div>

                    <div className="flex justify-end gap-2">
                      <select
                        className="h-9 rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                      >
                        <option value="earliest">Earliest Departure</option>
                        <option value="price_asc">Lowest Price</option>
                        <option value="price_desc">Highest Price</option>
                        <option value="seats">Most Seats Available</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[400px]">
                  {filteredRides.length === 0 ? (
                    <div className="flex flex-col h-full items-center justify-center text-center text-muted-foreground min-h-[200px]">
                      <p>{allRides.length === 0 ? "No active rides in the system." : "No rides match your filters."}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredRides.map(ride => (
                        <RideCard key={ride.id} ride={ride} onBook={handleBookRide} />
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- GUEST LANDING PAGE VIEW ---
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-20 pt-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <h1 className="font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                Share Rides,{" "}
                <span className="gradient-text">Save Money</span>,{" "}
                Connect People
              </h1>

              <p className="text-lg text-muted-foreground">
                TripLy connects drivers with empty seats to passengers heading the same way.
                Post rides as a driver or search and book as a passenger.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/dashboard">
                  <Button variant="gradient" size="xl" className="group">
                    Find a Ride
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/post-ride">
                  <Button variant="glass" size="xl">
                    Offer a Ride
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Search Preview */}
            <div>
              <Card glass className="p-6 max-h-[500px] flex flex-col">
                <div className="mb-4">
                  <h3 className="font-display text-lg font-bold text-foreground mb-3">
                    Quick Ride Search
                  </h3>
                  <div className="flex flex-col gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Source City"
                        value={filterSource}
                        onChange={(e) => setFilterSource(e.target.value)}
                        className="pl-9 bg-muted/20"
                      />
                    </div>
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Destination City"
                        value={filterDest}
                        onChange={(e) => setFilterDest(e.target.value)}
                        className="pl-9 bg-muted/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {filteredRides.length === 0 ? (
                    <div className="flex flex-col h-40 items-center justify-center text-center text-muted-foreground">
                      <p>{allRides.length === 0 ? "No active rides in the system." : "No rides match your filters."}</p>
                    </div>
                  ) : (
                    filteredRides.map(ride => (
                      <RideCard key={ride.id} ride={ride} onBook={handleBookRide} />
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Why Choose <span className="gradient-text">TripLy</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              The smartest way to travel between cities
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                glass
                className="group p-6 transition-all duration-300 hover:scale-105"
              >
                <CardContent className="space-y-4 p-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <Card glass className="relative overflow-hidden p-8 text-center sm:p-12">
            <div className="relative">
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                Ready to Start Your Journey?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-muted-foreground">
                Join thousands of travelers who save money and reduce their carbon footprint with TripLy.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link to="/register">
                  <Button variant="gradient" size="lg">
                    Create Free Account
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="glass" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 TripLy. Smart ride-sharing for everyone.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
