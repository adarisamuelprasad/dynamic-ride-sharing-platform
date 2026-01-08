import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Users, CheckCircle, Clock, XCircle } from "lucide-react";

interface BookingCardProps {
  booking: {
    id: number;
    seatsBooked: number;
    status: "CONFIRMED" | "PENDING" | "CANCELLED" | "COMPLETED" | "APPROVED" | "REJECTED";
    ride: {
      source: string;
      destination: string;
    };
    passenger?: {
      name: string;
    };
  };
<<<<<<< Updated upstream
}

const BookingCard = ({ booking }: BookingCardProps) => {
=======
  onCancel?: (id: number) => void;
  onViewDetails?: (booking: any) => void;
  onRate?: (booking: any) => void;
  onPay?: (booking: any) => void;
}

const BookingCard = ({ booking, onCancel, onViewDetails, onRate, onPay }: BookingCardProps) => {
>>>>>>> Stashed changes
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
      label: "Pending Approval",
    },
    APPROVED: {
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
      label: "Approved - Pay Now",
    },
    REJECTED: {
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-100",
      label: "Rejected",
    },
    CANCELLED: {
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      label: "Cancelled",
    },
  };

  const status = statusConfig[booking.status];
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
          {booking.passenger && (
            <span>• {booking.passenger.name}</span>
          )}
        </div>
<<<<<<< Updated upstream
=======


        {/* Actions */}
        <div className="mt-4 border-t pt-4 flex gap-2 flex-wrap">
          {onViewDetails && (
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 min-w-[100px]"
              onClick={() => onViewDetails(booking)}
            >
              Details
            </Button>
          )}

          {booking.status === 'APPROVED' && onPay && (
            <Button
              variant="gradient"
              size="sm"
              className="flex-1 min-w-[100px] animate-pulse"
              onClick={() => onPay(booking)}
            >
              Pay Now
            </Button>
          )}

          {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && booking.status !== "REJECTED" && onCancel && (
            <Button
              variant="destructive"
              size="sm"
              className="flex-1 min-w-[100px]"
              onClick={() => onCancel(booking.id)}
            >
              Cancel
            </Button>
          )}
          {booking.status === "COMPLETED" && onRate && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-yellow-500 text-yellow-600 hover:bg-yellow-50"
              onClick={() => onRate(booking)}
            >
              Rate Driver
            </Button>
          )}
        </div>
>>>>>>> Stashed changes
      </CardContent>
    </Card>
  );
};

export default BookingCard;
