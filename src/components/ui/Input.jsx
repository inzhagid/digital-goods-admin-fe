import cn from "../../lib/cn";

export default function Input({ className, ...props }) {
  return (
    <input
      {...props}
      className={cn(
        "w-full px-3 py-2 rounded text-sm transition-colors border border-gray-300",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
        "disabled:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed",
        className,
      )}
    />
  );
}
