import React, { useState } from "react";
import { Row, Col, Form, Button, Modal, Dropdown } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import Select from "react-select";

const BASE_URL = "http://194.195.117.79:5100/api";

const surgeryOptions = [
  "LHP", "FILAC", "MIPH", "EUA", "SPHINCTEROTOMY", "GYNAECOMASTIA", "PROCTITIS",
  "VARICOSE VEINS", "CIRCUMCISION", "HERNIA", "UROLOGY", "LAP CHOLECYSTECTOMY",
  "STARR", "DLPL", "LPP", "Rhomboid Plasty"
];

const DischargeCard = ({
  dischargeData,
  handleDischargeChange,
  handleDischargeInvestigationChange,
  previousDischargesList = [],
  selectedDischargeId = null,
  onSelectDischarge,
  onNewDischarge,
  onSaveDischarge,
  onPrintDischarge,
  loading,
  doctors = [],
  assistanceDoctors = [],
  fistulaCases = [],
  location = "default"
}) => {
  const [newTreatmentGiven, setNewTreatmentGiven] = useState({ medicine_name: "", medicine_id: "", mrp: "", times: "", route: "" });
  const [newTreatmentOnDischarge, setNewTreatmentOnDischarge] = useState({
    medicine_name: "",
    medicine_id: "",
    mrp: "",
    qty: "",
    strength_unit: "",
    medicine_time: [],
    frequency: "",
    days: ""
  });

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [medicineSearchResultsGiven, setMedicineSearchResultsGiven] = useState([]);
  const [showMedicineDropdownGiven, setShowMedicineDropdownGiven] = useState(false);
  const [medicineSearchResultsOnDischarge, setMedicineSearchResultsOnDischarge] = useState([]);
  const [showMedicineDropdownOnDischarge, setShowMedicineDropdownOnDischarge] = useState(false);
  const [uploadMedicineData, setUploadMedicineData] = useState({
    name: "",
    gender: "",
    type: "",
    strength: "",
    unit: "",
    route: "",
    status: ""
  });

  const handleUploadMedicineChange = (field, value) => {
    setUploadMedicineData(prev => ({ ...prev, [field]: value }));
  };

  const saveUploadedMedicine = () => {
    // Implement save logic here or call a handler
    console.log("Saving Medicine:", uploadMedicineData);
    setShowUploadModal(false);
    // Reset form
    setUploadMedicineData({ name: "", gender: "", type: "", strength: "", unit: "", route: "", status: "" });
  };

  const addTreatmentGiven = () => {
    if (!newTreatmentGiven.medicine_name) return;
    const currentList = dischargeData.treatment_given || [];
    handleDischargeChange("treatment_given", [...currentList, { ...newTreatmentGiven, id: Date.now() }]);
    setNewTreatmentGiven({ medicine_name: "", medicine_id: "", mrp: "", times: "", route: "" });
  };

  const removeTreatmentGiven = (id) => {
    const currentList = dischargeData.treatment_given || [];
    handleDischargeChange("treatment_given", currentList.filter(item => item.id !== id));
  };

  const addTreatmentOnDischarge = () => {
    if (!newTreatmentOnDischarge.medicine_name) return;
    const currentList = dischargeData.treatment_on_discharge || [];
    handleDischargeChange("treatment_on_discharge", [...currentList, { ...newTreatmentOnDischarge, id: Date.now() }]);
    setNewTreatmentOnDischarge({
      medicine_name: "",
      medicine_id: "",
      mrp: "",
      qty: "",
      strength_unit: "",
      medicine_time: [],
      frequency: "",
      days: ""
    });
  };

  const toggleMedicineTime = (time) => {
    const current = newTreatmentOnDischarge.medicine_time || [];
    const updated = current.includes(time)
      ? current.filter(t => t !== time)
      : [...current, time];
    setNewTreatmentOnDischarge(prev => ({ ...prev, medicine_time: updated }));
  };

  const removeTreatmentOnDischarge = (id) => {
    const currentList = dischargeData.treatment_on_discharge || [];
    handleDischargeChange("treatment_on_discharge", currentList.filter(item => item.id !== id));
  };


  const handleFinalize = () => {
    handleDischargeChange("final_dc", true);
    onSaveDischarge();
  };

  return (
    <div className="animate__animated animate__fadeIn">
      <style>{`
        .form-check-input {
          border: 1px solid black !important;
        }
        .section-card {
          border-left: 5px solid #0097a7;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
          padding: 5px;
        }
        .vital-card {
          transition: transform 0.2s;
        }
        .vital-card:hover {
          transform: translateY(-2px);
        }
        .investigation-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 10px;
          
        }
        .hover-bg-light:hover {
          background-color: #f1fcfd;
          transition: background-color 0.2s;
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>

      {/* Main Header Card */}
      <div className="section-card">
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
          <h6 className="fw-bold mb-0" style={{ color: "#00838f", textTransform: "uppercase" }}>
            <FeatherIcon icon="log-out" size="18" className="me-2 text-info" />Inpatient Discharge Summary
          </h6>
          <div className="d-flex gap-2">
            {selectedDischargeId && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={onPrintDischarge}
                style={{ borderRadius: "20px", fontSize: "12px", fontWeight: "700", padding: "7px 15px" }}
              >
                <FeatherIcon icon="printer" size="13" className="me-1" /> PRINT
              </Button>
            )}
            <Button
              variant="outline-info"
              size="sm"
              onClick={onNewDischarge}
              style={{ borderRadius: "20px", fontSize: "12px", fontWeight: "700", padding: "7px 10px" }}
            >
              <FeatherIcon icon="plus" size="14" className="me-1" /> NEW RECORD
            </Button>
            <Dropdown onSelect={onSelectDischarge}>
              <Dropdown.Toggle
                variant="outline-info"
                id="previous-discharges-dropdown"
                size="sm"
                style={{ borderRadius: "20px", fontSize: "12px", fontWeight: "700", color: "white", padding: "7px 10px" }}
              >
                <FeatherIcon icon="calendar" size="14" className="me-1" /> PREVIOUS DATES
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ fontSize: "12px", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                {previousDischargesList.length > 0 ? (
                  previousDischargesList.map((d) => (
                    <Dropdown.Item key={d.id} eventKey={d.id}>
                      {d.date} {d.id === selectedDischargeId && <FeatherIcon icon="check" size="12" className="ms-2 text-success" />}
                    </Dropdown.Item>
                  ))
                ) : (
                  <Dropdown.Item disabled>No previous records</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <Row className="g-3 mb-4 align-items-end">
          <Col md={3}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>PATIENT NAME</Form.Label>
            <Form.Control
              type="text"
              value={dischargeData.patient_name}
              readOnly
              style={{ cursor: "not-allowed", borderRadius: "10px", border: "2px solid #b2ebf2", backgroundColor: "#ebeceeff", padding: "6px 12px", fontSize: "12px", fontWeight: "600" }}
            />
          </Col>
          <Col md={3}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>AGE & SEX</Form.Label>
            <Form.Control
              type="text"
              value={`${dischargeData.patient_age ? dischargeData.patient_age + ' yrs' : ''} / ${dischargeData.patient_sex || ''}`}
              readOnly
              style={{ cursor: "not-allowed", borderRadius: "10px", border: "2px solid #b2ebf2", backgroundColor: "#ebeceeff", padding: "6px 12px", fontSize: "12px", fontWeight: "600" }}
            />
          </Col>
          <Col md={3}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>PRESCRIPTION TYPE <span className="text-danger">*</span></Form.Label>
            <Form.Select
              value={dischargeData.discharge_type}
              onChange={(e) => handleDischargeChange("discharge_type", e.target.value)}
              style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
            >
              <option value="">Select Type</option>
              <option value="Proctology">Proctology</option>
              <option value="Urology">Urology</option>
              <option value="Gastroenterology">Gastroenterology</option>
              <option value="Other">Other</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <div className="px-3 py-1 rounded-pill border border-info shadow-sm d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(0, 188, 212, 0.05)", minHeight: "38px" }}>
              <Form.Check
                type="checkbox"
                id="final-discharge-check"
                label={<span className="fw-bold text-info ms-1" style={{ fontSize: "13px", whiteSpace: "nowrap" }}>FINAL DISCHARGE CARD</span>}
                checked={dischargeData.final_dc}
                onChange={(e) => handleDischargeChange("final_dc", e.target.checked)}
                className="mb-0"
              />
            </div>
          </Col>
        </Row>

        <Row className="g-3 mb-4">
          <Col md={3}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>ADDRESS</Form.Label>
            <Form.Control
              readOnly
              as="textarea"
              rows={1}
              value={dischargeData.address}
              onChange={(e) => handleDischargeChange("address", e.target.value)}
              style={{ cursor: "not-allowed", borderRadius: "10px", border: "2px solid #b2ebf2", backgroundColor: "#ebeceeff", padding: "6px 12px", fontSize: "12px", fontWeight: "600" }}
            />
          </Col>
          <Col md={3}>
            <Row className="g-2">
              <Col md={6}>
                <Form.Label className="fw-semibold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>Date Of Admission</Form.Label>
                <Form.Control type="date" value={dischargeData.doa} onChange={(e) => handleDischargeChange("doa", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-semibold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>Admission Time</Form.Label>
                <Form.Control type="time" value={dischargeData.admission_time} onChange={(e) => handleDischargeChange("admission_time", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
              </Col>
            </Row>
          </Col>
          <Col md={3}>
            <Row className="g-2">
              <Col md={6}>
                <Form.Label className="fw-semibold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>Date Of Discharge</Form.Label>
                <Form.Control type="date" value={dischargeData.dod} onChange={(e) => handleDischargeChange("dod", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-semibold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>Discharge Time</Form.Label>
                <Form.Control type="time" value={dischargeData.discharge_time} onChange={(e) => handleDischargeChange("discharge_time", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
              </Col>
            </Row>
          </Col>
          <Col md={3}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>CONSULTANT DOCTOR</Form.Label>
            <Form.Select
              value={dischargeData.consultant_doctor}
              onChange={(e) => handleDischargeChange("consultant_doctor", e.target.value)}
              style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
            >
              <option value="">Select Consultant Doctor</option>
              {doctors.map((doc) => (
                <option key={doc.doctor_id} value={doc.doctor_id}>
                  {doc.name}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>
        <Row className="g-3 mb-4">
          <Col md={12}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>SURGERY TYPE</Form.Label>
            <Dropdown className="w-200 shadow-sm border-0">
              <Dropdown.Toggle
                variant="outline-info"
                id="dropdown-surgery-type"
                className="w-200 d-flex justify-content-between align-items-center bg-white text-dark"
                style={{
                  borderRadius: "12px",
                  border: "2px solid #b2ebf2",
                  padding: "10px 16px",
                  fontSize: "12px",
                  minHeight: "48px",
                  transition: "all 0.3s ease"
                }}
              >
                <div style={{ whiteSpace: "normal", lineHeight: "1.4", textAlign: "left", fontWeight: "500" }}>
                  {(dischargeData.surgery_type || []).length > 0
                    ? (dischargeData.surgery_type || []).join(", ")
                    : "Select Surgery Type(s)"}
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu
                className="w-100 p-3 shadow-lg border-0 animate__animated animate__fadeIn animate__faster"
                style={{
                  maxHeight: "350px",
                  overflowY: "auto",
                  borderRadius: "15px",
                  zIndex: 1050
                }}
              >
                <div className="mb-2 pb-2 border-bottom d-flex justify-content-between align-items-center">
                  <span className="small text-muted fw-bold text-uppercase">Options</span>
                  <Button
                    variant="link"
                    className="p-0 text-info small text-decoration-none"
                    onClick={() => handleDischargeChange("surgery_type", [])}
                    style={{ fontSize: "11px" }}
                  >
                    Clear All
                  </Button>
                </div>
                <Row className="g-2">
                  {surgeryOptions.map((option) => (
                    <Col md={4} key={option}>
                      <div
                        className="px-2 py-1 rounded-3 h-100 d-flex align-items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          const current = dischargeData.surgery_type || [];
                          const isChecked = current.includes(option);
                          const updated = isChecked
                            ? current.filter(item => item !== option)
                            : [...current, option];
                          handleDischargeChange("surgery_type", updated);
                        }}
                        style={{
                          cursor: "pointer",
                          backgroundColor: (dischargeData.surgery_type || []).includes(option) ? "#e0f7fa" : "transparent"
                        }}
                      >
                        <Form.Check
                          type="checkbox"
                          id={`dropdown-surgery-${option}`}
                          label={<span style={{ marginLeft: "4px" }}>{option}</span>}
                          checked={(dischargeData.surgery_type || []).includes(option)}
                          onChange={() => { }} // Controlled by div click
                          style={{ fontSize: "12px", pointerEvents: "none" }}
                        />
                      </div>
                    </Col>
                  ))}
                </Row>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
      </div>

      {/* Clinical Vitals */}
      <div className="section-card" style={{ borderLeftColor: "#f43f5e" }}>
        <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ color: "#e11d48", fontSize: "14px" }}>
          <FeatherIcon icon="activity" size="18" className="me-2" /> PATIENT CLINICAL VITALS AT DISCHARGE
        </h6>
        <Row className="g-3">
          {[
            { label: "IPD NO", value: dischargeData.ipd_no, key: "ipd_no", icon: "hash", color: "#64748b" },
            { label: "SPO2 %", value: dischargeData.spo2, key: "spo2", icon: "wind", color: "#0ea5e9" },
            { label: "BP (mmHg)", value: dischargeData.bp, key: "bp", icon: "activity", color: "#f43f5e" },
            { label: "Pulse (bpm)", value: dischargeData.pulse, key: "pulse", icon: "heart", color: "#ec4899" },
            { label: "RR (cpm)", value: dischargeData.rr, key: "rr", icon: "trending-up", color: "#8b5cf6" },
            { label: "Temp (°F)", value: dischargeData.temp, key: "temp", icon: "thermometer", color: "#f59e0b" },
            { label: "Pain Score", value: dischargeData.pain_score, key: "pain_score", icon: "bar-chart-2", color: "#64748b" }
          ].map(vital => (
            <Col md={3} lg={1.5} key={vital.key} className="flex-grow-1">
              <div className="vital-card p-2 rounded-3 border bg-white text-center shadow-sm">
                <div className="d-flex align-items-center justify-content-center mb-1" style={{ color: vital.color }}>
                  <FeatherIcon icon={vital.icon} size="12" className="me-1" />
                  <span className="fw-bold" style={{ fontSize: '10px', textTransform: 'uppercase' }}>{vital.label}</span>
                </div>
                <Form.Control
                  type="text"
                  value={vital.value}
                  onChange={(e) => handleDischargeChange(vital.key, e.target.value)}
                  className="text-center fw-bold border-0 bg-transparent p-0"
                  style={{ fontSize: "14px", color: "#1e293b", height: 'auto' }}
                  placeholder="-"
                />
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Clinical Diagnosis & Presentation */}
      <div className="section-card" style={{ borderLeftColor: "#fbbf24" }}>
        <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ color: "#d97706", fontSize: "14px" }}>
          <FeatherIcon icon="file-text" size="18" className="me-2" /> CLINICAL SUMMARY & NOTES
        </h6>
        <Row className="g-3">
          <Col md={4}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>REASON FOR ADMISSION</Form.Label>
            <Form.Control as="textarea" rows={3} value={dischargeData.reason_for_admission} onChange={(e) => handleDischargeChange("reason_for_admission", e.target.value)} placeholder="Enter reason for admission..." style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          <Col md={4}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>MEDICAL HISTORY / SH / GH</Form.Label>
            <Form.Control as="textarea" rows={3} value={dischargeData.medical_history} onChange={(e) => handleDischargeChange("medical_history", e.target.value)} placeholder="Enter medical history..." style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          <Col md={4}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>PLAN OF TREATMENT</Form.Label>
            <Form.Control as="textarea" rows={3} value={dischargeData.plan_of_treatment} onChange={(e) => handleDischargeChange("plan_of_treatment", e.target.value)} placeholder="Enter plan of treatment..." style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          <Col md={4}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>KNOWN ALLERGIES</Form.Label>
            <Form.Control as="textarea" rows={3} value={dischargeData.allergies} onChange={(e) => handleDischargeChange("allergies", e.target.value)} placeholder="Enter details of any drug or other allergies..." style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          <Col md={4}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>DIAGNOSIS</Form.Label>
            <Form.Control as="textarea" rows={3} value={dischargeData.diagnosis} onChange={(e) => handleDischargeChange("diagnosis", e.target.value)} placeholder="Enter diagnosis..." style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          <Col md={4}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>SURGERY NOTE</Form.Label>
            <Form.Control as="textarea" rows={3} value={dischargeData.surgery_note} onChange={(e) => handleDischargeChange("surgery_note", e.target.value)} placeholder="Intraoperative findings, procedure details..." style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
        </Row>
      </div>

      {/* Investigations */}
      <div className="section-card" style={{ borderLeftColor: "#10b981" }}>
        <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ color: "#059669", fontSize: "14px" }}>
          <FeatherIcon icon="layers" size="18" className="me-2" /> LABORATORY INVESTIGATIONS SUMMARY
        </h6>
        <div className="p-3 rounded-3">
          <div className="investigation-grid">
            {[
              "HB", "WBC", "PLT", "BSL", "SR.CREATININE", "BILLIRUBIN", "PSA", "BT", "CT", "PT", "INR", "HIV", "HCV", "HBSAG"
            ].map(field => (
              <div key={field} className="p-2 border rounded bg-white shadow-sm d-flex align-items-center justify-content-between">
                <span className="fw-bold text-muted" style={{ fontSize: "10px" }}>{field}</span>
                <Form.Control
                  size="sm"
                  type="text"
                  value={dischargeData.investigations?.[field] || ""}
                  onChange={(e) => handleDischargeInvestigationChange(field, e.target.value)}
                  className="border-0 p-0 text-end fw-bold text-success"
                  style={{ fontSize: "12px", width: "60%", background: 'transparent' }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 p-2 border rounded bg-white shadow-sm d-flex align-items-center">
            <span className="fw-bold text-muted me-2" style={{ fontSize: "10px" }}>OTHER</span>
            <Form.Control
              as="textarea"
              rows={1}
              value={dischargeData.other_investigations}
              onChange={(e) => handleDischargeChange("other_investigations", e.target.value)}
              placeholder="Other investigation details..."
              style={{ borderRadius: "4px", fontSize: "11px", height: '28px', padding: '2px 8px', resize: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* Additional Notes & Advice */}
      <div className="section-card" style={{ borderLeftColor: "#8b5cf6" }}>
        <Row className="g-3">
          <Col md={3}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }} d-flex align-items-center>
              <FeatherIcon icon="shield" size="14" className="me-1" /> LOCAL CARE
            </Form.Label>
            <Form.Control as="textarea" readOnly rows={6} value={dischargeData.local_care} onChange={(e) => handleDischargeChange("local_care", e.target.value)} style={{ cursor: "not-allowed", borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          <Col md={3}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }} d-flex align-items-center>
              <FeatherIcon icon="alert-circle" size="14" className="me-1" /> NOTE / ADVICE
            </Form.Label>
            <Form.Control as="textarea" readOnly rows={6} value={dischargeData.note_advice} onChange={(e) => handleDischargeChange("note_advice", e.target.value)} style={{ cursor: "not-allowed", borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          <Col md={3}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }} d-flex align-items-center>
              <FeatherIcon icon="alert-circle" size="14" className="me-1" /> BALLOON DRAIN
            </Form.Label>
            <Form.Control as="textarea" rows={6} value={dischargeData.balloon_drain} onChange={(e) => handleDischargeChange("balloon_drain", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          <Col md={3}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }} d-flex align-items-center>
              <FeatherIcon icon="alert-circle" size="14" className="me-1" /> FISTULA CASES
            </Form.Label>
            <Dropdown className="w-200">
              <Dropdown.Toggle
                variant="outline-info"
                id="fistula-cases-dropdown"
                className="w-200 d-flex justify-content-between align-items-center"
                style={{
                  borderRadius: "10px",
                  border: "2px solid #b2ebf2",
                  fontSize: "12px",
                  backgroundColor: "#fff",
                  minHeight: "58px", // To match textarea rows={2} roughly
                  textAlign: "left",
                  padding: "6px 12px",
                  color: "#475569"
                }}
              >
                <div style={{ whiteSpace: "normal", lineHeight: "1.2" }}>
                  {(dischargeData.fistula_cases || []).length > 0
                    ? `${(dischargeData.fistula_cases || []).map(id => fistulaCases.find(f => f.id.toString() === id)?.condition_name).join(", ")}`
                    : "Select Fistula Cases"}
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu
                className="w-100 p-3 shadow"
                style={{
                  maxHeight: "250px",
                  overflowY: "auto",
                  borderRadius: "12px",
                  border: "1px solid #b2ebf2"
                }}
              >
                {fistulaCases.length > 0 ? (
                  fistulaCases.map((fcase) => (
                    <div
                      key={fcase.id}
                      className="px-2 py-1 mb-1 rounded hover-bg-light"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Form.Check
                        type="checkbox"
                        id={`dropdown-fistula-${fcase.id}`}
                        label={fcase.condition_name}
                        checked={(dischargeData.fistula_cases || []).includes(fcase.id.toString())}
                        onChange={(e) => {
                          const current = dischargeData.fistula_cases || [];
                          const valueStr = fcase.id.toString();
                          let updated;
                          if (e.target.checked) {
                            updated = [...current, valueStr];
                          } else {
                            updated = current.filter((id) => id !== valueStr);
                          }
                          handleDischargeChange("fistula_cases", updated);
                        }}
                        style={{ fontSize: "13px", fontWeight: "500", color: "#006064" }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted small py-2">No cases found</div>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
          <Col md={12}>
            <Form.Label className="fw-bold small text-muted">CONSENT</Form.Label>
            <Form.Control
              readOnly
              as="textarea"
              rows={6}
              value={dischargeData.consent || `1. PATIENT HAEMODYNAMICALLY STABLE, VITALS NORMAL.
2. PATIENT HAS BEEN ADVISED TO FOLLOW ALL POST OPERATIVE INSTRUCTIONS, INCLUDING MEDICINES, WOUND CARE, DIET PLAN, POST OP EXCERSISE AND SCHEDULED FOLLOW UPS UNTIL DECLARED HEALED BY THE SURGEON, NON COMPLIANCE WITH THESE INSTRUCTIONS MAY RESULT IN RELAPSE, RECURRENCE OR OTHER COMPLICATIONS FOR WHICH THE TREATING DOCTOR OR HOSPITAL SHALL NOT BE HELD RESPONSIBLE
3. PATIENT IS COMFORTABLE AND IS WILLING TO GET DISCHARGED`}
              onChange={(e) => handleDischargeChange("consent", e.target.value)}
              style={{ cursor: "not-allowed", borderRadius: "10px", fontSize: "12px", textTransform: 'uppercase', border: "2px solid #b2ebf2", padding: "6px 12px" }}
            />
          </Col>
        </Row>
      </div>

      {/* Treatment Given during Hospitalization */}
      <div className="section-card" style={{ borderLeftColor: "#0ea5e9" }}>
        <h6 className="fw-bold mb-3 d-flex align-items-center text-uppercase" style={{ color: "#0284c7", fontSize: "14px", letterSpacing: "1px" }}>
          <FeatherIcon icon="plus-square" size="18" className="me-2" /> TREATMENT GIVEN
        </h6>
        <Row className="g-2 mb-3 align-items-end">
          <Col md={3} className="position-relative" style={{ zIndex: showMedicineDropdownGiven ? 1050 : 1 }}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>MEDICINE NAME</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Medicine Name"
              value={newTreatmentGiven.medicine_name}
              onChange={(e) => {
                const val = e.target.value;
                setNewTreatmentGiven({ ...newTreatmentGiven, medicine_name: val });
                if (val.length >= 2) {
                  fetch(`${BASE_URL}/V1/doctor/search-medicine?location=${location}&keyword=${encodeURIComponent(val)}`)
                    .then(res => res.json())
                    .then(data => {
                      if (data.statusCode === 200) {
                        setMedicineSearchResultsGiven(data.data);
                        setShowMedicineDropdownGiven(true);
                      }
                    })
                    .catch(console.error);
                } else {
                  setShowMedicineDropdownGiven(false);
                }
              }}
              onFocus={() => {
                if (newTreatmentGiven.medicine_name && newTreatmentGiven.medicine_name.length >= 2 && medicineSearchResultsGiven.length > 0) {
                  setShowMedicineDropdownGiven(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowMedicineDropdownGiven(false), 200);
              }}
              style={{ borderRadius: "10px", fontSize: "12px", border: "2px solid #b2ebf2", padding: "6px 12px" }}
            />
            {showMedicineDropdownGiven && medicineSearchResultsGiven.length > 0 && (
              <div
                className="bg-white border rounded shadow-sm mt-1 position-absolute w-100"
                style={{ maxHeight: "200px", overflowY: "auto", zIndex: 1060 }}
              >
                {medicineSearchResultsGiven.map((med) => {
                  const medType = med.medicine_type ? `(${med.medicine_type})` : "";
                  const strength = med.medicine_strength || "";
                  const unit = med.medicine_unit || "";
                  const topText = `${med.name} ${med.qty ? `(${med.qty} qty)` : ""}`.replace(/\s+/g, ' ').trim();

                  let bottomText = med.content ? med.content : `${medType} ${strength} ${unit}`.replace(/\s+/g, ' ').trim() || "Local Medicine";

                  const fullSearchValue = med.content
                    ? `${med.name}`
                    : `${med.name} ${medType} ${strength} ${unit}`.replace(/\s+/g, ' ').trim();

                  return (
                    <div
                      key={med.medicine_id}
                      className="px-3 py-2 cursor-pointer hover-bg-light border-bottom"
                      onClick={() => {
                        setNewTreatmentGiven({ ...newTreatmentGiven, medicine_name: fullSearchValue, medicine_id: med.medicine_id, mrp: med.mrp });
                        setShowMedicineDropdownGiven(false);
                      }}
                    >
                      <div style={{ fontSize: "12px", color: "#333", lineHeight: "1.2" }}>
                        <strong>{topText}</strong><br />
                        <small>{bottomText}</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {/* <div className="d-flex gap-2 mt-2">
              <div className="p-1 border rounded flex-fill text-center" style={{ cursor: "not-allowed", fontSize: "10px", color: "#666", border: "2px solid #b2ebf2" }}>
                <strong>ID:</strong> {newTreatmentGiven.medicine_id || "N/A"}
              </div>
              <div className="p-1 border rounded flex-fill text-center" style={{ cursor: "not-allowed", fontSize: "10px", color: "#666", border: "2px solid #b2ebf2" }}>
                <strong>MRP:</strong> ₹{newTreatmentGiven.mrp || "0"}
              </div>
            </div> */}
          </Col>
          <Col md={3}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>TIMES</Form.Label>
            <Form.Select
              value={newTreatmentGiven.times}
              onChange={(e) => setNewTreatmentGiven({ ...newTreatmentGiven, times: e.target.value })}
              style={{ borderRadius: "10px", fontSize: "12px", border: "2px solid #b2ebf2", padding: "6px 12px" }}
            >
              <option value="">Select Times</option>
              {["ONCE", "TWICE", "THREE TIMES", "FOUR TIMES", "FIVE TIMES", "SOS", "STAT"].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>ROUTE</Form.Label>
            <Form.Select
              value={newTreatmentGiven.route}
              onChange={(e) => setNewTreatmentGiven({ ...newTreatmentGiven, route: e.target.value })}
              style={{ borderRadius: "10px", fontSize: "12px", border: "2px solid #b2ebf2", padding: "6px 12px" }}
            >
              <option value="">Select Route</option>
              {["IV", "IM", "ORAL", "P/R", "P/V", "S/C", "S/L", "OTHER"].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3} className="d-flex gap-2">
            <Button
              variant="info"
              className="flex-grow-0 text-white d-flex align-items-center justify-content-center p-0"
              onClick={addTreatmentGiven}
              style={{ height: "38px", width: "70px", borderRadius: "8px" }}
              title="Add Medicine"
            >
              <FeatherIcon icon="plus" size="20" />
            </Button>
            <Button
              variant="outline-info"
              className="flex-grow-1 d-flex align-items-center justify-content-center"
              onClick={() => setShowUploadModal(true)}
              style={{ height: "38px", borderRadius: "8px", fontWeight: "600", fontSize: "11px", whiteSpace: "nowrap" }}
            >
              <FeatherIcon icon="upload" size="16" className="me-1" /> UPLOAD MEDICINE
            </Button>
          </Col>
        </Row>

        {dischargeData.treatment_given?.length > 0 && (
          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle" style={{ fontSize: "12px" }}>
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Medicine Name</th>
                  <th>Times</th>
                  <th>Route</th>
                  <th className="text-center" style={{ width: "50px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {dischargeData.treatment_given.map((item) => (
                  <tr key={item.id}>
                    <td className="ps-3 fw-bold text-dark">{item.medicine_name}</td>
                    <td><span className="badge bg-info-subtle text-info border border-info-subtle px-2">{item.times}</span></td>
                    <td><span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2">{item.route}</span></td>
                    <td className="text-center">
                      <Button variant="link" className="text-danger p-0" onClick={() => removeTreatmentGiven(item.id)}>
                        <FeatherIcon icon="trash-2" size="14" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Treatment on Discharge */}
      <div className="section-card" style={{ borderLeftColor: "#f43f5e" }}>
        <h6 className="fw-bold mb-3 d-flex align-items-center text-uppercase" style={{ color: "#e11d48", fontSize: "14px", letterSpacing: "1px" }}>
          <FeatherIcon icon="clipboard" size="18" className="me-2" /> TREATMENT ON DISCHARGE
        </h6>
        <Row className="g-2 mb-3 align-items-end">
          <Col md={5} className="position-relative" style={{ zIndex: showMedicineDropdownOnDischarge ? 1050 : 1 }}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>MEDICINE NAME</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search Medicine"
              value={newTreatmentOnDischarge.medicine_name}
              onChange={(e) => {
                const val = e.target.value;
                setNewTreatmentOnDischarge({ ...newTreatmentOnDischarge, medicine_name: val });
                if (val.length >= 2) {
                  fetch(`${BASE_URL}/V1/doctor/search-medicine?location=${location}&keyword=${encodeURIComponent(val)}`)
                    .then(res => res.json())
                    .then(data => {
                      if (data.statusCode === 200) {
                        setMedicineSearchResultsOnDischarge(data.data);
                        setShowMedicineDropdownOnDischarge(true);
                      }
                    })
                    .catch(console.error);
                } else {
                  setShowMedicineDropdownOnDischarge(false);
                }
              }}
              onFocus={() => {
                if (newTreatmentOnDischarge.medicine_name && newTreatmentOnDischarge.medicine_name.length >= 2 && medicineSearchResultsOnDischarge.length > 0) {
                  setShowMedicineDropdownOnDischarge(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowMedicineDropdownOnDischarge(false), 200);
              }}
              style={{ borderRadius: "10px", fontSize: "12px", border: "2px solid #b2ebf2", padding: "6px 12px" }}
            />
            {showMedicineDropdownOnDischarge && medicineSearchResultsOnDischarge.length > 0 && (
              <div
                className="bg-white border rounded shadow-sm mt-1 position-absolute w-100"
                style={{ maxHeight: "200px", overflowY: "auto", zIndex: 1060 }}
              >
                {medicineSearchResultsOnDischarge.map((med) => {
                  const medType = med.medicine_type ? `(${med.medicine_type})` : "";
                  const strength = med.medicine_strength || "";
                  const unit = med.medicine_unit || "";
                  const topText = `${med.name} ${med.qty ? `(${med.qty} qty)` : ""}`.replace(/\s+/g, ' ').trim();

                  let bottomText = med.content ? med.content : `${medType} ${strength} ${unit}`.replace(/\s+/g, ' ').trim() || "Local Medicine";

                  const fullSearchValue = med.content
                    ? `${med.name}`
                    : `${med.name} ${medType} ${strength} ${unit}`.replace(/\s+/g, ' ').trim();

                  return (
                    <div
                      key={med.medicine_id}
                      className="px-3 py-2 cursor-pointer hover-bg-light border-bottom"
                      onClick={() => {
                        setNewTreatmentOnDischarge((prev) => ({
                          ...prev,
                          medicine_name: fullSearchValue,
                          medicine_id: med.medicine_id,
                          mrp: med.mrp,
                          qty: med.qty || prev.qty,
                          strength_unit: `${strength} ${unit}`.trim() || prev.strength_unit
                        }));
                        setShowMedicineDropdownOnDischarge(false);
                      }}
                    >
                      <div style={{ fontSize: "12px", color: "#333", lineHeight: "1.2" }}>
                        <strong>{topText}</strong><br />
                        <small>{bottomText}</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {/* <div className="d-flex gap-2 mt-2">
              <div className="p-1 border rounded flex-fill text-center" style={{ cursor: "not-allowed", fontSize: "10px", color: "#666", border: "2px solid #b2ebf2" }}>
                <strong>ID:</strong> {newTreatmentOnDischarge.medicine_id || "N/A"}
              </div>
              <div className="p-1 border rounded flex-fill text-center" style={{ cursor: "not-allowed", fontSize: "10px", color: "#666", border: "2px solid #b2ebf2" }}>
                <strong>MRP:</strong> ₹{newTreatmentOnDischarge.mrp || "0"}
              </div>
            </div> */}
          </Col>
          <Col md={1}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>QTY</Form.Label>
            <Form.Select
              value={newTreatmentOnDischarge.qty}
              onChange={(e) => setNewTreatmentOnDischarge({ ...newTreatmentOnDischarge, qty: e.target.value })}
              style={{ borderRadius: "10px", fontSize: "12px", border: "2px solid #b2ebf2", padding: "6px 12px" }}
            >
              <option value="">Qty</option>
              {Array.from({ length: 60 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={1}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>STRENGTH</Form.Label>
            <Form.Control
              type="text"
              placeholder="Unit"
              value={newTreatmentOnDischarge.strength_unit}
              onChange={(e) => setNewTreatmentOnDischarge({ ...newTreatmentOnDischarge, strength_unit: e.target.value })}
              style={{ borderRadius: "10px", fontSize: "12px", border: "2px solid #b2ebf2", padding: "6px 12px" }}
            />
          </Col>
          <Col md={2}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>Medicine time</Form.Label>
            <Dropdown className="w-200">
              <Dropdown.Toggle
                variant="outline-info"
                id="medicine-time-dropdown"
                className="w-200 d-flex justify-content-between align-items-center"
                style={{ borderRadius: "10px", border: "2px solid #b2ebf2", fontSize: "12px", padding: "6px 12px" }}
              >
                <span className="text-truncate">
                  {newTreatmentOnDischarge.medicine_time.length > 0
                    ? newTreatmentOnDischarge.medicine_time.join(", ")
                    : "Select Time"}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu className="w-100 shadow-sm border-0 py-2 px-1" style={{ maxHeight: "300px", overflowY: "auto", borderRadius: "10px" }}>
                {[
                  "Before Breakfast", "After Breakfast", "Before Lunch", "After Lunch",
                  "Before Dinner", "After Dinner", "After Evening Snacks",
                  "On Clear Liquid", "SOS", "LA"
                ].map(time => (
                  <div key={time} className="dropdown-item d-flex align-items-center py-2 rounded-2 mb-1" style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); toggleMedicineTime(time); }}>
                    <Form.Check
                      type="checkbox"
                      id={`time-${time}`}
                      checked={newTreatmentOnDischarge.medicine_time.includes(time)}
                      onChange={() => { }} // Controlled by outer div
                      className="me-2"
                    />
                    <label className="mb-0 flex-grow-1" style={{ cursor: "pointer", fontSize: "12px", color: "#475569" }}>{time}</label>
                  </div>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
          <Col md={1}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>Frequency</Form.Label>
            <Form.Control
              type="text"
              placeholder="Frequency"
              value={newTreatmentOnDischarge.frequency}
              onChange={(e) => setNewTreatmentOnDischarge({ ...newTreatmentOnDischarge, frequency: e.target.value })}
              style={{ borderRadius: "10px", fontSize: "12px", border: "2px solid #b2ebf2", padding: "6px 12px" }}
            />
          </Col>
          <Col md={1}>
            <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>DAYS</Form.Label>
            <Form.Select
              value={newTreatmentOnDischarge.days}
              onChange={(e) => setNewTreatmentOnDischarge({ ...newTreatmentOnDischarge, days: e.target.value })}
              style={{ borderRadius: "10px", fontSize: "12px", border: "2px solid #b2ebf2", padding: "6px 12px" }}
            >
              <option value="">Days</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 30, 45, 60, 90, 120, "SOS"].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={1} className="d-flex">
            <Button
              variant="info"
              className="w-100 text-white fw-bold d-flex align-items-center justify-content-center p-0"
              onClick={addTreatmentOnDischarge}
              style={{ height: "38px", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0, 188, 212, 0.2)" }}
              title="Add Medicine"
            >
              <FeatherIcon icon="plus" size="20" />
            </Button>
          </Col>
        </Row>

        {dischargeData.treatment_on_discharge?.length > 0 && (
          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle" style={{ fontSize: "12px" }}>
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Medicine Name</th>
                  <th>Qty</th>
                  <th>Strength/Unit</th>
                  <th>Medicine time</th>
                  <th>Frequency</th>
                  <th>Days</th>
                  <th className="text-center" style={{ width: "50px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {dischargeData.treatment_on_discharge.map((item) => (
                  <tr key={item.id}>
                    <td className="ps-3 fw-bold text-dark">{item.medicine_name}</td>
                    <td className="text-center">{item.qty}</td>
                    <td className="text-center">{item.strength_unit}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {(item.medicine_time || []).map((t, idx) => (
                          <span key={idx} className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2" style={{ fontSize: "10px" }}>{t}</span>
                        ))}
                      </div>
                    </td>
                    <td>{item.frequency}</td>
                    <td className="fw-bold">{item.days}</td>
                    <td className="text-center">
                      <Button variant="link" className="text-danger p-0" onClick={() => removeTreatmentOnDischarge(item.id)}>
                        <FeatherIcon icon="trash-2" size="14" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer / Administrative Info */}
      <div className="section-card" style={{ borderLeftColor: "#475569", backgroundColor: "#f8fafc" }}>
        <h6 className="fw-bold mb-3 text-muted" style={{ fontSize: "12px", textTransform: "uppercase" }}>Administrative Details</h6>
        <Row className="g-3">
          <Col md={4}>
            <Form.Label className="fw-semibold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>FOLLOWUP DATE</Form.Label>
            <Form.Control type="date" value={dischargeData.follow_date} onChange={(e) => handleDischargeChange("follow_date", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          <Col md={4}>
            <Form.Label className="fw-semibold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>TREATING BY</Form.Label>
            <Form.Select
              value={dischargeData.treating_by}
              onChange={(e) => handleDischargeChange("treating_by", e.target.value)}
              style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
            >
              <option value="">Select Doctor</option>
              {doctors.map((doc) => (
                <option key={doc.doctor_id} value={doc.doctor_id}>{doc.name}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Label className="fw-semibold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>MADE BY</Form.Label>
            <Form.Select
              value={dischargeData.made_by}
              onChange={(e) => handleDischargeChange("made_by", e.target.value)}
              style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
            >
              <option value="">Select Doctor</option>
              {doctors
                .filter((doc) => {
                  if (!doc.doctor_type) return false;
                  const roles = doc.doctor_type.toLowerCase().split(",").map((r) => r.trim());
                  return roles.includes("madeby") || roles.includes("made");
                })
                .map((doc) => (
                  <option key={doc.doctor_id} value={doc.doctor_id}>
                    {doc.name}
                  </option>
                ))}
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Label className="fw-semibold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>CHECKED BY</Form.Label>
            <Form.Select
              value={dischargeData.checked_by}
              onChange={(e) => handleDischargeChange("checked_by", e.target.value)}
              style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
            >
              <option value="">Select Doctor</option>
              {doctors
                .filter((doc) => {
                  if (!doc.doctor_type) return false;
                  const roles = doc.doctor_type.toLowerCase().split(",").map((r) => r.trim());
                  return roles.includes("checkby") || roles.includes("check");
                })
                .map((doc) => (
                  <option key={doc.doctor_id} value={doc.doctor_id}>
                    {doc.name}
                  </option>
                ))}
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Label className="fw-semibold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>ASSISTANT DOCTOR</Form.Label>
            <Form.Select
              value={dischargeData.assistance_doctor}
              onChange={(e) => handleDischargeChange("assistance_doctor", e.target.value)}
              style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
            >
              <option value="">Select Assistant Doctor</option>
              {assistanceDoctors.map((doc) => (
                <option key={doc.doctor_id} value={doc.doctor_id}>{doc.name}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Label className="fw-semibold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>ASSISTANT SURGEON</Form.Label>
            <Form.Select
              value={dischargeData.assistance_surgeon}
              onChange={(e) => handleDischargeChange("assistance_surgeon", e.target.value)}
              style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
            >
              <option value="">Select Assistant Surgeon</option>
              {assistanceDoctors.map((doc) => (
                <option key={doc.doctor_id} value={doc.doctor_id}>{doc.name}</option>
              ))}
            </Form.Select>
          </Col>
          {/* <Col md={6}>
            <div className="p-2 border rounded-3 bg-white d-flex align-items-center h-100">
              <span className="fw-bold text-muted me-2" style={{ fontSize: "14px" }}>EUA & FO DONE:</span>
              <Form.Check
                type="checkbox"
                checked={dischargeData.eua_fo}
                onChange={(e) => handleDischargeChange("eua_fo", e.target.checked)}
                className="mb-0"
              />
              <Form.Control
                type="date"
                className="ms-3 border-0 border-bottom rounded-0 p-0"
                value={dischargeData.eua_note}
                onChange={(e) => handleDischargeChange("eua_note", e.target.value)}
                style={{ fontSize: "12px", width: "150px" }}
              />
            </div>
          </Col> */}
        </Row>
      </div>

      {/* Save Button Container */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ backgroundColor: "#00838f", color: "white" }}>
          <Modal.Title className="fw-bold text-uppercase" style={{ fontSize: "16px", letterSpacing: "1px" }}>
            <FeatherIcon icon="plus-circle" size="20" className="me-2" /> Add New Medicine
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ backgroundColor: "#f9fdfd" }}>
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>MEDICINE NAME <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Medicine Name"
                  value={uploadMedicineData.name}
                  onChange={(e) => handleUploadMedicineChange("name", e.target.value)}
                  style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>SELECT GENDER</Form.Label>
                <Form.Select
                  value={uploadMedicineData.gender}
                  onChange={(e) => handleUploadMedicineChange("gender", e.target.value)}
                  style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                  <option value="OTHER">OTHER</option>
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>MEDICINE TYPE</Form.Label>
                <Form.Select
                  value={uploadMedicineData.type}
                  onChange={(e) => handleUploadMedicineChange("type", e.target.value)}
                  style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
                >
                  <option value="">Select Type</option>
                  {["TAB", "CAP", "SYP", "SPRAY", "CREAM", "INJ", "POWDER", "SOLUTION"].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>MEDICINE STRENGTH</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. 500"
                  value={uploadMedicineData.strength}
                  onChange={(e) => handleUploadMedicineChange("strength", e.target.value)}
                  style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>UNIT</Form.Label>
                <Form.Select
                  value={uploadMedicineData.unit}
                  onChange={(e) => handleUploadMedicineChange("unit", e.target.value)}
                  style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
                >
                  <option value="">Select Unit</option>
                  {["G", "MG", "MCG", "MG", "ML", "CC", "IU", "MOL"].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>ROUTE</Form.Label>
                <Form.Select
                  value={uploadMedicineData.route}
                  onChange={(e) => handleUploadMedicineChange("route", e.target.value)}
                  style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
                >
                  <option value="">Select Route</option>
                  {["ORAL", "IV", "IM", "SC", "LOCAL APPLICATION"].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={12}>
                <Form.Label className="fw-bold small mb-1" style={{ fontSize: "11px", color: "#006064" }}>MEDICINE STATUS</Form.Label>
                <Form.Select
                  value={uploadMedicineData.status}
                  onChange={(e) => handleUploadMedicineChange("status", e.target.value)}
                  style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
                >
                  <option value="">Select Status</option>
                  <option value="PROCTOLOGY">PROCTOLOGY</option>
                  <option value="UROLOGY">UROLOGY</option>
                  <option value="OTHER">OTHER</option>
                </Form.Select>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#f9fdfd", borderTop: "none" }}>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)} style={{ borderRadius: "8px", padding: "8px 25px" }}>
            Cancel
          </Button>
          <Button variant="info" className="text-white" onClick={saveUploadedMedicine} style={{ borderRadius: "8px", padding: "8px 40px", fontWeight: "bold" }}>
            SAVE MEDICINE
          </Button>
        </Modal.Footer>
      </Modal>

      {!selectedDischargeId && (
        <div className="text-center mb-5 pb-5 mt-4">
          <Button
            disabled={loading}
            onClick={handleFinalize}
            style={{ backgroundColor: "#00838f", borderColor: "#00838f", padding: "12px 60px", borderRadius: "50px", fontWeight: "800", fontSize: "13px", boxShadow: "0 10px 30px rgba(0, 131, 143, 0.3)", textTransform: "uppercase", letterSpacing: "1.5px" }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                SAVING...
              </>
            ) : (
              <>
                <FeatherIcon icon="save" size="18" className="me-2" />SAVE DISCHARGE DATA
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DischargeCard;

