import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";
import AppointmentNavbar from "../../components/Navbar/AppointmentNavbar";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import FeatherIcon from "feather-icons-react";
import "../../styles/styles.css";
import { decodeJwt } from "../../utils/decode-jwt";

// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://194.195.117.79:5100/api";

const getCountryCode = (patient_phone) => {
  if (!patient_phone) return "Unknown";
  const country = countryCodes.find((code) =>
    patient_phone.startsWith(code.value),
  );
  return country ? country.value : "Unknown";
};

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

const countryCodes = [
  { value: "+1", label: "🇺🇸 USA (+1)" },
  { value: "+91", label: "🇮🇳 India (+91)" },
  { value: "+44", label: "🇬🇧 UK (+44)" },
  { value: "+61", label: "🇦🇺 Australia (+61)" },
  { value: "+81", label: "🇯🇵 Japan (+81)" },
  { value: "+49", label: "🇩🇪 Germany (+49)" },
  { value: "+33", label: "🇫🇷 France (+33)" },
  { value: "+971", label: "🇦🇪 UAE (+971)" },
  { value: "+86", label: "🇨🇳 China (+86)" },
  { value: "+55", label: "🇧🇷 Brazil (+55)" },
  { value: "+27", label: "🇿🇦 South Africa (+27)" },
  { value: "+34", label: "🇪🇸 Spain (+34)" },
];

const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

