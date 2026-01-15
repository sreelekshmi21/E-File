import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function UsersList() {

    const [users, setUsers] = useState([])

    const BASE_URL = import.meta.env.VITE_API_URL 

    const ROLE_NAMES = {
            1: "Admin",
            2: "Staff",
            3: "Viewer",
   };

    useEffect(() => {
     const getUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/users`);
      const data = await response.json(); // ✅ parse response as JSON
      console.log('users:', response,data);
      setUsers(data)
      
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };
  getUsers()
    }, [])


    const handleDelete = async (id) => {

    try {
      const res = await fetch(`${BASE_URL}/api/users/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        // Remove deleted user from list
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      } else {
        alert(data.message || "Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

    
  return (
    <>
    
    <div>UsersList</div>
    <h3><Link to='/adminpanel'>Back to Admin Panel</Link></h3>
    {users?.length > 0 ? (<div className='col-md-10'><table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
    <thead>
      <tr style={{ backgroundColor: "#f2f2f2" }}>
        <th>Username</th>
        <th>Email</th>
        <th>Department</th>
        <th>RoleID</th>
      </tr>
    </thead>
    <tbody>
      {users.map((user) => (
        <tr key={user.id}>
          <td>{user.username}</td>
          <td>{user.email}</td>
          <td>{user.department}</td>
          <td>{ROLE_NAMES[user.role_id]}</td>
          <td><button onClick={() => handleDelete(user?.id)}>DELETE</button></td>
        </tr>
      ))}
    </tbody>
  </table>
  </div>

) : (
  <p>No users found</p>
)}
    </>
  )
}
