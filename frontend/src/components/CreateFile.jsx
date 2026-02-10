import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import DocumentEditor from './DocumentEditor';
import { useToast } from '../context/ToastContext';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import { getAttachments, hasPermission } from '../utils/dbProvider';
import { useAuth } from '../context/AuthContext';
import Select from 'react-select';
import RemarksEditor from './RemarksEditor';
import ReusableModal from '../utils/ReusableModal';
import useFileSave from "../hooks/useFileSave";
import './CreateFile.css';



export default function CreateFile() {

  const BASE_URL = import.meta.env.VITE_API_URL

  const navigate = useNavigate()
  const { showToast } = useToast();

  const [showModal, setShowModal] = useState(false);

  const { user, hasRole } = useAuth();

  // Check if user is Inward Desk role ONLY - shows simplified upload-only interface
  // Users with multiple roles (e.g., INWARD + DESK) should see full file creation UI
  const isInwardDesk = hasRole('INWARD') && !hasRole('DESK');

  const [note, setNote] = useState('');

  const [notes, setNotes] = useState([])

  const [fileNumber, setFileNumber] = useState("");

  const [fileId, setFileId] = useState(null)

  const [departments, setDepartments] = useState([])

  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [selectedReceiver, setSelectedReceiver] = useState(null);

  const [divisions, setDivisions] = useState([]);

  const [units, setUnits] = useState([]);

  // Debug: Track units state changes
  useEffect(() => {
    console.log('🔴 UNITS STATE CHANGED:', units.length, 'units', units);
  }, [units]);

  const [selectedDivision, setSelectedDivision] = useState('');

  // Ref to track latest selectedDivision for use in handlers (bypasses closure issues)
  const selectedDivisionRef = React.useRef(selectedDivision);
  // COMMENTED OUT: This useEffect was overwriting the ref with stale state
  // The ref is now ONLY set directly in handleDivisionChange
  // useEffect(() => {
  //   console.log('🔵 selectedDivision STATE changed to:', selectedDivision);
  //   console.log('🔵 Before update, ref was:', selectedDivisionRef.current);
  //   selectedDivisionRef.current = selectedDivision;
  //   console.log('🔵 After update, ref is now:', selectedDivisionRef.current);
  // }, [selectedDivision]);

  const [selectedUnit, setSelectedUnit] = useState('');

  const [fileName, setFileName] = useState('');

  const [approvalStatus, setApprovalStatus] = useState('pending');

  const [attachments, setAttachments] = useState([])

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      console.log('formarted date', formattedDate)
      setFormData((prev) => ({
        ...prev,
        ...fileToEdit,

        date_added: formattedDate, // override with formatted date
      }));
    }
    if (data) setAttachments(data)

    setApprovalStatus(fileToEdit?.status);

    // setSelectedDepartment(fileToEdit?.department)
    if (fileToEdit?.department && departments.length > 0) {
      console.log('dept', departments)
      const deptOption = departments.find(dept => dept.value === fileToEdit?.department)
      setSelectedDepartment(deptOption)
    }
    if (fileToEdit?.division && divisions.length > 0) {
      const divOption = divisions.find(div => div.value === fileToEdit?.division)
      setSelectedDivision(divOption)
    }

    if (fileToEdit?.unit && units.length > 0) {
      const unitOption = units.find(u => u.value === fileToEdit?.unit)
      setSelectedUnit(unitOption)
    }
    if (fileToEdit?.receiver && departments.length > 0) {
      const deptOption = departments.find(dept => dept.value === fileToEdit?.receiver)
      setSelectedReceiver(deptOption)
    }
    // fetchAttachments(dat)
  }, [fileToEdit, data, viewMode, departments, divisions, units]) // only run this effect when `dat` changes


  const [file, setFile] = useState([])
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const getDepartments = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/departments`);
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

    checkApproval(fileToEdit?.id);

    // Fetch preview of next file number for new files (not when editing)
    // Also fetch for DESK users with pending files since they are creating a new file from received attachments
    const isDeskWithPending = hasRole('DESK') && fileToEdit?.status === 'pending';
    if (!fileToEdit?.id || isDeskWithPending) {
      const fetchNextFileNumber = async () => {
        try {
          const response = await fetch(`${BASE_URL}/api/next-file-number`);
          const data = await response.json();
          setFileNumber(data?.fileNumber);
        } catch (err) {
          console.error("Error fetching next file number:", err);
        }
      };

      fetchNextFileNumber();
    }
  }, [fileToEdit?.id, fileToEdit?.status, user]);




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
    // setFile(Array.from(e.target.files));
    const selectedFiles = Array.from(e.target.files);

    setFile((prevFiles) => [...prevFiles, ...selectedFiles]);

    // reset input so same file can be selected again if needed
    e.target.value = null
  };

  const generateFileName = () => {
    // For DESK users with pending files, use the REF instead of state
    const isDeskWithPending = hasRole('DESK') && fileToEdit?.status === 'pending';
    const divisionValue = isDeskWithPending ? selectedDivisionRef.current?.value : selectedDivision?.value;

    if (selectedDepartment?.value && divisionValue && selectedUnit?.value && fileNumber) {
      const dt = new Date().getFullYear()
      const generatedName = `${selectedDepartment?.value}/${divisionValue}/${selectedUnit?.value}/${fileNumber}/${dt}`;
      setFileName(generatedName);
      return generatedName;
    }
    return fileName || ''; // Return existing fileName if can't generate new one
  };

  const { handleCreateFile, handleSendFile } = useFileSave({
    BASE_URL,
    showToast,
    generateFileName
  });

  //   const handleSave = async (e) => {
  //     e.preventDefault();
  //     // navigate('/fileinbox')
  //     const isEditing = Boolean(fileToEdit?.id);
  //      const formDatas  = new FormData();
  //     // if (!formData.file_id || !formData.file_subject || !formData.originator || !formData.file_name || !formData.file_recipient || !formData.current_status) {
  //     //         // alert('All fields are required.');
  //     //         showToast("All fields are required.", '', "danger");
  //     //         return;
  //     //     }

  //     // Use the preview file number for new files, or existing number for editing
  //     let file_no = document.getElementById('file_no').value;
  //     if (!isEditing) {
  //       // For new files, use the preview number and increment the counter
  //       try {
  //         const response = await fetch(`${BASE_URL}/api/generate-file-number`, {
  //           method: "POST"
  //         });
  //         const data = await response.json();
  //         file_no = data?.fileNumber;
  //         setFileNumber(file_no);

  //         // Generate file name after getting file number
  //         const generatedFileName = generateFileName();
  //         if (generatedFileName) {
  //           setFileName(generatedFileName);
  //         }
  //       } catch (err) {
  //         console.error("Error generating file number:", err);
  //         showToast("Error generating file number", '', "danger");
  //         return;
  //       }
  //     }

  //          const file_id = fileName || document.getElementById("file_id").value;
  //   // const file_name = document.getElementById("file_name").value;
  //   const file_subject = document.getElementById("file_subject").value;
  //   // const sender = document.getElementById("sender").value;
  //   // const receiver = document.getElementById("receiver").value == '' ? selectedDepartment?.value : document.getElementById("receiver").value;
  //   // const date_added = document.getElementById("date_added").value;
  //   // const inwardnum = document.getElementById("inwardnum").value;
  //   // const outwardnum = document.getElementById("outwardnum").value;
  //   // const current_status = document.getElementById("current_status").value;
  //   const remarks = formData?.remarks;

  //   console.log('first 11',formData, formData?.remarks)

  //    if (!file_id || !file_subject) {
  //     showToast("All fields are required.", '', "danger");
  //     return;
  //   }

  //   formDatas.append("fileName", file_id);
  //   formDatas.append("file_no", file_no);
  //   formDatas.append("file_id", file_id);

  //   formDatas.append("file_subject", file_subject);
  //   formDatas.append("sender", selectedDepartment?.value);
  //   formDatas.append("receiver", selectedReceiver?.value);
  //   // formDatas.append("date_added", date_added);
  //   // formDatas.append("inwardnum", inwardnum);
  //   // formDatas.append("outwardnum", outwardnum);
  //   formDatas.append("current_status", selectedDepartment?.value);
  //   formDatas.append("remarks", remarks);
  //   // formDatas.append("status", "pending");
  //   formDatas.append("status", approvalStatus == undefined ? 'pending' : approvalStatus);
  //   formDatas.append('department',selectedDepartment?.value)
  //   formDatas.append('division',selectedDivision?.value)
  //   formDatas.append('unit',selectedUnit?.value)

  //   console.log('first',formData.remarks)

  //   // 2. Append one or more files (attachments)
  //   const files = document.getElementById("file").files; // from file input
  //   for (let i = 0; i < files.length; i++) {
  //     formDatas.append("file", files[i]); // must match multer field name
  //   }

  //   const logEditEvent = async (eventType, forwardedTo) => {
  //   // const user = JSON.parse(localStorage.getItem("user"));
  //   console.log('user12',user)
  //   const editedBy = user?.user?.username
  //   const fileData = {
  //     event_type: eventType,
  //     file_id: fileToEdit.id,
  //     user_id: user?.user?.id,
  //     origin: selectedDepartment?.value || '',
  //     forwarded_to: forwardedTo, 
  //     approved_by: user?.user?.username,
  //     edited_by: editedBy
  //     // notes: 'Updated file metadata' // optional
  //   };
  //   console.log('fileData',fileData);
  //   try {
  //     await fetch(`${BASE_URL}/api/file-events`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify(fileData)
  //     });
  //     console.log(`✅ '${eventType}' event logged`);
  //   } catch (err) {
  //     console.error(`❌ Failed to log '${eventType}' event:`, err);
  //   }
  // };

  //   if(isEditing){
  //      try {
  //     const response = await fetch(`${BASE_URL}/createfilewithattachments/${fileToEdit?.id}`, {
  //       method: "PUT",
  //       body: formDatas
  //       // NOTE: Don't set Content-Type manually for FormData
  //     });

  //     const result = await response.json();

  //     if (response.ok) {
  //       // alert("File and attachments updated successfully!");
  //       showToast("File and attachments updated successfully!",'',"success")
  //       console.log(result);

  //       setFileId(result.id) //========================

  //       console.log('fileTpEdit',fileToEdit?.receiver)
  //       await logEditEvent('edited',fileToEdit?.receiver)
  //        if (approvalStatus === 'approved') {
  //         await logEditEvent('approved', fileToEdit?.receiver);
  //       }

  //       navigate('/fileinbox')
  //     } else {
  //       alert("Error: " + result.error);
  //     }
  //   } catch (err) {
  //     console.error("Request error:", err);
  //     alert("Failed to upload file.");
  //   }
  //   // logEditEvent()
  //   }
  //   else{
  //     console.log('formData final',formData)
  //     for (const [key, value] of formDatas.entries()) {
  //      console.log(`${key}: ${value}`);
  //   }
  //      try {
  //     const response = await fetch(`${BASE_URL}/createfilewithattachments`, {
  //       method: "POST",
  //       body: formDatas
  //       // NOTE: Don't set Content-Type manually for FormData
  //     });

  //     const result = await response.json();
  //      console.log('RES',result);
  //     if (response.ok) {
  //       // alert("File and attachments uploaded successfully!");
  //       console.log(result);
  //       const fid = result?.id
  //       // setFileId(result.id) //========================
  //       // const user = JSON.parse(localStorage.getItem("user"))

  //       const eventData = {
  //         event_type: 'created',
  //         file_id: fid,
  //         user_id: user?.user?.id,
  //         origin: selectedDepartment?.value || '',
  //         forwarded_to: selectedReceiver?.value || '',
  //         approved_by: '',
  //         edited_by: ''
  //      };
  //      console.log('event',eventData)
  //       const response_ = await fetch(`${BASE_URL}/api/file-events`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json"  // ✅ Add this line
  //      },
  //       body: JSON.stringify(eventData)
  //       // NOTE: Don't set Content-Type manually for FormData
  //     });

  //     const result_ = await response_.json()
  //     console.log('result',result_)

  //      showToast("File and attachments uploaded successfully!", "", "success");
  //      navigate('/fileinbox')
  //     } else {
  //       alert("Error: " + result.error);
  //       showToast("Duplicate Entry not allowed!", "", "danger");
  //     }
  //   } catch (err) {
  //     console.error("Request error:", err);
  //     alert("Failed to upload file.",err);
  //   }
  //   }

  //   // 3. Send request to backend


  // //   // Append form fields
  // //   for (let key in formData) {
  // //     data.append(key, formData[key]);
  // //   }




  // //     // console.log('fileb data',data)
  // //     for (let pair of data.entries()) {
  // //   console.log(`${pair[0]}:`, pair[1]);
  // // }
  //   //    try {
  //   //   const response = await fetch("http://localhost:5000/createfile", {
  //   //     method: "POST",
  //   //     // body: data // No headers here! Browser sets Content-Type correctly
  //   //     headers: {
  //   //       "Content-Type": "application/json",
  //   //     },
  //   //     body: JSON.stringify(formData), // send form data
  //   //   });

  //   //   const data = await response.json();

  //   //   if (response.ok) {
  //   //     // alert("Signup Successful!");
  //   //     console.log("Server response:", data);
  //   //     // setToast({ show: true, title: "Signup Successful!", body: `` });
  //   //     showToast("File created successfully!", "", "success");
  //   //      navigate('/fileinbox')
  //   //     // setFormData({
  //   //     //   username: "",
  //   //     //   email: "",
  //   //     //   department: "",
  //   //     //   password: "",
  //   //     // });

  //   //   } else {
  //   //     alert("create file failed: " + data.error);
  //   //   }
  //   // } catch (error) {
  //   //   console.error("Error submitting form:", error);
  //   //   alert("Something went wrong!");
  //   // }
  //     // navigate('/fileinbox')

  //   }

  const handleTimeline = (file) => {
    // e.preventDefault();
    navigate('/filetimeline', {
      state: {
        fileId: file?.id,
        fileName: file?.file_id
      }
    })
  }


  console.log('first formdata', formData)


  const handleUpload = async () => {
    if (!file) {
      showToast("Please select a file first!", '', 'warning');
      return;
    }

    setLoading(true)
    const formData = new FormData();
    // formData.append("file", file);
    for (let i = 0; i < file.length; i++) {
      formData.append('file', file[i]);
    }
    try {
      const res = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        body: formData, // no need to set Content-Type, fetch will handle it
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      setMessage(data.message);
      // alert(data.message)
      showToast(data.message, '', "success");
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

    fetchNotes();

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

        console.log('fileToEdit===', fileToEdit?.department)
        const fileData = {
          event_type: 'viewed',
          file_id: fileToEdit.id,
          user_id: userId,
          origin: fileToEdit?.department || '',
          forwarded_to: fileToEdit?.receiver || null,
          viewed_by: user?.user?.username,
          edited_by: ''
        };

        const res = await fetch(`${BASE_URL}/api/file-events`, {
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
    console.log('fetch commnets', fileToEdit?.id)
    try {
      const response = await fetch(`${BASE_URL}/api/documents/${fileToEdit?.id}/comments`);

      if (!response.ok) {
        const text = await response.text(); // Get raw error message
        throw new Error(`Server returned ${res.status}: ${text}`);
      }

      const data = await response.json();
      console.log('comments========', data)
      setComments(data); // assuming data is an array of comments
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };


  const fetchNotes = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/documents/${fileToEdit?.id}/notes`);

      //         if (!response.ok) {
      //   const text = await response.text(); // Get raw error message
      //   throw new Error(`Server returned ${res.status}: ${text}`);
      // }

      const data = await response.json();
      console.log('notes========', data)
      setNotes(data)
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  };


  console.log('attachemnts=========in create file===', attachments)

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/attachments/${attachmentId}`, {
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
        const res = await fetch(`${BASE_URL}/api/departments/${selectedDepartment?.id}/divisions`);
        const data = await res.json();
        const options = data.map((div) => ({
          value: div?.code,
          label: `${div?.name} (${div?.code})`,
          id: div?.id
        }));
        console.log('dsivisions', options)
        setDivisions(options);
        // NOTE: Removed setSelectedDivision(null) here - division is now managed by handleDivisionChange
        // Resetting here was causing issues for DESK users when they selected a division
      }
      catch (error) {
        console.error('Failed to fetch divisions:', error);
        setDivisions([]);
      }
    };

    fetchDivisions();
  }, [selectedDepartment?.id]);


  // COMMENTED OUT: Now fetching units directly in handleDivisionChange to avoid race conditions
  useEffect(() => {
    const fetchUnits = async () => {
      console.log('fetchUnits triggered, selectedDivision:', selectedDivision);
      if (!selectedDivision?.id) {
        setUnits([]);
        return;
      }

      try {
        console.log('Fetching units for division id:', selectedDivision.id);
        const res = await fetch(
          `${BASE_URL}/api/divisions/${selectedDivision.id}/units`
        );
        const data = await res.json();
        console.log('Units data:', data);

        const options = data.map((div) => ({
          value: div.code,
          label: `${div.name} (${div.code})`,
          id: div.id
        }));

        setUnits(options);
        console.log('Units options set:', options);

        // validate selectedUnit against new options
        setSelectedUnit((prev) => {
          if (!prev) return null;
          return options.find((o) => o.value === prev.value) || null;
        });

      } catch (error) {
        console.error("Failed to fetch Units:", error);
        setUnits([]);
      }
    };

    fetchUnits();
  }, [selectedDivision?.id]);




  // useEffect(() => {
  //   // For existing files, use the existing file_id
  //   if (fileToEdit?.id) {
  //     setFileName(fileToEdit?.file_id || '');
  //   } else {
  //     // For new files, generate file name when all required fields are selected and file number is available
  //     if (selectedDepartment?.value && selectedDivision?.value && selectedUnit?.value && fileNumber) {
  //       const dt = new Date().getFullYear()
  //       const generatedName = `${selectedDepartment?.value}/${selectedDivision?.value}/${selectedUnit?.value}/${fileNumber}/${dt}`;
  //       setFileName(generatedName);
  //     } else {
  //       setFileName('');
  //     }
  //   }
  // }, [selectedDepartment?.value, selectedDivision?.value, selectedUnit?.value, fileNumber, fileToEdit?.id]);

  // Generate file name when file number is available
  ///////////////////////
  useEffect(() => {
    let newFileName = "";

    // For DESK users with pending files, always generate new file name (not use existing)
    const isDeskWithPending = user?.user?.role_code === 'DESK' && fileToEdit?.status === 'pending';

    if (fileToEdit?.id && !isDeskWithPending) {
      newFileName = fileToEdit.file_id || "";
    } else {
      // For new files or DESK users with pending files, use the REF for division
      // because the state might not have updated yet due to React's async state updates
      const divisionValue = isDeskWithPending ? selectedDivisionRef.current?.value : selectedDivision?.value;

      if (
        selectedDepartment?.value &&
        divisionValue &&
        selectedUnit?.value &&
        fileNumber
      ) {
        const dt = new Date().getFullYear();
        newFileName = `${selectedDepartment.value}/${divisionValue}/${selectedUnit.value}/${fileNumber}/${dt}`;
        console.log('Generated file name:', newFileName);
      } else {
        console.log('File name generation - missing values:', {
          dept: selectedDepartment?.value,
          div: divisionValue,
          unit: selectedUnit?.value,
          fileNum: fileNumber
        });
      }
    }

    setFileName(prev => (prev === newFileName ? prev : newFileName));

  }, [
    selectedDepartment?.value,
    selectedDivision?.value,
    selectedUnit?.value,
    fileNumber,
    fileToEdit?.id,
    fileToEdit?.status,
    user?.user?.role_code
  ]);





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


  const handleCancel = async () => {
    // const data = await getAttachments(fileToEdit?.id)
    // setAttachments(data)
    setViewMode(true)
  }


  useEffect(() => {
    if (departments && user?.user?.department) {
      const userDept = departments.find(
        (dept) => dept.value === user?.user?.department
      );
      console.log('userDept', userDept, user)
      setSelectedDepartment(userDept);
    }
  }, [user?.user?.department, departments]);

  useEffect(() => {
    if (divisions && user?.user?.division) {
      const userDiv = divisions.find(
        (div) => div.value === user?.user?.division
      );
      console.log('userDiv', userDiv, user)
      setSelectedDivision(userDiv);
      selectedDivisionRef.current = userDiv
    }
  }, [user?.user?.division, divisions]);


  useEffect(() => {
    console.log('selectedReceiver', selectedReceiver)
  }, [selectedReceiver])


  const handleSaveNote = async () => {
    if (!note || note.trim() === '' || note === '<p><br></p>') {
      alert('❌ Note cannot be empty.');
      return;
    }

    const userId = user?.user?.id;

    const fileId = fileToEdit?.id;

    try {
      const response = await fetch(`${BASE_URL}/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note, userId, fileId }), // ✅ send JSON
      });

      const data = await response.json();
      console.log("data=======", data);

      if (response.ok) {
        // alert("✅ Note added!");
        showToast("Note added!", '', "success");
        fetchNotes()
        setNote('')
      }
    } catch (error) {
      console.error("Error submitting note:", error);
    }
  };



  //   const eventData = {
  //     event_type: 'commented',
  //     file_id: id,
  //     user_id: user?.user?.id,
  //     origin: selectedDepartment?.value || '',
  //     forwarded_to: receiver,
  //     approved_by: '',
  //     edited_by: '',
  //     commented_by: user?.user?.username
  //  };
  //  console.log('event',eventData)
  //   const response_ = await fetch("http://localhost:5000/api/file-events", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json"  // ✅ Add this line
  //  },
  //   body: JSON.stringify(eventData)
  //   // NOTE: Don't set Content-Type manually for FormData
  // });

  // const result_ = await response_.json()
  // console.log('result',result_)

  //   } else {
  //     alert(`❌ Failed: ${data.error || 'Unknown error'}`);
  //   }

  // }
  // catch (error) {
  //   console.error('Error submitting comment:', error);
  //   // setStatus('❌ Failed to connect to server');
  // }
  const handleChangeNote = (e) => {
    setNote(e.target.value)
  }


  const handleHighPriority = () => {
    setShowModal(true)
  }



  const confirmHighPriority = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/api/files/${id}/request-priority`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.user?.token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        showToast(data.message, "", "success"); // <-- SHOW SERVER MESSAGE
      } else {
        showToast(data.message || "Something went wrong", "", "error");
      }
      setShowModal(false)
    } catch (error) {
      console.error(error);
      showToast("Network error", "error");
    }
  }


  async function checkApproval(fileId) {
    const res = await fetch(`${BASE_URL}/api/high-priority/status?fileId=${fileId}&userId=${user?.user?.id}`);
    const data = await res.json();
    if (data.status === "approved") {
      showToast("Your High Priority request was approved ✔️", '', 'success');
    }

    if (data.status === "rejected") {
      showToast("Your High Priority request was rejected ❌", '', 'error');
    }
  }


  useEffect(() => {
    console.log("selectedUnit changed");
  }, [selectedUnit]);

  // Handle unit selection and generate file name directly
  const handleUnitChange = (option) => {
    setSelectedUnit(option);

    // Generate file name directly using ref for latest division value
    // This bypasses the React closure issue
    const isDeskWithPending = user?.user?.role_code === 'DESK' && fileToEdit?.status === 'pending';

    if (fileToEdit?.id && !isDeskWithPending) {
      // Use existing file name for edits
      return;
    }

    // Use ref to get the latest selectedDivision value
    const currentDivision = selectedDivisionRef.current;
    console.log('handleUnitChange - currentDivision from ref:', currentDivision);

    // DEBUG: Show all values needed for file name generation
    // alert(`File name values:\nDept: ${selectedDepartment?.value}\nDiv: ${currentDivision?.value}\nUnit: ${option?.value}\nFileNum: ${fileNumber}`);

    if (
      selectedDepartment?.value &&
      currentDivision?.value &&
      option?.value &&
      fileNumber
    ) {
      const dt = new Date().getFullYear();
      const newFileName = `${selectedDepartment.value}/${currentDivision.value}/${option.value}/${fileNumber}/${dt}`;
      console.log('Generated file name in handleUnitChange:', newFileName);
      setFileName(newFileName);
    } else {
      console.log('File name NOT generated - missing values:', {
        dept: selectedDepartment?.value,
        div: currentDivision?.value,
        unit: option?.value,
        fileNum: fileNumber
      });
    }
  };

  const handleDivisionChange = async (option) => {
    // ALERT TEST - remove after debugging
    // alert(`Division selected! ID: ${option?.id}, Label: ${option?.label}`);

    console.log('handleDivisionChange called with option:', option);
    console.log('option.id:', option?.id);
    setSelectedDivision(option);

    // Immediately update the ref so handleUnitChange can access the latest value
    selectedDivisionRef.current = option;
    console.log('Set selectedDivisionRef.current to:', selectedDivisionRef.current);
    // alert(`Ref set! Value: ${selectedDivisionRef.current?.value}, ID: ${selectedDivisionRef.current?.id}`);

    setSelectedUnit(null);   // Reset unit when division changes

    // Directly fetch units when division changes
    if (option?.id) {
      try {
        console.log('Directly fetching units for division id:', option.id);
        const res = await fetch(`${BASE_URL}/api/divisions/${option.id}/units`);
        const data = await res.json();
        console.log('Direct fetch - Units data:', data);

        const unitOptions = data.map((unit) => ({
          value: unit.code,
          label: `${unit.name} (${unit.code})`,
          id: unit.id
        }));

        console.log('Direct fetch - Setting units:', unitOptions.length);
        setUnits(unitOptions);

        // ALERT TEST - remove after debugging
        // alert(`Fetched ${unitOptions.length} units! Setting to state now.`);
      } catch (error) {
        console.error("Failed to fetch Units directly:", error);
        alert(`ERROR fetching units: ${error.message}`);
        setUnits([]);
      }
    } else {
      setUnits([]);
    }
  };

  const removeFile = (indexToRemove) => {
    setFile((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  return (
    <>
      {/* Mobile Header */}
      <MobileHeader onMenuToggle={() => setSidebarOpen(true)} />

      <div className="create-file-page">
        <div className="container-fluid">
          <div className="row">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="col-md-10 col-lg-10">
              {/* Modern Header */}
              <div className="create-file-header">
                <h4>
                  {isInwardDesk
                    ? 'SCAN & UPLOAD DOCUMENT'
                    : (fileToEdit?.id ? 'FILE DETAILS' : 'CREATE NEW FILE')}
                </h4>
                {fileToEdit?.id && (
                  <button
                    className="cf-timeline-btn"
                    onClick={() => handleTimeline(fileToEdit)}
                  >
                    📅 File Timeline
                  </button>
                )}
              </div>

              {/* Inward Desk simplified UI - only attachment upload */}
              {isInwardDesk ? (
                <div className="inward-desk-upload">
                  <div className="alert alert-info mb-4">
                    <strong>Inward Desk:</strong> Scan physical documents and upload to create a Document ID.
                  </div>

                  {/* Attachments section for Inward Desk */}
                  <div className="row mb-4">
                    <div className="col-md-12">
                      <div className="attachments-wrapper">
                        <label className="attachments-label"><strong>Scan & Attach Documents:</strong></label>
                        <div className="attachments-row mt-2">
                          <label htmlFor="fileInput" className="btn btn-primary btn-lg">
                            <i className="bi bi-upload me-2"></i> Choose Files to Upload
                          </label>
                          <input
                            type="file"
                            id="fileInput"
                            multiple
                            hidden
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png,.tiff,.doc,.docx"
                          />
                          {file.map((f, index) => (
                            <div key={index} className="file-chip">
                              <span className="file-name" title={f.name}>{f.name}</span>
                              <button
                                type="button"
                                className="file-remove"
                                onClick={() => removeFile(index)}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subject field for Inward Desk - minimal info */}
                  <div className="row mb-3">
                    <div className="col-md-12">
                      <label className="form-label" htmlFor="file_subject"><strong>Document Subject:</strong></label>
                      <input
                        type="text"
                        name="file_subject"
                        id="file_subject"
                        className="form-control form-control-lg"
                        placeholder="Enter document subject/description"
                        value={formData.file_subject}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Upload button for Inward Desk */}
                  <div className="d-flex justify-content-center mt-4">
                    <form onSubmit={(e) =>
                      handleCreateFile({
                        e,
                        mode: "create",
                        formData,
                        fileToEdit: null,
                        selectedDepartment,
                        selectedReceiver: null,
                        selectedDivision,
                        selectedUnit,
                        approvalStatus: 'DRAFT',
                        fileName,
                        setFileNumber,
                        file,
                        existingAttachments: attachments, // Pass forwarded attachments
                        stayOnPage: true // INWARD desk: stay on page with attachments until file is fully created
                      })
                    }>
                      <button
                        className="btn btn-success btn-lg px-5"
                        type="submit"
                        disabled={file.length === 0}
                      >
                        <i className="bi bi-cloud-upload me-2"></i>
                        Upload & Generate Document ID
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                /* Regular user UI - full form */
                <>
                  {/* Metadata Card */}
                  <div className="cf-card">
                    <div className="cf-card-header">
                      <span className="icon">🏢</span>
                      <h5>File Metadata</h5>
                    </div>
                    <div className="cf-form-grid-4">
                      <div className="cf-form-group">
                        <label htmlFor="department">Department</label>
                        <Select
                          options={departments}
                          value={selectedDepartment}
                          onChange={(selectedOption) => setSelectedDepartment(selectedOption)}
                          isSearchable={true}
                          placeholder="Select Department"
                          isDisabled={true}
                          classNamePrefix="react-select"
                        />
                      </div>
                      <div className="cf-form-group">
                        <label htmlFor="division">Division</label>
                        <Select
                          options={divisions}
                          value={selectedDivision}
                          onChange={handleDivisionChange}
                          isSearchable={true}
                          placeholder="Select Division"
                          classNamePrefix="react-select"
                        />
                      </div>
                      <div className="cf-form-group">
                        <label htmlFor="unit">Unit</label>
                        <Select
                          key={`units-${selectedDivision?.id || 'none'}-${units.length}`}
                          options={units}
                          value={selectedUnit}
                          onChange={handleUnitChange}
                          isSearchable={true}
                          placeholder={units.length > 0 ? `Select Unit (${units.length})` : "Select Unit"}
                          isDisabled={viewMode && !(user?.user?.role_code === 'DESK' && fileToEdit?.status === 'pending')}
                          menuPortalTarget={document.body}
                          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                          classNamePrefix="react-select"
                        />
                      </div>
                      <div className="cf-form-group">
                        <label htmlFor="file_no">No.</label>
                        <input
                          type="text"
                          name="file_no"
                          id="file_no"
                          className="cf-input"
                          value={fileNumber}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  {/* Department Banner */}
                  {selectedDepartment && (
                    <div className="cf-department-banner">
                      <h2>{departments?.find((dept) => dept?.label === selectedDepartment?.label)?.label}</h2>
                    </div>
                  )}

                  {/* File Information Card */}
                  <div className="cf-card">
                    <div className="cf-card-header">
                      <span className="icon">📁</span>
                      <h5>File Information</h5>
                    </div>
                    <div className="cf-form-group" style={{ marginBottom: '16px' }}>
                      <label htmlFor="file_id">📄 File Number</label>
                      <input
                        type="text"
                        name="file_id"
                        id="file_id"
                        className="cf-input cf-file-number"
                        value={fileName}
                        onChange={handleChange}
                        disabled={true}
                      />
                    </div>
                    <div className="cf-form-group" style={{ marginBottom: '16px' }}>
                      <label htmlFor="file_subject">📝 File Subject</label>
                      <input
                        type="text"
                        name="file_subject"
                        id="file_subject"
                        className="cf-input"
                        value={formData.file_subject}
                        onChange={handleChange}
                        disabled={viewMode}
                        placeholder="Enter file subject..."
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label" htmlFor="remarks">File Matter:</label>
                      {/* <textarea name="remarks" id="remarks" className="form-control" rows="10" value={formData.remarks} onChange={handleChange} disabled={viewMode}></textarea> */}
                      <RemarksEditor formData={formData} setFormData={setFormData}
                        viewMode={viewMode} />
                      {/* <DocumentEditor file_id={formData?.file_id} fetchComments={fetchComments}
        viewMode={viewMode} approvalStatus={approvalStatus} setApprovalStatus={setApprovalStatus} selectedDepartment={selectedDepartment} receiver={formData?.receiver} id={fileToEdit?.id}/> */}
                    </div>
                    {/* Row 3 */}
                    <div className="row mb-3">
                      {/* <div className="col-md-6 d-flex align-items-center gap-2">
      <label className="form-label mb-0" htmlFor="receiver">File Recipient:</label>
      <input type="text" name="receiver" id="receiver" className="form-control" value={formData.receiver} onChange={handleChange} disabled={viewMode}/>
    </div> */}
                      {fileToEdit?.id && <div className="col-md-6 d-flex align-items-center gap-2">
                        <label className="form-label mb-0" htmlFor="date_added">Date:</label>
                        <input type="datetime-local" name="date_added" id="date_added" className="form-control" value={formData.date_added} onChange={handleChange} disabled={viewMode} />
                      </div>}
                      {/* <div className="col-md-6 d-flex align-items-center gap-2">
      <label className="form-label mb-0" htmlFor="current_status">Live File Location:</label>      
      <Select
                  options={departments}
                  value={selectedDepartment}
                  onChange={(selectedOption) => setSelectedDepartment(selectedOption)}
                  isSearchable={true}
                  isDisabled={true}
                  placeholder="Live File Location"
                /> 
    </div> */}
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
                    {/* <div className="row mb-3">
    <div className="col-md-12">
      <label className="form-label" htmlFor="remarks">Note File:</label> */}
                    {/* <textarea name="remarks" id="remarks" className="form-control" rows="10" value={formData.remarks} onChange={handleChange} disabled={viewMode}></textarea> */}
                    {/* <RemarksEditor formData={formData} setFormData={setFormData}
            viewMode={viewMode} /> */}
                    {/* <DocumentEditor file_id={formData?.file_id} fetchComments={fetchComments}
        viewMode={viewMode} approvalStatus={approvalStatus} setApprovalStatus={setApprovalStatus} selectedDepartment={selectedDepartment} receiver={formData?.receiver} id={fileToEdit?.id}/> */}
                    {/* </div>
  </div> */}

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
                                {att?.document_id ? `[${att.document_id}] ` : ""}{att?.filename}
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
                        {/* <label className="form-label">Attachments:</label>
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
                </div> */}
                        <div className="attachments-wrapper">
                          <label className="attachments-label">Attachments:</label>

                          <div className="attachments-row">
                            <label htmlFor="fileInput" className="btn btn-primary">
                              Choose Files
                            </label>

                            <input
                              type="file"
                              id="fileInput"
                              multiple
                              hidden
                              onChange={handleFileChange}
                            />

                            {file.map((file, index) => (
                              <div key={index} className="file-chip">
                                <span className="file-name" title={file.name}>
                                  {file.name}
                                </span>
                                <button
                                  type="button"
                                  className="file-remove"
                                  onClick={() => removeFile(index)}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>}
                    {/* <div className="row mb-3">
              <div className="col-md-12 d-flex align-items-center gap-2">
                <label className="form-label mb-0" htmlFor="receiver">Forwarded To:</label>
              
                <Select
                  options={departments}
                  name="receiver"
                  value={selectedReceiver}
                  onChange={(selectedOption) => setSelectedReceiver(selectedOption)}
                  isSearchable={true}
                  placeholder="Search or Select Department"
                  isDisabled={viewMode}
                />
              </div>
            </div> */}
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
                        {/* {(user?.user?.role_id == 1 || user?.user?.role_id == 2) && (
      <button 
        className="btn btn-primary"
        onClick={() => handleEditClick(fileToEdit)}
      >
        EDIT FILE
      </button>
    )} */}
                        {(hasPermission("edit")) && (
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
                    {/* Show button if not in viewMode, OR if DESK user with DRAFT/pending file */}
                    {(!viewMode || (hasRole('DESK') && (fileToEdit?.status === 'DRAFT' || fileToEdit?.status === 'pending'))) && (
                      <form onSubmit={(e) =>
                        handleCreateFile({
                          e,
                          mode: fileToEdit?.id ? "edit" : "create",
                          formData,
                          fileToEdit: fileToEdit || null,
                          selectedDepartment,
                          selectedReceiver,
                          selectedDivision,
                          selectedUnit,
                          approvalStatus,
                          fileName,
                          setFileNumber,
                          file,
                          existingAttachments: attachments, // Pass forwarded attachments
                          // Navigate to Created Files tab after file creation
                          stayOnPage: false
                        })
                      }>
                        <div className="d-flex justify-content-center mt-4 gap-3">
                          {/* For DESK users with pending files: show Create File button */}
                          {hasRole('DESK') && fileToEdit?.status === 'pending' ? (
                            <div>
                              <button className="btn btn-success px-5" type="submit">
                                Create File
                              </button>
                            </div>
                          ) : (
                            <div>
                              <button className="btn btn-success px-5" type="submit">
                                {fileToEdit?.id ? 'Update' : 'Create'}
                              </button>
                            </div>
                          )}

                          {/* <button
                    disabled={!fileToEdit?.id}
                    onClick={(e) =>
                      handleSendFile({
                        e,
                        fileToEdit,
                        selectedReceiver
                      })}
                  >
                    Send File
                  </button> */}
                          {fileToEdit?.id && fileToEdit?.status !== 'pending' && <div>
                            <button className="btn btn-secondary px-5" onClick={handleCancel}>
                              Cancel
                            </button>
                          </div>}

                        </div>
                      </form>
                    )}


                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {showModal && <ReusableModal
        showModal={showModal}
        setShowModal={setShowModal}
        title="Confirm High Priority"
        message="Are you sure you want to request admin approval to mark this file as High Priority?"
        confirmText="Send High Priority Request"
        confirmVariant="danger"
        onConfirm={() => confirmHighPriority(fileToEdit?.id)} />}
    </>
  )
}
