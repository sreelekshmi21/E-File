import React from 'react'

export default function ReusableModal({showModal, setShowModal, title,
  message,
  confirmText,
  confirmVariant,
  onConfirm}) {
  return (
    <div className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
      <div className="modal-header bg-danger text-white">
        <h5 className="modal-title">{title}</h5>
        <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowModal(false)}></button>
      </div>
      <div className="modal-body">
       {message}
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
        <button type="button" className={`btn btn-${confirmVariant}`} id="confirmDeleteBtn" onClick={onConfirm}>{confirmText}</button>
      </div>
    </div>
  </div>
</div>
  )
}
