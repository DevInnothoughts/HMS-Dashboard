import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Form, Button, Badge, InputGroup } from "react-bootstrap";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import Swal from "sweetalert2";
import AdmissionDetailsForm from "../IPD Forms/forms/AdmissionDetailsForm";
import AdmissionChecklist from "../IPD Forms/forms/AdmissionChecklist";
import CaseSheetForm from "../IPD Forms/forms/CaseSheetForm";
import InitialAssessmentForm from "../IPD Forms/forms/InitialAssessmentForm";
import MedicationChartForm from "../IPD Forms/forms/MedicationChartForm";
import NursingNotesForm from "../IPD Forms/forms/NursingNotesForm";
import OTNotesForm from "../IPD Forms/forms/OTNotesForm";
import OperativeNotesForm from "../IPD Forms/forms/OperativeNotesForm";
import PhysicianAssessmentForm from "../IPD Forms/forms/PhysicianAssessmentForm";
import SurgeryConsentForm from "../IPD Forms/forms/SurgeryConsentForm";
import GeneralConsentForm from "../IPD Forms/forms/GeneralConsentForm";
import AnesthesiaConsentForm from "../IPD Forms/forms/AnesthesiaConsentForm";
import NursingInitialAssessmentForm from "../IPD Forms/forms/NursingInitialAssessmentForm";
import NursingInitialAssessmentFallRiskForm from "../IPD Forms/forms/NursingInitialAssessmentFallRiskForm";
import MedicationTherapyForm from "../IPD Forms/forms/MedicationTherapyForm";
import NursingFlowChartForm from "../IPD Forms/forms/NursingFlowChartForm";
import AdverseDrugReportForm from "../IPD Forms/forms/AdverseDrugReportForm";
import AdverseDrugCorrectiveActionForm from "../IPD Forms/forms/AdverseDrugCorrectiveActionForm";
import BloodTransfusionRecordForm from "../IPD Forms/forms/BloodTransfusionRecordForm";
import EstimatedCostForm from "../IPD Forms/forms/EstimatedCostForm";
import IpdClearanceForm from "../IPD Forms/forms/IpdClearanceForm";
import NutritionalAssessmentForm from "../IPD Forms/forms/NutritionalAssessmentForm";
import NutritionalReassessmentForm from "../IPD Forms/forms/NutritionalReassessmentForm";
import PatientTransferForm from "../IPD Forms/forms/PatientTransferForm";
import PostOperativeAdviceForm from "../IPD Forms/forms/PostOperativeAdviceForm";
import PreAnesthesiaCheckupForm from "../IPD Forms/forms/PreAnesthesiaCheckupForm";
import PreOpOrderForm from "../IPD Forms/forms/PreOpOrderForm";
import ProgressNotesForm from "../IPD Forms/forms/ProgressNotesForm";
import ProgressSheetForm from "../IPD Forms/forms/ProgressSheetForm";
import ScoreMappingSheetForm from "../IPD Forms/forms/ScoreMappingSheetForm";
import TimeOutSheetForm from "../IPD Forms/forms/TimeOutSheetForm";
import WHOSignInForm from "../IPD Forms/forms/WHOSignInForm";
import WHOSignOutForm from "../IPD Forms/forms/WHOSignOutForm";
import WHOTimeOutForm from "../IPD Forms/forms/WHOTimeOutForm";

const formMapping = {
    "Admission Details": AdmissionDetailsForm,
    "Admission Checklist": AdmissionChecklist,
    "Case Sheet": CaseSheetForm,
    "Initial Assessment": InitialAssessmentForm,
    "Medication Chart": MedicationChartForm,
    "Nursing Notes": NursingNotesForm,
    "OT Notes": OTNotesForm,
    "Operative Notes": OperativeNotesForm,
    "Physician Assessment": PhysicianAssessmentForm,
    "Surgery Consent": SurgeryConsentForm,
    "General Consent": GeneralConsentForm,
    "Anesthesia Consent": AnesthesiaConsentForm,
    "Nursing Initial Assessment": NursingInitialAssessmentForm,
    "Nursing Fall Risk Assessment": NursingInitialAssessmentFallRiskForm,
    "Medication Therapy": MedicationTherapyForm,
    "Nursing Flow Chart": NursingFlowChartForm,
    "Adverse Drug Report": AdverseDrugReportForm,
    "Adverse Drug Corrective Action": AdverseDrugCorrectiveActionForm,
    "Blood Transfusion Record": BloodTransfusionRecordForm,
    "Estimated Cost": EstimatedCostForm,
    "Ipd Clearance": IpdClearanceForm,
    "Nutritional Assessment": NutritionalAssessmentForm,
    "Nutritional Reassessment": NutritionalReassessmentForm,
    "Patient Transfer": PatientTransferForm,
    "Post Operative Advice": PostOperativeAdviceForm,
    "Pre Anesthesia Checkup": PreAnesthesiaCheckupForm,
    "Pre Op Order": PreOpOrderForm,
    "Progress Notes": ProgressNotesForm,
    "Progress Sheet": ProgressSheetForm,
    "Score Mapping Sheet": ScoreMappingSheetForm,
    "Time Out Sheet": TimeOutSheetForm,
    "WHO Sign In": WHOSignInForm,
    "WHO Sign Out": WHOSignOutForm,
    "WHO Time Out": WHOTimeOutForm,
};

