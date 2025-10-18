// components/ui/loading.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots";
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size = "md", variant = "spinner", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-8 w-8",
      lg: "h-12 w-12",
    };

    if (variant === "dots") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex items-center justify-center space-x-1",
            className
          )}
          {...props}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "animate-bounce rounded-full bg-current",
                sizeClasses[size]
              )}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      );
    }

    // Spinner por defecto
    return (
      <div
        ref={ref}
        className={cn(
          "animate-spin rounded-full border-2 border-current border-t-transparent",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Loading.displayName = "Loading";

// Loading con texto
interface LoadingWithTextProps extends LoadingProps {
  text?: string;
}

const LoadingWithText = React.forwardRef<HTMLDivElement, LoadingWithTextProps>(
  ({ text = "Cargando...", size = "md", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center gap-2",
          className
        )}
        {...props}
      >
        <Loading size={size} />
        <span className="text-sm text-muted-foreground">{text}</span>
      </div>
    );
  }
);
LoadingWithText.displayName = "LoadingWithText";

export { Loading, LoadingWithText };
