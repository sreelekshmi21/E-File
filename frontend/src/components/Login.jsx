import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function Login() {

     const { login } = useAuth();

     const [loginData, setLoginData] = useState({
        username: "",
        password: "",
      });

      const navigate = useNavigate();
    
      // const handleLoginChange = (e) => {
      //       const { name, value } = e.target;
      //       setLoginData((prev) => ({ ...prev, [name]: value }));
      // };

      const handleLoginChange = (e) => {
          setLoginData({ ...loginData, [e.target.name]: e.target.value });
      };

      const { showToast } = useToast();

      //  const [toast, setToast] = useState({ show: false, title: "", body: "" });


      const handleSubmit = async(e) => {
        e.preventDefault();
        // console.log("Email:", email, "Password:", password);
        // Add authentication logic here
        try {
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    const data = await response.json();

    if (response.ok) {
      // alert("Login Successful!");
      console.log("User data:", data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      //  setToast({ show: true, title: "Login Success", body: `Welcome ${loginData.username}` });
      // navigate("/dashboard");
      login(data);
      showToast("Login Success", `Welcome ${loginData.username}`, "success");
       setTimeout(() =>  {
        navigate("/dashboard")
      }, 2000);

      // ✅ Reset form after login
      setLoginData({ username: "", password: "" });
    } else {
      alert("Login failed: " + data.error);
    }
  } catch (error) {
    console.error("Error logging in:", error);
    alert("Something went wrong!");
  }
  };

  return (
   <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
      <div className="card shadow p-4" style={{ width: "22rem" }}>
        <h3 className="text-center mb-4">Login</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              placeholder="Enter username"
              value={loginData.username}
              onChange={handleLoginChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              placeholder="Enter password"
              value={loginData.password}
              onChange={handleLoginChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
        <div className="text-center mt-3">
          <small>
            Don’t have an account?{" "}
            <nav><ul><li>
                  <Link to='/signup'>Sign Up</Link> 
                      </li></ul></nav>
          </small>
        </div>
      </div>
      
      {/* <Toast
        show={toast.show}
        title={toast.title}
        body={toast.body}
        onClose={() => setToast({ ...toast, show: false })}
      /> */}
    </div>
  )
}