export default function AddEnquiry({ isTab = false }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [formData, setFormData] = useState({
    date: formatDate(new Date()),
    doctorId: "",
    enquirytype: "",
    patient_type: "New",
    patient_name: "",
    patient_phone: "",
    time: new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    patient_location: "",
    reference: "",
    FDE_Name: "",
    note: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isPatientRegistered, setIsPatientRegistered] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [fdeList, setFdeList] = useState([]);
  const phoneRegex = /^[0-9]{7,15}$/;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  useEffect(() => {
    const checkPatientPhone = async () => {
      const phone = formData.patient_phone;
      if (!phone || phone.length < 7 || !currentLocation) {
        setIsPatientRegistered(false);
        return;
      }

      setIsCheckingPhone(true);
      try {
        const response = await fetch(
          `${BASE_URL}/V1/patient/searchPatient?query=${encodeURIComponent(phone)}&location=${encodeURIComponent(currentLocation)}`,
        );
        if (response.ok) {
          const data = await response.json();
          // Check if any returned patient has this phone as primary and has a Uid_no generated
          const isRegistered =
            data.data && data.data.some((p) => p.phone === phone && p.Uid_no);
          if (isRegistered) {
            setIsPatientRegistered(true);
            Swal.fire({
              icon: "warning",
              title: "Already Registered",
              text: "This contact number is already registered as a patient.",
              confirmButtonColor: "#00bcd4",
            });
          } else {
            setIsPatientRegistered(false);
          }
        }
      } catch (error) {
        console.error("Error checking patient phone:", error);
      } finally {
        setIsCheckingPhone(false);
      }
    };

    const debounceTimer = setTimeout(checkPatientPhone, 800);
    return () => clearTimeout(debounceTimer);
  }, [formData.patient_phone, currentLocation]);

  const validate = () => {
    const newErrors = {};
    const requiredFields = [
      "date",
      "doctorId",
      "enquirytype",
      "patient_name",
      "patient_phone",
      "patient_location",
      "reference",
      "FDE_Name",
      "time",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        let displayName = field.replace(/([A-Z])/g, " $1");
        if (field === "doctorId") displayName = "Doctor Name";
        if (field === "FDE_Name") displayName = "FDE Name";
        newErrors[field] = `${displayName} is required`;
      }
    });

    if (!formData.patient_phone || !phoneRegex.test(formData.patient_phone)) {
      newErrors.patient_phone = "Enter a valid phone number (7-15 digits)";
    }

    if (!currentLocation) {
      newErrors.location = "Location data is not available.";
    }
    return newErrors;
  };

  const parseDate = (dateString) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFormData({
      date: formatDate(new Date()),
      doctorId: "",
      enquirytype: "",
      patient_type: "New",
      patient_name: "",
      patient_phone: "",
      patient_location: "",
      reference: "",
      FDE_Name: "",
      note: "",
      time: new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
    setErrors({});
    setIsPatientRegistered(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      const payload = {
        doctor_id: formData.doctorId,
        patient_type: formData.patient_type,
        enquirytype: formData.enquirytype,
        patient_name: formData.patient_name,
        patient_phone: formData.patient_phone,
        date: formData.date,
        time: formData.time,
        patient_location: formData.patient_location,
        reference: formData.reference,
        FDE_Name: formData.FDE_Name,
        note: formData.note,
        clinic_location: currentLocation,
        countryCode: getCountryCode(formData.patient_phone),
      };

      try {
        const response = await fetch(
          `${BASE_URL}/V1/enquiry/addEnquiry?location=${currentLocation}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Enquiry has been added successfully.",
            confirmButtonColor: "#00bcd4",
          });
          handleReset();
        } else {
          const errorData = await response.json();
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: errorData.message || "Failed to add enquiry",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "A network error occurred.",
        });
      } finally {
        setLoading(false);
      }
    } else {
      Toast.fire({ icon: "warning", title: "Please fill all required fields" });
    }
  };

  const fetchDropdownData = useCallback(async () => {
    if (!currentLocation) return;
    try {
      const fetchApi = async (endpoint, module = "appointment") => {
        const url = `${BASE_URL}/V1/${module}/${endpoint}?location=${currentLocation}`;
        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        return response.ok ? response.json() : { data: [] };
      };

      const [doctorData, fdeData] = await Promise.all([
        fetchApi("doctorDropdown", "doctor").then((res) => res.data),
        fetchApi("fdeDropdown", "appointment").then((res) => res.data),
      ]);

      setDoctors(Array.isArray(doctorData) ? doctorData : []);
      setFdeList(Array.isArray(fdeData) ? fdeData : []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error.message);
    }
  }, [currentLocation]);

  useEffect(() => {
    if (currentLocation) fetchDropdownData();
  }, [currentLocation, fetchDropdownData]);

  const labelStyle = {
    fontSize: "13px",
    fontWeight: "600",
    color: "#555",
    marginBottom: "5px",
    display: "block",
  };

  const inputStyle = {
    fontSize: "12px",
    borderRadius: "10px",
    border: "2px solid rgb(77, 208, 225)",
    padding: "5px 10px",
    textTransform: "none",
  };

  return (
    <div
      className={isTab ? "" : "themebody-wrap"}
      style={
        isTab
          ? { fontFamily: "'Poppins', Arial, sans-serif" }
          : {
            background: "linear-gradient(to right, #e0f7fa, #80deea)",
            minHeight: "100vh",
            padding: "10px",
            fontFamily: "'Poppins', Arial, sans-serif",
          }
      }
    >
      {!isTab && <PageBreadcrumb pagename="Add Enquiry" />}
      {!isTab && <AppointmentNavbar pagename="Add Enquiry" />}

      <Container fluid style={isTab ? { padding: 0 } : {}}>
        <Row>
          <Col>
            <Card
              style={{
                borderRadius: "15px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
                border: "none",
                background: "white",
                overflow: "hidden",
                margin: "5px",
                marginTop: "-3px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#67c5cfff",
                  padding: "12px 20px",
                  borderBottom: "2px solid #1a5b61ff",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FeatherIcon
                  icon="help-circle"
                  size="18"
                  style={{ color: "#1a5b61ff", marginRight: "10px" }}
                />
                <h4
                  className="m-0"
                  style={{
                    color: "#1a5b61ff",
                    fontWeight: "600",
                    fontSize: "1rem",
                  }}
                >
                  Add New Enquiry Details
                </h4>
              </div>

              <Card.Body style={{ padding: "10px" }}>
                <Form onSubmit={handleSubmit}>
                  {errors.location && (
                    <div className="alert alert-danger py-2 px-3 mb-3 small">
                      {errors.location}
                    </div>
                  )}

                  <Row className="g-3 mb-3">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label style={labelStyle}>
                          Enquiry Date <span className="text-danger">*</span>
                        </Form.Label>
                        <DatePicker
                          required
                          selected={parseDate(formData.date)}
                          onChange={(date) =>
                            date &&
                            setFormData((prev) => ({
                              ...prev,
                              date: formatDate(date),
                            }))
                          }
                          dateFormat="dd-MM-yyyy"
                          minDate={new Date()}
                          className="form-control custom-datepicker"
                          wrapperClassName="d-block w-100"
                          style={inputStyle}
                        />
                        {errors.date && (
                          <p
                            className="text-danger mt-1"
                            style={{ fontSize: "11px" }}
                          >
                            {errors.date}
                          </p>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label style={labelStyle}>
                          Enquiry Type <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          required
                          name="enquirytype"
                          style={inputStyle}
                          value={formData.enquirytype}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Enquiry Type</option>
                          {[
                            "Call for Refund Amount",
                            "Wrong Enquiry or Spam Call",
                            "Enquiry for Test Charges",
                            "Accounts Department",
                            "Call for Another Branches",
                            "Call for IPD Doctors",
                            "Call for Assistant Doctors",
                            "Call Regarding Job Vacancy",
                            "Appointment Consultation",
                            "Online Consultation",
                            "SX Cost Enquiry",
                            "Call for Lab Test Enquiry",
                            "Medicines Availability at Pharmacy",
                            "Patient is Coming Late for Appointment",
                            "Insurance Related Queries",
                          ].map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </Form.Select>
                        {errors.enquirytype && (
                          <p
                            className="text-danger mt-1"
                            style={{ fontSize: "11px" }}
                          >
                            {errors.enquirytype}
                          </p>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label style={labelStyle}>
                          Doctor Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          required
                          name="doctorId"
                          style={inputStyle}
                          value={formData.doctorId}
                          onChange={handleInputChange}
                          disabled={!currentLocation || doctors.length === 0}
                        >
                          <option value="">Select a Doctor</option>
                          {doctors.map((doctor) => (
                            <option
                              key={doctor.doctor_id}
                              value={doctor.doctor_id}
                            >
                              {doctor.name}
                            </option>
                          ))}
                        </Form.Select>
                        {errors.doctorId && (
                          <p
                            className="text-danger mt-1"
                            style={{ fontSize: "11px" }}
                          >
                            {errors.doctorId}
                          </p>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="g-3 mb-3">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label style={labelStyle}>
                          Patient Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          required
                          type="text"
                          name="patient_name"
                          placeholder="Enter Patient Name"
                          style={inputStyle}
                          value={formData.patient_name}
                          onChange={handleInputChange}
                        />
                        {errors.patient_name && (
                          <p
                            className="text-danger mt-1"
                            style={{ fontSize: "11px" }}
                          >
                            {errors.patient_name}
                          </p>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label style={labelStyle}>
                          Contact Number <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          required
                          type="tel"
                          name="patient_phone"
                          value={formData.patient_phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            if (val.length <= 10)
                              setFormData((prev) => ({
                                ...prev,
                                patient_phone: val,
                              }));
                          }}
                          placeholder="Enter Contact Number"
                          style={inputStyle}
                        />
                        {errors.patient_phone && (
                          <p
                            className="text-danger mt-1"
                            style={{ fontSize: "11px" }}
                          >
                            {errors.patient_phone}
                          </p>
                        )}
                        {isPatientRegistered && (
                          <p
                            className="text-danger mt-1"
                            style={{ fontSize: "11px", fontWeight: "600" }}
                          >
                            *Contact Number already registered as a patient.
                          </p>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label style={labelStyle}>
                          Address <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          required
                          type="text"
                          name="patient_location"
                          placeholder="Enter Address"
                          style={inputStyle}
                          value={formData.patient_location}
                          onChange={handleInputChange}
                        />
                        {errors.patient_location && (
                          <p
                            className="text-danger mt-1"
                            style={{ fontSize: "11px" }}
                          >
                            {errors.patient_location}
                          </p>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="g-3 mb-15">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label style={labelStyle}>
                          FDE Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          required
                          name="FDE_Name"
                          style={inputStyle}
                          value={formData.FDE_Name}
                          onChange={handleInputChange}
                          disabled={!currentLocation || fdeList.length === 0}
                        >
                          <option value="">Select FDE Name</option>
                          {/* {fdeList.map((fde) => (
                            <option key={fde.FDEID} value={fde.FDEID}>
                              {fde.FDEName}
                            </option>
                          ))} */}
                          {fdeList.map((fde) => (
                            <option key={fde.FDEID} value={fde.FDEName}>
                              {fde.FDEName}
                            </option>
                          ))}
                        </Form.Select>
                        {errors.FDE_Name && (
                          <p
                            className="text-danger mt-1"
                            style={{ fontSize: "11px" }}
                          >
                            {errors.FDE_Name}
                          </p>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label style={labelStyle}>
                          Reference <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          required
                          name="reference"
                          style={inputStyle}
                          value={formData.reference}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Reference</option>
                          {[
                            "Family / Friends",
                            "Referred By Another Doctor",
                            "Referred By Another Patient",
                            "Internet",
                            "Social Media",
                            "Entertainment Media",
                            "TV Show",
                            "Newspaper / Magazine",
                            "Awareness Lecture",
                            "HHC Board on building",
                            "I was treated here in past ",
                            "Healing Hands Clinic Branch",
                            "Aggregators",
                            "Doctor's Privilege Card",
                            "Campaign",
                            "Brand Ambassador",
                            "Other",
                          ].map((ref) => (
                            <option key={ref} value={ref}>
                              {ref}
                            </option>
                          ))}
                        </Form.Select>
                        {errors.reference && (
                          <p
                            className="text-danger mt-1"
                            style={{ fontSize: "11px" }}
                          >
                            {errors.reference}
                          </p>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label style={labelStyle}>Note</Form.Label>
                        <Form.Control
                          as="textarea"
                          name="note"
                          rows={2}
                          placeholder="Enter additional note..."
                          style={{ ...inputStyle, textTransform: "none" }}
                          value={formData.note}
                          onChange={handleInputChange}
                        />
                        {errors.note && (
                          <p
                            className="text-danger mt-1"
                            style={{ fontSize: "11px" }}
                          >
                            {errors.note}
                          </p>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end align-items-center">
                    <Button
                      style={{
                        borderRadius: "10px",
                        fontSize: "13px",
                        padding: "8px 25px",
                      }}
                      variant="secondary"
                      className="me-2"
                      onClick={() => {
                        handleReset();
                        Toast.fire({
                          icon: "success",
                          title: "Form reset successful",
                        });
                      }}
                    >
                      Reset Form
                    </Button>
                    <Button
                      type="submit"
                      style={{
                        borderRadius: "10px",
                        backgroundColor: "#00bcd4",
                        border: "none",
                        fontSize: "13px",
                        padding: "9px 35px",
                      }}
                      disabled={
                        loading ||
                        !currentLocation ||
                        isPatientRegistered ||
                        isCheckingPhone
                      }
                    >
                      {loading || isCheckingPhone
                        ? "Please wait..."
                        : "Add Enquiry"}
                    </Button>
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
