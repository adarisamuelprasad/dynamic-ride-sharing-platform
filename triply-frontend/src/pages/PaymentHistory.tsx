import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getPassengerHistory, getDriverHistory } from '../services/paymentService';
import { authService } from '../services/authService';

const PaymentHistory = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const user = authService.currentUser;
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                let data = [];
                if (user.role === 'DRIVER') {
                    data = await getDriverHistory();
                } else {
                    data = await getPassengerHistory();
                }
                setTransactions(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment History</h1>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No transactions found.</div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Transaction ID</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Ride Ref</th>
                                        <th className="px-6 py-4">Method</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">{tx.transactionId}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">#{tx.booking?.id || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">Card •••• 4242</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-900">
                                                ${tx.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;
