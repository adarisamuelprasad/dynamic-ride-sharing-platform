import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface StripePaymentFormProps {
    clientSecret: string;
    onSuccess: (paymentIntentId: string) => void;
    onCancel: () => void;
    amount: number;
}

const StripePaymentForm = ({ clientSecret, onSuccess, onCancel, amount }: StripePaymentFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            setIsProcessing(false);
            return;
        }

        try {
            // For mock testing, if clientSecret starts with pi_mock, skip real confirmation
            if (clientSecret.startsWith("pi_mock")) {
                setTimeout(() => {
                    toast.success("Mock payment successful!");
                    onSuccess(clientSecret);
                    setIsProcessing(false);
                }, 1500);
                return;
            }

            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                },
            });

            if (error) {
                toast.error(error.message || "Payment failed");
                console.error(error);
            } else if (paymentIntent && paymentIntent.status === "succeeded") {
                toast.success("Payment successful!");
                onSuccess(paymentIntent.id);
            }
        } catch (err) {
            toast.error("An unexpected error occurred.");
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="rounded-md border p-4 bg-muted/20">
                <label className="text-sm font-medium mb-2 block">Card Details</label>
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: "16px",
                                color: "#424770",
                                "::placeholder": {
                                    color: "#aab7c4",
                                },
                            },
                            invalid: {
                                color: "#9e2146",
                            },
                        },
                    }}
                />
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Amount to pay:</span>
                <span className="font-bold text-lg">₹{amount.toFixed(2)}</span>
            </div>
            <div className="flex gap-2 pt-2">
                <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={onCancel}
                    disabled={isProcessing}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="gradient"
                    className="flex-1"
                    disabled={!stripe || isProcessing}
                >
                    {isProcessing ? "Processing..." : `Pay ₹${amount}`}
                </Button>
            </div>
        </form>
    );
};

export default StripePaymentForm;
