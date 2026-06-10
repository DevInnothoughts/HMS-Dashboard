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
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import PatientHistoryCard from "./PatientHistoryCard";
import DiagnosisCard from "./DiagnosisCard";
import DiagnosisPrintView from "./DiagnosisPrintView";
import FollowUpPrintView from "./FollowUpPrintView";
import FollowUpCard from "./FollowUpCard";
// import OtherTestsCard from "./OtherTestsCard";
import ProctoscopyCard from "./ProctoscopyCard";
import OpdPrescriptionCard from "./OpdPrescriptionCard";
import OpdPrescriptionPrintView from "./OpdPrescriptionPrintView";
// import SurgeryDetailsCard from "./SurgeryDetailsCard";
import DischargeCard from "./DischargeCard";
import DischargePrintView from "./DischargePrintView";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import DatePicker from "react-datepicker";
import Swal from "sweetalert2";
import { toast as hotToast } from "react-hot-toast";
const toast = new Proxy(hotToast, {
  get(target, prop) {
    if (prop === "warning") {
      return (msg, options) => hotToast(msg, { ...options, icon: "⚠️" });
    }
    if (prop === "info") {
      return (msg, options) => hotToast(msg, { ...options, icon: "ℹ️" });
    }
    return target[prop];
  },
});
import { decodeJwt } from "../../utils/decode-jwt";
import nabhLogo from "../../assets/images/nabh-logo.png";
import painScoreChart from "../../assets/images/pain-score-chart.jpg";
import fistulaPlaceholder from "../../assets/images/fistula.jpg";

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

