import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavbarIpdBills from "../../components/NavbarIpdBills";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import {
  Row,
  Col,
  Form,
  Container,
  Card,
  Button,
  InputGroup,
} from "react-bootstrap";
import { decodeJwt } from "../../utils/decode-jwt";
import Swal from "sweetalert2";

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

const AddInvoice = () => {
  const navigate = useNavigate();
  const initialFormData = {
    invoice_id: "",
    admission_no: "",
    patient_id: "",
    patient_name: "",
    phone_number: "",
    uid_no: "",
    discharge_date: "",
    dischargetime: "",
    bed_category: "",
    admission_date: "",
    admissiontime: "",
    consultantName: "",
    surgeonName: "",
    Sub_Total: "0.00",
    bill_Type: "",
    bill_method: "",
    note: "",
    dynamicRows: [{ label: "", value: "" }],
    discount: "",
    discountAmount: "",
    payableAmount: "0.00",
    chequeno: "",
    pdc: "",
    reimbursement: "",
    insurance: "",
    tpa: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [consultants, setConsultants] = useState([]);
  const [surgeons, setSurgeons] = useState([]);
  const [insurance, setInsurance] = useState([]);
  const [tpa, setTpa] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [patientResults, setPatientResults] = useState([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [invoiceWarning, setInvoiceWarning] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 15) {
        const h = hour.toString().padStart(2, "0");
        const m = min.toString().padStart(2, "0");
        times.push(`${h}:${m}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  useEffect(() => {
    if (!currentLocation || !formData.invoice_id) {
      setInvoiceWarning("");
      return;
    }

    const checkTimeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/V1/invoice/checkInvoiceId?invoice_id=${formData.invoice_id}&location=${currentLocation}`,
        );
        const result = await response.json();
        if (result.data?.exists) {
          setInvoiceWarning(
            `Invoice ID already exists for patient: ${result.data.patient_name}`,
          );
        } else {
          setInvoiceWarning("");
        }
      } catch (err) {
        console.error("Invoice ID check failed:", err);
      }
    }, 500);

    return () => clearTimeout(checkTimeout);
  }, [formData.invoice_id, currentLocation]);

  useEffect(() => {
    if (!currentLocation) return;

    const fetchDropdowns = async () => {
      try {
        const [cRes, sRes, iRes, tRes] = await Promise.all([
          fetch(
            `${BASE_URL}/V1/invoice/consultant_dropdown?location=${currentLocation}`,
          ),
          fetch(
            `${BASE_URL}/V1/invoice/surgeon_dropdown?location=${currentLocation}`,
          ),
          fetch(
            `${BASE_URL}/V1/invoice/insurance_co_dropdown?location=${currentLocation}`,
          ),
          fetch(
            `${BASE_URL}/V1/invoice/tpa_dropdown?location=${currentLocation}`,
          ),
        ]);

        const [c, s, i, t] = await Promise.all([
          cRes.json(),
          sRes.json(),
          iRes.json(),
          tRes.json(),
        ]);

        if (cRes.ok) setConsultants(c.data ?? []);
        console.log(c);
        if (sRes.ok) setSurgeons(s.data ?? []);
        if (iRes.ok) setInsurance(i.data ?? []);
        if (tRes.ok) setTpa(t.data ?? []);
      } catch (err) {
        console.error("Dropdown fetch failed:", err);
      }
    };

    fetchDropdowns();
  }, [currentLocation]);

  const validate = () => {
    const newErrors = {};
    const requiredFields = [
      "invoice_id",
      "admission_no",
      "patient_id",
      "discharge_date",
      "dischargetime",
      "bed_category",
      "admission_date",
      "admissiontime",
      "consultantName",
      "surgeonName",
      "Sub_Total",
      "bill_Type",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${field.replace(/([A-Z])/g, " $1")} is required.`;
      }
    });

    return newErrors;
  };

  const calculatePayableAmount = (data) => {
    const subTotal = parseFloat(data.Sub_Total || 0);
    const discountNonIns = parseFloat(data.discount || 0);
    const discountCharity = parseFloat(data.discountAmount || 0);
    const pdc = parseFloat(data.pdc || 0);

    let deduction = 0;
    if (data.bill_Type === "charity") {
      deduction = discountCharity;
    } else if (data.bill_method === "PDC") {
      deduction = pdc;
    } else if (data.bill_Type === "non_insurance") {
      deduction = discountNonIns;
    }

    const payable = subTotal - deduction;
    return Math.max(payable, 0).toFixed(0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Restriction for invoice_id: only integers allowed
    if (name === "invoice_id") {
      const integerOnly = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: integerOnly }));
      return;
    }

    let updatedFormData = { ...formData, [name]: value };

    if (name === "bill_Type") {
      updatedFormData.bill_method = "";
      updatedFormData.insurance = "";
      updatedFormData.tpa = "";
      updatedFormData.chequeno = "";
      updatedFormData.pdc = "";
      updatedFormData.discount = "";
      updatedFormData.discountAmount = "";
    }

    if (name === "bill_method" && value !== "PDC") {
      updatedFormData.chequeno = "";
      updatedFormData.pdc = "";
    }

    if (
      [
        "discount",
        "pdc",
        "discountAmount",
        "Sub_Total",
        "bill_Type",
        "bill_method",
      ].includes(name)
    ) {
      updatedFormData.payableAmount = calculatePayableAmount(updatedFormData);
    }

    setFormData(updatedFormData);
  };

  const handlePatientSearch = async (query) => {
    setFormData((prev) => ({
      ...prev,
      patient_name: query,
      // If user clears the input, clear selected patient details
      ...(query === "" && {
        patient_id: "",
        phone_number: "",
        uid_no: "",
      }),
    }));

    if (query.length > 2) {
      try {
        const response = await fetch(
          `${BASE_URL}/V1/patient/searchPatient?query=${query}&location=${currentLocation}`,
        );
        const data = await response.json();
        if (response.ok) {
          setPatientResults(data.data || []);
          setShowPatientDropdown(true);
        }
      } catch (err) {
        console.error("Patient search failed:", err);
      }
    } else {
      setPatientResults([]);
      setShowPatientDropdown(false);
    }
  };

  const selectPatient = (patient) => {
    setFormData((prev) => ({
      ...prev,
      patient_id: patient.patient_id,
      patient_name: patient.name,
      phone_number: patient.phone,
      uid_no: patient.Uid_no,
    }));
    setShowPatientDropdown(false);
  };

  const handlePatientBlur = () => {
    setTimeout(() => {
      setShowPatientDropdown(false);
    }, 200);
  };

  const handleDynamicRowChange = (index, field, value) => {
    const updatedRows = formData.dynamicRows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row,
    );
    const newSubTotal = updatedRows.reduce(
      (total, row) => total + (parseFloat(row.value) || 0),
      0,
    );

    const updatedFormData = {
      ...formData,
      dynamicRows: updatedRows,
      Sub_Total: Math.round(newSubTotal).toString(),
    };
    updatedFormData.payableAmount = calculatePayableAmount(updatedFormData);
    setFormData(updatedFormData);
  };

  const addDynamicRow = () => {
    setFormData({
      ...formData,
      dynamicRows: [...formData.dynamicRows, { label: "", value: "" }],
    });
  };

  const deleteDynamicRow = (index) => {
    if (formData.dynamicRows.length <= 1) return;

    const updatedRows = formData.dynamicRows.filter((_, i) => i !== index);
    const newSubTotal = updatedRows.reduce(
      (total, row) => total + (parseFloat(row.value) || 0),
      0,
    );

    const updatedFormData = {
      ...formData,
      dynamicRows: updatedRows,
      Sub_Total: Math.round(newSubTotal).toString(),
    };
    updatedFormData.payableAmount = calculatePayableAmount(updatedFormData);
    setFormData(updatedFormData);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  const getChargeBreakdown = () => {
    const subTotal = parseFloat(formData.Sub_Total || 0);
    let discount = 0;
    if (formData.bill_Type === "charity") {
      discount = parseFloat(formData.discountAmount || 0);
    } else if (formData.bill_method === "PDC") {
      discount = parseFloat(formData.pdc || 0);
    } else {
      discount = parseFloat(formData.discount || 0);
    }

    return {
      subTotal: subTotal.toFixed(2),
      discount: discount.toFixed(2),
      payableAmount: formData.payableAmount,
    };
  };

  const handleReset = () => {
    resetForm();
    Toast.fire({
      icon: "success",
      title: "Form reset successful",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (invoiceWarning) {
      Swal.fire({
        icon: "error",
        title: "Duplicate Invoice ID",
        text: invoiceWarning,
        confirmButtonColor: "#00acc1",
      });
      return;
    }

    console.log(formData);
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);

      const convertTo12Hour = (time24) => {
        if (!time24) return "";
        if (time24.includes("AM") || time24.includes("PM")) return time24;
        let [hours, minutes] = time24.split(":");
        let period = "AM";
        hours = parseInt(hours);
        if (hours === 0) {
          hours = 12;
        } else if (hours === 12) {
          period = "PM";
        } else if (hours > 12) {
          hours -= 12;
          period = "PM";
        }
        return `${hours.toString().padStart(2, "0")}:${minutes} ${period}`;
      };

      // Map bill_method and bill_Type to backend 'status' field for persistence
      let status = "NonInsurance";
      if (formData.bill_Type === "insurance") {
        // Normalize for legacy compatibility (e.g., 'cashless' -> 'Cashless')
        const method = formData.bill_method;
        if (method === "cashless") status = "Cashless";
        else if (method === "reimbursement") status = "Reimbursement";
        else if (method === "PDC") status = "PDC";
        else status = method || "NonInsurance";
      } else if (formData.bill_Type === "charity") {
        status = "Charity";
      }

      const finalPayload = {
        ...formData,
        status: status, // Map to the backend 'status' column
        admissiontime: convertTo12Hour(formData.admissiontime),
        dischargetime: convertTo12Hour(formData.dischargetime),
      };

      try {
        const response = await fetch(
          `${BASE_URL}/V1/invoice/addInvoice?location=${currentLocation}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(finalPayload),
          },
        );

        const data = await response.json();
        console.log(data);
        if (response.ok) {
          Swal.fire({
            title: "Success!",
            text: "Invoice added successfully!",
            icon: "success",
            timer: 2000,
            showConfirmButton: true,
            confirmButtonText: "Okay",
            confirmButtonColor: "#00acc1",
          }).then(() => {
            resetForm();
            navigate("/invoices");
          });
        } else {
          Swal.fire({
            title: "Ops...",
            text: data.message || "Error adding invoice.",
            icon: "error",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Network Error",
          text: "Please check your connection and try again.",
          icon: "warning",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // --- STYLING UPDATES FOR MEDIUM-SMALL TEXT ---
  const sectionTitleStyle = {
    fontSize: "0.85rem", // Slightly smaller heading
    fontWeight: "700",
    color: "#00838f",
    paddingLeft: "5px",
    padding: "5px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const labelStyle = {
    fontSize: "12px", // Medium-small labels
    fontWeight: "600",
    color: "#555",
    marginBottom: "4px",
  };

  const inputStyle = {
    fontSize: "11px", // Medium-small input text
    border: "1px solid rgb(77, 208, 225)",
    padding: "6px 10px",
    borderRadius: "10px",
  };

  const cardStyle = {
    border: "none",
    borderRadius: "12px",
    paddingBottom: "10px",
    borderTop: "4px solid #00bcd4",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    marginBottom: "10px",
    marginTop: "5px",
    backgroundColor: "#fff",
  };

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        minHeight: "100vh",
        padding: "10px",
        fontFamily: "'Poppins', Arial, sans-serif",
      }}
    >
      <PageBreadcrumb pagename="Add New Invoice Form" />
      <NavbarIpdBills />
      <Container className="p-0">
        <Form onSubmit={handleSubmit}>
          <Card style={cardStyle}>
            <Card.Body className="p-4">
              <h5 style={sectionTitleStyle}>Patient & Admission Information</h5>
              <Row className="g-3">
                <Col md={2}>
                  <Form.Label style={labelStyle}>
                    Invoice Number <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    required
                    name="invoice_id"
                    value={formData.invoice_id}
                    onChange={handleInputChange}
                    isInvalid={errors.invoice_id || !!invoiceWarning}
                    placeholder="Enter Invoice Number"
                    style={{
                      ...inputStyle,
                      backgroundColor: "#fff",
                    }}
                  />
                  {invoiceWarning && (
                    <div
                      className="text-danger"
                      style={{
                        fontSize: "10px",
                        marginTop: "4px",
                        fontWeight: "600",
                      }}
                    >
                      {invoiceWarning}
                    </div>
                  )}
                </Col>
                <Col md={2}>
                  <Form.Label style={labelStyle}>Admission Number</Form.Label>
                  <Form.Control
                    name="admission_no"
                    style={inputStyle}
                    value={formData.admission_no}
                    onChange={handleInputChange}
                    isInvalid={errors.admission_no}
                    placeholder="Enter Admission Number"
                  />
                </Col>
                <Col md={3} className="position-relative">
                  <Form.Label style={labelStyle}>
                    Patient Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    required
                    name="patient_name"
                    style={inputStyle}
                    value={formData.patient_name}
                    onChange={(e) => handlePatientSearch(e.target.value)}
                    onBlur={handlePatientBlur}
                    isInvalid={errors.patient_id}
                    placeholder="Search Patient Name"
                    autoComplete="off"
                  />
                  {showPatientDropdown && patientResults.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: "15px",
                        right: "15px",
                        backgroundColor: "white",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        zIndex: 1000,
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      {patientResults.map((patient) => (
                        <div
                          key={patient.patient_id}
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            fontSize: "12px",
                            borderBottom: "1px solid #eee",
                          }}
                          onMouseDown={() => selectPatient(patient)}
                          className="patient-search-item"
                        >
                          <strong>{patient.name}</strong> - {patient.phone}
                        </div>
                      ))}
                    </div>
                  )}
                </Col>
                <Col md={2}>
                  <Form.Label style={labelStyle}>Contact Number</Form.Label>
                  <Form.Control
                    readOnly
                    style={{
                      ...inputStyle,
                      backgroundColor: "#e7ebebff",
                      cursor: "not-allowed",
                    }}
                    value={formData.phone_number}
                    placeholder="Enter Contact Number"
                  />
                </Col>
                <Col md={3}>
                  <Form.Label style={labelStyle}>UID Number</Form.Label>
                  <Form.Control
                    readOnly
                    style={{
                      ...inputStyle,
                      backgroundColor: "#e7ebebff",
                      cursor: "not-allowed",
                    }}
                    value={formData.uid_no}
                    placeholder="Enter UID Number"
                  />
                </Col>

                <Col md={2}>
                  <Form.Label style={labelStyle}>
                    Admission Date <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    required
                    type="date"
                    style={inputStyle}
                    name="admission_date"
                    value={formData.admission_date}
                    onChange={handleInputChange}
                    isInvalid={errors.admission_date}
                  />
                </Col>
                <Col md={2}>
                  <Form.Label style={labelStyle}>
                    Admission Time <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    required
                    size="sm"
                    style={{
                      borderRadius: "10px",
                      fontSize: "12px",
                      border: "1px solid #4dd0e1",
                    }}
                    value={formData.admissiontime}
                    name="admissiontime"
                    onChange={handleInputChange}
                  >
                    <option value="">Select Time</option>
                    {timeOptions.map((time) => {
                      const [hour, minute] = time.split(":");
                      const h = parseInt(hour);
                      const ampm = h >= 12 ? "PM" : "AM";
                      const displayHour = h % 12 || 12;
                      const displayTime = `${displayHour}:${minute} ${ampm}`;

                      return (
                        <option key={time} value={time}>
                          {displayTime}
                        </option>
                      );
                    })}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Label style={labelStyle}>
                    Discharge Date <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    required
                    type="date"
                    style={inputStyle}
                    name="discharge_date"
                    min={formData.admission_date}
                    value={formData.discharge_date}
                    onChange={handleInputChange}
                    isInvalid={errors.discharge_date}
                  />
                </Col>
                <Col md={2}>
                  <Form.Label style={labelStyle}>
                    Discharge Time <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    required
                    size="sm"
                    style={{
                      borderRadius: "10px",
                      fontSize: "12px",
                      border: "1px solid #4dd0e1",
                    }}
                    value={formData.dischargetime}
                    name="dischargetime"
                    onChange={handleInputChange}
                  >
                    <option value="">Select Time</option>
                    {timeOptions.map((time) => {
                      const [hour, minute] = time.split(":");
                      const h = parseInt(hour);
                      const ampm = h >= 12 ? "PM" : "AM";
                      const displayHour = h % 12 || 12;
                      const displayTime = `${displayHour}:${minute} ${ampm}`;

                      return (
                        <option key={time} value={time}>
                          {displayTime}
                        </option>
                      );
                    })}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label style={labelStyle}>
                    Bed Category <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    required
                    name="bed_category"
                    style={inputStyle}
                    placeholder="Enter Bed Category"
                    value={formData.bed_category}
                    onChange={handleInputChange}
                    isInvalid={errors.bed_category}
                  />
                </Col>
                <Col md={3}>
                  <Form.Label style={labelStyle}>
                    Consultant Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    required
                    style={inputStyle}
                    name="consultantName"
                    value={formData.consultantName}
                    onChange={handleInputChange}
                    isInvalid={errors.consultantName}
                  >
                    <option value="">SELECT CONSULTANT</option>
                    {consultants.map((c) => (
                      <option key={c.doctor_id} value={c.doctor_id}>
                        {c.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Label style={labelStyle}>Surgeon Name</Form.Label>
                  <Form.Select
                    style={inputStyle}
                    name="surgeonName"
                    value={formData.surgeonName}
                    onChange={handleInputChange}
                    isInvalid={errors.surgeonName}
                  >
                    <option value="">SELECT SURGEON</option>
                    {surgeons.map((surgeon) => (
                      <option key={surgeon.doctor_id} value={surgeon.doctor_id}>
                        {surgeon.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card style={cardStyle}>
            <Card.Body className="p-4">
              <h5 style={sectionTitleStyle}>Billing Particulars</h5>
              {formData.dynamicRows.map((row, index) => (
                <Row key={index} className="align-items-end mb-3">
                  <Col md={5}>
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "2px",
                      }}
                    >
                      Label Name
                    </Form.Label>
                    <Form.Control
                      style={inputStyle}
                      placeholder="e.g. Consultation Fees"
                      value={row.label}
                      onChange={(e) =>
                        handleDynamicRowChange(index, "label", e.target.value)
                      }
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "2px",
                      }}
                    >
                      Amount (₹)
                    </Form.Label>
                    <InputGroup size="sm" style={{ flexWrap: "nowrap" }}>
                      <InputGroup.Text
                        style={{
                          ...inputStyle,
                          borderRight: "none",
                          backgroundColor: "#f8f9fa",
                          borderTopRightRadius: 0,
                          borderBottomRightRadius: 0,
                          paddingRight: "5px",
                        }}
                      >
                        ₹
                      </InputGroup.Text>
                      <Form.Control
                        style={{
                          ...inputStyle,
                          borderLeft: "none",
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                          paddingLeft: "5px",
                        }}
                        type="number"
                        placeholder="e.g. 500"
                        value={row.value}
                        onChange={(e) =>
                          handleDynamicRowChange(index, "value", e.target.value)
                        }
                        onWheel={(e) => e.target.blur()}
                        onKeyDown={(e) =>
                          ["e", "E", "+", "-"].includes(e.key) &&
                          e.preventDefault()
                        }
                      />
                    </InputGroup>
                  </Col>
                  <Col md={3}>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        disabled={formData.dynamicRows.length <= 1}
                        onClick={() => deleteDynamicRow(index)}
                        style={{ fontSize: "12px" }}
                      >
                        - Delete Item
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={addDynamicRow}
                        style={{ fontSize: "12px", fontWeight: "600" }}
                      >
                        + Add Item
                      </Button>
                    </div>
                  </Col>
                </Row>
              ))}
            </Card.Body>
          </Card>

          <Card style={cardStyle}>
            <Card.Body className="p-4">
              <h5 style={sectionTitleStyle}>Payment Details & Config</h5>
              <Row className="g-3">
                <Col md={2}>
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "2px",
                    }}
                  >
                    Bill Type <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    required
                    style={inputStyle}
                    name="bill_Type"
                    value={formData.bill_Type}
                    onChange={handleInputChange}
                    isInvalid={errors.bill_Type}
                  >
                    <option value="">SELECT</option>
                    <option value="insurance">Insurance</option>
                    <option value="non_insurance">Non-Insurance</option>
                    <option value="charity">Charity</option>
                  </Form.Select>
                </Col>

                {formData.bill_Type === "insurance" && (
                  <>
                    <Col md={3}>
                      <Form.Label
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          marginBottom: "2px",
                        }}
                      >
                        Insurance Company
                      </Form.Label>
                      <Form.Select
                        style={inputStyle}
                        name="insurance"
                        value={formData.insurance}
                        onChange={handleInputChange}
                      >
                        <option value="">SELECT COMPANY</option>
                        {insurance.map((i) => (
                          <option key={i.comapny_id} value={i.comapny_id}>
                            {i.companyname}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={5}>
                      <Form.Label
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          marginBottom: "2px",
                        }}
                      >
                        TPA
                      </Form.Label>
                      <Form.Select
                        style={inputStyle}
                        name="tpa"
                        value={formData.tpa}
                        onChange={handleInputChange}
                      >
                        <option value="">SELECT</option>
                        {tpa.map((t) => (
                          <option key={t.comapny_id} value={t.comapny_id}>
                            {t.companyname}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={2}>
                      <Form.Label
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          marginBottom: "2px",
                        }}
                      >
                        Bill Method
                      </Form.Label>
                      <Form.Select
                        style={inputStyle}
                        name="bill_method"
                        value={formData.bill_method}
                        onChange={handleInputChange}
                      >
                        <option value="">SELECT METHOD</option>
                        <option value="cashless">Cashless</option>
                        <option value="PDC">PDC</option>
                        <option value="reimbursement">Reimbursement</option>
                      </Form.Select>
                    </Col>
                  </>
                )}

                {formData.bill_method === "PDC" && (
                  <React.Fragment key="pdc-fields">
                    <Col md={3}>
                      <Form.Label
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          marginBottom: "2px",
                        }}
                      >
                        Cheque No
                      </Form.Label>
                      <Form.Control
                        style={inputStyle}
                        onWheel={(e) => e.target.blur()}
                        onKeyDown={(e) =>
                          ["e", "E", "+", "-"].includes(e.key) &&
                          e.preventDefault()
                        }
                        placeholder="Enter cheque No"
                        type="number"
                        name="chequeno"
                        value={formData.chequeno}
                        onChange={handleInputChange}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Label
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          marginBottom: "2px",
                        }}
                      >
                        PDC Amount (₹)
                      </Form.Label>
                      <InputGroup size="sm" style={{ flexWrap: "nowrap" }}>
                        <InputGroup.Text
                          style={{
                            ...inputStyle,
                            borderRight: "none",
                            backgroundColor: "#f8f9fa",
                            borderTopRightRadius: 0,
                            borderBottomRightRadius: 0,
                            paddingRight: "5px",
                          }}
                        >
                          ₹
                        </InputGroup.Text>
                        <Form.Control
                          style={{
                            ...inputStyle,
                            borderLeft: "none",
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                            paddingLeft: "5px",
                          }}
                          onWheel={(e) => e.target.blur()}
                          onKeyDown={(e) =>
                            ["e", "E", "+", "-"].includes(e.key) &&
                            e.preventDefault()
                          }
                          placeholder="Enter PDC Amount"
                          type="number"
                          name="pdc"
                          value={formData.pdc}
                          onChange={handleInputChange}
                        />
                      </InputGroup>
                    </Col>
                  </React.Fragment>
                )}

                {formData.bill_Type === "non_insurance" && (
                  <Col md={4} key="discount-non-insurance">
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "2px",
                      }}
                    >
                      Discount Amount (₹)
                    </Form.Label>
                    <InputGroup size="sm" style={{ flexWrap: "nowrap" }}>
                      <InputGroup.Text
                        style={{
                          ...inputStyle,
                          borderRight: "none",
                          backgroundColor: "#f8f9fa",
                          borderTopRightRadius: 0,
                          borderBottomRightRadius: 0,
                          paddingRight: "5px",
                        }}
                      >
                        ₹
                      </InputGroup.Text>
                      <Form.Control
                        style={{
                          ...inputStyle,
                          borderLeft: "none",
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                          paddingLeft: "5px",
                        }}
                        onWheel={(e) => e.target.blur()}
                        onKeyDown={(e) =>
                          ["e", "E", "+", "-"].includes(e.key) &&
                          e.preventDefault()
                        }
                        placeholder="e.g. 1000"
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleInputChange}
                      />
                    </InputGroup>
                  </Col>
                )}

                {formData.bill_Type === "charity" && (
                  <Col md={4} key="discount-charity">
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "2px",
                      }}
                    >
                      Discount Amount (₹)
                    </Form.Label>
                    <InputGroup size="sm" style={{ flexWrap: "nowrap" }}>
                      <InputGroup.Text
                        style={{
                          ...inputStyle,
                          borderRight: "none",
                          backgroundColor: "#f8f9fa",
                          borderTopRightRadius: 0,
                          borderBottomRightRadius: 0,
                          paddingRight: "5px",
                        }}
                      >
                        ₹
                      </InputGroup.Text>
                      <Form.Control
                        style={{
                          ...inputStyle,
                          borderLeft: "none",
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                          paddingLeft: "5px",
                        }}
                        onWheel={(e) => e.target.blur()}
                        onKeyDown={(e) =>
                          ["e", "E", "+", "-"].includes(e.key) &&
                          e.preventDefault()
                        }
                        placeholder="e.g. 100"
                        type="number"
                        name="discountAmount"
                        value={formData.discountAmount}
                        onChange={handleInputChange}
                      />
                    </InputGroup>
                  </Col>
                )}

                <Col md={6}>
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "2px",
                    }}
                  >
                    Note
                  </Form.Label>
                  <Form.Control
                    style={inputStyle}
                    as="textarea"
                    placeholder="Enter clinical note..."
                    rows={2}
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                  />
                </Col>
              </Row>

              <div
                className="mt-4 p-3 mb-20"
                style={{
                  backgroundColor: "#e0f7fa",
                  borderRadius: "8px",
                  border: "1px dashed #00bcd4",
                }}
              >
                <Row>
                  <Col md={12} className="text-end ">
                    <div
                      className="mb-5"
                      style={{
                        borderBottom: "1px solid #b2ebf2",
                        paddingBottom: "10px",
                      }}
                    >
                      <h6
                        className="mb-5"
                        style={{
                          fontSize: "13px",
                          textAlign: "left",
                          color: "#00838f",
                          fontWeight: "bold",
                        }}
                      >
                        Charge Breakdown:
                      </h6>
                      {formData.dynamicRows.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            fontSize: "12.5px",
                            color: "#555",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>{item.label || `Item ${idx + 1}`} :</span>
                          <span>
                            ₹ {parseFloat(item.value || 0).toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        fontSize: "13.5px",
                      }}
                    >
                      <div>
                        Subtotal:{" "}
                        <strong>₹ {getChargeBreakdown().subTotal}</strong>
                      </div>
                      <div style={{ color: "#d32f2f" }}>
                        Discount:{" "}
                        <strong>- ₹ {getChargeBreakdown().discount}</strong>
                      </div>
                      <div
                        style={{
                          fontSize: "18px",
                          color: "#00838f",
                          fontWeight: "bold",
                          marginTop: "8px",
                          borderTop: "2px solid #00bcd4",
                          paddingTop: "5px",
                        }}
                      >
                        Total Payable: ₹ {getChargeBreakdown().payableAmount}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
              <div
                className="d-flex justify-content-end gap-2"
                style={{ margin: "5px" }}
              >
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  style={{
                    fontSize: "13px",
                    padding: "10px 25px",
                    borderRadius: "10px",
                    border: "none",
                  }}
                >
                  Reset Form
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  style={{
                    fontSize: "13px",
                    padding: "10px 35px",
                    borderRadius: "10px",
                    border: "none",
                  }}
                >
                  {loading ? "Adding..." : "Add Invoice"}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Form>
      </Container>
    </div>
  );
};

export default AddInvoice;
