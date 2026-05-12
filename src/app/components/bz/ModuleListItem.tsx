import * as React from "react";
import { cn } from "../ui/utils";

// Sidebar row for dashboard mocks ("Dashboard / Finance / Inventory / …").
//   <ModuleListItem active>Dashboard</ModuleListItem>
//   <ModuleListItem>Finance</ModuleListItem>
//
// On a dark sidebar, the active item gets pistachio fill + deep text.

export type ModuleListItemProps = {
  active?: boolean;
  tone?: "light" | "dark";
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children">;

export function ModuleListItem({
  active,
  tone = "dark",
  className,
  children,
  ...rest
}: ModuleListItemProps) {
  const baseColor =
    tone === "dark" ? "text-white/[0.7]" : "text-bz-text-muted";
  const activeStyle = active
    ? "bg-bz-leaf text-[#1F3422] font-medium"
    : `${baseColor}`;
  return (
    <div
      className={cn(
        "rounded-bz-md px-[10px] py-2 text-[12.5px]",
        activeStyle,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
