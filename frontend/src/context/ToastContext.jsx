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
    console.log('[ToastContext] showToast called with:', title, body, variant);
    setToast({ show: false, title: "", body: "", variant: "success" });
    setTimeout(() => {
      setToast({ show: true, title, body, variant });
    }, 0);
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