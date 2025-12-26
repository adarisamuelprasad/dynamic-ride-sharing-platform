import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, CheckCircle, Clock, XCircle } from "lucide-react";

interface BookingCardProps {
  booking: {
    id: number;
    seatsBooked: number;
    status: "CONFIRMED" | "PENDING" | "CANCELLED";
    ride: {
      source: string;
      destination: string;
    };
    fareAmount?: number;
    passenger?: {
      name: string;
    };
  };
  onCancel?: (id: number) => void;
  onViewDetails?: (booking: any) => void;
}

const BookingCard = ({ booking, onCancel, onViewDetails }: BookingCardProps) => {
  const statusConfig = {
    CONFIRMED: {
      icon: CheckCircle,
      color: "text-accent",
      bg: "bg-accent/10",
      label: "Confirmed",
    },
    PENDING: {
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      label: "Pending",
    },
    CANCELLED: {
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      label: "Cancelled",
    },
    COMPLETED: {
      icon: CheckCircle,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      label: "Completed",
    },
  };

  const status = statusConfig[booking.status] || {
    icon: Clock,
    color: "text-muted-foreground",
    bg: "bg-muted",
    label: booking.status,
  };
  const StatusIcon = status.icon;

  return (
    <Card glass className="overflow-hidden">
      <CardContent className="p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Booking #{booking.id}
          </span>
          <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${status.bg}`}>
            <StatusIcon className={`h-3.5 w-3.5 ${status.color}`} />
            <span className={`text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Route */}
        <div className="mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">
            {booking.ride.source}
          </span>
          <span className="text-muted-foreground">→</span>
          <span className="font-semibold text-foreground">
            {booking.ride.destination}
          </span>
        </div>

        {/* Details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{booking.seatsBooked} seat(s)</span>
          </div>
          {booking.fareAmount && (
            <div className="flex items-center gap-1.5 border-l pl-4 font-bold text-foreground">
              ₹{booking.fareAmount.toFixed(2)}
            </div>
          )}
          {booking.passenger && (
            <span>• {booking.passenger.name}</span>
          )}
        </div>


        {/* Actions */}
        <div className="mt-4 border-t pt-4 flex gap-2">
          {onViewDetails && (
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => onViewDetails(booking)}
            >
              View Details
            </Button>
          )}
          {booking.status !== "CANCELLED" && onCancel && (
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() => onCancel(booking.id)}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card >
  );
};

export default BookingCard;
