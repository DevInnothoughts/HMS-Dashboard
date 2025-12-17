import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";
import NavBarA from "../../components/NavbarA";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/styles.css"; // Add this import at the top
import { decodeJwt } from "../../utils/decode-jwt";

// Country code options
const getCountryCode = (patient_phone) => {
  if (!patient_phone) return "Unknown"; // Handle empty case

  const country = countryCodes.find((code) =>
    patient_phone.startsWith(code.value)
  );
  return country ? country.value : "Unknown";
};

// Your existing country code array
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

// Add this constant at the top of the file with other constants
const countryNumberLimits = {
  "+1": { min: 10, max: 10 }, // USA
  "+91": { min: 10, max: 10 }, // India
  "+44": { min: 10, max: 10 }, // UK
  "+61": { min: 9, max: 9 }, // Australia
  "+81": { min: 10, max: 10 }, // Japan
  "+49": { min: 10, max: 11 }, // Germany
  "+33": { min: 9, max: 9 }, // France
  "+971": { min: 9, max: 9 }, // UAE
  "+86": { min: 11, max: 11 }, // China
  "+55": { min: 10, max: 11 }, // Brazil
  "+27": { min: 9, max: 9 }, // South Africa
  "+34": { min: 9, max: 9 }, // Spain
  default: { min: 7, max: 15 }, // Default limits
};

const BASE_URL = "http://localhost:5100/api";
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;  // FIXED format
};


