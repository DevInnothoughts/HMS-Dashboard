/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Card,
  Modal,
  Form,
} from "react-bootstrap";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import Swal from 'sweetalert2';
import { decodeJwt } from "../../utils/decode-jwt";
import { Link } from "react-router-dom";
import logo from "../../assets/images/3.png";
import { toast } from "react-hot-toast";
import { DataTable } from "primereact/datatable"; 
import { Column } from "primereact/column"; 
import { FilterMatchMode } from "primereact/api"; 
import FeatherIcon from "feather-icons-react"; 
import "../../styles/styles.css"; 

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

const BASE_URL = "http://localhost:5100/api";

const getDynamicRowsFromInvoice = (invoice) => {
  // console.log("SYNAMIC ROWS: ", invoice);

  const dynamicRows = [];
  let titleCalculatedTotal = 0;

  if (!invoice) return { dynamicRows: [], Sub_Total: "0.00" };

  if (invoice.title && typeof invoice.title === 'string') {
    // Split by comma to get ["hi: 100.00", " hihi2: 200.00", " hi3: 300.00"]
    const entries = invoice.title.split(',');

    entries.forEach(entry => {
      // Split each entry by colon
      const parts = entry.split(':');
      if (parts.length === 2) {
        const label = parts[0].trim();
        const valueStr = parts[1].trim();
        const value = parseFloat(valueStr) || 0;

        if (value > 0) {
          dynamicRows.push({
            label: label,
            value: value.toFixed(2),
            field: 'title_parsed'
          });
          titleCalculatedTotal += value;
        }
      }
    });
  }

  // Mapping DB amount fields to UI labels
  const itemMap = {
    'surgeon_amt': invoice.surgeon_desc || 'Surgeon Fee',
    'assistant_amt': invoice.assistant_desc || 'Assistant Fee',
    'anaesthetists_amt': invoice.anaesthetists_desc || 'Anaesthetist Fee',
    'bed_amt': invoice.bed_desc || 'Bed Charges',
    'medico_amt': 'Medication Charges',
    'medico_ot_amt': 'Medication OT Charges',
    'visit_amt': invoice.visit_desc || 'Doctor Visits',
    'lab_amt': 'Lab Charges',
    'procedures_amt': 'Other Procedures',
    'diet_amt': 'Diet Charges',
    'consumables_amt': 'Consumables',
    'miscellaneous_amt': 'Miscellaneous',
    'admin_amt': invoice.admin_desc || 'Admin Charges',
    'nurse_amt': invoice.nurse_desc || 'Nursing Charges',
    'colonoscopy_amt': 'Colonoscopy',
    'colonhydrotherapy_amt': 'Colon Hydrotherapy',
    'ot_amt': 'OT Charges',
  };


  // Use the totalamt field from the API as the definitive sub_total
  const Sub_Total = parseFloat(invoice.totalamt) || titleCalculatedTotal;

  return { dynamicRows, Sub_Total: Sub_Total.toFixed(2) };
};

const calculatePayableAmt = (invoice) => {
  const totalAmt = parseFloat(invoice.totalamt) || 0;
  const discount = parseFloat(invoice.discount) || 0;
  const pdc = parseFloat(invoice.pdc) || 0;
  const billMethod = invoice.bill_method || (invoice.chequeno !== 'NULL' && invoice.chequeno) ? 'PDC' : 'non_insurance';
  const billType = invoice.bill_Type || (invoice.insurancecompany ? 'insurance' : 'non_insurance');

  if (billMethod === "PDC") {
    return Math.max(0, totalAmt - pdc).toFixed(2);
  }

  if (billType === "non_insurance" || billType === "charity" || billMethod === "reimbursement") {
    return Math.max(0, totalAmt - discount).toFixed(2);
  }

  return (parseFloat(invoice.payable_amt) || Math.max(0, totalAmt - discount)).toFixed(2);
};

const formatDateForDisplay = (dateValue) => {
  if (!dateValue) return "N/A";
  try {
    return new Date(dateValue).toLocaleDateString('en-GB');
  } catch (e) {
    return String(dateValue).split('T')[0]; // Fallback for bad date format
  }
};
// --- END NEW HELPER FUNCTIONS ---


