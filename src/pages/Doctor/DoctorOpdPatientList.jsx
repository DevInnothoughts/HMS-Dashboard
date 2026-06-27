import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import { FilterMatchMode } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useReactToPrint } from "react-to-print";
import FeatherIcon from "feather-icons-react";
import FollowUpPrintView from "./FollowUpPrintView";
import DiagnosisPrintView from "./DiagnosisPrintView";
import OpdPrescriptionPrintView from "./OpdPrescriptionPrintView";
import DischargePrintView from "./DischargePrintView";
import { Link, useNavigate } from "react-router-dom";
import { decodeJwt } from "../../utils/decode-jwt";
import Swal from "sweetalert2";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Button,
  Spinner,
} from "react-bootstrap";
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
// import NavBarP from "../../components/NavbarP";

// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://194.195.117.79:5100/api";


const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};



export default function DoctorOpdPatientList() {
  const location = "demo";
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();
  const [filters1, setFilters1] = useState({
    // global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    global: { value: null, matchMode: FilterMatchMode.EQUALS },
    diagnosisAdvice: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [adviceFilter, setAdviceFilter] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDbSearching, setIsDbSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentLocation, setCurrentLocation] = useState("default");

  // Print related state
  const fupPrintRef = useRef();
  const [printData, setPrintData] = useState({
    patient: null,
    history: [],
    diagnosis: [],
    followup: {},
    prescription: null,
    discharge: null,
  });
  const [isPrintReady, setIsPrintReady] = useState(false);

  const triggerPrint = useReactToPrint({
    contentRef: fupPrintRef,
  });

  useEffect(() => {
    if (isPrintReady) {
      triggerPrint();
      setIsPrintReady(false);
    }
  }, [isPrintReady]);

  const formatToApiDate = (date) => {
    const validDate = date instanceof Date ? date : new Date(date);
    if (isNaN(validDate)) return null;
    const day = String(validDate.getDate()).padStart(2, "0");
    const month = String(validDate.getMonth() + 1).padStart(2, "0");
    const year = validDate.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  const fetchDropdownData = async () => {
    if (!currentLocation || currentLocation === "default") return;

    try {
      const doctorResponse = await fetch(
        `${BASE_URL}/V1/doctor/doctorDropdown?location=${currentLocation}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (doctorResponse.ok) {
        const doctorData = await doctorResponse.json();

        setDoctors(Array.isArray(doctorData.data) ? doctorData.data : []);
      } else {
        console.error("Failed to fetch doctors:", doctorResponse.statusText);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error.message);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, [currentLocation]);

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

  const getConditionLabel = (rowData) => {
    const diagnosisText = String(rowData?.diagnosis || "").toLowerCase();
    if (!diagnosisText.trim()) return "-";

    const labels = [];
    const addLabel = (label) => {
      if (!labels.includes(label)) labels.push(label);
    };

    if (/haemorrhoid|hemorrhoid|hemorrhoids?/.test(diagnosisText))
      addLabel("piles");
    if (diagnosisText.includes("fistula")) addLabel("fistula");
    if (diagnosisText.includes("hernia")) addLabel("hernia");
    if (diagnosisText.includes("varicose")) addLabel("varicose veins");
    if (diagnosisText.includes("prolapse")) addLabel("prolapse");
    if (
      diagnosisText.includes("circumcision") ||
      diagnosisText.includes("phimosis") ||
      diagnosisText.includes("balanoposthitis") ||
      diagnosisText.includes("frenulum")
    ) {
      addLabel("circumcision");
    }
    if (
      diagnosisText.includes("abscess") ||
      diagnosisText.includes("infected sebaceous cyst")
    ) {
      addLabel("abscess");
    }
    if (diagnosisText.includes("fissure")) addLabel("fissure");
    if (diagnosisText.includes("hydrocele")) addLabel("hydrocele");
    if (diagnosisText.includes("lipoma")) addLabel("lipoma");
    if (diagnosisText.includes("gynecomastia")) addLabel("gynecomastia");
    if (diagnosisText.includes("pilonidal")) addLabel("pilonidal sinus");
    if (
      diagnosisText.includes("cyst") &&
      !diagnosisText.includes("infected sebaceous cyst")
    ) {
      addLabel("cyst");
    }
    if (
      diagnosisText.includes("prostate") ||
      diagnosisText.includes("urethra") ||
      diagnosisText.includes("kidney stone") ||
      diagnosisText.includes("urology")
    ) {
      addLabel("urology");
    }
    if (diagnosisText.includes("other")) addLabel("other");

    return labels.length ? labels.join(" + ") : rowData.diagnosis || "-";
  };

  const fetchPatientsData = async () => {
    if (!currentLocation || currentLocation === "default") {
      console.warn("Location not set yet, skipping patient fetch.");
      return;
    }
    setLoading(true);
    try {
      const url = new URL(
        `${BASE_URL}/V1/patient/listPatient?location=${encodeURIComponent(
          currentLocation,
        )}`,
      );

      // Create an empty params object
      const params = {};

      // ONLY add dates if they are explicitly selected/truthy
      // If your state defaults to null or "", this will prevent them from being sent
      if (fromDate) params.from = formatToApiDate(fromDate);
      if (toDate) params.to = formatToApiDate(toDate);

      Object.keys(params).forEach((key) => {
        if (params[key]) url.searchParams.append(key, params[key]);
      });

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok) {
        setPatients(data.data || []);
      } else {
        console.error("Error:", data.message);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchFromDatabase = async (query) => {
    if (!currentLocation || isDbSearching) return;

    setIsDbSearching(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/patient/searchPatient?query=${encodeURIComponent(
          query,
        )}&location=${currentLocation}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (response.ok) {
        const result = await response.json();
        if (result && result.data && result.data.length > 0) {
          setPatients((prev) => {
            const existingIds = new Set(prev.map((p) => String(p.patient_id)));
            const uniqueNew = result.data.filter(
              (p) => !existingIds.has(String(p.patient_id)),
            );
            return [...prev, ...uniqueNew];
          });
        }
      }
    } catch (error) {
      console.error("Error searching from database:", error);
    } finally {
      setIsDbSearching(false);
    }
  };

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 3) return;

    const hasLocalMatches = patients.some((p) => {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        (p.Uid_no && p.Uid_no.toLowerCase().includes(lowerSearch)) ||
        (p.name && p.name.toLowerCase().includes(lowerSearch)) ||
        (p.phone && String(p.phone).includes(searchTerm))
      );
    });

    if (!hasLocalMatches) {
      const delayDebounceFn = setTimeout(() => {
        searchFromDatabase(searchTerm);
      }, 800);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, patients]);

  useEffect(() => {
    if (currentLocation && currentLocation !== "default") {
      fetchPatientsData();
      fetchDropdownData();
    }
  }, [currentLocation, fromDate, toDate]);

  const handlePrintFollowUp = async (patient) => {
    setLoading(true);
    const headers = {
      "Content-Type": "application/json",
      location: currentLocation,
      "x-hms-location": currentLocation,
    };
    try {
      const historyDatesRes = await fetch(
        `${BASE_URL}/V1/doctor/list-history-dates/${patient.patient_id}?location=${currentLocation}`,
        { headers },
      );
      const historyDates = await historyDatesRes.json();
      const historyFull = await Promise.all(
        (historyDates.data || []).map(async (h) => {
          const res = await fetch(
            `${BASE_URL}/V1/doctor/get-patient-history/${patient.patient_id}?historyId=${h.id}&location=${currentLocation}`,
            { headers },
          );
          const data = await res.json();
          return data.statusCode === 200 ? data.data : null;
        }),
      );

      const diagDatesRes = await fetch(
        `${BASE_URL}/V1/doctor/list-diagnosis-dates/${patient.patient_id}?location=${currentLocation}`,
        { headers },
      );
      const diagDates = await diagDatesRes.json();
      if (!diagDates.data || diagDates.data.length === 0) {
        Swal.fire(
          "Incomplete Forms",
          "Not all forms are completed to print so fill all the respective forms to print (Diagnosis missing).",
          "warning",
        );
        setLoading(false);
        return;
      }

      const diagFull = await Promise.all(
        (diagDates.data || []).map(async (d) => {
          const res = await fetch(
            `${BASE_URL}/V1/doctor/get-diagnosis/${patient.patient_id}?date=${d.date}&location=${currentLocation}`,
            { headers },
          );
          const data = await res.json();
          if (data.statusCode === 200 && data.data) {
            const diag = data.data;
            const assistDoc = doctors.find(
              (doc) => doc.doctor_id == diag.assistance_doctor,
            );
            const consultDoc = doctors.find(
              (doc) => doc.doctor_id == diag.consultant_doctor,
            );
            return {
              ...diag,
              assistanceDoctorName: assistDoc
                ? assistDoc.name
                : diag.assistance_doctor,
              consultantDoctorName: consultDoc
                ? consultDoc.name
                : diag.consultant_doctor,
            };
          }
          return null;
        }),
      );

      const followupRes = await fetch(
        `${BASE_URL}/V1/doctor/get-followup-details/${patient.patient_id}?location=${currentLocation}`,
        { headers },
      );
      const followupData = await followupRes.json();
      if (
        followupData.statusCode !== 200 ||
        !followupData.data ||
        Object.keys(followupData.data).length === 0
      ) {
        Swal.fire(
          "Incomplete Forms",
          "Not all forms are completed to print so fill all the respective forms to print (FollowUp missing).",
          "warning",
        );
        setLoading(false);
        return;
      }

      const opdDatesRes = await fetch(
        `${BASE_URL}/V1/doctor/list-opd-prescription-dates/${patient.patient_id}?location=${currentLocation}`,
        { headers },
      );
      const opdDates = await opdDatesRes.json();
      if (!opdDates.data || opdDates.data.length === 0) {
        Swal.fire(
          "Incomplete Forms",
          "Not all forms are completed to print so fill all the respective forms to print (OPD Prescription missing).",
          "warning",
        );
        setLoading(false);
        return;
      }

      const latestOpdDate = moment(opdDates.data[0].date, "DD-MM-YYYY").format(
        "YYYY-MM-DD",
      );
      const opdDetailsRes = await fetch(
        `${BASE_URL}/V1/doctor/get-opd-prescription/${patient.patient_id}/${latestOpdDate}?location=${currentLocation}`,
        { headers },
      );
      const opdDetails = await opdDetailsRes.json();

      let parsedOpd = null;
      if (opdDetails.statusCode === 200 && opdDetails.data) {
        const d = opdDetails.data;
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
        parsedOpd = {
          ...d,
          surgical_advice: toArray(d.surgical_advice),
          uroadvice: toArray(d.uroadvice),
          preopinvestigation: toArray(d.preopinvestigation),
          medicines: safeMedicines(d.medicines),
        };
      }

      const dischargeDatesRes = await fetch(
        `${BASE_URL}/V1/doctor/list-discharge-dates/${patient.patient_id}?location=${currentLocation}`,
        { headers },
      );
      const dischargeDates = await dischargeDatesRes.json();
      if (!dischargeDates.data || dischargeDates.data.length === 0) {
        Swal.fire(
          "Incomplete Forms",
          "Not all forms are completed to print so fill all the respective forms to print (Discharge Card missing).",
          "warning",
        );
        setLoading(false);
        return;
      }

      const latestDischargeId = dischargeDates.data[0].id;
      const dischargeDetailsRes = await fetch(
        `${BASE_URL}/V1/doctor/get-discharge-card/${patient.patient_id}?dischargeId=${latestDischargeId}&location=${currentLocation}`,
        { headers },
      );
      const dischargeDetails = await dischargeDetailsRes.json();

      setPrintData({
        patient: patient,
        history: historyFull.filter(Boolean),
        diagnosis: diagFull.filter(Boolean),
        followup: followupData.statusCode === 200 ? followupData.data : {},
        prescription: parsedOpd,
        discharge:
          dischargeDetails.statusCode === 200 ? dischargeDetails.data : null,
      });
      setIsPrintReady(true);
    } catch (error) {
      console.error("Print FollowUp Error:", error);
      toast.error("Failed to load patient data for printing.");
    } finally {
      setLoading(false);
    }
  };

  const actionBodyTemplate = (patient) => (
    <div className="d-flex align-items-center justify-content-center">
      <Button
        variant="primary"
        className="btn-primary btn-extra-small btn-icon me-2"
        title="View"
        onClick={() =>
          navigate("/personal-details-card", { state: { patient } })
        }
        style={{
          borderRadius: "6px",
          padding: "5px 8px",
        }}
      >
        <FeatherIcon icon="eye" size="16" />
      </Button>
      <Button
        variant="primary"
        className="btn-primary btn-extra-small btn-icon"
        title="Print All Forms"
        onClick={() => handlePrintFollowUp(patient)}
      >
        <FeatherIcon icon="printer" size="16" />
      </Button>
    </div>
  );

  const renderReferenceDetails = () => {
    switch (formData.reference_type) {
      case "newspaper":
        return (
          <div className="control-group">
            <label
              className="control-label"
              style={{
                marginTop: "20px",
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              Newspaper / Magazine
            </label>
            <div
              className="controls"
              style={{
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
                fontSize: "10px",
              }}
            >
              <ul
                className="checkbox-grid"
                style={{
                  display: "flex",
                  padding: 5,
                  marginBottom: "5px",
                  fontSize: "10px",
                }}
              >
                {["Sakal", "TOI", "MT", "Lokmat", "Pune Mirror"].map(
                  (paper) => (
                    <li
                      key={paper}
                      style={{
                        listStyleType: "none",
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        marginRight: "50px",
                        transform: "scale(1.2)",
                      }}
                    >
                      <input
                        type="radio"
                        name="newspaper"
                        value={paper}
                        onChange={(e) => {
                          const val = e.target.value;
                          setReferenceDetails((prev) => ({
                            ...prev,
                            newspaper: val,
                          }));
                          setFormData((prev) => ({
                            ...prev,
                            ref: val,
                            reference_type: "newspaper",
                          }));
                        }}
                        checked={formData.ref === paper}
                        style={{ marginRight: "5px" }}
                      />
                      {paper}
                    </li>
                  ),
                )}
              </ul>
              <input
                style={{
                  border: "2px solid rgb(77, 208, 225)",
                  fontSize: "12px",
                  borderRadius: "10px",
                }}
                className="form-control"
                type="text"
                name="Other_Newspaper"
                placeholder="Other"
                value={referenceDetails.Other_Newspaper || ""}
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
              />
            </div>
          </div>
        );

      case "family_friends":
        return (
          <div className="control-group">
            <label
              className="control-label"
              style={{
                marginTop: "20px",
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              Family / Friends Details
            </label>
            <div className="controls" style={{ display: "flex", gap: "10px" }}>
              <input
                className="form-control"
                type="text"
                placeholder="Friend Name"
                style={{
                  border: "2px solid rgb(77, 208, 225)",
                  fontSize: "12px",
                  borderRadius: "10px",
                }}
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
              />
              <input
                className="form-control"
                type="text"
                placeholder="Friend Number"
                style={{
                  border: "2px solid rgb(77, 208, 225)",
                  fontSize: "12px",
                  borderRadius: "10px",
                }}
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
              />
            </div>
          </div>
        );

      case "old_ref":
        return (
          <div className="control-group">
            <label
              className="control-label"
              style={{
                marginTop: "10px",
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              Patient Reference
            </label>
            <div
              className="controls"
              style={{
                display: "flex",
                gap: "10px",
                fontSize: "10px",
                position: "relative",
              }}
            >
              <input
                className="form-control"
                type="tel"
                name="patient_ref_no"
                onWheel={(e) => e.target.blur()}
                placeholder="Enter Contact Number"
                value={oldPatientDetails.patient_ref_no || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,10}$/.test(value)) {
                    setOldPatientDetails((prev) => ({
                      ...prev,
                      patient_ref_no: value,
                    }));
                    setFormData((prev) => ({
                      ...prev,
                      reference_type: "old_ref",
                    }));
                    searchPatientByPhone(value);
                  }
                }}
                maxLength="10"
                style={{
                  flex: "1",
                  minWidth: "200px",
                  border: "2px solid rgb(77, 208, 225)",
                  fontSize: "12px",
                  borderRadius: "10px",
                }}
              />

              {(isSearchingPatient || patientSearchResults.length > 0) && (
                <div
                  className="search-results"
                  style={{
                    position: "absolute",
                    top: "40px",
                    zIndex: 1000,
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    fontSize: "15px",
                    width: "300px",
                  }}
                >
                  {isSearchingPatient && (
                    <div style={{ padding: "10px" }}>Searching...</div>
                  )}
                  {patientSearchResults.map((patient, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "10px",
                        cursor: "pointer",
                        borderBottom: "1px solid #eee",
                      }}
                      onClick={() => {
                        setOldPatientDetails({
                          patient_ref_no: patient.phone || "",
                          old_patient_name: patient.name || "",
                          old_patient_id_value: patient.patient_id || "",
                          old_patient_pincode: patient.pincode || "",
                        });
                        setPatientSearchResults([]);
                        setFormData((prev) => ({
                          ...prev,
                          reference_type: "old_ref",
                          ref: `${patient.phone},${patient.name},${patient.patient_id},${patient.pincode}`,
                        }));
                      }}
                    >
                      <strong>{patient.name}</strong> - {patient.phone}
                    </div>
                  ))}
                </div>
              )}

              <input
                className="form-control"
                type="text"
                name="old_patient_name"
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
                  flex: "1",
                  minWidth: "200px",
                  border: "2px solid rgb(77, 208, 225)",
                  fontSize: "12px",
                  borderRadius: "10px",
                }}
              />

              <input
                className="form-control"
                type="text"
                name="old_patient_pincode"
                placeholder="Pincode"
                value={oldPatientDetails.old_patient_pincode || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setOldPatientDetails((prev) => ({
                    ...prev,
                    old_patient_pincode: val,
                  }));
                  setFormData((prev) => ({
                    ...prev,
                    reference_type: "old_ref",
                  }));
                }}
                style={{
                  flex: "1",
                  minWidth: "200px",
                  border: "2px solid rgb(77, 208, 225)",
                  fontSize: "12px",
                  borderRadius: "10px",
                }}
              />
            </div>
          </div>
        );

      case "internet":
        return (
          <div className="control-group">
            <label
              className="control-label"
              style={{
                marginTop: "20px",
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              Internet
            </label>
            <div
              className="controls"
              style={{
                display: "flex",
                alignItems: "center",

                whiteSpace: "nowrap",
              }}
            >
              <ul
                className="checkbox-grid"
                style={{
                  display: "flex",
                  padding: 0,
                  flexDirection: "row",
                  margin: "10px",
                  fontSize: "10px",
                }}
              >
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
                  <li
                    key={source}
                    style={{
                      listStyleType: "none",
                      display: "flex",
                      alignItems: "center",
                      marginRight: "40px",
                      cursor: "pointer",
                      transform: "scale(1.2)",
                    }}
                  >
                    <input
                      type="radio"
                      name="internet"
                      value={source}
                      onChange={(e) => {
                        const val = e.target.value;
                        setReferenceDetails((prev) => ({
                          ...prev,
                          internet: val,
                        }));
                        setFormData((prev) => ({
                          ...prev,
                          ref: val,
                          reference_type: "internet",
                        }));
                      }}
                      // checked={referenceDetails.internet === source}
                      checked={
                        formData.ref === source ||
                        referenceDetails.internet === source
                      }
                      style={{ marginRight: "5px" }}
                    />
                    {source}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case "MediaRef":
        return (
          <div className="control-group">
            <label
              className="control-label"
              style={{
                marginTop: "20px",
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              Entertainment Media
            </label>
            <div
              className="controls"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <ul
                className="checkbox-grid"
                style={{ display: "flex", margin: "5px", fontSize: "10px" }}
              >
                {["Radio"].map((media) => (
                  <li
                    key={media}
                    style={{
                      listStyleType: "none",
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      marginRight: "100px",
                      transform: "scale(1.2)",
                    }}
                  >
                    <input
                      type="radio"
                      name="MediaRef"
                      value={media}
                      onChange={(e) => {
                        const val = e.target.value;
                        setReferenceDetails((prev) => ({
                          ...prev,
                          MediaRef: val,
                        }));
                        setFormData((prev) => ({
                          ...prev,
                          ref: val,
                          reference_type: "MediaRef",
                        }));
                      }}
                      // checked={referenceDetails.MediaRef === media}
                      checked={formData.ref === media}
                      style={{ marginRight: "5px" }}
                    />
                    {media}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case "TVShow":
        return (
          <div className="control-group">
            <label
              className="control-label"
              style={{
                marginTop: "20px",
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              TV Show
            </label>
            <div
              className="controls"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                margin: 0,
                padding: 0,
                width: "100%",
              }}
            >
              <ul
                className="checkbox-grid"
                style={{
                  display: "flex",
                  margin: 0,
                  padding: 0,
                  gap: "20px",
                  whiteSpace: "nowrap",
                  fontSize: "12px",
                }}
              >
                {[
                  "Zee 24 Taas",
                  "IBN Lokmat",
                  "Saam TV",
                  "Zee Marathi",
                  "TV9",
                  "Others",
                ].map((show) => (
                  <li
                    key={show}
                    style={{
                      listStyleType: "none",
                      display: "flex",
                      alignItems: "center",
                      marginRight: "10px",
                      cursor: "pointer",
                      transform: "scale(1)",
                    }}
                  >
                    <input
                      type="radio"
                      name="TVShow"
                      value={show}
                      onChange={(e) => {
                        const val = e.target.value;
                        setReferenceDetails((prev) => ({
                          ...prev,
                          TVShow: val,
                        }));
                        setFormData((prev) => ({
                          ...prev,
                          ref: val,
                          reference_type: "TVShow",
                        }));
                      }}
                      // checked={referenceDetails.TVShow === show}
                      checked={formData.ref === show}
                      style={{ marginRight: "5px" }}
                    />
                    {show}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case "dr_ref":
        return (
          <div className="control-group">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "5px",
              }}
            >
              <label
                className="control-label"
                style={{
                  marginTop: "15px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                Doctor Reference{" "}
                {isManualEntry ? "(Manual Entry)" : "(Search as you type)"}
              </label>

              {/* Show Add button only if search returns nothing and we aren't already in manual mode */}
              {!isSearching &&
                referenceDetails.dr_name?.length >= 2 &&
                doctorSearchResults.length === 0 &&
                !isManualEntry && (
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{
                      marginTop: "10px",
                      fontSize: "12px",
                      backgroundColor: "#003138ff",
                      color: "white",
                      borderRadius: "5px",
                    }}
                    onClick={() => setIsManualEntry(true)}
                  >
                    + Add New Doctor Reference
                  </button>
                )}

              {isManualEntry && (
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    marginTop: "10px",
                    fontSize: "10px",
                    backgroundColor: "#ff8a80",
                    color: "white",
                    borderRadius: "5px",
                  }}
                  onClick={() => {
                    setIsManualEntry(false);
                    setReferenceDetails({
                      dr_name: "",
                      dr_contact: "",
                      dr_specialty: "",
                      dr_location: "",
                    });
                  }}
                >
                  Reset / Search Again
                </button>
              )}
            </div>

            <Row className="g-2">
              <Col md={3} style={{ position: "relative" }}>
                <input
                  className="form-control"
                  type="text"
                  autoComplete="off"
                  placeholder="Type Doctor Name"
                  style={{
                    border: "2px solid rgb(77, 208, 225)",
                    fontSize: "12px",
                    borderRadius: "10px",
                  }}
                  value={referenceDetails.dr_name || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setReferenceDetails((prev) => ({ ...prev, dr_name: val }));
                    if (!isManualEntry) searchDoctorByName(val);
                  }}
                />

                {/* Search Results Dropdown */}
                {!isManualEntry &&
                  (isSearching || doctorSearchResults.length > 0) && (
                    <div
                      style={{
                        position: "absolute",
                        zIndex: 1000,
                        top: "40px",
                        width: "100%",
                        backgroundColor: "white",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        maxHeight: "200px",
                        overflowY: "auto",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      }}
                    >
                      {isSearching && (
                        <div className="p-2 text-muted">Searching...</div>
                      )}
                      {doctorSearchResults.map((doc, idx) => (
                        <div
                          key={idx}
                          style={{
                            cursor: "pointer",
                            borderBottom: "1px solid #eee",
                            padding: "10px",
                          }}
                          onClick={() => {
                            setReferenceDetails({
                              dr_name: doc.ref_doctor_name,
                              dr_contact:
                                doc.ref_doctor_phone || doc.reference_doctor_no,
                              dr_specialty: doc.reference_doctor_speciality,
                              dr_location: doc.reference_doctor_location,
                            });
                            setFormData((prev) => ({
                              ...prev,
                              ref: doc.ref_doctor_name,
                            }));
                            setDoctorSearchResults([]);
                          }}
                        >
                          <div className="fw-bold" style={{ fontSize: "12px" }}>
                            {doc.ref_doctor_name}
                          </div>
                          <div className="text-muted small">
                            {doc.reference_doctor_speciality} |{" "}
                            {doc.reference_doctor_location}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </Col>

              <Col md={3}>
                <input
                  className="form-control"
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
                    border: "2px solid rgb(77, 208, 225)",
                    fontSize: "12px",
                    borderRadius: "10px",
                    backgroundColor: isManualEntry ? "#fff" : "#e7ebebff",
                    cursor: isManualEntry ? "text" : "not-allowed",
                  }}
                />
              </Col>

              <Col md={3}>
                <input
                  className="form-control"
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
                    border: "2px solid rgb(77, 208, 225)",
                    fontSize: "12px",
                    borderRadius: "10px",
                    backgroundColor: isManualEntry ? "#fff" : "#e7ebebff",
                    cursor: isManualEntry ? "text" : "not-allowed",
                  }}
                />
              </Col>

              <Col md={3}>
                <input
                  className="form-control"
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
                    border: "2px solid rgb(77, 208, 225)",
                    fontSize: "12px",
                    borderRadius: "10px",
                    backgroundColor: isManualEntry ? "#fff" : "#e7ebebff",
                    cursor: isManualEntry ? "text" : "not-allowed",
                  }}
                />
              </Col>
            </Row>
          </div>
        );

      case "hhc_board":
        return (
          <div className="control-group">
            <label
              className="control-label"
              style={{
                marginTop: "20px",
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              HHC Board Reference
            </label>
            <div className="controls">
              <ul
                className="checkbox-grid"
                style={{
                  display: "flex",
                  padding: 5,
                  marginBottom: "5px",
                  fontSize: "10px",
                }}
              >
                <li
                  style={{
                    listStyleType: "none",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    transform: "scale(1.2)",
                  }}
                >
                  <input
                    type="radio"
                    name="hhc_board_radio"
                    value="HHC Board"
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        ref: e.target.value,
                        reference_type: "hhc_board",
                      }));
                      setReferenceDetails((prev) => ({
                        ...prev,
                        HHC_board: e.target.value,
                      }));
                    }}
                    checked={formData.ref === "HHC Board"}
                    style={{ marginRight: "5px" }}
                  />
                  HHC Board
                </li>
              </ul>
            </div>
          </div>
        );

      case "HHF":
        return (
          <div className="control-group">
            <label className="control-label">HHF</label>
            <div className="controls">
              <ul className="checkbox-grid">
                <li>
                  <input
                    type="radio"
                    name="HHF"
                    value="HHF"
                    onChange={(e) => {
                      handleReferenceChange(e);
                      setFormData((prev) => ({
                        ...prev,
                        ref: "HHF",
                        reference_type: "HHF",
                      }));
                    }}
                    checked={referenceDetails.HHF === "HHF"}
                    style={{ marginRight: "10px", transform: "scale(1.2)" }}
                  />
                  HHF
                </li>
              </ul>
            </div>
          </div>
        );
      case "other":
        return (
          <div className="control-group">
            <label
              className="control-label"
              style={{
                marginTop: "20px",
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              Other Detail
            </label>
            <div className="controls">
              <input
                className="form-control"
                type="text"
                name="other_detail"
                placeholder="Enter other details"
                style={{
                  border: "2px solid rgb(77, 208, 225)",
                  fontSize: "12px",
                  borderRadius: "10px",
                }}
                value={referenceDetails.other || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setReferenceDetails((prev) => ({ ...prev, other: val }));
                  setFormData((prev) => ({
                    ...prev,
                    ref: val,
                    reference_type: "other",
                  }));
                }}
              />
            </div>
          </div>
        );
      case "WOM":
        return (
          <div className="control-group">
            <label className="control-label">WOM Detail</label>
            <div className="controls">
              <ul className="checkbox-grid">
                <li>
                  <input
                    className="form-control"
                    type="text"
                    name="WOM"
                    placeholder="Other"
                    value={referenceDetails.WOM || ""}
                    onChange={(e) => {
                      handleReferenceChange(e);
                      setFormData((prev) => ({
                        ...prev,
                        ref: e.target.value,
                        reference_type: "WOM",
                      }));
                    }}
                  />
                </li>
              </ul>
            </div>
          </div>
        );
      case "awareness_lecture":
        return (
          <div className="control-group">
            <label
              className="control-label"
              style={{
                marginTop: "20px",
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              Awareness Lecture
            </label>
            <div className="controls">
              <input
                className="form-control"
                type="text"
                name="awareness_lecture"
                placeholder="Other"
                style={{
                  border: "2px solid rgb(77, 208, 225)",
                  fontSize: "12px",
                  borderRadius: "10px",
                }}
                value={referenceDetails.awareness_lecture || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setReferenceDetails((prev) => ({
                    ...prev,
                    awareness_lecture: val,
                  }));
                  setFormData((prev) => ({
                    ...prev,
                    ref: val,
                    reference_type: "awareness_lecture",
                  }));
                }}
              />
            </div>
          </div>
        );
      case "treated_past":
        return (
          <div className="control-group">
            <label
              className="control-label"
              style={{
                marginTop: "20px",
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              Self Old Pt
            </label>
            <div className="controls">
              <ul
                className="checkbox-grid"
                style={{
                  display: "flex",
                  fontSize: "10px",
                  marginLeft: "10px",
                }}
              >
                {["Already Operated", "Already Visited"].map((status) => (
                  <li
                    key={status}
                    style={{
                      listStyleType: "none",
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      marginRight: "100px",
                      transform: "scale(1.2)",
                    }}
                  >
                    <input
                      type="radio"
                      name="treated_past_status"
                      value={status}
                      onChange={(e) => {
                        const val = e.target.value;
                        setReferenceDetails((prev) => ({
                          ...prev,
                          treated_past_status: val,
                        }));
                        setFormData((prev) => ({
                          ...prev,
                          ref: val,
                          reference_type: "treated_past",
                        }));
                      }}
                      checked={formData.ref === status}
                    />
                    {status}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case "hhc_branch":
        return (
          <div className="control-group">
            <label
              className="control-label"
              style={{
                marginTop: "20px",
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              HHC Branch
            </label>
            <div className="controls">
              <input
                className="form-control"
                type="text"
                name="hhc_branch"
                placeholder="Enter Branch Name"
                style={{
                  border: "2px solid rgb(77, 208, 225)",
                  fontSize: "12px",
                  borderRadius: "10px",
                }}
                value={referenceDetails.hhc_branch || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setReferenceDetails((prev) => ({
                    ...prev,
                    hhc_branch: val,
                  }));
                  setFormData((prev) => ({
                    ...prev,
                    ref: val,
                    reference_type: "hhc_branch",
                  }));
                }}
              />
            </div>
          </div>
        );
      case "aggregators":
        return (
          <div className="control-group">
            <label
              className="control-label"
              style={{
                marginTop: "20px",
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              Aggregators
            </label>
            <div
              className="controls"
              style={{ display: "flex", alignItems: "center" }}
            >
              <ul
                className="checkbox-grid"
                style={{
                  display: "flex",
                  padding: 5,
                  marginBottom: "5px",
                  flexWrap: "wrap",
                  gap: "25px",
                  fontSize: "12px",
                }}
              >
                {["Mediend", "Hexa", "Practo", "Medibuddy", "Mykare"].map(
                  (aggregator) => (
                    <li
                      key={aggregator}
                      style={{
                        listStyleType: "none",
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        transform: "scale(1.0)",
                      }}
                    >
                      <input
                        type="radio"
                        name="aggregators"
                        value={aggregator}
                        onChange={(e) => {
                          const val = e.target.value;
                          setReferenceDetails((prev) => ({
                            ...prev,
                            aggregators: val,
                          }));
                          setFormData((prev) => ({
                            ...prev,
                            ref: val,
                            reference_type: "aggregators",
                          }));
                        }}
                        checked={formData.ref === aggregator}
                        style={{ marginRight: "1px" }}
                      />
                      {aggregator}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleReferenceChange = (e) => {
    const { name, value } = e.target;

    setSelectedReference(value);
    setFormData((prev) => ({
      ...prev,
      reference_type: value,
    }));
  };

  const [selectedReference, setSelectedReference] = useState("");
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

  const [oldPatientDetails, setOldPatientDetails] = useState({
    patient_ref_no: "",
    old_patient_name: "",
    old_patient_id_value: "",
    old_patient_pincode: "",
  });

  const handleAdviceFilterChange = (e) => {
    const value = e.target.value;
    const updatedFilters = { ...filters1 };

    if (value) {
      updatedFilters.diagnosisAdvice = {
        value,
        matchMode: FilterMatchMode.CONTAINS,
      };
    } else {
      updatedFilters.diagnosisAdvice = {
        value: null,
        matchMode: FilterMatchMode.CONTAINS,
      };
    }

    setAdviceFilter(value);
    setFilters1(updatedFilters);
  };

  const renderAdviceHeader = () => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <span style={{ fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
        Advice Treatment
      </span>
      <Form.Select
        size="sm"
        value={adviceFilter}
        onChange={handleAdviceFilterChange}
        style={{
          width: "150px",
          fontSize: "12px",
          padding: "4px 6px",
          borderRadius: "6px",
          border: "1px solid #90caf9",
        }}
      >
        <option value="">All</option>
        <option value="Medication">Medication</option>
        <option value="Surgery">Surgery</option>
        <option value="Test">Test</option>
        <option value="MCDPA">MCDPA</option>
        <option value="Referred to another doctor">Referred to another doctor</option>
      </Form.Select>
    </div>
  );

  const renderHeader = () => (
    <div
      style={{
        border: "1px solid #4dd0e1",
        textAlign: "center",
        borderRadius: "8px",
        padding: "10px",
        backgroundColor: "#e0f7fa",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                marginRight: "8px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Show
            </span>
            <Form.Select
              size="sm"
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value))}
              style={{
                width: "70px",
                height: "30px",
                border: "1px solid #4dd0e1",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Form.Select>
          </div>

          <Form.Group
            className="ms-2"
            style={{
              display: "flex",
              alignItems: "center",
              margin: 0,
            }}
          >
            <span
              style={{
                marginRight: "10px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Search
            </span>
            <InputGroup style={{ position: "relative" }}>
              <Form.Control
                type="search"
                value={searchTerm}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchTerm(val);
                  setFilters1((prev) => ({
                    ...prev,
                    global: {
                      value: val,
                      matchMode: FilterMatchMode.CONTAINS,
                    },
                  }));
                }}
                placeholder="Global Search"
                style={{
                  borderRadius: "6px",
                  border: "1px solid #4dd0e1",
                  padding: "5px 8px",
                  width: "200px",
                  height: "30px",
                  fontSize: "12px",
                  transition: "all 0.3s ease",
                }}
              />
              {isDbSearching && (
                <div
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 5,
                    pointerEvents: "none",
                  }}
                >
                  <Spinner
                    animation="border"
                    size="sm"
                    variant="info"
                    style={{ width: "12px", height: "12px" }}
                  />
                </div>
              )}
            </InputGroup>
          </Form.Group>

          <Button
            variant="info"
            onClick={() => {
              const today = new Date();
              setFromDate(today);
              setToDate(today);
            }}
            style={{
              backgroundColor: "#29b6f6",
              border: "none",
              borderRadius: "6px",
              padding: "5px 10px",
              fontSize: "12px",
              fontWeight: "500",
              color: "white",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginLeft: "15px",
            }}
          >
            <FeatherIcon icon="calendar" size={12} className="me-1" />
            Today's Patients
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1px solid #4dd0e1",
            borderRadius: "8px",
            padding: "8px",
            backgroundColor: "#f5fcfd",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "#00838f",
                marginBottom: "3px",
              }}
            >
              From Date
            </div>
            <DatePicker
              selected={fromDate}
              onChange={(date) => setFromDate(date)}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select from date"
              customInput={
                <Form.Control
                  style={{ padding: "5px 8px", fontSize: "12px" }}
                />
              }
            />
          </div>

          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "#00838f",
                marginBottom: "3px",
              }}
            >
              To Date
            </div>
            <DatePicker
              selected={toDate}
              onChange={(date) => setToDate(date)}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select to date"
              customInput={
                <Form.Control
                  style={{ padding: "5px 8px", fontSize: "12px" }}
                />
              }
            />
          </div>

          <Button
            variant="primary"
            onClick={() => fetchPatientsData()}
            style={{
              backgroundColor: "#00bcd4",
              border: "none",
              borderRadius: "8px",
              padding: "6px 7px",
              fontSize: "12px",
              fontWeight: "500",
              color: "white",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginTop: "15px",
              ":hover": {
                backgroundColor: "#00acc1",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
              },
            }}
          >
            <FeatherIcon icon="refresh-ccw" size={12} className="me-1" />
            Refresh
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setFromDate(null);
              setToDate(null);
              setSearchTerm("");
              setAdviceFilter("");
              setFilters1({
                global: { value: null, matchMode: FilterMatchMode.CONTAINS },
                diagnosisAdvice: { value: null, matchMode: FilterMatchMode.CONTAINS },
              });
            }}
            style={{
              backgroundColor: "#ff9800",
              border: "none",
              borderRadius: "8px",
              padding: "5px 5px",
              fontSize: "12px",
              fontWeight: "500",
              color: "white",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginTop: "13px",
            }}
          >
            <FeatherIcon icon="filter" size={12} className="me-1" />
            Clear Filter
          </Button>
        </div>
      </div>
    </div>
  );

  const header = renderHeader();

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        fontFamily: "'Poppins', Arial, sans-serif",
        minHeight: "100vh",
        padding: "10px",
      }}
    >
      <PageBreadcrumb pagename="OPD Patients" />
      {/* <NavBarP pagename="All Registered Patients" /> */}




      <div
        className="theme-body"
        style={{
          background: "linear-gradient(to right, #e0f7fa, #80deea)",
          fontFamily: "'Poppins', Arial, sans-serif",
          minHeight: "100vh",
        }}
      >
        <Container fluid>
          <Row>
            <Col>
              <Card
                style={{
                  borderRadius: "10px",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "1.5px solid #00bcd4",
                  margin: "10px -10px 12px -10px",
                }}
              >
                <Card.Body style={{ marginTop: "-6px" }}>
                  {loading ? (
                    <div
                      className="d-flex justify-content-center py-5"
                      style={{ color: "#00bcd4" }}
                    >
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </div>
                  ) : (
                    <DataTable
                      value={patients}
                      paginator
                      rows={rows}
                      first={first}
                      onPage={(e) => {
                        setFirst(e.first);
                        setRows(e.rows);
                      }}
                      filters={filters1}
                      header={header}
                      globalFilterFields={["Uid_no", "name", "phone"]}
                      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                      currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                      responsiveLayout="scroll"
                      className="datatable-compact-style datatable-medium-small"
                    >
                      <Column
                        header="Sr No"
                        body={(rowData, { rowIndex }) => <span className="selectable-text">{rowIndex + 1}</span>}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "60px",
                        }}
                      />

                      <Column
                        field="date"
                        header="Date"
                        body={(rowData) => <span className="selectable-text">{formatDate(rowData.date) || "-"}</span>}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "100px",
                        }}
                      />

                      <Column
                        field="Uid_no"
                        header="UID No"
                        body={(rowData) =>
                          <span className="selectable-text">{rowData.Uid_no || "-"}</span>
                        }
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "130px",
                        }}
                      />

                      <Column
                        field="name"
                        header="Patient Name"
                        headerClassName="datatable-header-center"
                        body={(rowData) => {
                          const patientNameStr = `${rowData.prefix ? `${rowData.prefix} ` : ""}${rowData.name || "-"}`;
                          return <span className="selectable-text">{patientNameStr}</span>;
                        }}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          wordBreak: "break-word",
                          width: "150px",
                        }}
                      />

                      <Column
                        field="phone"
                        header="Contact No"
                        headerClassName="datatable-header-center"
                        body={(rowData) => <span className="selectable-text">{rowData.phone || "-"}</span>}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          wordBreak: "break-word",
                          width: "110px",
                        }}
                      />

                      <Column
                        field="mobile_2"
                        header="Alternate Contact No"
                        headerClassName="datatable-header-center"
                        body={(rowData) => <span className="selectable-text">{rowData.mobile_2 || "-"}</span>}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          wordBreak: "break-word",
                          width: "110px",
                        }}
                      />

                      <Column
                        field="sex"
                        header="Gender"
                        headerClassName="datatable-header-center"
                        body={(rowData) => <span className="selectable-text">{rowData.sex || "-"}</span>}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "80px",
                        }}
                      />

                      <Column
                        field="age"
                        header="Age"
                        headerClassName="datatable-header-center"
                        body={(rowData) => {
                          let ageStr = "-";
                          if (
                            rowData.age &&
                            !isNaN(rowData.age) &&
                            rowData.age < 150
                          ) {
                            ageStr = String(rowData.age);
                          } else {
                            const calculated = calculateAge(rowData.birth_date);
                            if (calculated !== null && calculated !== undefined && calculated !== "") {
                              ageStr = String(calculated);
                            }
                          }
                          return <span className="selectable-text">{ageStr}</span>;
                        }}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "70px",
                        }}
                      />

                      <Column
                        field="diagnosis"
                        header="Condition"
                        headerClassName="datatable-header-center"
                        body={(rowData) => <span className="selectable-text">{getConditionLabel(rowData)}</span>}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "180px",
                        }}
                      />

                      <Column
                        field="diagnosisAdvice"
                        header={renderAdviceHeader()}
                        headerClassName="datatable-header-center"
                        body={(rowData) => <span className="selectable-text">{rowData.diagnosisAdvice || "-"}</span>}
                        style={{
                          border: "1px solid #90caf9",
                          padding: "0.75rem",
                          width: "180px",
                          textAlign: "center",
                        }}
                      />

                      <Column
                        header="Actions"
                        body={actionBodyTemplate}
                        exportable={false}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "110px",
                        }}
                      />
                    </DataTable>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <div style={{ display: "none" }}>
        <div
          ref={fupPrintRef}
          style={{ display: "flex", flexDirection: "column" }}
        >
          {printData.diagnosis && printData.diagnosis.length > 0 && (
            <div style={{ pageBreakAfter: "always" }}>
              <DiagnosisPrintView
                patient={printData.patient}
                historyList={printData.history}
                diagnosisList={printData.diagnosis}
              />
            </div>
          )}
          {printData.followup && Object.keys(printData.followup).length > 0 && (
            <div style={{ pageBreakAfter: "always" }}>
              <FollowUpPrintView
                patient={printData.patient}
                followUpData={printData.followup}
                historyList={printData.history}
                diagnosisList={printData.diagnosis}
              />
            </div>
          )}
          {printData.prescription && (
            <div style={{ pageBreakAfter: "always" }}>
              <OpdPrescriptionPrintView
                prescriptionData={printData.prescription}
                formData={printData.patient}
                historyData={printData.history}
                assistanceDoctors={doctors}
                location={currentLocation}
              />
            </div>
          )}
          {printData.discharge && (
            <div>
              <DischargePrintView
                dischargeData={printData.discharge}
                formData={printData.patient}
                doctors={doctors}
                assistanceDoctors={doctors}
                location={currentLocation}
                historyData={printData.history}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
