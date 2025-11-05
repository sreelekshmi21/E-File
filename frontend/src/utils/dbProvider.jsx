export const getAttachments = async (fileId) =>{
    try {
    const response = await fetch(`http://localhost:5000/api/attachments?file_id=${fileId}`);
    const data = await response.json();

    return data
    
  } catch (error) {
    console.error('Failed to load attachments:', error);
  }
  }


  export const hasPermission = (perm) => {
  const stored = JSON.parse(localStorage.getItem("user"));
  if (!stored) return false;
  return stored?.permissions.includes(perm);
};