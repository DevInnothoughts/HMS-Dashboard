// import React, { useState, useEffect } from "react";
// import { Link, useNavigate, Navigate } from "react-router-dom";
// import { Button, Form } from "react-bootstrap";

// import eyeIcon from "../../assets/images/Eye/view.png";
// import eyeSlashIcon from "../../assets/images/Eye/invisible.png";
// import logo from "../../assets/images/logo/icon-logo.png";

// // Define the hardcoded list directly for use
// const LOCATIONS_LIST = ["hms", "pune", "demo"]; // Added a couple more for better list view

// const BASE_URL = "http://localhost:5100/api"; // BASE_URL is still needed for the handleSubmit fetch

// export default function Login() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const checkAuth = () => {
//       const isAuthenticated = localStorage.getItem("isAuthenticated");
//       const accountType = localStorage.getItem("accountType");

//       if (isAuthenticated === "true") {
//         navigate(accountType === "admin" ? "/" : "/");
//       }
//     };

//     checkAuth();
//   }, [navigate]);

//   const [formData, setFormData] = useState({
//     accountType: "",
//     jobLocation: "", // This will be set by the location list selection
//     email: "",
//     password: "",
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const togglePasswordVisibility = () => setShowPassword(!showPassword);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === "checkbox" ? checked : value,
//     });
//   };

//   // Handler for location list selection
//   const handleLocationSelect = (location) => {
//     setFormData((prevData) => ({
//       ...prevData,
//       jobLocation: location,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const { accountType, email, password, jobLocation } = formData;

//     if (!jobLocation) {
//       alert("Please select a location");
//       return;
//     }

//     try {
//       const response = await fetch(`${BASE_URL}/V1/auth/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: email,
//           password: password,
//           accountType: accountType,
//           jobLocation: jobLocation,
//         }),
//       });

//       const data = await response.json();

//       if (data.success) {
//         localStorage.setItem("isAuthenticated", "true");
//         localStorage.setItem("accountType", data.data.role);
//         localStorage.setItem("jobLocation", data.data.jobLocation);
//         localStorage.setItem("userEmail", email);
//         localStorage.setItem("token", data.data.token);

//         navigate(data.data.role === "admin" ? "/" : "/", {
//           replace: true,
//         });
//       } else {
//         alert(data.message || "Login failed");
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       alert("An error occurred during login");
//     }
//   };

//   // --- Location Fetching logic has been removed ---

//   if (localStorage.getItem("isAuthenticated") === "true") {
//     return <Navigate to="/" replace />;
//   }

//   return (
//     <div
//       className="auth-main"
//       style={{
//         background: "linear-gradient(120deg, #4776E6 0%, #8E54E9 100%)",
//         minHeight: "100vh",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         padding: "20px",
//         fontFamily: "'Poppins', sans-serif",
//       }}
//     >
//       <div
//         className="codex-authbox"
//         style={{
//           background: "rgba(255, 255, 255, 0.95)",
//           padding: "40px",
//           borderRadius: "24px",
//           boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
//           maxWidth: "450px",
//           width: "100%",
//           transition: "all 0.3s ease",
//           backdropFilter: "blur(10px)",
//           border: "1px solid rgba(255, 255, 255, 0.2)",
//         }}
//       >
//         <div
//           className="auth-header"
//           style={{ textAlign: "center", marginBottom: "35px" }}
//         >
//           <div className="codex-brand" style={{ marginBottom: "25px" }}>
//             <Link to={""}>
//               <img
//                 className="img-fluid"
//                 src={logo}
//                 alt="HMS Logo"
//                 style={{
//                   maxWidth: "80px",
//                   marginBottom: "15px",
//                   filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
//                 }}
//               />
//               <span
//                 className="ms-2"
//                 style={{
//                   fontSize: "35px",
//                   fontWeight: "700",
//                   background: "linear-gradient(120deg, #4776E6, #8E54E9)",
//                   WebkitBackgroundClip: "text",
//                   WebkitTextFillColor: "transparent",
//                   display: "block",
//                 }}
//               >
//                 HMS
//               </span>
//             </Link>
//           </div>
//           <h3
//             style={{
//               fontSize: "32px",
//               fontWeight: "800",
//               color: "#2D3748",
//               marginBottom: "12px",
//               letterSpacing: "-0.5px",
//             }}
//           >
//             Welcome Back
//           </h3>
//           <p style={{ color: "#718096", fontSize: "16px", fontWeight: "400" }}>
//             Please login to your account
//           </p>
//         </div>

