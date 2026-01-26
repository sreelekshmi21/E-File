import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Select from 'react-select';
import useFileSave from "../hooks/useFileSave";
import ReusableModal from '../utils/ReusableModal';

export default function ViewPage() {

  const BASE_URL = import.meta.env.VITE_API_URL
  const location = useLocation()
  const { fileToEdit, data } = location.state || {};

  const navigate = useNavigate();

  const [selectedFiles, setSelectedFiles] = useState([]);

  const [approvalStatus, setApprovalStatus] = useState('pending');

  const [departments, setDepartments] = useState([])

  const [selectedReceiver, setSelectedReceiver] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sections, setSections] = useState([]);
  const [usersList, setUsersList] = useState([]);

  const [file, setFile] = useState([])

  const [mainFileName, setMainFileName] = useState('')

  const [showModal, setShowModal] = useState(false);


  const [documents, setDocuments] = useState(data)


  const [attachments, setAttachments] = useState({});

  const [openFolder, setOpenFolder] = useState(null);

  const [notes, setNotes] = useState([])

  const [note, setNote] = useState('');

  const { user } = useAuth();

  const { showToast } = useToast();

  // Mobile sidebar state - removed for ViewPage as it doesn't use sidebar

  // Check if current user "owns" the file (can forward/edit it)
  // User owns if: file is DRAFT and user created it, OR user is the current target recipient
  const isFileOwner = (() => {
    if (!fileToEdit || !user?.user?.department) return false;
    const userDept = user.user.department;
    const userId = user.user.id;
    const isDraft = fileToEdit.status === 'DRAFT';

    // For DRAFT files, only the creator can edit/forward
    if (isDraft) {
      // Check created_by_user_id if available, otherwise fall back to sender department
      if (fileToEdit.created_by_user_id) {
        return fileToEdit.created_by_user_id === userId;
      }
      return fileToEdit.sender === userDept;
    }

    // For sent files, check who the file was sent TO
    // If target_user_id is set, only that specific user can forward
    if (fileToEdit.target_user_id) {
      return fileToEdit.target_user_id === userId;
    }

    // If no specific user was targeted, check department match
    // But also ensure the current user didn't just send this file
    // (sender should not be able to forward until it comes back)
    if (fileToEdit.receiver === userDept) {
      // If sender matches user's department, this is a same-dept scenario
      // The file should only be editable if it wasn't sent BY this user
      // We don't have sender_user_id, so we allow department-level access
      return true;
    }

    return false;
  })();

  console.log('attach', data)

  const getIcon = (type) => {
    if (type?.includes("pdf")) return "📄";
    if (type?.includes("jpg")) return "🖼️";
    if (type?.includes("word")) return "📝";
    // return "📁";
    return "📄";
  };




  const handleFileChange = (e) => {
    // setFile(Array.from(e.target.files));
    //  setDocuments(prev => [...prev, ...file]);   // append below
    // const selectedFiles = Array.from(e.target.files);
    // setFile((prev) => [...prev, ...selectedFiles]);
    const selectedFiles = Array.from(e.target.files);

    setFile((prevFiles) => [...prevFiles, ...selectedFiles]);

    // reset input so same file can be selected again if needed
    e.target.value = null
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
      const res = await fetch(`${BASE_URL}/uploadStep2`, {
        method: "POST",
        body: formData, // <-- MUST be inside body
        // ❌ DO NOT set Content-Type
      });
      alert("File uploaded successfully")
      if (!res.ok) {
        throw new Error("Server returned " + res.status);
      }

      const data = await res.json();

      console.log('first', data)

      // Add uploaded files to UI list
      // setDocuments((prev) => [...prev, ...data.files]);

      // Reset selected files
      setFile([]);
      document.getElementById("fileInput").value = "";

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

  // Fetch Sections (Divisions) when Department changes
  useEffect(() => {
    if (!selectedReceiver?.id) {
      setSections([]);
      setSelectedSection(null);
      return;
    }
    const fetchSections = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/departments/${selectedReceiver.id}/divisions`);
        const data = await res.json();
        const options = data.map(sec => ({
          value: sec.code, // or sec.name if you prefer
          label: sec.name,
          id: sec.id
        }));
        setSections(options);
        setSelectedSection(null);
      } catch (err) {
        console.error("Failed to fetch sections:", err);
        setSections([]);
      }
    };
    fetchSections();
  }, [selectedReceiver]);

  // Fetch Users when Section changes
  useEffect(() => {
    if (!selectedSection?.value || !selectedReceiver?.value) {
      setUsersList([]);
      setSelectedUser(null);
      return;
    }
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/users?department=${selectedReceiver.value}&section=${selectedSection.value}`);
        const data = await res.json();
        const options = data.map(u => ({
          value: u.id,
          label: u.designation
            ? `${u.fullname || u.username} (${u.designation})`
            : (u.fullname || u.username)
        }));
        setUsersList(options);
        setSelectedUser(null);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setUsersList([]);
      }
    };
    fetchUsers();
  }, [selectedSection, selectedReceiver]);


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

  // Check if file is an ODF (OpenDocument Format) file
  const isOdfFile = (fileName) => {
    const odfExtensions = ['odt', 'ods', 'odg', 'odp'];
    const extension = fileName.split('.').pop().toLowerCase();
    return odfExtensions.includes(extension);
  };

  // Get file extension
  const getFileExtension = (fileName) => {
    return fileName.split('.').pop().toLowerCase();
  };

  // Generate ViewerJS URL for ODF files
  const getViewerJsUrl = (fileUrl) => {
    // ViewerJS expects the file path relative to ViewerJS folder
    // Format: /ViewerJS/#../../uploads/path/to/file.odt
    const encodedPath = encodeURIComponent(fileUrl);
    return `${BASE_URL}/ViewerJS/#${fileUrl.replace(BASE_URL, '..')}`;
  };


  const { handleSendFile } = useFileSave({
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

    // ODF files - show embedded preview using ViewerJS iframe
    if (["odt", "ods", "odg", "odp"].includes(ext)) {
      // Construct ViewerJS URL for the file
      // The path needs to be relative from ViewerJS folder
      const relativePath = url.replace(BASE_URL, '..');
      const viewerUrl = `${BASE_URL}/ViewerJS/#${relativePath}`;

      return (
        <iframe
          src={viewerUrl}
          title="ODF Preview"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            pointerEvents: 'none' // Disable interaction in thumbnail, will open in new tab on click
          }}
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

  const removeFile = (indexToRemove) => {
    setFile((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleTimeline = (file) => {
    // e.preventDefault();
    navigate('/filetimeline', {
      state: {
        fileId: file?.id,
        fileName: file?.file_id
      }
    })
  }


  const handleCancel = () => {
    navigate('/fileinbox')
  }


  return (
    <>
      <div className="container-fluid mt-4">
        <div className="row">
          <div className="col-12">
            <div>File Matter: <span dangerouslySetInnerHTML={{ __html: fileToEdit?.remarks || '' }} /></div>
            <div>{fileToEdit?.file_subject}</div>
            <div className="attachments-box fw-bold">
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

                      // For ODF files, use ViewerJS
                      if (isOdfFile(doc.filename || doc.path)) {
                        const viewerUrl = `${BASE_URL}/ViewerJS/#../${doc.path}`;
                        window.open(viewerUrl, "_blank");
                      } else {
                        window.open(fileUrl, "_blank");
                      }
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
                    <p>Click the FileName to  open the file</p>
                  </div>
                ))}
              </div>
              <div className="folders-section">
                <h4>{user?.user?.department}</h4>
                {Object.keys(attachments).length === 0 && (
                  <p>No additional attachments uploaded</p>
                )}

                <div className="folder-container">
                  {Object.entries(attachments).map(([department, files]) => (
                    <div key={department} className="folder">
                      <h4 onClick={() => toggleFolder(department)}
                        style={{ cursor: "pointer" }}>📁 {department}</h4>

                      {/* Show files ONLY if folder is open */}
                      {openFolder === department && (
                        <div className="folder-files">
                          {files.map((file, index) => {
                            const fileUrl = `${BASE_URL}${file.file_path}`;
                            const isOdf = isOdfFile(file.file_name);
                            const viewerUrl = isOdf ? `${BASE_URL}/ViewerJS/#..${file.file_path}` : fileUrl;

                            return (
                              <a
                                key={index}
                                href={isOdf ? undefined : viewerUrl}
                                onClick={(e) => {
                                  if (isOdf) {
                                    e.preventDefault();
                                    window.open(viewerUrl, "_blank");
                                  }
                                }}
                                target="_blank"
                                rel="noreferrer"
                                className="file-card"
                              >
                                <div className="file-preview-container">
                                  {isImageFile(file.file_name) ? (
                                    <img
                                      src={fileUrl}
                                      alt={file.file_name}
                                      className="file-thumbnail"
                                      style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                                    />
                                  ) : isOdf ? (
                                    <iframe
                                      src={viewerUrl}
                                      title="ODF Preview"
                                      style={{
                                        width: '100%',
                                        height: '100px',
                                        border: 'none',
                                        pointerEvents: 'none'
                                      }}
                                    />
                                  ) : (
                                    <div className="file-icon" style={{ fontSize: '2rem' }}>📄</div>
                                  )}
                                </div>
                                <div className="file-name">{file.file_name}</div>
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>








            {/* Upload Section Below */}

            <div className="col-md-12">
              {/* <h4>Attachments:</h4>
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
                <label className="attachments-label">Additional Attachments:</label>

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
            <div className="upload-btn-wrapper"><button className="btn btn-primary" onClick={handleUpload}>UPLOAD</button></div>
            <div className="col-md-12 bg-light border p-4"><div className="row mb-3">
              <h3>Notes</h3>
              {notes.map(note => (
                <div key={note?.id} className="note-block">
                  {/* {console.log('note', note)} */}
                  <p style={{ whiteSpace: 'pre-wrap' }}>{(() => {
                    const text = note?.note || '';
                    const parts = text.split(/(\[\[.*?\|.*?\]\])/g);
                    return parts.map((part, index) => {
                      const match = part.match(/^\[\[(.*?)\|(.*?)\]\]$/);
                      if (match) {
                        const [_, name, url] = match;
                        return (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#007bff', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }}
                            title={`Open ${name}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            📎 {name}
                          </a>
                        );
                      }
                      return part;
                    });
                  })()}</p>
                  <small>
                    — <strong>{note?.username}</strong>, {note?.department} {new Date(note?.created_at).toLocaleString()}
                  </small>
                </div>
              ))}

              <div className="mb-2">
                <label className="form-label">Tag a File:</label>
                <select
                  className="form-select"
                  onChange={(e) => {
                    if (e.target.value) {
                      const [name, url] = e.target.value.split('|||');
                      setNote(prev => prev + ` [[${name}|${url}]] `);
                      e.target.value = ''; // Reset selection
                    }
                  }}
                >
                  <option value="">-- Select a file to tag --</option>
                  {documents.map((doc, i) => {
                    const url = doc.path.startsWith("blob:") ? doc.path : `${BASE_URL}/${doc.path}`;
                    return <option key={`doc-${i}`} value={`${doc.filename}|||${url}`}>{doc.filename} (Initial)</option>
                  })}
                  {Object.entries(attachments).map(([dept, files]) =>
                    files.map((f, i) => (
                      <option key={`att-${dept}-${i}`} value={`${f.file_name}|||${BASE_URL}${f.file_path}`}>
                        {f.file_name} ({dept})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <textarea name="note" id="note" className="form-control"
                rows="5"
                value={note}
                onChange={handleChangeNote}
              // disabled={viewMode}
              >

              </textarea>
              <div className="d-flex justify-content-center">
                <button className="btn btn-primary mt-3 add-note-btn" onClick={handleSaveNote}>
                  Add Note
                </button>
              </div>
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
              <div className="col-md-3 d-flex align-items-center gap-2">
                <label className="form-label mb-0">Section</label>
                <Select
                  options={sections}
                  value={selectedSection}
                  onChange={setSelectedSection}
                  isSearchable={true}
                  placeholder="Select Section"
                  isDisabled={!selectedReceiver}
                />
              </div>
              <div className="col-md-3 d-flex align-items-center gap-2">
                <label className="form-label mb-0">User</label>
                <Select
                  options={usersList}
                  value={selectedUser}
                  onChange={setSelectedUser}
                  isSearchable={true}
                  placeholder="Select User"
                  isDisabled={!selectedSection}
                />
              </div>
            </div>
            {isFileOwner && <div className="update-send-container">
              <button className="update-send-btn btn btn-primary"
                onClick={(e) =>
                  handleSendFile({
                    e,
                    fileToEdit,
                    selectedReceiver,
                    selectedSection,
                    selectedUser
                  })}>
                Update & Send
              </button>
            </div>}
            {!isFileOwner && <div className="alert alert-info mt-3">
              <strong>Read-only:</strong> This file is currently with another department. You can view it but cannot forward or edit.
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
            <div className="container d-flex justify-content-between">
              <div style={{ marginTop: "20px" }}><button
                className="btn btn-warning px-5"
                onClick={handleHighPriority}>Request High Priority</button></div>
              <div className="ms-auto">
                <button
                  className="btn btn-secondary px-5"
                  onClick={() => handleTimeline(fileToEdit)}
                >
                  File Timeline
                </button>
              </div>
              <div>
                <button className="btn btn-secondary px-5" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
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
  );
}

