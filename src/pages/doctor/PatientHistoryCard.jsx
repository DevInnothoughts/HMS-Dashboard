import React, { useState } from "react";
import { Row, Col, Form, Card, Nav, Button, Table } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";

const PatientHistoryCard = ({
  historyData,
  handleHistoryChange,
  handleHistoryCheckboxChange,
  handleInvestigationCommentChange,
  handleMedicationChange,
  loading
}) => {
  const [historyActiveSubTab, setHistoryActiveSubTab] = useState("piles");

  const subTabs = [
    { id: "piles", label: "Piles", icon: "plus-circle" },
    { id: "fistula", label: "Fistula", icon: "plus-circle" },
    { id: "hernia", label: "Hernia", icon: "plus-circle" },
    { id: "varicose", label: "Varicose Veins", icon: "plus-circle" },
    { id: "urinary", label: "Urinary Incontinence", icon: "plus-circle" },
    { id: "fecal", label: "Fecal Incontinence", icon: "plus-circle" },
    { id: "urology", label: "Urology", icon: "plus-circle" },
    { id: "ods", label: "ODS", icon: "plus-circle" },
    { id: "sinus", label: "Pilonidal Sinus", icon: "plus-circle" },
    { id: "circumcision", label: "Circumcision", icon: "plus-circle" }
  ];

  const renderHistorySubTabs = () => (
    <Card className="shadow-sm border-0 mb-3 overflow-hidden" style={{ borderRadius: "5px" }}>
      <Card.Header className="p-0 border-0">
        <Nav className="flex-nowrap overflow-auto custom-subnav px-1 py-1" style={{ backgroundColor: "#e0f2f1", gap: "4px" }}>
          {subTabs.map(st => (
            <Nav.Item key={st.id}>
              <Nav.Link
                active={historyActiveSubTab === st.id}
                onClick={() => setHistoryActiveSubTab(st.id)}
                className="text-center d-flex align-items-center justify-content-center"
                style={{
                  whiteSpace: "nowrap",
                  borderRadius: "30px",
                  padding: "8px 18px",
                  margin: "4px 2px",
                  fontWeight: "700",
                  fontSize: "12px",
                  transition: "all 0.3s ease-in-out",
                  backgroundColor: historyActiveSubTab === st.id ? "#00838f" : "#ffffff",
                  color: historyActiveSubTab === st.id ? "#ffffff" : "#006064",
                  border: historyActiveSubTab === st.id ? "1px solid #00838f" : "1px solid #e0f2f1",
                  boxShadow: historyActiveSubTab === st.id ? "0 4px 10px rgba(0, 131, 143, 0.4)" : "0 2px 4px rgba(0,0,0,0.05)",
                  cursor: "pointer"
                }}
              >
                {historyActiveSubTab === st.id && <FeatherIcon icon="check-circle" size="14" className="me-1" />}
                {st.label}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      </Card.Header>
      <Card.Body className="bg-white p-2" style={{ minHeight: "120px" }}>
        {historyActiveSubTab === "piles" && (
          <div className="animate__animated animate__fadeIn">
            <h6 className="fw-bold mb-2" style={{ color: "#00838f", fontSize: "14px" }}>Piles / PR Bleeding Symptoms</h6>
            <div className="d-flex flex-wrap gap-2 mb-2 p-5  rounded shadow-inner">
              {["PR Bleeding:Painless", "PR Bleeding:Painful", "Burning", "Pricking", "Itching", "Incomplete Evacuation", "Prolapse", "Swelling", "Pain at Anal Region", "Mucus Mixed Blood"].map(opt => (
                <Form.Check key={opt} label={opt} checked={historyData.piles_data.includes(opt)} onChange={() => handleHistoryCheckboxChange("piles_data", opt)} style={{ fontSize: "13px", fontWeight: "600" }} />
              ))}
            </div>
            <Form.Group>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Duration / Details</Form.Label>
              <Form.Control as="textarea" rows={1} value={historyData.piles_duration} onChange={(e) => handleHistoryChange("piles_duration", e.target.value)} style={{ borderRadius: "8px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
            </Form.Group>
          </div>
        )}
        {historyActiveSubTab === "fistula" && (
          <div className="animate__animated animate__fadeIn">
            <h6 className="fw-bold mb-2" style={{ color: "#00838f", fontSize: "14px" }}>Fistula Symptoms</h6>
            <div className="d-flex flex-wrap gap-2 mb-2 p-5  rounded shadow-inner">
              {["Pus Discharge", "Boil", "Watery Discharge", "Swelling near anal region"].map(opt => (
                <Form.Check key={opt} label={opt} checked={historyData.fistula_data.includes(opt)} onChange={() => handleHistoryCheckboxChange("fistula_data", opt)} style={{ fontSize: "13px", fontWeight: "600" }} />
              ))}
            </div>
            <Form.Group>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Duration / Details</Form.Label>
              <Form.Control as="textarea" rows={1} value={historyData.fistula_duration} onChange={(e) => handleHistoryChange("fistula_duration", e.target.value)} style={{ borderRadius: "8px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
            </Form.Group>
          </div>
        )}
        {historyActiveSubTab === "hernia" && (
          <div className="animate__animated animate__fadeIn">
            <h6 className="fw-bold mb-2" style={{ color: "#00838f", fontSize: "14px" }}>Hernia Details</h6>
            <div className="d-flex flex-wrap gap-2 mb-2 p-5 rounded shadow-inner">
              {["Swelling:Umbilical", "Right Inguinal", "Left Inguinal", "Swelling:Abdominal", "Reducible", "Nonreducible", "Past Sx"].map(opt => (
                <Form.Check key={opt} label={opt} checked={historyData.hernia_data.includes(opt)} onChange={() => handleHistoryCheckboxChange("hernia_data", opt)} style={{ fontSize: "13px", fontWeight: "600" }} />
              ))}
            </div>
            <Form.Group>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Duration / Details</Form.Label>
              <Form.Control as="textarea" rows={1} value={historyData.hernia_duration} onChange={(e) => handleHistoryChange("hernia_duration", e.target.value)} style={{ borderRadius: "8px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
            </Form.Group>
          </div>
        )}
        {historyActiveSubTab === "varicose" && (
          <div className="animate__animated animate__fadeIn">
            <h6 className="fw-bold mb-2" style={{ color: "#00838f", fontSize: "14px" }}>Varicose Veins History</h6>
            <div className="d-flex flex-wrap gap-2 mb-2 p-5 rounded shadow-inner">
              {["Pain", "Enlarged veins", "Swelling", "Ulcer", "Right", "Left", "B/L"].map(opt => (
                <Form.Check key={opt} label={opt} checked={historyData.varicose_data.includes(opt)} onChange={() => handleHistoryCheckboxChange("varicose_data", opt)} style={{ fontSize: "13px", fontWeight: "600" }} />
              ))}
            </div>
            <Form.Group>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Duration / Details</Form.Label>
              <Form.Control as="textarea" rows={1} value={historyData.varicose_duration} onChange={(e) => handleHistoryChange("varicose_duration", e.target.value)} style={{ borderRadius: "8px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
            </Form.Group>
          </div>
        )}
        {historyActiveSubTab === "urinary" && (
          <div className="animate__animated animate__fadeIn">
            <Form.Check label="Urinary Incontinence Present" checked={historyData.urinary_incontinence} onChange={(e) => handleHistoryChange("urinary_incontinence", e.target.checked)} className="mb-2 fw-bold" style={{ color: "#00838f", fontSize: "14px" }} />
            <Form.Group>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Duration / Frequency</Form.Label>
              <Form.Control as="textarea" rows={2} value={historyData.urinary_duration} onChange={(e) => handleHistoryChange("urinary_duration", e.target.value)} style={{ borderRadius: "8px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
            </Form.Group>
          </div>
        )}
        {historyActiveSubTab === "fecal" && (
          <div className="animate__animated animate__fadeIn">
            <Form.Check label="Fecal Incontinence Present" checked={historyData.fecal_incontinence} onChange={(e) => handleHistoryChange("fecal_incontinence", e.target.checked)} className="mb-2 fw-bold" style={{ color: "#00838f", fontSize: "14px" }} />
            <Form.Group>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Duration / Frequency</Form.Label>
              <Form.Control as="textarea" rows={2} value={historyData.fecal_duration} onChange={(e) => handleHistoryChange("fecal_duration", e.target.value)} style={{ borderRadius: "8px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
            </Form.Group>
          </div>
        )}
        {historyActiveSubTab === "urology" && (
          <div className="animate__animated animate__fadeIn">
            <h6 className="fw-bold mb-2" style={{ color: "#00838f", fontSize: "14px" }}>Urology Symptoms</h6>
            <div className="d-flex flex-wrap gap-2 mb-2 p-5 rounded shadow-inner">
              {["Pain", "Burning urination", "Nausea", "Vomiting", "LUTS", "Urgency of urination", "Incomplete evacuation", "Stream of urine", "Nocturia"].map(opt => (
                <Form.Check key={opt} label={opt} checked={historyData.urology_data.includes(opt)} onChange={() => handleHistoryCheckboxChange("urology_data", opt)} style={{ fontSize: "13px", fontWeight: "600" }} />
              ))}
            </div>
            <Form.Group>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Duration / Details</Form.Label>
              <Form.Control as="textarea" rows={1} value={historyData.urology_duration} onChange={(e) => handleHistoryChange("urology_duration", e.target.value)} style={{ borderRadius: "8px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
            </Form.Group>
          </div>
        )}
        {historyActiveSubTab === "ods" && (
          <div className="animate__animated animate__fadeIn">
            <h6 className="fw-bold mb-2" style={{ color: "#00838f", fontSize: "14px" }}>ODS Symptoms</h6>
            <div className="d-flex flex-wrap gap-2 mb-2 p-5 rounded shadow-inner">
              {["Excessive Straining", "Digitation", "Hard Stools", "Enema / Laxative", "Fragmented Defecation", "Chronic constipation", "Urgency", "Frequency"].map(opt => (
                <Form.Check key={opt} label={opt} checked={historyData.ods_data.includes(opt)} onChange={() => handleHistoryCheckboxChange("ods_data", opt)} style={{ fontSize: "13px", fontWeight: "600" }} />
              ))}
            </div>
            <Row className="g-2">
              <Col md={6}><Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Bowel Habits</Form.Label><Form.Control as="textarea" rows={1} value={historyData.ods_bowel_habits} onChange={(e) => handleHistoryChange("ods_bowel_habits", e.target.value)} style={{ borderRadius: "8px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} /></Col>
              <Col md={6}><Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Duration</Form.Label><Form.Control as="textarea" rows={1} value={historyData.ods_duration} onChange={(e) => handleHistoryChange("ods_duration", e.target.value)} style={{ borderRadius: "8px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} /></Col>
            </Row>
          </div>
        )}
        {historyActiveSubTab === "sinus" && (
          <div className="animate__animated animate__fadeIn">
            <h6 className="fw-bold mb-2" style={{ color: "#00838f", fontSize: "14px" }}>Pilonidal Sinus Details</h6>
            <div className="d-flex flex-wrap gap-2 mb-2 p-5 rounded shadow-inner">
              {["Pain", "Boil", "Swelling", "Pus / Watery Discharge"].map(opt => (
                <Form.Check key={opt} label={opt} checked={historyData.pilonidal_data.includes(opt)} onChange={() => handleHistoryCheckboxChange("pilonidal_data", opt)} style={{ fontSize: "13px", fontWeight: "600" }} />
              ))}
            </div>
            <Form.Group>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Additional Comments</Form.Label>
              <Form.Control as="textarea" rows={1} value={historyData.pilonidal_comment} onChange={(e) => handleHistoryChange("pilonidal_comment", e.target.value)} style={{ borderRadius: "8px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
            </Form.Group>
          </div>
        )}
        {historyActiveSubTab === "circumcision" && (
          <div className="animate__animated animate__fadeIn">
            <h6 className="fw-bold mb-2" style={{ color: "#00838f", fontSize: "14px" }}>Circumcision Details</h6>
            <Form.Control as="textarea" rows={3} placeholder="Enter details..." value={historyData.circumcision_comment} onChange={(e) => handleHistoryChange("circumcision_comment", e.target.value)} style={{ borderRadius: "8px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
          </div>
        )}
      </Card.Body>
    </Card>
  );

  return (
    <div className="animate__animated animate__fadeIn">
      {/* Date & Physical Metadata */}
      <div className="p-3 bg-white rounded shadow-sm border mb-3" style={{ borderLeft: "5px solid #00bcd4" }}>
        <h5 className="fw-bold mb-3" style={{ color: "#00838f", textTransform: "uppercase", letterSpacing: "1px", fontSize: "14px" }}>Clinical Measurements</h5>
        <Row>
          <Col md={4} className="mb-2">
            <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>Consultation Date</Form.Label>
            <Form.Control type="date" value={historyData.patient_date} onChange={(e) => handleHistoryChange("patient_date", e.target.value)} style={{ borderRadius: "10px", fontSize: "12px", border: "2px solid #b2ebf2", padding: "6px" }} />
          </Col>
          <Col md={4} className="mb-2">
            <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>Height (Feet/Inches)</Form.Label>
            <Form.Control type="text" value={historyData.height_feet} onChange={(e) => handleHistoryChange("height_feet", e.target.value)} placeholder="e.g. 5.11" style={{ borderRadius: "10px", fontSize: "12px", border: "2px solid #b2ebf2", padding: "6px 12px" }} />
          </Col>
          <Col md={4} className="mb-2">
            <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>Weight (kg)</Form.Label>
            <Form.Control type="text" value={historyData.weight_kg} onChange={(e) => handleHistoryChange("weight_kg", e.target.value)} placeholder="e.g. 70" style={{ borderRadius: "10px", fontSize: "12px", border: "2px solid #b2ebf2", padding: "6px 12px" }} />
          </Col>
        </Row>
      </div>

      {/* Sub-Speciality Selection */}
      <style>{` .custom-subnav::-webkit-scrollbar { height: 4px; } .custom-subnav::-webkit-scrollbar-thumb { background: #b2ebf2; border-radius: 10px; } `}</style>
      {renderHistorySubTabs()}

      {/* Vitals Section */}
      <div className="p-3 bg-white rounded shadow-sm border mb-3" style={{ borderLeft: "5px solid #00acc1" }}>
        <h5 className="fw-bold mb-3" style={{ color: "#00838f", textTransform: "uppercase", fontSize: "14px" }}>Vitals & Systemic Examination</h5>
        <div className="p-3 rounded mb-3" style={{ backgroundColor: "#f8fbfc", border: "2px solid #e0f2f1" }}>
          <Row>
            <Col md={3} className="mb-2">
              <Form.Label className="fw-bold" style={{ fontSize: "11px", color: "#006064" }}>Pain Score (1-10)</Form.Label>
              <Form.Select value={historyData.painscale} onChange={(e) => handleHistoryChange("painscale", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #80deea", padding: "6px 12px", fontSize: "12px" }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}
              </Form.Select>
            </Col>
            <Col md={3} className="mb-2">
              <Form.Label className="fw-bold" style={{ fontSize: "11px", color: "#006064" }}>BP (mm Hg)</Form.Label>
              <Form.Control value={historyData.vital_bp} onChange={(e) => handleHistoryChange("vital_bp", e.target.value)} placeholder="120/80" style={{ borderRadius: "10px", border: "2px solid #80deea", padding: "6px 12px", fontSize: "12px" }} />
            </Col>
            <Col md={3} className="mb-2">
              <Form.Label className="fw-bold" style={{ fontSize: "11px", color: "#006064" }}>Pulse (/min)</Form.Label>
              <Form.Control value={historyData.vital_pulse} onChange={(e) => handleHistoryChange("vital_pulse", e.target.value)} placeholder="72" style={{ borderRadius: "10px", border: "2px solid #80deea", padding: "6px 12px", fontSize: "12px" }} />
            </Col>
            <Col md={3} className="mb-5">
              <Form.Label className="fw-bold" style={{ fontSize: "11px", color: "#006064" }}>RR (/min)</Form.Label>
              <Form.Control value={historyData.vital_rr} onChange={(e) => handleHistoryChange("vital_rr", e.target.value)} placeholder="16" style={{ borderRadius: "10px", border: "2px solid #80deea", padding: "6px 12px", fontSize: "12px" }} />
            </Col>
            {['rs', 'cvs', 'cns', 'pa'].map(field => (
              <Col md={3} key={field}>
                <Form.Label className="fw-bold" style={{ fontSize: "11px", color: "#006064" }}>{field.toUpperCase()}</Form.Label>
                <Form.Control value={historyData[field]} onChange={(e) => handleHistoryChange(field, e.target.value)} placeholder={`Findings for ${field.toUpperCase()}`} style={{ borderRadius: "10px", border: "1px solid #b2ebf2", fontSize: "12px", padding: "6px 12px" }} />
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Summaries Section */}
      <div className="p-3 bg-white rounded shadow-sm border mb-3" style={{ borderLeft: "5px solid #0097a7" }}>
        <h5 className="fw-bold mb-3" style={{ color: "#00838f", textTransform: "uppercase", fontSize: "14px" }}>Medical History Summaries</h5>
        <div className="d-flex flex-column gap-2">
          {[
            { label: 'Family History', key: 'family_history', opts: ['Piles', 'Constipation ', 'DM', 'HTN', 'Heart Disease'], other: 'family_history_other' },
            { label: 'General Symptoms', key: 'general_history', opts: ['H/O Wt Loss', 'Dec Appetite ', 'H/O Straining for urination', 'Acidity', 'Gas', 'Bloating'], comment: 'weightloss_comment' },
            { label: 'Past Medical History', key: 'past_medical_history', opts: ['DM', 'HTN', 'Br Asthma', 'Thyroid', 'IHD', 'Migraine', 'Epilepsy', 'CKD', 'CLD', 'CVA', 'IBS', 'Insomnia'], other: 'past_medical_history_other' }
          ].map(sec => (
            <div key={sec.label} className="p-3 border rounded" style={{ backgroundColor: "#f1fcfd", border: "2px solid #b2ebf2" }}>
              <h6 className="fw-bold mb-2" style={{ color: "#006064", fontSize: "13px" }}>{sec.label}</h6>
              <div className="d-flex flex-wrap gap-3 mb-2">
                {sec.opts.map(opt => (
                  <Form.Check key={opt} label={opt} checked={historyData[sec.key].includes(opt)} onChange={() => handleHistoryCheckboxChange(sec.key, opt)} style={{ fontSize: "13px", fontWeight: "600" }} />
                ))}
              </div>
              {sec.other && <Form.Control size="sm" placeholder="Specify other conditions..." value={historyData[sec.other]} onChange={(e) => handleHistoryChange(sec.other, e.target.value)} style={{ borderRadius: "8px", border: "1px solid #80deea", fontSize: "13px" }} />}
              {sec.comment && historyData[sec.key].includes('H/O Wt Loss') && (
                <div className="mt-2 animate__animated animate__fadeIn">
                  <Form.Label className="fw-bold mb-1 text-danger" style={{ fontSize: "13px" }}>Weight Loss Details</Form.Label>
                  <Form.Control size="sm" placeholder="e.g. 5kg in 2 months" value={historyData[sec.comment]} onChange={(e) => handleHistoryChange(sec.comment, e.target.value)} style={{ borderRadius: "8px", border: "1px solid #ef9a9a", padding: "4px 8px", fontSize: "13px" }} />
                </div>
              )}
            </div>
          ))}
          {/* Habits */}
          <div className="p-3 border rounded" style={{ backgroundColor: "#f1fcfd", border: "2px solid #b2ebf2" }}>
            <h6 className="fw-bold mb-2" style={{ color: "#006064", fontSize: "13px" }}><FeatherIcon icon="activity" size="14" className="me-2" /> Habits</h6>
            <div className="d-flex flex-wrap gap-3">
              {['Smoking', 'Alcohol', 'Tobacco', 'Drugs'].map(h => (
                <Form.Check key={h} label={h} checked={historyData.habits.includes(h)} onChange={() => handleHistoryCheckboxChange("habits", h)} style={{ fontSize: "13px", fontWeight: "600" }} />
              ))}
            </div>
          </div>
          {/* Drug Allergies */}
          <div className="p-3 border rounded" style={{ backgroundColor: "#f1fcfd", border: "2px solid #b2ebf2" }}>
            <h6 className="fw-bold mb-2" style={{ color: "#006064", fontSize: "12px" }}><FeatherIcon icon="alert-triangle" size="14" className="me-2" /> Drug Allergies</h6>
            <Form.Control as="textarea" rows={1} placeholder="Specify any drug allergies..." value={historyData.drug_allergy} onChange={(e) => handleHistoryChange("drug_allergy", e.target.value)} style={{ borderRadius: "8px", border: "1px solid #80deea", fontSize: "13px", padding: "6px" }} />
          </div>
        </div>
      </div>

      {/* Medication & Habits */}
      <div className="p-3 bg-white rounded shadow-sm border mb-3" style={{ borderLeft: "5px solid #00bcd4" }}>
        <h5 className="fw-bold mb-3" style={{ color: "#00838f", textTransform: "uppercase", fontSize: "14px" }}>Medication, Habits & Complaints</h5>
        <Table responsive bordered hover className="mb-3 overflow-hidden" style={{ borderRadius: "10px", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr style={{ backgroundColor: "#00838f", color: "white" }}>
              <th className="p-2" style={{ fontSize: "12px" }}>#</th>
              <th className="p-2" style={{ fontSize: "12px" }}>Medication Name</th>
              <th className="p-2" style={{ fontSize: "12px" }}>Indication</th>
              <th className="p-2" style={{ fontSize: "12px" }}>Since</th>
            </tr>
          </thead>
          <tbody>
            {historyData.medication_history.map((row, idx) => (
              <tr key={idx}>
                <td className="text-center p-2 fw-bold" style={{ backgroundColor: "#f8fbfc", color: "#00838f", fontSize: "12px", verticalAlign: "middle" }}>{idx + 1}</td>
                <td className="p-1"><Form.Control value={row.medicine} onChange={(e) => handleMedicationChange(idx, "medicine", e.target.value)} placeholder="Medicine name" style={{ border: "1px solid #b2ebf2", borderRadius: "6px", padding: "8px", fontSize: "12px" }} /></td>
                <td className="p-1"><Form.Control value={row.indication} onChange={(e) => handleMedicationChange(idx, "indication", e.target.value)} placeholder="e.g. HTN" style={{ border: "1px solid #b2ebf2", borderRadius: "6px", padding: "8px", fontSize: "12px" }} /></td>
                <td className="p-1"><Form.Control value={row.since} onChange={(e) => handleMedicationChange(idx, "since", e.target.value)} placeholder="e.g. 1 year" style={{ border: "1px solid #b2ebf2", borderRadius: "6px", padding: "8px", fontSize: "12px" }} /></td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Row className="mt-2">
          <Col md={12} className="mb-3">
            <div className="h-100 p-3 border rounded shadow-sm" style={{ backgroundColor: "#fefdfa", borderLeft: "8px solid #ffe0b2" }}>
              <h6 className="fw-bold mb-2" style={{ color: "#00838f", fontSize: "13px" }}><FeatherIcon icon="layers" size="16" className="me-2" /> Surgical History & Other Notes</h6>
              <Form.Control as="textarea" rows={2} placeholder="Past surgical history..." className="mb-3" value={historyData.past_surgical_history} onChange={(e) => handleHistoryChange("past_surgical_history", e.target.value)} style={{ borderRadius: "10px", border: "1px solid #b2ebf2", padding: "8px", fontSize: "12px" }} />
              <h6 className="fw-bold mb-2" style={{ color: "#00838f", fontSize: "13px" }}><FeatherIcon icon="message-square" size="16" className="me-2" /> Any Other Complaints</h6>
              <Form.Control as="textarea" rows={2} placeholder="Describe other complaints..." value={historyData.any_other_complaints} onChange={(e) => handleHistoryChange("any_other_complaints", e.target.value)} style={{ borderRadius: "10px", border: "1px solid #b2ebf2", padding: "8px", fontSize: "12px" }} />
            </div>
          </Col>
        </Row>

        <Row className="mt-2">
          <Col md={12} className="mb-3">
            <div className="p-3 border rounded shadow-sm" style={{ borderLeft: "8px solid #00acc1", backgroundColor: "#fff" }}>
              <h6 className="fw-bold mb-2" style={{ color: "#00838f", fontSize: "13px" }}><FeatherIcon icon="help-circle" size="16" className="me-2" /> Present Complaints (C/O)</h6>
              <Form.Control as="textarea" rows={3} placeholder="Describe the current symptoms in detail..." value={historyData.present_complaints} onChange={(e) => handleHistoryChange("present_complaints", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #00acc1", fontSize: "12px", padding: "8px" }} />
            </div>
          </Col>
          <Col md={12} className="mb-3">
            <div className="p-3 border rounded shadow-sm" style={{ borderLeft: "8px solid #0097a7", backgroundColor: "#f1fcfd" }}>
              <h6 className="fw-bold mb-2" style={{ color: "#00838f", fontSize: "13px" }}><FeatherIcon icon="check-square" size="16" className="me-2" /> Ongoing Medicines</h6>
              <div className="d-flex flex-wrap gap-3 mb-2">
                {['Clopidogrel', 'Aspirin', 'Warfarin'].map(m => (
                  <Form.Check key={m} label={m} checked={historyData.ongoing_medicines.includes(m)} onChange={() => handleHistoryCheckboxChange("ongoing_medicines", m)} style={{ fontSize: "12px", fontWeight: "700" }} />
                ))}
              </div>
              <Form.Control as="textarea" rows={2} placeholder="Mention any other daily medications..." value={historyData.ongoing_medicines_other} onChange={(e) => handleHistoryChange("ongoing_medicines_other", e.target.value)} style={{ borderRadius: "10px", border: "1px solid #0097a7", fontSize: "12px", padding: "6px" }} />
            </div>
          </Col>
        </Row>
      </div>

      {/* Investigations Section */}
      <div className="p-3 bg-white rounded shadow-sm border mb-3" style={{ borderLeft: "5px solid #0097a7" }}>
        <h5 className="fw-bold mb-3" style={{ color: "#00838f", textTransform: "uppercase", fontSize: "14px" }}>External Investigations</h5>
        <div className="p-3 border rounded" style={{ backgroundColor: "#f8fbfc", border: "2px solid #e0f2f1" }}>
          <Row className="g-2">
            {[
              { id: "HB", label: "HB" }, { id: "BSL-R", label: "BSL-R" }, { id: "Bleding Time-BT", label: "Bleding Time - BT" },
              { id: "Clotting Time-BT", label: "Clotting Time - BT" }, { id: "PT INR", label: "PT INR" }, { id: "HIV", label: "HIV" },
              { id: "Hbsag", label: "Hbsag" }, { id: "SR.Creatinine", label: "Sr.Creatinine" }, { id: "Vit B12", label: "Vit B12" },
              { id: "HbA1C", label: "HbA1C" }, { id: "Thyroid", label: "Thyroid" }, { id: "LVEF", label: "LVEF" },
              { id: "Glucose Fasting", label: "Glucose Fasting & PP" }
            ].map(inv => (
              <Col md={4} key={inv.id} className="mb-2">
                <Form.Check label={inv.label} checked={historyData.investigations.includes(inv.id)} onChange={() => handleHistoryCheckboxChange("investigations", inv.id)} className="mb-1" style={{ fontWeight: "700", color: "#006064", fontSize: "11px" }} />
                {historyData.investigations.includes(inv.id) && (
                  <Form.Control size="sm" placeholder="Findings / Value" value={historyData.investigation_notes[inv.id] || ""} onChange={(e) => handleInvestigationCommentChange(inv.id, e.target.value)} className="animate__animated animate__fadeIn" style={{ borderRadius: "8px", border: "1px solid #00acc1", fontSize: "11px" }} />
                )}
              </Col>
            ))}
          </Row>
          <hr className="my-2" />
          <Row>
            <Col md={12}>
              <Form.Group className="mb-2">
                <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Upload Report Copy</Form.Label>
                <Form.Control type="file" onChange={(e) => handleHistoryChange("upload_investigation", e.target.files[0])} style={{ borderRadius: "10px", padding: "6px", border: "2px solid #b2ebf2", fontSize: "11px" }} />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Investigation Details</Form.Label>
                <Form.Control as="textarea" rows={3} placeholder="Investigation Details" value={historyData.investigation || ""} onChange={(e) => handleHistoryChange("investigation", e.target.value)} style={{ borderRadius: "10px", padding: "8px", border: "2px solid #b2ebf2", fontSize: "12px" }} />
              </Form.Group>
            </Col>
          </Row>
        </div>

        <Row className="mt-3 g-2">
          <Col md={6}>
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Known Case Of</Form.Label>
            <Form.Control as="textarea" rows={1} placeholder="Chronic conditions..." value={historyData.known_case_of} onChange={(e) => handleHistoryChange("known_case_of", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px", fontSize: "12px" }} />
          </Col>
          <Col md={6}>
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Assistance Doctor</Form.Label>
            <Form.Select value={historyData.assistance_doctor} onChange={(e) => handleHistoryChange("assistance_doctor", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px", fontSize: "12px" }}>
              <option value="">Select Assistance Doctor</option>
              <option value="1">Dr. Rajesh Kumar</option>
              <option value="2">Dr. Sneha Patil</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      <div className="text-center mb-5 pb-5">
        <Button
          disabled={loading}
          style={{ backgroundColor: "#00acc1", borderColor: "#00acc1", padding: "10px 40px", borderRadius: "40px", fontWeight: "800", fontSize: "13px", boxShadow: "0 8px 25px rgba(0, 172, 193, 0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>
          {loading ? <Spinner size="sm" className="me-2" /> : <FeatherIcon icon="save" size="18" className="me-2" />}
          SAVE PATIENT HISTORY
        </Button>
      </div>
    </div>
  );
};

export default PatientHistoryCard;
