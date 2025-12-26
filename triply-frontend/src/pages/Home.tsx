import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Shield, Wallet, MapPin, ArrowRight, Sparkles } from "lucide-react";

import { useEffect, useState } from "react";
import axios from "@/services/axiosConfig";
import { rideService, Ride } from "@/services/rideService";
import RideCard from "@/components/RideCard";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { bookingService } from "@/services/bookingService";

const Home = () => {
  const [stats, setStats] = useState({
    activeRiders: "0",
    ridesShared: "0",
    cities: "0"
  });

  const [allRides, setAllRides] = useState<Ride[]>([]);
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);
  const [filterSource, setFilterSource] = useState("");
  const [filterDest, setFilterDest] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load stats
        const statsRes = await axios.get('http://localhost:8082/api/public/stats');
        setStats({
          activeRiders: statsRes.data.activeRiders.toString(),
          ridesShared: statsRes.data.ridesShared.toString(),
          cities: statsRes.data.cities.toString()
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
    const filtered = allRides.filter(ride =>
      ride.source.toLowerCase().includes(lowerSource) &&
      ride.destination.toLowerCase().includes(lowerDest)
    );
    setFilteredRides(filtered);
  }, [filterSource, filterDest, allRides]);

  const handleBookRide = async (ride: any) => {
    if (!authService.isLoggedIn()) {
      navigate(`/login?redirect=/book&rideId=${ride.id}`);
      return;
    }

    const currentUser = authService.currentUser;
    if (currentUser?.role === 'ROLE_DRIVER' || currentUser?.role === 'DRIVER') {
      toast.error("Drivers cannot book rides. Please log in as a Passenger to book.");
      return;
    }

    // Redirect to Payment Page
    navigate('/payments', { state: { ride, booking: { seats: 1 } } });
  };

  const features = [
    {
      icon: Search,
      title: "Smart Search",
      description: "Find rides instantly by source, destination, and date with smart filters.",
    },
    {
      icon: Shield,
      title: "Verified Drivers",
      description: "All drivers are verified with ratings and reviews for safe travels.",
    },
    {
      icon: Wallet,
      title: "Fair Pricing",
      description: "Transparent per-seat fares with no hidden charges or surge pricing.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-20 pt-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Premium Ride Sharing</span>
              </div>

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
                {(!authService.currentUser || authService.currentUser.role === 'ROLE_DRIVER' || authService.currentUser.role === 'DRIVER' || authService.currentUser.role === 'ROLE_ADMIN') && (
                  <Link to="/post-ride">
                    <Button variant="outline" size="xl">
                      Offer a Ride
                    </Button>
                  </Link>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-4">
                <div>
                  <p className="font-display text-3xl font-bold text-foreground">{stats.activeRiders}+</p>
                  <p className="text-sm text-muted-foreground">Active Riders</p>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-foreground">{stats.ridesShared}+</p>
                  <p className="text-sm text-muted-foreground">Rides Shared</p>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-foreground">{stats.cities}+</p>
                  <p className="text-sm text-muted-foreground">Cities</p>
                </div>
              </div>
            </div>

            {/* Right Content - Live Rides List */}
            <div className="relative h-[600px] w-full lg:w-[110%] lg:-mr-12">
              <Card glass className="flex h-full flex-col p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <div className="mb-4 shrink-0">
                  <h3 className="mb-4 font-display text-xl font-bold text-foreground">
                    Live Ride Feed
                  </h3>
                  <div className="flex gap-3">
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
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {filteredRides.length === 0 ? (
                    <div className="flex flex-col h-40 items-center justify-center text-center text-muted-foreground">
                      <p>{allRides.length === 0 ? "No active rides in the system." : "No rides match your filter."}</p>
                      {allRides.length === 0 && (!authService.currentUser || authService.currentUser.role === 'ROLE_DRIVER' || authService.currentUser.role === 'DRIVER' || authService.currentUser.role === 'ROLE_ADMIN') && (
                        <Link to="/post-ride" className="mt-2 text-primary hover:underline">
                          Offer a ride!
                        </Link>
                      )}
                    </div>
                  ) : (
                    filteredRides.map(ride => (
                      <RideCard key={ride.id} ride={ride as any} onBook={handleBookRide} />
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
                className="group p-6 transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-0">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 transition-transform group-hover:scale-110">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
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