const allFormsList = [
    { name: "Admission Checklist", category: "Admission" },
    { name: "Admission Details", category: "Admission" },
    { name: "Adverse Drug Corrective Action", category: "Pharmacy" },
    { name: "Adverse Drug Report", category: "Pharmacy" },
    { name: "Anesthesia Consent", category: "Consent" },
    { name: "Blood Transfusion Record", category: "Clinical" },
    { name: "Case Sheet", category: "Clinical" },
    { name: "Estimated Cost", category: "Billing" },
    { name: "General Consent", category: "Consent" },
    { name: "Initial Assessment", category: "Assessment" },
    { name: "Ipd Clearance", category: "Discharge" },
    { name: "Medication Chart", category: "Medication" },
    { name: "Medication Therapy", category: "Medication" },
    { name: "Nursing Fall Risk Assessment", category: "Assessment" },
    { name: "Nursing Flow Chart", category: "Nursing" },
    { name: "Nursing Initial Assessment", category: "Assessment" },
    { name: "Nursing Notes", category: "Nursing" },
    { name: "Nutritional Assessment", category: "Assessment" },
    { name: "Nutritional Reassessment", category: "Assessment" },
    { name: "OT Notes", category: "Surgery" },
    { name: "Operative Notes", category: "Surgery" },
    { name: "Patient Transfer", category: "Clinical" },
    { name: "Physician Assessment", category: "Assessment" },
    { name: "Post Operative Advice", category: "Surgery" },
    { name: "Pre Anesthesia Checkup", category: "Surgery" },
    { name: "Pre Op Order", category: "Surgery" },
    { name: "Progress Notes", category: "Clinical" },
    { name: "Progress Sheet", category: "Clinical" },
    { name: "Score Mapping Sheet", category: "Clinical" },
    { name: "Surgery Consent", category: "Consent" },
    { name: "Time Out Sheet", category: "Surgery" },
    {
        name: "WHO Surgical Safety Checklist",
        category: "Safety",
        subForms: ["WHO Sign In", "WHO Time Out", "WHO Sign Out"]
    },
];

