import { Calendar, Coins, Newspaper, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "./ui/Badge";
import type { PostType, PostStatus } from "@/types";

export function TypeBadge({ type }: { type: PostType }) {
  if (type === "ЗБІР")
    return (
      <Badge tone="amber" icon={<Coins size={11} />}>
        Збір
      </Badge>
    );
  if (type === "ПОДІЯ")
    return (
      <Badge tone="brand" icon={<Calendar size={11} />}>
        Подія
      </Badge>
    );
  return (
    <Badge tone="neutral" icon={<Newspaper size={11} />}>
      Новина
    </Badge>
  );
}

export function StatusBadge({ status }: { status: PostStatus }) {
  if (status === "active") return null;
  if (status === "urgent")
    return (
      <Badge tone="danger" pulse icon={<AlertCircle size={11} />}>
        Терміново
      </Badge>
    );
  if (status === "closed")
    return (
      <Badge tone="neutral" icon={<CheckCircle2 size={11} />}>
        Закрито
      </Badge>
    );
  return null;
}
