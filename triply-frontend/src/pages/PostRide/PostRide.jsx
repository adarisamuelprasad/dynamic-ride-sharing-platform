import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../services/axiosConfig';
import { authService } from '../../services/authService';
import './PostRide.css';

const PostRide = () => {
    const navigate = useNavigate();
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [availableSeats, setAvailableSeats] = useState(null);
    const [farePerSeat, setFarePerSeat] = useState(null);
    const [sourceLat, setSourceLat] = useState(null);
    const [sourceLng, setSourceLng] = useState(null);
    const [destLat, setDestLat] = useState(null);
    const [destLng, setDestLng] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [info, setInfo] = useState(null);

    useEffect(() => {
        const user = authService.currentUser;
        if (!user || user.role !== 'ROLE_DRIVER') {
            navigate('/app');
        }
    }, [navigate]);

    const handleSubmit = () => {
        setError(null);
        setInfo(null);

        if (!source || !destination || !date || !time) {
            setError('Please provide source, destination, date and time.');
            return;
        }

        if (!availableSeats || availableSeats <= 0) {
            setError('Please provide a valid available seats count.');
            return;
        }

        const payload = {
            source,
            destination,
            departureTime: `${date}T${time}:00`,
            availableSeats: parseInt(availableSeats),
            farePerSeat: farePerSeat ? parseFloat(farePerSeat) : 0,
            sourceLat: sourceLat || undefined,
            sourceLng: sourceLng || undefined,
            destLat: destLat || undefined,
            destLng: destLng || undefined
        };

        setLoading(true);
        axios.post('http://localhost:8080/api/rides/post', payload)
            .then(() => {
                setLoading(false);
                setInfo('Ride posted successfully.');
                setTimeout(() => navigate('/app'), 1500);
            })
            .catch(err => {
                setLoading(false);
                if (err?.response?.status === 401) {
                    setError('Unauthorized. Please login as a driver.');
                } else {
                    setError('Could not post ride. Please try again.');
                }
            });
    };

    return (
        <div className="shell">
            <header className="topbar">
                <h1>Post a Ride</h1>
                <Link to="/app" className="link">Back to Dashboard</Link>
            </header>

            <section className="card">
                <div className="grid">
                    <div className="field">
                        <label>From</label>
                        <input
                            type="text"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            placeholder="e.g., Mumbai"
                        />
                    </div>
                    <div className="field">
                        <label>To</label>
                        <input
                            type="text"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            placeholder="e.g., Pune"
                        />
                    </div>
                    <div className="field">
                        <label>Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div className="field">
                        <label>Time</label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </div>
                    <div className="field">
                        <label>Available Seats</label>
                        <input
                            type="number"
                            value={availableSeats || ''}
                            onChange={(e) => setAvailableSeats(e.target.value)}
                            min="1"
                        />
                    </div>
                    <div className="field">
                        <label>Fare per seat (optional)</label>
                        <input
                            type="number"
                            value={farePerSeat || ''}
                            onChange={(e) => setFarePerSeat(e.target.value)}
                            min="1"
                        />
                    </div>
                </div>

                <details className="coords">
                    <summary>Optional: Add coordinates for dynamic fare</summary>
                    <div className="grid">
                        <div className="field">
                            <label>From Lat</label>
                            <input
                                type="number"
                                value={sourceLat || ''}
                                onChange={(e) => setSourceLat(e.target.value)}
                                step="0.000001"
                            />
                        </div>
                        <div className="field">
                            <label>From Lng</label>
                            <input
                                type="number"
                                value={sourceLng || ''}
                                onChange={(e) => setSourceLng(e.target.value)}
                                step="0.000001"
                            />
                        </div>
                        <div className="field">
                            <label>To Lat</label>
                            <input
                                type="number"
                                value={destLat || ''}
                                onChange={(e) => setDestLat(e.target.value)}
                                step="0.000001"
                            />
                        </div>
                        <div className="field">
                            <label>To Lng</label>
                            <input
                                type="number"
                                value={destLng || ''}
                                onChange={(e) => setDestLng(e.target.value)}
                                step="0.000001"
                            />
                        </div>
                    </div>
                    <p className="hint">
                        If fare is empty and coordinates are provided, the system will estimate fare based on distance.
                    </p>
                </details>

                <button className="submit" onClick={handleSubmit}>
                    {loading ? 'Posting…' : 'Post Ride'}
                </button>

                {error && <p className="msg error">{error}</p>}
                {info && <p className="msg info">{info}</p>}
            </section>
        </div>
    );
};

export default PostRide;
