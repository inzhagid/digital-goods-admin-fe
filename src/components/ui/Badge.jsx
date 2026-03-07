import cn from "../../lib/cn";

const variants = {
  success: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  pending: "bg-blue-100 text-blue-700",
};

const statusVariant = {
  success: "success",
  failed: "failed",
  pending: "pending",
};

export function Badge({ status, label }) {
  const variant = statusVariant[status] ?? "pending";
  return (
    <span
      className={cn(
        "text-xs font-medium px-2 py-1 rounded-full",
        variants[variant],
      )}
    >
      {label ?? status}
    </span>
  );
}
