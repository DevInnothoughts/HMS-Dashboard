import React from "react";
import { Row, Col, Form, Button, Dropdown } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";

const AI_TOOL_BASE = "https://hdfstransformersjshmsintegration.vercel.app";

const toPreviewUrl = (url) => {
  if (!url) return "";
  const m = url.match(/(?:\/file\/d\/|[?&]id=)([\w-]+)/);
  if (m && url.includes("drive.google")) {
    return `https://drive.google.com/file/d/${m[1]}/preview`;
  }
  return url;
};

const ProctoscopyCard = ({
  proctoscopyData,
  formData,
  handleProctoscopyChange,
  previousProctoscopyList = [],
  selectedProctoscopyId = null,
  onSelectProctoscopy,
  onNewProctoscopy,
  onRefreshProctoscopy,
  loading = false,
  location = "",
}) => {
  const reportUrl = proctoscopyData.url || "";
  const hasReport = !!reportUrl;

  return (
    <div className="animate__animated animate__fadeIn">
      <div
        className="p-3 bg-white rounded shadow-sm border mb-3"
        style={{ borderLeft: "5px solid #00acc1" }}
      >
        {/* Header + toolbar */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5
            className="fw-bold mb-0"
            style={{
              color: "#00838f",
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontSize: "14px",
            }}
          >
            <FeatherIcon icon="cpu" size="18" className="me-2 text-info" />
            AI Proctoscopy Report
          </h5>
          <div className="d-flex gap-2">
            <Button
              variant="outline-info"
              size="sm"
              onClick={onNewProctoscopy}
              style={{
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "700",
                padding: "7px 10px",
              }}
            >
              <FeatherIcon icon="plus" size="14" className="me-1" /> NEW RECORD
            </Button>
            <Dropdown onSelect={onSelectProctoscopy}>
              <Dropdown.Toggle
                variant="outline-info"
                id="previous-procto-dropdown"
                size="sm"
                style={{
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "white",
                  padding: "7px 10px",
                }}
              >
                <FeatherIcon icon="calendar" size="14" className="me-1" />{" "}
                PREVIOUS DATES
              </Dropdown.Toggle>
              <Dropdown.Menu
                style={{
                  fontSize: "12px",
                  borderRadius: "10px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {previousProctoscopyList.length > 0 ? (
                  previousProctoscopyList.map((p) => (
                    <Dropdown.Item key={p.id} eventKey={p.id}>
                      {p.date}{" "}
                      {p.id === selectedProctoscopyId && (
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

        {/* Controls */}
        <Row className="g-3 align-items-end">
          <Col md={3}>
            <h6
              className="fw-bold mb-1"
              style={{ color: "#006064", fontSize: "12px" }}
            >
              Report Date
            </h6>
            <Form.Control
              type="date"
              max={new Date().toISOString().split("T")[0]}
              value={proctoscopyData.procto_date || ""}
              onChange={(e) =>
                handleProctoscopyChange("procto_date", e.target.value)
              }
              style={{
                borderRadius: "10px",
                border: "2px solid #b2ebf2",
                padding: "6px 12px",
                fontSize: "12px",
                background: "white",
              }}
              onKeyDown={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              onWheel={(e) => e.target.blur()}
            />
          </Col>

          <Col md={3}>
            <h6
              className="fw-bold mb-1"
              style={{ color: "#006064", fontSize: "12px" }}
            >
              HDS AI Examination
            </h6>
            <Button
              size="sm"
              onClick={() =>
                window.open(
                  `${AI_TOOL_BASE}/?location=${location}&uhid=${formData.patient_id}`,
                  "_blank",
                )
              }
              style={{
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                backgroundColor: "#673ab7",
                borderColor: "#673ab7",
                padding: "7px 10px",
                width: "100%",
              }}
            >
              <FeatherIcon icon="external-link" size="14" className="me-1" />
              OPEN PAGE
            </Button>
          </Col>

          <Col md={3}>
            <h6
              className="fw-bold mb-1"
              style={{ color: "#006064", fontSize: "12px" }}
            >
              Check Status
            </h6>
            <Button
              size="sm"
              variant="info"
              onClick={onRefreshProctoscopy}
              disabled={loading}
              style={{
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                padding: "7px 10px",
                width: "100%",
                color: "white",
              }}
            >
              {loading ? (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : (
                <FeatherIcon icon="refresh-cw" size="14" className="me-1" />
              )}
              REFRESH
            </Button>
          </Col>

          <Col md={3}>
            <h6
              className="fw-bold mb-1"
              style={{ color: "#006064", fontSize: "12px" }}
            >
              Report
            </h6>
            <Button
              size="sm"
              variant="outline-secondary"
              disabled={!hasReport}
              onClick={() => window.open(reportUrl, "_blank")}
              style={{
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                padding: "7px 10px",
                width: "100%",
              }}
            >
              <FeatherIcon icon="file-text" size="14" className="me-1" />
              Open & Print
            </Button>
          </Col>
        </Row>

        {/* Preview */}
        <div className="mt-3">
          {hasReport ? (
            <div
              className="rounded overflow-hidden border"
              style={{ borderColor: "#b2ebf2" }}
            >
              <div
                className="d-flex justify-content-between align-items-center px-3 py-2"
                style={{
                  backgroundColor: "#f1fcfd",
                  borderBottom: "1px solid #b2ebf2",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#00838f",
                  }}
                >
                  <FeatherIcon icon="file-text" size="14" className="me-2" />
                  Proctoscopy Report
                </span>
                <a
                  href={reportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#00838f",
                    textDecoration: "none",
                  }}
                >
                  <FeatherIcon
                    icon="external-link"
                    size="14"
                    className="me-1"
                  />
                  Open in new tab
                </a>
              </div>
              <iframe
                src={toPreviewUrl(reportUrl)}
                title="Proctoscopy Report"
                style={{ width: "100%", height: "600px", border: "none" }}
              />
            </div>
          ) : (
            <div
              className="d-flex flex-column align-items-center justify-content-center text-center rounded"
              style={{
                minHeight: "220px",
                border: "2px dashed #80deea",
                backgroundColor: "#f8fbfc",
                color: "#00838f",
                padding: "20px",
              }}
            >
              <FeatherIcon icon="file-minus" size="34" className="mb-2" />
              <div style={{ fontWeight: 700, fontSize: "13px" }}>
                No report found for this date.
              </div>
              <div
                style={{ fontSize: "12px", color: "#607d8b", marginTop: "4px" }}
              >
                Click OPEN PAGE to run the AI proctoscopy, then come back and
                click REFRESH to pull in the generated report.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProctoscopyCard;
