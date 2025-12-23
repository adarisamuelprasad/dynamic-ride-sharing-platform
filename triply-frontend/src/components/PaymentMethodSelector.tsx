import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, CreditCard, Banknote } from "lucide-react";

interface PaymentMethodSelectorProps {
    selectedMethod: string;
    onSelect: (method: string) => void;
}

const PaymentMethodSelector = ({ selectedMethod, onSelect }: PaymentMethodSelectorProps) => {
    const methods = [
        { id: "CASH", name: "Cash on Delivery", icon: Banknote, description: "Pay the driver directly" },
        { id: "STRIPE", name: "Stripe (Card)", icon: CreditCard, description: "Pay securely via Stripe" },
        { id: "NETBANKING", name: "Netbanking", icon: Wallet, description: "Direct bank transfer" },
    ];

    return (
        <div className="grid gap-3 py-4">
            {methods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                return (
                    <Card
                        key={method.id}
                        className={`cursor-pointer transition-all hover:border-primary/50 ${isSelected ? "border-2 border-primary bg-primary/5" : "border-border"
                            }`}
                        onClick={() => onSelect(method.id)}
                    >
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className={`rounded-full p-2 ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-semibold text-foreground">{method.name}</p>
                                <p className="text-xs text-muted-foreground">{method.description}</p>
                            </div>
                            {isSelected && (
                                <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                                    <div className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default PaymentMethodSelector;
