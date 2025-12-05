import React from 'react';
import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = () => {
    return (
        <div className="auth-shell">
            <div className="brand-panel">
                <div className="logo">T</div>
                <h1>Join the ride sharing revolution</h1>
                <p>Connect with drivers and passengers in your area. Safe, affordable, and eco-friendly.</p>
            </div>
            <div className="form-panel">
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
