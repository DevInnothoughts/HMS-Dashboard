import React, { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Button, Form } from "react-bootstrap";

import eyeIcon from "../../assets/images/Eye/view.png";
import eyeSlashIcon from "../../assets/images/Eye/invisible.png";
import logo from "../../assets/images/logo/icon-logo.png";

// Define the hardcoded list directly for use
const LOCATIONS_LIST = ["hms", "pune", "demo"]; // Added a couple more for better list view

const BASE_URL = "http://localhost:5100/api"; // BASE_URL is still needed for the handleSubmit fetch

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem("isAuthenticated");
      const accountType = localStorage.getItem("accountType");

      if (isAuthenticated === "true") {
        navigate(accountType === "admin" ? "/" : "/");
      }
    };

    checkAuth();
  }, [navigate]);

  const [formData, setFormData] = useState({
    accountType: "",
    jobLocation: "", // This will be set by the location list selection
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

  // Handler for location list selection
  const handleLocationSelect = (location) => {
    setFormData((prevData) => ({
      ...prevData,
      jobLocation: location,
    }));
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

        navigate(data.data.role === "admin" ? "/" : "/", {
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

  // --- Location Fetching logic has been removed ---

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

          {/* 👇 START: Location List using LOCATIONS_LIST array 👇 */}
          <Form.Group className="mb-4">
            <div style={{ marginBottom: "8px", fontWeight: "600", color: "#4A5568" }}>
              Select Location:
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                justifyContent: "flex-start",
              }}
            >
              {LOCATIONS_LIST.length > 0 ? (
                LOCATIONS_LIST.map((location, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleLocationSelect(location)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: "20px",
                      border:
                        formData.jobLocation === location
                          ? "2px solid #4776E6"
                          : "1px solid #E2E8F0",
                      backgroundColor:
                        formData.jobLocation === location
                          ? "#EBF4FF" // Light blue for selected
                          : "#F8FAFC",
                      color:
                        formData.jobLocation === location
                          ? "#4776E6"
                          : "#4A5568",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      textTransform: "capitalize",
                    }}
                  >
                    {location}
                  </button>
                ))
              ) : (
                <span style={{ color: "#718096", fontSize: "14px" }}>
                  No locations defined.
                </span>
              )}
            </div>
          </Form.Group>
          {/* 👆 END: Location List 👆 */}

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
            <Button
              className="w-100"
              type="submit"
              style={{
                background: "linear-gradient(120deg, #4776E6 0%, #8E54E9 100%)",
                border: "none",
                padding: "15px",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                boxShadow: "0 4px 15px rgba(71, 118, 230, 0.4)",
              }}
            >
              Login
            </Button>
          </Form.Group>
        </Form>
      </div>
    </div>
  );
}