//         <Form onSubmit={handleSubmit}>
//           <Form.Group className="mb-4">
//             <Form.Select
//               name="accountType"
//               value={formData.accountType}
//               onChange={handleChange}
//               style={{
//                 padding: "15px",
//                 borderRadius: "12px",
//                 border: "1.5px solid #E2E8F0",
//                 backgroundColor: "#F8FAFC",
//                 fontSize: "15px",
//                 fontWeight: "500",
//                 color: "#4A5568",
//               }}
//             >
//               <option value="">Select Account Type</option>
//               <option value="admin">Admin</option>
//               <option value="doctor">Doctor</option>
//               <option value="reception">Reception</option>
//             </Form.Select>
//           </Form.Group>

//           {/* 👇 START: Location List using LOCATIONS_LIST array 👇 */}
//           <Form.Group className="mb-4">
//             <div style={{ marginBottom: "8px", fontWeight: "600", color: "#4A5568" }}>
//               Select Location:
//             </div>
//             <div
//               style={{
//                 display: "flex",
//                 flexWrap: "wrap",
//                 gap: "10px",
//                 justifyContent: "flex-start",
//               }}
//             >
//               {LOCATIONS_LIST.length > 0 ? (
//                 LOCATIONS_LIST.map((location, index) => (
//                   <button
//                     key={index}
//                     type="button"
//                     onClick={() => handleLocationSelect(location)}
//                     style={{
//                       padding: "10px 18px",
//                       borderRadius: "20px",
//                       border:
//                         formData.jobLocation === location
//                           ? "2px solid #4776E6"
//                           : "1px solid #E2E8F0",
//                       backgroundColor:
//                         formData.jobLocation === location
//                           ? "#EBF4FF" // Light blue for selected
//                           : "#F8FAFC",
//                       color:
//                         formData.jobLocation === location
//                           ? "#4776E6"
//                           : "#4A5568",
//                       fontSize: "14px",
//                       fontWeight: "500",
//                       cursor: "pointer",
//                       transition: "all 0.2s ease",
//                       textTransform: "capitalize",
//                     }}
//                   >
//                     {location}
//                   </button>
//                 ))
//               ) : (
//                 <span style={{ color: "#718096", fontSize: "14px" }}>
//                   No locations defined.
//                 </span>
//               )}
//             </div>
//           </Form.Group>
//           {/* 👆 END: Location List 👆 */}

//           <Form.Group className="mb-4">
//             <Form.Control
//               type="email"
//               placeholder="Email Address"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               style={{
//                 padding: "15px",
//                 borderRadius: "12px",
//                 border: "1.5px solid #E2E8F0",
//                 backgroundColor: "#F8FAFC",
//                 fontSize: "15px",
//                 fontWeight: "500",
//                 color: "#4A5568",
//               }}
//             />
//           </Form.Group>

