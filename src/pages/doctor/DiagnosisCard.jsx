import React from "react";
import { Row, Col, Card, Nav, Form, Button, Spinner, Dropdown } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import { generateDiagnosisStream } from "../../utils/aiDiagnosisHelper";
import { toast } from "react-hot-toast";


const DiagnosisCard = ({
  diagnosisData,
  handleDiagnosisChange,
  handleDiagnosisCheckboxChange,
  handleSpecialityCheckboxChange,
  handleMedicalAdviceNoteChange,
  loading,
  setDiagnosisData,
  previousDiagnosisList = [],
  selectedDiagnosisId = null,
  onSelectDiagnosis,
  onNewDiagnosis,
  onSaveDiagnosis,
  onPrintDiagnosis,
  doctors = [],
  assistanceDoctors = []
}) => {
  const [aiLoading, setAiLoading] = React.useState(false);

  const handleAIGenerateDiagnosis = async () => {
    // Collect all specialties that have data
    const allFindings = {};

    Object.entries(diagnosisData.speciality_data || {}).forEach(([spec, data]) => {
      if (Array.isArray(data)) {
        if (data.length > 0) allFindings[spec] = data.join(", ");
      } else if (typeof data === "string" && data.trim() !== "") {
        allFindings[spec] = data.trim();
      }
    });

    if (Object.keys(allFindings).length === 0) {
      toast.error("Please select at least one specialty sub-type or enter findings.");
      return;
    }

    setAiLoading(true);
    handleDiagnosisChange("diagnosis_text", "");

    await generateDiagnosisStream({
      allFindings, // Pass all findings instead of just one
      onChunk: (text) => {
        handleDiagnosisChange("diagnosis_text", text);
      },
      onComplete: () => {
        setAiLoading(false);
        toast.success("Unified diagnosis generated successfully!");
      },
      onError: (err) => {
        setAiLoading(false);
        toast.error(`Error: ${err}`);
      }
    });
  };

  return (
    <div className="animate__animated animate__fadeIn">
      <style>{`
        .form-check-input { border: 1px solid black !important; }
        .form-check-input:checked { background-color: #00838f; border-color: black !important; }
      `}</style>
      {/* 1. Primary Diagnosis Section */}
      <div className="p-3 bg-white rounded shadow-sm border mb-3" style={{ borderLeft: "5px solid #00bcd4" }}>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0" style={{ color: "#00838f", textTransform: "uppercase", letterSpacing: "1px", fontSize: "14px" }}>
            <FeatherIcon icon="activity" size="18" className="me-2 text-info" />Primary Diagnosis & Orders
          </h5>
          <div className="d-flex gap-2">
            <Button
              variant="outline-info"
              size="sm"
              onClick={onNewDiagnosis}
              style={{ borderRadius: "20px", fontSize: "12px", fontWeight: "700", padding: "7px 10px" }}
            >
              <FeatherIcon icon="plus" size="13" className="me-1" /> NEW RECORD
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onPrintDiagnosis}
              style={{ borderRadius: "20px", fontSize: "12px", fontWeight: "700", padding: "7px 10px" }}
            >
              <FeatherIcon icon="printer" size="13" className="me-1" /> PRINT
            </Button>
            <Dropdown onSelect={onSelectDiagnosis}>
              <Dropdown.Toggle
                variant="outline-info"
                id="previous-diagnosis-dropdown"
                size="sm"
                style={{ borderRadius: "20px", fontSize: "12px", fontWeight: "700", padding: "7px 10px" }}
              >
                <FeatherIcon icon="calendar" size="13" className="me-1" /> PREVIOUS DATES
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ fontSize: "12px", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                {previousDiagnosisList.length > 0 ? (
                  previousDiagnosisList.map((diag) => (
                    <Dropdown.Item key={diag.id} eventKey={diag.id}>
                      {diag.date} {diag.id === selectedDiagnosisId && <FeatherIcon icon="check" size="12" className="ms-2 text-success" />}
                    </Dropdown.Item>
                  ))
                ) : (
                  <Dropdown.Item disabled>No previous records</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
        <Row>
          <Col md={2} className="mb-3">
            <Form.Label className="fw-bold" style={{ fontSize: "11px", color: "#006064" }}>Diagnosis Date</Form.Label>
            <Form.Control type="date" value={diagnosisData.date_diagnosis} onChange={(e) => handleDiagnosisChange("date_diagnosis", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          {/* <Col md={5} className="mb-3">
            <Form.Label className="fw-bold" style={{ fontSize: "11px", color: "#006064" }}>Investigation Orders</Form.Label>
            <Form.Control as="textarea" rows={2} value={diagnosisData.investigation_orders} onChange={(e) => handleDiagnosisChange("investigation_orders", e.target.value)} placeholder="e.g. USG, CBC, Chest X-Ray..." style={{ borderRadius: "8px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "13px" }} />
          </Col> */}
          <Col md={10} className="mb-2">
            <div className="d-flex justify-content-between align-items-end mb-1">
              <Form.Label className="fw-bold mb-0" style={{ fontSize: "11px", color: "#006064" }}>Diagnosis <span className="text-danger">*</span></Form.Label>
              <small className="fw-bold" style={{ fontSize: "10px", fontStyle: "italic", fontWeight: "700" }}>
                <FeatherIcon icon="info" size="12  " className="me-1 text-info" />
                Select findings below to generate AI diagnosis
              </small>
            </div>
            <Form.Control as="textarea" rows={7} placeholder="Diagnosis will appear here..." value={diagnosisData.diagnosis_text} onChange={(e) => handleDiagnosisChange("diagnosis_text", e.target.value)} required style={{ borderRadius: "10px", border: "2px solid #eda6a6ff", fontSize: "12px", padding: "6px 12px" }} />
          </Col>
        </Row>
      </div>

      {/* 2. Management Advice Types */}
      <div className="p-3 bg-white rounded shadow-sm border mb-3 d-flex flex-wrap align-items-center gap-3" style={{ borderLeft: "5px solid #00838f" }}>
        <h5 className="fw-bold mb-0" style={{ color: "#00838f", textTransform: "uppercase", fontSize: "14px", minWidth: "100px", padding: "10px" }}>Advice Type</h5>
        <div className="d-flex flex-wrap gap-3 align-items-center px-3" style={{ borderLeft: "2px solid #b2ebf2" }}>
          {["Medication", "Surgery", "Test", "NCDPA", "Referred to another doctor"].map(type => (
            <Form.Check
              key={type}
              label={type}
              checked={diagnosisData.advice_types.includes(type)}
              onChange={() => handleDiagnosisCheckboxChange("advice_types", type)}
              disabled={
                (type === "Medication" && diagnosisData.advice_types.includes("Surgery")) ||
                (type === "Surgery" && diagnosisData.advice_types.includes("Medication"))
              }
              className="mb-0"
              style={{ fontSize: "13px", fontWeight: "600" }}
            />
          ))}
        </div>
        {diagnosisData.advice_types.includes("Test") && (
          <div className="ms-auto flex-grow-1 animate__animated animate__fadeInRight" style={{ minWidth: "250px" }}>
            <Form.Control
              as="textarea"
              rows={1}
              placeholder="Other / Test Comment"
              value={diagnosisData.diagnosis_comment}
              onChange={(e) => handleDiagnosisChange("diagnosis_comment", e.target.value)}
              style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px", minHeight: "80px" }}
            />
          </div>
        )}
      </div>

      {/* 3. Speciality Specific Details */}
      <Card className="mb-3 shadow-sm border-0 overflow-hidden" style={{ borderRadius: "15px" }}>
        <Card.Header className="p-0 border-0">
          <Nav className="flex-nowrap overflow-auto custom-subnav px-1 py-1" style={{ backgroundColor: "#e0f2f1", gap: "4px" }}>
            {[
              { id: "piles", label: "Piles" }, { id: "fistula", label: "Fistula" }, { id: "hernia", label: "Hernia" },
              { id: "varicosevein", label: "Varicose Veins" }, { id: "prolapse", label: "Prolapse" }, { id: "circumcision", label: "Circumcision" },
              { id: "abscess", label: "Abscess" }, { id: "fissure", label: "Fissure" }, { id: "ibs", label: "IBS" }, { id: "urology", label: "Urology" }
            ].map(sub => (
              <Nav.Item key={sub.id}>
                <Nav.Link
                  active={diagnosisData.active_speciality === sub.id}
                  onClick={() => handleDiagnosisChange("active_speciality", sub.id)}
                  className="text-center d-flex align-items-center justify-content-center"
                  style={{
                    whiteSpace: "nowrap",
                    borderRadius: "30px",
                    padding: "8px 29px",
                    margin: "4px 2px",
                    fontWeight: "700",
                    fontSize: "11px",
                    transition: "all 0.3s ease-in-out",
                    backgroundColor: diagnosisData.active_speciality === sub.id ? "#00838f" : "#ffffff",
                    color: diagnosisData.active_speciality === sub.id ? "#ffffff" : "#006064",
                    border: diagnosisData.active_speciality === sub.id ? "1px solid #00838f" : "1px solid #e0f2f1",
                    boxShadow: diagnosisData.active_speciality === sub.id ? "0 4px 10px rgba(0, 131, 143, 0.4)" : "0 2px 4px rgba(0,0,0,0.05)",
                    cursor: "pointer"
                  }}
                >
                  {diagnosisData.active_speciality === sub.id && <FeatherIcon icon="check-circle" size="14" className="me-1" />}
                  {sub.label}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Card.Header>
        <Card.Body className="bg-white p-2" style={{ minHeight: "120px" }}>
          <div className="animate__animated animate__fadeIn">
            {diagnosisData.active_speciality === "piles" && (
              <div className="d-flex flex-wrap gap-3 mb-2 p-5 rounded shadow-inner">
                {["GRADE 1", "GRADE 2", "GRADE 3", "GRADE 4"].map(g => (
                  <Form.Check key={g} label={g} checked={diagnosisData.speciality_data.piles.includes(g)} onChange={() => handleSpecialityCheckboxChange("piles", g)} style={{ fontSize: "11px", fontWeight: "600", color: "#006064" }} />
                ))}
              </div>
            )}
            {diagnosisData.active_speciality === "fistula" && (
              <div className="d-flex flex-wrap gap-3 mb-2 p-5 rounded shadow-inner">
                {["GLUTEAL", "HIGH", "HORSESHOE", "NIDAL", "SCROTAL", "SUPRALEVATOR", "TRANSPHINCTERIC", "INTERSPHINCTERIC", "VAGINAL", "VULVAL", "COMPLEX", "RECURRENT"].map(f => (
                  <Form.Check key={f} label={f} checked={diagnosisData.speciality_data.fistula.includes(f)} onChange={() => handleSpecialityCheckboxChange("fistula", f)} style={{ fontSize: "11px", fontWeight: "600", color: "#006064" }} />
                ))}
              </div>
            )}
            {diagnosisData.active_speciality === "hernia" && (
              <div className="d-flex flex-wrap gap-3 mb-2 p-5 rounded shadow-inner">
                {["VENTRAL", "INCISIONAL", "EPIGASTRIC", "RIGHT INGUINAL", "LEFT INGUINAL", "BILATERAL INGUINAL", "SUPRA UMBILICAL", "PARA UMBILICAL", "MULTIPLE DEFECTS UMBILICAL", "INFRA UMBILICAL"].map(h => (
                  <Form.Check key={h} label={h} checked={diagnosisData.speciality_data.hernia.includes(h)} onChange={() => handleSpecialityCheckboxChange("hernia", h)} style={{ fontSize: "11px", fontWeight: "600", color: "#006064" }} />
                ))}
              </div>
            )}
            {diagnosisData.active_speciality === "varicosevein" && (
              <div className="d-flex flex-wrap gap-3 mb-2 p-5 rounded shadow-inner">
                {["RIGHT", "LEFT", "BILATERAL"].map(v => (
                  <Form.Check key={v} label={v} checked={diagnosisData.speciality_data.varicosevein && diagnosisData.speciality_data.varicosevein.includes(v)} onChange={() => handleSpecialityCheckboxChange("varicosevein", v)} style={{ fontSize: "11px", fontWeight: "600", color: "#006064" }} />
                ))}
              </div>
            )}
            {diagnosisData.active_speciality === "prolapse" && (
              <div className="d-flex flex-wrap gap-3 mb-2 p-5 rounded shadow-inner">
                {["MUCOSAL", "INCOMPLETE", "PROCIDENTIA"].map(p => (
                  <Form.Check key={p} label={p} checked={diagnosisData.speciality_data.prolapse.includes(p)} onChange={() => handleSpecialityCheckboxChange("prolapse", p)} style={{ fontSize: "11px", fontWeight: "600", color: "#006064" }} />
                ))}
              </div>
            )}
            {["circumcision", "abscess", "fissure", "ibs", "urology"].includes(diagnosisData.active_speciality) && (
              <Form.Control as="textarea" rows={3} placeholder={`Enter specific findings for ${diagnosisData.active_speciality.toUpperCase()}...`} value={diagnosisData.speciality_data[diagnosisData.active_speciality]} onChange={(e) => {
                const val = e.target.value;
                setDiagnosisData(prev => ({
                  ...prev,
                  speciality_data: { ...prev.speciality_data, [diagnosisData.active_speciality]: val }
                }));
              }} style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
            )}

            {diagnosisData.active_speciality && (
              <div className="mt-4 text-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAIGenerateDiagnosis}
                  disabled={aiLoading}
                  style={{
                    backgroundColor: "#00838f",
                    borderColor: "#00838f",
                    borderRadius: "30px",
                    fontWeight: "700",
                    padding: "8px 20px",
                    fontSize: "12px",
                    boxShadow: "0 4px 10px rgba(0, 131, 143, 0.2)",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
                  onMouseOut={(e) => e.target.style.transform = "scale(1)"}
                >
                  {aiLoading ? (
                    <><Spinner size="sm" className="me-2" /> ANALYZING...</>
                  ) : (
                    <><FeatherIcon icon="cpu" size="14" className="me-2" /> GENERATE AI DIAGNOSIS</>
                  )}
                </Button>
              </div>
            )}
          </div>

        </Card.Body>
      </Card>

      {/* 4. Medications & Surgical Advice */}
      <div className="p-3 bg-white rounded shadow-sm border mb-3" style={{ borderLeft: "5px solid #0097a7" }}>
        <h5 className="fw-bold" style={{ color: "#00838f", textTransform: "uppercase", fontSize: "14px", padding: "5px" }}>Medicines & Procedures</h5>

        {/* <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
            <h6 className="fw-bold mb-0" style={{ color: "#006064", fontSize: "13px", minWidth: "150px" }}>Medicines Prescribed</h6>
            <div className="d-flex flex-wrap gap-3 align-items-center px-3" style={{ borderLeft: "2px solid #b2ebf2" }}>
              {["AAC", "PROBIOTICS", "NSAIDS", "ANTIBIOTICS", "ANTACID"].map(m => (
                <Form.Check key={m} label={m} checked={diagnosisData.medicines_prescribed.includes(m)} onChange={() => handleDiagnosisCheckboxChange("medicines_prescribed", m)} className="mb-0" style={{ fontSize: "11px", fontWeight: "600", color: "#006064" }} />
              ))}
            </div>
            <div className="flex-grow-1" style={{ minWidth: "200px", maxWidth: "400px" }}>
              <Form.Control
                size="sm"
                placeholder="Other Medications..."
                value={diagnosisData.other_meds || ""}
                onChange={(e) => handleDiagnosisChange("other_meds", e.target.value)}
                style={{ width: "100%", borderRadius: "8px", border: "1px solid #80deea", padding: "6px 12px", fontSize: "13px" }}
              />
            </div>
          </div>
          <hr className="my-3" style={{ borderColor: "#b2ebf2" }} /> */}
        <Row>
          <Col md={4} className="mb-2">
            <Form.Label className="fw-bold" style={{ fontSize: "13px", color: "#006064" }}>Surgical Advice</Form.Label>
            <Form.Control as="textarea" rows={2} placeholder="Describe recommended surgery..." value={diagnosisData.surgical_advice} onChange={(e) => handleDiagnosisChange("surgical_advice", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          <Col md={4} className="mb-10">
            <Form.Label className="fw-bold" style={{ fontSize: "13px", color: "#006064" }}>Comment</Form.Label>
            <Form.Control as="textarea" rows={2} placeholder="Additional advice or comments..." value={diagnosisData.general_comment} onChange={(e) => handleDiagnosisChange("general_comment", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          {/* <Col md={4} style={{ marginTop: "50px" }}>
              <div className="d-flex align-items-center gap-3 p-10 rounded" style={{ backgroundColor: "#63ebe8ff" }}>
                <Form.Check type="checkbox" label="Check Surgical Date" checked={diagnosisData.has_surgical_date} onChange={(e) => handleDiagnosisChange("has_surgical_date", e.target.checked)} style={{ fontSize: "14px", fontWeight: "700", color: "#000000ff" }} />
                {diagnosisData.has_surgical_date && (
                  <Form.Control type="date" value={diagnosisData.surgical_date} onChange={(e) => handleDiagnosisChange("surgical_date", e.target.value)} className="animate__animated animate__fadeInLeft" style={{ width: "125px", borderRadius: "8px", border: "2px solid #00acc1", padding: "4px 8px", fontSize: "13px" }} />
                )}
              </div>
            </Col> */}
        </Row>
      </div>

      {/* 5. Payments & Administration */}
      <div className="p-3 bg-white rounded shadow-sm border mb-3 d-flex flex-wrap align-items-center gap-3" style={{ borderLeft: "5px solid #00838f" }}>
        <h5 className="fw-bold mb-0" style={{ color: "#00838f", textTransform: "uppercase", fontSize: "14px", minWidth: "50px" }}>Category</h5>
        <div className="d-flex flex-wrap gap-3 align-items-center px-3" style={{ borderLeft: "2px solid #b2ebf2" }}>
          {["Cashless", "Reimbursement", "HHF", "Cash"].map(cat => (
            <Form.Check key={cat} label={cat} checked={diagnosisData.categories.includes(cat)} onChange={() => handleDiagnosisCheckboxChange("categories", cat)} className="mb-0" style={{ color: "#00838f", fontSize: "13px", fontWeight: "700" }} />
          ))}
        </div>
        <div className="ms-auto flex-grow-1" style={{ minWidth: "250px" }}>
          <Form.Control as="textarea" rows={1} placeholder="Estimate Package..." value={diagnosisData.category_comment} onChange={(e) => handleDiagnosisChange("category_comment", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
        </div>
      </div>

      {/* 6. Medical Advice & Procedures */}
      <div className="p-3 bg-white rounded shadow-sm border mb-3" style={{ borderLeft: "5px solid #00acc1" }}>
        <h5 className="fw-bold mb-3" style={{ color: "#00838f", textTransform: "uppercase", fontSize: "14px", padding: "5px" }}>Detailed Advice & Lab Orders</h5>
        <div className="p-3 border rounded" style={{ backgroundColor: "#f1fcfd", border: "2px solid #b2ebf2" }}>
          <Row>
            {[
              "MCDPA", "Uroflowmetry", "CHT", "Biofeedback", "Manometry", "Colo", "Gastro", "Lab Investigation", "Diet", "X-ray", "CT", "Ultrasonography", "ECHO", "MRI", "Doppler", "3D Endo Anal Imaging", "Bugspeaks"
            ].map(advice => (
              <Col md={3} key={advice} className="mb-3">
                <Form.Check label={advice.toUpperCase()} checked={diagnosisData.medical_advice.includes(advice)} onChange={() => handleDiagnosisCheckboxChange("medical_advice", advice)} className="mb-1" style={{ fontSize: "13px", fontWeight: "700", color: "#006064" }} />
                {diagnosisData.medical_advice.includes(advice) && (
                  <Form.Control size="sm" placeholder={`Notes for ${advice}`} value={diagnosisData.medical_advice_notes[advice] || ""} onChange={(e) => handleMedicalAdviceNoteChange(advice, e.target.value)} className="animate__animated animate__fadeIn" style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
                )}
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* 7. Responsible Doctors */}
      <div className="p-3 bg-white rounded shadow-sm border mb-3" style={{ borderLeft: "5px solid #0097a7" }}>
        <h5 className="fw-bold" style={{ color: "#00838f", textTransform: "uppercase", fontSize: "14px", padding: "5px" }}>Doctor Allocation</h5>
        <Row className="g-2">
          <Col md={6}>
            <Form.Label className="fw-bold" style={{ fontSize: "12px" }}>Consultant Doctor</Form.Label>
            <Form.Select value={diagnosisData.consultant_doctor} onChange={(e) => handleDiagnosisChange("consultant_doctor", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}>
              <option value="">Select Consultant Doctor</option>
              {doctors.map((doc) => (
                <option key={doc.doctor_id} value={doc.doctor_id}>
                  {doc.name}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={6}>
            <Form.Label className="fw-bold" style={{ fontSize: "12px" }}>Assistant Doctor</Form.Label>
            <Form.Select value={diagnosisData.assistance_doctor} onChange={(e) => handleDiagnosisChange("assistance_doctor", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}>
              <option value="">Select Assistant Doctor</option>
              {assistanceDoctors.map((doc) => (
                <option key={doc.doctor_id} value={doc.doctor_id}>
                  {doc.name}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>
      </div>

      <div className="text-center mb-5 pb-5 mt-4">
        <Button
          onClick={onSaveDiagnosis}
          disabled={loading}
          style={{ backgroundColor: "#00838f", borderColor: "#00838f", padding: "10px 40px", borderRadius: "50px", fontWeight: "800", fontSize: "13px", boxShadow: "0 8px 25px rgba(0, 131, 143, 0.2)", textTransform: "uppercase", letterSpacing: "1px" }}>
          {loading ? <Spinner size="sm" className="me-2" /> : <FeatherIcon icon="save" size="18" className="me-2" />}
          SAVE DIAGNOSIS DATA
        </Button>
      </div>
    </div>
  );
};

export default DiagnosisCard;
