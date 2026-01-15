import { useEffect } from "react";

export default function Toast({ show, title, body, onClose, variant = "success"}) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000); // auto close after 3s
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const bgClass = variant === 'success' ? 'bg-success' : variant === 'danger' ? 'bg-danger' : 'bg-info';

  return (
    <div
      className={`toast show text-white border-0 position-fixed top-0 start-50 translate-middle-x ${bgClass}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{ zIndex: 1055, marginTop: '20px' }}
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