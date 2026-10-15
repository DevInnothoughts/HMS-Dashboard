import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { useReactToPrint } from "react-to-print";
import {
  Container,
  Row,
  Col,
  Card,
  Nav,
  Tab,
  Table,
  Button,
  Form,
  Spinner,
  Modal,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import { FaStethoscope } from "react-icons/fa";
import PatientHistoryCard from "./PatientHistoryCard";
import PersonalDetailsCard from "./PersonalDetailsCard";
import DiagnosisCard from "./DiagnosisCard";
import DiagnosisPrintView from "./DiagnosisPrintView";
import FollowUpPrintView from "./FollowUpPrintView";
import FollowUpCard from "./FollowUpCard";
import PostOpCard from "./PostOpCard";
// import OtherTestsCard from "./OtherTestsCard";
import ProctoscopyCard from "./ProctoscopyCard";
import OpdPrescriptionCard from "./OpdPrescriptionCard";
import OpdPrescriptionPrintView from "./OpdPrescriptionPrintView";
// import SurgeryDetailsCard from "./SurgeryDetailsCard";
import DischargeCard from "./DischargeCard";
import DischargePrintView from "./DischargePrintView";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import Swal from "sweetalert2";
import { toast as hotToast } from "react-hot-toast";
const toast = new Proxy(hotToast, {
  get(target, prop) {
    if (prop === "warning") {
      return (msg, options) => hotToast(msg, { ...options, icon: "ΓÜá∩╕Å" });
    }
    if (prop === "info") {
      return (msg, options) => hotToast(msg, { ...options, icon: "Γä╣∩╕Å" });
    }
    return target[prop];
  },
});
import { decodeJwt } from "../Utility/decode-jwt";
import nabhLogo from "../../assets/images/nabh-logo.png";
import painScoreChart from "../../assets/images/pain-score-chart.jpg";

const BASE_URL = "http://194.195.117.79:5100/api";
const UPLOAD_BASE_URL = "http://194.195.117.79:5100/uploads";

const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Ivory Coast",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Samoa",
  "San Marino",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const calculateAge = (birthDate, referenceDate = null) => {
  if (!birthDate) return "";

  let refDate = new Date();
  if (referenceDate) {
    let normalizedTarget = referenceDate;
    if (typeof referenceDate === "string" && /^\d{2}[-/]\d{2}[-/]\d{4}$/.test(referenceDate)) {
      const parts = referenceDate.split(/[-/]/);
      normalizedTarget = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    const parsedRef = new Date(normalizedTarget);
    if (!isNaN(parsedRef.getTime())) {
      refDate = parsedRef;
    }
  }

  const trimmed = String(birthDate).trim();
  if (/^\d{4}$/.test(trimmed)) {
    const birthYear = parseInt(trimmed, 10);
    const age = refDate.getFullYear() - birthYear;
    return age >= 0 ? age : "";
  }

  let formattedDate = trimmed;
  if (formattedDate.includes("/")) {
    const parts = formattedDate.split("/");
    if (parts[0].length === 4) {
      formattedDate = `${parts[0]}-${parts[1]}-${parts[2]}`;
    } else if (parts[2] && parts[2].length >= 4) {
      formattedDate = `${parts[2].slice(0, 4)}-${parts[1]}-${parts[0]}`;
    }
  } else if (formattedDate.includes("-")) {
    const parts = formattedDate.split("-");
    if (parts[0].length === 4) {
      formattedDate = `${parts[0]}-${parts[1]}-${parts[2]}`;
    } else if (parts[2] && parts[2].length >= 4) {
      formattedDate = `${parts[2].slice(0, 4)}-${parts[1]}-${parts[0]}`;
    }
  } else if (/^\d{8}$/.test(formattedDate)) {
    const dPart = formattedDate.substring(0, 2);
    const mPart = formattedDate.substring(2, 4);
    const yPart = formattedDate.substring(4, 8);
    formattedDate = `${yPart}-${mPart}-${dPart}`;
  }

  const birth = new Date(formattedDate);
  if (isNaN(birth.getTime())) return "";

  let age = refDate.getFullYear() - birth.getFullYear();
  const monthDiff = refDate.getMonth() - birth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && refDate.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age >= 0 ? age : "";
};

const OpdPatientMedicalRecords = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(state?.patient);

  const [activeTab, setActiveTab] = useState("menu");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    setValidationErrors({});
  }, [activeTab]);

  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        return payload.jobLocation;
      }
    }
    return "default";
  });
  const [hasFetchedPatient, setHasFetchedPatient] = useState(false);

  const [formData, setFormData] = useState({
    Uid_no: "",
    date: "",
    prefix: "",
    name: "",
    patient_type: 0,
    email: "",
    address: "",
    sex: "",
    phone: "",
    mobile_2: "",
    pincode: "",
    blood_group: "",
    identity: "",
    identityNumber: "",
    birth_date: "",
    age: "",
    occupation: "",
    companyname: "",
    reference_type: "",
    ref: "",
    specific_work: "",
    patient_id: "",
    ref_doctor_name: "",
    ref_doctor_phone: "",
    nationality: "",
    language: "",
  });

  const [showDischargePrintModal, setShowDischargePrintModal] = useState(false);
  const [showDiagnosisPrintModal, setShowDiagnosisPrintModal] = useState(false);
  const [showFollowUpPrintModal, setShowFollowUpPrintModal] = useState(false);
  const [showOpdPrintModal, setShowOpdPrintModal] = useState(false);

  const initialHistoryState = {
    patient_date: new Date().toISOString().split("T")[0],
    height_feet: "",
    weight_kg: "",
    painscale: "1",
    vital_bp: "",
    vital_pulse: "",
    vital_rr: "",
    rs: "",
    cvs: "",
    cns: "",
    pa: "",
    "p/a": "",
    family_history: [],
    family_history_other: "",
    general_history: [],
    weightloss_comment: "",
    past_medical_history: [],
    past_medical_history_other: "",
    pastmedicalduration: {},
    habits: [],
    drug_allergy: "",
    medication_history: [
      { medicine: "", indication: "", since: "" },
      { medicine: "", indication: "", since: "" },
      { medicine: "", indication: "", since: "" },
    ],
    past_surgical_history: "",
    any_other_complaints: "",
    present_complaints: "",
    ongoing_medicines: [],
    ongoing_medicines_other: "",
    previous_investigation: [],
    investigation_comments: {},
    known_case_of: "",
    assistance_doctor: "",
    piles_data: [],
    piles_duration: "",
    fistula_data: [],
    fistula_duration: "",
    hernia_data: [],
    hernia_duration: "",
    varicose_data: [],
    varicose_duration: "",
    urinary_incontinence: false,
    urinary_duration: "",
    fecal_incontinence: false,
    fecal_duration: "",
    urology_data: [],
    urology_duration: "",
    ods_data: [],
    ods_bowel_habits: "",
    ods_duration: "",
    pilonidal_data: [],
    pilonidal_comment: "",
    circumcision_comment: "",
    investigations: [],
    investigation_notes: {},
    investigation: "",
    upload_investigation: null,
    upload_investigation_existing: "",
  };

  const [historyData, setHistoryData] = useState(initialHistoryState);

  const [previousHistoryList, setPreviousHistoryList] = useState([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [allHistoryDataForPrint, setAllHistoryDataForPrint] = useState([]);
  const [allDiagnosisDataForPrint, setAllDiagnosisDataForPrint] = useState([]);
  const [historyForPrint, setHistoryForPrint] = useState(null);
  const [prescriptionForPrint, setPrescriptionForPrint] = useState(null);
  const [isPrintReady, setIsPrintReady] = useState(false);

  const fetchedHistoryCache = useRef({});
  const fetchedDiagnosisCache = useRef({});
  const fetchedFollowUpCache = useRef({});
  const fetchedOpdCache = useRef({});
  const fetchedDischargeCache = useRef({});

  const [isEditingPrescription, setIsEditingPrescription] = useState(false);
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [isEditingDiagnosis, setIsEditingDiagnosis] = useState(false);

  const handleEditHistory = () => setIsEditingHistory(true);
  const handleEditDiagnosis = () => setIsEditingDiagnosis(true);

  const handleEditPrescription = () => setIsEditingPrescription(true);

  const fetchHistoryDates = async () => {
    if (!formData.patient_id) return;
    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/list-history-dates/${formData.patient_id}?location=${currentLocation}`,
        {
          headers: {
            location: currentLocation,
            "x-hms-location": currentLocation,
          },
        },
      );
      const result = await response.json();
      if (result.statusCode === 200) {
        const formattedList = (result.data || []).map((item) => {
          let displayDate = item.date;
          if (item.date && item.date.includes("-")) {
            const parts = item.date.split("-");
            if (parts[0].length === 4) {
              // YYYY-MM-DD to DD-MM-YYYY
              const [year, month, day] = parts;
              displayDate = `${day}-${month}-${year}`;
            }
          }

          return {
            ...item,
            id: item.id.toString(),
            date: displayDate,
          };
        });
        setPreviousHistoryList(formattedList);
      }
    } catch (error) {
      console.error("Error fetching history dates:", error);
    }
  };

  const [previousDiagnosisList, setPreviousDiagnosisList] = useState([]);
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState(null);

  const fetchDiagnosisDates = async () => {
    if (!formData.patient_id) return;
    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/list-diagnosis-dates/${formData.patient_id}?location=${currentLocation}`,
        {
          headers: {
            location: currentLocation,
            "x-hms-location": currentLocation,
          },
        },
      );
      const result = await response.json();
      if (result.statusCode === 200) {
        const formattedList = (result.data || []).map((item) => {
          let displayDate = item.date;
          if (item.date && item.date.includes("-")) {
            const parts = item.date.split("-");
            if (parts[0].length === 4) {
              const [year, month, day] = parts;
              displayDate = `${day}-${month}-${year}`;
            }
          }

          return {
            ...item,
            id: item.id.toString(),
            date: displayDate,
          };
        });
        setPreviousDiagnosisList(formattedList);
        return formattedList;
      }
      return [];
    } catch (error) {
      console.error("Error fetching diagnosis dates:", error);
      return [];
    }
  };

  const handleSaveHistory = async () => {
    // Basic validation to prevent saving essentially empty history records
    const isHistoryEmpty = () => {
      // Check for filled strings (excluding defaults like date and painscale)
      const hasTextRecord = Object.entries(historyData).some(([key, val]) => {
        if (
          [
            "patient_date",
            "painscale",
            "upload_investigation_existing",
            "assistance_doctor",
          ].includes(key)
        )
          return false;
        if (typeof val === "string") return val.trim() !== "";
        return false;
      });

      // Check for non-empty arrays (with special handling for medication table)
      const hasArrayRecord = Object.entries(historyData).some(([key, val]) => {
        if (!Array.isArray(val)) return false;
        if (key === "medication_history") {
          return val.some(
            (m) =>
              (m.medicine && m.medicine.trim()) ||
              (m.indication && m.indication.trim()) ||
              (m.since && m.since.trim()),
          );
        }
        return val.length > 0;
      });

      // Check for special fields like file uploads, checkboxes, or investigation notes
      const hasSpecialRecord =
        historyData.upload_investigation !== null ||
        historyData.urinary_incontinence ||
        historyData.fecal_incontinence ||
        (historyData.investigation_notes &&
          Object.values(historyData.investigation_notes).some(
            (v) => v && v.trim() !== "",
          ));

      // If nothing is filled, it's considered empty
      return !hasTextRecord && !hasArrayRecord && !hasSpecialRecord;
    };

    const errors = {};
    if (
      !historyData.height_feet ||
      String(historyData.height_feet).trim() === ""
    ) {
      errors.height_feet = true;
    }
    if (!historyData.weight_kg || String(historyData.weight_kg).trim() === "") {
      errors.weight_kg = true;
    }
    if (
      !historyData.assistance_doctor ||
      String(historyData.assistance_doctor).trim() === ""
    ) {
      errors.assistance_doctor = true;
    }

    if (isHistoryEmpty() || Object.keys(errors).length > 0) {
      if (isHistoryEmpty()) {
        errors.height_feet = true;
        errors.weight_kg = true;
        errors.assistance_doctor = true;
      }
      Toast.fire({
        icon: "warning",
        title:
          "Please fill all mandatory/required fields which are not filled yet",
      });
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    setLoading(true);
    try {
      const formDataObj = new FormData();

      // Append all history data fields to FormData
      Object.keys(historyData).forEach((key) => {
        const val = historyData[key];
        if (key === "upload_investigation") {
          if (val) formDataObj.append(key, val);
        } else if (Array.isArray(val)) {
          // Always stringify arrays for consistency with backend expectations for jsonFields
          formDataObj.append(key, JSON.stringify(val));
        } else if (typeof val === "object" && val !== null) {
          formDataObj.append(key, JSON.stringify(val));
        } else {
          formDataObj.append(key, val);
        }
      });

      const response = await fetch(
        `${BASE_URL}/V1/doctor/save-patient-history/${formData.patient_id}?location=${currentLocation}`,
        {
          method: "POST",
          headers: {
            // Do NOT set Content-Type header when sending FormData, the browser will set it with the correct boundary
            location: currentLocation,
            "x-hms-location": currentLocation,
          },
          body: formDataObj,
        },
      );
      const data = await response.json();
      if (data.statusCode === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Patient history saved successfully!",
          timer: 3000,
          timerProgressBar: true,
        });
        await new Promise((resolve) => setTimeout(resolve, 800));
        fetchHistoryDates();
        setHistoryData(initialHistoryState);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to save history",
        });
      }
    } catch (error) {
      console.error("Error saving history:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving patient history.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = async (id) => {
    setIsEditingHistory(false);
    setSelectedHistoryId(id);
    const selected = previousHistoryList.find((h) => h.id === id);
    if (!selected) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/V1/doctor/get-patient-history/${formData.patient_id}?historyId=${id}&location=${currentLocation}`,
        {
          headers: {
            location: currentLocation,
            "x-hms-location": currentLocation,
          },
        },
      );
      const result = await response.json();

      if (result.statusCode === 200 && result.data) {
        const d = result.data;
        const toArray = (str) =>
          str
            ? str
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
            : [];
        const symptomsArr = toArray(d.symptoms);

        // Define symptom groups to filter category-specific data
        const pilesOpts = [
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
        ];
        const fistulaOpts = [
          "Pus Discharge",
          "Boil",
          "Watery Discharge",
          "Swelling near anal region",
        ];
        const herniaOpts = [
          "Swelling:Umbilical",
          "Right Inguinal",
          "Left Inguinal",
          "Swelling:Abdominal",
          "Reducible",
          "Nonreducible",
          "Past Sx",
        ];
        const varicoseOpts = [
          "Pain in Legs",
          "Enlarged veins",
          "Swelling in Legs",
          "Ulcer",
          "Right",
          "Left",
          "B/L",
        ];
        const urologyOpts = [
          "Pain",
          "Burning urination",
          "Nausea",
          "Vomiting",
          "LUTS",
          "Urgency of urination",
          "Incomplete evacuation",
          "Stream of urine",
          "Nocturia",
        ];
        const odsOpts = [
          "Excessive Straining",
          "Digitation",
          "Hard Stools",
          "Enema / Laxative",
          "Fragmented Defecation",
          "Chronic constipation",
          "Urgency",
          "Frequency",
        ];
        const pilonidalOpts = [
          "Pain:Tailbone",
          "Boil:Tailbone",
          "Swelling:Tailbone",
          "Pus / Watery Discharge",
        ];

        let parsedOdsBowelHabits = "";
        let parsedOdsDuration = "";
        const odsRaw = d.ODS_duration || d.ods_duration;
        if (odsRaw) {
          if (Array.isArray(odsRaw)) {
            parsedOdsBowelHabits = odsRaw[0] || "";
            parsedOdsDuration = odsRaw[1] || "";
          } else if (typeof odsRaw === "string") {
            try {
              const arr = JSON.parse(odsRaw);
              if (Array.isArray(arr)) {
                parsedOdsBowelHabits = arr[0] || "";
                parsedOdsDuration = arr[1] || "";
              } else {
                parsedOdsDuration = odsRaw;
              }
            } catch (e) {
              parsedOdsDuration = odsRaw;
            }
          } else {
            parsedOdsDuration = String(odsRaw);
          }
        }

        const investigationTypes = [
          "HB",
          "BSL-R",
          "Bleding Time-BT",
          "Clotting Time-BT",
          "PT INR",
          "HIV",
          "Hbsag",
          "SR.Creatinine",
          "Vit B12",
          "HbA1C",
          "Thyroid",
          "LVEF",
          "Glucose Fasting",
        ];
        const commentsArr = d.newInvestigation_comment
          ? d.newInvestigation_comment.split(",")
          : [];
        let investigationStates = toArray(d.newInvestigation);
        let notes = {};
        let existingImgFilename = "";

        // Determine if there is an image filename in the comments array
        // Slot 14 (index 13) is our new standard, slot 10 (index 9) is legacy fallback
        if (commentsArr.length >= 14) {
          existingImgFilename = commentsArr[13];
        } else if (commentsArr.length === 10) {
          // If exactly 10 items, slot 10 is usually the image in PHP legacy
          existingImgFilename = commentsArr[9];
        }

        // Map notes to types, ignoring the image slots if they exist
        investigationTypes.forEach((type, index) => {
          if (commentsArr[index] && index < 13) {
            // Only assign as note if it's not the image slot (or if it's valid note data)
            // If it's index 9 and looks like a filename, we skip it for notes if it's legacy
            if (
              index === 9 &&
              (commentsArr[index].includes("inv_") ||
                commentsArr[index].includes("_"))
            ) {
              // Skip legacy image filename accidentally mapping to HbA1C note
            } else {
              notes[type] = commentsArr[index];
            }
          }
        });

        const parseHistoryFields = (rawStr, knownOpts) => {
          const all = toArray(rawStr);
          const known = [];
          const other = [];
          all.forEach((item) => {
            const match = knownOpts.find(
              (opt) => opt.trim().toLowerCase() === item.toLowerCase(),
            );
            if (match) known.push(match);
            else other.push(item);
          });
          return { known, otherStr: other.join(", ") };
        };

        const familyParsed = parseHistoryFields(d.family_history, [
          "Piles",
          "Constipation",
          "DM",
          "HTN",
          "Heart Disease",
        ]);
        const pastMedicalParsed = parseHistoryFields(d.past_history, [
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
        ]);
        const generalParsed = parseHistoryFields(d.general_history, [
          "History of Weight Loss",
          "Decreased Appetite",
          "Straining for Urination",
          "Acidity",
          "Gas",
          "Bloating",
        ]);
        const ongoingMedsParsed = parseHistoryFields(d.ongoing_medicines, [
          "Aspirin",
          "Clopidogrel",
          "Warfarin",
          "Acitrom",
        ]); // Using common ones as placeholder if not specified, otherwise others will just fall smoothly

        const formatLocalDate = (isoDate) => {
          if (!isoDate) return "";
          // If it's already YYYY-MM-DD, return as is (for input type="date")
          if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;

          // If it's DD-MM-YYYY, convert to YYYY-MM-DD
          if (/^\d{2}-\d{2}-\d{4}$/.test(isoDate)) {
            const [day, month, year] = isoDate.split("-");
            return `${year}-${month}-${day}`;
          }

          // Fallback for full ISO strings or others
          const jsDate = moment(isoDate).toDate();
          if (isNaN(jsDate.getTime())) return isoDate;
          const year = jsDate.getFullYear();
          const month = String(jsDate.getMonth() + 1).padStart(2, "0");
          const day = String(jsDate.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const loadedState = {
          ...initialHistoryState,
          patient_date:
            formatLocalDate(d.patient_date) || formatLocalDate(selected.date),
          assistance_doctor: d.doctor_id?.toString() || "",
          height_feet: d.height || "",
          weight_kg: d.weight || "",
          painscale: d.painscale?.toString() || "1",
          vital_bp: d.BP || d.bp || "",
          vital_pulse: d.Pulse || d.pulse || "",
          vital_rr: d.RR || d.rr || "",
          rs: d.RS || d.rs || "",
          cvs: d.CVS || d.cvs || "",
          cns: d.CNS || d.cns || "",
          pa: "",
          "p/a": d.PA || d.pa || d["p/a"] || d["P/A"] || "", // This is the one used by the UI

          piles_duration: d.piles_duration || "",
          fistula_duration: d.fistula_duration || "",
          hernia_duration: d.hernia_duration || "",
          varicose_duration: d.varicose_duration || "",
          urology_duration: d.uro_duration || "",
          pilonidal_comment: d.pilonidalsinus || "",
          circumcision_comment: d.circumcision || "",

          urinary_duration:
            d.Urinary_incontinence_duration ||
            d.urinary_incontinence_duration ||
            "",
          urinary_incontinence: symptomsArr.includes("Urinary Incontinence"),

          fecal_duration:
            d.Fecal_incontinence_duration ||
            d.fecal_incontinence_duration ||
            "",
          fecal_incontinence: symptomsArr.includes("Fecal Incontinence"),

          ods_bowel_habits: parsedOdsBowelHabits,
          ods_duration: parsedOdsDuration,

          family_history: familyParsed.known,
          family_history_other: familyParsed.otherStr,

          general_history: generalParsed.known,
          weightloss_comment: generalParsed.otherStr,

          past_medical_history: pastMedicalParsed.known,
          past_medical_history_other: pastMedicalParsed.otherStr,
          pastmedicalduration: d.pastmedicalduration || {},

          habits: toArray(d.habits),
          drug_allergy: d.drugs_allery || "",
          past_surgical_history: d.comment || "",
          present_complaints: d.presentcomplaints || "",
          any_other_complaints: d.complaints || "",

          ongoing_medicines: ongoingMedsParsed.known,
          ongoing_medicines_other: ongoingMedsParsed.otherStr,

          investigations: investigationStates,
          investigation_notes: notes,
          investigation: d.investigation || "",
          known_case_of: d.knowncaseof || "",
          upload_investigation_existing: existingImgFilename,

          piles_data: symptomsArr.filter((s) => pilesOpts.includes(s)),
          fistula_data: symptomsArr.filter((s) => fistulaOpts.includes(s)),
          hernia_data: symptomsArr.filter((s) => herniaOpts.includes(s)),
          varicose_data: symptomsArr.filter((s) => varicoseOpts.includes(s)),
          urology_data: symptomsArr.filter((s) => urologyOpts.includes(s)),
          ods_data: symptomsArr.filter((s) => odsOpts.includes(s)),
          pilonidal_data: symptomsArr.filter((s) => pilonidalOpts.includes(s)),
        };

        if (d.medication_history) {
          let meds = [];
          if (Array.isArray(d.medication_history)) {
            meds = d.medication_history;
          } else if (
            typeof d.medication_history === "string" &&
            d.medication_history.trim().length > 0
          ) {
            try {
              meds = JSON.parse(d.medication_history);
            } catch (e) {
              console.warn(
                "Failed to parse medication_history from server string:",
                e,
              );
            }
          }

          if (Array.isArray(meds) && meds.length > 0) {
            const mappedMeds = meds.map((m) => ({
              medicine: m.medicine || "",
              indication: m.indication || "",
              since: m.since || "",
            }));
            while (mappedMeds.length < 3)
              mappedMeds.push({ medicine: "", indication: "", since: "" });
            loadedState.medication_history = mappedMeds;
          }
        }

        setHistoryData(loadedState);
        setIsEditingHistory(false);

        toast.success(`Loaded history from ${selected.date}`);
      } else {
        toast.error("Could not fetch history record data");
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("An error occurred while loading history.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewRecord = () => {
    setIsEditingHistory(false);
    setSelectedHistoryId(null);
    setHistoryData(initialHistoryState);
    toast.info("Started a new record session");
  };

  const initialDiagnosisState = {
    date_diagnosis: new Date().toISOString().split("T")[0],
    investigation_orders: "",
    diagnosis_text: "",
    advice_types: [], // Medication, Surgery, Test
    diagnosis_comment: "",
    active_speciality: "piles",
    speciality_data: {
      piles: [],
      fistula: [],
      fistula_detailed_findings: [],
      fistula_other: "",
      hernia: [],
      hernia_other: "",
      varicosevein: [],
      varicosevein_other: "",
      prolapse: [],
      prolapse_other: "",
      cyst: [],
      cyst_other: "",
      hydrocele: [],
      hydrocele_other: "",
      lipoma: [],
      lipoma_other: "",
      gynecomastia: [],
      gynecomastia_other: "",
      pilonidalsinus: [],
      pilonidalsinus_other: "",
      circumcision: "",
      abscess: [],
      abscess_other: "",
      fissure: [],
      fissure_other: "",
      ibs: "",
      urology: "",
    },
    medicines_prescribed: [],
    other_meds: "",
    surgical_advice: "",
    general_comment: "",
    video_proctoscopy: "",
    video_proctoscopy_reason: "",
    has_surgical_date: false,
    surgical_date: "0000-00-00",
    categories: [], // Cashless, Reimbursement, Charity, No Insurance
    insurance_company_id: "",
    tpa_id: "",
    category_comment: "",
    medical_advice: [], // MCDPA, CHT, etc.
    medical_advice_notes: {},
    consultant_doctor: "",
    assistance_doctor: "",
  };

  const [diagnosisData, setDiagnosisData] = useState(initialDiagnosisState);

  const handleSelectDiagnosis = async (id) => {
    setIsEditingDiagnosis(false);
    setSelectedDiagnosisId(id);
    const selected = previousDiagnosisList.find((d) => d.id === id);
    if (!selected) return;

    try {
      setLoading(true);
      const apiDate = moment(selected.date, "DD-MM-YYYY").format("YYYY-MM-DD");
      const response = await fetch(
        `${BASE_URL}/V1/doctor/get-diagnosis/${formData.patient_id}?date=${apiDate}&location=${currentLocation}`,
        {
          headers: {
            location: currentLocation,
            "x-hms-location": currentLocation,
          },
        },
      );
      const result = await response.json();

      if (result.statusCode === 200 && result.data) {
        const d = result.data;
        const toArray = (val) => {
          if (!val) return [];
          if (Array.isArray(val)) return val;
          if (typeof val === "string")
            return val
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
          return [];
        };

        const parsedData = {
          ...d,
          advice_types: toArray(d.advice_types),
          medical_advice: toArray(d.medical_advice),
          medicines_prescribed: toArray(d.medicines_prescribed),
          categories: toArray(d.categories),
          surgical_advice: d.advice || "",
          video_proctoscopy: d.video_proctoscopy || "",
          video_proctoscopy_reason: d.video_proctoscopy_reason || "",
          speciality_data: {
            ...d.speciality_data,
            piles: toArray(d.speciality_data?.piles),
            fistula: toArray(d.speciality_data?.fistula),
            fistula_detailed_findings: toArray(
              d.speciality_data?.fistula_detailed_findings,
            ),
            fistula_other: d.speciality_data?.fistula_other || "",
            hernia: toArray(d.speciality_data?.hernia),
            hernia_other: d.speciality_data?.hernia_other || "",
            varicosevein: toArray(d.speciality_data?.varicosevein),
            varicosevein_other: d.speciality_data?.varicosevein_other || "",
            prolapse: toArray(d.speciality_data?.prolapse),
            prolapse_other: d.speciality_data?.prolapse_other || "",
            cyst: toArray(d.speciality_data?.cyst),
            cyst_other: d.speciality_data?.cyst_other || "",
            hydrocele: toArray(d.speciality_data?.hydrocele),
            hydrocele_other: d.speciality_data?.hydrocele_other || "",
            lipoma: toArray(d.speciality_data?.lipoma),
            lipoma_other: d.speciality_data?.lipoma_other || "",
            gynecomastia: toArray(d.speciality_data?.gynecomastia),
            gynecomastia_other: d.speciality_data?.gynecomastia_other || "",
            pilonidalsinus: toArray(d.speciality_data?.pilonidalsinus),
            pilonidalsinus_other: d.speciality_data?.pilonidalsinus_other || "",
            circumcision: d.speciality_data?.circumcision || "",
            abscess: toArray(d.speciality_data?.abscess),
            abscess_other: d.speciality_data?.abscess_other || "",
            fissure: toArray(d.speciality_data?.fissure),
            fissure_other: d.speciality_data?.fissure_other || "",
            ibs: d.speciality_data?.ibs || "",
            urology: d.speciality_data?.urology || "",
          },
        };

        setDiagnosisData(parsedData);
        setIsEditingDiagnosis(false);
        toast.success(`Loaded diagnosis for ${selected.date}`);
      } else {
        toast.error("Could not fetch diagnosis record data");
      }
    } catch (error) {
      console.error("Error fetching diagnosis:", error);
      toast.error("An error occurred while loading diagnosis.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewDiagnosis = () => {
    setIsEditingDiagnosis(false);
    setSelectedDiagnosisId(null);
    setDiagnosisData(initialDiagnosisState);
    toast.info("Started a new diagnosis session");
  };

  const handleSaveDiagnosis = async () => {
    const hasData =
      diagnosisData.diagnosis_text?.trim() ||
      diagnosisData.investigation_orders?.trim() ||
      diagnosisData.diagnosis_comment?.trim() ||
      diagnosisData.medical_advice?.length > 0 ||
      diagnosisData.advice_types?.length > 0 ||
      Object.values(diagnosisData.speciality_data || {}).some((v) =>
        Array.isArray(v) ? v.length > 0 : v && v.trim() !== "",
      );

    const errors = {};

    // Check Specialty Findings (Required: active specialty must have at least one finding)
    const activeSpec = diagnosisData.active_speciality;
    if (!activeSpec) {
      errors.speciality_data = true;
    } else {
      const activeFindings = diagnosisData.speciality_data?.[activeSpec];
      const hasActiveFindings = Array.isArray(activeFindings)
        ? activeFindings.length > 0
        : activeFindings && String(activeFindings).trim() !== "";
      if (!hasActiveFindings) {
        errors.speciality_data = true;
      }
    }

    if (
      !diagnosisData.diagnosis_text ||
      String(diagnosisData.diagnosis_text).trim() === ""
    ) {
      errors.diagnosis_text = true;
    }
    if (
      !diagnosisData.advice_types ||
      diagnosisData.advice_types.length === 0
    ) {
      errors.advice_types = true;
    }
    if (
      !diagnosisData.consultant_doctor ||
      String(diagnosisData.consultant_doctor).trim() === ""
    ) {
      errors.consultant_doctor = true;
    }
    if (
      !diagnosisData.assistance_doctor ||
      String(diagnosisData.assistance_doctor).trim() === ""
    ) {
      errors.assistance_doctor = true;
    }

    const isSurgeryOrMedsSx =
      Array.isArray(diagnosisData.advice_types) &&
      (diagnosisData.advice_types.includes("Surgery") ||
        diagnosisData.advice_types.includes("Meds -> Sx"));

    if (isSurgeryOrMedsSx) {
      if (!diagnosisData.categories || diagnosisData.categories.length === 0) {
        errors.categories = true;
      }
      if (
        !diagnosisData.category_comment ||
        String(diagnosisData.category_comment).trim() === ""
      ) {
        errors.category_comment = true;
      }
    }

    const isInsuranceCompanyRequired =
      Array.isArray(diagnosisData.categories) &&
      (diagnosisData.categories.includes("Cashless") ||
        diagnosisData.categories.includes("Reimbursement"));

    if (
      isInsuranceCompanyRequired &&
      (!diagnosisData.insurance_company_id ||
        String(diagnosisData.insurance_company_id).trim() === "")
    ) {
      errors.insurance_company_id = true;
    }

    if (
      !diagnosisData.video_proctoscopy ||
      String(diagnosisData.video_proctoscopy).trim() === ""
    ) {
      errors.video_proctoscopy = true;
    }

    if (
      diagnosisData.video_proctoscopy === "No" &&
      (!diagnosisData.video_proctoscopy_reason ||
        String(diagnosisData.video_proctoscopy_reason).trim() === "")
    ) {
      errors.video_proctoscopy_reason = true;
    }

    if (!hasData || Object.keys(errors).length > 0) {
      if (!hasData) {
        errors.diagnosis_text = true;
        errors.advice_types = true;
        errors.consultant_doctor = true;
        errors.assistance_doctor = true;
        errors.speciality_data = true;
        errors.video_proctoscopy = true;
      }
      Toast.fire({
        icon: "warning",
        title:
          "Please fill all mandatory/required fields which are not filled/selected yet",
      });
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/save-diagnosis/${formData.patient_id}?location=${currentLocation}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            location: currentLocation,
            "x-hms-location": currentLocation,
          },
          body: JSON.stringify({
            ...diagnosisData,
            videoproctoscopy: {
              done: diagnosisData.video_proctoscopy || "",
              reason: diagnosisData.video_proctoscopy_reason || "",
            },
            speciality_data: Object.fromEntries(
              Object.entries(diagnosisData.speciality_data || {}).filter(
                ([_, v]) =>
                  Array.isArray(v)
                    ? v.length > 0
                    : v && String(v).trim() !== "",
              ),
            ),
          }),
        },
      );
      const data = await response.json();
      if (data.statusCode === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Diagnosis saved successfully!",
          timer: 1500,
          timerProgressBar: true,
        });
        await new Promise((resolve) => setTimeout(resolve, 800));
        const updatedDiagList = await fetchDiagnosisDates();
        const saveDate = diagnosisData.date_diagnosis;
        if (saveDate) {
          try {
            const res = await fetch(
              `${BASE_URL}/V1/doctor/get-diagnosis/${formData.patient_id}?date=${saveDate}&location=${currentLocation}`,
              {
                headers: {
                  location: currentLocation,
                  "x-hms-location": currentLocation,
                },
              },
            );
            const result = await res.json();
            if (result.statusCode === 200 && result.data) {
              setDiagnosisData(result.data);
              const formattedDateString = moment(saveDate, "YYYY-MM-DD").format(
                "DD-MM-YYYY",
              );
              setSelectedDiagnosisId(formattedDateString);
            }
          } catch (e) {
            console.error("Error reloading saved diagnosis:", e);
          }
        }
        handlePrintDiagnosis(updatedDiagList);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to save diagnosis",
        });
      }
      setIsEditingDiagnosis(false);
    } catch (error) {
      console.error("Error saving diagnosis:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving diagnosis.",
      });
    } finally {
      setLoading(false);
    }
  };

  const diagPrintRef = useRef();
  const triggerPrintDiagnosis = useReactToPrint({
    contentRef: diagPrintRef,
  });

  const fupPrintRef = useRef();
  const triggerPrintFollowUp = useReactToPrint({
    contentRef: fupPrintRef,
  });

  const dischargePrintRef = useRef();
  const triggerPrintDischarge = useReactToPrint({
    contentRef: dischargePrintRef,
  });

  const opdPrescriptionPrintRef = useRef();
  const opdPrescriptionDatesRef = useRef(null);
  const triggerPrintOpdPrescription = useReactToPrint({
    contentRef: opdPrescriptionPrintRef,
  });

  const handlePrintOpdPrescription = async () => {
    setPrescriptionForPrint(prescriptionData);
    // PRINT-ONLY snapshot of vitals ΓÇö must never write into historyData (the form),
    // so a fresh entry always stays blank.
    if (historyData && historyData.height_feet) {
      setHistoryForPrint(historyData); // form already has a loaded record ΓåÆ print that
    } else if (previousHistoryList.length > 0) {
      setLoading(true);
      try {
        const latestHistoryId = previousHistoryList[0].id;
        let d = fetchedHistoryCache.current[latestHistoryId];
        if (!d) {
          const response = await fetch(
            `${BASE_URL}/V1/doctor/get-patient-history/${formData.patient_id}?historyId=${latestHistoryId}&location=${currentLocation}`,
            {
              headers: {
                location: currentLocation,
                "x-hms-location": currentLocation,
              },
            },
          );
          const result = await response.json();
          if (result.statusCode === 200 && result.data) {
            d = result.data;
            fetchedHistoryCache.current[latestHistoryId] = d;
          }
        }
        if (d) {
          setHistoryForPrint({
            ...initialHistoryState,
            ...d,
            vital_bp: d.BP || "",
            vital_pulse: d.Pulse || "",
            vital_rr: d.RR || "",
            height_feet: d.height || "",
            weight_kg: d.weight || "",
            rs: d.RS || "",
            cvs: d.CVS || "",
            cns: d.CNS || "",
            "p/a": d.PA || "",
          });
        }
      } catch (error) {
        console.error("Error fetching latest history for print:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setHistoryForPrint(initialHistoryState);
    }
    setShowOpdPrintModal(true);
  };

  const handlePrintFollowUp = async (updatedList = null) => {
    const diagnosisListToUse = Array.isArray(updatedList)
      ? updatedList
      : previousDiagnosisList;
    try {
      const historyResults = await Promise.all(
        previousHistoryList.map(async (h) => {
          if (fetchedHistoryCache.current[h.id])
            return fetchedHistoryCache.current[h.id];
          const response = await fetch(
            `${BASE_URL}/V1/doctor/get-patient-history/${formData.patient_id}?historyId=${h.id}&location=${currentLocation}`,
            {
              headers: {
                location: currentLocation,
                "x-hms-location": currentLocation,
              },
            },
          );
          const result = await response.json();
          if (result.statusCode === 200 && result.data) {
            fetchedHistoryCache.current[h.id] = result.data;
            return result.data;
          }
          return null;
        }),
      );

      const diagnosisResults = await Promise.all(
        diagnosisListToUse.map(async (d) => {
          const apiDate = moment(d.date, "DD-MM-YYYY").format("YYYY-MM-DD");
          if (fetchedDiagnosisCache.current[apiDate])
            return fetchedDiagnosisCache.current[apiDate];
          const response = await fetch(
            `${BASE_URL}/V1/doctor/get-diagnosis/${formData.patient_id}?date=${apiDate}&location=${currentLocation}`,
            {
              headers: {
                location: currentLocation,
                "x-hms-location": currentLocation,
              },
            },
          );
          const result = await response.json();
          if (result.statusCode === 200 && result.data) {
            const diag = result.data;
            const assistDoc = assistanceDoctors.find(
              (doc) => doc.doctor_id == diag.assistance_doctor,
            );
            const consultDoc = doctors.find(
              (doc) => doc.doctor_id == diag.consultant_doctor,
            );
            const enrichedDiag = {
              ...diag,
              assistanceDoctorName: assistDoc
                ? assistDoc.name
                : diag.assistance_doctor,
              consultantDoctorName: consultDoc
                ? consultDoc.name
                : diag.consultant_doctor,
            };
            fetchedDiagnosisCache.current[apiDate] = enrichedDiag;
            return enrichedDiag;
          }
          return null;
        }),
      );

      setAllHistoryDataForPrint(historyResults.filter(Boolean));
      setAllDiagnosisDataForPrint(diagnosisResults.filter(Boolean));
      setShowFollowUpPrintModal(true);
    } catch (error) {
      console.error("Error loading data for follow-up print:", error);
      toast.error("Could not load history for printing.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintDiagnosis = async (updatedList = null) => {
    setLoading(true);
    const diagnosisListToUse = Array.isArray(updatedList)
      ? updatedList
      : previousDiagnosisList;
    try {
      const historyResults = await Promise.all(
        previousHistoryList.map(async (h) => {
          if (fetchedHistoryCache.current[h.id])
            return fetchedHistoryCache.current[h.id];
          const response = await fetch(
            `${BASE_URL}/V1/doctor/get-patient-history/${formData.patient_id}?historyId=${h.id}&location=${currentLocation}`,
            {
              headers: {
                location: currentLocation,
                "x-hms-location": currentLocation,
              },
            },
          );
          const result = await response.json();
          if (result.statusCode === 200 && result.data) {
            fetchedHistoryCache.current[h.id] = result.data;
            return result.data;
          }
          return null;
        }),
      );

      const diagnosisResults = await Promise.all(
        diagnosisListToUse.map(async (d) => {
          const apiDate = moment(d.date, "DD-MM-YYYY").format("YYYY-MM-DD");
          if (fetchedDiagnosisCache.current[apiDate])
            return fetchedDiagnosisCache.current[apiDate];
          const response = await fetch(
            `${BASE_URL}/V1/doctor/get-diagnosis/${formData.patient_id}?date=${apiDate}&location=${currentLocation}`,
            {
              headers: {
                location: currentLocation,
                "x-hms-location": currentLocation,
              },
            },
          );
          const result = await response.json();
          if (result.statusCode === 200 && result.data) {
            fetchedDiagnosisCache.current[apiDate] = result.data;
            return result.data;
          }
          return null;
        }),
      );

      setAllHistoryDataForPrint(historyResults.filter(Boolean));
      setAllDiagnosisDataForPrint(diagnosisResults.filter(Boolean));
      setShowDiagnosisPrintModal(true);
    } catch (error) {
      console.error("Error loading data for print:", error);
      toast.error("Could not load data for printing.");
    } finally {
      setLoading(false);
    }
  };

  const [followUpData, setFollowUpData] = useState({
    diagnosis: "",
    advice: "",
    plan: "",
    present_complaints: "",
    ongoing_medicines: "",
    first_visit_date: "",
    visit_count: "0",
  });

  const fetchFollowUpDetails = async () => {
    if (!formData.patient_id) return;
    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/get-followup-details/${formData.patient_id}?location=${currentLocation}`,
        {
          headers: {
            location: currentLocation,
            "x-hms-location": currentLocation,
          },
        },
      );
      const result = await response.json();
      if (result.statusCode === 200) {
        const fallbackDate = formData.date
          ? formData.date.includes("-") &&
            formData.date.split("-")[0].length === 4
            ? formData.date
            : moment(formData.date, "DD-MM-YYYY").format("YYYY-MM-DD")
          : "";
        setFollowUpData({
          ...result.data,
          first_visit_date: result.data.first_visit_date || fallbackDate || "",
        });
      }
    } catch (error) {
      console.error("Error fetching follow-up details:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "follow-up") {
      fetchFollowUpDetails();
    }
    if (activeTab === "proctoscopy") {
      fetchProctoscopyDates();
    }
    if (activeTab === "surgery-details") {
      fetchSurgeryDates();
    }
  }, [activeTab]);

  const initialOtherTestsState = {
    lab_type: "",
    test_date: new Date().toISOString().split("T")[0],
    test_type: [],
    refDoctor: "",
    testFeeStatus: "",
    visitType: "OPD",
    test_comment: "",
  };

  const [otherTestData, setOtherTestData] = useState(initialOtherTestsState);
  const [previousTestsList, setPreviousTestsList] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState(null);

  const fetchOtherTestDates = async () => {
    if (!formData.patient_id) return;
    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/list-other-test-dates/${formData.patient_id}?location=${currentLocation}`,
        {
          headers: {
            location: currentLocation,
            "x-hms-location": currentLocation,
          },
        },
      );
      const result = await response.json();
      if (result.statusCode === 200) {
        const formattedList = (result.data || []).map((item) => ({
          ...item,
          id: item.id.toString(),
          date: moment(item.date).format("DD-MM-YYYY"),
        }));
        setPreviousTestsList(formattedList);
      }
    } catch (error) {
      console.error("Error fetching other test dates:", error);
    }
  };

  const handleSaveOtherTest = async () => {
    if (!otherTestData.lab_type || otherTestData.test_type.length === 0) {
      toast.error("Please select lab and test types");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/save-other-test/${formData.patient_id}?location=${currentLocation}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            location: currentLocation,
            "x-hms-location": currentLocation,
          },
          body: JSON.stringify(otherTestData),
        },
      );
      const data = await response.json();
      if (data.statusCode === 200 || data.statusCode === 201) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: data.message || "Other tests saved successfully!",
          timer: 3000,
          timerProgressBar: true,
        });
        fetchOtherTestDates();
        setOtherTestData(initialOtherTestsState);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to save other tests",
        });
      }
    } catch (error) {
      console.error("Error saving other tests:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving other tests.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTest = async (id) => {
    setSelectedTestId(id);
    const selected = previousTestsList.find((t) => t.id === id);
    if (!selected) return;

    try {
      setLoading(true);
      const apiDate = moment(selected.date, "DD-MM-YYYY").format("YYYY-MM-DD");
      const response = await fetch(
        `${BASE_URL}/V1/doctor/get-other-test-details/${formData.patient_id}?date=${apiDate}&location=${currentLocation}`,
        {
          headers: {
            location: currentLocation,
            "x-hms-location": currentLocation,
          },
        },
      );
      const result = await response.json();
      if (result.statusCode === 200 && result.data) {
        const d = result.data;
        const toArray = (val) => {
          if (!val) return [];
          if (Array.isArray(val)) return val;
          if (typeof val === "string")
            return val
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
          return [];
        };
        setOtherTestData({
          ...d,
          test_type: toArray(d.test_type),
        });
        toast.success(`Loaded other tests for ${selected.date}`);
      } else {
        toast.error("Could not fetch test details");
      }
    } catch (error) {
      console.error("Error fetching other test details:", error);
      toast.error("An error occurred while loading test details.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewTest = () => {
    setSelectedTestId(null);
    setOtherTestData(initialOtherTestsState);
    toast.info("Started a new lab request");
  };

  const initialProctoscopyState = {
    procto_date: new Date().toISOString().split("T")[0],
    url: "",
  };

  const [proctoscopyData, setProctoscopyData] = useState(
    initialProctoscopyState,
  );
  const [previousProctoscopyList, setPreviousProctoscopyList] = useState([]);
  const [selectedProctoscopyId, setSelectedProctoscopyId] = useState(null);

  const fetchProctoscopyDates = async () => {
    if (!formData.patient_id) return;
    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/list-proctoscopy-dates/${formData.patient_id}?location=${currentLocation}`,
        {
          headers: {
            location: currentLocation,
            "x-hms-location": currentLocation,
          },
        },
      );
      const result = await response.json();
      if (result.statusCode === 200) {
        const formattedList = (result.data || []).map((item) => {
          let displayDate = item.date;
          if (item.date && item.date.includes("-")) {
            const parts = item.date.split("-");
            if (parts[0].length === 4) {
              const [year, month, day] = parts;
              displayDate = `${day}-${month}-${year}`;
            }
          }
          return {
            ...item,
            id: item.id.toString(),
            date: displayDate,
          };
        });
        setPreviousProctoscopyList(formattedList);
      }
    } catch (error) {
      console.error("Error fetching proctoscopy dates:", error);
    }
  };

  const handleSelectProctoscopy = async (id) => {
    setSelectedProctoscopyId(id);
    const selected = previousProctoscopyList.find((p) => p.id === id);
    if (!selected) return;

    try {
      setLoading(true);
      const apiDate = moment(selected.date, "DD-MM-YYYY").format("YYYY-MM-DD");
      const response = await fetch(
        `${BASE_URL}/V1/doctor/get-proctoscopy/${formData.patient_id}?date=${apiDate}&location=${currentLocation}`,
        {
          headers: {
            location: currentLocation,
            "x-hms-location": currentLocation,
          },
        },
      );
      const result = await response.json();
      if (result.statusCode === 200 && result.data) {
        setProctoscopyData(result.data);
        toast.success(`Loaded proctoscopy for ${selected.date}`);
      } else {
        toast.error("Could not fetch proctoscopy details");
      }
    } catch (error) {
      console.error("Error fetching proctoscopy details:", error);
      toast.error("An error occurred while loading proctoscopy details.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshProctoscopy = async () => {
    if (!formData.patient_id) return;
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/V1/doctor/get-proctoscopy/${formData.patient_id}?date=${proctoscopyData.procto_date}&location=${currentLocation}`,
        {
          headers: {
            location: currentLocation,
            "x-hms-location": currentLocation,
          },
        },
      );
      const result = await response.json();
      if (result.statusCode === 200 && result.data && result.data.url) {
        setProctoscopyData((prev) => ({ ...prev, ...result.data }));
        toast.success("Report found.");
      } else {
        setProctoscopyData((prev) => ({ ...prev, url: "" }));
        toast.info(
          "No report yet for this date. Run the AI tool, then click Refresh.",
        );
      }
    } catch (error) {
      console.error("Error refreshing proctoscopy:", error);
      toast.error("Could not check report status.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewProctoscopy = () => {
    setSelectedProctoscopyId(null);
    setProctoscopyData(initialProctoscopyState);
    toast.info("Started a new proctoscopy report");
  };

  const initialPrescriptionState = {
    prescription_type: "",
    creation_timestamp: new Date().toISOString().split("T")[0],
    allergy: "",
    doctor_id: "",
    surgical_advice: [],
    diagnosis: "",
    advicesx: "",
    admmisionnote: "",
    patient_type: "",
    "next-appo-date": "",
    "next-appo-time": "",
    doctor_comment: "",
    medicines: [],
    // Urology Fields
    udoctor_id: "",
    urodiagnosis: "",
    uroadvice: [],
    preopinvestigation: [],
    medicalchiefcomplaints: "",
    medicalhistory: "",
    medicalpasthistory: "",
    investigation: "",
  };

  const [prescriptionData, setPrescriptionData] = useState(
    initialPrescriptionState,
  );
  const [removedMedicines, setRemovedMedicines] = useState([]);
  const [previousPrescriptionList, setPreviousPrescriptionList] = useState([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState(null);

  const handleSelectPrescription = async (id) => {
    setIsEditingPrescription(false);
    setSelectedPrescriptionId(id);
    setRemovedMedicines([]);
    const selected = previousPrescriptionList.find((pr) => pr.id === id);
    if (selected) {
      try {
        const dateStr = moment(selected.date, "DD-MM-YYYY").format(
          "YYYY-MM-DD",
        );
        const patientId = formData.patient_id || patient?.patient_id;
        const response = await fetch(
          `${BASE_URL}/V1/doctor/get-opd-prescription/${patientId}/${dateStr}?location=${currentLocation}`,
        );
        const result = await response.json();
        if (result.statusCode === 200 && result.data) {
          const d = result.data;
          // Slice to YYYY-MM-DD only ΓÇö avoids moment() timezone shifts on already-formatted strings
          const safeDate = (val) => (val ? String(val).substring(0, 10) : "");

          const toArray = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            if (typeof val === "string")
              return val
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            return [];
          };

          const safeMedicines = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            if (typeof val === "string") {
              try {
                return JSON.parse(val);
              } catch (e) {
                return [];
              }
            }
            return [];
          };

          setPrescriptionData({
            ...initialPrescriptionState,
            ...d,
            creation_timestamp:
              safeDate(d.creation_timestamp) ||
              new Date().toISOString().split("T")[0],
            "next-appo-date": safeDate(d["next-appo-date"]),
            "next-appo-time": d["next-appo-time"] || d.appointment_time || "",
            surgical_advice: toArray(d.surgical_advice),
            uroadvice: toArray(d.uroadvice),
            preopinvestigation: toArray(d.preopinvestigation),
            medicines: safeMedicines(d.medicines),
            no_medicines_prescribed:
              d.no_medicines_prescribed === true ||
              d.no_medicines_prescribed === "true" ||
              d.no_medicines_prescribed === 1 ||
              d.no_medicines_prescribed === "1",
          });
          toast.success(`Loaded prescription for ${selected.date}`);
        }
      } catch (error) {
        console.error("Error fetching prescription details:", error);
        toast.error("Failed to load prescription details");
      }
    }
  };

  const handleNewPrescription = () => {
    setIsEditingPrescription(false);
    setSelectedPrescriptionId(null);
    setPrescriptionData(initialPrescriptionState);
    setRemovedMedicines([]);
    toast.info("Started a new prescription");
  };

  const [currentMedicine, setCurrentMedicine] = useState({
    name: "",
    qty: "",
    times: [],
    days: "",
    dosage_frequency: "",
  });

  const initialSurgeryState = {
    admission_date: new Date().toISOString().split("T")[0],
    surgery_date: new Date().toISOString().split("T")[0],
    risk_consent: "No",
    assistance_doctor: "",
    anaesthetist: "",
    anesthesia: [],
    anesthesia_other: "",
    surgery_remarks: "",
    plan: "",
    surgery_note: "",
    additional_comment: "",
  };

  const [surgeryData, setSurgeryData] = useState(initialSurgeryState);
  const [previousSurgeryList, setPreviousSurgeryList] = useState([]);
  const [selectedSurgeryId, setSelectedSurgeryId] = useState(null);

  const fetchSurgeryDates = async () => {
    if (!formData.patient_id) return;
    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/list-surgery-dates/${formData.patient_id}?location=${currentLocation}`,
        {
          headers: {
            location: currentLocation,
            "x-hms-location": currentLocation,
          },
        },
      );
      const result = await response.json();
      if (result.statusCode === 200) {
        const formattedList = (result.data || []).map((item) => {
          let displayDate = item.date;
          if (item.date && item.date.includes("-")) {
            const parts = item.date.split("-");
            if (parts[0].length === 4) {
              const [year, month, day] = parts;
              displayDate = `${day}-${month}-${year}`;
            }
          }
          return {
            ...item,
            id: item.id.toString(),
            date: displayDate,
          };
        });
        setPreviousSurgeryList(formattedList);
      }
    } catch (error) {
      console.error("Error fetching surgery dates:", error);
    }
  };

  const handleSelectSurgery = async (id) => {
    if (!id) return;
    const stringId = id.toString();
    setSelectedSurgeryId(stringId);

    const selected = previousSurgeryList.find(
      (s) => s.id.toString() === stringId,
    );
    if (!selected) {
      console.warn(
        "[DEBUG] Could not find selected surgery in list for ID:",
        id,
      );
      return;
    }

    try {
      setLoading(true);
      const apiDate = moment(selected.date, "DD-MM-YYYY").format("YYYY-MM-DD");
      const url = `${BASE_URL}/V1/doctor/get-surgery-details/${formData.patient_id}?date=${apiDate}&location=${currentLocation}`;

      const response = await fetch(url, {
        headers: {
          location: currentLocation,
          "x-hms-location": currentLocation,
        },
      });
      const result = await response.json();

      if (result.statusCode === 200 && result.data) {
        const d = result.data;
        // Merge with initial state to ensure defaults and normalize values
        const normalizedData = {
          ...initialSurgeryState,
          admission_date: d.admission_date || "",
          surgery_date: d.surgery_date || "",
          risk_consent: d.risk_consent || "No",
          assistance_doctor: d.assistance_doctor?.toString() || "",
          anaesthetist: d.anaesthetist?.toString() || "",
          anesthesia: Array.isArray(d.anesthesia) ? d.anesthesia : [],
          anesthesia_other: d.anesthesia_other || "",
          surgery_remarks: d.surgery_remarks || "",
          plan: d.plan || "",
          surgery_note: d.surgery_note || "",
          additional_comment: d.additional_comment || "",
        };

        setSurgeryData(normalizedData);
        toast.success(`Loaded surgery details for ${selected.date}`);
      } else {
        toast.error(result.message || "Could not fetch surgery details");
      }
    } catch (error) {
      console.error("Error fetching surgery details:", error);
      toast.error("An error occurred while loading surgery details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSurgery = async () => {
    const hasData =
      surgeryData.anesthesia?.length > 0 ||
      surgeryData.anesthesia_other?.trim() ||
      surgeryData.surgery_remarks?.trim() ||
      surgeryData.plan?.trim() ||
      surgeryData.surgery_note?.trim() ||
      surgeryData.additional_comment?.trim() ||
      surgeryData.anaesthetist ||
      surgeryData.assistance_doctor;

    if (!hasData) {
      toast.warning("Please fill in surgery details before saving.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/save-surgery-details/${formData.patient_id}?location=${currentLocation}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            location: currentLocation,
            "x-hms-location": currentLocation,
          },
          body: JSON.stringify(surgeryData),
        },
      );
      const data = await response.json();
      if (data.statusCode === 200 || data.statusCode === 201) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: data.message || "Surgery details saved successfully!",
          timer: 3000,
          timerProgressBar: true,
        });
        fetchSurgeryDates();
        setSurgeryData(initialSurgeryState);
        setSelectedSurgeryId(null);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to save surgery details",
        });
      }
    } catch (error) {
      console.error("Error saving surgery details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving surgery details.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewSurgery = () => {
    setSelectedSurgeryId(null);
    setSurgeryData(initialSurgeryState);
    toast.info("Started a new surgery record");
  };

  const initialDischargeState = {
    patient_name: "",
    patient_age: "",
    patient_sex: "",
    discharge_type: "",
    final_dc: false,
    doa: new Date().toISOString().split("T")[0],
    admission_time: "",
    dod: new Date().toISOString().split("T")[0],
    discharge_time: "",
    ipd_no: "",
    spo2: "",
    bp: "",
    pulse: "",
    rr: "",
    temp: "",
    pain_score: "",
    height: "",
    weight: "",
    reason_for_admission: "",
    medical_history: "",
    plan_of_treatment: "",
    allergies: "",
    diagnosis: "",
    surgery_note: "",
    surgery_type: [],
    surgery_date: "",
    investigations: {
      HB: "",
      WBC: "",
      PLT: "",
      BSL: "",
      CREATININE: "",
      BILLIRUBIN: "",
      PSA: "",
      BT: "",
      CT: "",
      PT: "",
      INR: "",
      HIV: "Negative",
      HCV: "",
      HBSAG: "Negative",
    },
    other_investigations: "",
    extra_note: "",
    local_care: "",
    note_advice: "",
    fistula_cases: [],
    balloon_drain: "",
    issue_date: new Date().toISOString().split("T")[0],
    follow_date: "",
    treating_by: "",
    made_by: "",
    checked_by: "",
    consultant_doctor: "",
    assistance_doctor: "",
    assistance_surgeon: "",
    address: "",
    treatment_given: [],
    treatment_on_discharge: [],
  };

  const [dischargeData, setDischargeData] = useState(initialDischargeState);
  const [previousDischargesList, setPreviousDischargesList] = useState([]);
  const [selectedDischargeId, setSelectedDischargeId] = useState(null);
  const [previousPostOpList, setPreviousPostOpList] = useState([]);

  const handleSelectDischarge = async (id) => {
    setSelectedDischargeId(id);
    const patientId = formData.patient_id || patient?.patient_id;
    if (!patientId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/V1/doctor/get-discharge-card/${patientId}?dischargeId=${id}&location=${currentLocation}`,
        {
          headers: {
            location: currentLocation,
            "x-hms-location": currentLocation,
          },
        },
      );
      const result = await response.json();
      if (result.statusCode === 200 && result.data) {
        setDischargeData(result.data);
        toast.success(
          `Loaded discharge summary for ${moment(result.data.dod).format("DD-MM-YYYY")}`,
        );
      }
    } catch (error) {
      console.error("Error fetching discharge card:", error);
      toast.error("Failed to load discharge card details.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewDischarge = () => {
    setSelectedDischargeId(null);
    setDischargeData({
      ...initialDischargeState,
      patient_name: formData.name,
      patient_age: formData.age,
      patient_sex: formData.sex,
    });
    toast.info("Started a new discharge summary");
  };

  useEffect(() => {
    const fetchPatientDetails = async () => {
      const patientId = state?.patient?.patient_id || patient?.patient_id;
      if (!patientId || hasFetchedPatient) return;

      let resolvedLocation = "default";
      const token = localStorage.getItem("token");
      if (token) {
        const payload = decodeJwt(token);
        if (payload && payload.jobLocation) {
          resolvedLocation = payload.jobLocation;
        }
      }

      try {
        const response = await fetch(
          `${BASE_URL}/V1/patient/getPatient/${patientId}?location=${resolvedLocation}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (response.ok) {
          const resData = await response.json();
          if (resData.statusCode === 200 && resData.data) {
            setPatient(resData.data);
            setHasFetchedPatient(true);
          }
        }
      } catch (error) {
        console.error("Error fetching patient details:", error);
      }
    };

    fetchPatientDetails();
  }, [patient?.patient_id, hasFetchedPatient]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }

    if (patient) {
      const workPatternsArray = (patient.specific_work || "")
        .split(",")
        .map((item) => item.trim());

      const rawPrefix = (patient.prefix || patient.Prefix || "").trim();
      const prefixOptions = ["MR", "MRS", "MASTER", "MISS"];
      let finalPrefix = rawPrefix.toUpperCase().replace(/\.$/, "");
      if (finalPrefix === "M/S") finalPrefix = "MISS"; // Common legacy shorthand

      // Ensure it's one of our standard options or empty
      if (!prefixOptions.includes(finalPrefix)) {
        finalPrefix = "";
      }

      const calculatedCurrentAge = calculateAge(patient.birth_date);
      const effectiveAge = (calculatedCurrentAge !== "" && calculatedCurrentAge !== null && calculatedCurrentAge !== undefined && !isNaN(calculatedCurrentAge))
        ? String(calculatedCurrentAge)
        : (patient.age ? String(patient.age) : "");

      setFormData({
        Uid_no: patient.Uid_no || patient.uid || "",
        date: patient.date || "",
        prefix: finalPrefix,
        name: patient.name || "",
        patient_type: patient.patient_type ? 1 : 0,
        email: patient.email || "",
        address: patient.address || "",
        sex: patient.sex || "",
        phone: patient.phone || "",
        mobile_2: patient.mobile_2 || "",
        pincode: patient.pincode || "",
        blood_group: patient.blood_group || "",
        identity: patient.identity || "",
        identityNumber: patient.identityNumber || "",
        birth_date: patient.birth_date || "",
        age: effectiveAge,
        occupation: patient.occupation || "",
        companyname: patient.companyname || "",
        reference_type: patient.reference_type || "",
        ref: patient.ref || "",
        specific_work: patient.specific_work || "",
        patient_id: patient.patient_id || "",
        ref_doctor_name: patient.ref_doctor_name || "",
        ref_doctor_phone: patient.ref_doctor_phone || "",
        nationality:
          patient.additional_info?.nationality || patient.nationality || "",
        language: patient.additional_info?.language || patient.language || "",
      });

      setDischargeData((prev) => ({
        ...prev,
        patient_name: patient.name || "",
        patient_age: effectiveAge,
        patient_sex: patient.sex || "",
        address: patient.address || "",
      }));

      fetchHistoryDates();
      fetchDiagnosisDates();
      fetchOtherTestDates();
      fetchPrescriptionDates();
      fetchSurgeryDates();
      fetchDischargeDates();
      fetchProctoscopyDates();
      fetchFollowUpDetails();
      fetchPostOpHistory();
    }
  }, [patient, formData.patient_id, currentLocation]);

  const fetchDischargeDates = async () => {
    const patientId = formData.patient_id || patient?.patient_id;
    if (!patientId || !currentLocation || currentLocation === "default") return;

    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/list-discharge-dates/${patientId}?location=${currentLocation}`,
      );
      if (!response.ok) return;
      const data = await response.json();
      if (data.statusCode === 200) {
        setPreviousDischargesList(
          data.data.map((item) => {
            let displayDate = item.date;
            if (item.date && item.date.includes("-")) {
              const parts = item.date.split("-");
              if (parts[0].length === 4) {
                const [year, month, day] = parts;
                displayDate = `${day}-${month}-${year}`;
              }
            }
            return {
              id: item.id,
              date: displayDate,
            };
          }),
        );
      }
    } catch (error) {
      console.error("Error fetching discharge dates:", error);
    }
  };

  const fetchPostOpHistory = async () => {
    const patientId = formData.patient_id || patient?.patient_id;
    if (!patientId || !currentLocation || currentLocation === "default") return [];

    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/list-post-op-history/${patientId}?location=${encodeURIComponent(currentLocation)}`,
        {
          headers: {
            location: currentLocation,
            "x-hms-location": currentLocation,
          },
        }
      );
      if (!response.ok) return [];
      const data = await response.json();
      if (data.statusCode === 200 && Array.isArray(data.data)) {
        setPreviousPostOpList(data.data);
        return data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching post-op history:", error);
      return [];
    }
  };

  const handleSaveDischarge = async () => {
    const patientId = formData.patient_id || patient?.patient_id;
    if (!patientId) {
      toast.error("Patient ID not found.");
      return;
    }

    const errors = {};
    if (
      !dischargeData.discharge_type ||
      String(dischargeData.discharge_type).trim() === ""
    ) {
      errors.discharge_type = true;
    }
    if (
      !dischargeData.surgery_type ||
      (Array.isArray(dischargeData.surgery_type) &&
        dischargeData.surgery_type.length === 0) ||
      (!Array.isArray(dischargeData.surgery_type) &&
        String(dischargeData.surgery_type).trim() === "")
    ) {
      errors.surgery_type = true;
    }

    if (Object.keys(errors).length > 0) {
      Toast.fire({
        icon: "warning",
        title:
          "Please fill all mandatory/required fields which are not filled/selected yet",
      });
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    try {
      setLoading(true);
      const payload = {
        ...dischargeData,
        treatment_given: JSON.parse(
          JSON.stringify(dischargeData.treatment_given || []),
        ),
        treatment_on_discharge: JSON.parse(
          JSON.stringify(dischargeData.treatment_on_discharge || []),
        ),
      };

      const response = await fetch(
        `${BASE_URL}/V1/doctor/save-discharge-card/${patientId}?location=${currentLocation}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            location: currentLocation,
            "x-hms-location": currentLocation,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();
      if (data.statusCode === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Discharge card saved successfully!",
          timer: 1500,
          timerProgressBar: true,
        });
        await new Promise((resolve) => setTimeout(resolve, 800));
        const updatedList = await fetchDischargeDates();
        const saveDate = dischargeData.dod;
        if (saveDate) {
          try {
            const res = await fetch(
              `${BASE_URL}/V1/doctor/get-discharge-card/${patientId}?date=${saveDate}&location=${currentLocation}`,
              {
                headers: {
                  location: currentLocation,
                  "x-hms-location": currentLocation,
                },
              },
            );
            const result = await res.json();
            if (result.statusCode === 200 && result.data) {
              setDischargeData(result.data);
              // Select the saved record in the list
              const savedRecord = updatedList.find((r) => r.date === saveDate);
              if (savedRecord) {
                setSelectedDischargeId(savedRecord.id);
              }
            }
          } catch (e) {
            console.error("Error reloading saved discharge card:", e);
          }
        }
        handlePrintDischarge(updatedList);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to save discharge card",
        });
      }
    } catch (error) {
      console.error("Error saving discharge card:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving discharge card.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrintDischarge = async () => {
    if (historyData && historyData.height_feet) {
      setHistoryForPrint(historyData);
    } else if (previousHistoryList.length > 0) {
      setLoading(true);
      try {
        const latestHistoryId = previousHistoryList[0].id;
        let d = fetchedHistoryCache.current[latestHistoryId];
        if (!d) {
          const response = await fetch(
            `${BASE_URL}/V1/doctor/get-patient-history/${formData.patient_id}?historyId=${latestHistoryId}&location=${currentLocation}`,
            {
              headers: {
                location: currentLocation,
                "x-hms-location": currentLocation,
              },
            },
          );
          const result = await response.json();
          if (result.statusCode === 200 && result.data) {
            d = result.data;
            fetchedHistoryCache.current[latestHistoryId] = d;
          }
        }
        if (d) {
          setHistoryForPrint({
            ...initialHistoryState,
            ...d,
            vital_bp: d.BP || "",
            vital_pulse: d.Pulse || "",
            vital_rr: d.RR || "",
            height_feet: d.height || "",
            weight_kg: d.weight || "",
            rs: d.RS || "",
            cvs: d.CVS || "",
            cns: d.CNS || "",
            "p/a": d.PA || "",
          });
        }
      } catch (error) {
        console.error("Error fetching latest history for print:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setHistoryForPrint(initialHistoryState);
    }
    setShowDischargePrintModal(true);
  };

  const fetchPrescriptionDates = async () => {
    const patientId = formData.patient_id || patient?.patient_id;
    if (!patientId || !currentLocation || currentLocation === "default") return;

    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/list-opd-prescription-dates/${patientId}?location=${currentLocation}`,
      );
      if (!response.ok) return;
      const data = await response.json();
      if (data.statusCode === 200) {
        const mappedData = data.data.map((item) => {
          let displayDate = item.date;
          if (item.date && item.date.includes("-")) {
            const parts = item.date.split("-");
            if (parts[0].length === 4) {
              const [year, month, day] = parts;
              displayDate = `${day}-${month}-${year}`;
            }
          }
          return {
            id: item.id,
            date: displayDate,
          };
        });
        setPreviousPrescriptionList(mappedData);
        opdPrescriptionDatesRef.current = mappedData;
        return mappedData;
      }
    } catch (error) {
      console.error("Error fetching prescription dates:", error);
    }
  };

  const parseDate = (dateString) => {
    if (!dateString) return null;
    try {
      if (dateString instanceof Date) {
        return isNaN(dateString.getTime()) ? null : dateString;
      }
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split("/");
        const date = new Date(year, month - 1, day);
        return isNaN(date.getTime()) ? null : date;
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
      }
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split("-");
        const date = new Date(year, month - 1, day);
        return isNaN(date.getTime()) ? null : date;
      }
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      console.error("Error parsing date:", error);
      return null;
    }
  };

  useEffect(() => {
    setDischargeData((prev) => ({
      ...prev,
      patient_name: formData.name || "",
      patient_age: formData.age || "",
      patient_sex: formData.sex || "",
    }));
  }, [formData.name, formData.age, formData.sex]);

  const [assistanceDoctors, setAssistanceDoctors] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [anaesthetists, setAnaesthetists] = useState([]);
  const [fistulaCases, setFistulaCases] = useState([]);

  useEffect(() => {
    const fetchAssistanceDoctors = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/V1/doctor/assistanceDoctorDropdown?location=${currentLocation}`,
        );
        const result = await response.json();
        if (result.statusCode === 200) {
          setAssistanceDoctors(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching assistant doctors:", error);
      }
    };

    const fetchDoctors = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/V1/doctor/doctorDropdown?location=${currentLocation}`,
        );
        const result = await response.json();
        if (result.statusCode === 200) {
          setDoctors(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    const fetchFistulaCases = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/V1/doctor/fistulaCasesDropdown?location=${currentLocation}`,
        );
        const result = await response.json();
        if (result.statusCode === 200) {
          setFistulaCases(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching fistula cases:", error);
      }
    };

    const fetchAnaesthetists = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/V1/doctor/anaesthetistDropdown?location=${currentLocation}`,
        );
        const result = await response.json();
        if (result.statusCode === 200) {
          setAnaesthetists(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching anaesthetists:", error);
      }
    };

    if (currentLocation && currentLocation !== "default") {
      fetchAssistanceDoctors();
      fetchDoctors();
      fetchFistulaCases();
      fetchAnaesthetists();
    }
  }, [currentLocation]);

  const handleHistoryChange = (name, value) => {
    setHistoryData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHistoryCheckboxChange = (category, value) => {
    setHistoryData((prev) => {
      const current = prev[category] || [];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const handleInvestigationCommentChange = (investigation, value) => {
    setHistoryData((prev) => ({
      ...prev,
      investigation_notes: {
        ...prev.investigation_notes,
        [investigation]: value,
      },
    }));
  };

  const handleDiagnosisChange = (field, value) => {
    setDiagnosisData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDiagnosisCheckboxChange = (field, value) => {
    setDiagnosisData((prev) => {
      const current = prev[field] || [];
      const isRemoving = current.includes(value);
      let updated = isRemoving
        ? current.filter((item) => item !== value)
        : [...current, value];

      let nextState = { ...prev };

      if (field === "categories") {
        updated = isRemoving ? [] : [value];
      }

      if (field === "advice_types") {
        if (value === "Referred to another doctor" && !isRemoving) {
          updated = ["Referred to another doctor"];
          nextState.diagnosis_comment = "";
          nextState.categories = [];
          nextState.insurance_company_id = "";
          nextState.tpa_id = "";
          nextState.category_comment = "";
        } else if (value === "Meds -> Sx" && !isRemoving) {
          updated = updated.filter(
            (item) => item !== "Medication" && item !== "Surgery",
          );
        } else if (
          (value === "Medication" || value === "Surgery") &&
          !isRemoving
        ) {
          updated = updated.filter((item) => item !== "Meds -> Sx");
        } else if (value === "Test" && isRemoving) {
          nextState.diagnosis_comment = "";
        }
      }

      nextState[field] = updated;
      return nextState;
    });
  };

  const handleSpecialityCheckboxChange = (speciality, value) => {
    setDiagnosisData((prev) => {
      const currentSpecialityData = prev.speciality_data[speciality] || [];
      const isRemoving = currentSpecialityData.includes(value);
      const updatedList = isRemoving
        ? currentSpecialityData.filter((item) => item !== value)
        : [...currentSpecialityData, value];

      return {
        ...prev,
        speciality_data: {
          ...prev.speciality_data,
          [speciality]: updatedList,
        },
      };
    });
  };

  const handleMedicalAdviceNoteChange = (advice, value) => {
    setDiagnosisData((prev) => ({
      ...prev,
      medical_advice_notes: {
        ...prev.medical_advice_notes,
        [advice]: value,
      },
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedHistory = [...historyData.medication_history];
    updatedHistory[index] = { ...updatedHistory[index], [field]: value };
    setHistoryData((prev) => ({ ...prev, medication_history: updatedHistory }));
  };

  const handleAddMedicationRow = () => {
    setHistoryData((prev) => ({
      ...prev,
      medication_history: [
        ...prev.medication_history,
        { medicine: "", indication: "", since: "" },
      ],
    }));
  };

  const handleRemoveMedicationRow = (index) => {
    setHistoryData((prev) => ({
      ...prev,
      medication_history: prev.medication_history.filter((_, i) => i !== index),
    }));
  };

  const handleFollowUpChange = (field, value) => {
    setFollowUpData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveFollowUp = async () => {
    const hasPresentComplaints = followUpData.present_complaints?.trim();

    if (!hasPresentComplaints) {
      setValidationErrors({ present_complaints: true });
      Toast.fire({
        icon: "warning",
        title:
          "Please fill all mandatory/required fields which are not filled/selected yet",
      });
      return;
    }

    setValidationErrors({});

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/save-followup/${formData.patient_id}?location=${currentLocation}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            location: currentLocation,
            "x-hms-location": currentLocation,
          },
          body: JSON.stringify(followUpData),
        },
      );
      const data = await response.json();
      if (data.statusCode === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Follow-up data saved successfully!",
          timer: 1500,
          timerProgressBar: true,
        });
        await new Promise((resolve) => setTimeout(resolve, 800));
        const updatedDiagList = await fetchDiagnosisDates();
        handlePrintFollowUp(updatedDiagList);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to save follow-up",
        });
      }
    } catch (error) {
      console.error("Error saving follow-up:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving follow-up.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtherTestChange = (field, value) => {
    setOtherTestData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOtherTestCheckboxChange = (value) => {
    setOtherTestData((prev) => {
      const current = prev.test_type || [];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, test_type: updated };
    });
  };

  const handleProctoscopyChange = (field, value) => {
    setProctoscopyData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePrescriptionChange = (field, value) => {
    setValidationErrors((prev) => {
      if (prev[field]) {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      }
      return prev;
    });
    setPrescriptionData((prev) => {
      const updated = { ...prev, [field]: value };
      if (
        field === "patient_type" &&
        ["surgery_patient", "nofollowupappointment"].includes(value)
      ) {
        updated["next-appo-date"] = null;
        updated["next-appo-time"] = null;
      }
      return updated;
    });
  };

  const handlePrescriptionCheckboxChange = (field, value) => {
    setPrescriptionData((prev) => {
      const current = prev[field] || [];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleAddMedicine = () => {
    if (!currentMedicine.name) {
      toast.error("Please select a medicine");
      return;
    }
    setPrescriptionData((prev) => ({
      ...prev,
      medicines: [...prev.medicines, { ...currentMedicine }],
    }));
    setCurrentMedicine({
      name: "",
      qty: "",
      times: [],
      days: "",
      medicine_id: null,
      mrp: "0",
      available_qty: 0,
      dosage_frequency: "",
    });
  };

  const handleRemoveMedicine = async (index) => {
    const medToRemove = prescriptionData.medicines[index];
    if (!medToRemove) return;

    if (medToRemove.prescription_id) {
      try {
        const response = await fetch(
          `${BASE_URL}/V1/doctor/delete-prescription-medicine/${medToRemove.prescription_id}?location=${currentLocation}`,
          {
            method: "DELETE",
          },
        );
        const result = await response.json();
        if (result.statusCode === 200) {
          toast.success(`Removed ${medToRemove.name} from database`);
        } else {
          console.error(
            "Failed to delete medicine from backend:",
            result.message,
          );
          toast.error("Failed to delete medicine from database");
        }
      } catch (error) {
        console.error("Error soft-deleting prescription medicine:", error);
        toast.error("Error deleting medicine from database");
      }
    }

    setRemovedMedicines((prev) => [...prev, medToRemove]);

    setPrescriptionData((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const handleSaveOpdPrescription = async () => {
    const patientId = formData.patient_id || patient?.patient_id;
    if (!patientId) {
      toast.error("Patient ID is missing");
      return;
    }

    const errors = {};

    if (
      !prescriptionData.no_medicines_prescribed &&
      (!prescriptionData.medicines || prescriptionData.medicines.length === 0)
    ) {
      errors.medicines = true;
    }

    if (!prescriptionData.no_medicines_prescribed) {
      if (!prescriptionData.prescription_type) {
        errors.prescription_type = true;
      }
      if (!prescriptionData.creation_timestamp) {
        errors.creation_timestamp = true;
      }
      if (prescriptionData.prescription_type === "Urology") {
        if (!prescriptionData.udoctor_id) {
          errors.udoctor_id = true;
        }
      } else {
        if (!prescriptionData.doctor_id) {
          errors.doctor_id = true;
        }
      }
      if (!prescriptionData.patient_type) {
        errors.patient_type = true;
      }
      if (
        prescriptionData.patient_type &&
        prescriptionData.patient_type !== "nofollowupappointment" &&
        prescriptionData.patient_type !== "surgery_patient"
      ) {
        if (!prescriptionData["next-appo-date"]) {
          errors["next-appo-date"] = true;
        }
        if (!prescriptionData["next-appo-time"]) {
          errors["next-appo-time"] = true;
        }
      }
    } else {
      if (
        prescriptionData.patient_type &&
        prescriptionData.patient_type !== "nofollowupappointment" &&
        prescriptionData.patient_type !== "surgery_patient"
      ) {
        if (!prescriptionData["next-appo-date"]) {
          errors["next-appo-date"] = true;
        }
        if (!prescriptionData["next-appo-time"]) {
          errors["next-appo-time"] = true;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      Toast.fire({
        icon: "warning",
        title:
          "Please fill all mandatory/required fields which are not filled/selected yet",
      });
      return;
    }

    setValidationErrors({});

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/save-opd-prescription/${patientId}?location=${currentLocation}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            location: currentLocation,
            "x-hms-location": currentLocation,
          },
          body: JSON.stringify({
            ...prescriptionData,
            mode: isEditingPrescription ? "edit" : "new",
          }),
        },
      );
      const data = await response.json();
      if (data.statusCode === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Prescription saved successfully!",
          timer: 1500,
          timerProgressBar: true,
        });
        await new Promise((resolve) => setTimeout(resolve, 800));
        await fetchPrescriptionDates();

        // Open the print preview for what we just saved (snapshots prescriptionForPrint
        // from the still-current prescriptionData via closure), then clear the card.
        handlePrintOpdPrescription();

        setSelectedPrescriptionId(null);
        setIsEditingPrescription(false);
        setRemovedMedicines([]);
        setPrescriptionData(initialPrescriptionState);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to save prescription",
        });
      }
    } catch (error) {
      console.error("Error saving prescription:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving prescription.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSurgeryChange = (field, value) => {
    setSurgeryData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSurgeryCheckboxChange = (value) => {
    setSurgeryData((prev) => {
      const current = prev.anesthesia || [];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, anesthesia: updated };
    });
  };

  const handleDischargeChange = (field, value) => {
    setDischargeData((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) => {
      if (prev && prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });

    // Auto-populate local care and note/advice when surgery type is selected/deselected
    if (field === "surgery_type" && Array.isArray(value)) {
      const prevSurgeryTypes = dischargeData.surgery_type || [];

      if (value.length === 0) {
        // If all surgery types are deselected, clear the defaults
        setDischargeData((prev) => ({
          ...prev,
          local_care: "",
          note_advice: "",
        }));
      } else {
        const newlyAdded = value.find((v) => !prevSurgeryTypes.includes(v));
        const removed = prevSurgeryTypes.find((v) => !value.includes(v));

        // If a surgery type was added, fetch defaults for it.
        // If one was removed, fetch defaults for the first remaining selected surgery type.
        const targetSurgeryType = newlyAdded || (removed ? value[0] : null);

        if (targetSurgeryType) {
          fetch(
            `${BASE_URL}/V1/doctor/get-surgery-discharge-details?surgeryType=${encodeURIComponent(targetSurgeryType)}&location=${currentLocation}`,
          )
            .then((res) => res.json())
            .then((result) => {
              if (result.statusCode === 200 && result.data) {
                const { local_care, note } = result.data;
                setDischargeData((prev) => ({
                  ...prev,
                  local_care: local_care || "",
                  note_advice: note || "",
                }));
                toast.success(`Loaded defaults for ${targetSurgeryType}`);
              } else {
                // If query succeeded but no defaults found, clear the fields if it was due to a removal
                if (removed) {
                  setDischargeData((prev) => ({
                    ...prev,
                    local_care: "",
                    note_advice: "",
                  }));
                }
              }
            })
            .catch((err) => {
              console.error("Error fetching surgery discharge details:", err);
            });
        }
      }
    }
  };

  const handleDischargeInvestigationChange = (field, value) => {
    setDischargeData((prev) => ({
      ...prev,
      investigations: { ...prev.investigations, [field]: value },
    }));
  };

  if (!patient) {
    return (
      <div
        className="themebody-wrap"
        style={{
          background: "linear-gradient(to right, #e0f7fa, #80deea)",
          minHeight: "100vh",
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col md={6}>
              <Card
                className="mt-5 shadow-lg border-0"
                style={{ borderRadius: "15px" }}
              >
                <Card.Body className="text-center p-5">
                  <FeatherIcon
                    icon="user-x"
                    size="64"
                    className="text-muted mb-4"
                  />
                  <h3
                    className="mb-4"
                    style={{ color: "#00838f", fontWeight: "700" }}
                  >
                    Patient Not Found
                  </h3>
                  <Button
                    variant="info"
                    onClick={() => navigate("/doctor-patients")}
                    style={{
                      backgroundColor: "#00bcd4",
                      color: "white",
                      borderRadius: "30px",
                    }}
                  >
                    Back to Patient List
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  const tabs = [
    { id: "personal", label: "Personal", icon: "user" },
    { id: "patient-history", label: "History", icon: "stethoscope" },
    { id: "diagnosis", label: "Diagnosis", icon: "clipboard" },
    { id: "follow-up", label: "Follow Up", icon: "calendar" },
    { id: "post-op", label: "Post Op", icon: "activity" },
    // { id: "other-tests", label: "Other Tests", icon: "file-text" },
    { id: "proctoscopy", label: "Proctoscopy", icon: "search" },
    { id: "opd-prescription", label: "Prescription", icon: "edit-3" },
    // { id: "surgery-details", label: "Surgery Details", icon: "scissors" },
    { id: "discharge-card", label: "Discharge Card", icon: "log-out" },
  ];

  const renderPersonalInfo = () => (
    <PersonalDetailsCard
      patient={patient}
      setPatient={setPatient}
      formData={formData}
      setFormData={setFormData}
      currentLocation={currentLocation}
      BASE_URL={BASE_URL}
      onSaveSuccess={(updatedPatient) => {
        setPatient(updatedPatient);
      }}
    />
  );

  const isTabCompleted = (tabId) => {
    switch (tabId) {
      case "personal":
        return true;
      case "patient-history":
        return previousHistoryList && previousHistoryList.length > 0;
      case "diagnosis":
        return previousDiagnosisList && previousDiagnosisList.length > 0;
      case "follow-up":
        return (
          followUpData &&
          followUpData.visit_count &&
          followUpData.visit_count !== "0" &&
          followUpData.present_complaints &&
          followUpData.present_complaints.trim() !== ""
        );
      case "post-op":
        return previousPostOpList && previousPostOpList.length > 0;
      case "other-tests":
        return previousTestsList && previousTestsList.length > 0;
      case "proctoscopy":
        return previousProctoscopyList && previousProctoscopyList.length > 0;
      case "opd-prescription":
        return previousPrescriptionList && previousPrescriptionList.length > 0;
      case "surgery-details":
        return previousSurgeryList && previousSurgeryList.length > 0;
      case "discharge-card":
        return previousDischargesList && previousDischargesList.length > 0;
      default:
        return false;
    }
  };

  const isTabAccessible = (tabId) => {
    // Discharge card is the only gated section: it stays locked until every
    // other OPD clinical section has been filled and saved.
    if (tabId === "discharge-card") {
      return (
        isTabCompleted("patient-history") && isTabCompleted("diagnosis")
        // isTabCompleted("follow-up") &&
        // isTabCompleted("proctoscopy") &&
        // isTabCompleted("opd-prescription")
      );
    }
    // Every other section is open for entry in any order.
    return true;
  };

  useEffect(() => {
    if (!formData.patient_id) return;
    // New patient context ΓåÆ wipe every per-record form, selection, and cache.
    setHistoryData(initialHistoryState);
    setDiagnosisData(initialDiagnosisState);
    setPrescriptionData(initialPrescriptionState);
    setProctoscopyData(initialProctoscopyState);
    setDischargeData(initialDischargeState);
    // setOtherTestData(initialOtherTestsState);  // if/when that tab is enabled

    setSelectedHistoryId(null);
    setSelectedDiagnosisId(null);
    setSelectedPrescriptionId(null);
    setSelectedProctoscopyId(null);
    setSelectedDischargeId(null);

    setPreviousPostOpList([]);

    setHistoryForPrint(null);

    fetchedHistoryCache.current = {};
    fetchedDiagnosisCache.current = {};
    fetchedFollowUpCache.current = {};
    fetchedOpdCache.current = {};
    fetchedDischargeCache.current = {};
  }, [formData.patient_id]);

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(135deg, #e0f7fa 0%, #80deea 100%)",
        minHeight: "100vh",
        padding: "10px",
      }}
    >
      <PageBreadcrumb pagename="Patient Medical Records" />
      <div className="theme-body">
        <Container fluid>
          {activeTab === "menu" ? (
            <div className="py-4 px-lg-7 animate__animated animate__fadeIn">
              <Card
                className="border-0 shadow-sm mb-20"
                style={{
                  borderRadius: "12px",
                  background: "#fff",
                  overflow: "hidden",
                }}
              >
                <div
                  className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center"
                  style={{ borderLeft: "5px solid #00bcd4" }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <Button
                      onClick={() => navigate(-1)}
                      className="d-flex align-items-center justify-content-center shadow-sm"
                      style={{
                        borderRadius: "50%",
                        width: "40px",
                        height: "40px",
                        padding: "0",
                        backgroundColor: "#00bcd4",
                        border: "1px solid #00bcd4",
                        color: "#fff",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#0097a7";
                        e.currentTarget.style.transform = "translateX(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#00bcd4";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                      title="Back to Patient List"
                    >
                      <FeatherIcon icon="arrow-left" size="20" />
                    </Button>
                    <div>
                      <h4 className="fw-bold mb-1" style={{ color: "#2c3e50" }}>
                        OPD Patient Medical Records
                      </h4>
                      {formData.name && (
                        <div
                          className="d-flex flex-wrap gap-2 align-items-center"
                          style={{ fontSize: "13px" }}
                        >
                          <span>
                            <strong>UID No:</strong> {formData.Uid_no || "N/A"}
                          </span>
                          <span className="opacity-50">|</span>
                          <span>
                            <strong>Patient Name:</strong>{" "}
                            {formData.prefix ? `${formData.prefix} ` : ""}
                            {formData.name}
                          </span>
                          <span className="opacity-50">|</span>
                          <span>
                            <strong>Contact No:</strong>{" "}
                            {formData.phone || "N/A"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 mt-md-0">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: "#e0f7fa",
                        color: "#00838f",
                        padding: "20px 15px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      {tabs.filter((t) => isTabCompleted(t.id)).length} of{" "}
                      {tabs.length} Sections Completed
                    </span>
                  </div>
                </div>
              </Card>

              <Row className="g-10">
                {tabs.map((tab) => {
                  const completed = isTabCompleted(tab.id);
                  const accessible = isTabAccessible(tab.id);
                  return (
                    <Col sm={6} lg={3} key={tab.id} className="d-flex">
                      <Card
                        className="border-0 shadow-sm transition-all"
                        style={{
                          width: "300px",
                          padding: "5px",
                          borderRadius: "12px",
                          cursor: accessible ? "pointer" : "not-allowed",
                          border: completed
                            ? "1px solid #10b981"
                            : "1px solid #f1f5f9",
                          opacity: accessible ? 1 : 0.6,
                        }}
                        onClick={() => {
                          if (accessible) {
                            setActiveTab(tab.id);
                          } else {
                            toast.warning(
                              "Please complete History and Diagnosis before filling the Discharge Card.",
                            );
                          }
                        }}
                        onMouseEnter={(e) => {
                          if (accessible) {
                            e.currentTarget.style.transform =
                              "translateY(-4px)";
                            e.currentTarget.style.boxShadow =
                              "0 8px 16px rgba(0, 0, 0, 0.08)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (accessible) {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 2px 6px rgba(0, 0, 0, 0.04)";
                          }
                        }}
                      >
                        <Card.Body className="p-3 d-flex align-items-center">
                          <div
                            className="d-flex align-items-center justify-content-center rounded me-3"
                            style={{
                              width: "48px",
                              height: "48px",
                              backgroundColor: completed
                                ? "#f0fdf4"
                                : "#f8fafc",
                              color: completed ? "#10b981" : "#64748b",
                            }}
                          >
                            {tab.icon === "stethoscope" ? (
                              <FaStethoscope size={22} />
                            ) : (
                              <FeatherIcon icon={tab.icon} size={22} />
                            )}
                          </div>
                          <div className="flex-grow-1">
                            <h6
                              className="fw-bold m-0 mb-1"
                              style={{ color: "#334155", fontSize: "14px" }}
                            >
                              {tab.label}
                            </h6>
                            {completed ? (
                              <span
                                style={{
                                  fontSize: "12px",
                                  color: "#10b981",
                                  fontWeight: "600",
                                }}
                              >
                                Filled & Saved
                              </span>
                            ) : (
                              <span
                                style={{ fontSize: "12px", color: "#94a3b8" }}
                              >
                                No Record
                              </span>
                            )}
                          </div>
                          <div className="ms-2">
                            {!accessible ? (
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id={`tooltip-locked-${tab.id}`}>
                                    Fill history and diagnosis forms to be able
                                    to edit discharge card.
                                  </Tooltip>
                                }
                              >
                                <span>
                                  <FeatherIcon
                                    icon="lock"
                                    size="20"
                                    style={{ color: "#ef4444" }}
                                  />
                                </span>
                              </OverlayTrigger>
                            ) : completed ? (
                              <FeatherIcon
                                icon="check-circle"
                                size="20"
                                style={{ color: "#10b981" }}
                              />
                            ) : (
                              <FeatherIcon
                                icon="chevron-right"
                                size="20"
                                style={{ color: "#cbd5e1" }}
                              />
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
          ) : (
            <Card
              className="shadow-lg border-0 mb-4 animate__animated animate__fadeIn"
              style={{
                borderRadius: "20px",
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              <div
                className="p-10 border-bottom d-flex align-items-center justify-content-between position-relative"
                style={{ backgroundColor: "#f8fafd" }}
              >
                <div>
                  <Button
                    className="d-flex align-items-center shadow-sm"
                    style={{
                      borderRadius: "50px",
                      padding: "7px 12px",
                      fontWeight: "700",
                      color: "#ffffffff",
                      backgroundColor: "#fff",
                      border: "1px solid #e0e6ed",
                    }}
                    onClick={() => setActiveTab("menu")}
                  >
                    <FeatherIcon icon="arrow-left" size="18" className="me-2" />{" "}
                    Back
                  </Button>
                </div>

                <div className="position-absolute top-50 start-50 translate-middle d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-2 shadow-sm"
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#00bcd4",
                      color: "#fff",
                    }}
                  >
                    {tabs.find((t) => t.id === activeTab)?.icon === "stethoscope" ? (
                      <FaStethoscope size={22} />
                    ) : (
                      <FeatherIcon
                        icon={tabs.find((t) => t.id === activeTab)?.icon}
                        size="24"
                      />
                    )}
                  </div>
                  <div>
                    <h4 className="fw-bold m-0" style={{ color: "#2c3e50" }}>
                      {tabs.find((t) => t.id === activeTab)?.label}
                    </h4>
                    {formData.name && (
                      <div
                        className="d-flex flex-wrap gap-2 align-items-center text-muted"
                        style={{ fontSize: "12px", marginTop: "2px" }}
                      >
                        <span>
                          <strong>UID:</strong> {formData.Uid_no || "N/A"}
                        </span>
                        <span className="opacity-50">|</span>
                        <span>
                          <strong>Patient:</strong>{" "}
                          {formData.prefix ? `${formData.prefix} ` : ""}
                          {formData.name}
                        </span>
                        <span className="opacity-50">|</span>
                        <span>
                          <strong>Contact:</strong> {formData.phone || "N/A"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {activeTab === "opd-prescription" && (
                    <div
                      className="rounded px-2 py-1 d-flex align-items-center"
                      style={{ border: "1px solid #d32f2f" }}
                    >
                      <Form.Check
                        type="checkbox"
                        id="no-medicines-checkbox-header"
                        label="No medicines prescribed"
                        checked={
                          prescriptionData.no_medicines_prescribed || false
                        }
                        onChange={(e) => {
                          handlePrescriptionChange(
                            "no_medicines_prescribed",
                            e.target.checked,
                          );
                          if (e.target.checked) {
                            handlePrescriptionChange("medicines", []);
                            handlePrescriptionChange(
                              "prescription_type",
                              "OPD_Type",
                            );
                          } else {
                            handlePrescriptionChange("prescription_type", "");
                          }
                        }}
                        className="m-0"
                        style={{
                          fontSize: "14px",
                          fontWeight: "bold",
                          color: "#d32f2f",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <Card.Body className="p-5" style={{ backgroundColor: "#ffffff" }}>
                {activeTab === "personal" && renderPersonalInfo()}
                {activeTab === "patient-history" && (
                  <PatientHistoryCard
                    historyData={historyData}
                    handleHistoryChange={handleHistoryChange}
                    handleHistoryCheckboxChange={handleHistoryCheckboxChange}
                    handleInvestigationCommentChange={
                      handleInvestigationCommentChange
                    }
                    handleMedicationChange={handleMedicationChange}
                    handleAddMedicationRow={handleAddMedicationRow}
                    handleRemoveMedicationRow={handleRemoveMedicationRow}
                    loading={loading}
                    previousHistoryList={previousHistoryList}
                    selectedHistoryId={selectedHistoryId}
                    onSelectHistory={handleSelectHistory}
                    onNewRecord={handleNewRecord}
                    onSaveHistory={handleSaveHistory}
                    assistanceDoctors={assistanceDoctors}
                    uploadBaseUrl={UPLOAD_BASE_URL}
                    isEditing={isEditingHistory}
                    onEditHistory={handleEditHistory}
                    validationErrors={validationErrors}
                  />
                )}
                {activeTab === "diagnosis" && (
                  <DiagnosisCard
                    diagnosisData={diagnosisData}
                    handleDiagnosisChange={handleDiagnosisChange}
                    handleDiagnosisCheckboxChange={
                      handleDiagnosisCheckboxChange
                    }
                    handleSpecialityCheckboxChange={
                      handleSpecialityCheckboxChange
                    }
                    setDiagnosisData={setDiagnosisData}
                    handleMedicalAdviceNoteChange={
                      handleMedicalAdviceNoteChange
                    }
                    loading={loading}
                    previousDiagnosisList={previousDiagnosisList}
                    selectedDiagnosisId={selectedDiagnosisId}
                    onSelectDiagnosis={handleSelectDiagnosis}
                    onNewDiagnosis={handleNewDiagnosis}
                    onSaveDiagnosis={handleSaveDiagnosis}
                    onPrintDiagnosis={handlePrintDiagnosis}
                    doctors={doctors}
                    assistanceDoctors={assistanceDoctors}
                    isEditing={isEditingDiagnosis}
                    onEditDiagnosis={handleEditDiagnosis}
                    validationErrors={validationErrors}
                    patientPhone={formData.phone}
                    patient={formData}
                  />
                )}
                {activeTab === "follow-up" && (
                  <FollowUpCard
                    followUpData={followUpData}
                    formData={formData}
                    handleFollowUpChange={handleFollowUpChange}
                    onSaveFollowUp={handleSaveFollowUp}
                    onPrintFollowUp={handlePrintFollowUp}
                    loading={loading}
                    validationErrors={validationErrors}
                  />
                )}
                {activeTab === "post-op" && (
                  <PostOpCard
                    formData={formData}
                    loading={loading}
                    doctors={doctors}
                    currentLocation={currentLocation}
                    baseUrl={BASE_URL}
                    onSaveSuccess={(list) => {
                      if (Array.isArray(list)) {
                        setPreviousPostOpList(list);
                      } else {
                        fetchPostOpHistory();
                      }
                    }}
                  />
                )}
                {/* {activeTab === "other-tests" && (
                <OtherTestsCard
                  otherTestData={otherTestData}
                  handleOtherTestChange={handleOtherTestChange}
                  handleOtherTestCheckboxChange={handleOtherTestCheckboxChange}
                  previousTestsList={previousTestsList}
                  selectedTestId={selectedTestId}
                  onSelectTest={handleSelectTest}
                  onNewTest={handleNewTest}
                  onSaveTest={handleSaveOtherTest}
                  loading={loading}
                  assistanceDoctors={assistanceDoctors}
                />
              )} */}
                {activeTab === "proctoscopy" && (
                  <ProctoscopyCard
                    proctoscopyData={proctoscopyData}
                    formData={formData}
                    handleProctoscopyChange={handleProctoscopyChange}
                    previousProctoscopyList={previousProctoscopyList}
                    selectedProctoscopyId={selectedProctoscopyId}
                    onSelectProctoscopy={handleSelectProctoscopy}
                    onNewProctoscopy={handleNewProctoscopy}
                    onRefreshProctoscopy={handleRefreshProctoscopy}
                    loading={loading}
                    location={currentLocation}
                  />
                )}
                {activeTab === "opd-prescription" && (
                  <OpdPrescriptionCard
                    prescriptionData={prescriptionData}
                    currentMedicine={currentMedicine}
                    setCurrentMedicine={setCurrentMedicine}
                    handleAddMedicine={handleAddMedicine}
                    handleRemoveMedicine={handleRemoveMedicine}
                    handlePrescriptionChange={handlePrescriptionChange}
                    handlePrescriptionCheckboxChange={
                      handlePrescriptionCheckboxChange
                    }
                    previousPrescriptionList={previousPrescriptionList}
                    selectedPrescriptionId={selectedPrescriptionId}
                    onSelectPrescription={handleSelectPrescription}
                    onNewPrescription={handleNewPrescription}
                    onSavePrescription={handleSaveOpdPrescription}
                    onPrintPrescription={handlePrintOpdPrescription}
                    assistanceDoctors={assistanceDoctors}
                    removedMedicines={removedMedicines}
                    location={currentLocation}
                    isEditing={isEditingPrescription}
                    onEditPrescription={handleEditPrescription}
                    loading={loading}
                    validationErrors={validationErrors}
                  />
                )}
                {activeTab === "discharge-card" && (
                  <DischargeCard
                    dischargeData={dischargeData}
                    doctors={doctors}
                    assistanceDoctors={assistanceDoctors}
                    fistulaCases={fistulaCases}
                    handleDischargeChange={handleDischargeChange}
                    handleDischargeInvestigationChange={
                      handleDischargeInvestigationChange
                    }
                    previousDischargesList={previousDischargesList}
                    selectedDischargeId={selectedDischargeId}
                    onSelectDischarge={handleSelectDischarge}
                    onNewDischarge={handleNewDischarge}
                    onSaveDischarge={handleSaveDischarge}
                    onPrintDischarge={handlePrintDischarge}
                    loading={loading}
                    location={currentLocation}
                    validationErrors={validationErrors}
                  />
                )}
                {/* {activeTab === "surgery-details" && (
                <SurgeryDetailsCard
                  surgeryData={surgeryData}
                  handleSurgeryChange={handleSurgeryChange}
                  handleSurgeryCheckboxChange={handleSurgeryCheckboxChange}
                  previousSurgeryList={previousSurgeryList}
                  selectedSurgeryId={selectedSurgeryId}
                  onSelectSurgery={handleSelectSurgery}
                  onNewSurgery={handleNewSurgery}
                  onSaveSurgery={handleSaveSurgery}
                  loading={loading}
                  assistanceDoctors={assistanceDoctors}
                  anaesthetists={anaesthetists}
                />
 
              )} */}
                {![
                  "personal",
                  "patient-history",
                  "diagnosis",
                  "follow-up",
                  "post-op",
                  "other-tests",
                  "proctoscopy",
                  "opd-prescription",
                  "surgery-details",
                  "discharge-card",
                ].includes(activeTab) && (
                    <div className="text-center py-5 animate__animated animate__fadeIn">
                      <div
                        className="d-inline-flex p-4 rounded-circle mb-4"
                        style={{ backgroundColor: "#f0f4f8" }}
                      >
                        <FeatherIcon
                          icon="clock"
                          size="48"
                          className="text-muted"
                        />
                      </div>
                      <h4 className="text-muted fw-bold">Coming Soon</h4>
                      <p className="text-muted">
                        The {tabs.find((t) => t.id === activeTab).label} section
                        is under development.
                      </p>
                    </div>
                  )}
              </Card.Body>
            </Card>
          )}
        </Container>
      </div>

      <style>{`
        .custom-navbar::-webkit-scrollbar { height: 6px; }
        .custom-navbar::-webkit-scrollbar-thumb { background: #b2ebf2; border-radius: 10px; }
        .animate__animated { animation-duration: 0.5s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate__fadeIn { animation-name: fadeIn; }
      `}</style>
      <div style={{ display: "none" }}></div>

      <Modal
        show={showDiagnosisPrintModal}
        onHide={() => setShowDiagnosisPrintModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton className="bg-info text-white">
          <Modal.Title className="fw-bold">
            <FeatherIcon icon="printer" className="me-2" />
            Diagnosis Card Preview
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="p-0 bg-light"
          style={{ maxHeight: "80vh", overflowY: "auto" }}
        >
          <div
            className="p-4 bg-white shadow-sm mx-auto"
            style={{ width: "210mm", minHeight: "297mm" }}
          >
            <DiagnosisPrintView
              ref={diagPrintRef}
              patient={formData}
              historyList={allHistoryDataForPrint}
              diagnosisList={allDiagnosisDataForPrint}
              selectedDiagnosisId={selectedDiagnosisId}
              onPrint={triggerPrintDiagnosis}
              doctors={doctors}
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-white border-top shadow-sm justify-content-center">
          <Button
            variant="secondary"
            onClick={() => setShowDiagnosisPrintModal(false)}
            style={{
              borderRadius: "20px",
              padding: "8px 30px",
              fontWeight: "bold",
            }}
          >
            CANCEL
          </Button>
          <Button
            variant="info"
            className="text-white"
            onClick={() => {
              triggerPrintDiagnosis();
            }}
            style={{
              borderRadius: "20px",
              padding: "8px 50px",
              fontWeight: "bold",
            }}
          >
            <FeatherIcon icon="printer" size="18" className="me-2" />
            PRINT DIAGNOSIS CARD
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDischargePrintModal}
        onHide={() => setShowDischargePrintModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton className="bg-info text-white">
          <Modal.Title className="fw-bold">
            <FeatherIcon icon="printer" className="me-2" />
            Discharge Card Preview
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="p-0 bg-light"
          style={{ maxHeight: "80vh", overflowY: "auto" }}
        >
          <div
            className="p-4 bg-white shadow-sm mx-auto"
            style={{ width: "210mm", minHeight: "297mm" }}
          >
            <DischargePrintView
              ref={dischargePrintRef}
              dischargeData={dischargeData}
              formData={formData}
              doctors={doctors}
              assistanceDoctors={assistanceDoctors}
              location={currentLocation}
              historyData={historyForPrint}
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-white border-top shadow-sm justify-content-center">
          <Button
            variant="secondary"
            onClick={() => setShowDischargePrintModal(false)}
            style={{
              borderRadius: "20px",
              padding: "8px 30px",
              fontWeight: "bold",
            }}
          >
            CANCEL
          </Button>
          <Button
            variant="info"
            className="text-white"
            onClick={() => {
              triggerPrintDischarge();
              // setShowDischargePrintModal(false);
            }}
            style={{
              borderRadius: "20px",
              padding: "8px 50px",
              fontWeight: "bold",
            }}
          >
            <FeatherIcon icon="printer" size="18" className="me-2" />
            PRINT DISCHARGE CARD
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showFollowUpPrintModal}
        onHide={() => setShowFollowUpPrintModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton className="bg-info text-white">
          <Modal.Title className="fw-bold">
            <FeatherIcon icon="printer" className="me-2" />
            Follow Up Card Preview
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="p-0 bg-light"
          style={{ maxHeight: "80vh", overflowY: "auto" }}
        >
          <div
            className="p-4 bg-white shadow-sm mx-auto"
            style={{ width: "210mm", minHeight: "297mm" }}
          >
            <FollowUpPrintView
              ref={fupPrintRef}
              patient={formData}
              followUpData={followUpData}
              historyList={allHistoryDataForPrint}
              diagnosisList={allDiagnosisDataForPrint}
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-white border-top shadow-sm justify-content-center">
          <Button
            variant="secondary"
            onClick={() => setShowFollowUpPrintModal(false)}
            style={{
              borderRadius: "20px",
              padding: "8px 30px",
              fontWeight: "bold",
            }}
          >
            CANCEL
          </Button>
          <Button
            variant="info"
            className="text-white"
            onClick={() => {
              triggerPrintFollowUp();
            }}
            style={{
              borderRadius: "20px",
              padding: "8px 50px",
              fontWeight: "bold",
            }}
          >
            <FeatherIcon icon="printer" size="18" className="me-2" />
            PRINT FOLLOW UP CARD
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showOpdPrintModal}
        onHide={() => setShowOpdPrintModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton className="bg-info text-white">
          <Modal.Title className="fw-bold">
            <FeatherIcon icon="printer" className="me-2" />
            OPD Prescription Preview
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="p-0 bg-light"
          style={{ maxHeight: "80vh", overflowY: "auto" }}
        >
          <div
            className="p-4 bg-white shadow-sm mx-auto"
            style={{ width: "210mm", minHeight: "297mm" }}
          >
            <OpdPrescriptionPrintView
              ref={opdPrescriptionPrintRef}
              prescriptionData={prescriptionForPrint}
              formData={formData}
              historyData={historyForPrint}
              doctors={doctors}
              assistanceDoctors={assistanceDoctors}
              location={currentLocation}
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-white border-top shadow-sm justify-content-center">
          <Button
            variant="secondary"
            onClick={() => setShowOpdPrintModal(false)}
            style={{
              borderRadius: "20px",
              padding: "8px 30px",
              fontWeight: "bold",
            }}
          >
            CANCEL
          </Button>
          <Button
            variant="info"
            className="text-white"
            onClick={() => {
              triggerPrintOpdPrescription();
            }}
            style={{
              borderRadius: "20px",
              padding: "8px 50px",
              fontWeight: "bold",
            }}
          >
            <FeatherIcon icon="printer" size="18" className="me-2" />
            PRINT OPD PRESCRIPTION
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OpdPatientMedicalRecords;
