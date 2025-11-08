import React, { useEffect, useState } from 'react'

export default function DocumentExpiryCountdown({ expiryDate }) {
  
    const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!expiryDate) return;

    const updateCountdown = () => {
      const now = new Date();
      const target = new Date(expiryDate);
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("Expired ❌");
        return;
      }

      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${mins}m ${secs}s`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [expiryDate]);

  return (
    <span
      className={`font-semibold ${
        timeLeft.includes("Expired") ? "text-red-600" : "text-green-600"
      }`}
    >
      {timeLeft}
    </span>
  );
  
}
