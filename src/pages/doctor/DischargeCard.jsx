import React from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";

const DischargeCard = ({ dischargeData, handleDischargeChange, handleDischargeInvestigationChange }) => {
  return (
    <div className="animate__animated animate__fadeIn">
      <style>{`
        .form-check-input {
          border: 1px solid black !important;
        }
      `}</style>
      <div className="p-3 bg-white rounded shadow-sm border mb-3" style={{ borderLeft: "5px solid #0097a7" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0" style={{ color: "#00838f", textTransform: "uppercase", letterSpacing: "1px", fontSize: "14px" }}>
            <FeatherIcon icon="log-out" size="18" className="me-2 text-info" />Inpatient Discharge Summary
          </h5>
        </div>

        <Row className="align-items-end g-2 mb-3">
          <Col md={3}>
            <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>Patient Name</Form.Label>
            <Form.Control 
              type="text" 
              value={dischargeData.patient_name} 
              readOnly 
              style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px", backgroundColor: "#f0fdfa" }} 
            />
          </Col>
          <Col md={3}>
            <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>Age & Sex</Form.Label>
            <Form.Control 
              type="text" 
              value={`${dischargeData.patient_age ? dischargeData.patient_age + 'Y' : ''} / ${dischargeData.patient_sex || ''}`} 
              readOnly 
              style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px", backgroundColor: "#f0fdfa" }} 
            />
          </Col>
          <Col md={3}>
            <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>Prescription Type<span className="text-danger">*</span></Form.Label>
            <Form.Select value={dischargeData.discharge_type} onChange={(e) => handleDischargeChange("discharge_type", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}>
              <option value="">Select Type</option>
              <option value="Proctology">Proctology</option>
              <option value="Urology">Urology</option>
              <option value="Gastroenterology">Gastroenterology</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <div className="px-4 py-2 rounded-pill bg-opacity-10 border border-info shadow-sm d-flex align-items-center justify-content-center h-100" style={{ backgroundColor: "rgba(0, 188, 212, 0.05)", minHeight: "38px" }}>
              <Form.Check 
                type="checkbox" 
                id="final-discharge-check"
                label={<span className="fw-bold text-info ms-1" style={{ fontSize: "11px", whiteSpace: "nowrap" }}>FINAL DISCHARGE CARD</span>} 
                checked={dischargeData.final_dc} 
                onChange={(e) => handleDischargeChange("final_dc", e.target.checked)} 
                className="d-flex align-items-center mb-0 gap-0"
              />
            </div>
          </Col>
        </Row>

        <Row className="g-2 mb-3">
          <Col md={6}>
            <div className="p-3 rounded-3 border bg-light h-100" style={{ borderLeft: "6px solid #00acc1" }}>
              <h6 className="fw-bold text-info mb-2" style={{ fontSize: '13px' }}><FeatherIcon icon="clock" size="14" className="me-2" /> Admission Details</h6>
              <Row className="g-2">
                <Col xs={7}>
                  <Form.Label className="fw-semibold" style={{ fontSize: "11px" }}>Date of Admission (DOA)</Form.Label>
                  <Form.Control type="date" value={dischargeData.doa} onChange={(e) => handleDischargeChange("doa", e.target.value)} style={{ borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }} />
                </Col>
                <Col xs={5}>
                  <Form.Label className="fw-semibold" style={{ fontSize: "11px" }}>Time</Form.Label>
                  <Form.Control type="time" value={dischargeData.admission_time} onChange={(e) => handleDischargeChange("admission_time", e.target.value)} style={{ borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }} />
                </Col>
              </Row>
            </div>
          </Col>
          <Col md={6}>
            <div className="p-3 rounded-3 border bg-light h-100" style={{ borderLeft: "6px solid #00838f" }}>
              <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '13px' }}><FeatherIcon icon="check-circle" size="14" className="me-2" /> Discharge Details</h6>
              <Row className="g-2">
                <Col xs={7}>
                  <Form.Label className="fw-semibold" style={{ fontSize: "11px" }}>Date of Discharge (DOD)</Form.Label>
                  <Form.Control type="date" value={dischargeData.dod} onChange={(e) => handleDischargeChange("dod", e.target.value)} style={{ borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }} />
                </Col>
                <Col xs={5}>
                  <Form.Label className="fw-semibold" style={{ fontSize: "11px" }}>Time</Form.Label>
                  <Form.Control type="time" value={dischargeData.discharge_time} onChange={(e) => handleDischargeChange("discharge_time", e.target.value)} style={{ borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }} />
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        <div className="p-3 bg-white border rounded mb-3 shadow-inner">
          <h6 className="fw-bold mb-3 text-muted text-center" style={{ fontSize: "11px", letterSpacing: '0.5px' }}>PATIENT CLINICAL VITALS AT DISCHARGE</h6>
          <Row className="text-center g-2">
            {[
              { label: "SPO2 %", value: dischargeData.spo2, key: "spo2", icon: "wind", color: "#0ea5e9" },
              { label: "BP (mmHg)", value: dischargeData.bp, key: "bp", icon: "activity", color: "#f43f5e" },
              { label: "Pulse (bpm)", value: dischargeData.pulse, key: "pulse", icon: "heart", color: "#ec4899" }
            ].map(vital => (
              <Col md={4} key={vital.key}>
                <div className="p-2 rounded-4 border bg-light">
                  <div className="d-flex align-items-center justify-content-center mb-1" style={{ color: vital.color }}>
                    <FeatherIcon icon={vital.icon} size="14" className="me-2" />
                    <span className="fw-bold" style={{ fontSize: '10px' }}>{vital.label}</span>
                  </div>
                  <Form.Control
                    type="text"
                    value={vital.value}
                    onChange={(e) => handleDischargeChange(vital.key, e.target.value)}
                    className="text-center fw-bold border-0 bg-transparent p-0"
                    style={{ fontSize: "16px", color: "#374151" }}
                  />
                </div>
              </Col>
            ))}
          </Row>
        </div>

        <Row className="g-3">
          <Col md={12}>
            <Form.Label className="fw-bold ms-1" style={{ fontSize: "11px" }}>Reason for Admission & Chief Complaints</Form.Label>
            <Form.Control as="textarea" rows={2} value={dischargeData.reason_for_admission} onChange={(e) => handleDischargeChange("reason_for_admission", e.target.value)} placeholder="Summary of clinical presentation..." style={{ borderRadius: "10px", border: "2px solid #e0f2f1", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          <Col md={12}>
            <Form.Label className="fw-bold ms-1" style={{ fontSize: "11px" }}>Medical History / Past Procedures</Form.Label>
            <Form.Control as="textarea" rows={2} value={dischargeData.medical_history} onChange={(e) => handleDischargeChange("medical_history", e.target.value)} placeholder="Relevant past medical details..." style={{ borderRadius: "10px", border: "2px solid #e0f2f1", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          <Col md={12}>
            <Form.Label className="fw-bold ms-1" style={{ fontSize: "11px" }}>Hospital Course & Plan of Treatment</Form.Label>
            <Form.Control as="textarea" rows={2} value={dischargeData.plan_of_treatment} onChange={(e) => handleDischargeChange("plan_of_treatment", e.target.value)} placeholder="Chronological summary of hospital stay..." style={{ borderRadius: "10px", border: "2px solid #e0f2f1", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          <Col md={12}>
            <Form.Label className="fw-bold ms-1" style={{ fontSize: "11px" }}>Final Clinical Diagnosis</Form.Label>
            <Form.Control as="textarea" rows={2} value={dischargeData.diagnosis} onChange={(e) => handleDischargeChange("diagnosis", e.target.value)} placeholder="Conclusion at the time of discharge..." style={{ borderRadius: "10px", border: "2px solid #e0f2f1", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
        </Row>

        <hr className="my-3" style={{ opacity: '0.1' }} />

        <h6 className="fw-bold mb-3 ms-1" style={{ color: "#006064", fontSize: '13px' }}><FeatherIcon icon="layers" size="16" className="me-2 text-info" /> Laboratory Investigations Summary</h6>
        <div className="p-3 border-0 rounded-4 mb-3" style={{ backgroundColor: "#fcfdfe", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.03)" }}>
          <Row className="g-2">
            {Object.keys(dischargeData.investigations).map(field => (
              <Col md={3} key={field}>
                <div className="p-2 border rounded-3 bg-white shadow-sm">
                  <Form.Label className="fw-bold text-muted mb-1" style={{ fontSize: "9px", textTransform: "uppercase", display: 'block' }}>{field}</Form.Label>
                  <Form.Control size="sm" type="text" value={dischargeData.investigations[field]} onChange={(e) => handleDischargeInvestigationChange(field, e.target.value)} className="border-0 p-0 fw-bold" style={{ fontSize: "11px", color: "#006064", minHeight: 'auto' }} />
                </div>
              </Col>
            ))}
          </Row>
        </div>

        <Col md={12} className="mt-2">
          <div className="p-3 rounded-4 border shadow-sm" style={{ backgroundColor: "#fffbeb", borderColor: "#fef3c7", borderLeft: "6px solid #fbbf24" }}>
            <h6 className="fw-bold mb-2" style={{ color: "#92400e", fontSize: "13px" }}><FeatherIcon icon="alert-circle" size="16" className="me-2" /> Discharge Notes & Advice</h6>
            <Form.Control as="textarea" rows={3} value={dischargeData.note_advice} onChange={(e) => handleDischargeChange("note_advice", e.target.value)} placeholder="Dietary restrictions, warning signs..." style={{ borderRadius: "12px", border: "1px solid #fde68a", padding: "6px 12px", fontSize: "12px" }} />
          </div>
        </Col>
      </div>

      <div className="text-center mb-5 pb-5 mt-4">
        <Button style={{ backgroundColor: "#00838f", borderColor: "#00838f", padding: "10px 40px", borderRadius: "50px", fontWeight: "800", fontSize: "13px", boxShadow: "0 10px 30px rgba(0, 131, 143, 0.3)", textTransform: "uppercase", letterSpacing: "1px" }}>
          <FeatherIcon icon="check-square" size="18" className="me-2" /> FINALIZE DISCHARGE SUMMARY
        </Button>
      </div>
    </div>
  );
};

export default DischargeCard;
