import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Car, Calendar, Shield, Trash2, CheckCircle, XCircle } from "lucide-react";
import { authService } from "@/services/authService";
import { adminService, User } from "@/services/adminService";
import { Ride } from "@/services/rideService";
import { Booking } from "@/services/bookingService";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import Payments from "./Payments";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [rides, setRides] = useState<Ride[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState("users");

    useEffect(() => {
        // Check if user is admin
        if (!authService.isLoggedIn()) {
            toast.error("Please login to access admin panel");
            navigate("/login");
            return;
        }

        if (authService.currentUser?.role !== "ROLE_ADMIN") {
            toast.error("Access denied. Admin privileges required.");
            navigate("/dashboard");
            return;
        }

        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [usersData, ridesData, bookingsData] = await Promise.all([
                adminService.getAllUsers(),
                adminService.getAllRides(),
                adminService.getAllBookings()
            ]);
            setUsers(usersData);
            setRides(ridesData);
            setBookings(bookingsData);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            // Construct payload from form (using name/value from form elements)
            const target = e.target as typeof e.target & {
                name: { value: string };
                phone: { value: string };
                role: { value: string };
                vehicleModel?: { value: string };
                licensePlate?: { value: string };
                capacity?: { value: string };
            };

            await adminService.updateUser(editingUser.id, {
                name: target.name.value,
                phone: target.phone.value,
                role: target.role.value,
                vehicleModel: target.vehicleModel?.value,
                licensePlate: target.licensePlate?.value,
                capacity: target.capacity?.value ? parseInt(target.capacity.value) : undefined
            });

            toast.success("User updated successfully");
            setEditingUser(null);
            fetchData();
        } catch (error) {
            toast.error("Failed to update user");
        }
    };

    const handleVerifyDriver = async (userId: number) => {
        try {
            await adminService.verifyDriver(userId);
            toast.success("Driver verified successfully");
            fetchData(); // Refresh data
        } catch (error) {
            toast.error("Failed to verify driver");
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await adminService.deleteUser(userId);
            toast.success("User deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    const stats = [
        {
            title: "Total Users",
            value: users.length.toString(),
            icon: Users,
            color: "text-primary"
        },
        {
            title: "Active Rides",
            value: rides.length.toString(),
            icon: Car,
            color: "text-secondary"
        },
        {
            title: "Total Bookings",
            value: bookings.length.toString(),
            icon: Calendar,
            color: "text-accent"
        },
        {
            title: "Verified Drivers",
            value: users.filter(u => u.role === 'ROLE_DRIVER' && u.driverVerified).length.toString(),
            icon: Shield,
            color: "text-green-500"
        },
    ];

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading dashboard...</div>;
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            {/* ... Header ... */}
            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-foreground">
                    Admin <span className="gradient-text">Dashboard</span>
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Manage users, rides, and bookings dynamically.
                </p>
                <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchData}>
                        Refresh Data
                    </Button>
                </div>
            </div>

            {/* ... Stats Grid ... */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={stat.title} glass className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                                    <p className="mt-2 font-display text-3xl font-bold text-foreground">{stat.value}</p>
                                </div>
                                <div className={`rounded-xl bg-muted/50 p-3 ${stat.color}`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <Card className="w-full max-w-md bg-background shadow-xl">
                        <CardHeader>
                            <CardTitle>Edit User</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateUser} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Name</label>
                                    <Input name="name" defaultValue={editingUser.name} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone</label>
                                    <Input name="phone" defaultValue={editingUser.phone} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Role</label>
                                    <select
                                        name="role"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        defaultValue={editingUser.role}
                                    >
                                        <option value="ROLE_PASSENGER">PASSENGER</option>
                                        <option value="ROLE_DRIVER">DRIVER</option>
                                        <option value="ROLE_ADMIN">ADMIN</option>
                                    </select>
                                </div>

                                {editingUser.role === 'ROLE_DRIVER' && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Vehicle Model</label>
                                            <Input name="vehicleModel" defaultValue={editingUser.vehicleModel} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">License Plate</label>
                                            <Input name="licensePlate" defaultValue={editingUser.licensePlate} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Capacity</label>
                                            <Input name="capacity" type="number" defaultValue={editingUser.capacity} />
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="ghost" onClick={() => setEditingUser(null)}>Cancel</Button>
                                    <Button type="submit">Save Changes</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="users">User Management</TabsTrigger>
                    <TabsTrigger value="rides">Ride Management</TabsTrigger>
                    <TabsTrigger value="bookings">Booking Management</TabsTrigger>
                    <TabsTrigger value="payments">Financials</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    <Card glass>
                        <CardHeader>
                            <CardTitle>All Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.id}</TableCell>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === 'ROLE_ADMIN' ? 'destructive' : user.role === 'ROLE_DRIVER' ? 'default' : 'secondary'}>
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.role === 'ROLE_DRIVER' && (
                                                    user.driverVerified ?
                                                        <Badge variant="outline" className="text-green-600 border-green-600">Verified</Badge> :
                                                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">Unverified</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {user.role === 'ROLE_DRIVER' && !user.driverVerified && (
                                                        <Button size="icon" variant="ghost" title="Verify Driver" onClick={() => handleVerifyDriver(user.id)}>
                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                        </Button>
                                                    )}
                                                    <Button size="icon" variant="ghost" title="Edit User" onClick={() => setEditingUser(user)}>
                                                        <Users className="h-4 w-4 text-primary" /> {/* Reusing Users icon as edit icon to save import */}
                                                    </Button>
                                                    <Button size="icon" variant="ghost" title="Delete User" onClick={() => handleDeleteUser(user.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                {/* (Keep other tabs) */}

                <TabsContent value="rides" className="space-y-4">
                    <Card glass>
                        <CardHeader>
                            <CardTitle>All Rides</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Driver</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead>Destination</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Fare</TableHead>
                                        <TableHead>Seats</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rides.map((ride) => (
                                        <TableRow key={ride.id}>
                                            <TableCell>{ride.id}</TableCell>
                                            <TableCell>{ride.driver?.name || 'Unknown'}</TableCell>
                                            <TableCell>{ride.source}</TableCell>
                                            <TableCell>{ride.destination}</TableCell>
                                            <TableCell>{new Date(ride.departureTime).toLocaleString()}</TableCell>
                                            <TableCell>₹{ride.farePerSeat}</TableCell>
                                            <TableCell>{ride.availableSeats}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bookings" className="space-y-4">
                    <Card glass>
                        <CardHeader>
                            <CardTitle>All Bookings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Passenger</TableHead>
                                        <TableHead>Ride</TableHead>
                                        <TableHead>Seats</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookings.map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell>{booking.id}</TableCell>
                                            <TableCell>{booking.passenger?.name || 'Unknown'}</TableCell>
                                            <TableCell>{booking.ride ? `${booking.ride.source} -> ${booking.ride.destination}` : 'Unknown'}</TableCell>
                                            <TableCell>{booking.seatsBooked}</TableCell>
                                            <TableCell>
                                                <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                                                    {booking.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                    <Card glass>
                        <CardHeader>
                            <CardTitle>Global Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Payments />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <AnalyticsTab users={users} rides={rides} bookings={bookings} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminDashboard;
