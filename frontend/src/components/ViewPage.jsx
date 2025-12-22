import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Select from 'react-select';
import useFileSave from "../hooks/useFileSave";

export default function ViewPage() {

  const BASE_URL = import.meta.env.VITE_API_URL
  const location = useLocation()
  const { fileToEdit, data } = location.state || {};

  const [selectedFiles, setSelectedFiles] = useState([]);

  const [approvalStatus, setApprovalStatus] = useState('pending');

  const [departments, setDepartments] = useState([])

  const [selectedReceiver, setSelectedReceiver] = useState(null);

  const [file, setFile] = useState([])

  const [mainFileName, setMainFileName] = useState('')


  const [documents, setDocuments] = useState(data)


  const [attachments, setAttachments] = useState({});

  const [openFolder, setOpenFolder] = useState(null);

  const [notes, setNotes] = useState([])

  const [note, setNote] = useState('');

  const { user } = useAuth();

  const { showToast } = useToast();

  console.log('attach', data)

  const getIcon = (type) => {
    if (type?.includes("pdf")) return "📄";
    if (type?.includes("jpg")) return "🖼️";
    if (type?.includes("word")) return "📝";
    // return "📁";
    return "📄";
  };




  const handleFileChange = (e) => {
    setFile(Array.from(e.target.files));
    //  setDocuments(prev => [...prev, ...file]);   // append below
    // const selectedFiles = Array.from(e.target.files);
    // setFile((prev) => [...prev, ...selectedFiles]);
  };


  // const handleUpload = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   setUploading(true);

  //   const formData = new FormData();
  //   formData.append("file", file);
  //   formData.append("file_id", fileId);

  //   const res = await fetch(`${BASE_URL}/file/upload-attachment`, {
  //     method: "POST",
  //     body: formData,
  //   });

  //   setUploading(false);

  //   if (res.ok) {
  //     // refreshAttachments();   // reload attachments after upload
  //   }
  // };


  const handleNewAttachment = (newFiles) => {
    // console.log('new',newFiles)
    setDocuments(prev => [...prev, ...newFiles]);
  };


  const handleChangeNote = (e) => {
    setNote(e.target.value)
  }

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
      // console.log("data=======", data);

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



  const fetchNotes = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/documents/${fileToEdit?.id}/notes`);

      //         if (!response.ok) {
      //   const text = await response.text(); // Get raw error message
      //   throw new Error(`Server returned ${res.status}: ${text}`);
      // }

      const data = await response.json();
      // console.log('notes========',data)
      setNotes(data)
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  };


  useEffect(() => {
    if (!fileToEdit?.id) return;

    fetchNotes();
  }, [fileToEdit?.id]);


  const handleUpload = async () => {
    if (file.length === 0) {
      alert("Please choose at least one file");
      return;
    }

    const mainFile = file[0];
    //  setMainFileName(mainFile.name); 
    //  const folderName = mainFile.name;

    //  const fileName = file[0].name.split(".")[0]; 

    //  alert(fileName)

    const fileName = localStorage.getItem("fileName");

    // const fileNameWithoutExt = mainFile.name.split(".").slice(0, -1).join(".");

    const formData = new FormData();
    formData.append("fileName", fileName); // folder name = file name
    // formData.append("recordId", fileToEdit?.id);
    formData.append("department", user?.user?.department);
    file.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await fetch("http://localhost:5000/uploadStep2", {
        method: "POST",
        body: formData, // <-- MUST be inside body
        // ❌ DO NOT set Content-Type
      });
      alert(res.status)
      if (!res.ok) {
        throw new Error("Server returned " + res.status);
      }

      const data = await res.json();

      console.log('first', data)

      // Add uploaded files to UI list
      // setDocuments((prev) => [...prev, ...data.files]);

      // Reset selected files
      setFile([]);
      document.getElementById("file").value = "";

      fetchAttachments(fileName);
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + err.message);
    }
  };



  const fetchAttachments = async (fileName) => {

    const res = await fetch(`${BASE_URL}/attachments/${encodeURIComponent(fileName)}`)
    const data = await res.json()
    console.log('dat==', data)
    setAttachments(data)

  };

  // useEffect(() => {
  //   if (!mainFileName) return; // folder name = main uploaded filename

  //   fetch(`${BASE_URL}/documents/${mainFileName}`)
  //     .then((res) => res.json())
  //     .then((data) => setDocuments(data));
  // }, [mainFileName]);

  // useEffect(() => {
  //   const folderName = localStorage.getItem("folderName");
  //   if (!folderName) return; // No folder saved yet
  //   alert(folderName)

  //   fetch(`${BASE_URL}/documents/${folderName}`)
  //     .then(res => res.json())
  //     .then(data => setDocuments(data));
  // }, []);

  // const fetchDocuments = (folderName) => {
  //   fetch(`${BASE_URL}/documents/${folderName}`)
  //     .then(res => res.json())
  //     .then(data => setDocuments(data))
  //     .catch(err => console.error(err));
  // };
  // useEffect(() => {
  //   const folderName = localStorage.getItem("folderName");
  //   if (!folderName) return;

  //   fetchAttachments(folderName);
  // }, []);

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


  }, [fileToEdit?.id]);


  const toggleFolder = (department) => {
    setOpenFolder(prev =>
      prev === department ? null : department
    );
  };


  // const isImageFile = (fileName) => {
  //   return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  // };

  const isImageFile = (fileName) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const extension = fileName.split('.').pop().toLowerCase();
    return imageExtensions.includes(extension);
  };


  const { handleSave } = useFileSave({
    BASE_URL,
    user,
    showToast
    // generateFileName
  });

  useEffect(() => {
    console.log('fileName', fileToEdit?.file_id)
    fetchAttachments(fileToEdit?.file_id)
  }, [fileToEdit?.file_id])


  const renderThumbnail = (url, path) => {
    const ext = path.split(".").pop().toLowerCase();

    if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
      return <img src={url} alt="preview" />;
    }

    if (ext === "pdf") {
      return (
        <iframe
          src={`${url}#page=1`}
          title="PDF Preview"
        />
      );
    }

    // return <span className="no-preview">No Preview</span>;
    return (
      <div className="no-preview">
        <span>📄</span>
        <small>No preview</small>
      </div>
    );
  };

  const updateFileStatus = async (fileId, status) => {
    try {
      const response = await fetch(`${BASE_URL}/api/files/${fileId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // include auth header if you use JWT
          // "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update status");
      }

      const data = await response.json();
      console.log("Status updated:", data);
      alert(`File ${status.toLowerCase()} successfully`);
    } catch (err) {
      console.error("Error updating file status:", err);
      alert(err.message);
    }
  };



  return (
    <>
      <div>File Matter: {fileToEdit?.remarks}</div>
      <div>{fileToEdit?.file_subject}</div>
      <div className="attachments-box">
        <h4>{`${fileToEdit?.file_id} ${fileToEdit?.department} Initial Attachments`}</h4>
        <div className="attachments-container files-section">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="attachment-item"
              onClick={() => {
                const fileUrl = doc.path.startsWith("blob:")
                  ? doc.path
                  : `${BASE_URL}/${doc.path}`;
                window.open(fileUrl, "_blank");
              }}
              title={doc.filename}
            >
              {/* 🔍 Preview */}
              <div className="preview-box">
                {renderThumbnail(
                  doc.path.startsWith("blob:")
                    ? doc.path
                    : `${BASE_URL}/${doc.path}`,
                  doc.path
                )}
              </div>

              {/* 📄 File name */}
              <p className="file-name">{doc.filename}</p>
            </div>
          ))}
        </div>
        <div className="folders-section">
          <h4>{user?.user?.department}</h4>
          {Object.keys(attachments).length === 0 && (
            <p>No attachments uploaded</p>
          )}

          <div className="folder-container">
            {Object.entries(attachments).map(([department, files]) => (
              <div key={department} className="folder">
                <h4 onClick={() => toggleFolder(department)}
                  style={{ cursor: "pointer" }}>📁 {department}</h4>

                {/* Show files ONLY if folder is open */}
                {openFolder === department && (
                  <div className="folder-files">
                    {files.map((file, index) => (<>
                      {/* const isImage = isImageFile(file.file_name); */}
                      <a key={index}

                        href={`http://localhost:5000${file.file_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="file-card"
                      >
                        {/* <div className="file-icon">📄</div>
                        <div className="file-name">{file.file_name}</div> */}

                        <div className="file-preview-container">
                          {isImageFile(file.file_name) ? (
                            <img
                              src={`http://localhost:5000${file.file_path}`}
                              alt={file.file_name}
                              className="file-thumbnail"
                              style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="file-icon" style={{ fontSize: '2rem' }}>📄</div>
                          )}
                        </div>
                        <div className="file-name">{file.file_name}</div>
                        {/* {isImageFile(file.file_name) ? (
                          <img
                            src={fileUrl}
                            alt={file.file_name}
                            className="file-thumbnail"
                          />
                        ) : (
                          <div className="file-icon">📄</div>
                        )}

                        <div className="file-name">{file.file_name}</div> */}

                      </a>
                    </>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>








      {/* Upload Section Below */}

      <div className="col-md-12">
        <h4>Attachments:</h4>
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
            //        onChange={(e) => {
            //   const selectedFiles = Array.from(e.target.files);

            //   const attachments = selectedFiles.map(file => ({
            //     id: Date.now() + Math.random(),
            //     filename: file.name,
            //     path: URL.createObjectURL(file),
            //   }));
            //     setFile(selectedFiles);
            //   handleNewAttachment(attachments); // send array
            // }}
            style={{ display: 'none' }}
          />
          <div className="form-control bg-white">
            {file?.length > 0
              ? file?.map((file) => file.name).join(', ')
              : "No files selected"}
          </div>
        </div>
      </div>
      <div className="upload-btn-wrapper"><button className="btn btn-primary" onClick={handleUpload}>UPLOAD</button></div>
      <div className="col-md-12 bg-light border p-4"><div className="row mb-3">
        <h3>Notes</h3>
        {notes.map(note => (
          <div key={note?.id} className="note-block">
            {console.log('note', note)}
            <p>{note?.note}</p>
            <small>
              — <strong>{note?.username}</strong>, {note?.department} {new Date(note?.created_at).toLocaleString()}
            </small>
          </div>
        ))}

        <textarea name="note" id="note" className="form-control"
          rows="5"
          value={note}
          onChange={handleChangeNote}
        // disabled={viewMode}
        >

        </textarea>
        <button className="btn btn-primary mt-3" onClick={handleSaveNote}>
          Add Note
        </button>
      </div></div>
      <div className="row mb-3">
        <div className="col-md-6 d-flex align-items-center gap-2 department-wrapper">
          <label className="form-label mb-0" htmlFor="department">Department</label>
          <Select
            options={departments}
            value={selectedReceiver}
            onChange={(selectedOption) => setSelectedReceiver(selectedOption)}
            isSearchable={true}
            placeholder="Search or Select Department"
          // isDisabled={viewMode}
          />

        </div>
      </div>
      {fileToEdit.status !== "APPROVED" && <div className="update-send-container">
        <button className="update-send-btn btn btn-primary" onClick={(e) =>
          handleSave({
            e,
            mode: "send",
            // formData,
            fileToEdit,
            selectedReceiver,
            // selectedDivision,
            // selectedUnit,
            // approvalStatus,
            // fileName,
            // setFileNumber
          })
        }>
          Update & Send
        </button>
      </div>}
      {user?.user?.role_id == 1 && <div className="d-flex justify-content-center gap-3 mt-3">
        <button
          className="btn btn-success d-flex align-items-center gap-2"
          onClick={() => updateFileStatus(fileToEdit?.id, "APPROVED")}>
          <i className="bi bi-check-circle"></i>
          Approve
        </button>

        <button
          className="btn btn-danger d-flex align-items-center gap-2"
          onClick={() => updateFileStatus(fileToEdit?.id, "REJECTED")}>
          <i className="bi bi-x-circle"></i>
          Reject
        </button>
      </div>}
    </>
  );


}
