import React from "react";
import { Row, Col, Form, Button, Dropdown } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";

/**
 * ProctoscopyCard - Module for Proctoscopy Examination with Image Uploads and AI Integration
 */
const ProctoscopyCard = ({
  proctoscopyData,
  formData,
  handleProctoscopyChange,
  previousProctoscopyList = [],
  selectedProctoscopyId = null,
  onSelectProctoscopy,
  onNewProctoscopy,
  onSaveProctoscopy,
  loading = false,
  uploadBaseUrl = ""
}) => {
  return (
    <div className="animate__animated animate__fadeIn">
      <div className="p-3 bg-white rounded shadow-sm border mb-3" style={{ borderLeft: "5px solid #00acc1" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0" style={{ color: "#00838f", textTransform: "uppercase", letterSpacing: "1px", fontSize: "14px" }}>
            <FeatherIcon icon="image" size="18" className="me-2 text-info" />Proctoscopy Examination Report
          </h5>
          <div className="d-flex gap-2">
            <Button
              variant="outline-info"
              size="sm"
              onClick={onNewProctoscopy}
              style={{ borderRadius: "20px", fontSize: "12px", fontWeight: "700", padding: "7px 10px" }}
            >
              <FeatherIcon icon="plus" size="14" className="me-1" /> NEW RECORD
            </Button>
            <Dropdown onSelect={onSelectProctoscopy}>
              <Dropdown.Toggle
                variant="outline-info"
                id="previous-procto-dropdown"
                size="sm"
                style={{ borderRadius: "20px", fontSize: "12px", fontWeight: "700", color: "white", padding: "7px 10px" }}
              >
                <FeatherIcon icon="calendar" size="14" className="me-1" /> PREVIOUS DATES
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ fontSize: "12px", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                {previousProctoscopyList.length > 0 ? (
                  previousProctoscopyList.map((p) => (
                    <Dropdown.Item key={p.id} eventKey={p.id}>
                      {p.date} {p.id === selectedProctoscopyId && <FeatherIcon icon="check" size="12" className="ms-2 text-success" />}
                    </Dropdown.Item>
                  ))
                ) : (
                  <Dropdown.Item disabled>No previous records</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {/* Patient Summary Header (Blue Box Style) */}
        <div className="p-3 mb-4 rounded border" style={{ backgroundColor: "#f1fcfd", border: "2px solid #b2ebf2" }}>
          <Row className="g-3">
            {[
              { label: "UID NO", value: formData.Uid_no, isReadonly: true },
              { label: "Patient Name", value: formData.name, isReadonly: true },
              { label: "Age / Sex", value: `${formData.age} / ${formData.sex}`, isReadonly: true },
            ].map((item, idx) => (
              <Col md={4} key={idx}>
                <div className="mb-1" style={{ fontSize: "11px", color: "#006064", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px", }}>
                  {item.label}
                </div>
                <div className="fw-bold text-dark p-5 rounded" style={{ fontSize: "12px", backgroundColor: "#d9dee0ff", border: "1px solid #80deea", cursor: "not-allowed", padding: "6px 8px" }}>
                  {item.value || "-"}
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* Main Content Layout - 4 Columns Side-by-Side */}
        <Row className="g-3">
          {/* Column 1: Date Picker */}
          <Col md={3}>
            <h6 className="fw-bold mb-5" style={{ color: "#006064", fontSize: "12px" }}>Date</h6>
            <Form.Control
              type="date"
              value={proctoscopyData.procto_date}
              onChange={(e) => handleProctoscopyChange("procto_date", e.target.value)}
              style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px", background: "white" }}
            />
          </Col>

          {/* Column 2: Interpretations */}
          {/* <Col md={3}>
            <h6 className="fw-bold mb-5" style={{ color: "#006064", fontSize: "12px" }}>Interpretations</h6>
            <Form.Control
              as="textarea"
              rows={4}
              value={proctoscopyData.interpretation}
              onChange={(e) => handleProctoscopyChange("interpretation", e.target.value)}
              placeholder="Findings..."
              style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "8px 12px", fontSize: "12px", minHeight: "110px" }}
            />
          </Col> */}

          {/* Column 3: Uploads */}
          {/* <Col md={3}>
            <h6 className="fw-bold mb-5" style={{ color: "#006064", fontSize: "12px" }}>
              <FeatherIcon icon="upload-cloud" size="14" className="me-2" />Upload Images
            </h6>
            <div className="p-2 rounded border bg-white shadow-sm" style={{ border: "2px dashed #80deea", backgroundColor: "#f8fbfc", minHeight: "110px" }}>

             
              {(proctoscopyData.upload_img || (proctoscopyData.images && proctoscopyData.images.length > 0)) && (
                <div className="d-flex flex-wrap gap-1 mb-2">
                 
                  {proctoscopyData.upload_img && proctoscopyData.upload_img.split(",").filter(Boolean).map((img, index) => (
                    <img key={`s-${index}`} src={`${uploadBaseUrl}/${img}`} alt="saved" style={{ width: "35px", height: "35px", borderRadius: "4px", objectFit: "cover", border: "1px solid #00838f" }} />
                  ))}
                 
                  {proctoscopyData.images && proctoscopyData.images.map((file, index) => (
                    <img key={`n-${index}`} src={URL.createObjectURL(file)} alt="new" style={{ width: "35px", height: "35px", borderRadius: "4px", objectFit: "cover", border: "1px dashed #4caf50" }} />
                  ))}
                </div>
              )}

              <Form.Control
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleProctoscopyChange("images", Array.from(e.target.files))}
                style={{ borderRadius: "6px", border: "1px solid #80deea", fontSize: "11px", padding: "4px" }}
              />
            </div>
          </Col> */}

          {/* Column 4: AI Tool */}
          <Col md={3}>
            <div className="mb-1">
              <h6 className="fw-bold mb-0" style={{ color: "#006064", fontSize: "12px" }}>
                <FeatherIcon icon="cpu" size="14" className="me-2" />AI Proctoscopy
              </h6>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.open('https://hdfstransformersjshmsintegration.vercel.app/', '_blank')}
                style={{
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "700",
                  backgroundColor: "#673ab7",
                  borderColor: "#673ab7",
                  padding: "7px 10px",
                  marginTop: "8px",
                  width: "100%"
                }}
              >
                <FeatherIcon icon="external-link" size="14" className="me-1" />OPEN LINK
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* Save Button Footer */}
      <div className="text-center mb-5 pb-5 mt-4">
        <Button
          onClick={onSaveProctoscopy}
          disabled={loading}
          style={{ backgroundColor: "#00838f", borderColor: "#00838f", padding: "10px 60px", borderRadius: "40px", fontWeight: "800", fontSize: "13px", boxShadow: "0 8px 25px rgba(0, 131, 143, 0.4)", textTransform: "uppercase", letterSpacing: "1px" }}
        >
          {loading ? (
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          ) : (
            <FeatherIcon icon="save" size="18" className="me-2" />
          )}
          {loading ? "SAVING..." : "SAVE PROCTOSCOPY DATA"}
        </Button>
      </div>
    </div>
  );
};

export default ProctoscopyCard;
