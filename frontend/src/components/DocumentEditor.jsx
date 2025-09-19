import React, { useEffect, useRef, useState } from 'react'
import { Editor } from "@tinymce/tinymce-react";

export default function DocumentEditor({file_id,fetchComments,viewMode, approvalStatus, setApprovalStatus}) {

    const editorRef = useRef(null);
    const [comment, setComment] = useState('');
  // const [status, setStatus] = useState('');

  console.log('approval status',approvalStatus)

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
      // send to backend
      const response = await fetch("http://localhost:5000/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_id: file_id,         // Replace with actual file ID
          user_id: userId,         // Replace with actual user ID
          comment: content    // Use 'comment' key to match your DB field
        }),
      });

        const data = await response.json();
        console.log('data=======',data)
      if (response.ok) {
        alert('✅ Comment added!');
        setComment('');
        fetchComments()
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


  return (
     <div style={{ maxWidth: "900px", margin: "auto", padding: "20px" }}>
      <h2>Document Editor</h2>

      <Editor
        onInit={(evt, editor) => (editorRef.current = editor)}
        initialValue=""
        apiKey="54ugn72qi4pzas32feag7mcosn0lftniz5opr5mf8qaqnh1c"
        init={{
          height: 500,
          menubar: true,
          plugins: [
            "advlist autolink lists link image charmap preview anchor",
            "searchreplace visualblocks code fullscreen",
            "insertdatetime media table help wordcount",
          ],
          toolbar:
            "undo redo | formatselect | " +
            "bold italic underline | alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | removeformat | help",
        }}
        disabled={viewMode}
      />
      
      {!viewMode && <button className="btn btn-primary mt-3" onClick={handleSave}>
        Add Comment
      </button>}
       {/* <p>{status}</p> */}
       <br /><br />
       <label for="approvalStatus">Select Approval Status:</label>
        <select id="approvalStatus" name="approvalStatus" 
           value={approvalStatus} onChange={handleApprovalStatusChange}
           required>
          <option value="">-- Select Status --</option>
          <option value="approved">✅ Approved</option>
          <option value="rejected">❌ Rejected</option>
          <option value="pending">⏳ Pending</option>
        </select>
    </div>
  )
}
