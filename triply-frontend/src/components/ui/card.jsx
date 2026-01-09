import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef(({ className, glass = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border text-card-foreground",
      glass
        ? "bg-[hsla(0,0%,100%,0.8)] dark:bg-[hsla(222,47%,11%,0.7)] backdrop-blur-xl border border-[hsla(222,47%,11%,0.1)] dark:border-[hsla(0,0%,100%,0.06)]"
        : "bg-card border-border shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-display text-xl font-bold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
