import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";
import NavBarA from "../componets/NavbarA";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/styles.css"; // Add this import at the top

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

const BASE_URL = "http://194.195.117.79:5100/api";
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const Add_Enquiry = () => {
  const [formData, setFormData] = useState({
    date: formatDate(new Date()),
    doctorId: "",
    enquirytype: "",
    patient_name: "",
    patient_phone: "",
    patient_location: "",
    reference: "",
    FDE_Name: "",
    note: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState("");
  const phoneRegex = /^[0-9]{7,15}$/; // Define phoneRegex before using it

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
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${field.replace(/([A-Z])/g, " $1")} is required`;
      }
    });
    if (!formData.patient_phone || !phoneRegex.test(formData.patient_phone)) {
      newErrors.patient_phone = "Enter a valid phone number (7-15 digits)";
    }

    return newErrors;
  };

  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // Handle input changes
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
    console.log(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true); // Set loading to true when submitting

      try {
        console.log("Sending request to backend...");

        const response = await fetch(`${BASE_URL}/V1/enquiry/addEnquiry`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        console.log("Response received:", response);

        const data = await response.json();

        if (response.ok) {
          alert("Enquiry added successfully!");
          setFormData((prevState) => ({
            ...prevState,
            date: formatDate(new Date()),
          }));
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

  const fetchDropdownData = async () => {
    try {
      const doctorResponse = await fetch(
        `${BASE_URL}/V1/enquiry/doctorDropdown`,
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
    } catch (error) {
      console.error("Error fetching dropdown data:", error.message);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

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
                  borderRadius: "12px",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "4px solid #00bcd4",
                }}
              >
                <Card.Body>
                  <Form onSubmit={handleSubmit}>
                    {/* Date Input */}
                    <Row>
                      {/* Date */}
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Date</Form.Label>
                          <DatePicker
                            selected={parseDate(formData.date)}
                            onChange={(date) => {
                              if (date) {
                                setFormData((prev) => ({
                                  ...prev,
                                  date: formatDate(date),
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
                      <Col md={3}>
                        {/* Enquiry Type */}
                        <Form.Group controlId="enquirytype">
                          <Form.Label>Enquiry Type</Form.Label>
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
                        </Form.Group>
                      </Col>
                      {/* Doctor Name Dropdown */}
                      <Col md={3}>
                        <Form.Group className="mb-20">
                          <Form.Label>Doctor Name</Form.Label>
                          <Form.Select
                            name="doctorId"
                            value={formData.doctorId}
                            onChange={handleInputChange}
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
                              <option disabled>No doctors available</option>
                            )}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        {/* Patient Name */}
                        <Form.Group controlId="patient_name">
                          <Form.Label>Patient Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="patient_name"
                            placeholder="Enter Patient Name"
                            value={formData.patient_name}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={3}>
                        {/* Mobile Number */}
                        <Form.Group controlId="patient_phone">
                          <Form.Label>Mobile Number</Form.Label>
                          <Form.Control
                            type="tel"
                            name="patient_phone"
                            // placeholder="Enter Mobile Number"
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
                              formData.countryCode
                                ? countryNumberLimits[formData.countryCode].max
                                : "10"
                            } digit number`}
                            maxLength={
                              formData.countryCode
                                ? countryNumberLimits[formData.countryCode].max
                                : 15
                            }
                          />
                          {errors.patient_phone && (
                            <p style={{ color: "red" }}>
                              {errors.patient_phone}
                            </p>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        {/* Address */}
                        <Form.Group controlId="patient_location">
                          <Form.Label>Address</Form.Label>
                          <Form.Control
                            type="text"
                            name="patient_location"
                            placeholder="Enter Address"
                            value={formData.patient_location}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        {/* Reference */}
                        <Form.Group controlId="reference">
                          <Form.Label>Reference</Form.Label>
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
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        {/* FDE Name */}
                        <Form.Group controlId="FDE_Name">
                          <Form.Label>FDE Name</Form.Label>
                          <Form.Control
                            as="select"
                            name="FDE_Name"
                            value={formData.FDE_Name}
                            onChange={handleInputChange}
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
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        {/* Note */}
                        <Form.Group controlId="note">
                          <Form.Label>Note</Form.Label>
                          <Form.Control
                            as="textarea"
                            name="note"
                            rows={3}
                            placeholder="Enter Note"
                            value={formData.note}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <br />
                    {/* Submit Button */}
                    <Form.Group className="text-end mb-0">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={loading}
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

export default Add_Enquiry;
