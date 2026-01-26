import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {

  const { logout, user } = useAuth();

  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/');
    logout();
  };

  const handleNavClick = () => {
    // Close mobile sidebar when a nav link is clicked
    if (onClose) {
      onClose();
    }
  };

  const navContent = (
    <ul className="nav flex-column">
      <li className="nav-item">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `nav-link d-flex align-items-center gap-2 ${isActive ? "active-link" : ""}`
          }
          onClick={handleNavClick}
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
          onClick={handleNavClick}
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
          onClick={handleNavClick}
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
          onClick={handleNavClick}
        >
          <i className="bi bi-shield-lock"></i>
          Admin Panel
        </NavLink>}
      </li>
      <li className="nav-item">
        <a
          href={`${import.meta.env.VITE_API_URL}/uploads/File Movement Pdf.pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="nav-link sidebar-link"
        >
          <i className="bi bi-file-earmark"></i>
          File Movement PDF
        </a>
      </li>
      <li className="nav-item">
        <button
          className="nav-link btn btn-link w-100 text-start d-flex align-items-center gap-2"
          style={{
            color: '#0d6efd',
            textDecoration: 'none',
          }}
          onClick={() => {
            handleLogout();
            handleNavClick();
          }}>
          <i className="bi bi-box-arrow-right"></i>
          LogOut
        </button>
      </li>
    </ul>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="col-12 col-md-2 sidebar p-3 d-none d-md-block">
        {navContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      ></div>

      {/* Mobile Sidebar */}
      <div className={`sidebar-mobile ${isOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={onClose} aria-label="Close menu">
          <i className="bi bi-x"></i>
        </button>
        <div className="p-3 mt-4">
          {navContent}
        </div>
      </div>
    </>
  )
}

