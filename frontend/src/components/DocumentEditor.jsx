import React, { useEffect, useRef, useState } from 'react'
import { Editor } from "@tinymce/tinymce-react";
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils/dbProvider';

export default function DocumentEditor({file_id,fetchComments,viewMode, approvalStatus, setApprovalStatus, selectedDepartment, receiver, id}) {

    const editorRef = useRef(null);
    const fileInputRef = useRef(null);

     const BASE_URL = import.meta.env.VITE_API_URL 

    const { user } = useAuth();

     const [selectedFiles, setSelectedFiles] = useState([]); 

    const onFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setSelectedFiles(files); // ✅ Show selected filenames immediately

      
    
    // Reset input value so same file can be selected again if needed
    e.target.value = null;
  };

    const [comment, setComment] = useState('');
  // const [status, setStatus] = useState('');

  

  useEffect(() => {
  console.log("Loaded file_id:", file_id);
  }, [file_id])

  const handleSave = async () => {
    if (editorRef.current) {
      const content = editorRef.current.getContent();

    //     if (!content.trim()) {
    //   setStatus('Comment cannot be empty');
    //   return;
    // }
      if (!content || content.trim() === '' || content === '<p><br></p>') {
      alert('❌ Comment cannot be empty.');
      return;
    }

      console.log("Document content:", content);
      // const user = JSON.parse(localStorage.getItem("user"));
       const userId = user?.user?.id;
     try{
      const formData = new FormData();

    formData.append('file_id', file_id);
    formData.append('user_id', userId);
    formData.append('comment', content);

    // Append each selected file to formData (key must be "file" to match multer)
    selectedFiles.forEach(file => {
      formData.append('file', file);
    });
      // send to backend
      const response = await fetch(`${BASE_URL}/api/comments`, {
        method: "POST",
        // headers: { "Content-Type": "application/json" },
        body: formData,
        // body: JSON.stringify({
        //   file_id: file_id,         // Replace with actual file ID
        //   user_id: userId,         // Replace with actual user ID
        //   comment: content    // Use 'comment' key to match your DB field
        // }),
      });

        const data = await response.json();
        console.log('data=======',data)
      if (response.ok) {
        alert('✅ Comment added!');
        setComment('');
        fetchComments();

        setSelectedFiles([]); // clear files after upload

        
      const eventData = {
        event_type: 'commented',
        file_id: id,
        user_id: user?.user?.id,
        origin: selectedDepartment?.value || '',
        forwarded_to: receiver,
        approved_by: '',
        edited_by: '',
        commented_by: user?.user?.username
     };
     console.log('event',eventData)
      const response_ = await fetch(`${BASE_URL}/api/file-events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"  // ✅ Add this line
     },
      body: JSON.stringify(eventData)
      // NOTE: Don't set Content-Type manually for FormData
    });

    const result_ = await response_.json()
    console.log('result',result_)

      } else {
        alert(`❌ Failed: ${data.error || 'Unknown error'}`);
      }

    }
    catch (error) {
      console.error('Error submitting comment:', error);
      // setStatus('❌ Failed to connect to server');
    }
  };
}


  const handleApprovalStatusChange = (e) => {
    setApprovalStatus(e.target.value);
  };


   const handleEditorInit = (editor) => {
    // Register custom "Attach File" button
    editor.ui.registry.addButton('attachFileButton', {
      icon: 'upload',
      tooltip: 'Attach File',
      onAction: () => {
        const input = document.createElement('input');
        input.type = 'file';

        input.onchange = async () => {
          const file = input.files[0];
          const formData = new FormData();
          formData.append('file', file);

          try {
            const res = await fetch(`${BASE_URL}/api/upload`, {
              method: 'POST',
              body: formData,
            });

            const data = await res.json();

            const fileUrl = data.url;

            editor.insertContent(
              `<a href="${fileUrl}" target="_blank" rel="noopener noreferrer">${file.name}</a>`
            );
          } catch (err) {
            console.error('File upload failed', err);
          }
        };

        input.click();
      },
    });
  };


  const handleEditorChange = (content) => {
     setComment(content);
  };
 
  
  return (
    <>
     <div style={{ maxWidth: "900px", margin: "auto", padding: "20px" }}>
      {/* <h2>Document Editor</h2> */}

      <Editor
        // onInit={(evt, editor) => (editorRef.current = editor)}
        tinymceScriptSrc="/tinymce/tinymce.min.js"  // 👈 ensures local TinyMCE is loaded
        onInit={(evt, editor) => {
        editorRef.current = editor;
        // Register custom button
        
      }}
        initialValue=""
        // apiKey="54ugn72qi4pzas32feag7mcosn0lftniz5opr5mf8qaqnh1c"
        init={{
          height: 500,
          menubar: true,
          // plugins: [
          //   "advlist autolink lists link image charmap preview anchor",
          //   "searchreplace visualblocks code fullscreen",
          //   "insertdatetime media table help wordcount",
          // ],
          plugins: [
      "advlist", "autolink", "lists", "link", "image", "charmap", "preview", "anchor",
      "searchreplace", "visualblocks", "code", "fullscreen",
      "insertdatetime", "media", "table", "help", "wordcount"
    ],
          toolbar: "undo redo | formatselect | attachFileButton bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
    //       setup: (editor) => {
    //   handleEditorInit(editor);
    // },
        license_key: 'gpl'
    
        }}
        
        disabled={viewMode}
        value={comment}                // ✅ Bind to state
        onEditorChange={handleEditorChange} // ✅ Update state on typing
        
    
    />
      
      {!viewMode && <button className="btn btn-primary mt-3" onClick={handleSave}>
        Add Comment
      </button>}
       {/* <p>{status}</p> */}
       <br /><br />
       <label htmlFor="approvalStatus">Select Approval Status:</label>
        <select id="approvalStatus" name="approvalStatus" 
           value={approvalStatus} onChange={handleApprovalStatusChange}
           required 
          //  disabled={user?.user?.role_id == 3 || viewMode || user?.user?.role_id == 2}
           disabled={viewMode || hasPermission('approve') == false}
           >
          <option value="">-- Select Status --</option>
          <option value="approved">✅ Approved</option>
          <option value="rejected">❌ Rejected</option>
          <option value="pending">⏳ Pending</option>
        </select>
    </div>
     {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={onFileChange}
        multiple
        id="file"
        name="file"
      />
      {selectedFiles.length > 0 && (
        <div style={{ marginTop: '10px', color: 'red' }}>
          <p><strong>Selected files:</strong></p>
          <ul>
            {selectedFiles.map((file, idx) => (
              <li key={idx}>📁 {file.name}</li>
            ))}
          </ul>
        </div>
      )}
      </>
  )
}
