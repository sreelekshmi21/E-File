import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from "./context/ToastContext.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
    <App />
    </ToastProvider>
  </StrictMode>,
)
