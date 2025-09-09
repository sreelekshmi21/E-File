import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import DocumentEditor from './DocumentEditor';
import { useToast } from '../context/ToastContext';

export default function CreateFile() {

  const navigate = useNavigate()
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    file_id: "",
    file_name: "",
    file_subject: "",
    originator: '',
    file_recipient: '',
    inwardnum: "",
    outwardnum: "",
    remarks: "",
    current_status: '',
    date: ''
    // status: "Pending"
  });

   const [file, setFile] = useState(null)
  const [message, setMessage] = useState("");
 const [loading, setLoading] = useState(false);

   const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(Array.from(e.target.files));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    // navigate('/fileinbox')
    if (!formData.file_id || !formData.file_subject || !formData.originator || !formData.file_name || !formData.file_recipient || !formData.current_status) {
            // alert('All fields are required.');
            showToast("All fields are required.", '', "danger");
            return;
        }

//          const data = new FormData();

//   // Append form fields
//   for (let key in formData) {
//     data.append(key, formData[key]);
//   }

   

  
//     // console.log('fileb data',data)
//     for (let pair of data.entries()) {
//   console.log(`${pair[0]}:`, pair[1]);
// }
     try {
    const response = await fetch("http://localhost:5000/createfile", {
      method: "POST",
      // body: data // No headers here! Browser sets Content-Type correctly
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData), // send form data
    });

    const data = await response.json();

    if (response.ok) {
      // alert("Signup Successful!");
      console.log("Server response:", data);
      // setToast({ show: true, title: "Signup Successful!", body: `` });
      showToast("File created successfully!", "", "success");
       navigate('/fileinbox')
      // setFormData({
      //   username: "",
      //   email: "",
      //   department: "",
      //   password: "",
      // });
      
    } else {
      alert("create file failed: " + data.error);
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    alert("Something went wrong!");
  }


  }

   const handleTimeline = (e) => {
    e.preventDefault();
    navigate('/filetimeline')

  }

  console.log('ATTACHMENTS',file)

  const handleUpload = async () => {
  if (!file) {
    showToast("Please select a file first!",'','warning');
    return;
  }

  setLoading(true)
  const formData = new FormData();
  // formData.append("file", file);
  for (let i = 0; i < file.length; i++) {
      formData.append('file', file[i]);  
    }
  try {
    const res = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData, // no need to set Content-Type, fetch will handle it
    });

    if (!res.ok) {
      throw new Error("Upload failed");
    }

    const data = await res.json();
    setMessage(data.message);
    // alert(data.message)
    showToast(data.message,'', "success");
    // console.log(data.files.map(file=> file.url))

   

    setLoading(false);
  } catch (err) {
    setMessage("Upload failed!");
    console.error(err);
  }
};


  return (
   <div>
       <div className="container mt-5">
        <div className="row">
          <h2 className="text-center">CREATE FILE</h2>
            <div className="col-md-6 bg-light border">
                {/* <h4 className="text-center">CREATE FILE</h4> */}
                <div className="mb-3">
         <label htmlFor="exampleFormControlInput1" className="form-label">File Number</label>
         <input type="text" name="file_id" className="form-control" placeholder="file id" value={formData.file_id} onChange={handleChange}/>
        </div>
         <div className="mb-3">
         <label htmlFor="exampleFormControlInput1" className="form-label">File Name</label>
         <input type="text"  name="file_name" className="form-control" placeholder="file name" value={formData.file_name} onChange={handleChange} />
        </div>
         <div className="mb-3">
         <label htmlFor="exampleFormControlInput1" className="form-label">File Subject</label>
         <input type="text"  name="file_subject" className="form-control" placeholder="file subject" 
         value={formData.file_subject} onChange={handleChange}/>
        </div>
        <div className="mb-3">
         <label htmlFor="exampleFormControlInput1" className="form-label">Originator</label>
         <input type="text" className="form-control" name="originator" placeholder="originator"  value={formData.originator} onChange={handleChange}/>
        </div>
        <div className="mb-3">
         <label htmlFor="exampleFormControlInput1" className="form-label">File Recipient</label>
         <input type="text" name="file_recipient" className="form-control" placeholder="file recipient"  value={formData.file_recipient} onChange={handleChange}/>
        </div>
         <div className = "container">  
        <div className = "row">  
          <div className = "col-sm-12" align = "center">  
            {/* <label for="exampleFormControlInput1" className="form-label">Date</label>  */}
           Date:  <input type = "date" name = "date" value={formData.date} onChange={handleChange}/>  
          </div> 
           <div className="mb-3">
         <label htmlFor="exampleFormControlInput1" className="form-label">Inward Number</label>
         <input type="text"  name="inwardnum" className="form-control" placeholder="inward num" value={formData.inwardnum} onChange={handleChange}/>
        </div>
         <div className="mb-3">
         <label htmlFor="exampleFormControlInput1" className="form-label">Outward Number</label>
         <input type="text" name="outwardnum" className="form-control" placeholder="outward num"  value={formData.outwardnum} onChange={handleChange}/>
        </div>
         <div className="mb-3">
         <label htmlFor="exampleFormControlInput1" className="form-label">Live File Location</label>
         <input type="text" name="current_status" className="form-control" placeholder="live file location" 
         onChange={handleChange} value={formData.current_status}/>
        </div>
        <div className="mb-3">
              <label className="form-label">Remarks</label>
              <textarea
                name="remarks"
                className="form-control"
                rows="3"
                value={formData.remarks}
                onChange={handleChange}
              ></textarea>
            </div>
          <div className="mb-3">
             <label className="form-label">Attachments</label>
            <input type="file"  className="btn btn-primary form-control required" multiple 
                   onChange={handleFileChange} name="file"/>
            <button
      className="btn btn-primary d-flex align-items-center"
      type="button"
      onClick={handleUpload}
      disabled={loading}
    >
      {loading && (
        <span
          className="spinner-border spinner-border-sm me-2"
          role="status"
          aria-hidden="true"
        ></span>
      )}
      {loading ? "Uploading..." : "Upload"}
    </button>
         </div>
             <div className="text-center mt-4">
        <button className="btn btn-success px-5" onClick={handleSave}>Save</button>
      </div>
        </div>  
      </div>  
            </div>
            <div className="col-md-6 bg-light border">
                <h4 className="text-center">Column 2</h4>
               <div className="container">
                   <DocumentEditor />
                    {/* <button className="btn btn-success px-5" onClick={handleTimeline}>Show Timeline</button> */}
              </div>
            </div>
        </div>
    </div>

    </div>
  )
}
