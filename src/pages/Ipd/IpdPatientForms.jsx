import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, InputGroup, Button } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import PageBreadcrumb from "../../components/PageBreadcrumb";

import AdmissionChecklist from "./IPD Forms/forms/AdmissionChecklist";
import AdmissionDetailsForm from "./IPD Forms/forms/AdmissionDetailsForm";
import AdverseDrugCorrectiveActionForm from "./IPD Forms/forms/AdverseDrugCorrectiveActionForm";
import AdverseDrugReportForm from "./IPD Forms/forms/AdverseDrugReportForm";
import AnesthesiaConsentForm from "./IPD Forms/forms/AnesthesiaConsentForm";
import AnesthesiaRecordForm from "./IPD Forms/forms/AnesthesiaRecordForm";
import BloodTransfusionFrontForm from "./IPD Forms/forms/BloodTransfusionFrontForm";
import BloodTransfusionRecordForm from "./IPD Forms/forms/BloodTransfusionRecordForm";
import BradenScoreForm from "./IPD Forms/forms/BradenScoreForm";
import CPRSheetBackForm from "./IPD Forms/forms/CPRSheetBackForm";
import CPRSheetForm from "./IPD Forms/forms/CPRSheetForm";
import CaseSheetForm from "./IPD Forms/forms/CaseSheetForm";
import DVTWellsScoreForm from "./IPD Forms/forms/DVTWellsScoreForm";
import EstimatedCostForm from "./IPD Forms/forms/EstimatedCostForm";
import GeneralConsentForm from "./IPD Forms/forms/GeneralConsentForm";
import InitialAssessmentForm from "./IPD Forms/forms/InitialAssessmentForm";
import InitialNursingCarePlanForm from "./IPD Forms/forms/InitialNursingCarePlanForm";
import IpdClearanceForm from "./IPD Forms/forms/IpdClearanceForm";
import MedicationChartForm from "./IPD Forms/forms/MedicationChartForm";
import MedicationTherapyExtendedForm from "./IPD Forms/forms/MedicationTherapyExtendedForm";
import MedicationTherapyForm from "./IPD Forms/forms/MedicationTherapyForm";
import NursingFlowChartForm from "./IPD Forms/forms/NursingFlowChartForm";
import NursingInitialAssessmentFallRiskForm from "./IPD Forms/forms/NursingInitialAssessmentFallRiskForm";
import NursingInitialAssessmentForm from "./IPD Forms/forms/NursingInitialAssessmentForm";
import NursingNotesForm from "./IPD Forms/forms/NursingNotesForm";
import NursingReassessmentCarePlanForm from "./IPD Forms/forms/NursingReassessmentCarePlanForm";
import NutritionalAssessmentForm from "./IPD Forms/forms/NutritionalAssessmentForm";
import NutritionalReassessmentForm from "./IPD Forms/forms/NutritionalReassessmentForm";
import OTNotesForm from "./IPD Forms/forms/OTNotesForm";
import OperativeNotesForm from "./IPD Forms/forms/OperativeNotesForm";
import PatientTransferForm from "./IPD Forms/forms/PatientTransferForm";
import PhysicianAssessmentForm from "./IPD Forms/forms/PhysicianAssessmentForm";
import PostAnesthesiaRecoveryForm from "./IPD Forms/forms/PostAnesthesiaRecoveryForm";
import PostOperativeAdviceForm from "./IPD Forms/forms/PostOperativeAdviceForm";
import PreAnesthesiaCheckupForm from "./IPD Forms/forms/PreAnesthesiaCheckupForm";
import PreOpOrderForm from "./IPD Forms/forms/PreOpOrderForm";
import ProgressNotesForm from "./IPD Forms/forms/ProgressNotesForm";
import ProgressSheetForm from "./IPD Forms/forms/ProgressSheetForm";
import ScoreMappingSheetForm from "./IPD Forms/forms/ScoreMappingSheetForm";
import SurgeryConsentForm from "./IPD Forms/forms/SurgeryConsentForm";
import TimeOutSheetForm from "./IPD Forms/forms/TimeOutSheetForm";
import WHOSignInForm from "./IPD Forms/forms/WHOSignInForm";
import WHOSignOutForm from "./IPD Forms/forms/WHOSignOutForm";
import WHOSurgicalSafetyChecklist from "./IPD Forms/forms/WHOSurgicalSafetyChecklist";
import WHOTimeOutForm from "./IPD Forms/forms/WHOTimeOutForm";

