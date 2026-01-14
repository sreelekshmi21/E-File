import { createContext, useContext, useEffect, useRef } from "react";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { showToast } = useToast();
  const { user } = useAuth();
  const prevFileIdsRef = useRef(new Set());

  useEffect(() => {
    const userDept = user?.user?.department;
    if (!userDept) {
      console.log('[NotificationContext] No user department, skipping polling');
      return;
    }

    console.log('[NotificationContext] Starting polling for department:', userDept);
    let isCancelled = false;

    const fetchAndNotify = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/files?department=${userDept}`);
        if (!response.ok) {
          console.error('Notification polling fetch failed with status:', response.status);
          return;
        }
        const data = await response.json();
        console.log('[NotificationContext] Fetched files:', data.length);
        if (isCancelled || !Array.isArray(data)) return;

        const currentIds = new Set(data.map(f => f?.id));

        // Check for new files only after first initialization
        if (prevFileIdsRef.current.size > 0) {
          let newCount = 0;
          for (const file of data) {
            if (!prevFileIdsRef.current.has(file?.id)) {
              newCount += 1;
              console.log('New file detected:', file.file_name);
              console.log('Calling showToast with:', "New File Received", `New file received: ${file.file_name || 'Untitled File'}`, "success");
              showToast("New File Received", `New file received: ${file.file_name || 'Untitled File'}`, "success");
            }
          }
          if (newCount > 0) {
            console.log(`[Global Polling] ${newCount} new files received`);
          }
        } else {
          console.log('[NotificationContext] First initialization, setting file IDs');
        }

        prevFileIdsRef.current = currentIds;
      } catch (err) {
        console.error('Global notification polling error:', err);
      }
    };

    // Run immediately
    fetchAndNotify();

    // Then continue polling every 1 second
    const intervalId = setInterval(fetchAndNotify, 1000);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [user?.user?.department, showToast]);

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
