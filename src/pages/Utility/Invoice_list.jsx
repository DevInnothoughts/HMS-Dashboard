import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
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
import Swal from "sweetalert2";
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
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

const BASE_URL = "http://194.195.117.79:5100/api";

const getDynamicRowsFromInvoice = (invoice) => {
  const dynamicRows = [];
  let titleCalculatedTotal = 0;

  if (!invoice) return { dynamicRows: [], Sub_Total: "0.00" };

  if (invoice.title && typeof invoice.title === "string") {
    invoice.title.split(",").forEach((entry) => {
      const parts = entry.split(":");
      if (parts.length === 2) {
        const label = parts[0].trim();
        const value = parseFloat(parts[1].trim()) || 0;

        if (label !== "") {
          dynamicRows.push({
            label: label,
            value: value.toFixed(2),
            field: "title_parsed",
          });
          titleCalculatedTotal += value;
        }
      }
    });
  }

  const itemMap = {
    surgeon_amt: invoice.surgeon_desc || "Surgeon Fee",
    assistant_amt: invoice.assistant_desc || "Assistant Fee",
    anaesthetists_amt: invoice.anaesthetists_desc || "Anaesthetist Fee",
    bed_amt: invoice.bed_desc || "Bed Charges",
    medico_amt: "Medication Charges",
    medico_ot_amt: "Medication OT Charges",
    visit_amt: invoice.visit_desc || "Doctor Visits",
    lab_amt: "Lab Charges",
    procedures_amt: "Other Procedures",
    diet_amt: "Diet Charges",
    consumables_amt: "Consumables",
    miscellaneous_amt: "Miscellaneous",
    admin_amt: invoice.admin_desc || "Admin Charges",
    nurse_amt: invoice.nurse_desc || "Nursing Charges",
    colonoscopy_amt: "Colonoscopy",
    colonhydrotherapy_amt: "Colon Hydrotherapy",
    ot_amt: "OT Charges",
  };

  const Sub_Total =
    titleCalculatedTotal > 0
      ? titleCalculatedTotal
      : parseFloat(invoice.totalamt) || 0;
  return { dynamicRows, Sub_Total: Sub_Total.toFixed(2) };
};

const calculatePayableAmt = (invoice) => {
  const totalAmt = parseFloat(invoice.totalamt) || 0;
  const discount = parseFloat(invoice.discount) || 0;
  const pdc = parseFloat(invoice.pdc) || 0;
  const billMethod =
    invoice.bill_method || (invoice.chequeno !== "NULL" && invoice.chequeno)
      ? "PDC"
      : "non_insurance";
  const billType =
    invoice.bill_Type ||
    (invoice.insurancecompany ? "insurance" : "non_insurance");

  if (billMethod === "PDC") {
    return Math.max(0, totalAmt - pdc).toFixed(2);
  }

  if (
    billType === "non_insurance" ||
    billType === "charity" ||
    billMethod === "reimbursement"
  ) {
    return Math.max(0, totalAmt - discount).toFixed(2);
  }

  return (
    parseFloat(invoice.payable_amt) || Math.max(0, totalAmt - discount)
  ).toFixed(2);
};

