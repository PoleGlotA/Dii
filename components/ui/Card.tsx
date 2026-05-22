import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function Card({
  padding = "md",
  hover,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      {...rest}
      className={cn(
        "bg-white border border-gray-200 rounded-2xl shadow-elev-1",
        paddings[padding],
        hover && "transition-all duration-base hover:border-brand-200 hover:shadow-elev-2",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn("text-h3 text-gray-900", className)}>{children}</h2>
  );
}
