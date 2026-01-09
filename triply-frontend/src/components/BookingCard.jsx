import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Users, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const BookingCard = ({ booking, onCancel, onViewDetails, onRate, onPay }) => {
  const statusConfig = {
    CONFIRMED: {
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
      label: "Confirmed",
    },
    PENDING: {
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      label: "Pending",
    },
    APPROVED: {
      icon: CheckCircle,
      color: "text-blue-600",
      bg: "bg-blue-50",
      label: "Approved",
    },
    REJECTED: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      label: "Rejected",
    },
    CANCELLED: {
      icon: XCircle,
      color: "text-gray-600",
      bg: "bg-gray-50",
      label: "Cancelled",
    },
    COMPLETED: {
      icon: CheckCircle,
      color: "text-purple-600",
      bg: "bg-purple-50",
      label: "Completed",
    },
  };

  const status = statusConfig[booking.status] || statusConfig.PENDING;
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
              variant="default"
              size="sm"
              className="flex-1 min-w-[100px] animate-pulse bg-green-600 hover:bg-green-700"
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
      </CardContent>
    </Card>
  );
};

export default BookingCard;
