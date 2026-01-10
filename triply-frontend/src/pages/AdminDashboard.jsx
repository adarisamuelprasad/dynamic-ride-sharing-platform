import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Car, Calendar, Trash2, CheckCircle, XCircle, Ban, Star, Wallet, Activity, LayoutDashboard, Menu, FileText } from "lucide-react";
import { authService } from "@/services/authService";
import { adminService } from "@/services/adminService";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
    const [activeTab, setActiveTab] = useState("overview");
    const [userFilter, setUserFilter] = useState('ALL');
    const [userSort, setUserSort] = useState('id_asc');
    const [rideSort, setRideSort] = useState('id_asc'); // New ride sort state
    const [bookingSort, setBookingSort] = useState('id_asc'); // New booking sort state
    const [analyticsData, setAnalyticsData] = useState(null);
    const [analyticsPeriod, setAnalyticsPeriod] = useState('month');
    const [chartData, setChartData] = useState([]);

    const [dashboardStats, setDashboardStats] = useState({
        totalUsers: 0,
        totalRides: 0,
        totalBookings: 0,
        totalRevenue: 0
    });

    const [blockUserDialog, setBlockUserDialog] = useState({ open: false, user: null });
    const [deleteUserDialog, setDeleteUserDialog] = useState({ open: false, userId: null });

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

        const loadStats = async () => {
            try {
                const [stats, charts] = await Promise.all([
                    adminService.getDashboardStats(),
                    adminService.getDashboardCharts()
                ]);
                setDashboardStats(stats);
                setChartData(charts);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                if (activeTab === 'overview') {
                    setIsLoading(false);
                }
            }
        };

        loadStats();
        if (activeTab !== 'overview') {
            fetchData(activeTab);
        }
    }, [navigate, activeTab, pageState, userSort, rideSort, bookingSort, analyticsPeriod]);

    // ... (fetchData and handlePageChange remain unchanged)

    // ... (handleUpdateUser and verifyDriver remain unchanged)

    // I will use replace_file_content on specific blocks.
    /* Since I cannot conditionally skipping blocks in ONE call, I will do multiple calls or replace carefully */

    const fetchData = async (tab) => {
        try {
            setIsLoading(true);
            const page = pageState[tab] || 0;
            const size = 10;

            if (tab === 'users') {
                // Convert userSort to backend sort parameters
                let sortBy = 'id';
                let sortDir = 'asc';

                switch (userSort) {
                    case 'id_asc':
                        sortBy = 'id';
                        sortDir = 'asc';
                        break;
                    case 'id_desc':
                        sortBy = 'id';
                        sortDir = 'desc';
                        break;
                    case 'name_asc':
                        sortBy = 'name';
                        sortDir = 'asc';
                        break;
                    case 'name_desc':
                        sortBy = 'name';
                        sortDir = 'desc';
                        break;
                }

                const data = await adminService.getAllUsers(page, size, sortBy, sortDir);
                setUsersData(data);
            } else if (tab === 'rides') {
                // Convert rideSort to backend sort parameters
                let sortBy = 'id';
                let sortDir = 'asc';

                switch (rideSort) {
                    case 'id_asc': sortBy = 'id'; sortDir = 'asc'; break;
                    case 'id_desc': sortBy = 'id'; sortDir = 'desc'; break;
                    case 'date_asc': sortBy = 'departureTime'; sortDir = 'asc'; break;
                    case 'date_desc': sortBy = 'departureTime'; sortDir = 'desc'; break;
                    case 'price_asc': sortBy = 'farePerSeat'; sortDir = 'asc'; break;
                    case 'price_desc': sortBy = 'farePerSeat'; sortDir = 'desc'; break;
                    case 'seats_asc': sortBy = 'availableSeats'; sortDir = 'asc'; break;
                    case 'seats_desc': sortBy = 'availableSeats'; sortDir = 'desc'; break;
                }

                const data = await adminService.getAllRides(page, size, sortBy, sortDir);
                setRidesData(data);
            } else if (tab === 'bookings') {
                // Convert bookingSort to backend sort parameters
                let sortBy = 'id';
                let sortDir = 'asc';

                switch (bookingSort) {
                    case 'id_asc': sortBy = 'id'; sortDir = 'asc'; break;
                    case 'id_desc': sortBy = 'id'; sortDir = 'desc'; break;
                    case 'status_asc': sortBy = 'status'; sortDir = 'asc'; break;
                    case 'status_desc': sortBy = 'status'; sortDir = 'desc'; break;
                }

                const data = await adminService.getAllBookings(page, size, sortBy, sortDir);
                setBookingsData(data);
            } else if (tab === 'analytics') {
                const data = await adminService.getAnalytics(analyticsPeriod);
                setAnalyticsData(data);
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

    const handleBlockUser = (user) => {
        setBlockUserDialog({ open: true, user });
    };

    const confirmBlockUser = async () => {
        const user = blockUserDialog.user;
        if (!user) return;
        const action = user.blocked ? "unblock" : "block";
        try {
            await adminService.blockUser(user.id, !user.blocked);
            toast.success(`User ${action}ed successfully`);
            fetchData(activeTab);
        } catch (error) {
            toast.error(`Failed to ${action} user`);
        } finally {
            setBlockUserDialog({ open: false, user: null });
        }
    };

    const handleDeleteUser = (userId) => {
        setDeleteUserDialog({ open: true, userId });
    };

    const confirmDeleteUser = async () => {
        if (!deleteUserDialog.userId) return;
        try {
            await adminService.deleteUser(deleteUserDialog.userId);
            toast.success("User deleted successfully");
            fetchData(activeTab);
        } catch (error) {
            toast.error("Failed to delete user");
        } finally {
            setDeleteUserDialog({ open: false, userId: null });
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

    const handleGenerateReport = async () => {
        try {
            const blob = await adminService.downloadSummaryReport();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Triply_Report_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("Report generated successfully");
        } catch (error) {
            console.error("Failed to generate report", error);
            toast.error("Failed to generate report");
        }
    };

    // Calculate Stats
    // Note: Revenue calculation is now estimated or needs backend support for exact total. 
    // Using simple multiplier for now or 0.

    // Using Backend Counts
    const stats = [
        {
            title: "Total Revenue",
            value: `₹${dashboardStats.totalRevenue.toLocaleString()}`,
            icon: Wallet,
            color: "text-green-500"
        },
        {
            title: "Total Users",
            value: dashboardStats.totalUsers,
            icon: Users,
            color: "text-blue-500"
        },
        {
            title: "Total Rides",
            value: dashboardStats.totalRides,
            icon: Car,
            color: "text-purple-500"
        },
        {
            title: "Total Bookings",
            value: dashboardStats.totalBookings,
            icon: Calendar,
            color: "text-orange-500"
        }
    ];

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading dashboard...</div>;
    }

    return (
        <div className="flex min-h-screen bg-gray-50/50 pt-20">
            {/* Sidebar */}
            <aside className="fixed left-0 top-16 z-30 hidden h-[calc(100vh-4rem)] w-64 border-r bg-background md:block">
                <div className="space-y-4 py-4">
                    <div className="px-3 py-2">
                        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Admin Console</h2>
                        <div className="space-y-1">
                            <Button variant={activeTab === 'overview' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('overview')}>
                                <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
                            </Button>
                            <Button variant={activeTab === 'users' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('users')}>
                                <Users className="mr-2 h-4 w-4" /> User Management
                            </Button>
                            <Button variant={activeTab === 'rides' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('rides')}>
                                <Car className="mr-2 h-4 w-4" /> Ride Management
                            </Button>
                            <Button variant={activeTab === 'bookings' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('bookings')}>
                                <Calendar className="mr-2 h-4 w-4" /> Booking Management
                            </Button>
                            <Button variant={activeTab === 'analytics' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('analytics')}>
                                <Activity className="mr-2 h-4 w-4" /> Financial Analytics
                            </Button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground">
                            {activeTab === 'overview' ? 'Dashboard Overview' :
                                activeTab === 'users' ? 'User Management' :
                                    activeTab === 'rides' ? 'Ride Management' :
                                        activeTab === 'bookings' ? 'Booking Management' :
                                            'Financial Analytics'}
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Manage your platform efficiently.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleGenerateReport}>
                            <FileText className="mr-2 h-4 w-4" />
                            Generate Report
                        </Button>
                        <Button variant="outline" onClick={() => activeTab === 'overview' ? window.location.reload() : fetchData(activeTab)}>
                            Refresh Data
                        </Button>
                    </div>
                </div>

                {/* Overview Content */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {stats.map((stat, index) => (
                                <Card key={stat.title} className="hover:shadow-lg transition-transform hover:-translate-y-1 duration-300">
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

                        {/* Charts */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Revenue (Last 7 Days)</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                            <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                                            <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Bookings (Last 7 Days)</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="bookings" stroke="#f97316" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

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

                {activeTab === 'users' && (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center flex-wrap gap-3">
                                    <CardTitle>All Users</CardTitle>
                                    <div className="flex gap-3">
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
                                        <select
                                            className="h-9 w-[170px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            value={userSort}
                                            onChange={(e) => setUserSort(e.target.value)}
                                        >
                                            <option value="id_asc">ID: Low to High</option>
                                            <option value="id_desc">ID: High to Low</option>
                                            <option value="name_asc">Name: A-Z</option>
                                            <option value="name_desc">Name: Z-A</option>
                                        </select>
                                    </div>
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
                    </div>
                )}

                {activeTab === 'rides' && (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center flex-wrap gap-4">
                                    <CardTitle>All Rides</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
                                        <select
                                            className="h-9 w-[180px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            value={rideSort}
                                            onChange={(e) => setRideSort(e.target.value)}
                                        >
                                            <option value="id_asc">ID: Low to High</option>
                                            <option value="id_desc">ID: High to Low</option>
                                            <option value="date_asc">Date: Earliest First</option>
                                            <option value="date_desc">Date: Latest First</option>
                                            <option value="price_asc">Price: Low to High</option>
                                            <option value="price_desc">Price: High to Low</option>
                                            <option value="seats_asc">Seats: Low to High</option>
                                            <option value="seats_desc">Seats: High to Low</option>
                                        </select>
                                    </div>
                                </div>
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
                    </div>
                )}

                {activeTab === 'bookings' && (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center flex-wrap gap-4">
                                    <CardTitle>All Bookings</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
                                        <select
                                            className="h-9 w-[180px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            value={bookingSort}
                                            onChange={(e) => setBookingSort(e.target.value)}
                                        >
                                            <option value="id_asc">ID: Low to High</option>
                                            <option value="id_desc">ID: High to Low</option>
                                            <option value="status_asc">Status: A-Z</option>
                                            <option value="status_desc">Status: Z-A</option>
                                        </select>
                                    </div>
                                </div>
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
                    </div>
                )}



                {activeTab === 'analytics' && (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Financial & Activity Analytics</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Overview of platform performance
                                        </p>
                                    </div>
                                    <select
                                        className="h-9 w-[180px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        value={analyticsPeriod}
                                        onChange={(e) => setAnalyticsPeriod(e.target.value)}
                                    >
                                        <option value="today">Today</option>
                                        <option value="week">This Week</option>
                                        <option value="10days">Last 10 Days</option>
                                        <option value="month">This Month</option>
                                        <option value="quarter">This Quarter</option>
                                        <option value="year">This Year</option>
                                    </select>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {!analyticsData ? (
                                    <div className="text-center py-8">Loading analytics...</div>
                                ) : (
                                    <div className="space-y-8">
                                        {/* Financial Section */}
                                        <div>
                                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                                <Wallet className="h-5 w-5 text-green-500" />
                                                Financial Overview
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <Card className="bg-green-500/10 border-green-500/20">
                                                    <CardContent className="p-4">
                                                        <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                                                        <p className="text-2xl font-bold flex items-baseline gap-1">
                                                            ₹{analyticsData.financial?.totalRevenue?.toLocaleString()}
                                                            <span className="text-xs font-normal text-muted-foreground">received</span>
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                                <Card className="bg-orange-500/10 border-orange-500/20">
                                                    <CardContent className="p-4">
                                                        <p className="text-sm font-medium text-muted-foreground">Pending / Cash</p>
                                                        <p className="text-2xl font-bold flex items-baseline gap-1">
                                                            ₹{analyticsData.financial?.pendingRevenue?.toLocaleString()}
                                                            <span className="text-xs font-normal text-muted-foreground">estimated</span>
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardContent className="p-4">
                                                        <p className="text-sm font-medium text-muted-foreground">Paid Transactions</p>
                                                        <p className="text-2xl font-bold">{analyticsData.financial?.paidTransactions}</p>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardContent className="p-4">
                                                        <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                                                        <p className="text-2xl font-bold">{analyticsData.financial?.totalTransactions}</p>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>

                                        {/* Activity Section */}
                                        <div>
                                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                                <Activity className="h-5 w-5 text-blue-500" />
                                                Platform Activity
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Bookings</h4>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="bg-secondary/50 p-3 rounded-lg">
                                                            <p className="text-xs text-muted-foreground">Total Bookings</p>
                                                            <p className="text-xl font-bold">{analyticsData.activity?.totalBookings}</p>
                                                        </div>
                                                        <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                                                            <p className="text-xs text-green-600">Confirmed</p>
                                                            <p className="text-xl font-bold text-green-700">{analyticsData.activity?.confirmedBookings}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Rides</h4>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="bg-secondary/50 p-3 rounded-lg">
                                                            <p className="text-xs text-muted-foreground">Total Created</p>
                                                            <p className="text-xl font-bold">{analyticsData.activity?.totalRides}</p>
                                                        </div>
                                                        <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                                                            <p className="text-xs text-blue-600">Active Now</p>
                                                            <p className="text-xl font-bold text-blue-700">{analyticsData.activity?.activeRides}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Users Active</h4>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                                                            <p className="text-xs text-orange-600">Drivers</p>
                                                            <p className="text-xl font-bold text-orange-700">{analyticsData.activity?.activeDrivers}</p>
                                                        </div>
                                                        <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
                                                            <p className="text-xs text-purple-600">Passengers</p>
                                                            <p className="text-xl font-bold text-purple-700">{analyticsData.activity?.activePassengers}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-xs text-muted-foreground text-right">
                                            Data period: {new Date(analyticsData.startDate).toLocaleDateString('en-GB')} - {new Date(analyticsData.endDate).toLocaleDateString('en-GB')}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
