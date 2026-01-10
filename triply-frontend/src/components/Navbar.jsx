import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon, Lock, Bell, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useState, useEffect } from "react";
import { authService } from "../services/authService";
import { notificationService } from "../services/notificationService";
import { toast } from "sonner";

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(authService.currentUser);
  const [theme, setTheme] = useState("dark");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [passData, setPassData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  const handlePasswordChange = (e) => {
    setPassData({ ...passData, [e.target.name]: e.target.value });
  };

  const submitPasswordChange = async () => {
    if (!passData.oldPassword || !passData.newPassword || !passData.confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (passData.newPassword !== passData.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    try {
      await authService.updatePassword(passData.oldPassword, passData.newPassword);
      toast.success("Password updated successfully!");
      setIsPasswordModalOpen(false);
      setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : "Failed to update password");
      toast.error(msg);
    }
  };

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = authService.subscribe((u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Optional: Poll every minute
      const interval = setInterval(loadNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getUserNotifications();
      setNotifications(data);
      const unread = data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  const handleNotificationClick = async (notif) => {
    setSelectedNotification(notif);
    setIsNotificationModalOpen(true);

    if (!notif.read) {
      try {
        await notificationService.markAsRead(notif.id);
        // update local state
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (e) { console.error(e) }
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    // Default to dark if no theme is saved
    if (!savedTheme || savedTheme === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = () => {
    authService.logout();
    setMobileMenuOpen(false);
    setIsLogoutDialogOpen(false);
    window.location.href = '/';
  };

  const confirmLogout = () => {
    setIsLogoutDialogOpen(true);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[hsl(0,0%,100%)] dark:bg-[hsl(222,47%,11%)] border-b border-[hsla(222,47%,11%,0.1)] dark:border-[hsla(0,0%,100%,0.06)] fixed top-0 left-0 right-0 z-50 w-full px-6 py-2 transition-colors duration-300 shadow-md">
      <div className="mx-auto max-w-6xl flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/triplylogo-black.png" alt="TripLy Logo" className="h-10 w-10 object-contain block dark:hidden" />
          <img src="/triplylogo-white.png" alt="TripLy Logo" className="h-10 w-10 object-contain hidden dark:block" />
          <span className="font-display text-xl font-bold text-foreground">
            TripLy
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-2 md:flex">
          {!user?.role?.includes('ADMIN') && (
            <Link to="/">
              <Button
                variant={isActive("/") ? "outline" : "ghost"}
                className={isActive("/") ? "border-black dark:border-white" : ""}
                size="sm"
              >
                Home
              </Button>
            </Link>
          )}

          {!user?.role?.includes('ADMIN') && (
            <Link to="/dashboard">
              <Button
                variant={isActive("/dashboard") ? "outline" : "ghost"}
                className={isActive("/dashboard") ? "border-black dark:border-white" : ""}
                size="sm"
              >
                Find Rides
              </Button>
            </Link>
          )}
          {(user?.role === 'PASSENGER' || user?.role === 'ROLE_PASSENGER') && (
            <Link to="/my-bookings">
              <Button
                variant={isActive("/my-bookings") ? "outline" : "ghost"}
                className={isActive("/my-bookings") ? "border-black dark:border-white" : ""}
                size="sm"
              >
                My Bookings
              </Button>
            </Link>
          )}
          {!user?.role?.includes('ADMIN') && (
            <Link to="/post-ride">
              <Button
                variant="ghost"
                size="sm"
              >
                Offer Ride
              </Button>
            </Link>
          )}
          {user?.role === 'ROLE_ADMIN' && (
            <Link to="/admin">
              <Button
                variant={isActive("/admin") ? "outline" : "ghost"}
                className={isActive("/admin") ? "border-black dark:border-white" : ""}
                size="sm"
              >
                Admin Dashboard
              </Button>
            </Link>
          )}
          {(user?.role === 'ROLE_DRIVER' || user?.role === 'DRIVER') && (
            <>
              <Link to="/ride-history">
                <Button
                  variant={isActive("/ride-history") ? "outline" : "ghost"}
                  className={isActive("/ride-history") ? "border-black dark:border-white" : ""}
                  size="sm"
                >
                  Ride History
                </Button>
              </Link>
              <Link to="/driver-requests">
                <Button
                  variant={isActive("/driver-requests") ? "outline" : "ghost"}
                  className={isActive("/driver-requests") ? "border-black dark:border-white" : ""}
                  size="sm"
                >
                  Requests
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Auth Buttons & Theme Toggle */}
        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-9 h-9"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-9 h-9 relative"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600 ring-1 ring-white dark:ring-black" />
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-[80vh] overflow-y-auto">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No new notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <DropdownMenuItem
                    key={notif.id}
                    className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="flex w-full justify-between items-center">
                      <span className={`font-semibold text-sm ${!notif.read ? 'text-primary' : ''}`}>
                        {notif.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-xs ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notif.message}
                    </p>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email || 'No Email'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to="/profile">
                  <DropdownMenuItem>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={() => setIsPasswordModalOpen(true)}>
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Change Password</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={confirmLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="gradient" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Profile Password</DialogTitle>
              <DialogDescription>
                Enter your current password and the new password below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="oldPassword" className="text-right">
                  Current
                </Label>
                <Input
                  id="oldPassword"
                  name="oldPassword"
                  type="password"
                  value={passData.oldPassword}
                  onChange={handlePasswordChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newPassword" className="text-right">
                  New
                </Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passData.newPassword}
                  onChange={handlePasswordChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="confirmPassword" className="text-right">
                  Confirm
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={submitPasswordChange}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be logged out of your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-9 h-9"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <button
            className="text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        <Dialog open={isNotificationModalOpen} onOpenChange={setIsNotificationModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedNotification?.type?.replace(/_/g, ' ')}</DialogTitle>
              <DialogDescription>
                {new Date(selectedNotification?.createdAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="p-3 bg-muted rounded-md text-sm">
                {selectedNotification?.message}
              </div>

              {selectedNotification?.additionalData && (() => {
                try {
                  const data = JSON.parse(selectedNotification.additionalData);
                  return (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Details:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(data).map(([key, value]) => (
                          <div key={key} className="flex flex-col">
                            <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className="font-medium truncate" title={value}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                } catch (e) { return null; }
              })()}

              {selectedNotification?.type === 'RIDE_REQUEST' && (
                <div className="flex justify-end gap-2 pt-2">
                  <Button onClick={() => { setIsNotificationModalOpen(false); window.location.href = '/driver-requests'; }}>
                    View Requests
                  </Button>
                </div>
              )}
              {selectedNotification?.type.includes('PAYMENT') && (
                <div className="flex justify-end gap-2 pt-2">
                  <Button onClick={() => { setIsNotificationModalOpen(false); window.location.href = '/my-bookings'; }}>
                    View Booking
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 md:hidden">
          {!user?.role?.includes('ADMIN') && (
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                Home
              </Button>
            </Link>
          )}
          {!user?.role?.includes('ADMIN') && (
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                Find Rides
              </Button>
            </Link>
          )}
          {(user?.role === 'PASSENGER' || user?.role === 'ROLE_PASSENGER') && (
            <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                My Bookings
              </Button>
            </Link>
          )}
          {!user?.role?.includes('ADMIN') && (
            <Link to="/post-ride" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                Offer Ride
              </Button>
            </Link>
          )}
          {
            user?.role === 'ROLE_ADMIN' && (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Admin Dashboard
                </Button>
              </Link>
            )
          }

          {
            (user?.role === 'ROLE_DRIVER' || user?.role === 'DRIVER') && (
              <Link to="/ride-history" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Ride History
                </Button>
              </Link>
            )
          }

          <div className="mt-2 flex gap-2 flex-col">
            {user ? (
              <Button variant="outline" className="w-full" onClick={confirmLogout}>
                Logout ({user.name || 'User'})
              </Button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="gradient" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
