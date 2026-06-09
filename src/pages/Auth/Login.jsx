import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Button, Form, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import eyeIcon from "../../assets/images/Eye/view.png";
import eyeSlashIcon from "../../assets/images/Eye/invisible.png";
import logo from "../../assets/images/logo/hhclogo.webp";

// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://localhost:5100/api";

const MySwal = withReactContent(Swal);

const LOCATIONS_LIST = [
  "Hyderabad",
  "DP Road",
  "Surat",
  "Ludhiana",
  "Indiranagar",
  "Dighi",
  "Thane",
  "Belagavi",
  "HSR",
  "JP Nagar",
  "Navi Mumbai",
  "Chinchwad",
  "Nashik",
  "Salunkhe Vihar",
  "Chakan",
  "Baner",
  "Kolhapur",
  "Secunderabad",
  "Andheri",
  "Sahakar Nagar",
  "Gurgaon Sector 14",
  "Gurgaon Sector 49",
  "Kemps Corner",
  "Latur",
  "Indore",
  "Mysore",
  "Undri",
  "Vashi",
  "Hinjewadi",
  "Lucknow",
  "Kalaburagi",
  "Rajaji Nagar",
  "Sarjapura",
  "Katraj",
  "lead",
  "Pratiksha Local",
  "Demo Server",
  "demo",
  "Aurangabad",
].sort();

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    accountType: "",
    jobLocation: "",
    email: "",
    password: "",
  });
  const [shakingField, setShakingField] = useState("");

  const triggerShake = (fieldName) => {
    setShakingField(fieldName);
    setTimeout(() => setShakingField(""), 500);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errorMessage) setErrorMessage("");

    setFormData((prev) => {
      const nextData = { ...prev, [name]: value };
      if (name === "accountType") {
        nextData.jobLocation = "";
      }
      return nextData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    const { accountType, email, password, jobLocation } = formData;

    if (!jobLocation) {
      setErrorMessage("Please select a clinic location");
      return;
    }

    let backendAccountType = "";
    let departmentVal = "";

    if (accountType === "Reception") {
      backendAccountType = "reception";
      departmentVal = "OPD";
    } else if (accountType === "Doctor") {
      backendAccountType = "doctor";
      departmentVal = "OPD";
    } else if (accountType === "IPD") {
      backendAccountType = "ipd";
      departmentVal = "IPD";
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/V1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          accountType: backendAccountType,
          jobLocation,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("accountType", data.data.role);
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("department", departmentVal);
        localStorage.setItem("jobLocation", formData.jobLocation);

        if (data.data.role === "doctor") {
          navigate("/doctor-dashboard", { replace: true });
        } else {
          if (departmentVal === "IPD") {
            navigate("/ipd-dashboard", { replace: true });
          } else {
            navigate("/reception-dashboard", { replace: true });
          }
        }
      } else {
        setErrorMessage(
          data.message || "Invalid email or password. Please try again.",
        );
      }
    } catch (error) {
      setErrorMessage("Server connection failed. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (localStorage.getItem("isAuthenticated") === "true") {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
            20%, 40%, 60%, 80% { transform: translateX(6px); }
          }
        `}
      </style>
      <div style={blobStyle}></div>
      <div style={blob2Style}></div>
      <div className="login-card" style={cardStyle}>
        <div style={brandSectionStyle}>
          <img src={logo} alt="Healing Hands Clinic" style={logoStyle} />
          <p style={dreamQuoteStyle}>
            “Our Dream is to Wake you up to a{" "}
            <span style={{ color: "#fff", fontWeight: "700" }}>
              Good Morning
            </span>
            ”
          </p>

          <div style={dividerStyle}></div>

          <div style={focusedTaglineStyle}>
            India’s Most Trusted Proctology Clinic
          </div>
        </div>

        <div style={formSectionStyle}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <p style={welcomeTitleStyle}>Hospital Management System</p>

            {errorMessage ? (
              <div style={errorBannerStyle}>
                <strong>{errorMessage}</strong>
              </div>
            ) : (
              <p style={{ color: "#718096", fontSize: "13px" }}>
                Enter your credentials to continue
              </p>
            )}
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-15">
              <Form.Label style={labelStyle}>Account Type</Form.Label>
              <Form.Select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                style={{
                  ...inputStyle,
                  borderColor:
                    shakingField === "accountType"
                      ? "#e53e3e"
                      : inputStyle.borderColor,
                  animation:
                    shakingField === "accountType"
                      ? "shake 0.5s ease-in-out"
                      : "none",
                  backgroundColor:
                    shakingField === "accountType"
                      ? "#fff5f5"
                      : inputStyle.backgroundColor,
                }}
              >
                <option value="">Select Account Type</option>
                <option value="Reception">Reception</option>
                <option value="Doctor">Doctor</option>
                <option value="IPD">IPD</option>
              </Form.Select>
            </Form.Group>

            <Form.Group
              className="mb-15"
              onClick={() =>
                !formData.accountType && triggerShake("accountType")
              }
              style={{ cursor: !formData.accountType ? "pointer" : "default" }}
            >
              <Form.Label style={labelStyle}>Clinic Location</Form.Label>
              <Form.Select
                name="jobLocation"
                value={formData.jobLocation}
                onChange={handleChange}
                style={{
                  ...inputStyle,
                  borderColor:
                    shakingField === "jobLocation"
                      ? "#e53e3e"
                      : inputStyle.borderColor,
                  animation:
                    shakingField === "jobLocation"
                      ? "shake 0.5s ease-in-out"
                      : "none",
                  backgroundColor:
                    shakingField === "jobLocation"
                      ? "#fff5f5"
                      : inputStyle.backgroundColor,
                  pointerEvents: !formData.accountType ? "none" : "auto",
                }}
                disabled={!formData.accountType}
              >
                <option value="">Select Location</option>
                {LOCATIONS_LIST.map((loc, index) => (
                  <option key={index} value={loc}>
                    {loc}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-15">
              <Form.Label style={labelStyle}>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@healinghands.com"
                style={inputStyle}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={labelStyle}>Password</Form.Label>
              <div style={{ position: "relative" }}>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={inputStyle}
                />
                <img
                  src={showPassword ? eyeIcon : eyeSlashIcon}
                  alt="Toggle"
                  onClick={togglePasswordVisibility}
                  style={eyeStyle}
                />
              </div>
            </Form.Group>

            <div className="d-flex justify-content-center">
              <Button
                type="submit"
                style={buttonStyle}
                disabled={isLoading}
                className="w-200"
              >
                {isLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      justifyContent="center"
                      alignItems="center"
                    />
                  </>
                ) : (
                  "Login to Dashboard"
                )}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

const errorBannerStyle = {
  backgroundColor: "#fff5f5",
  color: "#c53030",
  padding: "8px 12px",
  borderRadius: "8px",
  fontSize: "13px",
  border: "1px solid #feb2b2",
  display: "inline-block",
  marginTop: "10px",
};

const containerStyle = {
  minHeight: "100vh",
  background: "linear-gradient(to right, #e0f7fa, #80deea)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
  fontFamily: "'Inter', 'Poppins', sans-serif",
  position: "relative",
  overflow: "hidden",
};

const blobStyle = {
  position: "absolute",
  width: "500px",
  height: "500px",
  background:
    "radial-gradient(circle, rgba(77, 208, 225, 0.2) 0%, transparent 70%)",
  borderRadius: "50%",
  top: "-100px",
  right: "-100px",
  zIndex: 0,
};

const blob2Style = {
  position: "absolute",
  width: "400px",
  height: "400px",
  background:
    "radial-gradient(circle, rgba(77, 208, 225, 0.15) 0%, transparent 70%)",
  borderRadius: "50%",
  bottom: "-100px",
  left: "-100px",
  zIndex: 0,
};

const cardStyle = {
  display: "flex",
  flexDirection: "row",
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
  borderRadius: "30px",
  boxShadow: "0 25px 50px -12px rgba(0, 70, 80, 0.15)",
  maxWidth: "850px",
  width: "100%",
  overflow: "hidden",
  zIndex: 1,
  border: "1px solid rgba(77, 208, 225, 0.2)",
};

const brandSectionStyle = {
  flex: "1",
  background:
    "linear-gradient(135deg, rgb(77, 208, 225) 0%, rgb(40, 170, 185) 100%)",
  padding: "30px 30px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "center",
  color: "#fff",
  textAlign: "center",
};

const dreamQuoteStyle = {
  fontSize: "20px",
  fontStyle: "italic",
  lineHeight: "1.4",
  marginTop: "10px",
  color: "rgba(255, 255, 255, 0.93)",
};

const focusedTaglineStyle = {
  fontSize: "20px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "1px",
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  padding: "10px 17px",
  borderRadius: "8px",
  margin: "30px 30px",
  border: "1px solid rgba(255, 255, 255, 0.3)",
};

const formSectionStyle = {
  flex: "1.2",
  padding: "30px 15px",
  backgroundColor: "#ffffff",
};

const logoStyle = {
  width: "280px",
  height: "auto",
  marginBottom: "25px",
  filter: "brightness(0) invert(1)",
};

const dividerStyle = {
  width: "50px",
  height: "3px",
  background: "rgba(255, 255, 255, 0.5)",
  margin: "10px 0",
  borderRadius: "2px",
  marginTop: "42px",
};

const welcomeTitleStyle = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#178aaeff",
  marginBottom: "1px",
};

const labelStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#394659ff",
  marginBottom: "3px",
  marginLeft: "2px",
};

const inputStyle = {
  padding: "6px 10px",
  borderRadius: "12px",
  border: "1px solid #6db8c2ff",
  backgroundColor: "#fafdff",
  fontSize: "12px",
  transition: "all 0.2s ease",
  color: "#2D3748",
};

const eyeStyle = {
  position: "absolute",
  right: "15px",
  top: "50%",
  width: "22px",
  transform: "translateY(-50%)",
  cursor: "pointer",
  opacity: "0.4",
};

const buttonStyle = {
  border: "none",
  padding: "15px",
  borderRadius: "12px",
  fontWeight: "600",
  fontSize: "14px",
  marginTop: "20px",
  boxShadow: "0 10px 15px -3px rgba(77, 208, 225, 0.3)",
  transition: "transform 0.2s ease",
  backgroundColor: "#178aaeff",
  color: "#fff",
};
