import React, { useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

export default function RemarksEditor({ formData, setFormData, viewMode }) {
  const editorRef = useRef(null);
  const handleEditorChange = (content) => {
    setFormData((prevData) => ({
      ...prevData,
      remarks: content
    }));
  };

   // Apply readonly & toolbar state after mount and on toggle
   useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // ✅ Use new TinyMCE API
    if (editor.mode && typeof editor.mode.set === "function") {
      editor.mode.set(viewMode ? "readonly" : "design");
    }

    // ✅ Hide or show toolbar
    const header = editor.editorContainer.querySelector(".tox-editor-header");
    if (header) header.style.display = viewMode ? "none" : "block";
  }, [viewMode]);
  

  return (
    <Editor
      // apiKey="your-api-key" // Optional for dev; recommended for production
      apiKey="54ugn72qi4pzas32feag7mcosn0lftniz5opr5mf8qaqnh1c" 
      value={formData.remarks}
      onEditorChange={handleEditorChange}
      init={{
        height: 300,
        menubar: false,
        plugins: 'lists link image preview code',
        toolbar:
          'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist outdent indent | link image | code',
        branding: false,
        // readonly: viewMode ? 1 : 0, // disable editing in viewMode
      }}
      onInit={(_, editor) => {
        editorRef.current = editor;

        // ✅ Ensure readonly & toolbar hidden *on first render*
        if (viewMode && editor.mode && typeof editor.mode.set === "function") {
          editor.mode.set("readonly");
          const header = editor.editorContainer.querySelector(".tox-editor-header");
          if (header) header.style.display = "none";
        }
      }}
    />
  );
}