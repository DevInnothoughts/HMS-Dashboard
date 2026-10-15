/* eslint-disable react/prop-types, no-unused-vars */
import React, { useState, useMemo, useEffect } from "react";
import { Row, Col, Form, Button, Table, Spinner } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import Swal from "sweetalert2";
import { decodeJwt } from "../Utility/decode-jwt";

const BASE_URL = "http://194.195.117.79:5100/api";

// --- Clinical Data Constants ---
const SYMPTOMS_LIST = [
  "Pain",
  "Bleeding",
  "Discharge",
  "Swelling",
  "Burning",
  "Itching",
  "Fever",
  "Difficulty in passing stools",
  "Pain while passing stools",
  "Constipation",
  "Diarrhoea / Loose stools",
  "Difficulty in sitting / walking",
  "Wound opening",
  "Wound-related concern",
  "Any new lump / swelling",
  "Urinary symptoms",
  "Other",
];

const PAIN_LOCATIONS = [
  "Perianal area",
  "Anal canal",
  "Surgical incision site",
  "Abdominal area",
  "Groin / Perineal",
  "Lower back",
  "Other",
];

const PAIN_NATURE_OPTIONS = [
  "Burning",
  "Throbbing",
  "Sharp / Stabbing",
  "Dull ache",
  "Pulling / Tightness",
  "Cramping",
  "Other",
];

// Defense and Veterans Pain Rating Scale (DVPRS)
const DVPRS_SCALE = [
  { score: 0, severity: "none", label: "No pain", color: "#10b981", bg: "#ecfdf5", desc: "No pain at all." },
  { score: 1, severity: "mild", label: "Hardly notice", color: "#22c55e", bg: "#f0fdf4", desc: "Hardly notice pain." },
  { score: 2, severity: "mild", label: "Notice pain", color: "#84cc16", bg: "#f7fee7", desc: "Notice pain; does not interfere with activities." },
  { score: 3, severity: "mild", label: "Distracts sometimes", color: "#a3e635", bg: "#f7fee7", desc: "Sometimes distracts me." },
  { score: 4, severity: "moderate", label: "Can do activities", color: "#eab308", bg: "#fefce8", desc: "Distracts me; can do usual activities." },
  { score: 5, severity: "moderate", label: "Interrupts some", color: "#f59e0b", bg: "#fffbeb", desc: "Interrupts some activities." },
  { score: 6, severity: "moderate", label: "Hard to ignore", color: "#d97706", bg: "#fffbeb", desc: "Hard to ignore; avoid usual activities." },
  { score: 7, severity: "severe", label: "Prevents activities", color: "#f97316", bg: "#fff7ed", desc: "Focus of attention; prevents doing daily activities." },
  { score: 8, severity: "severe", label: "Hard to do anything", color: "#ea580c", bg: "#fff7ed", desc: "Awful; hard to do anything." },
  { score: 9, severity: "worst", label: "Can't bear pain", color: "#ef4444", bg: "#fef2f2", desc: "Can't bear the pain; unable to do anything." },
  { score: 10, severity: "worst", label: "Worst possible", color: "#b91c1c", bg: "#fef2f2", desc: "As bad as it could be; nothing else matters." },
];

// Southampton Wound Grading System
const SOUTHAMPTON_GRADES = {
  "0": {
    grade: "0",
    name: "Grade 0: Normal Healing",
    description: "Normal healing without complication.",
    subgrades: [],
    color: "#10b981",
  },
  "I": {
    grade: "I",
    name: "Grade I: Mild Bruising / Erythema",
    description: "Normal healing with mild bruising or erythema.",
    subgrades: [
      { id: "Ia", label: "Ia – Some bruising" },
      { id: "Ib", label: "Ib – Considerable bruising" },
      { id: "Ic", label: "Ic – Mild erythema" },
    ],
    color: "#0ea5e9",
  },
  "II": {
    grade: "II",
    name: "Grade II: Erythema & Inflammation",
    description: "Erythema plus other signs of inflammation.",
    subgrades: [
      { id: "IIa", label: "IIa – At one point" },
      { id: "IIb", label: "IIb – Around sutures" },
      { id: "IIc", label: "IIc – Along wound" },
      { id: "IId", label: "IId – Around wound" },
    ],
    color: "#f59e0b",
  },
  "III": {
    grade: "III",
    name: "Grade III: Haemoserous Discharge",
    description: "Clear or haemoserous discharge from wound.",
    subgrades: [
      { id: "IIIa", label: "IIIa – Point ≤2cm" },
      { id: "IIIb", label: "IIIb – Along wound >2cm" },
      { id: "IIIc", label: "IIIc – Large volume" },
      { id: "IIId", label: "IIId – Prolonged >3 days" },
    ],
    color: "#f97316",
  },
  "IV": {
    grade: "IV",
    name: "Grade IV: Pus / Purulent Discharge",
    description: "Major complication: Pus formation.",
    subgrades: [
      { id: "IVa", label: "IVa – Point ≤2cm" },
      { id: "IVb", label: "IVb – Along wound >2cm" },
    ],
    color: "#dc2626",
  },
  "V": {
    grade: "V",
    name: "Grade V: Deep Infection / Breakdown",
    description: "Deep or severe wound infection with or without tissue breakdown / haematoma.",
    subgrades: [],
    color: "#991b1b",
  },
};

const INVESTIGATION_OPTIONS = [
  "USG (Pelvis / Perianal)",
  "CBC / ESR / CRP",
  "Pus / Wound Swab Culture",
  "MRI Fistulogram / Pelvis",
  "Urine Routine / Culture",
  "Other Imaging",
  "Other Investigation",
];

const ADVICE_OPTIONS = [
  "Dressing advised",
  "Sitz bath (Warm water)",
  "High-fiber diet & hydration",
  "Bowel management / Laxatives",
  "Activity restriction (No heavy lifting)",
  "Strict hygiene & wound care",
  "Avoid prolonged sitting",
  "Pelvic floor rest",
];

const getOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// Available post-op visit round options (1st PO to 15th PO)
const PO_VISIT_ROUNDS = Array.from({ length: 15 }, (_, i) => `${getOrdinal(i + 1)} PO`);

// Available post-op day options
const POST_OP_DAYS = [
  { value: "Day 1", label: "Day 1 (Post-Op)" },
  { value: "Day 2", label: "Day 2" },
  { value: "Day 3", label: "Day 3" },
  { value: "Day 4", label: "Day 4" },
  { value: "Day 5", label: "Day 5" },
  { value: "Day 7", label: "Day 7 (1 Week)" },
  { value: "Day 10", label: "Day 10" },
  { value: "Day 14", label: "Day 14 (2 Weeks)" },
  { value: "Day 21", label: "Day 21 (3 Weeks)" },
  { value: "Day 30", label: "Day 30 (1 Month)" },
  { value: "Day 60", label: "Day 60 (2 Months)" },
  { value: "Day 90", label: "Day 90 (3 months)" },
  { value: "Day 120", label: "Day 120 (4 months)" },
  { value: "Day 180", label: "Day 180 (6 months)" },
];

