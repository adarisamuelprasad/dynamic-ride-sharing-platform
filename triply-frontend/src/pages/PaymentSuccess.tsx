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
    const receiptRef = useRef<HTMLDivElement>(null);
    const ticketRef = useRef<HTMLDivElement>(null);

    const generatePDF = async (elementRef: React.RefObject<HTMLDivElement>, fileName: string) => {
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

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Ticket Section (Downloadable) */}
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date</p>
                                        <p className="font-medium text-gray-900">
                                            {ride?.departureTime ? new Date(ride.departureTime).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Time</p>
                                        <p className="font-medium text-gray-900">
                                            {ride?.departureTime ? new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
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
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Payment Receipt</h2>
                            <Button onClick={() => generatePDF(receiptRef, `receipt_${transactionId || 'triply'}`)} variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" /> Download Receipt
                            </Button>
                        </div>

                        <div ref={receiptRef} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
                            <div className="text-center border-b border-gray-100 pb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Payment Receipt</h3>
                                <p className="text-sm text-gray-500">Transaction ID: {transactionId || 'N/A'}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-4">${Number(amount || 0).toFixed(2)}</p>
                                <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold mt-2">
                                    PAID
                                </div>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Payment Method</span>
                                    <span className="font-medium text-gray-900">Card ending in ****</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Date</span>
                                    <span className="font-medium text-gray-900">{new Date().toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Ride Fare</span>
                                    <span className="font-medium text-gray-900">${(Number(amount || 0) - 2).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Service Fee</span>
                                    <span className="font-medium text-gray-900">$2.00</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <div className="flex justify-between font-bold text-base">
                                    <span className="text-gray-900">Total</span>
                                    <span className="text-indigo-600">${Number(amount || 0).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="text-center pt-4">
                                <p className="text-xs text-gray-400">Thank you for choosing Triply!</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex justify-center space-x-4">
                    <Link to="/">
                        <Button className="px-8 py-6 text-lg" variant="default">
                            <Home className="w-5 h-5 mr-2" /> Back to Home
                        </Button>
                    </Link>
                    <Link to="/history">
                        <Button className="px-8 py-6 text-lg" variant="secondary">
                            My Ride History
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
