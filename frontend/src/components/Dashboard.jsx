import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useEffect } from 'react';

export default function Dashboard() {

    const navigate = useNavigate();

    const handleCreateFile = () => {
    // You can open a modal or navigate to a create file page
      navigate("/createfile");
  };

  

  return (
    // <div className="container my-4">
    //   {/* <h2 className="mb-4">Dashboard</h2> */}
    //   <div className="d-flex justify-content-between align-items-center mb-4">
    //     <h2>Dashboard</h2>
    //     <button className="btn btn-primary" onClick={handleCreateFile}>
    //       + Create File
    //     </button>
    //   </div>

    //   <div className="row">
    //     {/* Card 1 */}
    //     <div className="col-md-3">
    //       <div className="card text-white bg-primary mb-3 shadow">
    //         <div className="card-body">
    //           <h5 className="card-title">Files Sent by me</h5>
    //           <p className="card-text display-6">12</p>
    //         </div>
    //       </div>
    //     </div>

    //     {/* Card 2 */}
    //     <div className="col-md-3">
    //       <div className="card text-white bg-success mb-3 shadow">
    //         <div className="card-body">
    //           <h5 className="card-title">Files Processed</h5>
    //           <p className="card-text display-6">350</p>
    //         </div>
    //       </div>
    //     </div>

    //     {/* Card 3 */}
    //     <div className="col-md-3">
    //       <div className="card text-white bg-warning mb-3 shadow">
    //         <div className="card-body">
    //           <h5 className="card-title">Pending Files</h5>
    //           <p className="card-text display-6">18</p>
    //         </div>
    //       </div>
    //     </div>

    //     {/* Card 4 */}
    //     <div className="col-md-3">
    //       <div className="card text-white bg-secondary mb-3 shadow">
    //         <div className="card-body">
    //           <h5 className="card-title">Files Received Today</h5>
    //           <p className="card-text display-6">5</p>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div className="container-fluid my-4">
  <div className="row">
    {/* 👉 Sidebar */}
      <Sidebar />

    {/* 👉 Main Dashboard Content */}
    <div className="col-md-9">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard</h2>
        <button className="btn btn-primary" onClick={handleCreateFile}>
          + Create File
        </button>
      </div>

      <div className="row">
        {/* Card 1 */}
        <div className="col-md-3">
          <div className="card text-white bg-primary mb-3 shadow">
            <div className="card-body">
              <h5 className="card-title">Files Sent by me</h5>
              <p className="card-text display-6">12</p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="col-md-3">
          <div className="card text-white bg-success mb-3 shadow">
            <div className="card-body">
              <h5 className="card-title">Files Processed</h5>
              <p className="card-text display-6">350</p>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="col-md-3">
          <div className="card text-white bg-warning mb-3 shadow">
            <div className="card-body">
              <h5 className="card-title">Pending Files</h5>
              <p className="card-text display-6">18</p>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="col-md-3">
          <div className="card text-white bg-secondary mb-3 shadow">
            <div className="card-body">
              <h5 className="card-title">Files Received Today</h5>
              <p className="card-text display-6">5</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  )
}
