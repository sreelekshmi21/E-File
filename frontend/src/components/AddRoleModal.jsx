import { useState } from "react";


export default function AddRoleModal({ isOpen, onClose, onCreate }) {
    const [roleName, setRoleName] = useState("");
    const [description, setDescription] = useState("");

    if (!isOpen) return null;

    const handleCreate = () => {
        if (!roleName.trim()) {
            alert("Role name is required");
            return;
        }

        onCreate({
            name: roleName.trim().toLowerCase(),
            //   description: description.trim(),
        });

        setRoleName("");
        // setDescription("");
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h3>Add New Role</h3>

                <label>Role Name</label>
                <input
                    type="text"
                    placeholder="manager"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                />



                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn-create" onClick={handleCreate}>
                        Create Role
                    </button>
                </div>
            </div>
        </div>
    );
}