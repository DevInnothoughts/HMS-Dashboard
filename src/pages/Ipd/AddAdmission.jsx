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

const BASE_URL = "http://localhost:5100/api";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

export default function AddAdmission() {
  const navigate = useNavigate();
  const [uhid, setUhid] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("default");
  const [loading, setLoading] = useState(false);
  const [isPendingAdmission, setIsPendingAdmission] = useState(false);
  const [admissionDatetime, setAdmissionDatetime] = useState(null);
  const [surgeryDatetime, setSurgeryDatetime] = useState(null);
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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!uhid) return;

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
        `${BASE_URL}/V1/ipd/admin/checkPatientOPD?location=${currentLocation}&uidNo=${uhid}`,
      );
      if (response.ok) {
        const data = await response.json();

        if (data && data.length > 1) {
          setSearchResults(data);
          setShowSelectionModal(true);
        } else if (data && data.length === 1) {
          selectPatient(data[0]);
          Toast.fire({ icon: "success", title: "Patient Found" });
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
    const isPending =
      patient.has_pending_admission === 1 ||
      patient.has_pending_admission === "1" ||
      patient.has_pending_admission === true;

    setIsPendingAdmission(isPending);

    if (isPending) {
      Swal.fire({
        icon: "warning",
        title: "Pending Admission",
        text: `This patient (${patient.name}) already has a pending admission in the list.`,
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

    // Reset booking details
    setAdmissionDatetime(null);
    setSurgeryDatetime(null);
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

    if (!admissionDatetime || !hasTime(admissionDatetime)) {
      Swal.fire("Required", "Please select a valid Admission Date & Time (both Date and Time are required)", "warning");
      return;
    }
    if (!surgeryDatetime || !hasTime(surgeryDatetime)) {
      Swal.fire("Required", "Please select a valid Surgery Date & Time (both Date and Time are required)", "warning");
      return;
    }
    if (!roomType) {
      Swal.fire("Required", "Please select Room Type", "warning");
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
        admission_datetime: admissionDatetime,
        surgery_datetime: surgeryDatetime,
        room_no: roomNumber,
        room_type: roomType,
        sx_plan: sxPlan,
        nmb_time: nmbTime,
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

  const handleResetForm = () => {
    setUhid("");
    setPatientData(null);
    setSearchResults([]);
    setAdmissionDatetime(null);
    setSurgeryDatetime(null);
    setRoomNumber("");
    setRoomType("");
    setSxPlan("");
    setNmbTime(null);
    setMainDoctorId("");
    setIsPendingAdmission(false);
  };

  const labelStyle = "fw-bold uppercase mb-2";

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        minHeight: "100vh",
        padding: "15px",
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
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#67c5cfff",
                    padding: "10px 15px",
                    borderBottom: "2px solid #1a5b61ff",
                    display: "flex",
                    alignItems: "center",
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
                  <Form onSubmit={handleSearch}>
                    <Form.Group>
                      <Form.Label
                        className="fw-bold uppercase mb-1"
                        style={{ fontSize: "0.8rem", color: "#1a5b61ff" }}
                      >
                        Search by Patient Name / UID No / Contact No
                      </Form.Label>
                      <InputGroup size="sm">
                        <Form.Control
                          type="text"
                          placeholder="Enter Patient Name / UHID No / Patient Mobile No"
                          value={uhid}
                          onChange={(e) => {
                            const val = e.target.value;
                            setUhid(val);
                            if (!val.trim()) {
                              setPatientData(null);
                              setIsPendingAdmission(false);
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
                    </Form.Group>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {patientData && (
            <Row className="mt-4">
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
                        Warning: This patient already has a pending admission in the list. Admission booking is blocked.
                      </div>
                    )}
                    <Row>
                      {[
                        { label: "UHID No.", value: patientData.uhid },
                        { label: "Patient Name", value: patientData.name },
                        { label: "Contact Number", value: patientData.contact },
                        { label: "Age", value: patientData.age },
                        { label: "Gender", value: patientData.gender },
                        { label: "Address", value: patientData.address },
                      ].map((field, idx) => (
                        <Col md={4} key={idx} className="mb-3">
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
                              *Fill the below details to book the patient for
                              admission
                            </p>
                          </Col>

                          <Col md={4} className="mb-3">
                            <MuiDateTimePicker
                              label="Admission Date & Time"
                              value={admissionDatetime}
                              onChange={(e) =>
                                setAdmissionDatetime(e.target.value)
                              }
                              type="datetime"
                              labelClassName={labelStyle}
                              labelStyle={{ fontSize: "0.75rem" }}
                              required={true}
                              disablePast={false}
                              minDate={dayjs().subtract(1, "day").startOf("day")}
                              minutesStep={15}
                              ampm={false}
                              inputSx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "8px",
                                  height: "31px",
                                  "& fieldset": {
                                    borderWidth: "1.5px !important",
                                    borderColor: "rgb(77, 208, 225) !important",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  padding: "3px 10px !important",
                                  fontSize: "0.8rem !important",
                                },
                                "& .MuiInputAdornment-root": {
                                  marginLeft: "0",
                                },
                                "& .MuiIconButton-root": {
                                  padding: "4px",
                                  color: "#1a5b61ff",
                                },
                              }}
                            />
                          </Col>

                          <Col md={4} className="mb-3">
                            <MuiDateTimePicker
                              label="Surgery Date & Time"
                              value={surgeryDatetime}
                              onChange={(e) =>
                                setSurgeryDatetime(e.target.value)
                              }
                              type="datetime"
                              labelClassName={labelStyle}
                              labelStyle={{ fontSize: "0.75rem" }}
                              required={true}
                              disablePast={false}
                              minDate={dayjs().startOf("day")}
                              minutesStep={15}
                              ampm={false}
                              inputSx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "8px",
                                  height: "31px",
                                  "& fieldset": {
                                    borderWidth: "1.5px !important",
                                    borderColor: "rgb(77, 208, 225) !important",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  padding: "3px 10px !important",
                                  fontSize: "0.8rem !important",
                                },
                                "& .MuiInputAdornment-root": {
                                  marginLeft: "0",
                                },
                                "& .MuiIconButton-root": {
                                  padding: "4px",
                                  color: "#1a5b61ff",
                                },
                              }}
                            />
                          </Col>

                          <Col md={4} className="mb-3">
                            <Form.Group>
                              <Form.Label
                                className={labelStyle}
                                style={{ fontSize: "0.75rem" }}
                              >
                                Room Type <span className="text-danger">*</span>
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
                                <option value="">Select Room Type</option>
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

                          <Col md={4} className="mb-3">
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

                          <Col md={4} className="mb-3">
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

                          <Col md={4} className="mb-3">
                            <MuiDateTimePicker
                              label="NBM Time"
                              value={nmbTime}
                              onChange={(e) => setNmbTime(e.target.value)}
                              type="time"
                              minutesStep={15}
                              ampm={false}
                              labelClassName={labelStyle}
                              labelStyle={{ fontSize: "0.75rem" }}
                              required={true}
                              inputSx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "8px",
                                  height: "31px",
                                  "& fieldset": {
                                    borderWidth: "1.5px !important",
                                    borderColor: "rgb(77, 208, 225) !important",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  padding: "3px 10px !important",
                                  fontSize: "0.8rem !important",
                                },
                                "& .MuiInputAdornment-root": {
                                  marginLeft: "0",
                                },
                                "& .MuiIconButton-root": {
                                  padding: "4px",
                                  color: "#1a5b61ff",
                                },
                              }}
                            />
                          </Col>

                          <Col md={4} className="mb-3">
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
                        onClick={handleResetForm}
                        variant="secondary"
                        className="px-4 py-7"
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
                            borderRadius: "5px",
                            color: "white",
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
