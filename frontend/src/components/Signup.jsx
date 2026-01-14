import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    password: '',
    email: "",
    department: "",
    section: "",
    designation: "",
    role_id: "2", // default: staff
  });

  const BASE_URL = import.meta.env.VITE_API_URL

  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);

  // const [toast, setToast] = useState({ show: false, title: "", body: "" });
  const { showToast } = useToast();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/departments`);
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchSections = async (deptId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/departments/${deptId}/divisions`);
      const data = await response.json();
      setSections(data);
    } catch (error) {
      console.error("Error fetching sections:", error);
      setSections([]);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === 'department') {
      const selectedDept = departments.find(d => d.code === e.target.value);
      if (selectedDept) {
        fetchSections(selectedDept.id);
      } else {
        setSections([]);
      }
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value, section: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    if (formData.password.length < 8) {
      showToast("Validation Error", "Password must be at least 8 characters long.", "danger");
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
      showToast("Error", "Please enter a valid email address.", "danger");
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
          fullname: "",
          username: "",
          email: "",
          department: "",
          section: "",
          designation: "",
          password: "",
          role_id: "2"
        });
        setSections([]);

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
            <label htmlFor="fullname" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              className="form-control"
              id="fullname"
              name="fullname"
              placeholder="Enter full name"
              value={formData.fullname}
              onChange={handleChange}
              required
            />
          </div>
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
            {/* <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            /> */}
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                id="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <span
                className="input-group-text"
                style={{ cursor: "pointer" }}
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </span>
            </div>
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
            <select
              className="form-select" // Use form-select class for dropdowns in Bootstrap
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.code}>{dept.code} - {dept.dept_name}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="section" className="form-label">
              Section
            </label>
            <select
              className="form-select"
              id="section"
              name="section"
              value={formData.section}
              onChange={handleChange}
              required
              disabled={!formData.department}
            >
              <option value="">Select Section</option>
              {sections.map(sec => (
                <option key={sec.id} value={sec.code}>{sec.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="designation" className="form-label">
              Designation
            </label>
            <input
              type="text"
              className="form-control"
              id="designation"
              name="designation"
              placeholder="Enter designation"
              value={formData.designation}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Select Role</label>
            <select name="role_id"
              value={formData.role_id}
              onChange={handleChange}
              required>
              <option value="1">Admin</option>
              <option value="2">Staff</option>
              <option value="3">Viewer</option>
            </select>
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
        <div className="text-center mt-3">
          <nav>
            <ul>
              <li>
                <Link to='/adminpanel'>Back to Admin Panel</Link>
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