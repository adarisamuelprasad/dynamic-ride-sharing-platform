import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, Menu, X, Sun, Moon, User as UserIcon } from "lucide-react";
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
import { useState, useEffect } from "react";
import { authService } from "../services/authService";

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(authService.currentUser);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passData, setPassData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassData({ ...passData, [e.target.name]: e.target.value });
  };

  const submitPasswordChange = async () => {
    if (!passData.oldPassword || !passData.newPassword || !passData.confirmPassword) {
      alert("All fields are required");
      return;
    }
    if (passData.newPassword !== passData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      await authService.updatePassword({
        oldPassword: passData.oldPassword,
        newPassword: passData.newPassword
      });
      alert("Password updated successfully!");
      setIsPasswordModalOpen(false);
      setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      console.error(error);
      alert(typeof error.response?.data === 'string' ? error.response.data : "Failed to update password");
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
    window.location.href = '/'; // Hard redirect to clear any state if needed, or use navigate('/')
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-[hsla(0,0%,100%,0.8)] dark:bg-[hsla(222,47%,11%,0.7)] backdrop-blur-xl border border-[hsla(222,47%,11%,0.1)] dark:border-[hsla(0,0%,100%,0.06)] rounded-xl sticky top-4 z-50 mx-auto max-w-6xl px-6 py-4 transition-colors duration-300">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/triplylogo-black.png" alt="Triply Logo" className="h-10 w-10 object-contain block dark:hidden" />
          <img src="/triplylogo-white.png" alt="Triply Logo" className="h-10 w-10 object-contain hidden dark:block" />
          <span className="font-display text-xl font-bold text-foreground">
            Triply
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-2 md:flex">
          <Link to="/">
            <Button
              variant={isActive("/") ? "glass" : "ghost"}
              size="sm"
            >
              Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button
              variant={isActive("/dashboard") ? "glass" : "ghost"}
              size="sm"
            >
              Find Rides
            </Button>
          </Link>
          {(!user || user.role === 'ROLE_DRIVER' || user.role === 'DRIVER' || user.role === 'ROLE_ADMIN') && (
            <Link to="/post-ride">
              <Button
                variant={isActive("/post-ride") ? "glass" : "ghost"}
                size="sm"
              >
                Offer Ride
              </Button>
            </Link>
          )}
          {user?.role === 'ROLE_ADMIN' && (
            <Link to="/admin">
              <Button
                variant={isActive("/admin") ? "glass" : "ghost"}
                size="sm"
              >
                Admin Dashboard
              </Button>
            </Link>
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

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={`https://api.dicebear.com/9.x/initials/svg?seed=${user.name}`} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsPasswordModalOpen(true)}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Edit Profile (Password)</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
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
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 md:hidden">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              Home
            </Button>
          </Link>
          <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              Find Rides
            </Button>
          </Link>
          {(!user || user.role === 'ROLE_DRIVER' || user.role === 'DRIVER' || user.role === 'ROLE_ADMIN') && (
            <Link to="/post-ride" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                Offer Ride
              </Button>
            </Link>
          )}
          {user?.role === 'ROLE_ADMIN' && (
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                Admin Dashboard
              </Button>
            </Link>
          )}

          <div className="mt-2 flex gap-2 flex-col">
            {user ? (
              <Button variant="outline" className="w-full" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                Logout ({user.name})
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
