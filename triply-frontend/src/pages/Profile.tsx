import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Mail, Phone, Car, Plus, Save, Edit2, Trash2, XCircle, Star } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";

const Profile = () => {
    const [user, setUser] = useState<any>(null);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Profile Form State
    const [profileForm, setProfileForm] = useState({
        name: "",
        phone: ""
    });

    // New Vehicle Form State
    const [vehicleForm, setVehicleForm] = useState<{
        id: number | null;
        model: string;
        plateNumber: string;
        capacity: string;
        acAvailable: boolean;
        sunroofAvailable: boolean;
        imageUrl: string;
        extraImages: string[];
    }>({
        id: null,
        model: "",
        plateNumber: "",
        capacity: "4",
        acAvailable: false,
        sunroofAvailable: false,
        imageUrl: "",
        extraImages: []
    });
    const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const currentUser = authService.currentUser;
        if (currentUser) {
            setUser(currentUser);
            setProfileForm({
                name: currentUser.name,
                phone: currentUser.phone || "" // Phone might not be in auth response sometimes? checking authService... it is not there currently in interface but backend sends it.
            });

            // If driver, load vehicles
            if (currentUser.role === 'DRIVER' || currentUser.role === 'ROLE_DRIVER') {
                try {
                    const vData = await userService.getVehicles();
                    setVehicles(vData);
                } catch (error) {
                    console.error("Failed to load vehicles", error);
                }
            }
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setLoading(true);
            await userService.updateProfile(profileForm);
            // Update local storage/auth service
            const updatedUser = { ...user, ...profileForm };
            localStorage.setItem('triply_user', JSON.stringify(updatedUser));
            authService.currentUser = updatedUser;
            authService.notify();

            setUser(updatedUser);
            setIsEditing(false);
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleAddVehicle = async () => {
        try {
            setLoading(true);
            const payload = {
                ...vehicleForm,
                capacity: parseInt(vehicleForm.capacity) || 4
            };

            if (vehicleForm.id) {
                // Update existing
                await userService.updateVehicle(vehicleForm.id, payload);
                toast.success("Vehicle updated successfully");
            } else {
                // Add new
                await userService.addVehicle(payload);
                toast.success("Vehicle added successfully");
            }

            setIsAddVehicleOpen(false);
            setVehicleForm({
                id: null,
                model: "",
                plateNumber: "",
                capacity: "4",
                acAvailable: false,
                sunroofAvailable: false,
                imageUrl: "",
                extraImages: []
            });
            // Reload vehicles
            const vData = await userService.getVehicles();
            setVehicles(vData);
        } catch (error) {
            toast.error(vehicleForm.id ? "Failed to update vehicle" : "Failed to add vehicle");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVehicle = async (id: number) => {
        if (!confirm("Are you sure you want to delete this vehicle?")) return;
        try {
            setLoading(true);
            await userService.deleteVehicle(id);
            toast.success("Vehicle deleted successfully");
            // Reload vehicles
            const vData = await userService.getVehicles();
            setVehicles(vData);
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete vehicle");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="p-8 text-center">Loading profile...</div>;

    return (
        <div className="container mx-auto max-w-4xl p-6 space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-display font-bold">My Profile</h1>
            </div>

            <div className="grid gap-8 md:grid-cols-[1fr,1.5fr]">

                {/* Personal Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Manage your personal details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-600 px-3 py-1 rounded-full border border-yellow-400/20">
                                <Star className="h-4 w-4 fill-yellow-400" />
                                <span className="font-semibold">{user.averageRating ? user.averageRating.toFixed(1) : "New"}</span>
                                <span className="text-xs text-muted-foreground ml-1">({user.reviewCount || 0} reviews)</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={isEditing ? profileForm.name : user.name}
                                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                                    disabled={!isEditing}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={user.email}
                                    disabled
                                    className="pl-10 bg-muted/50"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={isEditing ? profileForm.phone : (user.phone || 'N/A')} // Handle missing phone in UI if necessary, though type says string
                                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                                    disabled={!isEditing}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <Button onClick={handleUpdateProfile} disabled={loading} className="w-full">
                                        <Save className="mr-2 h-4 w-4" /> Save Changes
                                    </Button>
                                    <Button variant="outline" onClick={() => setIsEditing(false)} className="w-full">
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full">
                                    <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Vehicles Card (Driver Only) */}
                {(user.role === 'DRIVER' || user.role === 'ROLE_DRIVER') && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">My Vehicles</h2>
                            <Dialog open={isAddVehicleOpen} onOpenChange={(open) => {
                                setIsAddVehicleOpen(open);
                                if (!open) {
                                    // Reset form on close
                                    setVehicleForm({
                                        id: null,
                                        model: "",
                                        plateNumber: "",
                                        capacity: "4",
                                        acAvailable: false,
                                        sunroofAvailable: false,
                                        imageUrl: "",
                                        extraImages: []
                                    });
                                }
                            }}>
                                <DialogTrigger asChild>
                                    <Button size="sm">
                                        <Plus className="mr-2 h-4 w-4" /> Add Vehicle
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>{vehicleForm.id ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Vehicle Model *</Label>
                                            <Input
                                                placeholder="e.g. Honda City"
                                                value={vehicleForm.model}
                                                onChange={(e) => setVehicleForm(prev => ({ ...prev, model: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>License Plate *</Label>
                                            <Input
                                                placeholder="MH 01 AB 1234"
                                                value={vehicleForm.plateNumber}
                                                onChange={(e) => setVehicleForm(prev => ({ ...prev, plateNumber: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Capacity *</Label>
                                            <Input
                                                type="number"
                                                value={vehicleForm.capacity}
                                                onChange={(e) => setVehicleForm(prev => ({ ...prev, capacity: e.target.value }))}
                                            />
                                        </div>

                                        {/* Main Image */}
                                        <div className="space-y-2">
                                            <Label>Main Vehicle Image (Optional)</Label>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        try {
                                                            const url = await userService.uploadImage(file);
                                                            setVehicleForm(prev => ({ ...prev, imageUrl: url }));
                                                            toast.success("Main image uploaded!");
                                                        } catch (err) {
                                                            toast.error("Failed to upload image");
                                                        }
                                                    }
                                                }}
                                            />
                                            {vehicleForm.imageUrl && (
                                                <div className="mt-2 h-32 w-full rounded-md bg-cover bg-center" style={{ backgroundImage: `url(${vehicleForm.imageUrl})` }} />
                                            )}
                                        </div>

                                        {/* Extra Images */}
                                        <div className="space-y-2">
                                            <Label>Additional Images (Max 10)</Label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {vehicleForm.extraImages?.map((img, idx) => (
                                                    <div key={idx} className="relative aspect-square rounded-md bg-cover bg-center" style={{ backgroundImage: `url(${img})` }}>
                                                        <button
                                                            className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white"
                                                            onClick={() => setVehicleForm(prev => ({
                                                                ...prev,
                                                                extraImages: prev.extraImages.filter((_, i) => i !== idx)
                                                            }))}
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {(!vehicleForm.extraImages || vehicleForm.extraImages.length < 10) && (
                                                    <label className="flex aspect-square cursor-pointer items-center justify-center rounded-md border border-dashed hover:bg-muted/50">
                                                        <Plus className="h-6 w-6 text-muted-foreground" />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            className="hidden"
                                                            onChange={async (e) => {
                                                                const files = e.target.files;
                                                                if (files) {
                                                                    const newImages = [...(vehicleForm.extraImages || [])];
                                                                    if (newImages.length + files.length > 10) {
                                                                        toast.error("You can only upload up to 10 images.");
                                                                        return;
                                                                    }

                                                                    for (let i = 0; i < files.length; i++) {
                                                                        try {
                                                                            const url = await userService.uploadImage(files[i]);
                                                                            newImages.push(url);
                                                                        } catch (err) {
                                                                            console.error("Failed upload", err);
                                                                        }
                                                                    }
                                                                    setVehicleForm(prev => ({ ...prev, extraImages: newImages }));
                                                                    toast.success("Images added!");
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-6">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    checked={vehicleForm.acAvailable}
                                                    onCheckedChange={(c) => setVehicleForm(prev => ({ ...prev, acAvailable: c === true }))}
                                                    id="new-ac"
                                                />
                                                <Label htmlFor="new-ac">AC</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    checked={vehicleForm.sunroofAvailable}
                                                    onCheckedChange={(c) => setVehicleForm(prev => ({ ...prev, sunroofAvailable: c === true }))}
                                                    id="new-sunroof"
                                                />
                                                <Label htmlFor="new-sunroof">Sunroof</Label>
                                            </div>
                                        </div>
                                        <Button onClick={handleAddVehicle} disabled={loading} className="w-full">
                                            {loading ? "Saving..." : (vehicleForm.id ? "Update Vehicle" : "Add Vehicle")}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="grid gap-4">
                            {vehicles.map((v) => (
                                <Card key={v.id} className="overflow-hidden">
                                    <div className="flex flex-col sm:flex-row">
                                        {v.imageUrl ? (
                                            <div className="sm:w-32 h-32 sm:h-auto bg-cover bg-center" style={{ backgroundImage: `url(${v.imageUrl})` }} />
                                        ) : (
                                            <div className="sm:w-32 h-32 sm:h-auto bg-muted flex items-center justify-center">
                                                <Car className="h-12 w-12 text-muted-foreground/50" />
                                            </div>
                                        )}
                                        <div className="p-4 flex-1 flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-lg">{v.model}</h3>
                                                <p className="text-sm text-muted-foreground mb-2">{v.plateNumber}</p>
                                                <div className="flex flex-wrap gap-2 text-xs">
                                                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                                                        {v.capacity} Seats
                                                    </span>
                                                    {v.acAvailable && (
                                                        <span className="bg-blue-500/10 text-blue-600 px-2 py-1 rounded-full">AC</span>
                                                    )}
                                                    {v.sunroofAvailable && (
                                                        <span className="bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded-full">Sunroof</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => {
                                                    setVehicleForm({
                                                        id: v.id,
                                                        model: v.model,
                                                        plateNumber: v.plateNumber,
                                                        capacity: v.capacity.toString(),
                                                        acAvailable: v.acAvailable,
                                                        sunroofAvailable: v.sunroofAvailable,
                                                        imageUrl: v.imageUrl,
                                                        extraImages: v.extraImages || []
                                                    });
                                                    setIsAddVehicleOpen(true);
                                                }}>
                                                    <Edit2 className="h-4 w-4 text-primary" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" onClick={() => handleDeleteVehicle(v.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {vehicles.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                    No vehicles added yet.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
