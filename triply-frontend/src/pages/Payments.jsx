import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { paymentService, PaymentReport } from "@/services/paymentService";
import { bookingService } from "@/services/bookingService";
import { authService } from "@/services/authService";
import { Wallet, TrendingUp, CreditCard, ReceiptText, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Payments = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const role = authService.currentUser?.role;

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const data = await paymentService.getReport();
                setReport(data);
            } catch (error) {
                console.error("Failed to fetch payment report", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading reports...</div>;

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 animate-fade-in">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2 -ml-2">
                        <ChevronLeft className="mr-1 h-4 w-4" /> Back
                    </Button>
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Payment <span className="gradient-text">Reports</span>
                    </h1>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <Button
                        variant="outline"
                        onClick={() => bookingService.downloadReport()}
                        className="gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                    >
                        <ReceiptText className="h-4 w-4 text-primary" />
                        Booking CSV
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => paymentService.downloadReport()}
                        className="gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                    >
                        <ReceiptText className="h-4 w-4 text-primary" />
                        Payment CSV
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => bookingService.downloadReportPdf()}
                        className="gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                    >
                        <ReceiptText className="h-4 w-4 text-primary" />
                        Booking PDF
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => paymentService.downloadReportPdf()}
                        className="gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                    >
                        <ReceiptText className="h-4 w-4 text-primary" />
                        Payment PDF
                    </Button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {role === 'ROLE_ADMIN' && (
                    <>
                        <Card glass>
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="rounded-full bg-primary/10 p-3">
                                    <TrendingUp className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                                    <p className="text-2xl font-bold">₹{report?.totalRevenue?.toFixed(2) || "0.00"}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card glass>
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="rounded-full bg-secondary/10 p-3">
                                    <ReceiptText className="h-6 w-6 text-secondary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                                    <p className="text-2xl font-bold">{report?.totalTransactions}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

                {(role === 'ROLE_DRIVER' || role === 'DRIVER') && (
                    <>
                        <Card glass>
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="rounded-full bg-accent/10 p-3">
                                    <Wallet className="h-6 w-6 text-accent" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Wallet Balance</p>
                                    <p className="text-2xl font-bold">₹{report?.walletBalance?.toFixed(2) || "0.00"}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card glass>
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="rounded-full bg-primary/10 p-3">
                                    <TrendingUp className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Life-time Earnings</p>
                                    <p className="text-2xl font-bold">₹{report?.totalEarnings?.toFixed(2) || "0.00"}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

                {(role === 'ROLE_PASSENGER' || !role) && (
                    <Card glass>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-full bg-primary/10 p-3">
                                <CreditCard className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Spent</p>
                                <p className="text-2xl font-bold">₹{report?.totalSpent?.toFixed(2) || "0.00"}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Transaction Table */}
            <Card glass>
                <CardHeader>
                    <CardTitle className="text-xl">Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Route</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(report?.transactions || report?.earningsHistory || report?.bookings)?.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell className="text-xs">
                                        {new Date(payment.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{payment.transactionId}</TableCell>
                                    <TableCell>
                                        <span className="text-xs font-medium uppercase">{(payment.type || "PAYMENT").replace('_', ' ')}</span>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {payment.booking?.ride?.source} → {payment.booking?.ride?.destination}
                                    </TableCell>
                                    <TableCell className="font-bold">₹{(payment.amount || 0).toFixed(2)}</TableCell>
                                    <TableCell>
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${payment.status === 'PAID' ? 'bg-green-500/10 text-green-500' :
                                            payment.status === 'TRANSFERRED' ? 'bg-blue-500/10 text-blue-500' :
                                                payment.status === 'REFUNDED' ? 'bg-orange-500/10 text-orange-500' :
                                                    'bg-muted text-muted-foreground'
                                            }`}>
                                            {payment.status}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!(report?.transactions || report?.earningsHistory || report?.bookings)?.length && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No transactions found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default Payments;
