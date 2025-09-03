import { useEffect } from "react";

export default function Toast({ show, title, body, onClose, variant = "success"}) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000); // auto close after 3s
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      // className="toast show text-bg-success border-0 position-fixed top-50 start-50 translate-middle"
       className={`toast show text-white border-0 position-fixed top-50 start-50 translate-middle bg-${variant}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{ zIndex: 1055 }}
    >
      <div className="d-flex">
        <div className="toast-body">
          <strong>{title}</strong> {body}
        </div>
        <button type="button"
          className="btn-close btn-close-white me-2 m-auto"
          onClick={onClose}></button>
      </div>
    </div>
  );
}