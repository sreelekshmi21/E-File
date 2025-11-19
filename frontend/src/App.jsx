import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './components/Login'
import Signup from './components/Signup'
import { Route, Routes, useNavigate } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import Dashboard from './components/Dashboard'
import CreateFile from './components/CreateFile'
import FileInbox from './components/FileInbox'
import FileTimeline from './components/FileTomeline'
import AdminPanel from './components/AdminPanel'
import UsersList from './components/UsersList'
import Roles from './components/Roles'
import RedList from './components/RedList'
import HighPriorityList from './components/HighPriorityList'
import useIdleTimer from './utils/dbProvider'
import FileCount from './components/FileCount'

function App() {

    const navigate = useNavigate();

  const handleIdle = () => {
    // Clear local storage/session storage tokens
    localStorage.removeItem("user");
    alert("You have been logged out due to inactivity.");
    navigate("/");
  };

  useIdleTimer(handleIdle, 20 * 60 * 1000); // 20 minutes

  const AppRoutes = () => {
  const routes = useRoutes([
    { path: "/", element: <Login /> },
    { path: "/signup", element: <Signup /> },
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/createfile", element: <CreateFile /> },
    { path: "/fileinbox", element: <FileInbox /> },
    { path: "/filetimeline", element: <FileTimeline /> },
    { path: "/adminpanel", element: <AdminPanel /> },
    { path: "/users", element: <UsersList /> },
    { path: "/roles", element: <Roles /> },
    { path: "/redlist", element: <RedList /> },
    { path: "/highpriority", element: <HighPriorityList /> },
    { path: "/filecount", element: <FileCount /> },
  ]);
  return routes;
};

  return (
    <>
      {/* <BrowserRouter> */}
        <AppRoutes />
    {/* </BrowserRouter>        */}
    </>
  )
}

export default App
