import { useToast } from "../../app/toast/ToastContext";

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`bg-white rounded shadow p-3 min-w-[260px] flex items-start justify-between gap-3 ${toast.type === "success" ? "border-green-300 text-green-800" : "border-red-300 text-red-800"}`}
        >
          <div className="text-sm">{toast.message}</div>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="text-gray-500 hover:text-gray-700"
          >
            X
          </button>
        </div>
      ))}
    </div>
  );
}
