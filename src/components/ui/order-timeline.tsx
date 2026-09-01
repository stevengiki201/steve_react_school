import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

const TIMELINE_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "pending_payment", label: "Order placed" },
  { status: "paid", label: "Payment confirmed" },
  { status: "confirmed", label: "Seller confirmed" },
  { status: "processing", label: "Processing" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
];

const STATUS_ORDER: Record<OrderStatus, number> = {
  pending_payment: 0,
  paid: 1,
  confirmed: 2,
  processing: 3,
  ready_for_delivery: 4,
  shipped: 5,
  delivered: 6,
  cancelled: -1,
  refunded: -1,
};

interface OrderTimelineProps {
  currentStatus: OrderStatus;
}

export function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  if (currentStatus === "cancelled" || currentStatus === "refunded") {
    return (
      <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
        <p className="text-sm font-medium text-destructive capitalize">
          Order {currentStatus === "cancelled" ? "Cancelled" : "Refunded"}
        </p>
      </div>
    );
  }

  const currentStep = STATUS_ORDER[currentStatus];

  return (
    <div className="space-y-0">
      {TIMELINE_STEPS.map((step, index) => {
        const stepOrder = STATUS_ORDER[step.status];
        const isCompleted = stepOrder <= currentStep && currentStep >= 0;
        const isCurrent = stepOrder === currentStep;

        return (
          <div key={step.status} className="flex gap-3">
            {/* Line + circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors",
                  isCompleted
                    ? "bg-primary border-primary text-white"
                    : "border-border bg-white text-muted-foreground",
                  isCurrent && "ring-2 ring-primary/20",
                )}
              >
                {isCompleted && <Check className="h-3.5 w-3.5" />}
              </div>
              {index < TIMELINE_STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 flex-1 min-h-[20px]",
                    isCompleted ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
            {/* Label */}
            <div className="pb-4">
              <p
                className={cn(
                  "text-sm font-medium",
                  isCompleted ? "text-foreground" : "text-muted-foreground",
                  isCurrent && "text-primary font-semibold",
                )}
              >
                {step.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
