import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './services/axiosConfig';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import PostRide from './pages/PostRide/PostRide';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import AuthLayout from './layouts/AuthLayout/AuthLayout';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/auth" element={<AuthLayout />}>
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                </Route>

                <Route path="/login" element={<AuthLayout />}>
                    <Route index element={<Login />} />
                </Route>

                <Route path="/register" element={<AuthLayout />}>
                    <Route index element={<Register />} />
                </Route>

                <Route path="/app" element={<Dashboard />} />
                <Route path="/post-ride" element={<PostRide />} />
                <Route path="/admin" element={<AdminDashboard />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
