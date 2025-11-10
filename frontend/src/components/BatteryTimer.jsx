import React, { useEffect, useState } from 'react'

export default function BatteryTimer({ totalTimeMs = 2*60*1000,file  }) {//3 * 60 * 1000
  const [remaining, setRemaining] = useState(totalTimeMs);

  const BASE_URL = import.meta.env.VITE_API_URL 

   const [percentages, setPercentages] = useState(100);
  const [showTooltip, setShowTooltip] = useState(false);

   const getBatteryLabel = () => {
    if (percentage > 80) return "100% Green";
    else if (percentage > 20 && percentage < 80) return "80% Orange";
    return "20% Red";
  };

  const getBatteryColor = () => {
    if (percentage > 80) return "green";
    if (percentage > 20 && percentage < 80) return "orange";
    return "red";
  };

  const handleFileExpiry = async () => {
    console.log('handleexpiry')
  try {
    await fetch(`${BASE_URL}/api/files/${file.id}/expire`, { method: "PUT" });
    console.log("handleexpiry ⛔ handleexpiry File expired and moved to Red List");
    // fetchFiles(); // refresh the list (optional)
  } catch (error) {
    console.error("Error marking expired:", error);
  }
 };

  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newRemaining = Math.max(0, totalTimeMs - elapsed);
      setRemaining(newRemaining);
      if (newRemaining === 0) {
        clearInterval(timer);
        handleFileExpiry();
      }    
    }, 1000);

    return () => clearInterval(timer);
  }, [totalTimeMs]);

  const percentage = (remaining / totalTimeMs) * 100;

  const minutes = Math.floor((remaining / 1000 / 60) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  // Choose color based on remaining %
  let color = "#4CAF50"; // green
  // if (percentage <= 60 && percentage > 30) color = "#FFEB3B"; // yellow
  // if (percentage <= 30 && percentage > 10) color = "#FF9800"; // orange
  if (percentage <= 80 && percentage > 20) color = "#FF9800"; // orange
  else if (percentage <= 20) color = "#F44336"; // red


  const handleMouseEnter = () => {
    // Call your function here when hovered
    console.log('on hover')
    // const color = getBatteryColor();
    // setHoverColor(color);
  };




  return (
    <div className="battery-timer-container" 
    onMouseEnter={() => setShowTooltip(true)} 
    onMouseLeave={() => setShowTooltip(false)}>
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
        {remaining === 0
          ? "Expired ❌"
          : `${minutes}m ${seconds.toString().padStart(2, "0")}s remaining`}
      </p>
      {/* Tooltip rectangle */}
      {showTooltip && (
        <div
          className="battery-tooltip"
          style={{ backgroundColor: getBatteryColor() }}
        >
          {getBatteryLabel()}
        </div>
      )}
    </div>
  );
}
