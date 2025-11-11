import React, { useEffect, useState } from 'react'
import Profile from './Profile'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext';
import { getAttachments, hasPermission } from '../utils/dbProvider';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RedList() {

    const [redList, setRedList] = useState([])

    const BASE_URL = import.meta.env.VITE_API_URL 

     const { user } = useAuth();

     const [search, setSearch] = useState("");

     const navigate = useNavigate()

      const fetchRedList = async () =>{ 
        const res = await fetch(`${BASE_URL}/api/files/redlist`)
        const data = await res.json()
        setRedList(data);
      }
    
    
      useEffect(() => {
       fetchRedList()
    },[])
  
  
    const handleViewClick = async (fileToEdit) =>{    
      if (!fileToEdit) {
        console.error('File not found for editing');
        return;
      }
      const data = await getAttachments(fileToEdit?.id)
    
      navigate('/createfile', { state: {fileToEdit, data, viewMode: true} });
    }



    



async function handleResetTimer(fileId) {
  try {
    const res = await fetch(`${BASE_URL}/api/files/${fileId}/reset-expiry`, {
      method: "PUT",
    });

    const data = await res.json();
    // console.log('handleResetTimer',data)

    toast.info("⏱️ Timer reset successfully", { theme: "colored" });

    // Optional: Refresh the file list so the new expiry reflects
    // fetchFiles();
     await fetchRedList();
  } catch (error) {
    console.error("Error resetting timer:", error);
    toast.error("Failed to reset timer");
  }
}


  return (
    <>
     <div className="container mt-5">
            <div className="row">              
                  <Sidebar />              
       <div className="col-md-9">        
       <div className="card shadow-lg">
         <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
           <h4 className="mb-0">📑 RED LIST FILES</h4>           
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
                 <th scope="col">Date Added</th>
                 {/* <th scope="col">InwardNum</th> */}
                  {/* <th scope="col">OutwardNum</th> */}
                   <th scope="col">Live File Location</th>
                    {/* <th scope="col">Remarks</th> */}
                 <th scope="col">Status</th>
                 <th></th>
                 {/* {user?.user?.role_id == 1 && <th scope="col">Action</th>} */}
               </tr>
             </thead>
             <tbody id="fileTableBody">
                  {redList.map((file, index) => {
           let badgeClass = "bg-secondary";
          
           if (file.status === "expired") badgeClass = "bg-danger";        
     
           return (
             <tr key={file?.id}>
               <td>{index + 1}</td>
               <td onClick={() => handleViewClick(file)} style={{ cursor: 'pointer' }} className={new Date(file?.date_added).toDateString() === new Date().toDateString() ? "highlight-today" : ""}>{file?.file_id}</td>
               <td>{file?.file_subject}</td>
               <td>
                   {new Date(file?.date_added).toLocaleString()}
               </td>
               <td>{file?.receiver}</td>
               <td>
                 <span className={`badge ${badgeClass}`}>
                   {file?.status}              
                 </span>
               </td>
               
               {hasPermission('delete') && <td>
                <button
                   className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteClick(file?.id)}>
                   Delete
                 </button>
               </td>}   
               <td><button onClick={() => handleResetTimer(file.id)}>
                🔄 Reset Timer </button></td>            
             </tr>
           );
         })}
          {redList.length === 0 && (
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
       <Profile user={user}/>
    </div>       
     </div>   
      <ToastContainer />
    </>
    
  )
}
