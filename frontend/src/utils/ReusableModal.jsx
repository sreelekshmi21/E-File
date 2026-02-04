import React from 'react'

export default function ReusableModal({
  showModal,
  setShowModal,
  title,
  message,
  confirmText,
  confirmVariant,
  onConfirm,
  cancelText = "Cancel",
  headerClass = "bg-danger",
  children
}) {
  if (!showModal) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
      <div
        className="modal fade show"
        style={{ display: "block", zIndex: 1060 }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className={`modal-header ${headerClass} text-white`}>
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowModal(false)}></button>
            </div>
            <div className="modal-body">
              {message && <p>{message}</p>}
              {children}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{cancelText}</button>
              <button type="button" className={`btn btn-${confirmVariant}`} id="confirmModalBtn" onClick={onConfirm}>{confirmText}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
