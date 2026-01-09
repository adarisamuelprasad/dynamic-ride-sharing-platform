import React, { useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, Home } from "lucide-react";

const PaymentSuccess = () => {
    const location = useLocation();
    const { amount, transactionId, ride, bookingId, bookingDetails } = location.state || {};
    const receiptRef = useRef(null);
    const ticketRef = useRef(null);

    React.useEffect(() => {
        const confirmBackend = async () => {
            if (bookingId && transactionId) {
                try {
                    await import('@/services/bookingService').then(m => m.bookingService.confirmPayment(bookingId, transactionId));
                    console.log("Payment confirmed on backend & email sent.");
                } catch (e) {
                    console.error("Backend confirmation failed", e);
                }
            }
        };
        confirmBackend();
    }, [bookingId, transactionId]);

    const generatePDF = async (elementRef, fileName) => {
        if (!elementRef.current) return;

        try {
            const canvas = await html2canvas(elementRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${fileName}.pdf`);
        } catch (err) {
            console.error("Failed to generate PDF", err);
            alert("Could not generate PDF.");
        }
    };

    if (!amount && !ride) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <Navbar />
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No Payment Details Found</h2>
                    <p className="text-gray-600 mb-8">It seems you've reached this page without completing a payment.</p>
                    <Link to="/">
                        <Button>Go Home</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            <div className="container mx-auto px-4 pt-12 max-w-4xl">
                <div className="text-center mb-12">
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
                    <p className="text-lg text-gray-600">Your seat has been successfully reserved. Safe travels!</p>
                </div>

                <div className="grid md:grid-cols-1 gap-8">
                    {/* Ticket Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Your Ticket</h2>
                            <Button onClick={() => generatePDF(ticketRef, `ticket_${bookingId || 'triply'}`)} variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" /> Download Ticket
                            </Button>
                        </div>

                        <div ref={ticketRef} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
                            {/* Ticket Header */}
                            <div className="bg-indigo-600 p-6 text-white">
                                <h3 className="text-2xl font-bold tracking-wider">TRIPLY TICKET</h3>
                                <p className="text-indigo-100 text-sm opacity-90">Ride Sharing Platform</p>
                            </div>

                            {/* Ticket Body */}
                            <div className="p-6 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Source</p>
                                        <p className="font-bold text-gray-900 text-lg">{ride?.source || 'N/A'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Destination</p>
                                        <p className="font-bold text-gray-900 text-lg">{ride?.destination || 'N/A'}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date</p>
                                    <p className="font-medium text-gray-900">
                                        {(() => {
                                            if (!ride?.departureTime) return 'N/A';
                                            try {
                                                // Handle array format [yyyy, mm, dd, hh, mm]
                                                if (Array.isArray(ride.departureTime)) {
                                                    const [y, m, d] = ride.departureTime;
                                                    return new Date(y, m - 1, d).toLocaleDateString();
                                                }
                                                return new Date(ride.departureTime).toLocaleDateString();
                                            } catch (e) { return 'N/A'; }
                                        })()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Time</p>
                                    <p className="font-medium text-gray-900">
                                        {(() => {
                                            if (!ride?.departureTime) return 'N/A';
                                            try {
                                                // Handle array format [yyyy, mm, dd, hh, mm]
                                                if (Array.isArray(ride.departureTime)) {
                                                    const [, , d, h, min] = ride.departureTime;
                                                    return new Date(0, 0, 0, h, min).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                                                }
                                                return new Date(ride.departureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                                            } catch (e) { return 'N/A'; }
                                        })()}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-gray-300 my-4"></div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Passengers</p>
                                    <p className="font-bold text-gray-900">{bookingDetails?.seats || 1} Seat(s)</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Booking ID</p>
                                    <p className="font-mono text-gray-900">#{bookingId || 'PENDING'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Ticket Footer (Barcode-ish) */}
                        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
                            <div className="h-8 w-48 bg-gray-200" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, #000 2px, #000 4px)' }}></div>
                            <span className="text-xs text-gray-400">Valid for one ride</span>
                        </div>
                    </div>
                </div>

                {/* Receipt Section (Downloadable) */}
                {/* Professional Invoice Section */}
                <div className="w-full">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Tax Invoice</h2>
                        <Button onClick={() => generatePDF(receiptRef, `invoice_${transactionId || bookingId || 'triply'}`)} variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" /> Download Invoice
                        </Button>
                    </div>

                    <div ref={receiptRef} className="bg-white rounded-lg shadow-xl overflow-hidden print:shadow-none">
                        {/* Invoice Header */}
                        <div className="p-8 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                    <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">T</span>
                                    </div>
                                    TripLy Inc.
                                </h1>
                                <p className="text-sm text-slate-500 mt-1">Ride Sharing Platform</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-lg font-semibold text-slate-400 uppercase tracking-widest">Invoice</h2>
                                <p className="text-slate-900 font-medium mt-1">#INV-{transactionId?.substring(0, 8) || bookingId || '0000'}</p>
                                <p className="text-sm text-slate-500">{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Billed To / From */}
                        <div className="p-8 grid grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Billed To</h3>
                                <div className="text-slate-900 text-sm font-medium">Passenger</div>
                                <div className="text-slate-500 text-sm">
                                    {bookingDetails?.passengerName || 'Valued Customer'}<br />
                                    Payment Method: Card ****
                                </div>
                            </div>
                            <div className="text-right">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">From</h3>
                                <div className="text-slate-900 text-sm font-medium">TripLy Inc.</div>
                                <div className="text-slate-500 text-sm">
                                    123 Tech Park, Cyber City<br />
                                    Hyderabad, India 500081
                                </div>
                            </div>
                        </div>

                        {/* Invoice Items */}
                        <div className="px-8">
                            <div className="w-full border-t border-b border-gray-200">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr>
                                            <th className="py-3 font-semibold text-slate-700">Description</th>
                                            <th className="py-3 font-semibold text-slate-700 text-right">Qty</th>
                                            <th className="py-3 font-semibold text-slate-700 text-right">Price</th>
                                            <th className="py-3 font-semibold text-slate-700 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        <tr>
                                            <td className="py-4 text-slate-900">
                                                <p className="font-medium">Ride Rate</p>
                                                <p className="text-xs text-slate-500">{ride?.source} to {ride?.destination} ({ride?.distanceKm || 'Standard'} km)</p>
                                            </td>
                                            <td className="py-4 text-slate-900 text-right">{bookingDetails?.seats || 1}</td>
                                            <td className="py-4 text-slate-900 text-right">₹{amount ? (Number(amount) / (bookingDetails?.seats || 1)).toFixed(2) : '0.00'}</td>
                                            <td className="py-4 text-slate-900 text-right font-semibold">₹{amount ? Number(amount).toFixed(2) : '0.00'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="p-8 flex justify-end">
                            <div className="w-1/2 space-y-3">
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Subtotal</span>
                                    <span>₹{amount ? Number(amount).toFixed(2) : '0.00'}</span>
                                </div>
                                <div className="flex justify-between text-slate-900 font-bold text-lg pt-3 border-t border-gray-200">
                                    <span>Total Paid</span>
                                    <span>₹{amount ? Number(amount).toFixed(2) : '0.00'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Stamp */}
                        <div className="bg-slate-50 p-6 border-t border-gray-100 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute right-10 top-2 opacity-10 pointer-events-none transform rotate-[-15deg] border-4 border-green-600 text-green-600 font-black text-6xl uppercase px-4 py-2 rounded-lg">
                                PAID
                            </div>
                            <div className="text-xs text-slate-400">
                                <p>Thank you for riding with TripLy.</p>
                                <p>For support, contact support@triply.com</p>
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                                Auth: {transactionId || 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-8">
                <Link to="/">
                    <Button variant="outline" size="lg">
                        <Home className="w-4 h-4 mr-2" /> Back to Home
                    </Button>
                </Link>
                <Link to="/my-bookings">
                    <Button size="lg">
                        View My Bookings
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default PaymentSuccess;
