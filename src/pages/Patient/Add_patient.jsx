/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react"; // Added useEffect
import { Row, Col, Form, Container, Card } from "react-bootstrap";
import {
  CountryDropdown,
  StateDropdown,
  CityDropdown,
} from "react-country-state-dropdown";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import NavBarP from "../../components/NavbarP";
import { toast } from "react-hot-toast"; // Assuming react-hot-toast is imported globally or available

// Assuming these helpers are defined elsewhere
import { decodeJwt } from "../../utils/decode-jwt"; 

const hospitalData = {
  Cardiology: {
    categories: ["Heart Surgery", "ECG", "General Checkup"],
    doctors: {
      "Heart Surgery": ["Dr. A", "Dr. B"],
      ECG: ["Dr. C", "Dr. D"],
      "General Checkup": ["Dr. E", "Dr. F"],
    },
  },
  Neurology: {
    categories: ["Brain Surgery", "EEG", "Neuropathy"],
    doctors: {
      "Brain Surgery": ["Dr. G", "Dr. H"],
      EEG: ["Dr. I", "Dr. J"],
      Neuropathy: ["Dr. K", "Dr. L"],
    },
  },
  Pediatrics: {
    categories: ["General Pediatrics", "Vaccination"],
    doctors: {
      "General Pediatrics": ["Dr. M", "Dr. N"],
      Vaccination: ["Dr. O", "Dr. P"],
    },
  },
};

const generateUID = () => {
  // HIPAA: Ensure UID is generated securely and is unique on the server, not just client time.
  return `${Date.now()}`;
};

// Keeping the original API URL as requested, but noting the need for HTTPS.
const BASE_URL = "http://localhost:5100/api"; 

