import { createContext, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const pushToast = ({ type, message }) => {
    const id = crypto.randomUUID();
    const toast = { id, type, message };

    setToasts((prev) => [...prev, toast]);

    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ toasts, removeToast, pushToast }}>
      {children}
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used in ToastProvider");
  return context;
}