//           <Form.Group className="mb-4">
//             <div style={{ position: "relative" }}>
//               <Form.Control
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 style={{
//                   padding: "15px",
//                   paddingRight: "45px",
//                   borderRadius: "12px",
//                   border: "1.5px solid #E2E8F0",
//                   backgroundColor: "#F8FAFC",
//                   fontSize: "15px",
//                   fontWeight: "500",
//                   color: "#4A5568",
//                 }}
//               />
//               <img
//                 src={showPassword ? eyeIcon : eyeSlashIcon}
//                 alt="Toggle password"
//                 onClick={togglePasswordVisibility}
//                 style={{
//                   position: "absolute",
//                   right: "15px",
//                   top: "50%",
//                   width: "20px",
//                   height: "20px",
//                   transform: "translateY(-50%)",
//                   cursor: "pointer",
//                   opacity: "0.6",
//                   transition: "opacity 0.2s ease",
//                 }}
//               />
//             </div>
//           </Form.Group>

//           <Form.Group className="mb-4">
//             <Button
//               className="w-100"
//               type="submit"
//               style={{
//                 background: "linear-gradient(120deg, #4776E6 0%, #8E54E9 100%)",
//                 border: "none",
//                 padding: "15px",
//                 borderRadius: "12px",
//                 fontSize: "16px",
//                 fontWeight: "600",
//                 boxShadow: "0 4px 15px rgba(71, 118, 230, 0.4)",
//               }}
//             >
//               Login
//             </Button>
//           </Form.Group>
//         </Form>
//       </div>
//     </div>
//   );
// }

import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Button, Form, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import eyeIcon from "../../assets/images/Eye/view.png";
import eyeSlashIcon from "../../assets/images/Eye/invisible.png";
import logo from "../../assets/images/logo/hhc-logo.webp";

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
  "HSR Layout",
  "JP Nagar",
  "Navi Mumbai",
  "Chinchwad",
  "Nashik",
  "Salunke Vihar",
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
  "demo"
].sort();

const BASE_URL = "http://localhost:5100/api";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    department: "",
    accountType: "",
    jobLocation: "",
    email: "",
    password: "",
  });

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errorMessage) setErrorMessage("");

    setFormData((prev) => {
      const nextData = { ...prev, [name]: value };
      if (name === "department") {
        nextData.accountType = "";
      }
      return nextData;
    });
  };

  const getAccountOptions = () => {
    if (formData.department === "OPD")
      return [{ value: "reception", label: "Reception" }];
    if (formData.department === "IPD") {
      return [
        { value: "reception", label: "Reception" },
        { value: "doctor", label: "Doctor" },
        { value: "nurse", label: "Nurse" },
      ];
    }
    return [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    const { accountType, email, password, jobLocation } = formData;

    if (!jobLocation) {
      setErrorMessage("Please select a clinic location");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/V1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, accountType, jobLocation }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("accountType", data.data.role);
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("department", formData.department);
        localStorage.setItem("jobLocation", formData.jobLocation);

        navigate("/reception-dashboard", { replace: true });
      } else {
        setErrorMessage(
          data.message || "Invalid email or password. Please try again."
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
          <div style={focusedTaglineStyle}>
            India’s Most Trusted Proctology Clinic
          </div>
          <div style={dividerStyle}></div>
          <p style={brandDescStyle}>
            Specialized care for Proctology, Laparoscopy, and Vascular surgery
            including Piles, Fistula, Hernia, Varicose Veins, and Urology.
          </p>
        </div>

        <div style={formSectionStyle}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <p style={welcomeTitleStyle}>Hospital Management System</p>
            <h2 style={brandTaglineStyle}>Staff Login</h2>

            {errorMessage ? (
              <div style={errorBannerStyle}>
                <strong>Login Failed</strong>
              </div>
            ) : (
              <p
                style={{ color: "#718096", fontSize: "13px", marginTop: "5px" }}
              >
                Enter your credentials to continue
              </p>
            )}
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-13">
              <Form.Label style={labelStyle}>Department Type</Form.Label>
              <Form.Select
                name="department"
                value={formData.department}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Select Department</option>
                <option value="IPD">IPD</option>
                <option value="OPD">OPD</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-13">
              <Form.Label style={labelStyle}>Account Type</Form.Label>
              <Form.Select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                style={inputStyle}
                disabled={!formData.department}
              >
                <option value="">Select Account Type</option>
                {getAccountOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-13">
              <Form.Label style={labelStyle}>Clinic Location</Form.Label>
              <Form.Select
                name="jobLocation"
                value={formData.jobLocation}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Select Location</option>
                {LOCATIONS_LIST.map((loc, index) => (
                  <option key={index} value={loc}>
                    {loc}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-13">
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
  marginTop: "5px",
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
  maxWidth: "950px",
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
  fontSize: "19px",
  fontStyle: "italic",
  lineHeight: "1.4",
  marginTop: "10px",
  color: "rgba(255, 255, 255, 0.9)",
};

const focusedTaglineStyle = {
  fontSize: "21px",
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
  padding: "30px 25px",
  backgroundColor: "#ffffff",
};

const logoStyle = {
  width: "280px",
  height: "auto",
  marginBottom: "25px",
  filter: "brightness(0) invert(1)",
};

const brandTaglineStyle = {
  fontSize: "18px",
  fontWeight: "500",
  marginTop: "5px",
};

const dividerStyle = {
  width: "50px",
  height: "3px",
  background: "rgba(255, 255, 255, 0.5)",
  margin: "15px 0",
  borderRadius: "2px",
};

const brandDescStyle = {
  fontSize: "16px",
  marginTop: "16px",
  lineHeight: "1.6",
  color: "rgba(255, 255, 255, 0.85)",
  maxWidth: "320px",
};

const welcomeTitleStyle = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#178aaeff",
  marginBottom: "5px",
};

const labelStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#415066ff",
  marginBottom: "5px",
  marginLeft: "2px",
};

const inputStyle = {
  padding: "5px 15px",
  borderRadius: "12px",
  border: "1px solid #6db8c2ff",
  backgroundColor: "#fafdff",
  fontSize: "14px",
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
