import cn from "../../lib/cn";

export default function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-lg shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={cn("px-6 py-4 border-b border-gray-200", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn("px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}
