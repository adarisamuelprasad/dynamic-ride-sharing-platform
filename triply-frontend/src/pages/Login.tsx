import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Car, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await authService.login(email, password);
      setLoading(false);
      toast.success(`Welcome back, ${user.name}!`);

      // Handle redirect after login
      const redirectPath = searchParams.get('redirect');
      const rideId = searchParams.get('rideId');

      if (redirectPath === '/post-ride') {
        navigate('/post-ride');
      } else if (redirectPath === '/book' && rideId) {
        // Redirect back to dashboard with booking intent
        navigate(`/dashboard?bookRide=${rideId}`);
      } else if (user.role === 'ROLE_ADMIN') {
        // Admin goes to admin panel
        navigate('/admin');
      } else {
        // Regular users go to dashboard
        navigate('/dashboard');
      }
    } catch (error: any) {
      setLoading(false);
      console.error('Login error:', error);
      const errorMessage = error.response?.data || 'Invalid credentials. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
            <Car className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold text-foreground">Triply</span>
        </Link>

        <Card glass className="animate-fade-in">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="font-display text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to continue your journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="font-medium text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card glass className="mt-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <CardContent className="p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Demo Accounts</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Admin: admin@example.com / Admin123!</p>
              <p>Passenger: vibha@example.com / Password123!</p>
              <p>Driver: ranvitha@example.com / Password123!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
