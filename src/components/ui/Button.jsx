import cn from "../../lib/cn";

const variants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white border border-blue-600",
  secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300",
  danger: "bg-red-100 hover:bg-red-200 text-red-500 border border-red-500",
};

export default function Button({
  children,
  variant = "primary",
  className,
  type = "button",
  ...props
}) {
  return (
    <button
      className={cn(
        "cursor-pointer px-4 py-2 rounded text-sm font-medium transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
