import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, User, Sun, Wind, Car, Star, MessageSquareQuote, Zap, Armchair, PawPrint, Cigarette, ChevronLeft, ChevronRight, Edit2, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { rideService } from "@/services/rideService";
import { bookingService } from "@/services/bookingService";
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

const RideCard = ({ ride, onBook }) => {
  const departureDate = new Date(ride.departureTime);
  const navigate = useNavigate();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleBookClick = async () => {
    // Check if user is logged in
    if (!authService.isLoggedIn()) {
      // Redirect to login with ride ID
      navigate(`/login?redirect=/book&rideId=${ride.id}`);
    } else {
      const user = authService.currentUser;
      if (user?.role === 'DRIVER' || user?.role === 'ROLE_DRIVER' || user?.role === 'ROLE_ADMIN') {
        toast.error("Drivers and Admins cannot book rides.");
        return;
      }

      // User is logged in, request ride (or just open payment directly)
      // Assuming onBook is passed from Dashboard to handle logic
      if (onBook) {
        onBook(ride.id);
        setIsDetailsOpen(false);
        return;
      }

      // Fallback internal handler if onBook prop not provided
      try {
        setIsDetailsOpen(false);
        // Navigate to payment page directly with ride details
        navigate('/payment', { state: { ride, bookingDetails: { seats: 1 } } });
      } catch (error) {
        console.error(error);
        toast.error("Failed to initiate booking");
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
    model: model,
    plateNumber: plate || "",
    acAvailable: ride.acAvailable || false,
    sunroofAvailable: ride.sunroofAvailable || false,
    instantBooking: ride.instantBooking || false,
    maxTwoInBack: ride.maxTwoInBack || false,
    petsAllowed: ride.petsAllowed || false,
    smokingAllowed: ride.smokingAllowed || false,
    imageUrl: ride.vehicleImage || "",
    extraImages: ride.extraImages || []
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
      model: model,
      plateNumber: plate || "",
      acAvailable: ride.acAvailable || false,
      sunroofAvailable: ride.sunroofAvailable || false,
      instantBooking: ride.instantBooking || false,
      maxTwoInBack: ride.maxTwoInBack || false,
      petsAllowed: ride.petsAllowed || false,
      smokingAllowed: ride.smokingAllowed || false,
      imageUrl: ride.vehicleImage || "",
      extraImages: ride.extraImages || []
    });
    setIsEditing(true);
  };

  const handleImageUpload = async (e) => {
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
      const newUrls = [];

      // Upload all selected files
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`File ${file.name} is not an image`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Max size is 5MB`);
          continue;
        }

        const url = await userService.uploadImage(file);
        newUrls.push(url);
      }

      if (newUrls.length === 0) {
        toast.error("No images were uploaded successfully");
        return;
      }

      setEditFormData(prev => {
        // If no main image, set first uploaded, rest extras
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
      toast.success(`${newUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error("Image upload error", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to upload images";
      toast.error(errorMessage);
    } finally {
      setEditLoading(false);
      // Reset the file input
      e.target.value = '';
    }
  };

  const removeImage = (index, isMain) => {
    setEditFormData(prev => {
      if (isMain) {
        // Remove main image, promote first extra image if available
        const newMain = prev.extraImages.length > 0 ? prev.extraImages[0] : "";
        const newExtra = prev.extraImages.length > 0 ? prev.extraImages.slice(1) : [];
        return { ...prev, imageUrl: newMain, extraImages: newExtra };
      } else {
        // Remove from extra images
        return { ...prev, extraImages: prev.extraImages.filter((_, i) => i !== index) };
      }
    });
  };

  const saveChanges = async () => {
    try {
      setEditLoading(true);
      if (!authService.currentUser) return;

      await rideService.updateRide(ride.id, {
        vehicleId: ride.vehicleId, // ensure we don't overwrite with ID context if not needed, or pass correct ID
        // The API might expect specific fields, mapping state to API DTO
        price: ride.farePerSeat, // Keeping price same as we don't edit it here? Or should we?
        ...editFormData
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
    <Card className="overflow-hidden transition-all duration-300 hover:bg-muted/50 border hover:border-primary/50 group">
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        {allImages.length > 0 ? (
          <div
            className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
            style={{ backgroundImage: `url(${allImages[0]})` }}
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
        {/* Route Timeline */}
        <div className="mb-6 relative">
          <div className="flex items-center justify-between font-bold text-lg mb-1">
            <span>{format(departureDate, "HH:mm")}</span>
            {ride.distanceKm && (
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-muted-foreground font-normal">{(ride.distanceKm / 50).toFixed(1)}h</span>
              </div>
            )}
            <span className="text-muted-foreground">
              {ride.distanceKm ? format(new Date(departureDate.getTime() + (ride.distanceKm / 50) * 3600000), "HH:mm") : "--:--"}
            </span>
          </div>

          <div className="relative flex items-center gap-2 mb-2">
            <div className="h-3 w-3 rounded-full border-2 border-primary bg-background z-10" />
            <div className="flex-1 h-[2px] bg-muted-foreground/20 relative">
              {ride.distanceKm && (
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[150%] text-[10px] bg-background px-1 text-muted-foreground">
                  {(ride.distanceKm).toFixed(0)} km
                </span>
              )}
            </div>
            <div className="h-3 w-3 rounded-full border-2 border-primary bg-background z-10" />
          </div>

          <div className="flex justify-between text-sm text-foreground font-medium">
            <span className="truncate max-w-[45%]" title={ride.source}>{ride.source}</span>
            <span className="truncate max-w-[45%] text-right" title={ride.destination}>{ride.destination}</span>
          </div>
        </div>

        {/* Quick Details & Amenities */}
        <div className="mb-4 space-y-3">
          <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">₹{ride.farePerSeat}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className={ride.availableSeats > 0 ? "text-green-600 font-medium" : "text-red-500"}>
                {ride.availableSeats} seats
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{ride.driver?.name}</span>
              <div className="flex items-center text-xs text-yellow-500">
                <Star className="h-3 w-3 fill-current mr-0.5" />
                {ride.driver?.averageRating?.toFixed(1) || "New"}
              </div>
            </div>
          </div>

          {/* Quick Amenities Icons */}
          <div className="flex gap-2">
            {ride.acAvailable && <span title="AC"><Wind className="h-3 w-3 text-blue-500" /></span>}
            {ride.petsAllowed && <span title="Pets Allowed"><PawPrint className="h-3 w-3 text-emerald-500" /></span>}
            {ride.smokingAllowed && <span title="Smoking Allowed"><Cigarette className="h-3 w-3 text-gray-500" /></span>}
            {ride.instantBooking && <span title="Instant Booking"><Zap className="h-3 w-3 text-orange-500" /></span>}
            {ride.maxTwoInBack && <span title="Max 2 in Back"><Armchair className="h-3 w-3 text-purple-500" /></span>}
          </div>
        </div>

        <div className="mt-auto flex gap-2">
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                Details
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
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
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          <span className="text-xs font-medium">
                            {ride.driver?.averageRating ? ride.driver.averageRating.toFixed(1) : "New"} ({ride.driver?.reviewCount || 0} reviews)
                          </span>
                        </div>
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
                        {ride.instantBooking && (
                          <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-1 text-xs text-orange-600 dark:text-orange-400">
                            <Zap className="h-3 w-3" /> Instant
                          </div>
                        )}
                        {ride.maxTwoInBack && (
                          <div className="flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-1 text-xs text-purple-600 dark:text-purple-400">
                            <Armchair className="h-3 w-3" /> Max 2 Back
                          </div>
                        )}
                        {ride.petsAllowed && (
                          <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-600 dark:text-emerald-400">
                            <PawPrint className="h-3 w-3" /> Pets
                          </div>
                        )}
                        {ride.smokingAllowed && (
                          <div className="flex items-center gap-1 rounded-full bg-gray-500/10 px-2 py-1 text-xs text-gray-600 dark:text-gray-400">
                            <Cigarette className="h-3 w-3" /> Smoking
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
                        <span className="text-sm font-medium">{format(departureDate, "MMMM d, yyyy 'at' HH:mm")}</span>
                      </div>
                    </div>

                    {ride.reviews && ride.reviews.length > 0 && (
                      <div className="space-y-3 pt-4 border-t">
                        <h4 className="text-sm font-medium leading-none flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          Reviews ({ride.reviews.length})
                        </h4>
                        <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                          {ride.reviews.map((review) => (
                            <div key={review.id} className="bg-muted/50 p-2.5 rounded-lg text-sm space-y-1">
                              <div className="flex justify-between items-start">
                                <span className="font-semibold text-xs">{review.reviewer?.name || "Passenger"}</span>
                                <div className="flex text-yellow-500">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-current" : ""}`} />
                                  ))}
                                </div>
                              </div>
                              {review.comment && (
                                <div className="text-muted-foreground text-xs flex gap-1.5 mt-1">
                                  <MessageSquareQuote className="h-3 w-3 flex-shrink-0 opacity-50" />
                                  <span className="italic">{review.comment}</span>
                                </div>
                              )}
                              <div className="text-[10px] text-muted-foreground text-right pt-1">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border border-dashed hover:bg-red-50">
                            <Plus className="h-8 w-8 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Add Photo</span>
                            <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
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
                      <Label>Features & Amenities</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center gap-2 text-sm border p-2 rounded hover:bg-muted/50 cursor-pointer">
                          <input type="checkbox" checked={editFormData.acAvailable} onChange={e => setEditFormData({ ...editFormData, acAvailable: e.target.checked })} className="rounded border-gray-300" />
                          <Wind className="h-3 w-3" /> AC
                        </label>
                        <label className="flex items-center gap-2 text-sm border p-2 rounded hover:bg-muted/50 cursor-pointer">
                          <input type="checkbox" checked={editFormData.sunroofAvailable} onChange={e => setEditFormData({ ...editFormData, sunroofAvailable: e.target.checked })} className="rounded border-gray-300" />
                          <Sun className="h-3 w-3" /> Sunroof
                        </label>
                        <label className="flex items-center gap-2 text-sm border p-2 rounded hover:bg-muted/50 cursor-pointer">
                          <input type="checkbox" checked={editFormData.instantBooking} onChange={e => setEditFormData({ ...editFormData, instantBooking: e.target.checked })} className="rounded border-gray-300" />
                          <Zap className="h-3 w-3" /> Instant
                        </label>
                        <label className="flex items-center gap-2 text-sm border p-2 rounded hover:bg-muted/50 cursor-pointer">
                          <input type="checkbox" checked={editFormData.maxTwoInBack} onChange={e => setEditFormData({ ...editFormData, maxTwoInBack: e.target.checked })} className="rounded border-gray-300" />
                          <Armchair className="h-3 w-3" /> Max 2 Back
                        </label>
                        <label className="flex items-center gap-2 text-sm border p-2 rounded hover:bg-muted/50 cursor-pointer">
                          <input type="checkbox" checked={editFormData.petsAllowed} onChange={e => setEditFormData({ ...editFormData, petsAllowed: e.target.checked })} className="rounded border-gray-300" />
                          <PawPrint className="h-3 w-3" /> Pets
                        </label>
                        <label className="flex items-center gap-2 text-sm border p-2 rounded hover:bg-muted/50 cursor-pointer">
                          <input type="checkbox" checked={editFormData.smokingAllowed} onChange={e => setEditFormData({ ...editFormData, smokingAllowed: e.target.checked })} className="rounded border-gray-300" />
                          <Cigarette className="h-3 w-3" /> Smoking
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                {!isEditing ? (
                  <>
                    {isOwner && ride.status !== 'COMPLETED' && ride.status !== 'CANCELLED' ? (
                      <Button className="w-full" onClick={startEditing} variant="outline">
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Details
                      </Button>
                    ) : (
                      onBook && authService.currentUser?.role !== 'ROLE_ADMIN' && ride.status !== 'COMPLETED' && ride.status !== 'CANCELLED' && (
                        <Button className="w-full" onClick={handleBookClick} variant="gradient">
                          Request Ride
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
              Request Ride
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RideCard;
