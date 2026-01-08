import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/services/adminService";
import { Ride } from "@/services/rideService";
import { Booking } from "@/services/bookingService";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  AreaChart,
  Area
} from 'recharts';

interface AnalyticsTabProps {
  users: User[];
  rides: Ride[];
  bookings: Booking[];
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ users, rides, bookings }) => {
  
  // Process User Data
  const userRoles = users.reduce((acc, user) => {
    const role = user.role === 'ROLE_ADMIN' ? 'Admin' : 
                 user.role === 'ROLE_DRIVER' ? 'Driver' : 'Passenger';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const userRoleData = Object.keys(userRoles).map(role => ({
    name: role,
    value: userRoles[role]
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Process Booking Data
  const bookingStatus = bookings.reduce((acc, booking) => {
    const status = booking.status || 'UNKNOWN';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const bookingStatusData = Object.keys(bookingStatus).map(status => ({
    name: status,
    value: bookingStatus[status]
  }));

  const STATUS_COLORS: Record<string, string> = {
    'CONFIRMED': '#00C49F',
    'PENDING': '#FFBB28',
    'CANCELLED': '#FF8042',
    'UNKNOWN': '#8884d8'
  };

  // Process Ride Data (Rides per Day)
  // Assuming departureTime is an ISO string
  const ridesPerDay = rides.reduce((acc, ride) => {
    try {
      const date = new Date(ride.departureTime).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
    } catch (e) {
      // ignore invalid dates
    }
    return acc;
  }, {} as Record<string, number>);

  const ridesData = Object.keys(ridesPerDay).map(date => ({
    date,
    rides: ridesPerDay[date]
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Revenue Estimate (Confirmed Bookings * Seats * Fare)
  // We need to match booking to ride to get fare
  const revenue = bookings.reduce((total, booking) => {
    if (booking.status === 'CONFIRMED' && booking.ride) {
       // Note: Booking type in AdminDashboard might just have ride object nested
       // We'll assume booking.ride has farePerSeat
       return total + (booking.seatsBooked * (booking.ride.farePerSeat || 0));
    }
    return total;
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card glass>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Estimated from confirmed bookings
            </p>
          </CardContent>
        </Card>
         <Card glass>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Seats per Ride</CardTitle>
             <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
               {rides.length > 0 
                 ? (rides.reduce((acc, r) => acc + (r.availableSeats || 0), 0) / rides.length).toFixed(1) 
                 : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Available seats average
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* User Distribution Chart */}
        <Card glass className="col-span-3">
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userRoleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {userRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ride Activity Chart */}
        <Card glass className="col-span-4">
          <CardHeader>
            <CardTitle>Ride Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={ridesData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="rides" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
         {/* Booking Status Chart */}
         <Card glass>
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingStatusData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" fill="#82ca9d">
                    {bookingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#8884d8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Routes (Simple List for now) */}
         <Card glass>
          <CardHeader>
            <CardTitle>Popular Destinations</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {Object.entries(rides.reduce((acc, ride) => {
                 acc[ride.destination] = (acc[ride.destination] || 0) + 1;
                 return acc;
               }, {} as Record<string, number>))
               .sort((a, b) => b[1] - a[1])
               .slice(0, 5)
               .map(([dest, count], i) => (
                 <div key={dest} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{i + 1}. {dest}</p>
                      <p className="text-sm text-muted-foreground">
                        {count} rides offered
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {((count / rides.length) * 100).toFixed(1)}%
                    </div>
                  </div>
               ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsTab;
