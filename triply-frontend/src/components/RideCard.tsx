import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, IndianRupee, User, Info, Sun, Wind, Car } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { Ride, rideService } from "@/services/rideService";
import { userService } from "@/services/userService";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Edit2, Plus, X, Upload } from "lucide-react";

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

  // Carousel Logic
  const allImages = useMemo(() => {
    const images = [];
    if (image) images.push(image);
    if (ride.extraImages && ride.extraImages.length > 0) {
      images.push(...ride.extraImages);
    }
    return images;
  }, [image, ride.extraImages]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Edit State
  const [editFormData, setEditFormData] = useState({
    model: "",
    plateNumber: "",
    acAvailable: false,
    sunroofAvailable: false,
    imageUrl: "",
    extraImages: [] as string[]
  });

  const isOwner = authService.currentUser?.id === ride.driver?.id;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const startEditing = () => {
    setEditFormData({
      model: ride.vehicleModel || "",
      plateNumber: ride.vehiclePlate || "",
      acAvailable: ride.acAvailable || false,
      sunroofAvailable: ride.sunroofAvailable || false,
      imageUrl: ride.vehicleImage || "",
      extraImages: ride.extraImages ? [...ride.extraImages] : []
    });
    setIsEditing(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    // Max 10 images constraint check
    const currentCount = (editFormData.imageUrl ? 1 : 0) + editFormData.extraImages.length;
    const newFilesCount = e.target.files.length;

    if (currentCount + newFilesCount > 10) {
      toast.error("You can only have up to 10 images in total.");
      return;
    }

    try {
      setEditLoading(true);
      const newUrls: string[] = [];

      // Upload all selected files
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const url = await userService.uploadImage(file);
        newUrls.push(url);
      }

      setEditFormData(prev => {
        // If no main image, set first uploaded as main, rest as extra
        let newMain = prev.imageUrl;
        let newExtra = [...prev.extraImages];

        newUrls.forEach(url => {
          if (!newMain) {
            newMain = url;
          } else {
            newExtra.push(url);
          }
        });

        return {
          ...prev,
          imageUrl: newMain,
          extraImages: newExtra
        };
      });
      toast.success("Images uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload images");
    } finally {
      setEditLoading(false);
    }
  };

  const removeImage = (index: number, isMain: boolean) => {
    setEditFormData(prev => {
      if (isMain) {
        // Remove main image, promote first extra image if available
        const newMain = prev.extraImages.length > 0 ? prev.extraImages[0] : "";
        const newExtra = prev.extraImages.length > 0 ? prev.extraImages.slice(1) : [];
        return { ...prev, imageUrl: newMain, extraImages: newExtra };
      } else {
        // Remove from extra images
        const newExtra = prev.extraImages.filter((_, i) => i !== index);
        return { ...prev, extraImages: newExtra };
      }
    });
  };

  const saveChanges = async () => {
    try {
      setEditLoading(true);
      if (!authService.currentUser) return;

      await rideService.updateRide(ride.id, {
        vehicleId: undefined, // ensure we don't overwrite with ID
        model: editFormData.model,
        plateNumber: editFormData.plateNumber,
        imageUrl: editFormData.imageUrl,
        extraImages: editFormData.extraImages,
        acAvailable: editFormData.acAvailable,
        sunroofAvailable: editFormData.sunroofAvailable
      });

      toast.success("Ride details updated successfully!");
      setIsEditing(false);
      window.location.reload(); // Simple reload to refresh data
    } catch (error) {
      console.error(error);
      toast.error("Failed to update ride details");
    } finally {
      setEditLoading(false);
    }
  };

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
                {!isEditing ? (
                  <>
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted group">
                      {allImages.length > 0 ? (
                        <>
                          <img
                            src={allImages[currentImageIndex]}
                            alt={`${model} view ${currentImageIndex + 1}`}
                            className="h-full w-full object-cover transition-all duration-300"
                          />
                          {allImages.length > 1 && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
                              >
                                <ChevronLeft className="h-6 w-6" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
                              >
                                <ChevronRight className="h-6 w-6" />
                              </button>
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                {allImages.map((_, idx) => (
                                  <div
                                    key={idx}
                                    className={`h-1.5 w-1.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <Car className="h-16 w-16 opacity-20" />
                        </div>
                      )}
                    </div>

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
                        <div className="flex items-center gap-1 rounded-full bg-pink-500/10 px-2 py-1 text-xs text-pink-600 dark:text-pink-400">
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
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Vehicle Photos (Max 10)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {editFormData.imageUrl && (
                          <div className="relative aspect-square rounded-md overflow-hidden border">
                            <img src={editFormData.imageUrl} className="h-full w-full object-cover" />
                            <button type="button" onClick={() => removeImage(0, true)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"><X className="h-3 w-3" /></button>
                          </div>
                        )}
                        {editFormData.extraImages.map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded-md overflow-hidden border">
                            <img src={img} className="h-full w-full object-cover" />
                            <button type="button" onClick={() => removeImage(idx, false)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"><X className="h-3 w-3" /></button>
                          </div>
                        ))}
                        {((editFormData.imageUrl ? 1 : 0) + editFormData.extraImages.length < 10) && (
                          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border border-dashed hover:bg-muted/50">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground mt-1">Add</span>
                            <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} disabled={editLoading} />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Vehicle Model</Label>
                        <Input value={editFormData.model} onChange={e => setEditFormData({ ...editFormData, model: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>License Plate</Label>
                        <Input value={editFormData.plateNumber} onChange={e => setEditFormData({ ...editFormData, plateNumber: e.target.value })} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Features</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={editFormData.acAvailable} onChange={e => setEditFormData({ ...editFormData, acAvailable: e.target.checked })} className="rounded border-gray-300" />
                          AC Available
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={editFormData.sunroofAvailable} onChange={e => setEditFormData({ ...editFormData, sunroofAvailable: e.target.checked })} className="rounded border-gray-300" />
                          Sunroof
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                {!isEditing ? (
                  <>
                    {isOwner ? (
                      <Button className="w-full" onClick={startEditing} variant="outline">
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Details
                      </Button>
                    ) : (
                      onBook && authService.currentUser?.role !== 'ROLE_ADMIN' && (
                        <Button className="w-full" onClick={handleBookClick} variant="gradient">
                          Book This Ride
                        </Button>
                      )
                    )}
                  </>
                ) : (
                  <div className="flex gap-2 w-full">
                    <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={editLoading} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={saveChanges} disabled={editLoading} className="flex-1">
                      {editLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
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