const formatDateForDisplay = (dateValue) => {
  if (!dateValue) return "N/A";
  try {
    const date = new Date(dateValue);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (e) {
    const parts = String(dateValue).split("T")[0].split("-");
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return String(dateValue);
  }
};

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
  useEffect(() => {
    const token = localStorage.getItem("token");
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

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!currentLocation) return;

      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${BASE_URL}/V1/invoice/listInvoice?location=${encodeURIComponent(
            currentLocation
          )}`
        );

        const data = await response.json();
        console.log(data);
        if (response.ok) {
          const processedInvoices = (data.data[0] || []).map((invoice) => ({
            ...invoice,
            totalamt: parseFloat(invoice.totalamt) || 0,
            discount: parseFloat(invoice.discount) || 0,
            advance_amt: parseFloat(invoice.advance_amt) || 0,
            receivedamt: parseFloat(invoice.receivedamt) || 0,
            payable_amt: calculatePayableAmt(invoice),
            due_amt:
              (parseFloat(invoice.totalamt) || 0) -
              (parseFloat(invoice.receivedamt) || 0),
            pay_mode:
              invoice.chequeno && invoice.chequeno !== "NULL"
                ? "PDC"
                : invoice.insurancecompany
                ? "INSURANCE"
                : "CASH/CARD",
            patient_name: invoice.patient_name || "N/A",
            patient_phone: invoice.patient_phone || "N/A",
          }));

          setInvoices(processedInvoices || []);
        } else {
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
            `${BASE_URL}/V1/invoice/${url}?location=${encodeURIComponent(
              currentLocation
            )}`
          );

          const data = await response.json();
          if (response.ok) {
            setter(data.data || []);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch dropdown data.");
      }
    };

    fetchDropdowns();
  }, [currentLocation]);

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
  };

  const handleDynamicRowChange = (index, field, value) => {
    setModalInvoiceData((prevModalData) => {
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

      const discount = parseFloat(updatedModalData.discount || 0);
      const pdc = parseFloat(updatedModalData.pdc || 0);

      let payable =
        newSubTotal - (updatedModalData.bill_method === "PDC" ? pdc : discount);
      updatedModalData.payableAmount = Math.max(0, payable).toFixed(2);

      setSelectedInvoice((prevInvoice) => ({
        ...prevInvoice,
        totalamt: newSubTotal.toFixed(2),
        payable_amt: updatedModalData.payableAmount,
      }));

      return updatedModalData;
    });
  };

  const handleDeleteInvoice = async (invoiceId) => {
    const result = await Swal.fire({
      title: "Delete Invoice?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${BASE_URL}/V1/invoice/delete/${invoiceId}?location=${currentLocation}`,
          { method: "DELETE" }
        );

        if (response.ok) {
          Toast.fire({
            icon: "success",
            title: "Invoice deleted successfully",
          });
          fetchInvoices();
        } else {
          Toast.fire({
            icon: "error",
            title: "Failed to delete invoice",
          });
        }
      } catch (error) {
        Toast.fire({
          icon: "error",
          title: "Network error occurred",
        });
      }
    }
  };

  const addDynamicRow = () => {
    setModalInvoiceData((prevModalData) => ({
      ...prevModalData,
      dynamicRows: [
        ...prevModalData.dynamicRows,
        { label: "", value: "0.00", field: "title_parsed" },
      ],
    }));
  };

  const deleteDynamicRow = (index) => {
    setModalInvoiceData((prevModalData) => {
      const updatedRows = prevModalData.dynamicRows.filter(
        (_, i) => i !== index
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

      const discount = parseFloat(updatedModalData.discount || 0);
      const pdc = parseFloat(updatedModalData.pdc || 0);
      let payable =
        newSubTotal - (updatedModalData.bill_method === "PDC" ? pdc : discount);
      updatedModalData.payableAmount = Math.max(0, payable).toFixed(2);

      setSelectedInvoice((prevInvoice) => ({
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
    const { dynamicRows, Sub_Total } = getDynamicRowsFromInvoice(invoice);

    const displayRows =
      dynamicRows.length > 0
        ? dynamicRows
        : [{ label: "", value: "", field: "" }];

    const payableAmount = calculatePayableAmt(invoice);

    setSelectedInvoice(invoice);
    setModalInvoiceData({
      dynamicRows: displayRows,
      Sub_Total: Sub_Total,
      discount: invoice.discount || "0.00",
      pdc: parseFloat(invoice.pdc) || "0.00",
      payableAmount: payableAmount,
      bill_method: invoice.bill_method || "non_insurance",
      bill_Type: invoice.bill_Type || "non_insurance",
    });

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
  };

  const handleSaveChanges = async () => {
    if (!selectedInvoice) return;

    if (!currentLocation) {
      toast.error("Cannot save changes: Location data is missing.");
      return;
    }

    const titleString = modalInvoiceData.dynamicRows
      .filter((row) => row.label.trim() !== "") // Remove empty rows
      .map(
        (row) => `${row.label.trim()}: ${parseFloat(row.value || 0).toFixed(2)}`
      )
      .join(", ");

    const payload = {
      ...selectedInvoice,
      ...modalInvoiceData,
      title: titleString, // This is the crucial part for your backend
      location: currentLocation,
      totalamt: modalInvoiceData.Sub_Total,
      payable_amt: modalInvoiceData.payableAmount,
      discount: modalInvoiceData.discount,
      pdc: modalInvoiceData.pdc,
    };

    console.log(
      "Attempting to save invoice changes for ID:",
      selectedInvoice.invoice_id
    );

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
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.invoice_id === selectedInvoice.invoice_id
              ? { ...inv, title: titleString }
              : inv
          )
        );
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Invoice data has been updated successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        handleCloseModal();
      } else {
        Toast.fire({
          icon: "error",
          title: "Failed to update invoice",
        });
        console.error("Backend Error:", result.message);
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving changes.",
      });
      console.error("Network Error:", err);
    }
  };

  const updatePayableAmt = (updatedInvoice) => {
    let payableAmt = updatedInvoice.Sub_Total;

    if (updatedInvoice.bill_method === "PDC") {
      const pdcAmount = parseFloat(updatedInvoice.pdc) || 0;
      payableAmt = updatedInvoice.Sub_Total - pdcAmount;
    }

    updatedInvoice.payable_amt = payableAmt;
    setSelectedInvoice(updatedInvoice);
  };

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false);
  };

  const handlePrint = (invoice) => {
    console.log(invoice);
    if (!invoice || typeof invoice !== "object" || !invoice.invoice_id) {
      Toast.fire({
        icon: "info",
        title: "Preparing invoice for print...",
        timer: 1500,
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
              ${invoice.patient_location || "N/A"}getDynamicRowsFromInvoice
            </div>
          </div>

          <table class="details-table">
            <tr><td>Bill No:</td><td>${
              invoice.invoice_id
            }</td><td>Bill Date:</td><td>${formatDateForDisplay(
        invoice.creation_date
      )}</td></tr>
            <tr><td>Patient Name:</td><td>${
              invoice.patient_name
            }</td><td>Gender / Age:</td><td>${invoice.gender || "N/A"} / ${
        invoice.age || "N/A"
      }</td></tr>
            <tr><td>Admission No:</td><td>${
              invoice.admission_no
            }</td><td>Bed Category:</td><td>${
        invoice.bed_desc || "N/A"
      }</td></tr>
            <tr><td>Doctor Name:</td><td>${
              invoice.consultant || "N/A"
            }</td><td>Surgeon Name:</td><td>${
        invoice.prepared_doctor || "N/A"
      }</td></tr>
            <tr>
    <td>Admission Date & Time:</td><td>${formatDateForDisplay(
      invoice.creation_date
    )} ${invoice.admissiontime}</td>
    <td>Discharge Date & Time:</td><td>${formatDateForDisplay(
      invoice.due_date
    )} ${invoice.dischargetime}</td>
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
            <tr><td>Advance Paid</td><td>${
              invoice.advance_amt || "0.00"
            }</td></tr>
            <tr><td>Discount Applied</td><td>${
              invoice.discount || "0.00"
            }</td></tr>
            <tr class="total-row"><td>NET PAYABLE (Less Advance & Discount)</td><td>${
              invoice.payable_amt
            }</td></tr>
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
    <div
      style={{
        border: "1px solid #4dd0e1",
        textAlign: "center",
        borderRadius: "8px",
        padding: "10px",
        backgroundColor: "#e0f7fa",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div className="d-flex justify-content-between align-items-center">
        <span style={{ fontSize: "13px", fontWeight: "bold" }}>Search</span>
        <Form.Control
          type="search"
          value={filters1.global.value || ""}
          onChange={(e) =>
            setFilters1({
              global: {
                value: e.target.value,
                matchMode: FilterMatchMode.CONTAINS,
              },
            })
          }
          placeholder="Global Search"
          style={{
            borderRadius: "6px",
            border: "1px solid #4dd0e1",
            width: "200px",
          }}
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
      <Container fluid>
        <Row>
          <Col>
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                borderColor: "#00bcd4",
                background: "white",
                border: "1px solid #00bcd4",
                padding: "10px",
              }}
            >
              <Card.Body>
                <div className="d-flex justify-content-between mb-3">
                  <h4 style={{ padding: "5px" }}>Invoice List</h4>
                  <Link to="/invoice/add">
                    <Button variant="primary" style={{ marginBottom: "15px" }}>
                      <FaPlus /> Add New Invoice
                    </Button>
                  </Link>
                </div>

                {loading && <p>Loading invoices...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}

                {!loading && !error && invoices.length > 0 && (
                  <Table
                    striped
                    bordered
                    hover
                    responsive
                    className="text-center"
                    style={{ alignContent: "center" }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{ width: "50px", border: "1px solid #4dd0e1" }}
                        >
                          #
                        </th>
                        <th
                          style={{ width: "90px", border: "1px solid #4dd0e1" }}
                        >
                          Date
                        </th>
                        <th
                          style={{ width: "90px", border: "1px solid #4dd0e1" }}
                        >
                          Invoice ID
                        </th>
                        <th
                          style={{
                            width: "160px",
                            border: "1px solid #4dd0e1",
                          }}
                        >
                          Patient Name
                        </th>
                        <th
                          style={{
                            width: "110px",
                            border: "1px solid #4dd0e1",
                          }}
                        >
                          Phone No
                        </th>
                        <th
                          style={{
                            width: "110px",
                            border: "1px solid #4dd0e1",
                          }}
                        >
                          Pay Mode
                        </th>
                        <th
                          style={{
                            width: "100px",
                            border: "1px solid #4dd0e1",
                          }}
                        >
                          Due Amount
                        </th>
                        <th
                          style={{
                            width: "115px",
                            border: "1px solid #4dd0e1",
                          }}
                        >
                          Payable Amount
                        </th>
                        <th
                          style={{
                            width: "110px",
                            border: "1px solid #4dd0e1",
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice, index) => (
                        <tr key={invoice.invoice_id}>
                          <td style={{ border: "1px solid #4dd0e1" }}>
                            {index + 1}
                          </td>
                          <td style={{ border: "1px solid #4dd0e1" }}>
                            {formatDateForDisplay(invoice.creation_date)}
                          </td>
                          <td style={{ border: "1px solid #4dd0e1" }}>
                            {invoice.invoice_id}
                          </td>
                          <td style={{ border: "1px solid #4dd0e1" }}>
                            {invoice.patient_name}
                          </td>
                          <td style={{ border: "1px solid #4dd0e1" }}>
                            {invoice.patient_phone}
                          </td>
                          <td style={{ border: "1px solid #4dd0e1" }}>
                            {invoice.pay_mode}
                          </td>
                          <td style={{ border: "1px solid #4dd0e1" }}>
                            {invoice.due_amt.toFixed(2)}
                          </td>
                          <td style={{ border: "1px solid #4dd0e1" }}>
                            {invoice.payable_amt}
                          </td>
                          <td style={{ border: "1px solid #4dd0e1" }}>
                            <Link>
                              <Button
                                style={{
                                  borderRadius: "10px",
                                  padding: "10px 13px",
                                }}
                                variant="primary"
                                className="invoicebtn"
                                onClick={() => handleEditInvoice(invoice)}
                              >
                                <FeatherIcon icon="edit" size="15" />
                              </Button>
                              <Button
                                style={{
                                  borderRadius: "10px",
                                  padding: "10px 13px",
                                }}
                                variant="primary"
                                className="invoicebtn"
                                onClick={() => handlePrint(invoice)}
                              >
                                <FeatherIcon icon="printer" size="15" />
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

      <Modal show={showModal} onHide={handleCloseModal} size="xl" centered>
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "#e0f7fa",
            borderBottom: "1px solid #00bcd4",
          }}
        >
          <Modal.Title style={{ color: "#00838f", fontWeight: "bold" }}>
            <FeatherIcon icon="edit" className="me-2" />
            Edit Invoice Detail
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{
            background: "linear-gradient(to right, #e0f7fa, #f0fdff)",
            padding: "25px",
            maxHeight: "85vh",
            overflowY: "auto",
          }}
        >
          {selectedInvoice && (
            <Form>
              <Card
                style={{
                  border: "none",
                  borderRadius: "12px",
                  borderTop: "4px solid #00bcd4",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  marginBottom: "20px",
                }}
              >
                <Card.Body>
                  <h5
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: "#00838f",
                      marginBottom: "5px",
                    }}
                  >
                    Patient & Admission Details
                  </h5>
                  <Row className="g-3">
                    <Col md={4}>
                      <Form.Label className="small fw-bold text-muted">
                        Invoice Number
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedInvoice.invoice_id}
                        readOnly
                        style={{
                          border: "1px solid rgb(77, 208, 225)",
                          backgroundColor: "#e9ecef",
                        }}
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Label className="small fw-bold text-muted">
                        Admission Number
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedInvoice.admission_no}
                        readOnly
                        style={{
                          backgroundColor: "#e9ecef",
                          border: "1px solid rgb(77, 208, 225)",
                          backgroundColor: "#f8f9fa",
                        }}
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Label className="small fw-bold text-muted">
                        Patient Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={selectedInvoice.patient_name}
                        readOnly
                        style={{
                          backgroundColor: "#e9ecef",
                          border: "1px solid rgb(77, 208, 225)",
                          backgroundColor: "#f8f9fa",
                        }}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Label className="small fw-bold text-muted">
                        Admission Date
                      </Form.Label>
                      <Form.Control
                        type="date"
                        style={{ border: "1px solid rgb(77, 208, 225)" }}
                        value={selectedInvoice.creation_date}
                        onChange={(e) =>
                          setSelectedInvoice({
                            ...selectedInvoice,
                            creation_date: e.target.value,
                          })
                        }
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Label className="small fw-bold text-muted">
                        Admission Time
                      </Form.Label>
                      <Form.Control
                        type="time"
                        style={{ border: "1px solid rgb(77, 208, 225)" }}
                        value={selectedInvoice.admissiontime}
                        onChange={(e) =>
                          setSelectedInvoice({
                            ...selectedInvoice,
                            admissiontime: e.target.value,
                          })
                        }
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Label className="small fw-bold text-muted">
                        Discharge Date
                      </Form.Label>
                      <Form.Control
                        type="date"
                        style={{ border: "1px solid rgb(77, 208, 225)" }}
                        value={selectedInvoice.due_date}
                        min={selectedInvoice.creation_date}
                        onChange={(e) =>
                          setSelectedInvoice({
                            ...selectedInvoice,
                            due_date: e.target.value,
                          })
                        }
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Label className="small fw-bold text-muted">
                        Discharge Time
                      </Form.Label>
                      <Form.Control
                        type="time"
                        style={{ border: "1px solid rgb(77, 208, 225)" }}
                        value={selectedInvoice.dischargetime}
                        onChange={(e) =>
                          setSelectedInvoice({
                            ...selectedInvoice,
                            dischargetime: e.target.value,
                          })
                        }
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card
                style={{
                  border: "none",
                  borderRadius: "12px",
                  borderTop: "4px solid #00bcd4",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  marginBottom: "20px",
                }}
              >
                <Card.Body>
                  <h5
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: "#00838f",
                      marginBottom: "5px",
                    }}
                  >
                    Clinical Staff
                  </h5>
                  <Row className="g-3">
                    <Col md={4}>
                      <Form.Label className="small fw-bold text-muted">
                        Consultant Name
                      </Form.Label>
                      <Form.Select
                        style={{ border: "1px solid rgb(77, 208, 225)" }}
                        value={selectedInvoice?.consultant || ""}
                        onChange={(e) =>
                          setSelectedInvoice({
                            ...selectedInvoice,
                            consultant: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Consultant</option>
                        {consultants.map((c, i) => (
                          <option key={i} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={4}>
                      <Form.Label className="small fw-bold text-muted">
                        Surgeon Name
                      </Form.Label>
                      <Form.Select
                        style={{ border: "1px solid rgb(77, 208, 225)" }}
                        value={selectedInvoice?.prepared_doctor || ""}
                        onChange={(e) =>
                          setSelectedInvoice({
                            ...selectedInvoice,
                            prepared_doctor: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Surgeon</option>
                        {surgeons.map((s, i) => (
                          <option key={i} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={4}>
                      <Form.Label className="small fw-bold text-muted">
                        Bed Category
                      </Form.Label>
                      <Form.Control
                        style={{ border: "1px solid rgb(77, 208, 225)" }}
                        type="text"
                        value={selectedInvoice.bed_desc}
                        onChange={(e) =>
                          setSelectedInvoice({
                            ...selectedInvoice,
                            bed_desc: e.target.value,
                          })
                        }
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card
                style={{
                  border: "none",
                  borderRadius: "12px",
                  borderTop: "4px solid #00bcd4",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  marginBottom: "15px",
                }}
              >
                <Card.Body>
                  <h5
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: "#00838f",
                      marginBottom: "5px",
                    }}
                  >
                    Billing Particulars
                  </h5>
                  {modalInvoiceData.dynamicRows.map((row, index) => (
                    <Row key={index} className="mb-2 align-items-end">
                      <Col md={6}>
                        <Form.Label className="small fw-bold text-muted">
                          Service Label
                        </Form.Label>
                        <Form.Control
                          placeholder="e.g. Medicines"
                          style={{ border: "1px solid rgb(77, 208, 225)" }}
                          type="text"
                          value={row.label || ""}
                          onChange={(e) =>
                            handleDynamicRowChange(
                              index,
                              "label",
                              e.target.value
                            )
                          }
                        />
                      </Col>
                      <Col md={2}>
                        <Form.Label className="small fw-bold text-muted">
                          Amount (₹)
                        </Form.Label>
                        <Form.Control
                          placeholder="e.g. 500"
                          style={{ border: "1px solid rgb(77, 208, 225)" }}
                          type="number"
                          value={row.value || ""}
                          onChange={(e) =>
                            handleDynamicRowChange(
                              index,
                              "value",
                              e.target.value
                            )
                          }
                        />
                      </Col>
                      <Col md={4} className="d-flex gap-2">
                        <Button
                          variant="secondary"
                          disabled={modalInvoiceData.dynamicRows.length <= 1}
                          className="flex-grow"
                          onClick={() => deleteDynamicRow(index)}
                        >
                          - Delete Row
                        </Button>
                        {index === modalInvoiceData.dynamicRows.length - 1 && (
                          <Button variant="success" onClick={addDynamicRow}>
                            + Add Row
                          </Button>
                        )}
                      </Col>
                    </Row>
                  ))}
                </Card.Body>
              </Card>

              <Row>
                <Col md={12}>
                  <Card
                    style={{
                      border: "none",
                      borderRadius: "12px",
                      borderTop: "4px solid #00bcd4",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      height: "100%",
                    }}
                  >
                    <Card.Body>
                      <h5
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: "600",
                          color: "#00838f",
                          padding: "10px",
                        }}
                      >
                        Billing Settings
                      </h5>
                      {/* <Row className="g-3">
                        <Col md={12}>
                          <Form.Label className="small fw-bold text-muted">BILL TYPE</Form.Label>
                          <Form.Select style={{ border: '1px solid rgb(77, 208, 225)' }} value={selectedInvoice.bill_Type} onChange={(e) => setSelectedInvoice({ ...selectedInvoice, bill_Type: e.target.value })}>
                            <option value="">Select Type</option>
                            <option value="insurance">Insurance</option>
                            <option value="non_insurance">Non-Insurance</option>
                            <option value="charity">Charity</option>
                          </Form.Select>
                        </Col>

                        {selectedInvoice.bill_Type === "insurance" && (
                          <>
                            <Col md={6}>
                              <Form.Label className="small fw-bold text-muted">INSURANCE CO.</Form.Label>
                              <Form.Select style={{ border: '1px solid rgb(77, 208, 225)' }} value={selectedInvoice?.insurancecompany || ""} onChange={(e) => setSelectedInvoice({ ...selectedInvoice, insurancecompany: e.target.value })}>
                                <option value="">Select Company</option>
                                {insurance.map((co) => <option key={co.companyname} value={co.companyname}>{co.companyname}</option>)}
                              </Form.Select>
                            </Col>
                            <Col md={6}>
                              <Form.Label className="small fw-bold text-muted">TPA</Form.Label>
                              <Form.Select style={{ border: '1px solid rgb(77, 208, 225)' }} value={selectedInvoice?.tpa || ""}
                                onChange={(e) => {
                                  const updated = { ...selectedInvoice, tpa: e.target.value };
                                  setSelectedInvoice(updated);
                                  updatePayableAmt(updated);
                                }}>
                                <option value="">Select TPA</option>
                                {[...new Set([...invoices.map(i => i.tpa), ...tpa.map(t => t.companyname)])].map((name, i) => <option key={i} value={name}>{name}</option>)}
                              </Form.Select>
                            </Col>
                          </>
                        )}

                        {(selectedInvoice.bill_Type === "non_insurance" || selectedInvoice.bill_Type === "charity") && (
                          <Col md={12}>
                            <Form.Label className="small fw-bold text-muted">DISCOUNT AMOUNT (₹)</Form.Label>
                            <Form.Control
                              type="number"
                              style={{ border: '1px solid rgb(77, 208, 225)' }}
                              value={selectedInvoice.discount}
                              onChange={(e) => {
                                const disc = parseFloat(e.target.value) || 0;
                                const subTotal = parseFloat(modalInvoiceData.Sub_Total) || 0;
                                const newPayable = Math.max(0, subTotal - disc).toFixed(2);
                                setModalInvoiceData(prev => ({ ...prev, discount: disc, payableAmount: newPayable }));
                                setSelectedInvoice(prev => ({ ...prev, discount: disc, payable_amt: newPayable }));
                              }}
                            />
                          </Col>
                        )}

                        <Col md={12}>
                          <Form.Label className="small fw-bold text-muted">NOTE / REMARKS</Form.Label>
                          <Form.Control as="textarea" rows={2} style={{ border: '1px solid rgb(77, 208, 225)' }} value={selectedInvoice.note} onChange={(e) => setSelectedInvoice({ ...selectedInvoice, note: e.target.value })} />
                        </Col>
                      </Row> */}
                      <Row className="g-3">
                        <Col md={2}>
                          <Form.Label className="small fw-bold text-muted">
                            Bill Type
                          </Form.Label>
                          <Form.Select
                            style={{ border: "1px solid rgb(77, 208, 225)" }}
                            value={selectedInvoice.bill_Type}
                            onChange={(e) => {
                              // Reset dependent fields when Bill Type changes
                              setSelectedInvoice({
                                ...selectedInvoice,
                                bill_Type: e.target.value,
                                bill_method: "",
                                chequeno: "",
                                pdc: "0.00",
                                insurancecompany: "", // Clear insurance info
                                tpa: "", // Clear TPA info
                              });
                            }}
                          >
                            <option value="">Select Type</option>
                            <option value="insurance">Insurance</option>
                            <option value="non_insurance">Non-Insurance</option>
                            <option value="charity">Charity</option>
                          </Form.Select>
                        </Col>

                        {/* ONLY visible if Bill Type is insurance */}
                        {selectedInvoice.bill_Type === "insurance" && (
                          <>
                            <Col md={5}>
                              <Form.Label className="small fw-bold text-muted">
                                Insurance Company
                              </Form.Label>
                              <Form.Select
                                style={{
                                  border: "1px solid rgb(77, 208, 225)",
                                }}
                                value={selectedInvoice?.insurancecompany || ""}
                                onChange={(e) =>
                                  setSelectedInvoice({
                                    ...selectedInvoice,
                                    insurancecompany: e.target.value,
                                  })
                                }
                              >
                                <option value="">Select Company</option>
                                {insurance.map((co) => (
                                  <option
                                    key={co.companyname}
                                    value={co.companyname}
                                  >
                                    {co.companyname}
                                  </option>
                                ))}
                              </Form.Select>
                            </Col>

                            <Col md={5}>
                              <Form.Label className="small fw-bold text-muted">
                                TPA
                              </Form.Label>
                              <Form.Select
                                style={{
                                  border: "1px solid rgb(77, 208, 225)",
                                }}
                                value={selectedInvoice?.tpa || ""}
                                onChange={(e) =>
                                  setSelectedInvoice({
                                    ...selectedInvoice,
                                    tpa: e.target.value,
                                  })
                                }
                              >
                                <option value="">Select TPA</option>
                                {[
                                  ...new Set([
                                    ...invoices.map((i) => i.tpa),
                                    ...tpa.map((t) => t.companyname),
                                  ]),
                                ].map((name, i) => (
                                  <option key={i} value={name}>
                                    {name}
                                  </option>
                                ))}
                              </Form.Select>
                            </Col>

                            <Col md={4}>
                              <Form.Label className="small fw-bold text-muted">
                                Bill Method
                              </Form.Label>
                              <Form.Select
                                style={{
                                  border: "1px solid rgb(77, 208, 225)",
                                }}
                                value={selectedInvoice.bill_method || ""}
                                onChange={(e) => {
                                  const method = e.target.value;
                                  setSelectedInvoice({
                                    ...selectedInvoice,
                                    bill_method: method,
                                    ...(method !== "PDC" && {
                                      chequeno: "",
                                      pdc: "0.00",
                                    }),
                                  });
                                }}
                              >
                                <option value="">SELECT BILL METHOD</option>
                                <option value="cashless">Cashless</option>
                                <option value="PDC">PDC</option>
                                <option value="reimbursement">
                                  Reimbursement
                                </option>
                              </Form.Select>
                            </Col>

                            {/* Show PDC fields ONLY if method is PDC */}
                            {selectedInvoice.bill_method === "PDC" && (
                              <>
                                <Col md={4}>
                                  <Form.Label className="small fw-bold text-muted">
                                    Cheque Number
                                  </Form.Label>
                                  <Form.Control
                                    placeholder="Enter Cheque Number"
                                    type="text"
                                    style={{
                                      border: "1px solid rgb(77, 208, 225)",
                                    }}
                                    value={selectedInvoice.chequeno || ""}
                                    onChange={(e) =>
                                      setSelectedInvoice({
                                        ...selectedInvoice,
                                        chequeno: e.target.value,
                                      })
                                    }
                                  />
                                </Col>
                                <Col md={4}>
                                  <Form.Label className="small fw-bold text-muted">
                                    PDC Amount (₹)
                                  </Form.Label>
                                  <Form.Control
                                    placeholder="e.g. 500"
                                    onWheel={(e) => e.target.blur()}
                                    type="number"
                                    style={{
                                      border: "1px solid rgb(77, 208, 225)",
                                    }}
                                    value={selectedInvoice.pdc || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const subTotal =
                                        parseFloat(
                                          modalInvoiceData.Sub_Total
                                        ) || 0;
                                      const newPayable = Math.max(
                                        0,
                                        subTotal - (parseFloat(val) || 0)
                                      ).toFixed(2);
                                      setSelectedInvoice({
                                        ...selectedInvoice,
                                        pdc: val,
                                        payable_amt: newPayable,
                                      });
                                      setModalInvoiceData((prev) => ({
                                        ...prev,
                                        pdc: val,
                                        payableAmount: newPayable,
                                      }));
                                    }}
                                  />
                                </Col>
                              </>
                            )}
                          </>
                        )}

                        {/* Discount Field for Non-Insurance or Charity */}
                        {(selectedInvoice.bill_Type === "non_insurance" ||
                          selectedInvoice.bill_Type === "charity") && (
                          <Col md={8}>
                            <Form.Label className="small fw-bold text-muted">
                              Discount Amount (₹)
                            </Form.Label>
                            <Form.Control
                              placeholder="e.g. 500"
                              onWheel={(e) => e.target.blur()}
                              type="number"
                              style={{ border: "1px solid rgb(77, 208, 225)" }}
                              value={selectedInvoice.discount}
                              onChange={(e) => {
                                const disc = parseFloat(e.target.value) || 0;
                                const subTotal =
                                  parseFloat(modalInvoiceData.Sub_Total) || 0;
                                const newPayable = Math.max(
                                  0,
                                  subTotal - disc
                                ).toFixed(2);
                                setModalInvoiceData((prev) => ({
                                  ...prev,
                                  discount: disc,
                                  payableAmount: newPayable,
                                }));
                                setSelectedInvoice((prev) => ({
                                  ...prev,
                                  discount: disc,
                                  payable_amt: newPayable,
                                }));
                              }}
                            />
                          </Col>
                        )}

                        <Col md={12}>
                          <Form.Label className="small fw-bold text-muted">
                            Note{" "}
                          </Form.Label>
                          <Form.Control
                            placeholder="Enter note"
                            as="textarea"
                            rows={2}
                            style={{ border: "1px solid rgb(77, 208, 225)" }}
                            value={selectedInvoice.note}
                            onChange={(e) =>
                              setSelectedInvoice({
                                ...selectedInvoice,
                                note: e.target.value,
                              })
                            }
                          />
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={12}>
                  <div
                    style={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "12px",
                      borderTop: "4px solid #00bcd4",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      marginTop: "20px",
                    }}
                  >
                    <div style={{ padding: "10px" }}>
                      <h5
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: "600",
                          color: "#00838f",
                        }}
                      >
                        Invoice Summary
                      </h5>
                    </div>

                    <div style={{ padding: "10px", flexGrow: 1 }}>
                      <div
                        style={{
                          maxHeight: "150px",
                          overflowY: "auto",
                          marginBottom: "10px",
                        }}
                      >
                        {modalInvoiceData.dynamicRows
                          .filter((r) => r.value > 0)
                          .map((row, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "0.9rem",
                                color: "#555",
                                padding: "3px 0",
                              }}
                            >
                              <span>{row.label || "Service"}</span>
                              <span>
                                ₹ {parseFloat(row.value).toLocaleString()}
                              </span>
                            </div>
                          ))}
                      </div>

                      <div
                        style={{
                          borderTop: "1px dashed #00bcd4",
                          paddingTop: "10px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "5px",
                          }}
                        >
                          <span className="text-muted">Sub-Total:</span>
                          <span style={{ fontWeight: "600" }}>
                            ₹{" "}
                            {parseFloat(
                              modalInvoiceData.Sub_Total
                            ).toLocaleString()}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "15px",
                            color: "#d32f2f",
                          }}
                        >
                          <span style={{ fontWeight: "500" }}>
                            Applied Discount:
                          </span>
                          <span style={{ fontWeight: "600" }}>
                            - ₹{" "}
                            {parseFloat(
                              selectedInvoice.discount || 0
                            ).toLocaleString()}
                          </span>
                        </div>

                        <div
                          style={{
                            backgroundColor: "#00bcd4",
                            color: "#ffffff",
                            padding: "15px",
                            borderRadius: "8px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontSize: "1rem", fontWeight: "500" }}>
                            Payable Amount:
                          </span>
                          <span
                            style={{ fontSize: "1.5rem", fontWeight: "600" }}
                          >
                            ₹{" "}
                            {parseFloat(
                              modalInvoiceData.payableAmount
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>

        <Modal.Footer style={{ backgroundColor: "#f8f9fa" }}>
          <Button
            variant="secondary"
            onClick={handleCloseModal}
            style={{ border: "none", borderRadius: "10px" }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveChanges}
            style={{ border: "none", borderRadius: "10px" }}
          >
            Save Changes+
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InvoiceList;
