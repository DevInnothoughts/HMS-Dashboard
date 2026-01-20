import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Modal, InputGroup, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import Swal from "sweetalert2";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { decodeJwt } from "../../utils/decode-jwt";

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
        const history = JSON.parse(localStorage.getItem("verifiedPatients") || "[]");
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

    const handleSearch = async (e) => { // Added async
        e.preventDefault();
        if (!uhid) {
            Swal.fire("Error", "Please enter a UHID number", "error");
            return;
        }

        try {
            const response = await fetch( // Added await
              `${BASE_URL}/V1/ipd/admin/checkPatientOPD?location=${currentLocation}&uidNo=${uhid}`,
              {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              }
            );
      
            if (response.ok) {
              const data = await response.json(); // Added await
              console.log("Patients API Response:", data[0]);
              
              if (data[0]) {
                const patData = {
                    uhid: uhid,
                    name: data[0].name,
                    contact: data[0].phone,
                    HMSId: data[0].patient_id,

                    global_id: data[0].global_id,
                    address: data[0].address,
                    age: data[0].age,
                    gender: data[0].sex
                  };
                  setPatientData(patData);
              } else {
                  // Fallback to Mock Data only if API succeeds but returns no patient
                  const mockData = {
                    uhid: uhid,
                    name: "John Doe",
                    contact: "9876543210",
                    address: "123, Street Name, Pune",
                    age: "35",
                    gender: "Male",
                  };
                  setPatientData(mockData);
              }
            } else {
              console.error("Failed to fetch patient:", response.statusText);
              Swal.fire("Error", "Failed to fetch patient data", "error");
            }
          } catch (error) {
            console.error("Error fetching data:", error.message);
            Swal.fire("Error", "Server connection failed", "error");
          }
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

    const handleVerifyAndSubmit = async () => {
        // 1. Prepare data for the backend API
        const payload = {
            global_id: patientData.global_id,
            patient_id: patientData.HMSId,
            phone: patientData.contact,
            Uid_no: patientData.uhid,
            location: currentLocation // Adding location as it's standard in your other calls
        };
        try {
            // 2. Call the backend API
            const response = await fetch(`${BASE_URL}/V1/ipd/admin/registerPatientIPD?location=${currentLocation}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Add Authorization header if your API requires the token
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(payload)
            });

            console.log(payload);

            const result = await response.json();

            if (response.ok) {
                // 3. Logic for Local History (Existing functionality)
                // const today = new Date();
                // const d = String(today.getDate()).padStart(2, '0');
                // const m = String(today.getMonth() + 1).padStart(2, '0');
                // const y = today.getFullYear();
                // const formattedDate = `${d}-${m}-${y}`;

                // const verifiedPatient = { ...patientData, verifiedDate: formattedDate };
                // const existing = JSON.parse(localStorage.getItem("verifiedPatients") || "[]");
                // const updatedHistory = [...existing, verifiedPatient];
                
                // localStorage.setItem("verifiedPatients", JSON.stringify(updatedHistory));
                // setVerifiedHistory(updatedHistory);

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
                Swal.fire("Error", result.message || "Failed to verify patient on server", "error");
            }
        } catch (error) {
            console.error("Verification Error:", error);
            Swal.fire("Error", "Server connection failed during verification", "error");
        }
    };

    const filteredHistory = verifiedHistory.filter((p) =>
        p.name.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
        p.uhid.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
        p.contact.toLowerCase().includes(historySearchTerm.toLowerCase())
    );

    const labelStyle = "fw-bold uppercase mb-2";

    const inputStyle = {
        borderRadius: "8px",
        border: "2px solid rgb(77, 208, 225)",
        padding: "6px",
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
                                    overflow: "hidden"
                                }}
                            >
                                <div style={{ backgroundColor: "#67c5cfff", padding: "10px 15px", borderBottom: "2px solid #1a5b61ff", display: "flex", alignItems: "center" }}>
                                    <FeatherIcon icon="search" size="16" style={{ color: "#1a5b61ff", marginRight: "8px" }} />
                                    <h4 className="m-0" style={{ color: "#1a5b61ff", fontWeight: "600", fontSize: "0.95rem" }}>Search Patient</h4>
                                </div>
                                <Card.Body className="p-3">
                                    <Form onSubmit={handleSearch}>
                                        <Form.Group>
                                            <Form.Label className="fw-bold uppercase mb-1" style={{ fontSize: "0.8rem", color: "#1a5b61ff" }}>UHID No. / Contact No.</Form.Label>
                                            <InputGroup size="sm">
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Enter UHID or Mobile Number"
                                                    value={uhid}
                                                    onChange={(e) => setUhid(e.target.value)}
                                                    style={{ border: "2px solid rgb(77, 208, 225)", fontSize: "0.85rem", borderRadius: "8px 0 0 8px" }}
                                                />
                                                <Button
                                                    type="submit"
                                                    style={{
                                                        backgroundColor: "#178aaeff",
                                                        border: "none",
                                                        borderRadius: "0 8px 8px 0",
                                                        padding: "5px 15px",
                                                        fontWeight: "600",
                                                        fontSize: "0.85rem"
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
                                        overflow: "hidden"
                                    }}
                                >
                                    <div style={{ backgroundColor: "#67c5cfff", padding: "12px 10px", borderBottom: "2px solid #1a5b61ff", display: "flex", alignItems: "center" }}>
                                        <FeatherIcon icon="user" size="18" style={{ color: "#1a5b61ff", marginRight: "10px" }} />
                                        <h4 className="m-0" style={{ color: "#1a5b61ff", fontWeight: "600", fontSize: "1.1rem" }}>Patient Details</h4>
                                    </div>
                                    <Card.Body className="p-3">
                                        <Row>
                                            {[
                                                { label: "UHID No.", value: patientData.uhid, name: "uhid" },
                                                { label: "Patient Name", value: patientData.name, name: "name" },
                                                { label: "Patient HMS ID", value: patientData.HMSId, name: "HMSId" },
                                                { label: "Patient Global ID", value: patientData.global_id, name: "global_id" },

                                                { label: "Contact Number", value: patientData.contact, name: "contact" },
                                                { label: "Address", value: patientData.address, name: "address" },
                                                { label: "Age", value: patientData.age, name: "age" },
                                                { label: "Gender", value: patientData.gender, name: "gender" },
                                            ].map((field) => (
                                                <Col md={4} key={field.name} className="mb-3">
                                                    <Form.Group>
                                                        <Form.Label className={labelStyle} style={{ fontSize: "0.75rem", }}>{field.label}</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={field.value}
                                                            readOnly
                                                            style={{
                                                                backgroundColor: "#fafdff",
                                                                border: "1px solid #6db8c2ff",
                                                                borderRadius: "8px",
                                                                cursor: "not-allowed",
                                                                padding: "5px 10px",
                                                                fontSize: "0.9rem"
                                                            }}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            ))}
                                        </Row>

                                        <div className="d-flex justify-content-center gap-2 mt-2 mb-3">
                                            <Button
                                                onClick={openEditModal}
                                                variant="info"
                                                className="px-3 py-10 text-white"
                                                style={{ borderRadius: "8px", fontWeight: "600", backgroundColor: "#00bcd4", border: "none", fontSize: "0.85rem" }}
                                            >
                                                <FeatherIcon icon="edit-2" size={14} className="me-2" />
                                                Edit
                                            </Button>
                                            <Button
                                                onClick={handleVerifyAndSubmit}
                                                variant="success"
                                                className="px-3 py-10"
                                                style={{ borderRadius: "8px", fontWeight: "600", backgroundColor: "#28a745", border: "none", fontSize: "0.85rem" }}
                                            >
                                                <FeatherIcon icon="check-circle" size={14} className="me-2" />
                                                Verified & Submit
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    )
                    }

                    {/* Verification History Table */}
                    <Row>
                        <Col md={12}>
                            <Card
                                style={{
                                    borderRadius: "15px",
                                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
                                    border: "none",
                                    background: "white",
                                    overflow: "hidden"
                                }}
                            >
                                <div style={{ backgroundColor: "#67c5cfff", padding: "10px 15px", borderBottom: "2px solid #1a5b61ff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div className="d-flex align-items-center">
                                        <FeatherIcon icon="clock" size="16" style={{ color: "#1a5b61ff", marginRight: "8px" }} />
                                        <h4 className="m-0" style={{ color: "#1a5b61ff", fontWeight: "600", fontSize: "0.95rem" }}>Verification History</h4>
                                    </div>
                                    <div style={{ width: "250px" }}>
                                        <InputGroup size="sm">
                                            <InputGroup.Text style={{ backgroundColor: "#fff", borderRight: "none", borderRadius: "8px 0 0 8px", border: "1px solid #ced4da" }}>
                                                <FeatherIcon icon="search" size={14} className="text-muted" />
                                            </InputGroup.Text>
                                            <Form.Control
                                                placeholder="Search history..."
                                                value={historySearchTerm}
                                                onChange={(e) => setHistorySearchTerm(e.target.value)}
                                                style={{ borderLeft: "none", borderRadius: "0 8px 8px 0", border: "1px solid #ced4da", fontSize: "0.85rem" }}
                                            />
                                        </InputGroup>
                                    </div>
                                </div>
                                <Card.Body className="p-0">
                                    <Table responsive hover className="mb-0">
                                        <thead style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #e9ecef" }}>
                                            <tr>
                                                <th className="py-5 px-3 border-0 uppercase fw-bold">Verified Date</th>
                                                <th className="py-5 px-3 border-0 uppercase fw-bold">UHID No.</th>
                                                <th className="py-5 px-3 border-0 uppercase fw-bold">Patient Name</th>
                                                <th className="py-5 px-3 border-0 uppercase fw-bold">Age/Gender</th>
                                                <th className="py-5 px-3 border-0 text-center uppercase fw-bold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredHistory.length > 0 ? (
                                                [...filteredHistory].reverse().map((patient, index) => (
                                                    <tr key={index} style={{ verticalAlign: "middle", fontSize: "0.85rem" }}>
                                                        <td className="py-2 px-3" style={{ fontSize: "13px" }}>{patient.verifiedDate || "N/A"}</td>
                                                        <td className="py-2 px-3 fw-bold" style={{ color: "#178aaeff" }}>{patient.uhid}</td>
                                                        <td className="py-2 px-3" style={{ color: "#2c3e50" }}>{patient.name}</td>
                                                        <td className="py-2 px-3">{patient.age} / {patient.gender}</td>
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
                                                                    margin: "3px"
                                                                }}
                                                            >
                                                                <FeatherIcon icon="check" size={10} className="me-1" />
                                                                Verified
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-5 text-muted">
                                                        <FeatherIcon icon="info" size={40} className="mb-3 opacity-20" />
                                                        <p className="m-0">{historySearchTerm ? "No matching history found." : "No verification history found."}</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Edit Modal */}
                    <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
                        <Modal.Header closeButton style={{ backgroundColor: "#67c5cfff", borderBottom: "2px solid #1a5b61ff" }}>
                            <Modal.Title style={{ color: "#1a5b61ff", fontWeight: "600" }}>Edit Patient Details</Modal.Title>
                        </Modal.Header>
                        <Form onSubmit={handleEditSubmit}>
                            <Modal.Body className="p-4">
                                <Row>
                                    <Col md={6} className="mb-10">
                                        <Form.Group>
                                            <Form.Label className={labelStyle}>UHID No.</Form.Label>
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
                                            <Form.Label className={labelStyle}>Patient Name</Form.Label>
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
                                            <Form.Label className={labelStyle}>Contact Number</Form.Label>
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
                                            <Form.Label className={labelStyle}>Age</Form.Label>
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
                                            <Form.Label className={labelStyle}>Gender</Form.Label>
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
                                            <Form.Label className={labelStyle}>Address</Form.Label>
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
                            <Modal.Footer className="border-0">
                                <Button variant="secondary" onClick={() => setShowEditModal(false)} style={{ borderRadius: "10px", padding: "10px 25px" }}>
                                    Cancel
                                </Button>
                                <Button type="submit" style={{ backgroundColor: "#178aaeff", border: "none", borderRadius: "10px", padding: "10px 25px" }}>
                                    Save Changes
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>
                </Container >
            </div >
        </div >
    );
}
