import React from "react";
import { Row, Col, Card, Nav, Form, Button, Spinner, Dropdown } from "react-bootstrap";
import Select from "react-select";
import FeatherIcon from "feather-icons-react";
import { generateDiagnosisStream } from "../../utils/aiDiagnosisHelper";
import { toast } from "react-hot-toast";
const fistulaDetailedOptions = [
  { value: "Abscess at 12 O Clock", label: "Abscess at 12 O Clock" },
  { value: "Abscess at 12 O Clock with Intersphincteric Extension", label: "Abscess at 12 O Clock with Intersphincteric Extension" },
  { value: "Abscess At 12 O Clock With Scrotal Extension", label: "Abscess At 12 O Clock With Scrotal Extension" },
  { value: "Supralevator Extension", label: "Supralevator Extension" },
  { value: "Intersphincteric Horseshoe Fistula With Abscess  (POSTERIOR)", label: "Intersphincteric Horseshoe Fistula With Abscess  (POSTERIOR)" },
  { value: "Intersphincteric Horseshoe Fistula With (ANTERIOR)", label: "Intersphincteric Horseshoe Fistula With (ANTERIOR)" },
  { value: "B/L Intersphincteric Horseshoe Fistula With Bilateral Supralevator Abscess", label: "B/L Intersphincteric Horseshoe Fistula With Bilateral Supralevator Abscess" },
  { value: "Intersphincteric Horseshoe Fistula With Right Supralevator Abscess", label: "Intersphincteric Horseshoe Fistula With Right Supralevator Abscess" },
  { value: "Intersphincteric Horseshoe Fistula With LEFT Supralevator Abscess", label: "Intersphincteric Horseshoe Fistula With LEFT Supralevator Abscess" },
  { value: "Right/ LEFT Supralevator Abscess", label: "Right/ LEFT Supralevator Abscess" },
  { value: "Transphincteric Fistula With Horseshoe Intersphincteric Extension", label: "Transphincteric Fistula With Horseshoe Intersphincteric Extension" },
  { value: "Transphincteric Fistula With Left Intersphincteric Extension", label: "Transphincteric Fistula With Left Intersphincteric Extension" },
  { value: "Transphincteric Fistula With RIGHT Intersphincteric Extension", label: "Transphincteric Fistula With RIGHT Intersphincteric Extension" },
  { value: "Transphincteric Fistula With Left Supralevator Abscess", label: "Transphincteric Fistula With Left Supralevator Abscess" },
  { value: "Transphincteric Fistula With Right Supralevator Abscess", label: "Transphincteric Fistula With Right Supralevator Abscess" },
  { value: "Fistula With Abscess-1 O clock position", label: "Fistula With Abscess-1 O clock position" },
  { value: "Anterior Transphincteric", label: "Anterior Transphincteric" },
  { value: "Fistula With Abscess-2 0o clock position", label: "Fistula With Abscess-2 0o clock position" },
  { value: "Circumferential Intersphincteric Abscess", label: "Circumferential Intersphincteric Abscess" },
  { value: "Circumferential Intersphincteric Abscess 1", label: "Circumferential Intersphincteric Abscess 1" },
  { value: "Deep Anal Abscess or Abscess at 6 O'Clock", label: "Deep Anal Abscess or Abscess at 6 O'Clock" },
  { value: "anterior Horseshoe Fistula With Bilateral Supralevator Extension", label: "anterior Horseshoe Fistula With Bilateral Supralevator Extension" },
  { value: "posterior Horseshoe Fistula With Bilateral Supralevator Extension", label: "posterior Horseshoe Fistula With Bilateral Supralevator Extension" },
  { value: "Abscess at 6 O Clock", label: "Abscess at 6 O Clock" },
  { value: "Abscess at 7 O Clock", label: "Abscess at 7 O Clock" },
  { value: "Anterior Horseshoe Fistula with Abscess at 12 O Clock With Scrotal - Vulval Extension", label: "Anterior Horseshoe Fistula with Abscess at 12 O Clock With Scrotal - Vulval Extension" },
  { value: "Anterior Horseshoe Fistula With Intersphincteric Abscess", label: "Anterior Horseshoe Fistula With Intersphincteric Abscess" },
  { value: "Anterior Transphincteric /posterior transphinteric", label: "Anterior Transphincteric /posterior transphinteric" },
  { value: "recto vaginal fistula with high rectal perforation", label: "recto vaginal fistula with high rectal perforation" },
  { value: "urethral fistula", label: "urethral fistula" }
];

