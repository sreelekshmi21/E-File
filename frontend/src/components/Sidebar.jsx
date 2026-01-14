import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {

  const { logout, user } = useAuth();

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
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-2 ${isActive ? "active-link" : ""}`
              }
            >
              <i className="bi bi-speedometer2"></i>
              Dashboard
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/fileinbox"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-2 ${isActive ? "active-link" : ""}`
              }
            >
              <i className="bi bi-inbox"></i>
              Inbox
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/createfile"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-2 ${isActive ? "active-link" : ""}`
              }
            >
              <i className="bi bi-file-earmark"></i>
              Create File
            </NavLink>
          </li>
          <li className="nav-item">
            {user?.user?.role_id == 1 && <NavLink
              to="/adminpanel"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-2 ${isActive ? "active-link" : ""}`
              }
            >
              <i className="bi bi-shield-lock"></i>
              Admin Panel
            </NavLink>}
          </li>
          <li className="nav-item">
            <button
              className="nav-link btn btn-link w-100 text-start d-flex align-items-center gap-2"
              style={{
                // padding: '0.5rem 3rem',
                color: '#0d6efd',
                textDecoration: 'none',
              }}
              onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i>
              LogOut
            </button>
          </li>
        </ul>
      </div>
    </>
  )
}
