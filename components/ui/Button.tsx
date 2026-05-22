"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-elev-1",
  secondary: "bg-gray-900 text-white hover:bg-gray-800 active:bg-black",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200",
  danger: "bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-700 shadow-elev-1",
  success: "bg-success-600 text-white hover:bg-success-700 shadow-elev-1",
  outline:
    "bg-white text-gray-800 border border-gray-200 hover:border-brand-400 hover:text-brand-700",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconTrailing?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

type ButtonProps = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading,
      fullWidth,
      icon,
      iconTrailing,
      children,
      className,
      disabled,
      ...rest
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      {...rest}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-base ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
      {!loading && iconTrailing}
    </button>
  )
);
Button.displayName = "Button";

interface LinkButtonProps extends BaseProps {
  href: string;
  target?: string;
  rel?: string;
  prefetch?: boolean;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  fullWidth,
  icon,
  iconTrailing,
  children,
  className,
  href,
  ...rest
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      {...rest}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-base ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98]",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
    >
      {icon}
      {children}
      {iconTrailing}
    </Link>
  );
}

interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: React.ReactNode;
  label: string;
  variant?: "ghost" | "outline" | "danger";
  size?: "sm" | "md";
}

export function IconButton({
  icon,
  label,
  variant = "ghost",
  size = "md",
  className,
  ...rest
}: IconButtonProps) {
  const sizeCls = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const variantCls =
    variant === "danger"
      ? "text-danger-600 hover:bg-danger-50"
      : variant === "outline"
        ? "border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        : "hover:bg-gray-100 text-gray-600";
  return (
    <button
      aria-label={label}
      title={label}
      {...rest}
      className={cn(
        "inline-flex items-center justify-center rounded-lg transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        sizeCls,
        variantCls,
        className
      )}
    >
      {icon}
    </button>
  );
}
