import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Index from "./pages/Index.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import PostRide from "./pages/PostRide.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import NotFound from "./pages/NotFound.jsx";
import RideHistory from "./pages/RideHistory.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import DriverRequests from "./pages/DriverRequests.jsx";
import Payment from "./pages/Payment.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import PaymentHistory from "./pages/PaymentHistory.jsx";

import "./services/axiosConfig.js"; // Import axios configuration

import NotificationClient from "./components/NotificationClient";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-right" />
      <NotificationClient />

      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <div className="min-h-screen bg-background">
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/post-ride" element={<PostRide />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/ride-history" element={<RideHistory />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/driver-requests" element={<DriverRequests />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-history" element={<PaymentHistory />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
