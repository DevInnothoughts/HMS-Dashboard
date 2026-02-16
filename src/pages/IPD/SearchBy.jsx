import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Modal,
  InputGroup,
  Table,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import Swal from "sweetalert2";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { decodeJwt } from "../../utils/decode-jwt";
import MuiDateTimePicker from "../IPD Forms/inputs/MuiDateTimePicker";
import dayjs from "dayjs";

const BASE_URL = "http://localhost:5100/api";

export default function SearchBy() {
  const navigate = useNavigate();
  const [uhid, setUhid] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [verifiedHistory, setVerifiedHistory] = useState([]);
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [currentLocation, setCurrentLocation] = useState("default");

  useEffect(() => {
    const history = JSON.parse(
      localStorage.getItem("verifiedPatients") || "[]",
    );
    setVerifiedHistory(history);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!uhid) return;

    try {
      const response = await fetch(
        `${BASE_URL}/V1/ipd/admin/checkPatientOPD?location=${currentLocation}&uidNo=${uhid}`,
      );
      if (response.ok) {
        const data = await response.json();

        if (data && data.length > 1) {
          // Scenario: Same UID or same Phone found multiple times
          setSearchResults(data);
          setShowSelectionModal(true); // Open selection UI
        } else if (data && data.length === 1) {
          // Scenario: Perfect single match
          selectPatient(data[0]);
        } else {
          Swal.fire("Not Found", "No matches found.", "info");
        }
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  // Helper to map the selected row to your state
  const selectPatient = (patient) => {
    const patData = {
      uhid: patient.Uid_no,
      name: patient.name,
      contact: patient.phone,
      HMSId: patient.patient_id,
      global_id: patient.global_id,
      address: patient.address,
      age: patient.age,
      gender: patient.sex,
      reference: patient.reference || "",
      admissionDatetime: null,
      datetime: null,
      roomNumber: "",
      sxPlan: "",
      // sxTime: null,
      nmbTime: null,
    };
    setPatientData(patData);
    setShowSelectionModal(false);
    Toast.fire({ icon: "success", title: "Patient Selected" });
  };

  const openEditModal = () => {
    setEditFormData({ ...patientData });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setPatientData({ ...editFormData });
    setShowEditModal(false);
    Swal.fire("Success", "Patient details updated", "success");
  };

  const handleAdmissionDatetimeChange = (e) => {
    const { value } = e.target;
    setPatientData((prev) => ({ ...prev, admissionDatetime: value }));
  };

  const handleDatetimeChange = (e) => {
    const { value } = e.target;
    setPatientData((prev) => ({ ...prev, datetime: value }));
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerifyAndSubmit = async () => {
    if (!patientData.admissionDatetime) {
      Swal.fire("Required", "Please select Admission Date & Time", "warning");
      return;
    }
    if (!patientData.datetime) {
      Swal.fire("Required", "Please select Surgery Date & Time", "warning");
      return;
    }
    const preplan = {
      pre_planning: {
        admission_datetime: patientData.admissionDatetime,
        surgery_datetime: patientData.datetime,
        room_no: patientData.roomNumber,
        sx_plan: patientData.sxPlan,
        // sx_time: patientData.sxTime,
        nmb_time: patientData.nmbTime,
      },
    };
    // 1. Prepare data for the backend API
    const payload = {
      global_id: patientData.global_id,
      patient_id: patientData.HMSId,
      phone: patientData.contact,
      Uid_no: patientData.uhid,
      location: currentLocation,
      pre_planning: preplan,
    };

    console.log(payload);
    try {
      // 2. Call the backend API
      const response = await fetch(
        `${BASE_URL}/V1/ipd/admin/registerPatientIPD?location=${currentLocation}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add Authorization header if your API requires the token
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        },
      );

      console.log(payload);

      const result = await response.json();
      console.log(result);
      if (response.ok) {
        // 4. Success Message and Navigation
        Swal.fire({
          icon: "success",
          title: "Verified!",
          text: "Patient data has been verified and synced with the server.",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          navigate("/manage-admission");
        });
      } else {
        Swal.fire(
          "Error",
          result.message || result.data || "Failed to verify patient on server",
          "error",
        );
      }
    } catch (error) {
      console.error("Verification Error:", error);
      Swal.fire(
        "Error",
        "Server connection failed during verification",
        "error",
      );
    }
  };

  const filteredHistory = verifiedHistory.filter(
    (p) =>
      p.name.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
      p.uhid.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
      p.contact.toLowerCase().includes(historySearchTerm.toLowerCase()),
  );

  const labelStyle = "fw-bold uppercase mb-2";

  const inputStyle = {
    borderRadius: "8px",
    border: "2px solid rgb(77, 208, 225)",
    padding: "4px",
  };

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
      <PageBreadcrumb pagename="Search By UHID" />

      <div className="theme-body">
        <Container fluid>
          <Row>
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
                    padding: "10px 15px",
                    borderBottom: "2px solid #1a5b61ff",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <FeatherIcon
                    icon="search"
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
                    Search Patient
                  </h4>
                </div>
                <Card.Body className="p-3" style={{ margin: "5px" }}>
                  <Form onSubmit={handleSearch}>
                    <Form.Group>
                      <Form.Label
                        className="fw-bold uppercase mb-1"
                        style={{ fontSize: "0.8rem", color: "#1a5b61ff" }}
                      >
                        Search by Patient Name / UHID No. / Patient Mobile No.
                      </Form.Label>
                      <InputGroup size="sm">
                        <Form.Control
                          type="text"
                          placeholder="Enter Patient Name / UHID No / Patient Mobile No"
                          value={uhid}
                          onChange={(e) => setUhid(e.target.value)}
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
            <Row>
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
                    <Row>
                      {[
                        {
                          label: "UHID No.",
                          value: patientData.uhid,
                          name: "uhid",
                        },
                        {
                          label: "Patient Name",
                          value: patientData.name,
                          name: "name",
                        },
                        // {
                        //   label: "Patient HMS ID",
                        //   value: patientData.HMSId,
                        //   name: "HMSId",
                        // },
                        // {
                        //   label: "Patient Global ID",
                        //   value: patientData.global_id,
                        //   name: "global_id",
                        // },
                        {
                          label: "Contact Number",
                          value: patientData.contact,
                          name: "contact",
                        },
                        { label: "Age", value: patientData.age, name: "age" },
                        {
                          label: "Gender",
                          value: patientData.gender,
                          name: "gender",
                        },
                        {
                          label: "Address",
                          value: patientData.address,
                          name: "address",
                        },
                        {
                          label: "Reference",
                          value: patientData.reference,
                          name: "reference",
                        },
                      ].map((field) => (
                        <Col md={4} key={field.name} className="mb-10">
                          <Form.Group>
                            <Form.Label
                              className={labelStyle}
                              style={{ fontSize: "0.75rem" }}
                            >
                              {field.label}
                            </Form.Label>
                            <Form.Control
                              type="text"
                              value={field.value}
                              readOnly
                              style={{
                                backgroundColor: "#e7ebebff",
                                border: "1.5px solid rgb(77, 208, 225)",
                                borderRadius: "8px",
                                cursor: "not-allowed",
                                padding: "3px 10px",
                                fontSize: "0.8rem",
                              }}
                            />
                          </Form.Group>
                        </Col>
                      ))}

                      {/* Admission Booking Section */}
                      <Col md={12} className="mb-2 mt-2">
                        <hr
                          style={{
                            borderTop: "1px solid #67c5cfff",
                            opacity: 0.3,
                          }}
                        />
                        <p
                          style={{
                            fontSize: "0.90rem",
                            color: "#ff1500ff",
                            fontWeight: "600",
                            marginBottom: "5px",
                          }}
                        >
                          Fill the below details to book the patient for
                          admission
                        </p>
                      </Col>

                      <Col md={4} className="mb-10">
                        <MuiDateTimePicker
                          label="Admission Date & Time"
                          value={patientData.admissionDatetime}
                          onChange={handleAdmissionDatetimeChange}
                          name="admissionDatetime"
                          type="datetime"
                          labelClassName={labelStyle}
                          labelStyle={{ fontSize: "0.75rem" }}
                          required={true}
                          disablePast={true}
                          placeholder="Select Admission Date & Time"
                          style={{
                            marginBottom: "0px",
                          }}
                          inputSx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#e7ebebff",
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

                      <Col md={4} className="mb-10">
                        <MuiDateTimePicker
                          label="Surgery Date & Time"
                          value={patientData.datetime}
                          onChange={handleDatetimeChange}
                          name="datetime"
                          type="datetime"
                          labelClassName={labelStyle}
                          labelStyle={{ fontSize: "0.75rem" }}
                          required={true}
                          disablePast={true}
                          placeholder="Select Surgery Date & Time"
                          style={{
                            marginBottom: "0px",
                          }}
                          inputSx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#e7ebebff", // Match readOnly background
                              borderRadius: "8px",
                              height: "31px", // Standard height for small inputs
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

                      <Col md={4} className="mb-10">
                        <Form.Group>
                          <Form.Label
                            className={labelStyle}
                            style={{ fontSize: "0.75rem" }}
                          >
                            Room Number
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="roomNumber"
                            value={patientData.roomNumber}
                            onChange={handleBookingChange}
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

                      <Col md={4} className="mb-10">
                        <Form.Group>
                          <Form.Label
                            className={labelStyle}
                            style={{ fontSize: "0.75rem" }}
                          >
                            SX Plan
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="sxPlan"
                            value={patientData.sxPlan}
                            onChange={handleBookingChange}
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

                      {/* <Col md={4} className="mb-10">
                        <MuiDateTimePicker
                          label="SX Time"
                          value={patientData.sxTime}
                          onChange={(e) => setPatientData(prev => ({ ...prev, sxTime: e.target.value }))}
                          name="sxTime"
                          type="time"
                          minutesStep={15}
                          labelClassName={labelStyle}
                          labelStyle={{ fontSize: "0.75rem" }}
                          style={{ marginBottom: "0px" }}
                          inputSx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: '#e7ebebff',
                              borderRadius: '8px',
                              height: '31px',
                              '& fieldset': {
                                borderWidth: '1.5px !important',
                                borderColor: 'rgb(77, 208, 225) !important',
                              }
                            },
                            '& .MuiInputBase-input': {
                              padding: '3px 10px !important',
                              fontSize: '0.8rem !important',
                            },
                            '& .MuiInputAdornment-root': {
                              marginLeft: '0',
                            },
                            '& .MuiIconButton-root': {
                              padding: '4px',
                              color: '#1a5b61ff',
                            }
                          }}
                        />
                      </Col> */}

                      <Col md={4} className="mb-10">
                        <MuiDateTimePicker
                          label="NBM Time"
                          value={patientData.nmbTime}
                          onChange={(e) =>
                            setPatientData((prev) => ({
                              ...prev,
                              nmbTime: e.target.value,
                            }))
                          }
                          name="nmbTime"
                          type="time"
                          minutesStep={15}
                          labelClassName={labelStyle}
                          labelStyle={{ fontSize: "0.75rem" }}
                          style={{ marginBottom: "0px" }}
                          inputSx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#e7ebebff",
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
                    </Row>

                    <div className="d-flex justify-content-center gap-2 mt-2 mb-3">
                      <Button
                        onClick={openEditModal}
                        variant="info"
                        className="px-3 py-10 text-white"
                        style={{
                          borderRadius: "8px",
                          fontWeight: "600",
                          backgroundColor: "#00bcd4",
                          border: "none",
                          fontSize: "0.85rem",
                        }}
                      >
                        <FeatherIcon icon="edit-2" size={14} className="me-2" />
                        Edit
                      </Button>
                      <Button
                        onClick={handleVerifyAndSubmit}
                        variant="success"
                        className="px-3 py-10"
                        style={{
                          borderRadius: "8px",
                          fontWeight: "600",
                          backgroundColor: "#28a745",
                          border: "none",
                          fontSize: "0.85rem",
                        }}
                      >
                        <FeatherIcon
                          icon="check-circle"
                          size={14}
                          className="me-2"
                        />
                        Book For Admission
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Verification History Table */}
          {/* <Row>
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
                    padding: "10px 15px",
                    borderBottom: "2px solid #1a5b61ff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <FeatherIcon
                      icon="clock"
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
                      Booked For Admission History
                    </h4>
                  </div>
                  <div style={{ width: "250px" }}>
                    <InputGroup size="sm">
                      <InputGroup.Text
                        style={{
                          backgroundColor: "#fff",
                          borderRight: "none",
                          borderRadius: "8px 0 0 8px",
                          border: "1px solid #ced4da",
                        }}
                      >
                        <FeatherIcon
                          icon="search"
                          size={14}
                          className="text-muted"
                        />
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="Search history..."
                        value={historySearchTerm}
                        onChange={(e) => setHistorySearchTerm(e.target.value)}
                        style={{
                          borderLeft: "none",
                          borderRadius: "0 8px 8px 0",
                          border: "1px solid #ced4da",
                          fontSize: "0.85rem",
                        }}
                      />
                    </InputGroup>
                  </div>
                </div>
                <Card.Body className="p-0">
                  <Table responsive hover className="mb-0">
                    <thead
                      style={{
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #e9ecef",
                      }}
                    >
                      <tr>
                        <th className="py-5 px-3 border-0 uppercase fw-bold">
                          BOA Date
                        </th>
                        <th className="py-5 px-3 border-0 uppercase fw-bold">
                          UHID No.
                        </th>
                        <th className="py-5 px-3 border-0 uppercase fw-bold">
                          Patient Name
                        </th>
                        <th className="py-5 px-3 border-0 uppercase fw-bold">
                          Age/Gender
                        </th>
                        <th className="py-5 px-3 border-0 text-center uppercase fw-bold">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.length > 0 ? (
                        [...filteredHistory].reverse().map((patient, index) => (
                          <tr
                            key={index}
                            style={{
                              verticalAlign: "middle",
                              fontSize: "0.85rem",
                            }}
                          >
                            <td
                              className="py-2 px-3"
                              style={{ fontSize: "13px" }}
                            >
                              {patient.verifiedDate || "N/A"}
                            </td>
                            <td
                              className="py-2 px-3 fw-bold"
                              style={{ color: "#178aaeff" }}
                            >
                              {patient.uhid}
                            </td>
                            <td
                              className="py-2 px-3"
                              style={{ color: "#2c3e50" }}
                            >
                              {patient.name}
                            </td>
                            <td className="py-2 px-3">
                              {patient.age} / {patient.gender}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span
                                className="badge"
                                style={{
                                  backgroundColor: "#e8f5e9",
                                  color: "#2e7d32",
                                  padding: "5px 12px",
                                  borderRadius: "20px",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  margin: "3px",
                                }}
                              >
                                <FeatherIcon
                                  icon="check"
                                  size={10}
                                  className="me-1"
                                />
                                Verified
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="text-center py-5 text-muted"
                          >
                            <FeatherIcon
                              icon="info"
                              size={40}
                              className="mb-3 opacity-20"
                            />
                            <p className="m-0">
                              {historySearchTerm
                                ? "No matching history found."
                                : "No verification history found."}
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row> */}

          {/* Edit Modal */}
          <Modal
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            centered
            size="lg"
          >
            <Modal.Header
              closeButton
              style={{
                backgroundColor: "#67c5cfff",
                borderBottom: "2px solid #1a5b61ff",
                padding: "10px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <FeatherIcon
                icon="edit-2"
                size="18"
                style={{ color: "#1a5b61ff", marginRight: "10px" }}
              />
              <Modal.Title
                style={{
                  color: "#1a5b61ff",
                  fontWeight: "600",
                  fontSize: "19px",
                }}
              >
                Edit Patient Details
              </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleEditSubmit}>
              <Modal.Body className="p-4">
                <Row>
                  <Col md={6} className="mb-10">
                    <Form.Group>
                      <Form.Label
                        className={labelStyle}
                        style={{ fontSize: "13px" }}
                      >
                        UHID No.
                      </Form.Label>
                      <Form.Control
                        name="uhid"
                        value={editFormData.uhid}
                        onChange={handleEditChange}
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label
                        className={labelStyle}
                        style={{ fontSize: "13px" }}
                      >
                        Patient Name
                      </Form.Label>
                      <Form.Control
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditChange}
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-10">
                    <Form.Group>
                      <Form.Label
                        className={labelStyle}
                        style={{ fontSize: "13px" }}
                      >
                        Contact Number
                      </Form.Label>
                      <Form.Control
                        name="contact"
                        value={editFormData.contact}
                        onChange={handleEditChange}
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label
                        className={labelStyle}
                        style={{ fontSize: "13px" }}
                      >
                        Age
                      </Form.Label>
                      <Form.Control
                        name="age"
                        value={editFormData.age}
                        onChange={handleEditChange}
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label
                        className={labelStyle}
                        style={{ fontSize: "13px" }}
                      >
                        Gender
                      </Form.Label>
                      <Form.Select
                        name="gender"
                        value={editFormData.gender}
                        onChange={handleEditChange}
                        style={inputStyle}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-10">
                    <Form.Group>
                      <Form.Label
                        className={labelStyle}
                        style={{ fontSize: "13px" }}
                      >
                        Address
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="address"
                        value={editFormData.address}
                        onChange={handleEditChange}
                        style={inputStyle}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer className="border-0" style={{ padding: "2px" }}>
                <Button
                  variant="secondary"
                  onClick={() => setShowEditModal(false)}
                  style={{ borderRadius: "10px", padding: "10px 25px" }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  style={{
                    backgroundColor: "#178aaeff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "10px 25px",
                  }}
                >
                  Save Changes
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
          <Modal
            show={showSelectionModal}
            onHide={() => setShowSelectionModal(false)}
            centered
            size="lg"
          >
            <Modal.Header closeButton style={{ backgroundColor: "#e0f7fa" }}>
              <Modal.Title style={{ fontSize: "16px", color: "#00838f" }}>
                Multiple Records Found for "{uhid}"
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p className="small text-muted">
                Please select the correct patient record from the list below:
              </p>
              <div className="table-responsive">
                <table className="table table-hover border">
                  <thead className="table-light">
                    <tr style={{ fontSize: "12px" }}>
                      <th>UID</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Address</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((p, index) => (
                      <tr key={index} style={{ fontSize: "12px" }}>
                        <td>{p.Uid_no}</td>
                        <td>
                          <strong>{p.name}</strong>
                        </td>
                        <td>{p.phone}</td>
                        <td
                          className="text-truncate"
                          style={{ maxWidth: "200px" }}
                        >
                          {p.address}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="info"
                            style={{ fontSize: "10px", color: "white" }}
                            onClick={() => selectPatient(p)}
                          >
                            Select
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Modal.Body>
          </Modal>
        </Container>
      </div>
    </div>
  );
}
