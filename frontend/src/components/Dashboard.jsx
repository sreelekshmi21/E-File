import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import Profile from './Profile';
import { hasPermission } from '../utils/dbProvider';

export default function Dashboard() {

    const navigate = useNavigate();

    const { user } = useAuth();

      const [pendingFiles, setPendingFiles] = useState([]);
      const [approvedFiles, setApprovedFiles] = useState([]);
      const [rejectedFiles, setRejectedFiles] = useState([]);

      const [totalFiles, setTotalFiles] = useState([]);
      const [todayFiles, setTodayFiles] = useState([]);

    const handleCreateFile = () => {
    // You can open a modal or navigate to a create file page
      navigate("/createfile");
  };

  async function loadTodaysFiles(departmentId) {
      console.log('today',departmentId)
      try {
        const response = await fetch(`http://localhost:5000/api/files/today?department=${departmentId}`);
        const data = await response.json();
        console.log('DATA===',data)
        setTodayFiles(data)
         
   
          // setFiles(data);
      } catch (err) {
        console.error("Error loading files:", err);
      }
    }

  async function loadPendingFiles(departmentId) {
      try {
        const response = await fetch(`http://localhost:5000/api/files?status=pending,approved,rejected&department=${departmentId}`);
        const data = await response.json();
        console.log('DATA',data)
         
         setPendingFiles(data.filter(file => file.status.toLowerCase() === 'pending'));
      setApprovedFiles(data.filter(file => file.status.toLowerCase() === 'approved'));
      setRejectedFiles(data.filter(file => file.status.toLowerCase() === 'rejected'));

        setTotalFiles(data)
          // setFiles(data);
      } catch (err) {
        console.error("Error loading files:", err);
      }
    }
  
    useEffect(() => {
      // const userInfo = JSON.parse(localStorage.getItem("user")); 
      // console.log('USER LC',userInfo)
      // const departmentId = userInfo?.department
      // console.log('LC',departmentId)
      // console.log('USER+++',user)
      const departmentId = user?.user?.department
      if (departmentId) {
    loadPendingFiles(departmentId);
    loadTodaysFiles(departmentId)
  }
      
     
    }, [])

  // Auto-refresh counts periodically so pending count updates when new files arrive
  useEffect(() => {
    const departmentId = user?.user?.department;
    if (!departmentId) return;

    let cancelled = false;

    const refresh = async () => {
      if (cancelled) return;
      try {
        await loadPendingFiles(departmentId);
        await loadTodaysFiles(departmentId);
      } catch (e) {
        // errors already logged inside loaders
      }
    };

    // Run immediately and then on interval
    refresh();
    const interval = setInterval(refresh, 10000); // 10s

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user?.user?.department]);
    
  console.log('USER',user)

  
  return (
   <div className="container-fluid my-4">
  <div className="row">
    {/* 👉 Sidebar */}
      <Sidebar />
          
    {/* 👉 Main Dashboard Content */}
    <div className="col-md-9">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{fontSize: '27px'}}>Santhigiri Foundation</h2>
        {(hasPermission('create')) && <button className="btn btn-primary" onClick={handleCreateFile}>
          + Create File
        </button>}
      </div>
      {/* <div>
        <h3>Santhigiri Foundation</h3>
      </div> */}
      <div className="row">
        {/* Card 1 */}
        <div className="col-md-3">
          <div className="card text-white bg-primary mb-3 shadow">
            <div className="card-body">
              <h5 className="card-title">Total Files per Department</h5>
              <p className="card-text display-6">{totalFiles?.length}</p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="col-md-3">
          <div className="card text-white bg-success mb-3 shadow">
            <div className="card-body">
              <h5 className="card-title">Approved Files</h5>
              <p className="card-text display-6">{approvedFiles?.length}</p>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="col-md-3">
          <div className="card text-white bg-warning mb-3 shadow">
            <div className="card-body">
              <h5 className="card-title">Pending Files</h5>
              <p className="card-text display-6">{pendingFiles?.length}</p>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="col-md-3">
          <div className="card text-white bg-secondary mb-3 shadow">
            <div className="card-body">
              <h5 className="card-title">Files Received Today</h5>
              <p className="card-text display-6">{todayFiles?.length}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-danger mb-3 shadow">
            <div className="card-body">
              <h5 className="card-title">Rejected Files</h5>
              <p className="card-text display-6">{rejectedFiles?.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Profile user={user}/>
  </div>
</div>
  )
}
