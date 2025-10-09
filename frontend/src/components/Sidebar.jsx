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
      <h4 className="mb-4">Navigation</h4>
      <ul className="nav flex-column">
        <li className="nav-item">
          {/* <a className="nav-link active" href="#">Dashboard</a> */}
          <Link className="nav-link" to='/dashboard'>Dashboard</Link>
        </li>
        <li className="nav-item">
          {/* <a className="nav-link" href="#">Create File</a> */}
        </li>
        <li className="nav-item">
          {/* <a className="nav-link" href="#">Inbox</a> */}
          <Link className="nav-link" to='/fileinbox'>Inbox</Link>
        </li>
        <li className="nav-item">
          {/* <a className="nav-link" href="#">Reports</a> */}
           {/* <Link className="nav-link" to='/'>LogOut</Link> */}
            <button className="nav-link btn btn-link" onClick={handleLogout}>
                       LogOut
            </button>
        </li>
        {/* Add more links as needed */}
      </ul>
    </div>
    </>
  )
}
