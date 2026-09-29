import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  note,
  inverse = false,
  emphasis = false,
}: {
  label: string;
  value: string;
  delta: number;
  note: string;
  inverse?: boolean;
  emphasis?: boolean;
}) {
  const positive = inverse ? delta < 0 : delta >= 0;

  return (
    <div className={cn(
      "rounded-[20px] p-4",
      emphasis
        ? "border border-[#211f1b] bg-[#1b1c18] text-white shadow-[0_18px_36px_rgba(28,26,21,.16)]"
        : "panel",
    )}>
      <div className={cn("text-[11px] font-bold", emphasis ? "text-white/55" : "text-black/43")}>
        {label}
      </div>
      <div className="metric mt-2.5 whitespace-nowrap text-[24px] font-extrabold leading-none sm:text-[27px]">
        {value}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className={cn(
          "flex items-center gap-0.5 rounded-full px-1.5 py-1 text-[10px] font-extrabold",
          positive
            ? emphasis ? "bg-white/10 text-[#bfe0ca]" : "bg-[#e6f1e9] text-[#3f7159]"
            : emphasis ? "bg-white/10 text-[#efb8b0]" : "bg-[#f5e5e2] text-[#a45249]",
        )}>
          {delta >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {Math.abs(delta)}%
        </div>
        <div className={cn("truncate text-[9px] font-semibold", emphasis ? "text-white/37" : "text-black/32")}>
          {note}
        </div>
      </div>
    </div>
  );
}
