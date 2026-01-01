// import React, { useState, useEffect, useCallback } from "react";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Form,
//   Button,
//   Spinner,
// } from "react-bootstrap";
// import NavBarA from "../../components/NavbarA";
// import Swal from 'sweetalert2';
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import PageBreadcrumb from "../../components/PageBreadcrumb";
// import "../../styles/styles.css";
// import { decodeJwt } from "../../utils/decode-jwt";

// const getCountryCode = (patient_phone) => {
//   if (!patient_phone) return "Unknown";

//   const country = countryCodes.find((code) =>
//     patient_phone.startsWith(code.value)
//   );
//   return country ? country.value : "Unknown";
// };

// const Toast = Swal.mixin({
//   toast: true,
//   position: 'top-end',
//   showConfirmButton: false,
//   timer: 3000,
//   timerProgressBar: true,
//   didOpen: (toast) => {
//     toast.addEventListener('mouseenter', Swal.stopTimer)
//     toast.addEventListener('mouseleave', Swal.resumeTimer)
//   }
// });

// // Your existing country code array
// const countryCodes = [
//   { value: "+1", label: "🇺🇸 USA (+1)" },
//   { value: "+91", label: "🇮🇳 India (+91)" },
//   { value: "+44", label: "🇬🇧 UK (+44)" },
//   { value: "+61", label: "🇦🇺 Australia (+61)" },
//   { value: "+81", label: "🇯🇵 Japan (+81)" },
//   { value: "+49", label: "🇩🇪 Germany (+49)" },
//   { value: "+33", label: "🇫🇷 France (+33)" },
//   { value: "+971", label: "🇦🇪 UAE (+971)" },
//   { value: "+86", label: "🇨🇳 China (+86)" },
//   { value: "+55", label: "🇧🇷 Brazil (+55)" },
//   { value: "+27", label: "🇿🇦 South Africa (+27)" },
//   { value: "+34", label: "🇪🇸 Spain (+34)" },
// ];

// // Add this constant at the top of the file with other constants
// const countryNumberLimits = {
//   "+1": { min: 10, max: 10 }, // USA
//   "+91": { min: 10, max: 10 }, // India
//   "+44": { min: 10, max: 10 }, // UK
//   "+61": { min: 9, max: 9 }, // Australia
//   "+81": { min: 10, max: 10 }, // Japan
//   "+49": { min: 10, max: 11 }, // Germany
//   "+33": { min: 9, max: 9 }, // France
//   "+971": { min: 9, max: 9 }, // UAE
//   "+86": { min: 11, max: 11 }, // China
//   "+55": { min: 10, max: 11 }, // Brazil
//   "+27": { min: 9, max: 9 }, // South Africa
//   "+34": { min: 9, max: 9 }, // Spain
//   default: { min: 7, max: 15 }, // Default limits
// };

// const BASE_URL = "http://194.195.117.79:5100/api";
// const formatDate = (date) => {
//   const d = new Date(date);
//   const day = String(d.getDate()).padStart(2, "0");
//   const month = String(d.getMonth() + 1).padStart(2, "0");
//   const year = d.getFullYear();
//   return `${year}-${month}-${day}`;  // FIXED format
// };

