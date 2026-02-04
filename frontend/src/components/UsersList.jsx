import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [allRoles, setAllRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL;

  // Define the 5 specific roles
  const ROLE_NAMES = [
    'Inward Desk',
    'Desk',
    'Approval Authority',
    'Administrator',
    'Despatcher'
  ];

  useEffect(() => {
    getUsers();
    fetchRoles();
  }, []);

  const getUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/users`);
      const data = await response.json();
      console.log('users:', response, data);
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/roles`);
      const data = await response.json();
      // Show all roles from the database (includes Administrator, Inward Desk, Desk, Approval Authority, Despatcher)
      setAllRoles(data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/api/users/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      } else {
        alert(data.message || "Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    // Parse existing roles from role_names or role_codes
    const userRoleNames = user.role_names ? user.role_names.split(',').map(r => r.trim().toLowerCase()) : [];
    const userRoleCodes = user.role_codes ? user.role_codes.split(',').map(r => r.trim().toLowerCase()) : [];

    // Find matching role IDs
    const matchedRoleIds = allRoles
      .filter(role =>
        userRoleNames.includes(role.name.toLowerCase()) ||
        userRoleCodes.includes(role.code?.toLowerCase())
      )
      .map(role => role.id);

    setSelectedRoles(matchedRoleIds);
    setShowEditModal(true);
  };

  const handleRoleToggle = (roleId) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleUpdateRoles = async () => {
    if (!selectedUser) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`${BASE_URL}/api/users/${selectedUser.id}/roles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role_ids: selectedRoles }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Roles updated successfully!');
        setShowEditModal(false);
        setSelectedUser(null);
        setSelectedRoles([]);
        // Refresh users list to show updated roles
        getUsers();
      } else {
        alert(data.message || 'Failed to update roles');
      }
    } catch (error) {
      console.error('Error updating roles:', error);
      alert('Error updating roles');
    } finally {
      setIsUpdating(false);
    }
  };

  const closeModal = () => {
    setShowEditModal(false);
    setSelectedUser(null);
    setSelectedRoles([]);
  };

  return (
    <>
      <div>UsersList</div>
      <h3><Link to='/adminpanel'>Back to Admin Panel</Link></h3>
      {users?.length > 0 ? (
        <div className='col-md-10'>
          <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th>Username</th>
                <th>Email</th>
                <th>Department</th>
                <th>Roles</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.department}</td>
                  <td>{user.role_names || 'No roles'}</td>
                  <td>
                    <button
                      onClick={() => handleEditClick(user)}
                      style={{
                        marginRight: '8px',
                        padding: '6px 12px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => handleDelete(user?.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      DELETE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No users found</p>
      )}

      {/* Edit Roles Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            minWidth: '400px',
            maxWidth: '500px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <h2 style={{
              marginTop: 0,
              marginBottom: '20px',
              fontSize: '20px',
              borderBottom: '1px solid #eee',
              paddingBottom: '12px'
            }}>
              Edit Roles for User: {selectedUser?.username || selectedUser?.fullname}
            </h2>

            <div style={{ marginBottom: '24px' }}>
              {allRoles.map((role) => (
                <label
                  key={role.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 12px',
                    marginBottom: '8px',
                    backgroundColor: selectedRoles.includes(role.id) ? '#e7f3ff' : '#f8f9fa',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: selectedRoles.includes(role.id) ? '2px solid #007bff' : '2px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => handleRoleToggle(role.id)}
                    style={{
                      marginRight: '12px',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{
                    fontSize: '15px',
                    fontWeight: selectedRoles.includes(role.id) ? '500' : 'normal',
                    textTransform: 'capitalize'
                  }}>
                    {role.name}
                  </span>
                </label>
              ))}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              borderTop: '1px solid #eee',
              paddingTop: '16px'
            }}>
              <button
                onClick={closeModal}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRoles}
                disabled={isUpdating}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isUpdating ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isUpdating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {isUpdating ? 'Updating...' : 'UPDATE ROLES'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