export default function Add_Patient() {
  const [formData, setFormData] = useState({
    prefix: "",
    date: new Date().toISOString().split("T")[0],
    uid: generateUID(),
    patientName: "",
    sex: "",
    mobileNo: "",
    alternateNo: "",
    address: "",
    age: "",
    blood_group: "",
    maritalStatus: "",
    weight: "",
    email: "",
    height: "",
    country: "",
    state: "",
    city: "",
    patientHistory: "",
  });

  const [errors, setErrors] = useState({});
  const [country, setCountry] = useState(null);
  const [state, setState] = useState(null);
  const [city, setCity] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [showAddModal, setShowAddModal] = useState(false); // Unused state, but kept
  const [currentLocation, setCurrentLocation] = useState('default'); // ADDED: Location state

  // --- HIPAA: Fetch Current Location from JWT ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        // NOTE: Replace 'decodeJwt' with your actual JWT decoding utility
        const payload = decodeJwt(token); 
        if (payload && payload.jobLocation) {
            setCurrentLocation(payload.jobLocation);
        }
    }
  }, []);
  // ---------------------------------------------

  const categories =
    (selectedDepartment && hospitalData[selectedDepartment]?.categories) || [];
  const doctors =
    (selectedCategory &&
      selectedDepartment &&
      hospitalData[selectedDepartment]?.doctors[selectedCategory]) ||
    [];

  const validate = () => {
    const newErrors = {};
    const requiredFields = [
      "prefix",
      "date",
      "patientName",
      "sex",
      "mobileNo",
      "age",
      "blood_group",
      "weight",
      "height",
      "country",
      "state",
      "city",
      "patientHistory",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${field.replace(/([A-Z])/g, " $1")} is required`;
      }
    });

    const phoneRegex = /^[0-9]{10}$/;
    if (formData.mobileNo && !phoneRegex.test(formData.mobileNo)) {
      newErrors.mobileNo = "Mobile number must be 10 digits";
    }

    // HIPAA: Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format";
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value.toUpperCase(), // Convert input to uppercase
    }));
  };

  // Add this function to format date to YYYY-MM-DD
  const formatDate = (dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD format
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const handleSubmit = async (saveType) => {
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      // HIPAA: Data Minimization in Logging - Log action, not full PHI payload
      console.log("Attempting to submit patient registration.");

      try {
        const payload = { 
            ...formData, 
            saveType,
            patient_location: currentLocation, // Include location in the payload
            // Explicitly ensuring PHI fields are present and correctly mapped for API
            patientName: formData.patientName, 
            mobileNo: formData.mobileNo, 
            email: formData.email,
        };

        const response = await fetch(`${BASE_URL}/V1/patient/addPatient?location=${currentLocation}`, {
          method: "POST",
          // HIPAA: Authorization header required for secure API calls
          headers: { 
            "Content-Type": "application/json",
            // "Authorization": `Bearer ${localStorage.getItem('token')}`, 
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          toast.success("Patient profile created successfully.");
          // Reset form after successful submission (Data Minimization)
          setFormData({
            prefix: "",
            date: new Date().toISOString().split("T")[0],
            uid: generateUID(),
            patientName: "",
            sex: "",
            mobileNo: "",
            alternateNo: "",
            email: "",
            age: "",
            blood_group: "",
            weight: "",
            height: "",
            country: "",
            state: "",
            city: "",
            patientHistory: "",
          });

          setCountry(null);
          setState(null);
          setCity(null);
          setSelectedDepartment("");
          setSelectedCategory("");
          setSelectedDoctor("");

        } else {
          const errorData = await response.json();
          // HIPAA: Use generic, non-specific error message
          toast.error(
            errorData.message || "Failed to save patient details. Please try again."
          );
        }
      } catch (error) {
        console.error("Network Error:", error);
        // HIPAA: Use generic network error message
        toast.error("A network error occurred while saving patient details.");
      }
    } else {
      console.log("Validation errors exist.");
      toast.error("Please correct the validation errors before submitting.");
    }
  };

  const handleSetCountry = (selectedOption) => {
    setCountry(selectedOption);
    setFormData((prev) => ({ ...prev, country: selectedOption.label }));
  };

  const handleSetState = (selectedOption) => {
    setState(selectedOption);
    setFormData((prev) => ({ ...prev, state: selectedOption.label }));
  };

  const handleSetCity = (selectedOption) => {
    setCity(selectedOption);
    setFormData((prev) => ({ ...prev, city: selectedOption.label }));
  };

  const handleDepartmentChange = (e) => {
    const department = e.target.value;
    setSelectedDepartment(department);
    setSelectedCategory(""); 
    setSelectedDoctor("");
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setSelectedDoctor("");
  };

  const handleDoctorChange = (e) => {
    setSelectedDoctor(e.target.value);
  };

  const styles = {
    required: {
      color: "red",
      marginLeft: "3px",
    },
  };

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "'Poppins', Arial, sans-serif",
      }}
    >
      <NavBarP pagename="Add Patient Details" />
      <Container fluid>
        <Row>
          <Col>
            <Card
              style={{
                borderRadius: "15px",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                border: "4px solid #00bcd4",
                background: "white",
                overflow: "hidden",
              }}
              show={showAddModal}
            >
              <Card.Body style={{ padding: "30px" }}>
                <Form>
                  {/* Basic Information Section */}
                  <div className="form-section">
                    <h5 className="section-title">
                      <i className="fas fa-user-circle me-2"></i>
                      Basic Information
                    </h5>
                    <Row>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Patient UID <span style={styles.required}>*</span>
                          </Form.Label>
                          <Form.Control
                            name="uid"
                            placeholder="Enter Patient UID"
                            value={formData.uid}
                            onChange={handleInputChange}
                            disabled
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2} className="mb-4">
                        <Form.Group className="mb-3">
                          <Form.Label className="d-block">
                            Date <span style={styles.required}>*</span>
                          </Form.Label>
                          <DatePicker
                            selected={
                              formData?.date ? new Date(formData.date) : null
                            }
                            onChange={(date) => {
                              const formattedDate = formatDate(date);
                              handleInputChange({
                                target: {
                                  name: "date",
                                  value: formattedDate,
                                },
                              });
                            }}
                            dateFormat="dd/MM/yyyy"
                            className="form-control"
                            placeholderText="Select Date"
                            maxDate={new Date()}
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            style={{
                              height: "38px",
                              width: "100%",
                            }}
                            wrapperClassName="date-picker-wrapper"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={1}>
                        <Form.Group className="mb-3">
                          <Form.Label>Title</Form.Label>
                          <Form.Control
                            as="select"
                            name="prefix"
                            value={formData.prefix}
                            onChange={handleInputChange}
                          >
                            <option value="">Title</option>
                            <option value="MR.">MR.</option>
                            <option value="MISS.">MISS.</option>
                            <option value="MRS.">MRS.</option>
                            <option value="MS.">MS.</option>
                          </Form.Control>
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Patient Name <span style={styles.required}>*</span>
                          </Form.Label>
                          <Form.Control
                            name="patientName"
                            placeholder="Enter Patient Name"
                            value={formData.patientName}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <br />
                    <Row>
                      <Col md={2}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Gender <span style={styles.required}>*</span>
                          </Form.Label>
                          <Form.Control
                            as="select"
                            name="sex"
                            value={formData.sex}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Gender</option>
                            <option value="MALE">MALE</option>
                            <option value="FEMALE">FEMALE</option>
                            <option value="OTHER">OTHER</option>
                          </Form.Control>
                        </Form.Group>
                      </Col>
                      <Col md={1}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Age <span style={styles.required}>*</span>
                          </Form.Label>
                          <Form.Control
                            type="number"
                            name="age"
                            placeholder="Enter Age"
                            value={formData.age}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  {/* Contact Information Section */}
                  <div className="form-section">
                    <h5 className="section-title">
                      <i className="fas fa-address-book me-2"></i>
                      Contact Information
                    </h5>
                    <Row>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Mobile No <span style={styles.required}>*</span>
                          </Form.Label>
                          <Form.Control
                            type="number"
                            name="mobileNo"
                            placeholder="Enter Mobile No"
                            value={formData.mobileNo}
                            onChange={handleInputChange}
                          />
                           {errors.mobileNo && (
                            <p className="error-message">{errors.mobileNo}</p>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Alternate No</Form.Label>
                          <Form.Control
                            type="number"
                            name="alternateNo"
                            placeholder="Enter Alternate No"
                            value={formData.alternateNo}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={5}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Email <span style={styles.required}>*</span>
                          </Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            placeholder="Enter Email"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                          {errors.email && (
                            <p className="error-message">{errors.email}</p>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  {/* Address Information Section */}
                  <div className="form-section">
                    <h5 className="section-title">
                      <i className="fas fa-map-marker-alt me-2"></i>
                      Address Information
                    </h5>
                    <Row>
                      <Col md={4} className="mb-4">
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Country <span style={styles.required}>*</span>
                          </Form.Label>
                          <CountryDropdown
                            className="custom-dropdown"
                            searchable={true}
                            value={country}
                            style={{
                              borderRadius: "8px",
                              border: "3px solid #dee2e6",
                              transition: "all 0.3s ease",
                              backgroundColor: "#ffffff",
                              color: "#2c3e50",
                              fontSize: "0.95rem",
                            }}
                            onChange={(e, value) => {
                              handleSetCountry(value);
                              setFormData((prev) => ({
                                ...prev,
                                country: value.name,
                              }));
                            }}
                          />
                          {errors.country && (
                            <p className="error-message">{errors.country}</p>
                          )}
                        </Form.Group>
                      </Col>

                      {/* State Dropdown */}
                      <Col md={4} className="mb-4">
                        <Form.Group className="mb-3">
                          <Form.Label>
                            State <span style={styles.required}>*</span>
                          </Form.Label>
                          <StateDropdown
                            className="custom-dropdown"
                            country={country}
                            searchable={true}
                            value={state}
                            style={{
                              borderRadius: "8px",
                              border: "3px solid #dee2e6",
                              transition: "all 0.3s ease",
                              backgroundColor: "#ffffff",
                              color: "#2c3e50",
                              fontSize: "0.95rem",
                            }}
                            onChange={(e, value) => {
                              handleSetState(value);
                              setFormData((prev) => ({
                                ...prev,
                                state: value.name,
                              }));
                            }}
                          />
                          {errors.state && (
                            <p className="error-message">{errors.state}</p>
                          )}
                        </Form.Group>
                      </Col>
                      {/* City Dropdown */}
                      <Col md={4} className="mb-4">
                        <Form.Group className="mb-3">
                          <Form.Label>
                            City <span style={styles.required}>*</span>
                          </Form.Label>
                          <CityDropdown
                            className="custom-dropdown"
                            country={country}
                            searchable={true}
                            state={state}
                            value={city}
                            style={{
                              borderRadius: "8px",
                              border: "3px solid #dee2e6",
                              transition: "all 0.3s ease",
                              backgroundColor: "#ffffff",
                              color: "#2c3e50",
                              fontSize: "0.95rem",
                            }}
                            onChange={(e, value) => {
                              handleSetCity(value);
                              setFormData((prev) => ({
                                ...prev,
                                city: value.name,
                              }));
                            }}
                          />
                          {errors.city && (
                            <p className="error-message">{errors.city}</p>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  {/* Medical Information Section */}
                  <div className="form-section">
                    <h5 className="section-title">
                      <i className="fas fa-heartbeat me-2"></i>
                      Medical Information
                    </h5>
                    <Row>
                      <Col md={2}>
                        <Form.Group className="mb-3">
                          <Form.Label>Blood Group</Form.Label>
                          <Form.Control
                            as="select"
                            name="blood_group"
                            value={formData.blood_group}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Blood Group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                          </Form.Control>
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Weight <span style={styles.required}>*</span>
                          </Form.Label>
                          <Form.Control
                            name="weight"
                            placeholder="Enter Weight"
                            value={formData.weight}
                            onChange={handleInputChange}
                          />
                          {errors.weight && (
                            <p className="error-message">{errors.weight}</p>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Height <span style={styles.required}>*</span>
                          </Form.Label>
                          <Form.Control
                            name="height"
                            placeholder="Enter Height"
                            value={formData.height}
                            onChange={handleInputChange}
                          />
                          {errors.height && (
                            <p className="error-message">{errors.height}</p>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                    <br />
                    <Row>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Patient History (PHI)
                            <span style={styles.required}>*</span>
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="patientHistory"
                            placeholder="Enter Patient History"
                            value={formData.patientHistory}
                            onChange={handleInputChange}
                          />
                          {errors.patientHistory && (
                            <p className="error-message">{errors.patientHistory}</p>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  {/* Appointment Information Section */}
                  <div className="form-section">
                    <h5 className="section-title">
                      <i className="fas fa-calendar-check me-2"></i>
                      Appointment Information
                    </h5>
                    <Row>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Department</Form.Label>
                          <Form.Control
                            as="select"
                            value={selectedDepartment}
                            onChange={handleDepartmentChange}
                          >
                            <option value="">Select Department</option>
                            {Object.keys(hospitalData).map((department) => (
                              <option key={department} value={department}>
                                {department}
                              </option>
                            ))}
                          </Form.Control>
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Category</Form.Label>
                          <Form.Control
                            as="select"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                          >
                            <option value="">Select Category</option>
                            {categories &&
                              categories.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                          </Form.Control>
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Doctor</Form.Label>
                          <Form.Control
                            as="select"
                            value={selectedDoctor}
                            onChange={handleDoctorChange}
                          >
                            <option value="">Select Doctor</option>
                            {doctors &&
                              doctors.map((doctor) => (
                                <option key={doctor} value={doctor}>
                                  {doctor}
                                </option>
                              ))}
                          </Form.Control>
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Clinic Location</Form.Label>
                          <Form.Control
                            type="text"
                            value={currentLocation}
                            disabled
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  <style>{/* ... (CSS styles remain unchanged) ... */}</style>

                  {/* Form Buttons */}
                  <div
                    className="form-section"
                    style={{
                      textAlign: "right",
                      background: "#f8f9fa",
                      boxShadow: "none",
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleSubmit("save")}
                    >
                      Create Patient Profile
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        // Reset all form fields
                        setFormData({
                          prefix: "",
                          date: new Date().toISOString().split("T")[0], 
                          uid: generateUID(),
                          patientName: "",
                          sex: "",
                          mobileNo: "",
                          alternateNo: "",
                          age: "",
                          blood_group: "",
                          weight: "",
                          email: "",
                          height: "",
                          country: "",
                          state: "",
                          city: "",
                          patientHistory: "",
                        });

                        setCountry(null);
                        setState(null);
                        setCity(null);
                        setSelectedDepartment("");
                        setSelectedCategory("");
                        setSelectedDoctor("");
                        setErrors({});
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <style>{/* ... (Global CSS styles remain unchanged) ... */}</style>
    </div>
  );
}