// export default function Add_Enquiry() {
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [formData, setFormData] = useState({
//     date: formatDate(new Date()),
//     // Maps to doctor_id in payload
//     doctorId: "",
//     enquirytype: "",
//     patient_type: "",
//     patient_name: "",
//     patient_phone: "",
//     time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
//     patient_location: "",
//     reference: "",
//     FDE_Name: "",
//     note: "",
//   });

//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [doctors, setDoctors] = useState([]);
//   const phoneRegex = /^[0-9]{7,15}$/; // Define phoneRegex before using it

//   // Effect to fetch currentLocation from JWT
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//         const payload = decodeJwt(token);
//         if (payload && payload.jobLocation) {
//             setCurrentLocation(payload.jobLocation);
//         }
//     }
//   }, []);

//   const validate = () => {
//     const newErrors = {};
//     const requiredFields = [
//       "date",
//       "doctorId",
//       "enquirytype",
//       "patient_name",
//       "patient_phone",
//       "patient_location",
//       "reference",
//       "FDE_Name",
//       "note",
//       "patient_type",
//       "time",
//     ];

//     requiredFields.forEach((field) => {
//       if (!formData[field]) {
//         // Customize display name for better UX
//         let displayName = field.replace(/([A-Z])/g, " $1");
//         if (field === 'doctorId') displayName = 'Doctor Name';
//         if (field === 'FDE_Name') displayName = 'FDE Name';

//         newErrors[field] = `${displayName} is required`;
//       }
//     });
//     if (!formData.patient_phone || !phoneRegex.test(formData.patient_phone)) {
//       newErrors.patient_phone = "Enter a valid phone number (7-15 digits)";
//     }

//     // Check for currentLocation
//     if (!currentLocation) {
//         newErrors.location = "Location data is not available. Please try logging in again.";
//     }

//     return newErrors;
//   };

//   const parseDate = (dateString) => {
//   const [year, month, day] = dateString.split("-").map(Number);
//   return new Date(year, month - 1, day);
// };

//   // Handle input changes (used for all text/select inputs)
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevState) => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };

//   // Submit form
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const validationErrors = validate();
//     setErrors(validationErrors);

//     if (Object.keys(validationErrors).length === 0) {
//       setLoading(true); // Set loading to true when submitting

//       // ** EDITED PAYLOAD START **
//       // Ensure all fields from formData are mapped explicitly, using backend field names
//       const payload = {
//           // Fields mapping directly to schema column names (except doctorId -> doctor_id)
//           doctor_id: formData.doctorId,
//           patient_type: formData.patient_type,
//           enquirytype: formData.enquirytype,
//           patient_name: formData.patient_name,
//           patient_phone: formData.patient_phone,
//           date: formData.date,
//           time: formData.time,
//           patient_location: formData.patient_location,
//           reference: formData.reference,
//           FDE_Name: formData.FDE_Name,
//           note: formData.note,

//           // Add operational data (current FDE clinic location)
//           clinic_location: currentLocation,
//           // Include country code based on phone format helper
//           countryCode: getCountryCode(formData.patient_phone),
//       };
//       // ** EDITED PAYLOAD END **

//       try {
//         console.log("Sending request to backend...", payload);

//         // Keeping the location in the query string as a convention used in the original code,
//         // though it's also in the payload as clinic_location.
//         const response = await fetch(`${BASE_URL}/V1/enquiry/addEnquiry?location=${currentLocation}`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(payload),
//         });

//         console.log("Response received:", response);

//         const data = await response.json();

//         if (response.ok) {
//           Swal.fire({
//             icon: 'success',
//             title: 'Success!',
//             text: 'Enquiry has been added successfully.',
//             confirmButtonColor: '#00bcd4'
//           });
//           setFormData({
//             date: formatDate(new Date()),
//             doctorId: "",
//             enquirytype: "",
//             patient_type: "",
//             patient_name: "",
//             patient_phone: "",
//             patient_location: "",
//             reference: "",
//             FDE_Name: "",
//             note: "",
//             time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
//           });
//         } else {
//           const errorData = await response.json();
//           Swal.fire({
//             icon: 'error',
//             title: 'Failed',
//             text: errorData.message || 'Failed to add enquiry'
//           });
//         }
//       } catch (error) {
//         Swal.fire({
//           icon: 'error',
//           title: 'Error',
//           text: 'A network error occurred.'
//         });
//       } finally {
//         setLoading(false);
//       }
//     } else {
//       // Validation Warning
//       Toast.fire({
//         icon: 'warning',
//         title: 'Please fill all required fields'
//       });
//     }
//   };

//   const fetchDropdownData = useCallback(async () => {
//     // Only fetch if location is available
//     if (!currentLocation) return;

