import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './components/Login'
import Signup from './components/Signup'
import { Route, Routes } from "react-router-dom";
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

function App() {

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
  ]);
  return routes;
};

  return (
    <>
      <BrowserRouter>
        <AppRoutes />
    </BrowserRouter>       
    </>
  )
}

export default App
