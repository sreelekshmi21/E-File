import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: '',
    email: "",
    department: ""
  });

  const BASE_URL = import.meta.env.VITE_API_URL

  // const [toast, setToast] = useState({ show: false, title: "", body: "" });
  const { showToast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    if (formData.password.length < 5) {
    showToast("Validation Error", "Password must be at least 5 characters long.", "danger");
    return; // Stop the form submission here
  }
  const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;
  if (!specialCharPattern.test(formData.password)) {
    showToast("Validation Error", "Password must contain at least one special character.", "danger");
    return;
  }

  // ✅ Email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(formData?.email)) {
    showToast("Error","Please enter a valid email address.", "danger");
    return;
  }
    // alert("Signup Successful!");
    // Here you can call your API to save the data
    try {
    const response = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData), // send form data
    });

    const data = await response.json();

    if (response.ok) {
      // alert("Signup Successful!");
      console.log("Server response:", data);
      // setToast({ show: true, title: "Signup Successful!", body: `` });
      showToast("Signup Successful!", "", "success");

      setFormData({
        username: "",
        email: "",
        department: "",
        password: "",
      });
      
    } else {
      alert("Signup failed: " + data.error);
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    alert("Something went wrong!");
  }
  };

  return (
    <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
      <div className="card shadow p-4" style={{ width: "22rem" }}>
        <h3 className="text-center mb-4">SignUp Form</h3>
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
              value={formData.username}
              onChange={handleChange}
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
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="department" className="form-label">
              Department
            </label>
            <input
              type="text"
              className="form-control"
              id="department"
              name="department"
              placeholder="Enter Department"
              value={formData.department}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
           Signup
          </button>
        </form>
        <div className="text-center mt-3">
          <nav>
            <ul>
                <li>
                    <Link to='/'>Back To Login</Link> 
                </li>
            </ul>
            
          </nav>
        </div>
      </div>
      {/* <Toast
              show={toast.show}
              title={toast.title}
              body={toast.body}
              onClose={() => setToast({ ...toast, show: false })}
            /> */}
    </div>
  );
};

export default Signup;