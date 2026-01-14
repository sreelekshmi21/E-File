import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import Profile from './Profile';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCurrentTime } from '../hooks/useCurrentTime';


export default function HighPriorityList() {

  const { user } = useAuth();

  const BASE_URL = import.meta.env.VITE_API_URL

  const currentTime = useCurrentTime("en-US");

  const [search, setSearch] = useState("");

  const [highPriorityList, setHighPriorityList] = useState([])

  const fetchHighPriorityList = async () => {
    const response = await fetch(`${BASE_URL}/api/admin/priority-requests`);
    const data = await response.json();
    console.log('data', data);
    setHighPriorityList(data)
  }

  useEffect(() => {
    fetchHighPriorityList()
  }, [])

  const filteredFiles = highPriorityList.filter((file) =>
    Object.values(file).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );



  const approveRequest = async (requestId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/admin/priority-requests/${requestId}/approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);  // "High priority request approved"
        // Refresh table
        fetchHighPriorityList();
      } else {
        toast.error(data.error || "Something went wrong");
      }

    } catch (error) {
      console.error("Approve error:", error);
      showToast("Network error", "", "error");
    }
  };


  const rejectRequest = async (requestId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/admin/priority-requests/${requestId}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);  // e.g., "High priority request rejected."
        fetchHighPriorityList();  // Refresh the table
      } else {
        toast.error(data.error || "Failed to reject request");
      }
    } catch (error) {
      console.error("Reject error:", error);
      toast.info("Network error while rejecting request", { theme: 'colored' });
    }
  };



  return (
    <>
      <div className="container-fluid mt-5">
        <div className="row">
          <Sidebar />
          <div className="col-md-10">
            <div className="card shadow-lg">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h4 className="mb-0">📑 HIGH PRIORITY FILES</h4>
                <h4>Logged in as {user?.user?.username} | {currentTime}</h4>
                <input
                  type="text"
                  className="form-control w-25"
                  placeholder="🔍 Search files..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div>
              </div>
              <div className="card-body">
                <table className="table table-striped table-hover table-bordered align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col">#</th>
                      {/* <th scope="col">No.</th> */}
                      <th scope="col">File No.</th>
                      <th scope="col">File Subject</th>
                      <th scope="col">Requested On</th>
                      <th scope="col">Requested By</th>
                      <th scope="col">Requested Dept</th>

                      {/* <th scope="col">Remarks</th> */}
                      <th scope="col">Status</th>
                      <th scope="col">Action Buttons</th>
                      <th></th>
                      {/* {user?.user?.role_id == 1 && <th scope="col">Action</th>} */}
                    </tr>
                  </thead>
                  <tbody id="fileTableBody">
                    {filteredFiles.map((file, index) => {
                      let badgeClass = "bg-secondary";

                      if (file.status === "expired") badgeClass = "bg-danger";

                      return (
                        <tr key={file?.request_id}>
                          <td>{index + 1}</td>
                          <td onClick={() => handleViewClick(file)} style={{ cursor: 'pointer' }} className={new Date(file?.date_added).toDateString() === new Date().toDateString() ? "highlight-today" : ""}>{file?.fileId}</td>
                          <td>{file?.file_subject}</td>
                          <td>
                            {new Date(file?.created_at).toLocaleString()}
                          </td>
                          <td>{file?.requested_by_username}</td>
                          <td>{file?.requested_by_department}</td>
                          <td>
                            <span className={`badge ${badgeClass}`}>
                              {file?.status}
                            </span>
                          </td>
                          <td><button className="btn btn-success" onClick={() => approveRequest(file?.request_id)}>Approve</button></td>
                          <td><button className="btn btn-danger" onClick={() => rejectRequest(file?.request_id)}>Reject</button></td>

                          {/* <td><button onClick={() => handleResetTimer(file.id)}>
                    🔄 Reset Timer </button></td>             */}
                        </tr>
                      );
                    })}
                    {filteredFiles.length === 0 && (
                      <tr>
                        <td colSpan="11" className="text-center text-muted">
                          No files found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* <Profile user={user}/> */}
        </div>
      </div>
      <ToastContainer />
    </>
  )
}
