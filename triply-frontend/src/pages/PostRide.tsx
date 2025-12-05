import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MapPin, Calendar, Users, IndianRupee, Car, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const PostRide = () => {
  const [form, setForm] = useState({
    source: "",
    destination: "",
    departureTime: "",
    availableSeats: "3",
    farePerSeat: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate posting ride
    setTimeout(() => {
      setLoading(false);
      toast.success("Ride posted successfully!");
      navigate("/dashboard");
    }, 1000);
  };

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
