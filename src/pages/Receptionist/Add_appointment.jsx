import React, { useState, useEffect } from "react";
import { Row, Col, Form, Container, Card } from "react-bootstrap";
import { useLocation, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import NavBarA from "../../components/NavbarA";
import "../../styles/styles.css"; // Add this import at the top

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

const BASE_URL = "http://194.195.117.79:5100/api";

export default function Add_appointment() {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [fdeList, setFdeList] = useState([]);
  const [treatment, setTreatment] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [isExistingPatient, setIsExistingPatient] = useState(false);
  const [type, setType] = useState("");
  const location = useLocation();
  const { phone } = useParams();
  const [formData, setFormData] = useState({
    treatment: "",
    date: new Date().toISOString().split("T")[0],
    patientName: "",
    patient_phone: "",
    address: "",
    patient_type: "",
    appointmentTime: "",
    note: "",
    FDE_Name: "",
    departmentName: "",
    doctorName: "",
    reference: "",
  });

  const [errors, setErrors] = useState({});

  const newPatientTypes = ["NEW"];
  const existingPatientTypes = ["FOLLOW", "POSTOPERATIVE", "OTHER"];

  useEffect(() => {
    if (!phone) {
      console.error("No phone number found in URL.");
      return;
    }

    console.log("Fetching patient data for phone:", phone);

    const fetchPatientDetails = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/V1/appointment/getPatientByMobile?patient_phone=${phone}`
        );
        if (!response.ok) throw new Error("Failed to fetch patient details");

        const data = await response.json();
        console.log("Fetched Patient Data:", data);

        if (data.statusCode === 200 && data.data) {
          setFormData((prevState) => ({
            ...prevState,
            patientName: data.data.name || "",
            patient_phone: data.data.patient_phone || "",
            age: data.data.age || "",
            sex: data.data.sex || "",
            address: data.data.address || "",
            reference: data.data.reference || "",
          }));
        } else {
          console.warn("Patient data not found for phone:", phone);
        }
      } catch (error) {
        console.error("Error fetching patient details:", error);
      }
    };

    fetchPatientDetails();
  }, [phone]);

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

  const handleInputChange = (e) => {
    const { name, value, tagName } = e.target;

    if (name === "patientName") {
      const alphabetsOnly = value.replace(/[^A-Za-z\s]/g, "");
      setFormData((prevState) => ({
        ...prevState,
        [name]:
          tagName === "INPUT" ? alphabetsOnly.toUpperCase() : alphabetsOnly,
      }));
      return;
    }

    if (name === "address") {
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
      [name]: value, // Ensure the selected value is stored properly
    }));

    setFormData((prevState) => ({
      ...prevState,
      [name]: tagName === "INPUT" ? value.toUpperCase() : value,
    }));
  };

  const phoneRegex = /^[0-9]{7,15}$/;

  const validate = () => {
    const newErrors = {};
    const requiredFields = [
      "date",
      "patientName",
      "patient_type",
      "patient_phone",
      "appointmentTime",
      "note",
      "FDE_Name",
      "departmentName",
      "doctorName",
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

  const handleSubmit = async (saveType) => {
    const validationErrors = validate();
    console.log("Form Data:", formData);
    setErrors(validationErrors);
    console.log(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);

      const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const formattedDate = formatDate(formData.date);

      const payload = {
        ...formData,
        date: formattedDate,
        saveType,
        countryCode: getCountryCode(formData.patient_phone),
        patient_phone: formData.patient_phone,
      };
      try {
        console.log("Sending request to backend...");

        const response = await fetch(
          `${BASE_URL}/V1/appointment/addAppointment`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (response.ok) {
          const responseData = await response.json();
          alert("Appointment added successfully");
          setFormData({
            treatment: "",
            date: new Date().toISOString().split("T")[0],
            patientName: "",
            patient_phone: "",
            patient_type: "",
            patient_location: "",
            appointmentTime: "",
            note: "",
            FDE_Name: "",
            departmentName: "",
            doctorName: "",
            reference: "",
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

  const fetchPatientDetails = async (patient_phone) => {
    if (!patient_phone || patient_phone.length !== 10) {
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
        reference: "",
        patient_type: "NEW",
      }));
      return;
    }

    try {
      const url = `${BASE_URL}/V1/appointment/getPatientByMobile?patient_phone=${patient_phone}`;
      console.log(url);
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
          appointmentTime: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          note: "",
          FDE_Name: "",
          departmentName: "",
          doctorName: "",
          reference: "",
          patient_type: "NEW",
        }));
        return;
      }

      const data = await response.json();
      console.log("Fetched Patient Data:", data);

      if (data.statusCode === 200 && data.data) {
        setIsExistingPatient(true);
        alert(`${data.data.name} is already registered`);
        setFormData((prev) => ({
          ...prev,
          patientName: data.data.name || "",
          patient_location: data.data.patient_location || "",
          appointmentTime: data.data.appointmentTime || "",
          note: data.data.note || "",
          FDE_Name: data.data.FDE_Name || "",
          departmentName: data.data.departmentName || "",
          doctorName: data.data.doctorName || "",
          reference: data.data.reference || "",
          patient_type: "",
        }));
      } else {
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
          reference: "",
          patient_type: "NEW",
        }));
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
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
        reference: "",
        patient_type: "NEW",
      }));
    }
  };

  const shouldShowAddressAndReference = () => {
    return !(
      isExistingPatient &&
      (formData.patient_type === "FOLLOW" ||
        formData.patient_type === "POSTOPERATIVE" ||
        formData.patient_type === "OTHER")
    );
  };

  const fetchDropdownData = async () => {
    try {
      const treatmentResposne = await fetch(
        `${BASE_URL}/V1/appointment/treatmentDropdown`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (treatmentResposne.ok) {
        const treatmentData = await treatmentResposne.json();
        console.log("Doctors API Response:", treatmentData);
        setTreatment(
          Array.isArray(treatmentData.data) ? treatmentData.data : []
        );
      } else {
        console.error("Failed to fetch doctors:", treatmentResposne.statusText);
      }

      const doctorResponse = await fetch(
        `${BASE_URL}/V1/appointment/doctorDropdown`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (doctorResponse.ok) {
        const doctorData = await doctorResponse.json();
        console.log("Doctors API Response:", doctorData);
        setDoctors(Array.isArray(doctorData.data) ? doctorData.data : []);
      } else {
        console.error("Failed to fetch doctors:", doctorResponse.statusText);
      }

      const fdeResponse = await fetch(
        `${BASE_URL}/V1/appointment/fdeDropdown`,
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

      const departmentResponse = await fetch(
        `${BASE_URL}/V1/appointment/departmentDropdown`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (departmentResponse.ok) {
        const departmentData = await departmentResponse.json();
        console.log("Department API Response:", departmentData);
        setDepartmentList(
          Array.isArray(departmentData.data) ? departmentData.data : []
        );
      } else {
        console.error(
          "Failed to fetch FDE list:",
          departmentResponse.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error.message);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

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
    setTimeSlots(generateTimeSlots());
  };

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
                      <i className="fas fa-user-circle me-2"></i>
                      Appointment Details
                    </h5>
                    {/* First Row */}
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

                                if (patient_phone.length === limits.max) {
                                  fetchPatientDetails(patient_phone);
                                } else {
                                  // Clear form data if the number is incomplete
                                  setIsExistingPatient(false);
                                  setFormData((prev) => ({
                                    ...prev,
                                    patientName: "",
                                    patient_location: "",
                                    appointmentTime:
                                      new Date().toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      }),
                                    note: "",
                                    FDE_Name: "",
                                    departmentName: "",
                                    doctorName: "",
                                    reference: "",
                                    patient_type: "NEW",
                                  }));
                                }
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
                        </Form.Group>
                      </Col>
                      <Col md={2} className="mb-4">
                        <Form.Group className="mb-3">
                          <Form.Label>Type</Form.Label>
                          <Form.Control
                            as="select"
                            name="type"
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
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label>
                            Appointment Time <span className="required">*</span>
                          </Form.Label>
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
                        </Form.Group>
                      </Col>
                    </Row>
                    {/* Second Row */}
                    <Row className="mb-4">
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>
                            FDE Name <span className="required">*</span>
                          </Form.Label>
                          <Form.Select
                            name="FDE_Name"
                            value={formData.FDE_Name}
                            onChange={handleInputChange}
                          >
                            <option value="">Select FDE Name</option>
                            {fdeList?.map((fde) => (
                              <option key={fde.FDEName} value={fde.FDEName}>
                                {fde.FDEID} - {fde.FDEName}
                              </option>
                            ))}
                          </Form.Select>
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
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>
                            Appointment With <span className="required">*</span>
                          </Form.Label>
                          <Form.Select
                            name="doctorName"
                            value={formData.doctorName}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Doctor</option>
                            {doctors?.map((doctor) => (
                              <option
                                key={doctor.doctorName}
                                value={doctor.doctorName}
                              >
                                {doctor.doctor_id} - {doctor.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>{" "}
                    <br />
                    {/* Third Row */}
                    <Row className="mb-4">
                      {/* Treatment Field (Visible only when 'OTHER' is selected) */}
                      {formData.patient_type === "OTHER" && (
                        <Col md={4}>
                          <Form.Group className="mb-20">
                            <Form.Label>Treatment</Form.Label>
                            <Form.Select
                              name="treatment"
                              value={formData.treatment_name}
                              onChange={handleInputChange}
                            >
                              <option value="">Select a Treatment</option>
                              {treatment && treatment.length > 0 ? (
                                treatment.map((treatment) => (
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
                          </Form.Group>
                        </Col>
                      )}
                      {/* Address */}
                      {shouldShowAddressAndReference() && (
                        <Col md={4} className="mb-4">
                          <Form.Group className="mb-3">
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                              type="text"
                              name="patient_location"
                              value={formData.patient_location}
                              onChange={handleInputChange}
                              placeholder="Enter Address"
                              pattern="[A-Za-z\s,.\-/#]+"
                              title="Please enter a valid address (letters and common address characters only)"
                            />
                            {errors.address && (
                              <p style={{ color: "red" }}>{errors.address}</p>
                            )}
                          </Form.Group>
                        </Col>
                      )}
                      {/* Reference */}
                      {shouldShowAddressAndReference() && (
                        <Col md={4}>
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
                      )}
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>
                            Note <span className="required">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="note"
                            value={formData.note}
                            onChange={handleInputChange}
                            placeholder="Add Notes"
                          />
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
