import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { processPayment } from '../services/paymentService';
import { bookingService } from '../services/bookingService';
import Navbar from '../components/Navbar';
import { toast } from 'sonner';

// Reuse existing styles or define inline for the specific "Stripe" look
const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const rideDetails = location.state?.ride;
    const bookingDetails = location.state?.booking || location.state?.bookingDetails; // Handle both keys

    const [loading, setLoading] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [cardHolder, setCardHolder] = useState('');

    // Use amount from state (from booking) or calculate from ride details
    const totalAmount = location.state?.amount ||
        bookingDetails?.fareAmount ||
        (rideDetails ? (rideDetails.farePerSeat * (bookingDetails?.seats || 1)) : 0);

    const handleFormatCardNumber = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        val = val.substring(0, 16);
        val = val.match(/.{1,4}/g)?.join(' ') || val;
        setCardNumber(val);
    };

    const handlePay = async (e) => {
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

                if (bookingRes && 'id' in bookingRes) {
                    bookingId = bookingRes.id;
                } else if (bookingRes && bookingRes.booking && 'id' in bookingRes.booking) {
                    bookingId = bookingRes.booking.id;
                }
            }

            if (!bookingId) throw new Error("Could not generate Booking ID");

            // 2. Process Payment
            await processPayment(bookingId, totalAmount, 'STRIPE_CARD');

            // 3. Success
            const transactionId = Math.random().toString(36).substr(2, 9).toUpperCase();
            navigate('/payment-success', {
                state: {
                    transactionId,
                    ride: rideDetails,
                    bookingId: bookingId,
                    booking: bookingDetails,
                    amount: totalAmount
                }
            });

        } catch (err) {
            console.error("Payment Flow Error", err);
            const errorMessage = err.response?.data || err.message || "Payment Processing Failed";
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    if (!rideDetails) return <div className="p-8">Invalid or expired session.</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background">
            <Navbar />
            <div className="flex flex-col items-center justify-center p-6 pt-24">
                <div className="bg-card shadow-xl rounded-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row border">
                    {/* Order Summary */}
                    <div className="bg-muted p-8 md:w-1/2">
                        <h2 className="text-2xl font-bold text-foreground mb-6">Order Summary</h2>
                        <div className="space-y-4 mb-8">
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Ride Detail</h3>
                                <p className="text-lg font-medium text-foreground">{rideDetails.source} → {rideDetails.destination}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Date & Time</h3>
                                <p className="text-lg font-medium text-foreground">{new Date(rideDetails.departureTime).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="border-t border-border pt-4 space-y-2">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Fare per seat</span>
                                <span>₹{rideDetails.farePerSeat}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Seats</span>
                                <span>x {bookingDetails?.seats || 1}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Booking Fee</span>
                                <span>₹2.00</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-foreground border-t border-border pt-4 mt-2">
                                <span>Total</span>
                                <span>₹{(totalAmount + 2).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Section - Stripe Lookalike */}
                    <div className="p-8 md:w-1/2 bg-card">
                        <h2 className="text-2xl font-bold text-foreground mb-6">Pay with card</h2>

                        <form onSubmit={handlePay} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                                <input type="email" placeholder="passenger@example.com" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition bg-background" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Card Information</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={cardNumber}
                                        onChange={handleFormatCardNumber}
                                        placeholder="0000 0000 0000 0000"
                                        className="w-full px-4 py-2 pl-12 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition font-mono bg-background"
                                        maxLength={19}
                                        required
                                    />
                                    <svg className="w-6 h-6 absolute left-3 top-2.5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM4 6h16v2H4V6zm0 12v-6h16v6H4z" />
                                    </svg>
                                </div>
                                <div className="flex space-x-4 mt-3">
                                    <input
                                        type="text"
                                        placeholder="MM / YY"
                                        value={expiry}
                                        onChange={e => setExpiry(e.target.value)}
                                        className="w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition text-center bg-background"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="CVC"
                                        value={cvc}
                                        onChange={e => setCvc(e.target.value)}
                                        className="w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition text-center bg-background"
                                        maxLength={3}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Cardholder Name</label>
                                <input
                                    type="text"
                                    placeholder="Full Name on Card"
                                    value={cardHolder}
                                    onChange={e => setCardHolder(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition bg-background"
                                    required
                                />
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg shadow-md transition transform active:scale-95 ${loading ? 'bg-muted-foreground cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}
                            >
                                {loading ? 'Processing...' : `Pay ₹${(totalAmount + 2).toFixed(2)}`}
                            </button>

                            <div className="flex items-center justify-center text-xs text-muted-foreground space-x-2 mt-4">
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
