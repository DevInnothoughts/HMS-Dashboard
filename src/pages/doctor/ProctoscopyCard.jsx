import React from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";

const ProctoscopyCard = ({ proctoscopyData, formData, handleProctoscopyChange }) => {
  return (
    <div className="animate__animated animate__fadeIn">
      <div className="p-3 bg-white rounded shadow-sm border mb-3" style={{ borderLeft: "5px solid #00acc1" }}>
        <h5 className="fw-bold mb-3" style={{ color: "#00838f", textTransform: "uppercase", letterSpacing: "1px", fontSize: "14px" }}>
          <FeatherIcon icon="image" size="18" className="me-2 text-info" />Proctoscopy Examination Report
        </h5>

        <Row className="g-2">
          <Col md={3} className="mb-2">
            <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>Date</Form.Label>
            <Form.Control type="date" value={proctoscopyData.procto_date} onChange={(e) => handleProctoscopyChange("procto_date", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          <Col md={3} className="mb-2">
            <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>UID No</Form.Label>
            <Form.Control type="text" value={formData.Uid_no} readOnly style={{ borderRadius: "10px", background: "#f8fbfc", border: "1px solid #80deea", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          <Col md={3} className="mb-2">
            <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>Patient Name</Form.Label>
            <Form.Control type="text" value={formData.name} readOnly style={{ borderRadius: "10px", background: "#f8fbfc", border: "1px solid #80deea", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          <Col md={3} className="mb-2">
            <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>Age/Sex</Form.Label>
            <Form.Control type="text" value={`${formData.age} / ${formData.sex}`} readOnly style={{ borderRadius: "10px", background: "#f8fbfc", border: "1px solid #80deea", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          <Col md={6} className="mb-2">
            <h6 className="fw-bold mb-2" style={{ color: "#006064", fontSize: "13px" }}>Interpretations</h6>
            <Form.Control as="textarea" rows={3} value={proctoscopyData.interpretation} onChange={(e) => handleProctoscopyChange("interpretation", e.target.value)} placeholder="Detailed findings..." className="mb-3" style={{ borderRadius: "12px", border: "1px solid #80deea", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          <Col md={6} className="mb-2">
            <h6 className="fw-bold mb-2" style={{ color: "#006064", fontSize: "12px" }}>Upload Images</h6>
            <div className="p-4 text-center rounded border bg-white" style={{ borderStyle: "dotted !important" }}>
              <FeatherIcon icon="upload-cloud" size="32" className="text-muted mb-2" />
              <Form.Control type="file" multiple accept="image/*" onChange={(e) => handleProctoscopyChange("images", Array.from(e.target.files))} style={{ height: "60px", maxWidth: "600px", margin: "0 auto", fontSize: '11px', border: "1px solid #80deea" }} />
            </div>
          </Col>
        </Row>
      </div>
      <div className="text-center mb-2 pb-5 mt-4">
        <Button style={{ backgroundColor: "#00bcd4", borderColor: "#00bcd4", padding: "10px 40px", borderRadius: "40px", fontWeight: "800", fontSize: "13px", boxShadow: "0 8px 25px rgba(0, 188, 212, 0.3)", textTransform: "uppercase", letterSpacing: "1px" }}>
          <FeatherIcon icon="file-text" size="18" className="me-2" /> GENERATE REPORT
        </Button>
      </div>
    </div>
  );
};

export default ProctoscopyCard;
