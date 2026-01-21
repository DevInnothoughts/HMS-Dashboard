import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { decodeJwt } from "../../utils/decode-jwt";

const BASE_URL = "http://194.195.117.79:5100/api";

export default function Surgery() {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentLocation, setCurrentLocation] = useState("default");

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // 1. Get Location from JWT on load
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const payload = decodeJwt(token);
            if (payload && payload.jobLocation) {
                setCurrentLocation(payload.jobLocation);
            }
        }
    }, []);

    // 2. Fetch Admitted Patients from Backend
    // const fetchAdmittedPatients = useCallback(async () => {
    //     if (currentLocation === "default") return;

    //     setLoading(true);
    //     try {
    //         const response = await fetch(`${BASE_URL}/V1/ipd/admin/listAdmittedPatients?location=${currentLocation}`, {
    //             method: "GET",
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 "Authorization": `Bearer ${localStorage.getItem("token")}`
    //             }
    //         });

    //         if (response.ok) {
    //             const result = await response.json();
    //             // Mapping backend database fields to your frontend table keys
    //             const formattedData = result.map(p => ({
    //                 uhid: p.uid,
    //                 admissionNo: p.admission_no,
    //                 name: p.name,
    //                 contact: p.patient_phone,
    //                 age: p.age,
    //                 gender: p.sex,
    //                 verifiedDate: p.created_at, // This represents the admission date here
    //                 patient_id: p.patient_id
    //             }));
    //             setPatients(formattedData);
    //         } else {
    //             console.error("Failed to fetch admitted patients");
    //         }
    //     } catch (error) {
    //         console.error("Error fetching surgery list:", error);
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [currentLocation]);

    const fetchAdmittedPatients = useCallback(async () => {
        if (currentLocation === "default") return;

        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/V1/ipd/admin/listAdmittedPatients?location=${currentLocation}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (response.ok) {
                const result = await response.json();

                const sortedData = result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                // Inside fetchAdmittedPatients
                const formattedData = sortedData.map(p => ({
                    uhid: p.uid,
                    admissionNo: p.admission_no,
                    name: p.name,
                    contact: p.patient_phone,
                    age: p.age,
                    gender: p.sex,
                    verifiedDate: p.created_at, // Keep the raw ISO string from the DB
                    patient_id: p.patient_id
                }));

                setPatients(formattedData);
            } else {
                console.error("Failed to fetch admitted patients");
            }
        } catch (error) {
            console.error("Error fetching surgery list:", error);
        } finally {
            setLoading(false);
        }
    }, [currentLocation]);

    useEffect(() => {
        fetchAdmittedPatients();
    }, [fetchAdmittedPatients]);

    // 3. Search Filter Logic
    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.uhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleForms = (patientData) => {
        console.log("admission number", patientData);
        navigate(`/surgery/forms`, { state: { patientData: patientData } });
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
            <PageBreadcrumb pagename="Surgery Management" />

            <div className="theme-body">
                <Container fluid>
                    <Row>
                        <Col>
                            <Card style={{ borderRadius: "15px", boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)", border: "none", background: "white", overflow: "hidden" }}>
                                <div style={{ backgroundColor: "#67c5cfff", padding: "12px 15px", borderBottom: "2px solid #1a5b61ff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div className="d-flex align-items-center">
                                        <FeatherIcon icon="activity" size="18" style={{ color: "#1a5b61ff", marginRight: "10px" }} />
                                        <h4 className="m-0" style={{ color: "#1a5b61ff", fontWeight: "600", fontSize: "1.1rem" }}>Surgery Patients List</h4>
                                    </div>
                                    <div style={{ width: "350px" }}>
                                        <InputGroup size="sm">
                                            <InputGroup.Text style={{ backgroundColor: "#fff", borderRight: "none", borderRadius: "8px 0 0 8px" }}>
                                                <FeatherIcon icon="search" size={14} className="text-muted" />
                                            </InputGroup.Text>
                                            <Form.Control
                                                placeholder="Search by name, ADM no, or UHID..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                style={{ borderLeft: "none", borderRadius: "0 8px 8px 0" }}
                                            />
                                        </InputGroup>
                                    </div>
                                </div>
                                <Card.Body className="p-0">
                                    {loading ? (
                                        <div className="text-center py-5">
                                            <Spinner animation="border" variant="info" />
                                            <p className="mt-2 text-muted">Loading Surgery List...</p>
                                        </div>
                                    ) : (
                                        <Table responsive hover className="mb-0">
                                            <thead style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #e9ecef" }}>
                                                <tr>
                                                    <th className="py-3 px-4 border-0 uppercase fw-bold">Date</th>
                                                    <th className="py-3 px-4 border-0 uppercase fw-bold">Admission No</th>
                                                    <th className="py-3 px-4 border-0 uppercase fw-bold">UHID No</th>
                                                    <th className="py-3 px-4 border-0 uppercase fw-bold">Patient Name</th>
                                                    <th className="py-3 px-4 border-0 uppercase fw-bold">Contact</th>
                                                    <th className="py-3 px-4 border-0 uppercase fw-bold">Age/Gender</th>
                                                    <th className="py-3 px-4 border-0 text-center uppercase fw-bold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredPatients.length > 0 ? (
                                                    filteredPatients.map((patient, index) => (
                                                        <tr key={index} style={{ verticalAlign: "middle", fontSize: "0.9rem" }}>
                                                            <td className="py-3 px-4"> {formatDate(patient.verifiedDate)}</td>
                                                            <td className="py-3 px-4 fw-bold" style={{ color: "#178aaeff" }}>{patient.admissionNo}</td>
                                                            <td className="py-3 px-4 fw-bold" style={{ color: "#178aaeff" }}>{patient.uhid}</td>
                                                            <td className="py-3 px-4">{patient.name}</td>
                                                            <td className="py-3 px-4">{patient.contact}</td>
                                                            <td className="py-3 px-4">{patient.age} / {patient.gender}</td>
                                                            <td className="py-3 px-4">
                                                                <div className="d-flex justify-content-center">
                                                                    <Button
                                                                        variant="primary"
                                                                        size="sm"
                                                                        onClick={() => handleForms(patient)}
                                                                        title="All Forms"
                                                                        style={{ borderRadius: "6px", backgroundColor: "#178aaeff", border: "none", padding: "8px 12px", margin: "3px" }}
                                                                    >
                                                                        <FeatherIcon icon="file-text" size={14} />
                                                                    </Button>
                                                                    <Button
                                                                        variant="primary"
                                                                        size="sm"
                                                                        title="Print All Forms"
                                                                        style={{ borderRadius: "6px", backgroundColor: "#178aaeff", border: "none", padding: "8px 12px", margin: "3px" }}
                                                                    >
                                                                        <FeatherIcon icon="printer" size={14} />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="7" className="text-center py-5 text-muted">
                                                            <FeatherIcon icon="info" size={40} className="mb-3 opacity-20" />
                                                            <p className="m-0">No surgery patients found.</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
}