import React, { useState, useEffect } from "react";
import { Row, Col, Form, Container, Card } from "react-bootstrap";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { decodeJwt } from "../../utils/decode-jwt";
import Swal from "sweetalert2";
import {
  CountryDropdown,
  StateDropdown,
  CityDropdown,
} from "react-country-state-dropdown";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import NavBarP from "../../components/NavbarP";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

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

const BASE_URL = "http://194.195.117.79:5100/api";

export default function Add_Patient() {
  const [errors, setErrors] = useState({});
  const [country, setCountry] = useState(null);
  const [state, setState] = useState(null);
  const [city, setCity] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("default");
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
  const dropdownStyle = {
    width: "100%",
    height: "38px",
    borderRadius: "6px",
    border: "2px solid #dee2e6",
    fontSize: "14px",
    color: "#495057",
    backgroundColor: "#fff",
    transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
    boxShadow: "none",
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

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
      "address",
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
      [name]: value.toUpperCase(),
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const handleSubmit = async (saveType) => {
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      console.log("Attempting to submit patient registration.");

      try {
        const payload = {
          ...formData,
          saveType,
          patient_location: currentLocation,
          patientName: formData.patientName,
          mobileNo: formData.mobileNo,
          email: formData.email,
        };

        const response = await fetch(
          `${BASE_URL}/V1/patient/addPatient?location=${currentLocation}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Patient profile created successfully.",
            confirmButtonColor: "#00bcd4",
          });
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
          Swal.fire({
            icon: "error",
            title: "Saving Failed",
            text:
              errorData.message ||
              "Failed to save patient details. Please try again.",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Connection Error",
          text: "A network error occurred while saving patient details.",
        });
      }
    } else {
      Toast.fire({
        icon: "warning",
        title: "Please correct the validation errors",
      });
    }
  };

  const handleSetCountry = (selectedOption) => {
    setCountry(selectedOption);
    setFormData((prev) => ({ ...prev, country: selectedOption.name }));
  };

  const handleSetState = (selectedOption) => {
    setState(selectedOption);
    setFormData((prev) => ({ ...prev, state: selectedOption.name }));
  };

  const handleSetCity = (selectedOption) => {
    setCity(selectedOption);
    setFormData((prev) => ({ ...prev, city: selectedOption.name }));
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
        padding: "10px",
        fontFamily: "'Poppins', Arial, sans-serif",
      }}
    >
      <PageBreadcrumb pagename="Add New Patient Page" />
      <NavBarP pagename="Add Patient Details" />
      <Container fluid>
        <Row>
          <Col>
            <Card
              style={{
                borderRadius: "15px",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                border: "1.5px solid #00bcd4",
                background: "white",
                overflow: "hidden",
              }}
              show={showAddModal}
            >
              <Card.Body style={{ padding: "20px" }}>
                <h4 className="section-title" style={{ marginBottom: "15px" }}>
                  Add New Patient Details
                </h4>
                <Form>
                  <div className="form-section">
                    <h5
                      className="section-title"
                      style={{ marginBottom: "15px" }}
                    >
                      <i className="fa fa-user-circle me-2"></i>
                      Basic Information
                    </h5>
                    <Row>
                      <Col md={3}>
                        <Form.Group className="mb-1">
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
                      <Col md={2}>
                        <Form.Group>
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
                            wrapperClassName="date-picker-wrapper"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
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
                        <Form.Group>
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
                      <Col md={3}>
                        <Form.Group>
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
                      <Col md={3}>
                        <Form.Group>
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

                  <div className="form-section">
                    <h5
                      className="section-title"
                      style={{ marginBottom: "15px" }}
                    >
                      <i className="fa fa-address-book me-2"></i>
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
                          <Form.Label>Email</Form.Label>
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

                  <div className="form-section">
                    <h5
                      className="section-title"
                      style={{ marginBottom: "15px" }}
                    >
                      <i className="fa fa-map-marker me-2"></i>
                      Address Information
                    </h5>
                    <Row className="g-4">
                      {/* <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label>
                          Country <span style={styles.required}>*</span>
                        </Form.Label>
                        <CountryDropdown
                          className="custom-dropdown"
                          searchable={true}
                          value={country}
                          style={dropdownStyle}
                          onChange={(e, value) => handleSetCountry(value)}
                        />
                        {errors.country && <p className="error-message">{errors.country}</p>}
                      </Form.Group>
                    </Col>

                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label>
                          State <span style={styles.required}>*</span>
                        </Form.Label>
                        <StateDropdown
                          className="custom-dropdown"
                          country={country}
                          searchable={true}
                          value={state}
                          style={dropdownStyle}
                          onChange={(e, value) => handleSetState(value)}
                        />
                        {errors.state && <p className="error-message">{errors.state}</p>}
                      </Form.Group>
                    </Col>

                    <Col xs={12} md={4}>
                      <Form.Group>
                        <Form.Label>
                          City <span style={styles.required}>*</span>
                        </Form.Label>
                        <CityDropdown
                          className="custom-dropdown"
                          country={country}
                          searchable={true}
                          state={state}
                          value={city}
                          style={dropdownStyle}
                          onChange={(e, value) => handleSetCity(value)}
                        />
                        {errors.city && <p className="error-message">{errors.city}</p>}
                      </Form.Group>
                    </Col> */}
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Patient Address{" "}
                            <span style={styles.required}>*</span>
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="address"
                            placeholder="Enter Full Patient Address"
                            value={formData.address}
                            onChange={handleInputChange}
                          />
                          {errors.address && (
                            <p
                              className="error-message"
                              style={{ color: "red", fontSize: "12px" }}
                            >
                              {errors.address}
                            </p>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  <div className="form-section">
                    <h5
                      className="section-title"
                      style={{ marginBottom: "15px" }}
                    >
                      <i className="fa fa-heartbeat me-2"></i>
                      Medical Information
                    </h5>
                    <Row>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Blood Group</Form.Label>
                          <span style={styles.required}>*</span>
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
                      <Col md={3}>
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
                      <Col md={3}>
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
                            <p className="error-message">
                              {errors.patientHistory}
                            </p>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  <div className="form-section">
                    <h5
                      className="section-title"
                      style={{ marginBottom: "15px" }}
                    >
                      <i className="fa fa-calendar me-2"></i>
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
                      className="btn btn-danger"
                      style={{ borderRadius: "10px" }}
                      onClick={() => {
                        Swal.fire({
                          title: "Are you sure?",
                          text: "All unsaved patient data will be lost.",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonColor: "#d33",
                          cancelButtonColor: "#aaa",
                          confirmButtonText: "Yes, Reset Form",
                        }).then((result) => {
                          if (result.isConfirmed) {
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
                          }
                        });
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      style={{ borderRadius: "10px" }}
                      className="btn btn-primary ms-2"
                      onClick={() => handleSubmit("save")}
                    >
                      Create Patient Profile
                    </button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
