import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import DocumentEditor from './DocumentEditor';
import { useToast } from '../context/ToastContext';
import Sidebar from './Sidebar';
import { getAttachments } from '../utils/dbProvider';
import { useAuth } from '../context/AuthContext';
import Select from 'react-select';
import RemarksEditor from './RemarksEditor';



export default function CreateFile() {

  const BASE_URL = import.meta.env.VITE_API_URL 

  const navigate = useNavigate()
  const { showToast } = useToast();

   const { user } = useAuth();

   const [fileNumber, setFileNumber] = useState("");

  const [fileId, setFileId] = useState(null)

  const [departments, setDepartments] = useState([])

   const [selectedDepartment, setSelectedDepartment] = useState(null);

   const [selectedReceiver, setSelectedReceiver] = useState(null);

   const [divisions, setDivisions] = useState([]);

   const [units, setUnits] = useState([]);
const [selectedDivision, setSelectedDivision] = useState('');

const [selectedUnit, setSelectedUnit] = useState('');

  const [fileName, setFileName] = useState('');

   const [approvalStatus, setApprovalStatus] = useState('pending');

  const [attachments, setAttachments] = useState([])

  const [formData, setFormData] = useState({
     id: null,
    file_id: "",
    file_name: "",
    file_subject: "",
    sender: '',
    receiver: '',
    inwardnum: "",
    outwardnum: "",
    remarks: "",
    current_status: '',
    date_added: ''
    // status: "Pending"
  });

    const [comments, setComments] = useState([]);

  const location = useLocation()
  const { fileToEdit, data } = location.state || {};

  const [viewMode, setViewMode] = useState(location.state?.viewMode)
  // console.log('dat',dat)

  useEffect(() => {
    function toDatetimeLocalString(utcISOString) {
  const date = new Date(utcISOString);

  const pad = (n) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
    if (fileToEdit) {
      const formattedDate = toDatetimeLocalString(fileToEdit?.date_added);
      console.log('formarted date',formattedDate)
    setFormData((prev) => ({
      ...prev,
      ...fileToEdit,
      
      date_added: formattedDate, // override with formatted date
    }));
    }
    if(data) setAttachments(data)

      setApprovalStatus(fileToEdit?.status);
      
      // setSelectedDepartment(fileToEdit?.department)
      if(fileToEdit?.department && departments.length > 0){
        console.log('dept',departments)
        const deptOption = departments.find(dept => dept.value === fileToEdit?.department)
        setSelectedDepartment(deptOption)
      }
      if(fileToEdit?.division && divisions.length > 0){
        const divOption = divisions.find(div => div.value === fileToEdit?.division)
        setSelectedDivision(divOption)
      }

      if(fileToEdit?.unit && units.length > 0){
        const unitOption = units.find(u => u.value === fileToEdit?.unit)
        setSelectedUnit(unitOption)
      }
      if(fileToEdit?.receiver && departments.length > 0){
        const deptOption = departments.find(dept => dept.value === fileToEdit?.receiver)
        setSelectedReceiver(deptOption)
      }
    // fetchAttachments(dat)
  }, [fileToEdit, data, viewMode, departments, divisions,units]) // only run this effect when `dat` changes

 
   const [file, setFile] = useState(null)
  const [message, setMessage] = useState("");
 const [loading, setLoading] = useState(false);


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
      setDepartments(options); // ✅ now set actual department data
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  getDepartments();

  // Fetch preview of next file number for new files (not when editing)
  if (!fileToEdit?.id) {
    const fetchNextFileNumber = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/next-file-number");
        const data = await response.json();
        setFileNumber(data?.fileNumber);
      } catch (err) {
        console.error("Error fetching next file number:", err);
      }
    };

    fetchNextFileNumber();
  }
}, [fileToEdit?.id]);
 



   const handleChange = (e) => {
    // if (e.target.name == 'date_added'){
      // console.log('date added',e.target.value)
      // const dateToSave = new Date(e.target.value + 'T00:00:00Z'); // force it to be UTC midnight
      // const dateToSave = new Date(e.target.value).toISOString();
      // const selectedDate = e.target.value;
      // const iso = new Date(selectedDate).toISOString(); // UTC: "2025-09-16T06:15:00.000Z"
      //  console.log("ISO (UTC):", iso);
//       const now = new Date();

// const hours = now.getHours();
// const minutes = now.getMinutes();
// const seconds = now.getSeconds();

// // Build a date-time string in ISO 8601 format
// const fullDateTime = new Date(`${selectedDate}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`).toISOString();

// console.log('fullDateTime',fullDateTime); // "2025-09-16T13:28:00.000Z"
      // console.log('dateToSabe',dateToSave)
    //  setFormData({ ...formData, [e.target.name]: e.target.value });
    // }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(Array.from(e.target.files));
      // const selectedFiles = Array.from(e.target.files);
      // setFile((prev) => [...prev, ...selectedFiles]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    // navigate('/fileinbox')
    const isEditing = Boolean(fileToEdit?.id);
     const formDatas  = new FormData();
    // if (!formData.file_id || !formData.file_subject || !formData.originator || !formData.file_name || !formData.file_recipient || !formData.current_status) {
    //         // alert('All fields are required.');
    //         showToast("All fields are required.", '', "danger");
    //         return;
    //     }

    // Use the preview file number for new files, or existing number for editing
    let file_no = document.getElementById('file_no').value;
    if (!isEditing) {
      // For new files, use the preview number and increment the counter
      try {
        const response = await fetch("http://localhost:5000/api/generate-file-number", {
          method: "POST"
        });
        const data = await response.json();
        file_no = data?.fileNumber;
        setFileNumber(file_no);
        
        // Generate file name after getting file number
        const generatedFileName = generateFileName();
        if (generatedFileName) {
          setFileName(generatedFileName);
        }
      } catch (err) {
        console.error("Error generating file number:", err);
        showToast("Error generating file number", '', "danger");
        return;
      }
    }
        
         const file_id = fileName || document.getElementById("file_id").value;
  // const file_name = document.getElementById("file_name").value;
  const file_subject = document.getElementById("file_subject").value;
  // const sender = document.getElementById("sender").value;
  // const receiver = document.getElementById("receiver").value == '' ? selectedDepartment?.value : document.getElementById("receiver").value;
  const date_added = document.getElementById("date_added").value;
  // const inwardnum = document.getElementById("inwardnum").value;
  // const outwardnum = document.getElementById("outwardnum").value;
  // const current_status = document.getElementById("current_status").value;
  const remarks = formData?.remarks;
  
  console.log('first 11',formData, formData?.remarks)

   if (!file_id || !file_subject) {
    showToast("All fields are required.", '', "danger");
    return;
  }

  formDatas.append("file_no", file_no);
  formDatas.append("file_id", file_id);
  // formDatas.append("file_name", file_name);
  formDatas.append("file_subject", file_subject);
  // formDatas.append("sender", sender);
  formDatas.append("receiver", selectedReceiver?.value);
  formDatas.append("date_added", date_added);
  // formDatas.append("inwardnum", inwardnum);
  // formDatas.append("outwardnum", outwardnum);
  formDatas.append("current_status", selectedDepartment?.value);
  formDatas.append("remarks", remarks);
  // formDatas.append("status", "pending");
  formDatas.append("status", approvalStatus == undefined ? 'pending' : approvalStatus);
  formDatas.append('department',selectedDepartment?.value)
  formDatas.append('division',selectedDivision?.value)
  formDatas.append('unit',selectedUnit?.value)

  console.log('first',formData.remarks)

  // 2. Append one or more files (attachments)
  const files = document.getElementById("file").files; // from file input
  for (let i = 0; i < files.length; i++) {
    formDatas.append("file", files[i]); // must match multer field name
  }

  const logEditEvent = async (eventType, forwardedTo) => {
  // const user = JSON.parse(localStorage.getItem("user"));
  console.log('user12',user)
  const editedBy = user?.user?.username
  const fileData = {
    event_type: eventType,
    file_id: fileToEdit.id,
    user_id: user?.user?.id,
    origin: selectedDepartment?.value || '',
    forwarded_to: forwardedTo, 
    approved_by: user?.user?.username,
    edited_by: editedBy
    // notes: 'Updated file metadata' // optional
  };
  console.log('fileData',fileData);
  try {
    await fetch('http://localhost:5000/api/file-events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(fileData)
    });
    console.log(`✅ '${eventType}' event logged`);
  } catch (err) {
    console.error(`❌ Failed to log '${eventType}' event:`, err);
  }
};

  if(isEditing){
     try {
    const response = await fetch(`http://localhost:5000/createfilewithattachments/${fileToEdit?.id}`, {
      method: "PUT",
      body: formDatas
      // NOTE: Don't set Content-Type manually for FormData
    });

    const result = await response.json();

    if (response.ok) {
      // alert("File and attachments updated successfully!");
      showToast("File and attachments updated successfully!",'',"success")
      console.log(result);

      setFileId(result.id) //========================

      console.log('fileTpEdit',fileToEdit?.receiver)
      await logEditEvent('edited',fileToEdit?.receiver)
       if (approvalStatus === 'approved') {
        await logEditEvent('approved', fileToEdit?.receiver);
      }

      navigate('/fileinbox')
    } else {
      alert("Error: " + result.error);
    }
  } catch (err) {
    console.error("Request error:", err);
    alert("Failed to upload file.");
  }
  // logEditEvent()
  }
  else{
    console.log('formData final',formData)
    for (const [key, value] of formDatas.entries()) {
     console.log(`${key}: ${value}`);
  }
     try {
    const response = await fetch("http://localhost:5000/createfilewithattachments", {
      method: "POST",
      body: formDatas
      // NOTE: Don't set Content-Type manually for FormData
    });

    const result = await response.json();
     console.log('RES',result);
    if (response.ok) {
      // alert("File and attachments uploaded successfully!");
      console.log(result);
      const fid = result?.id
      // setFileId(result.id) //========================
      // const user = JSON.parse(localStorage.getItem("user"))

      const eventData = {
        event_type: 'created',
        file_id: fid,
        user_id: user?.user?.id,
        origin: selectedDepartment?.value || '',
        forwarded_to: selectedReceiver?.value || '',
        approved_by: '',
        edited_by: ''
     };
     console.log('event',eventData)
      const response_ = await fetch("http://localhost:5000/api/file-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"  // ✅ Add this line
     },
      body: JSON.stringify(eventData)
      // NOTE: Don't set Content-Type manually for FormData
    });

    const result_ = await response_.json()
    console.log('result',result_)

     showToast("File and attachments uploaded successfully!", "", "success");
     navigate('/fileinbox')
    } else {
      alert("Error: " + result.error);
      showToast("Duplicate Entry not allowed!", "", "danger");
    }
  } catch (err) {
    console.error("Request error:", err);
    alert("Failed to upload file.",err);
  }
  }

  // 3. Send request to backend
 

