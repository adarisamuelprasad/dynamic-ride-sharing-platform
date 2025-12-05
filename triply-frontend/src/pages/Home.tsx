import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Shield, Wallet, MapPin, ArrowRight, Sparkles } from "lucide-react";

import { useEffect, useState } from "react";
import axios from "@/services/axiosConfig";

const Home = () => {
  const [stats, setStats] = useState({
    activeRiders: "0",
    ridesShared: "0",
    cities: "0"
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/public/stats');
        setStats({
          activeRiders: response.data.activeRiders.toString(),
          ridesShared: response.data.ridesShared.toString(),
          cities: response.data.cities.toString()
        });
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };
    fetchStats();
  }, []);

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
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
        </div>

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
                Triply connects drivers with empty seats to passengers heading the same way.
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
                  <Button variant="outline" size="xl">
                    Offer a Ride
                  </Button>
                </Link>
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

            {/* Right Content - Search Preview Card */}
            <div className="relative">
              <Card glass className="p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <h3 className="mb-6 font-display text-xl font-bold text-foreground">
                  Find Your Next Trip
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="font-medium text-foreground">Mumbai</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20">
                      <MapPin className="h-4 w-4 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">To</p>
                      <p className="font-medium text-foreground">Pune</p>
                    </div>
                  </div>
                  <Link to="/dashboard">
                    <Button variant="gradient" className="w-full">
                      Search Rides
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Decorative Elements */}
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-2xl bg-gradient-to-br from-accent/30 to-primary/30 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Why Choose <span className="gradient-text">Triply</span>
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
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10" />
            <div className="relative">
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                Ready to Start Your Journey?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-muted-foreground">
                Join thousands of travelers who save money and reduce their carbon footprint with Triply.
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
            © 2025 Triply. Smart ride-sharing for everyone.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
