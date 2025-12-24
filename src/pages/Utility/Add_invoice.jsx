import React, { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { Row, Col, Form, Container, Card, Button } from "react-bootstrap";
import { decodeJwt } from "../../utils/decode-jwt";
import Swal from 'sweetalert2';

const BASE_URL = "http://localhost:5100/api";

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

const AddInvoice = () => {
  const initialFormData = {
    invoice_id: "",
    admission_no: "",
    patient_id: "",
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
  
  // --- Effect to determine current location ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        const payload = decodeJwt(token);
        if (payload && payload.jobLocation) {
            // console.log("PAYLOAD LOC: ", payload.jobLocation);
            setCurrentLocation(payload.jobLocation);
        }
    }
  }, []);

  useEffect(() => {
    if (!currentLocation) return;
  
    const fetchDropdowns = async () => {
      try {
        const [cRes, sRes, iRes, tRes] = await Promise.all([
          fetch(`${BASE_URL}/V1/invoice/consultant_dropdown?location=${currentLocation}`),
          fetch(`${BASE_URL}/V1/invoice/surgeon_dropdown?location=${currentLocation}`),
          fetch(`${BASE_URL}/V1/invoice/insurance_co_dropdown?location=${currentLocation}`),
          fetch(`${BASE_URL}/V1/invoice/tpa_dropdown?location=${currentLocation}`)
        ]);
  
        const [c, s, i, t] = await Promise.all([
          cRes.json(), sRes.json(), iRes.json(), tRes.json()
        ]);
  
        if (cRes.ok) setConsultants(c.data ?? []);
        if (sRes.ok) setSurgeons(s.data ?? []);
        if (iRes.ok) setInsurance(i.data ?? []);
        if (tRes.ok) setTpa(t.data ?? []);
      } catch (err) {
        console.error("Dropdown fetch failed:", err);
      }
    };
  
    fetchDropdowns();
  }, [currentLocation]);
  

  // Validate form
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
      "note",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${field.replace(/([A-Z])/g, " $1")} is required.`; // Fix the error message
      }
    });

    return newErrors;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
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

    if (["discount", "pdc", "discountAmount", "Sub_Total", "bill_Type", "bill_method"].includes(name)) {
      const subTotal = parseFloat(updatedFormData.Sub_Total || 0);
      const discount = parseFloat(updatedFormData.discount || 0);
      const discountAmount = parseFloat(updatedFormData.discountAmount || 0);
      const pdc = parseFloat(updatedFormData.pdc || 0);

      let payable = subTotal;
      if (updatedFormData.bill_Type === "charity") {
        payable = subTotal - discountAmount;
      } else if (updatedFormData.bill_method === "PDC") {
        payable = subTotal - pdc;
      } else if (updatedFormData.bill_Type === "non_insurance") {
        payable = subTotal - discount;
      } else {
        payable = subTotal;
      }
      updatedFormData.payableAmount = Math.max(payable, 0).toFixed(2);
    }

    setFormData(updatedFormData);
  };

  const handleDynamicRowChange = (index, field, value) => {
    const updatedRows = formData.dynamicRows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    const newSubTotal = updatedRows.reduce((total, row) => total + (parseFloat(row.value) || 0), 0);

    setFormData({
      ...formData,
      dynamicRows: updatedRows,
      Sub_Total: newSubTotal.toFixed(2),
      payableAmount: newSubTotal.toFixed(2)
    });
  };


  const addDynamicRow = () => {
    setFormData({
      ...formData,
      dynamicRows: [...formData.dynamicRows, { label: "", value: "" }],
    });
  };

  const deleteDynamicRow = (index) => {
    const updatedRows = formData.dynamicRows.filter((_, i) => i !== index);
    const newSubTotal = updatedRows.reduce((total, row) => total + (parseFloat(row.value) || 0), 0);
    setFormData({ ...formData, dynamicRows: updatedRows, Sub_Total: newSubTotal.toFixed(2) });
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  // Reset form
  const handleReset = () => {
    Swal.fire({
      title: 'Reset Invoice?',
      text: "All entered data will be cleared!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, reset'
    }).then((result) => {
      if (result.isConfirmed) {
        resetForm(); // Calls the helper
        Toast.fire({ icon: 'success', title: 'Form reset successful' });
      }
    });
  }; 

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);

      try {
        console.log(formData);
        const response = await fetch(`${BASE_URL}/V1/invoice/addInvoice?location=${currentLocation}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

       if (response.ok) {
      Swal.fire({
        title: "Success!",
        text: "Invoice added successfully!",
        icon: "success",
        timer: 2000, 
        showConfirmButton: true,     
        confirmButtonText: "Okay",   
        confirmButtonColor: "#00acc1"
      });
      resetForm();
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

const sectionTitleStyle = {
  fontSize: "1.1rem",
  fontWeight: "600",
  color: "#00838f",
  paddingLeft: "12px",
  padding: "10px",
  marginBottom: "5px"
};

const cardStyle = {
  border: "none",
  borderRadius: "12px",
  paddingBottom:"10px",
  borderTop: "4px solid #00bcd4",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  marginBottom: "25px",
  backgroundColor: "#fff"
};

return (
  <div className="themebody-wrap" style={{ background: "#f0f4f8", minHeight: "150vh", padding: "10px" }}>
    <Container>
      <PageBreadcrumb pagename="Add New Invoice Page" />

      <Form onSubmit={handleSubmit}>
        {/* SECTION 1: PATIENT DETAILS */}
        <Card style={cardStyle}>
          <Card.Body className="p-4">
            <h5 style={sectionTitleStyle}>Patient & Admission Information</h5>
            <Row className="g-3">
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Invoice No</Form.Label>
                <Form.Control name="invoice_id" value={formData.invoice_id} onChange={handleInputChange} isInvalid={errors.invoice_id} placeholder="Enter Invoice ID" />
                <Form.Control.Feedback type="invalid">{errors.invoice_id}</Form.Control.Feedback>
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Admission No</Form.Label>
                <Form.Control name="admission_no" value={formData.admission_no} onChange={handleInputChange} isInvalid={errors.admission_no} placeholder="Enter Admission No" />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Patient ID</Form.Label>
                <Form.Control name="patient_id" value={formData.patient_id} onChange={handleInputChange} isInvalid={errors.patient_id} placeholder="Enter Patient ID" />
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Admission Date</Form.Label>
                <Form.Control type="date" name="admission_date" value={formData.admission_date} onChange={handleInputChange} isInvalid={errors.admission_date} />
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Admission Time</Form.Label>
                <Form.Control type="time" name="admissiontime" value={formData.admissiontime} onChange={handleInputChange} isInvalid={errors.admissiontime} />
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Discharge Date</Form.Label>
                <Form.Control type="date" name="discharge_date" min={formData.admission_date} value={formData.discharge_date} onChange={handleInputChange} isInvalid={errors.discharge_date} />
              </Col>
              <Col md={3}>
                <Form.Label className="small fw-bold text-muted">Discharge Time</Form.Label>
                <Form.Control type="time" name="dischargetime" value={formData.dischargetime} onChange={handleInputChange} />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Bed Category</Form.Label>
                <Form.Control name="bed_category" placeholder="Enter Bed Category" value={formData.bed_category} onChange={handleInputChange} isInvalid={errors.bed_category} />
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Consultant Name</Form.Label>
                <Form.Select name="consultantName" value={formData.consultantName} onChange={handleInputChange} isInvalid={errors.consultantName}>
                  <option value="">SELECT CONSULTANT</option>
                  {consultants.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">Surgeon Name</Form.Label>
                <Form.Select name="surgeonName" value={formData.surgeonName} onChange={handleInputChange} isInvalid={errors.surgeonName}>
                  <option value="">SELECT SURGEON</option>
                  {surgeons.map((surgeon) => <option key={surgeon._id} value={surgeon.name}>{surgeon.name}</option>)}
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* SECTION 2: BILL LABELS */}
        <Card style={cardStyle}>
          <Card.Body className="p-4">
            <h5 style={sectionTitleStyle}>Billing Particulars</h5>

            {formData.dynamicRows.map((row, index) => (
              <Row key={index} className="mb-3 align-items-end">
                {/* Description Box - Increased width for better space */}
                <Col md={6}>
                  <Form.Label className="small fw-bold text-muted">Label Name</Form.Label>
                  <Form.Control
                    placeholder="e.g. Consultation Fees / Laboratory Charges"
                    value={row.label}
                    onChange={(e) => handleDynamicRowChange(index, "label", e.target.value)}
                  />
                </Col>

                {/* Amount Box */}
                <Col md={4}>
                  <Form.Label className="small fw-bold text-muted">Amount (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="e.g. 500"
                    value={row.value}
                    onChange={(e) => handleDynamicRowChange(index, "value", e.target.value)}
                  />
                </Col>

                {/* Delete Button - Only 1 button per row now */}
                <Col md={2}>
                  <Button
                    variant="outline-danger"
                    className="w-100"
                    style={{ whiteSpace: "nowrap" }}
                    onClick={() => deleteDynamicRow(index)}
                  >
                    - Delete
                  </Button>
                </Col>
              </Row>
            ))}

            {/* + Add Row Button - Placed BELOW the rows, centered and wide */}
            <Row className="justify-content-center mt-4">
              <Col md={4}>
                <Button
                  variant="outline-info"
                  className="w-200 py-10"
                  style={{
                    whiteSpace: "nowrap",
                    padding: "100px",
                    margin: "10px",
                    borderStyle: "dashed",
                    borderWidth: "2px",
                    fontWeight: "600"
                  }}
                  onClick={addDynamicRow}
                >
                  + Add New Billing Row
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* SECTION 3: BILLING CONFIG & PAYMENT */}
        <Card style={{ ...cardStyle, borderTop: "4px solid #00bcd4" }}>
          <Card.Body className="p-4">
            <h5 style={sectionTitleStyle}>Payment Details & Config</h5>
            <Row className="g-4">
              <Col md={2}>
                <Form.Label className="small fw-bold text-muted">Bill Type</Form.Label>
                <Form.Select name="bill_Type" value={formData.bill_Type} onChange={handleInputChange} isInvalid={errors.bill_Type}>
                  <option value="">SELECT BILL TYPE</option>
                  <option value="insurance">Insurance</option>
                  <option value="non_insurance">Non-Insurance</option>
                  <option value="charity">Charity</option>
                </Form.Select>
              </Col>

              {/* Show Insurance fields only if Insurance is selected */}
              {formData.bill_Type === "insurance" && (
                <>
                  <Col md={5}>
                    <Form.Label className="small fw-bold text-muted">Insurance Company</Form.Label>
                    <Form.Select name="insurance" value={formData.insurance} onChange={handleInputChange}>
                      <option value="">CHOOSE INSURANCE</option>
                      {insurance.map(i => <option key={i._id} value={i.companyname}>{i.companyname}</option>)}
                    </Form.Select>
                  </Col>
                  <Col md={5}>
                    <Form.Label className="small fw-bold text-muted">TPA</Form.Label>
                    <Form.Select name="tpa" value={formData.tpa} onChange={handleInputChange}>
                      <option value="">SELECT TPA</option>
                      {tpa.map(t => <option key={t._id} value={t.companyname}>{t.companyname}</option>)}
                    </Form.Select>
                  </Col>
                  <Col md={4}>
                    <Form.Label className="small fw-bold text-muted">Bill Method</Form.Label>
                    <Form.Select name="bill_method" value={formData.bill_method} onChange={handleInputChange}>
                      <option value="">SELECT BILL METHOD</option>
                      <option value="cashless">Cashless</option>
                      <option value="PDC">PDC</option>
                      <option value="reimbursement">Reimbursement</option>
                    </Form.Select>
                  </Col>
                </>
              )}

              {/* Logic for PDC visibility: Only if bill_method is exactly "PDC" */}
              {formData.bill_method === "PDC" && (
                <>
                  <Col md={4}>
                    <Form.Label className="small fw-bold text-muted">Cheque No</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter Cheque Number"
                      name="chequeno"
                      value={formData.chequeno}
                      onChange={handleInputChange}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label className="small fw-bold text-muted">PDC Amount</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="e.g. 100.00"
                      name="pdc"
                      value={formData.pdc}
                      onChange={handleInputChange}
                    />
                  </Col>
                </>
              )}

              {/* Other conditional fields remain as they were */}
              {formData.bill_Type === "non_insurance" && (
                <Col md={4}>
                  <Form.Label className="small fw-bold text-muted">Discount Amount</Form.Label>
                  <Form.Control type="number" name="discount" placeholder="e.g. 100.00" value={formData.discount} onChange={handleInputChange} />
                </Col>
              )}

              {formData.bill_Type === "charity" && (
                <Col md={4}>
                  <Form.Label className="small fw-bold text-muted">Charity Discount</Form.Label>
                  <Form.Control type="number" placeholder="e.g. 100.00" name="discountAmount" value={formData.discountAmount} onChange={handleInputChange} />
                </Col>
              )}

              <Col md={8}>
                <Form.Label className="small fw-bold text-muted">Note / Remarks</Form.Label>
                <Form.Control as="textarea" rows={2} name="note" placeholder="Enter a note" value={formData.note} onChange={handleInputChange} />
              </Col>
            </Row>

            {/* TRANSACTION SUMMARY - HIGHLIGHTED AT THE CORNER/BOTTOM */}
            <div className="mt-5 p-4" style={{ backgroundColor: "#f8f9fa", borderRadius: "10px", border: "1px dashed #cbd5e0" }}>
              <Row className="justify-content-center text-center">
                <Col md={4} className="border-end">
                  <span className="text-info d-block small fw-bold text-uppercase">Sub Total</span>
                  <h2 className="mb-0 fw-bold">₹ {formData.Sub_Total}</h2>
                </Col>
                <Col md={4}>
                  <span className="text-info d-block small fw-bold text-uppercase">Payable Amount</span>
                  <h2 className="mb-0 fw-bold" style={{ color: "#00838f" }}>₹ {formData.payableAmount}</h2>
                </Col>
              </Row>
            </div>
          </Card.Body>
        </Card>

        {/* ACTION BUTTONS */}
        <div className="d-flex justify-content-end gap-3 mb-5">
          <Button variant="outline-secondary" size="lg" onClick={handleReset} style={{ padding: "10px 40px" }}>Reset</Button>
          <Button variant="primary" size="lg" type="submit" disabled={loading} style={{ padding: "10px 50px", backgroundColor: "#00acc1", border: "none" }}>
            {loading ? "Submitting..." : "Submit Invoice"}
          </Button>
        </div>
      </Form>
    </Container>
  </div>
);
};

export default AddInvoice;