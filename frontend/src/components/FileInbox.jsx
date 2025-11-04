import React, { useEffect, useRef, useState } from 'react'
import DeleteModal from './DeleteModal';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { getAttachments } from '../utils/dbProvider';
import Select from 'react-select';
import { useAuth } from '../context/AuthContext';
import Profile from './Profile';


export default function FileInbox() {

      const [files, setFiles] = useState([]);
      const [showModal, setShowModal] = useState(false);
      const [fileToDelete, setFileToDelete] = useState(null);
      const [search, setSearch] = useState("");

      const { user } = useAuth();

      const [currentPage, setCurrentPage] = useState(1);
       const [totalPages, setTotalPages] = useState(1);

      const [departments, setDepartments] = useState([])
      const [selectedDepartment, setSelectedDepartment] = useState(null);
      const [selectedDivision, setSelectedDivision] = useState(null);
      const [divisions, setDivisions] = useState([]);

       const [units, setUnits] = useState([]);

      const [selectedUnit, setSelectedUnit] = useState('');

      const [approvalStatus, setApprovalStatus] = useState('');
	  const [appliedFilters, setAppliedFilters] = useState({ department: '', division: '', unit: '', status: '' });
      const [newFilesCount, setNewFilesCount] = useState(0);
      const [showNewFilesAlert, setShowNewFilesAlert] = useState(false);
      const latestReceivedAtRef = useRef(0);
      const suppressNextAlertRef = useRef(false);

      const navigate = useNavigate()

     const handleApprovalStatusChange = (e) => {
    setApprovalStatus(e.target.value);
  };

  //   async function loadFiles(departmentId) {
  //   try {
  //     const response = await fetch(`http://localhost:5000/api/files?status=${approvalStatus}&department=${departmentId}`);
  //     const data = await response.json();
  //     console.log('data============',data)
  //       setFiles(data);
  //   } catch (err) {
  //     console.error("Error loading files:", err);
  //   }
  // }
 async function loadFiles(departmentId, division = '', unit = '', status = '') {
  try {
    const params = new URLSearchParams();
    if (departmentId) params.append('department', departmentId);
     if (division) params.append('division', division);
     if (unit) params.append('unit', unit);
    if (status) params.append('status', status);

    console.log("API Request Params:", params.toString());

    const response = await fetch(`http://localhost:5000/api/files?${params.toString()}&userId=${user?.user?.id}`);
    const data = await response.json();
    console.log('Fetched data:', data);
    setFiles(data);
    return data;
  } catch (err) {
    console.error("Error loading files:", err);
    throw err;
  }
}

  useEffect(() => {
    const getDepartments = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/departments');
        const data = await response.json(); // ✅ parse response as JSON
        console.log('departments:', data);
        const options = data.map((dept) => ({
          value: dept.code,
          label: `${dept.dept_name} (${dept.code})`,
          id: dept?.id
        }));
        console.log('options:',options)
        setDepartments(options); // ✅ now set actual department data
        // Preselect user's department if available
        const userDeptCode = user?.user?.department;
        if (userDeptCode) {
          const userDeptOption = options.find(o => o.value === userDeptCode) || null;
          setSelectedDepartment(userDeptOption);
          setAppliedFilters({ department: userDeptCode, division: '', unit: '', status: '' });
        }
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    };
  
    getDepartments();
    // const user = JSON.parse(localStorage.getItem("user")); 
    //   console.log('LC',user)
    //   const departmentId = user?.department
    //   console.log('LC',departmentId)
    console.log('user',user)
    const departmentId = user?.user?.department
      if (departmentId) {
    loadFiles(departmentId);
  }
       
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
  // const today = new Date();
  // const filteredFiles = filteredFiless.filter(file => {
  //           const fileDate = new Date(file.date);
  //           return fileDate.toDateString() === today.toDateString();
  //       });


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


const handleFilterByDept = async () =>{
  // if(selectedDepartment){
  //   loadFiles(selectedDepartment?.value, selectedDivision?.value, selectedUnit?.value, approvalStatus || '');
  // }
	  const getCode = (optOrStr) => {
	  	if (!optOrStr) return '';
	  	if (typeof optOrStr === 'string') return optOrStr;
	  	return optOrStr.value || '';
	  };

	  const deptCode = getCode(selectedDepartment) || (user?.user?.department || '');
	  const divCode = getCode(selectedDivision);
	  const unitCode = getCode(selectedUnit);
  const status = approvalStatus || '';

	  console.log('[Inbox] Apply Filter with:', { department: deptCode, division: divCode, unit: unitCode, status });
  try {
    setAppliedFilters({ department: deptCode, division: divCode, unit: unitCode, status });
    // Prevent alert triggered by filter-driven dataset change
    suppressNextAlertRef.current = true;
    const result = await loadFiles(
      deptCode,
      divCode,
      unitCode,
      status
    );
  } catch (e) {
    // swallow; errors are logged in loadFiles
  }
}

const clearFilter = () =>{
	// Reset to user's department option; clear division/unit/status
	const userDeptCode = user?.user?.department || '';
	const deptOption = departments.find(d => d.value === userDeptCode) || null;
	setSelectedDepartment(deptOption);
	setSelectedDivision(null);
	setSelectedUnit(null);
	setApprovalStatus('');
	setAppliedFilters({ department: userDeptCode || '', division: '', unit: '', status: '' });
	// Prevent alert triggered by filter-driven dataset change
	suppressNextAlertRef.current = true;
	loadFiles(userDeptCode || '', '', '', '');
}



useEffect(() => {
  const fetchDivisions = async () => {
    if (!selectedDepartment) {
      setDivisions([]);
      return;
    }

    console.log('selDept',selectedDepartment,selectedDepartment?.code)
    // try {
    //   const res = await fetch(`http://localhost:5000/api/divisions/${selectedDepartment?.value}`);
    //   const data = await res.json();
    //   setDivisions(data);
    // } catch (error) {
    //   console.error('Failed to fetch divisions:', error);
    //   setDivisions([]);
    // }
    try {
      const res = await fetch(`http://localhost:5000/api/departments/${selectedDepartment?.id}/divisions`);
      const data = await res.json();
       const options = data.map((div) => ({
          value: div?.code,
          label: `${div?.name} (${div?.code})`,
          id: div?.id
        }));
        console.log('dsivisions',options)
      setDivisions(options);
      setSelectedDivision(null)
    } catch (error) {
      console.error('Failed to fetch divisions:', error);
      setDivisions([]);
    }
  };

  fetchDivisions();
}, [selectedDepartment?.id]);



useEffect(() => {
  const fetchUnits = async () => {
    if (!selectedDivision) {
      setUnits([]);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/divisions/${selectedDivision?.id}/units`);
      const data = await res.json();
      console.log('dat',data)
       const options = data.map((div) => ({
          value: div?.code,
          label: `${div?.name} (${div?.code})`,
          id: div?.id
        }));
      setUnits(options);
      setSelectedUnit(null)
    } catch (error) {
      console.error('Failed to fetch Units:', error);
      setUnits([]);
    }
  };

  fetchUnits();
}, [selectedDivision?.id]);


const isOverdue = (receivedAt) => {
  const now = new Date();             // current time
  const received = new Date(receivedAt); // time when file was received
  const hoursPassed = (now - received) / (1000 * 60 * 60); // milliseconds → hours
  return hoursPassed > 48;            // true if more than 48 hours old
};



const isNew = (receivedAt) => {
  const diffHours = (new Date() - new Date(receivedAt)) / (1000 * 60 * 60);
  return diffHours <= 24; // within last 24 hours
};


const markAsRead = async (id) => {
  try {
    const response = await fetch(`http://localhost:5000/api/files/${id}/read`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Optional: you can read the returned JSON if needed
    // const data = await response.json();

    // Update state locally
    setFiles(files.map(f => f.id === id ? { ...f, is_read: 1 } : f));

  } catch (err) {
    console.error("Error marking as read:", err);
  }
};


  return (
    <>
    <div className="container mt-5">
       <div className="row">
         
             <Sidebar />
         
  <div className="col-md-9">        
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
        {showNewFilesAlert && (
          <div className="alert alert-info m-0 rounded-0" role="alert">
            {newFilesCount} new files received
          </div>
        )}
    <div>
            <Select
        options={departments}
        value={selectedDepartment}
        onChange={(selectedOption) => setSelectedDepartment(selectedOption)}
        isSearchable={true}
        placeholder="Search or Select Department"
      /> 

     {/* <select
              value={selectedDepartment || ''}
             onChange={(e) => {
   
    setSelectedDepartment(e.target.value);
  }}
               required
               id="department"
               name="department"
               >
  <option value="">-- Select Department --</option>
  {departments.map((dept) => (
    <option key={dept?.id} value={dept?.code}>
      {dept?.dept_name} ({dept?.code})
    </option>
  ))}
</select> */}
{/* <div className="col-md-6 d-flex align-items-center gap-2">
          <label className="form-label mb-0" htmlFor="division">Divisions</label> */}
          {/* <select
              value={selectedDivision}
             onChange={(e) => setSelectedDivision(e.target.value)}
               required
               id="division"
               name="division"
              //  disabled={viewMode}
          >
 
   <option value="">-- Select Division --</option>
  {divisions.map((division, idx) => (
    <option key={idx} value={division?.code}>
      {division?.name} ({division?.code})
    </option>
  ))}
</select> */}
<br />
<Select
        options={divisions}   
        value={selectedDivision}
        onChange={(selectedOption) => setSelectedDivision(selectedOption)}
        isSearchable={true}
        placeholder="Division"
      /> 
      <br />
      <Select
        options={units}
        value={selectedUnit}
        onChange={(selectedOption) => setSelectedUnit(selectedOption)}
        isSearchable={true}
        placeholder="Unit"
      /> 
      <br />
{/* <select
              value={selectedUnit}
             onChange={(e) => setSelectedUnit(e.target.value)}
               required
               id="unit"        
               name="unit"
              //  disabled={viewMode}
          >
 
   <option value="">-- Select Unit --</option>
  {units.map((unit, idx) => (
    <option key={idx} value={unit.code}>
      {unit.name} ({unit.code})
    </option>
  ))}
</select> */}
        {/* </div> */}
<select id="approvalStatus" name="approvalStatus" 
           value={approvalStatus} onChange={handleApprovalStatusChange}
           required 
          //  disabled={user?.user?.role == 'viewer' || viewMode}
          >
          <option value="">-- Select Status --</option>
          <option value="approved">✅ Approved</option>
          <option value="rejected">❌ Rejected</option>
          <option value="pending">⏳ Pending</option>
        </select>
        <div className="d-flex">
<button className="btn btn-primary ms-auto" onClick={handleFilterByDept}>Apply Filter</button>
<button className="btn btn-secondary ms-2" onClick={clearFilter}>Clear Filter</button>
</div>
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
            {user?.user?.role == 'admin' && <th scope="col">Action</th>}
          </tr>
        </thead>
        <tbody id="fileTableBody">
             {filteredFiles.map((file, index) => {
      let badgeClass = "bg-secondary";
      if (file.status === "approved") badgeClass = "bg-success";
      if (file.status === "pending") badgeClass = "bg-warning text-dark";
      if (file.status === "rejected") badgeClass = "bg-danger";

      return (
        <tr key={file?.id} onClick={() => markAsRead(file.id)} className={`${!file.is_read ? "bg-yellow-100 font-semibold" : ""}`}>
          <td>{index + 1}</td>
          <td onClick={() => handleViewClick(file)} style={{ cursor: 'pointer' }} className={new Date(file?.date_added).toDateString() === new Date().toDateString() ? "highlight-today" : ""}>{file?.file_id}</td>
          {/* <td>{file?.file_name}</td> */}
          <td>{file?.file_subject}</td>
          {/* <td>{file.date_added}</td> */} 
          {/* <td>{new Date(file?.date_added).toLocaleString()}</td> */}
          <td>
              {new Date(file?.date_added).toLocaleString()}
          </td>
          {/* <td>{file.inwardnum}</td> */}
          {/* <td>{file.outwardnum}</td> */}
          {console.log('rec===',file?.receiver)}
          <td>{file?.receiver}</td>
          {/* <td>{file?.remarks}</td> */}
          <td>
            <span className={`badge ${badgeClass}`}>
              {file?.status}              
            </span>
          </td>
          <td>{file?.status !== 'approved' && isOverdue(file.date_added) && <span style={{ color: "red" }}>🚩</span>}</td>
          {user?.user?.role == 'admin' && <td>
            {/* <button 
            className="btn btn-sm btn-primary"
            onClick={() => handleViewClick(file?.id)}>View</button>
            <button className="btn btn-sm btn-warning mx-1"
                    onClick={() => handleEditClick(file?.id)}
            >Edit</button> */}
            <button
              className="btn btn-sm btn-danger"
               onClick={() => handleDeleteClick(file?.id)}>
              Delete
            </button>
          </td>}
          <td>
              {!file.is_read && (
                <span className="text-red-600 font-bold animate-pulse" style={{backgroundColor: 'yellow'}}>
                  NEW
                </span>
              )}
            </td>
            {/* <td>{isNew(file.date_added) && <span className="text-blue-600 font-bold">NEW</span>}</td> */}
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
  <Profile user={user}/>
  {/* <div className="col-md-3">
      ZZZZZZZZZZZZZZZ
  </div> */}
  </div>
  {/* <div className="pagination">
  <button
    onClick={() => loadFiles({
      department: selectedDepartment,
      division: selectedDivision,
      status: approvalStatus,
      page: currentPage - 1
    })}
    disabled={currentPage === 1}
  >
    Previous
  </button>

  <span>Page {currentPage} of {totalPages}</span>

  <button
    onClick={() => loadFiles({
      department: selectedDepartment,
      division: selectedDivision,
      status: approvalStatus,
      page: currentPage + 1
    })}
    disabled={currentPage === totalPages}
  >
    Next
  </button>
</div> */}
</div>
    {showModal && <DeleteModal showModal={showModal} setShowModal={setShowModal} confirmDelete={confirmDelete}/>}
    </>
  )
}
