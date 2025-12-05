import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Car, Calendar, Shield } from "lucide-react";
import { authService } from "@/services/authService";
import { toast } from "sonner";

const AdminDashboard = () => {
    const navigate = useNavigate();

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
    }, [navigate]);

    const stats = [
        { title: "Total Users", value: "1,234", icon: Users, color: "text-primary" },
        { title: "Active Rides", value: "89", icon: Car, color: "text-secondary" },
        { title: "Bookings Today", value: "45", icon: Calendar, color: "text-accent" },
        { title: "Verified Drivers", value: "567", icon: Shield, color: "text-green-500" },
    ];

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-foreground">
                    Admin <span className="gradient-text">Dashboard</span>
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Manage users, rides, and bookings
                </p>
            </div>

            {/* Stats Grid */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card
                        key={stat.title}
                        glass
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                                    <p className="mt-2 font-display text-3xl font-bold text-foreground">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`rounded-xl bg-muted/50 p-3 ${stat.color}`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Management Sections */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* User Management */}
                <Card glass className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            User Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            View and manage all users, verify drivers, and handle user permissions.
                        </p>
                        <div className="flex gap-2">
                            <Button variant="gradient" size="sm">
                                View All Users
                            </Button>
                            <Button variant="outline" size="sm">
                                Pending Verifications
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Ride Management */}
                <Card glass className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="h-5 w-5 text-secondary" />
                            Ride Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Monitor all rides, manage schedules, and handle ride-related issues.
                        </p>
                        <div className="flex gap-2">
                            <Button variant="gradient" size="sm">
                                View All Rides
                            </Button>
                            <Button variant="outline" size="sm">
                                Active Rides
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Booking Management */}
                <Card glass className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-accent" />
                            Booking Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Track all bookings, manage cancellations, and view booking analytics.
                        </p>
                        <div className="flex gap-2">
                            <Button variant="gradient" size="sm">
                                View All Bookings
                            </Button>
                            <Button variant="outline" size="sm">
                                Recent Activity
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* System Settings */}
                <Card glass className="animate-fade-in" style={{ animationDelay: "0.7s" }}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-green-500" />
                            System Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Configure system settings, manage permissions, and view logs.
                        </p>
                        <div className="flex gap-2">
                            <Button variant="gradient" size="sm">
                                Settings
                            </Button>
                            <Button variant="outline" size="sm">
                                View Logs
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card glass className="mt-6 animate-fade-in" style={{ animationDelay: "0.8s" }}>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                            Export Users
                        </Button>
                        <Button variant="outline" size="sm">
                            Generate Report
                        </Button>
                        <Button variant="outline" size="sm">
                            Send Notification
                        </Button>
                        <Button variant="outline" size="sm">
                            System Health Check
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboard;
