import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Badge } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import Swal from "sweetalert2";
import PageBreadcrumb from "../../components/PageBreadcrumb";

export default function ManageAdmission() {
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("verifiedPatients") || "[]");
        setPatients(data);
    }, []);

    const handleConfirm = (uhid) => {
        Swal.fire({
            title: "Confirm Admission?",
            text: "This will move the patient to the surgery list.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Confirm",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#15ab56ff",
            cancelButtonColor: "#dc1818ff",
            didOpen: () => {
                const container = Swal.getActions();
                const confirmBtn = Swal.getConfirmButton();
                const cancelBtn = Swal.getCancelButton();
                container.style.flexDirection = "row-reverse";
                container.style.justifyContent = "center";
                confirmBtn.style.borderRadius = "10px";
                cancelBtn.style.borderRadius = "10px";
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const updatedPatients = [...patients];
                const patientIdx = updatedPatients.findIndex(p => p.uhid === uhid);

                if (patientIdx === -1) return;

                const patient = updatedPatients[patientIdx];

                const surgeryData = JSON.parse(localStorage.getItem("surgeryPatients") || "[]");
                let nextNum = 1;
                if (surgeryData.length > 0) {
                    const numbers = surgeryData
                        .map(p => {
                            if (!p.admissionNo) return 0;
                            const match = p.admissionNo.match(/\d+/);
                            return match ? parseInt(match[0]) : 0;
                        })
                        .filter(n => !isNaN(n));
                    if (numbers.length > 0) {
                        nextNum = Math.max(...numbers) + 1;
                    }
                }
                const admissionNo = `ADM-${nextNum}`;

                patient.status = "Submitted for Surgery";
                patient.admissionNo = admissionNo;

                localStorage.setItem("surgeryPatients", JSON.stringify([...surgeryData, patient]));
                localStorage.setItem("verifiedPatients", JSON.stringify(updatedPatients));
                setPatients(updatedPatients);

                Swal.fire({
                    title: "Confirmed!",
                    text: `Patient admission confirmed For Admission No: ${admissionNo}.`,
                    icon: "success",
                    didOpen: () => {
                        Swal.getConfirmButton().style.borderRadius = "10px";
                    }
                });
            }
        });
    };

    const filteredPatients = patients.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.uhid.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            <PageBreadcrumb pagename="Manage Admission" />

            <div className="theme-body">
                <Container fluid>
                    <Row>
                        <Col>
                            <Card
                                style={{
                                    borderRadius: "15px",
                                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
                                    border: "none",
                                    background: "white",
                                    overflow: "hidden"
                                }}
                            >
                                <div style={{
                                    backgroundColor: "#67c5cfff",
                                    padding: "12px 15px",
                                    borderBottom: "2px solid #1a5b61ff",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}>
                                    <div className="d-flex align-items-center">
                                        <FeatherIcon icon="users" size="18" style={{ color: "#1a5b61ff", marginRight: "10px" }} />
                                        <h4 className="m-0" style={{ color: "#1a5b61ff", fontWeight: "600", fontSize: "1.1rem" }}>Verified Patients Queue</h4>
                                    </div>
                                    <div style={{ width: "350px" }}>
                                        <InputGroup size="sm">
                                            <InputGroup.Text style={{ backgroundColor: "#fff", borderRight: "none", borderRadius: "8px 0 0 8px" }}>
                                                <FeatherIcon icon="search" size={14} className="text-muted" />
                                            </InputGroup.Text>
                                            <Form.Control
                                                placeholder="Search by name or UHID..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                style={{ borderRadius: "0 8px 8px 0" }}
                                            />
                                        </InputGroup>
                                    </div>
                                </div>
                                <Card.Body className="p-0">
                                    <Table responsive hover className="mb-0">
                                        <thead style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #e9ecef" }}>
                                            <tr>
                                                <th className="py-7 px-4 border-0 uppercase fw-bold">Verified Date</th>
                                                <th className="py-7 px-4 border-0 uppercase fw-bold">UHID</th>
                                                <th className="py-7 px-4 border-0 uppercase fw-bold">Patient Name</th>
                                                <th className="py-7 px-4 border-0 uppercase fw-bold">Age/Gender</th>
                                                <th className="py-7 px-4 border-0 uppercase fw-bold">Contact</th>
                                                <th className="py-7 px-4 border-0 text-center uppercase fw-bold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredPatients.length > 0 ? (
                                                [...filteredPatients].reverse().map((patient, index) => (
                                                    <tr key={index} style={{ verticalAlign: "middle", fontSize: "0.9rem" }}>
                                                        <td className="py-3 px-4" style={{ fontSize: "14px" }}>{patient.verifiedDate || "N/A"}</td>
                                                        <td className="py-3 px-4 fw-bold" style={{ color: "#178aaeff" }}>{patient.uhid}</td>
                                                        <td className="py-3 px-4 ">{patient.name}</td>
                                                        <td className="py-3 px-4">{patient.age} / {patient.gender}</td>
                                                        <td className="py-3 px-4">{patient.contact}</td>
                                                        <td className="py-3 px-4">
                                                            <div className="d-flex justify-content-center gap-2">
                                                                {patient.status === "Submitted for Surgery" ? (
                                                                    <Badge bg="success" style={{ padding: "5px 10px", borderRadius: "6px", fontSize: "10px" }}>
                                                                        <FeatherIcon icon="check-circle" size={12} className="me-1" />
                                                                        {patient.admissionNo}
                                                                    </Badge>
                                                                ) : (
                                                                    <>
                                                                        <Button
                                                                            variant="outline-primary"
                                                                            size="sm"
                                                                            style={{ borderRadius: "6px", fontWeight: "600", margin: "3px" }}
                                                                        >
                                                                            Edit
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline-success"
                                                                            size="sm"
                                                                            onClick={() => handleConfirm(patient.uhid)}
                                                                            style={{
                                                                                borderRadius: "6px",
                                                                                border: "none",
                                                                                padding: "5px 10px",
                                                                                fontWeight: "600",
                                                                                margin: "3px"
                                                                            }}
                                                                        >
                                                                            Confirm
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-5 text-muted">
                                                        <FeatherIcon icon="info" size={40} className="mb-3 opacity-20" />
                                                        <p className="m-0">No verified patients found.</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
}
