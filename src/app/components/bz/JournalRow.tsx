import * as React from "react";
import { cn } from "../ui/utils";

// Row used in auto-posting journal panels:
//   Sales order SO-1041          AR → Revenue + VAT
//
//   <JournalRow txn="Sales order SO-1041" debit="AR" credit="Revenue + VAT" />
//   <JournalRow txn="Shipment SH-882" debit="COGS" credit="Inventory" tone="dark" />

export type JournalRowProps = {
  txn: React.ReactNode;
  debit: React.ReactNode;
  credit: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children">;

export function JournalRow({
  txn,
  debit,
  credit,
  tone = "light",
  className,
  ...rest
}: JournalRowProps) {
  const bg = tone === "dark" ? "bg-white/[0.05]" : "bg-[#F4F5EF]";
  const txnColor = tone === "dark" ? "text-bz-text-on-dark" : "text-bz-text";
  const flowColor = tone === "dark" ? "text-white/[0.72]" : "text-bz-text-muted";
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-bz-lg px-[10px] py-2",
        bg,
        className,
      )}
      {...rest}
    >
      <span className={cn("text-[11.5px]", txnColor)}>{txn}</span>
      <span className={cn("text-[10.5px]", flowColor)}>
        {debit} <span aria-hidden="true">→</span> {credit}
      </span>
    </div>
  );
}
