"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const sizes: Record<Size, { px: number; cls: string }> = {
  xs: { px: 20, cls: "w-5 h-5" },
  sm: { px: 28, cls: "w-7 h-7" },
  md: { px: 36, cls: "w-9 h-9" },
  lg: { px: 56, cls: "w-14 h-14" },
  xl: { px: 80, cls: "w-20 h-20" },
};

interface AvatarProps {
  src: string;
  name: string;
  size?: Size;
  href?: string;
  ring?: boolean;
  className?: string;
}

export function Avatar({ src, name, size = "md", href, ring, className }: AvatarProps) {
  const s = sizes[size];
  const img = (
    <Image
      src={src}
      alt={name}
      width={s.px}
      height={s.px}
      className={cn(
        "rounded-full bg-gray-100 object-cover",
        ring && "ring-2 ring-white shadow-elev-1",
        s.cls,
        className
      )}
      unoptimized
    />
  );
  if (href) {
    return (
      <Link href={href} className="shrink-0 transition-transform hover:scale-105">
        {img}
      </Link>
    );
  }
  return <span className="shrink-0">{img}</span>;
}

interface AvatarStackProps {
  users: { id: string; name: string; avatar: string }[];
  max?: number;
}

export function AvatarStack({ users, max = 4 }: AvatarStackProps) {
  const shown = users.slice(0, max);
  const rest = users.length - shown.length;
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {shown.map((u) => (
          <Avatar key={u.id} src={u.avatar} name={u.name} size="sm" ring />
        ))}
      </div>
      {rest > 0 && (
        <span className="ml-2 text-xs text-gray-500 font-medium">+{rest}</span>
      )}
    </div>
  );
}
