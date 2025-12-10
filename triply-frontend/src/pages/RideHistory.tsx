import { useEffect, useState } from "react";
import { rideService, Ride } from "@/services/rideService";
import RideCard from "@/components/RideCard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar, History } from "lucide-react";

const RideHistory = () => {
    const [rides, setRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRides = async () => {
            try {
                const data = await rideService.getMyRides();
                setRides(data);
            } catch (err) {
                console.error("Failed to fetch ride history", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRides();
    }, []);

    if (loading) {
        return <div className="p-8 text-center">Loading history...</div>;
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <History className="h-8 w-8 text-primary" />
                    <h1 className="font-display text-3xl font-bold text-foreground">
                        Ride <span className="gradient-text">History</span>
                    </h1>
                </div>
                <p className="text-muted-foreground">
                    View and manage the rides you have offered.
                </p>
            </div>

            {rides.length === 0 ? (
                <Card glass className="p-8 text-center">
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="rounded-full bg-muted p-4">
                            <Calendar className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">No rides offered yet</h3>
                            <p className="text-muted-foreground">When you post a ride, it will appear here.</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {rides.map((ride, index) => (
                        <div key={ride.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                            {/* Reusing RideCard but disabling booking action since it's history */}
                            <RideCard ride={ride} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RideHistory;
