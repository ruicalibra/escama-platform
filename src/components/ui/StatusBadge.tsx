import { getStatusLabel, getStatusColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const { bg, text } = getStatusColor(status);
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold", bg, text)}>
      {getStatusLabel(status)}
    </span>
  );
}
