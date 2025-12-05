/* eslint-disable no-irregular-whitespace */
import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Form, Container, Card } from "react-bootstrap";
import { useLocation, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import NavBarA from "../../components/NavbarA";
import "../../styles/styles.css"; // Add this import at the top
import { decodeJwt } from "../../utils/decode-jwt";

const getCountryCode = (patient_phone) => {
  if (!patient_phone) return "Unknown";

  const country = countryCodes.find((code) =>
    patient_phone.startsWith(code.value)
  );
  return country ? country.value : "Unknown";
};

const countryCodes = [
  { value: "+1", label: "🇺🇸 USA (+1)" },
  { value: "+91", label: "🇮🇳 India (+91)" },
  { value: "+44", label: "🇬🇧 UK (+44)" },
  { value: "+61", label: "🇦🇺 Australia (+61)" },
  { value: "+81", label: "🇯🇵 Japan (+81)" },
  { value: "+49", label: "🇩🇪 Germany (+49)" },
  { value: "+33", label: "🇫🇷 France (+33)" },
  { value: "+971", label: "🇦🇪 UAE (+971)" },
  { value: "+86", label: "🇨🇳 China (+86)" },
  { value: "+55", label: "🇧🇷 Brazil (+55)" },
  { value: "+27", label: "🇿🇦 South Africa (+27)" },
  { value: "+34", label: "🇪🇸 Spain (+34)" },
];

const countryNumberLimits = {
  "+1": { min: 10, max: 10 },
  "+91": { min: 10, max: 10 },
  "+44": { min: 10, max: 10 },
  "+61": { min: 9, max: 9 },
  "+81": { min: 10, max: 10 },
  "+49": { min: 10, max: 11 },
  "+33": { min: 9, max: 9 },
  "+971": { min: 9, max: 9 },
  "+86": { min: 11, max: 11 },
  "+55": { min: 10, max: 11 },
  "+27": { min: 9, max: 9 },
  "+34": { min: 9, max: 9 },
  default: { min: 7, max: 15 },
};

const BASE_URL = "http://localhost:5100/api";

export default function Add_appointment() {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [fdeList, setFdeList] = useState([]);
  // EDITED: Renamed state for clarity and schema alignment (treatment_name)
  const [treatmentList, setTreatmentList] = useState([]); 
  const [departmentList, setDepartmentList] = useState([]);
  const [isExistingPatient, setIsExistingPatient] = useState(false);
  const [type, setType] = useState("");
  const location = useLocation();
  const { phone } = useParams();
  
  // State for FDE's job location (Clinic Location)
  const [currentLocation, setCurrentLocation] = useState(null); 

  const [formData, setFormData] = useState({
    // Matches DB column treatment_name (Line 15 in schema list)
    treatment: "", 
    // Maps to appointment_timestamp (Line 6 in schema list)
    date: new Date().toISOString().split("T")[0], 
    patientName: "", // Patient Name is implied by patient_id/patient_phone
    patient_phone: "", // Matches DB column (Line 4)
    // Matches DB column patient_location (Line 16)
    patient_location: "", 
    // Matches DB column patient_type (Line 5)
    patient_type: "", 
    // Maps to appointment_time (Line 7)
    appointmentTime: "", 
    note: "", // Maps to note (Line 18)
    FDE_Name: "", // Matches DB column (Line 17)
    departmentName: "", // Non-schema field, kept for dropdown logic
    doctorName: "", // Non-schema field, kept for UI/dropdown value
    
    // Hidden fields for schema alignment (Defaults/Required)
    doctor_id: "", // Maps to doctor_id (Line 2)
    consultationchk: 0, // Matches consultationchk (Line 14) - Defaulted to 0 in schema
    // Additional fields needed for backend based on schema:
    confirm_time: 0, // Defaulted to 0 in schema
    status: "BOOKED", // Assuming default status for new booking
  });

  const [errors, setErrors] = useState({});

  const newPatientTypes = ["NEW"];
  const existingPatientTypes = ["FOLLOW", "POSTOPERATIVE", "OTHER"];

  // Effect to fetch currentLocation from JWT
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        const payload = decodeJwt(token);
        if (payload && payload.jobLocation) {
            setCurrentLocation(payload.jobLocation);
        }
    }
  }, []);

  // Use useCallback to memoize the fetch functions, as they are dependencies for other effects
  const fetchPatientDetails = useCallback(async (patient_phone) => {
    if (!patient_phone || !currentLocation) {
        setIsExistingPatient(false);
        setFormData((prev) => ({
            ...prev,
            patientName: "",
            patient_location: "", 
            appointmentTime: new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }),
            note: "",
            FDE_Name: "",
            departmentName: "",
            doctorName: "",
            patient_type: "NEW",
            doctor_id: "",
        }));
        return;
    }

    try {
      const url = `${BASE_URL}/V1/appointment/getPatientByMobile?patient_phone=${patient_phone}&location=${currentLocation}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        setIsExistingPatient(false);
        setFormData((prev) => ({
          ...prev,
          patientName: "",
          patient_location: "", 
          patient_type: "NEW",
          doctor_id: "",
        }));
        return;
      }

      const data = await response.json();

      if (data.statusCode === 200 && data.data) {
        setIsExistingPatient(true);
        alert(`${data.data.name} is already registered`);
        setFormData((prev) => ({
          ...prev,
          patientName: data.data.name || "",
          patient_location: data.data.address || "", 
          appointmentTime: data.data.appointmentTime || "",
          note: data.data.note || "",
          FDE_Name: data.data.FDE_Name || "",
          departmentName: data.data.departmentName || "",
          doctorName: data.data.doctorName || "",
          patient_type: "",
          doctor_id: data.data.doctor_id || "", // Ensure doctor_id is updated
        }));
      } else {
        setIsExistingPatient(false);
        setFormData((prev) => ({
          ...prev,
          patientName: "",
          patient_type: "NEW",
          doctor_id: "",
        }));
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
      setIsExistingPatient(false);
      setFormData((prev) => ({
        ...prev,
        patientName: "",
        patient_type: "NEW",
        doctor_id: "",
      }));
    }
  }, [currentLocation]); 

  const fetchDropdownData = useCallback(async () => {
    if (!currentLocation) return; 

    try {
      const treatmentResposne = await fetch(
        `${BASE_URL}/V1/appointment/treatmentDropdown?location=${currentLocation}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );

      if (treatmentResposne.ok) {
        const treatmentData = await treatmentResposne.json();
        setTreatmentList(
          Array.isArray(treatmentData.data) ? treatmentData.data : []
        );
      } else {
        console.error("Failed to fetch treatments:", treatmentResposne.statusText);
      }

      const doctorResponse = await fetch(
        `${BASE_URL}/V1/appointment/doctorDropdown?location=${currentLocation}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );

      if (doctorResponse.ok) {
        const doctorData = await doctorResponse.json();
        // Store doctors list and their IDs for later mapping
        setDoctors(Array.isArray(doctorData.data) ? doctorData.data : []);
      } else {
        console.error("Failed to fetch doctors:", doctorResponse.statusText);
      }

      const fdeResponse = await fetch(
        `${BASE_URL}/V1/appointment/fdeDropdown?location=${currentLocation}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );

      if (fdeResponse.ok) {
        const fdeData = await fdeResponse.json();
        setFdeList(Array.isArray(fdeData.data) ? fdeData.data : []);
      } else {
        console.error("Failed to fetch FDE list:", fdeResponse.statusText);
      }

      const departmentResponse = await fetch(
        `${BASE_URL}/V1/appointment/departmentDropdown?location=${currentLocation}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );

      if (departmentResponse.ok) {
        const departmentData = await departmentResponse.json();
        setDepartmentList(
          Array.isArray(departmentData.data) ? departmentData.data : []
        );
      } else {
        console.error("Failed to fetch departments:", departmentResponse.statusText);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error.message);
    }
  }, [currentLocation]); 

  // Effect to fetch patient details when phone/location changes
  useEffect(() => {
    if (phone && currentLocation) {
      console.log("Fetching patient data for phone:", phone);
      fetchPatientDetails(phone);
    }
  }, [phone, currentLocation, fetchPatientDetails]);

  // Effect to set current time for appointment time on component load
  useEffect(() => {
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    setFormData((prev) => ({
      ...prev,
      appointmentTime: currentTime,
    }));
  }, []);

  // Fetch dropdown data when location is ready
  useEffect(() => {
    if (currentLocation) {
      fetchDropdownData();
    }
  }, [currentLocation, fetchDropdownData]);

  const handleInputChange = (e) => {
    const { name, value, tagName } = e.target;

    // Special logic for doctor selection to capture doctor_id
    if (name === "doctorName") {
        // Find the corresponding doctor object to get the ID
        const selectedDoctor = doctors.find(d => d.name === value);
        
        setFormData((prevState) => ({
            ...prevState,
            // doctorName stores the name/label for display
            doctorName: value, 
            // doctor_id stores the numeric ID needed for the DB (Line 2 in schema)
            doctor_id: selectedDoctor ? selectedDoctor.doctor_id : "",
        }));
        return;
    }

    if (name === "patientName") {
      const alphabetsOnly = value.replace(/[^A-Za-z\s]/g, "");
      setFormData((prevState) => ({
        ...prevState,
        [name]:
          tagName === "INPUT" ? alphabetsOnly.toUpperCase() : alphabetsOnly,
      }));
      return;
    }

    // Check for 'patient_location' (schema field)
    if (name === "patient_location") { 
      const validAddressChars = value.replace(/[^A-Za-z\s,.\-/#]/g, "");
      setFormData((prevState) => ({
        ...prevState,
        [name]:
          tagName === "INPUT"
            ? validAddressChars.toUpperCase()
            : validAddressChars,
      }));
      return;
    }

    setFormData((prevState) => ({
      ...prevState,
      [name]: tagName === "INPUT" ? value.toUpperCase() : value,
    }));
  };

  const phoneRegex = /^[0-9]{7,15}$/;

  const validate = () => {
    const newErrors = {};
    const requiredFields = [
      "date", // Maps to appointment_timestamp (NO NULL)
      "patientName", // Patient Name is needed for registration flow
      "patient_type", // Matches DB column (NO NULL)
      "patient_phone", // Matches DB column (NO NULL)
      "appointmentTime", // Maps to appointment_time (YES NULL, but required for UX)
      "note", // Maps to note (YES NULL, but required in original code)
      "FDE_Name", // Matches DB column (YES NULL)
      "departmentName", // UI field
      "doctor_id", // Mapped from doctorName selection (NO NULL)
    ];
    // Conditionally require patient_location
    if (shouldShowAddressAndReference()) {
      requiredFields.push("patient_location"); // Matches DB column (YES NULL)
    }
    // Conditionally require treatment for 'OTHER' type
    if (formData.patient_type === "OTHER") {
      requiredFields.push("treatment"); // Maps to treatment_name (YES NULL)
    }

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        let displayName = field.replace(/([A-Z])/g, " $1");
        if (field === 'treatment') displayName = 'Treatment';
        if (field === 'patient_location') displayName = 'Address (Patient Location)';
        if (field === 'doctor_id') displayName = 'Appointment With (Doctor)';
        
        newErrors[field === 'doctor_id' ? 'doctorName' : field] = `${displayName} is required`;
      }
    });

    if (!formData.patient_phone || !phoneRegex.test(formData.patient_phone)) {
      newErrors.patient_phone = "Enter a valid phone number (7-15 digits)";
    }
    
    if (!currentLocation) {
        newErrors.location = "Location data is not available. Please try logging in again.";
    }

    return newErrors;
  };

  const handleSubmit = async (saveType) => {
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);

//       const formatDate = (date) => {
//         const d = new Date(date);
//         const day = String(d.getDate()).padStart(2, "0");
//         const month = String(d.getMonth() + 1).padStart(2, "0");
//         const year = d.getFullYear();
//         return `${day}-${month}-${year}`;
//       };

//       const formattedDate = formatDate(formData.date);

      // --- PAYLOAD MAPPING TO SCHEMA (Line numbers refer to schema list) ---
      const payload = {
        // Core Fields
        doctor_id: formData.doctor_id, // Matches DB column (Line 2)
        patient_type: formData.patient_type, // Matches DB column (Line 5)
        patient_phone: formData.patient_phone, // Matches DB column (Line 4)
        appointment_timestamp: formData.date, // Maps from date (Line 6)
        appointment_time: formData.appointmentTime, // Matches DB column (Line 7)
        patient_location: formData.patient_location, // Matches DB column (Line 16)
        FDE_Name: formData.FDE_Name, // Matches DB column (Line 17)
        treatment_name: formData.treatment, // Maps from treatment (Line 15)
        note: formData.note, // Maps to note (Line 18)
        
        // Fields with Default/Fixed values
        confirm_time: formData.confirm_time || 0, // Matches DB column (Line 8)
        status: formData.status || "BOOKED", // Matches DB column (Line 9)
        is_deleted: 0, // Matches DB column (Line 10)
        consultationchk: formData.consultationchk, // Matches DB column (Line 14)
        
        // Non-schema or auxiliary fields needed for backend logic
        patientName: formData.patientName, // Auxiliary field for patient creation/lookup
        clinic_location: currentLocation, // Auxiliary field for filtering/auditing
        saveType,
        countryCode: getCountryCode(formData.patient_phone),
      };
      // --- END PAYLOAD MAPPING ---
      console.log(payload);
      try {
        const response = await fetch(
          `${BASE_URL}/V1/appointment/addAppointment?location=${currentLocation}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (response.ok) {
          alert("Appointment added successfully");
          // Reset form
          setFormData({
            treatment: "",
            date: new Date().toISOString().split("T")[0],
            patientName: "",
            patient_phone: "",
            patient_location: "", 
            patient_type: "",
            appointmentTime: "",
            note: "",
            FDE_Name: "",
            departmentName: "",
            doctorName: "",
             doctor_id: "",
             consultationchk: 0, 
             confirm_time: 0,
             status: "BOOKED",
          });
        } else {
          const errorData = await response.json();
          alert(
            `Failed to add appointment. ${
              errorData.message || "Please try again."
            }`
          );
        }
      } catch (error) {
        console.error("Error adding appointment:", error.message);
        alert(
          "An error occurred while adding the appointment. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  // EDITED: Removed reference check from the logic
  const shouldShowAddressAndReference = () => {
    return !(
      isExistingPatient &&
      (formData.patient_type === "FOLLOW" ||
        formData.patient_type === "POSTOPERATIVE" ||
        formData.patient_type === "OTHER")
    );
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

  // Update the time slots when the date changes
  const handleDateChange = (date) => {
    handleInputChange({
      target: {
        name: "date",
        value: date ? date.toISOString().split("T")[0] : "",
      },
    });
    // Regenerate time slots when the date changes
    // This is handled automatically since generateTimeSlots uses formData.date
  };
  
  // Wrapper for fetchPatientDetails to handle incomplete phone number logic
  const handlePhoneNumberChange = (e) => {
    const patient_phone = e.target.value.replace(/\D/g, ""); // Remove non-digits
    // The original code has no logic for countryCode selection, assuming default or +91
    const selectedCountryCode = "+91"; 
    const limits =
        countryNumberLimits[selectedCountryCode] ||
        countryNumberLimits.default;

    if (patient_phone.length <= limits.max) {
        setFormData((prev) => ({
            ...prev,
            patient_phone: patient_phone,
        }));

        if (patient_phone.length === limits.max && currentLocation) {
            fetchPatientDetails(patient_phone);
        } else {
            // Clear relevant data if the number is incomplete
            setIsExistingPatient(false);
            setFormData((prev) => ({
                ...prev,
                patientName: "",
                patient_type: "NEW",
                doctor_id: "",
            }));
        }
    }
  }


return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "'Poppins', Arial, sans-serif",
      }}
    >
      <NavBarA pagename="Add Appointment" />
      <Container fluid>
        <Row>
          <Col>
            <Card
              style={{
                borderRadius: "15px",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                border: "4px solid #00bcd4",
                background: "white",
                overflow: "hidden",
              }}
            >
              <Card.Body style={{ padding: "30px" }}>
                <Form>
                  <div className="form-section">
                    <h5 className="section-title">
                      Appointment Details
                      {/* Display Location status */}
                      <span className="ms-3 text-secondary" style={{fontSize: '0.8em'}}>
                        (Clinic Location: {currentLocation ? currentLocation.toUpperCase() : "Loading..."}
                        )
                      </span>
                    </h5>
                    {errors.location && (
                        <p style={{ color: "red", fontWeight: "bold" }}>{errors.location}</p>
                    )}
                    {/* First Row: Phone, Type, Date, Time, Name */}
                    <br />
                    <Row>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label>
                            Mobile No <span className="required">*</span>
                          </Form.Label>
                          <Form.Control
                            type="tel"
                            name="patient_phone"
                            value={formData.patient_phone}
                            onChange={handlePhoneNumberChange}
                            placeholder={`Enter ${
                              // Assuming default code if none selected for display
                              countryNumberLimits["+91"].max
                            } digit number`}
                            maxLength={
                              // Assuming default code if none selected for limits
                              countryNumberLimits["+91"].max
                            }
                          />
                           {errors.patient_phone && (
                            <p style={{ color: "red" }}>{errors.patient_phone}</p>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={2} className="mb-4">
                        <Form.Group className="mb-3">
                          <Form.Label>Type <span className="required">*</span></Form.Label>
                          <Form.Control
                            as="select"
                            name="patient_type" // Matches schema (patient_type - Line 5)
                            value={formData.patient_type}
                            onChange={(e) => {
                              setType(e.target.value);
                              setFormData((prev) => ({
                                ...prev,
                                patient_type: e.target.value,
                              }));
                            }}
                          >
                            <option value="">Select Type</option>
                            {(isExistingPatient
                              ? existingPatientTypes
                              : newPatientTypes
                            ).map((type, index) => (
                              <option key={index} value={type}>
                                {type}
                              </option>
                            ))}
                          </Form.Control>
                          {errors.patient_type && (
                            <p style={{ color: "red" }}>{errors.patient_type}</p>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label>
                            Date <span className="required">*</span>
                          </Form.Label>
                          <DatePicker
                            selected={
                              formData.date ? new Date(formData.date) : null
                            }
                            onChange={handleDateChange}
                            className="form-control"
                            dateFormat="dd-MM-yyyy"
                            placeholderText="Select Date"
                          />
                           {errors.date && (
                            <p style={{ color: "red" }}>{errors.date}</p>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label>
                            Appointment Time <span className="required">*</span>
                          </Form.Label>
                          <Form.Select
                            name="appointmentTime" // Maps to appointment_time (Line 7)
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
                           {errors.appointmentTime && (
                            <p style={{ color: "red" }}>{errors.appointmentTime}</p>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>
                            Patient Name <span className="required">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="patientName"
                            value={formData.patientName}
                            onChange={handleInputChange}
                            placeholder="Enter Patient Name"
                          />
                           {errors.patientName && (
                            <p style={{ color: "red" }}>{errors.patientName}</p>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    {/* Second Row: FDE Name, Department, Doctor */}
                    <Row className="mb-4">
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>
                            FDE Name <span className="required">*</span>
                          </Form.Label>
                          <Form.Select
                            name="FDE_Name" // Matches schema (FDE_Name - Line 17)
                            value={formData.FDE_Name}
                            onChange={handleInputChange}
                            disabled={!currentLocation}
                          >
                            <option value="">Select FDE Name</option>
                            {fdeList?.map((fde) => (
                              <option key={fde.FDEName} value={fde.FDEName}>
                                {fde.FDEID} - {fde.FDEName}
                              </option>
                            ))}
                          </Form.Select>
                           {errors.FDE_Name && (
                            <p style={{ color: "red" }}>{errors.FDE_Name}</p>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>
                            Department Name <span className="required">*</span>
                          </Form.Label>
                          <Form.Select
                            name="departmentName"
                            value={formData.departmentName}
                            onChange={handleInputChange}
                            disabled={!currentLocation}
                          >
                            <option value="">Select Department</option>
                            {departmentList?.map((department) => (
                              <option
                                key={department.name}
                                value={department.name}
                              >
                                {department.department_id} - {department.name}
                              </option>
                            ))}
                          </Form.Select>
                           {errors.departmentName && (
                            <p style={{ color: "red" }}>{errors.departmentName}</p>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>
                            Appointment With <span className="required">*</span>
                          </Form.Label>
                          <Form.Select
                            name="doctorName" // Used for UI value
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={!currentLocation}
                          >
                            <option value="">Select Doctor</option>
                            {doctors?.map((doctor) => (
                              <option
                                key={doctor.doctor_id}
                                value={doctor.name}
                              >
                                {doctor.doctor_id} - {doctor.name}
                              </option>
                            ))}
                          </Form.Select>
                           {errors.name && (
                            <p style={{ color: "red" }}>{errors.name}</p>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    {/* Third Row: Treatment, Address (Patient Location) */}
                    <Row className="mb-4">
                      {/* Treatment Field (Visible only when 'OTHER' is selected OR a treatment is already set) */}
                      {(formData.patient_type === "OTHER" || formData.treatment) && (
                        <Col md={4}>
                          <Form.Group className="mb-20">
                            <Form.Label>Treatment</Form.Label>
                            <Form.Select
                              // Corrected name to match state key 'treatment'
                              name="treatment" // Maps to treatment_name (Line 15)
                              value={formData.treatment}
                              onChange={handleInputChange}
                              disabled={!currentLocation}
                            >
                              <option value="">Select a Treatment</option>
                              {treatmentList && treatmentList.length > 0 ? (
                                treatmentList.map((treatment) => (
                                  <option
                                    key={treatment.treatment_name}
                                    value={treatment.treatment_name}
                                  >
                                    {treatment.treatment_name}
                                  </option>
                                ))
                              ) : (
                                <option disabled>No treatment available</option>
                              )}
                            </Form.Select>
                            {errors.treatment && (
                              <p style={{ color: "red" }}>{errors.treatment}</p>
                            )}
                          </Form.Group>
                        </Col>
                      )}
                      {/* Address (patient_location) - The patient's address/city */}
                      {shouldShowAddressAndReference() && (
                        <Col md={formData.patient_type === "OTHER" || formData.treatment ? 4 : 8} className="mb-4">
                          <Form.Group className="mb-3">
                            <Form.Label>Address (Patient Location) <span className="required">*</span></Form.Label>
                            <Form.Control
                              type="text"
                              name="patient_location" // Maps to patient_location (Line 16)
                              value={formData.patient_location}
                              onChange={handleInputChange}
                              placeholder="Enter Patient Address"
                              required
                            />
                            {errors.patient_location && (
                              <p style={{ color: "red" }}>{errors.patient_location}</p>
                            )}
                          </Form.Group>
                        </Col>
                      )}
                    </Row>
                    
                    {/* Fourth Row: Note */}
                    <Row>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>
                            Note <span className="required">*</span>
                          </Form.Label>
                          <Form.Control
                            as="textarea" // Changed from type="text" to textarea for better note entry
                            name="note" // Matches schema (note - Line 18)
                            value={formData.note}
                            onChange={handleInputChange}
                            placeholder="Add Notes"
                          />
                           {errors.note && (
                            <p style={{ color: "red" }}>{errors.note}</p>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    {/* Buttons */}
                    <Row>
                      <Col className="text-end">
                        <button
                          type="button"
                          className="btn btn-primary me-2"
                          onClick={() => handleSubmit("save")}
                          disabled={loading || !currentLocation} 
                        >
                          Book Appointment
                        </button>
                        <button type="button" className="btn btn-danger">
                          Cancel
                        </button>
                      </Col>
                    </Row>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <style>
        {`
          .enquiry-card {
            border-radius: 15px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            border: none;
            background: #f8f9fa;
            overflow: hidden;
            margin-bottom: 30px;
          }

          .card-body {
            padding: 30px;
          }

          .form-section {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 25px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }

          .form-label {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 8px;
            font-size: 0.95rem;
          }

          .form-control, .form-select {
            border-radius: 8px;
            border: 3px solid #dee2e6;
            padding: 12px 15px;
            transition: all 0.3s ease;
            background-color: #ffffff;
            color: #2c3e50;
            font-size: 0.95rem;
          }

          .form-control:focus, .form-select:focus {
            border-color: #00bcd4;
            box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.1);
            background-color: #f8F9FA;
          }

          textarea.form-control {
            min-height: 120px;
            resize: vertical;
          }

          .form-select {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 0.75rem center;
            background-size: 16px 12px;
          }

          .btn-primary {
            background:linear-gradient(45deg, #00bcd4, #00acc1);
            border: none;
            padding: 12px 25px;
            border-radius: 8px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 188, 212, 0.2);
          }

          .btn-primary:hover {
            background: linear-gradient(45deg, #00acc1, #0097a7);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 188, 212, 0.3);
          }

          .btn-primary:disabled {
            background: #bdc3c7;
            transform: none;
          }

          /* Error message styling */
          .error-message {
            color: #e74c3c;
            font-size: 0.85rem;
            margin-top: 5px;
          }

          /* Responsive adjustments */
          @media (max-width: 768px) {
            .card-body {
              padding: 20px;
            }

            .form-section {
              padding: 15px;
            }

            .btn-primary {
              width: 100%;
              margin-top: 15px;
            }
          }

          /* Row spacing */
          .row {
            margin-bottom: 20px;
          }

          /* Spinner styling */
          .spinner-border {
            margin-right: 8px;
            width: 1.2rem;
            height: 1.2rem;
          }

          /* Optional: Add animation for form elements */
          .form-control, .form-select, .btn {
            animation: fadeIn 0.5s ease-in-out;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Optional: Add hover effect for form controls */
          .form-control:hover, .form-select:hover {
            border-color: #3498db;
          }

            .date-picker-wrapper {
            margin-bottom: 0 !important;
          }

          .react-datepicker-wrapper {
            margin-bottom: 0 !important;
            display: block;
          }

          .react-datepicker__input-container {
            margin-bottom: 0 !important;
            display: block;
          }
        `}
      </style>
    </div>
  );
}