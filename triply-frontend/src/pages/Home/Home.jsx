import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    return (
        <div className="home-container">
            <div className="hero">
                <h1>🚗 Triply</h1>
                <p className="tagline">Smart ride sharing made simple</p>
            </div>

            <div className="actions">
                <Link to="/login" className="btn btn-primary">Sign In</Link>
                <Link to="/register" className="btn btn-secondary">Create Account</Link>
            </div>
        </div>
    );
};

export default Home;
