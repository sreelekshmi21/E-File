import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Sidebar from "./Sidebar";

function FileTimeline() {

  const [fileEvents, setFileEvents] = useState([])
  const [fileInfo, setFileInfo] = useState({ fileId: null, fileName: null })

  const BASE_URL = import.meta.env.VITE_API_URL

  const location = useLocation()
  const [searchParams] = useSearchParams()

  console.log('fileId', location)
  const fetchActivity = async (fileId) => {
    try {
      if (!fileId) return;
      const res = await fetch(`${BASE_URL}/api/file-events/${fileId}`)
      const dt = await res.json()
      console.log('dt', dt)
      setFileEvents(dt)
    } catch (err) {
      console.error(err)
    }

  };

  useEffect(() => {
    // Priority: location.state > URL params > sessionStorage
    let fileId = location?.state?.fileId;
    let fileName = location?.state?.fileName;

    // Check URL params if location.state is not available
    if (!fileId) {
      fileId = searchParams.get('fileId');
      fileName = searchParams.get('fileName');
    }

    // Fallback to sessionStorage
    if (!fileId) {
      const stored = sessionStorage.getItem('timelineFile');
      if (stored) {
        const parsed = JSON.parse(stored);
        fileId = parsed.fileId;
        fileName = parsed.fileName;
      }
    }

    if (fileId) {
      setFileInfo({ fileId, fileName });
      fetchActivity(fileId);
    }
  }, [location?.state?.fileId, searchParams]);


  return (
    <div className="container-fluid my-4">
      <div className="row flex-row-reverse">
        <Sidebar />
        <div className="col-md-10 bg-light border p-4">
          <h5 className="mb-4">📜 File Activity Timeline</h5>
          <h4>{fileInfo.fileName || location?.state?.fileName}</h4>
          <button className="btn btn-sm btn-secondary mb-3" onClick={() => window.close()}>Close</button>
          <div className="timeline position-relative ps-3">
            {console.log('file', fileEvents)}
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
                {(event?.forwarded_to || event?.section_name || event?.target_section || event?.target_username) && (
                  <p className="mb-1"><strong>Forwarded to:</strong> {event?.forwarded_to || event?.section_name || event?.target_section || event?.target_username}</p>
                )}
                {(event?.section_name || event?.target_section) && (
                  <p className="mb-1"><strong>Section:</strong> {event?.section_name || event?.target_section}</p>
                )}
                {event?.origin && (
                  <p className="mb-1"><strong>Origin:</strong> {event?.origin}</p>
                )}
                {event?.target_username && (
                  <p className="mb-1"><strong>Sent to User:</strong> {event?.target_user_fullname || event?.target_username}</p>
                )}

                {/* For created events: show creator's info */}
                {event?.event_type === 'created' && (
                  <>
                    <p className="mb-0"><strong>Created by:</strong> {event?.fullname || event?.username || 'N/A'}</p>
                    {event?.designation && (
                      <p className="mb-0"><strong>Designation:</strong> {event?.designation}</p>
                    )}
                    {event?.department && (
                      <p className="mb-0"><strong>Department:</strong> {event?.department}</p>
                    )}
                  </>
                )}

                {/* For sent/forwarded events: show receiver's info */}
                {(event?.event_type === 'sent' || event?.event_type === 'forwarded') && event?.target_user_id && (
                  <>
                    <p className="mb-0"><strong>Received by:</strong> {event?.target_user_fullname || event?.target_username || 'N/A'}</p>
                    {event?.target_user_designation && (
                      <p className="mb-0"><strong>Designation:</strong> {event?.target_user_designation}</p>
                    )}
                    {event?.target_user_department && (
                      <p className="mb-0"><strong>Department:</strong> {event?.target_user_department}</p>
                    )}
                  </>
                )}

                {/* For other events: show the actor's info */}
                {event?.event_type !== 'created' && event?.event_type !== 'sent' && event?.event_type !== 'forwarded' && (
                  <>
                    <p className="mb-0"><strong>By:</strong> {event?.fullname || event?.username || 'N/A'}</p>
                    {event?.designation && (
                      <p className="mb-0"><strong>Designation:</strong> {event?.designation}</p>
                    )}
                    {event?.department && (
                      <p className="mb-0"><strong>Department:</strong> {event?.department}</p>
                    )}
                  </>
                )}

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