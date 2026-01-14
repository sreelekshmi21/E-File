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

import { useEffect, useRef } from "react";

export default function useIdleTimer(onIdle, timeout = 20 * 60 * 1000) {
  const timerRef = useRef();

  const resetTimer = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onIdle, timeout);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer(); // start timer on mount

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}