const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [surgeons, setSurgeons] = useState([]);
  const [insurance, setInsurance] = useState([]);
  const [tpa, setTpa] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [modalInvoiceData, setModalInvoiceData] = useState({
    dynamicRows: [],
    Sub_Total: "0.00",
    discount: "0.00",
    pdc: "0.00",
    payableAmount: "0.00",
  });
  const [filters1, setFilters1] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
  // Existing logic to decode JWT and set currentLocation
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = decodeJwt(token);
      if (payload?.jobLocation) setCurrentLocation(payload.jobLocation);
    }
  }, []);


  const [formData, setFormData] = useState({
    dynamicRows: [],
    Sub_Total: "0.00",
    discount: "0.00",
    pdc: "0.00",
    payableAmount: "0.00",
  });

  const initialFormData = { ...formData };

  // Fetch invoices on mount (MODIFIED)
  useEffect(() => {
    const fetchInvoices = async () => {
      if (!currentLocation) return;

      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${BASE_URL}/V1/invoice/listInvoice?location=${encodeURIComponent(currentLocation)}`
        );

        const data = await response.json();
        console.log(data);
        if (response.ok) {
          // CRITICAL FIX: The API returns a flat structure, calculate payable and due amounts here.
          const processedInvoices = (data.data[0] || []).map(invoice => ({
            ...invoice,
            totalamt: parseFloat(invoice.totalamt) || 0,
            discount: parseFloat(invoice.discount) || 0,
            advance_amt: parseFloat(invoice.advance_amt) || 0,
            receivedamt: parseFloat(invoice.receivedamt) || 0,
            payable_amt: calculatePayableAmt(invoice),
            due_amt: (parseFloat(invoice.totalamt) || 0) - (parseFloat(invoice.receivedamt) || 0),
            pay_mode: invoice.chequeno && invoice.chequeno !== 'NULL' ? 'PDC' : (invoice.insurancecompany ? 'INSURANCE' : 'CASH/CARD'),
            patient_name: invoice.patient_name || 'N/A', // Assuming patient name is embedded
            patient_phone: invoice.patient_phone || 'N/A', // Assuming phone is embedded
          }));

          setInvoices(processedInvoices || []);
        } else {
          // HIPAA: Generic error message
          console.error(data.message);
          throw new Error("Failed to fetch invoices.");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching invoices.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [currentLocation]);

  // Fetch dropdown data (MODIFIED)
  useEffect(() => {
    const fetchDropdowns = async () => {
      if (!currentLocation) return;

      try {
        const endpoints = [
          { url: "consultant_dropdown", setter: setConsultants },
          { url: "surgeon_dropdown", setter: setSurgeons },
          { url: "insurance_co_dropdown", setter: setInsurance },
          { url: "tpa_dropdown", setter: setTpa },
        ];

        for (const { url, setter } of endpoints) {
          const response = await fetch(
            `${BASE_URL}/V1/invoice/${url}?location=${encodeURIComponent(currentLocation)}`
          );

          const data = await response.json();
          if (response.ok) {
            setter(data.data || []);
          }
        }
      } catch (err) {
        console.error(err);
        // HIPAA: Generic error message
        setError("Failed to fetch dropdown data.");
      }
    };

    fetchDropdowns();
  }, [currentLocation]);

  // Update payable amount
  useEffect(() => {
    const subTotal = parseFloat(formData.Sub_Total || 0);
    const discount = parseFloat(formData.discount || 0);
    const pdc = parseFloat(formData.pdc || 0);

    let payableAmount =
      subTotal - (formData.bill_method === "PDC" ? pdc : discount);
    payableAmount = Math.max(payableAmount, 0).toFixed(2);

    setFormData((prevData) => ({
      ...prevData,
      payableAmount,
    }));
  }, [
    formData.Sub_Total,
    formData.discount,
    formData.pdc,
    formData.bill_method,
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // ... logic removed ...
  };

  const handleDynamicRowChange = (index, field, value) => {
    setModalInvoiceData(prevModalData => {
      const updatedRows = prevModalData.dynamicRows.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      );

      const newSubTotal = updatedRows.reduce(
        (total, row) => total + (parseFloat(row.value) || 0),
        0
      );

      const updatedModalData = {
        ...prevModalData,
        dynamicRows: updatedRows,
        Sub_Total: newSubTotal.toFixed(2),
      };

      // Re-calculate Payable Amt based on new Sub_Total
      const discount = parseFloat(updatedModalData.discount || 0);
      const pdc = parseFloat(updatedModalData.pdc || 0);

      let payable = newSubTotal - (updatedModalData.bill_method === "PDC" ? pdc : discount);
      updatedModalData.payableAmount = Math.max(0, payable).toFixed(2);


      // Also update selectedInvoice for API submission
      setSelectedInvoice(prevInvoice => ({
        ...prevInvoice,
        totalamt: newSubTotal.toFixed(2),
        payable_amt: updatedModalData.payableAmount,
      }));

      return updatedModalData;
    });
  };

  const handleDeleteInvoice = async (invoiceId) => {
    // Added safety confirmation
    const result = await Swal.fire({
      title: 'Delete Invoice?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${BASE_URL}/V1/invoice/delete/${invoiceId}?location=${currentLocation}`,
          { method: "DELETE" }
        );

        if (response.ok) {
          Toast.fire({
            icon: 'success',
            title: 'Invoice deleted successfully'
          });
          fetchInvoices();
        } else {
          Toast.fire({
            icon: 'error',
            title: 'Failed to delete invoice'
          });
        }
      } catch (error) {
        Toast.fire({
          icon: 'error',
          title: 'Network error occurred'
        });
      }
    }
  };

  const addDynamicRow = () => {
    setModalInvoiceData(prevModalData => ({
      ...prevModalData,
      dynamicRows: [...prevModalData.dynamicRows, { label: "", value: "", field: "" }],
    }));
  };

  const deleteDynamicRow = (index) => {
    setModalInvoiceData(prevModalData => {
      const updatedRows = prevModalData.dynamicRows.filter((_, i) => i !== index);

      const newSubTotal = updatedRows.reduce(
        (total, row) => total + (parseFloat(row.value) || 0),
        0
      );

      const updatedModalData = {
        ...prevModalData,
        dynamicRows: updatedRows,
        Sub_Total: newSubTotal.toFixed(2),
      };

      // Re-calculate Payable Amt
      const discount = parseFloat(updatedModalData.discount || 0);
      const pdc = parseFloat(updatedModalData.pdc || 0);
      let payable = newSubTotal - (updatedModalData.bill_method === "PDC" ? pdc : discount);
      updatedModalData.payableAmount = Math.max(0, payable).toFixed(2);

      // Also update selectedInvoice for API submission
      setSelectedInvoice(prevInvoice => ({
        ...prevInvoice,
        totalamt: newSubTotal.toFixed(2),
        payable_amt: updatedModalData.payableAmount,
      }));

      return updatedModalData;
    });
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setError("");
  };

  const handleEditInvoice = (invoice) => {
    // 1. Map flat DB structure back to UI dynamic rows
    const { dynamicRows, Sub_Total } = getDynamicRowsFromInvoice(invoice);

    // 2. Determine Payable amount for the modal display
    const payableAmount = calculatePayableAmt(invoice);

    // 3. Set the state for both the source invoice and the modal editable data
    setSelectedInvoice(invoice); // Source invoice used for general fields and PUT payload

    setModalInvoiceData({
      dynamicRows: dynamicRows,
      Sub_Total: Sub_Total,
      discount: invoice.discount || "0.00",
      pdc: parseFloat(invoice.pdc) || "0.00",
      payableAmount: payableAmount,
      bill_method: invoice.bill_method || 'non_insurance', // Infer or set default
      bill_Type: invoice.bill_Type || 'non_insurance', // Infer or set default
    });

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
    // Reset modalInvoiceData to initial state if needed
  };

  const handleSaveChanges = async () => {
    if (!selectedInvoice) return;

    if (!currentLocation) {
      // HIPAA: Generic error
      toast.error("Cannot save changes: Location data is missing.");
      return;
    }

    // 1. Prepare the final payload for the backend (combining flat invoice and dynamic row values)
    const payload = {
      ...selectedInvoice,
      ...modalInvoiceData, // Overwrite totals and discount/PDC fields
      location: currentLocation,
      totalamt: modalInvoiceData.Sub_Total,
      payable_amt: modalInvoiceData.payableAmount,
      discount: modalInvoiceData.discount,
      pdc: modalInvoiceData.pdc,

    };

    // HIPAA: Generalized logging
    console.log("Attempting to save invoice changes for ID:", selectedInvoice.invoice_id);

    try {
      const response = await fetch(
        `${BASE_URL}/V1/invoice/${selectedInvoice.invoice_id}?location=${currentLocation}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

           if (response.ok) {
        setInvoices((prevInvoices) =>
          prevInvoices.map((invoice) =>
            invoice.invoice_id === selectedInvoice.invoice_id
              ? { ...invoice, ...payload }
              : invoice
          )
        );
Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Invoice data has been updated successfully.',
          timer: 2000,
          showConfirmButton: false
        });
                handleCloseModal();
      } else {
Toast.fire({
          icon: 'error',
          title: 'Failed to update invoice'
        });
                console.error("Backend Error:", result.message);
      }
    } catch (err) {
Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while saving changes.'
      });
            console.error("Network Error:", err);
    }
  };

  const updatePayableAmt = (updatedInvoice) => {
    let payableAmt = updatedInvoice.Sub_Total;

    // If PDC is present, deduct it from the Sub_Total to get the payable amount
    if (updatedInvoice.bill_method === "PDC") {
      const pdcAmount = parseFloat(updatedInvoice.pdc) || 0;
      payableAmt = updatedInvoice.Sub_Total - pdcAmount;
    }

    // Update the payable amount in the invoice state
    updatedInvoice.payable_amt = payableAmt;
    setSelectedInvoice(updatedInvoice);
  };

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false);
  };

  const handlePrint = (invoice) => {
    console.log(invoice);
    // Logic for handlePrint remains largely the same, but using the flat keys
    if (!invoice || typeof invoice !== "object" || !invoice.invoice_id) {
Toast.fire({
      icon: 'info',
      title: 'Preparing invoice for print...',
      timer: 1500
    });
          return;
    }

    const { dynamicRows, Sub_Total } = getDynamicRowsFromInvoice(invoice);
    const printWindow = window.open("", "_blank", "width=900,height=900");
    const getBase64Image = (imgUrl) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.src = imgUrl;
      });
    };

    getBase64Image(logo).then((mainLogo) => {
      const printContent = `
    <html>
      <head>
        <title>Invoice - ${invoice.invoice_id}</title>
        <style>
          /* ... (CSS Styles remain unchanged) ... */
          body { font-family: Arial, sans-serif; font-size: 12px; margin: 30px; }
          .container { border: 1px solid #ccc; padding: 20px; border-radius: 10px; background: white; }
          .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 2px solid #2b9163; }
          .header img { width: 170px; }
          .clinic-info { text-align: right; font-size: 14px; font-weight: bold; }
          .title { text-align: center; font-size: 16px; font-weight: bold; margin-top: 10px; }
          .section-title { font-size: 14px; font-weight: bold; border-bottom: 1px solid #2b9163; margin-bottom: 5px; padding-bottom: 3px; color: #2b9163; }
          .details-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          .details-table td { padding: 6px; font-size: 12px; }
          .details-table td:first-child { font-weight: bold; width: 25%; }
          .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; border: 1px solid #000; }
          .summary-table th, .summary-table td { padding: 8px; border: 1px solid black; font-size: 12px; }
          .total-row { font-weight: bold; font-size: 14px; }
          .footer { text-align: center; font-size: 12px; color: grey; margin-top: 20px; }
          .btn-container { display: flex; justify-content: center; gap: 10px; margin-top: 20px; }
          .print-btn, .docuclip-btn { display: inline-block; padding: 10px 20px; font-size: 14px; font-weight: bold; border: none; border-radius: 5px; cursor: pointer; }
          .print-btn { 
            background-color: #2b9163;
            border: none;
            border-radius: 8px;
            padding: 8px 20px;
            font-size: 14px;
            font-weight: 500;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-top: 20px;
          }
            .print-btn:hover {
              background-color:rgb(35, 141, 93);
              transform: translateY(-1px);
              box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            }

          @media print { .btn-container { display: none; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${mainLogo}" alt="Healing Hands Clinic">
            <div class="clinic-info">
              Healing Hands Clinic <br>
              ${invoice.patient_location || 'N/A'}getDynamicRowsFromInvoice
            </div>
          </div>

          <table class="details-table">
            <tr><td>Bill No:</td><td>${invoice.invoice_id
        }</td><td>Bill Date:</td><td>${formatDateForDisplay(invoice.creation_date)}</td></tr>
            <tr><td>Patient Name:</td><td>${invoice.patient_name
        }</td><td>Gender / Age:</td><td>${invoice.gender || 'N/A'} / ${invoice.age || 'N/A'
        }</td></tr>
            <tr><td>Admission No:</td><td>${invoice.admission_no
        }</td><td>Bed Category:</td><td>${invoice.bed_desc || "N/A"
        }</td></tr>
            <tr><td>Doctor Name:</td><td>${invoice.consultant || 'N/A'
        }</td><td>Surgeon Name:</td><td>${invoice.prepared_doctor || 'N/A'}</td></tr>
            <tr><td>Admission Date & Time:</td><td>${formatDateForDisplay(invoice.creation_date)} ${invoice.admissiontime}</td>
            <td>Discharge Date & Time:</td><td>${formatDateForDisplay(invoice.due_date)} ${invoice.dischargetime}</td>
          </tr>
          </table>

          <div class="title">FINAL BILL</div>

          <div class="section-title">Itemized Details</div>
          <table class="summary-table">
            <tr><th>Items/Services</th><th>Amount (INR)</th></tr>
            ${dynamicRows
          .map(
            (row) => `<tr><td>${row.label}</td><td>${row.value}</td></tr>`
          )
          .join("")}
          </table>

          <div class="section-title">Account Summary</div>
          <table class="summary-table">
            <tr><th>Heading</th><th>Amount (INR)</th></tr>
            <tr><td>Total Charge (Gross)</td><td>${Sub_Total}</td></tr>
            <tr><td>Advance Paid</td><td>${invoice.advance_amt || "0.00"}</td></tr>
            <tr><td>Discount Applied</td><td>${invoice.discount || "0.00"}</td></tr>
            <tr class="total-row"><td>NET PAYABLE (Less Advance & Discount)</td><td>${invoice.payable_amt}</td></tr>
          </table>

          <div class="btn-container">
            <button variant="primary" class="print-btn" onclick="window.print()">Print</button>
          </div>

          <div class="footer">
            <hr>
            For queries call 7774099753 | For Emergency SMS 7774053187
            <br>
            &copy;2025 <a target="_blank" href="http://www.innothoughts.com/" style="color:grey;">Innothoughts System Pvt. Ltd</a>
          </div>
        </div>
      </body>
    </html>
    `;
      printWindow.document.write(printContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 1000);
    });
  };

  const renderHeader = () => (
    <div style={{
        border: "1px solid #4dd0e1",
        textAlign: "center",
        borderRadius: "8px",
        padding: "10px",
        backgroundColor: "#e0f7fa",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    }}>
        <div className="d-flex justify-content-between align-items-center">
            <span style={{ fontSize: "13px", fontWeight: "bold" }}>Search</span>
            <Form.Control
                type="search"
                value={filters1.global.value || ""}
                onChange={(e) => setFilters1({ global: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS } })}
                placeholder="Global Search"
                style={{ borderRadius: "6px", border: "1px solid #4dd0e1", width: "200px" }}
            />
        </div>
    </div>
);

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
    <PageBreadcrumb pagename="Invoice List" />
    <Container fluid >
      <Row>
        <Col>
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
              borderColor: "#00bcd4",
              background: "white",
              border: "1px solid #00bcd4",
              padding: "15px",
            }}
          >
            <Card.Body >
              <div className="d-flex justify-content-between mb-3">
                <h4>Invoice List</h4>
                <Link to="/invoice/add">
                  <Button variant="primary" style={{ marginBottom: "15px" }}>Add New Invoice</Button>
                </Link>
              </div>

              {loading && <p>Loading invoices...</p>}
              {error && <p style={{ color: "red" }}>{error}</p>}

              {!loading && !error && invoices.length > 0 && (
                <Table striped bordered hover responsive className="text-center" style={{ alignContent: "center" }}>
                  <thead>
                    <tr>
                      <th style={{ width: "100px", border: '1px solid #4dd0e1'  }}>Date</th>
                      <th style={{ width: "90px", border: '1px solid #4dd0e1' }}>Invoice ID</th>
                      <th style={{ width: "200px", border: '1px solid #4dd0e1'  }}>Patient Name</th>
                      <th style={{ width: "110px", border: '1px solid #4dd0e1'  }}>Phone No</th>
                      <th style={{ width: "110px", border: '1px solid #4dd0e1'  }}>Pay Mode</th>
                      <th style={{ width: "100px", border: '1px solid #4dd0e1'  }}>Due Amount</th>
                      <th style={{ width: "115px", border: '1px solid #4dd0e1'  }}>Payable Amount</th>
                      <th style={{ width: "100px", border: '1px solid #4dd0e1'  }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.invoice_id}>
                        <td style={{border: '1px solid #4dd0e1'}}>{formatDateForDisplay(invoice.creation_date)}</td>
                        <td style={{border: '1px solid #4dd0e1'}}>{invoice.invoice_id}</td>
                        <td style={{border: '1px solid #4dd0e1'}}>{invoice.patient_name}</td>
                        <td style={{border: '1px solid #4dd0e1'}}>{invoice.patient_phone}</td>
                        <td style={{border: '1px solid #4dd0e1'}}>{invoice.pay_mode}</td>
                        <td style={{border: '1px solid #4dd0e1'}}>{invoice.due_amt.toFixed(2)}</td>
                        <td style={{border: '1px solid #4dd0e1'}}>{invoice.payable_amt}</td>
                        <td style={{border: '1px solid #4dd0e1'}}>
                          <Link>
                            <Button
                              variant="warning"
                              className="invoicebtn"
                              onClick={() => handleEditInvoice(invoice)}
                            >
                             <FeatherIcon icon="edit" size="14" />
                            </Button>
                            <Button
                              variant="info"
                              className="invoicebtn"
                              onClick={() => handlePrint(invoice)}
                            >
                              <FeatherIcon icon="printer" size="14" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>

    <Modal show={showModal} onHide={handleCloseModal} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Invoice</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedInvoice && (
          <Form>
            <Row>
              <Col md={4} className="mb-3">
                <Form.Group controlId="invoiceId">
                  <Form.Label>Invoice ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedInvoice.invoice_id}
                    readOnly
                  />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group controlId="admission_no">
                  <Form.Label>Admission No</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedInvoice.admission_no}
                    // onChange={(e) =>
                    //   setSelectedInvoice({
                    //     ...selectedInvoice,
                    //     admission_no: e.target.value,
                    //   })
                    // }
                    readOnly
                  />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group controlId="patientName">
                  <Form.Label>Patient Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedInvoice.patient_name}
                    // onChange={(e) =>
                    //   setSelectedInvoice({
                    //     ...selectedInvoice,
                    //     patient_name: e.target.value,
                    //   })
                    // }
                    readOnly
                  />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group controlId="admission_date">
                  <Form.Label>Admission Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={selectedInvoice.creation_date}
                    onChange={(e) =>
                      setSelectedInvoice({
                        ...selectedInvoice,
                        creation_date: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group controlId="admissiontime">
                  <Form.Label>Admission Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={selectedInvoice.admissiontime}
                    onChange={(e) =>
                      setSelectedInvoice({
                        ...selectedInvoice,
                        admissiontime: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group controlId="bed_category">
                  <Form.Label>Bed Description</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedInvoice.bed_desc}
                    onChange={(e) =>
                      setSelectedInvoice({
                        ...selectedInvoice,
                        bed_desc: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group controlId="discharge_date">
                  <Form.Label>Discharge Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={selectedInvoice.due_date}
                    min={selectedInvoice.creation_date}
                    onChange={(e) =>
                      setSelectedInvoice({
                        ...selectedInvoice,
                        due_date: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group controlId="dischargetime">
                  <Form.Label>Discharge Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={selectedInvoice.dischargetime}
                    onChange={(e) =>
                      setSelectedInvoice({
                        ...selectedInvoice,
                        dischargetime: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group controlId="consultantName">
                  <Form.Label>Consultant Name</Form.Label>
                  <Form.Select
                    value={selectedInvoice?.consultant || ""}
                    onChange={(e) =>
                      setSelectedInvoice({
                        ...selectedInvoice,
                        consultant: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Consultant</option>
                    {consultants.map((consultant, index) => (
                      <option key={index} value={consultant.name}>
                        {consultant.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group controlId="surgeonName">
                  <Form.Label>Surgeon Name</Form.Label>
                  <Form.Select
                    value={selectedInvoice?.prepared_doctor || ""}
                    onChange={(e) =>
                      setSelectedInvoice({
                        ...selectedInvoice,
                        prepared_doctor: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Surgeon</option>
                    {surgeons.map((surgeon, index) => (
                      <option key={index} value={surgeon.name}>
                        {surgeon.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12} className="mb-4">
                <div>
                  <Form.Label>Itemized Bill</Form.Label>
                  {modalInvoiceData.dynamicRows.map((row, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      <Form.Control
                        type="text"
                        placeholder="Label (e.g., Surgeon Amount)"
                        value={row.label || ""}
                        onChange={(e) => {
                          handleDynamicRowChange(index, "label", e.target.value);
                        }}
                        style={{ width: "45%" }}
                      />

                      <Form.Control
                        type="number"
                        placeholder="Value (INR)"
                        value={row.value || ""}
                        onChange={(e) => {
                          handleDynamicRowChange(index, "value", e.target.value);
                        }}
                        style={{ width: "45%" }}
                      />

                      <button
                        type="button"
                        onClick={() => {
                          deleteDynamicRow(index);
                        }}
                        className="btn btn-danger"
                        style={{ width: "10%" }}
                      >
                        -
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addDynamicRow}
                    className="btn btn-success"
                    style={{ marginLeft: "10px", marginBottom: "15px" }}
                  >
                    + Add Row
                  </button>
                </div>
              </Col>

              <Col md={4} className="mb-3">
                <Form.Group controlId="Sub_Total">
                  <Form.Label>Sub Total (Gross)</Form.Label>
                  <Form.Control
                    type="number"
                    value={modalInvoiceData.Sub_Total}
                    readOnly
                    style={{ backgroundColor: '#eee' }}
                  />
                </Form.Group>
              </Col>

              <Col md={4} className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Label>Bill Type</Form.Label>
                  <Form.Select
                    id="bill_Type"
                    name="bill_Type"
                    value={selectedInvoice.bill_Type}
                    onChange={(e) => {
                      setSelectedInvoice({
                        ...selectedInvoice,
                        bill_Type: e.target.value,
                      });
                    }}
                  >
                    <option value="" disabled>Select Bill Type</option>
                    <option value="insurance">Insurance</option>
                    <option value="non_insurance">Non-Insurance</option>
                    <option value="charity">Charity</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {selectedInvoice.bill_Type === "insurance" && (
                <>
                  <Col md={4} className="mb-3">
                    <Form.Group controlId="insurance">
                      <Form.Label>Insurance Company</Form.Label>
                      <Form.Select
                        value={selectedInvoice?.insurancecompany || ""}
                        onChange={(e) => {
                          setSelectedInvoice({
                            ...selectedInvoice,
                            insurancecompany: e.target.value,
                          });
                        }}
                      >
                        <option value="">Select Insurance Company</option>
                        {insurance.map((company) => (
                          <option key={company.companyname} value={company.companyname}>
                            {company.companyname}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={4} className="mb-3">
                    <Form.Group controlId="tpa">
                      <Form.Label>TPA</Form.Label>
                      <Form.Select
                        value={selectedInvoice?.tpa || ""}
                        onChange={(e) => {
                          const updatedInvoice = { ...selectedInvoice };
                          updatedInvoice.tpa = e.target.value;
                          setSelectedInvoice(updatedInvoice);
                          updatePayableAmt(updatedInvoice);
                        }}
                      >
                        <option value="">Select TPA Company</option>
                        {[
                          ...new Set([
                            ...invoices.map((invoice) => invoice.tpa),
                            ...tpa.map((tpa) => tpa.companyname),
                          ]),
                        ].map((companyName, index) => (
                          <option key={index} value={companyName}>
                            {companyName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {selectedInvoice.insurance && (
                    <Col md={4} className="mb-3">
                      <Form.Group className="mb-3">
                        <Form.Label>Bill Method</Form.Label>
                        <Form.Select
                          value={selectedInvoice.bill_method}
                          onChange={(e) => {
                            const updatedInvoice = { ...selectedInvoice };
                            updatedInvoice.bill_method = e.target.value;
                            setSelectedInvoice(updatedInvoice);
                            updatePayableAmt(updatedInvoice);
                          }}
                          isInvalid={error.bill_method}
                        >
                          <option value="" disabled>
                            Select Bill Method
                          </option>
                          <option value="cashless">Cashless</option>
                          <option value="PDC">PDC</option>
                          <option value="reimbursement">Reimbursement</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {error.bill_method}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  )}

                  {selectedInvoice.bill_method === "PDC" && (
                    <>
                      <Col md={4} className="mb-3">
                        <Form.Group controlId="chequeno">
                          <Form.Label>Enter Cheque No</Form.Label>
                          <Form.Control
                            type="number"
                            value={selectedInvoice.chequeno}
                            onChange={(e) => {
                              const updatedInvoice = { ...selectedInvoice };
                              updatedInvoice.chequeno = e.target.value;
                              setSelectedInvoice(updatedInvoice);
                              updatePayableAmt(updatedInvoice);
                            }}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={4} className="mb-3">
                        <Form.Group controlId="pdc">
                          <Form.Label>Enter PDC Amount</Form.Label>
                          <Form.Control
                            type="number"
                            value={selectedInvoice.pdc}
                            onChange={(e) => {
                              const updatedInvoice = { ...selectedInvoice };
                              updatedInvoice.pdc = e.target.value;
                              setSelectedInvoice(updatedInvoice);
                              updatePayableAmt(updatedInvoice);
                            }}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={4} className="mb-3">
                        <Form.Group controlId="payable_amt">
                          <Form.Label>Payable Amount</Form.Label>
                          <Form.Control
                            type="number"
                            readOnly
                            value={selectedInvoice.payable_amt}
                          // onChange={(e) => {
                          //   const updatedInvoice = { ...selectedInvoice };
                          //   updatedInvoice.payable_amt = e.target.value;
                          //   setSelectedInvoice(updatedInvoice);
                          // }}
                          />
                        </Form.Group>
                      </Col>
                    </>
                  )}
                </>
              )}
              {(selectedInvoice.bill_Type === "non_insurance" ||
                selectedInvoice.bill_Type === "charity") && (
                  <>
                    {/* <Col md={4} className="mb-3">
                      <Form.Group controlId="discount">
                        <Form.Label>Discount Amount</Form.Label>
                        <Form.Control
                          type="number"
                          value={selectedInvoice.discount}
                          onChange={(e) => {
                            const discountAmount = parseFloat(e.target.value);
                            const updatedInvoice = {
                              ...selectedInvoice,
                              discount: discountAmount,
                            };
                            updatedInvoice.payable_amt =
                              updatedInvoice.Sub_Total - discountAmount;
                            setSelectedInvoice(updatedInvoice);
                          }}
                        />
                      </Form.Group>
                    </Col> */}
                    
                    <Col md={4} className="mb-3">
                      <Form.Group controlId="discount">
                        <Form.Label>Discount Amount</Form.Label>
                        <Form.Control
                          type="number"
                          value={selectedInvoice.discount}
                          onChange={(e) => {
                            const discountVal = parseFloat(e.target.value) || 0;
                            const currentSubTotal = parseFloat(modalInvoiceData.Sub_Total) || 0;
                            const newPayable = Math.max(0, currentSubTotal - discountVal).toFixed(2);
                            setModalInvoiceData(prev => ({
                              ...prev,
                              discount: discountVal,
                              payableAmount: newPayable
                            }));
                            setSelectedInvoice(prev => ({
                              ...prev,
                              discount: discountVal,
                              payable_amt: newPayable
                            }));
                          }}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4} className="mb-3">
                      <Form.Group controlId="payableAmount">
                        <Form.Label>Payable Amount</Form.Label>
                        <Form.Control
                          type="number"
                          readOnly
                          value={selectedInvoice.payable_amt}
                        />
                      </Form.Group>
                    </Col>
                  </>
                )}
              {selectedInvoice.bill_method === "reimbursement" && (
                <Col md={4} className="mb-3">
                  <Form.Group controlId="payableAmount">
                    <Form.Label>Payable Amount</Form.Label>
                    <Form.Control
                      type="number"
                      value={selectedInvoice.Sub_Total}
                      readOnly
                    // onChange={(e) =>
                    //   setSelectedInvoice({
                    //     ...selectedInvoice,
                    //     Sub_Total: e.target.value,
                    //   })
                    // }
                    />
                  </Form.Group>
                </Col>
              )}

              <Col md={4} className="mb-3">
                <Form.Group controlId="note">
                  <Form.Label>Note</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedInvoice.note}
                    onChange={(e) =>
                      setSelectedInvoice({
                        ...selectedInvoice,
                        note: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
            <Modal.Footer>
              <Button variant="primary" onClick={handleSaveChanges}>
                Save Changes
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Modal.Body>
    </Modal>
    <Modal show={showSuccessPopup} onHide={handleCloseSuccessPopup} centered>
      <Modal.Body className="text-center">
        <div className="mb-3">
          <i
            className="bi bi-check-circle"
            style={{ fontSize: "50px", color: "green" }}
          ></i>
        </div>
        <h4>Successfully</h4>
        <p>Data has been updated</p>
        <Button variant="primary" onClick={handleCloseSuccessPopup}>
          OK
        </Button>
      </Modal.Body>
    </Modal>
  </div>
);
};

export default InvoiceList;
