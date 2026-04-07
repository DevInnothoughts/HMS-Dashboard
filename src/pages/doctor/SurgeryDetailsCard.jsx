import React from "react";
import { Row, Col, Form, Button, Dropdown } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";

const SurgeryDetailsCard = ({
  surgeryData,
  handleSurgeryChange,
  handleSurgeryCheckboxChange,
  previousSurgeryList = [],
  selectedSurgeryId = null,
  onSelectSurgery,
  onNewSurgery,
  onSaveSurgery,
  loading = false,
  assistanceDoctors = [],
  doctors = []
}) => {



  return (
    <div className="animate__animated animate__fadeIn">
      <style>{`
        .form-check-input {
          border: 1px solid black !important;
        }
      `}</style>
      <div className="p-3 bg-white rounded shadow-sm border mb-3" style={{ borderLeft: "5px solid #00bcd4" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0" style={{ color: "#00838f", textTransform: "uppercase", letterSpacing: "1px", fontSize: "14px" }}>
            <FeatherIcon icon="scissors" size="18" className="me-2 text-info" />Surgical Procedure & Clinical Records
          </h5>
          <div className="d-flex gap-2">
            <Button
              variant="outline-info"
              size="sm"
              onClick={onNewSurgery}
              style={{ borderRadius: "20px", fontSize: "11px", fontWeight: "700" }}
            >
              <FeatherIcon icon="plus" size="14" className="me-1" /> NEW RECORD
            </Button>
            <Dropdown onSelect={onSelectSurgery}>
              <Dropdown.Toggle
                variant="info"
                id="previous-surg-dropdown"
                size="sm"
                style={{ borderRadius: "20px", fontSize: "11px", fontWeight: "700", color: "white" }}
              >
                <FeatherIcon icon="calendar" size="14" className="me-1" /> PREVIOUS DATES
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ fontSize: "12px", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                {previousSurgeryList.length > 0 ? (
                  previousSurgeryList.map((s) => (
                    <Dropdown.Item key={s.id} eventKey={s.id}>
                      {s.date} {s.id === selectedSurgeryId && <FeatherIcon icon="check" size="12" className="ms-2 text-success" />}
                    </Dropdown.Item>
                  ))
                ) : (
                  <Dropdown.Item disabled>No previous records</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <Row className="mb-3 g-2">
          <Col md={4}>
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Date Of Admission</Form.Label>
            <Form.Control type="date" value={surgeryData.admission_date} onChange={(e) => handleSurgeryChange("admission_date", e.target.value)} style={{ borderRadius: "10px", border: "1px solid #b2ebf2", padding: "4px 10px", fontSize: "12px" }} />
          </Col>
          <Col md={4}>
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Date Of Surgery</Form.Label>
            <Form.Control type="date" value={surgeryData.surgery_date} onChange={(e) => handleSurgeryChange("surgery_date", e.target.value)} style={{ borderRadius: "10px", border: "1px solid #b2ebf2", padding: "4px 10px", fontSize: "12px" }} />
          </Col>
          <Col md={4}>
            <div className="p-2 border rounded-3 h-100 d-flex flex-column justify-content-center align-items-center text-center" style={{ backgroundColor: "#fff5f5", borderColor: "#ffcdd2" }}>
              <Form.Label className="fw-bold text-danger mb-1 w-200" style={{ fontSize: "13px" }}>High Risk Consent?</Form.Label>
              <div className="d-flex gap-3 pt-0 justify-content-center w-200">
                <Form.Check type="radio" label={<span className="fw-bold" style={{ fontSize: "12px" }}>YES</span>} name="risk_consent" checked={surgeryData.risk_consent === "Yes"} onChange={() => handleSurgeryChange("risk_consent", "Yes")} />
                <Form.Check type="radio" label={<span className="fw-bold" style={{ fontSize: "12px" }}>NO</span>} name="risk_consent" checked={surgeryData.risk_consent === "No"} onChange={() => handleSurgeryChange("risk_consent", "No")} />
              </div>
            </div>
          </Col>
        </Row>

        <Row className="mb-3 g-2">
          <Col md={6}>
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Assistance Doctor</Form.Label>
            <Form.Select value={surgeryData.assistance_doctor} onChange={(e) => handleSurgeryChange("assistance_doctor", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}>
              <option value="">Select Assistance Doctor</option>
              {assistanceDoctors.map((doc) => (
                <option key={doc.doctor_id} value={doc.doctor_id}>
                  {doc.name}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={6}>
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Anaesthetist</Form.Label>
            <Form.Select value={surgeryData.anaesthetist} onChange={(e) => handleSurgeryChange("anaesthetist", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}>
              <option value="">Select Anaesthetist</option>
              {doctors.map((doc) => (
                <option key={doc.doctor_id} value={doc.doctor_id}>
                  {doc.name}
                </option>
              ))}
            </Form.Select>
          </Col>

        </Row>
        <div className="p-2 px-3 rounded border mb-3 d-flex align-items-center gap-4 flex-wrap" style={{ margin: "5px", backgroundColor: "#f0f9ff", borderColor: "#bae6fd" }}>
          <Form.Label className="fw-bold mb-0" style={{ color: "#0369a1", fontSize: "13px", whiteSpace: "nowrap", padding: "6px" }}>Type of Anesthesia Administered:</Form.Label>
          <div className="d-flex flex-wrap gap-4 align-items-center mb-0 flex-grow-1">
            {["LA", "SA", "GA"].map(type => (
              <Form.Check key={type} label={<span className="fw-bold" style={{ fontSize: "13px", color: "#0c4a6e" }}>{type}</span>} checked={surgeryData.anesthesia.includes(type)} onChange={() => handleSurgeryCheckboxChange(type)} />
            ))}
            <div className="flex-grow-1" style={{ maxWidth: "350px" }}>
              <Form.Control type="text" placeholder="Specify other type..." value={surgeryData.anesthesia_other} onChange={(e) => handleSurgeryChange("anesthesia_other", e.target.value)} style={{ borderRadius: "8px", border: "1px solid #7dd3fc", padding: "4px 10px", fontSize: "12px" }} />
            </div>
          </div>
        </div>

        <Row className="g-3">
          <Col md={12}>
            <div className="p-3 border rounded shadow-inner" style={{ backgroundColor: "#fdfcf9", borderLeft: "5px solid #d97706" }}>
              <h6 className="fw-bold mb-2" style={{ color: "#92400e", fontSize: "13px" }}><FeatherIcon icon="crosshair" size="16" className="me-2" />Surgery Procedure Plan & Diagnosis</h6>
              <Row className="g-2">
                <Col md={6}>
                  <Form.Label className="fw-semibold mb-1" style={{ fontSize: "11px" }}>Surgery Plan</Form.Label>
                  <Form.Control as="textarea" rows={2} placeholder="Detailed steps..." value={surgeryData.surgery_remarks} onChange={(e) => handleSurgeryChange("surgery_remarks", e.target.value)} style={{ borderRadius: "10px", border: "1px solid #fde68a", padding: "6px 12px", fontSize: "12px" }} />
                </Col>
                <Col md={6}>
                  <Form.Label className="fw-semibold mb-1" style={{ fontSize: "11px" }}>Plan-Diagnosis</Form.Label>
                  <Form.Control as="textarea" rows={2} placeholder="diagnosis..." value={surgeryData.plan} onChange={(e) => handleSurgeryChange("plan", e.target.value)} style={{ borderRadius: "10px", border: "1px solid #fde68a", padding: "6px 12px", fontSize: "12px" }} />
                </Col>
              </Row>
            </div>
          </Col>
          <Col md={12}>
            <div className="p-3 border rounded shadow-inner" style={{ backgroundColor: "#f9fafb", borderLeft: "5px solid #4b5563" }}>
              <h6 className="fw-bold mb-2" style={{ color: "#1f2937", fontSize: "13px" }}><FeatherIcon icon="edit-3" size="16" className="me-2" />Intra-Operative Notes & Post-Op Comments</h6>
              <Row className="g-2">
                <Col md={6}>
                  <Form.Label className="fw-semibold mb-1" style={{ fontSize: "11px" }}>Surgery Notes</Form.Label>
                  <Form.Control as="textarea" rows={2} placeholder="Observations..." value={surgeryData.surgery_note} onChange={(e) => handleSurgeryChange("surgery_note", e.target.value)} style={{ borderRadius: "10px", border: "1px solid #d1d5db", padding: "6px 12px", fontSize: "12px" }} />
                </Col>
                <Col md={6}>
                  <Form.Label className="fw-semibold mb-1" style={{ fontSize: "11px" }}>Additional Comments (If Any)</Form.Label>
                  <Form.Control as="textarea" rows={2} placeholder="Comments..." value={surgeryData.additional_comment} onChange={(e) => handleSurgeryChange("additional_comment", e.target.value)} style={{ borderRadius: "10px", border: "1px solid #d1d5db", padding: "6px 12px", fontSize: "12px" }} />
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </div>
      <div className="text-center mb-5 pb-5 mt-4">
        <Button
          onClick={onSaveSurgery}
          disabled={loading}
          style={{ backgroundColor: "#00acc1", borderColor: "#00acc1", padding: "10px 40px", borderRadius: "40px", fontWeight: "800", fontSize: "13px", boxShadow: "0 8px 25px rgba(0, 172, 193, 0.4)", textTransform: "uppercase", letterSpacing: "1px" }}
        >
          {loading ? "SAVING..." : (
            <>
              <FeatherIcon icon="save" size="18" className="me-2" />SAVE SURGICAL DATA
            </>
          )}
        </Button>
      </div>

    </div >
  );
};

export default SurgeryDetailsCard;
