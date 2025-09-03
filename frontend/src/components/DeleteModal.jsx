import React from 'react'

export default function DeleteModal({showModal, setShowModal,confirmDelete}) {
  return (
    <div className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
      <div className="modal-header bg-danger text-white">
        <h5 className="modal-title">Confirm Delete</h5>
        <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowModal(false)}></button>
      </div>
      <div className="modal-body">
        Are you sure you want to delete this file?
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
        <button type="button" className="btn btn-danger" id="confirmDeleteBtn" onClick={confirmDelete}>Delete</button>
      </div>
    </div>
  </div>
</div>
  )
}