export default function Add_Enquiry() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [formData, setFormData] = useState({
    date: formatDate(new Date()),
    // Maps to doctor_id in payload
    doctorId: "", 
    enquirytype: "",
    patient_type: "", 
    patient_name: "",
    patient_phone: "",
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }), 
    patient_location: "",
    reference: "",
    FDE_Name: "",
    note: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const phoneRegex = /^[0-9]{7,15}$/; // Define phoneRegex before using it
  

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


  const validate = () => {
    const newErrors = {};
    const requiredFields = [
      "date",
      "doctorId", 
      "enquirytype",
      "patient_name",
      "patient_phone",
      "patient_location",
      "reference",
      "FDE_Name",
      "note",
      "patient_type", 
      "time",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        // Customize display name for better UX
        let displayName = field.replace(/([A-Z])/g, " $1");
        if (field === 'doctorId') displayName = 'Doctor Name';
        if (field === 'FDE_Name') displayName = 'FDE Name';
        
        newErrors[field] = `${displayName} is required`;
      }
    });
    if (!formData.patient_phone || !phoneRegex.test(formData.patient_phone)) {
      newErrors.patient_phone = "Enter a valid phone number (7-15 digits)";
    }
    
    // Check for currentLocation
    if (!currentLocation) {
        newErrors.location = "Location data is not available. Please try logging in again.";
    }

    return newErrors;
  };

  const parseDate = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};


  // Handle input changes (used for all text/select inputs)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true); // Set loading to true when submitting

      // ** EDITED PAYLOAD START **
      // Ensure all fields from formData are mapped explicitly, using backend field names
      const payload = {
          // Fields mapping directly to schema column names (except doctorId -> doctor_id)
          doctor_id: formData.doctorId, 
          patient_type: formData.patient_type,
          enquirytype: formData.enquirytype,
          patient_name: formData.patient_name,
          patient_phone: formData.patient_phone,
          date: formData.date,
          time: formData.time,
          patient_location: formData.patient_location,
          reference: formData.reference,
          FDE_Name: formData.FDE_Name,
          note: formData.note,
          
          // Add operational data (current FDE clinic location)
          clinic_location: currentLocation, 
          // Include country code based on phone format helper
          countryCode: getCountryCode(formData.patient_phone),
      };
      // ** EDITED PAYLOAD END **

      try {
        console.log("Sending request to backend...", payload);

        // Keeping the location in the query string as a convention used in the original code, 
        // though it's also in the payload as clinic_location.
        const response = await fetch(`${BASE_URL}/V1/enquiry/addEnquiry?location=${currentLocation}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        console.log("Response received:", response);

        const data = await response.json();

        if (response.ok) {
          alert("Enquiry added successfully!");
          // Reset form data, keeping the date updated and time defaulted
          setFormData({
            date: formatDate(new Date()),
            doctorId: "",
            enquirytype: "",
            patient_type: "",
            patient_name: "",
            patient_phone: "",
            patient_location: "",
            reference: "",
            FDE_Name: "",
            note: "",
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }), 
          });
        } else {
          console.error(
            "Error adding enquiry:",
            data.message || "Unknown error"
          );
          alert(data.message || "Error adding enquiry. Please try again.");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        alert(
          "Error submitting form. Please check your network and try again."
        );
      } finally {
        setLoading(false); // Reset loading state
      }
    }
  };

  const fetchDropdownData = useCallback(async () => {
    // Only fetch if location is available
    if (!currentLocation) return;
    
    try {
      // Add location to the doctorDropdown call
      const doctorResponse = await fetch(
        `${BASE_URL}/V1/enquiry/doctorDropdown?location=${currentLocation}`,
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
        // Assuming doctorData.data contains objects with doctor_id and name
        setDoctors(Array.isArray(doctorData.data) ? doctorData.data : []);
      } else {
        console.error("Failed to fetch doctors:", doctorResponse.statusText);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error.message);
    }
  }, [currentLocation]); // currentLocation dependency

  useEffect(() => {
    if (currentLocation) {
        fetchDropdownData();
    }
  }, [currentLocation, fetchDropdownData]);
  
  // Helper to format time input in HH:MM:SS format (Optional: can be improved with a time picker component)
  const handleTimeChange = (e) => {
      const value = e.target.value;
      // Basic validation for HH:MM format
      const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (regex.test(value)) {
          // If a valid HH:MM is entered, auto-append :00
          setFormData(prev => ({ ...prev, time: value + ':00' }));
      } else {
          setFormData(prev => ({ ...prev, time: value }));
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
      <NavBarA pagename="Add Enquiry" />

      <div className="theme-body">
        <Container fluid>
          <Row>
            <Col>
              <Card
                style={{
                  padding:"20px",
                  borderRadius: "12px",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "4px solid #00bcd4",
                }}
              >
                <Card.Body>
                  <Form onSubmit={handleSubmit}>
                    <h4 className="section-title " style={{marginBottom:"20px"}}>
                      
                      Add New Enquiry Details
                      {/* Display Location status */}
                      <span className="ms-2 text-secondary" style={{fontSize: '0.8em'}}>
                        (Clinic Location: {currentLocation ? currentLocation.toUpperCase() : "Loading..."}
                        )
                      </span>
                    </h4>
                    {errors.location && (
                        <p style={{ color: "red", fontWeight: "bold" }}>{errors.location}</p>
                    )}
                    
                    {/* --- ROW 1: Date, Enquiry Type, Doctor Name, Patient Name --- */}
                    <Row>
                      {/* Date (Maps to schema: date) */}
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Date <span className="required">*</span></Form.Label>
                          <DatePicker
                            selected={parseDate(formData.date)}
                            onChange={(date) => {
                              if (date) {
                                setFormData((prev) => ({
                                  ...prev,
                                  date: formatDate(date), // stores YYYY-MM-DD
                                }));
                              }
                            }}
                            dateFormat="dd-MM-yyyy"
                            minDate={new Date()} // This prevents selecting past dates
                            placeholderText="Select Date"
                            className="form-control"
                            autoComplete="off"
                            showYearDropdown
                            scrollableYearDropdown
                            yearDropdownItemNumber={10}
                          />
                          {errors.date && (
                            <p style={{ color: "red" }}>{errors.date}</p>
                          )}
                        </Form.Group>
                      </Col>
                      
                      {/* Enquiry Type (Maps to schema: enquirytype) */}
                      <Col md={3}>
                        <Form.Group controlId="enquirytype">
                          <Form.Label>Enquiry Type <span className="required">*</span></Form.Label>
                          <Form.Control
                            as="select"
                            name="enquirytype"
                            value={formData.enquirytype}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select Enquiry Type</option>
                            {[
                              "Call for Refund Amount",
                              "Wrong Enquiry or Spam Call",
                              "Enquiry for Test Charges",
                              "Accounts Department",
                              "Call for Another Branches",
                              "Call for IPD Doctors",
                              "Call for Assistant Doctors",
                              "Call Regarding Job Vacancy",
                              "Appointment Consultation",
                              "Online Consultation",
                              "SX Cost Enquiry",
                              "Call for Lab Test Enquiry",
                              "Medicines Availability at Pharmacy",
                              "Patient is Coming Late for Appointment",
                              "Insurance Related Queries",
                            ].map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </Form.Control>
                          {errors.enquirytype && (
                            <p style={{ color: "red" }}>{errors.enquirytype}</p>
                          )}
                        </Form.Group>
                      </Col>
                      
                      {/* Doctor Name Dropdown (Maps state: doctorId to schema: doctor_id) */}
                      <Col md={3}>
                        <Form.Group className="mb-20">
                          <Form.Label>Doctor Name <span className="required">*</span></Form.Label>
                          <Form.Select
                            name="doctorId"
                            value={formData.doctorId}
                            onChange={handleInputChange}
                            disabled={!currentLocation || doctors.length === 0}
                            required
                          >
                            <option value="">Select a Doctor</option>
                            {doctors && doctors.length > 0 ? (
                              doctors.map((doctor) => (
                                <option
                                  key={doctor.doctor_id}
                                  value={doctor.doctor_id}
                                >
                                  {doctor.doctor_id} - {doctor.name}
                                </option>
                              ))
                            ) : (
                              <option disabled>
                                {currentLocation ? "No doctors available" : "Loading doctors..."}
                              </option>
                            )}
                          </Form.Select>
                          {errors.doctorId && (
                            <p style={{ color: "red" }}>{errors.doctorId}</p>
                          )}
                        </Form.Group>
                      </Col>
                      
                      {/* Patient Name (Maps to schema: patient_name) */}
                      <Col md={3}>
                        <Form.Group controlId="patient_name">
                          <Form.Label>Patient Name <span className="required">*</span></Form.Label>
                          <Form.Control
                            type="text"
                            name="patient_name"
                            placeholder="Enter Patient Name"
                            value={formData.patient_name}
                            onChange={handleInputChange}
                            required
                          />
                          {errors.patient_name && (
                            <p style={{ color: "red" }}>{errors.patient_name}</p>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    {/* --- ROW 2: Patient Type, Time, Mobile, Address --- */}
                    <Row>
                       {/* ** Patient Type (Maps to schema: patient_type) ** */}
                       <Col md={3} style={{marginBottom:"15px"}}>
                            <Form.Group controlId="patient_type">
                                <Form.Label>Patient Type <span className="required">*</span></Form.Label>
                                <Form.Control
                                    as="select"
                                    name="patient_type"
                                    value={formData.patient_type}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Type</option>
                                    <option value="NEW">NEW</option>
                                    <option value="EXISTING">EXISTING</option>
                                    <option value="REFERRAL">REFERRAL</option>
                                </Form.Control>
                                {errors.patient_type && (
                                    <p style={{ color: "red" }}>{errors.patient_type}</p>
                                )}
                            </Form.Group>
                        </Col>
                        
                        {/* ** Time (Maps to schema: time) ** */}
                        <Col md={3}>
                            <Form.Group controlId="time">
                                <Form.Label>Time (HH:MM) <span className="required">*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="time"
                                    // Use handleTimeChange to manage the specific format requirement 
                                    value={formData.time.substring(0, 5)} 
                                    onChange={handleTimeChange}
                                    placeholder="e.g., 14:30"
                                    maxLength={5} 
                                    required
                                />
                                {errors.time && (
                                    <p style={{ color: "red" }}>{errors.time}</p>
                                )}
                            </Form.Group>
                        </Col>
                        
                        {/* Mobile Number (Maps to schema: patient_phone) */}
                        <Col md={3}>
                            <Form.Group controlId="patient_phone">
                            <Form.Label>Mobile Number <span className="required">*</span></Form.Label>
                            <Form.Control
                                type="tel"
                                name="patient_phone"
                                value={formData.patient_phone}
                                onChange={(e) => {
                                const patient_phone = e.target.value.replace(
                                    /\D/g,
                                    ""
                                ); // Remove non-digits
                                const selectedCountryCode =
                                    formData.countryCode || "+91"; // Default to India if none selected
                                const limits =
                                    countryNumberLimits[selectedCountryCode] ||
                                    countryNumberLimits.default;

                                // Only update if the number is within limits or being deleted
                                if (patient_phone.length <= limits.max) {
                                    setFormData((prev) => ({
                                    ...prev,
                                    patient_phone: patient_phone,
                                    }));
                                }
                                }}
                                placeholder={`Enter ${
                                countryNumberLimits["+91"].max
                                } digit number`}
                                maxLength={15}
                                required
                            />
                            {errors.patient_phone && (
                                <p style={{ color: "red" }}>
                                {errors.patient_phone}
                                </p>
                            )}
                            </Form.Group>
                        </Col>
                        
                        {/* Address (Maps to schema: patient_location) */}
                        <Col md={3}>
                            <Form.Group controlId="patient_location">
                            <Form.Label>Address <span className="required">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="patient_location"
                                placeholder="Enter Address"
                                value={formData.patient_location}
                                onChange={handleInputChange}
                                required
                            />
                            {errors.patient_location && (
                                <p style={{ color: "red" }}>{errors.patient_location}</p>
                            )}
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    {/* --- ROW 3: Reference, FDE Name, Note --- */}
                    <Row>
                      <Col md={3}>
                        {/* Reference (Maps to schema: reference) */}
                        <Form.Group controlId="reference">
                          <Form.Label>Reference <span className="required">*</span></Form.Label>
                          <Form.Control
                            as="select"
                            name="reference"
                            placeholder="Enter Reference"
                            value={formData.reference}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select Reference</option>
                            {[
                              "Newspaper",
                              "Doctor Reference",
                              "Internet",
                              "Entertainment Media",
                              "TV Show",
                              "Patient Reference",
                              "Other",
                              "HHC Board",
                              "HHF",
                              "Word of Mouth",
                            ].map((ref) => (
                              <option key={ref} value={ref}>
                                {ref}
                              </option>
                            ))}
                          </Form.Control>
                          {errors.reference && (
                            <p style={{ color: "red" }}>{errors.reference}</p>
                          )}
                        </Form.Group>
                      </Col>
                      
                      {/* FDE Name (Maps to schema: FDE_Name) */}
                      <Col md={3}>
                        <Form.Group controlId="FDE_Name">
                          <Form.Label>FDE Name <span className="required">*</span></Form.Label>
                          <Form.Control
                            as="select"
                            name="FDE_Name"
                            value={formData.FDE_Name}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select FDE Name</option>
                            {[
                              "Akshay",
                              "Ashutosh",
                              "Dattatray",
                              "Noshin",
                              "Princy",
                              "Samira",
                              "Vishaka",
                              "Zeba",
                              "Walk-In",
                              "Heena",
                              "Purvi Shinde",
                              "Mahima",
                              "Pratiksha",
                              "Jishnu",
                              "Shweta Chavan",
                              "Hurmaan",
                              "Priya Dhiwar",
                              "Diksha Jha",
                              "Shraddha",
                              "Sagar Satish Deshpande",
                              "Supriya Thorat",
                              "Diksha",
                              "Josephine",
                              "Chhaya Keer",
                              "Aasiya",
                              "Bhavana",
                              "Joel",
                              "Rohini",
                              "Aditi",
                              "Samruddhi",
                              "Sofiya",
                              "Sakshi",
                              "Hritik",
                              "Priyanshu",
                              "Saurav",
                              "Gracy",
                              "Neelam",
                              "Shreya",
                              "Vaishnavi",
                              "Shruti",
                              "Samruddhi K",
                            ].map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </Form.Control>
                          {errors.FDE_Name && (
                            <p style={{ color: "red" }}>{errors.FDE_Name}</p>
                          )}
                        </Form.Group>
                      </Col>
                      
                      {/* Note (Maps to schema: note) */}
                      <Col md={6}>
                        <Form.Group controlId="note">
                          <Form.Label>Note <span className="required">*</span></Form.Label>
                          <Form.Control
                            as="textarea"
                            name="note"
                            rows={3}
                            placeholder="Enter Note"
                            value={formData.note}
                            onChange={handleInputChange}
                            required
                          />
                          {errors.note && (
                            <p style={{ color: "red" }}>{errors.note}</p>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                    <br />
                    
                    {/* Submit Button */}
                    <Form.Group className="text-end mb-0">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={loading || !currentLocation} 
                      >
                        {loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            />
                            {" Adding Enquiry..."}
                          </>
                        ) : (
                          "Add Enquiry"
                        )}
                      </Button>
                    </Form.Group>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};