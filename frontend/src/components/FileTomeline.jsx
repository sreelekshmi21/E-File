import React, { useEffect, useState } from "react";

function FileTimeline({ fileId, currentUser }) {
  const [activity, setActivity] = useState([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchActivity = () => {
    fetch(`http://localhost:5000/api/files/${57}/activity`)
      .then((res) => res.json())
      .then((data) => setActivity(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchActivity();
  }, [fileId]);

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setLoading(true);

    try {
      await fetch(`http://localhost:5000/api/files/${57}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name: currentUser, comment }),
      });
      setComment("");
      fetchActivity(); // refresh timeline
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h5>📜 File Activity Timeline</h5>
      <ul className="list-group list-group-flush mb-3">
        {activity.length > 0 ? (
          activity.map((a, i) => (
            <li key={i} className="list-group-item">
              <div className="d-flex align-items-start">
                <div className="me-3">
                  <span className="badge bg-primary">{a.action}</span>
                </div>
                <div>
                  <strong>{a.user_name}</strong>{" "}
                  <span className="text-muted" style={{ fontSize: "0.9em" }}>
                    ({new Date(a.timestamp).toLocaleString()})
                  </span>
                  {a.comment && (
                    <p className="mb-0 mt-1">
                      💬 <em>{a.comment}</em>
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))
        ) : (
          <li className="list-group-item text-muted text-center">
            No activity yet
          </li>
        )}
      </ul>

      {/* Comment box */}
      <div className="card p-3 shadow-sm">
        <h6>Add a Comment</h6>
        <textarea
          className="form-control mb-2"
          rows="3"
          placeholder="Write your comment here..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          className="btn btn-success"
          onClick={handleAddComment}
          disabled={loading}
        >
          {loading ? "Saving..." : "💬 Save Comment"}
        </button>
      </div>
    </div>
  );
}

export default FileTimeline;