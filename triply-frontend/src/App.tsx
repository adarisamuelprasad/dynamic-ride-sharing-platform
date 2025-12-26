import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import PostRide from "./pages/PostRide";
import AdminDashboard from "./pages/AdminDashboard";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentHistory from "./pages/PaymentHistory";
import NotFound from "./pages/NotFound";
import RideHistory from "./pages/RideHistory";
import "./services/axiosConfig"; // Import axios configuration
import { useWebSockets } from "./hooks/useWebSockets";

const queryClient = new QueryClient();

const NotificationWrapper = ({ children }: { children: React.ReactNode }) => {
  useWebSockets();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-right" />
      {/* Temporarily disabled WebSocket notifications for debugging */}
      {/* <NotificationWrapper> */}
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <div className="min-h-screen">
          <Navbar />
          <main className="pt-24">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/post-ride" element={<PostRide />} />
              <Route path="/ride-history" element={<RideHistory />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/payments" element={<Payment />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/history" element={<PaymentHistory />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
      {/* </NotificationWrapper> */}
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
