export const getAttachments = async (fileId) =>{
    try {
    const response = await fetch(`http://localhost:5000/api/attachments?file_id=${fileId}`);
    const data = await response.json();

    console.log('Attachments=========================:', data);

    return data
    
  } catch (error) {
    console.error('Failed to load attachments:', error);
  }
  }