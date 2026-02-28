import React, { useState, useEffect } from "react";
import moment from "moment";
import { FilterMatchMode } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import FeatherIcon from "feather-icons-react";
import { Link, useNavigate } from "react-router-dom";
import { decodeJwt } from "../../utils/decode-jwt";
import Swal from "sweetalert2";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import vipIconImg from "../../assets/images/logo/vip.png";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Button,
  Spinner,
  Modal,
} from "react-bootstrap";
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
// import NavBarP from "../../components/NavbarP";
import logo from "../../assets/images/3.png";

// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://194.195.117.79:5100/api"

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


const formatDateToLocal = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return date.toLocaleDateString();
};

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function All_patient() {
  const location = "demo";
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [patients, setPatients] = useState([]);
  const [fdeList, setFdeList] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [country, setCountry] = useState(null);
  const [state, setState] = useState(null);
  const [city, setCity] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    doctor_id: "",
    name: "",
    phone: "",
    appointmentTime: "",
    FDE_Name: "",
    note: "",
    doctorName: "",
    Uid_no: "",
    date: "",
    prefix: "",
    patient_type: "",
    email: "",
    address: "",
    country: "",
    state: "",
    city: "",
    sex: "",
    mobile_2: "",
    pincode: "",
    blood_group: "",
    identity: "",
    birth_date: "",
    age: "",
    occupation: "",
    companyname: "",
    specific_work: "",
    reference_type: "",
    ref: "",
    patient_id: "",
    nationality: "",
    language: "",
  });
  const navigate = useNavigate();
  const [filters1, setFilters1] = useState({
    // global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    global: { value: null, matchMode: FilterMatchMode.EQUALS },
  });
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentLocation, setCurrentLocation] = useState("default");
  const [isManualEntry, setIsManualEntry] = useState(false);

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  const [workPatterns, setWorkPatterns] = useState({
    Sedentary: false,
    Travelling: false,
    "Strenuous (Physical Activity)": false,
    "Mentally Stressful": false,
  });

  const [selectedBirthDate, setSelectedBirthDate] = useState(null);

  const fetchDropdownData = async () => {
    if (!currentLocation || currentLocation === "default") return;

    try {
      const doctorResponse = await fetch(
        `${BASE_URL}/V1/appointment/doctorDropdown?location=${currentLocation}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (doctorResponse.ok) {
        const doctorData = await doctorResponse.json();
        console.log("Doctors API Response:", doctorData);
        setDoctors(Array.isArray(doctorData.data) ? doctorData.data : []);
      } else {
        console.error("Failed to fetch doctors:", doctorResponse.statusText);
      }

      const fdeResponse = await fetch(
        `${BASE_URL}/V1/appointment/fdeDropdown?location=${currentLocation}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (fdeResponse.ok) {
        const fdeData = await fdeResponse.json();
        console.log("FDE API Response:", fdeData);
        setFdeList(Array.isArray(fdeData.data) ? fdeData.data : []);
      } else {
        console.error("Failed to fetch FDE list:", fdeResponse.statusText);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error.message);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const [doctorSearchResults, setDoctorSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [showManualDoctor, setShowManualDoctor] = useState(false);
  const [manualDoctorData, setManualDoctorData] = useState({
    name: "",
    location: "",
    specialty: "",
  });

  const searchDoctorByName = async (name) => {
    if (!name || name.length < 2) {
      setDoctorSearchResults([]);
      setShowManualDoctor(false); // Reset manual view on empty search
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/Patients/listDoctor?name=${encodeURIComponent(name)}&location=${currentLocation}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const results = data.data || [];
        setDoctorSearchResults(results);

        // If no results found, we don't automatically show the form,
        // but the UI will now show the "Add Reference" button.
        setShowManualDoctor(false);
      }
    } catch (error) {
      console.error("Error searching doctor:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const [patientSearchResults, setPatientSearchResults] = useState([]);
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);
  const searchPatientByPhone = async (phone) => {
    if (!phone || phone.length < 10) {
      setPatientSearchResults([]);
      return;
    }

    setIsSearchingPatient(true);
    try {
      console.log("Calling API with phone:", phone);

      const response = await fetch(
        `${BASE_URL}/V1/Patients/listRefPatient?phone=${phone}&location=${currentLocation}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("API Response Status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("API Response Data:", data);

        if (data.statusCode === 200 && data.data.refPatientData) {
          const results = Array.isArray(data.data.refPatientData)
            ? data.data.refPatientData
            : [data.data.refPatientData];
          setPatientSearchResults(results);
          console.log("Updated Patient Search Results:", results);
        } else {
          console.log("No patient found.");
          setPatientSearchResults([]);
        }
      } else {
        console.error("API Error:", response.status, await response.text());
      }
    } catch (error) {
      console.error("Error searching patient:", error);
    } finally {
      setIsSearchingPatient(false);
    }
  };

  useEffect(() => {
    console.log("Updated state in UI:", patientSearchResults);
  }, [patientSearchResults]);

  const calculateAge = (birthDate) => {
    if (!birthDate) return "";

    let formattedDate = birthDate;
    if (typeof birthDate === "string" && birthDate.includes("/")) {
      const [day, month, year] = birthDate.split("/");
      formattedDate = `${year}-${month}-${day}`;
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log("Input Change:", name, value);

    if (["phone", "mobile_2", "identityNumber"].includes(name)) {
      const numericValue = value.replace(/\D/g, "");
      if (name === "phone" || name === "mobile_2") {
        if (numericValue.length > 10) return;
      }
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setFormData((prevState) => {
      let identityType = prevState.identity
        ? prevState.identity.split(",")[0]
        : "";
      let identityNumber = prevState.identity
        ? prevState.identity.split(",")[1] || ""
        : "";

      if (name === "identity") {
        identityType = value;
      } else if (name === "identityNumber") {
        identityNumber = value;
      }

      if (name === "birth_date") {
        const formattedDate = new Date(value).toISOString().split("T")[0];
        const age = calculateAge(formattedDate);

        console.log("Formatted Birth Date:", formattedDate, "Age:", age);

        setFormData((prev) => ({
          ...prev,
          birth_date: formattedDate,
          age: age || prev.age,
        }));
      } else {
        name !== "identityNumber" &&
          setFormData((prev) => ({ ...prev, [name]: value }));
      }
      return {
        ...prevState,
        identity: `${identityType},${identityNumber}`,
      };
    });
  };

  const handleAddAppointment = (e) => {
    e.preventDefault();
    console.log("Submitting Appointment:", formData);
    setShowAddModal(false);
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

      const params = {
        from: formatToApiDate(fromDate),
        to: formatToApiDate(toDate),
      };

      Object.keys(params).forEach((key) => {
        if (params[key]) url.searchParams.append(key, params[key]);
      });

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        console.log("Fetched Data (All Patients):", data.data);
        setPatients(data.data || []);
      } else {
        console.error(
          "Error fetching patients:",
          data.message || "Unknown error",
        );
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentLocation && currentLocation !== "default") {
      fetchPatientsData();
      fetchDropdownData();
    }
  }, [currentLocation, fromDate, toDate]);

  useEffect(() => {
    if (selectedPatient) {
      console.log("Selected Ptient Data:", selectedPatient);
      const birthDateString = selectedPatient.birth_date || "";
      let formattedBirthDate = "";

      if (birthDateString) {
        try {
          const [day, month, year] = birthDateString.split("/");
          formattedBirthDate = `${year}-${month}-${day}`;
        } catch (error) {
          console.error("Error formatting birth date:", error);
          formattedBirthDate = "";
        }
      }

      if (selectedPatient) {
        // const workPatternsArray = (setSelectedPatient.specific_work || "")
        const workPatternsArray = (selectedPatient.specific_work || "")
          .split(",")
          .map((pattern) => pattern.trim());
      }

      setFormData({
        // Uid_no: selectedPatient.uid || "",
        Uid_no: selectedPatient.Uid_no || selectedPatient.uid || "",
        date: formatDate(selectedPatient.date) || "",
        prefix: selectedPatient.prefix || "",
        name: selectedPatient.name || "",
        patient_type: selectedPatient.patient_type || false,
        email: selectedPatient.email || "",
        address: selectedPatient.address || "",
        // country: selectedPatient.country || "",
        // state: selectedPatient.state || "",
        // city: selectedPatient.city || "",
        sex: selectedPatient.sex || "",
        phone: selectedPatient.phone || "",
        mobile_2: selectedPatient.mobile_2 || "",
        pincode: selectedPatient.pincode || "",
        blood_group: selectedPatient.blood_group || "",
        identity: selectedPatient.identity || "",
        identityNumber: selectedPatient.identityNumber || "",
        birth_date: selectedPatient.birth_date || "",
        age: selectedPatient.birth_date
          ? calculateAge(selectedPatient.birth_date)
          : "",
        occupation: selectedPatient.occupation || "",
        companyname: selectedPatient.companyname || "",
        specific_work: selectedPatient.specific_work || false,
        reference_type: selectedPatient.reference_type,
        nationality: selectedPatient.additional_info?.nationality || "",
        language: selectedPatient.additional_info?.language || "",
      });

      const workPatternsArray = (selectedPatient.specific_work || "")
        .split(",")
        .map((pattern) => pattern.trim());

      setWorkPatterns({
        Sedentary: workPatternsArray.includes("Sedentary"),
        Travelling: workPatternsArray.includes("Travelling"),
        "Strenuous (Physical Activity)": workPatternsArray.includes(
          "Strenuous (Physical Activity)",
        ),
        "Mentally Stressful": workPatternsArray.includes("Mentally Stressful"),
      });

      console.log("formatted Birth Date:", formattedBirthDate);
    }
  }, [selectedPatient]);

  const formatDateToDisplay = (dateString) => {
    if (!dateString) return "";

    const dateParts = dateString.split("-");

    if (dateParts.length === 3) {
      const [year, month, day] = dateParts;

      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return `${day}-${month}-${year}`;
      }
    }

    console.error("Invalid date format:", dateString);
    return "";
  };

  const handleEditPatient = (patient) => {
    console.log("Editing patient:", patient);

    const formattedBirthDate = formatDateToDisplay(patient.birth_date);
    const workPatternsArray = (patient.specific_work || "")
      .split(",")
      .map((item) => item.trim());

    const age = patient.age || calculateAge(formattedBirthDate) || "";

    if (patient.reference_type === "old_ref") {
      const parts = (patient.ref || "").split(",");
      setOldPatientDetails({
        patient_ref_no: parts[0] || "",
        old_patient_name: parts[1] || "",
        old_patient_id_value: parts[2] || "",
        old_patient_pincode: parts[3] || "",
      });
    } else {
      setReferenceDetails((prev) => ({
        ...prev,
        [patient.reference_type]: patient.ref || "",
      }));
    }

    setFormData({
      // Uid_no: patient.uid || "",
      Uid_no: patient.Uid_no || patient.uid || "",
      date: patient.date || "",
      prefix: patient.prefix || "",
      name: patient.name || "",
      patient_type: Boolean(patient.patient_type),
      email: patient.email || "",
      address: patient.address || "",
      // country: patient.country || "",
      // state: patient.state || "",
      // city: patient.city || "",
      sex: patient.sex || "",
      phone: patient.phone || "",
      mobile_2: patient.mobile_2 || "",
      pincode: patient.pincode || "",
      blood_group: patient.blood_group || "",
      identity: patient.identity || "",
      identityNumber: patient.identityNumber || "",
      birth_date: formattedBirthDate,
      age: patient.birth_date ? calculateAge(patient.birth_date) : "",
      occupation: patient.occupation || "",
      companyname: patient.companyname || "",
      reference_type: patient.reference_type || "",
      // specific_work: Boolean(patient.specific_work) || "",
      specific_work: patient.specific_work || "",
      patient_id: patient.patient_id || "",
      nationality: patient.additional_info?.nationality || "",
      language: patient.additional_info?.language || "",
    });

    setWorkPatterns({
      Sedentary: workPatternsArray.includes("Sedentary"),
      Travelling: workPatternsArray.includes("Travelling"),
      "Strenuous (Physical Activity)": workPatternsArray.includes(
        "Strenuous (Physical Activity)",
      ),
      "Mentally Stressful": workPatternsArray.includes("Mentally Stressful"),
    });
    setSelectedReference(patient.reference_type || "");
    setSelectedPatient(patient);
    setShowEditPatientModal(true);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      toast.error("No patient selected for editing.");
      return;
    }

    let reference_type = selectedPatient.ref;
    let ref = "";

    switch (selectedReference) {
      case "newspaper":
        reference_type = "newspaper";
        ref = referenceDetails.newspaper || formData.ref || "";
        break;
      case "dr_ref":
        reference_type = "dr_ref";
        ref = referenceDetails.dr_name || "";
        break;
      case "internet":
        reference_type = "internet";
        ref = referenceDetails.internet || "";
        break;
      case "MediaRef":
        reference_type = "MediaRef";
        ref = referenceDetails.MediaRef || "";
        break;
      case "TVShow":
        reference_type = "TVShow";
        ref = referenceDetails.TVShow || "";
        break;
      case "old_ref":
        reference_type = "old_ref";
        ref = `${oldPatientDetails.patient_ref_no || ""},${oldPatientDetails.old_patient_name || ""
          },${oldPatientDetails.old_patient_id_value || ""},${oldPatientDetails.old_patient_pincode || ""
          }`;
        break;
      case "family_friends":
        reference_type = "family_friends";
        ref = `${referenceDetails.friendname || ""},${referenceDetails.friendno || ""
          }`;
        break;
      case "hhc_board":
        reference_type = "hhc_board";
        ref = referenceDetails.HHC_board || "";
        break;
      case "HHF":
        reference_type = "HHF";
        ref = referenceDetails.HHF || "";
        break;
      case "other":
        reference_type = "other";
        ref = referenceDetails.other || "";
        break;
      case "WOM":
        reference_type = "WOM";
        ref = referenceDetails.WOM || "";
        break;
      case "awareness_lecture":
        reference_type = "awareness_lecture";
        ref = referenceDetails.awareness_lecture || "";
        break;
      case "treated_past":
        reference_type = "treated_past";
        ref = referenceDetails.treated_past_status || "";
        break;
      case "hhc_branch":
        reference_type = "hhc_branch";
        ref = referenceDetails.hhc_branch || "";
        break;
      case "aggregators":
        reference_type = "aggregators";
        ref = referenceDetails.aggregators || "";
        break;
      default:
        reference_type = null;
        ref = referenceDetails[selectedReference] || formData.ref;
    }

    console.log("Reference Type:", reference_type);
    console.log("Reference:", ref);

    const specificWork = Object.entries(workPatterns)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join(",");

    const updatedPatientData = {
      ...formData,
      patientName: formData.name,
      mobileNo: formData.phone,
      date: formData.date || "",
      birth_date: formData.birth_date,
      age: calculateAge(formData.birth_date),
      specific_work: specificWork,
      // reference_type: formData.reference_type,
      // ref: formData.ref
      reference_type: reference_type,
      ref: ref,
      additional_info: {
        nationality: formData.nationality,
        language: formData.language,
      },
    };

    console.log("Updated Patient Data:", updatedPatientData);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/patient/editPatient?patient_id=${selectedPatient.patient_id}&location=${currentLocation}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedPatientData),
        },
      );

      const responseData = await response.json();

      if (response.ok) {
        Toast.fire({
          icon: "success",
          title: "Patient information updated successfully",
        });
        setPatients((prevPatients) =>
          prevPatients.map((p) =>
            p.phone === selectedPatient.phone
              ? { ...p, ...responseData.data }
              : p,
          ),
        );

        await fetchPatientsData();

        setShowEditPatientModal(false);
        setSelectedPatient(null);
        setFormData({});
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: responseData.message || "Failed to update patient",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Please check your connection and try again.",
      });
    }
  };

  const statusBodyTemplate = (formData) => (
    <span
      className={`badge ${formData.status
        ? ` status- ${formData.status.toLowerCase()}`
        : "status-unknown"
        }`}
    >
      {formData.status || "Unknown"}
    </span>
  );

  const handleViewPatient = async (patient) => {
    console.log("Being passed data:", patient);
    if (!patient || !patient.phone) {
      console.error("Patient data or phone number is missing");
      return;
    }

    try {
      localStorage.setItem("patient", patient.phone);

      const add_appointmentResponse = await fetch(
        `${BASE_URL}/V1/appointment/addAppointment`,
      );

      if (!add_appointmentResponse.ok) {
        console.error(
          "Add appointment failed",
          await add_appointmentResponse.text(),
        );
      }

      if (add_appointmentResponse.ok) {
        const add_appointmentData = await add_appointmentResponse.json();
        navigate("/add-appointment", {
          state: { patient, add_appointmentData },
        });
      } else {
        navigate("/add-appointment", { state: { patient } });
      }
    } catch (error) {
      console.error("Error adding appointment:", error);
      navigate("/add-appointment", { state: { patient } });
    }
  };

  const handleSubmit = async (saveType) => {
    const selectedFDE = fdeList.find((fde) => fde.FDEID === formData.FDE_Name);
    const fdeName = selectedFDE ? selectedFDE.FDEName : "";
    const formattedDate = moment(formData.date).format("YYYY-MM-DD");
    const selectedDoctor = doctors.find(
      (doc) => doc.doctor_id === formData.doctor_id,
    );
    const doctorName = selectedDoctor ? selectedDoctor.name : "";
    const payload = {
      appointment_timestamp: formattedDate,
      doctor_id: formData.doctor_id,
      doctorName: formData.doctorName,
      patientName: formData.name,
      patient_phone: formData.phone,
      patient_id: formData.patient_id,
      // patient_type: "Follow",
      patient_type: formData.patient_type,
      appointment_time: formData.appointmentTime,
      FDE_Name: formData.FDE_Name,
      note: formData.note,
      phone: formData.phone,
    };
    console.log(payload);
    try {
      console.log("Sending request to backend...", payload);

      const response = await fetch(
        `${BASE_URL}/V1/appointment/addAppointment?location=${currentLocation}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json();
      console.log("Appointment added successfully:", responseData);
      Swal.fire({
        icon: "success",
        title: "Booked!",
        text: "Appointment booked successfully",
        timer: 2000,
      });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding appointment:", error.message);
      Swal.fire({
        icon: "error",
        title: "Booking Failed",
        text: "Failed to book appointment. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAppointmentClick = (patient) => {
    const patientId = patient.patient_id || "";

    const today = new Date();
    const formattedDate = today;

    const formDataToSet = {
      date: formattedDate,
      doctor_id: "",
      doctorName: "",
      name: patient.name || "",
      phone: patient.phone || "",
      appointmentTime: "",
      fdeId: "",
      FDE_Name: "",
      note: patient.note || "",
      patient_type: "",
      patient_id: patientId,
    };

    setFormData(formDataToSet);
    setShowAddModal(true);
  };

  const handlePrint = (patient) => {
    const printWindow = window.open("", "_blank", "width=800,height=900");
    const vipIcon =
      patient.patient_type == 1
        ? `<img src="${vipIconImg}" class="vip-logo-img" alt="(VIP)" />`
        : "";

    const location = currentLocation || "";

    let regionalConsent = "";
    let regionalPatientNameLabel = "<p><b>Patients Name :</b>:</p>";
    let regionalPatientSignature = "<p><b>Patients Signature:</b></p>";
    let regionalWitnessSignature = "<p><b>Witness Signature:</b></p>";
    let regionalTimeDate = "Time & Date :";

    if (location === "Hyderabad" || location === "Secunderabad") {
      regionalConsent = `<p>నేను, కింద సంతకం చేసిన రోగి / బాధ్యతగల బంధువు ..........................................................................................................<br> ఇందుమూలంగా హీలింగ్ హ్యాండ్స్ క్లినిక్ వైద్యులు, సర్జన్లు మరియు
									వైద్యపరమైన వ్యక్తికి ఔట్-పేషెంట్ గా నాకు మంచిది లేదా అవసరమైనట్లు
									భావిస్తే వైద్య సంరక్షణలో వైద్య పరీక్షలు, పరిశోధనలు మరియు చికిత్స
									చేయటానికి సమ్మతి మరియు అధికారాన్ని ఇస్తున్నాను.<br>నేను హీలింగ్ హ్యాండ్స్ క్లినిక్ విధానాలను అర్థం చేసుకున్నాను మరియు వాటికి
									కట్టుబడి ఉండటానికి అంగీకరిస్తున్నాను. అపాయింట్‌మెంట్‌లు మరియు ఫాలో-
									అప్‌లకు సంబంధించి అవసరమైతే నన్ను/అతన్ని/ఆమెను టెలిఫోన్ ద్వారా
									సంప్రదించడానికి నేను క్లినిక్‌కి సమ్మతిని కూడా ఇస్తున్నాను. నా యోక్క వైద్య
									స్థితి గోప్యంగా ఉంచబడుతుందని తెలిసి నా/అతని/ఆమె వైద్య సమస్యల గురించి
									తమలో తాము చర్చించుకోవడానికి క్లినిక్ మరియు డాక్టర్లను అనుమతిస్తున్నాను.<br>నేను, నా సంప్రదింపులు/చికిత్స సమయంలో కనుగొనబడిన ఏదైనా
									గమనించిన/చర్చించిన/కొత్త సమాచారాన్ని భవిష్యత్తులో అధ్యయన
									ప్రయోజనాల/పరిశోధన కోసం ఉపయోగించేందుకు అనుమతిని ఇస్తున్నాను.</p>`;
      regionalPatientNameLabel = `<p><b>Patients Name (రొగి పేరు):</b>:</p>`;
      regionalPatientSignature = `<p><b>Patients Signature:<br>(రోగి సంతకం)</b></p>`;
      regionalWitnessSignature = `<p><b>Witness Signature:<br>(సాక్షి సంతకం)</b></p>`;
      regionalTimeDate = `Time & Date:<br>(సమయం మరియూ తేదీ)`;
    } else if (
      [
        "Bangalore",
        "Indiranagar",
        "HSR",
        "Sahakarnagar",
        "Rajaji Nagar",
        "Sarjapura",
        "Belagavi",
        "Mysore",
        "Kalaburagi",
      ].includes(location)
    ) {
      regionalConsent = `<p>ನಾನು, ಕೆಳಗೆ ಸಹಿ ಮಾಡಿದ ರೋಗಿ ಅಥವಾ ಜವಾಬ್ದಾರಿಯುತ ಸಂಬಂಧಿ ..........................................................................................................<br> ಈ ಮೂಲಕ ಹೀಲಿಂಗ್ ಹ್ಯಾಂಡ್ಸ್ ಕ್ಲಿನಿಕ್ ವೈದ್ಯರಿಗೆ ಒಪ್ಪಿಗೆ ಮತ್ತು ಅಧಿಕಾರವನ್ನು ನೀಡಿ , ಶಸ್ತ್ರಚಿಕಿತ್ಸಕರು ಮತ್ತು ವೈದ್ಯಕೀಯ ವ್ಯಕ್ತಿಗಳು ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷೆಗಳು, ತನಿಖೆಗಳು, ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆಗಳು ಮತ್ತು ಹೊರರೋಗಿ ಕಾರ್ಯವಿಧಾನವನ್ನು ಹೊರರೋಗಿಯಾಗಿ, ಸಲಹೆ ಅಥವಾ ಅಗತ್ಯವೆಂದು ಪರಿಗಣಿಸಿ ವೈದ್ಯಕೀಯ ಆರೈಕೆಯ ಸಮಯದಲ್ಲಿ ನಿರ್ವಹಿಸುತ್ತಾರೆ ಮತ್ತು ನಿರ್ವಹಿಸುತ್ತಾರೆ.<br>ನಾನು ಹೀಲಿಂಗ್ ಹ್ಯಾಂಡ್ಸ್ ಕ್ಲಿನಿಕ್ ನೀತಿಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ ಮತ್ತು ಸ್ವೀಕರಿಸುತ್ತೇನೆ ಮತ್ತು ಅವುಗಳನ್ನು ಪಾಲಿಸಲು ಒಪ್ಪುತ್ತೇನೆ. ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು ಮತ್ತು ಫಾಲೋ-ಅಪ್‌ಗಳ ಬಗ್ಗೆ ಅಗತ್ಯವಿದ್ದರೆ ನನ್ನನ್ನು/ಅವನನ್ನು/ಅವಳನ್ನು ದೂರವಾಣಿ ಮೂಲಕ ಸಂಪರ್ಕಿಸಲು ನಾನು ಕ್ಲಿನಿಕ್‌ಗೆ ಒಪ್ಪಿಗೆ ನೀಡುತ್ತೇನೆ.| ಖಾಸಗಿತನವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಲಾಗುವುದು ಎಂದು ತಿಳಿದುಕೊಂಡು ಕ್ಲಿನಿಕ್ ಮತ್ತು ವೈದ್ಯರು ನನ್ನ/ಅವನ/ಅವಳ ವೈದ್ಯಕೀಯ ಸಮಸ್ಯೆಗಳ ಬಗ್ಗೆ ಚರ್ಚಿಸಲು ಅವಕಾಶ ಮಾಡಿಕೊಡಿ.<br>ನಾನು ಕೆಳಗೆ ಸಹಿ ಮಾಡಿದ್ದೇನೆ, ನನ್ನ ಸಮಾಲೋಚನೆ/ಚಿಕಿತ್ಸೆಯ ಸಮಯದಲ್ಲಿ ಕಂಡುಬರುವ ಯಾವುದೇ ಗಮನಿಸಿದ/ಚರ್ಚಿತ/ಹೊಸ ಮಾಹಿತಿಯನ್ನು ಭವಿಷ್ಯದಲ್ಲಿ ಅಧ್ಯಯನ ಉದ್ದೇಶಗಳಿಗೆ/ಸಂಶೋಧನೆಗಾಗಿ ಬಳಸಲು ಅನುಮತಿಯನ್ನು ನೀಡುತ್ತೇನೆ</p>`;
      regionalPatientNameLabel = `<p><b>Patients Name (ರೋಗಿಯ ಹೆಸರು):</b></p>`;
      regionalPatientSignature = `<p><b>Patients Signature:<br>(ರೋಗಿಯ ಸಹಿ)</b></p>`;
      regionalWitnessSignature = `<p><b>Witness Signature:<br>(ಸಾಕ್ಷಿದಾರರ ಸಹಿ)</b></p>`;
      regionalTimeDate = `Time & Date:<br>(ಸಮಯ ಮತ್ತು ದಿನಾಂಕ)`;
    }
    else if (["Ludhiana", "Mohali"].includes(location)) {
      regionalConsent = `<p>ਮੈਂ, ਹੇਠਾਂ ਹਸਤਾਖਰ ਕਰਨ ਵਾਲਾ ਮਰੀਜ਼ ਜਾਂ ਜ਼ਿੰਮੇਵਾਰ ਰਿਸ਼ਤੇਦਾਰ ..........................................................................................................<br> ਇਸ ਦੁਆਰਾ ਹੀਲਿੰਗ ਹੈਂਡਸ ਕਲੀਨਿਕ ਦੇ ਡਾਕਟਰਾਂ, ਸਰਜਨਾਂ ਅਤੇ ਮੈਡੀਕਲ ਕਰਮਚਾਰੀਆਂ ਨੂੰ ਡਾਕਟਰੀ ਜਾਂਚ, ਤਫਤੀਸ਼, ਡਾਕਟਰੀ ਇਲਾਜ ਅਤੇ ਆਊਟ-ਪੇਸ਼ੈਂਟ ਪ੍ਰਕਿਰਿਆ ਕਰਨ ਦੀ ਸਹਿਮਤੀ ਅਤੇ ਅਧਿਕਾਰ ਦਿੰਦਾ ਹਾਂ, ਜੋ ਕਿ ਡਾਕਟਰੀ ਦੇਖਭਾਲ ਦੇ ਦੌਰਾਨ ਇੱਕ ਆਊਟ-ਪੇਸ਼ੈਂਟ ਵਜੋਂ ਉਚਿਤ ਜਾਂ ਜ਼ਰੂਰੀ ਸਮਝਿਆ ਜਾਂਦਾ ਹੈ।<br>ਮੈਂ ਹੀਲਿੰਗ ਹੈਂਡਸ ਕਲੀਨਿਕ ਦੀਆਂ ਨੀਤੀਆਂ ਨੂੰ ਸਮਝਦਾ ਅਤੇ ਸਵੀਕਾਰ ਕਰਦਾ ਹਾਂ ਅਤੇ ਉਹਨਾਂ ਦੀ ਪਾਲਣਾ ਕਰਨ ਲਈ ਸਹਿਮਤ ਹਾਂ। ਮੈਂ ਕਲੀਨਿਕ ਨੂੰ ਨਿਯੁਕਤੀਆਂ ਅਤੇ ਫਾਲੋ-ਅਪਸ ਦੇ ਸਬੰਧ ਵਿੱਚ ਲੋੜ ਪੈਣ 'ਤੇ ਟੈਲੀਫੋਨ ਰਾਹੀਂ ਮੇਰੇ ਨਾਲ ਸੰਪਰਕ ਕਰਨ ਦੀ ਸਹਿਮਤੀ ਵੀ ਦਿੰਦਾ ਹਾਂ। ਮੈਂ ਕਲੀਨਿਕ ਅਤੇ ਡਾਕਟਰਾਂ ਨੂੰ ਮੇਰੇ ਮੈਡੀਕਲ ਮੁੱਦਿਆਂ ਬਾਰੇ ਆਪਸ ਵਿੱਚ ਚਰਚਾ ਕਰਨ ਦੀ ਇਜਾਜ਼ਤ ਦਿੰਦਾ ਹਾਂ, ਇਹ ਜਾਣਦੇ ਹੋਏ ਕਿ ਗੋਪਨੀਯਤਾ ਬਣਾਈ ਰੱਖੀ ਜਾਵੇਗੀ।<br>ਮੈਂ, ਹੇਠਾਂ ਹਸਤਾਖਰ ਕਰਕੇ, ਮੇਰੀ ਸਲਾਹ/ਇਲਾਜ ਦੌਰਾਨ ਮਿਲੀ ਕਿਸੇ ਵੀ ਨਵੀਂ ਜਾਣਕਾਰੀ ਨੂੰ ਭਵਿੱਖ ਵਿੱਚ ਅਧਿਐਨ ਦੇ ਉਦੇਸ਼ਾਂ/ਖੋਜ ਲਈ ਵਰਤਣ ਦੀ ਇਜਾਜ਼ਤ ਦਿੰਦਾ ਹਾਂ।</p>`;
      regionalPatientNameLabel = `<p><b>Patients Name (ਮਰੀਜ਼ ਦਾ ਨਾਮ):</b></p>`;
      regionalPatientSignature = `<p><b>Patients Signature:<br>(ਮਰੀਜ਼ ਦੇ ਦਸਤਖਤ)</b></p>`;
      regionalWitnessSignature = `<p><b>Witness Signature:<br>(ਗਵਾਹ ਦੇ ਦਸਤਖਤ)</b></p>`;
      regionalTimeDate = `Time & Date:<br>(ਸਮਾਂ ਅਤੇ ਮਿਤੀ)`;
    } else if (["Surat", "Ahmedabad"].includes(location)) {
      regionalConsent = `<p>હું, નીચે સહી કરનાર દર્દી અથવા જવાબદાર સંબંધી ..........................................................................................................<br> આથી હીલિંગ હેન્ડ્સ ક્લિનિકના ડોકટરો, સર્જનો અને તબીબી વ્યક્તિઓને તબીબી તપાસ, તપાસ, તબીબી સારવાર અને આઉટ-પેશન્ટ પ્રક્રિયા કરવા માટે સંમતિ અને અધિકાર આપું છું, જે તબીબી સંભાળ દરમિયાન આઉટ-પેશન્ટ તરીકે યોગ્ય અથવા જરૂરી માનવામાં આવે છે.<br>હું હીલિંગ હેન્ડ્સ ક્લિનિકની નીતિઓને સમજું છું અને સ્વીકારું છું અને તેનું પાલન કરવા સંમત થાઉં છું। એપોઇન્ટમેન્ટ અને ફોલો-અપ્સ અંગે જરૂર પડે તો ટેલિફોન દ્વારા મારો સંપર્ક કરવા માટે હું ક્લિનિકને સંમતિ પણ આપું છું। હું ક્લિનિક અને ડોકટરોને મારી તબીબી સમસ્યાઓ વિશે આપસમાં ચર્ચા કરવાની મંજૂરી આપું છું, એ જાણીને કે ગોપનીયતા જાળવવામાં આવશે।<br>હું, નીચે સહી કરનાર, મારી પરામર્શ/સારવાર દરમિયાન મળેલી કોઈપણ નવી માહિતીનો ભવિષ્યમાં અભ્યાસના હેતુઓ/સંશોધન માટે ઉપયોગ કરવાની પરવાનગી આપું છું।</p>`;
      regionalPatientNameLabel = `<p><b>Patients Name (દર્દીનું નામ):</b></p>`;
      regionalPatientSignature = `<p><b>Patients Signature:<br>(દર્દીની સહી)</b></p>`;
      regionalWitnessSignature = `<p><b>Witness Signature:<br>(સાક્ષીની સહી)</b></p>`;
      regionalTimeDate = `Time & Date:<br>(સમય અને તારીખ)`;
    } else if (
      [
        "DP Road",
        "Baner",
        "Tilak Road",
        "Salunkhe Vihar",
        "Chinchwad",
        "Chakan",
        "Dighi",
        "Katraj",
        "Navi Mumbai",
        "Kemps Corner",
        "Andheri",
        "Thane",
        "Kolhapur",
        "Latur",
        "Nashik",
        "Undri",
        "Hinjewadi",
        "Vashi",
      ].includes(location)
    ) {
      regionalConsent = `<p>मी खाली सही करणारा रुग्ण / रुग्णाचा जबाबदार पालक/ नातेवाईक ..........................................................................................................<br> हीलींग हॅन्डस् क्लिनीक येथिल चिकिसक शल्यविशाराद व वैधकीय कर्मचारी याना बाहय रुग्ण म्हणून सदर रुग्णाच्या हितासाठी / आरोग्यासाठी आवश्यक त्या सर्व नैदानिक तपासण्या परीक्षणे, वैद्यकीय औषधोपचार व लघुशस्त्रक्रिया करण्यास परवानगी देतो. मला हीलींग हॅन्डस क्लिनीकची सर्व धोरणे ज्ञात सून मी त्याचे पालन करण्यास तयार आहे. मी खाली सही करणार अशी ही संमती देतो की मला तपासणीच्या वेळेतील बदल किंवा फेरतपासणीबाबतच्या वेळेतील व इतर अन्य बदल कळविण्याकरीता केलेल्या दूरध्वनी संपर्कबद्दल मला आक्षेप असणार नाही. मी, क्लिनिक व डॉक्टर यांना माझ्या / त्याच्या/ तिच्या वैदयकिय समस्थाची आपआपसांत चर्चा करण्याची परवानगी देत आहे तसेच यांची गोपनियता राखण्यात येईल याची मला माहीती दिलेली आहे. मी खाली सही करणारा/करणारी, माझ्या उपचाराच्या दरम्यान प्राप्त झालेली / सापडलेली कोणत्याही प्रकारच्या माहितीचे उपयोग भविष्यकालीन अभ्यासासाठी / संशोधनासाठी करण्याची परवानगी देत आहे.</p>`;
      regionalPatientNameLabel = `<p><b>Patients Name (रुग्णाचे नाव):</b>:</p>`;
      regionalPatientSignature = `<p><b>Patients Signature:<br>(रुग्णाची सही)</b></p>`;
      regionalWitnessSignature = `<p><b>Witness Signature:<br>(साक्षीदाराची सही)</b></p>`;
      regionalTimeDate = `Time & Date:<br>(वेळ व दिनांक)`;
    } else {
      regionalConsent = `<p>मैं, निम्नलिखित मरीज या जिम्मेदार रिश्तेदार ..........................................................................................................<br> यहाँ इलाज के दौरान चिकित्सक, सर्जन और चिकित्सा व्यक्तियों को अनुमति और अधिकार देता हूँ कि वे चिकित्सा परीक्षण, जांच, चिकित्सा उपचार और बाह्य दूरस्थ प्रक्रिया कार्यान्वित करें, जो उपयुक्त या आवश्यक माने जाते हैं।<br>मैं हीलिंग हैंड्स क्लिनिक की नीतियों को समझता और स्वीकार करता हूँ और उनका पालन करने के लिए सहमत हूँ। मैं यह भी स्वीकार करता हूँ कि क्लिनिक को मुझसे / उससे फोन पर संपर्क करने की अनुमति है यदि अपॉइंटमेंट और फॉलो-अप के संबंध में जरूरत हो। मैं क्लिनिक और डॉक्टरों को यहाँ बताए गए चिकित्सा मुद्दों के बारे में चर्चा करने की अनुमति देता हूँ, जानते हुए कि गोपनीयता का पालन किया जाएगा।<br>मैं, नीचे लिखे गए, अपनी परमिशन देता हूँ कि मेरी परामर्श / उपचार के दौरान किसी भी देखी गई / चर्चित / नई जानकारी का भविष्य में अध्ययन के उद्देश्यों / अनुसंधान के लिए उपयोग किया जा सकता है।</p>`;
      regionalPatientNameLabel = `<p><b>Patients Name (रोगी का नाम):</b></p>`;
      regionalPatientSignature = `<p><b>Patients Signature:<br>(रोगी के हस्ताक्षर)</b></p>`;
      regionalWitnessSignature = `<p><b>Witness Signature:<br>(गवाह के हस्ताक्षर)</b></p>`;
      regionalTimeDate = `Time & Date:<br>(समय और दिनांक)`;
    }

    const patientName = `${patient.prefix ? patient.prefix + "." : ""}${patient.name || ""}`;
    const today = moment().format("DD-MM-YYYY");

    printWindow.document.write(`
    <html>
      <head>
        <title>Print Registration Form</title>
        <style>
          .vip-logo-img {
              width: 20px; 
              height: auto;
              vertical-align: middle;
              margin-bottom:1.5px;
          }
          body, table, tr, td, p { font-size: 11px !important; text-align: justify; font-family: Arial, sans-serif; }
          .HHClogo { width: 50%; }
          .bgdiv { padding: 10px; }
          h1 { font-size: 22px; text-align: right; color: #509286; font-weight: 600; margin: 0; }
          h2 { font-size: 18px; text-align: right; color: #509286; font-weight: 600; margin: 0; }
          hr { margin: 10px 0; border: 0; border-top: 1px solid rgb(75,137,126); border-bottom: 1px solid rgb(75,137,126); }
          @media print {
  .no-print {
    display: none !important;
  }
}
.print-btn-container {
  text-align: center;
  padding: 20px;
}
.actual-print-button {
  padding: 10px 10px;
  background-color: #427269;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
}
          </style>
      </head>
      <body>
        <div class="bgdiv">
          <table width="100%" border="0">
            <tr>
              <td style="width:50%;"><img src="${logo}" class="HHClogo"></td>
              <td style="width:50%;">
                <h1>Registration Form</h1>
                <p style="text-align:right"><b>Date:</b> ${today}</p>
              </td>
            </tr>
          </table>
          <br><br>
          <table width="100%" border="0">
            <tr>
            <td style="width:50%; vertical-align: top; line-height: 1.3;">
              <p><b>UID No :-</b>&nbsp;&nbsp;${patient.Uid_no || "-"}</p>
              <p style="margin:0;"><b>Name :-</b>&nbsp;&nbsp;${patientName}${vipIcon}</p>
              <p><b>Gender :-</b>&nbsp;&nbsp;${patient.sex || "-"}</p>
              <p><b>Address :-</b>&nbsp;&nbsp;${patient.address || "-"}</p>
              <p><b>Contact No :-</b>&nbsp;&nbsp;${patient.phone || "-"}</p>
              <p><b>Alternate Contact No :-</b>&nbsp;&nbsp;${patient.mobile_2 || "-"}</p>
            </td>
            <td style="width:50%; vertical-align: top; line-height: 1.3;">
              <p><b>D.O.B :-</b>&nbsp;&nbsp;${patient.birth_date ? patient.birth_date : "-"}</p>
              <p><b>Age :-</b>&nbsp;&nbsp;${patient.age || "-"}</p>
              <p><b>Email :-</b>&nbsp;&nbsp;${patient.email || "-"}</p>
              <p><b>Occupation :-</b>&nbsp;&nbsp;${patient.occupation || "-"}</p>
              ${patient.companyname ? `<p><b>Company Name :-</b>&nbsp;&nbsp;${patient.companyname}</p>` : ""}
              ${patient.ref ? `<p><b>Reference :-</b>&nbsp;&nbsp;${patient.ref}</p>` : ""}
            </td>
          </tr>
          </table>
          <hr>
          <table width="100%" border="0">
            <tr><td><h2 style="margin-top:10px;">OPD CONSENT FORM</h2></td></tr>
            <tr>
              <td>
                <p style="margin-top:15px; line-height: 1.3;">I, the undersigned patient or responsible relative ....................................................................................................................................<br> hereby give consent and authority to Healing Hands Clinic physicians, surgeons and medical person administer and perform medical examinations, investigations, medical treatments and out-patient procedure during the course of the medical care as an out-patient, as deemed advisable or necessary.<br>
                I understand and accept Healing Hands Clinic policies and agree to abide by them. I also give consent to the clinic for contacting me/him/her by telephone if needed regarding appointments and follow-ups.| allow the clinic and the doctors to discuss about my/his/her medical issues amongst themselves knowing that privacy will be maintained. <br>
                I undersigned, give permission for using any observed/discussed/new information found during my consultation/treatment to be used for study purposes/research in future.</p>
                ${regionalConsent}
              </td>
            </tr>
          </table>
          <br><br>
          <table width="100%" border="0" >
            <tr><td>${regionalPatientNameLabel}</td></tr>
          </table>
          <br><br>
          <table width="100%" border="0">
            <tr>
              <td style="width:60%;">${regionalPatientSignature}</td>
              <td style="width:40%;">${regionalWitnessSignature}</td>
            </tr>
            <tr>
              <td style="width:60%;">${regionalTimeDate}</td>
              <td style="width:40%;">${regionalTimeDate}</td>
            </tr>
          </table>
        </div>
        <div class="print-btn-container no-print">
  <button class="actual-print-button" onclick="window.print()">Print</button>
</div>
        <script>
         window.onload = function() {
  };
        </script>
      </body>
    </html>
  `);
    printWindow.document.close();
  };

  const actionBodyTemplate = (patient) => (
    <div className="d-flex align-items-center justify-content-center">
      <Button
        variant="primary"
        onClick={() => handleAddAppointmentClick(patient)}
        className="appointment-btn btn-primary btn-extra-small btn-icon me-2"
        title="Add Appointment"
      >
        <FeatherIcon icon="plus-square" size="16" />
      </Button>

      <Button
        onClick={() => handleEditPatient(patient)}
        className="edit-btn btn-primary btn-extra-small btn-icon me-2"
        title="Edit Patient"
      >
        <FeatherIcon icon="edit" size="16" />
      </Button>
      <Link
        onClick={() => handlePrint(patient)}
        className="print btn btn-primary btn-extra-small btn-icon"
        to=""
        title="Print"
      >
        <FeatherIcon icon="printer" size="16" />
      </Link>
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
                          handleReferenceChange(e);
                          setFormData((prev) => ({
                            ...prev,
                            ref: paper,
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
                  margin: 0,
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
                        handleReferenceChange(e);
                        setFormData((prev) => ({
                          ...prev,
                          ref: source,
                          reference_type: "internet",
                        }));
                      }}
                      // checked={referenceDetails.internet === source}
                      checked={formData.ref === source}
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
                        handleReferenceChange(e);
                        setFormData((prev) => ({
                          ...prev,
                          ref: media,
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
                  fontSize: "17px",
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
                        handleReferenceChange(e);
                        setFormData((prev) => ({
                          ...prev,
                          ref: show,
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
                  fontSize: "10px",
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
            <InputGroup>
              <Form.Control
                type="search"
                value={filters1.global.value || ""}
                onChange={(e) =>
                  setFilters1({
                    global: {
                      value: e.target.value,
                      matchMode: FilterMatchMode.CONTAINS,
                    },
                  })
                }
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
            </InputGroup>
          </Form.Group>
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
              maxDate={new Date()}
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
              minDate={fromDate}
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
        </div>
      </div>
    </div>
  );

  const header = renderHeader();

  const handleWorkPatternChange = (e) => {
    const { name, checked } = e.target;
    setWorkPatterns((prevPatterns) => ({
      ...prevPatterns,
      [name]: checked,
    }));
  };

  const generateTimeSlots = () => {
    const slots = [];
    let start = moment("07:00", "HH:mm");
    const end = moment("23:45", "HH:mm");

    while (start <= end) {
      slots.push(start.format("hh:mm A"));
      start.add(15, "minutes");
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleDateChange = (date) => {
    if (!date) {
      console.error("Invalid date selected");
      return;
    }

    const formattedDate = date.toISOString().split("T")[0];
    console.log("Formatted Date:", formattedDate);

    setFormData((prevState) => {
      if (prevState.date === formattedDate) return prevState;
      return {
        ...prevState,
        date: formattedDate,
      };
    });

    if (name === "birth_date") {
      const calculatedAge = calculateAge(date);

      setFormData((prevState) => {
        if (
          prevState.birth_date === formattedDate &&
          prevState.age === calculatedAge
        )
          return prevState;

        return {
          ...prevState,
          birth_date: formattedDate,
          age: calculatedAge,
        };
      });

      console.log("Birth Date Changed:", {
        formattedDate,
        calculatedAge,
      });
    }

    // setTimeSlots((prevSlots) => {
    //   const newSlots = generateTimeSlots();
    //   return JSON.stringify(prevSlots) !== JSON.stringify(newSlots)
    //     ? newSlots
    //     : prevSlots;
    // });
  };

  function parseDate(dateString) {
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

      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      console.error("Error parsing date:", error);
      return null;
    }
  }

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
      <PageBreadcrumb pagename="Patient List" />
      {/* <NavBarP pagename="All Registered Patients" /> */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
        centered
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "#e0f7fa",
            borderBottom: "2px solid #00bcd4",
            padding: "10px 15px",
          }}
        >
          <Modal.Title
            style={{ color: "#00838f", fontWeight: "bold", fontSize: "16px" }}
          >
            <FeatherIcon icon="plus-square" className="me-2" size="16" />
            Add Appointment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: "13px", padding: "10px" }}>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Appointment Date <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <DatePicker
                    selected={formData.date ? new Date(formData.date) : null}
                    onChange={(date) =>
                      setFormData((prev) => ({
                        ...prev,
                        date: formatDateToLocal(date),
                      }))
                    }
                    dateFormat="dd-MM-yyyy"
                    required
                    className="form-control form-control-sm"
                    placeholderText="Select Date"
                    minDate={new Date()}
                    customInput={
                      <Form.Control
                        size="sm"
                        style={{
                          border: "2px solid rgb(77, 208, 225)",
                          fontSize: "11px",
                          borderRadius: "10px",
                        }}
                      />
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Appointment Time <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Select
                    required
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                  >
                    <option value="">Select Time</option>
                    {timeSlots.map((time, index) => (
                      <option key={index} value={time}>
                        {time}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group controlId="patient_type">
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Patient Type
                  </Form.Label>
                  <Form.Select
                    name="patient_type"
                    value={formData.patient_type}
                    onChange={handleInputChange}
                    required
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                  >
                    <option value="">Select Patient Type</option>
                    <option value="Follow">Follow </option>
                    <option value="Post Operative">Post Operative</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Patient Name <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    name="patientName"
                    value={formData.name}
                    onChange={handleInputChange}
                    readOnly
                    placeholder="Enter Patient Name"
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "11px",
                      borderRadius: "10px",
                      cursor: "not-allowed",
                      backgroundColor: "#e7ebebff",
                    }}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Contact Number <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    name="phone"
                    value={formData.phone}
                    readOnly
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      backgroundColor: "#e7ebebff",
                      cursor: "not-allowed",
                      fontSize: "11px",
                      borderRadius: "10px",
                    }}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Doctor Name <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Select
                    size="sm"
                    name="doctor_id"
                    value={formData.doctor_id}
                    onChange={handleInputChange}
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                    required
                  >
                    <option value="">Select a Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.doctor_id} value={doctor.doctor_id}>
                        {doctor.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    FDE Name <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Select
                    size="sm"
                    name="FDE_Name"
                    value={formData.FDE_Name}
                    onChange={handleInputChange}
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                    required
                  >
                    <option value="">Select FDE Name</option>
                    {fdeList.map((fde) => (
                      <option key={fde.FDEID} value={fde.FDEID}>
                        {fde.FDEName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Note
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    as="textarea"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Enter Note"
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      fontSize: "12px",
                      borderRadius: "10px",
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end pt-2">
              <Button
                size="sm"
                variant="danger"
                className="me-2 px-3"
                style={{
                  borderRadius: "10px",
                  fontSize: "12px",
                  padding: "10px",
                }}
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                className="px-3"
                style={{
                  borderRadius: "10px",
                  fontSize: "12px",
                  backgroundColor: "#00bcd4",
                  borderColor: "#00bcd4",
                  padding: "10px",
                }}
                onClick={() => handleSubmit("save")}
              >
                Add Appointment
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal
        show={showEditPatientModal}
        onHide={() => setShowEditPatientModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "#e0f7fa",
            borderBottom: "2px solid #00bcd4",
            padding: "10px 15px",
          }}
        >
          <Modal.Title
            style={{ color: "#00838f", fontWeight: "bold", fontSize: "16px" }}
          >
            <FeatherIcon icon="edit" className="me-2" size="16" />
            Edit Patient Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{
            backgroundColor: "#f8fbfc",
            fontSize: "13px",
            padding: "5px",
          }}
        >
          <Form>
            <div
              className="p-3 mb-4 bg-white rounded shadow-sm border"
              style={{ borderLeft: "5px solid rgb(77, 208, 225)" }}
            >
              <h5
                style={{
                  color: "rgba(67, 162, 174, 1)",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  padding: "5px",
                }}
              >
                Basic Registration Info
              </h5>
              <Row>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      UID No <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="Uid_no"
                      value={formData.Uid_no}
                      readOnly
                      style={{
                        backgroundColor: "#e7ebebff",
                        cursor: "not-allowed",
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Prefix <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      required
                      name="prefix"
                      value={formData.prefix || ""}
                      onChange={handleInputChange}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    >
                      <option value="">Select Prefix</option>
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Master">Master</option>
                      <option value="Ms">Ms</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Patient Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      required
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Patient Name"
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col
                  md={2}
                  className="mb-3 align-items-center justify-content-center"
                >
                  <Form.Group
                    className="rounded border text-center"
                    style={{ backgroundColor: "#94e2eeff" }}
                  >
                    <Form.Label
                      className="small fw-bold d-block mb-5"
                      style={{ marginTop: "5px", fontSize: "12px" }}
                    >
                      VIP Patient
                    </Form.Label>
                    <Form.Check
                      type="checkbox"
                      id="patient_type"
                      name="patient_type"
                      checked={
                        formData.patient_type === 1 ||
                        formData.patient_type === true
                      }
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          patient_type: e.target.checked ? 1 : 0,
                        });
                      }}
                      style={{
                        transform: "scale(1.4)",
                        cursor: "pointer",
                        marginBottom: "5px",
                        fontSize: "12px",
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <div className="p-3 mb-4 bg-white rounded shadow-sm border">
              <h4
                style={{
                  color: "rgba(67, 162, 174, 1)",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  padding: "5px",
                }}
              >
                Contact & Personal Details
              </h4>
              <Row>
                <Col md={4} className="mb-15">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Email ID <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      required
                      type="email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Email"
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Gender <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      required
                      name="sex"
                      value={formData.sex || ""}
                      onChange={handleInputChange}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Contact Number <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      required
                      type="number"
                      name="phone"
                      value={formData.phone}
                      onWheel={(e) => e.target.blur()}
                      onChange={handleInputChange}
                      placeholder="Enter Contact Number"
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Alternate Contact Number
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="mobile_2"
                      value={formData.mobile_2}
                      onWheel={(e) => e.target.blur()}
                      onChange={handleInputChange}
                      placeholder="Enter Secondary Contact No"
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-15">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Nationality <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                      required
                    >
                      <option value="">Select Nationality</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={7} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Address <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      required
                      type="text"
                      name="address"
                      onWheel={(e) => e.target.blur()}
                      value={formData.address || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Residential Address"
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Pincode <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      required
                      type="number"
                      name="pincode"
                      onWheel={(e) => e.target.blur()}
                      value={formData.pincode || ""}
                      onChange={handleInputChange}
                      placeholder="Enter Pincode"
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <div className="p-3 mb-4 bg-white rounded shadow-sm border">
              <h4
                style={{
                  color: "rgba(67, 162, 174, 1)",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  padding: "5px",
                }}
              >
                Identity & Clinical Info
              </h4>
              <Row>
                <Col md={3} className="mb-15">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Identity Document
                    </Form.Label>
                    <Form.Select
                      name="identity"
                      value={
                        formData.identity ? formData.identity.split(",")[0] : ""
                      }
                      onChange={handleInputChange}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    >
                      <option value="">Select Document</option>
                      <option value="Aadhaar No">Aadhaar No</option>
                      <option value="Passport No">Passport No</option>
                      <option value="Voter No">Voter No</option>
                      <option value="Pan No">PAN No</option>
                      <option value="Driving Licence No">
                        Driving Licence No
                      </option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Identity Number
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="identityNumber"
                      value={
                        formData.identity
                          ? formData.identity.split(",")[1] || ""
                          : ""
                      }
                      onChange={handleInputChange}
                      onWheel={(e) => e.target.blur()}
                      placeholder="Enter ID Number"
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Blood Group <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      required
                      name="blood_group"
                      value={formData.blood_group || ""}
                      onChange={handleInputChange}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Birth Date <span className="text-danger">*</span>
                    </Form.Label>
                    <DatePicker
                      required
                      selected={
                        formData?.birth_date
                          ? parseDate(formData.birth_date)
                          : null
                      }
                      onChange={(date) =>
                        date &&
                        handleInputChange({
                          target: { name: "birth_date", value: date },
                        })
                      }
                      className="form-control custom-datepicker"
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select Date"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      maxDate={new Date()}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Age
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.age || ""}
                      readOnly
                      style={{
                        backgroundColor: "#e7ebebff",
                        cursor: "not-allowed",
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Occupation
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="occupation"
                      placeholder="Enter Occupation"
                      value={formData.occupation || ""}
                      onChange={handleInputChange}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Company Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="companyname"
                      placeholder="Enter Company Name"
                      value={formData.companyname || ""}
                      onChange={handleInputChange}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label
                      className="small fw-bold mb-3"
                      style={{ fontSize: "12px" }}
                    >
                      Preferred Language
                    </Form.Label>
                    <Form.Select
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Language</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Assamese">Assamese</option>
                      <option value="Bengali">Bengali</option>
                      <option value="Bodo">Bodo</option>
                      <option value="Dogri">Dogri</option>
                      <option value="Gujarati">Gujarati</option>
                      <option value="Kannada">Kannada</option>
                      <option value="Kashmiri">Kashmiri</option>
                      <option value="Konkani">Konkani</option>
                      <option value="Maithili">Maithili</option>
                      <option value="Malayalam">Malayalam</option>
                      <option value="Manipuri">Manipuri</option>
                      <option value="Marathi">Marathi</option>
                      <option value="Nepali">Nepali</option>
                      <option value="Odia">Odia</option>
                      <option value="Punjabi">Punjabi</option>
                      <option value="Sanskrit">Sanskrit</option>
                      <option value="Santali">Santali</option>
                      <option value="Sindhi">Sindhi</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Urdu">Urdu</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <div className="p-3 bg-white rounded shadow-sm border">
              <h4
                style={{
                  color: "rgba(67, 162, 174, 1)",
                  fontWeight: "700",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  padding: "5px",
                }}
              >
                Work Pattern & Referral
              </h4>
              <Row>
                <Col md={10} className="mb-15">
                  <Form.Label
                    className="small fw-bold mb-3"
                    style={{ fontSize: "12px" }}
                  >
                    Add Specific Work Pattern
                  </Form.Label>
                  <div
                    className="p-3 border rounded d-flex flex-wrap gap-4"
                    style={{
                      backgroundColor: "#94e2eeff",
                      border: "2px solid rgb(77, 208, 225)",
                    }}
                  >
                    {[
                      { name: "Sedentary", label: "Sedentary" },
                      { name: "Travelling", label: "Travelling" },
                      {
                        name: "Mentally Stressful",
                        label: "Mentally Stressful",
                      },
                      {
                        name: "Strenuous (Physical Activity)",
                        label: "Strenuous (Physical Activity)",
                      },
                    ].map((pattern) => (
                      <Form.Check
                        key={pattern.name}
                        type="checkbox"
                        id={`pattern-${pattern.name}`}
                        label={pattern.label}
                        name={pattern.name}
                        checked={workPatterns[pattern.name]}
                        onChange={handleWorkPatternChange}
                        style={{
                          cursor: "pointer",
                          fontWeight: "500",
                          margin: "3px",
                          fontSize: "12px",
                          marginLeft: "10px",
                        }}
                      />
                    ))}
                  </div>
                </Col>

                <Col md={12}>
                  <Form.Label
                    className="small fw-bold mb-1"
                    style={{ fontSize: "12px" }}
                  >
                    Reference
                  </Form.Label>
                  <div className="d-flex gap-3 align-items-start p-3 rounded bg-white">
                    <Form.Select
                      name="reference"
                      className="w-auto"
                      value={formData.reference_type}
                      onChange={handleReferenceChange}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        minWidth: "270px",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    >
                      <option value="">Choose Reference</option>
                      <option value="family_friends">Family / Friends</option>
                      <option value="dr_ref">Referred By Another Doctor</option>
                      <option value="old_ref">
                        Referred By Another Patient
                      </option>
                      <option value="internet">Internet / Social Media</option>
                      <option value="MediaRef">Entertainment Media</option>
                      <option value="TVShow">Tv Show</option>
                      <option value="newspaper">Newspaper / Magazine</option>
                      <option value="awareness_lecture">
                        Awareness Lecture
                      </option>
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
                  </div>
                  <div className="flex">{renderReferenceDetails()}</div>
                </Col>
              </Row>
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer style={{ backgroundColor: "#f1f4f6", padding: "5px" }}>
          <Button
            variant="info"
            className="px-3"
            style={{
              borderRadius: "10px",
              backgroundColor: "#00bcd4",
              borderColor: "#00bcd4",
              fontSize: "12px",
              padding: "10px",
            }}
            onClick={() => handlePrint(selectedPatient)}
          >
            <FeatherIcon icon="printer" size="14" className="me-1" />{" "}
            Registration Form
          </Button>
          <Button
            variant="secondary"
            className="px-3"
            style={{ borderRadius: "10px", fontSize: "12px", padding: "10px" }}
            onClick={() => {
              setShowEditPatientModal(false);
              setSelectedPatient(null);
              setFormData({
                prefix: "",
                date: new Date().toISOString().split("T")[0],
                uid: "",
                patientName: "",
                sex: "",
                mobileNo: "",
                mobile_2: "",
                age: "",
                blood_group: "",
                email: "",
                address: "",
                pincode: "",
                identity: "",
                occupation: "",
                companyname: "",
                Sedentary: false,
                Travelling: false,
                "Strenuous (Physical Activity)": false,
                "Mentally Stressful": false,
                reference: "",
                referenceDetails: "",
                patient_type: false,
                patient_id: "",
              });
              setErrors({});
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="px-4"
            style={{
              borderColor: "rgb(77, 208, 225)",
              color: "white",
              borderRadius: "10px",
              fontSize: "12px",
              padding: "10px",
            }}
            onClick={handleSaveChanges}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

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
                  borderRadius: "12px",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "1.5px solid #00bcd4",
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
                        body={(rowData, { rowIndex }) => rowIndex + 1}
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
                        body={(rowData) => formatDate(rowData.date)}
                        headerClassName="datatable-header-center"
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "90px",
                        }}
                      />

                      <Column
                        field="Uid_no"
                        header="UID No"
                        body={(rowData) =>
                          rowData.Uid_no ? rowData.Uid_no : "-"
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
                        body={(rowData) => rowData.name || "-"}
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
                        body={(rowData) => rowData.phone || "-"}
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
                        body={(rowData) => rowData.mobile_2 || "-"}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          wordBreak: "break-word",
                          width: "110px",
                        }}
                      />

                      <Column
                        field="address"
                        header="Patient Address"
                        headerClassName="datatable-header-center"
                        body={(rowData) => rowData.address || "-"}
                        style={{
                          border: "1px solid #90caf9",
                          padding: "0.75rem",
                          width: "200px",
                          textAlign: "center",
                        }}
                      />

                      <Column
                        field="sex"
                        header="Gender"
                        headerClassName="datatable-header-center"
                        body={(rowData) => rowData.sex || "-"}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "60px",
                        }}
                      />

                      <Column
                        field="age"
                        header="Age"
                        headerClassName="datatable-header-center"
                        body={(rowData) => {
                          if (
                            rowData.age &&
                            !isNaN(rowData.age) &&
                            rowData.age < 150
                          ) {
                            return rowData.age;
                          }
                          const calculated = calculateAge(rowData.birth_date);
                          return calculated !== null &&
                            calculated !== undefined &&
                            calculated !== ""
                            ? calculated
                            : "-";
                        }}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                          width: "70px",
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
    </div>
  );
}
