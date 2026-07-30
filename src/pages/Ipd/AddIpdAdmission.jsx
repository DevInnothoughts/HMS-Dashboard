import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
  Table,
  Modal,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import Swal from "sweetalert2";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import IpdAdmissionNavbar from "../../components/Navbar/IpdAdmissionNavbar";
import { decodeJwt } from "../../utils/decode-jwt";
import MuiDateTimePicker from "../Utility/inputs/MuiDateTimePicker";

const BASE_URL = "http://194.195.117.79:5100/api";

const getLocalDateString = (date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split("T")[0];
};

const today = new Date();
const maxDate = getLocalDateString(today);

const minDateObj = new Date();
minDateObj.setDate(today.getDate() - 1);
const minDate = getLocalDateString(minDateObj);

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

export default function AddIpdAdmission() {
  const navigate = useNavigate();
  const [uhid, setUhid] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("default");
  const [loading, setLoading] = useState(false);
  const [isPendingAdmission, setIsPendingAdmission] = useState(false);
  const [admissionDate, setAdmissionDate] = useState("");
  const [admissionTime, setAdmissionTime] = useState("");
  const [surgeryDate, setSurgeryDate] = useState("");
  const [surgeryTime, setSurgeryTime] = useState("");

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 15) {
        const h = hour.toString().padStart(2, "0");
        const m = min.toString().padStart(2, "0");
        times.push(`${h}:${m}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();
  const [roomNumber, setRoomNumber] = useState("");
  const [roomType, setRoomType] = useState("");
  const [sxPlan, setSxPlan] = useState("");
  const [nmbTime, setNmbTime] = useState(null);
  const [mainDoctors, setMainDoctors] = useState([]);
  const [mainDoctorId, setMainDoctorId] = useState("");

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
    if (currentLocation !== "default") {
      fetchMainDoctors();
    }
  }, [currentLocation]);

  const fetchMainDoctors = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/mainDoctorDropdown?location=${currentLocation}`,
      );
      if (response.ok) {
        const data = await response.json();
        setMainDoctors(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching main doctors:", error);
    }
  };

  const abortControllerRef = React.useRef(null);
  const isPatientSelectedRef = React.useRef(false);

  const handleSearchChange = async (val) => {
    isPatientSelectedRef.current = false;
    setUhid(val);
    setPatientData(null);
    setIsPendingAdmission(false);

    if (!val.trim()) {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    if (currentLocation === "default") return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(
        `${BASE_URL}/V1/ipd/admin/checkPatientOPD?location=${currentLocation}&uidNo=${encodeURIComponent(val.trim())}`,
        { signal: abortControllerRef.current.signal },
      );
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setSearchResults(data);
          if (!isPatientSelectedRef.current) {
            setShowSearchDropdown(data.length > 0);
          }
        } else {
          setSearchResults([]);
          setShowSearchDropdown(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Realtime search error:", error);
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setShowSearchDropdown(false);
    }, 200);
  };

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    const queryStr = uhid.trim();
    if (!queryStr) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (currentLocation === "default") {
      Swal.fire(
        "Location Missing",
        "Your clinic location is not set. Please log in again.",
        "warning",
      );
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/V1/ipd/admin/checkPatientOPD?location=${currentLocation}&uidNo=${encodeURIComponent(queryStr)}`,
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setSearchResults(data);
          const exactMatch = data.find(
            (p) =>
              p.Uid_no &&
              p.Uid_no.trim().toLowerCase() === queryStr.toLowerCase(),
          );
          if (exactMatch) {
            selectPatient(exactMatch);
            Toast.fire({ icon: "success", title: "Patient Found" });
          } else if (data.length === 1) {
            selectPatient(data[0]);
            Toast.fire({ icon: "success", title: "Patient Found" });
          } else {
            if (!isPatientSelectedRef.current) {
              setShowSearchDropdown(true);
            }
          }
        } else {
          setPatientData(null);
          Swal.fire("Not Found", "No matches found.", "info");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setPatientData(null);
        Swal.fire(
          "Error",
          errorData.message || "Failed to search patient",
          "error",
        );
      }
    } catch (error) {
      console.error("Search error:", error);
      Swal.fire("Error", "Failed to search patient", "error");
    }
  };

  const selectPatient = (patient) => {
    isPatientSelectedRef.current = true;
    setShowSearchDropdown(false);

    const isPending =
      patient.has_pending_admission === 1 ||
      patient.has_pending_admission === "1" ||
      patient.has_pending_admission === true;

    setIsPendingAdmission(isPending);

    if (isPending) {
      Swal.fire({
        icon: "warning",
        title: "Unconfirmed Pending Admission",
        text: `This patient (${patient.name}) has an unconfirmed admission in the list. Please process the existing admission to allow adding a new admission.`,
        confirmButtonColor: "#dc3545",
      });
    }

    const patData = {
      uhid: patient.Uid_no,
      Uid_no: patient.Uid_no,
      name: patient.name,
      contact: patient.phone,
      phone: patient.phone,
      mobile_2: patient.mobile_2 || "",
      patient_id: patient.patient_id,
      global_id: patient.global_id,
      address: patient.address,
      age: patient.age,
      gender: patient.sex,
      sex: patient.sex,
      birth_date: patient.birth_date || "",
      reference_type: patient.reference_type || "",
      ref: patient.ref || "",
      occupation: patient.occupation || "",
      email: patient.email || "",
      prefix: patient.prefix || "",
      ref_doctor_name: patient.ref_doctor_name || "",
      ref_doctor_phone: patient.ref_doctor_phone || "",
      surgical_advice: patient.surgical_advice || "",
    };
    setPatientData(patData);
    setSxPlan(patient.surgical_advice || "");
    setShowSelectionModal(false);
    setShowSearchDropdown(false);

    // Reset booking details
    setAdmissionDate("");
    setAdmissionTime("");
    setSurgeryDate("");
    setSurgeryTime("");
    setRoomNumber("");
    setRoomType("");
    setSxPlan("");
    setNmbTime(null);
    setMainDoctorId("");
  };

  const handleVerifyAndSubmit = async () => {
    if (isPendingAdmission) {
      Swal.fire("Blocked", "Cannot book admission. This patient already has a pending admission.", "error");
      return;
    }
    const hasTime = (val) => {
      if (!val) return false;
      return /\d{2}-\d{2}-\d{4}\s\d{2}:\d{2}/.test(val);
    };

    const convertTo12Hour = (time24) => {
      if (!time24) return "";
      if (time24.includes("AM") || time24.includes("PM")) return time24;
      let [hours, minutes] = time24.split(":");
      let period = "AM";
      hours = parseInt(hours);
      if (hours === 0) {
        hours = 12;
      } else if (hours === 12) {
        period = "PM";
      } else if (hours > 12) {
        hours -= 12;
        period = "PM";
      }
      return `${hours.toString().padStart(2, "0")}:${minutes} ${period}`;
    };

    const formattedTime = convertTo12Hour(admissionTime);
    const combinedAdmissionDatetime = admissionDate && formattedTime ? `${dayjs(admissionDate).format("DD-MM-YYYY")} ${formattedTime}` : "";

    const formattedSurgeryTime = convertTo12Hour(surgeryTime);
    const combinedSurgeryDatetime = surgeryDate && formattedSurgeryTime ? `${dayjs(surgeryDate).format("DD-MM-YYYY")} ${formattedSurgeryTime}` : "";

    if (!combinedAdmissionDatetime || !hasTime(combinedAdmissionDatetime)) {
      Swal.fire("Required", "Please select a valid Admission Date & Time (both Date and Time are required)", "warning");
      return;
    }
    if (!combinedSurgeryDatetime || !hasTime(combinedSurgeryDatetime)) {
      Swal.fire("Required", "Please select a valid Surgery Date & Time (both Date and Time are required)", "warning");
      return;
    }
    if (!roomType) {
      Swal.fire("Required", "Please select Bed Category", "warning");
      return;
    }
    if (!roomNumber || !roomNumber.trim()) {
      Swal.fire("Required", "Please enter Room Number", "warning");
      return;
    }
    if (!sxPlan || !sxPlan.trim()) {
      Swal.fire("Required", "Please enter SX Plan", "warning");
      return;
    }
    if (!nmbTime) {
      Swal.fire("Required", "Please select NBM Time", "warning");
      return;
    }
    if (!mainDoctorId) {
      Swal.fire("Required", "Please select Surgeon Name", "warning");
      return;
    }

    const preplan = {
      pre_planning: {
        admission_datetime: combinedAdmissionDatetime,
        surgery_datetime: combinedSurgeryDatetime,
        room_no: roomNumber,
        room_type: roomType,
        sx_plan: sxPlan,
        nmb_time: convertTo12Hour(nmbTime),
        doctor_id: mainDoctorId,
      },
    };

    const payload = {
      global_id: patientData.global_id,
      patient_id: patientData.patient_id,
      phone: patientData.contact,
      Uid_no: patientData.uhid,
      location: currentLocation,
      pre_planning: preplan,
    };

    setLoading(true);
    try {
      Swal.fire({ title: "Processing...", didOpen: () => Swal.showLoading() });
      const response = await fetch(
        `${BASE_URL}/V1/ipd/admin/registerPatientIPD?location=${currentLocation}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Booked!",
          text: "Patient has been booked for admission.",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          navigate("/ipd-admission-list");
        });
      } else {
        Swal.fire(
          "Error",
          result.message || "Failed to book admission",
          "error",
        );
      }
    } catch (error) {
      console.error("Booking Error:", error);
      Swal.fire("Error", "Server connection failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    if (patientData) {
      navigate("/personal-details-card", { state: { patient: patientData } });
    }
  };

  const handleResetForm = (e) => {
    if (e) e.preventDefault();
    setAdmissionDate("");
    setAdmissionTime("");
    setSurgeryDate("");
    setSurgeryTime("");
    setRoomNumber("");
    setRoomType("");
    setSxPlan(patientData?.surgical_advice || "");
    setNmbTime(null);
    setMainDoctorId("");
  };

  const labelStyle = "fw-bold uppercase mb-2";

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
      <PageBreadcrumb pagename="Add IPD Admission" />

      <div className="theme-body">
        <Container fluid>
          <Row>
            <Col md={12}>
              <IpdAdmissionNavbar />
              <Card
                style={{
                  borderRadius: "15px",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
                  border: "none",
                  background: "white",
                  overflow: "visible",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#67c5cfff",
                    padding: "10px 15px",
                    borderBottom: "2px solid #1a5b61ff",
                    display: "flex",
                    alignItems: "center",
                    borderTopLeftRadius: "15px",
                    borderTopRightRadius: "15px",
                  }}
                >
                  <FeatherIcon
                    icon="plus"
                    size="16"
                    style={{ color: "#1a5b61ff", marginRight: "8px" }}
                  />
                  <h4
                    className="m-0"
                    style={{
                      color: "#1a5b61ff",
                      fontWeight: "600",
                      fontSize: "0.95rem",
                    }}
                  >
                    Add IPD Admission
                  </h4>
                </div>
                <Card.Body className="p-3" style={{ margin: "5px" }}>
                  <Form onSubmit={handleSearchSubmit}>
                    <Form.Group style={{ position: "relative" }}>
                      <Form.Label
                        className="fw-bold uppercase mb-1"
                        style={{ fontSize: "0.8rem", color: "#1a5b61ff" }}
                      >
                        Search by Patient Name / UID Number
                      </Form.Label>
                      <InputGroup size="sm">
                        <Form.Control
                          type="text"
                          placeholder="Enter Patient Name or UID Number"
                          value={uhid}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          onBlur={handleSearchBlur}
                          onClick={() => {
                            if (searchResults.length > 0) {
                              setShowSearchDropdown(true);
                            }
                          }}
                          style={{
                            border: "2px solid rgb(77, 208, 225)",
                            fontSize: "0.85rem",
                            borderRadius: "8px 0 0 8px",
                          }}
                        />
                        <Button
                          type="submit"
                          style={{
                            backgroundColor: "#178aaeff",
                            border: "none",
                            borderRadius: "0 8px 8px 0",
                            padding: "5px 15px",
                            fontWeight: "600",
                            fontSize: "0.85rem",
                          }}
                        >
                          Search
                        </Button>
                      </InputGroup>

                      {showSearchDropdown && searchResults.length > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            backgroundColor: "white",
                            border: "1px solid #ced4da",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            zIndex: 1000,
                            maxHeight: "350px",
                            overflowY: "auto",
                            marginTop: "4px",
                          }}
                        >
                          {searchResults.map((patient, index) => (
                            <div
                              key={index}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                selectPatient(patient);
                              }}
                              style={{
                                padding: "10px 15px",
                                cursor: "pointer",
                                borderBottom: index < searchResults.length - 1 ? "1px solid #f1f3f5" : "none",
                                fontSize: "0.85rem",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                transition: "background-color 0.2s",
                              }}
                              className="patient-search-item"
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0f7fa")}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                            >
                              <div>
                                <strong>{patient.name}</strong> ({patient.sex}, {patient.age} yrs)
                                <div style={{ fontSize: "0.75rem" }}>
                                  <strong>UID No:</strong> {patient.Uid_no} | <strong>Contact No:</strong> {patient.phone}
                                </div>
                              </div>
                              <Button
                                variant="info"
                                size="sm"
                                style={{
                                  fontSize: "0.85rem",
                                  padding: "5px 15px",
                                  backgroundColor: "#178aaeff",
                                  border: "none",
                                  color: "white",
                                  borderRadius: "6px",
                                  fontWeight: "600",
                                }}
                              >
                                Select
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </Form.Group>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {patientData && (
            <Row >
              <Col md={12}>
                <Card
                  style={{
                    borderRadius: "15px",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
                    border: "none",
                    background: "white",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#67c5cfff",
                      padding: "12px 10px",
                      borderBottom: "2px solid #1a5b61ff",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FeatherIcon
                      icon="user"
                      size="18"
                      style={{ color: "#1a5b61ff", marginRight: "10px" }}
                    />
                    <h4
                      className="m-0"
                      style={{
                        color: "#1a5b61ff",
                        fontWeight: "600",
                        fontSize: "1.1rem",
                      }}
                    >
                      Patient Details
                    </h4>
                  </div>
                  <Card.Body className="p-3">
                    {isPendingAdmission && (
                      <div className="alert alert-danger p-2 mb-3 text-center small fw-bold">
                        Warning: This patient already has an unconfirmed pending admission in the list. Please confirm the existing entry in Manage Admission list to allow adding a new admission.
                      </div>
                    )}
                    <Row>
                      {[
                        { label: "UID Number", value: patientData.uhid },
                        { label: "Patient Name", value: patientData.name },
                        { label: "Contact Number", value: patientData.contact },
                        { label: "Age", value: patientData.age },
                        { label: "Gender", value: patientData.gender },
                        { label: "Address", value: patientData.address },
                      ].map((field, idx) => (
                        <Col md={4} key={idx} className="mb-10">
                          <Form.Group>
                            <Form.Label
                              className={labelStyle}
                              style={{ fontSize: "0.75rem" }}
                            >
                              {field.label}
                            </Form.Label>
                            <Form.Control
                              type="text"
                              value={field.value || "-"}
                              readOnly
                              style={{
                                backgroundColor: "#e7ebebff",
                                border: "1.5px solid rgb(77, 208, 225)",
                                borderRadius: "8px",
                                cursor: "not-allowed",
                                padding: "3px 10px",
                                fontSize: "0.8rem",
                                height: "31px",
                              }}
                            />
                          </Form.Group>
                        </Col>
                      ))}
                      {patientData && (
                        <>
                          <Col md={12} className="mb-2 mt-2">
                            <hr
                              style={{
                                borderTop: "1px solid #67c5cfff",
                                opacity: 0.3,
                              }}
                            />
                            <p
                              style={{
                                fontSize: "0.75rem",
                                color: "#ff1500ff",
                                fontWeight: "600",
                                marginBottom: "5px",
                              }}
                            >
                              *Fill The Below Details To Book The Patient For
                              Ipd Admission
                            </p>
                          </Col>

                          <Col md={2} className="mb-3">
                            <Form.Group>
                              <Form.Label
                                className={labelStyle}
                                style={{ fontSize: "0.75rem" }}
                              >
                                Admission Date <span className="text-danger">*</span>
                              </Form.Label>
                              <Form.Control
                                required
                                type="date"
                                style={{
                                  border: "1.5px solid rgb(77, 208, 225)",
                                  borderRadius: "8px",
                                  padding: "3px 10px",
                                  fontSize: "0.8rem",
                                  height: "31px",
                                }}
                                name="admission_date"
                                min={minDate}
                                max={maxDate}
                                value={admissionDate}
                                onChange={(e) => setAdmissionDate(e.target.value)}
                                onKeyDown={(e) => e.preventDefault()}
                                onPaste={(e) => e.preventDefault()}
                                onWheel={(e) => e.target.blur()}
                              />
                            </Form.Group>
                          </Col>

                          <Col md={2} className="mb-3">
                            <Form.Group>
                              <Form.Label
                                className={labelStyle}
                                style={{ fontSize: "0.75rem" }}
                              >
                                Admission Time <span className="text-danger">*</span>
                              </Form.Label>
                              <Form.Select
                                required
                                style={{
                                  border: "1.5px solid rgb(77, 208, 225)",
                                  borderRadius: "8px",
                                  padding: "3px 10px",
                                  fontSize: "0.8rem",
                                  height: "31px",
                                }}
                                value={admissionTime}
                                name="admission_time"
                                onChange={(e) => setAdmissionTime(e.target.value)}
                              >
                                <option value="">Select Time</option>
                                {timeOptions.map((time) => {
                                  const [hour, minute] = time.split(":");
                                  const h = parseInt(hour);
                                  const ampm = h >= 12 ? "PM" : "AM";
                                  const displayHour = h % 12 || 12;
                                  const displayTime = `${displayHour}:${minute} ${ampm}`;

                                  return (
                                    <option key={time} value={time}>
                                      {displayTime}
                                    </option>
                                  );
                                })}
                              </Form.Select>
                            </Form.Group>
                          </Col>

                          <Col md={2} className="mb-3">
                            <Form.Group>
                              <Form.Label
                                className={labelStyle}
                                style={{ fontSize: "0.75rem" }}
                              >
                                Surgery Date <span className="text-danger">*</span>
                              </Form.Label>
                              <Form.Control
                                required
                                type="date"
                                style={{
                                  border: "1.5px solid rgb(77, 208, 225)",
                                  borderRadius: "8px",
                                  padding: "3px 10px",
                                  fontSize: "0.8rem",
                                  height: "31px",
                                }}
                                name="surgery_date"
                                min={maxDate}
                                value={surgeryDate}
                                onChange={(e) => setSurgeryDate(e.target.value)}
                                onKeyDown={(e) => e.preventDefault()}
                                onPaste={(e) => e.preventDefault()}
                                onWheel={(e) => e.target.blur()}
                              />
                            </Form.Group>
                          </Col>

                          <Col md={2} className="mb-3">
                            <Form.Group>
                              <Form.Label
                                className={labelStyle}
                                style={{ fontSize: "0.75rem" }}
                              >
                                Surgery Time <span className="text-danger">*</span>
                              </Form.Label>
                              <Form.Select
                                required
                                style={{
                                  border: "1.5px solid rgb(77, 208, 225)",
                                  borderRadius: "8px",
                                  padding: "3px 10px",
                                  fontSize: "0.8rem",
                                  height: "31px",
                                }}
                                value={surgeryTime}
                                name="surgery_time"
                                onChange={(e) => setSurgeryTime(e.target.value)}
                              >
                                <option value="">Select Time</option>
                                {timeOptions.map((time) => {
                                  const [hour, minute] = time.split(":");
                                  const h = parseInt(hour);
                                  const ampm = h >= 12 ? "PM" : "AM";
                                  const displayHour = h % 12 || 12;
                                  const displayTime = `${displayHour}:${minute} ${ampm}`;

                                  return (
                                    <option key={time} value={time}>
                                      {displayTime}
                                    </option>
                                  );
                                })}
                              </Form.Select>
                            </Form.Group>
                          </Col>

                          <Col md={4} className="mb-10">
                            <Form.Group>
                              <Form.Label
                                className={labelStyle}
                                style={{ fontSize: "0.75rem" }}
                              >
                                Bed Category <span className="text-danger">*</span>
                              </Form.Label>
                              <Form.Select
                                required
                                value={roomType}
                                onChange={(e) => setRoomType(e.target.value)}
                                style={{
                                  border: "1.5px solid rgb(77, 208, 225)",
                                  borderRadius: "8px",
                                  padding: "3px 10px",
                                  fontSize: "0.8rem",
                                  height: "31px",
                                }}
                              >
                                <option value="">Select Bed Category</option>
                                <option value="General Ward">
                                  General Ward
                                </option>
                                <option value="Semi Private">
                                  Semi Private
                                </option>
                                <option value="Private">Private</option>
                                <option value="Deluxe">Deluxe</option>
                                <option value="Super Deluxe">Super Deluxe</option>
                                <option value="Suite">Suite</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>

                          <Col md={2} className="mb-3">
                            <Form.Group>
                              <Form.Label
                                className={labelStyle}
                                style={{ fontSize: "0.75rem" }}
                              >
                                Room Number <span className="text-danger">*</span>
                              </Form.Label>
                              <Form.Control
                                required
                                type="text"
                                value={roomNumber}
                                onChange={(e) => setRoomNumber(e.target.value)}
                                style={{
                                  border: "1.5px solid rgb(77, 208, 225)",
                                  borderRadius: "8px",
                                  padding: "3px 10px",
                                  fontSize: "0.8rem",
                                  height: "31px",
                                }}
                              />
                            </Form.Group>
                          </Col>

                          <Col md={5} className="mb-3">
                            <Form.Group>
                              <Form.Label
                                className={labelStyle}
                                style={{ fontSize: "0.75rem" }}
                              >
                                SX Plan <span className="text-danger">*</span>
                              </Form.Label>
                              <Form.Control
                                required
                                type="text"
                                value={sxPlan}
                                onChange={(e) => setSxPlan(e.target.value)}
                                style={{
                                  border: "1.5px solid rgb(77, 208, 225)",
                                  borderRadius: "8px",
                                  padding: "3px 10px",
                                  fontSize: "0.8rem",
                                  height: "31px",
                                }}
                              />
                            </Form.Group>
                          </Col>

                          <Col md={2} className="mb-3">
                            <Form.Group>
                              <Form.Label
                                className={labelStyle}
                                style={{ fontSize: "0.75rem" }}
                              >
                                NBM Time <span className="text-danger">*</span>
                              </Form.Label>
                              <Form.Select
                                required
                                style={{
                                  border: "1.5px solid rgb(77, 208, 225)",
                                  borderRadius: "8px",
                                  padding: "3px 10px",
                                  fontSize: "0.8rem",
                                  height: "31px",
                                }}
                                value={nmbTime || ""}
                                name="nmb_time"
                                onChange={(e) => setNmbTime(e.target.value)}
                              >
                                <option value="">Select Time</option>
                                {timeOptions.map((time) => {
                                  const [hour, minute] = time.split(":");
                                  const h = parseInt(hour);
                                  const ampm = h >= 12 ? "PM" : "AM";
                                  const displayHour = h % 12 || 12;
                                  const displayTime = `${displayHour}:${minute} ${ampm}`;

                                  return (
                                    <option key={time} value={time}>
                                      {displayTime}
                                    </option>
                                  );
                                })}
                              </Form.Select>
                            </Form.Group>
                          </Col>

                          <Col md={3} className="mb-3">
                            <Form.Group>
                              <Form.Label
                                className={labelStyle}
                                style={{ fontSize: "0.75rem" }}
                              >
                                Surgeon Name <span className="text-danger">*</span>
                              </Form.Label>
                              <Form.Select
                                required
                                value={mainDoctorId}
                                onChange={(e) =>
                                  setMainDoctorId(e.target.value)
                                }
                                style={{
                                  border: "1.5px solid rgb(77, 208, 225)",
                                  borderRadius: "8px",
                                  padding: "3px 10px",
                                  fontSize: "0.8rem",
                                  height: "31px",
                                }}
                              >
                                <option value="">Select Surgeon</option>
                                {mainDoctors.map((doc) => (
                                  <option
                                    key={doc.doctor_id}
                                    value={doc.doctor_id}
                                  >
                                    {doc.name}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </>
                      )}
                    </Row>

                    <div className="d-flex justify-content-center gap-2 mt-3 mb-10">
                      <Button
                        type="button"
                        onClick={handleResetForm}
                        variant="secondary"
                        className="px-4 py-8"
                        style={{
                          borderRadius: "8px",
                          fontWeight: "600",
                          backgroundColor: "#6c757d",
                          border: "none",
                        }}
                      >
                        <FeatherIcon
                          icon="refresh-cw"
                          size={16}
                          className="me-2"
                        />
                        Reset Form
                      </Button>
                      <Button
                        onClick={handleVerifyAndSubmit}
                        variant="success"
                        disabled={loading || isPendingAdmission}
                        className="px-4 py-7"
                        style={{
                          borderRadius: "8px",
                          fontWeight: "600",
                          backgroundColor: isPendingAdmission ? "#6c757d" : "#28a745",
                          border: "none",
                        }}
                      >
                        <FeatherIcon
                          icon="check-circle"
                          size={16}
                          className="me-2"
                        />
                        {loading ? "Booking..." : "Book Admission"}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          <Modal
            show={showSelectionModal}
            onHide={() => setShowSelectionModal(false)}
            size="lg"
            centered
          >
            <Modal.Header
              closeButton
              style={{
                backgroundColor: "#67c5cfff",
                borderBottom: "2px solid #1a5b61ff",
              }}
            >
              <Modal.Title style={{ color: "#1a5b61ff", fontWeight: "600" }}>
                Multiple Matches Found
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th className="py-3 px-4 border-0">UID No</th>
                    <th className="py-3 px-4 border-0">Patient Name</th>
                    <th className="py-3 px-4 border-0">Contact No</th>
                    <th className="py-3 px-4 border-0">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((patient, index) => (
                    <tr key={index}>
                      <td className="py-3 px-4">{patient.Uid_no}</td>
                      <td className="py-3 px-4">{patient.name}</td>
                      <td className="py-3 px-4">{patient.phone}</td>
                      <td className="py-3 px-4">
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => selectPatient(patient)}
                          style={{
                            backgroundColor: "#178aaeff",
                            border: "none",
                            borderRadius: "6px",
                            color: "white",
                            fontSize: "0.85rem",
                            padding: "5px 15px",
                            fontWeight: "600",
                          }}
                        >
                          Select
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Modal.Body>
          </Modal>
        </Container>
      </div>
    </div>
  );
}
