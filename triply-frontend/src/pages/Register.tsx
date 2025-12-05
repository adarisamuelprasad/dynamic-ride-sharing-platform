import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Car, Mail, Lock, User, Phone, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "PASSENGER",
    vehicleModel: "",
    licensePlate: "",
    capacity: "4",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate registration - in real app, this would call your auth service
    setTimeout(() => {
      setLoading(false);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
            <Car className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold text-foreground">Triply</span>
        </Link>

        <Card glass className="animate-fade-in">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="font-display text-2xl">Create Account</CardTitle>
            <CardDescription>
              Join the ride-sharing community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="pl-10"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="pl-10"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      required
                    />
                  </div>
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
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">I want to</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => update("role", "PASSENGER")}
                    className={`rounded-lg border p-4 text-left transition-all ${
                      form.role === "PASSENGER"
                        ? "border-primary bg-primary/10"
                        : "border-border bg-muted/30 hover:border-muted-foreground/30"
                    }`}
                  >
                    <p className="font-semibold text-foreground">Find Rides</p>
                    <p className="text-xs text-muted-foreground">As a passenger</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => update("role", "DRIVER")}
                    className={`rounded-lg border p-4 text-left transition-all ${
                      form.role === "DRIVER"
                        ? "border-primary bg-primary/10"
                        : "border-border bg-muted/30 hover:border-muted-foreground/30"
                    }`}
                  >
                    <p className="font-semibold text-foreground">Offer Rides</p>
                    <p className="text-xs text-muted-foreground">As a driver</p>
                  </button>
                </div>
              </div>

              {form.role === "DRIVER" && (
                <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4 animate-fade-in">
                  <p className="text-sm font-medium text-muted-foreground">Vehicle Details</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleModel" className="text-foreground">Vehicle Model</Label>
                      <Input
                        id="vehicleModel"
                        placeholder="Honda City"
                        value={form.vehicleModel}
                        onChange={(e) => update("vehicleModel", e.target.value)}
                        required={form.role === "DRIVER"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="licensePlate" className="text-foreground">License Plate</Label>
                      <Input
                        id="licensePlate"
                        placeholder="MH 01 AB 1234"
                        value={form.licensePlate}
                        onChange={(e) => update("licensePlate", e.target.value)}
                        required={form.role === "DRIVER"}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity" className="text-foreground">Seating Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      max="7"
                      value={form.capacity}
                      onChange={(e) => update("capacity", e.target.value)}
                      required={form.role === "DRIVER"}
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  "Creating account..."
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