const PersonalDetailsCard = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(state?.patient);

  const [activeTab, setActiveTab] = useState("menu");
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("default");
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

  const [workPatterns, setWorkPatterns] = useState({
    Sedentary: false,
    Travelling: false,
    "Strenuous (Physical Activity)": false,
    "Mentally Stressful": false,
  });

  const [referenceDetails, setReferenceDetails] = useState({
    newspaper: "",
    internet: "",
    MediaRef: "",
    TVShow: "",
    reference_doctor_name: "",
    reference_doctor_no: "",
    reference_doctor_speciality: "",
    reference_doctor_location: "",
    patient_ref_no: "",
    old_patient_name: "",
    friendname: "",
    friendno: "",
    other: "",
    WOM: "",
  });
  const [selectedReference, setSelectedReference] = useState("");
  const [oldPatientDetails, setOldPatientDetails] = useState({
    patient_ref_no: "",
    old_patient_name: "",
    old_patient_id_value: "",
    old_patient_pincode: "",
  });
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [doctorSearchResults, setDoctorSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [patientSearchResults, setPatientSearchResults] = useState([]);
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);
  const [showManualDoctor, setShowManualDoctor] = useState(false);
  const [manualDoctorData, setManualDoctorData] = useState({
    name: "",
    location: "",
    specialty: "",
  });

  const [showDischargePrintModal, setShowDischargePrintModal] = useState(false);
  const [showDiagnosisPrintModal, setShowDiagnosisPrintModal] = useState(false);
  const [showFollowUpPrintModal, setShowFollowUpPrintModal] = useState(false);
  const [showOpdPrintModal, setShowOpdPrintModal] = useState(false);

  const [historyData, setHistoryData] = useState({
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
  });

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

    if (isHistoryEmpty()) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Details",
        text: "Please fill in at least one history detail before saving.",
      });
      return;
    }

    const missingFields = [];
    if (
      !historyData.height_feet ||
      String(historyData.height_feet).trim() === ""
    ) {
      missingFields.push("Height");
    }
    if (!historyData.weight_kg || String(historyData.weight_kg).trim() === "") {
      missingFields.push("Weight");
    }
    if (
      !historyData.assistance_doctor ||
      String(historyData.assistance_doctor).trim() === ""
    ) {
      missingFields.push("Assistant Doctor");
    }

    if (missingFields.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Missing Required Fields",
        text: `Please fill the required fields: ${missingFields.join(", ")}`,
      });
      return;
    }

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
        if (d.ODS_duration) {
          try {
            const arr = JSON.parse(d.ODS_duration);
            if (Array.isArray(arr)) {
              parsedOdsBowelHabits = arr[0] || "";
              parsedOdsDuration = arr[1] || "";
            }
          } catch (e) {}
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
          vital_bp: d.BP || "",
          vital_pulse: d.Pulse || "",
          vital_rr: d.RR || "",
          rs: d.RS || "",
          cvs: d.CVS || "",
          cns: d.CNS || "",
          pa: "",
          "p/a": d.PA || "", // This is the one used by the UI

          piles_duration: d.piles_duration || "",
          fistula_duration: d.fistula_duration || "",
          hernia_duration: d.hernia_duration || "",
          varicose_duration: d.varicose_duration || "",
          urology_duration: d.uro_duration || "",
          pilonidal_comment: d.pilonidalsinus || "",
          circumcision_comment: d.circumcision || "",

          urinary_duration: d.Urinary_incontinence_duration || "",
          urinary_incontinence: symptomsArr.includes("Urinary Incontinence"),

          fecal_duration: d.Fecal_incontinence_duration || "",
          fecal_incontinence: symptomsArr.includes("Fecal Incontinence"),

          ods_bowel_habits: parsedOdsBowelHabits,
          ods_duration: parsedOdsDuration,

          family_history: familyParsed.known,
          family_history_other: familyParsed.otherStr,

          general_history: generalParsed.known,
          weightloss_comment: generalParsed.otherStr,

          past_medical_history: pastMedicalParsed.known,
          past_medical_history_other: pastMedicalParsed.otherStr,

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
        console.log("[DEBUG] Loaded History State for UI:", loadedState);
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
    has_surgical_date: false,
    surgical_date: "0000-00-00",
    categories: [], // Cashless, Reimbursement, HHF, Cash
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
    // Basic validation
    const hasData =
      diagnosisData.diagnosis_text?.trim() ||
      diagnosisData.investigation_orders?.trim() ||
      diagnosisData.diagnosis_comment?.trim() ||
      diagnosisData.medical_advice?.length > 0 ||
      diagnosisData.advice_types?.length > 0 ||
      Object.values(diagnosisData.speciality_data || {}).some((v) =>
        Array.isArray(v) ? v.length > 0 : v && v.trim() !== "",
      );

    if (!hasData) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Details",
        text: "Please fill in diagnosis details before saving.",
      });
      return;
    }

    const missingFields = [];

    // Check if at least one specialty finding is selected
    const hasSpecialityData = Object.values(
      diagnosisData.speciality_data || {},
    ).some((v) => (Array.isArray(v) ? v.length > 0 : v && v.trim() !== ""));
    if (!hasSpecialityData) {
      missingFields.push("Specialty Findings");
    }

    if (
      !diagnosisData.diagnosis_text ||
      String(diagnosisData.diagnosis_text).trim() === ""
    ) {
      missingFields.push("Diagnosis");
    }
    if (
      !diagnosisData.advice_types ||
      diagnosisData.advice_types.length === 0
    ) {
      missingFields.push("Advice Type");
    }
    if (
      !diagnosisData.consultant_doctor ||
      String(diagnosisData.consultant_doctor).trim() === ""
    ) {
      missingFields.push("Consultant Doctor");
    }
    if (
      !diagnosisData.assistance_doctor ||
      String(diagnosisData.assistance_doctor).trim() === ""
    ) {
      missingFields.push("Assistant Doctor");
    }

    if (missingFields.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Missing Required Fields",
        text: `Please fill the required fields: ${missingFields.join(", ")}`,
      });
      return;
    }

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
  const triggerPrintOpdPrescription = useReactToPrint({
    contentRef: opdPrescriptionPrintRef,
  });

  const handlePrintOpdPrescription = async () => {
    setPrescriptionForPrint(prescriptionData);
    // PRINT-ONLY snapshot of vitals — must never write into historyData (the form),
    // so a fresh entry always stays blank.
    if (historyData && historyData.height_feet) {
      setHistoryForPrint(historyData); // form already has a loaded record → print that
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
    "next-appo-date": new Date(Date.now() + 86400000)
      .toISOString()
      .split("T")[0],
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
          // Slice to YYYY-MM-DD only — avoids moment() timezone shifts on already-formatted strings
          const safeDate = (val) => (val ? String(val).substring(0, 10) : "");
          console.log(
            "[DEBUG] Prescription fetch - next-appo-date:",
            d["next-appo-date"],
            "patient_type:",
            d.patient_type,
          );
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
      console.log(`[DEBUG] Fetching Surgery Details from: ${url}`);

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
        age: patient.age || "",
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
        patient_age: patient.age || "",
        patient_sex: patient.sex || "",
        address: patient.address || "",
      }));

      setWorkPatterns({
        Sedentary: workPatternsArray.includes("Sedentary"),
        Travelling: workPatternsArray.includes("Travelling"),
        "Strenuous (Physical Activity)": workPatternsArray.includes(
          "Strenuous (Physical Activity)",
        ),
        "Mentally Stressful": workPatternsArray.includes("Mentally Stressful"),
      });

      if (patient.reference_type) {
        setSelectedReference(patient.reference_type);
        if (patient.reference_type === "old_ref") {
          const parts = (patient.ref || "").split(",");
          setOldPatientDetails({
            patient_ref_no: parts[0] || "",
            old_patient_name: parts[1] || "",
            old_patient_id_value: "",
            old_patient_pincode: "",
          });
        } else if (patient.reference_type === "dr_ref") {
          const isManual = !patient.ref_doctor_name;
          setIsManualEntry(isManual);
          setReferenceDetails((prev) => ({
            ...prev,
            dr_name: patient.ref_doctor_name || patient.ref || "",
            dr_id: patient.ref_doctor_name ? patient.ref || "" : "",
            dr_contact: patient.ref_doctor_phone || "",
            dr_specialty: patient.reference_doctor_speciality || "",
            dr_location: patient.reference_doctor_location || "",
          }));
          if (patient.ref_doctor_name) {
            const fetchRefDocDetails = async () => {
              try {
                const response = await fetch(
                  `${BASE_URL}/V1/Patients/listDoctor?name=${encodeURIComponent(patient.ref_doctor_name)}&location=${currentLocation}`,
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  },
                );
                if (response.ok) {
                  const resData = await response.json();
                  const doc = resData.data?.find(
                    (d) =>
                      String(d.reference_doctor_id) === String(patient.ref),
                  );
                  if (doc) {
                    setReferenceDetails((prev) => ({
                      ...prev,
                      dr_contact:
                        doc.ref_doctor_phone || doc.reference_doctor_no || "",
                      dr_specialty: doc.reference_doctor_speciality || "",
                      dr_location: doc.reference_doctor_location || "",
                    }));
                  }
                }
              } catch (error) {
                console.error("Error fetching ref doctor details:", error);
              }
            };
            fetchRefDocDetails();
          }
        } else if (patient.reference_type === "family_friends") {
          const parts = (patient.ref || "").split(",");
          setReferenceDetails((prev) => ({
            ...prev,
            friendname: parts[0] || "",
            friendno: parts[1] || "",
          }));
        } else {
          setReferenceDetails((prev) => ({
            ...prev,
            [patient.reference_type]: patient.ref || "",
          }));
        }
      }
      fetchHistoryDates();
      fetchDiagnosisDates();
      fetchOtherTestDates();
      fetchPrescriptionDates();
      fetchSurgeryDates();
      fetchDischargeDates();
      fetchProctoscopyDates();
      fetchFollowUpDetails();
    }
  }, [patient, formData.patient_id, currentLocation]);

  const fetchDischargeDates = async () => {
    const patientId = formData.patient_id || patient?.patient_id;
    if (!patientId) return;

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

  const handleSaveDischarge = async () => {
    const patientId = formData.patient_id || patient?.patient_id;
    if (!patientId) {
      toast.error("Patient ID not found.");
      return;
    }

    const hasData =
      dischargeData.reason_for_admission?.trim() ||
      dischargeData.diagnosis?.trim() ||
      dischargeData.plan_of_treatment?.trim() ||
      dischargeData.surgery_note?.trim() ||
      (dischargeData.treatment_given &&
        dischargeData.treatment_given.length > 0) ||
      (dischargeData.treatment_on_discharge &&
        dischargeData.treatment_on_discharge.length > 0);

    if (!hasData) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Details",
        text: "Please fill in discharge details before saving.",
      });
      return;
    }

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
    if (!patientId) return;

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

  const calculateAge = (birthDate) => {
    if (!birthDate) return "";
    let formattedDate = birthDate;
    if (typeof birthDate === "string") {
      if (birthDate.includes("/")) {
        const [day, month, year] = birthDate.split("/");
        formattedDate = `${year}-${month}-${day}`;
      } else if (birthDate.includes("-")) {
        const parts = birthDate.split("-");
        if (parts[0].length !== 4) {
          const [day, month, year] = parts;
          formattedDate = `${year}-${month}-${day}`;
        }
      }
    }
    const today = new Date();
    const birth = new Date(formattedDate);
    if (isNaN(birth.getTime())) return "";
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age < 0 ? 0 : age;
  };

  const searchDoctorByName = async (name) => {
    if (!name || name.length < 2) {
      setDoctorSearchResults([]);
      setShowManualDoctor(false);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/Patients/listDoctor?name=${encodeURIComponent(name)}&location=${currentLocation}`,
        { method: "GET", headers: { "Content-Type": "application/json" } },
      );
      if (response.ok) {
        const data = await response.json();
        setDoctorSearchResults(data.data || []);
        setShowManualDoctor(false);
      }
    } catch (error) {
      console.error("Error searching doctor:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const searchPatientByPhone = async (phone) => {
    if (!phone || phone.length < 10) {
      setPatientSearchResults([]);
      return;
    }
    setIsSearchingPatient(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/Patients/listRefPatient?phone=${phone}&location=${currentLocation}`,
        { method: "GET", headers: { "Content-Type": "application/json" } },
      );
      if (response.ok) {
        const data = await response.json();
        if (data.statusCode === 200 && data.data.refPatientData) {
          const results = Array.isArray(data.data.refPatientData)
            ? data.data.refPatientData
            : [data.data.refPatientData];
          setPatientSearchResults(results);
        } else {
          setPatientSearchResults([]);
        }
      }
    } catch (error) {
      console.error("Error searching patient:", error);
    } finally {
      setIsSearchingPatient(false);
    }
  };

  const refreshPatientData = async () => {
    try {
      const queryVal = formData.phone || patient?.phone || patient?.mobileNo;
      if (!queryVal) return;
      const response = await fetch(
        `${BASE_URL}/V1/patient/searchPatient?query=${encodeURIComponent(queryVal)}&location=${currentLocation}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (response.ok) {
        const resData = await response.json();
        if (
          resData.statusCode === 200 &&
          resData.data &&
          resData.data.length > 0
        ) {
          const currentId = formData.patient_id || patient?.patient_id;
          const freshPatient =
            resData.data.find(
              (p) => String(p.patient_id) === String(currentId),
            ) || resData.data[0];

          const processedPatient = {
            ...freshPatient,
            patientName: freshPatient.name,
            mobileNo: freshPatient.phone,
            Prefix: freshPatient.prefix,
            additional_info:
              typeof freshPatient.additional_info === "string"
                ? JSON.parse(freshPatient.additional_info)
                : freshPatient.additional_info,
          };
          setPatient(processedPatient);
        }
      }
    } catch (error) {
      console.error("Error refreshing patient data:", error);
    }
  };

  const handleReferenceChange = (e) => {
    const { name, value } = e.target;
    setSelectedReference(value);
    setFormData((prev) => ({ ...prev, reference_type: value }));
  };

  const renderReferenceDetails = () => {
    switch (selectedReference) {
      case "newspaper":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
              Newspaper / Magazine
            </Form.Label>
            <div className="d-flex flex-wrap gap-x-4 gap-y-1 mb-2">
              {["Sakal", "TOI", "MT", "Lokmat", "Pune Mirror"].map((paper) => (
                <Form.Check
                  key={paper}
                  type="radio"
                  label={<span style={{ fontSize: "11px" }}>{paper}</span>}
                  name="newspaper"
                  value={paper}
                  checked={formData.ref === paper}
                  onChange={(e) => {
                    setReferenceDetails((prev) => ({
                      ...prev,
                      Other_Newspaper: "",
                    }));
                    setFormData((prev) => ({
                      ...prev,
                      ref: e.target.value,
                      reference_type: "newspaper",
                    }));
                  }}
                  style={{ transform: "scale(0.95)" }}
                />
              ))}
            </div>
            <Form.Control
              type="text"
              placeholder="Other"
              value={
                !["Sakal", "TOI", "MT", "Lokmat", "Pune Mirror"].includes(
                  formData.ref,
                ) && formData.reference_type === "newspaper"
                  ? formData.ref
                  : ""
              }
              onChange={(e) => {
                const val = e.target.value;
                setReferenceDetails((prev) => ({
                  ...prev,
                  Other_Newspaper: val,
                }));
                setFormData((prev) => ({
                  ...prev,
                  ref: val,
                  reference_type: "newspaper",
                }));
              }}
              style={{
                border: "2px solid #b2ebf2",
                borderRadius: "8px",
                padding: "4px 10px",
                fontSize: "12px",
              }}
            />
          </div>
        );
      case "family_friends":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
              Family / Friends Details
            </Form.Label>
            <Row className="g-2">
              <Col md={6}>
                <Form.Control
                  type="text"
                  placeholder="Friend Name"
                  value={referenceDetails.friendname || ""}
                  onChange={(e) => {
                    const name = e.target.value;
                    setReferenceDetails((prev) => ({
                      ...prev,
                      friendname: name,
                    }));
                    setFormData((prev) => ({
                      ...prev,
                      ref: `${name},${referenceDetails.friendno || ""}`,
                      reference_type: "family_friends",
                    }));
                  }}
                  style={{
                    border: "2px solid #b2ebf2",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "12px",
                  }}
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  type="text"
                  placeholder="Friend Number"
                  value={referenceDetails.friendno || ""}
                  onChange={(e) => {
                    const no = e.target.value;
                    setReferenceDetails((prev) => ({ ...prev, friendno: no }));
                    setFormData((prev) => ({
                      ...prev,
                      ref: `${referenceDetails.friendname || ""},${no}`,
                      reference_type: "family_friends",
                    }));
                  }}
                  style={{
                    border: "2px solid #b2ebf2",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "12px",
                  }}
                />
              </Col>
            </Row>
          </div>
        );
      case "dr_ref":
        return (
          <div className="mt-2">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <Form.Label className="fw-bold mb-0" style={{ fontSize: "11px" }}>
                Doctor Reference{" "}
                {isManualEntry ? "(Manual Entry)" : "(Search as you type)"}
              </Form.Label>
              {!isSearching &&
                referenceDetails.dr_name?.length >= 2 &&
                doctorSearchResults.length === 0 &&
                !isManualEntry && (
                  <Button
                    variant="dark"
                    size="sm"
                    className="py-7 px-2"
                    style={{ fontSize: "10px", backgroundColor: "#003138" }}
                    onClick={() => setIsManualEntry(true)}
                  >
                    + Add New Doctor Reference
                  </Button>
                )}
              {isManualEntry && (
                <Button
                  variant="danger"
                  size="sm"
                  className="py-7 px-2"
                  style={{ fontSize: "10px" }}
                  onClick={() => {
                    setIsManualEntry(false);
                    setReferenceDetails((prev) => ({
                      ...prev,
                      dr_name: "",
                      dr_contact: "",
                      dr_specialty: "",
                      dr_location: "",
                    }));
                  }}
                >
                  Reset / Search Again
                </Button>
              )}
            </div>
            <Row className="g-2 position-relative">
              <Col md={3} className="position-relative">
                <Form.Control
                  type="text"
                  placeholder="Type Doctor Name"
                  value={referenceDetails.dr_name || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setReferenceDetails((prev) => ({ ...prev, dr_name: val }));
                    if (!isManualEntry) searchDoctorByName(val);
                  }}
                  style={{
                    border: "2px solid #b2ebf2",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "12px",
                  }}
                />
                {!isManualEntry &&
                  (isSearching || doctorSearchResults.length > 0) && (
                    <div
                      className="position-absolute w-200 bg-white shadow border rounded mb-1"
                      style={{
                        zIndex: 1000,
                        maxHeight: "250px",
                        overflowY: "auto",
                        bottom: "100%",
                      }}
                    >
                      {isSearching && (
                        <div className="p-2 text-muted small">Searching...</div>
                      )}
                      {doctorSearchResults.map((doc, idx) => (
                        <div
                          key={idx}
                          className="p-2 border-bottom hover-bg-light cursor-pointer small"
                          onClick={() => {
                            setReferenceDetails({
                              dr_id: doc.reference_doctor_id,
                              dr_name: doc.ref_doctor_name || doc.name,
                              dr_contact:
                                doc.ref_doctor_phone ||
                                doc.reference_doctor_no ||
                                doc.phone ||
                                "",
                              dr_specialty:
                                doc.reference_doctor_speciality ||
                                doc.specialization ||
                                "",
                              dr_location:
                                doc.reference_doctor_location ||
                                doc.location ||
                                "",
                            });
                            setFormData((prev) => ({
                              ...prev,
                              ref:
                                doc.reference_doctor_id ||
                                doc.ref_doctor_name ||
                                doc.name,
                            }));
                            setDoctorSearchResults([]);
                          }}
                        >
                          <strong>{doc.ref_doctor_name || doc.name}</strong>
                          <br />
                          <span className="text-muted">
                            {doc.reference_doctor_speciality ||
                              doc.specialization}{" "}
                            | {doc.reference_doctor_location || doc.location}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
              </Col>
              <Col md={3}>
                <Form.Control
                  type="text"
                  placeholder="Contact"
                  value={referenceDetails.dr_contact || ""}
                  readOnly={!isManualEntry}
                  onChange={(e) =>
                    isManualEntry &&
                    setReferenceDetails((prev) => ({
                      ...prev,
                      dr_contact: e.target.value,
                    }))
                  }
                  style={{
                    border: "2px solid #b2ebf2",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "12px",
                    backgroundColor: isManualEntry ? "#fff" : "#e7ebeb",
                  }}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="text"
                  placeholder="Specialty"
                  value={referenceDetails.dr_specialty || ""}
                  readOnly={!isManualEntry}
                  onChange={(e) =>
                    isManualEntry &&
                    setReferenceDetails((prev) => ({
                      ...prev,
                      dr_specialty: e.target.value,
                    }))
                  }
                  style={{
                    border: "2px solid #b2ebf2",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "12px",
                    backgroundColor: isManualEntry ? "#fff" : "#e7ebeb",
                  }}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="text"
                  placeholder="Location"
                  value={referenceDetails.dr_location || ""}
                  readOnly={!isManualEntry}
                  onChange={(e) =>
                    isManualEntry &&
                    setReferenceDetails((prev) => ({
                      ...prev,
                      dr_location: e.target.value,
                    }))
                  }
                  style={{
                    border: "2px solid #b2ebf2",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "12px",
                    backgroundColor: isManualEntry ? "#fff" : "#e7ebeb",
                  }}
                />
              </Col>
            </Row>
          </div>
        );
      case "old_ref":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
              Patient Reference
            </Form.Label>
            <Row className="g-2 position-relative">
              <Col md={4} className="position-relative">
                <Form.Control
                  type="tel"
                  placeholder="Enter Contact Number"
                  value={oldPatientDetails.patient_ref_no || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 10) {
                      setOldPatientDetails((prev) => ({
                        ...prev,
                        patient_ref_no: val,
                      }));
                      searchPatientByPhone(val);
                    }
                  }}
                  style={{
                    border: "2px solid #b2ebf2",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "12px",
                  }}
                />
                {(isSearchingPatient || patientSearchResults.length > 0) && (
                  <div
                    className="position-absolute w-200 bg-white shadow border rounded mt-1"
                    style={{
                      zIndex: 1000,
                      maxHeight: "350px",
                      overflowY: "auto",
                    }}
                  >
                    {isSearchingPatient && (
                      <div className="p-2 text-muted small">Searching...</div>
                    )}
                    {patientSearchResults.map((p, index) => (
                      <div
                        key={index}
                        className="p-2 border-bottom hover-bg-light cursor-pointer small"
                        onClick={() => {
                          setOldPatientDetails({
                            patient_ref_no: p.phone || "",
                            old_patient_name: p.name || "",
                            old_patient_id_value: "",
                            old_patient_pincode: "",
                          });
                          setFormData((prev) => ({
                            ...prev,
                            ref: `${p.phone},${p.name}`,
                          }));
                          setPatientSearchResults([]);
                        }}
                      >
                        <strong>{p.name}</strong> - {p.phone}
                      </div>
                    ))}
                  </div>
                )}
              </Col>
              <Col md={4}>
                <Form.Control
                  type="text"
                  placeholder="Enter Patient Name"
                  value={oldPatientDetails.old_patient_name || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setOldPatientDetails((prev) => ({
                      ...prev,
                      old_patient_name: val,
                    }));
                    setFormData((prev) => ({
                      ...prev,
                      reference_type: "old_ref",
                    }));
                  }}
                  style={{
                    border: "2px solid #b2ebf2",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "12px",
                  }}
                />
              </Col>
            </Row>
          </div>
        );
      case "internet":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
              Internet
            </Form.Label>
            <div className="d-flex flex-wrap gap-x-4 gap-y-1 mb-2">
              {[
                "Google",
                "Website",
                "Practo",
                "Just Dial",
                "Facebook",
                "Youtube",
                "Instagram",
                "LinkedIn",
              ].map((source) => (
                <Form.Check
                  key={source}
                  type="radio"
                  label={<span style={{ fontSize: "11px" }}>{source}</span>}
                  name="internet"
                  value={source}
                  checked={formData.ref === source}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ref: e.target.value,
                      reference_type: "internet",
                    }))
                  }
                  style={{ transform: "scale(0.95)" }}
                />
              ))}
            </div>
          </div>
        );
      case "MediaRef":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
              Entertainment Media
            </Form.Label>
            <div className="d-flex gap-4">
              {["Radio"].map((media) => (
                <Form.Check
                  key={media}
                  type="radio"
                  label={<span style={{ fontSize: "11px" }}>{media}</span>}
                  name="MediaRef"
                  value={media}
                  checked={formData.ref === media}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ref: e.target.value,
                      reference_type: "MediaRef",
                    }))
                  }
                  style={{ transform: "scale(0.95)" }}
                />
              ))}
            </div>
          </div>
        );
      case "TVShow":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
              TV Show
            </Form.Label>
            <div className="d-flex flex-wrap gap-x-4 gap-y-1 mb-2">
              {[
                "Zee 24 Taas",
                "IBN Lokmat",
                "Saam TV",
                "Zee Marathi",
                "TV9",
                "Others",
              ].map((show) => (
                <Form.Check
                  key={show}
                  type="radio"
                  label={<span style={{ fontSize: "11px" }}>{show}</span>}
                  name="TVShow"
                  value={show}
                  checked={formData.ref === show}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ref: e.target.value,
                      reference_type: "TVShow",
                    }))
                  }
                  style={{ transform: "scale(0.95)" }}
                />
              ))}
            </div>
          </div>
        );
      case "hhc_board":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
              HHC Board Reference
            </Form.Label>
            <Form.Check
              type="radio"
              label={<span style={{ fontSize: "11px" }}>HHC Board</span>}
              name="hhc_board"
              value="HHC Board"
              checked={formData.ref === "HHC Board"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  ref: e.target.value,
                  reference_type: "hhc_board",
                }))
              }
              style={{ transform: "scale(0.95)" }}
            />
          </div>
        );
      case "awareness_lecture":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
              Awareness Lecture
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Other"
              value={
                formData.reference_type === "awareness_lecture"
                  ? formData.ref
                  : ""
              }
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  ref: e.target.value,
                  reference_type: "awareness_lecture",
                }))
              }
              style={{
                border: "2px solid #b2ebf2",
                borderRadius: "8px",
                padding: "4px 10px",
                fontSize: "12px",
              }}
            />
          </div>
        );
      case "treated_past":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
              Self Old Pt
            </Form.Label>
            <div className="d-flex gap-4">
              {["Already Operated", "Already Visited"].map((status) => (
                <Form.Check
                  key={status}
                  type="radio"
                  label={<span style={{ fontSize: "11px" }}>{status}</span>}
                  name="treated_past"
                  value={status}
                  checked={formData.ref === status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ref: e.target.value,
                      reference_type: "treated_past",
                    }))
                  }
                  style={{ transform: "scale(0.95)" }}
                />
              ))}
            </div>
          </div>
        );
      case "hhc_branch":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
              HHC Branch
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Branch Name"
              value={
                formData.reference_type === "hhc_branch" ? formData.ref : ""
              }
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  ref: e.target.value,
                  reference_type: "hhc_branch",
                }))
              }
              style={{
                border: "2px solid #b2ebf2",
                borderRadius: "8px",
                padding: "4px 10px",
                fontSize: "12px",
              }}
            />
          </div>
        );
      case "aggregators":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
              Aggregators
            </Form.Label>
            <div className="d-flex flex-wrap gap-x-4 gap-y-1 mb-2">
              {["Mediend", "Hexa", "Practo", "Medibuddy", "Mykare"].map(
                (aggregator) => (
                  <Form.Check
                    key={aggregator}
                    type="radio"
                    label={
                      <span style={{ fontSize: "11px" }}>{aggregator}</span>
                    }
                    name="aggregators"
                    value={aggregator}
                    checked={formData.ref === aggregator}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ref: e.target.value,
                        reference_type: "aggregators",
                      }))
                    }
                    style={{ transform: "scale(0.95)" }}
                  />
                ),
              )}
            </div>
          </div>
        );
      case "other":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
              Other Detail
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter other details"
              value={formData.reference_type === "other" ? formData.ref : ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  ref: e.target.value,
                  reference_type: "other",
                }))
              }
              style={{
                border: "2px solid #b2ebf2",
                borderRadius: "8px",
                padding: "4px 10px",
                fontSize: "12px",
              }}
            />
          </div>
        );
      default:
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let nextState = { ...prev, [name]: value };
      if (name === "birth_date") {
        const dateVal =
          value instanceof Date ? moment(value).format("DD-MM-YYYY") : value;
        nextState.birth_date = dateVal;
        nextState.age = calculateAge(dateVal);
      }
      return nextState;
    });
  };

  const handleWorkPatternChange = (e) => {
    const { name, checked } = e.target;
    setWorkPatterns((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    const requiredFields = [
      { field: "Uid_no", name: "UID No" },
      { field: "prefix", name: "Prefix" },
      { field: "name", name: "Patient Name" },
      { field: "sex", name: "Gender" },
      { field: "phone", name: "Contact Number" },
      { field: "nationality", name: "Nationality" },
      { field: "address", name: "Address" },
      { field: "pincode", name: "Pincode" },
      { field: "birth_date", name: "Birth Date" },
    ];

    for (let req of requiredFields) {
      if (!formData[req.field]) {
        Swal.fire({
          icon: "warning",
          title: "Missing Required Fields",
          text: `Please fill the required field: ${req.name}`,
        });
        return;
      }
    }

    setLoading(true);

    let reference_type = selectedReference || null;
    let ref = "";

    switch (selectedReference) {
      case "newspaper":
        reference_type = "newspaper";
        ref = referenceDetails.newspaper || formData.ref || "";
        break;
      case "dr_ref":
        reference_type = "dr_ref";
        if (isManualEntry) {
          if (!referenceDetails.dr_name || !referenceDetails.dr_name.trim()) {
            toast.error("Please enter a doctor name.");
            return;
          }
          try {
            const addDoctorRes = await fetch(
              `${BASE_URL}/V1/patient/addRefDoctor?location=${currentLocation}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ref_doctor_name: referenceDetails.dr_name,
                  ref_doctor_phone: referenceDetails.dr_contact,
                  reference_doctor_speciality: referenceDetails.dr_specialty,
                  reference_doctor_location: referenceDetails.dr_location,
                }),
              },
            );
            const addDoctorData = await addDoctorRes.json();
            if (addDoctorRes.ok && addDoctorData?.data?.reference_doctor_id) {
              const newDrId = addDoctorData.data.reference_doctor_id;
              ref = newDrId;
              // Also update referenceDetails to hold the new ID so the state aligns
              setReferenceDetails((prev) => ({ ...prev, dr_id: newDrId }));
            } else {
              toast.error(
                addDoctorData.message ||
                  "Failed to add manual doctor reference.",
              );
              return;
            }
          } catch (err) {
            console.error(err);
            toast.error("Error adding manual doctor reference.");
            return;
          }
        } else {
          ref = referenceDetails.dr_id || referenceDetails.dr_name || "";
        }
        break;
      case "internet":
        reference_type = "internet";
        ref = referenceDetails.internet || formData.ref || "";
        break;
      case "MediaRef":
        reference_type = "MediaRef";
        ref = referenceDetails.MediaRef || formData.ref || "";
        break;
      case "TVShow":
        reference_type = "TVShow";
        ref = referenceDetails.TVShow || formData.ref || "";
        break;
      case "old_ref":
        reference_type = "old_ref";
        ref = `${oldPatientDetails.patient_ref_no || ""},${oldPatientDetails.old_patient_name || ""}`;
        break;
      case "family_friends":
        reference_type = "family_friends";
        ref = `${referenceDetails.friendname || ""},${
          referenceDetails.friendno || ""
        }`;
        break;
      case "hhc_board":
        reference_type = "hhc_board";
        ref = referenceDetails.HHC_board || formData.ref || "";
        break;
      case "HHF":
        reference_type = "HHF";
        ref = referenceDetails.HHF || formData.ref || "";
        break;
      case "other":
        reference_type = "other";
        ref = referenceDetails.other || formData.ref || "";
        break;
      case "WOM":
        reference_type = "WOM";
        ref = referenceDetails.WOM || formData.ref || "";
        break;
      case "awareness_lecture":
        reference_type = "awareness_lecture";
        ref = referenceDetails.awareness_lecture || formData.ref || "";
        break;
      case "treated_past":
        reference_type = "treated_past";
        ref = referenceDetails.treated_past_status || formData.ref || "";
        break;
      case "hhc_branch":
        reference_type = "hhc_branch";
        ref = referenceDetails.hhc_branch || formData.ref || "";
        break;
      case "aggregators":
        reference_type = "aggregators";
        ref = referenceDetails.aggregators || formData.ref || "";
        break;
      default:
        reference_type = selectedReference || null;
        ref = referenceDetails[selectedReference] || formData.ref || "";
    }

    const specificWork = Object.entries(workPatterns)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join(",");

    const updatedData = {
      ...formData,
      patientName: formData.name,
      mobileNo: formData.phone,
      specific_work: specificWork,
      reference_type: reference_type,
      ref: ref,
      additional_info: {
        nationality: formData.nationality,
        language: formData.language,
      },
    };

    try {
      const response = await fetch(
        `${BASE_URL}/V1/patient/editPatient?patient_id=${formData.patient_id}&location=${currentLocation}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        },
      );

      const data = await response.json();
      if (response.ok) {
        Toast.fire({ icon: "success", title: "Patient updated successfully" });
        await refreshPatientData();
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: data.message,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Network error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

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
      const updated = isRemoving
        ? current.filter((item) => item !== value)
        : [...current, value];

      console.log(
        `[Diagnosis Checkbox] ${isRemoving ? "Deselected" : "Selected"}:`,
        { field, value, updated },
      );

      let nextState = { ...prev, [field]: updated };

      // Clear comment if Test is unselected
      if (field === "advice_types" && value === "Test" && isRemoving) {
        nextState.diagnosis_comment = "";
      }

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

      console.log(`[Speciality] ${isRemoving ? "Deselected" : "Selected"}:`, {
        speciality,
        value,
        updatedList,
      });

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
      Swal.fire({
        icon: "warning",
        title: "Incomplete Details",
        text: "Please fill in Present Complaints before saving.",
      });
      return;
    }

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
    setPrescriptionData((prev) => {
      const updated = { ...prev, [field]: value };
      if (
        field === "patient_type" &&
        ["surgery_patient", "nofollowupappointment"].includes(value)
      ) {
        updated["next-appo-date"] = null;
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

    const missingFields = [];

    if (
      !prescriptionData.no_medicines_prescribed &&
      (!prescriptionData.medicines || prescriptionData.medicines.length === 0)
    ) {
      missingFields.push("Meditative Advice & Pharmacy Orders");
    }

    if (missingFields.length > 0) {
      console.log(
        "[DEBUG] Form submission blocked due to missing fields:",
        missingFields,
      );
      Swal.fire({
        icon: "warning",
        title: "Missing Required Fields",
        text: `Please fill the required fields: ${missingFields.join(", ")}`,
      });
      return;
    }

    console.log(
      "[DEBUG] Validation passed, submitting form with data:",
      prescriptionData,
    );
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

    // Auto-populate local care and note/advice when surgery type is selected
    if (field === "surgery_type" && Array.isArray(value) && value.length > 0) {
      // Find what was just added (compared to previous state)
      const prevSurgeryTypes = dischargeData.surgery_type || [];
      const newlyAdded = value.find((v) => !prevSurgeryTypes.includes(v));

      if (newlyAdded) {
        fetch(
          `${BASE_URL}/V1/doctor/get-surgery-discharge-details?surgeryType=${encodeURIComponent(newlyAdded)}&location=${currentLocation}`,
        )
          .then((res) => res.json())
          .then((result) => {
            if (result.statusCode === 200 && result.data) {
              const { local_care, note } = result.data;
              setDischargeData((prev) => ({
                ...prev,
                local_care: local_care || prev.local_care,
                note_advice: note || prev.note_advice,
              }));
              toast.success(`Loaded defaults for ${newlyAdded}`);
            }
          })
          .catch((err) => {
            console.error("Error fetching surgery discharge details:", err);
          });
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
    { id: "patient-history", label: "History", icon: "activity" },
    { id: "diagnosis", label: "Diagnosis", icon: "clipboard" },
    { id: "follow-up", label: "Follow Up", icon: "calendar" },
    // { id: "other-tests", label: "Other Tests", icon: "file-text" },
    { id: "proctoscopy", label: "Proctoscopy", icon: "search" },
    { id: "opd-prescription", label: "Prescription", icon: "edit-3" },
    // { id: "surgery-details", label: "Surgery Details", icon: "scissors" },
    { id: "discharge-card", label: "Discharge Card", icon: "log-out" },
  ];

  const renderPersonalInfo = () => (
    <div className="animate__animated animate__fadeIn">
      <Form onSubmit={handleSaveChanges}>
        {/* Basic Info Section */}
        <div
          className="p-2 px-3 bg-white rounded shadow-sm border mb-2"
          style={{ borderLeft: "5px solid #00bcd4" }}
        >
          <h5
            className="fw-bold mb-2"
            style={{
              color: "#00838f",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontSize: "14px",
            }}
          >
            <FeatherIcon icon="user" size="16" className="me-2 text-info" />
            Basic Registration Info
          </h5>
          <Row className="g-2">
            <Col md={3}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
                UID No <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="Uid_no"
                value={formData.Uid_no}
                readOnly
                style={{
                  cursor: "not-allowed",
                  backgroundColor: "#ebeceeff",
                  border: "2px solid #b2ebf2",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
              />
            </Col>
            <Col md={3}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
                Prefix <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="prefix"
                value={formData.prefix}
                onChange={handleInputChange}
                style={{
                  border: "2px solid #b2ebf2",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "12px",
                }}
              >
                <option value="">Select Prefix</option>
                <option value="MR">MR</option>
                <option value="MRS">MRS</option>
                <option value="MASTER">MASTER</option>
                <option value="MISS">MISS</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
                Patient Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter Patient Name"
                style={{
                  border: "2px solid #b2ebf2",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "12px",
                }}
              />
            </Col>
            <Col md={2}>
              <Form.Group
                className="p-1 px-2 rounded w-200 text-center"
                style={{
                  backgroundColor: "#e0f2f1",
                  border: "1px solid #b2ebf2",
                  marginTop: "18px",
                }}
              >
                <Form.Label
                  className="fw-bold mb-0 d-block"
                  style={{ fontSize: "11px" }}
                >
                  VIP Patient
                </Form.Label>
                <Form.Check
                  type="checkbox"
                  checked={formData.patient_type === 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      patient_type: e.target.checked ? 1 : 0,
                    })
                  }
                  className="mb-0 d-inline-block"
                  style={{ transform: "scale(0.85)" }}
                />
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* Contact & Personal Details */}
        <div
          className="p-2 px-3 bg-white rounded shadow-sm border mb-2"
          style={{ borderLeft: "5px solid #00acc1" }}
        >
          <h5
            className="fw-bold mb-2"
            style={{
              color: "#00838f",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontSize: "14px",
            }}
          >
            <FeatherIcon icon="map-pin" size="16" className="me-2 text-info" />
            Contact & Personal Details
          </h5>
          <Row className="g-2">
            <Col md={4}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
                Email ID
                {/* <span className="text-danger">*</span> */}
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter Email"
                style={{
                  border: "2px solid #b2ebf2",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "12px",
                }}
              />
            </Col>
            <Col md={8}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
                Address <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter Residential Address"
                style={{
                  border: "2px solid #b2ebf2",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "12px",
                }}
              />
            </Col>
            <Col md={2}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
                Gender <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="sex"
                value={formData.sex}
                onChange={handleInputChange}
                style={{
                  border: "2px solid #b2ebf2",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "12px",
                }}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
                Contact Number <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                style={{
                  border: "2px solid #b2ebf2",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "12px",
                }}
              />
            </Col>
            <Col md={3}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
                Alternate Contact Number
              </Form.Label>
              <Form.Control
                type="text"
                name="mobile_2"
                value={formData.mobile_2}
                onChange={handleInputChange}
                placeholder="Enter Alternate Contact"
                style={{
                  border: "2px solid #b2ebf2",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "12px",
                }}
              />
            </Col>
            <Col md={3}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
                Nationality <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                style={{
                  border: "2px solid #b2ebf2",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "12px",
                }}
              >
                <option value="">Select Nationality</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={1}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
                Pincode <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="Pincode"
                style={{
                  border: "2px solid #b2ebf2",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "12px",
                }}
              />
            </Col>
          </Row>
        </div>

        <div
          className="p-2 px-3 bg-white rounded shadow-sm border mb-2"
          style={{ borderLeft: "5px solid #0097a7" }}
        >
          <h5
            className="fw-bold mb-2"
            style={{
              color: "#00838f",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontSize: "14px",
            }}
          >
            <FeatherIcon icon="activity" size="16" className="me-2 text-info" />
            Identity & Clinical Info
          </h5>
          <Row className="g-2">
            <Col md={3}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
                Identity Document
              </Form.Label>
              <Form.Select
                name="identity"
                value={formData.identity ? formData.identity.split(",")[0] : ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    identity: `${e.target.value},${formData.identity.split(",")[1] || ""}`,
                  }))
                }
                style={{
                  border: "2px solid #b2ebf2",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "12px",
                }}
              >
                <option value="">Select Document</option>
                <option value="Aadhaar No">Aadhaar No</option>
                <option value="Passport No">Passport No</option>
                <option value="Voter No">Voter No</option>
                <option value="Pan No">PAN No</option>
                <option value="Driving Licence No">Driving Licence No</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
                Identity Number
              </Form.Label>
              <Form.Control
                type="text"
                name="identityNumber"
                value={
                  formData.identity ? formData.identity.split(",")[1] || "" : ""
                }
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    identity: `${formData.identity.split(",")[0] || ""},${e.target.value}`,
                  }))
                }
                placeholder="Enter ID Number"
                style={{
                  border: "2px solid #b2ebf2",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "12px",
                }}
              />
            </Col>
            <Col md={3}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
                Blood Group
                {/* <span className="text-danger">*</span> */}
              </Form.Label>
              <Form.Select
                name="blood_group"
                value={formData.blood_group}
                onChange={handleInputChange}
                style={{
                  border: "2px solid #b2ebf2",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "12px",
                }}
              >
                <option value="">Select</option>
                {[
                  "A+",
                  "A-",
                  "B+",
                  "B-",
                  "O+",
                  "O-",
                  "AB+",
                  "AB-",
                  "Don't Know",
                ].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
                Birth Date <span className="text-danger">*</span>
              </Form.Label>
              <DatePicker
                required
                selected={
                  formData?.birth_date ? parseDate(formData.birth_date) : null
                }
                onChange={(date) =>
                  date &&
                  handleInputChange({
                    target: { name: "birth_date", value: date },
                  })
                }
                className="form-control custom-datepicker"
                dateFormat="dd-MM-yyyy"
                placeholderText="Select Date"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                maxDate={new Date()}
                style={{
                  border: "2px solid #b2ebf2",
                  fontSize: "12px",
                  borderRadius: "10px",
                }}
              />
            </Col>
            <Col md={2}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
                Age
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.age}
                readOnly
                style={{
                  backgroundColor: "#ebeceeff",
                  border: "2px solid #b2ebf2",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontWeight: "bold",
                  fontSize: "12px",
                  cursor: "not-allowed",
                }}
              />
            </Col>
            <Col md={4}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
                Occupation
              </Form.Label>
              <Form.Control
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                placeholder="e.g. Teacher, Engineer..."
                style={{
                  border: "2px solid #b2ebf2",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "12px",
                }}
              />
            </Col>
            <Col md={3}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
                Company Name
              </Form.Label>
              <Form.Control
                type="text"
                name="companyname"
                value={formData.companyname}
                onChange={handleInputChange}
                placeholder="Enter Company Name..."
                style={{
                  border: "2px solid #b2ebf2",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "12px",
                }}
              />
            </Col>
            <Col md={3}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
                Preferred Language
              </Form.Label>
              <Form.Select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                style={{
                  border: "2px solid #b2ebf2",
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "12px",
                }}
              >
                <option value="">Select Language</option>
                {[
                  "English",
                  "Hindi",
                  "Assamese",
                  "Bengali",
                  "Bodo",
                  "Dogri",
                  "Gujarati",
                  "Kannada",
                  "Kashmiri",
                  "Konkani",
                  "Maithili",
                  "Malayalam",
                  "Manipuri",
                  "Marathi",
                  "Nepali",
                  "Odia",
                  "Punjabi",
                  "Sanskrit",
                  "Santali",
                  "Sindhi",
                  "Tamil",
                  "Telugu",
                  "Urdu",
                ].map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </div>

        {/* Work Patterns & Referral */}
        <div
          className="p-2 px-3 bg-white rounded shadow-sm border mb-2"
          style={{ borderLeft: "5px solid #00bcd4" }}
        >
          <h5
            className="fw-bold mb-2"
            style={{
              color: "#00838f",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontSize: "14px",
            }}
          >
            <FeatherIcon icon="clock" size="16" className="me-2 text-info" />
            Work Pattern & Referral
          </h5>
          <Row className="g-2">
            <Col md={12} className="mb-2">
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
                Add Specific Work Pattern
              </Form.Label>
              <div
                className="p-2 border rounded-3 d-flex flex-wrap gap-x-4 gap-y-1 shadow-inner"
                style={{
                  backgroundColor: "#f0fdfa",
                  border: "2px solid #b2ebf2",
                }}
              >
                {Object.keys(workPatterns).map((wp) => (
                  <Form.Check
                    key={wp}
                    type="checkbox"
                    label={
                      <span
                        className="fw-semibold"
                        style={{ color: "#006064", fontSize: "11px" }}
                      >
                        {wp}
                      </span>
                    }
                    name={wp}
                    checked={workPatterns[wp]}
                    onChange={handleWorkPatternChange}
                    style={{ transform: "scale(0.95)" }}
                  />
                ))}
              </div>
            </Col>
            <Col md={12} className="mb-2">
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
                Reference
              </Form.Label>
              <div
                className="p-2 border rounded-3 shadow-inner"
                style={{ border: "2px solid #b2ebf2" }}
              >
                <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                  <Form.Select
                    name="reference"
                    value={selectedReference}
                    onChange={handleReferenceChange}
                    style={{
                      border: "2px solid #b2ebf2",
                      borderRadius: "8px",
                      padding: "4px 10px",
                      fontSize: "12px",
                      width: "auto",
                      minWidth: "220px",
                    }}
                  >
                    <option value="">Choose Reference</option>
                    <option value="family_friends">Family / Friends</option>
                    <option value="dr_ref">Referred By Another Doctor</option>
                    <option value="old_ref">Referred By Another Patient</option>
                    <option value="internet">Internet / Social Media</option>
                    <option value="MediaRef">Entertainment Media</option>
                    <option value="TVShow">Tv Show</option>
                    <option value="newspaper">Newspaper / Magazine</option>
                    <option value="awareness_lecture">Awareness Lecture</option>
                    <option value="hhc_board">HHC Board On Building</option>
                    <option value="treated_past">
                      I Was Treated Here In Past
                    </option>
                    <option value="hhc_branch">
                      Healing Hands Clinic Branch
                    </option>
                    <option value="aggregators">Aggregators</option>
                    <option value="other">Other</option>
                  </Form.Select>
                  <div className="flex-grow-1">{renderReferenceDetails()}</div>
                </div>
              </div>
            </Col>
            <Col md={12} className="text-center mt-3 mb-2">
              <Button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: "#00838f",
                  borderColor: "#00838f",
                  padding: "10px 40px",
                  borderRadius: "50px",
                  fontWeight: "800",
                  fontSize: "13px",
                  boxShadow: "0 8px 25px rgba(0, 131, 143, 0.3)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {loading ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <FeatherIcon icon="save" size="18" className="me-2" /> SAVE
                    PERSONAL DETAILS
                  </>
                )}
              </Button>
            </Col>
          </Row>
        </div>
      </Form>
    </div>
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
    // New patient context → wipe every per-record form, selection, and cache.
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
                        Patient Medical Records
                      </h4>
                      <p
                        className="text-muted m-0"
                        style={{ fontSize: "14px" }}
                      >
                        Manage and review clinical documentation across all
                        categories.
                      </p>
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
                            <FeatherIcon icon={tab.icon} size="22" />
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
                            {completed ? (
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
                    <FeatherIcon
                      icon={tabs.find((t) => t.id === activeTab)?.icon}
                      size="24"
                    />
                  </div>
                  <div>
                    <h4 className="fw-bold m-0" style={{ color: "#2c3e50" }}>
                      {tabs.find((t) => t.id === activeTab)?.label}
                    </h4>
                    <p className="text-muted m-0" style={{ fontSize: "13px" }}>
                      Manage patient records
                    </p>
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
                            handlePrescriptionChange("next-appo-date", "");
                            handlePrescriptionChange("patient_type", "");
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
                  />
                )}
                {![
                  "personal",
                  "patient-history",
                  "diagnosis",
                  "follow-up",
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

export default PersonalDetailsCard;
