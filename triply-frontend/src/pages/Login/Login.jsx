import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Email and password are required.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const user = await authService.login(email, password);
            setLoading(false);

            if (user && user.role === 'ROLE_ADMIN') {
                navigate('/admin');
            } else {
                navigate('/app');
            }
        } catch (err) {
            setLoading(false);
            console.error('Login error:', err);
            if (err.response) {
                // Server responded with a status code outside the 2xx range
                if (err.response.status === 401) {
                    setError('Invalid credentials. Please check your email and password.');
                } else {
                    setError(`Login failed: ${err.response.data || err.response.statusText}`);
                }
            } else if (err.request) {
                // The request was made but no response was received
                setError('Network error. Is the backend server running?');
            } else {
                // Something happened in setting up the request
                setError('An error occurred. Please try again.');
            }
        }
    };

    return (
        <div className="card">
            <h2>Welcome back</h2>
            <p className="subtitle">Sign in to manage your rides and bookings.</p>

            <form onSubmit={handleSubmit}>
                <div className="field">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="field">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Signing in…' : 'Sign in'}
                </button>

                {error && <p className="error">{error}</p>}

                <p className="switch">
                    New here? <Link to="/register">Create an account</Link>
                </p>
                <p className="switch">
                    <Link to="/">Back to home</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;
