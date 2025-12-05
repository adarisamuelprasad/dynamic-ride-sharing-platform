import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { onboardingService } from '../../services/onboardingService';
import './Register.css';

const Register = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('PASSENGER');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [vehicleModel, setVehicleModel] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [capacity, setCapacity] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [info, setInfo] = useState(null);

    const handleGeneratePassword = () => {
        const pwd = onboardingService.generatePassword();
        setPassword(pwd);
        setConfirmPassword(pwd);
        setInfo('Strong password generated. You can still change it if you like.');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setInfo(null);

        if (!name || !email || !phone) {
            setError('Name, email and phone are required.');
            return;
        }

        if (!password || password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (role === 'DRIVER' && (!vehicleModel || !licensePlate || !capacity)) {
            setError('Please provide vehicle details and capacity for driver accounts.');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                email,
                password,
                name,
                phone,
                role,
                ...(role === 'DRIVER' && {
                    vehicleModel,
                    licensePlate,
                    capacity: parseInt(capacity)
                })
            };

            await authService.register(payload);
            setLoading(false);
            onboardingService.sendWelcomeEmail(email, name);
            navigate('/app');
        } catch (err) {
            setLoading(false);
            if (err?.response?.status === 400) {
                setError('Email already exists. Please use a different email.');
            } else {
                setError('Could not create account. Please try again.');
            }
        }
    };

    return (
        <div className="card">
            <h2>Create your Triply account</h2>
            <p className="subtitle">Onboard as a driver or passenger in a couple of steps.</p>

            <form onSubmit={handleSubmit}>
                <div className="role-toggle">
                    <button
                        type="button"
                        className={role === 'PASSENGER' ? 'active' : ''}
                        onClick={() => setRole('PASSENGER')}
                    >
                        Passenger
                    </button>
                    <button
                        type="button"
                        className={role === 'DRIVER' ? 'active' : ''}
                        onClick={() => setRole('DRIVER')}
                    >
                        Driver
                    </button>
                </div>

                <div className="field">
                    <label htmlFor="name">Full name</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="field">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="field">
                    <label htmlFor="phone">Phone</label>
                    <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>

                <div className="field password-row">
                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button className="ghost" type="button" onClick={handleGeneratePassword}>
                        Generate strong password
                    </button>
                </div>

                <div className="field">
                    <label htmlFor="confirm">Confirm password</label>
                    <input
                        id="confirm"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>

                {role === 'DRIVER' && (
                    <div className="driver-grid">
                        <div className="field">
                            <label htmlFor="vehicleModel">Vehicle model</label>
                            <input
                                id="vehicleModel"
                                type="text"
                                value={vehicleModel}
                                onChange={(e) => setVehicleModel(e.target.value)}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="licensePlate">License plate</label>
                            <input
                                id="licensePlate"
                                type="text"
                                value={licensePlate}
                                onChange={(e) => setLicensePlate(e.target.value)}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="capacity">Seats available</label>
                            <input
                                id="capacity"
                                type="number"
                                min="1"
                                value={capacity || ''}
                                onChange={(e) => setCapacity(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? 'Creating…' : 'Create account'}
                </button>

                {error && <p className="error">{error}</p>}
                {info && <p className="info">{info}</p>}

                <p className="switch">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
                <p className="switch">
                    <Link to="/">Back to home</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;
