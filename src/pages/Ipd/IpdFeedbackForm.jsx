import React, { useState, useEffect, useMemo } from "react";
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

  // Calculate scores and Patient Satisfaction Index (%)
  const scores = useMemo(() => {
    const facilityScores = Object.values(facility).map((val) => Number(val) || 0);
    const healingScores = Object.values(healingTeam).map((val) => Number(val) || 0);
    const transparencyScores = Object.values(transparency).map((val) => Number(val) || 0);

    const facilityAchieved = facilityScores.reduce((a, b) => a + b, 0);
    const healingAchieved = healingScores.reduce((a, b) => a + b, 0);
    const transparencyAchieved = transparencyScores.reduce((a, b) => a + b, 0);

    const totalAchieved = facilityAchieved + healingAchieved + transparencyAchieved;
    const maxPossible = 50; // 10 questions * 5 max stars

    const facilityAnswered = Object.values(facility).filter((v) => v !== "").length;
    const healingAnswered = Object.values(healingTeam).filter((v) => v !== "").length;
    const transparencyAnswered = Object.values(transparency).filter((v) => v !== "").length;
    const answeredCount = facilityAnswered + healingAnswered + transparencyAnswered;

    const psi = maxPossible > 0 ? (totalAchieved / maxPossible) * 100 : 0;

    return {
      facilityAchieved,
      facilityMax: 15,
      facilityAnswered,
      healingAchieved,
      healingMax: 20,
      healingAnswered,
      transparencyAchieved,
      transparencyMax: 15,
      transparencyAnswered,
      totalAchieved,
      maxPossible,
      answeredCount,
      totalCriteria: 10,
      psi: Number(psi.toFixed(2)),
    };
  }, [facility, healingTeam, transparency]);

  // Calculate NPS details based on recommendation score (1-10)
  const npsInfo = useMemo(() => {
    const score = Number(recommendScore);
    if (!recommendScore || isNaN(score)) {
      return { category: "", score: null, label: "Not Selected", color: "#64748b", bg: "#f1f5f9" };
    }
    if (score >= 9) {
      return { category: "Promoter", score: score, label: `Promoter (Score ${score})`, color: "#2e7d32", bg: "#e8f5e9" };
    } else if (score >= 7) {
      return { category: "Passive", score: score, label: `Passive (Score ${score})`, color: "#f57c00", bg: "#fff3e0" };
    } else {
      return { category: "Detractor", score: score, label: `Detractor (Score ${score})`, color: "#c62828", bg: "#ffebee" };
    }
  }, [recommendScore]);

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
      recommendScore: Number(recommendScore),
      totalScoreAchieved: scores.totalAchieved,
      maxPossibleScore: scores.maxPossible,
      patientSatisfactionIndex: scores.totalAchieved,
      netPromoterScore: Number(recommendScore),
      psi: scores.totalAchieved,
      nps: Number(recommendScore),
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
        text: `The IPD Feedback Form details have been entered successfully. Patient Satisfaction Index: ${scores.totalAchieved}/50`,
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
    <tr style={{ verticalAlign: "middle", borderBottom: "1px dotted #c1d2e4ff" }}>
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
      <tr style={{ borderBottom: "1px dotted #9daab7ff" }}>
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
    <>
      <div className="d-flex justify-content-end align-items-center mb-3 px-2">
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
          <Card className="border shadow-sm mb-15" style={{ borderRadius: "10px", borderColor: "#cbd5e1" }}>
            <Card.Body style={{ padding: "12px 15px" }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold m-0" style={{ color: "#2c3e50", fontSize: "13px" }}>
                  The Facility <span className="text-danger">*</span>
                </h6>
                <span className="badge" style={{ backgroundColor: "#e0f7fa", color: "#00796b", fontSize: "11px", fontWeight: "600" }}>
                  Score: {scores.facilityAchieved} / {scores.facilityMax}
                </span>
              </div>
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
          <Card className="border shadow-sm mb-15" style={{ borderRadius: "10px", borderColor: "#cbd5e1" }}>
            <Card.Body style={{ padding: "12px 15px" }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold m-0" style={{ color: "#2c3e50", fontSize: "13px" }}>
                  The Healing Team (Everyone Who Supported Your Care) <span className="text-danger">*</span>
                </h6>
                <span className="badge" style={{ backgroundColor: "#e0f7fa", color: "#00796b", fontSize: "11px", fontWeight: "600" }}>
                  Score: {scores.healingAchieved} / {scores.healingMax}
                </span>
              </div>
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
          <Card className="border shadow-sm mb-15" style={{ borderRadius: "10px", borderColor: "#cbd5e1" }}>
            <Card.Body style={{ padding: "12px 15px" }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold m-0" style={{ color: "#2c3e50", fontSize: "13px" }}>
                  Ease and Transparency of Department <span className="text-danger">*</span>
                </h6>
                <span className="badge" style={{ backgroundColor: "#e0f7fa", color: "#00796b", fontSize: "11px", fontWeight: "600" }}>
                  Score: {scores.transparencyAchieved} / {scores.transparencyMax}
                </span>
              </div>
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

          {/* SECTION 4: Recommendation Dropdown & NPS */}
          <Card className="border shadow-sm mb-15" style={{ borderRadius: "10px", borderColor: "#cbd5e1" }}>
            <Card.Body style={{ padding: "14px 18px" }}>
              <Form.Group>
                <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                  <Form.Label className="fw-bold m-0" style={{ color: "#2c3e50", fontSize: "13px" }}>
                    How likely are you to recommend Healing Hands Clinic to family & friends? <span className="text-danger">*</span>
                  </Form.Label>
                  {npsInfo.category && (
                    <span
                      className="badge px-3 py-1"
                      style={{
                        backgroundColor: npsInfo.bg,
                        color: npsInfo.color,
                        fontSize: "11.5px",
                        fontWeight: "700",
                        borderRadius: "20px",
                        border: `1px solid ${npsInfo.color}44`,
                      }}
                    >
                      {npsInfo.category} ({npsInfo.score})
                    </span>
                  )}
                </div>
                <Row className="align-items-center">
                  <Col md={6} lg={2}>
                    <Form.Select
                      value={recommendScore}
                      onChange={(e) => setRecommendScore(e.target.value)}
                      style={{
                        border: "2px solid rgb(224, 230, 237)",
                        fontSize: "12px",
                        borderRadius: "8px",
                        padding: "6px 10px",
                        color: "#334155",
                        fontWeight: "500",
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

          {/* PATIENT SATISFACTION INDEX & NPS SUMMARY CARD */}
          <Card
            className="border shadow-sm mb-15"
            style={{
              borderRadius: "10px",
              background: "linear-gradient(135deg, #e0f7fa 0%, #ffffff 100%)",
              border: "1px solid #b2ebf2",
              borderLeft: "5px solid #00bcd4",
            }}
          >
            <Card.Body style={{ padding: "14px 18px" }}>
              <Row className="gy-3 align-items-center">
                {/* PSI Section */}
                <Col md={6} style={{ borderRight: "1px solid #b2ebf2" }}>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <FeatherIcon icon="award" size="18" style={{ color: "#00838f" }} />
                    <h6 className="fw-bold m-0" style={{ color: "#00695c", fontSize: "13.5px" }}>
                      Patient Satisfaction Index (PSI)
                    </h6>
                  </div>
                  <div className="d-flex align-items-start justify-content-between mt-2 pe-md-3">
                    <div style={{ fontSize: "12px", color: "#334155", fontWeight: "500" }}>
                      Score: <strong>{scores.totalAchieved}</strong> / <strong>{scores.maxPossible}</strong>
                    </div>
                    <div className="d-flex flex-column align-items-end text-end">
                      <span
                        style={{
                          fontSize: "22px",
                          fontWeight: "800",
                          lineHeight: "1.1",
                          color:
                            scores.psi >= 80
                              ? "#2e7d32"
                              : scores.psi >= 60
                                ? "#f57c00"
                                : scores.psi > 0
                                  ? "#c62828"
                                  : "#64748b",
                        }}
                      >
                        {scores.answeredCount > 0 ? `${scores.psi}%` : "0%"}
                      </span>
                      <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>
                        Formula: <code>(Total / Max) × 100</code>
                      </div>
                    </div>
                  </div>
                </Col>

                {/* NPS Section */}
                <Col md={6}>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <FeatherIcon icon="thumbs-up" size="18" style={{ color: "#00838f" }} />
                    <h6 className="fw-bold m-0" style={{ color: "#00695c", fontSize: "13.5px" }}>
                      Net Promoter Score (NPS)
                    </h6>
                  </div>
                  <div className="d-flex align-items-start justify-content-between mt-2 ps-md-2">
                    <div style={{ fontSize: "12px", color: "#334155", fontWeight: "500" }}>
                      Rating: <strong>{recommendScore || "—"}</strong>
                    </div>
                    <div className="d-flex flex-column align-items-end text-end">
                      {npsInfo.category ? (
                        <span
                          className="badge px-3 py-1"
                          style={{
                            backgroundColor: npsInfo.bg,
                            color: npsInfo.color,
                            fontSize: "11.5px",
                            fontWeight: "700",
                            borderRadius: "20px",
                            border: `1px solid ${npsInfo.color}44`,
                          }}
                        >
                          {npsInfo.category} ({npsInfo.score})
                        </span>
                      ) : (
                        <span className="text-muted" style={{ fontSize: "12px" }}>Select rating</span>
                      )}
                      <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>
                        Formula: <code>NPS = % Promoters - % Detractors</code>
                      </div>
                      <div style={{ fontSize: "10.5px", color: "#64748b", marginTop: "2px" }}>
                        • Promoters: 9–10 &nbsp;|&nbsp; Passives: 7–8 &nbsp;|&nbsp; Detractors: 1–6
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
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
    </>
  );
}
