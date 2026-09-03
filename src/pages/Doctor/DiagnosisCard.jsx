import React from "react";
import {
  Row,
  Col,
  Card,
  Nav,
  Form,
  Button,
  Spinner,
  Dropdown,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import Select from "react-select";
import FeatherIcon from "feather-icons-react";
// import { generateDiagnosisStream } from "../Utility/aiDiagnosisHelper";
import { toast } from "react-hot-toast";
import { decodeJwt } from "../Utility/decode-jwt";

const localToday = (date = new Date()) => {
  // arrow fn, NOT invoked
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

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
  isEditing = false,
  onEditDiagnosis,
  doctors = [],
  assistanceDoctors = [],
  validationErrors = {},
  patientPhone = null,
  patient = null,
}) => {
  const [aiLoading, setAiLoading] = React.useState(false);
  const lastGeneratedRef = React.useRef({ diag: "", surg: "" });
  const userInteracted = React.useRef(false);
  const [masterPatientInfo, setMasterPatientInfo] = React.useState(null);

  const normalizeLoc = (loc) => {
    if (!loc) return "";
    return String(loc)
      .trim()
      .toLowerCase()
      .replace(/hospital|clinic|hhc|branch|location/gi, "")
      .replace(/[^a-z0-9]/g, "");
  };

  const effectivePhone = patientPhone || (patient && patient.phone) || (diagnosisData && (diagnosisData.phone || diagnosisData.patient_phone));

  React.useEffect(() => {
    const checkMaster = async () => {
      if (!effectivePhone) return;
      try {
        const cleanPhone = String(effectivePhone).replace(/\D/g, "");
        const last10 = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;
        if (!last10 || last10.length < 10) return;

        const BASE_URL = "http://194.195.117.79:5100/api";
        const res = await fetch(`${BASE_URL}/V1/appointment/checkMasterPatient?patient_phone=${last10}`);
        if (res.ok) {
          const data = await res.json();
          if (data.statusCode === 200 && data.data && data.data.masterPatient) {
            const mp = data.data.masterPatient;
            let currentLocation = "";
            const token = localStorage.getItem("token");
            if (token) {
              const payload = decodeJwt(token);
              if (payload?.jobLocation) currentLocation = payload.jobLocation;
            }
            if (!currentLocation) {
              currentLocation = localStorage.getItem("location") || "Kolhapur";
            }

            if (mp.location && normalizeLoc(mp.location) !== normalizeLoc(currentLocation)) {
              setMasterPatientInfo(data.data);
            } else {
              setMasterPatientInfo(null);
            }
          } else {
            setMasterPatientInfo(null);
          }
        }
      } catch (err) {
        console.error("Error checking master patient in DiagnosisCard:", err);
      }
    };
    checkMaster();
  }, [effectivePhone]);

  const handleViewMasterHistory = () => {
    if (!masterPatientInfo || !masterPatientInfo.masterPatient) return;
    const { masterPatient, history, diagnosis } = masterPatientInfo;
    const printData = {
      patient: masterPatient,
      history: history || [],
      diagnosis: diagnosis || [],
    };
    try {
      sessionStorage.setItem("masterPrintData", JSON.stringify(printData));
      window.open(`${window.location.origin}/hms/diagnosis-card-preview`, "_blank");
    } catch (e) {
      console.error("Error opening diagnosis card preview in new tab:", e);
    }
  };

  const onSpecialityClick = (speciality, value) => {
    userInteracted.current = true;
    handleSpecialityCheckboxChange(speciality, value);
  };
  const [insuranceCompanies, setInsuranceCompanies] = React.useState([]);
  const [tpaCompanies, setTpaCompanies] = React.useState([]);

  // A saved record is being viewed when an id is selected. It stays LOCKED
  // until the doctor clicks EDIT (isEditing, owned by parent). A brand-new
  // entry (no id selected) is always editable.
  const isViewingSaved = !!selectedDiagnosisId;
  const isReadOnly = isViewingSaved && !isEditing;

  const isSurgeryOrMedsSx =
    Array.isArray(diagnosisData?.advice_types) &&
    (diagnosisData.advice_types.includes("Surgery") ||
      diagnosisData.advice_types.includes("Meds -> Sx"));

  const isInsuranceCompanyRequired =
    Array.isArray(diagnosisData?.categories) &&
    (diagnosisData.categories.includes("Cashless") ||
      diagnosisData.categories.includes("Reimbursement"));

  const isReferredToAnotherDoctor =
    Array.isArray(diagnosisData?.advice_types) &&
    diagnosisData.advice_types.includes("Referred to another doctor");

  // Layout-transparent lock wrapper (same approach as PatientHistoryCard):
  // `display: contents` removes the fieldset's own box from layout, so flex
  // and grid render exactly as before, while the disabled attribute still
  // cascades to every nested form control. The specialty Nav stays clickable
  // because Nav.Link renders an <a>, which a disabled fieldset does not affect.
  const lockStyle = { display: "contents" };

  React.useEffect(() => {
    const fetchInsuranceAndTpa = async () => {
      try {
        const BASE_URL = "http://194.195.117.79:5100/api";
        const [insRes, tpaRes] = await Promise.all([
          fetch(`${BASE_URL}/V1/doctor/insurance-companies`),
          fetch(`${BASE_URL}/V1/doctor/tpa-companies`),
        ]);

        const [insData, tpaData] = await Promise.all([
          insRes.json(),
          tpaRes.json(),
        ]);

        if (insRes.ok && insData.statusCode === 200) {
          setInsuranceCompanies(insData.data || []);
        }
        if (tpaRes.ok && tpaData.statusCode === 200) {
          setTpaCompanies(tpaData.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch insurance or TPA companies", err);
      }
    };
    fetchInsuranceAndTpa();
  }, []);

  const handleManualGenerateDiagnosis = () => {
    const diagParts = [];
    const surgParts = [];
    const specialityData = diagnosisData.speciality_data || {};

    // Get active specialty label
    const specialtyLabels = {
      piles: "piles",
      fistula: "fistula",
      hernia: "hernia",
      varicosevein: "varicose veins",
      prolapse: "prolapse",
      circumcision: "circumcision",
      abscess: "abscess",
      fissure: "fissure",
      urology: "urology",
      cyst: "cyst",
      hydrocele: "hydrocele",
      lipoma: "lipoma",
      gynecomastia: "gynecomastia",
      pilonidalsinus: "pilonidal sinus",
      other: "other",
    };

    const pilesMapping = {
      "Grade 1": { diag: "Grade 1 Haemorrhoids", surg: "" },
      "Grade 2": { diag: "Grade 2 Haemorrhoids", surg: "" },
      "Grade 3": {
        diag: "Grade 3 Haemorrhoids",
        surg: "Laser Haemorrhoidoplasty",
      },
      "Grade 4": {
        diag: "Grade 4 Haemorrhoids",
        surg: "Laser Haemorrhoidoplasty",
      },
      "Sphincter Repair": { diag: "Severe Anal Spasm", surg: "Sphincterotomy" },
      "Skin Tag": { diag: "Skin Tag", surg: "Excision of Skin Tag" },
      "Thrombosis External": {
        diag: "External Thrombosed Haemorrhoids",
        surg: "Excision of Thrombosed External Haemorrhoids",
      },
      "Anal Polyp": { diag: "Anal Polyp", surg: "Polypectomy" },
      "Anal Wart": { diag: "Anal Wart", surg: "Excision of Anal Wart" },
    };

    const fistulaMapping = {
      "Fistula in Ano": "Fistula in Ano",
      Complex: "Complex Fistula in Ano",
      Intersphincteric: "Intersphincteric Fistula in Ano",
      Transphincteric: "Transphincteric Fistula in Ano",
      Recurrent: "Recurrent Fistula in Ano",
      Gluteal: "Gluteal Fistula in Ano",
      Vaginal: "Vaginal Fistula in Ano",
      Scrotal: "Scrotal Fistula in Ano",
      Supralevator: "Supralevator Fistula in Ano",
      Vulval: "Vulval Fistula in Ano",
      Horseshoe: "Horseshoe Fistula in Ano",
      Nidal: "Nidal Fistula in Ano",
    };

    const herniaMapping = {
      "Right Inguinal": "Right Inguinal Hernia",
      "Left Inguinal": "Left Inguinal Hernia",
      "B/L Inguinal": "Bilateral Inguinal Hernia",
      Incisional: "Incisional Hernia",
      Umbilical: "Umbilical Hernia",
      Paraumbilical: "Paraumbilical Hernia",
      Femoral: "Femoral Hernia",
    };

    const varicoseMapping = {
      "Right Leg": { diag: "Right Leg Varicose Veins", surg: "Right Leg EVLA" },
      "Left Leg": { diag: "Left Leg Varicose Veins", surg: "Left Leg EVLA" },
      Bilateral: { diag: "B/L Varicose Veins", surg: "B/L EVLA" },
    };

    const prolapseMapping = {
      Rectal: { diag: "Rectal Prolapse", surg: "Thiersch Repair" },
      "Internal Mucosal": {
        diag: "Internal Mucosal Prolapse",
        surg: "Rectal Mucopexy + Sphincterotomy",
      },
      Incomplete: {
        diag: "Incomplete Mucosal Prolapse",
        surg: "Rectal Mucopexy + Sphincterotomy",
      },
      Procidentia: {
        diag: "Procidentia Mucosal Prolapse",
        surg: "Rectal Mucopexy + Sphincterotomy",
      },
    };

    const circumcisionMapping = {
      Phimosis: { diag: "Phimosis", surg: "Circumcision" },
      Balanoposthitis: { diag: "Balanoposthitis", surg: "Circumcision" },
      "Frenulum Breve": { diag: "Frenulum Breve", surg: "Frenuloplasty" },
    };

    const abscessMapping = {
      Perianal: {
        diag: "Perianal Abscess",
        surg: "Incision & Drainage of Abscess",
      },
      Ischiorectal: {
        diag: "Ischiorectal Abscess",
        surg: "Incision & Drainage of Abscess",
      },
      "Recurrent Perianal": {
        diag: "Recurrent Perianal Abscess",
        surg: "Incision & Drainage of Abscess",
      },
      "Infected Sebaceous Cyst": {
        diag: "Infected Sebaceous Cyst",
        surg: "Incision & Drainage of Cyst",
      },
    };

    const fissureMapping = {
      Acute: { diag: "Acute Fissure in Ano", surg: "" },
      Chronic: { diag: "Chronic Fissure in Ano", surg: "Fissurectomy" },
      Infected: { diag: "Infected Fissure in Ano", surg: "Fissurectomy" },
      Multiple: { diag: "Multiple Fissures in Ano", surg: "Fissurectomy" },
      "Anal Papillae": {
        diag: "Anal Papillae",
        surg: "Excision of Anal Papillae",
      },
    };

    const urologyMapping = {
      Hydrocele: { diag: "Hydrocele", surg: "" },
      "Kidney Stone": { diag: "Kidney Stone", surg: "" },
      Prostate: { diag: "Prostate", surg: "" },
      "Urethra Stricture": { diag: "Urethra Stricture", surg: "" },
    };

    const pilonidalMapping = {
      "Pilonidal Sinus": {
        diag: "Pilonidal Sinus",
        surg: "Laser Pilonidoplasty",
      },
      "Pilonidal Abscess": {
        diag: "Pilonidal Abscess",
        surg: "I&D of Pilonidal Abscess",
      },
      Recurrent: {
        diag: "Recurrent Pilonidal Sinus",
        surg: "Laser Pilonidoplasty",
      },
    };

    // Helper to extract keyword from complex findings
    const extractKeyword = (str) => {
      if (!str) return "";
      let s = str.toLowerCase();

      if (s.includes("with")) {
        s = s.split("with")[1];
      } else if (s.includes("haemorrhoid") || s.includes("hemorrhoid")) {
        s = s.replace(/grade \d+ ha?emorrhoids?/g, "");
      }

      s = s.replace(/p\/r bleeding/g, "");
      s = s.replace(/position/g, "");
      s = s.replace(/\( all around\)/g, "");
      s = s.replace(/detailed findings/g, "");
      return s.trim();
    };

    const specialtyOrder = [
      "piles",
      "fistula",
      "fissure",
      "abscess",
      "hernia",
      "varicosevein",
      "prolapse",
      "circumcision",
      "urology",
      "cyst",
      "hydrocele",
      "lipoma",
      "gynecomastia",
      "pilonidalsinus",
      "other",
    ];

    // 1. (Removed: specialty labels are now added directly in step 2 so they group correctly with their symptoms)

    // 2. Add sub-findings / grades
    specialtyOrder.forEach((key) => {
      const value = specialityData[key];
      if (
        !value ||
        key === "skin_tag_position" ||
        key === "haemorrhoids_position"
      )
        return;

      if (Array.isArray(value)) {
        // Special consolidated handling for Piles grades
        if (key === "piles") {
          const selectedGrades = value.filter((p) => p.startsWith("Grade "));
          const otherPiles = value.filter((p) => !p.startsWith("Grade "));

          if (selectedGrades.length > 0) {
            const numbers = selectedGrades
              .map((g) => g.replace("Grade ", ""))
              .sort((a, b) => parseInt(a) - parseInt(b));

            if (specialityData.haemorrhoids_position) {
              diagParts.push(
                `Grade ${numbers.join("/")} Haemorrhoids at ${specialityData.haemorrhoids_position} o'clock`,
              );
            } else {
              diagParts.push(`Grade ${numbers.join("/")} Haemorrhoids`);
            }

            // Add surgical advice if Grade 3 or 4 is selected
            if (numbers.some((n) => n === "3" || n === "4")) {
              surgParts.push("Laser Haemorrhoidoplasty");
            }
          }

          // Process other piles findings
          otherPiles.forEach((p) => {
            if (pilesMapping[p]) {
              let diag = pilesMapping[p].diag;
              if (p === "Skin Tag" && specialityData.skin_tag_position) {
                diag = `Skin Tag at ${specialityData.skin_tag_position} o'clock`;
              }
              diagParts.push(diag);
              if (pilesMapping[p].surg) surgParts.push(pilesMapping[p].surg);
            }
          });
          return;
        }

        if (key === "fistula") {
          value.forEach((item) => {
            if (fistulaMapping[item]) {
              diagParts.push(fistulaMapping[item]);
              surgParts.push("FILAC");
            } else {
              diagParts.push(item.toLowerCase());
            }
          });
          return;
        }

        if (key === "hernia") {
          value.forEach((item) => {
            if (herniaMapping[item]) {
              diagParts.push(herniaMapping[item]);
              surgParts.push("3D Mesh Hernia Repair");
            } else {
              diagParts.push(item.toLowerCase());
            }
          });
          return;
        }

        if (key === "varicosevein") {
          value.forEach((item) => {
            if (varicoseMapping[item]) {
              diagParts.push(varicoseMapping[item].diag);
              surgParts.push(varicoseMapping[item].surg);
            } else {
              diagParts.push(item.toLowerCase());
            }
          });
          return;
        }

        if (key === "prolapse") {
          value.forEach((item) => {
            if (prolapseMapping[item]) {
              diagParts.push(prolapseMapping[item].diag);
              surgParts.push(prolapseMapping[item].surg);
            } else {
              diagParts.push(item.toLowerCase());
            }
          });
          return;
        }

        if (key === "circumcision") {
          value.forEach((item) => {
            if (circumcisionMapping[item]) {
              diagParts.push(circumcisionMapping[item].diag);
              surgParts.push(circumcisionMapping[item].surg);
            } else {
              diagParts.push(item.toLowerCase());
            }
          });
          return;
        }

        if (key === "abscess") {
          value.forEach((item) => {
            if (abscessMapping[item]) {
              diagParts.push(abscessMapping[item].diag);
              surgParts.push(abscessMapping[item].surg);
            } else {
              diagParts.push(item.toLowerCase());
            }
          });
          return;
        }

        if (key === "fissure") {
          value.forEach((item) => {
            if (fissureMapping[item]) {
              diagParts.push(fissureMapping[item].diag);
              surgParts.push(fissureMapping[item].surg);
            } else {
              diagParts.push(item.toLowerCase());
            }
          });
          return;
        }

        if (key === "urology") {
          value.forEach((item) => {
            if (urologyMapping[item]) {
              diagParts.push(urologyMapping[item].diag);
              surgParts.push(urologyMapping[item].surg);
            } else {
              diagParts.push(item.toLowerCase());
            }
          });
          return;
        }

        if (key === "pilonidalsinus") {
          value.forEach((item) => {
            if (pilonidalMapping[item]) {
              diagParts.push(pilonidalMapping[item].diag);
              surgParts.push(pilonidalMapping[item].surg);
            } else {
              diagParts.push(item.toLowerCase());
            }
          });
          return;
        }

        if (key === "other") {
          value.forEach((item) => {
            const otherSpecMapping = {
              "Anal Wart": { diag: "Anal Wart", surg: "Excision of Anal Wart" },
              Cholelithiasis: {
                diag: "Cholelithiasis",
                surg: "Laparoscopic Cholecystectomy",
              },
              "Pyogenic Granuloma": {
                diag: "Pyogenic Granuloma",
                surg: "Excision of Pyogenic Granuloma",
              },
            };

            if (otherSpecMapping[item]) {
              diagParts.push(otherSpecMapping[item].diag);
              surgParts.push(otherSpecMapping[item].surg);
            } else if (item === "Other") {
              if (
                specialityData.other_text &&
                specialityData.other_text.trim() !== ""
              ) {
                diagParts.push(specialityData.other_text.trim());
              }
            } else {
              diagParts.push(item); // e.g. "IBS"
            }
          });
          return;
        }

        if (key === "gynecomastia") {
          const selectedGrades = value.filter((g) =>
            g.toUpperCase().startsWith("GRADE "),
          );
          if (selectedGrades.length > 0) {
            const numbers = selectedGrades
              .map((g) => g.toUpperCase().replace("GRADE ", "").trim())
              .sort((a, b) => parseInt(a) - parseInt(b));
            diagParts.push(`Grade ${numbers.join("/")} Gynecomastia`);
          }
          return;
        }

        if (key === "cyst" || key === "hydrocele" || key === "lipoma") {
          if (value.length > 0) {
            diagParts.push(specialtyLabels[key]);
          }
        }

        value.forEach((item) => {
          let keyword = item.toLowerCase();
          if (keyword.includes("grade")) {
            diagParts.push(keyword);
          } else {
            const cleaned = extractKeyword(item);
            if (cleaned && !diagParts.includes(cleaned)) {
              diagParts.push(cleaned);
            }
          }
        });
      } else if (typeof value === "string" && value.trim() !== "") {
        if (key === "other_text") {
          diagParts.push(value.trim());
        } else if (key !== "other_text") {
          // Handle other string findings if any
          if (key === "cyst" || key === "hydrocele" || key === "lipoma") {
            diagParts.push(specialtyLabels[key]);
          }
          diagParts.push(value.trim().toLowerCase());
        }
      }
    });

    // Handle other_text separately at the end if it exists (for 'Other' tab custom text)
    if (specialityData.other_text && specialityData.other_text.trim() !== "") {
      // Logic for other_text is already handled inside the 'other' array loop if "Other" is checked,
      // but if the user relies on old logic where it was standalone, we keep it here.
      // Actually, since I updated the 'Other' logic to use other_text when 'Other' is checked,
      // we don't need to double-add it.
    }

    // Filter out duplicates and empty strings
    const uniqueDiag = [...new Set(diagParts)].filter((p) => p.length > 0);
    const finalDiagnosis = uniqueDiag.join(" + ");

    const uniqueSurg = [...new Set(surgParts)].filter((p) => p.length > 0);
    const finalSurgical = uniqueSurg.join(" + ");

    if (!userInteracted.current) {
      lastGeneratedRef.current.diag = finalDiagnosis;
      lastGeneratedRef.current.surg = finalSurgical;
      return;
    }

    let currentDiag = diagnosisData.diagnosis_text || "";
    if (lastGeneratedRef.current.diag) {
      currentDiag = currentDiag
        .replace(lastGeneratedRef.current.diag, "")
        .trim();
      currentDiag = currentDiag.replace(/^[+\s]+|[+\s]+$/g, "");
    }

    let newCombinedDiag = finalDiagnosis;
    if (currentDiag) {
      newCombinedDiag = newCombinedDiag
        ? `${newCombinedDiag} + ${currentDiag}`
        : currentDiag;
    }

    let currentSurg = diagnosisData.surgical_advice || "";
    if (lastGeneratedRef.current.surg) {
      currentSurg = currentSurg
        .replace(lastGeneratedRef.current.surg, "")
        .trim();
      currentSurg = currentSurg.replace(/^[+\s]+|[+\s]+$/g, "");
    }

    let newCombinedSurg = finalSurgical;
    if (currentSurg) {
      newCombinedSurg = newCombinedSurg
        ? `${newCombinedSurg} + ${currentSurg}`
        : currentSurg;
    }

    lastGeneratedRef.current.diag = finalDiagnosis;
    lastGeneratedRef.current.surg = finalSurgical;

    if (diagnosisData.diagnosis_text !== newCombinedDiag) {
      handleDiagnosisChange("diagnosis_text", newCombinedDiag);
    }
    if (diagnosisData.surgical_advice !== newCombinedSurg) {
      handleDiagnosisChange("surgical_advice", newCombinedSurg);
    }

    // Reset interaction flag after processing
    userInteracted.current = false;
  };

  // Auto-generate diagnosis when findings change
  React.useEffect(() => {
    handleManualGenerateDiagnosis();
  }, [diagnosisData.speciality_data, diagnosisData.active_speciality]);

  const handleGlobalFindingSelect = (selected) => {
    if (!selected) return;

    const { specialty, value } = selected;

    userInteracted.current = true;
    // Switch to the correct specialty tab
    handleDiagnosisChange("active_speciality", specialty);

    // Toggle the checkbox for this finding
    handleSpecialityCheckboxChange(specialty, value);

    toast.success(`Added finding: ${selected.label}`);
  };

  const handleClearAllFindings = () => {
    userInteracted.current = true;
    setDiagnosisData((prev) => ({
      ...prev,
      speciality_data: {
        piles: [],
        fistula: [],
        hernia: [],
        varicosevein: [],
        prolapse: [],
        circumcision: [],
        abscess: [],
        fissure: [],
        urology: [],
        cyst: [],
        hydrocele: [],
        lipoma: [],
        gynecomastia: [],
        pilonidalsinus: [],
        other: [],
        other_text: "",
        skin_tag_position: "",
        haemorrhoids_position: "",
      },
    }));
    toast("All findings cleared", { icon: "ℹ️" });
  };

  return (
    <div className="animate__animated animate__fadeIn">
      <style>{`
        .form-check-input { border: 1px solid black !important; }
        .form-check-input:checked { background-color: #00838f; border-color: black !important; }
      `}</style>
      {/* 1. Primary Diagnosis Section */}
      <div
        className="p-3 bg-white rounded shadow-sm border mb-3"
        style={{ borderLeft: "5px solid #00bcd4" }}
      >
        {/* Toolbar stays OUTSIDE the lock so NEW RECORD / PRINT / PREVIOUS DATES keep working. */}
        <div className="d-flex justify-content-between align-items-center">
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
            Primary Diagnosis & Orders
          </h5>
          <div className="d-flex gap-2">
            {isViewingSaved && !isEditing && (
              <Button
                variant="outline-warning"
                size="sm"
                onClick={onEditDiagnosis}
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
              onClick={onNewDiagnosis}
              style={{
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "700",
                padding: "7px 10px",
              }}
            >
              <FeatherIcon icon="plus" size="13" className="me-1" /> NEW RECORD
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onPrintDiagnosis}
              style={{
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "700",
                padding: "7px 10px",
              }}
            >
              <FeatherIcon icon="printer" size={13} className="me-1" /> PRINT
            </Button>
            <Dropdown onSelect={onSelectDiagnosis}>
              <Dropdown.Toggle
                variant="outline-info"
                id="previous-diagnosis-dropdown"
                size="sm"
                style={{
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
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
                {previousDiagnosisList.length > 0 ? (
                  previousDiagnosisList.map((diag) => (
                    <Dropdown.Item key={diag.id} eventKey={diag.id}>
                      {diag.date}{" "}
                      {diag.id === selectedDiagnosisId && (
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
        {masterPatientInfo && masterPatientInfo.masterPatient && (
          <div
            style={{
              backgroundColor: "#fff3cd",
              borderLeft: "4px solid #ff9800",
              borderRadius: "6px",
              padding: "5px 10px",
              marginTop: "12px",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="22" height="22" fill="#d97706" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
              </svg>
              <h6 style={{ margin: 0, color: "#856404", fontSize: "14px", fontWeight: "600" }}>
                This patient has already visited <strong>HHC {masterPatientInfo.masterPatient.location}</strong> location
              </h6>
            </div>
            <Button
              type="button"
              onClick={handleViewMasterHistory}
              style={{
                backgroundColor: "#ffc107",
                color: "#ffffffff",
                border: "none",
                padding: "6px 16px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
              }}
            >
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
              </svg>
              View Patient History & Diagnosis
            </Button>
          </div>
        )}
        <fieldset disabled={isReadOnly} style={lockStyle}>
          <Row>
            <Col md={2} className="mb-17">
              <Form.Label
                className="fw-bold"
                style={{ fontSize: "13px", color: "#006064" }}
              >
                Diagnosis Date
              </Form.Label>
              <Form.Control
                type="date"
                max={localToday()}
                disabled={isEditing}
                value={diagnosisData.date_diagnosis}
                onChange={(e) =>
                  handleDiagnosisChange("date_diagnosis", e.target.value)
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
            <Col md={10}>
              {/* 3. Speciality Specific Details moved here */}
              <div className="mb-1">
                <Form.Label
                  className="fw-bold mb-0"
                  style={{ fontSize: "13px", color: "#006064" }}
                >
                  Select Specialty Type & Findings <span className="text-danger">*</span>
                </Form.Label>
              </div>
              <Card
                className="shadow-sm border-0 overflow-hidden"
                style={{ borderRadius: "15px", border: validationErrors.speciality_data ? "2px solid red" : "2px solid #a7d4d2ff" }}
              >
                {/* Specialty Nav stays clickable even while locked (Nav.Link is an <a>),
                    so a saved record can still be browsed across specialties. */}
                <Card.Header className="p-0 border-0">
                  <Nav
                    className="flex-nowrap overflow-auto custom-subnav px-1 py-1"
                    style={{ backgroundColor: "#e0f2f1", gap: "4px" }}
                  >
                    {[
                      { id: "piles", label: "Piles" },
                      { id: "fistula", label: "Fistula" },
                      { id: "fissure", label: "Fissure" },
                      { id: "abscess", label: "Abscess" },
                      { id: "hernia", label: "Hernia" },
                      { id: "varicosevein", label: "Varicose Veins" },
                      { id: "prolapse", label: "Prolapse" },
                      { id: "circumcision", label: "Circumcision" },
                      { id: "urology", label: "Urology" },
                      { id: "cyst", label: "Cyst" },
                      { id: "hydrocele", label: "Hydrocele" },
                      { id: "lipoma", label: "Lipoma" },
                      { id: "gynecomastia", label: "Gynecomastia" },
                      { id: "pilonidalsinus", label: "Pilonidal Sinus" },
                      { id: "other", label: "Other" },
                    ].map((sub) => {
                      const isFilled = (() => {
                        const data = diagnosisData?.speciality_data?.[sub.id];
                        if (sub.id === "other") {
                          const otherArr = Array.isArray(data) ? data : [];
                          const hasOtherText =
                            diagnosisData?.speciality_data?.other_text?.trim()
                              ?.length > 0;
                          return otherArr.length > 0 || hasOtherText;
                        }
                        return Array.isArray(data)
                          ? data.length > 0
                          : typeof data === "string" && data.trim().length > 0;
                      })();

                      return (
                        <Nav.Item key={sub.id}>
                          <Nav.Link
                            active={diagnosisData.active_speciality === sub.id}
                            onClick={() =>
                              handleDiagnosisChange("active_speciality", sub.id)
                            }
                            className="text-center d-flex align-items-center justify-content-center"
                            style={{
                              whiteSpace: "nowrap",
                              borderRadius: "30px",
                              padding: "8px 30.5px",
                              margin: "4px 2px",
                              fontWeight: "700",
                              fontSize: "11px",
                              transition: "all 0.3s ease-in-out",
                              backgroundColor:
                                diagnosisData.active_speciality === sub.id ||
                                  isFilled
                                  ? "#00838f"
                                  : "#ffffff",
                              color:
                                diagnosisData.active_speciality === sub.id ||
                                  isFilled
                                  ? "#ffffff"
                                  : "#006064",
                              border:
                                diagnosisData.active_speciality === sub.id ||
                                  isFilled
                                  ? "1px solid #00838f"
                                  : "1px solid #e0f2f1",
                              boxShadow:
                                diagnosisData.active_speciality === sub.id ||
                                  isFilled
                                  ? "0 4px 10px rgba(0, 131, 143, 0.4)"
                                  : "0 2px 4px rgba(0,0,0,0.05)",
                              cursor: "pointer",
                            }}
                          >
                            {(diagnosisData.active_speciality === sub.id ||
                              isFilled) && (
                                <FeatherIcon
                                  icon="check-circle"
                                  size="14"
                                  className="me-1"
                                />
                              )}
                            {sub.label}
                          </Nav.Link>
                        </Nav.Item>
                      );
                    })}
                  </Nav>
                </Card.Header>
                <Card.Body
                  className="bg-white p-2"
                  style={{ minHeight: "35px" }}
                >
                  <div className="animate__animated animate__fadeIn">
                    {diagnosisData.active_speciality === "piles" && (
                      <div className="animate__animated animate__fadeIn">
                        <div
                          className="d-flex flex-wrap gap-3 mb-2 p-3 rounded shadow-inner"
                          style={{ backgroundColor: "#f1fcfd" }}
                        >
                          {[
                            "Grade 1",
                            "Grade 2",
                            "Grade 3",
                            "Grade 4",
                            "Sphincter Repair",
                            "Skin Tag",
                            "Thrombosis External",
                            "Anal Polyp",
                          ].map((g) => (
                            <Form.Check
                              key={g}
                              label={g}
                              checked={diagnosisData.speciality_data.piles.includes(
                                g,
                              )}
                              onChange={() => onSpecialityClick("piles", g)}
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#006064",
                              }}
                            />
                          ))}
                        </div>

                        {diagnosisData.speciality_data.piles.some((g) =>
                          g.startsWith("Grade "),
                        ) && (
                            <div className="d-flex align-items-center gap-2 mt-2 ms-2 animate__animated animate__fadeIn">
                              <Form.Label
                                className="mb-0 fw-bold"
                                style={{ fontSize: "11px", color: "#006064" }}
                              >
                                Haemorrhoids Position:
                              </Form.Label>
                              <Form.Control
                                type="text"
                                size="sm"
                                placeholder="e.g. 3,7,11"
                                value={
                                  diagnosisData.speciality_data
                                    .haemorrhoids_position || ""
                                }
                                onChange={(e) => {
                                  userInteracted.current = true;
                                  setDiagnosisData((prev) => ({
                                    ...prev,
                                    speciality_data: {
                                      ...prev.speciality_data,
                                      haemorrhoids_position: e.target.value,
                                    },
                                  }));
                                }}
                                style={{
                                  width: "80px",
                                  height: "25px",
                                  borderRadius: "5px",
                                  border: "2px solid #b2ebf2",
                                  fontSize: "11px",
                                }}
                              />
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  color: "#006064",
                                }}
                              >
                                o'clock
                              </span>
                            </div>
                          )}

                        {diagnosisData.speciality_data.piles.includes(
                          "Skin Tag",
                        ) && (
                            <div className="d-flex align-items-center gap-2 mt-2 ms-2 animate__animated animate__fadeIn">
                              <Form.Label
                                className="mb-0 fw-bold"
                                style={{ fontSize: "11px", color: "#006064" }}
                              >
                                Skin Tag Position:
                              </Form.Label>
                              <Form.Control
                                type="text"
                                size="sm"
                                placeholder="e.g. 6"
                                value={
                                  diagnosisData.speciality_data
                                    .skin_tag_position || ""
                                }
                                onChange={(e) => {
                                  userInteracted.current = true;
                                  setDiagnosisData((prev) => ({
                                    ...prev,
                                    speciality_data: {
                                      ...prev.speciality_data,
                                      skin_tag_position: e.target.value,
                                    },
                                  }));
                                }}
                                style={{
                                  width: "60px",
                                  height: "25px",
                                  borderRadius: "5px",
                                  border: "2px solid #b2ebf2",
                                  fontSize: "11px",
                                }}
                              />
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  color: "#006064",
                                }}
                              >
                                o'clock
                              </span>
                            </div>
                          )}
                      </div>
                    )}
                    {diagnosisData.active_speciality === "fistula" && (
                      <div className="animate__animated animate__fadeIn">
                        <div
                          className="d-flex flex-wrap gap-3 mb-2 p-3 rounded shadow-inner"
                          style={{ backgroundColor: "#f1fcfd" }}
                        >
                          {[
                            "Fistula in Ano",
                            "Complex",
                            "Intersphincteric",
                            "Transphincteric",
                            "Recurrent",
                            "Gluteal",
                            "Vaginal",
                            "Scrotal",
                            "Supralevator",
                            "Vulval",
                            "Horseshoe",
                            "Nidal",
                          ].map((f) => (
                            <Form.Check
                              key={f}
                              label={f}
                              checked={diagnosisData.speciality_data.fistula.includes(
                                f,
                              )}
                              onChange={() => onSpecialityClick("fistula", f)}
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#006064",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {diagnosisData.active_speciality === "hernia" && (
                      <div className="animate__animated animate__fadeIn">
                        <div
                          className="d-flex flex-wrap gap-3 mb-2 p-3 rounded shadow-inner"
                          style={{ backgroundColor: "#f1fcfd" }}
                        >
                          {[
                            "Right Inguinal",
                            "Left Inguinal",
                            "B/L Inguinal",
                            "Incisional",
                            "Umbilical",
                            "Paraumbilical",
                            "Femoral",
                          ].map((h) => (
                            <Form.Check
                              key={h}
                              label={h}
                              checked={diagnosisData.speciality_data.hernia.includes(
                                h,
                              )}
                              onChange={() => onSpecialityClick("hernia", h)}
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#006064",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {diagnosisData.active_speciality === "varicosevein" && (
                      <div className="animate__animated animate__fadeIn">
                        <div
                          className="d-flex flex-wrap gap-3 mb-2 p-3 rounded shadow-inner"
                          style={{ backgroundColor: "#f1fcfd" }}
                        >
                          {["Right Leg", "Left Leg", "Bilateral"].map((v) => (
                            <Form.Check
                              key={v}
                              label={v}
                              checked={
                                diagnosisData.speciality_data.varicosevein &&
                                diagnosisData.speciality_data.varicosevein.includes(
                                  v,
                                )
                              }
                              onChange={() =>
                                onSpecialityClick("varicosevein", v)
                              }
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#006064",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {diagnosisData.active_speciality === "prolapse" && (
                      <div className="animate__animated animate__fadeIn">
                        <div
                          className="d-flex flex-wrap gap-3 mb-2 p-3 rounded shadow-inner"
                          style={{ backgroundColor: "#f1fcfd" }}
                        >
                          {[
                            "Rectal",
                            "Internal Mucosal",
                            "Incomplete",
                            "Procidentia",
                          ].map((p) => (
                            <Form.Check
                              key={p}
                              label={p}
                              checked={diagnosisData.speciality_data.prolapse.includes(
                                p,
                              )}
                              onChange={() => onSpecialityClick("prolapse", p)}
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#006064",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {diagnosisData.active_speciality === "cyst" && (
                      <div className="animate__animated animate__fadeIn">
                        <div
                          className="d-flex flex-wrap gap-3 mb-2 p-3 rounded shadow-inner"
                          style={{ backgroundColor: "#f1fcfd" }}
                        >
                          {["SEBACEOUS", "DERMOID CYST"].map((c) => (
                            <Form.Check
                              key={c}
                              label={c}
                              checked={
                                diagnosisData.speciality_data.cyst?.includes(
                                  c,
                                ) || false
                              }
                              onChange={() => onSpecialityClick("cyst", c)}
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#006064",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {diagnosisData.active_speciality === "hydrocele" && (
                      <div className="animate__animated animate__fadeIn">
                        <div
                          className="d-flex flex-wrap gap-3 mb-2 p-3 rounded shadow-inner"
                          style={{ backgroundColor: "#f1fcfd" }}
                        >
                          {["RIGHT", "LEFT", "BILATERAL"].map((h) => (
                            <Form.Check
                              key={h}
                              label={h}
                              checked={
                                diagnosisData.speciality_data.hydrocele?.includes(
                                  h,
                                ) || false
                              }
                              onChange={() => onSpecialityClick("hydrocele", h)}
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#006064",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {diagnosisData.active_speciality === "lipoma" && (
                      <div className="animate__animated animate__fadeIn">
                        <div
                          className="d-flex flex-wrap gap-3 mb-2 p-3 rounded shadow-inner"
                          style={{ backgroundColor: "#f1fcfd" }}
                        >
                          {["SINGLE", "MULTIPLE"].map((l) => (
                            <Form.Check
                              key={l}
                              label={l}
                              checked={
                                diagnosisData.speciality_data.lipoma?.includes(
                                  l,
                                ) || false
                              }
                              onChange={() => onSpecialityClick("lipoma", l)}
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#006064",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {diagnosisData.active_speciality === "gynecomastia" && (
                      <div className="animate__animated animate__fadeIn">
                        <div
                          className="d-flex flex-wrap gap-3 mb-2 p-3 rounded shadow-inner"
                          style={{ backgroundColor: "#f1fcfd" }}
                        >
                          {["GRADE 1", "GRADE 2", "GRADE 3"].map((g) => (
                            <Form.Check
                              key={g}
                              label={g}
                              checked={
                                diagnosisData.speciality_data.gynecomastia?.includes(
                                  g,
                                ) || false
                              }
                              onChange={() =>
                                onSpecialityClick("gynecomastia", g)
                              }
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#006064",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {diagnosisData.active_speciality === "pilonidalsinus" && (
                      <div className="animate__animated animate__fadeIn">
                        <div
                          className="d-flex flex-wrap gap-3 mb-2 p-3 rounded shadow-inner"
                          style={{ backgroundColor: "#f1fcfd" }}
                        >
                          {[
                            "Pilonidal Sinus",
                            "Pilonidal Abscess",
                            "Recurrent",
                          ].map((p) => (
                            <Form.Check
                              key={p}
                              label={p}
                              checked={
                                diagnosisData.speciality_data.pilonidalsinus?.includes(
                                  p,
                                ) || false
                              }
                              onChange={() =>
                                onSpecialityClick("pilonidalsinus", p)
                              }
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#006064",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {diagnosisData.active_speciality === "abscess" && (
                      <div className="animate__animated animate__fadeIn">
                        <div
                          className="d-flex flex-wrap gap-3 mb-2 p-3 rounded shadow-inner"
                          style={{ backgroundColor: "#f1fcfd" }}
                        >
                          {[
                            "Perianal",
                            "Ischiorectal",
                            "Recurrent Perianal",
                            "Infected Sebaceous Cyst",
                          ].map((a) => (
                            <Form.Check
                              key={a}
                              label={a}
                              checked={
                                diagnosisData.speciality_data.abscess?.includes(
                                  a,
                                ) || false
                              }
                              onChange={() => onSpecialityClick("abscess", a)}
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#006064",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {diagnosisData.active_speciality === "fissure" && (
                      <div className="animate__animated animate__fadeIn">
                        <div
                          className="d-flex flex-wrap gap-3 mb-2 p-3 rounded shadow-inner"
                          style={{ backgroundColor: "#f1fcfd" }}
                        >
                          {[
                            "Acute",
                            "Chronic",
                            "Infected",
                            "Multiple",
                            "Anal Papillae",
                          ].map((f) => (
                            <Form.Check
                              key={f}
                              label={f}
                              checked={
                                diagnosisData.speciality_data.fissure?.includes(
                                  f,
                                ) || false
                              }
                              onChange={() => onSpecialityClick("fissure", f)}
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#006064",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {diagnosisData.active_speciality === "circumcision" && (
                      <div className="animate__animated animate__fadeIn">
                        <div
                          className="d-flex flex-wrap gap-3 mb-2 p-3 rounded shadow-inner"
                          style={{ backgroundColor: "#f1fcfd" }}
                        >
                          {[
                            "Phimosis",
                            "Balanoposthitis",
                            "Frenulum Breve",
                          ].map((c) => (
                            <Form.Check
                              key={c}
                              label={c}
                              checked={
                                diagnosisData.speciality_data.circumcision?.includes(
                                  c,
                                ) || false
                              }
                              onChange={() =>
                                onSpecialityClick("circumcision", c)
                              }
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#006064",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {diagnosisData.active_speciality === "urology" && (
                      <div className="animate__animated animate__fadeIn">
                        <div
                          className="d-flex flex-wrap gap-3 mb-2 p-3 rounded shadow-inner"
                          style={{ backgroundColor: "#f1fcfd" }}
                        >
                          {[
                            "Hydrocele",
                            "Kidney Stone",
                            "Prostate",
                            "Urethra Stricture",
                          ].map((u) => (
                            <Form.Check
                              key={u}
                              label={u}
                              checked={
                                diagnosisData.speciality_data.urology?.includes(
                                  u,
                                ) || false
                              }
                              onChange={() => onSpecialityClick("urology", u)}
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#006064",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {diagnosisData.active_speciality === "other" && (
                      <div className="animate__animated animate__fadeIn">
                        <div
                          className="d-flex flex-wrap gap-3 mb-2 p-5 rounded shadow-inner align-items-center"
                          style={{ backgroundColor: "#f1fcfd" }}
                        >
                          {[
                            "IBS",
                            "Anal Wart",
                            "Cholelithiasis",
                            "Pyogenic Granuloma",
                          ].map((o) => (
                            <Form.Check
                              key={o}
                              label={o}
                              checked={
                                diagnosisData.speciality_data.other?.includes(
                                  o,
                                ) || false
                              }
                              onChange={() => onSpecialityClick("other", o)}
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#006064",
                              }}
                            />
                          ))}
                          <div className="d-flex align-items-center gap-2">
                            <Form.Check
                              label="Other"
                              checked={
                                diagnosisData.speciality_data.other?.includes(
                                  "Other",
                                ) || false
                              }
                              onChange={() =>
                                onSpecialityClick("other", "Other")
                              }
                              style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#006064",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {diagnosisData.active_speciality && (
                      <div className="mt-2 d-flex justify-content-between align-items-center">
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-danger text-decoration-none fw-bold ms-auto"
                          style={{ fontSize: "10px" }}
                          onClick={handleClearAllFindings}
                        >
                          <FeatherIcon
                            icon="trash-2"
                            size="12"
                            className="me-1"
                          />{" "}
                          CLEAR ALL FINDINGS
                        </Button>
                      </div>
                    )}
                    {diagnosisData.active_speciality && (
                      <div className="mt-4 text-end">
                        {/* <Button
                          variant="primary"
                          size="sm"
                          onClick={handleManualGenerateDiagnosis}
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
                          <FeatherIcon icon="edit-3" size="14" className="me-2" /> GENERATE DIAGNOSIS
                        </Button> */}
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-between align-items-end mb-1">
                <Form.Label
                  className="fw-bold mb-0"
                  style={{ fontSize: "13px", color: "#006064" }}
                >
                  Diagnosis <span className="text-danger">*</span>
                </Form.Label>
                <small
                  className="fw-bold"
                  style={{
                    fontSize: "10px",
                    fontStyle: "italic",
                    fontWeight: "700",
                  }}
                >
                  <FeatherIcon
                    icon="info"
                    size="12  "
                    className="me-1 text-info"
                  />
                  Select findings above to generate diagnosis
                </small>
              </div>
              <Form.Control
                as="textarea"
                rows={1}
                placeholder="Diagnosis will appear here..."
                value={diagnosisData.diagnosis_text}
                onChange={(e) =>
                  handleDiagnosisChange("diagnosis_text", e.target.value)
                }
                required
                style={{
                  borderRadius: "10px",
                  border: validationErrors.diagnosis_text ? "2px solid red" : "2px solid #eda6a6ff",
                  fontSize: "12px",
                  padding: "6px 12px",
                }}
              />
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-between align-items-end mb-1">
                <Form.Label
                  className="fw-bold mb-0"
                  style={{ fontSize: "13px", color: "#006064" }}
                >
                  Per Rectal Findings
                </Form.Label>
              </div>
              <Form.Control
                as="textarea"
                rows={1}
                placeholder="Enter Per Rectal Findings..."
                value={diagnosisData.rectalfindings || ""}
                onChange={(e) =>
                  handleDiagnosisChange("rectalfindings", e.target.value)
                }
                style={{
                  borderRadius: "10px",
                  border: "2px solid #b2ebf2",
                  fontSize: "12px",
                  padding: "6px 12px",
                }}
              />
            </Col>
          </Row>
        </fieldset>
      </div>

      {/* 2. Management Advice Types */}
      <div
        className="p-3 bg-white rounded shadow-sm border mb-3 d-flex flex-wrap align-items-center gap-3"
        style={{
          borderLeft: "5px solid #00838f",
          border: validationErrors.advice_types ? "2px solid red" : undefined,
        }}
      >
        <fieldset disabled={isReadOnly} style={lockStyle}>
          <h5
            className="fw-bold mb-0"
            style={{
              color: "#00838f",
              textTransform: "uppercase",
              fontSize: "14px",
              minWidth: "100px",
              padding: "10px",
            }}
          >
            Advice Treatment <span className="text-danger">*</span>
          </h5>
          <div
            className="d-flex flex-wrap gap-3 align-items-center px-3"
            style={{ borderLeft: "2px solid #b2ebf2" }}
          >
            {[
              "Medication",
              "Surgery",
              "Test",
              "MCDPA",
              "Referred to another doctor",
              "Meds -> Sx",
            ].map((type) => (
              <Form.Check
                key={type}
                label={
                  type === "Meds -> Sx" ? (
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id="tooltip-meds-sx">
                          Medicines lastly Surgery
                        </Tooltip>
                      }
                    >
                      <span
                        style={{
                          borderBottom: "1px dashed #006064",
                          cursor: "help",
                        }}
                      >
                        {type}
                      </span>
                    </OverlayTrigger>
                  ) : (
                    type
                  )
                }
                checked={diagnosisData.advice_types.includes(type)}
                onChange={() =>
                  handleDiagnosisCheckboxChange("advice_types", type)
                }
                disabled={
                  (type === "Referred to another doctor" &&
                    diagnosisData.advice_types.some(
                      (t) => t !== "Referred to another doctor",
                    )) ||
                  (type !== "Referred to another doctor" &&
                    diagnosisData.advice_types.includes(
                      "Referred to another doctor",
                    )) ||
                  (type === "Medication" &&
                    (diagnosisData.advice_types.includes("Surgery") ||
                      diagnosisData.advice_types.includes("Meds -> Sx"))) ||
                  (type === "Surgery" &&
                    (diagnosisData.advice_types.includes("Medication") ||
                      diagnosisData.advice_types.includes("Meds -> Sx"))) ||
                  (type === "Meds -> Sx" &&
                    (diagnosisData.advice_types.includes("Medication") ||
                      diagnosisData.advice_types.includes("Surgery")))
                }
                className="mb-0"
                style={{ fontSize: "14px", fontWeight: "600" }}
              />
            ))}
          </div>
          {diagnosisData.advice_types.includes("Test") && (
            <div
              className="ms-auto flex-grow-1 animate__animated animate__fadeInRight"
              style={{ minWidth: "250px" }}
            >
              <Form.Control
                as="textarea"
                rows={1}
                placeholder="Other / Test Comment"
                value={diagnosisData.diagnosis_comment}
                onChange={(e) =>
                  handleDiagnosisChange("diagnosis_comment", e.target.value)
                }
                style={{
                  borderRadius: "10px",
                  border: "2px solid #b2ebf2",
                  padding: "6px 12px",
                  fontSize: "14px",
                  minHeight: "80px",
                }}
              />
            </div>
          )}
        </fieldset>
      </div>

      {/* 4. Medications & Surgical Advice */}
      <div
        className="p-3 bg-white rounded shadow-sm border mb-3"
        style={{ borderLeft: "5px solid #0097a7" }}
      >
        <h5
          className="fw-bold"
          style={{
            color: "#00838f",
            textTransform: "uppercase",
            fontSize: "14px",
            padding: "5px",
          }}
        >
          Medicines & Procedures
        </h5>

        <fieldset disabled={isReadOnly} style={lockStyle}>
          <Row>
            <Col md={6} className="mb-2">
              <div className="d-flex justify-content-between align-items-end mb-1">
                <Form.Label
                  className="fw-bold mb-0"
                  style={{ fontSize: "13px", color: "#006064" }}
                >
                  Surgical Advice
                </Form.Label>
                <small
                  className="fw-bold"
                  style={{
                    fontSize: "10px",
                    fontStyle: "italic",
                    fontWeight: "700",
                  }}
                >
                  <FeatherIcon
                    icon="info"
                    size="12"
                    className="me-1 text-info"
                  />
                  Select findings above to generate surgical advice
                </small>
              </div>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Surgical advice will appear here..."
                value={diagnosisData.surgical_advice}
                onChange={(e) =>
                  handleDiagnosisChange("surgical_advice", e.target.value)
                }
                style={{
                  borderRadius: "10px",
                  border: "2px solid #eda6a6ff",
                  padding: "6px 12px",
                  fontSize: "12px",
                }}
              />
            </Col>
            <Col md={6} className="mb-10">
              <Form.Label
                className="fw-bold"
                style={{ fontSize: "13px", color: "#006064" }}
              >
                Comment
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Additional advice or comments..."
                value={diagnosisData.general_comment}
                onChange={(e) =>
                  handleDiagnosisChange("general_comment", e.target.value)
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
        </fieldset>
      </div>

      {/* 5. Payments & Administration */}
      <div
        className="p-3 bg-white rounded shadow-sm border mb-3"
        style={{
          borderLeft: "5px solid #00838f",
          border: validationErrors.categories ? "2px solid red" : undefined,
        }}
      >
        <h5
          className="fw-bold mb-3"
          style={{
            color: "#00838f",
            textTransform: "uppercase",
            fontSize: "14px",
            padding: "5px",
          }}
        >
          Payment Category {isSurgeryOrMedsSx && <span className="text-danger">*</span>}
        </h5>
        <fieldset disabled={isReadOnly} style={lockStyle}>
          <style>
            {`
              .custom-payment-radio .form-check-input {
                width: 1.3em;
                height: 1.3em;
                cursor: pointer;
                margin-top: 0;
              }
              .custom-payment-radio .form-check-label {
                cursor: pointer;
                user-select: none;
              }
            `}
          </style>
          <div className="d-flex flex-wrap gap-4 align-items-center mb-3 px-1">
            {["Cashless", "Reimbursement", "Charity", "No Insurance"].map((cat) => {
              const isChecked = diagnosisData.categories.includes(cat);
              return (
                <Form.Check
                  key={cat}
                  type="radio"
                  name="payment_category"
                  id={`payment-cat-${cat.replace(/\s+/g, "-")}`}
                  label={cat}
                  checked={isChecked}
                  disabled={isReferredToAnotherDoctor}
                  onClick={() => {
                    if (isChecked) {
                      handleDiagnosisCheckboxChange("categories", cat);
                    }
                  }}
                  onChange={() => {
                    if (!isChecked) {
                      handleDiagnosisCheckboxChange("categories", cat);
                    }
                  }}
                  className="mb-0 custom-payment-radio d-flex align-items-center gap-2"
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                />
              );
            })}

            <div className="d-flex align-items-center gap-2 ms-auto">
              <label
                style={{
                  fontSize: "13px",
                  color: "#00838f",
                  fontWeight: "800",
                  whiteSpace: "nowrap",
                }}
              >
                Insurance Company {isInsuranceCompanyRequired && <span className="text-danger">*</span>}
              </label>
              <Form.Select
                value={diagnosisData.insurance_company_id || ""}
                onChange={(e) =>
                  handleDiagnosisChange("insurance_company_id", e.target.value)
                }
                isInvalid={!!validationErrors.insurance_company_id}
                style={{
                  borderRadius: "10px",
                  border: validationErrors.insurance_company_id
                    ? "2px solid red"
                    : "2px solid #b2ebf2",
                  padding: "6px 12px",
                  fontSize: "12px",
                  color: "#00838f",
                  minWidth: "180px",
                }}
              >
                <option value="">Select Company</option>
                {insuranceCompanies.map((co) => (
                  <option key={co.comapny_id} value={co.comapny_id}>
                    {co.companyname}
                  </option>
                ))}
              </Form.Select>
            </div>

            <div className="d-flex align-items-center gap-2">
              <label
                style={{
                  fontSize: "13px",
                  color: "#00838f",
                  fontWeight: "800",
                  whiteSpace: "nowrap",
                }}
              >
                TPA
              </label>
              <Form.Select
                value={diagnosisData.tpa_id || ""}
                onChange={(e) =>
                  handleDiagnosisChange("tpa_id", e.target.value)
                }
                style={{
                  borderRadius: "10px",
                  border: "2px solid #b2ebf2",
                  padding: "6px 12px",
                  fontSize: "12px",
                  color: "#00838f",
                  minWidth: "180px",
                }}
              >
                <option value="">Select TPA</option>
                {tpaCompanies.map((t) => (
                  <option key={t.comapny_id || t.tpaid} value={t.comapny_id || t.tpaid}>
                    {t.companyname || t.tpaname}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>

          <div>
            <label
              style={{
                fontSize: "13px",
                color: "#00838f",
                fontWeight: "800",
                marginBottom: "4px",
                display: "block",
                marginTop: "15px"
              }}
            >
              Estimate Package/Insurance Details {isSurgeryOrMedsSx && <span className="text-danger">*</span>}
            </label>
            <Form.Control
              as="textarea"
              rows={1}
              placeholder="Enter details of package / insurance"
              value={diagnosisData.category_comment}
              onChange={(e) =>
                handleDiagnosisChange("category_comment", e.target.value)
              }
              isInvalid={!!validationErrors.category_comment}
              style={{
                borderRadius: "10px",
                border: validationErrors.category_comment
                  ? "2px solid red"
                  : "2px solid #b2ebf2",
                padding: "6px 12px",
                fontSize: "12px",
                width: "100%",
              }}
            />
          </div>
        </fieldset>
      </div>

      {/* 6. Medical Advice & Procedures */}
      <div
        className="p-3 bg-white rounded shadow-sm border mb-3"
        style={{ borderLeft: "5px solid #00acc1" }}
      >
        <h5
          className="fw-bold mb-3"
          style={{
            color: "#00838f",
            textTransform: "uppercase",
            fontSize: "14px",
            padding: "5px",
          }}
        >
          Test Adviced
        </h5>
        <fieldset disabled={isReadOnly} style={lockStyle}>
          <div
            className="p-3 border rounded"
            style={{ backgroundColor: "#f1fcfd", border: "2px solid #b2ebf2" }}
          >
            <Row>
              {[
                "MCDPA",
                "Uroflowmetry",
                "CHT",
                "Biofeedback",
                "Manometry",
                "Colo",
                "Gastro",
                "Lab Investigation",
                "Diet",
                "X-ray",
                "CT",
                "Ultrasonography",
                "ECHO",
                "MRI",
                "Doppler",
                "3D Endo Anal Imaging",
                "GMT",
              ].map((advice) => (
                <Col md={3} key={advice} className="mb-3">
                  <Form.Check
                    label={
                      advice === "GMT" ? (
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-gmt">
                              Gut Microbiome Test
                            </Tooltip>
                          }
                        >
                          <span
                            style={{
                              borderBottom: "1px dashed #006064",
                              cursor: "help",
                            }}
                          >
                            {advice.toUpperCase()}
                          </span>
                        </OverlayTrigger>
                      ) : (
                        advice.toUpperCase()
                      )
                    }
                    checked={diagnosisData.medical_advice.includes(advice)}
                    onChange={() =>
                      handleDiagnosisCheckboxChange("medical_advice", advice)
                    }
                    className="mb-1"
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#006064",
                    }}
                  />
                  {diagnosisData.medical_advice.includes(advice) && (
                    <Form.Control
                      size="sm"
                      placeholder={`Notes for ${advice}`}
                      value={diagnosisData.medical_advice_notes[advice] || ""}
                      onChange={(e) =>
                        handleMedicalAdviceNoteChange(advice, e.target.value)
                      }
                      className="animate__animated animate__fadeIn"
                      style={{
                        borderRadius: "10px",
                        border: "2px solid #b2ebf2",
                        padding: "6px 12px",
                        fontSize: "14px",
                      }}
                    />
                  )}
                </Col>
              ))}
            </Row>
          </div>
        </fieldset>
      </div>

      {/* 7. Responsible Doctors */}
      <div
        className="p-3 bg-white rounded shadow-sm border mb-3"
        style={{ borderLeft: "5px solid #0097a7" }}
      >
        <h5
          className="fw-bold"
          style={{
            color: "#00838f",
            textTransform: "uppercase",
            fontSize: "14px",
            padding: "5px",
          }}
        >
          Doctor Allocation
        </h5>
        <fieldset disabled={isReadOnly} style={lockStyle}>
          <Row className="g-2">
            <Col md={6}>
              <Form.Label className="fw-bold" style={{ fontSize: "12px" }}>
                Consultant Doctor <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                required
                value={diagnosisData.consultant_doctor || ""}
                onChange={(e) =>
                  handleDiagnosisChange("consultant_doctor", e.target.value)
                }
                style={{
                  borderRadius: "10px",
                  border: validationErrors.consultant_doctor ? "2px solid red" : "2px solid #b2ebf2",
                  padding: "6px 12px",
                  fontSize: "12px",
                }}
              >
                <option value="">Select Consultant Doctor</option>
                {doctors
                  .filter(
                    (doc) =>
                      doc.doctor_type &&
                      doc.doctor_type.toLowerCase().includes("main"),
                  )
                  .map((doc) => (
                    <option key={doc.doctor_id} value={doc.doctor_id}>
                      {doc.name}
                    </option>
                  ))}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label className="fw-bold" style={{ fontSize: "12px" }}>
                Assistant Doctor <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                required
                value={diagnosisData.assistance_doctor || ""}
                onChange={(e) =>
                  handleDiagnosisChange("assistance_doctor", e.target.value)
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

      <div className="text-center mb-5 pb-5 mt-4">
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
            onClick={onSaveDiagnosis}
            disabled={loading}
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
            {loading ? (
              <Spinner size="sm" className="me-2" />
            ) : (
              <FeatherIcon icon="save" size="18" className="me-2" />
            )}
            {isEditing ? "UPDATE DIAGNOSIS DATA" : "SAVE DIAGNOSIS DATA"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default DiagnosisCard;
