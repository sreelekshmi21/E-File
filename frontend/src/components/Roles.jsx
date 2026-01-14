import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Roles() {

  const [roles, setRoles] = useState([]);

  const BASE_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    const fetchRoles = async () => {
      const res = await fetch(`${BASE_URL}/api/roles`)
      const data = await res.json()
      //   setRoles);
      setRoles(data)

    }

    fetchRoles()
  }, []);


  const handleCheckboxChange = (roleId, permissionId) => {
    setRoles(prevRoles =>
      prevRoles.map(role =>
        role.id === roleId
          ? {
            ...role,
            permissions: role.permissions.map(p =>
              p.id === permissionId ? { ...p, assigned: !p.assigned } : p
            )
          }
          : role
      )
    );
  };

  const saveChanges = async (roleId) => {
    const role = roles.find(r => r.id === roleId);
    const assignedIds = role.permissions
      .filter(p => p.assigned)
      .map(p => p.id);

    await fetch(`${BASE_URL}/api/roles/${roleId}/permissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissionIds: assignedIds })
    });

    alert("✅ Permissions updated!");
  };

  return (
    <>
      <div className="container mt-4">
        <Link to='/adminpanel'>Back to Admin Panel</Link>
        <button className="add-role-btn">
          + Add Role
        </button>
        <h3>Role-Based Access Control</h3>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Permission</th>
              {roles.map(role => <th key={role.id}>{role.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {roles[0]?.permissions.map((perm, i) => (
              <tr key={i}>
                <td>{perm.name}</td>
                {roles.map(role => (
                  <td key={role.id}>
                    <input
                      type="checkbox"
                      checked={role.permissions[i].assigned}
                      onChange={() =>
                        handleCheckboxChange(role.id, perm.id)
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {roles.map(role => (
          <button
            key={role.id}
            className="btn btn-primary m-2"
            onClick={() => saveChanges(role.id)}
          >
            Save {role.name}
          </button>
        ))}
      </div>

    </>
  )
}
