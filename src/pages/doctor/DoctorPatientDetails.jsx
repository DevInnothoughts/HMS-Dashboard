import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
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

  const [diagnosisData, setDiagnosisData] = useState({
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
      varicose: [],
      prolapse: [],
      circumcision: "",
      abscess: "",
      fissure: "",
      ibs: "",
      urology: ""
    },
    medicines_prescribed: [],
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

  const [otherTestData, setOtherTestData] = useState({
    lab_type: "",
    test_date: new Date().toISOString().split("T")[0],
    test_type: [],
    refDoctor: "",
    testFeeStatus: "",
    visitType: "OPD",
    test_comment: ""
  });

  const [proctoscopyData, setProctoscopyData] = useState({
    procto_date: new Date().toISOString().split("T")[0],
    interpretation: "",
    images: []
  });

  const [prescriptionData, setPrescriptionData] = useState({
    prescription_type: "",
    creation_timestamp: new Date().toISOString().split("T")[0],
    allergy: "",
    doctor_id: "",
    surgical_advice: [],
    diagnosis: "",
    advicesx: "",
    admmisionnote: "",
    patient_type: "",
    next_appo_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    medicines: []
  });

  const [currentMedicine, setCurrentMedicine] = useState({
    name: "",
    qty: "",
    times: [],
    days: ""
  });

  const [surgeryData, setSurgeryData] = useState({
    admission_date: new Date().toISOString().split("T")[0],
    surgery_date: new Date().toISOString().split("T")[0],
    risk_consent: "",
    assistance_doctor: "",
    anaesthetist: "",
    anesthesia: [],
    anesthesia_other: "",
    surgery_remarks: "",
    plan: "",
    surgery_note: "",
    additional_comment: ""
  });

  const [dischargeData, setDischargeData] = useState({
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
    known_allergies: "",
    diagnosis: "",
    surgery_note: "",
    investigations: {
      HB: "", WBC: "", PLT: "", BSL: "", CREATININE: "", BILLIRUBIN: "", PSA: "", BT: "", CT: "", PT: "", INR: "", HIV: "Negative", HCV: "", HBSAG: "Negative"
    },
    extra_note: "",
    local_care: "",
    note_advice: "",
    fistula_cases: [],
    balloon_drain: ""
  });

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

      setFormData({
        Uid_no: initialPatient.Uid_no || initialPatient.uid || "",
        date: initialPatient.date || "",
        prefix: (initialPatient.prefix || "").trim(),
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
        patient_sex: initialPatient.sex || ""
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
    }
  }, [initialPatient]);

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
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
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
                <option value="Mr">Mr</option>
                <option value="MR">MR</option>
                <option value="Mrs">Mrs</option>
                <option value="MRS">MRS</option>
                <option value="Master">Master</option>
                <option value="Ms">Ms</option>
                <option value="MS">MS</option>
                <option value="Miss">Miss</option>
                <option value="Dr">Dr</option>
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
                {loading ? <Spinner size="sm" /> : <><FeatherIcon icon="save" size="18" className="me-2" /> UPDATE PERSONAL DOSSIER</>}
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
                />
              )}
              {activeTab === "follow-up" && (
                <FollowUpCard
                  followUpData={followUpData}
                  formData={formData}
                  handleFollowUpChange={handleFollowUpChange}
                />
              )}
              {activeTab === "other-tests" && (
                <OtherTestsCard
                  otherTestData={otherTestData}
                  handleOtherTestChange={handleOtherTestChange}
                  handleOtherTestCheckboxChange={handleOtherTestCheckboxChange}
                />
              )}
              {activeTab === "proctoscopy" && (
                <ProctoscopyCard
                  proctoscopyData={proctoscopyData}
                  formData={formData}
                  handleProctoscopyChange={handleProctoscopyChange}
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
                />
              )}
              {activeTab === "surgery-details" && (
                <SurgeryDetailsCard
                  surgeryData={surgeryData}
                  handleSurgeryChange={handleSurgeryChange}
                  handleSurgeryCheckboxChange={handleSurgeryCheckboxChange}
                />
              )}
              {activeTab === "discharge-card" && (
                <DischargeCard
                  dischargeData={dischargeData}
                  handleDischargeChange={handleDischargeChange}
                  handleDischargeInvestigationChange={handleDischargeInvestigationChange}
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
    </div>
  );
};

export default DoctorPatientDetails;
