import React from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";

const FollowUpCard = ({ followUpData, formData, handleFollowUpChange, onSaveFollowUp, loading }) => {
  return (
    <div className="animate__animated animate__fadeIn">
      <div className="p-3 bg-white rounded shadow-sm border mb-3" style={{ borderLeft: "5px solid #00acc1" }}>
        <h5 className="fw-bold mb-3" style={{ color: "#00838f", textTransform: "uppercase", letterSpacing: "1px", fontSize: "14px" }}>
          <FeatherIcon icon="calendar" size="18" className="me-2 text-info" />Patient Follow Up Tracking
        </h5>

        {/* Patient Reference Summary */}
        <div className="p-3 mb-4 rounded border" style={{ backgroundColor: "#f1fcfd", border: "2px solid #b2ebf2" }}>
          <Row className="g-3">
            {[
              { label: "UID Number", value: formData.Uid_no },
              { label: "Patient Name", value: formData.name },
              { label: "Age / Sex", value: `${formData.age} yrs / ${formData.sex}` },
              { label: "Contact", value: formData.phone },
              { label: "Email", value: formData.email },
              { label: "Occupation", value: formData.occupation },
              { label: "Reference", value: formData.ref, type: formData.reference_type },
              { label: "Address", value: formData.address }
            ].map((item, idx) => (
              <Col md={3} key={idx} className="mb-2">
                <div className="mb-1" style={{ fontSize: "11px", color: "#006064", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>
                  {item.label} {item.type ? `(${item.type.replace("_", " ")})` : ""}
                </div>
                <div className="fw-bold text-dark" style={{ fontSize: "13px" }}>
                  {item.value ? (
                    item.label === "Reference" && item.value.includes(",") ? (
                      <ul className="list-unstyled mb-0" style={{ lineHeight: "1.2" }}>
                        {item.value.split(",").map((line, i) => (
                          <li key={i}>{line.trim()}</li>
                        ))}
                      </ul>
                    ) : item.value
                  ) : "-"}
                </div>
              </Col>
            ))}
          </Row>
        </div>

        <Row>
          <Col md={6} className="mb-3">
            <Form.Label className="fw-bold" style={{ fontSize: "13px", color: "#006064" }}>Diagnosis</Form.Label>
            <Form.Control as="textarea" rows={1} value={followUpData.diagnosis} onChange={(e) => handleFollowUpChange("diagnosis", e.target.value)} placeholder="Duration" style={{ borderRadius: "8px", border: "2px solid #80deea", padding: "8px 12px", fontSize: "13px" }} />
          </Col>
          <Col md={6} className="mb-3">
            <Form.Label className="fw-bold" style={{ fontSize: "13px", color: "#006064" }}>Advice</Form.Label>
            <Form.Control as="textarea" rows={2} value={followUpData.advice} onChange={(e) => handleFollowUpChange("advice", e.target.value)} placeholder="Instructions for the patient..." style={{ borderRadius: "8px", border: "2px solid #80deea", padding: "8px 12px", fontSize: "13px" }} />
          </Col>
          <Col md={6} className="mb-3">
            <Form.Label className="fw-bold" style={{ fontSize: "13px", color: "#006064" }}>Plan</Form.Label>
            <Form.Control as="textarea" rows={2} value={followUpData.plan} onChange={(e) => handleFollowUpChange("plan", e.target.value)} placeholder="Next steps in treatment..." style={{ borderRadius: "8px", border: "2px solid #80deea", padding: "8px 12px", fontSize: "13px" }} />
          </Col>
          <Col md={6} className="mb-1">
            <Form.Label className="fw-bold" style={{ fontSize: "13px", color: "#006064" }}>Present Complaints</Form.Label>
            <Form.Control as="textarea" rows={2} placeholder="Describe the present symptoms..." value={followUpData.present_complaints} onChange={(e) => handleFollowUpChange("present_complaints", e.target.value)} style={{ borderRadius: "8px", border: "2px solid #80deea", fontSize: "13px", padding: "8px 12px" }} />
          </Col>
          <Col md={6} className="mb-3">
            <Form.Label className="fw-bold" style={{ fontSize: "13px", color: "#006064" }}>First Visit Date</Form.Label>
            <Form.Control type="date" value={followUpData.first_visit_date} onChange={(e) => handleFollowUpChange("first_visit_date", e.target.value)} style={{ borderRadius: "8px", border: "2px solid #b2ebf2", padding: "8px 12px", fontSize: "13px" }} />
          </Col>
          <Col md={6} className="mb-3">
            <Form.Label className="fw-bold" style={{ fontSize: "13px", color: "#006064" }}>Follow Up Visit No</Form.Label>
            <Form.Control type="number" value={followUpData.visit_count} onChange={(e) => handleFollowUpChange("visit_count", e.target.value)} style={{ borderRadius: "8px", border: "2px solid #b2ebf2", padding: "8px 12px", fontSize: "13px" }} />
          </Col>
        </Row>
      </div>
      <div className="text-center mb-5 pb-5 mt-4">
        <Button 
          disabled={loading}
          onClick={onSaveFollowUp}
          style={{ backgroundColor: "#00acc1", borderColor: "#00acc1", padding: "10px 40px", borderRadius: "40px", fontWeight: "800", fontSize: "13px", boxShadow: "0 8px 25px rgba(0, 172, 193, 0.4)", textTransform: "uppercase", letterSpacing: "1px" }}
        >
          {loading ? "Saving..." : <><FeatherIcon icon="save" size="18" className="me-2" /> RECORD FOLLOW UP DATA</>}
        </Button>
      </div>
    </div>
  );
};

export default FollowUpCard;