//     try {
//       // Add location to the doctorDropdown call
//       const doctorResponse = await fetch(
//         `${BASE_URL}/V1/enquiry/doctorDropdown?location=${currentLocation}`,
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (doctorResponse.ok) {
//         const doctorData = await doctorResponse.json();
//         console.log("Doctors API Response:", doctorData); // Debug API response
//         // Assuming doctorData.data contains objects with doctor_id and name
//         setDoctors(Array.isArray(doctorData.data) ? doctorData.data : []);
//       } else {
//         console.error("Failed to fetch doctors:", doctorResponse.statusText);
//       }
//     } catch (error) {
//       console.error("Error fetching dropdown data:", error.message);
//     }
//   }, [currentLocation]); // currentLocation dependency

//   useEffect(() => {
//     if (currentLocation) {
//         fetchDropdownData();
//     }
//   }, [currentLocation, fetchDropdownData]);

//   // Helper to format time input in HH:MM:SS format (Optional: can be improved with a time picker component)
//   const handleTimeChange = (e) => {
//       const value = e.target.value;
//       // Basic validation for HH:MM format
//       const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
//       if (regex.test(value)) {
//           // If a valid HH:MM is entered, auto-append :00
//           setFormData(prev => ({ ...prev, time: value + ':00' }));
//       } else {
//           setFormData(prev => ({ ...prev, time: value }));
//       }
//   }

//   return (
//     <div
//       className="themebody-wrap"
//       style={{
//         background: "linear-gradient(to right, #e0f7fa, #80deea)",
//         minHeight: "100vh",
//         padding: "10px",
//         fontFamily: "'Poppins', Arial, sans-serif",
//       }}
//     >
//       <PageBreadcrumb pagename="Add New Enquiry Page" />
//       <NavBarA pagename="Add Enquiry" />

//       <div className="theme-body">
//         <Container fluid>
//           <Row>
//             <Col>
//               <Card
//                 style={{
//                   padding: "20px",
//                   borderRadius: "12px",
//                   boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
//                   borderColor: "#00bcd4",
//                   background: "white",
//                   border: "1.5px solid #00bcd4",
//                 }}
//               >
//                 <Card.Body>
//                   <Form onSubmit={handleSubmit}>
//                   <h4 className="section-title" style={{ marginBottom: "20px" }}>
//                     Add New Enquiry Detail
//                   </h4>
//                   {errors.location && (
//                     <p style={{ color: "red", fontWeight: "bold" }}>{errors.location}</p>
//                   )}

//                   {/* First Row: Date, Time, Enquiry Type */}
//                   <Row className="g-4 mb-10">
//                     <Col md={4}>
//                       <Form.Group className="mb-3">
//                         <Form.Label> Date <span style={{ color: "red" }} className="required">*</span></Form.Label>
//                         <DatePicker
//                           selected={parseDate(formData.date)}
//                           onChange={(date) => {
//                             if (date) {
//                               setFormData((prev) => ({
//                                 ...prev,
//                                 date: formatDate(date),
//                               }));
//                             }
//                           }}
//                           dateFormat="dd-MM-yyyy"
//                           minDate={new Date()}
//                           placeholderText="Select Date"
//                           className="form-control"
//                           autoComplete="off"
//                           showYearDropdown
//                           scrollableYearDropdown
//                           yearDropdownItemNumber={10}
//                         />
//                         {errors.date && <p style={{ color: "red" }}>{errors.date}</p>}
//                       </Form.Group>
//                     </Col>

//                     {/* <Col md={4}>
//                       <Form.Group controlId="time">
//                         <Form.Label>Enquiry Time <span style={{ color: "red" }} className="required">*</span></Form.Label>
//                         <Form.Control
//                           type="time"
//                           name="time"
//                           value={formData.time.substring(0, 5)}
//                           onChange={handleTimeChange}
//                           placeholder="e.g., 14:30"
//                           maxLength={5}
//                           required
//                         />
//                         {errors.time && <p style={{ color: "red" }}>{errors.time}</p>}
//                       </Form.Group>
//                     </Col> */}

//                     <Col md={4}>
//                       <Form.Group controlId="enquirytype">
//                         <Form.Label>Enquiry Type <span style={{ color: "red" }} className="required">*</span></Form.Label>
//                         <Form.Control
//                           as="select"
//                           name="enquirytype"
//                           value={formData.enquirytype}
//                           onChange={handleInputChange}
//                           required
//                         >
//                           <option value="">Select Enquiry Type</option>
//                           {[
//                             "Call for Refund Amount",
//                             "Wrong Enquiry or Spam Call",
//                             "Enquiry for Test Charges",
//                             "Accounts Department",
//                             "Call for Another Branches",
//                             "Call for IPD Doctors",
//                             "Call for Assistant Doctors",
//                             "Call Regarding Job Vacancy",
//                             "Appointment Consultation",
//                             "Online Consultation",
//                             "SX Cost Enquiry",
//                             "Call for Lab Test Enquiry",
//                             "Medicines Availability at Pharmacy",
//                             "Patient is Coming Late for Appointment",
//                             "Insurance Related Queries",
//                           ].map((type) => (
//                             <option key={type} value={type}>{type}</option>
//                           ))}
//                         </Form.Control>
//                         {errors.enquirytype && <p style={{ color: "red" }}>{errors.enquirytype}</p>}
//                       </Form.Group>
//                     </Col>

//                     <Col md={4}>
//                       <Form.Group>
//                         <Form.Label>Doctor Name <span style={{ color: "red" }} className="required">*</span></Form.Label>
//                         <Form.Select
//                           name="doctorId"
//                           value={formData.doctorId}
//                           onChange={handleInputChange}
//                           disabled={!currentLocation || doctors.length === 0}
//                           required
//                         >
//                           <option value="">Select a Doctor</option>
//                           {doctors && doctors.length > 0 ? (
//                             doctors.map((doctor) => (
//                               <option key={doctor.doctor_id} value={doctor.doctor_id}>
//                                 {doctor.doctor_id} - {doctor.name}
//                               </option>
//                             ))
//                           ) : (
//                             <option disabled>
//                               {currentLocation ? "No doctors available" : "Loading doctors..."}
//                             </option>
//                           )}
//                         </Form.Select>
//                         {errors.doctorId && <p style={{ color: "red" }}>{errors.doctorId}</p>}
//                       </Form.Group>
//                     </Col>
//                   </Row>

//                   <Row className="g-4 mb-10">
//                     {/* <Col md={4}>
//                       <Form.Group controlId="patient_type">
//                         <Form.Label>Patient Type <span style={{ color: "red" }} className="required">*</span></Form.Label>
//                         <Form.Control
//                           as="select"
//                           name="patient_type"
//                           value={formData.patient_type}
//                           onChange={handleInputChange}
//                           required
//                         >
//                           <option value="">Select Type</option>
//                           <option value="NEW">NEW</option>
//                           <option value="EXISTING">EXISTING</option>
//                           <option value="REFERRAL">REFERRAL</option>
//                         </Form.Control>
//                         {errors.patient_type && <p style={{ color: "red" }}>{errors.patient_type}</p>}
//                       </Form.Group>
//                     </Col> */}

//                     <Col md={4}>
//                       <Form.Group controlId="patient_name">
//                         <Form.Label>Patient Name <span style={{ color: "red" }} className="required">*</span></Form.Label>
//                         <Form.Control
//                           type="text"
//                           name="patient_name"
//                           placeholder="Enter Patient Name"
//                           value={formData.patient_name}
//                           onChange={handleInputChange}
//                           required
//                         />
//                         {errors.patient_name && <p style={{ color: "red" }}>{errors.patient_name}</p>}
//                       </Form.Group>
//                     </Col>

//                     <Col md={4}>
//                       <Form.Group controlId="patient_phone">
//                         <Form.Label>Patient Mobile Number <span style={{ color: "red" }} className="required">*</span></Form.Label>
//                         <Form.Control
//                           type="tel"
//                           name="patient_phone"
//                           value={formData.patient_phone}
//                           onChange={(e) => {
//                             const patient_phone = e.target.value.replace(/\D/g, "");
//                             const selectedCountryCode = formData.countryCode || "+91";
//                             // Note: countryNumberLimits constant is defined at the top of your file
//                             if (patient_phone.length <= 10) {
//                               setFormData((prev) => ({ ...prev, patient_phone }));
//                             }
//                           }}
//                           placeholder="Enter 10 digit number"
//                           maxLength={15}
//                           required
//                         />
//                         {errors.patient_phone && <p style={{ color: "red" }}>{errors.patient_phone}</p>}
//                       </Form.Group>
//                     </Col>

//                     <Col md={4}>
//                       <Form.Group controlId="patient_location">
//                         <Form.Label>Patient Address <span style={{ color: "red" }} className="required">*</span></Form.Label>
//                         <Form.Control
//                           type="text"
//                           name="patient_location"
//                           placeholder="Enter Address"
//                           value={formData.patient_location}
//                           onChange={handleInputChange}
//                           required
//                         />
//                         {errors.patient_location && <p style={{ color: "red" }}>{errors.patient_location}</p>}
//                       </Form.Group>
//                     </Col>

//                   </Row>

//                   {/* Third Row: Patient Address, Doctor Name, FDE Name */}
//                   <Row className="g-4 mb-10">
//                     <Col md={4}>
//                       <Form.Group controlId="FDE_Name">
//                         <Form.Label>FDE Name <span style={{ color: "red" }} className="required">*</span></Form.Label>
//                         <Form.Control
//                           as="select"
//                           name="FDE_Name"
//                           value={formData.FDE_Name}
//                           onChange={handleInputChange}
//                           required
//                         >
//                           <option value="">Select FDE Name</option>
//                           {[
//                             "Akshay", "Ashutosh", "Dattatray", "Noshin", "Princy", "Samira", "Vishaka",
//                             "Zeba", "Walk-In", "Heena", "Purvi Shinde", "Mahima", "Pratiksha", "Jishnu",
//                             "Shweta Chavan", "Hurmaan", "Priya Dhiwar", "Diksha Jha", "Shraddha",
//                             "Sagar Satish Deshpande", "Supriya Thorat", "Diksha", "Josephine",
//                             "Chhaya Keer", "Aasiya", "Bhavana", "Joel", "Rohini", "Aditi", "Samruddhi",
//                             "Sofiya", "Sakshi", "Hritik", "Priyanshu", "Saurav", "Gracy", "Neelam",
//                             "Shreya", "Vaishnavi", "Shruti", "Samruddhi K",
//                           ].map((name) => (
//                             <option key={name} value={name}>{name}</option>
//                           ))}
//                         </Form.Control>
//                         {errors.FDE_Name && <p style={{ color: "red" }}>{errors.FDE_Name}</p>}
//                       </Form.Group>
//                     </Col>

//                     <Col md={4}>
//                       <Form.Group controlId="reference">
//                         <Form.Label>Reference <span style={{ color: "red" }} className="required">*</span></Form.Label>
//                         <Form.Control
//                           as="select"
//                           name="reference"
//                           value={formData.reference}
//                           onChange={handleInputChange}
//                           required
//                         >
//                           <option value="">Select Reference</option>
//                           {[
//                             "Family / Friends", "Referred By Another Doctor", "Referred By Another Patient", "Internet", "Social Media", "Entertainment Media",
//                              "TV Show", "Newspaper / Magazine", "Awareness Lecture", "HHC Board on building", "I was treated here in past ", "Healing Hands Clinic Branch",
//                              "Aggregators", "Other"
//                           ].map((ref) => (
//                             <option key={ref} value={ref}>{ref}</option>
//                           ))}
//                         </Form.Control>
//                         {errors.reference && <p style={{ color: "red" }}>{errors.reference}</p>}
//                       </Form.Group>
//                     </Col>
//                   </Row>

//                   {/* Fourth Row: Reference and Note */}
//                   <Row className="g-4 mb-4">
//                     <Col md={8}>
//                       <Form.Group controlId="note">
//                         <Form.Label>Note <span style={{ color: "red" }} className="required">*</span></Form.Label>
//                         <Form.Control
//                           as="textarea"
//                           name="note"
//                           rows={3}
//                           placeholder="Enter Note"
//                           value={formData.note}
//                           onChange={handleInputChange}
//                           required
//                         />
//                         {errors.note && <p style={{ color: "red" }}>{errors.note}</p>}
//                       </Form.Group>
//                     </Col>
//                   </Row>

//                   <Form.Group className="text-end" style={{marginTop:"20px"}}>
//                     <Button
//                       variant="primary"
//                       type="submit"
//                       disabled={loading || !currentLocation}
//                       style={{ backgroundColor: "#00bcd4", borderColor: "#00bcd4", padding: "10px 30px" }}
//                     >
//                       {loading ? (
//                         <>
//                           <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
//                           {" Adding Enquiry..."}
//                         </>
//                       ) : (
//                         "ADD ENQUIRY"
//                       )}
//                     </Button>
//                   </Form.Group>
//                 </Form>
//                 </Card.Body>
//               </Card>
//             </Col>
//           </Row>
//         </Container>
//       </div>
//     </div>
//   );
// };

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
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import FeatherIcon from "feather-icons-react";
import "../../styles/styles.css";
import { decodeJwt } from "../../utils/decode-jwt";

const getCountryCode = (patient_phone) => {
  if (!patient_phone) return "Unknown";
  const country = countryCodes.find((code) =>
    patient_phone.startsWith(code.value)
  );
  return country ? country.value : "Unknown";
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

const BASE_URL = "http://194.195.117.79:5100/api";
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

export default function Add_Enquiry() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [formData, setFormData] = useState({
    date: formatDate(new Date()),
    doctorId: "",
    enquirytype: "",
    patient_type: "NEW",
    patient_name: "",
    patient_phone: "",
    time: new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
    patient_location: "",
    reference: "",
    FDE_Name: "",
    note: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [fdeList, setFdeList] = useState([]); // Added state for FDE list
  const phoneRegex = /^[0-9]{7,15}$/;

  useEffect(() => {
    const token = localStorage.getItem("token");
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
      "time",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        let displayName = field.replace(/([A-Z])/g, " $1");
        if (field === "doctorId") displayName = "Doctor Name";
        if (field === "FDE_Name") displayName = "FDE Name";
        newErrors[field] = `${displayName} is required`;
      }
    });

    if (!formData.patient_phone || !phoneRegex.test(formData.patient_phone)) {
      newErrors.patient_phone = "Enter a valid phone number (7-15 digits)";
    }

    if (!currentLocation) {
      newErrors.location = "Location data is not available.";
    }
    return newErrors;
  };

  const parseDate = (dateString) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFormData({
      date: formatDate(new Date()),
      doctorId: "",
      enquirytype: "",
      patient_type: "NEW",
      patient_name: "",
      patient_phone: "",
      patient_location: "",
      reference: "",
      FDE_Name: "",
      note: "",
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
    });

    setErrors({});

    // Toast notification
    Toast.fire({
      icon: "success",
      title: "Form reset successful",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      const payload = {
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
        clinic_location: currentLocation,
        countryCode: getCountryCode(formData.patient_phone),
      };

      try {
        const response = await fetch(
          `${BASE_URL}/V1/enquiry/addEnquiry?location=${currentLocation}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Enquiry has been added successfully.",
            confirmButtonColor: "#00bcd4",
          });
          handleReset();
        } else {
          const errorData = await response.json();
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: errorData.message || "Failed to add enquiry",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "A network error occurred.",
        });
      } finally {
        setLoading(false);
      }
    } else {
      Toast.fire({ icon: "warning", title: "Please fill all required fields" });
    }
  };

  // Updated fetchDropdownData to fetch FDE names dynamically from the API
  const fetchDropdownData = useCallback(async () => {
    if (!currentLocation) return;
    try {
      const fetchApi = async (endpoint) => {
        const url = `${BASE_URL}/V1/appointment/${endpoint}?location=${currentLocation}`;
        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        return response.ok ? response.json() : { data: [] };
      };

      const [doctorData, fdeData] = await Promise.all([
        fetchApi("doctorDropdown").then((res) => res.data),
        fetchApi("fdeDropdown").then((res) => res.data), // Fetching FDE dropdown
      ]);

      setDoctors(Array.isArray(doctorData) ? doctorData : []);
      setFdeList(Array.isArray(fdeData) ? fdeData : []); // Setting FDE list
    } catch (error) {
      console.error("Error fetching dropdown data:", error.message);
    }
  }, [currentLocation]);

  useEffect(() => {
    if (currentLocation) fetchDropdownData();
  }, [currentLocation, fetchDropdownData]);

  const inputStyle = {
    borderRadius: "8px",
    border: "2px solid rgb(77, 208, 225)",
    padding: "6px",
  };
  const labelStyle = "fw-bold text-muted small uppercase mb-2";

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        minHeight: "100vh",
        padding: "12px",
        fontFamily: "'Poppins', Arial, sans-serif",
      }}
    >
      <PageBreadcrumb pagename="Add Enquiry Form" />
      <NavBarA pagename="Add Enquiry" />

      <Container fluid>
        <Row>
          <Col>
            <Card
              style={{
                borderRadius: "15px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
                border: "none",
                background: "white",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  backgroundColor: "#67c5cfff",
                  padding: "20px 25px",
                  borderBottom: "2px solid #1a5b61ff",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FeatherIcon
                  icon="help-circle"
                  size="24"
                  style={{ color: "#1a5b61ff", marginRight: "12px" }}
                />
                <h4
                  className="m-0"
                  style={{
                    color: "#1a5b61ff",
                    fontWeight: "600",
                    fontSize: "1.25rem",
                  }}
                >
                  Add New Enquiry Detail
                </h4>
              </div>

              <Card.Body style={{ padding: "20px" }}>
                <Form onSubmit={handleSubmit}>
                  {errors.location && (
                    <div
                      className="alert alert-danger py-2 px-3 mb-4"
                      style={{ borderRadius: "8px" }}
                    >
                      <FeatherIcon
                        icon="alert-circle"
                        size="18"
                        className="me-2"
                      />
                      {errors.location}
                    </div>
                  )}

                  <Row className="g-4 mb-4">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className={labelStyle}>
                          Enquiry Date <span className="text-danger">*</span>
                        </Form.Label>
                        <DatePicker
                          selected={parseDate(formData.date)}
                          onChange={(date) =>
                            date &&
                            setFormData((prev) => ({
                              ...prev,
                              date: formatDate(date),
                            }))
                          }
                          dateFormat="dd-MM-yyyy"
                          minDate={new Date()}
                          className="form-control custom-datepicker"
                          style={inputStyle}
                        />
                        {errors.date && (
                          <p className="text-danger small mt-1">
                            {errors.date}
                          </p>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className={labelStyle}>
                          Enquiry Type <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="enquirytype"
                          style={inputStyle}
                          value={formData.enquirytype}
                          onChange={handleInputChange}
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
                        </Form.Select>
                        {errors.enquirytype && (
                          <p className="text-danger small mt-1">
                            {errors.enquirytype}
                          </p>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className={labelStyle}>
                          Doctor Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="doctorId"
                          style={inputStyle}
                          value={formData.doctorId}
                          onChange={handleInputChange}
                          disabled={!currentLocation || doctors.length === 0}
                        >
                          <option value="">Select a Doctor</option>
                          {doctors.map((doctor) => (
                            <option
                              key={doctor.doctor_id}
                              value={doctor.doctor_id}
                            >
                              {doctor.doctor_id} - {doctor.name}
                            </option>
                          ))}
                        </Form.Select>
                        {errors.doctorId && (
                          <p className="text-danger small mt-1">
                            {errors.doctorId}
                          </p>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="g-4 mb-4">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className={labelStyle}>
                          Patient Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="patient_name"
                          placeholder="Enter Patient Name"
                          style={inputStyle}
                          value={formData.patient_name}
                          onChange={handleInputChange}
                        />
                        {errors.patient_name && (
                          <p className="text-danger small mt-1">
                            {errors.patient_name}
                          </p>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className={labelStyle}>
                          Contact Number <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="patient_phone"
                          value={formData.patient_phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            if (val.length <= 10)
                              setFormData((prev) => ({
                                ...prev,
                                patient_phone: val,
                              }));
                          }}
                          placeholder="Enter Contact Number"
                          style={inputStyle}
                        />
                        {errors.patient_phone && (
                          <p className="text-danger small mt-1">
                            {errors.patient_phone}
                          </p>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className={labelStyle}>
                          Address <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="patient_location"
                          placeholder="Enter Patient Address"
                          style={inputStyle}
                          value={formData.patient_location}
                          onChange={handleInputChange}
                        />
                        {errors.patient_location && (
                          <p className="text-danger small mt-1">
                            {errors.patient_location}
                          </p>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="g-4 mb-4">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className={labelStyle}>
                          FDE Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="FDE_Name"
                          style={inputStyle}
                          value={formData.FDE_Name}
                          onChange={handleInputChange}
                          disabled={!currentLocation || fdeList.length === 0}
                        >
                          <option value="">Select FDE Name</option>
                          {/* Mapping the dynamic FDE list exactly like in the appointment form */}
                          {fdeList.map((fde) => (
                            <option key={fde.FDEID} value={fde.FDEID}>
                              {fde.FDEName}
                            </option>
                          ))}
                        </Form.Select>
                        {errors.FDE_Name && (
                          <p className="text-danger small mt-1">
                            {errors.FDE_Name}
                          </p>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className={labelStyle}>
                          Reference <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="reference"
                          style={inputStyle}
                          value={formData.reference}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Reference</option>
                          {[
                            "Family / Friends",
                            "Referred By Another Doctor",
                            "Referred By Another Patient",
                            "Internet",
                            "Social Media",
                            "Entertainment Media",
                            "TV Show",
                            "Newspaper / Magazine",
                            "Awareness Lecture",
                            "HHC Board on building",
                            "I was treated here in past ",
                            "Healing Hands Clinic Branch",
                            "Aggregators",
                            "Other",
                          ].map((ref) => (
                            <option key={ref} value={ref}>
                              {ref}
                            </option>
                          ))}
                        </Form.Select>
                        {errors.reference && (
                          <p className="text-danger small mt-1">
                            {errors.reference}
                          </p>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-10">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className={labelStyle}>
                          Note <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          name="note"
                          rows={3}
                          placeholder="Enter Note"
                          style={{ ...inputStyle, borderRadius: "10px" }}
                          value={formData.note}
                          onChange={handleInputChange}
                        />
                        {errors.note && (
                          <p className="text-danger small mt-1">
                            {errors.note}
                          </p>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end align-items-center">
                    <Button
                      style={{ borderRadius: "10px" }}
                      variant="secondary"
                      className="me-2"
                      onClick={handleReset}
                    >
                      Reset Form
                    </Button>
                    <Button
                      type="submit"
                      className="px-4 py-13"
                      style={{
                        borderRadius: "10px",
                        backgroundColor: "#00bcd4",
                        border: "none",
                        fontWeight: "600",
                      }}
                      disabled={loading || !currentLocation}
                    >
                      {loading ? "Adding Enquiry..." : "Add Enquiry"}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