const IPD_FORMS_LIST = [
  { name: "Admission Checklist", key: "AdmissionChecklist" },
  { name: "Admission Details Form", key: "AdmissionDetailsForm" },
  { name: "Adverse Drug Corrective Action Form", key: "AdverseDrugCorrectiveActionForm" },
  { name: "Adverse Drug Report Form", key: "AdverseDrugReportForm" },
  { name: "Anesthesia Consent Form", key: "AnesthesiaConsentForm" },
  { name: "Anesthesia Record Form", key: "AnesthesiaRecordForm" },
  { name: "Blood Transfusion Front Form", key: "BloodTransfusionFrontForm" },
  { name: "Blood Transfusion Record Form", key: "BloodTransfusionRecordForm" },
  { name: "Braden Score Form", key: "BradenScoreForm" },
  { name: "CPR Sheet Back Form", key: "CPRSheetBackForm" },
  { name: "CPR Sheet Form", key: "CPRSheetForm" },
  { name: "Case Sheet Form", key: "CaseSheetForm" },
  { name: "DVT Wells Score Form", key: "DVTWellsScoreForm" },
  { name: "Estimated Cost Form", key: "EstimatedCostForm" },
  { name: "General Consent Form", key: "GeneralConsentForm" },
  { name: "Initial Assessment Form", key: "InitialAssessmentForm" },
  { name: "Initial Nursing Care Plan Form", key: "InitialNursingCarePlanForm" },
  { name: "Ipd Clearance Form", key: "IpdClearanceForm" },
  { name: "Medication Chart Form", key: "MedicationChartForm" },
  { name: "Medication Therapy Extended Form", key: "MedicationTherapyExtendedForm" },
  { name: "Medication Therapy Form", key: "MedicationTherapyForm" },
  { name: "Nursing Flow Chart Form", key: "NursingFlowChartForm" },
  { name: "Nursing Initial Assessment Fall Risk Form", key: "NursingInitialAssessmentFallRiskForm" },
  { name: "Nursing Initial Assessment Form", key: "NursingInitialAssessmentForm" },
  { name: "Nursing Notes Form", key: "NursingNotesForm" },
  { name: "Nursing Reassessment Care Plan Form", key: "NursingReassessmentCarePlanForm" },
  { name: "Nutritional Assessment Form", key: "NutritionalAssessmentForm" },
  { name: "Nutritional Reassessment Form", key: "NutritionalReassessmentForm" },
  { name: "OT Notes Form", key: "OTNotesForm" },
  { name: "Operative Notes Form", key: "OperativeNotesForm" },
  { name: "Patient Transfer Form", key: "PatientTransferForm" },
  { name: "Physician Assessment Form", key: "PhysicianAssessmentForm" },
  { name: "Post Anesthesia Recovery Form", key: "PostAnesthesiaRecoveryForm" },
  { name: "Post Operative Advice Form", key: "PostOperativeAdviceForm" },
  { name: "Pre Anesthesia Checkup Form", key: "PreAnesthesiaCheckupForm" },
  { name: "Pre Op Order Form", key: "PreOpOrderForm" },
  { name: "Progress Notes Form", key: "ProgressNotesForm" },
  { name: "Progress Sheet Form", key: "ProgressSheetForm" },
  { name: "Score Mapping Sheet Form", key: "ScoreMappingSheetForm" },
  { name: "Surgery Consent Form", key: "SurgeryConsentForm" },
  { name: "Time Out Sheet Form", key: "TimeOutSheetForm" },
  { name: "WHO Sign In Form", key: "WHOSignInForm" },
  { name: "WHO Sign Out Form", key: "WHOSignOutForm" },
  { name: "WHO Surgical Safety Checklist", key: "WHOSurgicalSafetyChecklist" },
  { name: "WHO Time Out Form", key: "WHOTimeOutForm" }
];

const formComponents = {
  AdmissionChecklist,
  AdmissionDetailsForm,
  AdverseDrugCorrectiveActionForm,
  AdverseDrugReportForm,
  AnesthesiaConsentForm,
  AnesthesiaRecordForm,
  BloodTransfusionFrontForm,
  BloodTransfusionRecordForm,
  BradenScoreForm,
  CPRSheetBackForm,
  CPRSheetForm,
  CaseSheetForm,
  DVTWellsScoreForm,
  EstimatedCostForm,
  GeneralConsentForm,
  InitialAssessmentForm,
  InitialNursingCarePlanForm,
  IpdClearanceForm,
  MedicationChartForm,
  MedicationTherapyExtendedForm,
  MedicationTherapyForm,
  NursingFlowChartForm,
  NursingInitialAssessmentFallRiskForm,
  NursingInitialAssessmentForm,
  NursingNotesForm,
  NursingReassessmentCarePlanForm,
  NutritionalAssessmentForm,
  NutritionalReassessmentForm,
  OTNotesForm,
  OperativeNotesForm,
  PatientTransferForm,
  PhysicianAssessmentForm,
  PostAnesthesiaRecoveryForm,
  PostOperativeAdviceForm,
  PreAnesthesiaCheckupForm,
  PreOpOrderForm,
  ProgressNotesForm,
  ProgressSheetForm,
  ScoreMappingSheetForm,
  SurgeryConsentForm,
  TimeOutSheetForm,
  WHOSignInForm,
  WHOSignOutForm,
  WHOSurgicalSafetyChecklist,
  WHOTimeOutForm
};

