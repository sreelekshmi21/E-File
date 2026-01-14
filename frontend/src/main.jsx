import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from "./context/ToastContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById('root')).render(
  // <StrictMode>
   <AuthProvider>
    <ToastProvider>
    <NotificationProvider>
       <BrowserRouter>
    <App />
    </BrowserRouter>
    </NotificationProvider>
    </ToastProvider>
    </AuthProvider>
  // </StrictMode>,
)
