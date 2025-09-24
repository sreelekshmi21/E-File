import React, { useEffect, useRef, useState } from 'react'
import { Editor } from "@tinymce/tinymce-react";

export default function DocumentEditor({file_id,fetchComments,viewMode, approvalStatus, setApprovalStatus}) {

    const editorRef = useRef(null);
    const fileInputRef = useRef(null);

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
      const user = JSON.parse(localStorage.getItem("user"));
       const userId = user.id;
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
      const response = await fetch("http://localhost:5000/api/comments", {
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
        fetchComments()

        setSelectedFiles([]); // clear files after upload
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
            const res = await fetch('http://localhost:5000/api/upload', {
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



  return (
    <>
     <div style={{ maxWidth: "900px", margin: "auto", padding: "20px" }}>
      <h2>Document Editor</h2>

      <Editor
        // onInit={(evt, editor) => (editorRef.current = editor)}
        onInit={(evt, editor) => {
        editorRef.current = editor;
        // Register custom button
        editor.ui.registry.addButton('attachFileButton', {
          text: 'Attach File', // 👈 will show button text
          tooltip: 'Upload and attach file',
          onAction: () => {
            // alert('File upload logic here!');
             fileInputRef.current.click();  // Trigger file picker dialog
          },
        });
      }}
        initialValue=""
        apiKey="54ugn72qi4pzas32feag7mcosn0lftniz5opr5mf8qaqnh1c"
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
          toolbar: "undo redo | formatselect | attachFileButton bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help"
        }}
        disabled={viewMode}
      />
      
      {!viewMode && <button className="btn btn-primary mt-3" onClick={handleSave}>
        Add Comment
      </button>}
       {/* <p>{status}</p> */}
       <br /><br />
       <label htmlFor="approvalStatus">Select Approval Status:</label>
        <select id="approvalStatus" name="approvalStatus" 
           value={approvalStatus} onChange={handleApprovalStatusChange}
           required>
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
