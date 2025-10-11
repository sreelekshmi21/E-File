import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {

  const { logout } = useAuth();

  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/');     
    logout();
  };


  return (
    <>
     <div className="col-md-2 sidebar p-3">
      {/* <h4 className="mb-4">Navigation</h4> */}
      <ul className="nav flex-column">
        <li className="nav-item">        
          <Link className="nav-link" to='/dashboard'>Dashboard</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to='/fileinbox'>Inbox</Link>
        </li>
        <li className="nav-item">
      <button
        className="nav-link btn btn-link w-100 text-start"
        style={{
          padding: '0.5rem 3rem',
          color: '#0d6efd',
          textDecoration: 'none',
        }}
        onClick={handleLogout}>
        LogOut
      </button>
    </li>
      </ul>
    </div>
    </>
  )
}