export default function IPDFormsContainer() {
    const location = useLocation();
    
    // Access the data from the state object
    // const patient = location.state?.patientData;

    // console.log("Admission number from state:", patientData);    
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [activeForm, setActiveForm] = useState(null); // null means show list
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedForms, setExpandedForms] = useState({});
    const [admissionNo, setAdmissionNo] = useState(null);

    const toggleExpand = (formName) => {
        setExpandedForms(prev => ({ ...prev, [formName]: !prev[formName] }));
    };
    // console.log("Admissiong number for all forms: ", admissionNo);
    
    useEffect(() => {
        // Check if state exists
        if (location.state?.patientData) {
            setPatient(location.state.patientData);
            setAdmissionNo(location.state.patientData.admissionNo);
        } else {
            // Fallback if someone tries to access the URL directly without state
            Swal.fire("Error", "Patient data missing. Please select from the list.", "error").then(() => {
                navigate("/surgery");
            });
        }
    }, [location, navigate]);

    const filteredForms = allFormsList.filter((f) =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFormSubmit = (data) => {
        console.log(`Submitted ${activeForm} for ${admissionNo}:`, data);
        Swal.fire("Success", `${activeForm} submitted successfully!`, "success").then(() => {
            setActiveForm(null); // Go back to list
        });
    };

    if (!patient) return <div className="p-5 text-center">Loading patient data...</div>;

    const SelectedForm = activeForm ? formMapping[activeForm] : null;

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
            <PageBreadcrumb pagename="Clinical Forms Index" />

            <div className="theme-body">
                <Container fluid>
                    {/* Patient Context Header Card - Matching Receptionist Aesthetic */}
                    <Card
                        className="mb-15"
                        style={{
                            borderRadius: "15px",
                            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
                            border: "none",
                            background: "white",
                            overflow: "hidden",
                        }}
                    >
                        <div style={{ backgroundColor: "#67c5cfff", padding: "12px 10px", borderBottom: "2px solid #1a5b61ff", display: "flex", alignItems: "center" }}>
                            <FeatherIcon icon="user" size="18" style={{ color: "#1a5b61ff", marginRight: "5px" }} />
                            <h4 className="m-0 fw-bold" style={{ color: "#1a5b61ff", fontWeight: "600", fontSize: "1.1rem" }}>Patient Clinical Dashboard</h4>
                        </div>
                        <Card.Body className="p-3">
                            <Row className="align-items-center">
                                <Col md={5} className="border-end">
                                    <div className="d-flex align-items-center">
                                        <div style={{ backgroundColor: "#e0f7fa", width: "50px", height: "50px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "15px" }}>
                                            <FeatherIcon icon="user" className="text-info" />
                                        </div>
                                        <div>
                                            <h4 className="mb-0 fw-bold" style={{ color: "#178aaeff", fontSize: "1.2rem" }}>{patient.name}</h4>
                                            <p className="text-muted mb-0 small uppercase fw-bold" style={{ fontSize: "0.75rem" }}>{patient.age} Yrs / {patient.gender} | <FeatherIcon icon="phone" size={10} /> {patient.contact}</p>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={3} className="text-center border-end">
                                    <div className="text-muted small uppercase fw-bold mb-1" style={{ fontSize: "0.7rem" }}>Admission No</div>
                                    <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: "1rem" }}>{admissionNo}</h5>
                                </Col>
                                <Col md={4} className="text-center">
                                    <div className="text-muted small uppercase fw-bold mb-1" style={{ fontSize: "0.7rem" }}>UHID No</div>
                                    <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: "1rem" }}>{patient.uhid}</h5>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card
                        style={{
                            borderRadius: "15px",
                            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
                            border: "none",
                            background: "white",
                            overflow: "hidden",
                        }}
                    >
                        {/* Form Title Strip */}
                        <div style={{ backgroundColor: "#67c5cfff", padding: "12px 10px", borderBottom: "2px solid #1a5b61ff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h4 className="m-0 fw-bold d-flex align-items-center" style={{ color: "#1a5b61ff", fontSize: "1.1rem" }}>
                                {activeForm ? (
                                    <>
                                        <Button
                                            variant="link"
                                            className="p-0 me-3"
                                            onClick={() => setActiveForm(null)}
                                            style={{ color: "#1a5b61ff" }}
                                        >
                                            <FeatherIcon icon="arrow-left" size={20} />
                                        </Button>
                                        {activeForm}
                                    </>
                                ) : (
                                    <>
                                        <FeatherIcon icon="file-text" size={18} className="me-2" style={{ color: "#1a5b61ff" }} />
                                        Available Clinical Documents
                                    </>
                                )}
                            </h4>
                            {!activeForm && (
                                <div style={{ width: "350px" }}>
                                    <InputGroup size="sm">
                                        <InputGroup.Text style={{ backgroundColor: "#fff", borderRight: "none", borderRadius: "8px 0 0 8px" }}>
                                            <FeatherIcon icon="search" size={14} className="text-muted" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            placeholder="Search clinical forms..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{ borderLeft: "none", borderRadius: "0 8px 8px 0" }}
                                        />
                                    </InputGroup>
                                </div>
                            )}
                        </div>

                        <Card.Body className="p-0">
                            {!activeForm ? (
                                /* Line by Line View */
                                <div className="p-4">
                                    <div>
                                        <Table responsive hover className="mb-0 custom-table">
                                            <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa", zIndex: 1, borderBottom: "2px solid #e9ecef" }}>
                                                <tr>
                                                    <th className="border-0 px-3 py-2 text-muted small uppercase fw-bold">Document Name</th>
                                                    <th className="border-0 px-3 py-2 text-muted small uppercase fw-bold">Category</th>
                                                    <th className="border-0 px-3 py-2 text-muted small uppercase fw-bold text-center">Status</th>
                                                    <th className="border-0 px-3 py-2 text-muted small uppercase fw-bold text-end">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredForms.map((form, idx) => (
                                                    <React.Fragment key={idx}>
                                                        <tr style={{ verticalAlign: "middle" }}>
                                                            <td className="px-4 py-3" onClick={() => form.subForms && toggleExpand(form.name)} style={{ cursor: form.subForms ? 'pointer' : 'default', userSelect: 'none' }}>
                                                                <div className="d-flex align-items-center justify-content-between">
                                                                    <div className="d-flex align-items-center">
                                                                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#e0f7fa", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "12px" }}>
                                                                            <FeatherIcon icon="file" size={16} style={{ color: "#178aaeff" }} />
                                                                        </div>
                                                                        <span className="fw-bold text-dark" style={{ fontSize: "13px" }}>{form.name}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <Badge pill style={{ backgroundColor: "#00796b", color: "#ffffff", fontWeight: "600", fontSize: "10px", padding: "5px 10px" }}>
                                                                    {form.category.toUpperCase()}
                                                                </Badge>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span>Ready</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-end">
                                                                {!form.subForms ? (
                                                                    <Button
                                                                        variant="primary"
                                                                        size="sm"
                                                                        onClick={() => setActiveForm(form.name)}
                                                                        style={{ borderRadius: "8px", fontWeight: "600", padding: "8px 25px", backgroundColor: "#178aaeff", border: "none" }}
                                                                    >
                                                                        Open Form
                                                                    </Button>
                                                                ) : (
                                                                    <div onClick={() => toggleExpand(form.name)} style={{ cursor: 'pointer', display: 'inline-block' }}>
                                                                        <FeatherIcon icon={expandedForms[form.name] ? "chevron-down" : "chevron-right"} size={18} className="text-muted" />
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                        {form.subForms && expandedForms[form.name] && form.subForms.map((sub, sIdx) => (
                                                            <tr key={sIdx} style={{ backgroundColor: "#fcfdff", verticalAlign: "middle" }}>
                                                                <td className="px-4 py-2" style={{ paddingLeft: "3rem !important" }}>
                                                                    <div className="d-flex align-items-center ms-5">
                                                                        <span className="fw-bold me-2" style={{ fontSize: "14px", color: "#dc3545" }}>{sIdx + 1}.</span>
                                                                        <span className="" style={{ fontSize: "13px", fontWeight: "500", color: "#000000" }}>{sub}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <span className="text-muted small">-</span>
                                                                </td>
                                                                <td className="text-center text-muted small">
                                                                    -
                                                                </td>
                                                                <td className="px-4 py-2 text-end">
                                                                    <Button
                                                                        variant="primary"
                                                                        size="sm"
                                                                        onClick={() => setActiveForm(sub)}
                                                                        style={{ borderRadius: "8px", fontWeight: "600", padding: "8px 25px", backgroundColor: "#178aaeff", border: "none" }}
                                                                    >
                                                                        Open Form
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </React.Fragment>
                                                ))}
                                                {filteredForms.length === 0 && (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-5">
                                                            <FeatherIcon icon="search" size={40} className="text-muted opacity-20 mb-3" />
                                                            <p className="text-muted">No forms match your search criteria.</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            ) : (
                                /* Active Form View */
                                <div className="p-4" style={{ backgroundColor: "#fff" }}>
                                    {SelectedForm ? (
                                        <SelectedForm
                                            patientData={{
                                                uhid: patient.uhid,
                                                name: patient.name,
                                                age: patient.age,
                                                gender: patient.gender,
                                                ipNo: patient.admissionNo,
                                                contact: patient.contact,
                                            }}
                                            onSubmit={handleFormSubmit}
                                        />
                                    ) : (
                                        <div className="text-center py-5">
                                            <div className="mb-4" style={{ color: "#eee" }}>
                                                <FeatherIcon icon="file-text" size={100} />
                                            </div>
                                            <h3 className="fw-bold mb-3" style={{ color: "#1a5b61ff" }}>{activeForm} Integration</h3>
                                            <p className="text-muted mx-auto" style={{ maxWidth: "500px" }}>
                                                This form is part of our comprehensive clinical suite. The specialized
                                                data entry fields for <strong>{activeForm}</strong> are being finalized for patient <strong>{patient.name}</strong>.
                                            </p>
                                            <div className="mt-4 d-flex justify-content-center gap-3">
                                                <Button variant="light" className="px-5 py-2 fw-bold border" onClick={() => setActiveForm(null)} style={{ borderRadius: "8px" }}>Back to index</Button>
                                                <Button variant="primary" className="px-5 py-2 fw-bold" style={{ backgroundColor: "#178aaeff", border: "none", borderRadius: "8px" }} onClick={() => handleFormSubmit({})}>Mock Submit</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Container>
            </div>
            <style>{`
        .custom-table tbody tr {
            transition: all 0.2s ease;
            border-bottom: 1px solid #f1f1f1;
        }
        .custom-table tbody tr:hover {
            background-color: #f9fdfd !important;
            transform: translateX(5px);
        }
        .custom-table th {
            letter-spacing: 0.5px;
            font-size: 0.85rem;
        }
        .custom-table td {
            padding: 10px 15px !important;
            font-size: 0.9rem;
        }
      `}</style>
        </div >
    );
}
