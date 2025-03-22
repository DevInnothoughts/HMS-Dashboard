import React, { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Button, Form } from "react-bootstrap";

import eyeIcon from "/src/assets/images/Eye/view.png";
import eyeSlashIcon from "/src/assets/images/Eye/invisible.png";
import logo from "/src/assets/images/logo/icon-logo.png";

const BASE_URL = "http://194.195.117.79:5000/api"; // Update with your backend API base URL

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem("isAuthenticated");
      const accountType = localStorage.getItem("accountType");

      if (isAuthenticated === "true") {
        navigate(accountType === "admin" ? "/admin-panel" : "/");
      }
    };

    checkAuth();
  }, [navigate]);

  const [formData, setFormData] = useState({
    accountType: "",
    jobLocation: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { accountType, email, password, jobLocation } = formData;

    if (!jobLocation) {
      alert("Please select a location");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/V1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          accountType: accountType,
          jobLocation: jobLocation,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("accountType", data.data.role);
        localStorage.setItem("jobLocation", data.data.jobLocation);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("token", data.data.token);

        navigate(data.data.role === "admin" ? "/admin-panel" : "/", {
          replace: true,
        });
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login");
    }
  };

  // Fetch Locations for Dropdown
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/V1/auth/locationDropdown`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Locations API Response:", data);

          // ✅ Correcting the state update
          setLocations(Array.isArray(data.data) ? data.data : []);
        } else {
          console.error("Failed to fetch Locations:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching dropdown data:", error.message);
      }
    };

    fetchDropdownData();
  }, []);

  if (localStorage.getItem("isAuthenticated") === "true") {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      className="auth-main"
      style={{
        background: "linear-gradient(120deg, #4776E6 0%, #8E54E9 100%)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        className="codex-authbox"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          padding: "40px",
          borderRadius: "24px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
          maxWidth: "450px",
          width: "100%",
          transition: "all 0.3s ease",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <div
          className="auth-header"
          style={{ textAlign: "center", marginBottom: "35px" }}
        >
          <div className="codex-brand" style={{ marginBottom: "25px" }}>
            <Link to={""}>
              <img
                className="img-fluid"
                src={logo}
                alt="HMS Logo"
                style={{
                  maxWidth: "80px",
                  marginBottom: "15px",
                  filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
                }}
              />
              <span
                className="ms-2"
                style={{
                  fontSize: "35px",
                  fontWeight: "700",
                  background: "linear-gradient(120deg, #4776E6, #8E54E9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "block",
                }}
              >
                HMS
              </span>
            </Link>
          </div>
          <h3
            style={{
              fontSize: "32px",
              fontWeight: "800",
              color: "#2D3748",
              marginBottom: "12px",
              letterSpacing: "-0.5px",
            }}
          >
            Welcome Back
          </h3>
          <p style={{ color: "#718096", fontSize: "16px", fontWeight: "400" }}>
            Please login to your account
          </p>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Select
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              style={{
                padding: "15px",
                borderRadius: "12px",
                border: "1.5px solid #E2E8F0",
                backgroundColor: "#F8FAFC",
                fontSize: "15px",
                fontWeight: "500",
                color: "#4A5568",
              }}
            >
              <option value="">Select Account Type</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="reception">Reception</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Select
              name="jobLocation"
              value={formData.jobLocation}
              onChange={handleChange}
            >
              <option value="">Select Location</option>
              {locations.length > 0 ? (
                locations.map((location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                ))
              ) : (
                <option value="">No locations available</option>
              )}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Control
              type="email"
              placeholder="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                padding: "15px",
                borderRadius: "12px",
                border: "1.5px solid #E2E8F0",
                backgroundColor: "#F8FAFC",
                fontSize: "15px",
                fontWeight: "500",
                color: "#4A5568",
              }}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <div style={{ position: "relative" }}>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  padding: "15px",
                  paddingRight: "45px",
                  borderRadius: "12px",
                  border: "1.5px solid #E2E8F0",
                  backgroundColor: "#F8FAFC",
                  fontSize: "15px",
                  fontWeight: "500",
                  color: "#4A5568",
                }}
              />
              <img
                src={showPassword ? eyeIcon : eyeSlashIcon}
                alt="Toggle password"
                onClick={togglePasswordVisibility}
                style={{
                  position: "absolute",
                  right: "15px",
                  top: "50%",
                  width: "20px",
                  height: "20px",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  opacity: "0.6",
                  transition: "opacity 0.2s ease",
                }}
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <Button className="w-100" type="submit">
              Login
            </Button>
          </Form.Group>
        </Form>
      </div>
    </div>
  );
}
