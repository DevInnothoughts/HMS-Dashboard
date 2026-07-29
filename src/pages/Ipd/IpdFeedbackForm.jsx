import React, { useState, useEffect } from "react";
import { Card, Row, Col, Form, Button, Table } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import Swal from "sweetalert2";

export default function IpdFeedbackForm({ patient, location, BASE_URL, onSubmitSuccess }) {
  // State for ratings
  const [facility, setFacility] = useState({
    room: "",
    bathroom: "",
    ambience: "",
  });

  const [healingTeam, setHealingTeam] = useState({
    frontDesk: "",
    nursingCare: "",
    doctorCounselling: "",
    pharmacy: "",
  });

  const [transparency, setTransparency] = useState({
    admission: "",
    discharge: "",
    billingPayments: "",
  });

  const [recommendScore, setRecommendScore] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasExistingFeedback, setHasExistingFeedback] = useState(false);
  const isReadOnly = hasExistingFeedback && !isEditing;

  useEffect(() => {
    const fetchFeedback = async () => {
      const uidNo = patient?.Uid_no || patient?.uid_no;
      if (!uidNo || !location || !BASE_URL) return;
      try {
        const response = await fetch(
          `${BASE_URL}/V1/doctor/admission/get-feedback?uidNo=${encodeURIComponent(uidNo)}&location=${location}`
        );
        const result = await response.json();
        if (result.statusCode === 200 && result.data) {
          const fd = result.data;
          if (fd.facility) setFacility(fd.facility);
          if (fd.healingTeam) setHealingTeam(fd.healingTeam);
          if (fd.transparency) setTransparency(fd.transparency);
          if (fd.recommendScore) setRecommendScore(fd.recommendScore);
          setHasExistingFeedback(true);
        } else {
          setHasExistingFeedback(false);
        }
      } catch (err) {
        console.error("Error fetching existing feedback:", err);
      }
    };
    fetchFeedback();
  }, [patient?.Uid_no, patient?.uid_no, location, BASE_URL, isEditing]);

  const handleFacilityChange = (field, value) => {
    setFacility((prev) => ({ ...prev, [field]: value }));
  };

  const handleHealingTeamChange = (field, value) => {
    setHealingTeam((prev) => ({ ...prev, [field]: value }));
  };

  const handleTransparencyChange = (field, value) => {
    setTransparency((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all fields are filled
    const isFacilityFilled = Object.values(facility).every((val) => val !== "");
    const isHealingTeamFilled = Object.values(healingTeam).every((val) => val !== "");
    const isTransparencyFilled = Object.values(transparency).every((val) => val !== "");

    if (!isFacilityFilled || !isHealingTeamFilled || !isTransparencyFilled || !recommendScore) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Form",
        text: "Please fill all required feedback fields marked with *.",
        confirmButtonColor: "#00bcd4",
      });
      return;
    }

    setIsSubmitting(true);

    const feedbackData = {
      location: location || "",
      facility,
      healingTeam,
      transparency,
      recommendScore,
    };

    console.log("Submitting IPD Feedback:", feedbackData);

    try {
      const response = await fetch(`${BASE_URL}/V1/doctor/admission/submit-feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location,
          uidNo: patient?.Uid_no || "",
          feedbackData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to submit feedback data to the database");
      }

      await Swal.fire({
        icon: "success",
        title: "Feedback Recorded",
        text: "The IPD Feedback Form details have been entered successfully.",
        confirmButtonColor: "#00bcd4",
      });

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      setHasExistingFeedback(true);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: err.message || "Failed to record feedback.",
        confirmButtonColor: "#00bcd4",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingScales = [5, 4, 3, 2, 1];

  // Helper component to render a row of ratings
  const RatingRow = ({ label, currentValue, onChange }) => (
    <tr style={{ verticalAlign: "middle", borderBottom: "1px solid #f1f5f9" }}>
      <td style={{ textAlign: "left", padding: "6px 4px", fontWeight: "500", color: "#334155", fontSize: "12px" }}>
        {label}
      </td>
      {ratingScales.map((value) => (
        <td key={value} style={{ textAlign: "center", padding: "6px 4px" }}>
          <Form.Check
            inline
            type="radio"
            name={label.replace(/\s+/g, "-")}
            checked={currentValue === String(value)}
            onChange={() => onChange(String(value))}
            style={{ cursor: "pointer", transform: "scale(1.0)", margin: 0 }}
          />
        </td>
      ))}
    </tr>
  );

  const tableHeader = (
    <thead>
      <tr>
        <th style={{ width: "35%", textAlign: "left", border: "none", color: "#64748b", fontWeight: "600" }}></th>
        {ratingScales.map((star) => (
          <th key={star} style={{ textAlign: "center", border: "none", color: "#f59e0b", fontWeight: "600", fontSize: "11px", padding: "4px" }}>
            {star === 5 && <span style={{ fontSize: "8.5px", color: "#000000ff", display: "block", fontWeight: "normal", marginBottom: "1px" }}>(Highest)</span>}
            {star === 1 && <span style={{ fontSize: "8.5px", color: "#000000ff", display: "block", fontWeight: "normal", marginBottom: "1px" }}>(Lowest)</span>}
            {star !== 5 && star !== 1 && <span style={{ fontSize: "8.5px", display: "block", visibility: "hidden", marginBottom: "1px" }}>&nbsp;</span>}
            {star} <span style={{ fontSize: "10px" }}>⭐</span>
          </th>
        ))}
      </tr>
    </thead>
  );

  return (
    <div style={{ background: "#f8fafd", padding: "12px", borderRadius: "15px" }}>
      <div className="d-flex justify-content-between align-items-center mb-3 px-2">
        <h5
          className="fw-bold m-0"
          style={{
            color: "#00838f",
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontSize: "14px",
          }}
        >
          <FeatherIcon icon="file-text" size="18" className="me-2 text-info" />
          IPD Feedback Form Details
        </h5>
        {isReadOnly && (
          <Button
            variant="outline-warning"
            size="sm"
            onClick={() => setIsEditing(true)}
            style={{
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "700",
              padding: "7px 15px",
            }}
          >
            <FeatherIcon icon="edit-2" size="13" className="me-1" /> EDIT
          </Button>
        )}
      </div>

      <Form onSubmit={handleSubmit}>
        <fieldset disabled={isReadOnly} style={{ display: "contents" }}>
          {/* SECTION 1: The Facility */}
          <Card className="border-0 shadow-sm mb-15" style={{ borderRadius: "10px" }}>
            <Card.Body style={{ padding: "12px 15px" }}>
              <h6 className="fw-bold mb-2" style={{ color: "#2c3e50", fontSize: "13px" }}>
                The Facility <span className="text-danger">*</span>
              </h6>
              <Table responsive borderless style={{ marginBottom: 0 }}>
                {tableHeader}
                <tbody>
                  <RatingRow
                    label="Room"
                    currentValue={facility.room}
                    onChange={(val) => handleFacilityChange("room", val)}
                  />
                  <RatingRow
                    label="Bathroom"
                    currentValue={facility.bathroom}
                    onChange={(val) => handleFacilityChange("bathroom", val)}
                  />
                  <RatingRow
                    label="Ambience"
                    currentValue={facility.ambience}
                    onChange={(val) => handleFacilityChange("ambience", val)}
                  />
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* SECTION 2: The Healing Team */}
          <Card className="border-0 shadow-sm mb-15" style={{ borderRadius: "10px" }}>
            <Card.Body style={{ padding: "12px 15px" }}>
              <h6 className="fw-bold mb-2" style={{ color: "#2c3e50", fontSize: "13px" }}>
                The Healing Team (Everyone Who Supported Your Care) <span className="text-danger">*</span>
              </h6>
              <Table responsive borderless style={{ marginBottom: 0 }}>
                {tableHeader}
                <tbody>
                  <RatingRow
                    label="Front Desk"
                    currentValue={healingTeam.frontDesk}
                    onChange={(val) => handleHealingTeamChange("frontDesk", val)}
                  />
                  <RatingRow
                    label="Nursing Care"
                    currentValue={healingTeam.nursingCare}
                    onChange={(val) => handleHealingTeamChange("nursingCare", val)}
                  />
                  <RatingRow
                    label="Doctor Counselling"
                    currentValue={healingTeam.doctorCounselling}
                    onChange={(val) => handleHealingTeamChange("doctorCounselling", val)}
                  />
                  <RatingRow
                    label="Pharmacy"
                    currentValue={healingTeam.pharmacy}
                    onChange={(val) => handleHealingTeamChange("pharmacy", val)}
                  />
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* SECTION 3: Ease and Transparency */}
          <Card className="border-0 shadow-sm mb-15" style={{ borderRadius: "10px" }}>
            <Card.Body style={{ padding: "12px 15px" }}>
              <h6 className="fw-bold mb-2" style={{ color: "#2c3e50", fontSize: "13px" }}>
                Ease and Transparency of Department <span className="text-danger">*</span>
              </h6>
              <Table responsive borderless style={{ marginBottom: 0 }}>
                {tableHeader}
                <tbody>
                  <RatingRow
                    label="Admission"
                    currentValue={transparency.admission}
                    onChange={(val) => handleTransparencyChange("admission", val)}
                  />
                  <RatingRow
                    label="Discharge"
                    currentValue={transparency.discharge}
                    onChange={(val) => handleTransparencyChange("discharge", val)}
                  />
                  <RatingRow
                    label="Billing and Payments"
                    currentValue={transparency.billingPayments}
                    onChange={(val) => handleTransparencyChange("billingPayments", val)}
                  />
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* SECTION 4: Recommendation Dropdown */}
          <Card className="border-0 shadow-sm mb-15" style={{ borderRadius: "10px" }}>
            <Card.Body style={{ padding: "12px 15px" }}>
              <Form.Group>
                <Form.Label className="fw-bold mb-2" style={{ color: "#2c3e50", fontSize: "12.5px" }}>
                  How likely are you to recommend Healing Hands Clinic to family & friends? <span className="text-danger">*</span>
                </Form.Label>
                <Row>
                  <Col md={6} lg={3}>
                    <Form.Select
                      value={recommendScore}
                      onChange={(e) => setRecommendScore(e.target.value)}
                      style={{
                        border: "2px solid rgb(224, 230, 237)",
                        fontSize: "12px",
                        borderRadius: "8px",
                        padding: "4px 8px",
                        color: "#334155"
                      }}
                    >
                      <option value="">--Choose option--</option>
                      <option value="10">10 (Highest)</option>
                      <option value="9">9</option>
                      <option value="8">8</option>
                      <option value="7">7</option>
                      <option value="6">6</option>
                      <option value="5">5</option>
                      <option value="4">4</option>
                      <option value="3">3</option>
                      <option value="2">2</option>
                      <option value="1">1 (Lowest)</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Form.Group>
            </Card.Body>
          </Card>
        </fieldset>

        {/* Action Buttons */}
        {isReadOnly ? (
          <div className="text-center mt-3 mb-3">
            <span
              className="d-inline-flex align-items-center text-muted"
              style={{ fontWeight: 600, fontSize: "13px" }}
            >
              <FeatherIcon icon="lock" size="16" className="me-2" style={{ color: "#ff9800" }} />
              Locked — click EDIT at top-right to modify this record.
            </span>
          </div>
        ) : (
          <div className="d-flex justify-content-center gap-3 mt-3 mb-3">
            {hasExistingFeedback && (
              <Button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{
                  borderRadius: "10px",
                  padding: "10px 20px",
                  fontWeight: "bold",
                  fontSize: "12px",
                  backgroundColor: "#6c757d",
                  borderColor: "#6c757d",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              style={{
                borderRadius: "10px",
                padding: "10px 20px",
                fontWeight: "bold",
                fontSize: "12px",
                backgroundColor: "#00bcd4",
                border: "none",
                boxShadow: "0px 4px 8px rgba(0, 188, 212, 0.2)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <FeatherIcon icon={isSubmitting ? "loader" : "check-circle"} size="15" className={isSubmitting ? "spin" : ""} />
              {isSubmitting ? "Submitting..." : hasExistingFeedback ? "Update Feedback" : "Submit Feedback"}
            </Button>
          </div>
        )}
      </Form>
      <style>{`
        .form-check-input[type="radio"] {
          border: 1px solid #000000 !important;
          cursor: pointer;
        }
        .form-check-input[type="radio"]:checked {
          background-color: #00bcd4 !important;
          border-color: #00bcd4 !important;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
