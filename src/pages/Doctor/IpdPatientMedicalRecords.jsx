import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { useReactToPrint } from "react-to-print";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import DischargeCard from "./DischargeCard";
import DischargePrintView from "./DischargePrintView";
import IpdFeedbackForm from "../Ipd/IpdFeedbackForm";
import PageBreadcrumb from "../../components/PageBreadcrumb";
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

const BASE_URL = "http://194.195.117.79:5100/api";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const IpdPatientMedicalRecords = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(state?.patient);

  const [activeTab, setActiveTab] = useState("menu");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    setValidationErrors({});
  }, [activeTab]);

  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("default");
  const getActiveLoc = () => patient?.patient_location || currentLocation || "default";
  const [hasFetchedPatient, setHasFetchedPatient] = useState(false);

  const [formData, setFormData] = useState({
    Uid_no: "",
    adm_no: "",
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
  const [previousHistoryList, setPreviousHistoryList] = useState([]);
  const [historyForPrint, setHistoryForPrint] = useState(null);
  const fetchedHistoryCache = useRef({});

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
  const [previousDiagnosisList, setPreviousDiagnosisList] = useState([]);
  const [ipdFeedback, setIpdFeedback] = useState(null);

  const fetchDiagnosisDates = async () => {
    const patientId = formData.patient_id || patient?.patient_id;
    console.log("[DEBUG] fetchDiagnosisDates: patientId =", patientId, "formData.patient_id =", formData.patient_id, "patient?.patient_id =", patient?.patient_id);
    if (!patientId) return;
    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/list-diagnosis-dates/${patientId}?location=${getActiveLoc()}`,
        {
          headers: {
            location: getActiveLoc(),
            "x-hms-location": getActiveLoc(),
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
        console.log("[DEBUG] fetchDiagnosisDates: succeeded, found records:", formattedList.length);
        setPreviousDiagnosisList(formattedList);
      } else {
        console.log("[DEBUG] fetchDiagnosisDates: returned status", result.statusCode);
      }
    } catch (error) {
      console.error("Error fetching diagnosis dates:", error);
    }
  };

  const fetchHistoryDates = async () => {
    const patientId = formData.patient_id || patient?.patient_id;
    console.log("[DEBUG] fetchHistoryDates: patientId =", patientId, "formData.patient_id =", formData.patient_id, "patient?.patient_id =", patient?.patient_id);
    if (!patientId) return;
    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/list-history-dates/${patientId}?location=${getActiveLoc()}`,
        {
          headers: {
            location: getActiveLoc(),
            "x-hms-location": getActiveLoc(),
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
        console.log("[DEBUG] fetchHistoryDates: succeeded, found records:", formattedList.length);
        setPreviousHistoryList(formattedList);
      } else {
        console.log("[DEBUG] fetchHistoryDates: returned status", result.statusCode);
      }
    } catch (error) {
      console.error("Error fetching history dates:", error);
    }
  };

  const fetchIPDFeedback = async () => {
    const uidNo = formData.Uid_no || patient?.Uid_no || patient?.uid_no;
    if (!uidNo) return;
    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/admission/get-feedback?uidNo=${encodeURIComponent(uidNo)}&location=${getActiveLoc()}`
      );
      const result = await response.json();
      if (result.statusCode === 200 && result.data) {
        setIpdFeedback(result.data);
      } else {
        setIpdFeedback(null);
      }
    } catch (error) {
      console.error("Error fetching IPD Feedback:", error);
    }
  };

  const handleSelectDischarge = async (id) => {
    setSelectedDischargeId(id);
    const patientId = formData.patient_id || patient?.patient_id;
    if (!patientId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/V1/doctor/get-discharge-card/${patientId}?dischargeId=${id}&location=${getActiveLoc()}`,
        {
          headers: {
            location: getActiveLoc(),
            "x-hms-location": getActiveLoc(),
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
      address: formData.address,
    });
    toast.info("Started a new discharge summary");
  };

  useEffect(() => {
    const fetchPatientDetails = async () => {
      const patientId = state?.patient?.Uid_no || state?.patient?.uid_no || patient?.Uid_no || patient?.uid_no || state?.patient?.patient_id || patient?.patient_id;
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
          `${BASE_URL}/V1/patient/getPatient/${encodeURIComponent(patientId)}?location=${resolvedLocation}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (response.ok) {
          const resData = await response.json();
          if (resData.statusCode === 200 && resData.data) {
            setPatient((prev) => ({
              ...prev,
              ...resData.data,
            }));
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
      const rawPrefix = (patient.prefix || patient.Prefix || "").trim();
      const prefixOptions = ["MR", "MRS", "MASTER", "MISS"];
      let finalPrefix = rawPrefix.toUpperCase().replace(/\.$/, "");
      if (finalPrefix === "M/S") finalPrefix = "MISS";

      if (!prefixOptions.includes(finalPrefix)) {
        finalPrefix = "";
      }

      setFormData({
        Uid_no: patient.Uid_no || patient.uid || patient.uid_no || "",
        adm_no: patient.adm_no || patient.admissionNo || patient.admission_no || "",
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

      if (hasFetchedPatient) {
        fetchHistoryDates();
        fetchDiagnosisDates();
        fetchDischargeDates();
        fetchIPDFeedback();
      }
    }
  }, [patient, formData.patient_id, currentLocation, hasFetchedPatient]);

  const fetchDischargeDates = async () => {
    const patientId = formData.patient_id || patient?.patient_id;
    if (!patientId) return;

    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/list-discharge-dates/${patientId}?location=${getActiveLoc()}`,
      );
      if (!response.ok) return;
      const data = await response.json();
      if (data.statusCode === 200) {
        const mappedList = data.data.map((item) => {
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
        setPreviousDischargesList(mappedList);
        return mappedList;
      }
    } catch (error) {
      console.error("Error fetching discharge dates:", error);
    }
  };

  const [assistanceDoctors, setAssistanceDoctors] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [fistulaCases, setFistulaCases] = useState([]);

  useEffect(() => {
    const activeLoc = getActiveLoc();
    const fetchAssistanceDoctors = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/V1/doctor/assistanceDoctorDropdown?location=${activeLoc}`,
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
          `${BASE_URL}/V1/doctor/doctorDropdown?location=${activeLoc}`,
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
          `${BASE_URL}/V1/doctor/fistulaCasesDropdown?location=${activeLoc}`,
        );
        const result = await response.json();
        if (result.statusCode === 200) {
          setFistulaCases(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching fistula cases:", error);
      }
    };

    if (activeLoc && activeLoc !== "default") {
      fetchAssistanceDoctors();
      fetchDoctors();
      fetchFistulaCases();
    }
  }, [patient?.patient_location, currentLocation]);

  const handleDischargeChange = (field, value) => {
    setDischargeData((prev) => ({ ...prev, [field]: value }));

    if (field === "surgery_type" && Array.isArray(value)) {
      if (value.length === 0) {
        setDischargeData((prev) => ({
          ...prev,
          local_care: "",
          note_advice: "",
        }));
      } else {
        const queryParams = new URLSearchParams();
        value.forEach((val) => queryParams.append("surgery_type[]", val));

        fetch(
          `${BASE_URL}/V1/doctor/get-discharge-defaults?${queryParams.toString()}&location=${getActiveLoc()}`,
          {
            headers: {
              location: getActiveLoc(),
              "x-hms-location": getActiveLoc(),
            },
          },
        )
          .then((res) => res.json())
          .then((result) => {
            if (result.statusCode === 200 && result.data) {
              const defaults = result.data;
              if (defaults.local_care || defaults.note_advice) {
                setDischargeData((prev) => ({
                  ...prev,
                  local_care: defaults.local_care || prev.local_care,
                  note_advice: defaults.note_advice || prev.note_advice,
                }));
              }
            }
          })
          .catch((err) => {
            console.error("Error fetching surgery discharge defaults:", err);
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

    if (Object.keys(errors).length > 0) {
      Toast.fire({
        icon: "warning",
        title: "Please fill all mandatory/required fields which are not filled/selected yet",
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
        `${BASE_URL}/V1/doctor/save-discharge-card/${patientId}?location=${getActiveLoc()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            location: getActiveLoc(),
            "x-hms-location": getActiveLoc(),
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
              `${BASE_URL}/V1/doctor/get-discharge-card/${patientId}?date=${saveDate}&location=${getActiveLoc()}`,
              {
                headers: {
                  location: getActiveLoc(),
                  "x-hms-location": getActiveLoc(),
                },
              },
            );
            const result = await res.json();
            if (result.statusCode === 200 && result.data) {
              setDischargeData(result.data);
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
    if (previousHistoryList.length > 0) {
      setLoading(true);
      try {
        const latestHistoryId = previousHistoryList[0].id;
        let d = fetchedHistoryCache.current[latestHistoryId];
        if (!d) {
          const response = await fetch(
            `${BASE_URL}/V1/doctor/get-patient-history/${formData.patient_id}?historyId=${latestHistoryId}&location=${getActiveLoc()}`,
            {
              headers: {
                location: getActiveLoc(),
                "x-hms-location": getActiveLoc(),
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

  const dischargePrintRef = useRef();
  const triggerPrintDischarge = useReactToPrint({
    contentRef: dischargePrintRef,
  });

  const tabs = [
    { id: "discharge-card", label: "Discharge Card", icon: "log-out" },
    { id: "ipd-feedback", label: "IPD Feedback Form", icon: "file-text" },
  ];

  const isTabCompleted = (tabId) => {
    switch (tabId) {
      case "discharge-card":
        return previousDischargesList && previousDischargesList.length > 0;
      case "patient-history":
        return previousHistoryList && previousHistoryList.length > 0;
      case "diagnosis":
        return previousDiagnosisList && previousDiagnosisList.length > 0;
      case "ipd-feedback":
        return ipdFeedback !== null;
      default:
        return false;
    }
  };

  const isTabAccessible = (tabId) => {
    if (tabId === "discharge-card") {
      const historyOk = isTabCompleted("patient-history");
      const diagnosisOk = isTabCompleted("diagnosis");
      console.log("[DEBUG] isTabAccessible check for discharge-card: historyOk =", historyOk, "diagnosisOk =", diagnosisOk, "previousHistoryList =", previousHistoryList, "previousDiagnosisList =", previousDiagnosisList);
      return historyOk && diagnosisOk;
    }
    return true;
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
                    onClick={() => navigate(-1)}
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

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(135deg, #e0f7fa 0%, #80deea 100%)",
        minHeight: "100vh",
        padding: "10px",
      }}
    >
      <PageBreadcrumb pagename="IPD Patient Medical Records" />
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
                        IPD Patient Medical Records
                      </h4>
                      {formData.name && (
                        <div className="d-flex flex-wrap gap-2 align-items-center" style={{ fontSize: "13px" }}>
                          <span><strong>Admission No:</strong> {formData.adm_no || "N/A"}</span>
                          <span className="opacity-50">|</span>
                          <span><strong>Patient Name:</strong> {formData.prefix ? `${formData.prefix} ` : ""}{formData.name}</span>
                          <span className="opacity-50">|</span>
                          <span><strong>Contact No:</strong> {formData.phone || "N/A"}</span>
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
                            {!accessible ? (
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id={`tooltip-locked-${tab.id}`}>
                                    Fill history and diagnosis forms to be able to edit discharge card.
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
                      color: "#ffffff",
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
                    {formData.name && (
                      <div className="d-flex flex-wrap gap-2 align-items-center text-muted" style={{ fontSize: "12px", marginTop: "2px" }}>
                        <span><strong>Admission No:</strong> {formData.adm_no || "N/A"}</span>
                        <span className="opacity-50">|</span>
                        <span><strong>Patient:</strong> {formData.prefix ? `${formData.prefix} ` : ""}{formData.name}</span>
                        <span className="opacity-50">|</span>
                        <span><strong>Contact:</strong> {formData.phone || "N/A"}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div></div>
              </div>
              <Card.Body className="p-5" style={{ backgroundColor: "#ffffff" }}>
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
                {activeTab === "ipd-feedback" && (
                  <IpdFeedbackForm
                    patient={formData}
                    location={getActiveLoc()}
                    BASE_URL={BASE_URL}
                    onSubmitSuccess={fetchIPDFeedback}
                  />
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
    </div>
  );
};

export default IpdPatientMedicalRecords;