const globalFindingsOptions = [
  // Piles
  { value: "GRADE 1 HEMORRHOIDS", label: "Piles: Grade 1 Hemorrhoids", specialty: "piles" },
  { value: "GRADE 2 HEMORRHOIDS", label: "Piles: Grade 2 Hemorrhoids", specialty: "piles" },
  { value: "GRADE 3 HEMORRHOIDS", label: "Piles: Grade 3 Hemorrhoids", specialty: "piles" },
  { value: "GRADE 4 HEMORRHOIDS", label: "Piles: Grade 4 Hemorrhoids", specialty: "piles" },
  // Fistula
  { value: "GLUTEAL", label: "Fistula: Gluteal", specialty: "fistula" },
  { value: "HIGH", label: "Fistula: High", specialty: "fistula" },
  { value: "HORSESHOE", label: "Fistula: Horseshoe", specialty: "fistula" },
  { value: "SCROTAL", label: "Fistula: Scrotal", specialty: "fistula" },
  { value: "SUPRALEVATOR", label: "Fistula: Supralevator", specialty: "fistula" },
  { value: "TRANSPHINCTERIC", label: "Fistula: Transphincteric", specialty: "fistula" },
  { value: "INTERSPHINCTERIC", label: "Fistula: Intersphincteric", specialty: "fistula" },
  { value: "VAGINAL", label: "Fistula: Vaginal", specialty: "fistula" },
  // Hernia
  { value: "VENTRAL", label: "Hernia: Ventral", specialty: "hernia" },
  { value: "INCISIONAL", label: "Hernia: Incisional", specialty: "hernia" },
  { value: "EPIGASTRIC", label: "Hernia: Epigastric", specialty: "hernia" },
  { value: "RIGHT INGUINAL", label: "Hernia: Right Inguinal", specialty: "hernia" },
  { value: "LEFT INGUINAL", label: "Hernia: Left Inguinal", specialty: "hernia" },
  { value: "BILATERAL INGUINAL", label: "Hernia: Bilateral Inguinal", specialty: "hernia" },
  // Prolapse
  { value: "MUCOSAL", label: "Prolapse: Mucosal", specialty: "prolapse" },
  { value: "INCOMPLETE", label: "Prolapse: Incomplete", specialty: "prolapse" },
  { value: "PROCIDENTIA", label: "Prolapse: Procidentia", specialty: "prolapse" },
  // Others
  { value: "SEBACEOUS", label: "Cyst: Sebaceous", specialty: "cyst" },
  { value: "DERMOID CYST", label: "Cyst: Dermoid", specialty: "cyst" },
  { value: "SINGLE", label: "Lipoma: Single", specialty: "lipoma" },
  { value: "MULTIPLE", label: "Lipoma: Multiple", specialty: "lipoma" },
  { value: "GRADE 1", label: "Gynecomastia: Grade 1", specialty: "gynecomastia" },
  { value: "GRADE 2", label: "Gynecomastia: Grade 2", specialty: "gynecomastia" },
  { value: "GRADE 3", label: "Gynecomastia: Grade 3", specialty: "gynecomastia" },
  { value: "ACUTE FISSURE", label: "Fissure: Acute", specialty: "fissure" },
  { value: "CHRONIC FISSURE", label: "Fissure: Chronic", specialty: "fissure" },
  { value: "PERIANAL ABSCESS", label: "Abscess: Perianal", specialty: "abscess" },
  { value: "PILONIDAL SINUS", label: "Pilonidal Sinus", specialty: "pilonidalsinus" },
  { value: "VARICOSE VEINS", label: "Varicose Veins", specialty: "varicosevein" },
];



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
  const [lastAutoGeneratedData, setLastAutoGeneratedData] = React.useState(null);

  const handleAIGenerateDiagnosis = async (isAuto = false) => {
    // Collect all specialties that have data
    const allFindings = {};
    const detailedFindingsArr = [];

    const specialtyFindings = {};
    Object.entries(diagnosisData.speciality_data || {}).forEach(([key, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim() === '')) return;

      // Determine the base specialty name (e.g., fistula, piles, hernia)
      let baseKey = key;
      if (key.endsWith("_detailed_findings")) baseKey = key.replace("_detailed_findings", "");
      else if (key.endsWith("_other")) baseKey = key.replace("_other", "");

      const findingStr = Array.isArray(value) ? value.join(", ") : value.trim();
      
      if (!specialtyFindings[baseKey]) {
          specialtyFindings[baseKey] = [];
      }
      specialtyFindings[baseKey].push(findingStr);
    });

    Object.entries(specialtyFindings).forEach(([spec, findingsArr]) => {
        allFindings[spec] = findingsArr.join(" | ");
    });

    // Add other relevant comments to detailed findings
    if (diagnosisData.general_comment?.trim()) {
      detailedFindingsArr.push(`GENERAL COMMENT: ${diagnosisData.general_comment.trim()}`);
    }
    if (diagnosisData.diagnosis_comment?.trim()) {
      detailedFindingsArr.push(`ADVICE COMMENT: ${diagnosisData.diagnosis_comment.trim()}`);
    }

    // Add medical advice notes
    if (diagnosisData.medical_advice_notes) {
      Object.entries(diagnosisData.medical_advice_notes).forEach(([advice, note]) => {
        if (note?.trim()) {
          detailedFindingsArr.push(`${advice.toUpperCase()} NOTES: ${note.trim()}`);
        }
      });
    }

    const detailedFindings = detailedFindingsArr.join("\n");

    if (Object.keys(allFindings).length === 0 && !detailedFindings) {
      if (!isAuto) toast.error("Please select at least one specialty sub-type or enter findings.");
      return;
    }

    // Check if data changed enough to justify auto-generation
    const currentDataStr = JSON.stringify({ allFindings, detailedFindings });
    if (isAuto && currentDataStr === lastAutoGeneratedData) return;

    setAiLoading(true);
    if (!isAuto) handleDiagnosisChange("diagnosis_text", "Generating diagnosis...");

    try {
      await generateDiagnosisStream({
        allFindings,
        detailedFindings,
        onChunk: (text) => {
          handleDiagnosisChange("diagnosis_text", text);
        },
        onComplete: () => {
          setAiLoading(false);
          setLastAutoGeneratedData(currentDataStr);
          if (!isAuto) toast.success("Unified diagnosis generated successfully!");
        },
        onError: (err) => {
          setAiLoading(false);
          if (!isAuto) toast.error(`Error: ${err}`);
        }
      });
    } catch (err) {
      setAiLoading(false);
    }
  };

  // Auto-generate diagnosis when findings change (debounced)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      // Only auto-generate if there's enough data and not already loading
      const hasAnyFinding = Object.values(diagnosisData.speciality_data || {}).some(v => 
        Array.isArray(v) ? v.length > 0 : (typeof v === 'string' && v.trim().length > 3)
      );
      
      if (hasAnyFinding && !aiLoading) {
        handleAIGenerateDiagnosis(true);
      }
    }, 3000); // 3 second debounce to avoid excessive API calls

    return () => clearTimeout(timer);
  }, [diagnosisData.speciality_data, diagnosisData.general_comment, diagnosisData.diagnosis_comment, diagnosisData.medical_advice_notes]);

  const handleGlobalFindingSelect = (selected) => {
    if (!selected) return;
    
    const { specialty, value } = selected;
    
    // Switch to the correct specialty tab
    handleDiagnosisChange("active_speciality", specialty);
    
    // Toggle the checkbox for this finding
    handleSpecialityCheckboxChange(specialty, value);
    
    toast.success(`Added finding: ${selected.label}`);
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
          <Col md={2} className="mb-17">
            <Form.Label className="fw-bold" style={{ fontSize: "11px", color: "#006064" }}>Diagnosis Date</Form.Label>
            <Form.Control type="date" value={diagnosisData.date_diagnosis} onChange={(e) => handleDiagnosisChange("date_diagnosis", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          {/* <Col md={5} className="mb-3">
            <Form.Label className="fw-bold" style={{ fontSize: "11px", color: "#006064" }}>Investigation Orders</Form.Label>
            <Form.Control as="textarea" rows={2} value={diagnosisData.investigation_orders} onChange={(e) => handleDiagnosisChange("investigation_orders", e.target.value)} placeholder="e.g. USG, CBC, Chest X-Ray..." style={{ borderRadius: "8px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "13px" }} />
          </Col> */}
          <Col md={12} className="mb-3">
            <Form.Label className="fw-bold" style={{ fontSize: "11px", color: "#006064" }}>Search & Add Clinical Findings</Form.Label>
            <Select
              options={globalFindingsOptions}
              placeholder="Type to search findings across all specialties (e.g. Hernia, Piles, Fistula...)"
              onChange={handleGlobalFindingSelect}
              isClearable
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "10px",
                  border: "2px solid #00bcd4",
                  fontSize: "12px",
                  padding: "2px"
                })
              }}
            />
          </Col>
          <Col md={12}>
            {/* 3. Speciality Specific Details moved here */}
            <Form.Label className="fw-bold" style={{ fontSize: "11px", color: "#006064" }}>Select Specialty Type & Findings</Form.Label>
            <Card className="shadow-sm border-0 overflow-hidden" style={{ borderRadius: "15px", border: "2px solid #a7d4d2ff" }}>
              <Card.Header className="p-0 border-0">
                <Nav className="flex-nowrap overflow-auto custom-subnav px-1 py-1" style={{ backgroundColor: "#e0f2f1", gap: "4px" }}>
                  {[
                    { id: "piles", label: "Piles" }, { id: "fistula", label: "Fistula" }, { id: "hernia", label: "Hernia" },
                    { id: "varicosevein", label: "Varicose Veins" }, { id: "prolapse", label: "Prolapse" }, { id: "circumcision", label: "Circumcision" },
                    { id: "abscess", label: "Abscess" }, { id: "fissure", label: "Fissure" }, { id: "ibs", label: "IBS" }, { id: "urology", label: "Urology" },
                    { id: "cyst", label: "Cyst" }, { id: "hydrocele", label: "Hydrocele" }, { id: "lipoma", label: "Lipoma" }, { id: "gynecomastia", label: "Gynecomastia" },
                    { id: "pilonidalsinus", label: "Pilonidal Sinus" }
                  ].map(sub => (
                    <Nav.Item key={sub.id}>
                      <Nav.Link
                        active={diagnosisData.active_speciality === sub.id}
                        onClick={() => handleDiagnosisChange("active_speciality", sub.id)}
                        className="text-center d-flex align-items-center justify-content-center"
                        style={{
                          whiteSpace: "nowrap",
                          borderRadius: "30px",
                          padding: "8px 30.5px",
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
                    <div className="animate__animated animate__fadeIn">
                      <div className="d-flex flex-wrap gap-3 mb-2 p-6 rounded shadow-inner" style={{ backgroundColor: "#f1fcfd" }}>
                        {["GRADE 1 HEMORRHOIDS", "GRADE 2 HEMORRHOIDS", "GRADE 3 HEMORRHOIDS", "GRADE 4 HEMORRHOIDS", "OTHER"].map(g => (
                          <Form.Check key={g} label={g} checked={diagnosisData.speciality_data.piles.includes(g)} onChange={() => handleSpecialityCheckboxChange("piles", g)} style={{ fontSize: "11px", fontWeight: "600", color: "#006064" }} />
                        ))}
                      </div>

                      {diagnosisData.speciality_data.piles.includes("GRADE 1 HEMORRHOIDS") && (
                        <div className="animate__animated animate__fadeIn ms-1 mt-2 p-3 rounded border mb-10" style={{ backgroundColor: "#ffffff", borderColor: "#b2ebf2", borderLeft: "4px solid #00838f" }}>
                          <h6 className="fw-bold mb-3" style={{ fontSize: "11px", color: "#e60000ff", textTransform: "uppercase", padding: "5px" }}>Grade 1 Detailed Findings</h6>
                          <div className="d-flex flex-column gap-2">
                            {[
                              "EARLY HAEMORRHOIDS",
                              "GRADE 1 HAEMORRHOID WITH ACUTE FISSURE",
                              "GRADE 1 HEMORRHOID WITH SKIN TAG ( ALL AROUND)",
                              "GRADE 1 HAEMORRHOID FISSURE SKIN TAG AT 6/12 O CLOCK POSITION"
                            ].map(opt => (
                              <Form.Check
                                key={opt}
                                label={opt}
                                checked={diagnosisData.speciality_data.piles.includes(opt)}
                                onChange={() => handleSpecialityCheckboxChange("piles", opt)}
                                style={{ fontSize: "11px", fontWeight: "600", color: "#006064" }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {diagnosisData.speciality_data.piles.includes("GRADE 2 HEMORRHOIDS") && (
                        <div className="animate__animated animate__fadeIn ms-1 mt-2 p-3 rounded border mb-10" style={{ backgroundColor: "#ffffff", borderColor: "#b2ebf2", borderLeft: "4px solid #00838f" }}>
                          <h6 className="fw-bold mb-3" style={{ fontSize: "11px", color: "#e60000ff", textTransform: "uppercase", padding: "5px" }}>Grade 2 Detailed Findings</h6>
                          <div className="d-flex flex-column gap-2">
                            {[
                              "GRADE 2 HAEMORRHOIDS",
                              "GRADE 2 HAEMORRHOID WITH ACUTE FISSURE",
                              "GRADE 2 HEMORRHOID WITH SKIN TAG ( ALL AROUND)",
                              "GRADE 2 HAEMORRHOID FISSURE SKIN TAG AT 6/12 O CLOCK POSITION"
                            ].map(opt => (
                              <Form.Check
                                key={opt}
                                label={opt}
                                checked={diagnosisData.speciality_data.piles.includes(opt)}
                                onChange={() => handleSpecialityCheckboxChange("piles", opt)}
                                style={{ fontSize: "11px", fontWeight: "600", color: "#006064" }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {diagnosisData.speciality_data.piles.includes("GRADE 3 HEMORRHOIDS") && (
                        <div className="animate__animated animate__fadeIn ms-1 mt-2 p-3 rounded border mb-10" style={{ backgroundColor: "#ffffff", borderColor: "#b2ebf2", borderLeft: "4px solid #00838f" }}>
                          <h6 className="fw-bold mb-3" style={{ fontSize: "11px", color: "#e60000ff", textTransform: "uppercase", padding: "5px" }}>Grade 3 Detailed Findings</h6>
                          <div className="d-flex flex-column gap-2">
                            {[
                              "P/R BLEEDING GRADE 3 HAEMORRHOIDS",
                              "GRADE 3 HAEMORRHOID WITH ACUTE / CHRONIC FISSURE",
                              "GRADE 3 HEMORRHOID WITH SKIN TAG ( ALL AROUND)",
                              "GRADE 3 HAEMORRHOID FISSURE SKIN TAG AT 6/12 O CLOCK POSITION"
                            ].map(opt => (
                              <Form.Check
                                key={opt}
                                label={opt}
                                checked={diagnosisData.speciality_data.piles.includes(opt)}
                                onChange={() => handleSpecialityCheckboxChange("piles", opt)}
                                style={{ fontSize: "11px", fontWeight: "600", color: "#006064" }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {diagnosisData.speciality_data.piles.includes("GRADE 4 HEMORRHOIDS") && (
                        <div className="animate__animated animate__fadeIn ms-1 mt-2 p-3 rounded border" style={{ backgroundColor: "#ffffff", borderColor: "#b2ebf2", borderLeft: "4px solid #00838f" }}>
                          <h6 className="fw-bold mb-3" style={{ fontSize: "11px", color: "#e60000ff", textTransform: "uppercase", padding: "5px" }}>Grade 4 Detailed Findings</h6>
                          <div className="d-flex flex-column gap-2">
                            {[
                              "P/R BLEEDING PROLAPSED GRADE 4 HAEMORRHOIDS",
                              "GRADE 4 HAEMORRHOID WITH EXTERNAL HAEMORRHOID",
                              "GRADE 4 HEMORRHOID WITH SKIN TAG ( ALL AROUND)",
                              "GRADE 4 HAEMORRHOID FISSURE SKIN TAG AT 6/12 O CLOCK POSITION"
                            ].map(opt => (
                              <Form.Check
                                key={opt}
                                label={opt}
                                checked={diagnosisData.speciality_data.piles.includes(opt)}
                                onChange={() => handleSpecialityCheckboxChange("piles", opt)}
                                style={{ fontSize: "11px", fontWeight: "600", color: "#006064" }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {diagnosisData.speciality_data.piles.includes("OTHER") && (
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Enter other specific findings for Piles..."
                          value={diagnosisData.speciality_data.piles_other || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDiagnosisData(prev => ({
                              ...prev,
                              speciality_data: { ...prev.speciality_data, piles_other: val }
                            }));
                          }}
                          style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
                        />
                      )}
                    </div>
                  )}
                  {diagnosisData.active_speciality === "fistula" && (
                    <div className="animate__animated animate__fadeIn">
                      <div className="d-flex flex-wrap gap-3 mb-2 p-5 rounded shadow-inner" style={{ backgroundColor: "#f1fcfd" }}>
                        {["GLUTEAL", "HIGH", "HORSESHOE", "SCROTAL", "SUPRALEVATOR", "TRANSPHINCTERIC", "INTERSPHINCTERIC", "VAGINAL", "COMPLEX", "RECURRENT", "SKIN TAG", "ABSCESS", "OTHER"].map(f => (
                          <Form.Check key={f} label={f} checked={diagnosisData.speciality_data.fistula.includes(f)} onChange={() => handleSpecialityCheckboxChange("fistula", f)} style={{ fontSize: "11px", fontWeight: "600", color: "#006064" }} />
                        ))}
                      </div>

                      {/* Searchable Multi-select for detailed findings */}
                      <div className="mt-3">
                        <Form.Label className="fw-bold" style={{ fontSize: "11px", color: "#006064" }}>Detailed Fistula Findings (Searchable)</Form.Label>
                        <Select
                          isMulti
                          options={fistulaDetailedOptions}
                          className="basic-multi-select"
                          classNamePrefix="select"
                          placeholder="Search and select detailed findings..."
                          value={fistulaDetailedOptions.filter(opt => diagnosisData.speciality_data.fistula_detailed_findings?.includes(opt.value))}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          closeMenuOnSelect={false}
                          onChange={(selected) => {
                            const values = selected ? selected.map(s => s.value) : [];
                            setDiagnosisData(prev => ({
                              ...prev,
                              speciality_data: { ...prev.speciality_data, fistula_detailed_findings: values }
                            }));
                          }}
                          styles={{
                            control: (base) => ({
                              ...base,
                              borderRadius: "10px",
                              border: "2px solid #b2ebf2",
                              fontSize: "12px",
                              minHeight: "45px"
                            }),
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            menu: (base) => ({
                              ...base,
                              fontSize: "12px"
                            })
                          }}
                        />
                      </div>

                      {diagnosisData.speciality_data.fistula?.includes("OTHER") && (
                        <Form.Control
                          as="textarea"
                          rows={3}
                          className="mt-3"
                          placeholder="Enter other specific findings for Fistula..."
                          value={diagnosisData.speciality_data.fistula_other || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDiagnosisData(prev => ({
                              ...prev,
                              speciality_data: { ...prev.speciality_data, fistula_other: val }
                            }));
                          }}
                          style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
                        />
                      )}
                    </div>
                  )}
                  {diagnosisData.active_speciality === "hernia" && (
                    <div className="animate__animated animate__fadeIn">
                      <div className="d-flex flex-wrap gap-3 mb-2 p-5 rounded shadow-inner" style={{ backgroundColor: "#f1fcfd" }}>
                        {["VENTRAL", "INCISIONAL", "EPIGASTRIC", "RIGHT INGUINAL", "LEFT INGUINAL", "BILATERAL INGUINAL", "SUPRA UMBILICAL", "PARA UMBILICAL", "MULTIPLE DEFECTS UMBILICAL", "INFRA UMBILICAL", "OTHER"].map(h => (
                          <Form.Check key={h} label={h} checked={diagnosisData.speciality_data.hernia.includes(h)} onChange={() => handleSpecialityCheckboxChange("hernia", h)} style={{ fontSize: "11px", fontWeight: "600", color: "#006064" }} />
                        ))}
                      </div>
                      {diagnosisData.speciality_data.hernia.includes("OTHER") && (
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Enter other specific findings for Hernia..."
                          value={diagnosisData.speciality_data.hernia_other || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDiagnosisData(prev => ({
                              ...prev,
                              speciality_data: { ...prev.speciality_data, hernia_other: val }
                            }));
                          }}
                          style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
                        />
                      )}
                    </div>
                  )}
                  {diagnosisData.active_speciality === "varicosevein" && (
                    <div className="animate__animated animate__fadeIn">
                      <div className="d-flex flex-wrap gap-3 mb-2 p-5 rounded shadow-inner" style={{ backgroundColor: "#f1fcfd" }}>
                        {["RIGHT", "LEFT", "BILATERAL", "OTHER"].map(v => (
                          <Form.Check key={v} label={v} checked={diagnosisData.speciality_data.varicosevein && diagnosisData.speciality_data.varicosevein.includes(v)} onChange={() => handleSpecialityCheckboxChange("varicosevein", v)} style={{ fontSize: "11px", fontWeight: "600", color: "#006064" }} />
                        ))}
                      </div>
                      {diagnosisData.speciality_data.varicosevein?.includes("OTHER") && (
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Enter other specific findings for Varicose Veins..."
                          value={diagnosisData.speciality_data.varicosevein_other || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDiagnosisData(prev => ({
                              ...prev,
                              speciality_data: { ...prev.speciality_data, varicosevein_other: val }
                            }));
                          }}
                          style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
                        />
                      )}
                    </div>
                  )}
                  {diagnosisData.active_speciality === "prolapse" && (
                    <div className="animate__animated animate__fadeIn">
                      <div className="d-flex flex-wrap gap-3 mb-2 p-5 rounded shadow-inner" style={{ backgroundColor: "#f1fcfd" }}>
                        {["MUCOSAL", "INCOMPLETE", "PROCIDENTIA", "OTHER"].map(p => (
                          <Form.Check key={p} label={p} checked={diagnosisData.speciality_data.prolapse.includes(p)} onChange={() => handleSpecialityCheckboxChange("prolapse", p)} style={{ fontSize: "11px", fontWeight: "600", color: "#006064" }} />
                        ))}
                      </div>
                      {diagnosisData.speciality_data.prolapse?.includes("OTHER") && (
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Enter other specific findings for Prolapse..."
                          value={diagnosisData.speciality_data.prolapse_other || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDiagnosisData(prev => ({
                              ...prev,
                              speciality_data: { ...prev.speciality_data, prolapse_other: val }
                            }));
                          }}
                          style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
                        />
                      )}
                    </div>
                  )}
                  {diagnosisData.active_speciality === "cyst" && (
                    <div className="animate__animated animate__fadeIn">
                      <div className="d-flex flex-wrap gap-3 mb-2 p-5 rounded shadow-inner" style={{ backgroundColor: "#f1fcfd" }}>
                        {["SEBACEOUS", "DERMOID CYST", "OTHER"].map(c => (
                          <Form.Check
                            key={c}
                            label={c}
                            checked={diagnosisData.speciality_data.cyst?.includes(c) || false}
                            onChange={() => handleSpecialityCheckboxChange("cyst", c)}
                            style={{ fontSize: "11px", fontWeight: "600", color: "#006064" }}
                          />
                        ))}
                      </div>
                      {diagnosisData.speciality_data.cyst?.includes("OTHER") && (
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Enter other specific findings for Cyst..."
                          value={diagnosisData.speciality_data.cyst_other || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDiagnosisData(prev => ({
                              ...prev,
                              speciality_data: { ...prev.speciality_data, cyst_other: val }
                            }));
                          }}
                          style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
                        />
                      )}
                    </div>
                  )}
                  {diagnosisData.active_speciality === "hydrocele" && (
                    <div className="animate__animated animate__fadeIn">
                      <div className="d-flex flex-wrap gap-3 mb-2 p-5 rounded shadow-inner" style={{ backgroundColor: "#f1fcfd" }}>
                        {["RIGHT", "LEFT", "BILATERAL", "OTHER"].map(h => (
                          <Form.Check
                            key={h}
                            label={h}
                            checked={diagnosisData.speciality_data.hydrocele?.includes(h) || false}
                            onChange={() => handleSpecialityCheckboxChange("hydrocele", h)}
                            style={{ fontSize: "11px", fontWeight: "600", color: "#006064" }}
                          />
                        ))}
                      </div>
                      {diagnosisData.speciality_data.hydrocele?.includes("OTHER") && (
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Enter other specific findings for Hydrocele..."
                          value={diagnosisData.speciality_data.hydrocele_other || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDiagnosisData(prev => ({
                              ...prev,
                              speciality_data: { ...prev.speciality_data, hydrocele_other: val }
                            }));
                          }}
                          style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
                        />
                      )}
                    </div>
                  )}
                  {diagnosisData.active_speciality === "lipoma" && (
                    <div className="animate__animated animate__fadeIn">
                      <div className="d-flex flex-wrap gap-3 mb-2 p-5 rounded shadow-inner" style={{ backgroundColor: "#f1fcfd" }}>
                        {["SINGLE", "MULTIPLE", "OTHER"].map(l => (
                          <Form.Check
                            key={l}
                            label={l}
                            checked={diagnosisData.speciality_data.lipoma?.includes(l) || false}
                            onChange={() => handleSpecialityCheckboxChange("lipoma", l)}
                            style={{ fontSize: "11px", fontWeight: "600", color: "#006064" }}
                          />
                        ))}
                      </div>
                      {diagnosisData.speciality_data.lipoma?.includes("OTHER") && (
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Enter other specific findings for Lipoma..."
                          value={diagnosisData.speciality_data.lipoma_other || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDiagnosisData(prev => ({
                              ...prev,
                              speciality_data: { ...prev.speciality_data, lipoma_other: val }
                            }));
                          }}
                          style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
                        />
                      )}
                    </div>
                  )}
                  {diagnosisData.active_speciality === "gynecomastia" && (
                    <div className="animate__animated animate__fadeIn">
                      <div className="d-flex flex-wrap gap-3 mb-2 p-5 rounded shadow-inner" style={{ backgroundColor: "#f1fcfd" }}>
                        {["GRADE 1", "GRADE 2", "GRADE 3", "OTHER"].map(g => (
                          <Form.Check
                            key={g}
                            label={g}
                            checked={diagnosisData.speciality_data.gynecomastia?.includes(g) || false}
                            onChange={() => handleSpecialityCheckboxChange("gynecomastia", g)}
                            style={{ fontSize: "11px", fontWeight: "600", color: "#006064" }}
                          />
                        ))}
                      </div>
                      {diagnosisData.speciality_data.gynecomastia?.includes("OTHER") && (
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Enter other specific findings for Gynecomastia..."
                          value={diagnosisData.speciality_data.gynecomastia_other || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDiagnosisData(prev => ({
                              ...prev,
                              speciality_data: { ...prev.speciality_data, gynecomastia_other: val }
                            }));
                          }}
                          style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
                        />
                      )}
                    </div>
                  )}
                  {diagnosisData.active_speciality === "pilonidalsinus" && (
                    <div className="animate__animated animate__fadeIn">
                      <div className="d-flex flex-wrap gap-3 mb-2 p-5 rounded shadow-inner" style={{ backgroundColor: "#f1fcfd" }}>
                        {[
                          "PILONIDAL SINUS",
                          "PILONIDAL SINUS WITH ABSCESS",
                          "RECURRENT PILONIDAL SINUS WITH ABSCESS",
                          "PILONIDAL SINUS WITH MULTIPLE PITS",
                          "OTHER"
                        ].map(p => (
                          <Form.Check
                            key={p}
                            label={p}
                            checked={diagnosisData.speciality_data.pilonidalsinus?.includes(p) || false}
                            onChange={() => handleSpecialityCheckboxChange("pilonidalsinus", p)}
                            style={{ fontSize: "11px", fontWeight: "600", color: "#006064" }}
                          />
                        ))}
                      </div>
                      {diagnosisData.speciality_data.pilonidalsinus?.includes("OTHER") && (
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Enter other specific findings for Pilonidal Sinus..."
                          value={diagnosisData.speciality_data.pilonidalsinus_other || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDiagnosisData(prev => ({
                              ...prev,
                              speciality_data: { ...prev.speciality_data, pilonidalsinus_other: val }
                            }));
                          }}
                          style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
                        />
                      )}
                    </div>
                  )}
                  {diagnosisData.active_speciality === "abscess" && (
                    <div className="animate__animated animate__fadeIn">
                      <div className="d-flex flex-wrap gap-3 mb-2 p-5 rounded shadow-inner" style={{ backgroundColor: "#f1fcfd" }}>
                        {["PERIANAL ABSCESS", "OTHER"].map(a => (
                          <Form.Check
                            key={a}
                            label={a}
                            checked={diagnosisData.speciality_data.abscess?.includes(a) || false}
                            onChange={() => handleSpecialityCheckboxChange("abscess", a)}
                            style={{ fontSize: "11px", fontWeight: "600", color: "#006064" }}
                          />
                        ))}
                      </div>
                      {diagnosisData.speciality_data.abscess?.includes("OTHER") && (
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Enter other specific findings for Abscess..."
                          value={diagnosisData.speciality_data.abscess_other || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDiagnosisData(prev => ({
                              ...prev,
                              speciality_data: { ...prev.speciality_data, abscess_other: val }
                            }));
                          }}
                          style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
                        />
                      )}
                    </div>
                  )}
                  {diagnosisData.active_speciality === "fissure" && (
                    <div className="animate__animated animate__fadeIn">
                      <div className="d-flex flex-wrap gap-3 mb-2 p-5 rounded shadow-inner" style={{ backgroundColor: "#f1fcfd" }}>
                        {["ACUTE", "CHRONIC", "SKINTAG", "OTHER"].map(f => (
                          <Form.Check
                            key={f}
                            label={f}
                            checked={diagnosisData.speciality_data.fissure?.includes(f) || false}
                            onChange={() => handleSpecialityCheckboxChange("fissure", f)}
                            style={{ fontSize: "11px", fontWeight: "600", color: "#006064" }}
                          />
                        ))}
                      </div>
                      {diagnosisData.speciality_data.fissure?.includes("OTHER") && (
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Enter other specific findings for Fissure..."
                          value={diagnosisData.speciality_data.fissure_other || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDiagnosisData(prev => ({
                              ...prev,
                              speciality_data: { ...prev.speciality_data, fissure_other: val }
                            }));
                          }}
                          style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
                        />
                      )}
                    </div>
                  )}
                  {["circumcision", "ibs", "urology"].includes(diagnosisData.active_speciality) && (
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
          </Col>
          <Col md={12}>
            <div className="d-flex justify-content-between align-items-end mb-1">
              <Form.Label className="fw-bold mb-0" style={{ fontSize: "11px", color: "#006064" }}>Diagnosis <span className="text-danger">*</span></Form.Label>
              <small className="fw-bold" style={{ fontSize: "10px", fontStyle: "italic", fontWeight: "700" }}>
                <FeatherIcon icon="info" size="12  " className="me-1 text-info" />
                Select findings above to generate AI diagnosis
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
          {["Medication", "Surgery", "Test", "MCDPA", "Referred to another doctor"].map(type => (
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
          <Col md={6} className="mb-2">
            <Form.Label className="fw-bold" style={{ fontSize: "13px", color: "#006064" }}>Surgical Advice</Form.Label>
            <Form.Control as="textarea" rows={2} placeholder="Describe recommended surgery..." value={diagnosisData.surgical_advice} onChange={(e) => handleDiagnosisChange("surgical_advice", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          <Col md={6} className="mb-10">
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
    </div >
  );
};

export default DiagnosisCard;
