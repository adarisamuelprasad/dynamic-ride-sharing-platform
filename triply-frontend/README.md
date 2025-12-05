# Triply Frontend (React)

This is the React.js frontend for the Triply ride-sharing application, converted from Angular.

## Features

- **User Authentication**: Login and registration with JWT token management
- **Role-based Access**: Support for Passengers, Drivers, and Admins
- **Ride Search & Booking**: Search for available rides with filters
- **Driver Features**: Post new rides with optional coordinates
- **Admin Dashboard**: Comprehensive user and ride management

## Tech Stack

- React 18
- React Router DOM for routing
- Axios for HTTP requests
- Vite for build tooling
- CSS for styling

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:4200`

### Build

Build for production:

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── layouts/
│   └── AuthLayout/          # Layout for login/register pages
├── pages/
│   ├── Home/                # Landing page
│   ├── Login/               # Login page
│   ├── Register/            # Registration page
│   ├── Dashboard/           # User dashboard with ride search
│   ├── PostRide/            # Driver ride posting page
│   └── AdminDashboard/      # Admin management panel
├── services/
│   ├── authService.js       # Authentication service
│   ├── axiosConfig.js       # Axios interceptor for JWT
│   └── onboardingService.js # User onboarding utilities
├── App.jsx                  # Main app component with routing
├── main.jsx                 # Application entry point
└── index.css                # Global styles
```

## API Integration

The frontend connects to the Spring Boot backend at `http://localhost:8080/api`

### Endpoints Used

- `/api/auth/login` - User login
- `/api/auth/register` - User registration
- `/api/rides` - Get all rides
- `/api/rides/search` - Search rides with filters
- `/api/rides/post` - Post a new ride (drivers only)
- `/api/bookings/book` - Book a ride
- `/api/admin/*` - Admin endpoints

## User Roles

1. **ROLE_PASSENGER**: Can search and book rides
2. **ROLE_DRIVER**: Can search, book, and post rides
3. **ROLE_ADMIN**: Full access to user and ride management

## Conversion from Angular

This React application is a complete conversion of the Angular frontend with:
- All components converted to React functional components with hooks
- Angular services converted to JavaScript modules
- Angular routing converted to React Router
- SCSS styles converted to CSS
- Two-way binding replaced with useState hooks
- RxJS observables replaced with async/await and axios

## License

ISC
