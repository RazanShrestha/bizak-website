import * as React from "react";
import { cn } from "../ui/utils";
import { Flag } from "./Flag";

// Row used in multi-entity / consolidation panels:
//   [🇺🇸] Bizak US                            $1.24M
//
//   <EntityRow flag="🇺🇸" name="Bizak US" amount="$1.24M" />
//   <EntityRow flag="🇯🇵" name="Bizak JP" amount="¥28M" tone="dark" />

export type EntityRowProps = {
  flag: string;
  name: React.ReactNode;
  amount: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children">;

export function EntityRow({
  flag,
  name,
  amount,
  tone = "light",
  className,
  ...rest
}: EntityRowProps) {
  const bg = tone === "dark" ? "bg-white/[0.05]" : "bg-[#F4F5EF]";
  const nameColor = tone === "dark" ? "text-bz-text-on-dark" : "text-bz-text";
  const amountColor = tone === "dark" ? "text-bz-text-on-dark" : "text-bz-text";
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-bz-lg px-3 py-2",
        bg,
        className,
      )}
      {...rest}
    >
      <div className="flex items-center gap-[10px]">
        <Flag style={{ width: 20, height: 20, fontSize: 11 }}>{flag}</Flag>
        <span className={cn("text-[12.5px]", nameColor)}>{name}</span>
      </div>
      <span className={cn("text-[12px] font-medium", amountColor)}>
        {amount}
      </span>
    </div>
  );
}
