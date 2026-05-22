"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const FormField = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, hint, className, ...rest }, ref) => (
    <label className="block">
      <span className="block text-sm font-medium text-gray-800 mb-1.5">{label}</span>
      <input
        ref={ref}
        {...rest}
        className={cn(
          "w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 transition",
          error ? "border-red-300" : "border-gray-200",
          className
        )}
      />
      {error ? (
        <span className="block text-xs text-red-600 mt-1">{error}</span>
      ) : hint ? (
        <span className="block text-xs text-gray-500 mt-1">{hint}</span>
      ) : null}
    </label>
  )
);
FormField.displayName = "FormField";

interface AreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, AreaProps>(
  ({ label, error, hint, className, ...rest }, ref) => (
    <label className="block">
      <span className="block text-sm font-medium text-gray-800 mb-1.5">{label}</span>
      <textarea
        ref={ref}
        {...rest}
        className={cn(
          "w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 transition resize-y",
          error ? "border-red-300" : "border-gray-200",
          className
        )}
      />
      {error ? (
        <span className="block text-xs text-red-600 mt-1">{error}</span>
      ) : hint ? (
        <span className="block text-xs text-gray-500 mt-1">{hint}</span>
      ) : null}
    </label>
  )
);
FormTextarea.displayName = "FormTextarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const FormSelect = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...rest }, ref) => (
    <label className="block">
      <span className="block text-sm font-medium text-gray-800 mb-1.5">{label}</span>
      <select
        ref={ref}
        {...rest}
        className={cn(
          "w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition",
          error ? "border-red-300" : "border-gray-200",
          className
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
    </label>
  )
);
FormSelect.displayName = "FormSelect";
