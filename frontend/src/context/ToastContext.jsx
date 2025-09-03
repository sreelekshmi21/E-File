import { createContext, useContext, useState, useCallback } from "react";
import Toast from "../utils/Toast";


const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    show: false,
    title: "",
    body: "",
    variant: "success"
  });

  const showToast = useCallback((title, body, variant = "success") => {
    setToast({ show: true, title, body, variant });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        show={toast.show}
        title={toast.title}
        body={toast.body}
        variant={toast.variant}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}