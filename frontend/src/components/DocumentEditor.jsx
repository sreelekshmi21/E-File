import React, { useRef, useState } from 'react'
import { Editor } from "@tinymce/tinymce-react";

export default function DocumentEditor() {

    const editorRef = useRef(null);
    const [comment, setComment] = useState('');
  // const [status, setStatus] = useState('');

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
     try{
      // send to backend
      const response = await fetch("http://localhost:5000/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_id: 268,         // Replace with actual file ID
          user_id: 13,         // Replace with actual user ID
          comment: content    // Use 'comment' key to match your DB field
        }),
      });

        const data = await response.json();
        console.log('data=======',data)
      if (response.ok) {
        alert('✅ Comment added!');
        setComment('');
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
      />

      <button className="btn btn-primary mt-3" onClick={handleSave}>
        Save Document
      </button>
       {/* <p>{status}</p> */}
    </div>
  )
}
