import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { authService } from "../services/authService";

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(authService.currentUser);

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = authService.subscribe((u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/'; // Hard redirect to clear any state if needed, or use navigate('/')
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="glass-card sticky top-4 z-50 mx-auto max-w-6xl px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary transition-transform group-hover:scale-105">
            <Car className="h-5 w-5 text-primary-foreground" />
          </div>
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
          <Link to="/post-ride">
            <Button
              variant={isActive("/post-ride") ? "glass" : "ghost"}
              size="sm"
            >
              Offer Ride
            </Button>
          </Link>
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

        {/* Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm font-medium text-muted-foreground mr-2">
                Hello, {user.name}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
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

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
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
          <Link to="/post-ride" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              Offer Ride
            </Button>
          </Link>
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