//   // Append form fields
//   for (let key in formData) {
//     data.append(key, formData[key]);
//   }

   

  
//     // console.log('fileb data',data)
//     for (let pair of data.entries()) {
//   console.log(`${pair[0]}:`, pair[1]);
// }
  //    try {
  //   const response = await fetch("http://localhost:5000/createfile", {
  //     method: "POST",
  //     // body: data // No headers here! Browser sets Content-Type correctly
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(formData), // send form data
  //   });

  //   const data = await response.json();

  //   if (response.ok) {
  //     // alert("Signup Successful!");
  //     console.log("Server response:", data);
  //     // setToast({ show: true, title: "Signup Successful!", body: `` });
  //     showToast("File created successfully!", "", "success");
  //      navigate('/fileinbox')
  //     // setFormData({
  //     //   username: "",
  //     //   email: "",
  //     //   department: "",
  //     //   password: "",
  //     // });
      
  //   } else {
  //     alert("create file failed: " + data.error);
  //   }
  // } catch (error) {
  //   console.error("Error submitting form:", error);
  //   alert("Something went wrong!");
  // }
    // navigate('/fileinbox')

  }

    const handleTimeline = (file) => {
    // e.preventDefault();
    navigate('/filetimeline', {state: {
        fileId: file?.id,
        fileName: file?.file_id
      }})
    }


    console.log('first formdata',formData)
  

  const handleUpload = async () => {
  if (!file) {
    showToast("Please select a file first!",'','warning');
    return;
  }

  setLoading(true)
  const formData = new FormData();
  // formData.append("file", file);
  for (let i = 0; i < file.length; i++) {
      formData.append('file', file[i]);  
    }
  try {
    const res = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData, // no need to set Content-Type, fetch will handle it
    });

    if (!res.ok) {
      throw new Error("Upload failed");
    }

    const data = await res.json();
    setMessage(data.message);
    // alert(data.message)
    showToast(data.message,'', "success");
    // console.log(data.files.map(file=> file.url))

   

    setLoading(false);
  } catch (err) {
    setMessage("Upload failed!");
    console.error(err);
  }
};

  //   useEffect(() => {
  //     const viewedKey = `viewed_file_${fileToEdit?.id}`;
  // const alreadyViewed = sessionStorage.getItem(viewedKey); // check if already logged
  // console.log('already viewed', alreadyViewed)

  //  if (fileToEdit?.id && !alreadyViewed) {
  //   console.log('already viewed', fileToEdit?.id, alreadyViewed)
  //   fetchComments(); // your existing logic
  //     const logFileView = async () => {
  //     try {
  //       const res = await fetch(`http://localhost:5000/api/view-file/${fileToEdit?.id}`, {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //       });

  //       sessionStorage.setItem(viewedKey, 'true'); 

  //       const data = await res.json();
  //       console.log('File view logged:', data);
  //     } catch (error) {
  //       console.error('File view logged Error logging file view:', error);
  //     }
  //   };
  
  //   //  fetchComments();
  //   console.log('📌 Logging file view for', fileToEdit?.id);
  //    logFileView()
  //   }
  //   }, [fileToEdit?.id]);
 useEffect(() => {
  if (!fileToEdit?.id) return;

  fetchComments(); // No issue here

  const logFileView = async () => {
    const viewedKey = `viewed_file_${fileToEdit.id}`;
    const alreadyViewed = sessionStorage.getItem(viewedKey);

    if (alreadyViewed) {
      console.log("⛔ Already viewed. Skipping log for:", fileToEdit.id);
      return;
    }

    console.log('📌 Logging file view for', fileToEdit.id);

    try {
      // const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.user?.id;

      if (!userId) {
        console.warn("⚠️ No user ID found. Skipping file view log.");
        return;
      }

      console.log('fileToEdit===',fileToEdit?.department)
      const fileData = {
        event_type: 'viewed',
        file_id: fileToEdit.id,
        user_id: userId,
        origin: fileToEdit?.department || '',
        forwarded_to: fileToEdit?.receiver || null,
        viewed_by: user?.user?.username,
        edited_by: ''
      };

      const res = await fetch(`http://localhost:5000/api/file-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fileData)
      });

      if (res.ok) {
        sessionStorage.setItem(viewedKey, 'true');
        const data = await res.json();
        console.log('✅ File view logged:', data);
      } else {
        console.warn('⚠️ Failed to log view. Response not OK');
      }
    } catch (error) {
      console.error('❌ Error logging file view:', error);
    }
  };

  logFileView();
}, [fileToEdit?.id]);




    const fetchComments = async () => {
      console.log('fetch commnets',fileToEdit?.id)
        try {
            const response = await fetch(`http://localhost:5000/api/documents/${fileToEdit?.id}/comments`);

            if (!response.ok) {
      const text = await response.text(); // Get raw error message
      throw new Error(`Server returned ${res.status}: ${text}`);
    }

            const data = await response.json();
            console.log('comments========',data)
            setComments(data); // assuming data is an array of comments
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        }
    };

    
    console.log('attachemnts=========in create file===',attachments)

    const handleDeleteAttachment = async (attachmentId) => {
  try {
    const res = await fetch(`http://localhost:5000/api/attachments/${attachmentId}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error('Failed to delete attachment');
    }

    // Optionally show success message
    console.log('Attachment deleted');

    // Remove from local state
    setAttachments((prev) => prev.filter(att => att.id !== attachmentId));

  } catch (err) {
    console.error('Error deleting attachment:', err);
  }
};


function stripHtml(htmlString) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlString;
  return tempDiv.textContent || tempDiv.innerText || "";
}



useEffect(() => {
  const fetchDivisions = async () => {
    if (!selectedDepartment) {
      setDivisions([]);
      return;
    }

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
    }
    catch (error) {
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
    } 
    
     catch (error) {
      console.error('Failed to fetch Units:', error);
      setUnits([]);
    }
  };

  fetchUnits();
}, [selectedDivision?.id]);




  useEffect(() => {
    // For existing files, use the existing file_id
    if (fileToEdit?.id) {
      setFileName(fileToEdit?.file_id || '');
    } else {
      // For new files, generate file name when all required fields are selected and file number is available
      if (selectedDepartment?.value && selectedDivision?.value && selectedUnit?.value && fileNumber) {
        const dt = new Date().getFullYear()
        const generatedName = `${selectedDepartment?.value}/${selectedDivision?.value}/${selectedUnit?.value}/${fileNumber}/${dt}`;
        setFileName(generatedName);
      } else {
        setFileName('');
      }
    }
  }, [selectedDepartment?.value, selectedDivision?.value, selectedUnit?.value, fileNumber, fileToEdit?.id]);

  // Generate file name when file number is available
  const generateFileName = () => {
    if (selectedDepartment?.value && selectedDivision?.value && selectedUnit?.value && fileNumber) {
      const dt = new Date().getFullYear()
      const generatedName = `${selectedDepartment?.value}/${selectedDivision?.value}/${selectedUnit?.value}/${fileNumber}/${dt}`;
      setFileName(generatedName);
      return generatedName;
    }
    return '';
  };



  
  
  const handleEditClick = async (fileToEdit) => {
  // 1. Find the file to edit
  // const fileToEdit = filteredFiles.find((task) => task.id === id);
  console.log('fileToEdit:', fileToEdit, fileToEdit?.id);

  if (!fileToEdit) {
    console.error('File not found for editing');
    return;
  }

  const data = await getAttachments(fileToEdit?.id)

  // navigate('/createfile', { state: {fileToEdit, data, viewMode: false} });

  setViewMode(false)
  
};
  

const handleCancel = async () =>{
  // const data = await getAttachments(fileToEdit?.id)
  // setAttachments(data)
  setViewMode(true)
}


useEffect(() => {
    if (departments && user?.user?.department) {
      const userDept = departments.find(
      (dept) => dept.value === user?.user?.department
    );
    console.log('userDept',userDept)
      setSelectedDepartment(userDept);
    }
  }, [user?.user?.department,departments]);
  

  

  return (
   <>
      <div className="container-fluid mt-4">
  <div className="row">
    <Sidebar />
    {/* Left Column - Form */}
    <div className="col-md-10 bg-light border p-4">
      {/* <h4 className="text-center mb-4">CREATE FILE</h4>
      <button>EDIT FILE</button> */}
      <div className="d-flex align-items-center mb-4">
        <h4 className="text-center flex-grow-1 m-0">{fileToEdit?.id ? 'FILE DETAILS' : 'CREATE FILE'}</h4>
        {/* {fileToEdit?.id && <button 
            className="btn btn-primary ms-auto"
            onClick={() => handleEditClick(fileToEdit)}>CLICK TO EDIT FILE</button>} */}
      </div>
      {/* Your Form Rows Go Here (already formatted in previous reply) */}
      {/* Example Row */}
      <div className="row mb-3">
        <div className="col-md-6 d-flex align-items-center gap-2">
          <label className="form-label mb-0" htmlFor="department">Department</label>
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
               disabled={viewMode}>
  <option value="">-- Select Department --</option>
  {departments?.map((dept) => (
    <option key={dept.id} value={dept.code}>
      {dept?.dept_name} ({dept.code})
    </option>
  ))}
</select> */}
        </div>
        
          
         <div className="col-md-6 d-flex align-items-center gap-2">
          <label className="form-label mb-0" htmlFor="division">Divisions</label>
          {/* <select
              value={selectedDivision}
             onChange={(e) => setSelectedDivision(e.target.value)}
               required
               id="division"
               name="division"
               disabled={viewMode}
          >
 
   <option value="">-- Select Division --</option>
  {divisions.map((division, idx) => (
    <option key={idx} value={division.code}>
      {division.name} ({division.code})
    </option>
  ))}
</select> */}
<Select
        options={divisions}   
        value={selectedDivision}
        onChange={(selectedOption) => setSelectedDivision(selectedOption)}
        isSearchable={true}
        placeholder="Divisions"
      /> 
        </div>
        </div>
      <div className="row mb-3">
        <div className="col-md-6 d-flex align-items-center gap-2">
          <label className="form-label mb-0" htmlFor="unit">Units</label>
          <Select
        options={units}
        value={selectedUnit}
        onChange={(selectedOption) => setSelectedUnit(selectedOption)}
        isSearchable={true}
        placeholder="Units"
      /> {/* <select
              value={selectedUnit}
             onChange={(e) => setSelectedUnit(e.target.value)}
               required
               id="unit"
               name="unit"
               disabled={viewMode}
          >
 
   <option value="">-- Select Unit --</option>
  {units.map((unit, idx) => (
    <option key={idx} value={unit.code}>
      {unit.name} ({unit.code})
    </option>
  ))}
</select> */}
        </div>
        <div className="col-md-6 d-flex align-items-center gap-2">
          <label className="form-label mb-0" htmlFor="file_no">No.:</label>
          <input type="text" name="file_no" id="file_no" className="form-control" value={fileNumber} readOnly />
        </div>
        </div>
        <div className="row mb-3">
        <div className="col-md-12 d-flex justify-content-center">
            <h2 className="text-center mb-4 fw-bold">
             {departments?.find((dept) => dept?.label === selectedDepartment?.label)?.label}
            </h2>
        </div>
        </div>
         <div className="row mb-3">
        <div className="col-md-12 d-flex align-items-center gap-2">
          <label className="form-label mb-0" htmlFor="file_id">File Number:</label>
          <input type="text" name="file_id" id="file_id" className="form-control" value={fileName} 
          onChange={handleChange} 
          disabled={true}/>
        </div>
        </div>
        {/* <div className="col-md-4 d-flex align-items-center gap-2">
          <label className="form-label mb-0" htmlFor="file_subject">File Subject:</label>
          <input type="text" name="file_subject" id="file_subject" className="form-control" value={formData.file_subject} onChange={handleChange} />
        </div> */}
      
      {/* Row 2 */}
  <div className="row mb-3">
    <div className="col-md-12 d-flex align-items-center gap-2">
          <label className="form-label mb-0" htmlFor="file_subject">File Subject:</label>
          <input type="text" name="file_subject" id="file_subject" className="form-control" value={formData.file_subject} onChange={handleChange} disabled={viewMode}/>
        </div>
    {/* <div className="col-md-6 d-flex align-items-center gap-2">
      <label className="form-label mb-0" htmlFor="sender">Originator:</label>
      <input type="text" name="sender" id="sender" className="form-control" value={formData.sender} onChange={handleChange} disabled={viewMode}/>
    </div> */}
    {/* <div className="col-md-4 d-flex align-items-center gap-2">
      <label className="form-label mb-0" htmlFor="file_recipient">Recipient:</label>
      <input type="text" name="file_recipient" id="file_recipient" className="form-control" value={formData.file_recipient} onChange={handleChange} />
    </div> */}
    {/* <div className="col-md-4 d-flex align-items-center gap-2">
      <label className="form-label mb-0" htmlFor="date">Date:</label>
      <input type="date" name="date" id="date" className="form-control" value={formData.date} onChange={handleChange} />
    </div> */}
  </div>
  {/* Row 3 */}
  <div className="row mb-3">
     {/* <div className="col-md-6 d-flex align-items-center gap-2">
      <label className="form-label mb-0" htmlFor="receiver">File Recipient:</label>
      <input type="text" name="receiver" id="receiver" className="form-control" value={formData.receiver} onChange={handleChange} disabled={viewMode}/>
    </div> */}
    <div className="col-md-6 d-flex align-items-center gap-2">
      <label className="form-label mb-0" htmlFor="date_added">Date:</label>
      <input type="datetime-local" name="date_added" id="date_added" className="form-control" value={formData.date_added} onChange={handleChange} disabled={viewMode}/>
    </div>
    <div className="col-md-6 d-flex align-items-center gap-2">
      <label className="form-label mb-0" htmlFor="current_status">Live File Location:</label>
      {/* <input type="text" name="current_status" id="current_status" className="form-control" value={formData.current_status} onChange={handleChange} disabled={viewMode}/> */}
      <Select
                  options={departments}
                  value={selectedDepartment}
                  onChange={(selectedOption) => setSelectedDepartment(selectedOption)}
                  isSearchable={true}
                  isDisabled={true}
                  placeholder="Live File Location"
                /> 
    </div>
  </div>
  {/* <div className="row mb-3">
    <div className="col-md-6 d-flex align-items-center gap-2">
      <label className="form-label mb-0" htmlFor="inwardnum">Inward No:</label>
      <input type="text" name="inwardnum" id="inwardnum" className="form-control" value={formData.inwardnum} onChange={handleChange} disabled={viewMode}/>
    </div>
    <div className="col-md-6 d-flex align-items-center gap-2">
      <label className="form-label mb-0" htmlFor="outwardnum">Outward No:</label>
      <input type="text" name="outwardnum" id="outwardnum" className="form-control" value={formData.outwardnum} onChange={handleChange} disabled={viewMode}/>
    </div>
  
  </div> */}

   {/* <div className="row mb-3">
        <div className="col-md-12 d-flex align-items-center gap-2">
      <label className="form-label mb-0" htmlFor="current_status">Live File Location:</label>
      <input type="text" name="current_status" id="current_status" className="form-control" value={formData.current_status} onChange={handleChange} disabled={viewMode}/>
    </div>
   </div> */}
  {/* Remarks */}
  <div className="row mb-3">
    <div className="col-md-12">
      <label className="form-label" htmlFor="remarks">Note File:</label>
      {/* <textarea name="remarks" id="remarks" className="form-control" rows="10" value={formData.remarks} onChange={handleChange} disabled={viewMode}></textarea> */}
      <RemarksEditor formData={formData} setFormData={setFormData}
            viewMode={viewMode} />
      {/* <DocumentEditor file_id={formData?.file_id} fetchComments={fetchComments}
        viewMode={viewMode} approvalStatus={approvalStatus} setApprovalStatus={setApprovalStatus} selectedDepartment={selectedDepartment} receiver={formData?.receiver} id={fileToEdit?.id}/> */}
    </div>
  </div>

  {/* Attachments */}
  {/* <div className="row mb-4">
    <div className="col-md-12">
      <label className="form-label" htmlFor="file">Attachments:</label>
      <input type="file" className="form-control" multiple name="file" id="file" onChange={handleFileChange} />
    </div>
  </div> */}
  {attachments?.length > 0 && (
  <div className="mb-3">
    <label className="form-label">Existing Attachments:</label>
    <ul className="list-group">
      {attachments?.map((att, index) => (
        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
          <a href={`${BASE_URL}/${att.path}`} target="_blank" rel="noopener noreferrer" className="text-break">
            {/* {att.path.split('/').pop()} Just the filename */}
            {att?.filename}
          </a>
          {!viewMode && <button 
          onClick={() => handleDeleteAttachment(att?.id)} 
          className="btn btn-sm btn-danger">
      Delete
    </button>}
        </li>
      ))}
    </ul>
  </div>
)}
      {!viewMode && <div className="row mb-4">
      <div className="col-md-12">
        <label className="form-label">Attachments:</label>
        <div className="input-group">
          <label htmlFor="file" className="btn btn-primary">
            Choose Files
          </label>
          <input
            type="file"
            id="file"
            name="file"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div className="form-control bg-white">
            {file?.length > 0
              ? file?.map((file) => file.name).join(', ')
              : "No files selected"}
          </div>
        </div>
      </div>
    </div>}
    <div className="row mb-3">
        <div className="col-md-12 d-flex align-items-center gap-2">
      <label className="form-label mb-0" htmlFor="receiver">Forwarded To:</label>
      {/* <input type="text" name="receiver" id="receiver" className="form-control" value={formData?.receiver} onChange={handleChange} disabled={viewMode}/> */}
      <Select
                  options={departments}
                  name="receiver"
                  value={selectedReceiver}
                  onChange={(selectedOption) => setSelectedReceiver(selectedOption)}
                  isSearchable={true}
                  placeholder="Search or Select Department"
                /> 
    </div>
   </div> 
   {/* {fileToEdit?.id && user?.user?.role === 'admin' && <button 
            className="btn btn-primary ms-auto"
            onClick={() => handleEditClick(fileToEdit)}>EDIT FILE</button>}
            
      {fileToEdit?.id && <div>
      <button className="btn btn-secondary px-5" 
              onClick={() => handleTimeline(fileToEdit?.id)}>
        File Timeline
      </button>
    </div>} */}
    {fileToEdit?.id && (
  <div className="d-flex mt-3">
    {console.log('user role', user)}
    {user?.user?.role === 'admin' && (
      <button 
        className="btn btn-primary"
        onClick={() => handleEditClick(fileToEdit)}
      >
        EDIT FILE
      </button>
    )}
    <div className="ms-auto">
    <button 
      className="btn btn-secondary px-5"
      onClick={() => handleTimeline(fileToEdit)}
    >
      File Timeline
    </button>
    </div>
  </div>
)}
      {/* Add more rows as per previous layout */}
      
      {/* Final Save Button */}
      {!viewMode && (
  <div className="d-flex justify-content-center mt-4 gap-3">
    <div>
      <button className="btn btn-success px-5" onClick={handleSave}>
        {fileToEdit?.id ? 'Update' : 'Save'}
      </button>
    </div>
    {fileToEdit?.id && <div>
      <button className="btn btn-secondary px-5" onClick={handleCancel}>
        Cancel
      </button>
    </div>}
    
  </div>
)}
    </div>

    {/* Right Column - DocumentEditor */}
    <div className="col-md-12 bg-light border p-4">
      <h4 className="text-center">Comments</h4>
     
      {/* <h3>Comments</h3> */}
      {comments?.map((comment) => (
        <div className="card w-100" key={comment?.id}>
          <div className="card-body">
          <h5 className="card-title">{stripHtml(comment?.comment)}</h5>
          <p className="card-text">By: {comment?.username}</p>
          <span>{new Date(comment?.created_at).toLocaleString()}</span>
          {/* <a href="#" class="btn btn-primary">Button</a> */}
          <span>{comment?.attachments?.map((attach,idx) => <p key={idx} style={{ color: 'red' }}>Attachments: <a href={`${BASE_URL}/${attach?.path}`} target="_blank" rel="noopener noreferrer" className="text-break">
            {attach?.filename}
          </a></p>)}</span>
        </div>
        </div>
      ))}
       <div className="container">
        <DocumentEditor file_id={formData?.file_id} fetchComments={fetchComments}
        viewMode={viewMode} approvalStatus={approvalStatus} setApprovalStatus={setApprovalStatus} selectedDepartment={selectedDepartment} receiver={formData?.receiver} id={fileToEdit?.id}/>
        {/* Optional: Show Timeline Button */}
        {/* <button className="btn btn-success px-5 mt-3" onClick={handleTimeline}>Show Timeline</button> */}
      </div>
    
{/* <div class="card w-75">
  <div class="card-body">
    <h5 class="card-title">Card title</h5>
    <p class="card-text">With supporting text below as a natural lead-in to additional content.</p>
    <a href="#" class="btn btn-primary">Button</a>
  </div>
</div> */}
    </div>
  </div>
</div>
    </>
  )
}
