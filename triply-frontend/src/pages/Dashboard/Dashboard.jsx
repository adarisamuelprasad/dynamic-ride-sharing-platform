import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../services/axiosConfig';
import { authService } from '../../services/authService';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(authService.currentUser);
    const [searchSource, setSearchSource] = useState('');
    const [searchDestination, setSearchDestination] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [minFare, setMinFare] = useState(null);
    const [maxFare, setMaxFare] = useState(null);
    const [vehicleModel, setVehicleModel] = useState('');
    const [rides, setRides] = useState([]);
    const [loadingRides, setLoadingRides] = useState(false);
    const [seatsToBook, setSeatsToBook] = useState({});

    useEffect(() => {
        if (!authService.isLoggedIn()) {
            navigate('/login');
            return;
        }

        // Load initial available rides
        setLoadingRides(true);
        axios.get('http://localhost:8080/api/rides')
            .then(response => {
                setLoadingRides(false);
                setRides(response.data);
            })
            .catch(() => {
                setLoadingRides(false);
            });
    }, [navigate]);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleSearch = () => {
        if (!searchSource || !searchDestination) {
            return;
        }

        setLoadingRides(true);
        const params = new URLSearchParams({
            source: searchSource,
            destination: searchDestination
        });

        if (searchDate) params.set('date', searchDate);
        if (minFare != null) params.set('minFare', String(minFare));
        if (maxFare != null) params.set('maxFare', String(maxFare));
        if (vehicleModel) params.set('vehicleModel', vehicleModel);

        axios.get(`http://localhost:8080/api/rides/search?${params.toString()}`)
            .then(response => {
                setLoadingRides(false);
                setRides(response.data);
            })
            .catch(() => {
                setLoadingRides(false);
            });
    };

    const handleBook = (rideId) => {
        const seats = seatsToBook[rideId] || 1;
        if (seats <= 0) return;

        axios.post('http://localhost:8080/api/bookings/book', {
            rideId,
            seatsBooked: seats
        })
            .then(() => {
                handleSearch();
            })
            .catch(err => {
                console.error('Booking failed:', err);
            });
    };

    const handleSeatsChange = (rideId, value) => {
        setSeatsToBook(prev => ({
            ...prev,
            [rideId]: parseInt(value) || 1
        }));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    if (!user) return null;

    return (
        <div className="shell">
            <header className="topbar">
                <div className="title">
                    <span className="badge">{user.role}</span>
                    <h1>Hi {user.name || user.email}, welcome to Triply</h1>
                    <p>Search available rides or manage your journeys.</p>
                </div>
                <button className="logout" onClick={handleLogout}>Log out</button>
            </header>

            <section className="search-card">
                <div className="field">
                    <label htmlFor="from">From</label>
                    <input
                        id="from"
                        type="text"
                        value={searchSource}
                        onChange={(e) => setSearchSource(e.target.value)}
                    />
                </div>

                <div className="field">
                    <label htmlFor="to">To</label>
                    <input
                        id="to"
                        type="text"
                        value={searchDestination}
                        onChange={(e) => setSearchDestination(e.target.value)}
                    />
                </div>

                <div className="field">
                    <label htmlFor="date">Date</label>
                    <input
                        id="date"
                        type="date"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                    />
                </div>

                <div className="field">
                    <label>Min Fare</label>
                    <input
                        type="number"
                        value={minFare || ''}
                        onChange={(e) => setMinFare(e.target.value)}
                    />
                </div>

                <div className="field">
                    <label>Max Fare</label>
                    <input
                        type="number"
                        value={maxFare || ''}
                        onChange={(e) => setMaxFare(e.target.value)}
                    />
                </div>

                <div className="field">
                    <label>Vehicle Model</label>
                    <input
                        type="text"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                    />
                </div>

                <button onClick={handleSearch}>
                    {loadingRides ? 'Searching…' : 'Search rides'}
                </button>
            </section>

            {rides.length > 0 && (
                <section className="rides">
                    <h2>Matching rides</h2>
                    <div className="grid">
                        {rides.map(ride => (
                            <article key={ride.id} className="ride">
                                <div className="route">
                                    <h3>{ride.source} → {ride.destination}</h3>
                                    <p>{formatDate(ride.departureTime)}</p>
                                </div>
                                <div className="meta">
                                    <span>{ride.availableSeats} seats</span>
                                    <span>₹{Math.round(ride.farePerSeat)} / seat</span>
                                </div>
                                {ride.availableSeats > 0 && (
                                    <div className="booking">
                                        <input
                                            type="number"
                                            min="1"
                                            max={ride.availableSeats}
                                            value={seatsToBook[ride.id] || ''}
                                            onChange={(e) => handleSeatsChange(ride.id, e.target.value)}
                                            placeholder="Seats"
                                        />
                                        <button className="book" onClick={() => handleBook(ride.id)}>
                                            Book
                                        </button>
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {user.role === 'ROLE_DRIVER' && (
                <section style={{ marginTop: '1.5rem' }}>
                    <Link to="/post-ride" className="cta">Post a new ride</Link>
                </section>
            )}
        </div>
    );
};

export default Dashboard;
