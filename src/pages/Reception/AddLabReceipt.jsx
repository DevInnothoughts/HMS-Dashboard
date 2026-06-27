import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AppointmentNavbar from "../../components/Navbar/AppointmentNavbar";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import FeatherIcon from "feather-icons-react";
import Swal from "sweetalert2";
import moment from "moment";
import { decodeJwt } from "../../utils/decode-jwt";
import "../../styles/styles.css";

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

export default function AddLabReceipt() {
  const navigate = useNavigate();

  const [currentLocation, setCurrentLocation] = useState("default");
  const [formData, setFormData] = useState({
    patient_phone: "",
    patient_name: "",
    doctor_id: "",
    regComment: "",
    paymentMode: "",
    posTerminal: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);
  const [registeredPatient, setRegisteredPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [consultationTypesList, setConsultationTypesList] = useState([]);
  const [posTerminalList, setPosTerminalList] = useState([]);
  const [billingItems, setBillingItems] = useState([{ label: "", amount: "" }]);

  // Get location from JWT Token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  // Fetch dropdown lists
  const fetchDropdownData = useCallback(async () => {
    if (!currentLocation || currentLocation === "default") return;
    try {
      const endpoints = [
        `${BASE_URL}/V1/doctor/doctorDropdown?location=${currentLocation}`,
        `${BASE_URL}/V1/doctor/consultationDropdown?location=${currentLocation}`,
        `${BASE_URL}/V1/appointment/posTerminalDropdown?location=${currentLocation}`,
      ];

      const [doctorRes, consultationRes, posRes] = await Promise.all(
        endpoints.map((url) => fetch(url).then((res) => res.json()))
      );

      setDoctors(Array.isArray(doctorRes.data) ? doctorRes.data : []);
      setConsultationTypesList(
        Array.isArray(consultationRes.data) ? consultationRes.data : []
      );
      setPosTerminalList(Array.isArray(posRes.data) ? posRes.data : []);
    } catch (error) {
      console.error("Error fetching dropdowns:", error);
    }
  }, [currentLocation]);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  // Debounced search for registered patient by phone number
  useEffect(() => {
    const searchPatient = async () => {
      const phone = formData.patient_phone;
      if (!phone || phone.length !== 10 || !currentLocation || currentLocation === "default") {
        setRegisteredPatient(null);
        return;
      }
      setIsSearchingPatient(true);
      try {
        const response = await fetch(
          `${BASE_URL}/V1/patient/searchPatient?query=${encodeURIComponent(
            phone
          )}&location=${currentLocation}`
        );
        if (response.ok) {
          const resData = await response.json();
          const match = resData.data && resData.data.find((p) => p.phone === phone);
          if (match) {
            setRegisteredPatient(match);
            setFormData((prev) => ({
              ...prev,
              patient_name: match.name,
            }));
            Toast.fire({
              icon: "success",
              title: `Registered Patient Found: ${match.name}`,
            });
          } else {
            setRegisteredPatient(null);
          }
        }
      } catch (error) {
        console.error("Error searching patient:", error);
      } finally {
        setIsSearchingPatient(false);
      }
    };

    const delayDebounce = setTimeout(searchPatient, 600);
    return () => clearTimeout(delayDebounce);
  }, [formData.patient_phone, currentLocation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "paymentMode" && value === "Cash" ? { posTerminal: "OFFLINE" } : {}),
      ...(name === "paymentMode" && value !== "Cash" && prev.posTerminal === "OFFLINE" ? { posTerminal: "" } : {}),
    }));
  };

  const calculateTotals = () => {
    const subtotal = billingItems.reduce(
      (acc, curr) => acc + (parseFloat(curr.amount) || 0),
      0
    );
    return { subtotal, payable: subtotal };
  };

  const addBillingRow = () =>
    setBillingItems([...billingItems, { label: "", amount: "" }]);

  const removeBillingRow = (index) => {
    if (billingItems.length > 1) {
      const list = [...billingItems];
      list.splice(index, 1);
      setBillingItems(list);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.patient_phone || formData.patient_phone.length !== 10) {
      newErrors.patient_phone = "Valid 10-digit mobile number is required";
    }
    if (!formData.patient_name) {
      newErrors.patient_name = "Patient name is required";
    }
    if (!formData.doctor_id) {
      newErrors.doctor_id = "Consultant Doctor is required";
    }
    if (!formData.paymentMode) {
      newErrors.paymentMode = "Payment mode is required";
    }
    if (formData.paymentMode && formData.paymentMode !== "Cash" && !formData.posTerminal) {
      newErrors.posTerminal = "POS Terminal machine is required for card/UPI payments";
    }

    // Validate billing items
    const invalidItems = billingItems.some((item) => !item.label || !item.amount || parseFloat(item.amount) <= 0);
    if (invalidItems) {
      newErrors.billingItems = "Please select consultation type and enter valid amount for all rows";
    }

    return newErrors;
  };

  const handleReset = () => {
    setFormData({
      patient_phone: "",
      patient_name: "",
      doctor_id: "",
      regComment: "",
      paymentMode: "",
      posTerminal: "",
    });
    setBillingItems([{ label: "", amount: "" }]);
    setRegisteredPatient(null);
    setErrors({});
  };

  const cancelPayment = async (referenceId, originalPayload, apidata) => {
    try {
      const response = await fetch(
        `${BASE_URL}/V1/appointment/cancelPaymentStatus?location=${currentLocation}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference_id: referenceId,
            transaction_id: originalPayload.transaction_id,
            PosMachine: originalPayload.PosMachine,
            MachineType: originalPayload.MachineType,
            apidata: apidata,
          }),
        }
      );
      return await response.json();
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const showPaymentPendingPopup = (referenceId, originalPayload, apidata) => {
    Swal.fire({
      title: "Transaction in Progress",
      html: `
          <div style="padding: 10px;">
              <div class="spinner-border text-info mb-3" role="status"></div>
              <p><strong>Waiting for card swipe...</strong></p>
              <p class="text-muted small">Reference ID: ${referenceId}</p>
              <hr/>
              <p style="font-size: 13px;">Please check the POS terminal and click "Check Status" once the swipe is completed.</p>
          </div>
      `,
      icon: "info",
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonText: "Check Status",
      cancelButtonText: "Cancel Payment",
      confirmButtonColor: "#00bcd4",
      cancelButtonColor: "#cfd8dc",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await fetch(
            `${BASE_URL}/V1/appointment/checkPaymentStatus?location=${currentLocation}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                receiptData: originalPayload,
                reference_id: referenceId,
                transaction_id: originalPayload.transaction_id,
                PosMachine: originalPayload.PosMachine,
                MachineType: originalPayload.MachineType,
              }),
            }
          );

          const result = await response.json();
          if (response.ok && (result.success || result.statusCode === 201)) {
            return result;
          } else {
            Swal.showValidationMessage(
              result.message || "Swipe not detected yet"
            );
            return false;
          }
        } catch (error) {
          Swal.showValidationMessage(`Check failed: ${error.message}`);
        }
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value?.success) {
        Swal.fire({
          title: "Paid!",
          text: "Receipt Generated Successfully",
          icon: "success",
          timer: 2000,
        });
        navigate("/opd-receipt-list");
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        const confirmCancel = await Swal.fire({
          title: "Are you sure?",
          text: "This will stop the payment request on the machine.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, Cancel it!",
          cancelButtonText: "No, Wait",
        });

        if (confirmCancel.isConfirmed) {
          try {
            Swal.fire({
              title: "Cancelling...",
              allowOutsideClick: false,
              didOpen: () => Swal.showLoading(),
            });
            const cancelResult = await cancelPayment(
              referenceId,
              originalPayload,
              apidata
            );
            if (cancelResult?.success || cancelResult?.status) {
              await Swal.fire("Cancelled", "POS request stopped.", "success");
            } else {
              Swal.fire(
                "Error",
                cancelResult?.message ||
                "Remote cancel failed. Please cancel manually on machine.",
                "error"
              );
            }
          } catch (err) {
            Swal.fire("Error", "Server error during cancellation", "error");
          }
        } else {
          showPaymentPendingPopup(referenceId, originalPayload, apidata);
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      Toast.fire({
        icon: "warning",
        title: "Please fill all required fields correctly",
      });
      return;
    }

    setLoading(true);
    try {
      let patientId = registeredPatient ? registeredPatient.patient_id : null;

      // 1. Create Patient if new
      if (!patientId) {
        const patientPayload = {
          patientName: formData.patient_name,
          mobileNo: formData.patient_phone,
          date: moment().format("YYYY-MM-DD"),
          ConfirmPatient: 0,
          Uid_no: null,
          registration_id: 1,
        };

        const patientRes = await fetch(
          `${BASE_URL}/V1/patient/addPatient?location=${currentLocation}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patientPayload),
          }
        );

        if (!patientRes.ok) {
          throw new Error("Failed to register new patient");
        }

        const patientData = await patientRes.json();
        patientId = patientData.data?.insertId || patientData.data?.patient_id;
        if (!patientId) {
          throw new Error("Could not retrieve new Patient ID");
        }
      }

      // 2. Prepare receipt payload
      const { payable } = calculateTotals();
      const consultationData = billingItems
        .filter((item) => item.label)
        .map((item) => [item.label, parseFloat(item.amount) || 0]);

      const receiptPayload = {
        appointment_id: null, // Manual receipt has no appointment
        patient_id: patientId,
        doctor_id: formData.doctor_id,
        appointment_date: moment().format("DD-MM-YYYY"),
        consultations: consultationData,
        paymentmode: formData.paymentMode,
        regtype: null,
        expectedamt: payable,
        discountamt: 0,
        discountnote: "",
        comment: formData.regComment || "",
        PosMachine: formData.posTerminal || "OFFLINE",
        MachineType: "OPD",
      };

      const receiptRes = await fetch(
        `${BASE_URL}/V1/appointment/saveReceipt?location=${currentLocation}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(receiptPayload),
        }
      );

      const result = await receiptRes.json();

      if (result.statusCode === 201 || result.statusCode === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Receipt Generated Successfully",
          confirmButtonColor: "#00bcd4",
        });
        navigate("/opd-receipt-list", {
          state: { printReceiptId: result.data?.receipt_id },
        });
      } else if (
        result.statusCode === 202 &&
        (result.data?.result === "success" || result.data?.stat === "success")
      ) {
        showPaymentPendingPopup(
          result.data.transaction_id,
          receiptPayload,
          result.data
        );
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.message || "Failed to generate receipt",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to process transaction",
      });
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = {
    fontSize: "13px",
    fontWeight: "600",
    color: "#555",
    marginBottom: "5px",
    display: "block",
  };

  const inputStyle = {
    fontSize: "12px",
    borderRadius: "10px",
    border: "2px solid rgb(77, 208, 225)",
    padding: "5px 10px",
    textTransform: "none",
  };

  const { subtotal, payable } = calculateTotals();

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
      <PageBreadcrumb pagename="Add Lab Receipt" />
      <AppointmentNavbar pagename="Add Lab Receipt" />

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
                margin: "5px",
                marginTop: "-3px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#67c5cfff",
                  padding: "12px 20px",
                  borderBottom: "2px solid #1a5b61ff",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FeatherIcon
                  icon="plus-circle"
                  size="18"
                  style={{ color: "#1a5b61ff", marginRight: "10px" }}
                />
                <h4
                  className="m-0"
                  style={{
                    color: "#1a5b61ff",
                    fontWeight: "600",
                    fontSize: "1rem",
                  }}
                >
                  Generate Lab Receipt
                </h4>
              </div>

              <Card.Body style={{ padding: "10px" }}>
                <Form onSubmit={handleSubmit}>
                  {/* Patient Info Section */}
                  <h6
                    style={{
                      color: "#05acc3",
                      borderBottom: "1px solid #00bcd4",
                      paddingBottom: "5px",
                      marginBottom: "5px",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    Patient Information
                  </h6>
                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label style={labelStyle}>
                          Contact Number <span className="text-danger">*</span>
                          {isSearchingPatient && (
                            <Spinner
                              animation="border"
                              size="sm"
                              variant="info"
                              className="ms-2"
                              style={{ width: "12px", height: "12px" }}
                            />
                          )}
                        </Form.Label>
                        <Form.Control
                          required
                          type="tel"
                          name="patient_phone"
                          value={formData.patient_phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            if (val.length <= 10) {
                              setFormData((prev) => ({
                                ...prev,
                                patient_phone: val,
                              }));
                            }
                          }}
                          placeholder="Enter 10-Digit Mobile Number"
                          style={inputStyle}
                        />
                        {errors.patient_phone && (
                          <p className="text-danger mt-1" style={{ fontSize: "11px" }}>
                            {errors.patient_phone}
                          </p>
                        )}
                        {registeredPatient && (
                          <p className="text-success mt-1" style={{ fontSize: "11px", fontWeight: "600" }}>
                            ✓ Registered Patient Found: {registeredPatient.name}
                          </p>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label style={labelStyle}>
                          Patient Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          required
                          type="text"
                          name="patient_name"
                          value={formData.patient_name}
                          onChange={handleInputChange}
                          placeholder="Enter Patient Name"
                          style={inputStyle}
                          disabled={!!registeredPatient}
                        />
                        {errors.patient_name && (
                          <p className="text-danger mt-1" style={{ fontSize: "11px" }}>
                            {errors.patient_name}
                          </p>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Consultation Details */}
                  <h6
                    style={{
                      color: "#05acc3",
                      borderBottom: "1px solid #00bcd4",
                      paddingBottom: "5px",
                      marginTop: "20px",
                      marginBottom: "5px",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    Consultation & Doctor
                  </h6>
                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label style={labelStyle}>
                          Consultant Doctor <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          required
                          name="doctor_id"
                          value={formData.doctor_id}
                          onChange={handleInputChange}
                          style={inputStyle}
                        >
                          <option value="">Select Doctor</option>
                          {doctors.map((doc) => (
                            <option key={doc.doctor_id} value={doc.doctor_id}>
                              {doc.name}
                            </option>
                          ))}
                        </Form.Select>
                        {errors.doctor_id && (
                          <p className="text-danger mt-1" style={{ fontSize: "11px" }}>
                            {errors.doctor_id}
                          </p>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label style={labelStyle}>Comment</Form.Label>
                        <Form.Control
                          as="textarea"
                          name="regComment"
                          rows={1}
                          value={formData.regComment}
                          onChange={handleInputChange}
                          placeholder="Enter Comments/Remarks..."
                          style={inputStyle}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Billing Details */}
                  <h6
                    style={{
                      color: "#05acc3",
                      borderBottom: "1px solid #00bcd4",
                      paddingBottom: "5px",
                      marginBottom: "5px",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    Billing Particulars
                  </h6>
                  {billingItems.map((item, index) => (
                    <Row key={index} className="g-3 mb-2 align-items-end">
                      <Col md={5}>
                        <Form.Label style={{ fontSize: "12px", fontWeight: "600" }}>
                          Consultation Type <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          style={{
                            fontSize: "12px",
                            border: "2px solid rgb(77, 208, 225)",
                            borderRadius: "10px",
                          }}
                          value={item.label}
                          onChange={(e) => {
                            const newItems = [...billingItems];
                            newItems[index].label = e.target.value;
                            setBillingItems(newItems);
                          }}
                        >
                          <option value="">Select Type</option>
                          {consultationTypesList.map((c) => (
                            <option key={c.consultation_id} value={c.consultation_name}>
                              {c.consultation_name}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>

                      <Col md={3}>
                        <Form.Label style={{ fontSize: "12px", fontWeight: "600" }}>
                          Amount <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text
                            style={{
                              fontSize: "11px",
                              border: "2px solid rgb(77, 208, 225)",
                              borderRight: "none",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "10px 0 0 10px",
                              padding: "0.375rem 0.5rem",
                            }}
                          >
                            ₹
                          </InputGroup.Text>
                          <Form.Control
                            type="number"
                            placeholder="E.g. 500"
                            style={{
                              fontSize: "11px",
                              border: "2px solid rgb(77, 208, 225)",
                              borderLeft: "none",
                              borderRadius: "0 10px 10px 0",
                            }}
                            value={item.amount}
                            onWheel={(e) => e.target.blur()}
                            onKeyDown={(e) => {
                              if (["e", "E", "+", "-", "."].includes(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            onChange={(e) => {
                              const newItems = [...billingItems];
                              newItems[index].amount = e.target.value;
                              setBillingItems(newItems);
                            }}
                          />
                        </InputGroup>
                      </Col>

                      <Col md={4} className="d-flex align-items-center">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeBillingRow(index)}
                          style={{
                            borderRadius: "8px",
                            padding: "10px 12px",
                            fontSize: "12px",
                            marginRight: "10px",
                          }}
                          disabled={billingItems.length <= 1}
                        >
                          - Delete
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={addBillingRow}
                          style={{
                            borderRadius: "8px",
                            padding: "10px 12px",
                            fontSize: "12px",
                          }}
                        >
                          + Add Row
                        </Button>
                      </Col>
                    </Row>
                  ))}
                  {errors.billingItems && (
                    <p className="text-danger mt-1" style={{ fontSize: "11px" }}>
                      {errors.billingItems}
                    </p>
                  )}

                  {/* Payment Details */}
                  <h6
                    style={{
                      color: "#05acc3",
                      borderBottom: "1px solid #00bcd4",
                      paddingBottom: "5px",
                      marginTop: "20px",
                      marginBottom: "5px",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    Payment Details
                  </h6>
                  <Row className="g-3 mb-3">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label style={labelStyle}>
                          Payment Mode <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          required
                          name="paymentMode"
                          value={formData.paymentMode}
                          onChange={handleInputChange}
                          style={inputStyle}
                        >
                          <option value="">Select Mode</option>
                          <option value="Cash">Cash</option>
                          <option value="Card">Card</option>
                          <option value="UPI">UPI</option>
                        </Form.Select>
                        {errors.paymentMode && (
                          <p className="text-danger mt-1" style={{ fontSize: "11px" }}>
                            {errors.paymentMode}
                          </p>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* POS Terminal radio box (visible if Card/UPI selected) */}
                  {formData.paymentMode && formData.paymentMode !== "Cash" && (
                    <Row className="g-3 mb-4">
                      <Col>
                        <Form.Label style={labelStyle}>
                          POS Terminal machine <span className="text-danger">*</span>
                        </Form.Label>
                        <div
                          className="p-3"
                          style={{
                            backgroundColor: "#94e2eeff",
                            borderRadius: "10px",
                          }}
                        >
                          {[...new Set([...posTerminalList, "OFFLINE"])].map((opt) => (
                            <Form.Check
                              required
                              inline
                              key={opt}
                              label={opt}
                              name="posTerminal"
                              type="radio"
                              id={`pos-${opt}`}
                              value={opt}
                              checked={formData.posTerminal === opt}
                              onChange={handleInputChange}
                              style={{ fontSize: "12px", margin: "5px" }}
                            />
                          ))}
                        </div>
                        {errors.posTerminal && (
                          <p className="text-danger mt-1" style={{ fontSize: "11px" }}>
                            {errors.posTerminal}
                          </p>
                        )}
                      </Col>
                    </Row>
                  )}

                  {/* Summary / Total details */}
                  <div
                    className="p-3 mb-4"
                    style={{
                      backgroundColor: "#e0f7fa",
                      borderRadius: "8px",
                      border: "1px dashed #00bcd4",
                    }}
                  >
                    <Row className="text-end font-weight-bold">
                      <Col>
                        <h5 className="m-0" style={{ color: "#00838f", fontWeight: "700" }}>
                          Total Net Amount: ₹ {payable.toFixed(2)}
                        </h5>
                      </Col>
                    </Row>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-end align-items-center">
                    <Button
                      style={{
                        borderRadius: "10px",
                        fontSize: "13px",
                        padding: "8px 25px",
                        marginTop: "10px",

                      }}
                      variant="secondary"
                      className="me-2"
                      onClick={handleReset}
                    >
                      Reset Form
                    </Button>
                    <Button
                      type="submit"
                      style={{
                        borderRadius: "10px",
                        backgroundColor: "#00bcd4",
                        border: "none",
                        fontSize: "13px",
                        padding: "8px 30px",
                        marginTop: "10px",
                      }}
                      disabled={loading}
                    >
                      {loading ? "Please wait..." : "Generate Receipt"}
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
