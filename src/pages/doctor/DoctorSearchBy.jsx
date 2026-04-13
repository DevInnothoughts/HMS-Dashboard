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

const BASE_URL = "http://194.195.117.79:5100/api";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

export default function DoctorSearchBy() {
  const navigate = useNavigate();
  const [uhid, setUhid] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [currentLocation, setCurrentLocation] = useState("default");

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
        `${BASE_URL}/V1/doctor/admission/check-patient?location=${currentLocation}&uidNo=${uhid}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 1) {
          setSearchResults(data);
          setShowSelectionModal(true);
        } else if (data && data.length === 1) {
          selectPatient(data[0]);
        } else {
          Swal.fire("Not Found", "No matches found.", "info");
        }
      } else {
          Swal.fire("Not Found", "No matches found.", "info");
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

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
        nmb_time: patientData.nmbTime,
      },
    };
    const payload = {
      global_id: patientData.global_id,
      patient_id: patientData.HMSId,
      phone: patientData.contact,
      Uid_no: patientData.uhid,
      location: currentLocation,
      pre_planning: preplan,
    };

    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/admission/register-patient?location=${currentLocation}`,
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
          title: "Verified!",
          text: "Patient data has been verified and synced with the server.",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          navigate("/doctor-manage-admission");
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
      <PageBreadcrumb pagename="Doctor Search By" />

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
                        <Col md={4} key={field.name} className="mb-2">
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

                      <Col md={12} className="mb-2 mt-2">
                        <hr style={{ borderTop: "1px solid #67c5cfff", opacity: 0.3 }} />
                        <p style={{ fontSize: "0.90rem", color: "#ff1500ff", fontWeight: "600", marginBottom: "5px" }}>
                          Fill the below details to book the patient for admission
                        </p>
                      </Col>

                      <Col md={4} className="mb-2">
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
                            "& .MuiIconButton-root": {
                              padding: "4px",
                              color: "#1a5b61ff",
                            },
                          }}
                        />
                      </Col>

                      <Col md={4} className="mb-2">
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
                            "& .MuiIconButton-root": {
                              padding: "4px",
                              color: "#1a5b61ff",
                            },
                          }}
                        />
                      </Col>

                      <Col md={4} className="mb-2">
                        <Form.Group>
                          <Form.Label className={labelStyle} style={{ fontSize: "0.75rem" }}>
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

                      <Col md={4} className="mb-2">
                        <Form.Group>
                          <Form.Label className={labelStyle} style={{ fontSize: "0.75rem" }}>
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

                      <Col md={4} className="mb-2">
                        <MuiDateTimePicker
                          label="NBM Time"
                          value={patientData.nmbTime}
                          onChange={(e) => setPatientData((prev) => ({ ...prev, nmbTime: e.target.value }))}
                          name="nmbTime"
                          type="time"
                          minutesStep={15}
                          labelClassName={labelStyle}
                          labelStyle={{ fontSize: "0.75rem" }}
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
                        className="px-3"
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
                        className="px-3"
                        style={{
                          borderRadius: "8px",
                          fontWeight: "600",
                          backgroundColor: "#28a745",
                          border: "none",
                          fontSize: "0.85rem",
                        }}
                      >
                        <FeatherIcon icon="check-circle" size={14} className="me-2" />
                        Book For Admission
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>

      <Modal show={showSelectionModal} onHide={() => setShowSelectionModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ backgroundColor: "#67c5cfff" }}>
          <Modal.Title style={{ color: "#1a5b61ff", fontSize: "1.1rem" }}>Multiple Patients Found</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead style={{ backgroundColor: "#f8f9fa" }}>
              <tr>
                <th>UHID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((p, idx) => (
                <tr key={idx}>
                  <td>{p.Uid_no}</td>
                  <td>{p.name}</td>
                  <td>{p.phone}</td>
                  <td>
                    <Button size="sm" onClick={() => selectPatient(p)}>Select</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: "#67c5cfff" }}>
          <Modal.Title style={{ color: "#1a5b61ff", fontSize: "1.1rem" }}>Edit Patient Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Patient Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editFormData.name || ""}
                onChange={handleEditChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contact Number</Form.Label>
              <Form.Control
                type="text"
                name="contact"
                value={editFormData.contact || ""}
                onChange={handleEditChange}
              />
            </Form.Group>
            <div className="text-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button variant="primary" type="submit">Save Changes</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
