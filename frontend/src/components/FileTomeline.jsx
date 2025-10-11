import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

function FileTimeline() {
  
  const [fileEvents, setFileEvents] = useState([])

  const location = useLocation()
  console.log('fileId',location)
  const fetchActivity = async (file) => {
    try{
      // console.log('fileId',fileId)
      const fileId = file?.fileId
      const res = await fetch(`http://localhost:5000/api/file-events/${fileId}`)
      const dt = await res.json()
      console.log('dt',dt)
      setFileEvents(dt)
    }catch(err){
      console.error(err)
    }
    
  };

  useEffect(() => {
    fetchActivity(location?.state);
  }, [location?.state?.fileId]);

 
  return (
  <div className="container-fluid my-4">
  <div className="row flex-row-reverse">
    <Sidebar />
    <div className="col-md-10 bg-light border p-4">
      <h5 className="mb-4">📜 File Activity Timeline</h5>
       <h4>{location?.state?.fileName}</h4>
      <div className="timeline position-relative ps-3">
        {console.log('file',fileEvents)}
        {fileEvents?.map((event, index) => (
          <div
            key={event?.id}
            className="timeline-item mb-5 position-relative ps-4 border-start border-primary"
          >
            {/* Dot Marker */}
            <span
              className="position-absolute top-0 start-0 translate-middle bg-primary rounded-circle"
              style={{ width: '12px', height: '12px' }}
            ></span>

            {/* Event Content */}
            <h6 className="fw-bold mb-2 card shadow-sm">
              {event?.event_type} <small className="text-muted">at {new Date(event?.created_at).toLocaleString()}</small>
            </h6>
            <p className="mb-1"><strong>Origin:</strong> {event?.origin || 'N/A'}</p>
            <p className="mb-1"><strong>Forwarded to:</strong> {event?.forwarded_to || 'N/A'}</p>
            <p className="mb-0"><strong>Created by:</strong> {event?.username || 'N/A'}</p>
            {event.event_type === 'edited' && (
      <p className="mb-0"><strong>Edited by:</strong> {event?.edited_by}</p>
    )}
            {event.event_type === 'approved' && (
      <p className="mb-0 text-success"><strong>Approved by:</strong> {event?.approved_by}</p>
    )}
    {event.event_type === 'viewed' && <p className="mb-0"><strong>Viewed by:</strong> {event?.viewed_by || ''}</p>}
    {event.event_type === 'commented' && <p className="mb-0"><strong>Commented by:</strong> {event?.commented_by || ''}</p>}
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
  );
}

export default FileTimeline;