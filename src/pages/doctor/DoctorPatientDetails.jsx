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
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import PatientHistoryCard from "./PatientHistoryCard";
import DiagnosisCard from "./DiagnosisCard";
import DiagnosisPrintView from "./DiagnosisPrintView";
import FollowUpCard from "./FollowUpCard";
import OtherTestsCard from "./OtherTestsCard";
import ProctoscopyCard from "./ProctoscopyCard";
import OpdPrescriptionCard from "./OpdPrescriptionCard";
import SurgeryDetailsCard from "./SurgeryDetailsCard";
import DischargeCard from "./DischargeCard";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import DatePicker from "react-datepicker";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";
import { decodeJwt } from "../../utils/decode-jwt";

const BASE_URL = "http://194.195.117.79:5100/api";
const UPLOAD_BASE_URL = "http://194.195.117.79:5100/uploads";

const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas",
  "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize",
  "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana",
  "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde",
  "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad",
  "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia",
  "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica",
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
  "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada",
  "Guatemala", "Guinea", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland",
  "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya",
  "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho",
  "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
  "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius",
  "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
  "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
  "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "Norway", "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay",
  "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
  "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Samoa", "San Marino",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
  "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
  "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
  "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
  "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
  "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
  "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const DoctorPatientDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const initialPatient = state?.patient;

  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("default");

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
    upload_investigation: null,
  });

  const [previousHistoryList, setPreviousHistoryList] = useState([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

  const fetchHistoryDates = async () => {
    if (!formData.patient_id) return;
    try {
      const response = await fetch(`${BASE_URL}/V1/doctor/list-history-dates/${formData.patient_id}?location=${currentLocation}`, {
        headers: {
          "location": currentLocation,
          "x-hms-location": currentLocation
        }
      });
      const result = await response.json();
      if (result.statusCode === 200) {
        const formattedList = (result.data || []).map(item => {
          const jsDate = new Date(item.date);
          // Format based on local timezone to avoid UTC shifting issues
          const year = jsDate.getFullYear();
          const month = String(jsDate.getMonth() + 1).padStart(2, '0');
          const day = String(jsDate.getDate()).padStart(2, '0');

          return {
            ...item,
            id: item.id.toString(),
            date: `${year}-${month}-${day}`
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
      const response = await fetch(`${BASE_URL}/V1/doctor/list-diagnosis-dates/${formData.patient_id}?location=${currentLocation}`, {
        headers: {
          "location": currentLocation,
          "x-hms-location": currentLocation
        }
      });
      const result = await response.json();
      if (result.statusCode === 200) {
        const formattedList = (result.data || []).map(item => {
          const jsDate = new Date(item.date);
          const year = jsDate.getFullYear();
          const month = String(jsDate.getMonth() + 1).padStart(2, '0');
          const day = String(jsDate.getDate()).padStart(2, '0');

          return {
            ...item,
            id: item.id.toString(),
            date: `${year}-${month}-${day}`
          };
        });
        setPreviousDiagnosisList(formattedList);
      }
    } catch (error) {
      console.error("Error fetching diagnosis dates:", error);
    }
  };

  const handleSaveHistory = async () => {
    // Basic validation to prevent saving essentially empty history records
    const isHistoryEmpty = () => {
      // Check for filled strings (excluding defaults like date and painscale)
      const hasTextRecord = Object.entries(historyData).some(([key, val]) => {
        if (['patient_date', 'painscale', 'upload_investigation_existing', 'assistance_doctor'].includes(key)) return false;
        if (typeof val === 'string') return val.trim() !== "";
        return false;
      });

      // Check for non-empty arrays (with special handling for medication table)
      const hasArrayRecord = Object.entries(historyData).some(([key, val]) => {
        if (!Array.isArray(val)) return false;
        if (key === 'medication_history') {
          return val.some(m => (m.medicine && m.medicine.trim()) || (m.indication && m.indication.trim()) || (m.since && m.since.trim()));
        }
        return val.length > 0;
      });

      // Check for special fields like file uploads, checkboxes, or investigation notes
      const hasSpecialRecord = (historyData.upload_investigation !== null) ||
        historyData.urinary_incontinence ||
        historyData.fecal_incontinence ||
        (historyData.investigation_notes && Object.values(historyData.investigation_notes).some(v => v && v.trim() !== ""));

      // If nothing is filled, it's considered empty
      return !hasTextRecord && !hasArrayRecord && !hasSpecialRecord;
    };

    if (isHistoryEmpty()) {
      toast.warning("Please fill in at least one history detail before saving.");
      return;
    }

    setLoading(true);
    try {
      const formDataObj = new FormData();

      // Append all history data fields to FormData
      Object.keys(historyData).forEach(key => {
        if (key === 'upload_investigation') {
          if (historyData[key]) {
            formDataObj.append(key, historyData[key]);
          }
        } else if (Array.isArray(historyData[key]) || typeof historyData[key] === 'object') {
          formDataObj.append(key, JSON.stringify(historyData[key]));
        } else {
          formDataObj.append(key, historyData[key]);
        }
      });

      const response = await fetch(`${BASE_URL}/V1/doctor/save-patient-history/${formData.patient_id}?location=${currentLocation}`, {
        method: "POST",
        headers: {
          // Do NOT set Content-Type header when sending FormData, the browser will set it with the correct boundary
          "location": currentLocation,
          "x-hms-location": currentLocation
        },
        body: formDataObj,
      });
      const data = await response.json();
      if (data.statusCode === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Patient history saved successfully!",
          timer: 3000,
          timerProgressBar: true
        });
        fetchHistoryDates();
        setHistoryData(initialHistoryState);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to save history"
        });
      }
    } catch (error) {
      console.error("Error saving history:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving patient history."
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
    setSelectedHistoryId(id);
    const selected = previousHistoryList.find(h => h.id === id);
    if (!selected) return;

    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/V1/doctor/get-patient-history/${formData.patient_id}?historyId=${id}&location=${currentLocation}`, {
        headers: {
          "location": currentLocation,
          "x-hms-location": currentLocation
        }
      });
      const result = await response.json();

      if (result.statusCode === 200 && result.data) {
        const d = result.data;
        const toArray = (str) => str ? str.split(",").map(s => s.trim()).filter(Boolean) : [];
        const symptomsArr = toArray(d.symptoms);

        // Define symptom groups to filter category-specific data
        const pilesOpts = ["PR Bleeding:Painless", "PR Bleeding:Painful", "Burning", "Pricking", "Itching", "Incomplete Evacuation", "Prolapse", "Swelling", "Pain at Anal Region", "Mucus Mixed Blood"];
        const fistulaOpts = ["Pus Discharge", "Boil", "Watery Discharge", "Swelling near anal region"];
        const herniaOpts = ["Swelling:Umbilical", "Right Inguinal", "Left Inguinal", "Swelling:Abdominal", "Reducible", "Nonreducible", "Past Sx"];
        const varicoseOpts = ["Pain", "Enlarged veins", "Swelling", "Ulcer", "Right", "Left", "B/L"];
        const urologyOpts = ["Pain", "Burning urination", "Nausea", "Vomiting", "LUTS", "Urgency of urination", "Incomplete evacuation", "Stream of urine", "Nocturia"];
        const odsOpts = ["Excessive Straining", "Digitation", "Hard Stools", "Enema / Laxative", "Fragmented Defecation", "Chronic constipation", "Urgency", "Frequency"];
        const pilonidalOpts = ["Pain", "Boil", "Swelling", "Pus / Watery Discharge"];

        let parsedOdsBowelHabits = "";
        let parsedOdsDuration = "";
        if (d.ODS_duration) {
          try {
            const arr = JSON.parse(d.ODS_duration);
            if (Array.isArray(arr)) {
              parsedOdsBowelHabits = arr[0] || "";
              parsedOdsDuration = arr[1] || "";
            }
          } catch (e) { }
        }

        const investigationTypes = [
          "HB", "BSL-R", "Bleding Time-BT", "Clotting Time-BT", "PT INR", "HIV",
          "Hbsag", "SR.Creatinine", "Vit B12", "HbA1C", "Thyroid", "LVEF", "Glucose Fasting"
        ];
        const commentsArr = d.newInvestigation_comment ? d.newInvestigation_comment.split(",") : [];
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
            if (index === 9 && (commentsArr[index].includes("inv_") || commentsArr[index].includes("_"))) {
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
          all.forEach(item => {
            const match = knownOpts.find(opt => opt.trim().toLowerCase() === item.toLowerCase());
            if (match) known.push(match);
            else other.push(item);
          });
          return { known, otherStr: other.join(", ") };
        };

        const familyParsed = parseHistoryFields(d.family_history, ['Piles', 'Constipation', 'DM', 'HTN', 'Heart Disease']);
        const pastMedicalParsed = parseHistoryFields(d.past_history, ['DM', 'HTN', 'Br Asthma', 'Thyroid', 'IHD', 'Migraine', 'Epilepsy', 'CKD', 'CLD', 'CVA', 'IBS', 'Insomnia']);
        const generalParsed = parseHistoryFields(d.general_history, ['H/O Wt Loss', 'Dec Appetite', 'H/O Straining for urination', 'Acidity', 'Gas', 'Bloating']);
        const ongoingMedsParsed = parseHistoryFields(d.ongoing_medicines, ['Aspirin', 'Clopidogrel', 'Warfarin', 'Acitrom']); // Using common ones as placeholder if not specified, otherwise others will just fall smoothly

        const formatLocalDate = (isoDate) => {
          if (!isoDate) return "";
          const jsDate = new Date(isoDate);
          if (isNaN(jsDate)) return isoDate;
          const year = jsDate.getFullYear();
          const month = String(jsDate.getMonth() + 1).padStart(2, '0');
          const day = String(jsDate.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const loadedState = {
          ...initialHistoryState,
          patient_date: formatLocalDate(d.patient_date) || formatLocalDate(selected.date),
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

          piles_data: symptomsArr.filter(s => pilesOpts.includes(s)),
          fistula_data: symptomsArr.filter(s => fistulaOpts.includes(s)),
          hernia_data: symptomsArr.filter(s => herniaOpts.includes(s)),
          varicose_data: symptomsArr.filter(s => varicoseOpts.includes(s)),
          urology_data: symptomsArr.filter(s => urologyOpts.includes(s)),
          ods_data: symptomsArr.filter(s => odsOpts.includes(s)),
          pilonidal_data: symptomsArr.filter(s => pilonidalOpts.includes(s)),
        };

        if (d.medication_history) {
          let meds = [];
          if (Array.isArray(d.medication_history)) {
            meds = d.medication_history;
          } else if (typeof d.medication_history === 'string' && d.medication_history.trim().length > 0) {
            try {
              meds = JSON.parse(d.medication_history);
            } catch (e) {
              console.warn("Failed to parse medication_history from server string:", e);
            }
          }

          if (Array.isArray(meds) && meds.length > 0) {
            const mappedMeds = meds.map((m) => ({
              medicine: m.medicine || "", indication: m.indication || "", since: m.since || ""
            }));
            while (mappedMeds.length < 5) mappedMeds.push({ medicine: "", indication: "", since: "" });
            loadedState.medication_history = mappedMeds.slice(0, 5);
          }
        }

        setHistoryData(loadedState);
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
      hernia: [],
      varicosevein: [],
      prolapse: [],
      circumcision: "",
      abscess: "",
      fissure: "",
      ibs: "",
      urology: ""
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
    assistance_doctor: ""
  };

  const [diagnosisData, setDiagnosisData] = useState(initialDiagnosisState);

  const handleSelectDiagnosis = async (id) => {
    setSelectedDiagnosisId(id);
    const selected = previousDiagnosisList.find(d => d.id === id);
    if (!selected) return;

    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/V1/doctor/get-diagnosis/${formData.patient_id}?date=${selected.date}&location=${currentLocation}`, {
        headers: {
          "location": currentLocation,
          "x-hms-location": currentLocation
        }
      });
      const result = await response.json();

      if (result.statusCode === 200 && result.data) {
        setDiagnosisData(result.data);
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
      Object.values(diagnosisData.speciality_data || {}).some(v => Array.isArray(v) ? v.length > 0 : (v && v.trim() !== ""));

    if (!hasData) {
      toast.warning("Please fill in diagnosis details before saving.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/V1/doctor/save-diagnosis/${formData.patient_id}?location=${currentLocation}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "location": currentLocation,
          "x-hms-location": currentLocation
        },
        body: JSON.stringify(diagnosisData),
      });
      const data = await response.json();
      if (data.statusCode === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Diagnosis saved successfully!",
          timer: 3000,
          timerProgressBar: true
        });
        fetchDiagnosisDates();
        setDiagnosisData(initialDiagnosisState);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to save diagnosis"
        });
      }
    } catch (error) {
      console.error("Error saving diagnosis:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving diagnosis."
      });
    } finally {
      setLoading(false);
    }
  };

  const diagPrintRef = useRef();
  const handlePrintDiagnosis = useReactToPrint({
    contentRef: diagPrintRef,
  });

  const [followUpData, setFollowUpData] = useState({
    diagnosis: "",
    advice: "",
    plan: "",
    present_complaints: "",
    ongoing_medicines: "",
    first_visit_date: "",
    visit_count: "0"
  });

  const fetchFollowUpDetails = async () => {
    if (!formData.patient_id) return;
    try {
      const response = await fetch(`${BASE_URL}/V1/doctor/get-followup-details/${formData.patient_id}?location=${currentLocation}`, {
        headers: {
          "location": currentLocation,
          "x-hms-location": currentLocation
        }
      });
      const result = await response.json();
      if (result.statusCode === 200) {
        const fallbackDate = formData.date ? (formData.date.includes("-") && formData.date.split("-")[0].length === 4 ? formData.date : moment(formData.date, "DD-MM-YYYY").format("YYYY-MM-DD")) : "";
        setFollowUpData({
          ...result.data,
          first_visit_date: result.data.first_visit_date || fallbackDate || ""
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
    test_comment: ""
  };

  const [otherTestData, setOtherTestData] = useState(initialOtherTestsState);
  const [previousTestsList, setPreviousTestsList] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState(null);

  const fetchOtherTestDates = async () => {
    if (!formData.patient_id) return;
    try {
      const response = await fetch(`${BASE_URL}/V1/doctor/list-other-test-dates/${formData.patient_id}?location=${currentLocation}`, {
        headers: {
          "location": currentLocation,
          "x-hms-location": currentLocation
        }
      });
      const result = await response.json();
      if (result.statusCode === 200) {
        const formattedList = (result.data || []).map(item => ({
          ...item,
          id: item.id.toString(),
          date: moment(item.date).format("YYYY-MM-DD")
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
      const response = await fetch(`${BASE_URL}/V1/doctor/save-other-test/${formData.patient_id}?location=${currentLocation}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "location": currentLocation,
          "x-hms-location": currentLocation
        },
        body: JSON.stringify(otherTestData),
      });
      const data = await response.json();
      if (data.statusCode === 200 || data.statusCode === 201) {
        Swal.fire({ icon: "success", title: "Success", text: data.message || "Other tests saved successfully!", timer: 3000, timerProgressBar: true });
        fetchOtherTestDates();
        setOtherTestData(initialOtherTestsState);
      } else {
        Swal.fire({ icon: "error", title: "Error", text: data.message || "Failed to save other tests" });
      }
    } catch (error) {
      console.error("Error saving other tests:", error);
      Swal.fire({ icon: "error", title: "Error", text: "An error occurred while saving other tests." });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTest = async (id) => {
    setSelectedTestId(id);
    const selected = previousTestsList.find(t => t.id === id);
    if (!selected) return;

    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/V1/doctor/get-other-test-details/${formData.patient_id}?date=${selected.date}&location=${currentLocation}`, {
        headers: {
          "location": currentLocation,
          "x-hms-location": currentLocation
        }
      });
      const result = await response.json();
      if (result.statusCode === 200 && result.data) {
        setOtherTestData(result.data);
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
    interpretation: "",
    images: []
  };

  const [proctoscopyData, setProctoscopyData] = useState(initialProctoscopyState);
  const [previousProctoscopyList, setPreviousProctoscopyList] = useState([
    { id: "P1", date: "2026-03-10" }
  ]);
  const [selectedProctoscopyId, setSelectedProctoscopyId] = useState(null);

  const fetchProctoscopyDates = async () => {
    if (!formData.patient_id) return;
    try {
      const response = await fetch(`${BASE_URL}/V1/doctor/list-proctoscopy-dates/${formData.patient_id}?location=${currentLocation}`, {
        headers: {
          "location": currentLocation,
          "x-hms-location": currentLocation
        }
      });
      const result = await response.json();
      if (result.statusCode === 200) {
        const formattedList = (result.data || []).map(item => ({
          ...item,
          id: item.id.toString(),
          date: moment(item.date).format("YYYY-MM-DD")
        }));
        setPreviousProctoscopyList(formattedList);
      }
    } catch (error) {
      console.error("Error fetching proctoscopy dates:", error);
    }
  };

  const handleSelectProctoscopy = async (id) => {
    setSelectedProctoscopyId(id);
    const selected = previousProctoscopyList.find(p => p.id === id);
    if (!selected) return;

    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/V1/doctor/get-proctoscopy/${formData.patient_id}?date=${selected.date}&location=${currentLocation}`, {
        headers: {
          "location": currentLocation,
          "x-hms-location": currentLocation
        }
      });
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

  const handleSaveProctoscopy = async () => {
    if (!proctoscopyData.interpretation?.trim() && (!proctoscopyData.images || proctoscopyData.images.length === 0)) {
      toast.warning("Please provide an interpretation or upload images before saving.");
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("procto_date", proctoscopyData.procto_date);
      formDataToSend.append("interpretation", proctoscopyData.interpretation);

      if (proctoscopyData.images && proctoscopyData.images.length > 0) {
        proctoscopyData.images.forEach((file) => {
          formDataToSend.append("userfile[]", file);
        });
      }

      const response = await fetch(`${BASE_URL}/V1/doctor/save-proctoscopy/${formData.patient_id}?location=${currentLocation}`, {
        method: "POST",
        headers: {
          "location": currentLocation,
          "x-hms-location": currentLocation
        },
        body: formDataToSend,
      });
      const data = await response.json();
      if (data.statusCode === 200 || data.statusCode === 201) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: data.message || "Proctoscopy report saved successfully!",
          timer: 3000,
          timerProgressBar: true
        });
        fetchProctoscopyDates();
        // Clear local image selection after successful upload
        setProctoscopyData(prev => ({ ...prev, images: [] }));

        // RE-FETCH the record details to show the newly uploaded images
        try {
          const detailRes = await fetch(`${BASE_URL}/V1/doctor/get-proctoscopy/${formData.patient_id}?date=${proctoscopyData.procto_date}&location=${currentLocation}`, {
            headers: {
              "location": currentLocation,
              "x-hms-location": currentLocation
            }
          });
          const detailResult = await detailRes.json();
          if (detailResult.statusCode === 200 && detailResult.data) {
            setProctoscopyData(detailResult.data);
          }
        } catch (fetchErr) {
          console.error("Error re-fetching proctoscopy after save:", fetchErr);
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to save proctoscopy report"
        });
      }
    } catch (error) {
      console.error("Error saving proctoscopy:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving proctoscopy report."
      });
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
    "next-appo-date": new Date(Date.now() + 86400000).toISOString().split("T")[0],
    medicines: [],
    // Urology Fields
    udoctor_id: "",
    urodiagnosis: "",
    uroadvice: [],
    preopinvestigation: [],
    medicalchiefcomplaints: "",
    medicalhistory: "",
    medicalpasthistory: "",
    investigation: ""
  };

  const [prescriptionData, setPrescriptionData] = useState(initialPrescriptionState);
  const [previousPrescriptionList, setPreviousPrescriptionList] = useState([
    { id: "PR1", date: "2026-03-12" },
    { id: "PR2", date: "2026-02-20" }
  ]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState(null);

  const handleSelectPrescription = async (id) => {
    setSelectedPrescriptionId(id);
    const selected = previousPrescriptionList.find(pr => pr.id === id);
    if (selected) {
      try {
        const dateStr = moment(selected.date, "DD-MM-YYYY").format("YYYY-MM-DD");
        const response = await fetch(`${BASE_URL}/V1/doctor/get-opd-prescription/${formData.patient_id}/${dateStr}?location=${currentLocation}`);
        const result = await response.json();
        if (result.statusCode === 200) {
          setPrescriptionData({
            ...initialPrescriptionState,
            ...result.data,
            creation_timestamp: moment(result.data.creation_timestamp).format("YYYY-MM-DD"),
            "next-appo-date": result.data["next-appo-date"] ? moment(result.data["next-appo-date"]).format("YYYY-MM-DD") : ""
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
    setSelectedPrescriptionId(null);
    setPrescriptionData(initialPrescriptionState);
    toast.info("Started a new prescription");
  };

  const [currentMedicine, setCurrentMedicine] = useState({
    name: "",
    qty: "",
    times: [],
    days: ""
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
    additional_comment: ""
  };

  const [surgeryData, setSurgeryData] = useState(initialSurgeryState);
  const [previousSurgeryList, setPreviousSurgeryList] = useState([]);
  const [selectedSurgeryId, setSelectedSurgeryId] = useState(null);

  const fetchSurgeryDates = async () => {
    if (!formData.patient_id) return;
    try {
      const response = await fetch(`${BASE_URL}/V1/doctor/list-surgery-dates/${formData.patient_id}?location=${currentLocation}`, {
        headers: {
          "location": currentLocation,
          "x-hms-location": currentLocation
        }
      });
      const result = await response.json();
      if (result.statusCode === 200) {
        const formattedList = (result.data || []).map(item => ({
          ...item,
          id: item.id.toString(),
          date: moment(item.date).format("YYYY-MM-DD")
        }));
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

    const selected = previousSurgeryList.find(s => s.id.toString() === stringId);
    if (!selected) {
      console.warn("[DEBUG] Could not find selected surgery in list for ID:", id);
      return;
    }

    try {
      setLoading(true);
      const url = `${BASE_URL}/V1/doctor/get-surgery-details/${formData.patient_id}?date=${selected.date}&location=${currentLocation}`;
      console.log(`[DEBUG] Fetching Surgery Details from: ${url}`);

      const response = await fetch(url, {
        headers: {
          "location": currentLocation,
          "x-hms-location": currentLocation
        }
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
          additional_comment: d.additional_comment || ""
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
      const response = await fetch(`${BASE_URL}/V1/doctor/save-surgery-details/${formData.patient_id}?location=${currentLocation}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "location": currentLocation,
          "x-hms-location": currentLocation
        },
        body: JSON.stringify(surgeryData),
      });
      const data = await response.json();
      if (data.statusCode === 200 || data.statusCode === 201) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: data.message || "Surgery details saved successfully!",
          timer: 3000,
          timerProgressBar: true
        });
        fetchSurgeryDates();
        setSurgeryData(initialSurgeryState);
        setSelectedSurgeryId(null);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to save surgery details"
        });
      }
    } catch (error) {
      console.error("Error saving surgery details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving surgery details."
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
    investigations: {
      HB: "", WBC: "", PLT: "", BSL: "", CREATININE: "", BILLIRUBIN: "", PSA: "", BT: "", CT: "", PT: "", INR: "", HIV: "Negative", HCV: "", HBSAG: "Negative"
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
    patient_name: "",
    patient_age: "",
    patient_sex: "",
    address: "",
    treatment_given: [],
    treatment_on_discharge: [],
    doa: "",
    dod: "",
    admission_time: "",
    discharge_time: "",
    ipd_no: "",
    spo2: "",
    bp: "",
    pulse: ""
  };

  const [dischargeData, setDischargeData] = useState(initialDischargeState);
  const [previousDischargesList, setPreviousDischargesList] = useState([
    { id: "D1", date: "2026-01-10" }
  ]);
  const [selectedDischargeId, setSelectedDischargeId] = useState(null);

  const handleSelectDischarge = async (id) => {
    setSelectedDischargeId(id);
    const patientId = formData.patient_id || initialPatient?.patient_id;
    if (!patientId) return;

    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/V1/doctor/get-discharge-card/${patientId}?dischargeId=${id}&location=${currentLocation}`, {
        headers: {
          "location": currentLocation,
          "x-hms-location": currentLocation
        }
      });
      const result = await response.json();
      if (result.statusCode === 200 && result.data) {
        setDischargeData(result.data);
        toast.success(`Loaded discharge summary for ${moment(result.data.dod).format("DD-MM-YYYY")}`);
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
    setDischargeData({ ...initialDischargeState, patient_name: formData.name, patient_age: formData.age, patient_sex: formData.sex });
    toast.info("Started a new discharge summary");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }

    if (initialPatient) {
      const workPatternsArray = (initialPatient.specific_work || "")
        .split(",")
        .map((item) => item.trim());

      const rawPrefix = (initialPatient.prefix || initialPatient.Prefix || "").trim();
      const prefixOptions = ["MR", "MRS", "MASTER", "MISS", "DR", "MS"];
      let finalPrefix = rawPrefix.toUpperCase().replace(/\.$/, "");
      if (finalPrefix === "M/S") finalPrefix = "MISS"; // Common legacy shorthand

      // Ensure it's one of our standard options or empty
      if (!prefixOptions.includes(finalPrefix)) {
        finalPrefix = "";
      }

      setFormData({
        Uid_no: initialPatient.Uid_no || initialPatient.uid || "",
        date: initialPatient.date || "",
        prefix: finalPrefix,
        name: initialPatient.name || "",
        patient_type: initialPatient.patient_type ? 1 : 0,
        email: initialPatient.email || "",
        address: initialPatient.address || "",
        sex: initialPatient.sex || "",
        phone: initialPatient.phone || "",
        mobile_2: initialPatient.mobile_2 || "",
        pincode: initialPatient.pincode || "",
        blood_group: initialPatient.blood_group || "",
        identity: initialPatient.identity || "",
        identityNumber: initialPatient.identityNumber || "",
        birth_date: initialPatient.birth_date || "",
        age: initialPatient.age || "",
        occupation: initialPatient.occupation || "",
        companyname: initialPatient.companyname || "",
        reference_type: initialPatient.reference_type || "",
        ref: initialPatient.ref || "",
        specific_work: initialPatient.specific_work || "",
        patient_id: initialPatient.patient_id || "",
        nationality: initialPatient.additional_info?.nationality || initialPatient.nationality || "",
        language: initialPatient.additional_info?.language || initialPatient.language || "",
      });

      setDischargeData(prev => ({
        ...prev,
        patient_name: initialPatient.name || "",
        patient_age: initialPatient.age || "",
        patient_sex: initialPatient.sex || "",
        address: initialPatient.address || ""
      }));

      setWorkPatterns({
        Sedentary: workPatternsArray.includes("Sedentary"),
        Travelling: workPatternsArray.includes("Travelling"),
        "Strenuous (Physical Activity)": workPatternsArray.includes("Strenuous (Physical Activity)"),
        "Mentally Stressful": workPatternsArray.includes("Mentally Stressful"),
      });

      if (initialPatient.reference_type) {
        setSelectedReference(initialPatient.reference_type);
        if (initialPatient.reference_type === "old_ref") {
          const parts = (initialPatient.ref || "").split(",");
          setOldPatientDetails({
            patient_ref_no: parts[0] || "",
            old_patient_name: parts[1] || "",
            old_patient_id_value: parts[2] || "",
            old_patient_pincode: parts[3] || "",
          });
        } else {
          setReferenceDetails(prev => ({
            ...prev,
            [initialPatient.reference_type]: initialPatient.ref || ""
          }));
        }
      }
      fetchHistoryDates();
      fetchDiagnosisDates();
      fetchOtherTestDates();
      fetchPrescriptionDates();
      fetchSurgeryDates();
      fetchDischargeDates();
    }
  }, [initialPatient, formData.patient_id]);

  const fetchDischargeDates = async () => {
    const patientId = formData.patient_id || initialPatient?.patient_id;
    if (!patientId) return;

    try {
      const response = await fetch(`${BASE_URL}/V1/doctor/list-discharge-dates/${patientId}?location=${currentLocation}`);
      if (!response.ok) return;
      const data = await response.json();
      if (data.statusCode === 200) {
        setPreviousDischargesList(data.data.map(item => ({
          id: item.id,
          date: moment(item.date).format("DD-MM-YYYY")
        })));
      }
    } catch (error) {
      console.error("Error fetching discharge dates:", error);
    }
  };

  const handleSaveDischarge = async () => {
    const patientId = formData.patient_id || initialPatient?.patient_id;
    if (!patientId) {
      toast.error("Patient ID not found.");
      return;
    }

    const hasData =
      dischargeData.reason_for_admission?.trim() ||
      dischargeData.diagnosis?.trim() ||
      dischargeData.plan_of_treatment?.trim() ||
      dischargeData.surgery_note?.trim() ||
      (dischargeData.treatment_given && dischargeData.treatment_given.length > 0) ||
      (dischargeData.treatment_on_discharge && dischargeData.treatment_on_discharge.length > 0);

    if (!hasData) {
      toast.warning("Please fill in discharge details before saving.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...dischargeData,
        treatment_given: JSON.parse(JSON.stringify(dischargeData.treatment_given || [])),
        treatment_on_discharge: JSON.parse(JSON.stringify(dischargeData.treatment_on_discharge || []))
      };

      const response = await fetch(`${BASE_URL}/V1/doctor/save-discharge-card/${patientId}?location=${currentLocation}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "location": currentLocation,
          "x-hms-location": currentLocation
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.statusCode === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Discharge card saved successfully!",
          timer: 3000,
          timerProgressBar: true
        });
        fetchDischargeDates();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to save discharge card"
        });
      }
    } catch (error) {
      console.error("Error saving discharge card:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving discharge card."
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptionDates = async () => {
    const patientId = formData.patient_id || initialPatient?.patient_id;
    if (!patientId) return;

    try {
      const response = await fetch(`${BASE_URL}/V1/doctor/list-opd-prescription-dates/${patientId}?location=${currentLocation}`);
      if (!response.ok) return;
      const data = await response.json();
      if (data.statusCode === 200) {
        setPreviousPrescriptionList(data.data.map(item => ({
          id: item.id,
          date: moment(item.date).format("DD-MM-YYYY")
        })));
      }
    } catch (error) {
      console.error("Error fetching prescription dates:", error);
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
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
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
        { method: "GET", headers: { "Content-Type": "application/json" } }
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
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.statusCode === 200 && data.data.refPatientData) {
          const results = Array.isArray(data.data.refPatientData) ? data.data.refPatientData : [data.data.refPatientData];
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

  const handleReferenceChange = (e) => {
    const { name, value } = e.target;
    setSelectedReference(value);
    setFormData(prev => ({ ...prev, reference_type: value }));
  };

  const renderReferenceDetails = () => {
    switch (selectedReference) {
      case "newspaper":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Newspaper / Magazine</Form.Label>
            <div className="d-flex flex-wrap gap-x-4 gap-y-1 mb-2">
              {["Sakal", "TOI", "MT", "Lokmat", "Pune Mirror"].map(paper => (
                <Form.Check
                  key={paper}
                  type="radio"
                  label={<span style={{ fontSize: "11px" }}>{paper}</span>}
                  name="newspaper"
                  value={paper}
                  checked={formData.ref === paper}
                  onChange={(e) => {
                    setReferenceDetails(prev => ({ ...prev, Other_Newspaper: "" }));
                    setFormData(prev => ({ ...prev, ref: e.target.value, reference_type: "newspaper" }));
                  }}
                  style={{ transform: "scale(0.95)" }}
                />
              ))}
            </div>
            <Form.Control
              type="text"
              placeholder="Other"
              value={!["Sakal", "TOI", "MT", "Lokmat", "Pune Mirror"].includes(formData.ref) && formData.reference_type === "newspaper" ? formData.ref : ""}
              onChange={(e) => {
                const val = e.target.value;
                setReferenceDetails(prev => ({ ...prev, Other_Newspaper: val }));
                setFormData(prev => ({ ...prev, ref: val, reference_type: "newspaper" }));
              }}
              style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }}
            />
          </div>
        );
      case "family_friends":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Family / Friends Details</Form.Label>
            <Row className="g-2">
              <Col md={6}>
                <Form.Control
                  type="text"
                  placeholder="Friend Name"
                  value={referenceDetails.friendname || ""}
                  onChange={(e) => {
                    const name = e.target.value;
                    setReferenceDetails(prev => ({ ...prev, friendname: name }));
                    setFormData(prev => ({ ...prev, ref: `${name},${referenceDetails.friendno || ""}`, reference_type: "family_friends" }));
                  }}
                  style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }}
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  type="text"
                  placeholder="Friend Number"
                  value={referenceDetails.friendno || ""}
                  onChange={(e) => {
                    const no = e.target.value;
                    setReferenceDetails(prev => ({ ...prev, friendno: no }));
                    setFormData(prev => ({ ...prev, ref: `${referenceDetails.friendname || ""},${no}`, reference_type: "family_friends" }));
                  }}
                  style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }}
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
                Doctor Reference {isManualEntry ? "(Manual Entry)" : "(Search as you type)"}
              </Form.Label>
              {!isSearching && referenceDetails.dr_name?.length >= 2 && doctorSearchResults.length === 0 && !isManualEntry && (
                <Button
                  variant="dark"
                  size="sm"
                  className="py-0 px-2"
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
                  className="py-0 px-2"
                  style={{ fontSize: "10px" }}
                  onClick={() => {
                    setIsManualEntry(false);
                    setReferenceDetails(prev => ({ ...prev, dr_name: "", dr_contact: "", dr_specialty: "", dr_location: "" }));
                  }}
                >
                  Reset / Search Again
                </Button>
              )}
            </div>
            <Row className="g-2 position-relative">
              <Col md={3}>
                <Form.Control
                  type="text"
                  placeholder="Type Doctor Name"
                  value={referenceDetails.dr_name || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setReferenceDetails(prev => ({ ...prev, dr_name: val }));
                    if (!isManualEntry) searchDoctorByName(val);
                  }}
                  style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }}
                />
                {!isManualEntry && (isSearching || doctorSearchResults.length > 0) && (
                  <div className="position-absolute w-100 bg-white shadow border rounded mt-1" style={{ zIndex: 1000, maxHeight: "150px", overflowY: "auto" }}>
                    {isSearching && <div className="p-2 text-muted small">Searching...</div>}
                    {doctorSearchResults.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-2 border-bottom hover-bg-light cursor-pointer small"
                        onClick={() => {
                          setReferenceDetails({
                            dr_name: doc.ref_doctor_name || doc.name,
                            dr_contact: doc.ref_doctor_phone || doc.phone || "",
                            dr_specialty: doc.reference_doctor_speciality || doc.specialization || "",
                            dr_location: doc.reference_doctor_location || doc.location || "",
                          });
                          setFormData(prev => ({ ...prev, ref: doc.ref_doctor_name || doc.name }));
                          setDoctorSearchResults([]);
                        }}
                      >
                        <strong>{doc.ref_doctor_name || doc.name}</strong><br />
                        <span className="text-muted">{doc.reference_doctor_speciality || doc.specialization} | {doc.reference_doctor_location || doc.location}</span>
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
                  onChange={(e) => isManualEntry && setReferenceDetails(prev => ({ ...prev, dr_contact: e.target.value }))}
                  style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px", backgroundColor: isManualEntry ? "#fff" : "#e7ebeb" }}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="text"
                  placeholder="Specialty"
                  value={referenceDetails.dr_specialty || ""}
                  readOnly={!isManualEntry}
                  onChange={(e) => isManualEntry && setReferenceDetails(prev => ({ ...prev, dr_specialty: e.target.value }))}
                  style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px", backgroundColor: isManualEntry ? "#fff" : "#e7ebeb" }}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="text"
                  placeholder="Location"
                  value={referenceDetails.dr_location || ""}
                  readOnly={!isManualEntry}
                  onChange={(e) => isManualEntry && setReferenceDetails(prev => ({ ...prev, dr_location: e.target.value }))}
                  style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px", backgroundColor: isManualEntry ? "#fff" : "#e7ebeb" }}
                />
              </Col>
            </Row>
          </div>
        );
      case "old_ref":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Patient Reference</Form.Label>
            <Row className="g-2 position-relative">
              <Col md={4}>
                <Form.Control
                  type="tel"
                  placeholder="Enter Contact Number"
                  value={oldPatientDetails.patient_ref_no || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 10) {
                      setOldPatientDetails(prev => ({ ...prev, patient_ref_no: val }));
                      searchPatientByPhone(val);
                    }
                  }}
                  style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }}
                />
                {(isSearchingPatient || patientSearchResults.length > 0) && (
                  <div className="position-absolute w-100 bg-white shadow border rounded mt-1" style={{ zIndex: 1000, maxHeight: "150px", overflowY: "auto" }}>
                    {isSearchingPatient && <div className="p-2 text-muted small">Searching...</div>}
                    {patientSearchResults.map((p, index) => (
                      <div
                        key={index}
                        className="p-2 border-bottom hover-bg-light cursor-pointer small"
                        onClick={() => {
                          setOldPatientDetails({
                            patient_ref_no: p.phone || "",
                            old_patient_name: p.name || "",
                            old_patient_id_value: p.patient_id || "",
                            old_patient_pincode: p.pincode || "",
                          });
                          setFormData(prev => ({ ...prev, ref: `${p.phone},${p.name},${p.patient_id},${p.pincode}` }));
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
                  onChange={(e) => setOldPatientDetails(prev => ({ ...prev, old_patient_name: e.target.value }))}
                  style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }}
                />
              </Col>
              <Col md={4}>
                <Form.Control
                  type="text"
                  placeholder="Pincode"
                  value={oldPatientDetails.old_patient_pincode || ""}
                  onChange={(e) => setOldPatientDetails(prev => ({ ...prev, old_patient_pincode: e.target.value }))}
                  style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }}
                />
              </Col>
            </Row>
          </div>
        );
      case "internet":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Internet</Form.Label>
            <div className="d-flex flex-wrap gap-x-4 gap-y-1 mb-2">
              {["Google", "Website", "Practo", "Just Dial", "Facebook", "Youtube", "Instagram", "LinkedIn"].map(source => (
                <Form.Check
                  key={source}
                  type="radio"
                  label={<span style={{ fontSize: "11px" }}>{source}</span>}
                  name="internet"
                  value={source}
                  checked={formData.ref === source}
                  onChange={(e) => setFormData(prev => ({ ...prev, ref: e.target.value, reference_type: "internet" }))}
                  style={{ transform: "scale(0.95)" }}
                />
              ))}
            </div>
          </div>
        );
      case "MediaRef":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Entertainment Media</Form.Label>
            <div className="d-flex gap-4">
              {["Radio"].map(media => (
                <Form.Check
                  key={media}
                  type="radio"
                  label={<span style={{ fontSize: "11px" }}>{media}</span>}
                  name="MediaRef"
                  value={media}
                  checked={formData.ref === media}
                  onChange={(e) => setFormData(prev => ({ ...prev, ref: e.target.value, reference_type: "MediaRef" }))}
                  style={{ transform: "scale(0.95)" }}
                />
              ))}
            </div>
          </div>
        );
      case "TVShow":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>TV Show</Form.Label>
            <div className="d-flex flex-wrap gap-x-4 gap-y-1 mb-2">
              {["Zee 24 Taas", "IBN Lokmat", "Saam TV", "Zee Marathi", "TV9", "Others"].map(show => (
                <Form.Check
                  key={show}
                  type="radio"
                  label={<span style={{ fontSize: "11px" }}>{show}</span>}
                  name="TVShow"
                  value={show}
                  checked={formData.ref === show}
                  onChange={(e) => setFormData(prev => ({ ...prev, ref: e.target.value, reference_type: "TVShow" }))}
                  style={{ transform: "scale(0.95)" }}
                />
              ))}
            </div>
          </div>
        );
      case "hhc_board":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>HHC Board Reference</Form.Label>
            <Form.Check
              type="radio"
              label={<span style={{ fontSize: "11px" }}>HHC Board</span>}
              name="hhc_board"
              value="HHC Board"
              checked={formData.ref === "HHC Board"}
              onChange={(e) => setFormData(prev => ({ ...prev, ref: e.target.value, reference_type: "hhc_board" }))}
              style={{ transform: "scale(0.95)" }}
            />
          </div>
        );
      case "awareness_lecture":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Awareness Lecture</Form.Label>
            <Form.Control
              type="text"
              placeholder="Other"
              value={formData.reference_type === "awareness_lecture" ? formData.ref : ""}
              onChange={(e) => setFormData(prev => ({ ...prev, ref: e.target.value, reference_type: "awareness_lecture" }))}
              style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }}
            />
          </div>
        );
      case "treated_past":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Self Old Pt</Form.Label>
            <div className="d-flex gap-4">
              {["Already Operated", "Already Visited"].map(status => (
                <Form.Check
                  key={status}
                  type="radio"
                  label={<span style={{ fontSize: "11px" }}>{status}</span>}
                  name="treated_past"
                  value={status}
                  checked={formData.ref === status}
                  onChange={(e) => setFormData(prev => ({ ...prev, ref: e.target.value, reference_type: "treated_past" }))}
                  style={{ transform: "scale(0.95)" }}
                />
              ))}
            </div>
          </div>
        );
      case "hhc_branch":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>HHC Branch</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Branch Name"
              value={formData.reference_type === "hhc_branch" ? formData.ref : ""}
              onChange={(e) => setFormData(prev => ({ ...prev, ref: e.target.value, reference_type: "hhc_branch" }))}
              style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }}
            />
          </div>
        );
      case "aggregators":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Aggregators</Form.Label>
            <div className="d-flex flex-wrap gap-x-4 gap-y-1 mb-2">
              {["Mediend", "Hexa", "Practo", "Medibuddy", "Mykare"].map(aggregator => (
                <Form.Check
                  key={aggregator}
                  type="radio"
                  label={<span style={{ fontSize: "11px" }}>{aggregator}</span>}
                  name="aggregators"
                  value={aggregator}
                  checked={formData.ref === aggregator}
                  onChange={(e) => setFormData(prev => ({ ...prev, ref: e.target.value, reference_type: "aggregators" }))}
                  style={{ transform: "scale(0.95)" }}
                />
              ))}
            </div>
          </div>
        );
      case "other":
        return (
          <div className="mt-2">
            <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Other Detail</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter other details"
              value={formData.reference_type === "other" ? formData.ref : ""}
              onChange={(e) => setFormData(prev => ({ ...prev, ref: e.target.value, reference_type: "other" }))}
              style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    setDischargeData(prev => ({
      ...prev,
      patient_name: formData.name || "",
      patient_age: formData.age || "",
      patient_sex: formData.sex || ""
    }));
  }, [formData.name, formData.age, formData.sex]);

  const [assistanceDoctors, setAssistanceDoctors] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [fistulaCases, setFistulaCases] = useState([]);

  useEffect(() => {
    const fetchAssistanceDoctors = async () => {
      try {
        const response = await fetch(`${BASE_URL}/V1/doctor/assistanceDoctorDropdown?location=${currentLocation}`);
        const result = await response.json();
        if (result.statusCode === 200) {
          setAssistanceDoctors(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching assistance doctors:", error);
      }
    };

    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${BASE_URL}/V1/doctor/doctorDropdown?location=${currentLocation}`);
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
        const response = await fetch(`${BASE_URL}/V1/doctor/fistulaCasesDropdown?location=${currentLocation}`);
        const result = await response.json();
        if (result.statusCode === 200) {
          setFistulaCases(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching fistula cases:", error);
      }
    };

    if (currentLocation && currentLocation !== "default") {
      fetchAssistanceDoctors();
      fetchDoctors();
      fetchFistulaCases();
    }
  }, [currentLocation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let nextState = { ...prev, [name]: value };
      if (name === "birth_date") {
        const dateVal = value instanceof Date ? moment(value).format("DD-MM-YYYY") : value;
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
    setLoading(true);

    const specificWork = Object.entries(workPatterns)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join(",");

    const updatedData = {
      ...formData,
      patientName: formData.name,
      mobileNo: formData.phone,
      specific_work: specificWork,
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
        }
      );

      const data = await response.json();
      if (response.ok) {
        Toast.fire({ icon: "success", title: "Patient updated successfully" });
      } else {
        Swal.fire({ icon: "error", title: "Update Failed", text: data.message });
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Network error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryChange = (name, value) => {
    setHistoryData(prev => ({ ...prev, [name]: value }));
  };

  const handleHistoryCheckboxChange = (category, value) => {
    setHistoryData(prev => {
      const current = prev[category] || [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const handleInvestigationCommentChange = (investigation, value) => {
    setHistoryData(prev => ({
      ...prev,
      investigation_notes: {
        ...prev.investigation_notes,
        [investigation]: value
      }
    }));
  };

  const handleDiagnosisChange = (field, value) => {
    setDiagnosisData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDiagnosisCheckboxChange = (field, value) => {
    setDiagnosisData(prev => {
      const current = prev[field] || [];
      const isRemoving = current.includes(value);
      const updated = isRemoving
        ? current.filter(item => item !== value)
        : [...current, value];

      let nextState = { ...prev, [field]: updated };

      // Clear comment if Test is unselected
      if (field === "advice_types" && value === "Test" && isRemoving) {
        nextState.diagnosis_comment = "";
      }

      return nextState;
    });
  };

  const handleSpecialityCheckboxChange = (speciality, value) => {
    setDiagnosisData(prev => {
      const currentSpecialityData = prev.speciality_data[speciality] || [];
      const updatedList = currentSpecialityData.includes(value)
        ? currentSpecialityData.filter(item => item !== value)
        : [...currentSpecialityData, value];
      return {
        ...prev,
        speciality_data: {
          ...prev.speciality_data,
          [speciality]: updatedList
        }
      };
    });
  };

  const handleMedicalAdviceNoteChange = (advice, value) => {
    setDiagnosisData(prev => ({
      ...prev,
      medical_advice_notes: {
        ...prev.medical_advice_notes,
        [advice]: value
      }
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedHistory = [...historyData.medication_history];
    updatedHistory[index] = { ...updatedHistory[index], [field]: value };
    setHistoryData(prev => ({ ...prev, medication_history: updatedHistory }));
  };

  const handleFollowUpChange = (field, value) => {
    setFollowUpData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveFollowUp = async () => {
    const hasData =
      followUpData.diagnosis?.trim() ||
      followUpData.advice?.trim() ||
      followUpData.plan?.trim() ||
      followUpData.present_complaints?.trim() ||
      followUpData.ongoing_medicines?.trim();

    if (!hasData) {
      toast.warning("Please fill in follow-up details before saving.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/V1/doctor/save-followup/${formData.patient_id}?location=${currentLocation}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "location": currentLocation,
          "x-hms-location": currentLocation
        },
        body: JSON.stringify(followUpData),
      });
      const data = await response.json();
      if (data.statusCode === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Follow-up data saved successfully!",
          timer: 3000,
          timerProgressBar: true
        });
        // Optionally fetch updated visit count or dates if needed
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to save follow-up"
        });
      }
    } catch (error) {
      console.error("Error saving follow-up:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving follow-up."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtherTestChange = (field, value) => {
    setOtherTestData(prev => ({ ...prev, [field]: value }));
  };

  const handleOtherTestCheckboxChange = (value) => {
    setOtherTestData(prev => {
      const current = prev.test_type || [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, test_type: updated };
    });
  };

  const handleProctoscopyChange = (field, value) => {
    setProctoscopyData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrescriptionChange = (field, value) => {
    setPrescriptionData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrescriptionCheckboxChange = (field, value) => {
    setPrescriptionData(prev => {
      const current = prev[field] || [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleAddMedicine = () => {
    if (!currentMedicine.name) {
      toast.error("Please select a medicine");
      return;
    }
    setPrescriptionData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { ...currentMedicine }]
    }));
    setCurrentMedicine({ name: "", qty: "", times: [], days: "" });
  };

  const handleRemoveMedicine = (index) => {
    setPrescriptionData(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const handleSaveOpdPrescription = async () => {
    const patientId = formData.patient_id || initialPatient?.patient_id;
    if (!patientId) {
      toast.error("Patient ID is missing");
      return;
    }

    if (!prescriptionData.diagnosis?.trim() && (!prescriptionData.medicines || prescriptionData.medicines.length === 0)) {
      toast.warning("Please enter a diagnosis or add medicines before saving.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/V1/doctor/save-opd-prescription/${patientId}?location=${currentLocation}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "location": currentLocation,
          "x-hms-location": currentLocation
        },
        body: JSON.stringify(prescriptionData),
      });
      const data = await response.json();
      if (data.statusCode === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Prescription saved successfully!",
          timer: 3000,
          timerProgressBar: true
        });
        fetchPrescriptionDates();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to save prescription"
        });
      }
    } catch (error) {
      console.error("Error saving prescription:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving prescription."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSurgeryChange = (field, value) => {
    setSurgeryData(prev => ({ ...prev, [field]: value }));
  };

  const handleSurgeryCheckboxChange = (value) => {
    setSurgeryData(prev => {
      const current = prev.anesthesia || [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, anesthesia: updated };
    });
  };

  const handleDischargeChange = (field, value) => {
    setDischargeData(prev => ({ ...prev, [field]: value }));
  };

  const handleDischargeInvestigationChange = (field, value) => {
    setDischargeData(prev => ({
      ...prev,
      investigations: { ...prev.investigations, [field]: value }
    }));
  };


  if (!initialPatient) {
    return (
      <div className="themebody-wrap" style={{ background: "linear-gradient(to right, #e0f7fa, #80deea)", minHeight: "100vh" }}>
        <Container>
          <Row className="justify-content-center">
            <Col md={6}>
              <Card className="mt-5 shadow-lg border-0" style={{ borderRadius: "15px" }}>
                <Card.Body className="text-center p-5">
                  <FeatherIcon icon="user-x" size="64" className="text-muted mb-4" />
                  <h3 className="mb-4" style={{ color: "#00838f", fontWeight: "700" }}>Patient Not Found</h3>
                  <Button variant="info" onClick={() => navigate("/doctor-patients")} style={{ backgroundColor: "#00bcd4", color: "white", borderRadius: "30px" }}>
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
    { id: "patient-history", label: "Patient History", icon: "activity" },
    { id: "diagnosis", label: "Diagnosis", icon: "clipboard" },
    { id: "follow-up", label: "Follow Up", icon: "calendar" },
    { id: "other-tests", label: "Other Tests", icon: "file-text" },
    { id: "proctoscopy", label: "Proctoscopy", icon: "search" },
    { id: "opd-prescription", label: "OPD Prescription", icon: "edit-3" },
    { id: "surgery-details", label: "Surgery Details", icon: "scissors" },
    { id: "discharge-card", label: "Discharge Card", icon: "external-link" },
  ];

  const renderPersonalInfo = () => (
    <div className="animate__animated animate__fadeIn">
      <Form onSubmit={handleSaveChanges}>
        {/* Basic Info Section */}
        <div className="p-2 px-3 bg-white rounded shadow-sm border mb-2" style={{ borderLeft: "5px solid #00bcd4" }}>
          <h5 className="fw-bold mb-2" style={{ color: "#00838f", textTransform: "uppercase", letterSpacing: "0.5px", fontSize: "14px" }}>
            <FeatherIcon icon="user" size="16" className="me-2 text-info" />Basic Registration Info
          </h5>
          <Row className="g-2">
            <Col md={3}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>UID No <span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" name="Uid_no" value={formData.Uid_no} readOnly style={{ backgroundColor: "#f8fafc", border: "2px solid #e2e8f0", borderRadius: "8px", padding: "4px 10px", fontWeight: "bold", color: "#64748b", fontSize: "12px" }} />
            </Col>
            <Col md={3}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Prefix <span className="text-danger">*</span></Form.Label>
              <Form.Select name="prefix" value={formData.prefix} onChange={handleInputChange} style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }}>
                <option value="">Select Prefix</option>
                <option value="MR">MR</option>
                <option value="MRS">MRS</option>
                <option value="MASTER">MASTER</option>
                <option value="MISS">MISS</option>
                <option value="MS">MS</option>
                <option value="DR">DR</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Patient Name <span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter Patient Name" style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }} />
            </Col>
            <Col md={2}>
              <Form.Group className="p-1 px-2 rounded w-100 text-center" style={{ backgroundColor: "#e0f2f1", border: "1px solid #b2ebf2", marginTop: "18px" }}>
                <Form.Label className="fw-bold mb-0 d-block" style={{ fontSize: "10px" }}>VIP Patient</Form.Label>
                <Form.Check
                  type="checkbox"
                  checked={formData.patient_type === 1}
                  onChange={(e) => setFormData({ ...formData, patient_type: e.target.checked ? 1 : 0 })}
                  className="mb-0 d-inline-block"
                  style={{ transform: "scale(0.85)" }}
                />
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* Contact & Personal Details */}
        <div className="p-2 px-3 bg-white rounded shadow-sm border mb-2" style={{ borderLeft: "5px solid #00acc1" }}>
          <h5 className="fw-bold mb-2" style={{ color: "#00838f", textTransform: "uppercase", letterSpacing: "0.5px", fontSize: "14px" }}>
            <FeatherIcon icon="map-pin" size="16" className="me-2 text-info" />Contact & Personal Details
          </h5>
          <Row className="g-2">
            <Col md={4}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Email ID <span className="text-danger">*</span></Form.Label>
              <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter Email" style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }} />
            </Col>
            <Col md={8}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Address <span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter Residential Address" style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }} />
            </Col>
            <Col md={2}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Gender <span className="text-danger">*</span></Form.Label>
              <Form.Select name="sex" value={formData.sex} onChange={handleInputChange} style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Contact Number <span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" name="phone" value={formData.phone} onChange={handleInputChange} style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }} />
            </Col>
            <Col md={3}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Alternate Contact Number</Form.Label>
              <Form.Control type="text" name="mobile_2" value={formData.mobile_2} onChange={handleInputChange} placeholder="Enter Alternate Contact" style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }} />
            </Col>
            <Col md={3}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Nationality <span className="text-danger">*</span></Form.Label>
              <Form.Select name="nationality" value={formData.nationality} onChange={handleInputChange} style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }}>
                <option value="">Select Nationality</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </Form.Select>
            </Col>
            <Col md={1}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Pincode <span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="Pincode" style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }} />
            </Col>
          </Row>
        </div>

        <div className="p-2 px-3 bg-white rounded shadow-sm border mb-2" style={{ borderLeft: "5px solid #0097a7" }}>
          <h5 className="fw-bold mb-2" style={{ color: "#00838f", textTransform: "uppercase", letterSpacing: "0.5px", fontSize: "14px" }}>
            <FeatherIcon icon="activity" size="16" className="me-2 text-info" />Identity & Clinical Info
          </h5>
          <Row className="g-2">
            <Col md={3}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Identity Document</Form.Label>
              <Form.Select
                name="identity"
                value={formData.identity ? formData.identity.split(",")[0] : ""}
                onChange={(e) => setFormData(prev => ({ ...prev, identity: `${e.target.value},${formData.identity.split(",")[1] || ""}` }))}
                style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }}
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
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Identity Number</Form.Label>
              <Form.Control
                type="text"
                name="identityNumber"
                value={formData.identity ? formData.identity.split(",")[1] || "" : ""}
                onChange={(e) => setFormData(prev => ({ ...prev, identity: `${formData.identity.split(",")[0] || ""},${e.target.value}` }))}
                placeholder="Enter ID Number"
                style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }}
              />
            </Col>
            <Col md={3}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Blood Group <span className="text-danger">*</span></Form.Label>
              <Form.Select name="blood_group" value={formData.blood_group} onChange={handleInputChange} style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }}>
                <option value="">Select</option>
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Birth Date <span className="text-danger">*</span></Form.Label>
              <DatePicker
                selected={formData.birth_date ? moment(formData.birth_date, "DD-MM-YYYY").toDate() : null}
                onChange={(date) => handleInputChange({ target: { name: "birth_date", value: date } })}
                className="form-control"
                dateFormat="dd-MM-yyyy"
                maxDate={new Date()}
                customInput={<Form.Control style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }} />}
              />
            </Col>
            <Col md={2}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Age</Form.Label>
              <Form.Control type="text" value={formData.age} readOnly style={{ backgroundColor: "#f8fafc", border: "2px solid #e2e8f0", borderRadius: "8px", padding: "4px 10px", fontWeight: "bold", fontSize: "12px" }} />
            </Col>
            <Col md={4}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Occupation</Form.Label>
              <Form.Control type="text" name="occupation" value={formData.occupation} onChange={handleInputChange} placeholder="e.g. Teacher, Engineer..." style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }} />
            </Col>
            <Col md={3}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Company Name</Form.Label>
              <Form.Control type="text" name="companyname" value={formData.companyname} onChange={handleInputChange} placeholder="If billing through corporate..." style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }} />
            </Col>
            <Col md={3}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Preferred Language</Form.Label>
              <Form.Select name="language" value={formData.language} onChange={handleInputChange} style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px" }}>
                <option value="">Select Language</option>
                {["English", "Hindi", "Marathi", "Gujarati", "Kannada", "Telugu", "Tamil"].map(l => <option key={l} value={l}>{l}</option>)}
              </Form.Select>
            </Col>
          </Row>
        </div>

        {/* Work Patterns & Referral */}
        <div className="p-2 px-3 bg-white rounded shadow-sm border mb-2" style={{ borderLeft: "5px solid #00bcd4" }}>
          <h5 className="fw-bold mb-2" style={{ color: "#00838f", textTransform: "uppercase", letterSpacing: "0.5px", fontSize: "14px" }}>
            <FeatherIcon icon="clock" size="16" className="me-2 text-info" />Work Pattern & Referral
          </h5>
          <Row className="g-2">
            <Col md={12} className="mb-2">
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Add Specific Work Pattern</Form.Label>
              <div className="p-2 border rounded-3 d-flex flex-wrap gap-x-4 gap-y-1 shadow-inner" style={{ backgroundColor: "#f0fdfa", border: "2px solid #b2ebf2" }}>
                {Object.keys(workPatterns).map(wp => (
                  <Form.Check key={wp} type="checkbox" label={<span className="fw-semibold" style={{ color: "#006064", fontSize: "11px" }}>{wp}</span>} name={wp} checked={workPatterns[wp]} onChange={handleWorkPatternChange} style={{ transform: "scale(0.95)" }} />
                ))}
              </div>
            </Col>
            <Col md={12} className="mb-2">
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>Reference</Form.Label>
              <div className="p-2 border rounded-3 shadow-inner" style={{ border: "2px solid #b2ebf2" }}>
                <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                  <Form.Select
                    name="reference"
                    value={selectedReference}
                    onChange={handleReferenceChange}
                    style={{ border: "2px solid #b2ebf2", borderRadius: "8px", padding: "4px 10px", fontSize: "12px", width: "auto", minWidth: "220px" }}
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
                    <option value="treated_past">I Was Treated Here In Past</option>
                    <option value="hhc_branch">Healing Hands Clinic Branch</option>
                    <option value="aggregators">Aggregators</option>
                    <option value="other">Other</option>
                  </Form.Select>
                  <div className="flex-grow-1">
                    {renderReferenceDetails()}
                  </div>
                </div>
              </div>
            </Col>
            <Col md={12} className="text-center mt-3 mb-2">
              <Button type="submit" disabled={loading} style={{ backgroundColor: "#00838f", borderColor: "#00838f", padding: "10px 40px", borderRadius: "50px", fontWeight: "800", fontSize: "13px", boxShadow: "0 8px 25px rgba(0, 131, 143, 0.3)", textTransform: "uppercase", letterSpacing: "1px" }}>
                {loading ? <Spinner size="sm" /> : <><FeatherIcon icon="save" size="18" className="me-2" /> UPDATE PERSONAL DETAILS</>}
              </Button>
            </Col>
          </Row>
        </div>
      </Form>
    </div>
  );








  return (
    <div className="themebody-wrap" style={{ background: "linear-gradient(135deg, #e0f7fa 0%, #80deea 100%)", minHeight: "100vh", padding: "10px" }}>
      <PageBreadcrumb pagename="Patient Details" />
      <div className="theme-body">
        <Container fluid>
          <Card className="shadow-lg border-0 mb-4 overflow-hidden" style={{ borderRadius: "15px" }}>
            <Card.Header className="bg-white border-0 p-0">
              <Nav className="flex-nowrap overflow-auto custom-navbar px-2 py-3" style={{ backgroundColor: "#f1fcfd", gap: "8px" }}>
                {tabs.map((tab) => (
                  <Nav.Item key={tab.id}>
                    <Nav.Link
                      active={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="text-center"
                      style={{
                        whiteSpace: "nowrap",
                        borderRadius: "8px",
                        padding: "6px 10px",
                        fontWeight: "700",
                        fontSize: "12px",
                        backgroundColor: activeTab === tab.id ? "#00bcd4" : "white",
                        color: activeTab === tab.id ? "white" : "#00838f",
                        border: activeTab === tab.id ? "2px solid #00bcd4" : "2px solid #b2ebf2",
                        boxShadow: activeTab === tab.id ? "0 4px 12px rgba(0, 188, 212, 0.4)" : "0 1px 3px rgba(0,0,0,0.05)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        display: "inline-flex",
                        alignItems: "center"
                      }}
                    >
                      <FeatherIcon icon={tab.icon} size="14" style={{ marginRight: "6px" }} /> {tab.label}
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>
            </Card.Header>
            <Card.Body className="p-4" style={{ backgroundColor: "#f8fbfc" }}>
              {activeTab === "personal" && renderPersonalInfo()}
              {activeTab === "patient-history" && (
                <PatientHistoryCard
                  historyData={historyData}
                  handleHistoryChange={handleHistoryChange}
                  handleHistoryCheckboxChange={handleHistoryCheckboxChange}
                  handleInvestigationCommentChange={handleInvestigationCommentChange}
                  handleMedicationChange={handleMedicationChange}
                  loading={loading}
                  previousHistoryList={previousHistoryList}
                  selectedHistoryId={selectedHistoryId}
                  onSelectHistory={handleSelectHistory}
                  onNewRecord={handleNewRecord}
                  onSaveHistory={handleSaveHistory}
                  assistanceDoctors={assistanceDoctors}
                  uploadBaseUrl={UPLOAD_BASE_URL}
                />
              )}
              {activeTab === "diagnosis" && (
                <DiagnosisCard
                  diagnosisData={diagnosisData}
                  handleDiagnosisChange={handleDiagnosisChange}
                  handleDiagnosisCheckboxChange={handleDiagnosisCheckboxChange}
                  handleSpecialityCheckboxChange={handleSpecialityCheckboxChange}
                  setDiagnosisData={setDiagnosisData}
                  handleMedicalAdviceNoteChange={handleMedicalAdviceNoteChange}
                  loading={loading}
                  previousDiagnosisList={previousDiagnosisList}
                  selectedDiagnosisId={selectedDiagnosisId}
                  onSelectDiagnosis={handleSelectDiagnosis}
                  onNewDiagnosis={handleNewDiagnosis}
                  onSaveDiagnosis={handleSaveDiagnosis}
                  onPrintDiagnosis={handlePrintDiagnosis}
                  doctors={doctors}
                  assistanceDoctors={assistanceDoctors}
                />
              )}
              {activeTab === "follow-up" && (
                <FollowUpCard
                  followUpData={followUpData}
                  formData={formData}
                  handleFollowUpChange={handleFollowUpChange}
                  onSaveFollowUp={handleSaveFollowUp}
                  loading={loading}
                />
              )}
              {activeTab === "other-tests" && (
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
              )}
              {activeTab === "proctoscopy" && (
                <ProctoscopyCard
                  proctoscopyData={proctoscopyData}
                  formData={formData}
                  handleProctoscopyChange={handleProctoscopyChange}
                  previousProctoscopyList={previousProctoscopyList}
                  selectedProctoscopyId={selectedProctoscopyId}
                  onSelectProctoscopy={handleSelectProctoscopy}
                  onNewProctoscopy={handleNewProctoscopy}
                  onSaveProctoscopy={handleSaveProctoscopy}
                  loading={loading}
                  uploadBaseUrl={UPLOAD_BASE_URL}
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
                  handlePrescriptionCheckboxChange={handlePrescriptionCheckboxChange}
                  previousPrescriptionList={previousPrescriptionList}
                  selectedPrescriptionId={selectedPrescriptionId}
                  onSelectPrescription={handleSelectPrescription}
                  onNewPrescription={handleNewPrescription}
                  onSavePrescription={handleSaveOpdPrescription}
                  assistanceDoctors={assistanceDoctors}
                  location={currentLocation}
                />
              )}
              {activeTab === "surgery-details" && (
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
                  doctors={doctors}
                />

              )}
              {activeTab === "discharge-card" && (
                <DischargeCard
                  dischargeData={dischargeData}
                  doctors={doctors}
                  assistanceDoctors={assistanceDoctors}
                  fistulaCases={fistulaCases}
                  handleDischargeChange={handleDischargeChange}
                  handleDischargeInvestigationChange={handleDischargeInvestigationChange}
                  previousDischargesList={previousDischargesList}
                  selectedDischargeId={selectedDischargeId}
                  onSelectDischarge={handleSelectDischarge}
                  onNewDischarge={handleNewDischarge}
                  onSaveDischarge={handleSaveDischarge}
                  loading={loading}
                />
              )}
              {!["personal", "patient-history", "diagnosis", "follow-up", "other-tests", "proctoscopy", "opd-prescription", "surgery-details", "discharge-card"].includes(activeTab) && (
                <div className="text-center py-5 animate__animated animate__fadeIn">
                  <div className="d-inline-flex p-4 rounded-circle mb-4" style={{ backgroundColor: "#f0f4f8" }}>
                    <FeatherIcon icon="clock" size="48" className="text-muted" />
                  </div>
                  <h4 className="text-muted fw-bold">Coming Soon</h4>
                  <p className="text-muted">The {tabs.find(t => t.id === activeTab).label} section is under development.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>

      <style>{`
        .custom-navbar::-webkit-scrollbar { height: 6px; }
        .custom-navbar::-webkit-scrollbar-thumb { background: #b2ebf2; border-radius: 10px; }
        .animate__animated { animation-duration: 0.5s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate__fadeIn { animation-name: fadeIn; }
      `}</style>
      <div style={{ display: "none" }}>
        <DiagnosisPrintView
          ref={diagPrintRef}
          patient={formData}
          historyList={previousHistoryList.map(h => ({
            patient_date: h.date,
            height: "170", // Mock values for printing as in PHP it fetches from DB
            weight: "70",
            BP: "120/80",
            painscale: "2",
            presentcomplaints: "Sample complaint recorded in history."
          }))}
          diagnosisList={previousDiagnosisList.map(d => ({
            date_diagnosis: d.date,
            diagnosis: "Clinical Diagnosis",
            investigationorders: "Blood Test",
            advice: "Standard Plan"
          }))}
        />
      </div>
    </div>
  );
};

export default DoctorPatientDetails;
