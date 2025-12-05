import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../services/axiosConfig';
import { authService } from '../../services/authService';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(authService.currentUser);
    const [users, setUsers] = useState([]);
    const [rides, setRides] = useState([]);
    const [error, setError] = useState(null);
    const [banner, setBanner] = useState(null);
    const [activeTab, setActiveTab] = useState('users');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [editModel, setEditModel] = useState({
        name: '',
        phone: '',
        role: '',
        blocked: false,
        driverVerified: false,
        vehicleModel: '',
        licensePlate: '',
        capacity: 1
    });

    useEffect(() => {
        const currentUser = authService.currentUser;
        if (!currentUser || currentUser.role !== 'ROLE_ADMIN') {
            navigate('/');
            return;
        }
        refreshAll();
    }, [navigate]);

    const refreshAll = () => {
        setError(null);
        axios.get('http://localhost:8080/api/admin/users')
            .then(response => setUsers(response.data))
            .catch(() => setError('Failed to load users'));

        axios.get('http://localhost:8080/api/admin/rides')
            .then(response => setRides(response.data))
            .catch(() => { });
    };

    const countTeam = () => users.filter(u => u.role === 'ROLE_ADMIN').length;
    const countDrivers = () => users.filter(u => u.role === 'ROLE_DRIVER').length;
    const countUsers = () => users.filter(u => u.role === 'ROLE_PASSENGER').length;
    const countRides = () => rides.length;
    const countRequests = () => users.filter(u => u.role === 'ROLE_DRIVER' && !u.driverVerified).length;

    const displayUsers = () => {
        switch (activeTab) {
            case 'team':
                return users.filter(u => u.role === 'ROLE_ADMIN');
            case 'drivers':
                return users.filter(u => u.role === 'ROLE_DRIVER');
            case 'users':
                return users.filter(u => u.role === 'ROLE_PASSENGER');
            case 'requests':
                return users.filter(u => u.role === 'ROLE_DRIVER' && !u.driverVerified);
            default:
                return users;
        }
    };

    const handleSetTab = (tab) => {
        setActiveTab(tab);
        setEditingUser(null);
        setSelectedUserId(null);
    };

    const blockUser = (u, blocked) => {
        axios.post(`http://localhost:8080/api/admin/users/${u.id}/block?blocked=${blocked}`, {})
            .then(() => refreshAll())
            .catch(() => setError('Failed to update user'));
    };

    const verifyDriver = (u) => {
        axios.post(`http://localhost:8080/api/admin/users/${u.id}/verify-driver`, {})
            .then(() => refreshAll())
            .catch(() => setError('Failed to verify driver'));
    };

    const startEditFromToolbar = () => {
        if (!selectedUserId) return;
        const u = users.find(x => x.id === selectedUserId);
        if (u) startEdit(u);
    };

    const deleteFromToolbar = () => {
        if (!selectedUserId) return;
        const u = users.find(x => x.id === selectedUserId);
        if (u) deleteUser(u);
    };

    const startEdit = (u) => {
        setEditingUser(u);
        setEditModel({
            name: u.name || '',
            phone: '',
            role: u.role,
            blocked: !!u.blocked,
            driverVerified: !!u.driverVerified,
            vehicleModel: u.vehicleModel || '',
            licensePlate: u.licensePlate || '',
            capacity: u.capacity || 1
        });
    };

    const cancelEdit = () => {
        setEditingUser(null);
    };

    const saveEdit = (e) => {
        e.preventDefault();
        if (!editingUser) return;

        axios.put(`http://localhost:8080/api/admin/users/${editingUser.id}`, editModel)
            .then(() => {
                setEditingUser(null);
                refreshAll();
            })
            .catch(() => setError('Failed to update user'));
    };

    const deleteUser = (u) => {
        if (!window.confirm(`Delete user ${u.email}? This cannot be undone.`)) {
            return;
        }

        axios.delete(`http://localhost:8080/api/admin/users/${u.id}`)
            .then(() => {
                refreshAll();
                setBanner('Deleted.');
                setTimeout(() => setBanner(null), 2500);
            })
            .catch(() => setError('Failed to delete user'));
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
                <div className="brand">
                    <img
                        className="brand-icon"
                        src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                        alt="Admin icon"
                    />
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p>Manage users, drivers, rides and platform activity.</p>
                    </div>
                </div>
                <Link to="/" className="link">Back to site</Link>
            </header>

            {banner && <p className="banner success">{banner}</p>}
            {error && <p className="error">{error}</p>}

            <nav className="tabs">
                <button
                    className={`tab ${activeTab === 'team' ? 'active' : ''}`}
                    onClick={() => handleSetTab('team')}
                >
                    Team ({countTeam()})
                </button>
                <button
                    className={`tab ${activeTab === 'drivers' ? 'active' : ''}`}
                    onClick={() => handleSetTab('drivers')}
                >
                    Drivers ({countDrivers()})
                </button>
                <button
                    className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => handleSetTab('users')}
                >
                    Users ({countUsers()})
                </button>
                <button
                    className={`tab ${activeTab === 'rides' ? 'active' : ''}`}
                    onClick={() => handleSetTab('rides')}
                >
                    Rides ({countRides()})
                </button>
                <button
                    className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
                    onClick={() => handleSetTab('requests')}
                >
                    Requests ({countRequests()}) {countRequests() > 0 && <span className="dot"></span>}
                </button>
            </nav>

            {activeTab !== 'rides' && (
                <section className="card">
                    <header className="section-header">
                        <div className="section-title">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/1251/1251840.png"
                                alt="Users"
                            />
                            <div>
                                <h2>
                                    {activeTab === 'team' ? 'Team' :
                                        activeTab === 'drivers' ? 'Drivers' :
                                            activeTab === 'requests' ? 'Requests' : 'Users'}
                                </h2>
                                <p>Select a user at the top to edit or delete.</p>
                            </div>
                        </div>
                        {users.length > 0 && (
                            <div className="edit-toolbar">
                                <select
                                    value={selectedUserId || ''}
                                    onChange={(e) => setSelectedUserId(parseInt(e.target.value) || null)}
                                >
                                    <option value="">Select user…</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.email} ({u.role})
                                        </option>
                                    ))}
                                </select>
                                <button type="button" onClick={startEditFromToolbar}>Edit</button>
                                <button type="button" className="danger" onClick={deleteFromToolbar}>Delete</button>
                            </div>
                        )}
                    </header>

                    <div className="table">
                        <div className="row head">
                            <div>Email</div>
                            <div>Role</div>
                            <div>Name</div>
                            <div>Status</div>
                            <div>Actions</div>
                        </div>
                        {displayUsers().map(u => (
                            <div key={u.id} className="row">
                                <div>{u.email}</div>
                                <div>{u.role}</div>
                                <div>{u.name}</div>
                                <div>
                                    {u.blocked ? (
                                        <span className="pill pill-red">Blocked</span>
                                    ) : (
                                        <span className="pill pill-green">Active</span>
                                    )}
                                    {u.role === 'ROLE_DRIVER' && (
                                        <span className={`pill ${u.driverVerified ? 'pill-green' : 'pill-yellow'}`}>
                                            Driver {u.driverVerified ? 'Verified' : 'Unverified'}
                                        </span>
                                    )}
                                </div>
                                <div className="actions">
                                    <button onClick={() => blockUser(u, !u.blocked)}>
                                        {u.blocked ? 'Unblock' : 'Block'}
                                    </button>
                                    {u.role === 'ROLE_DRIVER' && !u.driverVerified && (
                                        <button onClick={() => verifyDriver(u)}>Verify</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {editingUser && (
                        <div className="edit-panel">
                            <h3>Edit user: {editingUser.email}</h3>
                            <form onSubmit={saveEdit}>
                                <div className="edit-grid">
                                    <label>
                                        Name
                                        <input
                                            type="text"
                                            value={editModel.name}
                                            onChange={(e) => setEditModel({ ...editModel, name: e.target.value })}
                                        />
                                    </label>
                                    <label>
                                        Phone
                                        <input
                                            type="text"
                                            value={editModel.phone}
                                            onChange={(e) => setEditModel({ ...editModel, phone: e.target.value })}
                                        />
                                    </label>
                                    <label>
                                        Role
                                        <select
                                            value={editModel.role}
                                            onChange={(e) => setEditModel({ ...editModel, role: e.target.value })}
                                        >
                                            <option value="ROLE_ADMIN">Admin</option>
                                            <option value="ROLE_DRIVER">Driver</option>
                                            <option value="ROLE_PASSENGER">Passenger</option>
                                        </select>
                                    </label>
                                    <label>
                                        Blocked
                                        <input
                                            type="checkbox"
                                            checked={editModel.blocked}
                                            onChange={(e) => setEditModel({ ...editModel, blocked: e.target.checked })}
                                        />
                                    </label>
                                    <label>
                                        Driver verified
                                        <input
                                            type="checkbox"
                                            checked={editModel.driverVerified}
                                            onChange={(e) => setEditModel({ ...editModel, driverVerified: e.target.checked })}
                                        />
                                    </label>
                                    <label>
                                        Vehicle model
                                        <input
                                            type="text"
                                            value={editModel.vehicleModel}
                                            onChange={(e) => setEditModel({ ...editModel, vehicleModel: e.target.value })}
                                        />
                                    </label>
                                    <label>
                                        License plate
                                        <input
                                            type="text"
                                            value={editModel.licensePlate}
                                            onChange={(e) => setEditModel({ ...editModel, licensePlate: e.target.value })}
                                        />
                                    </label>
                                    <label>
                                        Capacity
                                        <input
                                            type="number"
                                            min="1"
                                            value={editModel.capacity}
                                            onChange={(e) => setEditModel({ ...editModel, capacity: parseInt(e.target.value) })}
                                        />
                                    </label>
                                </div>
                                <div className="edit-actions">
                                    <button type="submit">Save changes</button>
                                    <button type="button" className="ghost" onClick={cancelEdit}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}
                </section>
            )}

            {activeTab === 'rides' && (
                <section className="card">
                    <header className="section-header">
                        <div className="section-title">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
                                alt="Rides"
                            />
                            <div>
                                <h2>Rides</h2>
                                <p>Overview of active rides in the system.</p>
                            </div>
                        </div>
                    </header>
                    <div className="table">
                        <div className="row head">
                            <div>Route</div>
                            <div>Date</div>
                            <div>Seats</div>
                            <div>Fare</div>
                        </div>
                        {rides.map(r => (
                            <div key={r.id} className="row">
                                <div>{r.source} → {r.destination}</div>
                                <div>{formatDate(r.departureTime)}</div>
                                <div>{r.availableSeats}</div>
                                <div>₹{r.farePerSeat}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default AdminDashboard;
