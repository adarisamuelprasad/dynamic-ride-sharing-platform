import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, IndianRupee, User } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";

interface RideCardProps {
  ride: {
    id: number;
    source: string;
    destination: string;
    departureTime: string;
    availableSeats: number;
    farePerSeat: number;
    driver?: {
      name: string;
      vehicleModel?: string;
    };
  };
  onBook?: (ride: RideCardProps["ride"]) => void;
}

const RideCard = ({ ride, onBook }: RideCardProps) => {
  const departureDate = new Date(ride.departureTime);
  const navigate = useNavigate();

  const handleBookClick = () => {
    // Check if user is logged in
    if (!authService.isLoggedIn()) {
      // Redirect to login with ride ID
      navigate(`/login?redirect=/book&rideId=${ride.id}`);
    } else {
      // User is logged in, proceed with booking
      if (onBook) {
        onBook(ride);
      }
    }
  };

  return (
    <Card glass className="overflow-hidden transition-all duration-300 hover:border-primary/30 hover:-translate-y-1">
      <CardContent className="p-5">
        {/* Route */}
        <div className="mb-4">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <div className="h-8 w-0.5 bg-gradient-to-b from-primary to-secondary" />
              <div className="h-3 w-3 rounded-full bg-secondary" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">From</p>
                <p className="font-semibold text-foreground">{ride.source}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">To</p>
                <p className="font-semibold text-foreground">{ride.destination}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{format(departureDate, "MMM d, HH:mm")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 text-accent" />
            <span>{ride.availableSeats} seats</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IndianRupee className="h-4 w-4 text-secondary" />
            <span className="font-semibold text-foreground">₹{ride.farePerSeat}</span>
          </div>
          {ride.driver && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{ride.driver.name}</span>
            </div>
          )}
        </div>

        {/* Driver Vehicle */}
        {ride.driver?.vehicleModel && (
          <p className="mb-4 text-xs text-muted-foreground">
            🚗 {ride.driver.vehicleModel}
          </p>
        )}

        {/* Book Button */}
        {onBook && (
          <Button
            variant="gradient"
            className="w-full"
            onClick={handleBookClick}
          >
            Book Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default RideCard;
