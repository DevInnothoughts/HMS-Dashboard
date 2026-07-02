import React, { useState, useEffect } from "react";
import moment from "moment";
import {
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import DatePicker from "react-datepicker";
import Swal from "sweetalert2";
import { toast as hotToast } from "react-hot-toast";

const toast = new Proxy(hotToast, {
  get(target, prop) {
    if (prop === "warning") {
      return (msg, options) => hotToast(msg, { ...options, icon: "âš ï¸" });
    }
    if (prop === "info") {
      return (msg, options) => hotToast(msg, { ...options, icon: "â„¹ï¸" });
    }
    return target[prop];
  },
});
import { decodeJwt } from "../../utils/decode-jwt";

const BASE_URL = "http://194.195.117.79:5100/api";

const countries = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia",
  "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
  "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde",
  "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia",
  "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India",
  "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South",
  "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
  "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
  "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau",
  "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
  "Slovenia", "Solomon Islands", "Somalia", "South Africa", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand",
  "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
  "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",];

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const PersonalDetailsCard = ({
  patient,
  setPatient,
  formData,
  setFormData,
  currentLocation,
  BASE_URL,
  onSaveSuccess,
}) => {
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

  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patient) {
      const workPatternsArray = (patient.specific_work || "")
        .split(",")
        .map((item) => item.trim());

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
    }
  }, [patient, currentLocation]);

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
    const { value } = e.target;
    setSelectedReference(value);
    setFormData((prev) => ({ ...prev, reference_type: value }));
  };

  const handleReferenceDetailsChange = (e) => {
    const { name, value } = e.target;
    setReferenceDetails((prev) => ({ ...prev, [name]: value }));
    setFormData((prev) => ({ ...prev, ref: value }));
  };

  const handleOldPatientChange = (e) => {
    const { name, value } = e.target;
    setOldPatientDetails((prev) => ({ ...prev, [name]: value }));
  };

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
            setLoading(false);
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
              setReferenceDetails((prev) => ({ ...prev, dr_id: newDrId }));
            } else {
              toast.error(
                addDoctorData.message ||
                "Failed to add manual doctor reference.",
              );
              setLoading(false);
              return;
            }
          } catch (err) {
            console.error(err);
            toast.error("Error adding manual doctor reference.");
            setLoading(false);
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
        ref = `${referenceDetails.friendname || ""},${referenceDetails.friendno || ""}`;
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
      case "dr_privilege_card":
        reference_type = "dr_privilege_card";
        ref = referenceDetails.dr_privilege_card || formData.ref || "Doctor's Privilege Card";
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
        if (onSaveSuccess) onSaveSuccess(updatedData);
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
                      className="position-absolute bg-white shadow border rounded mb-1"
                      style={{
                        zIndex: 1000,
                        width: "250px",
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
                    className="position-absolute bg-white shadow border rounded mt-1"
                    style={{
                      zIndex: 1000,
                      width: "250px",
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

  return (
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
            <Col md={2}>
              <Form.Label className="fw-bold mb-1" style={{ fontSize: "11px" }}>
                Date <span className="text-danger">*</span>
              </Form.Label>
              <DatePicker
                required
                selected={
                  formData?.date
                    ? parseDate(formData.date)
                    : null
                }
                onChange={(date) => {
                  if (date) {
                    const formattedDate = moment(date).format("DD-MM-YYYY");
                    setFormData((prev) => ({
                      ...prev,
                      date: formattedDate,
                    }));
                  }
                }}
                filterDate={() => false}
                onChangeRaw={(e) => e.preventDefault()}
                className="form-control custom-datepicker"
                dateFormat="dd-MM-yyyy"
                placeholderText="Select Date"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                customInput={
                  <Form.Control
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
                }
              />
            </Col>
            <Col md={2}>
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
            <Col md={2}>
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
            Contact &amp; Personal Details
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
            Identity &amp; Clinical Info
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
            Work Pattern &amp; Referral
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
                    <option value="dr_privilege_card">Doctor's Privilege Card</option>
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
};

export default PersonalDetailsCard;
