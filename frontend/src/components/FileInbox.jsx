import React, { useEffect, useState } from 'react'
import DeleteModal from './DeleteModal';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { getAttachments } from '../utils/dbProvider';

export default function FileInbox() {

      const [files, setFiles] = useState([]);
      const [showModal, setShowModal] = useState(false);
      const [fileToDelete, setFileToDelete] = useState(null);
      const [search, setSearch] = useState("");

      const navigate = useNavigate()

     const { showToast } = useToast();

    async function loadFiles() {
    try {
      const response = await fetch("http://localhost:5000/api/files");
      const data = await response.json();
      console.log('data============',data)
        setFiles(data);
    } catch (err) {
      console.error("Error loading files:", err);
    }
  }

  useEffect(() => {
    loadFiles()
   
  }, [])
  

  const confirmDelete = async () =>{
    console.log('delete confirm=====================')
    try {
      const response = await fetch(`http://localhost:5000/api/files/${fileToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // alert("File deleted successfully!");
        showToast("File deleted successfully!", '', "success");
        // TODO: refresh table or remove row from state
      } else {
        const error = await response.json();
        alert("Error: " + error.error);
      }
    } catch (err) {
      console.error("Error deleting file:", err);
    }
    setShowModal(false);
    setFileToDelete(null);
    setFiles(files.filter(file => file.id !== fileToDelete));
  }
  
  const handleDeleteClick = (id) => {
    console.log('handleDeleteClick id',id)
    setFileToDelete(id);
    setShowModal(true);
  };



  const filteredFiles = files.filter((file) =>
    Object.values(file).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );


  // const getAttachments = async (fileId) =>{
  //   try {
  //   const response = await fetch(`http://localhost:5000/api/attachments?file_id=${fileId}`);
  //   const data = await response.json();

  //   console.log('Attachments=========================:', data);

  //   return data
  //   // ✅ Set the file data and attachments to state
  //   // setFormData(fileToEdit);        // If you have a state for form fields
  //   // setAttachments(data);           // Assuming you have useState for attachments

  //   // ✅ Optional: Navigate or open the form section if needed
  //   // navigate('/createfile', { state: {fileToEdit, data} }); // Only if using react-router
  // } catch (error) {
  //   console.error('Failed to load attachments:', error);
  // }
  // }


  const handleEditClick = async (fileToEdit) => {
  // 1. Find the file to edit
  // const fileToEdit = filteredFiles.find((task) => task.id === id);
  console.log('fileToEdit:', fileToEdit, fileToEdit?.id);

  if (!fileToEdit) {
    console.error('File not found for editing');
    return;
  }

  const data = await getAttachments(fileToEdit?.id)

  navigate('/createfile', { state: {fileToEdit, data, viewMode: false} });

  // 2. Fetch attachments related to this file
  // try {
  //   const response = await fetch(`http://localhost:5000/api/attachments?file_id=${fileToEdit.id}`);
  //   const data = await response.json();

  //   console.log('Attachments=========================:', data);

  //   // ✅ Set the file data and attachments to state
  //   // setFormData(fileToEdit);        // If you have a state for form fields
  //   // setAttachments(data);           // Assuming you have useState for attachments

  //   // ✅ Optional: Navigate or open the form section if needed
  //   navigate('/createfile', { state: {fileToEdit, data} }); // Only if using react-router
  // } catch (error) {
  //   console.error('Failed to load attachments:', error);
  // }
};

const handleViewClick = async (fileToEdit) =>{
  // const fileToEdit = filteredFiles.find((task) => task.id === id);
  console.log('fileToEdit:', fileToEdit, fileToEdit?.id);

  if (!fileToEdit) {
    console.error('File not found for editing');
    return;
  }
  const data = await getAttachments(fileToEdit?.id)

  navigate('/createfile', { state: {fileToEdit, data, viewMode: true} });
}







  return (
    <>
    <div className="container mt-5">
       <div className="row">
         
             <Sidebar />
         
  <div className="col-md-10">        
  <div className="card shadow-lg">
    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
      <h4 className="mb-0">📑 File Register</h4>
       <input
            type="text"
            className="form-control w-25"
            placeholder="🔍 Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
    </div>
    <div className="card-body">
      <table className="table table-striped table-hover table-bordered align-middle">
        <thead className="table-dark">
          <tr>
            <th scope="col">#</th>
            <th scope="col">No.</th>
            <th scope="col">File No.</th>
            <th scope="col">File Subject</th>
            <th scope="col">Date Added</th>
            {/* <th scope="col">InwardNum</th> */}
             {/* <th scope="col">OutwardNum</th> */}
              <th scope="col">Live File Location</th>
               <th scope="col">Remarks</th>
            <th scope="col">Status</th>
            {/* <th scope="col">Action</th> */}
          </tr>
        </thead>
        <tbody id="fileTableBody">
             {filteredFiles.map((file, index) => {
      let badgeClass = "bg-secondary";
      if (file.status === "Approved") badgeClass = "bg-success";
      if (file.status === "Pending") badgeClass = "bg-warning text-dark";
      if (file.status === "Rejected") badgeClass = "bg-danger";

      return (
        <tr key={file?.id} onClick={() => handleViewClick(file)} style={{ cursor: 'pointer' }}>
          <td>{index + 1}</td>
          <td>{file?.file_id}</td>
          <td>{file?.file_name}</td>
          <td>{file?.file_subject}</td>
          {/* <td>{file.date_added}</td> */}
          <td>{new Date(file?.date_added).toLocaleString()}</td>
          {/* <td>{file.inwardnum}</td> */}
          {/* <td>{file.outwardnum}</td> */}
          <td>{file?.current_status}</td>
          <td>{file?.remarks}</td>
          <td>
            <span className={`badge ${badgeClass}`}>
              {file?.status}
            </span>
          </td>
          {/* <td>
            <button 
            className="btn btn-sm btn-primary"
            onClick={() => handleViewClick(file?.id)}>View</button>
            <button className="btn btn-sm btn-warning mx-1"
                    onClick={() => handleEditClick(file?.id)}
            >Edit</button>
            <button
              className="btn btn-sm btn-danger"
               onClick={() => handleDeleteClick(file?.id)}>
              Delete
            </button>
          </td> */}
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
  </div>
</div>
    {showModal && <DeleteModal showModal={showModal} setShowModal={setShowModal} confirmDelete={confirmDelete}/>}
    </>
  )
}
