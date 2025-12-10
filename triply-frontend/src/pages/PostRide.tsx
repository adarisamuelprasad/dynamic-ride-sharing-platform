import { authService } from "@/services/authService";
import { rideService } from "@/services/rideService";
import { userService } from "@/services/userService";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Calendar, Users, IndianRupee, Car, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const PostRide = () => {
  const [form, setForm] = useState({
    source: "",
    destination: "",
    departureTime: "",
    availableSeats: "3",
    farePerSeat: "",
    vehicleId: "",
  });
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      navigate("/login?redirect=/post-ride");
      return;
    }

    const user = authService.currentUser;
    if (user?.role === "ROLE_ADMIN") {
      toast.error("Admins cannot participate in ride sharing activities.");
      navigate("/dashboard");
      return;
    }

    if (user?.role !== "ROLE_DRIVER") {
      toast.error("Only drivers can post rides. Please register as a driver.");
      navigate("/dashboard");
      return;
    }

    // Load vehicles
    loadVehicles();
  }, [navigate]);

  const loadVehicles = async () => {
    try {
      const data = await userService.getVehicles();
      const vehicleList = Array.isArray(data) ? data : [];
      setVehicles(vehicleList);

      // Safely pre-select first vehicle if available
      if (vehicleList.length > 0) {
        const firstVehicle = vehicleList[0];
        if (firstVehicle && firstVehicle.id) {
          setForm(prev => ({
            ...prev,
            vehicleId: firstVehicle.id.toString(),
            availableSeats: firstVehicle.capacity?.toString() || "3"
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load vehicles", err);
      setVehicles([]);
    }
  };

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleVehicleChange = (val: string) => {
    update("vehicleId", val);
    const selected = vehicles.find(v => v.id.toString() === val);
    if (selected && selected.capacity) {
      update("availableSeats", selected.capacity.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await rideService.postRide({
        ...form,
        availableSeats: parseInt(form.availableSeats),
        farePerSeat: parseFloat(form.farePerSeat),
        vehicleId: form.vehicleId ? parseInt(form.vehicleId) : undefined
      });
      setLoading(false);
      toast.success("Ride posted successfully!");
      navigate("/dashboard");
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error("Failed to post ride. Please try again.");
    }
  };

  if (!authService.isLoggedIn()) {
    return null; // or a loading spinner
  }

  const user = authService.currentUser;

  if (user?.role !== "ROLE_DRIVER") {
    // Navigate happens in useEffect, but return null here to avoid flashing/rendering unauthorized content
    return <div className="p-8 text-center">Redirecting...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary">
          <Car className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Offer a <span className="gradient-text">Ride</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Share your journey and help others while earning
        </p>
      </div>

      <Card glass className="animate-fade-in">
        <CardHeader>
          <CardTitle>Ride Details</CardTitle>
          <CardDescription>
            Enter your trip information to find passengers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Vehicle Selection */}
            <div className="space-y-2">
              <Label htmlFor="vehicle" className="text-foreground">Select Vehicle</Label>
              {vehicles.length === 0 ? (
                <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                  You haven't added any vehicles yet. {" "}
                  <Link to="/profile" className="font-medium underline underline-offset-4 hover:text-yellow-800 dark:hover:text-yellow-300">
                    Add a vehicle in your profile
                  </Link>
                  {" "} to post a ride.
                </div>
              ) : (
                <Select value={form.vehicleId} onValueChange={handleVehicleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(vehicles) && vehicles.filter(v => v && v.id).map((v) => (
                      <SelectItem key={v.id} value={v.id.toString()}>
                        {v.model} - {v.plateNumber} ({v.capacity} seats)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Route */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="source" className="text-foreground">Pickup Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                  <Input
                    id="source"
                    placeholder="e.g., Mumbai Central"
                    className="pl-10"
                    value={form.source}
                    onChange={(e) => update("source", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination" className="text-foreground">Drop-off Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
                  <Input
                    id="destination"
                    placeholder="e.g., Pune Station"
                    className="pl-10"
                    value={form.destination}
                    onChange={(e) => update("destination", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-2">
              <Label htmlFor="departureTime" className="text-foreground">Departure Date & Time</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="departureTime"
                  type="datetime-local"
                  className="pl-10"
                  value={form.departureTime}
                  onChange={(e) => update("departureTime", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Seats & Fare */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="availableSeats" className="text-foreground">Available Seats</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
                  <Input
                    id="availableSeats"
                    type="number"
                    min="1"
                    max="6"
                    className="pl-10"
                    value={form.availableSeats}
                    onChange={(e) => update("availableSeats", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="farePerSeat" className="text-foreground">Fare per Seat (₹)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="farePerSeat"
                    type="number"
                    min="0"
                    placeholder="450"
                    className="pl-10"
                    value={form.farePerSeat}
                    onChange={(e) => update("farePerSeat", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Suggested Fare */}
            {form.source && form.destination && (
              <div className="rounded-lg border border-accent/30 bg-accent/10 p-4 animate-fade-in">
                <p className="text-sm text-accent">
                  💡 Suggested fare for {form.source} → {form.destination}: ₹400-500 per seat
                </p>
              </div>
            )}

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                "Posting ride..."
              ) : (
                <>
                  Post Ride
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card glass className="mt-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <CardContent className="p-6">
          <h3 className="mb-3 font-display font-semibold text-foreground">Tips for Drivers</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Set competitive fares to attract more passengers</li>
            <li>• Provide accurate pickup and drop-off locations</li>
            <li>• Maintain a clean vehicle for better ratings</li>
            <li>• Communicate with passengers before the trip</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostRide;
