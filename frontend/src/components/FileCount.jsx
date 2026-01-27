import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';

export default function FileCount() {

  const BASE_URL = import.meta.env.VITE_API_URL;
  const [deptStats, setDeptStats] = useState([])

  const navigate = useNavigate();


  useEffect(() => {
    const fetchDeptStats = async () => {
      const res = await fetch(`${BASE_URL}/api/admin/dept-stats`)
      const data = await res.json()
      console.log('dat', data)
      setDeptStats(data)
    }
    fetchDeptStats()
  }, []);

  const openDepartmentInbox = (dept) => {
    navigate(`/fileinbox?department=${encodeURIComponent(dept)}`);
  };

  return (
    //     <table className="table table-bordered table-hover">
    //   <thead className="bg-light">
    //     <tr>
    //       <th>Department</th>
    //       <th>Created</th>
    //       <th>Received</th>
    //       <th>Expired</th>
    //     </tr>
    //   </thead>
    //   <tbody>
    //     {deptStats.map((d, i) => (
    //       <tr key={i}>
    //         <td>{d.department}</td>
    //         <td>{d.createdCount}</td>
    //         <td>{d.receivedCount}</td>
    //         <td>{d.expiredCount}</td>
    //       </tr>
    //     ))}
    //   </tbody>
    // </table>
    <>
      <div><Link to='/adminpanel'>Back to Admin Panel</Link></div>
      <div className="card-body">
        <table className="table table-striped table-hover table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th scope="col">Department</th>
              <th scope="col">Created Count</th>
              <th scope="col">Received Count</th>
              <th scope="col">Expired Count</th>
            </tr>
          </thead>
          <tbody id="fileTableBody">
            {deptStats.map((file, index) => {
              return (
                <tr key={index} style={{ cursor: "pointer" }}
                  onClick={() => openDepartmentInbox(file.department)}>
                  {/* <td>{index + 1}</td> */}
                  {/* <td onClick={() => handleViewClick(file)} style={{ cursor: 'pointer' }} className={new Date(file?.date_added).toDateString() === new Date().toDateString() ? "highlight-today" : ""}>{file?.file_id}</td> */}
                  <td>{file?.department}</td>
                  <td>
                    {file?.createdCount}
                  </td>
                  <td>{file?.receivedCount}</td>
                  <td>
                    {file?.expiredCount}
                  </td>
                </tr>
              );
            })}
            {deptStats.length === 0 && (
              <tr>
                <td colSpan="11" className="text-center text-muted">
                  No files found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
