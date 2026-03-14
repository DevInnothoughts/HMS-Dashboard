import React from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import Select from "react-select";

const OtherTestsCard = ({ otherTestData, handleOtherTestChange, handleOtherTestCheckboxChange }) => {
  const testOptions = [
    { value: "BLOOD TEST", label: "BLOOD TEST" },
    { value: "URINE TEST", label: "URINE TEST" },
    { value: "BIOPSY", label: "BIOPSY" },
    { value: "RADIOLOGY", label: "RADIOLOGY" },
    { value: "SONOGRAPHY", label: "SONOGRAPHY" },
  ];

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderRadius: "10px",
      border: "2px solid #b2ebf2",
      boxShadow: "none",
      "&:hover": {
        border: "2px solid #00bcd4",
      },
      fontSize: "12px",
      minHeight: "33px",
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#e0f7fa",
      borderRadius: "5px",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#006064",
      fontWeight: "600",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#00838f",
      "&:hover": {
        backgroundColor: "#00bcd4",
        color: "white",
      },
    }),
  };

  return (
    <div className="animate__animated animate__fadeIn">
      <div className="p-3 bg-white rounded shadow-sm border mb-3" style={{ borderLeft: "5px solid #00bcd4" }}>
        <h5 className="fw-bold mb-3" style={{ color: "#00838f", textTransform: "uppercase", letterSpacing: "1px", fontSize: "14px" }}>
          <FeatherIcon icon="file-plus" size="18" className="me-2 text-info" />Lab Requests & Investigations
        </h5>

        <Row className="g-2">
          <Col md={6}>
            <Form.Label className="fw-bold" style={{ fontSize: "11px", color: "#006064" }}>Select Lab Name <span className="text-danger">*</span></Form.Label>
            <Form.Select value={otherTestData.lab_type} onChange={(e) => handleOtherTestChange("lab_type", e.target.value)} required style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px", height: "33px" }}>
              <option value="">Select Lab Name</option>
              <option value="AG Diagnostics">A.G Diagnostics</option>
              <option value="Mega Vision">Mega Vision</option>
            </Form.Select>
          </Col>
          <Col md={6}>
            <Form.Label className="fw-bold" style={{ fontSize: "11px", color: "#006064" }}>Date <span className="text-danger">*</span></Form.Label>
            <Form.Control type="date" value={otherTestData.test_date} onChange={(e) => handleOtherTestChange("test_date", e.target.value)} required style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px", height: "33px" }} />
          </Col>
        </Row>

        <Row className="g-2">

          <Col md={6}>
            <Form.Label className="fw-bold" style={{ fontSize: "11px", color: "#006064" }}>Test Type <span className="text-danger">*</span></Form.Label>
            <Select
              isMulti
              options={testOptions}
              value={testOptions.filter(opt => otherTestData.test_type.includes(opt.value))}
              onChange={(selectedOptions) => {
                const values = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
                handleOtherTestChange("test_type", values);
              }}
              placeholder="Select Tests..."
              styles={customStyles}
            />
          </Col>
          <Col md={6}>
            <Form.Label className="fw-bold" style={{ fontSize: "11px", color: "#006064" }}>Ref. Doctor Name <span className="text-danger">*</span></Form.Label>
            <Form.Select value={otherTestData.refDoctor} onChange={(e) => handleOtherTestChange("refDoctor", e.target.value)} required style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px", height: "33px" }}>
              <option value="">Select Doctor</option>
              <option value="Dr. Amit Shah">Dr. Amit Shah</option>
              <option value="Dr. Priya Sharma">Dr. Priya Sharma</option>
              <option value="Dr. Rahul Mehta">Dr. Rahul Mehta</option>
              <option value="Dr. Sneha Patil">Dr. Sneha Patil</option>
              <option value="Dr. Vikram Singh">Dr. Vikram Singh</option>
            </Form.Select>
          </Col>
        </Row>

        <Row className="g-2">

          <Col md={6}>
            <Form.Label className="fw-bold" style={{ fontSize: "11px", color: "#006064" }}>Test Fee <span className="text-danger">*</span></Form.Label>
            <Form.Select value={otherTestData.testFeeStatus} onChange={(e) => handleOtherTestChange("testFeeStatus", e.target.value)} required style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px", height: "33px" }}>
              <option value="">Select Fee Status</option>
              <option value="true">Yes</option>
              <option value="NO">No</option>
              <option value="Due">Due</option>
              <option value="DNC">DNC</option>
              <option value="IncludePkd">IncludePkd</option>
            </Form.Select>
          </Col>
          <Col md={6}>
            <Form.Label className="fw-bold" style={{ fontSize: "11px", color: "#006064" }}>Visit Type <span className="text-danger">*</span></Form.Label>
            <Form.Select value={otherTestData.visitType} onChange={(e) => handleOtherTestChange("visitType", e.target.value)} required style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px", height: "33px" }}>
              <option value="">Select Visit Type</option>
              <option value="OPD">OPD</option>
              <option value="IPD">IPD</option>
            </Form.Select>
          </Col>
        </Row>

        <Row className="g-2">

          <Col md={12}>
            <Form.Label className="fw-bold" style={{ fontSize: "11px", color: "#006064" }}>Comment <span className="text-danger">*</span></Form.Label>
            <Form.Control as="textarea" rows={2} value={otherTestData.test_comment} onChange={(e) => handleOtherTestChange("test_comment", e.target.value)} placeholder="Reason for tests..." required style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
        </Row>
      </div>
      <div className="text-center mb-5 pb-5 mt-4">
        <Button style={{ backgroundColor: "#00acc1", borderColor: "#00acc1", padding: "10px 40px", borderRadius: "40px", fontWeight: "800", fontSize: "13px", boxShadow: "0 8px 25px rgba(0, 172, 193, 0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>
          <FeatherIcon icon="send" size="18" className="me-2" /> SEND TEST REQUEST
        </Button>
      </div>
    </div>
  );
};

export default OtherTestsCard;
