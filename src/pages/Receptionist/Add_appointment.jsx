import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Form, Container, Card, Button } from "react-bootstrap";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import FeatherIcon from "feather-icons-react";
import "react-datepicker/dist/react-datepicker.css";
import NavBarA from "../../components/NavbarA";
import Swal from "sweetalert2";
import "../../styles/styles.css";
import { toast } from "react-hot-toast";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { decodeJwt } from "../../utils/decode-jwt";

// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://194.195.117.79:5100/api";

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

const getCountryCode = (patient_phone) => {
  if (!patient_phone) return "Unknown";

  const country = countryCodes.find((code) =>
    patient_phone.startsWith(code.value),
  );
  return country ? country.value : "Unknown";
};

function to24HourFormat(time12h) {
  const [time, modifier] = time12h.trim().split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier.toUpperCase() === "PM" && hours !== 12) {
    hours += 12;
  }
  if (modifier.toUpperCase() === "AM" && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

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

const referralSources = [
  { id: "family_friends", label: "Family/friends" },
  { id: "dr_ref", label: "Referred by another doctor" },
  { id: "old_ref", label: "Referred by another patient" },
  { id: "internet", label: "Internet" },
  { id: "socialMedia", label: "Social Media" },
  { id: "MediaRef", label: "TV Show/Radio" },
  { id: "newspaper", label: "Newspaper/Magazine" },
  { id: "awareness_lecture", label: "Awareness Lecture" },
  { id: "hhc_board", label: "HHC Board on building" },
  { id: "self_old_pt", label: "I was treated here in past" },
  { id: "hhc_branch", label: "Healing Hands Clinic Branch" },
  { id: "aggregators", label: "Aggregators" },
  { id: "other", label: "Other" },
];

export default function Add_appointment() {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [fdeList, setFdeList] = useState([]);
  const [treatmentList, setTreatmentList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [isExistingPatient, setIsExistingPatient] = useState(false);
  const [noPendingAppt, setNoPendingAppt] = useState(true);
  const [type, setType] = useState("");
  const location = useLocation();
  const { phone } = useParams();
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [formData, setFormData] = useState({
    treatment: "",
    date: new Date().toISOString().split("T")[0],
    patientName: "",
    reference: "",
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
  const newPatientTypes = ["New"];
  const existingPatientTypes = ["Follow", "Postoperative", "MCDPA", "Other"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  const fetchPatientDetails = useCallback(
    async (patient_phone) => {
      if (!patient_phone || !currentLocation) {
        setIsExistingPatient(false);
        setNoPendingAppt(true);
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
          note: "",
          FDE_Name: "",
          departmentName: "",
          doctorName: "",
          patient_type: "New",
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
          setNoPendingAppt(true);
          setFormData((prev) => ({
            ...prev,
            patientName: "",
            patient_id: "",
            patient_location: "",
            patient_type: "New",
            doctor_id: "",
          }));
          return;
        }

        const data = await response.json();
        if (data.statusCode === 200 && data.data) {
          setIsExistingPatient(true);

          let hasPendingAppt = false;
          try {
            const confirmUrl = `${BASE_URL}/V1/appointment/getPatientByApptConfirm?patient_phone=${patient_phone}&location=${currentLocation}`;
            const confirmResponse = await fetch(confirmUrl, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            });

            const confirmData = await confirmResponse.json();

            if (confirmResponse.status === 400) {
              Swal.fire({
                icon: "warning",
                title: "Pending Appointment",
                text: "Pending appointment, close that appointment first.",
                confirmButtonColor: "#f39c12",
              });
              setNoPendingAppt(false);
              hasPendingAppt = true;
            } else {
              setNoPendingAppt(true);
            }
          } catch (innerError) {
            console.error("Error in confirmation check API call:", innerError);
          }

          if (!hasPendingAppt) {
            Swal.fire({
              icon: "info",
              title: "Patient Found",
              text: `${data.data.name} is already registered.`,
              confirmButtonColor: "#00bcd4",
              timer: 3000,
            });
          }

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
          setNoPendingAppt(true);
          setFormData((prev) => ({
            ...prev,
            patientName: "",
            patient_id: "",
            patient_type: "New",
            doctor_id: "",
          }));
        }
      } catch (error) {
        console.error("Error fetching patient details:", error);
        setIsExistingPatient(false);
      }
    },
    [currentLocation],
  );

  const fetchDropdownData = useCallback(async () => {
    if (!currentLocation) return;
    try {
      const fetchApi = async (endpoint) => {
        const route = endpoint === "doctorDropdown" ? "doctor" : "appointment";
        const url = `${BASE_URL}/V1/${route}/${endpoint}?location=${currentLocation}`;
        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        return response.ok ? response.json() : { data: [] };
      };

      const [treatmentData, doctorData, fdeData] = await Promise.all([
        fetchApi("treatmentDropdown").then((res) => res.data),
        fetchApi("doctorDropdown").then((res) => res.data),
        fetchApi("fdeDropdown").then((res) => res.data),
      ]);

      setTreatmentList(Array.isArray(treatmentData) ? treatmentData : []);
      setDoctors(Array.isArray(doctorData) ? doctorData : []);
      setFdeList(Array.isArray(fdeData) ? fdeData : []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error.message);
    }
  }, [currentLocation]);

  const handleManualReset = () => {
    handleReset();
    Toast.fire({ icon: "success", title: "Form reset successful" });
  };

  const handleReset = () => {
    setFormData({
      treatment: "",
      date: new Date().toISOString().split("T")[0],
      patientName: "",
      reference: "",
      patient_phone: "",
      patient_location: "",
      patient_type: "",
      appointmentTime: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
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
    setIsExistingPatient(false);
    setNoPendingAppt(true);
    setErrors({});
    setType("");
  };

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
    setFormData((prev) => ({ ...prev, appointmentTime: currentTime }));
  }, []);

  useEffect(() => {
    if (currentLocation) fetchDropdownData();
  }, [currentLocation, fetchDropdownData]);

  useEffect(() => {
    console.log("Current Form Data (entering data):", formData);
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value, tagName } = e.target;
    if (name === "doctorName") {
      const selectedDoctor = doctors.find((d) => d.name === value);
      setFormData((prevState) => ({
        ...prevState,
        doctorName: value,
        doctor_id: selectedDoctor ? selectedDoctor.doctor_id : "",
      }));
      return;
    }
    // const finalValue = (tagName === "INPUT" || tagName === "TEXTAREA") ? value.toUpperCase() : value;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    const requiredFields = [
      "date",
      "patientName",
      "patient_type",
      "patient_phone",
      "appointmentTime",
      "FDE_Name",
      "doctor_id",
    ];

    if (formData.patient_type === "New") {
      requiredFields.push("patient_location");
      requiredFields.push("reference");
    }

    if (formData.patient_type === "OTHER") {
      requiredFields.push("treatment");
    }

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field === "doctor_id" ? "doctorName" : field] = "Required";
      }
    });
    return newErrors;
  };

  const handleSubmit = async (e, saveType) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!saveType) saveType = "save";
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      const payload = {
        doctor_id: formData.doctor_id,
        patient_type:
          formData.patient_type === "Post Operative"
            ? "Postoperative"
            : formData.patient_type,
        patient_phone: formData.patient_phone,
        appointment_timestamp: formData.date,
        appointment_time: to24HourFormat(formData.appointmentTime),
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
        reference: formData.reference,
        clinic_location: currentLocation,
        saveType,
        countryCode: getCountryCode(formData.patient_phone),
      };
      console.log("Submitting Appointment Payload:", payload);
      try {
        const response = await fetch(
          `${BASE_URL}/V1/appointment/addAppointment?location=${currentLocation}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Appointment booked successfully.",
          }).then(() => {
            handleReset();
            window.dispatchEvent(new CustomEvent("refreshApptCounts"));
            navigate("/appointments");
          });
        } else {
          const errorData = await response.json();
          Swal.fire({
            icon: "error",
            title: "Booking Failed",
            text: errorData.message,
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Network error occurred.",
        });
      } finally {
        setLoading(false);
      }
    } else {
      const fieldLabels = {
        patient_phone: "Contact Number",
        patient_type: "Patient Type",
        date: "Appointment Date",
        appointmentTime: "Appointment Time",
        patientName: "Patient Name",
        treatment: "Treatment",
        patient_location: "Patient Address",
        doctorName: "Doctor Name",
        FDE_Name: "FDE Name",
        reference: "Reference",
      };
      const missingFields = Object.keys(validationErrors)
        .map((key) => fieldLabels[key] || key)
        .join(", ");
      Toast.fire({
        icon: "warning",
        title: `Missing fields: ${missingFields}`,
      });
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    const startTime = new Date();
    const endTime = new Date();
    endTime.setHours(23, 45, 0);
    startTime.setHours(7, 0, 0);
    while (startTime <= endTime) {
      slots.push(
        startTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      );
      startTime.setMinutes(startTime.getMinutes() + 15);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handlePhoneNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 10) {
      setFormData((prev) => ({ ...prev, patient_phone: val }));
      if (val.length === 10 && currentLocation) fetchPatientDetails(val);
    }
  };

  const labelStyle = {
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "5px",
    display: "block",
  };

  const inputStyle = {
    fontSize: "12px",
    borderRadius: "10px",
    border: "2px solid rgb(77, 208, 225)",
    padding: "5px 10px",
  };

  const cardHeaderStyle = {
    backgroundColor: "#67c5cfff",
    padding: "12px 20px",
    borderBottom: "2px solid #1a5b61ff",
    display: "flex",
    alignItems: "center",
  };

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        minHeight: "100vh",
        padding: "10px",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <PageBreadcrumb pagename="Add Appointment Form" />
      <NavBarA pagename="Add Appointment" />
      <Container fluid>
        <Row>
          <Col>
            <Card
              style={{
                borderRadius: "15px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                border: "none",
                background: "white",
                overflow: "hidden",
                margin: "6px",
                marginTop: "-4px",
              }}
            >
              <div style={cardHeaderStyle}>
                <FeatherIcon
                  icon="plus-square"
                  size="18"
                  style={{ color: "#1a5b61ff", marginRight: "10px" }}
                />
                <h4
                  style={{
                    color: "#1a5b61ff",
                    fontWeight: "600",
                    fontSize: "1rem",
                    margin: 0,
                  }}
                >
                  Add New Appointment Details
                </h4>
              </div>

              <Card.Body style={{ padding: "10px" }}>
                <Form onSubmit={(e) => handleSubmit(e, "save")}>
                  <Row className="g-3">
                    <Col md={3}>
                      <Form.Label style={labelStyle}>
                        Contact Number <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        required
                        type="tel"
                        style={inputStyle}
                        value={formData.patient_phone}
                        onChange={handlePhoneNumberChange}
                        placeholder="Enter Contact Number"
                      />
                      {errors.patient_phone && (
                        <p className="text-danger" style={{ fontSize: "11px" }}>
                          {errors.patient_phone}
                        </p>
                      )}
                    </Col>
                    <Col md={3}>
                      <Form.Label style={labelStyle}>
                        Patient Type <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        required
                        style={inputStyle}
                        name="patient_type"
                        value={formData.patient_type}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Type</option>
                        {(isExistingPatient
                          ? existingPatientTypes
                          : newPatientTypes
                        ).map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={3}>
                      <Form.Label style={labelStyle}>
                        Appointment Date <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        required
                        type="date"
                        style={inputStyle}
                        name="date"
                        value={formData.date}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={handleInputChange}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Label style={labelStyle}>
                        Appointment Time <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        required
                        style={inputStyle}
                        name="appointmentTime"
                        value={formData.appointmentTime}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Time</option>
                        {timeSlots.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Row>

                  <Row className="g-3">
                    <Col md={4}>
                      <Form.Label style={labelStyle}>
                        Patient Name <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        required
                        style={{
                          ...inputStyle,
                          cursor: isExistingPatient ? "not-allowed" : "default",
                          backgroundColor: isExistingPatient ? "#e7ebebff" : undefined,
                        }}
                        readOnly={isExistingPatient}
                        type="text"
                        name="patientName"
                        value={formData.patientName}
                        onChange={handleInputChange}
                        placeholder="Enter Name"
                      />
                    </Col>
                    {(formData.patient_type === "OTHER" ||
                      formData.treatment) && (
                        <Col md={4}>
                          <Form.Label style={labelStyle}>
                            Treatment <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
                            required
                            style={inputStyle}
                            name="treatment"
                            value={formData.treatment}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Treatment</option>
                            {treatmentList?.map((t) => (
                              <option
                                key={t.treatment_name}
                                value={t.treatment_name}
                              >
                                {t.treatment_name}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                      )}

                    {formData.patient_type === "New" && (
                      <Col md={4}>
                        <Form.Label style={labelStyle}>
                          Patient Address <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          required
                          style={inputStyle}
                          type="text"
                          name="patient_location"
                          value={formData.patient_location}
                          onChange={handleInputChange}
                          placeholder="Enter Address"
                        />
                        {errors.patient_location && (
                          <p
                            className="text-danger"
                            style={{ fontSize: "11px" }}
                          >
                            {errors.patient_location}
                          </p>
                        )}
                      </Col>
                    )}
                    <Col md={4}>
                      <Form.Label style={labelStyle}>
                        Doctor Name <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        required
                        style={inputStyle}
                        name="doctorName"
                        value={formData.doctorName}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Doctor</option>
                        {doctors?.map((d) => (
                          <option key={d.doctor_id} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={4}>
                      <Form.Label style={labelStyle}>
                        FDE Name <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        required
                        style={inputStyle}
                        name="FDE_Name"
                        value={formData.FDE_Name}
                        onChange={handleInputChange}
                      >
                        <option value="">Select FDE</option>
                        {fdeList?.map((f) => (
                          <option key={f.FDEID} value={f.FDEID}>
                            {f.FDEName}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>

                    {formData.patient_type === "New" && (
                      <Col md={4}>
                        <Form.Label style={labelStyle}>
                          Reference <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          required
                          style={inputStyle}
                          name="reference"
                          value={formData.reference}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Reference</option>
                          {referralSources.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </Form.Select>
                        {errors.reference && (
                          <p
                            className="text-danger"
                            style={{ fontSize: "11px" }}
                          >
                            {errors.reference}
                          </p>
                        )}
                      </Col>
                    )}
                    <Col md={4} className="mb-10">
                      <Form.Label style={labelStyle}>Note</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        style={{ ...inputStyle }}
                        name="note"
                        value={formData.note}
                        onChange={handleInputChange}
                        placeholder="Enter additional note..."
                      />
                    </Col>
                  </Row>
                  <div className="d-flex justify-content-end">
                    <Button
                      variant="secondary"
                      className="me-2"
                      style={{
                        fontSize: "13px",
                        borderRadius: "10px",
                        padding: "10px 20px",
                      }}
                      onClick={handleManualReset}
                    >
                      Reset Form
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      style={{
                        fontSize: "13px",
                        borderRadius: "10px",
                        padding: "10px 25px",
                        border: "none",
                      }}
                      disabled={loading || !noPendingAppt}
                    >
                      {loading ? "Adding..." : "Add Appointment"}
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