export default function IpdPatientForms() {
  const navigate = useNavigate();
  const location = useLocation();
  const rawPatient = location.state?.patient;

  const patientData = useMemo(() => {
    if (!rawPatient) return null;
    return {
      uhid: rawPatient.Uid_no || rawPatient.uid_no || rawPatient.patient_id || "",
      name: rawPatient.patientName || rawPatient.name || "",
      age: rawPatient.age || "",
      sex: rawPatient.sex || "",
      phone: rawPatient.phone || "",
      address: rawPatient.address || "",
      adm_no: rawPatient.adm_no || rawPatient.admissionNo || "",
      roomType: rawPatient.roomType || "",
      surgeonName: rawPatient.surgeonName || "",
      sxPlan: rawPatient.sxPlan || ""
    };
  }, [rawPatient]);

  const [selectedFormKey, setSelectedFormKey] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedFormKeys, setSubmittedFormKeys] = useState([]);

  useEffect(() => {
    if (patientData?.uhid) {
      const saved = localStorage.getItem(`ipd_submitted_forms_${patientData.uhid}`);
      setSubmittedFormKeys(saved ? JSON.parse(saved) : []);
    } else {
      setSubmittedFormKeys([]);
    }
  }, [patientData?.uhid]);

  const handleFormSubmit = () => {
    if (selectedFormKey && patientData?.uhid) {
      const updatedKeys = [...new Set([...submittedFormKeys, selectedFormKey])];
      setSubmittedFormKeys(updatedKeys);
      localStorage.setItem(`ipd_submitted_forms_${patientData.uhid}`, JSON.stringify(updatedKeys));
    }
    setSelectedFormKey(null);
  };

  const filteredForms = useMemo(() => {
    return IPD_FORMS_LIST.filter(form =>
      form.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const SelectedFormComponent = selectedFormKey ? formComponents[selectedFormKey] : null;

  if (!patientData) {
    return (
      <div className="p-4 text-center">
        <h4>No Patient Data Found</h4>
        <Button onClick={() => navigate(-1)} className="mt-3">Go Back</Button>
      </div>
    );
  }

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        fontFamily: "'Poppins', Arial, sans-serif",
        minHeight: "100vh",
        padding: "15px",
      }}
    >
      <div className="mb-3">
        <PageBreadcrumb pagename="IPD Patient Forms" />
      </div>

      {/* Patient Information Banner */}
      <Card
        style={{
          borderRadius: "12px",
          border: "1.5px solid #00bcd4",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          background: "linear-gradient(to right, #00838f, #00838f)",
          color: "#fff",
          marginBottom: "10px",
          padding: "5px 10px"
        }}
      >
        <Card.Body className="p-1">
          <Row className="gy-2 align-items-center">
            {/* Back Button */}
            <Col xs={12} md={2} className="border-end border-white-50 d-flex align-items-center justify-content-start ps-3">
              <Button
                onClick={() => navigate(-1)}
                style={{
                  borderRadius: "6px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  height: "30px",
                  gap: "4px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e0f7fa",
                  color: "#ffffffff",
                  padding: "5px 12px",
                  fontSize: "11px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}
              >
                <FeatherIcon icon="arrow-left" size="13" />
                Back to Patient List
              </Button>
            </Col>

            {/* Patient Name / UHID */}
            <Col xs={12} md={4} className="border-end border-white-50 ps-4">
              <div style={{ fontSize: "11px", opacity: 0.8, textTransform: "uppercase" }}>Patient Name & UID No</div>
              <div style={{ fontWeight: "700", fontSize: "13px", lineHeight: "1.2" }}>{patientData.name} - {patientData.uhid}</div>
            </Col>

            {/* Admission Number */}
            <Col xs={6} md={3} className="border-end border-white-50 ps-4">
              <div style={{ fontSize: "11px", opacity: 0.8, textTransform: "uppercase" }}>Admission No</div>
              <strong style={{ fontSize: "13px", display: "block", fontWeight: "700" }}>{patientData.adm_no || "N/A"}</strong>
            </Col>

            {/* Surgeon Name & SX Plan */}
            <Col xs={6} md={3} className="ps-4">
              <div style={{ fontSize: "11px", opacity: 0.8, textTransform: "uppercase" }}>Surgeon Name & Plan</div>
              <strong style={{ fontSize: "13px", display: "block", fontWeight: "700" }}>{patientData.surgeonName} - {patientData.sxPlan}</strong>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-3">
        {/* Left Forms list pane */}
        <Col md={4} lg={3}>
          <Card
            style={{
              borderRadius: "12px",
              border: "1.5px solid #00bcd4",
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
              background: "#fff",
              height: "calc(100vh - 165px)",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <Card.Header style={{ backgroundColor: "#e0f7fa", borderBottom: "1.5px solid #00bcd4", borderRadius: "11px 11px 0 0", padding: "16px 10px" }}>
              <InputGroup size="sm">
                <InputGroup.Text style={{ backgroundColor: "#fff", borderColor: "#80deea", padding: "10px 8px" }}>
                  <FeatherIcon icon="search" size="14" style={{ color: "#00838f" }} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search form..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ borderColor: "#80deea", borderLeft: "none", fontSize: "12px", padding: "3px 8px" }}
                />
              </InputGroup>
            </Card.Header>
            <Card.Body className="p-0" style={{ overflowY: "auto", flex: 1 }}>
              <div className="list-group list-group-flush">
                {filteredForms.map((form) => {
                  const isActive = selectedFormKey === form.key;
                  const isSubmitted = submittedFormKeys.includes(form.key);
                  return (
                    <button
                      key={form.key}
                      onClick={() => setSelectedFormKey(form.key)}
                      className="list-group-item list-group-item-action border-0 px-3 py-5 d-flex align-items-center justify-content-between"
                      style={{
                        fontSize: "13px",
                        fontWeight: isActive ? "600" : "500",
                        color: isActive ? "#fff" : "#006064",
                        backgroundColor: isActive ? "#00acc1" : "transparent",
                        transition: "all 0.2s ease",
                        borderBottom: "1px solid #f1f8f9"
                      }}
                    >
                      <div className="d-flex align-items-center">
                        {isSubmitted ? (
                          <FeatherIcon
                            icon="check-circle"
                            size="16"
                            className="me-2"
                            style={{ color: isActive ? "#fff" : "#2e7d32" }}
                          />
                        ) : (
                          <FeatherIcon
                            icon="circle"
                            size="16"
                            className="me-2"
                            style={{ color: isActive ? "#fff" : "#00acc1", opacity: 0.6 }}
                          />
                        )}
                        <span>{form.name}</span>
                      </div>
                      {isActive && <FeatherIcon icon="chevron-right" size="14" style={{ color: "#fff" }} />}
                    </button>
                  );
                })}
                {filteredForms.length === 0 && (
                  <div className="text-center py-4 text-muted" style={{ fontSize: "12px" }}>
                    No matching forms found.
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Active Form pane */}
        <Col md={8} lg={9}>
          <Card
            style={{
              borderRadius: "12px",
              border: "1.5px solid #00bcd4",
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
              background: "#fff",
              height: "calc(100vh - 165px)",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <Card.Header
              style={{
                backgroundColor: "#e0f7fa",
                borderBottom: "1.5px solid #00bcd4",
                borderRadius: "11px 11px 0 0",
                fontWeight: "600",
                color: "#006064",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "21.5px 10px"
              }}
            >
              <span>
                {selectedFormKey
                  ? IPD_FORMS_LIST.find((f) => f.key === selectedFormKey)?.name
                  : "IPD Forms Viewer"}
              </span>
              {selectedFormKey && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setSelectedFormKey(null)}
                  style={{ fontSize: "11px", borderRadius: "5px", padding: "6px 8px" }}
                >
                  Clear Selection
                </Button>
              )}
            </Card.Header>
            <Card.Body style={{ overflowY: "auto", flex: 1, padding: "20px" }}>
              {selectedFormKey && SelectedFormComponent ? (
                <SelectedFormComponent
                  patientData={patientData}
                  onSubmit={handleFormSubmit}
                />
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted py-5">
                  <FeatherIcon icon="file-text" size="48" style={{ color: "#b2ebf2", marginBottom: "15px" }} />
                  <h5>No Form Selected</h5>
                  <p style={{ fontSize: "13px" }}>Please select an IPD form from the sidebar list to view, fill, and submit it.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
