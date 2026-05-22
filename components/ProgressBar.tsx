import { formatCurrency, progressPercent } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  target: number;
  urgency?: boolean;
}

export function ProgressBar({ current, target, urgency }: ProgressBarProps) {
  const pct = progressPercent(current, target);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-gray-900">
          {formatCurrency(current)}
        </span>
        <span className="text-gray-500">з {formatCurrency(target)}</span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            urgency ? "bg-red-500" : "bg-blue-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">{pct}% зібрано</p>
    </div>
  );
}
