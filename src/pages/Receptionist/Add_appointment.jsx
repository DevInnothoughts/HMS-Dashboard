import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Form, Container, Card } from "react-bootstrap";
import { useLocation, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import NavBarA from "../../components/NavbarA";
import Swal from 'sweetalert2';
import "../../styles/styles.css";
import { toast } from "react-hot-toast";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { decodeJwt } from "../../utils/decode-jwt";

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});

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
  const [treatmentList, setTreatmentList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [isExistingPatient, setIsExistingPatient] = useState(false);
  const [type, setType] = useState("");
  const location = useLocation();
  const { phone } = useParams();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [formData, setFormData] = useState({
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
    patient_id: "",
  });
  const [errors, setErrors] = useState({});
  const newPatientTypes = ["NEW"];
  const existingPatientTypes = ["FOLLOW", "POSTOPERATIVE", "OTHER"];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  const fetchPatientDetails = useCallback(async (patient_phone) => {
    if (!patient_phone || !currentLocation) {
      setIsExistingPatient(false);
      setFormData((prev) => ({
        ...prev,
        patientName: "",
        patient_location: "",
        patient_id: "",
        appointmentTime: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        note: "", FDE_Name: "", departmentName: "", doctorName: "",
        patient_type: "NEW", doctor_id: "",
      }));
      return;
    }

    console.log("Fetching patient details...");

    try {
      const url = `${BASE_URL}/V1/appointment/getPatientByMobile?patient_phone=${patient_phone}&location=${currentLocation}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        setIsExistingPatient(false);
        setFormData((prev) => ({ ...prev, patientName: "", patient_id: "", patient_location: "", patient_type: "NEW", doctor_id: "" }));
        return;
      }

      const data = await response.json();

      if (data.statusCode === 200 && data.data) {
        setIsExistingPatient(true);
        alert(`${data.data.name} is already registered.`);

        setFormData((prev) => ({
          ...prev,
          patientName: data.data.name || "",
          patient_location: data.data.address || "",
          patient_id: data.data.patient_id || "",
          appointmentTime: data.data.appointmentTime || "",
          note: data.data.note || "",
          FDE_Name: data.data.FDE_Name || "",
          departmentName: data.data.departmentName || "",
          doctorName: data.data.doctorName || "",
          patient_type: "",
          doctor_id: data.data.doctor_id || "",
        }));
      } else {
        setIsExistingPatient(false);
        setFormData((prev) => ({ ...prev, patientName: "", patient_id: "", patient_type: "NEW", doctor_id: "" }));
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
      setIsExistingPatient(false);
      setFormData((prev) => ({ ...prev, patientName: "", patient_id: "", patient_type: "NEW", doctor_id: "" }));
    }
  }, [currentLocation]);

  const fetchDropdownData = useCallback(async () => {
    if (!currentLocation) return;

    console.log("Fetching dropdown data...");

    try {
      const fetchApi = async (endpoint) => {
        const url = `${BASE_URL}/V1/appointment/${endpoint}?location=${currentLocation}`;
        const response = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
        return response.ok ? response.json() : { data: [] };
      };

      const [treatmentData, doctorData, fdeData, departmentData] = await Promise.all([
        fetchApi('treatmentDropdown').then(res => res.data),
        fetchApi('doctorDropdown').then(res => res.data),
        fetchApi('fdeDropdown').then(res => res.data),
        fetchApi('departmentDropdown').then(res => res.data),
      ]);

      setTreatmentList(Array.isArray(treatmentData) ? treatmentData : []);
      setDoctors(Array.isArray(doctorData) ? doctorData : []);
      setFdeList(Array.isArray(fdeData) ? fdeData : []);
      setDepartmentList(Array.isArray(departmentData) ? departmentData : []);

    } catch (error) {
      console.error("Error fetching dropdown data:", error.message);
    }
  }, [currentLocation]);

  useEffect(() => {
    if (phone && currentLocation) {
      fetchPatientDetails(phone);
    }
  }, [phone, currentLocation, fetchPatientDetails]);

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

  useEffect(() => {
    if (currentLocation) {
      fetchDropdownData();
    }
  }, [currentLocation, fetchDropdownData]);

  const handleInputChange = (e) => {
    const { name, value, tagName } = e.target;

    if (name === "doctorName") {
      const selectedDoctor = doctors.find(d => d.name === value);

      setFormData((prevState) => ({
        ...prevState,
        doctorName: value,
        doctor_id: selectedDoctor ? selectedDoctor.doctor_id : "",
      }));
      return;
    }

    if (name === "patientName") {
      const alphabetsOnly = value.replace(/[^A-Za-z\s]/g, "");
      setFormData((prevState) => ({
        ...prevState,
        [name]: tagName === "INPUT" ? alphabetsOnly.toUpperCase() : alphabetsOnly,
      }));
      return;
    }

    if (name === "patient_location") {
      const validAddressChars = value.replace(/[^A-Za-z0-9\s,.\-/#]/g, "");
      setFormData((prevState) => ({
        ...prevState,
        [name]: tagName === "INPUT" ? validAddressChars.toUpperCase() : validAddressChars,
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
      "date",
      "patientName",
      "patient_type",
      "patient_phone",
      "appointmentTime",
      "note",
      "FDE_Name",
      "departmentName",
      "doctor_id",
    ];

    if (shouldShowAddressAndReference()) {
      requiredFields.push("patient_location");
    }

    if (formData.patient_type === "OTHER") {
      requiredFields.push("treatment");
    }

    if (formData.patient_type !== "NEW" && !formData.patient_id) {
      newErrors.patient_phone = "Patient ID is required for existing patient types (FOLLOW, POSTOPERATIVE, OTHER). Please search by phone number.";
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
      newErrors.location = "Location data is not available.";
    }

    return newErrors;
  };

  const handleSubmit = async (saveType) => {
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);

      // --- PAYLOAD MAPPING TO SCHEMA ---
      const payload = {
        // Core Fields
        doctor_id: formData.doctor_id,
        patient_type: formData.patient_type,
        patient_phone: formData.patient_phone,
        appointment_timestamp: formData.date,
        appointment_time: formData.appointmentTime,
        patient_location: formData.patient_location,
        FDE_Name: formData.FDE_Name,
        treatment_name: formData.treatment,
        note: formData.note,
        patient_id: formData.patient_id || undefined,
        confirm_time: formData.confirm_time || 0,
        status: formData.status || "BOOKED",
        is_deleted: 0,
        consultationchk: formData.consultationchk,
        patientName: formData.patientName,
        clinic_location: currentLocation,
        saveType,
        countryCode: getCountryCode(formData.patient_phone),
      };
      // --- END PAYLOAD MAPPING ---

      // HIPAA: Generalized logging
      console.log("Submitting appointment request.");

      try {
        const response = await fetch(
          `${BASE_URL}/V1/appointment/addAppointment?location=${currentLocation}`,
          {
            method: "POST",
            // HIPAA: Assumed Authorization Header is configured globally
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (response.ok) {
          Swal.fire({
                      icon: 'success',
                      title: 'Success!',
                      text: 'Appointment booked successfully.',
                      confirmButtonColor: '#00bcd4'
                    });
                              setFormData({
                      treatment: "", date: new Date().toISOString().split("T")[0], patientName: "",
                      patient_phone: "", patient_location: "", patient_type: "", appointmentTime: "",
                      note: "", FDE_Name: "", departmentName: "", doctorName: "", doctor_id: "",
                      consultationchk: 0, confirm_time: 0, status: "BOOKED", patient_id: "",
                    });
                  } else {
                    const errorData = await response.json();
                    console.error(`Backend error: ${errorData.message}`);
          Swal.fire({
                      icon: 'error',
                      title: 'Booking Failed',
                      text: errorData.message || 'Failed to book appointment'
                    });
                          }
                } catch (error) {
                  console.error("Error adding appointment:", error.message);
          Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'A network error occurred.'
                  });
                      } finally {
                  setLoading(false);
                }
              } else {
                Toast.fire({
                  icon: 'warning',
                  title: 'Please fill all required fields'
      });
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

  const generateTimeSlots = () => {
    const slots = [];
    const startTime = new Date();
    const endTime = new Date();
    endTime.setHours(23, 45, 0);

    const isToday = formData.date === new Date().toISOString().split("T")[0];

    if (isToday) {
      startTime.setHours(
        new Date().getHours(),
        Math.ceil(new Date().getMinutes() / 15) * 15,
        0
      );
    } else {
      startTime.setHours(7, 0, 0);
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
    handleInputChange({
      target: {
        name: "date",
        value: date ? date.toISOString().split("T")[0] : "",
      },
    });
  };

  // Wrapper for fetchPatientDetails to handle incomplete phone number logic
  const handlePhoneNumberChange = (e) => {
    const patient_phone = e.target.value.replace(/\D/g, ""); // Remove non-digits
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
        // HIPAA: Pass PHI only to secure function/API
        fetchPatientDetails(patient_phone);
      } else {
        // Clear relevant data if the number is incomplete
        setIsExistingPatient(false);
        setFormData((prev) => ({
          ...prev,
          patientName: "",
          patient_type: "NEW",
          doctor_id: "",
          patient_id: "", // CRITICAL: Clear patient_id if search fails/incomplete
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
        padding: "12px",
        fontFamily: "'Poppins', Arial, sans-serif",
      }}
    >
      <PageBreadcrumb pagename="Add New Appointment Page" />
      <NavBarA pagename="Add Appointment" />
      <Container fluid>
        <Row>
          <Col>
            <Card
              style={{
                borderRadius: "15px",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                border: "1.5px solid #00bcd4",
                background: "white",
                overflow: "hidden",
              }}
            >
              <Card.Body >
                <Form>
                  <div className="form-section">
                    <h4 className="section-title">
                     Add New Appointment Details
                    </h4>
                    {errors.location && (
                      <p style={{ color: "red", fontWeight: "bold" }}>{errors.location}</p>
                    )}
                    <br />
                    <Row className="mb-10">
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>
                            Mobile No <span style={{color:"red"}} className="required">*</span>
                          </Form.Label>
                          <Form.Control
                            type="tel"
                            name="patient_phone"
                            value={formData.patient_phone}
                            onChange={handlePhoneNumberChange}
                            placeholder={`Enter ${countryNumberLimits["+91"].max
                              } digit number`}
                            maxLength={
                              countryNumberLimits["+91"].max
                            }
                          />
                          {errors.patient_phone && (
                            <p style={{ color: "red" }}>{errors.patient_phone}</p>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={3} className="mb-4">
                        <Form.Group className="mb-3">
                          <Form.Label>Patient Type <span style={{color:"red"}} className="required">*</span></Form.Label>
                          <Form.Control
                            as="select"
                            name="patient_type"
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
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>
                           Appointment Date <span style={{color:"red"}} className="required">*</span>
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
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>
                            Appointment Time <span style={{color:"red"}} className="required">*</span>
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
                          {errors.appointmentTime && (
                            <p style={{ color: "red" }}>{errors.appointmentTime}</p>
                          )}
                        </Form.Group>
                      </Col>
                      
                    </Row>

                    <Row className="mb-15">
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>
                            Patient Name <span style={{color:"red"}} className="required">*</span>
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
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>
                            FDE Name <span style={{color:"red"}} className="required">*</span>
                          </Form.Label>
                          <Form.Select
                            name="FDE_Name"
                            value={formData.FDE_Name}
                            onChange={handleInputChange}
                            disabled={!currentLocation}
                          >
                            <option value="">Select FDE Name</option>
                            {fdeList?.map((fde) => (
                              <option key={fde.FDEID} value={fde.FDEID}>
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
                            Department Name <span style={{color:"red"}} className="required">*</span>
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
                      </Row>
                      <Row className="mb-15">
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>
                            Appointment With <span style={{color:"red"}} className="required">*</span>
                          </Form.Label>
                          <Form.Select
                            name="doctorName"
                            value={formData.doctorName}
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
                          {errors.doctorName && (
                            <p style={{ color: "red" }}>{errors.doctorName}</p>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="mb-15">
                      {(formData.patient_type === "OTHER" || formData.treatment) && (
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Treatment</Form.Label>
                            <Form.Select
                              name="treatment"
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

                      {shouldShowAddressAndReference() && (
                        <Col md={formData.patient_type === "OTHER" || formData.treatment ? 4 : 8} className="mb-4">
                          <Form.Group className="mb-3">
                            <Form.Label>Patient Address <span style={{color:"red"}} className="required">*</span></Form.Label>
                            <Form.Control
                              type="text"
                              name="patient_location"
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

                    <Row>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>
                            Note <span style={{color:"red"}} className="required">*</span>
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            name="note"
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

                    <Row className="mt-4">
                      <Col className="text-end">
                      <button type="button" className="btn btn-danger me-2">
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => handleSubmit("save")}
                          disabled={loading || !currentLocation}
                        >
                          Book Appointment
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
    </div>
  );
}