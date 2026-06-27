import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Form,
  Card,
  Nav,
  Button,
  Table,
  Dropdown,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";

const PatientHistoryCard = ({
  historyData,
  handleHistoryChange,
  handleHistoryCheckboxChange,
  handleInvestigationCommentChange,
  handleMedicationChange,
  handleAddMedicationRow,
  handleRemoveMedicationRow,
  loading,
  previousHistoryList = [],
  selectedHistoryId = null,
  onSelectHistory,
  onNewRecord,
  onSaveHistory,
  isEditing = false,
  onEditHistory,
  assistanceDoctors = [],
  uploadBaseUrl,
  validationErrors = {},
}) => {
  const [historyActiveSubTab, setHistoryActiveSubTab] = useState("piles");

  // A saved record is being viewed when an id is selected. It stays LOCKED
  // until the doctor clicks EDIT (isEditing, owned by parent). A brand-new
  // entry (no id selected) is always editable.
  const isViewingSaved = !!selectedHistoryId;
  const isReadOnly = isViewingSaved && !isEditing;

  // Layout-transparent lock wrapper: `display: contents` removes the fieldset's
  // own box from layout (so flex/grid lay out exactly as before), while the
  // disabled attribute still cascades to every nested form control.
  const lockStyle = { display: "contents" };

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
    { id: "circumcision", label: "Circumcision", icon: "plus-circle" },
  ];

  const lastAutoSwitchedId = React.useRef(null);

  // Auto-switch to first non-empty tab when loading a history record
  useEffect(() => {
    if (!selectedHistoryId) {
      lastAutoSwitchedId.current = null;
    } else if (
      historyData &&
      lastAutoSwitchedId.current !== selectedHistoryId
    ) {
      const firstWithData = subTabs.find((st) => hasTabDetail(st.id));
      if (firstWithData) {
        setHistoryActiveSubTab(firstWithData.id);
        lastAutoSwitchedId.current = selectedHistoryId;
      }
    }
  }, [selectedHistoryId, historyData]);

  const hasTabDetail = (tabId) => {
    switch (tabId) {
      case "piles":
        return (
          (historyData.piles_data && historyData.piles_data.length > 0) ||
          (historyData.piles_duration &&
            historyData.piles_duration.trim() !== "")
        );
      case "fistula":
        return (
          (historyData.fistula_data && historyData.fistula_data.length > 0) ||
          (historyData.fistula_duration &&
            historyData.fistula_duration.trim() !== "")
        );
      case "hernia":
        return (
          (historyData.hernia_data && historyData.hernia_data.length > 0) ||
          (historyData.hernia_duration &&
            historyData.hernia_duration.trim() !== "")
        );
      case "varicose":
        return (
          (historyData.varicose_data && historyData.varicose_data.length > 0) ||
          (historyData.varicose_duration &&
            historyData.varicose_duration.trim() !== "")
        );
      case "urinary":
        return (
          historyData.urinary_incontinence ||
          (historyData.urinary_duration &&
            historyData.urinary_duration.trim() !== "")
        );
      case "fecal":
        return (
          historyData.fecal_incontinence ||
          (historyData.fecal_duration &&
            historyData.fecal_duration.trim() !== "")
        );
      case "urology":
        return (
          (historyData.urology_data && historyData.urology_data.length > 0) ||
          (historyData.urology_duration &&
            historyData.urology_duration.trim() !== "")
        );
      case "ods":
        return (
          (historyData.ods_data && historyData.ods_data.length > 0) ||
          (historyData.ods_duration &&
            historyData.ods_duration.trim() !== "") ||
          (historyData.ods_bowel_habits &&
            historyData.ods_bowel_habits.trim() !== "")
        );
      case "sinus":
        return (
          (historyData.pilonidal_data &&
            historyData.pilonidal_data.length > 0) ||
          (historyData.pilonidal_comment &&
            historyData.pilonidal_comment.trim() !== "")
        );
      case "circumcision":
        return (
          historyData.circumcision_comment &&
          historyData.circumcision_comment.trim() !== ""
        );
      default:
        return false;
    }
  };

  const renderHistorySubTabs = () => (
    <Card
      className="shadow-sm border-0 mb-3 overflow-hidden"
      style={{ borderRadius: "5px", marginTop: "10px" }}
    >
      {/* Sub-tab navigation stays OUTSIDE the lock so a saved record can still
          be browsed section-by-section (Nav.Link renders an <a>, which a
          disabled fieldset would not affect anyway). */}
      <Card.Header className="p-0 border-0">
        <Nav
          className="flex-nowrap overflow-auto custom-subnav px-1 py-1"
          style={{ backgroundColor: "#e0f2f1", gap: "4px" }}
        >
          {subTabs.map((st) => {
            const isFilled = hasTabDetail(st.id);
            const isActive = historyActiveSubTab === st.id;
            return (
              <Nav.Item key={st.id}>
                <Nav.Link
                  active={isActive}
                  onClick={() => setHistoryActiveSubTab(st.id)}
                  className="text-center d-flex align-items-center justify-content-center"
                  style={{
                    whiteSpace: "nowrap",
                    borderRadius: "30px",
                    padding: "8px 19px",
                    margin: "5px 2px",
                    fontWeight: "700",
                    fontSize: "12px",
                    transition: "all 0.3s ease-in-out",
                    backgroundColor:
                      isActive || isFilled ? "#00838f" : "#ffffff",
                    color: isActive || isFilled ? "#ffffff" : "#006064",
                    border:
                      isActive || isFilled
                        ? "1px solid #00838f"
                        : "1px solid #e0f2f1",
                    boxShadow:
                      isActive || isFilled
                        ? "0 4px 10px rgba(0, 131, 143, 0.4)"
                        : "0 2px 4px rgba(0,0,0,0.05)",
                    cursor: "pointer",
                  }}
                >
                  {(isActive || isFilled) && (
                    <FeatherIcon
                      icon="check-circle"
                      size="14"
                      className="me-1"
                    />
                  )}
                  {st.label}
                </Nav.Link>
              </Nav.Item>
            );
          })}
        </Nav>
      </Card.Header>
      <Card.Body className="bg-white p-2" style={{ minHeight: "120px" }}>
        <fieldset disabled={isReadOnly} style={lockStyle}>
          {historyActiveSubTab === "piles" && (
            <div className="animate__animated animate__fadeIn">
              <h6
                className="fw-bold mb-2"
                style={{ color: "#00838f", fontSize: "13px", padding: "5px" }}
              >
                Piles / PR Bleeding Symptoms
              </h6>
              <div className="d-flex flex-wrap gap-4 mb-2 p-3 rounded shadow-inner">
                {[
                  "PR Bleeding:Painless",
                  "PR Bleeding:Painful",
                  "Burning",
                  "Pricking",
                  "Itching",
                  "Incomplete Evacuation",
                  "Prolapse",
                  "Swelling",
                  "Pain at Anal Region",
                  "Mucus Mixed Blood",
                ].map((opt) => (
                  <Form.Check
                    key={opt}
                    label={opt}
                    checked={historyData.piles_data.includes(opt)}
                    onChange={() =>
                      handleHistoryCheckboxChange("piles_data", opt)
                    }
                    style={{ fontSize: "13px", fontWeight: "600" }}
                  />
                ))}
              </div>
              <Form.Group>
                <Form.Label
                  className="fw-bold mb-1"
                  style={{ fontSize: "11px" }}
                >
                  Duration / Details
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  value={historyData.piles_duration}
                  onChange={(e) =>
                    handleHistoryChange("piles_duration", e.target.value)
                  }
                  style={{
                    borderRadius: "10px",
                    border: "2px solid #b2ebf2",
                    padding: "6px 12px",
                    fontSize: "12px",
                  }}
                />
              </Form.Group>
            </div>
          )}
          {historyActiveSubTab === "fistula" && (
            <div className="animate__animated animate__fadeIn">
              <h6
                className="fw-bold mb-2"
                style={{ color: "#00838f", fontSize: "13px", padding: "5px" }}
              >
                Fistula Symptoms
              </h6>
              <div className="d-flex flex-wrap gap-4 mb-2 p-3 rounded shadow-inner">
                {[
                  "Pus Discharge",
                  "Boil",
                  "Watery Discharge",
                  "Swelling near anal region",
                ].map((opt) => (
                  <Form.Check
                    key={opt}
                    label={opt}
                    checked={historyData.fistula_data.includes(opt)}
                    onChange={() =>
                      handleHistoryCheckboxChange("fistula_data", opt)
                    }
                    style={{ fontSize: "13px", fontWeight: "600" }}
                  />
                ))}
              </div>
              <Form.Group>
                <Form.Label
                  className="fw-bold mb-1"
                  style={{ fontSize: "11px" }}
                >
                  Duration / Details
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  value={historyData.fistula_duration}
                  onChange={(e) =>
                    handleHistoryChange("fistula_duration", e.target.value)
                  }
                  style={{
                    borderRadius: "10px",
                    border: "2px solid #b2ebf2",
                    padding: "6px 12px",
                    fontSize: "12px",
                  }}
                />
              </Form.Group>
            </div>
          )}
          {historyActiveSubTab === "hernia" && (
            <div className="animate__animated animate__fadeIn">
              <h6
                className="fw-bold mb-2"
                style={{ color: "#00838f", fontSize: "13px", padding: "5px" }}
              >
                Hernia Details
              </h6>
              <div className="d-flex flex-wrap gap-4 mb-2 p-3 rounded shadow-inner">
                {[
                  "Swelling:Umbilical",
                  "Right Inguinal",
                  "Left Inguinal",
                  "Swelling:Abdominal",
                  "Reducible",
                  "Nonreducible",
                  "Past Sx",
                ].map((opt) => (
                  <Form.Check
                    key={opt}
                    label={opt}
                    checked={historyData.hernia_data.includes(opt)}
                    onChange={() =>
                      handleHistoryCheckboxChange("hernia_data", opt)
                    }
                    style={{ fontSize: "13px", fontWeight: "600" }}
                  />
                ))}
              </div>
              <Form.Group>
                <Form.Label
                  className="fw-bold mb-1"
                  style={{ fontSize: "11px" }}
                >
                  Duration / Details
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  value={historyData.hernia_duration}
                  onChange={(e) =>
                    handleHistoryChange("hernia_duration", e.target.value)
                  }
                  style={{
                    borderRadius: "10px",
                    border: "2px solid #b2ebf2",
                    padding: "6px 12px",
                    fontSize: "12px",
                  }}
                />
              </Form.Group>
            </div>
          )}
          {historyActiveSubTab === "varicose" && (
            <div className="animate__animated animate__fadeIn">
              <h6
                className="fw-bold mb-2"
                style={{ color: "#00838f", fontSize: "13px", padding: "5px" }}
              >
                Varicose Veins History
              </h6>
              <div className="d-flex flex-wrap gap-4 mb-2 p-3 rounded shadow-inner">
                {[
                  "Pain in Legs",
                  "Enlarged veins",
                  "Swelling in Legs",
                  "Ulcer",
                  "Right",
                  "Left",
                  "B/L",
                ].map((opt) => (
                  <Form.Check
                    key={opt}
                    label={opt}
                    checked={historyData.varicose_data.includes(opt)}
                    onChange={() =>
                      handleHistoryCheckboxChange("varicose_data", opt)
                    }
                    style={{ fontSize: "13px", fontWeight: "600" }}
                  />
                ))}
              </div>
              <Form.Group>
                <Form.Label
                  className="fw-bold mb-1"
                  style={{ fontSize: "11px" }}
                >
                  Duration / Details
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  value={historyData.varicose_duration}
                  onChange={(e) =>
                    handleHistoryChange("varicose_duration", e.target.value)
                  }
                  style={{
                    borderRadius: "10px",
                    border: "2px solid #b2ebf2",
                    padding: "6px 12px",
                    fontSize: "12px",
                  }}
                />
              </Form.Group>
            </div>
          )}
          {historyActiveSubTab === "urinary" && (
            <div className="animate__animated animate__fadeIn">
              <Form.Check
                label="Urinary Incontinence Present"
                checked={historyData.urinary_incontinence}
                onChange={(e) =>
                  handleHistoryChange("urinary_incontinence", e.target.checked)
                }
                className="mb-2 fw-bold"
                style={{ color: "#00838f", fontSize: "13px", margin: "5px" }}
              />
              <Form.Group>
                <Form.Label
                  className="fw-bold mb-1"
                  style={{ fontSize: "11px" }}
                >
                  Duration / Frequency
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={historyData.urinary_duration}
                  onChange={(e) =>
                    handleHistoryChange("urinary_duration", e.target.value)
                  }
                  style={{
                    borderRadius: "10px",
                    border: "2px solid #b2ebf2",
                    padding: "6px 12px",
                    fontSize: "12px",
                  }}
                />
              </Form.Group>
            </div>
          )}
          {historyActiveSubTab === "fecal" && (
            <div className="animate__animated animate__fadeIn">
              <Form.Check
                label="Fecal Incontinence Present"
                checked={historyData.fecal_incontinence}
                onChange={(e) =>
                  handleHistoryChange("fecal_incontinence", e.target.checked)
                }
                className="mb-2 fw-bold"
                style={{ color: "#00838f", fontSize: "13px" }}
              />
              <Form.Group>
                <Form.Label
                  className="fw-bold mb-1"
                  style={{ fontSize: "11px" }}
                >
                  Duration / Frequency
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={historyData.fecal_duration}
                  onChange={(e) =>
                    handleHistoryChange("fecal_duration", e.target.value)
                  }
                  style={{
                    borderRadius: "10px",
                    border: "2px solid #b2ebf2",
                    padding: "6px 12px",
                    fontSize: "12px",
                  }}
                />
              </Form.Group>
            </div>
          )}
          {historyActiveSubTab === "urology" && (
            <div className="animate__animated animate__fadeIn">
              <h6
                className="fw-bold mb-2"
                style={{ color: "#00838f", fontSize: "13px", padding: "5px" }}
              >
                Urology Symptoms
              </h6>
              <div className="d-flex flex-wrap gap-4 mb-2 p-3 rounded shadow-inner">
                {[
                  "Pain",
                  "Burning urination",
                  "Nausea",
                  "Vomiting",
                  "LUTS",
                  "Urgency of urination",
                  "Incomplete evacuation",
                  "Stream of urine",
                  "Nocturia",
                ].map((opt) => (
                  <Form.Check
                    key={opt}
                    label={opt}
                    checked={historyData.urology_data.includes(opt)}
                    onChange={() =>
                      handleHistoryCheckboxChange("urology_data", opt)
                    }
                    style={{ fontSize: "13px", fontWeight: "600" }}
                  />
                ))}
              </div>
              <Form.Group>
                <Form.Label
                  className="fw-bold mb-1"
                  style={{ fontSize: "11px" }}
                >
                  Duration / Details
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  value={historyData.urology_duration}
                  onChange={(e) =>
                    handleHistoryChange("urology_duration", e.target.value)
                  }
                  style={{
                    borderRadius: "10px",
                    border: "2px solid #b2ebf2",
                    padding: "6px 12px",
                    fontSize: "12px",
                  }}
                />
              </Form.Group>
            </div>
          )}
          {historyActiveSubTab === "ods" && (
            <div className="animate__animated animate__fadeIn">
              <h6
                className="fw-bold mb-2"
                style={{ color: "#00838f", fontSize: "13px", padding: "5px" }}
              >
                ODS Symptoms
              </h6>
              <div className="d-flex flex-wrap gap-4 mb-2 p-3 rounded shadow-inner">
                {[
                  "Excessive Straining",
                  "Digitation",
                  "Hard Stools",
                  "Enema / Laxative",
                  "Fragmented Defecation",
                  "Chronic constipation",
                  "Urgency",
                  "Frequency",
                ].map((opt) => (
                  <Form.Check
                    key={opt}
                    label={opt}
                    checked={historyData.ods_data.includes(opt)}
                    onChange={() =>
                      handleHistoryCheckboxChange("ods_data", opt)
                    }
                    style={{ fontSize: "13px", fontWeight: "600" }}
                  />
                ))}
              </div>
              <Row className="g-2">
                <Col md={6}>
                  <Form.Label
                    className="fw-bold mb-1"
                    style={{ fontSize: "11px" }}
                  >
                    Bowel Habits
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={1}
                    value={historyData.ods_bowel_habits}
                    onChange={(e) =>
                      handleHistoryChange("ods_bowel_habits", e.target.value)
                    }
                    style={{
                      borderRadius: "10px",
                      border: "2px solid #b2ebf2",
                      padding: "6px 12px",
                      fontSize: "12px",
                    }}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label
                    className="fw-bold mb-1"
                    style={{ fontSize: "11px" }}
                  >
                    Duration
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={1}
                    value={historyData.ods_duration}
                    onChange={(e) =>
                      handleHistoryChange("ods_duration", e.target.value)
                    }
                    style={{
                      borderRadius: "10px",
                      border: "2px solid #b2ebf2",
                      padding: "6px 12px",
                      fontSize: "12px",
                    }}
                  />
                </Col>
              </Row>
            </div>
          )}
          {historyActiveSubTab === "sinus" && (
            <div className="animate__animated animate__fadeIn">
              <h6
                className="fw-bold mb-2"
                style={{ color: "#00838f", fontSize: "13px", padding: "5px" }}
              >
                Pilonidal Sinus Details
              </h6>
              <div className="d-flex flex-wrap gap-4 mb-2 p-3 rounded shadow-inner">
                {[
                  "Pain:Tailbone",
                  "Boil:Tailbone",
                  "Swelling:Tailbone",
                  "Pus / Watery Discharge",
                ].map((opt) => (
                  <Form.Check
                    key={opt}
                    label={opt}
                    checked={historyData.pilonidal_data.includes(opt)}
                    onChange={() =>
                      handleHistoryCheckboxChange("pilonidal_data", opt)
                    }
                    style={{ fontSize: "13px", fontWeight: "600" }}
                  />
                ))}
              </div>
              <Form.Group>
                <Form.Label
                  className="fw-bold mb-1"
                  style={{ fontSize: "11px" }}
                >
                  Additional Comments
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  value={historyData.pilonidal_comment}
                  onChange={(e) =>
                    handleHistoryChange("pilonidal_comment", e.target.value)
                  }
                  style={{
                    borderRadius: "10px",
                    border: "2px solid #b2ebf2",
                    padding: "6px 12px",
                    fontSize: "12px",
                  }}
                />
              </Form.Group>
            </div>
          )}
          {historyActiveSubTab === "circumcision" && (
            <div className="animate__animated animate__fadeIn">
              <h6
                className="fw-bold mb-2"
                style={{ color: "#00838f", fontSize: "13px", padding: "5px" }}
              >
                Circumcision Details
              </h6>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter details..."
                value={historyData.circumcision_comment}
                onChange={(e) =>
                  handleHistoryChange("circumcision_comment", e.target.value)
                }
                style={{
                  borderRadius: "10px",
                  border: "2px solid #b2ebf2",
                  padding: "6px 12px",
                  fontSize: "12px",
                }}
              />
            </div>
          )}
        </fieldset>
      </Card.Body>
    </Card>
  );

  return (
    <div className="animate__animated animate__fadeIn">
      {/* Date & Physical Metadata */}
      <div
        className="p-2 bg-white rounded shadow-sm border mb-2"
        style={{ borderLeft: "5px solid #00bcd4" }}
      >
        {/* Toolbar stays OUTSIDE the lock so NEW RECORD / PREVIOUS DATES keep working. */}
        <div className="d-flex justify-content-between align-items-center px-1">
          <h5
            className="fw-bold mb-0"
            style={{
              color: "#00838f",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontSize: "13px",
            }}
          >
            Clinical Measurements
          </h5>
          <div className="d-flex gap-2">
            {isViewingSaved && !isEditing && (
              <Button
                variant="outline-warning"
                size="sm"
                onClick={onEditHistory}
                style={{
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                  padding: "7px 10px",
                }}
              >
                <FeatherIcon icon="edit-2" size="13" className="me-1" /> EDIT
              </Button>
            )}
            <Button
              variant="outline-info"
              size="sm"
              onClick={onNewRecord}
              style={{
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "700",
                padding: "7px 10px",
              }}
            >
              <FeatherIcon icon="plus" size="13" className="me-1" /> NEW RECORD
            </Button>
            <Dropdown onSelect={onSelectHistory}>
              <Dropdown.Toggle
                variant="outline-info"
                id="previous-dates-dropdown"
                size="sm"
                style={{
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "white",
                  padding: "7px 10px",
                }}
              >
                <FeatherIcon icon="calendar" size="13" className="me-1" />{" "}
                PREVIOUS DATES
              </Dropdown.Toggle>
              <Dropdown.Menu
                style={{
                  fontSize: "12px",
                  borderRadius: "10px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {previousHistoryList.length > 0 ? (
                  previousHistoryList.map((hist) => (
                    <Dropdown.Item key={hist.id} eventKey={hist.id}>
                      {hist.date}{" "}
                      {hist.id === selectedHistoryId && (
                        <FeatherIcon
                          icon="check"
                          size="12"
                          className="ms-2 text-success"
                        />
                      )}
                    </Dropdown.Item>
                  ))
                ) : (
                  <Dropdown.Item disabled>No previous records</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
        <fieldset disabled={isReadOnly} style={lockStyle}>
          <Row className="g-2 px-1">
            <Col md={4}>
              <Form.Label
                className="fw-bold mb-1"
                style={{ fontSize: "11px", color: "#006064" }}
              >
                Consultation Date
              </Form.Label>
              <Form.Control
                type="date"
                max={new Date().toISOString().split("T")[0]}
                size="sm"
                disabled={isEditing}
                value={historyData.patient_date}
                onChange={(e) =>
                  handleHistoryChange("patient_date", e.target.value)
                }
                style={{
                  borderRadius: "10px",
                  border: "2px solid #b2ebf2",
                  padding: "6px 12px",
                  fontSize: "12px",
                  backgroundColor: isEditing ? "#e9ecef" : "white",
                }}
                onKeyDown={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
                onWheel={(e) => e.target.blur()}
              />
            </Col>
            <Col md={4}>
              <Form.Label
                className="fw-bold mb-1"
                style={{ fontSize: "11px", color: "#006064" }}
              >
                Height (cms) <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                required
                type="text"
                size="sm"
                value={historyData.height_feet || ""}
                onChange={(e) =>
                  handleHistoryChange("height_feet", e.target.value)
                }
                placeholder="e.g. 160"
                style={{
                  borderRadius: "10px",
                  border: validationErrors.height_feet ? "2px solid red" : "2px solid #b2ebf2",
                  padding: "6px 12px",
                  fontSize: "12px",
                }}
              />
            </Col>
            <Col md={4}>
              <Form.Label
                className="fw-bold mb-1"
                style={{ fontSize: "11px", color: "#006064" }}
              >
                Weight (kgs) <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                required
                type="text"
                size="sm"
                value={historyData.weight_kg || ""}
                onChange={(e) =>
                  handleHistoryChange("weight_kg", e.target.value)
                }
                placeholder="e.g. 70"
                style={{
                  borderRadius: "10px",
                  border: validationErrors.weight_kg ? "2px solid red" : "2px solid #b2ebf2",
                  padding: "6px 12px",
                  fontSize: "12px",
                }}
              />
            </Col>
          </Row>
        </fieldset>
      </div>

      {/* Sub-Speciality Selection */}
      <style>{` 
        .custom-subnav::-webkit-scrollbar { height: 4px; } 
        .custom-subnav::-webkit-scrollbar-thumb { background: #b2ebf2; border-radius: 10px; } 
        .form-check-input { border: 1px solid black !important; width: 1.1em; height: 1.1em; margin-top: 0.2em; }
        .form-check-input:checked { background-color: #00838f; border-color: black !important; }
        .form-check-label { padding-left: 5px; cursor: pointer; }
        .form-check { display: flex; align-items: center; margin-right: 10px; margin-bottom: 5px; }
      `}</style>
      {renderHistorySubTabs()}

      {/* Vitals Section */}
      <div
        className="p-2 bg-white rounded shadow-sm border mb-2"
        style={{ borderLeft: "5px solid #00acc1" }}
      >
        <h5
          className="fw-bold mb-2 px-1"
          style={{
            color: "#00838f",
            textTransform: "uppercase",
            fontSize: "13px",
            padding: "5px",
          }}
        >
          Vitals & Systemic Examination
        </h5>
        <div
          className="p-2 rounded mb-2"
          style={{ backgroundColor: "#f8fbfc", border: "1px solid #e0f2f1" }}
        >
          <fieldset disabled={isReadOnly} style={lockStyle}>
            <Row className="g-2 px-1">
              <Col md={3}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <Form.Label
                    className="fw-bold mb-0"
                    style={{ fontSize: "11px", color: "#006064" }}
                  >
                    Pain Score:{" "}
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#e53935",
                        marginLeft: "2px",
                      }}
                    >
                      {historyData.painscale || 1}
                    </span>
                  </Form.Label>
                </div>
                <input
                  type="range"
                  className="form-range"
                  min="1"
                  max="10"
                  step="1"
                  value={historyData.painscale || 1}
                  onChange={(e) =>
                    handleHistoryChange("painscale", e.target.value)
                  }
                  style={{
                    accentColor:
                      Number(historyData.painscale) < 4
                        ? "#4caf50"
                        : Number(historyData.painscale) < 7
                          ? "#ff9800"
                          : "#f44336",
                  }}
                />
                <div
                  className="d-flex justify-content-between px-1"
                  style={{
                    fontSize: "9px",
                    color: "#607d8b",
                    fontWeight: "600",
                    marginTop: "-4px",
                  }}
                >
                  <span>1 (Mild)</span>
                  <span>10 (Severe)</span>
                </div>
              </Col>
              <Col md={3}>
                <Form.Label
                  className="fw-bold mb-1"
                  style={{ fontSize: "11px", color: "#006064" }}
                >
                  BP (mm Hg)
                </Form.Label>
                <Form.Control
                  size="sm"
                  value={historyData.vital_bp}
                  onChange={(e) =>
                    handleHistoryChange("vital_bp", e.target.value)
                  }
                  style={{
                    borderRadius: "10px",
                    border: "2px solid #b2ebf2",
                    padding: "6px 12px",
                    fontSize: "12px",
                  }}
                />
              </Col>
              <Col md={3}>
                <Form.Label
                  className="fw-bold mb-1"
                  style={{ fontSize: "11px", color: "#006064" }}
                >
                  Pulse (/min)
                </Form.Label>
                <Form.Control
                  size="sm"
                  value={historyData.vital_pulse}
                  onChange={(e) =>
                    handleHistoryChange("vital_pulse", e.target.value)
                  }
                  style={{
                    borderRadius: "10px",
                    border: "2px solid #b2ebf2",
                    padding: "6px 12px",
                    fontSize: "12px",
                  }}
                />
              </Col>
              <Col md={3}>
                <Form.Label
                  className="fw-bold mb-1"
                  style={{ fontSize: "11px", color: "#006064" }}
                >
                  RR (/min)
                </Form.Label>
                <Form.Control
                  size="sm"
                  value={historyData.vital_rr}
                  onChange={(e) =>
                    handleHistoryChange("vital_rr", e.target.value)
                  }
                  style={{
                    borderRadius: "10px",
                    border: "2px solid #b2ebf2",
                    padding: "6px 12px",
                    fontSize: "12px",
                  }}
                />
              </Col>
              {["rs", "cvs", "cns", "p/a"].map((field) => (
                <Col md={3} key={field}>
                  <Form.Label
                    className="fw-bold mb-1"
                    style={{ fontSize: "11px", color: "#006064" }}
                  >
                    {field.toUpperCase()}
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    value={historyData[field]}
                    onChange={(e) => handleHistoryChange(field, e.target.value)}
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #80deea",
                      fontSize: "11px",
                      padding: "8px 12px",
                    }}
                  />
                </Col>
              ))}
            </Row>
          </fieldset>
        </div>
      </div>

      {/* Summaries Section */}
      <div
        className="p-2 bg-white rounded shadow-sm border mb-2"
        style={{ borderLeft: "5px solid #0097a7" }}
      >
        <h5
          className="fw-bold mb-2 px-1"
          style={{
            color: "#00838f",
            textTransform: "uppercase",
            fontSize: "14px",
            padding: "5px",
          }}
        >
          Medical History Summaries
        </h5>
        <div className="d-flex flex-column gap-3 px-1">
          <fieldset disabled={isReadOnly} style={lockStyle}>
            {(() => {
              const tooltipMapping = {
                IHD: "Ischaemic Heart Disease",
                CLD: "Chronic Liver Disease",
                CVA: "Cerebrovascular Accident (Stroke)",
                CKD: "Chronic Kidney Disease",
                "BSL-R": "Blood Sugar Level – Random",
              };

              const renderLabelWithTooltip = (label) => {
                if (tooltipMapping[label]) {
                  return (
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip
                          id={`tooltip-${label.replace(/[^a-zA-Z0-9]/g, "-")}`}
                        >
                          {tooltipMapping[label]}
                        </Tooltip>
                      }
                    >
                      <span
                        style={{
                          borderBottom: "1px dashed #006064",
                          cursor: "help",
                        }}
                      >
                        {label}
                      </span>
                    </OverlayTrigger>
                  );
                }
                return label;
              };

              return [
                {
                  label: "Family History",
                  key: "family_history",
                  opts: ["Piles", "Constipation", "DM", "HTN", "Heart Disease"],
                  other: "family_history_other",
                },
                {
                  label: "General Symptoms",
                  key: "general_history",
                  opts: [
                    "History of Weight Loss",
                    "Decreased Appetite",
                    "Straining for Urination",
                    "Acidity",
                    "Gas",
                    "Bloating",
                  ],
                  comment: "weightloss_comment",
                },
                {
                  label: "Past Medical History",
                  key: "past_medical_history",
                  opts: [
                    "DM",
                    "HTN",
                    "Bronchial Asthma",
                    "Thyroid",
                    "IHD",
                    "Migraine",
                    "Epilepsy",
                    "CKD",
                    "CLD",
                    "CVA",
                    "IBS",
                    "Insomnia",
                  ],
                  other: "past_medical_history_other",
                },
              ].map((sec) => (
                <div
                  key={sec.label}
                  className="p-3 border rounded"
                  style={{
                    backgroundColor: "#f1fcfd",
                    border: "2px solid #b2ebf2",
                  }}
                >
                  <h6
                    className="fw-bold mb-2"
                    style={{ color: "#006064", fontSize: "14px" }}
                  >
                    {sec.label}
                  </h6>
                  <div className="d-flex flex-wrap gap-3 mb-2">
                    {sec.opts.map((opt) => (
                      <Form.Check
                        key={opt}
                        label={renderLabelWithTooltip(opt)}
                        checked={historyData[sec.key].includes(opt)}
                        onChange={() =>
                          handleHistoryCheckboxChange(sec.key, opt)
                        }
                        style={{ fontSize: "13px", fontWeight: "600" }}
                      />
                    ))}
                  </div>
                  {sec.other && (
                    <Form.Control
                      size="sm"
                      placeholder="Specify other conditions..."
                      value={historyData[sec.other]}
                      onChange={(e) =>
                        handleHistoryChange(sec.other, e.target.value)
                      }
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #80deea",
                        fontSize: "13px",
                      }}
                    />
                  )}
                  {sec.comment &&
                    historyData[sec.key].includes("History of Weight Loss") && (
                      <div className="mt-2 animate__animated animate__fadeIn">
                        <Form.Label
                          className="fw-bold mb-1"
                          style={{ fontSize: "13px" }}
                        >
                          Weight Loss Details
                        </Form.Label>
                        <Form.Control
                          size="sm"
                          placeholder="e.g. 5kg in 2 months"
                          value={historyData[sec.comment]}
                          onChange={(e) =>
                            handleHistoryChange(sec.comment, e.target.value)
                          }
                          style={{
                            borderRadius: "8px",
                            border: "1px solid #80deea",
                            padding: "4px 8px",
                            fontSize: "14px",
                          }}
                        />
                      </div>
                    )}
                </div>
              ));
            })()}
            {/* Habits */}
            <div
              className="p-3 border rounded"
              style={{
                backgroundColor: "#f1fcfd",
                border: "2px solid #b2ebf2",
              }}
            >
              <h6
                className="fw-bold mb-2"
                style={{ color: "#006064", fontSize: "14px" }}
              >
                Habits
              </h6>
              <div className="d-flex flex-wrap gap-3">
                {["Smoking", "Alcohol", "Tobacco", "Drugs"].map((h) => (
                  <Form.Check
                    key={h}
                    label={h}
                    checked={historyData.habits.includes(h)}
                    onChange={() => handleHistoryCheckboxChange("habits", h)}
                    style={{ fontSize: "13px", fontWeight: "600" }}
                  />
                ))}
              </div>
            </div>
            {/* Drug Allergies */}
            <div
              className="p-3 border rounded"
              style={{
                backgroundColor: "#f1fcfd",
                border: "2px solid #b2ebf2",
              }}
            >
              <h6
                className="fw-bold mb-2"
                style={{ color: "#006064", fontSize: "13px" }}
              >
                Drug Allergies
              </h6>
              <Form.Control
                as="textarea"
                rows={1}
                placeholder="Specify any drug allergies..."
                value={historyData.drug_allergy}
                onChange={(e) =>
                  handleHistoryChange("drug_allergy", e.target.value)
                }
                style={{
                  borderRadius: "8px",
                  border: "1px solid #80deea",
                  fontSize: "13px",
                  padding: "6px",
                }}
              />
            </div>
          </fieldset>
        </div>
      </div>

      {/* Medication, Habits & Complaints */}
      <div
        className="p-3 bg-white rounded shadow-sm border mb-3"
        style={{ borderLeft: "5px solid #00bcd4" }}
      >
        <h5
          className="fw-bold mb-3"
          style={{
            color: "#00838f",
            textTransform: "uppercase",
            fontSize: "13px",
            padding: "5px",
          }}
        >
          Medication, Habits & Complaints
        </h5>

        <fieldset disabled={isReadOnly} style={lockStyle}>
          {/* Medication Table */}
          <div className="mb-4">
            <Table
              responsive
              bordered
              hover
              className="mb-0 overflow-hidden"
              style={{
                borderRadius: "10px",
                borderCollapse: "separate",
                borderSpacing: 0,
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#00838f", color: "white" }}>
                  <th className="p-2" style={{ fontSize: "12px" }}>
                    #
                  </th>
                  <th className="p-2" style={{ fontSize: "12px" }}>
                    Medication Name
                  </th>
                  <th className="p-2" style={{ fontSize: "12px" }}>
                    Indication
                  </th>
                  <th className="p-2" style={{ fontSize: "12px" }}>
                    Since
                  </th>
                  <th
                    className="p-2 text-center"
                    style={{ fontSize: "12px", width: "40px" }}
                  ></th>
                </tr>
              </thead>
              <tbody>
                {historyData.medication_history.map((row, idx) => (
                  <tr key={idx}>
                    <td
                      className="text-center p-2 fw-bold"
                      style={{
                        backgroundColor: "#f8fbfc",
                        color: "#00838f",
                        fontSize: "12px",
                        verticalAlign: "middle",
                      }}
                    >
                      {idx + 1}
                    </td>
                    <td className="p-1">
                      <Form.Control
                        value={row.medicine}
                        onChange={(e) =>
                          handleMedicationChange(
                            idx,
                            "medicine",
                            e.target.value,
                          )
                        }
                        placeholder="Medicine name"
                        style={{
                          border: "2px solid #b2ebf2",
                          borderRadius: "10px",
                          padding: "6px 12px",
                          fontSize: "12px",
                        }}
                      />
                    </td>
                    <td className="p-1">
                      <Form.Control
                        value={row.indication}
                        onChange={(e) =>
                          handleMedicationChange(
                            idx,
                            "indication",
                            e.target.value,
                          )
                        }
                        placeholder="e.g. HTN"
                        style={{
                          border: "2px solid #b2ebf2",
                          borderRadius: "10px",
                          padding: "6px 12px",
                          fontSize: "12px",
                        }}
                      />
                    </td>
                    <td className="p-1">
                      <Form.Control
                        value={row.since}
                        onChange={(e) =>
                          handleMedicationChange(idx, "since", e.target.value)
                        }
                        placeholder="e.g. 1 year"
                        style={{
                          border: "2px solid #b2ebf2",
                          borderRadius: "10px",
                          padding: "6px 12px",
                          fontSize: "12px",
                        }}
                      />
                    </td>
                    <td className="p-1 text-center align-middle">
                      <Button
                        variant="link"
                        className="p-0 text-danger"
                        onClick={() =>
                          handleRemoveMedicationRow &&
                          handleRemoveMedicationRow(idx)
                        }
                      >
                        <FeatherIcon icon="trash-2" size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="d-flex justify-content-end mt-2">
              <Button
                variant="outline-info"
                size="sm"
                onClick={handleAddMedicationRow}
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  borderRadius: "8px",
                }}
              >
                <FeatherIcon icon="plus" size={14} className="me-1" /> Add Row
              </Button>
            </div>
          </div>

          <Row className="g-2">
            {/* Surgical History & Other Notes */}
            <Col md={3}>
              <h6
                className="fw-bold mb-2"
                style={{ color: "#00838f", fontSize: "13px" }}
              >
                Surgical History & Other Notes
              </h6>
              <Form.Control
                as="textarea"
                rows={7}
                placeholder="Past surgical history..."
                className="mb-3"
                value={historyData.past_surgical_history}
                onChange={(e) =>
                  handleHistoryChange("past_surgical_history", e.target.value)
                }
                style={{
                  borderRadius: "10px",
                  border: "2px solid #b2ebf2",
                  padding: "6px 12px",
                  fontSize: "12px",
                }}
              />
            </Col>

            <Col md={3}>
              <h6
                className="fw-bold mb-2"
                style={{ color: "#00838f", fontSize: "13px" }}
              >
                Any Other Complaints
              </h6>
              <Form.Control
                as="textarea"
                rows={7}
                placeholder="Describe other complaints..."
                value={historyData.any_other_complaints}
                onChange={(e) =>
                  handleHistoryChange("any_other_complaints", e.target.value)
                }
                style={{
                  borderRadius: "10px",
                  border: "2px solid #b2ebf2",
                  padding: "6px 12px",
                  fontSize: "12px",
                }}
              />
            </Col>

            {/* Present Complaints (C/O) */}
            <Col md={3}>
              <h6
                className="fw-bold mb-2"
                style={{ color: "#00838f", fontSize: "13px" }}
              >
                Present Complaints (C/O)
              </h6>
              <Form.Control
                as="textarea"
                rows={7}
                placeholder="Describe the current symptoms in detail..."
                value={historyData.present_complaints}
                onChange={(e) =>
                  handleHistoryChange("present_complaints", e.target.value)
                }
                style={{
                  borderRadius: "10px",
                  border: "1px solid #b2ebf2",
                  fontSize: "12px",
                  padding: "8px",
                }}
              />
            </Col>

            {/* Ongoing Medicines */}
            <Col md={3}>
              <div
                className="p-3 border rounded shadow-sm"
                style={{
                  borderLeft: "8px solid #0097a7",
                  backgroundColor: "#fff",
                }}
              >
                <h6
                  className="fw-bold mb-7"
                  style={{ color: "#00838f", fontSize: "13px" }}
                >
                  Ongoing Medicines
                </h6>
                <div className="d-flex flex-wrap gap-3 mb-2">
                  {["Clopidogrel", "Aspirin", "Warfarin"].map((m) => (
                    <Form.Check
                      key={m}
                      label={m}
                      checked={historyData.ongoing_medicines.includes(m)}
                      onChange={() =>
                        handleHistoryCheckboxChange("ongoing_medicines", m)
                      }
                      style={{ fontSize: "12px", fontWeight: "700" }}
                    />
                  ))}
                </div>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Mention any other daily medications..."
                  value={historyData.ongoing_medicines_other}
                  onChange={(e) =>
                    handleHistoryChange(
                      "ongoing_medicines_other",
                      e.target.value,
                    )
                  }
                  style={{
                    borderRadius: "10px",
                    border: "2px solid #b2ebf2",
                    padding: "6px 12px",
                    fontSize: "12px",
                  }}
                />
              </div>
            </Col>
          </Row>
        </fieldset>
      </div>

      {/* Investigations Section */}
      <div
        className="p-3 bg-white rounded shadow-sm border mb-3"
        style={{ borderLeft: "5px solid #0097a7" }}
      >
        <h5
          className="fw-bold mb-3"
          style={{
            color: "#00838f",
            textTransform: "uppercase",
            fontSize: "13px",
            padding: "5px",
          }}
        >
          External Investigations
        </h5>
        <fieldset disabled={isReadOnly} style={lockStyle}>
          <div
            className="p-3 border rounded"
            style={{ backgroundColor: "#f8fbfc", border: "2px solid #e0f2f1" }}
          >
            <Row className="g-2">
              {[
                { id: "HB", label: "HB" },
                { id: "BSL-R", label: "BSL-R" },
                { id: "Bleding Time-BT", label: "Bleding Time - BT" },
                { id: "Clotting Time-BT", label: "Clotting Time - BT" },
                { id: "PT INR", label: "PT INR" },
                { id: "HIV", label: "HIV" },
                { id: "Hbsag", label: "Hbsag" },
                { id: "SR.Creatinine", label: "Sr.Creatinine" },
                { id: "Vit B12", label: "Vit B12" },
                { id: "HbA1C", label: "HbA1C" },
                { id: "Thyroid", label: "Thyroid" },
                { id: "LVEF", label: "LVEF" },
                { id: "Glucose Fasting", label: "Glucose Fasting & PP" },
              ].map((inv) => (
                <Col md={4} key={inv.id} className="mb-2">
                  {(() => {
                    const tooltipMapping = {
                      "BSL-R": "Blood Sugar Level – Random",
                    };
                    const renderLabel = (label) =>
                      tooltipMapping[label] ? (
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip
                              id={`tooltip-${label.replace(/[^a-zA-Z0-9]/g, "-")}`}
                            >
                              {tooltipMapping[label]}
                            </Tooltip>
                          }
                        >
                          <span
                            style={{
                              borderBottom: "1px dashed #006064",
                              cursor: "help",
                            }}
                          >
                            {label}
                          </span>
                        </OverlayTrigger>
                      ) : (
                        label
                      );
                    return (
                      <Form.Check
                        label={renderLabel(inv.label)}
                        checked={historyData.investigations.includes(inv.id)}
                        onChange={() =>
                          handleHistoryCheckboxChange("investigations", inv.id)
                        }
                        className="mb-1"
                        style={{
                          fontWeight: "700",
                          color: "#006064",
                          fontSize: "13px",
                        }}
                      />
                    );
                  })()}
                  {historyData.investigations.includes(inv.id) && (
                    <Form.Control
                      size="sm"
                      placeholder="Findings / Value"
                      value={historyData.investigation_notes[inv.id] || ""}
                      onChange={(e) =>
                        handleInvestigationCommentChange(inv.id, e.target.value)
                      }
                      className="animate__animated animate__fadeIn"
                      style={{
                        borderRadius: "10px",
                        border: "2px solid #b2ebf2",
                        padding: "6px 12px",
                        fontSize: "13px",
                      }}
                    />
                  )}
                </Col>
              ))}
            </Row>
            <hr className="my-2" />
            <Row>
              <Col md={12}>
                <Form.Group className="mb-15">
                  <Form.Label
                    className="fw-bold mb-1"
                    style={{ fontSize: "13px" }}
                  >
                    Upload Investigation Image
                  </Form.Label>
                  {historyData.upload_investigation_existing && (
                    <div
                      className="mb-2 text-center p-2 rounded"
                      style={{
                        backgroundColor: "#f0fdfa",
                        border: "1px dashed #00acc1",
                      }}
                    >
                      <a
                        href={`${uploadBaseUrl}/${historyData.upload_investigation_existing}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          src={`${uploadBaseUrl}/${historyData.upload_investigation_existing}`}
                          alt="Existing Investigation"
                          style={{
                            maxHeight: "150px",
                            maxWidth: "100%",
                            borderRadius: "8px",
                            objectFit: "contain",
                          }}
                        />
                      </a>
                      <div className="mt-1 small text-muted">
                        Currently stored:{" "}
                        {historyData.upload_investigation_existing}
                      </div>
                    </div>
                  )}
                  <Form.Control
                    type="file"
                    id="capture"
                    accept="image/*"
                    capture="camera"
                    onChange={(e) =>
                      handleHistoryChange(
                        "upload_investigation",
                        e.target.files[0],
                      )
                    }
                    style={{
                      borderRadius: "10px",
                      padding: "6px",
                      border: "2px solid #b2ebf2",
                      fontSize: "13px",
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label
                    className="fw-bold mb-1"
                    style={{ fontSize: "13px" }}
                  >
                    Investigation Details
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Investigation Details"
                    value={historyData.investigation || ""}
                    onChange={(e) =>
                      handleHistoryChange("investigation", e.target.value)
                    }
                    style={{
                      borderRadius: "10px",
                      padding: "8px",
                      border: "2px solid #b2ebf2",
                      fontSize: "13px",
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          <Row className="mt-3 g-2">
            <Col md={6}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
                Known Case Of
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={1}
                placeholder="Chronic conditions..."
                value={historyData.known_case_of}
                onChange={(e) =>
                  handleHistoryChange("known_case_of", e.target.value)
                }
                style={{
                  borderRadius: "10px",
                  border: "2px solid #b2ebf2",
                  padding: "6px 12px",
                  fontSize: "12px",
                }}
              />
            </Col>
            <Col md={6}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
                Assistant Doctor <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                required
                value={historyData.assistance_doctor || ""}
                onChange={(e) =>
                  handleHistoryChange("assistance_doctor", e.target.value)
                }
                style={{
                  borderRadius: "10px",
                  border: validationErrors.assistance_doctor ? "2px solid red" : "2px solid #b2ebf2",
                  padding: "6px 12px",
                  fontSize: "12px",
                }}
              >
                <option value="">Select Assistant Doctor</option>
                {assistanceDoctors.map((doc) => (
                  <option key={doc.doctor_id} value={doc.doctor_id}>
                    {doc.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </fieldset>
      </div>

      <div className="text-center mb-5 pb-5">
        {isReadOnly ? (
          <span
            className="d-inline-flex align-items-center"
            style={{ color: "#00838f", fontWeight: 700, fontSize: "13px" }}
          >
            <FeatherIcon icon="lock" size="16" className="me-2" />
            Locked — click EDIT to modify this record, or NEW RECORD to add a
            fresh entry.
          </span>
        ) : (
          <Button
            disabled={loading}
            onClick={onSaveHistory}
            style={{
              backgroundColor: "#00acc1",
              borderColor: "#00acc1",
              padding: "10px 40px",
              borderRadius: "40px",
              fontWeight: "800",
              fontSize: "13px",
              boxShadow: "0 8px 25px rgba(0, 172, 193, 0.4)",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            {loading ? (
              <Spinner size="sm" className="me-2" />
            ) : (
              <FeatherIcon icon="save" size="18" className="me-2" />
            )}
            {isEditing ? "UPDATE PATIENT HISTORY" : "SAVE PATIENT HISTORY"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PatientHistoryCard;
