import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useState } from "react";
import { reviewService } from "@/services/reviewService";
import { toast } from "sonner";

export function ReviewModal({ isOpen, onClose, rideId, revieweeId, onSuccess }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await reviewService.addReview({
                rideId,
                revieweeId,
                rating,
                comment
            });
            toast.success("Review submitted!");
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit review. You may have already reviewed this ride.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Rate your Trip</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`h-8 w-8 cursor-pointer transition-colors ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                    }`}
                                onClick={() => setRating(star)}
                            />
                        ))}
                    </div>
                    <Textarea
                        placeholder="Tell us more about your trip..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>Submit Review</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
