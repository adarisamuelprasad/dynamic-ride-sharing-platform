import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { processPayment } from '../services/paymentService';
import { bookingService } from '../services/bookingService';
import Navbar from '../components/Navbar';

// Reuse existing styles or define inline for the specific "Stripe" look
const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const rideDetails = location.state?.ride;
    const bookingDetails = location.state?.booking; // If we passed a booking object

    // Fallback if accessed directly
    const [loading, setLoading] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [cardHolder, setCardHolder] = useState('');

    // Calculate total if not passed explicitly (assuming ride fare)
    const totalAmount = rideDetails ? (rideDetails.farePerSeat * (bookingDetails?.seats || 1)) : 0;

    const handleFormatCardNumber = (e: any) => {
        let val = e.target.value.replace(/\D/g, '');
        val = val.substring(0, 16);
        val = val.match(/.{1,4}/g)?.join(' ') || val;
        setCardNumber(val);
    };

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Get or Create Booking ID
            let bookingId = location.state?.bookingId;

            if (!bookingId) {
                console.log("Creating new booking session...");
                const bookingRes = await bookingService.bookRide(
                    rideDetails.id,
                    bookingDetails?.seats || 1,
                    'STRIPE_CARD'
                );

                if ('id' in bookingRes) {
                    bookingId = bookingRes.id;
                } else if ('booking' in bookingRes) {
                    bookingId = bookingRes.booking.id;
                }
            }

            if (!bookingId) throw new Error("Could not generate Booking ID");

            // 2. Process Payment
            await processPayment(bookingId, totalAmount, 'STRIPE_CARD');

            // 3. Success
            navigate('/payment-success', {
                state: {
                    amount: totalAmount,
                    transactionId: 'txn_' + Math.random().toString(36).substr(2, 9),
                    ride: rideDetails,
                    bookingId: bookingId,
                    bookingDetails: bookingDetails
                }
            });

        } catch (err: any) {
            console.error("Payment Flow Error:", err);
            const errorMessage = err.response?.data || err.message || "Payment Processing Failed";
            alert(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    if (!rideDetails) return <div className="p-8">Invalid or expired session.</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex flex-col items-center justify-center p-6">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">

                    {/* Summary Section */}
                    <div className="bg-gray-100 p-8 md:w-1/2 md:border-r border-gray-200">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">Order Summary</h2>
                        <div className="flex items-center space-x-4 mb-6">
                            {rideDetails.vehicleImage && <img src={rideDetails.vehicleImage} className="w-20 h-20 rounded-lg object-cover" alt="Car" />}
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">{rideDetails.source} → {rideDetails.destination}</h3>
                                <p className="text-sm text-gray-500">{new Date(rideDetails.departureTime).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="border-t border-gray-200 pt-4 space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>Fare per seat</span>
                                <span>${rideDetails.farePerSeat}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Seats</span>
                                <span>x {bookingDetails?.seats || 1}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Booking Fee</span>
                                <span>$2.00</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-gray-900 border-t border-gray-300 pt-4 mt-2">
                                <span>Total</span>
                                <span>${(totalAmount + 2).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Section - Stripe Lookalike */}
                    <div className="p-8 md:w-1/2">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Pay with card</h2>

                        <form onSubmit={handlePay} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" placeholder="passenger@example.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Information</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={cardNumber}
                                        onChange={handleFormatCardNumber}
                                        placeholder="0000 0000 0000 0000"
                                        className="w-full px-4 py-2 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition font-mono"
                                        maxLength={19}
                                        required
                                    />
                                    <svg className="w-6 h-6 absolute left-3 top-2.5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM4 6h16v2H4V6zm0 12v-6h16v6H4z" />
                                    </svg>
                                </div>
                                <div className="flex space-x-4 mt-3">
                                    <input
                                        type="text"
                                        placeholder="MM / YY"
                                        value={expiry}
                                        onChange={e => setExpiry(e.target.value)}
                                        className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-center"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="CVC"
                                        value={cvc}
                                        onChange={e => setCvc(e.target.value)}
                                        className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-center"
                                        maxLength={3}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                                <input
                                    type="text"
                                    placeholder="Full Name on Card"
                                    value={cardHolder}
                                    onChange={e => setCardHolder(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    required
                                />
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg shadow-md transition transform active:scale-95 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                {loading ? 'Processing...' : `Pay $${(totalAmount + 2).toFixed(2)}`}
                            </button>

                            <div className="flex items-center justify-center text-xs text-gray-500 space-x-2 mt-4">
                                <span className="flex items-center"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg> Secure Payment with SSL</span>
                                <span>|</span>
                                <span>Powered by Triply</span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
