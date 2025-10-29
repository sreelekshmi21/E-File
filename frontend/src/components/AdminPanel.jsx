import React from 'react'
import Sidebar from './Sidebar'
import { Link } from 'react-router-dom'

export default function AdminPanel() {
  return (
   <div className="container-fluid my-4">
  <div className="row">
    
      <Sidebar />
    
        <div className="col-md-10">
      <h3 className="mb-4">Admin Panel</h3>

      {/* Example: Content Area */}
      <div className="card p-3 shadow-sm">
        <h5>ADD USERS</h5>
        <p>Here you can manage users, documents, and notifications.</p>
        <p><Link to='/signup'>Add User</Link></p>
      </div>
      <div className="card p-3 shadow-sm">
        <h5>USERS LIST</h5>
        <p><Link to='/users'>Users List</Link></p>
      </div>
    </div>
  </div>
</div>
  )
}
