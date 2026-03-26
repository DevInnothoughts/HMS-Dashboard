import React, { useState } from "react";
import { Row, Col, Form, Button, Modal, Dropdown } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";

const DischargeCard = ({ 
  dischargeData, 
  handleDischargeChange, 
  handleDischargeInvestigationChange,
  previousDischargesList = [],
  selectedDischargeId = null,
  onSelectDischarge,
  onNewDischarge,
  doctors = [],
  assistanceDoctors = []
}) => {
  const [newTreatmentGiven, setNewTreatmentGiven] = useState({ medicine_name: "", times: "", route: "" });
  const [newTreatmentOnDischarge, setNewTreatmentOnDischarge] = useState({
    medicine_name: "",
    qty: "",
    strength_unit: "",
    frequency: "",
    days: ""
  });

  const [showUploadModal, setShowUploadModal] = useState(false);
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
    setNewTreatmentGiven({ medicine_name: "", times: "", route: "" });
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
      qty: "",
      strength_unit: "",
      frequency: "",
      days: ""
    });
  };

  const removeTreatmentOnDischarge = (id) => {
    const currentList = dischargeData.treatment_on_discharge || [];
    handleDischargeChange("treatment_on_discharge", currentList.filter(item => item.id !== id));
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
      `}</style>

      {/* Main Header Card */}
      <div className="section-card">
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
          <h5 className="fw-bold mb-0" style={{ color: "#00838f", textTransform: "uppercase", letterSpacing: "1px", fontSize: "16px" }}>
            <FeatherIcon icon="log-out" size="20" className="me-2 text-info" />Inpatient Discharge Summary
          </h5>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-info" 
              size="sm" 
              onClick={onNewDischarge}
              style={{ borderRadius: "20px", fontSize: "11px", fontWeight: "700" }}
            >
              <FeatherIcon icon="plus" size="14" className="me-1" /> NEW RECORD
            </Button>
            <Dropdown onSelect={onSelectDischarge}>
              <Dropdown.Toggle 
                variant="info" 
                id="previous-discharges-dropdown" 
                size="sm" 
                style={{ borderRadius: "20px", fontSize: "11px", fontWeight: "700", color: "white" }}
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
            <Form.Label className="fw-bold text-muted small mb-1">PATIENT NAME</Form.Label>
            <Form.Control
              type="text"
              value={dischargeData.patient_name}
              readOnly
              style={{ borderRadius: "8px", border: "2px solid #b2ebf2", backgroundColor: "#f9fdfd", fontSize: "13px", fontWeight: "600" }}
            />
          </Col>
          <Col md={3}>
            <Form.Label className="fw-bold text-muted small mb-1">AGE & SEX</Form.Label>
            <Form.Control
              type="text"
              value={`${dischargeData.patient_age ? dischargeData.patient_age + 'Y' : ''} / ${dischargeData.patient_sex || ''}`}
              readOnly
              style={{ borderRadius: "8px", border: "2px solid #b2ebf2", backgroundColor: "#f9fdfd", fontSize: "13px", fontWeight: "600" }}
            />
          </Col>
          <Col md={3}>
            <Form.Label className="fw-bold text-muted small mb-1">PRESCRIPTION TYPE <span className="text-danger">*</span></Form.Label>
            <Form.Select
              value={dischargeData.discharge_type}
              onChange={(e) => handleDischargeChange("discharge_type", e.target.value)}
              style={{ borderRadius: "8px", border: "2px solid #b2ebf2", fontSize: "12px" }}
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
          <Col md={4}>
            <Form.Label className="fw-bold text-muted small mb-1">ADDRESS</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={dischargeData.address}
              onChange={(e) => handleDischargeChange("address", e.target.value)}
              placeholder="Enter Patient Address"
              style={{ borderRadius: "8px", border: "2px solid #b2ebf2", fontSize: "13px" }}
            />
          </Col>
          <Col md={4}>
            <Row className="g-2">
              <Col md={7}>
                <Form.Label className="fw-semibold small text-muted mb-1">Date of Admission (DOA)</Form.Label>
                <Form.Control type="date" value={dischargeData.doa} onChange={(e) => handleDischargeChange("doa", e.target.value)} style={{ borderRadius: "6px", fontSize: "12px", border: "2px solid #b2ebf2" }} />
              </Col>
              <Col md={5}>
                <Form.Label className="fw-semibold small text-muted mb-1">Time</Form.Label>
                <Form.Control type="time" value={dischargeData.admission_time} onChange={(e) => handleDischargeChange("admission_time", e.target.value)} style={{ borderRadius: "6px", fontSize: "12px", border: "2px solid #b2ebf2" }} />
              </Col>
            </Row>
          </Col>
          <Col md={4}>
            <Row className="g-2">
              <Col md={7}>
                <Form.Label className="fw-semibold small text-muted mb-1">Date of Discharge (DOD)</Form.Label>
                <Form.Control type="date" value={dischargeData.dod} onChange={(e) => handleDischargeChange("dod", e.target.value)} style={{ borderRadius: "6px", fontSize: "12px", border: "2px solid #b2ebf2" }} />
              </Col>
              <Col md={5}>
                <Form.Label className="fw-semibold small text-muted mb-1">Time</Form.Label>
                <Form.Control type="time" value={dischargeData.discharge_time} onChange={(e) => handleDischargeChange("discharge_time", e.target.value)} style={{ borderRadius: "6px", fontSize: "12px", border: "2px solid #b2ebf2" }} />
              </Col>
            </Row>
          </Col>
        </Row>

        <Row className="g-3 mb-4">
          <Col md={3}>
            <Form.Label className="fw-bold text-muted small mb-1">CONSULTANT NAME</Form.Label>
            <Form.Control
              type="text"
              value={dischargeData.consultant_name}
              onChange={(e) => handleDischargeChange("consultant_name", e.target.value)}
              placeholder="Consultant Doctor Name"
              style={{ borderRadius: "8px", border: "2px solid #b2ebf2", fontSize: "13px" }}
            />
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
          <Col md={6}>
            <Form.Label className="fw-bold small text-muted">REASON FOR ADMISSION</Form.Label>
            <Form.Control as="textarea" rows={3} value={dischargeData.reason_for_admission} onChange={(e) => handleDischargeChange("reason_for_admission", e.target.value)} style={{ borderRadius: "8px", fontSize: "12px", border: "2px solid #b2ebf2" }} />
          </Col>
          <Col md={6}>
            <Form.Label className="fw-bold small text-muted">MEDICAL HISTORY / SH / GH</Form.Label>
            <Form.Control as="textarea" rows={3} value={dischargeData.medical_history} onChange={(e) => handleDischargeChange("medical_history", e.target.value)} style={{ borderRadius: "8px", fontSize: "12px", border: "2px solid #b2ebf2" }} />
          </Col>
          <Col md={6}>
            <Form.Label className="fw-bold small text-muted">PLAN OF TREATMENT</Form.Label>
            <Form.Control as="textarea" rows={3} value={dischargeData.plan_of_treatment} onChange={(e) => handleDischargeChange("plan_of_treatment", e.target.value)} style={{ borderRadius: "8px", fontSize: "12px", border: "2px solid #b2ebf2" }} />
          </Col>
          <Col md={6}>
            <Form.Label className="fw-bold small text-muted">KNOWN ALLERGIES</Form.Label>
            <Form.Control as="textarea" rows={3} value={dischargeData.allergies} onChange={(e) => handleDischargeChange("allergies", e.target.value)} placeholder="Enter details of any drug or other allergies..." style={{ borderRadius: "8px", fontSize: "12px", border: "2px solid #b2ebf2" }} />
          </Col>
          <Col md={6}>
            <Form.Label className="fw-bold small text-muted">DIAGNOSIS</Form.Label>
            <Form.Control as="textarea" rows={3} value={dischargeData.diagnosis} onChange={(e) => handleDischargeChange("diagnosis", e.target.value)} style={{ borderRadius: "8px", fontSize: "12px", border: "2px solid #b2ebf2" }} />
          </Col>
          <Col md={6}>
            <Form.Label className="fw-bold small text-muted">SURGERY NOTE</Form.Label>
            <Form.Control as="textarea" rows={3} value={dischargeData.surgery_note} onChange={(e) => handleDischargeChange("surgery_note", e.target.value)} placeholder="Intraoperative findings, procedure details..." style={{ borderRadius: "8px", fontSize: "12px", border: "2px solid #b2ebf2" }} />
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
            <Form.Label className="fw-bold small text-muted d-flex align-items-center">
              <FeatherIcon icon="shield" size="14" className="me-1" /> LOCAL CARE
            </Form.Label>
            <Form.Control as="textarea" rows={3} value={dischargeData.local_care} onChange={(e) => handleDischargeChange("local_care", e.target.value)} style={{ borderRadius: "8px", fontSize: "12px", border: "2px solid #b2ebf2" }} />
          </Col>
          <Col md={3}>
            <Form.Label className="fw-bold small text-muted d-flex align-items-center">
              <FeatherIcon icon="alert-circle" size="14" className="me-1" /> NOTE / ADVICE
            </Form.Label>
            <Form.Control as="textarea" rows={3} value={dischargeData.note_advice} onChange={(e) => handleDischargeChange("note_advice", e.target.value)} placeholder="Dietary restrictions, activity advice..." style={{ borderRadius: "8px", fontSize: "12px", border: "2px solid #b2ebf2" }} />
          </Col>
          <Col md={3}>
            <Form.Label className="fw-bold small text-muted">BALLOON DRAIN</Form.Label>
            <Form.Control as="textarea" rows={2} value={dischargeData.balloon_drain} onChange={(e) => handleDischargeChange("balloon_drain", e.target.value)} style={{ borderRadius: "8px", fontSize: "12px", border: "2px solid #b2ebf2" }} />
          </Col>
          <Col md={3}>
            <Form.Label className="fw-bold small text-muted">FISTULA CASES</Form.Label>
            <Form.Select
              value={dischargeData.fistula_cases}
              onChange={(e) => handleDischargeChange("fistula_cases", e.target.value)}
              style={{ borderRadius: "8px", fontSize: "12px" }}
            >
              <option value="">Select Case Type</option>
              <option value="GLUTEAL">GLUTEAL</option>
              <option value="HIGH">HIGH</option>
              <option value="HORSESHOE">HORSESHOE</option>
              <option value="NIDAL">NIDAL</option>
              <option value="SCROTAL">SCROTAL</option>
              <option value="SUPRALEVATOR">SUPRALEVATOR</option>
              <option value="TRANSPHINCTERIC">TRANSPHINCTERIC</option>
              <option value="INTERSPHINCTERIC">INTERSPHINCTERIC</option>
              <option value="VAGINAL">VAGINAL</option>
              <option value="VULVAL">VULVAL</option>
              <option value="COMPLEX">COMPLEX</option>
              <option value="RECURRENT">RECURRENT</option>
            </Form.Select>
          </Col>
          <Col md={12}>
            <Form.Label className="fw-bold small text-muted">CONSENT</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              value={dischargeData.consent || `1. PATIENT HAEMODYNAMICALLY STABLE, VITALS NORMAL.
2. PATIENT HAS BEEN ADVISED TO FOLLOW ALL POST OPERATIVE INSTRUCTIONS, INCLUDING MEDICINES, WOUND CARE, DIET PLAN, POST OP EXCERSISE AND SCHEDULED FOLLOW UPS UNTIL DECLARED HEALED BY THE SURGEON, NON COMPLIANCE WITH THESE INSTRUCTIONS MAY RESULT IN RELAPSE, RECURRENCE OR OTHER COMPLICATIONS FOR WHICH THE TREATING DOCTOR OR HOSPITAL SHALL NOT BE HELD RESPONSIBLE
3. PATIENT IS COMFORTABLE AND IS WILLING TO GET DISCHARGED`}
              onChange={(e) => handleDischargeChange("consent", e.target.value)}
              style={{ borderRadius: "8px", fontSize: "12px", textTransform: 'uppercase', border: "2px solid #b2ebf2" }}
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
          <Col md={3}>
            <Form.Label className="fw-bold small text-muted">MEDICINE NAME</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Medicine Name"
              value={newTreatmentGiven.medicine_name}
              onChange={(e) => setNewTreatmentGiven({ ...newTreatmentGiven, medicine_name: e.target.value })}
              style={{ borderRadius: "8px", fontSize: "12px", border: "2px solid #b2ebf2" }}
            />
          </Col>
          <Col md={3}>
            <Form.Label className="fw-bold small text-muted">TIMES</Form.Label>
            <Form.Select
              value={newTreatmentGiven.times}
              onChange={(e) => setNewTreatmentGiven({ ...newTreatmentGiven, times: e.target.value })}
              style={{ borderRadius: "8px", fontSize: "12px", border: "2px solid #b2ebf2" }}
            >
              <option value="">Select Times</option>
              {["ONCE", "TWICE", "THREE TIMES", "FOUR TIMES", "FIVE TIMES", "SOS", "STAT"].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Label className="fw-bold small text-muted">ROUTE</Form.Label>
            <Form.Select
              value={newTreatmentGiven.route}
              onChange={(e) => setNewTreatmentGiven({ ...newTreatmentGiven, route: e.target.value })}
              style={{ borderRadius: "8px", fontSize: "12px", border: "2px solid #b2ebf2" }}
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
        <Row className="g-2 mb-3">
          <Col md={4}>
            <Form.Label className="fw-bold small text-muted">MEDICINE NAME</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search Medicine"
              value={newTreatmentOnDischarge.medicine_name}
              onChange={(e) => setNewTreatmentOnDischarge({ ...newTreatmentOnDischarge, medicine_name: e.target.value })}
              style={{ borderRadius: "8px", fontSize: "12px", border: "2px solid #b2ebf2" }}
            />
          </Col>
          <Col md={1}>
            <Form.Label className="fw-bold small text-muted">QTY</Form.Label>
            <Form.Select
              value={newTreatmentOnDischarge.qty}
              onChange={(e) => setNewTreatmentOnDischarge({ ...newTreatmentOnDischarge, qty: e.target.value })}
              style={{ borderRadius: "8px", fontSize: "12px", border: "2px solid #b2ebf2" }}
            >
              <option value="">#</option>
              {[...Array(60)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label className="fw-bold small text-muted">STRENGTH</Form.Label>
            <Form.Control
              type="text"
              placeholder="Unit"
              value={newTreatmentOnDischarge.strength_unit}
              onChange={(e) => setNewTreatmentOnDischarge({ ...newTreatmentOnDischarge, strength_unit: e.target.value })}
              style={{ borderRadius: "8px", fontSize: "12px", border: "2px solid #b2ebf2" }}
            />
          </Col>
          <Col md={3}>
            <Form.Label className="fw-bold small text-muted">FREQUENCY / TIMING</Form.Label>
            <Form.Select
              value={newTreatmentOnDischarge.frequency}
              onChange={(e) => setNewTreatmentOnDischarge({ ...newTreatmentOnDischarge, frequency: e.target.value })}
              style={{ borderRadius: "8px", fontSize: "12px", border: "2px solid #b2ebf2" }}
            >
              <option value="">Select Timing</option>
              {["Before Breakfast", "After Breakfast", "Before Lunch", "After Lunch", "After Evening Snacks", "Before Dinner", "After Dinner", "SOS", "LA"].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={1}>
            <Form.Label className="fw-bold small text-muted">DAYS</Form.Label>
            <Form.Select
              value={newTreatmentOnDischarge.days}
              onChange={(e) => setNewTreatmentOnDischarge({ ...newTreatmentOnDischarge, days: e.target.value })}
              style={{ borderRadius: "8px", fontSize: "12px", border: "2px solid #b2ebf2" }}
            >
              <option value="">Days</option>
              {[1, 2, 3, 5, 7, 10, 15, 30, 45, 60, 90, 120, 'SOS'].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={1} className="d-flex align-items-end">
            <Button
              variant="danger"
              className="w-100"
              onClick={addTreatmentOnDischarge}
              style={{ height: "38px", borderRadius: "8px" }}
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
                  <th className="ps-3">Medicine</th>
                  <th>Qty</th>
                  <th>Strength</th>
                  <th>Frequency/Timing</th>
                  <th>Days</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {dischargeData.treatment_on_discharge.map((item) => (
                  <tr key={item.id}>
                    <td className="ps-3 fw-bold text-dark">{item.medicine_name}</td>
                    <td>{item.qty}</td>
                    <td>{item.strength_unit}</td>
                    <td><span className="badge bg-danger-subtle text-danger border border-danger-subtle">{item.frequency}</span></td>
                    <td>{item.days}</td>
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
          <Col md={3}>
            <Form.Label className="fw-semibold small text-muted">FOLLOWUP DATE</Form.Label>
            <Form.Control type="date" value={dischargeData.follow_date} onChange={(e) => handleDischargeChange("follow_date", e.target.value)} style={{ borderRadius: "6px", fontSize: "12px", border: "2px solid #b2ebf2" }} />
          </Col>
          <Col md={3}>
            <Form.Label className="fw-semibold small text-muted">TREATING BY</Form.Label>
            <Form.Select
              value={dischargeData.treating_by}
              onChange={(e) => handleDischargeChange("treating_by", e.target.value)}
              style={{ borderRadius: "6px", fontSize: "12px", border: "2px solid #b2ebf2" }}
            >
              <option value="">Select Doctor</option>
              {doctors.map((doc) => (
                <option key={doc.doctor_id} value={doc.name}>{doc.name}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Label className="fw-semibold small text-muted">MADE BY</Form.Label>
            <Form.Select
              value={dischargeData.made_by}
              onChange={(e) => handleDischargeChange("made_by", e.target.value)}
              style={{ borderRadius: "6px", fontSize: "12px", border: "2px solid #b2ebf2" }}
            >
              <option value="">Select Staff</option>
              {/* This might need its own list, but I'll leave as is or use a placeholder */}
              <option value="Staff 1">Staff 1</option>
              <option value="Staff 2">Staff 2</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Label className="fw-semibold small text-muted">CHECKED BY</Form.Label>
            <Form.Select
              value={dischargeData.checked_by}
              onChange={(e) => handleDischargeChange("checked_by", e.target.value)}
              style={{ borderRadius: "6px", fontSize: "12px", border: "2px solid #b2ebf2" }}
            >
              <option value="">Select Doctor</option>
              {doctors.map((doc) => (
                <option key={doc.doctor_id} value={doc.name}>{doc.name}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Label className="fw-semibold small text-muted">ASSISTANCE DOCTOR</Form.Label>
            <Form.Select
              value={dischargeData.assistance_doctor}
              onChange={(e) => handleDischargeChange("assistance_doctor", e.target.value)}
              style={{ borderRadius: "6px", fontSize: "12px", border: "2px solid #b2ebf2" }}
            >
              <option value="">Select Doctor</option>
              {assistanceDoctors.map((doc) => (
                <option key={doc.doctor_id} value={doc.name}>{doc.name}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Label className="fw-semibold small text-muted">ASSISTANCE SURGEON</Form.Label>
            <Form.Select
              value={dischargeData.assistance_surgeon}
              onChange={(e) => handleDischargeChange("assistance_surgeon", e.target.value)}
              style={{ borderRadius: "6px", fontSize: "12px", border: "2px solid #b2ebf2" }}
            >
              <option value="">Select Surgeon</option>
              {assistanceDoctors.map((doc) => (
                <option key={doc.doctor_id} value={doc.name}>{doc.name}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={6}>
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
          </Col>
        </Row>
      </div>

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
                <Form.Label className="fw-bold small text-muted">MEDICINE NAME <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Medicine Name"
                  value={uploadMedicineData.name}
                  onChange={(e) => handleUploadMedicineChange("name", e.target.value)}
                  style={{ borderRadius: "8px", border: "2px solid #b2ebf2" }}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold small text-muted text-uppercase">Select Gender</Form.Label>
                <Form.Select
                  value={uploadMedicineData.gender}
                  onChange={(e) => handleUploadMedicineChange("gender", e.target.value)}
                  style={{ borderRadius: "8px", border: "2px solid #b2ebf2" }}
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                  <option value="OTHER">OTHER</option>
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold small text-muted">MEDICINE TYPE</Form.Label>
                <Form.Select
                  value={uploadMedicineData.type}
                  onChange={(e) => handleUploadMedicineChange("type", e.target.value)}
                  style={{ borderRadius: "8px", border: "2px solid #b2ebf2" }}
                >
                  <option value="">Select Type</option>
                  {["TAB", "CAP", "SYP", "SPRAY", "CREAM", "INJ", "POWDER", "SOLUTION"].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold small text-muted">STRENGTH</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. 500"
                  value={uploadMedicineData.strength}
                  onChange={(e) => handleUploadMedicineChange("strength", e.target.value)}
                  style={{ borderRadius: "8px", border: "2px solid #b2ebf2" }}
                />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold small text-muted">UNIT</Form.Label>
                <Form.Select
                  value={uploadMedicineData.unit}
                  onChange={(e) => handleUploadMedicineChange("unit", e.target.value)}
                  style={{ borderRadius: "8px", border: "2px solid #b2ebf2" }}
                >
                  <option value="">Select Unit</option>
                  {["G", "MG", "MCG", "MG", "ML", "CC", "IU", "MOL"].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold small text-muted">ROUTE</Form.Label>
                <Form.Select
                  value={uploadMedicineData.route}
                  onChange={(e) => handleUploadMedicineChange("route", e.target.value)}
                  style={{ borderRadius: "8px", border: "2px solid #b2ebf2" }}
                >
                  <option value="">Select Route</option>
                  {["ORAL", "IV", "IM", "SC", "LOCAL APPLICATION"].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={12}>
                <Form.Label className="fw-bold small text-muted text-uppercase">Medicine Status</Form.Label>
                <Form.Select
                  value={uploadMedicineData.status}
                  onChange={(e) => handleUploadMedicineChange("status", e.target.value)}
                  style={{ borderRadius: "8px", border: "2px solid #b2ebf2" }}
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

      <div className="text-center mb-5 pb-5 mt-4">
        <Button style={{ backgroundColor: "#00838f", borderColor: "#00838f", padding: "12px 60px", borderRadius: "50px", fontWeight: "800", fontSize: "14px", boxShadow: "0 10px 30px rgba(0, 131, 143, 0.3)", textTransform: "uppercase", letterSpacing: "1.5px" }}>
          <FeatherIcon icon="check-circle" size="20" className="me-2" /> FINALIZE DISCHARGE SUMMARY
        </Button>
      </div>
    </div>
  );
};

export default DischargeCard;

