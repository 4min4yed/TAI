import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const progressVariants = cva(
  "w-full bg-gray-200 rounded-full overflow-hidden",
  {
    variants: {
      size: {
        sm: "h-1.5",
        md: "h-2.5",
        lg: "h-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface ProgressProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value: number;
  max?: number;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    { className, value, max = 100, size, indicatorClassName, ...props },
    ref,
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        className={cn(progressVariants({ size, className }))}
        {...props}
      >
        <div
          className={cn(
            "h-full transition-all duration-300 ease-in-out",
            percentage >= 90
              ? "bg-success-500"
              : percentage >= 50
                ? "bg-primary-500"
                : percentage >= 25
                  ? "bg-warning-500"
                  : "bg-danger-500",
            indicatorClassName,
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  },
);
Progress.displayName = "Progress";

export { Progress };
