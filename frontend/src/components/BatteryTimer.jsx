// import React, { useEffect, useState } from 'react'

// export default function BatteryTimer({ totalTimeMs = 2*60*1000,file  }) {//3 * 60 * 1000
//   const [remaining, setRemaining] = useState(totalTimeMs);

//   const BASE_URL = import.meta.env.VITE_API_URL 

//   //  const [percentages, setPercentages] = useState(100);
//   const [showTooltip, setShowTooltip] = useState(false);

//    const getBatteryLabel = () => {
//     if (percentage > 80) return "100% Green";
//     else if (percentage > 20 && percentage < 80) return "80% Orange";
//     return "20% Red";
//   };

//   const getBatteryColor = () => {
//     if (percentage > 80) return "green";
//     if (percentage > 20 && percentage < 80) return "orange";
//     return "red";
//   };

//   const handleFileExpiry = async () => {
//     console.log('handleexpiry')
//   try {
//     await fetch(`${BASE_URL}/api/files/${file.id}/expire`, { method: "PUT" });
//     console.log("handleexpiry ⛔ handleexpiry File expired and moved to Red List");
//     // fetchFiles(); // refresh the list (optional)
//   } catch (error) {
//     console.error("Error marking expired:", error);
//   }
//  };

//   useEffect(() => {
//     const startTime = Date.now();
//     const timer = setInterval(() => {
//       const elapsed = Date.now() - startTime;
//       const newRemaining = Math.max(0, totalTimeMs - elapsed);
//       setRemaining(newRemaining);
//       if (newRemaining === 0) {
//         clearInterval(timer);
//         handleFileExpiry();
//       }    
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [totalTimeMs]);

//   const percentage = (remaining / totalTimeMs) * 100;

//   const minutes = Math.floor((remaining / 1000 / 60) % 60);
//   const seconds = Math.floor((remaining / 1000) % 60);

//   // Choose color based on remaining %
//   let color = "#4CAF50"; // green
//   // if (percentage <= 60 && percentage > 30) color = "#FFEB3B"; // yellow
//   // if (percentage <= 30 && percentage > 10) color = "#FF9800"; // orange
//   if (percentage <= 80 && percentage > 20) color = "#FF9800"; // orange
//   else if (percentage <= 20) color = "#F44336"; // red


//   const handleMouseEnter = () => {
//     // Call your function here when hovered
//     console.log('on hover')
//     // const color = getBatteryColor();
//     // setHoverColor(color);
//   };




//   return (
//     <div className="battery-timer-container" 
//     onMouseEnter={() => setShowTooltip(true)} 
//     onMouseLeave={() => setShowTooltip(false)}>
//       <p>🔋 Document Expiry Timer</p>

//       <div className="battery">
//         <div className="battery-tip"></div>
//         <div
//           className="battery-level"
//           style={{
//             width: `${percentage}%`,
//             backgroundColor: color,
//           }}
//         ></div>
//       </div>

//       <p className="timer-text">
//         {remaining === 0
//           ? "Expired ❌"
//           : `${minutes}m ${seconds.toString().padStart(2, "0")}s remaining`}
//       </p>
//       {/* Tooltip rectangle */}
//       {showTooltip && (
//         <div
//           className="battery-tooltip"
//           style={{ backgroundColor: getBatteryColor() }}
//         >
//           {getBatteryLabel()}
//         </div>
//       )}
//     </div>
//   );
// }
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BatteryTimer({ totalTimeMs = 2 * 60 * 1000, file }) {
  const [remaining, setRemaining] = useState(totalTimeMs);
  const BASE_URL = import.meta.env.VITE_API_URL;
  const [showTooltip, setShowTooltip] = useState(false);

   const [expired, setExpired] = useState(false);

  const { user } = useAuth();

   const hasExpiredRef = useRef(false); // 🔹 prevents multiple triggers

  // 🔹 Get expiry = file.created_at + 2 minutes
  // const expiryTime = new Date(file.date_added).getTime() + totalTimeMs;
  const expiryTime = useMemo(
    () => new Date(file.date_added).getTime() + totalTimeMs,
    [file.id] // only recalc if file changes
  );
  const expiryDate = new Date(expiryTime); // Convert to readable date

  const handleFileExpiry = async () => {
    if (hasExpiredRef.current) return;
    hasExpiredRef.current = true;
     setExpired(true);
    try {
      await fetch(`${BASE_URL}/api/files/${file.id}/expire`, { method: "PUT" });
      console.log("⛔ File expired and moved to Red List");

          if (
        user &&
        file?.department &&
        user?.user?.department === file?.department
      ) {
        toast.error(
          `⚠️ File "${file?.file_id || file?.subject || "Untitled"}" created by ${file?.department} has expired.`,
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          }
        );
      }
    } catch (error) {
      console.error("Error marking expired:", error);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const newRemaining = Math.max(0, expiryTime - now);
      setRemaining(newRemaining);

      if (newRemaining === 0 && !hasExpiredRef.current) {
        clearInterval(timer);
        handleFileExpiry();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTime]);

  const percentage = (remaining / totalTimeMs) * 100;
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remaining / 1000 / 60) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  const getBatteryLabel = () => {
    if (percentage > 80) return "100% Green";
    else if (percentage > 20 && percentage <= 80) return "80% Orange";
    return "20% Red";
  };

  const getBatteryColor = () => {
    if (percentage > 80) return "green";
    if (percentage > 20 && percentage <= 80) return "orange";
    return "red";
  };

  const color =
    percentage > 80
      ? "#4CAF50"
      : percentage > 20
      ? "#FF9800"
      : "#F44336";

      const formattedExpiry = expiryDate.toLocaleString([], {
  weekday: "short",  // e.g., "Tue"
  year: "numeric",   // e.g., "2025"
  month: "short",    // e.g., "Nov"
  day: "2-digit",    // e.g., "12"
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

  const isExpired = remaining === 0;

  return (
    <div
      className="battery-timer-container"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <p>🔋 Document Expiry Timer</p>

      <div className="battery">
        <div className="battery-tip"></div>
        <div
          className="battery-level"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        ></div>
      </div>

      <p className="timer-text">
        {isExpired
          ? "Expired ❌"
          : (
  <>
    {days > 0 && `${days}d `}
    {hours > 0 && `${hours}h `}
    {minutes}m {seconds.toString().padStart(2, "0")}s remaining
  </>
)}
      </p>

      {/* 🔹 Expiry Time Display */}
      <p
        className="expiry-time"
        style={{
          color: isExpired ? "#F44336" : "#666",
          fontWeight: isExpired ? "600" : "normal",
        }}
      >
        {isExpired ? "🕒 Expired at: " : "🕒 Expires at: "}
        <strong>{formattedExpiry}</strong>
      </p>

      {showTooltip && (
        <div
          className="battery-tooltip"
          style={{ backgroundColor: getBatteryColor() }}
        >
          {getBatteryLabel()}
        </div>
      )}
      {/* <p className="text-gray-500 mt-2">
        🕒 Expires at: <strong>{formattedExpiry}</strong>
      </p> */}
      <ToastContainer />
    </div>
  );
}