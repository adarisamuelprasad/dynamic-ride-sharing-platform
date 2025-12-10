import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, IndianRupee, User, Info, Sun, Wind, Car } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { Ride } from "@/services/rideService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";

interface RideCardProps {
  ride: Ride;
  onBook?: (ride: Ride) => void;
}

const RideCard = ({ ride, onBook }: RideCardProps) => {
  const departureDate = new Date(ride.departureTime);
  const navigate = useNavigate();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleBookClick = () => {
    // Check if user is logged in
    if (!authService.isLoggedIn()) {
      // Redirect to login with ride ID
      navigate(`/login?redirect=/book&rideId=${ride.id}`);
    } else {
      // User is logged in, proceed with booking
      if (onBook) {
        onBook(ride);
        setIsDetailsOpen(false);
      }
    }
  };

  const model = ride.vehicleModel || ride.driver?.vehicleModel || "Standard Vehicle";
  const plate = ride.vehiclePlate || ride.driver?.licensePlate;
  const image = ride.vehicleImage;

  return (
    <Card glass className="overflow-hidden transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 h-full flex flex-col">
      <div className="relative h-40 w-full overflow-hidden bg-muted/20">
        {image ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-105"
            style={{ backgroundImage: `url(${image})` }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/30">
            <Car className="h-16 w-16" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          {ride.acAvailable && <span className="bg-blue-500/80 text-white p-1 rounded-full text-xs" title="AC Available"><Wind className="h-3 w-3" /></span>}
          {ride.sunroofAvailable && <span className="bg-yellow-500/80 text-white p-1 rounded-full text-xs" title="Sunroof"><Sun className="h-3 w-3" /></span>}
        </div>
      </div>

      <CardContent className="p-5 flex-1 flex flex-col">
        {/* Route */}
        <div className="mb-4">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center mt-1">
              <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              <div className="h-6 w-0.5 bg-gradient-to-b from-primary to-secondary" />
              <div className="h-2.5 w-2.5 rounded-full bg-secondary" />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">From</p>
                <p className="font-semibold text-foreground text-sm line-clamp-1" title={ride.source}>{ride.source}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">To</p>
                <p className="font-semibold text-foreground text-sm line-clamp-1" title={ride.destination}>{ride.destination}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Details */}
        <div className="mb-4 grid grid-cols-2 gap-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-xs">{format(departureDate, "MMM d, HH:mm")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground justify-end">
            <IndianRupee className="h-3.5 w-3.5" />
            <span className="font-bold text-foreground">₹{ride.farePerSeat}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
            <User className="h-3.5 w-3.5" />
            <span className="text-xs">{ride.driver?.name} • {model}</span>
          </div>
        </div>

        <div className="mt-auto flex gap-2">
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                Details
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ride Details</DialogTitle>
                <DialogDescription>
                  Full information about this trip
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {image && (
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                    <img src={image} alt={model} className="h-full w-full object-cover" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium leading-none">Vehicle</h4>
                    <p className="text-sm text-muted-foreground">{model}</p>
                    {plate && <p className="text-xs text-muted-foreground">{plate}</p>}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium leading-none">Driver</h4>
                    <p className="text-sm text-muted-foreground">{ride.driver?.name}</p>
                    <p className="text-xs text-muted-foreground">{ride.driver?.phone}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-medium leading-none mb-2">Features & Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-1 text-xs text-secondary-foreground">
                      <Users className="h-3 w-3" />
                      {ride.availableSeats} Seats Available
                    </div>
                    {ride.acAvailable && (
                      <div className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-xs text-blue-600 dark:text-blue-400">
                        <Wind className="h-3 w-3" /> AC
                      </div>
                    )}
                    {ride.sunroofAvailable && (
                      <div className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 text-xs text-yellow-600 dark:text-yellow-400">
                        <Sun className="h-3 w-3" /> Sunroof
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border p-3 bg-muted/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Per Passenger</span>
                    <span className="text-lg font-bold">₹{ride.farePerSeat}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Departure</span>
                    <span className="text-sm font-medium">{format(departureDate, "MMMM d, yyyy 'at' h:mm a")}</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                {onBook && authService.currentUser?.role !== 'ROLE_ADMIN' && (
                  <Button className="w-full" onClick={handleBookClick} variant="gradient">
                    Book This Ride
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {onBook && authService.currentUser?.role !== 'ROLE_ADMIN' && (
            <Button
              variant="gradient"
              size="sm"
              className="flex-1"
              onClick={handleBookClick}
            >
              Book
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RideCard;