const defaultVisitState = {
  postop_id: null,
  consultantDoctor: "",
  visitNo: "1st PO",
  date: new Date().toISOString().split("T")[0],
  day: "Day 1",
  complaints: [],
  otherSymptom: "",
  clinicalNotes: "",
  painScore: null,
  painLocation: "",
  painNature: "",
  painTrend: "",
  painSinceLastVisit: "",
  painInterferes: "",
  woundGrade: "0",
  woundSubgrade: "",
  woundNotes: "",
  medicinesStatus: [],
  medicinesNotes: "",
  investigations: [],
  investigationSpecify: "",
  ruleOutUnderlying: "No",
  ruleOutDetails: "",
  adviceList: [],
  adviceNotes: "",
  reviewDays: null,
  earlierReviewIfWorse: false,
};

const PostOpCard = ({
  formData = {},
  loading: parentLoading = false,
  doctors = [],
  currentLocation: propLocation,
  baseUrl: propBaseUrl,
  onSaveSuccess,
}) => {
  const [historyList, setHistoryList] = useState([]);
  const [currentVisit, setCurrentVisit] = useState(defaultVisitState);
  const [isSaving, setIsSaving] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);

  const effectiveBaseUrl = propBaseUrl || BASE_URL;

  const currentLocation = useMemo(() => {
    if (propLocation && propLocation !== "default") return propLocation;
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = decodeJwt(token);
        if (payload && payload.jobLocation) return payload.jobLocation;
      } catch (e) {
        // ignore
      }
    }
    const storedLoc = localStorage.getItem("location");
    if (storedLoc && storedLoc !== "default") return storedLoc;
    return "default";
  }, [propLocation]);

  const patientId = formData.patient_id || formData.id;

  const fetchPostOpHistory = async () => {
    if (!patientId || !currentLocation || currentLocation === "default") return;

    setFetchingHistory(true);
    try {
      const response = await fetch(
        `${effectiveBaseUrl}/V1/doctor/list-post-op-history/${patientId}?location=${encodeURIComponent(currentLocation)}`,
        {
          headers: {
            location: currentLocation,
            "x-hms-location": currentLocation,
          },
        }
      );
      const result = await response.json();
      if (result.statusCode === 200 && Array.isArray(result.data)) {
        setHistoryList(result.data);
        if (typeof onSaveSuccess === "function") {
          onSaveSuccess(result.data);
        }
      }
    } catch (err) {
      console.error("Error fetching post-op history:", err);
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    fetchPostOpHistory();
  }, [patientId, currentLocation]);

  const getDoctorName = (docVal) => {
    if (!docVal) return "—";
    const found = doctors.find(
      (d) =>
        String(d.doctor_id) === String(docVal) ||
        String(d.id) === String(docVal) ||
        d.name === docVal ||
        d.doctor_name === docVal
    );
    if (found) return found.name || found.doctor_name || docVal;
    return docVal;
  };

  const previousVisit = historyList.length > 0 ? historyList[historyList.length - 1] : null;

  const handleSymptomToggle = (symptom) => {
    setCurrentVisit((prev) => {
      const exists = prev.complaints.includes(symptom);
      return {
        ...prev,
        complaints: exists
          ? prev.complaints.filter((s) => s !== symptom)
          : [...prev.complaints, symptom],
      };
    });
  };

  const handleAdviceToggle = (item) => {
    setCurrentVisit((prev) => {
      const exists = prev.adviceList.includes(item);
      return {
        ...prev,
        adviceList: exists
          ? prev.adviceList.filter((a) => a !== item)
          : [...prev.adviceList, item],
      };
    });
  };

  const handleMedStatusToggle = (status) => {
    setCurrentVisit((prev) => {
      const exists = prev.medicinesStatus.includes(status);
      return {
        ...prev,
        medicinesStatus: exists
          ? prev.medicinesStatus.filter((s) => s !== status)
          : [...prev.medicinesStatus, status],
      };
    });
  };

  const handleInvestigationToggle = (inv) => {
    setCurrentVisit((prev) => {
      const exists = prev.investigations.includes(inv);
      return {
        ...prev,
        investigations: exists
          ? prev.investigations.filter((i) => i !== inv)
          : [...prev.investigations, inv],
        ...(exists && inv === "Other Investigation" ? { investigationSpecify: "" } : {}),
      };
    });
  };

  // Automated Red-Flag detection
  const redFlags = useMemo(() => {
    const alerts = [];
    const currentScore = currentVisit.painScore;
    const prevScore = previousVisit ? previousVisit.painScore : null;

    if (currentScore !== null && prevScore !== null && currentScore > prevScore) {
      alerts.push({
        severity: "danger",
        title: "Pain Increasing",
        message: `Current pain (${currentScore}/10) is higher than previous visit (${prevScore}/10).`,
      });
    }

    if (currentScore !== null && currentScore >= 7) {
      alerts.push({
        severity: "warning",
        title: "Severe Pain",
        message: `Pain score (${currentScore}/10) is severely interfering with activities.`,
      });
    }

    if (["IV", "V"].includes(currentVisit.woundGrade)) {
      alerts.push({
        severity: "danger",
        title: "Wound Complication",
        message: `Southampton ${SOUTHAMPTON_GRADES[currentVisit.woundGrade]?.name} detected.`,
      });
    }

    const dangerousSymptoms = ["Fever", "Wound opening", "Bleeding"];
    const activeDangerSymptoms = currentVisit.complaints.filter((s) => dangerousSymptoms.includes(s));
    if (activeDangerSymptoms.length > 0) {
      alerts.push({
        severity: "danger",
        title: "Critical Symptoms",
        message: `Reported: ${activeDangerSymptoms.join(", ")}. Assess for secondary infection or dehiscence.`,
      });
    }

    if (currentVisit.ruleOutUnderlying === "Yes") {
      alerts.push({
        severity: "warning",
        title: "Rule-Out Flagged",
        message: currentVisit.ruleOutDetails || "Diagnostic workup recommended to rule out underlying collection.",
      });
    }

    return alerts;
  }, [currentVisit, previousVisit]);

  const handleSaveVisit = async () => {
    if (!patientId) {
      Swal.fire({
        icon: "warning",
        title: "Patient Required",
        text: "Please select or open a patient record first before saving.",
      });
      return;
    }

    if (!currentLocation || currentLocation === "default") {
      Swal.fire({
        icon: "warning",
        title: "Branch Location Missing",
        text: "Branch location could not be determined. Please ensure your hospital branch location is set before saving.",
      });
      return;
    }

    if (!currentVisit.complaints.length) {
      Swal.fire({
        icon: "warning",
        title: "Complaints Required",
        text: "Please select at least one symptom or choose Other.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `${effectiveBaseUrl}/V1/doctor/save-post-op/${patientId}?location=${encodeURIComponent(currentLocation)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            location: currentLocation,
            "x-hms-location": currentLocation,
          },
          body: JSON.stringify({
            ...currentVisit,
            location: currentLocation,
          }),
        }
      );

      const result = await response.json();
      if (result.statusCode === 200) {
        if (result.data?.postop_id) {
          setCurrentVisit((prev) => ({
            ...prev,
            postop_id: result.data.postop_id,
          }));
        }

        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: `${currentVisit.visitNo} (${currentVisit.day}) recorded successfully.`,
          timer: 1800,
          showConfirmButton: false,
        });

        await fetchPostOpHistory();
        if (typeof onSaveSuccess === "function") {
          onSaveSuccess();
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Save Failed",
          text: result.message || "Failed to save post-op record.",
        });
      }
    } catch (error) {
      console.error("Error saving post-op record:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "An error occurred while saving.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewVisit = () => {
    const nextVisitNumber = `${getOrdinal(historyList.length + 1)} PO`;

    const nextDay =
      historyList.length === 0
        ? "Day 1"
        : `Day ${historyList.length * 5 + 5}`;

    setCurrentVisit({
      ...defaultVisitState,
      consultantDoctor: currentVisit.consultantDoctor || "",
      visitNo: nextVisitNumber,
      date: new Date().toISOString().split("T")[0],
      day: nextDay,
    });
  };

  const handleLoadVisit = (item) => {
    setCurrentVisit({
      postop_id: item.postop_id || item.id || null,
      consultantDoctor: (() => {
        const val = item.consultantDoctor || item.consultant_doctor;
        if (!val) return "";
        const matched = doctors.find(
          (d) => String(d.doctor_id) === String(val) || String(d.id) === String(val) || d.name === val || d.doctor_name === val
        );
        return matched ? String(matched.doctor_id ?? matched.id) : String(val);
      })(),
      visitNo: item.visitNo || item.po_visit_round || "1st PO",
      date: item.date || item.visit_date || new Date().toISOString().split("T")[0],
      day: item.day || item.post_op_day || "Day 1",
      complaints: Array.isArray(item.complaints) ? item.complaints : [],
      otherSymptom: item.otherSymptom || item.other_symptom || "",
      clinicalNotes: item.clinicalNotes || item.clinical_notes || "",
      painScore: item.painScore !== null && item.painScore !== undefined ? item.painScore : null,
      painLocation: item.painLocation || item.pain_location || "",
      painNature: item.painNature || item.pain_nature || "",
      painTrend: item.painTrend || item.pain_trend || "",
      painSinceLastVisit: item.painSinceLastVisit || item.pain_since_last_visit || "",
      painInterferes: item.painInterferes || item.pain_interferes || "",
      woundGrade: item.woundGrade || (item.wound_assessment && item.wound_assessment.grade) || "0",
      woundSubgrade: item.woundSubgrade || (item.wound_assessment && item.wound_assessment.subgrade) || "",
      woundNotes: item.woundNotes || (item.wound_assessment && item.wound_assessment.observations) || "",
      medicinesStatus: Array.isArray(item.medicinesStatus)
        ? item.medicinesStatus
        : Array.isArray(item.medication_plan?.status)
          ? item.medication_plan.status
          : [],
      medicinesNotes: item.medicinesNotes || item.medication_plan?.notes || "",
      investigations: Array.isArray(item.investigations)
        ? item.investigations
        : Array.isArray(item.investigations_advised?.investigations)
          ? item.investigations_advised.investigations
          : [],
      investigationSpecify: item.investigationSpecify || item.investigations_advised?.other_specify || "",
      ruleOutUnderlying: item.ruleOutUnderlying || item.investigations_advised?.rule_out_underlying || "No",
      ruleOutDetails: item.ruleOutDetails || item.investigations_advised?.rule_out_details || "",
      adviceList: Array.isArray(item.adviceList)
        ? item.adviceList
        : Array.isArray(item.general_advice?.advice_list)
          ? item.general_advice.advice_list
          : [],
      adviceNotes: item.adviceNotes || item.general_advice?.notes || "",
      reviewDays:
        item.reviewDays !== null && item.reviewDays !== undefined && item.reviewDays !== ""
          ? Number(item.reviewDays)
          : null,
      earlierReviewIfWorse: Boolean(item.earlierReviewIfWorse || item.earlier_review_if_worse),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteVisit = async (item) => {
    const postopId = item.postop_id || item.id;
    if (!postopId) return;

    const confirm = await Swal.fire({
      title: "Delete Record?",
      text: `Are you sure you want to delete ${item.visitNo || "this post-op record"}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        const response = await fetch(
          `${effectiveBaseUrl}/V1/doctor/delete-post-op/${patientId}/${postopId}?location=${encodeURIComponent(currentLocation)}`,
          {
            method: "DELETE",
            headers: {
              location: currentLocation,
              "x-hms-location": currentLocation,
            },
          }
        );
        const result = await response.json();
        if (result.statusCode === 200) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Post-op record has been removed.",
            timer: 1500,
            showConfirmButton: false,
          });
          if (currentVisit.postop_id === postopId) {
            handleNewVisit();
          }
          await fetchPostOpHistory();
          if (typeof onSaveSuccess === "function") {
            onSaveSuccess();
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: result.message || "Could not delete record.",
          });
        }
      } catch (err) {
        console.error("Error deleting post-op record:", err);
      }
    }
  };

  const currentDvprs =
    currentVisit.painScore !== null && currentVisit.painScore !== undefined
      ? DVPRS_SCALE[currentVisit.painScore]
      : null;

  return (
    <div className="animate__animated animate__fadeIn">
      <style>{`
        .form-check-input { border: 1px solid black !important; }
        .form-check-input:checked { background-color: #00838f; border-color: black !important; }
      `}</style>

      {/* 1. Header & PO Visit Information */}
      <div
        className="p-3 bg-white rounded shadow-sm border mb-3"
        style={{ borderLeft: "5px solid #00bcd4" }}
      >
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
            <FeatherIcon icon="activity" size="18" className="me-2 text-info" />
            Post-Operative Evaluation
          </h5>
          <div className="d-flex align-items-center gap-2">
            {currentVisit.postop_id && (
              <span
                className="badge d-inline-flex align-items-center px-2 py-8"
                style={{
                  backgroundColor: "#fff3cd",
                  color: "#856404",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: "600",
                }}
              >
                <FeatherIcon icon="edit-2" size="11" className="me-1" />
                Editing #{currentVisit.postop_id}
              </span>
            )}
            <Button
              variant={currentVisit.postop_id ? "outline-secondary" : "outline-info"}
              size="sm"
              onClick={handleNewVisit}
              style={{
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "700",
                padding: "7px 12px",
              }}
            >
              <FeatherIcon icon="plus" size="13" className="me-1" /> {currentVisit.postop_id ? "NEW / CLEAR" : "NEW RECORD"}
            </Button>
            {historyList.length > 0 && (
              <span
                className="badge d-inline-flex align-items-center px-3 py-8"
                style={{
                  backgroundColor: "#e0f7fa",
                  color: "#00838f",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: "700",
                }}
              >
                <FeatherIcon icon="clock" size="12" className="me-1" />
                {historyList.length} Prior Visit{historyList.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <Row className="g-3 align-items-center">
          <Col md={3}>
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "13px", color: "#006064" }}>
              PO Visit Round
            </Form.Label>
            <Form.Select
              value={currentVisit.visitNo}
              onChange={(e) => setCurrentVisit({ ...currentVisit, visitNo: e.target.value })}
              style={{
                borderRadius: "10px",
                border: "2px solid #b2ebf2",
                fontSize: "12px",
                padding: "6px 12px",
                color: "#006064",
                fontWeight: "600",
              }}
            >
              {PO_VISIT_ROUNDS.map((round) => (
                <option key={round} value={round}>
                  {round} Visit
                </option>
              ))}
              {/* Preserves legacy round (e.g. historical "Follow-up PO") or visits above 15th if loaded from record */}
              {currentVisit.visitNo && !PO_VISIT_ROUNDS.includes(currentVisit.visitNo) && (
                <option value={currentVisit.visitNo}>
                  {currentVisit.visitNo.includes("Visit") ? currentVisit.visitNo : `${currentVisit.visitNo} Visit`}
                </option>
              )}
            </Form.Select>
          </Col>

          <Col md={3}>
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "13px", color: "#006064" }}>
              Visit Date
            </Form.Label>
            <Form.Control
              type="date"
              value={currentVisit.date}
              onChange={(e) => setCurrentVisit({ ...currentVisit, date: e.target.value })}
              style={{
                borderRadius: "10px",
                border: "2px solid #b2ebf2",
                fontSize: "12px",
                padding: "6px 12px",
              }}
            />
          </Col>

          <Col md={3}>
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "13px", color: "#006064" }}>
              Post-Op Day
            </Form.Label>
            <Form.Select
              value={currentVisit.day}
              onChange={(e) => setCurrentVisit({ ...currentVisit, day: e.target.value })}
              style={{
                borderRadius: "10px",
                border: "2px solid #b2ebf2",
                fontSize: "12px",
                padding: "6px 12px",
                color: "#006064",
                fontWeight: "600",
              }}
            >
              {POST_OP_DAYS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
              {currentVisit.day &&
                !POST_OP_DAYS.some((d) => d.value === currentVisit.day) && (
                  <option value={currentVisit.day}>{currentVisit.day}</option>
                )}
            </Form.Select>
          </Col>

          <Col md={3}>
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "13px", color: "#006064" }}>
              Consultant Doctor
            </Form.Label>
            <Form.Select
              value={currentVisit.consultantDoctor ? String(currentVisit.consultantDoctor) : ""}
              onChange={(e) => setCurrentVisit({ ...currentVisit, consultantDoctor: e.target.value })}
              style={{
                borderRadius: "10px",
                border: "2px solid #b2ebf2",
                fontSize: "12px",
                padding: "6px 12px",
                color: "#006064",
                fontWeight: "600",
              }}
            >
              <option value="">Select Consultant Doctor</option>
              {doctors.map((doc) => {
                const docId = String(doc.doctor_id ?? doc.id);
                return (
                  <option key={docId} value={docId}>
                    {doc.name || doc.doctor_name || `Dr. ${docId}`}
                  </option>
                );
              })}
            </Form.Select>
          </Col>
        </Row>

        {/* Minimal Longitudinal Progression Summary */}
        {historyList.length > 0 && (
          <div
            className="p-2 px-3 rounded mt-3"
            style={{ backgroundColor: "#f1fcfd", border: "1px solid #b2ebf2" }}
          >
            <Row className="g-2 align-items-center">
              <Col md={6}>
                <div className="d-flex align-items-center gap-1 flex-wrap">
                  <span className="fw-bold me-1" style={{ fontSize: "11px", color: "#006064", textTransform: "uppercase" }}>
                    <FeatherIcon icon="trending-up" size="13" className="me-1 text-info" />
                    Pain Trajectory:
                  </span>
                  {historyList.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: DVPRS_SCALE[item.painScore]?.bg || "#ffffff",
                          color: DVPRS_SCALE[item.painScore]?.color || "#00838f",
                          border: `1px solid ${DVPRS_SCALE[item.painScore]?.color || "#b2ebf2"}`,
                          fontSize: "10px",
                          fontWeight: "600",
                          padding: "3px 6px",
                        }}
                      >
                        {item.day}: {item.painScore}/10
                      </span>
                      <span className="text-muted" style={{ fontSize: "10px" }}>→</span>
                    </React.Fragment>
                  ))}
                  <span
                    className="badge"
                    style={{
                      backgroundColor: currentDvprs ? currentDvprs.bg : "#e0f2f1",
                      color: currentDvprs ? currentDvprs.color : "#006064",
                      border: `1px solid ${currentDvprs ? currentDvprs.color : "#00838f"}`,
                      fontSize: "10px",
                      fontWeight: "700",
                      padding: "3px 8px",
                    }}
                  >
                    Current: {currentVisit.painScore !== null ? `${currentVisit.painScore}/10` : "—"}
                  </span>
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex align-items-center gap-1 flex-wrap">
                  <span className="fw-bold me-1" style={{ fontSize: "11px", color: "#006064", textTransform: "uppercase" }}>
                    <FeatherIcon icon="shield" size="13" className="me-1 text-info" />
                    Wound Healing:
                  </span>
                  {historyList.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: "#ffffff",
                          color: SOUTHAMPTON_GRADES[item.woundGrade]?.color || "#00838f",
                          border: `1px solid ${SOUTHAMPTON_GRADES[item.woundGrade]?.color || "#b2ebf2"}`,
                          fontSize: "10px",
                          fontWeight: "600",
                          padding: "3px 6px",
                        }}
                      >
                        {item.day}: Grade {item.woundGrade}
                      </span>
                      <span className="text-muted" style={{ fontSize: "10px" }}>→</span>
                    </React.Fragment>
                  ))}
                  <span
                    className="badge"
                    style={{
                      backgroundColor: "#e8f5e9",
                      color: SOUTHAMPTON_GRADES[currentVisit.woundGrade]?.color || "#10b981",
                      border: `1px solid ${SOUTHAMPTON_GRADES[currentVisit.woundGrade]?.color || "#10b981"}`,
                      fontSize: "10px",
                      fontWeight: "700",
                      padding: "3px 8px",
                    }}
                  >
                    Current: Grade {currentVisit.woundGrade}
                  </span>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </div>

      {/* Red-Flag Alerts */}
      {redFlags.length > 0 && (
        <div className="mb-3">
          {redFlags.map((alert, idx) => (
            <div
              key={idx}
              className="d-flex align-items-center gap-2 p-2 px-3 mb-2 rounded border"
              style={{
                backgroundColor: alert.severity === "danger" ? "#fef2f2" : "#fffbeb",
                borderColor: alert.severity === "danger" ? "#fecaca" : "#fef3c7",
                color: alert.severity === "danger" ? "#991b1b" : "#92400e",
                fontSize: "12px",
                borderRadius: "8px",
              }}
            >
              <FeatherIcon icon="alert-circle" size="14" className="flex-shrink-0" />
              <span>
                <strong>{alert.title}:</strong> {alert.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 2. Complaints & Symptoms */}
      <div
        className="p-3 bg-white rounded shadow-sm border mb-3"
        style={{ borderLeft: "5px solid #00838f" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5
            className="fw-bold mb-0"
            style={{
              color: "#00838f",
              textTransform: "uppercase",
              fontSize: "14px",
            }}
          >
            Complaints & Symptoms
          </h5>
          {previousVisit && previousVisit.complaints?.length > 0 && (
            <small style={{ fontSize: "11px", color: "#607d8b" }}>
              Last Visit: <strong>{previousVisit.complaints.join(", ")}</strong>
            </small>
          )}
        </div>

        <div
          className="p-3 rounded mb-3"
          style={{ backgroundColor: "#f1fcfd", border: "2px solid #b2ebf2" }}
        >
          <Row className="g-2">
            {SYMPTOMS_LIST.map((symptom) => {
              const isChecked = currentVisit.complaints.includes(symptom);
              const wasInPrev = previousVisit && previousVisit.complaints?.includes(symptom);
              return (
                <Col xs={6} sm={4} md={3} key={symptom}>
                  <Form.Check
                    type="checkbox"
                    id={`symptom-${symptom.replace(/\s+/g, "-")}`}
                    label={
                      <span>
                        {symptom}
                        {wasInPrev && (
                          <span
                            className="badge ms-1"
                            style={{
                              backgroundColor: "#ff4b4bff",
                              color: "#ffffffff",
                              fontSize: "9px",
                              padding: "2px 5px",
                              fontWeight: "normal",
                            }}
                          >
                            Prior
                          </span>
                        )}
                      </span>
                    }
                    checked={isChecked}
                    onChange={() => handleSymptomToggle(symptom)}
                    className="mb-1"
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#006064",
                      cursor: "pointer",
                    }}
                  />
                </Col>
              );
            })}
          </Row>
        </div>

        <Row className="g-3">
          {currentVisit.complaints.includes("Other") && (
            <Col md={5}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "13px", color: "#006064" }}>
                Other Symptoms
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Specify other symptoms..."
                value={currentVisit.otherSymptom}
                onChange={(e) => setCurrentVisit({ ...currentVisit, otherSymptom: e.target.value })}
                style={{
                  borderRadius: "10px",
                  border: "2px solid #b2ebf2",
                  fontSize: "12px",
                  padding: "6px 12px",
                }}
              />
            </Col>
          )}
          <Col md={currentVisit.complaints.includes("Other") ? 7 : 12}>
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "13px", color: "#006064" }}>
              Clinical Symptoms Notes
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Record symptom remarks or patient narrative..."
              value={currentVisit.clinicalNotes}
              onChange={(e) => setCurrentVisit({ ...currentVisit, clinicalNotes: e.target.value })}
              style={{
                borderRadius: "10px",
                border: "2px solid #b2ebf2",
                fontSize: "12px",
                padding: "6px 12px",
              }}
            />
          </Col>
        </Row>
      </div>

      {/* 3. Pain Assessment */}
      <div
        className="p-3 bg-white rounded shadow-sm border mb-3"
        style={{ borderLeft: "5px solid #0097a7" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5
            className="fw-bold mb-0"
            style={{
              color: "#00838f",
              textTransform: "uppercase",
              fontSize: "14px",
            }}
          >
            Pain Assessment (DVPRS Scale 0–10)
          </h5>
          {currentDvprs ? (
            <span
              className="badge px-3 py-1"
              style={{
                backgroundColor: currentDvprs.bg,
                color: currentDvprs.color,
                border: `1px solid ${currentDvprs.color}`,
                fontSize: "12px",
                fontWeight: "700",
                borderRadius: "15px",
              }}
            >
              Score: {currentVisit.painScore}/10 — {currentDvprs.label}
            </span>
          ) : (
            <span className="text-muted" style={{ fontSize: "12px" }}>
              No score selected
            </span>
          )}
        </div>

        {/* Minimal 0-10 button selector */}
        <div
          className="p-2 px-3 rounded mb-2 d-flex align-items-center justify-content-between flex-wrap gap-1"
          style={{ backgroundColor: "#f1fcfd", border: "2px solid #b2ebf2" }}
        >
          {DVPRS_SCALE.map((item) => {
            const isSelected = currentVisit.painScore === item.score;
            return (
              <button
                key={item.score}
                type="button"
                onClick={() => setCurrentVisit({ ...currentVisit, painScore: item.score })}
                className="btn btn-sm d-flex flex-column align-items-center justify-content-center p-1"
                style={{
                  width: "36px",
                  height: "38px",
                  borderRadius: "8px",
                  border: isSelected ? `2px solid ${item.color}` : "1px solid #b2ebf2",
                  backgroundColor: isSelected ? item.color : "#ffffff",
                  color: isSelected ? "#ffffff" : item.color,
                  fontWeight: "700",
                  fontSize: "13px",
                  lineHeight: "1.1",
                  transition: "all 0.15s ease",
                  cursor: "pointer",
                }}
                title={`${item.score} - ${item.label}`}
              >
                <span>{item.score}</span>
                <span style={{ fontSize: "7px", textTransform: "uppercase", opacity: isSelected ? 1 : 0.85 }}>
                  {item.severity}
                </span>
              </button>
            );
          })}
        </div>

        {/* DVPRS Description Strip */}
        {currentDvprs ? (
          <div
            className="p-2 px-3 rounded mb-3"
            style={{
              backgroundColor: currentDvprs.bg,
              border: `1px solid ${currentDvprs.color}40`,
              fontSize: "12px",
            }}
          >
            <strong style={{ color: currentDvprs.color }}>
              Score {currentVisit.painScore}/10 — {currentDvprs.label}:
            </strong>{" "}
            <span style={{ color: "#374151" }}>{currentDvprs.desc}</span>
          </div>
        ) : (
          <div
            className="p-2 px-3 rounded mb-3 text-muted"
            style={{ backgroundColor: "#fafafa", border: "1px dashed #cbd5e1", fontSize: "12px" }}
          >
            Select a score (0–10) above to record patient pain intensity according to the DVPRS scale.
          </div>
        )}

        {/* Associated Pain Details Row */}
        <Row className="g-2">
          <Col xs={4} md={3}>
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "12px", color: "#006064" }}>
              Pain Location
            </Form.Label>
            <Form.Select
              value={currentVisit.painLocation}
              onChange={(e) => setCurrentVisit({ ...currentVisit, painLocation: e.target.value })}
              style={{
                borderRadius: "10px",
                border: "2px solid #b2ebf2",
                fontSize: "12px",
                padding: "6px 12px",
              }}
            >
              <option value="">Select Location</option>
              {PAIN_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </Form.Select>
          </Col>

          <Col xs={6} md={3}>
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "12px", color: "#006064" }}>
              Nature of Pain
            </Form.Label>
            <Form.Select
              value={currentVisit.painNature}
              onChange={(e) => setCurrentVisit({ ...currentVisit, painNature: e.target.value })}
              style={{
                borderRadius: "10px",
                border: "2px solid #b2ebf2",
                fontSize: "12px",
                padding: "6px 12px",
              }}
            >
              <option value="">Select Nature</option>
              {PAIN_NATURE_OPTIONS.map((nat) => (
                <option key={nat} value={nat}>{nat}</option>
              ))}
            </Form.Select>
          </Col>

          <Col xs={6} md={2}>
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "12px", color: "#006064" }}>
              Pain Trend
            </Form.Label>
            <Form.Select
              value={currentVisit.painTrend}
              onChange={(e) => setCurrentVisit({ ...currentVisit, painTrend: e.target.value })}
              style={{
                borderRadius: "10px",
                border: "2px solid #b2ebf2",
                fontSize: "12px",
                padding: "6px 12px",
              }}
            >
              <option value="">Select Trend</option>
              <option value="Improving">Improving</option>
              <option value="Same">Same</option>
              <option value="Increasing">Increasing</option>
              <option value="New">New</option>
            </Form.Select>
          </Col>

          <Col xs={6} md={2}>
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "12px", color: "#006064" }}>
              Since Last Visit?
            </Form.Label>
            <Form.Select
              value={currentVisit.painSinceLastVisit}
              onChange={(e) => setCurrentVisit({ ...currentVisit, painSinceLastVisit: e.target.value })}
              style={{
                borderRadius: "10px",
                border: "2px solid #b2ebf2",
                fontSize: "12px",
                padding: "6px 12px",
              }}
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </Form.Select>
          </Col>

          <Col xs={6} md={2}>
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "12px", color: "#006064" }}>
              Interferes Activities?
            </Form.Label>
            <Form.Select
              value={currentVisit.painInterferes}
              onChange={(e) => setCurrentVisit({ ...currentVisit, painInterferes: e.target.value })}
              style={{
                borderRadius: "10px",
                border: "2px solid #b2ebf2",
                fontSize: "12px",
                padding: "6px 12px",
              }}
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      {/* 4. Wound Assessment */}
      <div
        className="p-3 bg-white rounded shadow-sm border mb-3"
        style={{ borderLeft: "5px solid #00acc1" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5
            className="fw-bold mb-0"
            style={{
              color: "#00838f",
              textTransform: "uppercase",
              fontSize: "14px",
            }}
          >
            Wound Assessment (Southampton Classification)
          </h5>
          <span
            className="badge px-3 py-1"
            style={{
              backgroundColor: SOUTHAMPTON_GRADES[currentVisit.woundGrade]?.color || "#10b981",
              fontSize: "12px",
              borderRadius: "15px",
              fontWeight: "700",
            }}
          >
            Grade {currentVisit.woundGrade}
            {currentVisit.woundSubgrade ? ` (${currentVisit.woundSubgrade})` : ""}
          </span>
        </div>

        {/* Minimal Grade Selection Pills */}
        <div className="d-flex flex-wrap gap-2 mb-2">
          {Object.keys(SOUTHAMPTON_GRADES).map((gKey) => {
            const gObj = SOUTHAMPTON_GRADES[gKey];
            const isSelected = currentVisit.woundGrade === gKey;
            return (
              <button
                key={gKey}
                type="button"
                onClick={() =>
                  setCurrentVisit({
                    ...currentVisit,
                    woundGrade: gKey,
                    woundSubgrade: gObj.subgrades.length > 0 ? gObj.subgrades[0].id : "",
                  })
                }
                className="btn btn-sm d-flex align-items-center gap-1"
                style={{
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                  padding: "6px 14px",
                  border: isSelected ? `2px solid ${gObj.color}` : "1px solid #b2ebf2",
                  backgroundColor: isSelected ? gObj.color : "#ffffff",
                  color: isSelected ? "#ffffff" : "#006064",
                  transition: "all 0.15s ease",
                  cursor: "pointer",
                }}
              >
                {isSelected && <FeatherIcon icon="check-circle" size={13} />}
                <span>{gObj.name}</span>
              </button>
            );
          })}
        </div>

        {/* Grade Description & Subgrade Selection */}
        <div
          className="p-2 px-3 rounded mb-3"
          style={{ backgroundColor: "#f1fcfd", border: "1px solid #b2ebf2", fontSize: "12px" }}
        >
          <div style={{ color: "#006064" }}>
            <strong>Description:</strong> {SOUTHAMPTON_GRADES[currentVisit.woundGrade]?.description}
          </div>

          {SOUTHAMPTON_GRADES[currentVisit.woundGrade]?.subgrades?.length > 0 && (
            <div className="d-flex align-items-center gap-2 flex-wrap mt-2 pt-2" style={{ borderTop: "1px dashed #b2ebf2" }}>
              <span className="fw-bold" style={{ fontSize: "12px", color: "#006064" }}>
                Sub-grade:
              </span>
              {SOUTHAMPTON_GRADES[currentVisit.woundGrade].subgrades.map((sub) => {
                const isSubSelected = currentVisit.woundSubgrade === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setCurrentVisit({ ...currentVisit, woundSubgrade: sub.id })}
                    className="btn btn-sm"
                    style={{
                      borderRadius: "15px",
                      fontSize: "11px",
                      fontWeight: "600",
                      padding: "3px 10px",
                      backgroundColor: isSubSelected ? "#00838f" : "#ffffff",
                      color: isSubSelected ? "#ffffff" : "#006064",
                      border: isSubSelected ? "1px solid #00838f" : "1px solid #b2ebf2",
                    }}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Form.Label className="fw-bold mb-1" style={{ fontSize: "13px", color: "#006064" }}>
          Wound Observations
        </Form.Label>
        <Form.Control
          type="text"
          placeholder="e.g. Suture site clean, margins well apposed, minimal serous ooze..."
          value={currentVisit.woundNotes}
          onChange={(e) => setCurrentVisit({ ...currentVisit, woundNotes: e.target.value })}
          style={{
            borderRadius: "10px",
            border: "2px solid #b2ebf2",
            fontSize: "12px",
            padding: "6px 12px",
          }}
        />
      </div>

      {/* 5. Doctor's Advice & Management Plan */}
      <div
        className="p-3 bg-white rounded shadow-sm border mb-3"
        style={{ borderLeft: "5px solid #00838f" }}
      >
        <h5
          className="fw-bold mb-3"
          style={{
            color: "#00838f",
            textTransform: "uppercase",
            fontSize: "14px",
          }}
        >
          Advice & Management Plan
        </h5>

        {/* Medicines Plan */}
        <div className="mb-3">
          <Form.Label className="fw-bold mb-1" style={{ fontSize: "13px", color: "#006064" }}>
            Medication Plan
          </Form.Label>
          <div className="d-flex flex-wrap gap-3 align-items-center mb-2 px-1">
            {[
              "New medicine prescribed",
              "Existing medicine continued",
              "Medicine stopped",
              "Dose/frequency changed",
            ].map((status) => (
              <Form.Check
                key={status}
                type="checkbox"
                id={`med-${status.replace(/\s+/g, "-")}`}
                label={status}
                checked={currentVisit.medicinesStatus.includes(status)}
                onChange={() => handleMedStatusToggle(status)}
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#006064",
                }}
              />
            ))}
          </div>
          <Form.Control
            type="text"
            placeholder="Specific medication details or instructions..."
            value={currentVisit.medicinesNotes}
            onChange={(e) => setCurrentVisit({ ...currentVisit, medicinesNotes: e.target.value })}
            style={{
              borderRadius: "10px",
              border: "2px solid #b2ebf2",
              fontSize: "12px",
              padding: "6px 12px",
            }}
          />
        </div>

        {/* Investigations Section */}
        <div className="mb-3">
          <Form.Label className="fw-bold mb-1" style={{ fontSize: "13px", color: "#006064" }}>
            Investigations Advised
          </Form.Label>
          <div
            className="p-3 rounded mb-2"
            style={{ backgroundColor: "#f1fcfd", border: "2px solid #b2ebf2" }}
          >
            <Row className="g-2">
              {INVESTIGATION_OPTIONS.map((inv) => {
                const isOther = inv === "Other Investigation";
                const isChecked = currentVisit.investigations.includes(inv);
                return (
                  <Col
                    xs={isOther && isChecked ? 12 : 6}
                    sm={isOther && isChecked ? 8 : 4}
                    md={isOther && isChecked ? 6 : 3}
                    key={inv}
                  >
                    <div className="d-flex align-items-center gap-2 flex-wrap flex-sm-nowrap">
                      <Form.Check
                        type="checkbox"
                        id={`inv-${inv.replace(/\s+/g, "-")}`}
                        label={inv}
                        checked={isChecked}
                        onChange={() => handleInvestigationToggle(inv)}
                        className={isOther && isChecked ? "text-nowrap mb-0" : ""}
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#006064",
                        }}
                      />
                      {isOther && isChecked && (
                        <Form.Control
                          type="text"
                          placeholder="Mention other inestigation"
                          value={currentVisit.investigationSpecify}
                          onChange={(e) =>
                            setCurrentVisit({
                              ...currentVisit,
                              investigationSpecify: e.target.value,
                            })
                          }
                          style={{
                            borderRadius: "10px",
                            border: "2px solid #b2ebf2",
                            fontSize: "12px",
                            padding: "4px 10px",
                            height: "32px",
                            minWidth: "180px",
                            flex: 1,
                          }}
                        />
                      )}
                    </div>
                  </Col>
                );
              })}
            </Row>

            {/* Rule out underlying toggle */}
            <div
              className="d-flex flex-wrap align-items-center gap-3 mt-3 pt-2"
              style={{ borderTop: "1px dashed #b2ebf2" }}
            >
              <span className="fw-bold" style={{ fontSize: "12px", color: "#006064" }}>
                Rule out underlying cause?
              </span>
              <div className="d-flex gap-2">
                {["No", "Yes"].map((choice) => (
                  <Form.Check
                    inline
                    key={choice}
                    type="radio"
                    name="ruleOutUnderlying"
                    id={`rule-out-${choice}`}
                    label={choice}
                    checked={currentVisit.ruleOutUnderlying === choice}
                    onChange={() => setCurrentVisit({ ...currentVisit, ruleOutUnderlying: choice })}
                    style={{ fontSize: "13px", fontWeight: "600", color: "#006064" }}
                  />
                ))}
              </div>
              {currentVisit.ruleOutUnderlying === "Yes" && (
                <Form.Control
                  type="text"
                  placeholder="Reason (e.g. Rule out perianal collection or abscess)"
                  value={currentVisit.ruleOutDetails}
                  onChange={(e) => setCurrentVisit({ ...currentVisit, ruleOutDetails: e.target.value })}
                  className="flex-grow-1"
                  style={{
                    borderRadius: "10px",
                    border: "2px solid #fecaca",
                    fontSize: "12px",
                    padding: "4px 10px",
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* General Care Instructions */}
        <div className="mb-3">
          <Form.Label className="fw-bold mb-1" style={{ fontSize: "13px", color: "#006064" }}>
            General Advice & Instructions
          </Form.Label>
          <div
            className="p-3 rounded mb-2"
            style={{ backgroundColor: "#f1fcfd", border: "2px solid #b2ebf2" }}
          >
            <Row className="g-2">
              {ADVICE_OPTIONS.map((item) => (
                <Col xs={6} sm={4} md={3} key={item}>
                  <Form.Check
                    type="checkbox"
                    id={`advice-${item.replace(/\s+/g, "-")}`}
                    label={item}
                    checked={currentVisit.adviceList.includes(item)}
                    onChange={() => handleAdviceToggle(item)}
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#006064",
                    }}
                  />
                </Col>
              ))}
            </Row>
          </div>

          <Row className="g-3 align-items-center">
            <Col sm={4} md={3}>
              <div className="d-flex align-items-center gap-2">
                <Form.Label className="fw-bold mb-0 text-nowrap" style={{ fontSize: "13px", color: "#006064" }}>
                  Review After:
                </Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  max={60}
                  placeholder="Days"
                  value={currentVisit.reviewDays !== null && currentVisit.reviewDays !== undefined ? currentVisit.reviewDays : ""}
                  onChange={(e) => setCurrentVisit({ ...currentVisit, reviewDays: e.target.value === "" ? null : Number(e.target.value) })}
                  style={{
                    borderRadius: "10px",
                    border: "2px solid #b2ebf2",
                    fontSize: "12px",
                    padding: "6px 12px",
                    width: "70px",
                  }}
                />
                <span style={{ fontSize: "13px", color: "#006064", fontWeight: "600" }}>Days</span>
              </div>
            </Col>
            <Col sm={8} md={6}>
              <Form.Check
                type="checkbox"
                id="earlierReviewCheck"
                label="Earlier review advised if symptoms worsen"
                checked={currentVisit.earlierReviewIfWorse}
                onChange={(e) => setCurrentVisit({ ...currentVisit, earlierReviewIfWorse: e.target.checked })}
                style={{ fontSize: "13px", fontWeight: "600", color: "#006064" }}
              />
            </Col>
          </Row>
        </div>
      </div>

      {/* 6. Longitudinal Visit History */}
      <div
        className="p-3 bg-white rounded shadow-sm border mb-3"
        style={{ borderLeft: "5px solid #00bcd4" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5
            className="fw-bold mb-0"
            style={{
              color: "#00838f",
              textTransform: "uppercase",
              fontSize: "14px",
            }}
          >
            <FeatherIcon icon="clock" size="18" className="me-2 text-info" />
            Visit History
          </h5>
          {historyList.length > 0 && (
            <span className="text-muted" style={{ fontSize: "12px" }}>
              {historyList.length} recorded visit{historyList.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="table-responsive">
          <Table bordered hover size="sm" className="mb-0" style={{ fontSize: "12px" }}>
            <thead style={{ backgroundColor: "#f1fcfd" }}>
              <tr style={{ color: "#00838f" }}>
                <th style={{ width: "85px" }}>Visit</th>
                <th style={{ width: "95px" }}>Date</th>
                <th style={{ width: "75px" }}>Day</th>
                <th style={{ width: "120px" }}>Doctor</th>
                <th>Complaints</th>
                <th style={{ width: "80px" }} className="text-center">Pain</th>
                <th style={{ width: "110px" }} className="text-center">Wound</th>
                <th>Investigations</th>
                <th>Advice</th>
                <th style={{ width: "130px" }} className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {fetchingHistory ? (
                <tr>
                  <td colSpan={10} className="text-center py-4" style={{ fontSize: "13px", color: "#00838f" }}>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Loading post-op history...
                  </td>
                </tr>
              ) : historyList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center text-muted py-4" style={{ fontSize: "13px" }}>
                    <FeatherIcon icon="inbox" size="20" className="d-block mx-auto mb-2 text-muted" />
                    No prior post-op visits recorded yet.
                  </td>
                </tr>
              ) : (
                historyList.map((item, idx) => (
                  <tr key={item.postop_id || item.id || idx} className="align-middle">
                    <td className="fw-bold" style={{ color: "#00838f" }}>{item.visitNo}</td>
                    <td>{item.date}</td>
                    <td>{item.day}</td>
                    <td className="text-truncate" style={{ maxWidth: "120px" }} title={getDoctorName(item.consultantDoctor || item.consultant_doctor)}>
                      {getDoctorName(item.consultantDoctor || item.consultant_doctor)}
                    </td>
                    <td>{item.complaints?.join(", ") || "—"}</td>
                    <td className="text-center">
                      <span
                        className="badge"
                        style={{
                          backgroundColor: DVPRS_SCALE[item.painScore]?.color || "#10b981",
                          fontSize: "11px",
                        }}
                      >
                        {item.painScore !== null && item.painScore !== undefined ? `${item.painScore}/10` : "—"}
                      </span>
                    </td>
                    <td className="text-center">
                      <span
                        className="badge"
                        style={{
                          backgroundColor: SOUTHAMPTON_GRADES[item.woundGrade]?.color || "#10b981",
                          fontSize: "11px",
                        }}
                      >
                        Grade {item.woundGrade}{item.woundSubgrade ? ` (${item.woundSubgrade})` : ""}
                      </span>
                    </td>
                    <td>
                      {item.investigations?.map((inv) => inv === "Other Investigation" && item.investigationSpecify ? `Other (${item.investigationSpecify})` : inv).join(", ") || "—"}
                      {item.ruleOutUnderlying === "Yes" && (
                        <div className="text-danger small mt-1" style={{ fontSize: "10px" }}>
                          Rule out: {item.ruleOutDetails}
                        </div>
                      )}
                    </td>
                    <td>{item.adviceList?.slice(0, 2).join(", ") || "—"}</td>
                    <td className="text-center">
                      <div className="d-inline-flex gap-1">
                        <Button
                          variant="outline-info"
                          size="sm"
                          className="py-0 px-2"
                          style={{ fontSize: "11px", borderRadius: "10px" }}
                          title="View Details"
                          onClick={() => {
                            Swal.fire({
                              title: `${item.visitNo} (${item.date})`,
                              html: `
                                <div style="text-align: left; font-size: 13px; line-height: 1.6;">
                                  <p><strong>Consultant Doctor:</strong> ${getDoctorName(item.consultantDoctor || item.consultant_doctor)}</p>
                                  <p><strong>Post-Op Day:</strong> ${item.day}</p>
                                  <p><strong>Complaints:</strong> ${item.complaints?.join(", ") || "None"}</p>
                                  <p><strong>Pain Score:</strong> ${item.painScore !== null && item.painScore !== undefined ? `${item.painScore}/10 (${DVPRS_SCALE[item.painScore]?.label})` : "None"}</p>
                                  <p><strong>Wound Grade:</strong> Grade ${item.woundGrade} ${item.woundSubgrade ? `(${item.woundSubgrade})` : ""}</p>
                                  <p><strong>Wound Observations:</strong> ${item.woundNotes || "None"}</p>
                                  <p><strong>Investigations:</strong> ${item.investigations?.map((inv) => inv === "Other Investigation" && item.investigationSpecify ? `Other (${item.investigationSpecify})` : inv).join(", ") || "None"}</p>
                                  ${item.ruleOutUnderlying === "Yes" ? `<p style="color: #dc2626;"><strong>Rule out cause:</strong> ${item.ruleOutDetails}</p>` : ""}
                                  <p><strong>Advice:</strong> ${item.adviceList?.join(", ") || "Routine care"}</p>
                                  <p><strong>Review:</strong> ${item.reviewDays ? `After ${item.reviewDays} days` : "Not specified"}</p>
                                </div>
                              `,
                              confirmButtonText: "Close",
                              confirmButtonColor: "#00838f",
                            });
                          }}
                        >
                          <FeatherIcon icon="eye" size="11" />
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="py-5 px-2"
                          style={{ fontSize: "11px", borderRadius: "10px" }}
                          title="Edit Record"
                          onClick={() => handleLoadVisit(item)}
                        >
                          <FeatherIcon icon="edit-2" size="11" />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="py-0 px-2"
                          style={{ fontSize: "11px", borderRadius: "10px" }}
                          title="Delete Record"
                          onClick={() => handleDeleteVisit(item)}
                        >
                          <FeatherIcon icon="trash-2" size="11" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Save Button */}
      <div className="text-center mb-5 pb-5 mt-4 d-flex justify-content-center gap-3">
        {currentVisit.postop_id && (
          <Button
            variant="outline-secondary"
            onClick={handleNewVisit}
            disabled={isSaving || parentLoading}
            style={{
              padding: "10px 25px",
              borderRadius: "50px",
              fontWeight: "700",
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Cancel Edit
          </Button>
        )}
        <Button
          onClick={handleSaveVisit}
          disabled={isSaving || parentLoading}
          style={{
            backgroundColor: "#00838f",
            borderColor: "#00838f",
            padding: "10px 40px",
            borderRadius: "50px",
            fontWeight: "800",
            fontSize: "13px",
            boxShadow: "0 8px 25px rgba(0, 131, 143, 0.2)",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          {isSaving ? (
            <>
              <Spinner size="sm" className="me-2" />
              SAVING...
            </>
          ) : (
            <>
              <FeatherIcon icon="save" size="18" className="me-2" />
              {currentVisit.postop_id ? "UPDATE POST-OP EVALUATION" : "SAVE POST-OP EVALUATION"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PostOpCard;
