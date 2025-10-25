import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

export default function RemarksEditor({ formData, setFormData, viewMode }) {
  const handleEditorChange = (content) => {
    setFormData((prevData) => ({
      ...prevData,
      remarks: content
    }));
  };

  

  return (
    <Editor
      apiKey="your-api-key" // Optional for dev; recommended for production
      value={formData.remarks}
      onEditorChange={handleEditorChange}
      init={{
        height: 300,
        menubar: false,
        plugins: 'lists link image preview code',
        toolbar:
          'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist outdent indent | link image | code',
        branding: false,
        readonly: viewMode, // disable editing in viewMode
      }}
    />
  );
}