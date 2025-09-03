import React, { useRef } from 'react'
import { Editor } from "@tinymce/tinymce-react";

export default function DocumentEditor() {

    const editorRef = useRef(null);

  const handleSave = () => {
    if (editorRef.current) {
      const content = editorRef.current.getContent();
      console.log("Document content:", content);

      // send to backend
      fetch("http://localhost:5000/api/save-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
    }
  };


  return (
     <div style={{ maxWidth: "900px", margin: "auto", padding: "20px" }}>
      <h2>Document Editor (TinyMCE)</h2>

      <Editor
        onInit={(evt, editor) => (editorRef.current = editor)}
        initialValue="<p>Start typing here...</p>"
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
    </div>
  )
}
