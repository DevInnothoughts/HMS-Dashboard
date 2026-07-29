import React from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";

const FollowUpCard = ({ followUpData, formData, handleFollowUpChange, onSaveFollowUp, onPrintFollowUp, loading, validationErrors = {} }) => {
  return (
    <div className="animate__animated animate__fadeIn">
      <div className="p-3 bg-white rounded shadow-sm border mb-3" style={{ borderLeft: "5px solid #00acc1" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0" style={{ color: "#00838f", padding: "5px", textTransform: "uppercase", letterSpacing: "1px", fontSize: "14px" }}>
            <FeatherIcon icon="calendar" size="18" className="me-2 text-info" />Patient Follow Up Tracking
          </h5>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={onPrintFollowUp}
            style={{ borderRadius: "20px", fontSize: "12px", fontWeight: "700", padding: "7px 15px" }}
          >
            <FeatherIcon icon="printer" size="13" className="me-1" /> PRINT
          </Button>
        </div>

        {/* Patient Reference Summary */}
        <div className="p-3 mb-4 rounded border" style={{ backgroundColor: "#f1fcfd", border: "2px solid #b2ebf2" }}>
          <Row className="g-3">
            {[
              { label: "UID No", value: formData.Uid_no },
              { label: "Patient Name", value: formData.name },
              { label: "Age / Sex", value: `${formData.age} yrs / ${formData.sex}` },
              { label: "Contact No", value: formData.phone },
              { label: "Email ID", value: formData.email },
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
          <Col md={4} className="mb-10">
            <Form.Label className="fw-bold mb-3" style={{ fontSize: "11px", color: "#006064" }}>Diagnosis</Form.Label>
            <Form.Control as="textarea" readOnly rows={1} value={followUpData.diagnosis} onChange={(e) => handleFollowUpChange("diagnosis", e.target.value)} placeholder="Duration" style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px", cursor: "not-allowed", backgroundColor: "#ebeceeff" }} />
          </Col>
          <Col md={4} className="mb-1">
            <Form.Label className="fw-bold mb-3" style={{ fontSize: "11px", color: "#006064" }}>Advice</Form.Label>
            <Form.Control as="textarea" readOnly rows={2} value={followUpData.advice} onChange={(e) => handleFollowUpChange("advice", e.target.value)} placeholder="Instructions for the patient..." style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px", cursor: "not-allowed", backgroundColor: "#ebeceeff" }} />
          </Col>
          <Col md={4} className="mb-1">
            <Form.Label className="fw-bold mb-3" style={{ fontSize: "11px", color: "#006064" }}>Treatment Plan</Form.Label>
            <Form.Control as="textarea" readOnly rows={2} value={followUpData.plan} onChange={(e) => handleFollowUpChange("plan", e.target.value)} placeholder="Next steps in treatment..." style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px", cursor: "not-allowed", backgroundColor: "#ebeceeff" }} />
          </Col>
          <Col md={4} className="mb-1">
            <Form.Label className="fw-bold mb-3" style={{ fontSize: "11px", color: "#006064" }}>Complaint History</Form.Label>
            <div
              style={{
                borderRadius: "10px",
                border: "2px solid #b2ebf2",
                fontSize: "12px",
                padding: "6px 12px",
                cursor: "not-allowed",
                backgroundColor: "#ebeceeff",
                minHeight: "100px",
                maxHeight: "150px",
                overflowY: "auto"
              }}
            >
              {followUpData.previous_complaints_text ? (
                (() => {
                  const today = new Date();
                  const d = String(today.getDate()).padStart(2, "0");
                  const m = String(today.getMonth() + 1).padStart(2, "0");
                  const y = today.getFullYear();
                  const today1 = `${d}-${m}-${y}`;
                  const today2 = `${y}-${m}-${d}`;

                  const filtered = followUpData.previous_complaints_text.split('\n\n').filter(line => {
                    const parts = line.split(" | ");
                    if (parts.length > 0) {
                      return !parts[0].includes(today1) && !parts[0].includes(today2);
                    }
                    return true;
                  });

                  if (filtered.length === 0) return "No previous complaints recorded.";

                  return filtered.map((line, i) => {
                    const parts = line.split(" | ");
                    if (parts.length >= 2) {
                      const prefixMatch = parts[0].match(/^(\d+\.\s+)(.*)$/);
                      if (prefixMatch) {
                        return (
                          <div key={i} style={{ marginBottom: i < filtered.length - 1 ? "10px" : "0", whiteSpace: "pre-line" }}>
                            <b>{prefixMatch[1]}{prefixMatch[2]} :</b> {parts.slice(1).join(" | ")}
                          </div>
                        );
                      }
                    }
                    return (
                      <div key={i} style={{ marginBottom: i < filtered.length - 1 ? "10px" : "0", whiteSpace: "pre-line" }}>
                        {line}
                      </div>
                    );
                  });
                })()
              ) : (
                "No previous complaints recorded."
              )}
            </div>
          </Col>
          <Col md={4} className="mb-1">
            <Form.Label className="fw-bold mb-3" style={{ fontSize: "11px", color: "#006064" }}>Present Complaints <span className="text-danger">*</span></Form.Label>
            <Form.Control as="textarea" rows={2} placeholder="Describe the present symptoms..." value={followUpData.present_complaints} onChange={(e) => handleFollowUpChange("present_complaints", e.target.value)} style={{ borderRadius: "10px", border: validationErrors.present_complaints ? "2px solid red" : "2px solid #b2ebf2", fontSize: "12px", padding: "6px 12px" }} />
          </Col>
          <Col md={2} className="mb-1">
            <Form.Label className="fw-bold mb-3" style={{ fontSize: "11px", color: "#006064" }}>First Visit Date</Form.Label>
            <Form.Control type="date" readOnly value={followUpData.first_visit_date} onChange={(e) => handleFollowUpChange("first_visit_date", e.target.value)} style={{ cursor: "not-allowed", backgroundColor: "#ebeceeff", borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          <Col md={2} className="mb-1">
            <Form.Label className="fw-bold mb-3" style={{ fontSize: "11px", color: "#006064" }}>Visit Number</Form.Label>
            <Form.Control type="number" value={followUpData.visit_count} onChange={(e) => handleFollowUpChange("visit_count", e.target.value)} readOnly style={{ cursor: "not-allowed", backgroundColor: "#ebeceeff", borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
        </Row>
      </div>
      <div className="text-center mb-5 pb-5 mt-4">
        <Button
          disabled={loading}
          onClick={onSaveFollowUp}
          style={{ backgroundColor: "#00acc1", borderColor: "#00acc1", padding: "10px 40px", borderRadius: "40px", fontWeight: "800", fontSize: "13px", boxShadow: "0 8px 25px rgba(0, 172, 193, 0.4)", textTransform: "uppercase", letterSpacing: "1px" }}
        >
          {loading ? "SAVING..." : <><FeatherIcon icon="save" size="18" className="me-2" />SAVE FOLLOW UP DATA</>}
        </Button>
      </div>
    </div>
  );
};

export default FollowUpCard;
