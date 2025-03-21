import React, { useState } from "react";
import { Row, Col, Form, Container, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  CountryDropdown,
  StateDropdown,
  CityDropdown,
} from "react-country-state-dropdown";
import PageBreadcrumb from "../componets/PageBreadcrumb";
import { FaMars } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import NavBarP from "../componets/NavbarP";
import Select from "react-select";

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
  return `${Date.now()}`;
};

const BASE_URL = "http://192.168.1.46:5000/api"; // Update your API base URL here

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
  const [showAddModal, setShowAddModal] = useState(false);

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
      if (isNaN(date.getTime())) return ""; // Return empty string if invalid date

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
      try {
        const response = await fetch(`${BASE_URL}/V1/patient/addPatient`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, saveType }),
        });

        if (response.ok) {
          alert(
            saveType === "Create Patient Profile"
              ? "Patient saved successfully"
              : "Patient saved successfully"
          );
          // Reset form after submission
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

          // Reset the location dropdowns
          setCountry(null);
          setState(null);
          setCity(null);

          // Reset department selections
          setSelectedDepartment("");
          setSelectedCategory("");
          setSelectedDoctor("");

          // Optionally, you can redirect to the patient list page or refresh the patient list
          // history.push("/patient-list"); // If using React Router
        } else {
          const errorData = await response.json();
          alert(
            errorData.message ||
              "Failed to save patient details. Please try again."
          );
        }
      } catch (error) {
        console.error("Network Error:", error);
        alert("An error occurred while saving patient details.");
      }
    } else {
      console.log("Validation errors:", validationErrors);
    }
  };
  // const handleSetCountry = (value) => {
  //   setCountry(value);
  //   setFormData((prev) => ({ ...prev, country: value }));
  // };

  // const handleSetState = (value) => {
  //   setState(value);
  //   setFormData((prev) => ({ ...prev, state: value }));
  // };

  // const handleSetCity = (value) => {
  //   setCity(value);
  //   setFormData((prev) => ({ ...prev, city: value }));
  // };

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
    setSelectedCategory(""); // Reset category when department changes
    setSelectedDoctor(""); // Reset doctor when department changes
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setSelectedDoctor(""); // Reset doctor when category changes
  };

  const handleDoctorChange = (e) => {
    setSelectedDoctor(e.target.value);
  };

  // Add this style object
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
                              console.log(value);
                              handleSetCountry(value);
                              setFormData((prev) => ({
                                ...prev,
                                country: value.name,
                              }));
                            }}
                          />
                          {errors.country && (
                            <p style={{ color: "red" }}>{errors.country}</p>
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
                              // padding: "12px 15px",
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
                            <p style={{ color: "red" }}>{errors.state}</p>
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
                              // padding: "12px 15px",
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
                            <p style={{ color: "red" }}>{errors.city}</p>
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
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group className="mb-3">
                          <Form.Label>Height</Form.Label>
                          <Form.Control
                            name="height"
                            placeholder="Enter Height"
                            value={formData.height}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <br />
                    <Row>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Patient History{" "}
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
                    </Row>
                  </div>

                  <style>
                    {`
                      .form-section {
                        background: #f8f9fa;
                        padding: 25px;
                        border-radius: 12px;
                        margin-bottom: 25px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                      }

                      .section-title {
                        color: #2c3e50;
                        margin-bottom: 25px;
                        padding-bottom: 15px;
                        border-bottom: 2px solid #3498db;
                        font-weight: 600;
                      }

                      .form-control {
                        border-radius: 8px;
                        border: 1px solid #dee2e6;
                        padding: 12px 15px;
                        transition: all 0.3s ease;
                      }

                      .form-control:focus {
                        box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
                        border-color: #3498db;
                      }

                      .form-label {
                        font-weight: 500;
                        color: #34495e;
                        margin-bottom: 8px;
                        font-size: 14px;
                      }

                      .btn {
                        padding: 12px 25px;
                        border-radius: 8px;
                        font-weight: 500;
                        transition: all 0.3s ease;
                      }

                      .btn-primary {
                        background: #3498db;
                        border: none;
                      }

                      .btn-primary:hover {
                        background: #2980b9;
                        transform: translateY(-2px);
                      }
                    `}
                  </style>

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
                        // Reset all form fields to their initial empty state
                        setFormData({
                          prefix: "",
                          date: new Date().toISOString().split("T")[0], // Keep today's date as default
                          uid: generateUID(), // Generate new UID
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

                        // Reset the location dropdowns
                        setCountry(null);
                        setState(null);
                        setCity(null);

                        // Reset department selections
                        setSelectedDepartment("");
                        setSelectedCategory("");
                        setSelectedDoctor("");

                        // Clear any validation errors
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
      <style>
        {`
          .enquiry-card {
            border-radius: 15px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            border: none;
            background: #f8f9fa;
            overflow: hidden;
            margin-bottom: 30px;
          }

          .card-body {
            padding: 30px;
          }

          .form-section {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 25px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }

          .form-label {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 8px;
            font-size: 0.95rem;
          }

          .form-control, .form-select {
            border-radius: 8px;
            border: 3px solid #dee2e6;
            padding: 12px 15px;
            transition: all 0.3s ease;
            background-color: #ffffff;
            color: #2c3e50;
            font-size: 0.95rem;
          }

          .form-control:focus, .form-select:focus {
            border-color: #00bcd4;
            box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.1);
            background-color: #f8F9FA;
          }

          textarea.form-control {
            min-height: 120px;
            resize: vertical;
          }

          .form-select {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 0.75rem center;
            background-size: 16px 12px;
          }

          .btn-primary {
            background:linear-gradient(45deg, #00bcd4, #00acc1);
            border: none;
            padding: 12px 25px;
            border-radius: 8px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 188, 212, 0.2);
          }

          .btn-primary:hover {
            background: linear-gradient(45deg, #00acc1, #0097a7);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 188, 212, 0.3);
          }

          .btn-primary:disabled {
            background: #bdc3c7;
            transform: none;
          }

          /* Error message styling */
          .error-message {
            color: #e74c3c;
            font-size: 0.85rem;
            margin-top: 5px;
          }

          /* Responsive adjustments */
          @media (max-width: 768px) {
            .card-body {
              padding: 20px;
            }

            .form-section {
              padding: 15px;
            }

            .btn-primary {
              width: 100%;
              margin-top: 15px;
            }
          }

          /* Row spacing */
          .row {
            margin-bottom: 20px;
          }

          /* Spinner styling */
          .spinner-border {
            margin-right: 8px;
            width: 1.2rem;
            height: 1.2rem;
          }

          /* Optional: Add animation for form elements */
          .form-control, .form-select, .btn {
            animation: fadeIn 0.5s ease-in-out;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Optional: Add hover effect for form controls */
          .form-control:hover, .form-select:hover {
            border-color: #3498db;
          }

            .date-picker-wrapper {
            margin-bottom: 0 !important;
          }

          .react-datepicker-wrapper {
            margin-bottom: 0 !important;
            display: block;
          }

          .react-datepicker__input-container {
            margin-bottom: 0 !important;
            display: block;
          }
        `}
      </style>
    </div>
  );
}
