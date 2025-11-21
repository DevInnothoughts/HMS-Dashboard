import React, { useState, useEffect } from "react";
import moment from "moment";
import { FilterMatchMode } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import FeatherIcon from "feather-icons-react";
import { Link, useNavigate } from "react-router-dom";
import { decodeJwt } from "../../utils/decode-jwt";
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
import NavBarP from "../../components/NavbarP";
import logo from "../../assets/images/3.png";

const BASE_URL = "http://localhost:5100/api"; // Update your API base URL here

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date)) return dateString; // In case the date is already formatted correctly
  return date.toLocaleDateString("en-GB"); // Adjust as needed
};

export default function All_patient() {
  const location = "demo";
  const [patients, setPatients] = useState([]);
  const [fdeList, setFdeList] = useState([]); // FDE list
  const [doctors, setDoctors] = useState([]); // Doctors list
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
    patient_type: false,
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
  });
  const navigate = useNavigate();
  const [filters1, setFilters1] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [loading, setLoading] = useState(false); // Loading state
  // REMOVED: [fromDate, setFromDate]
  // REMOVED: [toDate, setToDate]
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null); // Selected patient data
  const [currentLocation, setCurrentLocation] = useState('default'); // State to hold JWT location
  useEffect(() => {
      // Fetches and sets location from the token upon component mount
      const token = localStorage.getItem('token');
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
    if (!currentLocation || currentLocation === 'default') return;

    try {
        // 💡 FIX 2: Use currentLocation state variable for doctor dropdown
        const doctorResponse = await fetch(
          `${BASE_URL}/V1/appointment/doctorDropdown?location=${encodeURIComponent(currentLocation)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (doctorResponse.ok) {
        const doctorData = await doctorResponse.json();
        console.log("Doctors API Response:", doctorData); // Debug API response
        setDoctors(Array.isArray(doctorData.data) ? doctorData.data : []);
      } else {
        console.error("Failed to fetch doctors:", doctorResponse.statusText);
      }
      // Fetch FDE List
      const fdeResponse = await fetch(
        `${BASE_URL}/V1/appointment/fdeDropdown?location=${location}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
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

  // REMOVED: formatToApiDate is no longer needed as we remove date filtering.
  // const formatToApiDate = (date) => {
  //   if (!date) return "";
  //   const [day, month, year] = date.split("/");
  //   return `${day}-${month}-${year}`; // Return formatted date as yyyy-MM-dd
  // };

  // Add this state for doctor search
  const [doctorSearchResults, setDoctorSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Add this function to fetch doctor details
  const searchDoctorByName = async (name) => {
    if (!name || name.length < 3) {
      setDoctorSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/Patients/listDoctor?name=${name}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Filter the results based on the search term
        const filteredResults = data.data.filter(
          (doctor) =>
            doctor.ref_doctor_name.toLowerCase().includes(name.toLowerCase()) ||
            (doctor.reference_doctor_speciality &&
              doctor.reference_doctor_speciality
                .toLowerCase()
                .includes(name.toLowerCase()))
        );
        console.log("Filtered doctor results:", filteredResults);
        setDoctorSearchResults(filteredResults);
      }
    } catch (error) {
      console.error("Error searching doctor:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Add these new states near the top of your component
  const [patientSearchResults, setPatientSearchResults] = useState([]);
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);

  // Add this new function alongside your other functions
  const searchPatientByPhone = async (phone) => {
    if (!phone || phone.length < 10) {
      setPatientSearchResults([]);
      return;
    }

    setIsSearchingPatient(true);
    try {
      console.log("Calling API with phone:", phone); // ✅ Log input phone

      const response = await fetch(
        `${BASE_URL}/V1/Patients/listRefPatient/${phone}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response Status:", response.status); // ✅ Log API status

      if (response.ok) {
        const data = await response.json();
        console.log("API Response Data:", data); // ✅ Log full API response

        if (data.statusCode === 200 && data.data.refPatientData) {
          // Access the nested refPatientData
          const results = Array.isArray(data.data.refPatientData)
            ? data.data.refPatientData
            : [data.data.refPatientData];
          setPatientSearchResults(results);
          console.log("Updated Patient Search Results:", results); // ✅ Log updated results
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

  // Debug state updates
  useEffect(() => {
    console.log("Updated state in UI:", patientSearchResults);
  }, [patientSearchResults]);

  // Add this function to calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return "";

    const today = new Date();
    const birth = new Date(birthDate);

    if (isNaN(birth.getTime())) return "";

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    // Prevent negative ages for future dates
    return age < 0 ? 0 : age;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log("Input Change:", name, value);

    // Ensure only numbers for phone, alternateNo, and identityNumber
    if (["phone", "mobile_2", "identityNumber"].includes(name)) {
      const numericValue = value.replace(/\D/g, ""); // Remove non-numeric characters
      if (name === "phone" || name === "mobile_2") {
        if (numericValue.length > 10) return; // Restrict to 10 digits
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
        identityType = value; // Store the selected identity type
      } else if (name === "identityNumber") {
        identityNumber = value; // Store the entered identity number
      }

      if (name === "birth_date") {
        // Ensure valid date format (DD/MM/YYYY)
        const formattedDate = new Date(value).toISOString().split("T")[0];
        const age = calculateAge(formattedDate); // Calculate age

        console.log("Formatted Birth Date:", formattedDate, "Age:", age);

        setFormData((prev) => ({
          ...prev,
          birth_date: formattedDate,
          age: age || prev.age, // Update age dynamically
        }));
      } else {
        name !== "identityNumber" &&
          setFormData((prev) => ({ ...prev, [name]: value }));
      }
      return {
        ...prevState,
        identity: `${identityType},${identityNumber}`, // Store them together
      };
    });
  };

  const handleAddAppointment = (e) => {
    e.preventDefault();
    console.log("Submitting Appointment:", formData);

    // Add API call or logic to process the appointment data
    setShowAddModal(false); // Close the modal after submission
  };

  // Fetch patients data - MODIFIED TO REMOVE DATE FILTERING
  const fetchPatientsData = async () => {
    if (!currentLocation || currentLocation === 'default') {
        console.warn("Location not set yet, skipping patient fetch.");
        return;
    }
    setLoading(true);
    try {
        // 💡 FIX 1: Use currentLocation state variable
        const url = new URL(
            `${BASE_URL}/V1/patient/listPatient?location=${encodeURIComponent(currentLocation)}`
        );
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Fetched Data (All Patients):", data.data);
        setPatients(data.data || []);
      } else {
        console.error(
          "Error fetching patients:",
          data.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    // Only fetch if currentLocation has been successfully set from JWT
    if (currentLocation && currentLocation !== 'default') {
        fetchPatientsData();
        fetchDropdownData(); // Also ensure dropdowns use the correct location
    }
}, [currentLocation]); // Run only once

  useEffect(() => {
    if (selectedPatient) {
      console.log("Selected Ptient Data:", selectedPatient);
      // Ensure birth_date is valid before processing
      const birthDateString = selectedPatient.birth_date || "";
      let formattedBirthDate = "";

      if (birthDateString) {
        try {
          const [day, month, year] = birthDateString.split("/");
          formattedBirthDate = `${year}-${month}-${day}`;
        } catch (error) {
          console.error("Error formatting birth date:", error);
          formattedBirthDate = ""; // Avoids breaking UI
        }
      }

      if (selectedPatient) {
        const workPatternsArray = (setSelectedPatient.specific_work || "")
          .split(",")
          .map((pattern) => pattern.trim());
      }

      setFormData({
        Uid_no: selectedPatient.uid || "",
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
      });

      const workPatternsArray = (selectedPatient.specific_work || "")
        .split(",")
        .map((pattern) => pattern.trim());

      setWorkPatterns({
        Sedentary: workPatternsArray.includes("Sedentary"),
        Travelling: workPatternsArray.includes("Travelling"),
        "Strenuous (Physical Activity)": workPatternsArray.includes(
          "Strenuous (Physical Activity)"
        ),
        "Mentally Stressful": workPatternsArray.includes("Mentally Stressful"),
      });

      console.log("formatted Birth Date:", formattedBirthDate);
    }
  }, [selectedPatient]); // Runs whenever `selectedPatient` changes

  const formatDateToDisplay = (dateString) => {
    if (!dateString) return ""; // Return empty if no date is provided

    const dateParts = dateString.split("-");

    if (dateParts.length === 3) {
      const [year, month, day] = dateParts;

      // Ensure all values are numbers and in the right range
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return `${day}-${month}-${year}`;
      }
    }

    console.error("Invalid date format:", dateString);
    return ""; // Return empty if the format is incorrect
  };

  const handleEditPatient = (patient) => {
    console.log("Editing patient:", patient);

    // Safely format birth date
    const formattedBirthDate = formatDateToDisplay(patient.birth_date);
    // Parse specific_work pattern
    const workPatternsArray = (patient.specific_work || "")
      .split(",")
      .map((item) => item.trim());

    // Calculate age safely
    const age = patient.age || calculateAge(formattedBirthDate) || "";

    // Set formData with safe default values
    setFormData({
      Uid_no: patient.uid || "",
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
      reference_type: patient.reference_type || "", // Ensure it's set
      specific_work: Boolean(patient.specific_work) || "", // Ensure it's set
    });

    // Convert work pattern string into checkboxes
    setWorkPatterns({
      Sedentary: workPatternsArray.includes("Sedentary"),
      Travelling: workPatternsArray.includes("Travelling"),
      "Strenuous (Physical Activity)": workPatternsArray.includes(
        "Strenuous (Physical Activity)"
      ),
      "Mentally Stressful": workPatternsArray.includes("Mentally Stressful"),
    });
    setSelectedPatient(patient);
    setShowEditPatientModal(true);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      toast.error("No patient selected for editing.");
      return;
    }

    // Create a reference type string based on selected reference and its details
    let reference_type = "";
    let ref = "";

    switch (selectedReference) {
      case "newspaper":
        reference_type = "newspaper";
        ref = referenceDetails.newspaper || "";
        break;
      case "dr_ref":
        reference_type = "dr_ref";
        ref = referenceDetails.dr_ref || "";
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
        ref = `${oldPatientDetails.patient_ref_no || ""},${
          oldPatientDetails.old_patient_name || ""
        },${oldPatientDetails.old_patient_id_value || ""},${
          oldPatientDetails.old_patient_pincode || ""
        }`;
        break;
      case "family_friends":
        reference_type = "family_friends";
        ref = `${referenceDetails.friendname || ""},${
          referenceDetails.friendno || ""
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
      default:
        reference_type = null;
        ref = null;
    }

    console.log("Reference Type:", reference_type);
    console.log("Reference:", ref);

    // Convert workPatterns into a comma-separated string
    const specificWork = Object.entries(workPatterns)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join(",");

    const updatedPatientData = {
      ...formData,
      date: formData.date || "",
      birth_date: formData.birth_date,
      age: formData.birth_date,
      specific_work: specificWork,
      reference_type,
      ref,
    };

    console.log("Updated Patient Data:", updatedPatientData);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/patient?patient_id=${selectedPatient.patient_id}&location=${location}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedPatientData),
        }
      );

      const responseData = await response.json(); // ✅ Fetch response JSON only once

      if (response.ok) {
        toast.success("Patient information updated successfully");

        // Update the patient in state without refreshing
        setPatients((prevPatients) =>
          prevPatients.map((p) =>
            p.phone === selectedPatient.phone
              ? { ...p, ...responseData.data } // ✅ Use the received data correctly
              : p
          )
        );

        // Close the modal and reset state
        setShowEditPatientModal(false);
        setSelectedPatient(null);
        setFormData({});
      } else {
        toast.error(responseData.message || "Failed to update patient");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
  };

  // Status template for the DataTable
  const statusBodyTemplate = (formData) => (
    <span
      className={`badge ${
        formData.status
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
        `${BASE_URL}/V1/appointment/addAppointment`
      );

      if (!add_appointmentResponse.ok) {
        console.error(
          "Add appointment failed",
          await add_appointmentResponse.text()
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
    // Get the selected FDE's name from the fdeList
    const selectedFDE = fdeList.find((fde) => fde.FDEID === formData.FDE_Name);
    const fdeName = selectedFDE ? selectedFDE.FDEName : "";

    const formattedDate = moment(formData.date).format("DD-MM-YYYY"); // Format date before sending

    // Get the selected doctor's name from the doctors list
    const selectedDoctor = doctors.find(
      (doc) => doc.doctor_id === formData.doctor_id
    );
    const doctorName = selectedDoctor ? selectedDoctor.name : "";

    console.log("Selected Doctor:", {
      doctor_id: formData.doctor_id,
      doctorName: doctorName,
    });

    console.log("Selected FDE:", {
      FDEID: formData.FDE_Name,
      FDEName: fdeName,
    });

    const payload = {
      date: formattedDate,
      doctor_id: formData.doctor_id,
      doctorName: formData.doctorName,
      patientName: formData.name,
      patient_phone: formData.phone,
      appointmentTime: formData.appointmentTime,
      FDE_Name: formData.FDE_Name,
      note: formData.note,
      phone: formData.phone,
    };

    try {
      console.log("Sending request to backend...", payload);

      const response = await fetch(
        `${BASE_URL}/V1/appointment/addAppointment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      // Handle the response as needed
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json();
      console.log("Appointment added successfully:", responseData);
      toast.success("Appointment booked successfully");
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding appointment:", error.message);
      toast.error("Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Actions template for the DataTable
  const handleAddAppointmentClick = (patient) => {
    console.log("Selected Patient for Appointment:", patient);
    console.log("Patient Phone Number:", patient.phone);

    // Create a new Date object for today and format it properly
    const today = new Date();
    const formattedDate = today; // Keep it as a Date object

    const formDataToSet = {
      date: formattedDate, // Store the actual Date object
      doctor_id: "",
      doctorName: "",
      name: patient.name || "",
      phone: patient.phone || "",
      appointmentTime: "",
      fdeId: "",
      FDE_Name: "",
      note: patient.note || "",
    };

    console.log("Setting form data:", formDataToSet);
    setFormData(formDataToSet);
    setShowAddModal(true);
  };

  const handlePrint = (patient) => {
    const printWindow = window.open("", "_blank", "width=800,height=800");

    const getBase64Image = (imgUrl) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.src = imgUrl;
      });
    };

    Promise.all([getBase64Image(logo)]).then(([mainLogo]) => {
      const printContent = `
      <html>
        <head>
          <title>Registration Form - Healing Hands</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
          <style>
            body {
              font-family: Arial, sans-serif;
              font-size: 10px;
              margin: 20px;
            }
            .container {
              background: white;
              border-radius: 10px;
              padding: 10px;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 2px solid #2b9163;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .header img {
              width: 180px;
              height: auto;
            }
            .header .reg-info {
              text-align: right;
              font-size: 25px;
              color: #2b9163;
              font-weight: bold;
            }
            .section-title {
              font-size: 12px;
              font-weight: bold;
              color: #2b9163;
              margin-bottom: 5px;
              border-bottom: 1px solid #2b9163;
              padding-bottom: 3px;
            }
            .details-table {
              width: 100%;
              border-collapse: collapse;
            }
            .details-table td {
              padding: 2px 5px; /* Reduced padding */
              font-size: 10.5px; /* Smaller text for patient details */
            }
            .details-table td:first-child {
              font-weight: bold;
              width: 30%;
            }
            .row {
              display: flex;
              justify-content: space-between;
              width: 100%;
            }
            .col {
              width: 48%;
            }
            .consent-box {
              border: 2px solid #2b9163;
              padding: 8px;
              margin-top: 10px;
              border-radius: 5px;
              font-size: 12px;
            }
            .consent-title{
              text-align: right;
              font-size: 20px;
              color: #2b9163;
              font-weight: bold;
            } 
            
            .signature-box {
              display: flex;
              justify-content: space-between;
              margin-top: 5px;
            }
            .signature-box p {
              border-top: 1px solid black;
              width: 30%;
              text-align: center;
              padding-top: 3px;
            }
            .time-date{
              display: flex;
              justify-content: space-between;
              margin-top: 5px;
              }
              .time-date p{
              border-top: 1px solid black;
              width: 20%;
              text-align: center;
              padding-top: 3px;
              }

            .footer {
              text-align: center;
              font-size: 10px;
              color: grey;
              margin-top: 15px;
            }
            /* Print button styling */
            .print-btn {
              display: block;
              width: 20%;
              padding: 10px;
              background-color: #2b9163;
              color: white;
              text-align: center;
              font-size: 14px;
              font-weight: bold;
              cursor: pointer;
              border: none;
              border-radius: 5px;
              
            }
            /* Hide print button when printing */
            @media print {
              .print-btn {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${mainLogo}" alt="Healing Hands Clinic">
              <div class="reg-info">
                <p>Registration Form</p>
              </div>
            </div>
            
            <div class="section-title">Patient Details</div>
            <div class="row">
              <div class="col">
                <table class="details-table">	
                  <tr><td>Reg No:</td><td>${patient.Uid_no}</td></tr>
                  <tr><td>Name:</td><td>${patient.name}</td></tr>
                  <tr><td>Gender:</td><td>${patient.sex}</td></tr>
                  <tr><td>DOB (Age):</td><td>${patient.birth_date} (${
        patient.age
      })</td></tr>
         <tr><td>Reffered By:</td><td>${patient.reference_type}</td></tr>	 
                  
                </table>
              </div>
              <div class="col">
                <table class="details-table">
                  <tr><td>Date:</td><td>${new Date().toLocaleDateString()}</td></tr>
                  <tr><td>Address:</td><td>${patient.address}</td></tr>
                  <tr><td>Mobile No:</td><td>${patient.phone}</td></tr>
                  <tr><td>Email:</td><td>${patient.email}</td></tr>
                    	<tr><td>Occupation:</td><td>${
                        patient.occupation
                      }</td></tr>	 
                </table>
              </div>
            </div>

            <div class="consent-box">
            <div class="consent-title">OPD CONCENT FORM</div>
              <p>I, the undersigned patient or responsible relative ....................................................................................................................................
              	  hereby give consent and authority to Healing Hands Clinic physicians, surgeons and medical person administer and perform medical examinations, investigations, medical treatments and out-patient procedure during the course of the medical care as an out-patient, as deemed advisable or necessary.
              	  I understand and accept Healing Hands Clinic policies and agree to abide by them. I also give consent to the clinic for contacting me/him/her by telephone if needed regarding appointments and follow-ups.| allow the clinic and the doctors to discuss about my/his/her medical issues amongst themselves knowing that privacy will be maintained.
              	  I undersigned, give permission for using any observed/discussed/new information found during my consultation/treatment to be used for study purposes/research in future.
              	  </p>
              <p>मी खाली सही करणारा रुग्ण / रुग्णाचा जबाबदार पालक/ नातेवाईक ..........................................................................................................
              	  हीलींग हॅन्डस् क्लिनीक येथिल चिकिसक शल्यविशाराद व वैधकीय कर्मचारी याना बाहय रुग्ण म्हणून सदर रुग्णाच्या हितासाठी / आरोग्यासाठी आवश्यक त्या सर्व नैदानिक तपासण्या परीक्षणे, वैद्यकीय औषधोपचार व लघुशस्त्रक्रिया करण्यास परवानगी देतो. मला हीलींग हॅन्डस क्लिनीकची सर्व धोरणे ज्ञात सून मी त्याचे पालन करण्यास तयार आहे.
              	  मी खाली सही करणार अशी ही संमती देतो की मला तपासणीच्या वेळेतील बदल किंवा फेरतपासणीबाबतच्या वेळेतील व इतर अन्य बदल कळविण्याकरीता केलेल्या दूरध्वनी संपर्कबद्दल मला आक्षेप असणार नाही. मी, क्लिनिक व डॉक्टर यांना माझ्या / त्याच्या/ तिच्या वैदयकिय समस्थाची आपआपसांत चर्चा करण्याची परवानगी देत आहे तसेच यांची गोपनियता राखण्यात येईल याची मला माहीती दिलेली आहे. मी खाली सही करणारा/करणारी,
              	   माझ्या उपचाराच्या दरम्यान प्राप्त झालेली / सापडलेली कोणत्याही प्रकारच्या माहितीचे उपयोग भविष्यकालीन अभ्यासासाठी / संशोधनासाठी करण्याची परवानगी देत आहे.
              	   </p>
                                 <p>Patients Name (रुग्णाचे नाव)::</p><br>
              <div class="signature-box">
                <p>Patient's Signature(रुग्णाची सही)</p>
                
                <p>Witness Signature(साक्षीदाराची सही)</p>

              </div><br>
              <div class="time-date">
                <p>Time Date
                <br>(वेळ व दिनांक)
                </p>
                <p>Time Date
                <br>(वेळ व दिनांक)
                </p>
                </div>
            </div>
          </div>
            <!-- Print Button -->
            <button class="print-btn" onclick="window.print()">Print</button>
          <div class="footer">
            <hr />
            &copy;2025 <a target="_blank" href="http://www.innothoughts.com/" style="color:grey;">Innothoughts System Pvt. Ltd</a>
          </div>
        </body>
      </html>
    `;

      printWindow.document.write(printContent);
      printWindow.document.close();

      // Print after images load
      setTimeout(() => {
        printWindow.print();
      }, 1000);
    });
  };

  const actionBodyTemplate = (patient) => (
    <div
      className="cart-action"
      style={{ margin: "5px", display: "flex", gap: "5px" }}
    >
      <Link
        onClick={() => handlePrint(patient)}
        className="print"
        to=""
        style={{
          width: "35px", // Slightly reduce the width
          height: "35px", // Slightly reduce the height
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "50%", // Circular shape
          padding: "0", // Remove default padding
        }}
        title="Print" // Tooltip text on hover
      >
        <FeatherIcon icon="printer" className="w-18" />
      </Link>
      <Button
        variant="btn"
        onClick={() => handleAddAppointmentClick(patient)} // Pass patient here
        className="appointment-btn"
        title="Add Appointment" // Tooltip text on hover
        style={{
          width: "35px", // Set a fixed size for consistent button sizes
          height: "35px", // Set a fixed size for consistent button sizes
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "50%", // Circular shape
          padding: "0", // Remove padding to keep the size uniform
        }}
      >
        <FeatherIcon icon="plus-square" className="w-18" />
      </Button>
      <Button
        variant="btn"
        onClick={() => handleEditPatient(patient)} // Pass patient here
        className="edit-btn"
        style={{
          width: "35px", // Slightly reduce the width
          height: "35px", // Slightly reduce the height
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "50%", // Circular shape
          padding: "0", // Remove default padding
        }}
        title="Edit Patient" // Tooltip text on hover
      >
        <FeatherIcon icon="edit" className="w-18" />
      </Button>
    </div>
  );

  const renderReferenceDetails = () => {
    switch (selectedReference) {
      case "newspaper":
        return (
          <div className="control-group">
            <label className="control-label">Newspaper</label>
            <div
              className="controls"
              style={{
                //  display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
                fontSize: "10px",
              }}
            >
              <ul
                className="checkbox-grid"
                style={{ display: "flex", margin: 0, padding: 0 }}
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
                        marginRight: "100px",
                        transform: "scale(1.5)", // Increase size
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
                            ref: paper, // Store the selected TV show in ref
                            reference_type: "newspaper", // Store "Newspaper" in reference_type
                          }));
                        }}
                        checked={referenceDetails.newspaper === paper}
                        style={{ marginRight: "10px" }} // Space between radio and label
                      />
                      {paper}
                    </li>
                  )
                )}
              </ul>
              <input
                className="form-control"
                type="text"
                name="Other_Newspaper"
                placeholder="Other"
                value={referenceDetails.Other_Newspaper || ""}
                onChange={(e) => {
                  handleReferenceChange(e);
                  setFormData((prev) => ({
                    ...prev,
                    ref: e.target.value, // Store the other newspaper in ref
                    reference_type: "newspaper", // Store "Newspaper" in reference_type
                  }));
                }}
              />
            </div>
          </div>
        );

      case "dr_ref":
        return (
          <div className="control-group">
            <label className="control-label">Doctor Reference</label>
            <div
              className="controls"
              style={{
                display: "flex",
                gap: "10px",
                fontSize: "10px",
              }}
            >
              {/* Doctor Name Input with Search */}
              <input
                className="form-control"
                type="text"
                name="reference_doctor_name"
                placeholder="Search Doctor Name (min: 3 characters)"
                value={referenceDetails.reference_doctor_name || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  handleReferenceChange(e);
                  searchDoctorByName(value);
                }}
                style={{ flex: "1", minWidth: "200px" }}
              />

              {/* Search Indicator */}
              {isSearching && <div>Searching...</div>}

              {/* Doctor Search Results Dropdown */}
              {doctorSearchResults.length > 0 && (
                <div
                  className="search-results"
                  style={{
                    position: "absolute",
                    zIndex: 1000,
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    //  width: "100%",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    fontSize: "15px",
                  }}
                >
                  {doctorSearchResults.map((doctor, index) => (
                    <div
                      key={index}
                      className="search-result-item"
                      style={{ flex: "1", minWidth: "200px" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f5f5f5")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "white")
                      }
                      onClick={() => {
                        setReferenceDetails((prev) => ({
                          ...prev,
                          reference_doctor_name: doctor.ref_doctor_name || "",
                          reference_doctor_no: doctor.ref_doctor_phone || "",
                          reference_doctor_speciality:
                            doctor.reference_doctor_speciality || "",
                          reference_doctor_location:
                            doctor.reference_doctor_location || "",
                        }));
                        setDoctorSearchResults([]); // Clear search results after selection
                      }}
                    >
                      <div style={{ fontWeight: "bold" }}>
                        {doctor.ref_doctor_name}
                      </div>
                      <div style={{ fontSize: "0.9em", color: "#666" }}>
                        {doctor.reference_doctor_speciality}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Other Doctor Reference Fields (Read-Only) */}
              <input
                className="form-control"
                type="text"
                name="reference_doctor_no"
                placeholder="Doctor Phone No"
                value={referenceDetails.reference_doctor_no || ""}
                onChange={handleReferenceChange}
                style={{ flex: "1", minWidth: "200px" }}
                readOnly
              />
              <input
                className="form-control"
                type="text"
                name="reference_doctor_speciality"
                placeholder="Medical Specialties"
                value={referenceDetails.reference_doctor_speciality || ""}
                onChange={handleReferenceChange}
                style={{ flex: "1", minWidth: "200px" }}
                readOnly
              />
              <input
                className="form-control"
                type="text"
                name="reference_doctor_location"
                placeholder="Doctor Location"
                value={referenceDetails.reference_doctor_location || ""}
                onChange={handleReferenceChange}
                style={{ flex: "1", minWidth: "200px" }}
                readOnly
              />
            </div>
          </div>
        );

      case "internet":
        return (
          <div className="control-group">
            <label className="control-label">Internet</label>
            <div
              className="controls"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "30px",
                flexWrap: "wrap",
              }}
            >
              <ul
                className="checkbox-grid"
                style={{ display: "flex", margin: 0, padding: 0 }}
              >
                {[
                  "Google",
                  "Website",
                  "Practo",
                  "Just Dial",
                  "FB",
                  "Youtube",
                  "Instagram",
                ].map((source) => (
                  <li
                    key={source}
                    style={{
                      listStyleType: "none",
                      display: "flex",
                      alignItems: "center",
                      marginRight: "100px",
                      cursor: "pointer",
                      transform: "scale(1.2)", // Increase size
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
                            ref: source, // Store selected source in ref
                            reference_type: "internet",
                        }));
                      }}
                      checked={referenceDetails.internet === source}
                      style={{ marginRight: "10px" }} // Space between radio and label
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
            <label className="control-label">Entertainment Media</label>
            <div
              className="controls"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <ul className="checkbox-grid" style={{ display: "flex" }}>
                {["Radio", "TV Show", "Hoarding"].map((media) => (
                  <li
                    key={media}
                    style={{
                      listStyleType: "none",
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      marginRight: "100px",
                      transform: "scale(1.2)", // Increase size
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
                            ref: media, // Store selected media in ref
                            reference_type: "MediaRef",
                        }));
                      }}
                      checked={referenceDetails.MediaRef === media}
                      style={{ marginRight: "10px" }} // Space between radio and label
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
            <label className="control-label">TV Show</label>
            <div
              className="controls"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px", // Reduced gap
                margin: 0,
                padding: 0,
                width: "100%", // Ensure full width
              }}
            >
              <ul
                className="checkbox-grid"
                style={{
                  display: "flex",
                  margin: 0,
                  padding: 0,
                  fontSize: "17px", // Slightly smaller font size
                  gap: "10px", // Reduced gap
                  whiteSpace: "nowrap", // Prevent wrapping
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
                      marginRight: "10px", // Reduced margin
                      cursor: "pointer",
                      transform: "scale(1)", // Normal size
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
                            ref: show, // Store selected show in ref
                            reference_type: "TVShow",
                        }));
                      }}
                      checked={referenceDetails.TVShow === show}
                      style={{ marginRight: "5px" }} // Reduced space between radio and label
                    />
                    {show}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case "old_ref":
        return (
          <div className="control-group">
            <label className="control-label">Patient Reference</label>
            <div
              className="controls"
              style={{ display: "flex", gap: "10px", fontSize: "10px" }}
            >
              {/* Phone Number Input with Search */}
              <input
                className="form-control"
                type="tel" // Use 'tel' to bring up numeric keypad on mobile
                name="patient_ref_no"
                placeholder="Enter Phone Number (min: 9 digits)"
                value={oldPatientDetails.patient_ref_no || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only numbers and limit to 10 digits
                  if (/^\d{0,10}$/.test(value)) {
                    setOldPatientDetails((prev) => ({
                      ...prev,
                      patient_ref_no: value,
                    }));
                    searchPatientByPhone(value);
                  }
                }}
                maxLength="10" // Limit input to 10 characters
                style={{ flex: "1", minWidth: "200px" }}
              />

              {/* Search Results Dropdown */}
              {(isSearchingPatient || patientSearchResults.length > 0) && (
                <div
                  className="search-results"
                  style={{
                    position: "absolute",
                    zIndex: 1000,
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    // width: "100%",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    fontSize: "15px",
                  }}
                >
                  {isSearchingPatient && <div>Searching...</div>}
                  {patientSearchResults.length > 0 ? (
                    patientSearchResults.map((patient, index) => (
                      <div
                        key={index}
                        className="search-result-item"
                        style={{
                          display: "flex",
                          padding: "10px",
                          cursor: "pointer",
                          borderBottom: "1px solid #eee",
                          backgroundColor: "#fff",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f5f5f5")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "white")
                        }
                        onClick={() => {
                          setOldPatientDetails({
                            patient_ref_no: patient.phone || "",
                            old_patient_name: patient.name || "",
                            old_patient_id_value: patient.patient_id || "",
                            old_patient_pincode: patient.pincode || "",
                          });
                          setPatientSearchResults([]); // Clear search results after selection
                          setFormData((prev) => ({
                            ...prev,
                            ref: `${patient.phone || ""},${patient.name || ""},${patient.patient_id || ""},${patient.pincode || ""}`,
                            reference_type: "old_ref",
                          }));
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "bold",
                            flex: 2,
                            fontSize: "1.1em",
                          }}
                        >
                          {patient.name}
                        </div>
                        <div
                          style={{ fontSize: "0.9em", color: "#666", flex: 1 }}
                        >
                          Pincode: {patient.pincode}
                        </div>
                        <div
                          style={{ fontSize: "0.9em", color: "#666", flex: 1 }}
                        >
                          Phone: {patient.phone}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "10px", color: "#666" }}>
                      No patient found
                    </div>
                  )}
                </div>
              )}

              {/* Other Patient Details (Read-Only) */}
              <input
                className="form-control"
                type="text"
                name="old_patient_name"
                placeholder="Patient Name"
                value={oldPatientDetails.old_patient_name || ""}
                onChange={handleReferenceChange}
                style={{ flex: "1", minWidth: "200px" }}
                readOnly
              />
              <input
                className="form-control"
                type="text"
                name="old_patient_id_value"
                placeholder="Patient ID"
                value={oldPatientDetails.old_patient_id_value || ""}
                onChange={handleReferenceChange}
                style={{ flex: "1", minWidth: "200px" }}
                readOnly
              />
              <input
                className="form-control"
                type="text"
                name="old_patient_pincode"
                placeholder="Pincode"
                value={oldPatientDetails.old_patient_pincode || ""}
                onChange={handleReferenceChange}
                style={{ flex: "1", minWidth: "200px" }}
                readOnly
              />
            </div>
          </div>
        );

      case "family_friends":
        return (
          <div className="control-group">
            <label className="control-label">Family/Friends</label>
            <div
              className="controls"
              style={{ display: "flex", gap: "10px", fontSize: "10px" }}
            >
              <input
                className="form-control"
                type="text"
                name="friendname"
                placeholder="Friend Name"
                value={referenceDetails.friendname || ""}
                onChange={(e) => {
                    handleReferenceChange(e);
                    setFormData((prev) => ({
                      ...prev,
                      ref: `${e.target.value},${referenceDetails.friendno || ""}`,
                      reference_type: "family_friends",
                    }));
                }}
                style={{ flex: "1", minWidth: "200px" }} // Adjust width as needed
              />
              <input
                className="form-control"
                type="tel" // Use 'tel' to bring up numeric keypad on mobile
                name="friendno"
                placeholder="Friend Number"
                value={referenceDetails.friendno || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only numbers and limit to 10 digits
                  if (/^\d{0,10}$/.test(value)) {
                    handleReferenceChange(e);
                    setFormData((prev) => ({
                      ...prev,
                      ref: `${referenceDetails.friendname || ""},${value}`,
                      reference_type: "family_friends",
                    }));
                  }
                }}
                maxLength="10" // Limit input to 10 characters
                style={{ flex: "1", minWidth: "200px" }} // Adjust width as needed
              />
            </div>
          </div>
        );
      case "hhc_board":
        return (
          <div className="control-group">
            <label className="control-label">HHC Board</label>
            <div className="controls">
              <ul className="checkbox-grid">
                <li>
                  <input
                    type="radio"
                    name="HHC_board"
                    value="HHC_board"
                    onChange={(e) => {
                        handleReferenceChange(e);
                        setFormData((prev) => ({
                          ...prev,
                          ref: "HHC_board",
                          reference_type: "hhc_board",
                        }));
                    }}
                    checked={referenceDetails.HHC_board === "HHC_board"}
                    style={{ marginRight: "10px", transform: "scale(1.2)" }} // Space between radio and label
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
                    style={{ marginRight: "10px", transform: "scale(1.2)" }} // Space between radio and label
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
            <label className="control-label">Other Detail</label>
            <div className="controls">
              <ul className="checkbox-grid">
                <li>
                  <input
                    className="form-control"
                    type="text"
                    name="other"
                    placeholder="Other"
                    value={referenceDetails.other || ""}
                    onChange={(e) => {
                        handleReferenceChange(e);
                        setFormData((prev) => ({
                          ...prev,
                          ref: e.target.value,
                          reference_type: "other",
                        }));
                    }}
                  />
                </li>
              </ul>
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
      default:
        return null;
    }
  };

  const handleReferenceChange = (e) => {
    const { value } = e.target;
    setSelectedReference(value); // Update selectedReference state
    
    // Note: The specific reference setting (formData.ref and formData.reference_type) 
    // is now handled inside the renderReferenceDetails switch case to capture sub-details.
    // However, if the main dropdown is changed, we update the reference type here immediately.
    setFormData((prev) => ({
        ...prev,
        reference_type: value,
        // Reset ref details when main type changes, will be overwritten by input/radio handlers
        ref: "", 
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
    patient_ref_no: "", // This will store the phone number
    old_patient_name: "",
    old_patient_id_value: "",
    old_patient_pincode: "",
  });

  // Header content with search and refresh button
  // MODIFIED: Date picker section removed entirely
  const renderHeader = () => (
    <div
      style={{
        border: "2px solid #4dd0e1",
        textAlign: "center",
        borderRadius: "12px",
        padding: "15px",
        backgroundColor: "#e0f7fa",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start", // Align to start since date pickers are gone
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Global Search Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "30px",
          }}
        >
          <Form.Group
            style={{
              display: "flex",
              alignItems: "center",
              margin: 0,
            }}
          >
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
                  borderRadius: "8px",
                  border: "2px solid #4dd0e1",
                  padding: "8px 12px",
                  width: "250px",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                }}
              />
            </InputGroup>
          </Form.Group>
        </div>

        {/* Refresh Button (Now simple refresh for all data) */}
        <Button
          variant="primary"
          onClick={fetchPatientsData} // Call fetchPatientsData without parameters
          style={{
            backgroundColor: "#00bcd4",
            border: "none",
            borderRadius: "8px",
            padding: "8px 20px",
            fontSize: "14px",
            fontWeight: "500",
            color: "white",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            // marginTop: "20px", // Removed margin since date picker is gone
            ":hover": {
              backgroundColor: "#00acc1",
              transform: "translateY(-1px)",
              boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
            },
          }}
        >
          <FeatherIcon icon="refresh-ccw" size={16} className="me-2" /> Refresh All Data
        </Button>
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
    const startTime = new Date();
    const endTime = new Date();
    endTime.setHours(23, 45, 0);

    // Check if the selected date is today
    const isToday = formData.date === new Date().toISOString().split("T")[0];

    if (isToday) {
      startTime.setHours(
        new Date().getHours(),
        Math.ceil(new Date().getMinutes() / 15) * 15,
        0
      ); // Start from the next 15-minute slot
    } else {
      startTime.setHours(7, 0, 0); // Start from 7 AM for future dates
    }

    while (startTime <= endTime) {
      const timeString = startTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      slots.push(timeString);
      startTime.setMinutes(startTime.getMinutes() + 15);
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleDateChange = (date) => {
    if (!date) {
      console.error("Invalid date selected");
      return;
    }

    const formattedDate = date.toISOString().split("T")[0]; // Format to YYYY-MM-DD
    console.log("Formatted Date:", formattedDate);

    setFormData((prevState) => {
      if (prevState.date === formattedDate) return prevState; // Prevent redundant updates
      return {
        ...prevState,
        date: formattedDate,
      };
    });

    if (name === "birth_date") {
      const calculatedAge = calculateAge(date); // Pass Date object to calculatedAge

      setFormData((prevState) => {
        if (
          prevState.birth_date === formattedDate &&
          prevState.age === calculatedAge
        )
          return prevState; // Prevent unnecessary updates

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

    // Prevent unnecessary regeneration of time slots
    // NOTE: This logic seems redundant here as timeSlots is a constant function
    // setTimeSlots((prevSlots) => {
    //   const newSlots = generateTimeSlots();
    //   return JSON.stringify(prevSlots) !== JSON.stringify(newSlots)
    //     ? newSlots
    //     : prevSlots;
    // });
  };

  // Update the parseDate function to be more robust
  function parseDate(dateString) {
    if (!dateString) return null;

    try {
      // If already a Date object
      if (dateString instanceof Date) {
        return isNaN(dateString.getTime()) ? null : dateString;
      }

      // Handle DD/MM/YYYY format
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split("/");
        const date = new Date(year, month - 1, day);
        return isNaN(date.getTime()) ? null : date;
      }

      // Handle YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
      }

      // Try parsing as a regular date string
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
        padding: "20px",
      }}
    >
      <NavBarP pagename="All Registered Patients" />
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddAppointment}>
            <Row>
              {/* Date */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <DatePicker
                    selected={formData.date ? new Date(formData.date) : null}
                    onChange={(date) => {
                        handleDateChange(date);
                        setFormData((prev) => ({
                            ...prev,
                            date: date.toISOString().split("T")[0],
                        }));
                    }}
                    className="form-control"
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select Date"
                    minDate={new Date()} // Prevent past dates
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-20">
                  <Form.Label>Doctor Name</Form.Label>
                  <Form.Select
                    name="doctor_id" // Use doctor_id for API submission
                    value={formData.doctor_id}
                    onChange={(e) => {
                        const selectedDocId = e.target.value;
                        const selectedDoc = doctors.find(doc => doc.doctor_id === selectedDocId);
                        setFormData((prev) => ({ 
                            ...prev, 
                            doctor_id: selectedDocId,
                            doctorName: selectedDoc ? selectedDoc.name : ""
                        }));
                    }}
                  >
                    <option value="">Select a Doctor</option>
                    {doctors && doctors.length > 0 ? (
                      doctors.map((doctor) => (
                        <option key={doctor.doctor_id} value={doctor.doctor_id}>
                          {doctor.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No doctors available</option>
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-20">
                  <Form.Label>Patient Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Patient Name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-20">
                  <Form.Label>Mobile Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    placeholder="Mobile Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Appointment Time</Form.Label>
                  <Form.Select
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
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
              <Col md={6}>
                <Form.Group className="mb-20">
                  <Form.Label>FDE Name</Form.Label>
                  <Form.Select
                    name="FDE_Name"
                    value={formData.FDE_Name}
                    onChange={(e) => {
                        const selectedFDEId = e.target.value;
                        const selectedFDE = fdeList.find(fde => fde.FDEID === selectedFDEId);
                        setFormData((prev) => ({ 
                            ...prev, 
                            FDE_Name: selectedFDEId,
                            fdeName: selectedFDE ? selectedFDE.FDEName : "" // Store name for confirmation if needed
                        }));
                    }}
                  >
                    <option value="">Select FDE Name</option>
                    {fdeList &&
                      fdeList.length > 0 &&
                      fdeList.map((fde) => (
                        <option key={fde.FDEID} value={fde.FDEID}>
                          {fde.FDEName}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={15}>
                <Form.Group className="mb-20">
                  <Form.Label>Note</Form.Label>
                  <Form.Control
                    type="text"
                    name="note"
                    placeholder="Note"
                    value={formData.note}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <div className="d-flex justify-content-center">
                <Col className="text-end">
                  <button
                    type="button"
                    className="btn btn-primary me-2"
                    onClick={() => handleSubmit("save")}
                  >
                    Book Appointment
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({
                        date: "",
                        doctor_id: "",
                        name: "",
                        phone: "",
                        appointmentTime: "",
                        FDE_Name: "",
                        note: "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                </Col>
              </div>
            </Row>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal
        show={showEditPatientModal}
        onHide={() => setShowEditPatientModal(false)}
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Patient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={3} className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Label>UID No</Form.Label>
                  <Form.Control
                    type="text"
                    name="Uid_no"
                    value={formData.Uid_no}
                    readOnly
                    style={{
                      backgroundColor: "#e9ecef", // Light grey background to indicate read-only
                      color: "#6c757d", // Grey text color
                      cursor: "not-allowed", // Show "not-allowed" cursor
                    }}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              {/* Date */}
              <Col md={3} className="mb-4">
                <Form.Group className="mb-3" controlId="formPatientDate">
                  <Form.Label>Patient Date</Form.Label>
                  <Form.Control
                    type="text"
                    name="date"
                    value={formatDate(formData.date)}
                    readOnly
                    style={{
                      backgroundColor: "#e9ecef", // Light grey background to indicate read-only
                      color: "#6c757d", // Grey text color
                      cursor: "not-allowed", // Show "not-allowed" cursor
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Label>Prefix</Form.Label>
                  <Form.Control
                    id="prefix"
                    as="select"
                    name="prefix"
                    value={formData.prefix || ""}
                    onChange={handleInputChange}
                  >
                    <option value="">Prefix</option>
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                    <option value="Mrs">Mrs</option>
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={2} className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Label>Patient Name</Form.Label>
                  <Form.Control
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    placeholder="Enter Patient Name"
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Label>VIP</Form.Label>
                  <Form.Check
                    type="checkbox"
                    id="patient_type"
                    name="patient_type"
                    checked={!!formData.patient_type} // Ensure it's treated as a boolean
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        patient_type: e.target.checked, // Toggle the boolean value
                      }));
                    }}
                    style={{
                      cursor: "pointer",
                      marginRight: "15.5rem",
                      transform: "scale(1.5)", // Increase size
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={3} className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    placeholder="Enter Email"
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-20">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    type="text"
                    name="sex"
                    value={formData.sex || ""}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              {/* Mobile No */}
              <Col md={3} className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Label>Mobile No</Form.Label>
                  <Form.Control
                    id="phone"
                    type="number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter Mobile Number"
                  />
                </Form.Group>
              </Col>
              <Col md={3} className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Label>Alternate No</Form.Label>
                  <Form.Control
                    id="mobile_2"
                    type="number"
                    name="mobile_2"
                    value={formData.mobile_2}
                    onChange={handleInputChange}
                    placeholder="Alternate Number"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={3} className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address || ""}
                    onChange={handleInputChange}
                    placeholder="Enter Address"
                  />
                </Form.Group>
              </Col>
              <Col md={3} className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Label>Pincode No</Form.Label>
                  <Form.Control
                    id="pincode"
                    type="number"
                    name="pincode"
                    placeholder="Enter Pincode No"
                    value={formData.pincode || ""}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3} className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Label>Identity</Form.Label>
                  <Form.Control
                    id="identity"
                    as="select"
                    name="identity"
                    value={
                      formData.identity ? formData.identity.split(",")[0] : ""
                    }
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>
                      Select Identity
                    </option>
                    <option value="Aadhaar No">Aadhaar No</option>
                    <option value="Passport No">Passport No</option>
                    <option value="Voter No">Voter No</option>
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Identity Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="identityNumber"
                    value={
                      formData.identity
                        ? formData.identity.split(",")[1] || ""
                        : ""
                    }
                    onChange={handleInputChange}
                    placeholder="Enter Identity Number"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Blood Group</Form.Label>
                  <Form.Select
                    id="blood_group"
                    type="text"
                    name="blood_group"
                    value={formData.blood_group || ""}
                    onChange={handleInputChange}
                  >
                    <option value="">Blood Group</option>
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
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Birth Date</Form.Label>
                  <DatePicker
                    id="birth_date"
                    selected={
                      formData?.birth_date
                        ? parseDate(formData.birth_date) // Use parseDate to handle DD-MM-YYYY format
                        : null
                    }
                    onChange={(date) => {
                      if (!date) return; // Prevent null values from breaking

                      handleInputChange({
                        target: {
                          name: "birth_date",
                          value: date, // Pass Date object to handler
                        },
                      });
                    }}
                    className="form-control"
                    dateFormat="yyyy-MM-dd" // Use API standard format YYYY-MM-DD for date picker value
                    placeholderText="Select Date"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    maxDate={new Date()}
                    popperClassName="custom-datepicker-popper"
                  />
                </Form.Group>
              </Col>

              <Col md={3} className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Label>Age</Form.Label>
                  <Form.Control
                    id="age"
                    type="text"
                    name="age"
                    value={formData.age || ""}
                    readOnly
                    style={{
                      backgroundColor: "#e9ecef",
                      cursor: "not-allowed",
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={3} className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Label>Occupation</Form.Label>
                  <Form.Control
                    id="occupation"
                    type="text"
                    name="occupation"
                    value={formData.occupation || ""}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3} className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control
                    id="companyname"
                    type="text"
                    name="companyname"
                    value={formData.companyname || ""}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-4">
                  <Form.Label>Add Specific Work Pattern</Form.Label>
                  <div className="checkbox-grid">
                    <Row>
                      <Col md={2}>
                        <Form.Check
                          type="checkbox"
                          id="workPattern-sedentary"
                          label="Sedentary"
                          name="Sedentary"
                          checked={workPatterns.Sedentary}
                          onChange={handleWorkPatternChange}
                          style={{
                            cursor: "pointer",
                            marginRight: "15.5rem",
                            transform: "scale(1.2)", // Increase size
                          }}
                        />
                      </Col>
                      <Col md={2}>
                        <Form.Check
                          type="checkbox"
                          id="workPattern-travelling"
                          label="Travelling"
                          name="Travelling"
                          checked={workPatterns.Travelling}
                          onChange={handleWorkPatternChange}
                          style={{
                            cursor: "pointer",
                            transform: "scale(1.2)", // Increase size
                          }}
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Check
                          type="checkbox"
                          id="workPattern-strenuous"
                          label="Strenuous (Physical Activity)"
                          name="Strenuous (Physical Activity)"
                          checked={
                            workPatterns["Strenuous (Physical Activity)"]
                          }
                          onChange={handleWorkPatternChange}
                          style={{
                            cursor: "pointer",
                            transform: "scale(1.2)", // Increase size
                          }}
                        />
                      </Col>
                      <Col md={2}>
                        <Form.Check
                          type="checkbox"
                          id="workPattern-mental"
                          label="Mentally Stressful"
                          name="Mentally Stressful"
                          checked={workPatterns["Mentally Stressful"]}
                          onChange={handleWorkPatternChange}
                          style={{
                            cursor: "pointer",
                            transform: "scale(1.2)", // Increase size
                          }}
                        />
                      </Col>
                    </Row>
                  </div>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={3}>
                <Form.Label>Reference</Form.Label>
                <div className="control-group">
                  <div className="controls">
                    <select
                      name="reference"
                      className="form-control"
                      id="change_reference"
                      value={formData.reference_type}
                      onChange={handleReferenceChange}
                    >
                      <option value="">Choose Reference</option>
                      <option value="newspaper">Newspaper</option>
                      <option value="dr_ref">Doctor Reference</option>
                      <option value="internet">Internet</option>
                      <option value="MediaRef">Entertainment Media</option>
                      <option value="TVShow">TV Show</option>
                      <option value="old_ref">Patient Reference</option>
                      <option value="family_friends">Family/Friends</option>
                      <option value="hhc_board">HHC Board</option>
                      <option value="HHF">HHF</option>
                      <option value="other">Other</option>
                      <option value="WOM">WOM</option>
                    </select>
                  </div>
                  {renderReferenceDetails()}
                </div>
              </Col>
            </Row>
            {/* Add additional fields for editing */}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
          </Button>
          <Button variant="primary" onClick={() => handlePrint(selectedPatient)}>
            Registration Form
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setShowEditPatientModal(false);
              setSelectedPatient(null);
              // Reset all form fields to their initial empty state
              setFormData({
                prefix: "",
                date: new Date().toISOString().split("T")[0], // Keep today's date as default
                uid: "",
                patientName: "",
                sex: "",
                mobileNo: "",
                mobile_2: "",
                age: "",
                blood_group: "",
                email: "",
                // country: "",
                // state: "",
                // city: "",
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
              });

              // Clear any validation errors
              setErrors({});
            }}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Breadcrumb */}
      {/* <PageBreadcrumb pagename="All Patients" /> */}

      {/* Theme body */}
      <div
        className="theme-body"
        style={{
          padding: "20px",
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
                  border: "4px solid #00bcd4",
                }}
              >
                <Card.Body>
                  {loading ? ( // Show loader if data is being fetched
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
                      rows={10}
                      filters={filters1}
                      header={header}
                      globalFilterFields={[
                        "Uid_no",
                        "name",
                        "date",
                        "age",
                        "sex",
                        "phone",
                        "email",
                        "status",
                      ]}
                      currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
                      responsiveLayout="scroll"
                      className="p-datatable-customers"
                      rowClassName={(formData, { rowIndex }) => ({
                        style: {
                          backgroundColor:
                            rowIndex % 2 === 0 ? "#e0f7fa" : "white", // Alternating colors
                          transition: "background-color 0.3s ease",
                        },
                        onMouseOver: (e) => {
                          e.currentTarget.style.backgroundColor = "#b2ebf2"; // Hover effect
                        },
                        onMouseOut: (e) => {
                          e.currentTarget.style.backgroundColor =
                            rowIndex % 2 === 0 ? "#e0f7fa" : "white"; // Revert on mouse out
                        },
                      })}
                      style={{
                        border: "1px solid #4dd0e1",
                        marginTop: "20px",
                        width: "100%",
                        background: "white",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                    >
                      <Column
                        field="Uid_no"
                        header="UID"
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />
                      <Column
                        field="date"
                        header="Date"
                        sortable
                        body={(rowData) => {
                          const date = new Date(rowData.date);
                          // Format to DD-MM-YYYY
                          return date.toLocaleDateString("en-GB");
                        }}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />

                      <Column
                        field="name"
                        header="Name"
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />
                      <Column
                        field="age"
                        header="Age"
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />
                      <Column
                        field="sex"
                        header="Gender"
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />
                      <Column
                        field="phone"
                        header="Phone No"
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />
                      <Column
                        field="email"
                        header="Email"
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />
                      <Column
                        header="Status"
                        body={statusBodyTemplate}
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />
                      <Column
                        header="Actions"
                        body={actionBodyTemplate}
                        exportable={false}
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
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