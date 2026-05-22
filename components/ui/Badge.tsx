import { cn } from "@/lib/utils";

type Tone = "neutral" | "brand" | "success" | "danger" | "warning" | "amber";

const tones: Record<Tone, string> = {
  neutral: "bg-gray-100 text-gray-700 border-gray-200",
  brand: "bg-brand-50 text-brand-700 border-brand-200",
  success: "bg-success-50 text-success-700 border-success-100",
  danger: "bg-danger-50 text-danger-700 border-danger-100",
  warning: "bg-warning-50 text-warning-700 border-warning-100",
  amber: "bg-warning-100 text-warning-800 border-warning-200",
};

interface BadgeProps {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  pulse?: boolean;
  icon?: React.ReactNode;
  size?: "sm" | "md";
}

export function Badge({ children, tone = "neutral", className, pulse, icon, size = "md" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold rounded-full border",
        size === "sm" ? "text-[10px] px-1.5 py-px" : "text-caption px-2 py-0.5",
        tones[tone],
        pulse && "animate-pulse",
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
