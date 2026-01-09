import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Car, Calendar, Shield, Trash2, CheckCircle, XCircle, Ban, Star, Wallet } from "lucide-react";
import { authService } from "@/services/authService";
import { adminService } from "@/services/adminService";
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
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [usersData, setUsersData] = useState({ content: [], totalPages: 0, number: 0, totalElements: 0 });
    const [ridesData, setRidesData] = useState({ content: [], totalPages: 0, number: 0, totalElements: 0 });
    const [bookingsData, setBookingsData] = useState({ content: [], totalPages: 0, number: 0, totalElements: 0 });
    const [rudeData, setRudeData] = useState({ content: [], totalPages: 0, number: 0, totalElements: 0 });

    // Pagination State
    const [pageState, setPageState] = useState({
        users: 0,
        rides: 0,
        bookings: 0,
        rude: 0
    });

    const [isLoading, setIsLoading] = useState(true);

    const [editingUser, setEditingUser] = useState(null);
    const [activeTab, setActiveTab] = useState("users");
    const [userFilter, setUserFilter] = useState('ALL');

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

        fetchData(activeTab);
    }, [navigate, activeTab, pageState]);

    const fetchData = async (tab) => {
        try {
            setIsLoading(true);
            const page = pageState[tab] || 0;
            const size = 10;

            if (tab === 'users') {
                const data = await adminService.getAllUsers(page, size);
                setUsersData(data);
            } else if (tab === 'rides') {
                const data = await adminService.getAllRides(page, size);
                setRidesData(data);
            } else if (tab === 'bookings') {
                const data = await adminService.getAllBookings(page, size);
                setBookingsData(data);
            } else if (tab === 'rude') {
                const data = await adminService.getRudeReviews(page, size);
                setRudeData(data);
            }
        } catch (error) {
            console.error("Failed to fetch admin data", error);
            // toast.error("Failed to load dashboard data");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = (tab, newPage) => {
        if (newPage < 0) return;
        setPageState(prev => ({ ...prev, [tab]: newPage }));
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            const formData = new FormData(e.target);
            const updates = Object.fromEntries(formData.entries());

            await adminService.updateUser(editingUser.id, updates);
            toast.success("User updated successfully");
            setEditingUser(null);
            fetchData(activeTab);
        } catch (error) {
            toast.error("Failed to update user");
        }
    };

    const handleVerifyDriver = async (userId) => {
        try {
            await adminService.verifyDriver(userId);
            toast.success("Driver verified successfully");
            fetchData(activeTab); // Refresh data
        } catch (error) {
            toast.error("Failed to verify driver");
        }
    };

    const handleBlockUser = async (user) => {
        const action = user.blocked ? "unblock" : "block";
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;
        try {
            await adminService.blockUser(user.id, !user.blocked);
            toast.success(`User ${action}ed successfully`);
            fetchData(activeTab);
        } catch (error) {
            toast.error(`Failed to ${action} user`);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await adminService.deleteUser(userId);
            toast.success("User deleted successfully");
            fetchData(activeTab);
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    const renderPagination = (tab, data) => {
        if (!data || data.totalPages <= 1) return null;

        return (
            <Pagination className="mt-4">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => handlePageChange(tab, data.number - 1)}
                            className={data.number === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>

                    {[...Array(data.totalPages)].map((_, i) => {
                        // Simple logic: Show first, last, current, and adjacent pages
                        if (i === 0 || i === data.totalPages - 1 || (i >= data.number - 1 && i <= data.number + 1)) {
                            return (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        isActive={i === data.number}
                                        onClick={() => handlePageChange(tab, i)}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        } else if (i === 1 || i === data.totalPages - 2) {
                            return <PaginationItem key={i}>...</PaginationItem>
                        }
                        return null;
                    })}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() => handlePageChange(tab, data.number + 1)}
                            className={data.number === data.totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    // Calculate Stats
    // Note: Revenue calculation is now estimated or needs backend support for exact total. 
    // Using simple multiplier for now or 0.
    const totalRevenue = 0;

    // Using Backend Counts
    const stats = [
        {
            title: "Total Revenue",
            value: `₹${totalRevenue.toLocaleString()}`,
            icon: Wallet,
            color: "text-green-500"
        },
        {
            title: "Total Users",
            value: usersData.totalElements || 0,
            icon: Users,
            color: "text-blue-500"
        },
        {
            title: "Total Rides",
            value: ridesData.totalElements || 0,
            icon: Car,
            color: "text-purple-500"
        },
        {
            title: "Total Bookings",
            value: bookingsData.totalElements || 0,
            icon: Calendar,
            color: "text-orange-500"
        }
    ];

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading dashboard...</div>;
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-foreground">
                    Admin <span className="gradient-text">Dashboard</span>
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Manage users, rides, and bookings dynamically.
                </p>
                <div className="mt-4 flex gap-2">
                    <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => fetchData(activeTab)}>
                            Refresh Data
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={stat.title} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
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
                                        <option value="ROLE_PASSENGER">Passenger</option>
                                        <option value="ROLE_DRIVER">Driver</option>
                                        <option value="ROLE_ADMIN">Admin</option>
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
                <TabsList className="w-full justify-start overflow-x-auto">
                    <TabsTrigger value="users">User Management</TabsTrigger>
                    <TabsTrigger value="rides">Ride Management</TabsTrigger>
                    <TabsTrigger value="bookings">Booking Management</TabsTrigger>
                    <TabsTrigger value="rude">Rude Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>All Users</CardTitle>
                                <select
                                    className="h-9 w-[150px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={userFilter}
                                    onChange={(e) => setUserFilter(e.target.value)}
                                >
                                    <option value="ALL">All Roles</option>
                                    <option value="ROLE_PASSENGER">Passengers</option>
                                    <option value="ROLE_DRIVER">Drivers</option>
                                    <option value="ROLE_ADMIN">Admins</option>
                                </select>
                            </div>
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
                                    {usersData.content?.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.id}</TableCell>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === 'ROLE_ADMIN' ? 'destructive' : user.role === 'ROLE_DRIVER' ? 'default' : 'secondary'}>
                                                    {user.role?.replace('ROLE_', '')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.blocked ? (
                                                    <Badge variant="destructive">Blocked</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {(user.role === 'ROLE_DRIVER' || user.role === 'DRIVER') && !user.driverVerified && (
                                                        <Button size="icon" variant="ghost" title="Verify Driver" onClick={() => handleVerifyDriver(user.id)}>
                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                        </Button>
                                                    )}
                                                    <Button size="icon" variant="ghost" title="Edit User" onClick={() => setEditingUser(user)}>
                                                        <Users className="h-4 w-4 text-primary" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" title={user.blocked ? "Unblock User" : "Block User"} onClick={() => handleBlockUser(user)}>
                                                        <Ban className={`h-4 w-4 ${user.blocked ? "text-green-500" : "text-orange-500"}`} />
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
                            {renderPagination('users', usersData)}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rides" className="space-y-4">
                    <Card>
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
                                    {ridesData.content?.map((ride) => (
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
                            {renderPagination('rides', ridesData)}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bookings" className="space-y-4">
                    <Card>
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
                                    {bookingsData.content?.map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell>{booking.id}</TableCell>
                                            <TableCell>{booking.passenger?.name || 'Unknown'}</TableCell>
                                            <TableCell>{booking.ride ? `${booking.ride.source} -> ${booking.ride.destination}` : 'Unknown Trip'}</TableCell>
                                            <TableCell>{booking.seatsBooked}</TableCell>
                                            <TableCell>
                                                <Badge variant={booking.status === 'CONFIRMED' ? 'default' : booking.status === 'CANCELLED' ? 'destructive' : 'secondary'}>
                                                    {booking.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {renderPagination('bookings', bookingsData)}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rude" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Rude / Low Rated Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Reviewer</TableHead>
                                        <TableHead>Reviewee</TableHead>
                                        <TableHead>Rating</TableHead>
                                        <TableHead>Comment</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rudeData.content?.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-4">No rude activity found.</TableCell></TableRow>}
                                    {rudeData.content?.map((review) => (
                                        <TableRow key={review.id}>
                                            <TableCell>{review.reviewer?.name} ({review.reviewer?.email})</TableCell>
                                            <TableCell>{review.reviewee?.name} ({review.reviewee?.email})</TableCell>
                                            <TableCell><span className="text-red-500 font-bold">{review.rating}/5</span></TableCell>
                                            <TableCell>{review.comment}</TableCell>
                                            <TableCell>{new Date(review.createdAt).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {renderPagination('rude', rudeData)}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminDashboard;
