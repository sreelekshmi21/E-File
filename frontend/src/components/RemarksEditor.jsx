import React, { useEffect, useRef, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';

export default function RemarksEditor({ formData, setFormData, viewMode }) {
  const editorRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Debounced update to parent state - only update when user stops typing
  const updateFormData = useCallback((content) => {
    setFormData((prevData) => ({
      ...prevData,
      remarks: content
    }));
  }, [setFormData]);

  // Apply readonly & toolbar state after mount and on toggle
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // Use new TinyMCE API
    if (editor.mode && typeof editor.mode.set === "function") {
      editor.mode.set(viewMode ? "readonly" : "design");
    }

    // Hide or show toolbar
    const header = editor.editorContainer?.querySelector(".tox-editor-header");
    if (header) header.style.display = viewMode ? "none" : "block";
  }, [viewMode]);

  // Handle blur event to save content when user finishes editing
  const handleBlur = () => {
    if (editorRef.current) {
      // Keep HTML content to preserve paragraph formatting
      const htmlContent = editorRef.current.getContent();
      updateFormData(htmlContent);
    }
  };

  return (
    <Editor
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      initialValue={formData.remarks || ''}
      onInit={(_, editor) => {
        editorRef.current = editor;
        isInitializedRef.current = true;

        // Ensure readonly & toolbar hidden on first render
        if (viewMode && editor.mode && typeof editor.mode.set === "function") {
          editor.mode.set("readonly");
          const header = editor.editorContainer?.querySelector(".tox-editor-header");
          if (header) header.style.display = "none";
        }

        // Add blur event listener to save content when user leaves editor
        editor.on('blur', handleBlur);
      }}
      init={{
        height: 300,
        menubar: false,
        plugins: 'link lists table code',
        toolbar:
          'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist outdent indent | link image | code',
        branding: false,
        license_key: 'gpl'
      }}
    />
  );
}
