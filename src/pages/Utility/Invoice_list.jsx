import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import moment from "moment";
import { Paginator } from "primereact/paginator";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { InputGroup } from "react-bootstrap";
import { clinincLoc } from "../../utils/clinic_locations-invoice";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Card,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import NavbarIpdBills from "../../components/NavbarIpdBills";
import Swal from "sweetalert2";
import { decodeJwt } from "../../utils/decode-jwt";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo/hhc.png";
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

const BASE_URL = "http://localhost:5100/api";

const getDynamicRowsFromInvoice = (invoice) => {
  const dynamicRows = [];
  let titleCalculatedTotal = 0;

  if (!invoice) return { dynamicRows: [], Sub_Total: "0.00" };
  console.log(invoice.package);

  if (invoice.package && typeof invoice.package === "string") {
    invoice.package.split(",").forEach((entry) => {
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

    console.log("Dynamic rows:", dynamicRows);
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
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
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
    // global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    global: { value: null, matchMode: FilterMatchMode.EQUALS },
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
    // Helper function moved inside to ensure availability
    const formatToApiDateLocal = (date) => {
      if (!date) return null;
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}-${month}-${year}`; // Matches your DD-MM-YYYY backend expectation
    };

    const fetchInvoices = async () => {
      if (!currentLocation) return;

      setLoading(true);
      setError("");

      try {
        // 1. Create the base URL
        const url = new URL(`${BASE_URL}/V1/invoice/listInvoice`);

        // 2. Prepare the parameters
        const params = {
          location: currentLocation,
          from: formatToApiDateLocal(fromDate),
          to: formatToApiDateLocal(toDate),
        };

        // 3. Cleanly append parameters
        Object.keys(params).forEach((key) => {
          if (params[key]) {
            url.searchParams.append(key, params[key]);
          }
        });

        console.log("Fetching URL:", url.toString());

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Good practice to include
          },
        });

        const data = await response.json();

        if (response.ok) {
          // Flatten data if backend returns nested array [ [] ]
          const rawData = Array.isArray(data.data[0])
            ? data.data[0]
            : data.data || [];

          const processedInvoices = rawData.map((invoice) => ({
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

          setInvoices(processedInvoices);
        } else {
          throw new Error(data.message || "Failed to fetch invoices.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [currentLocation, fromDate, toDate]); // Added fromDate and toDate so it refreshes when dates change

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
              currentLocation,
            )}`,
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
        i === index ? { ...row, [field]: value } : row,
      );

      const newSubTotal = updatedRows.reduce(
        (total, row) => total + (parseFloat(row.value) || 0),
        0,
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
          { method: "DELETE" },
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
        (_, i) => i !== index,
      );

      const newSubTotal = updatedRows.reduce(
        (total, row) => total + (parseFloat(row.value) || 0),
        0,
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

  // const handleEditInvoice = (invoice) => {
  //   const { dynamicRows, Sub_Total } = getDynamicRowsFromInvoice(invoice);

  //   const displayRows =
  //     dynamicRows.length > 0
  //       ? dynamicRows
  //       : [{ label: "", value: "", field: "" }];

  //   const payableAmount = calculatePayableAmt(invoice);

  //   setSelectedInvoice(invoice);
  //   setModalInvoiceData({
  //     dynamicRows: displayRows,
  //     Sub_Total: Sub_Total,
  //     discount: invoice.discount || "0.00",
  //     pdc: parseFloat(invoice.pdc) || "0.00",
  //     payableAmount: payableAmount,
  //     bill_method: invoice.bill_method || "non_insurance",
  //     bill_Type: invoice.bill_Type || "non_insurance",
  //   });

  //   setShowModal(true);
  // };

  const handleEditInvoice = (invoice) => {
    const { dynamicRows, Sub_Total } = getDynamicRowsFromInvoice(invoice);

    const displayRows =
      dynamicRows.length > 0
        ? dynamicRows
        : [{ label: "", value: "", field: "" }];

    const payableAmount = calculatePayableAmt(invoice);

    /**
     * Helper to format dates specifically for <input type="date">
     * Requires YYYY-MM-DD format
     */
    const formatForInput = (dateValue) => {
      if (!dateValue) return "";
      const date = new Date(dateValue);
      // Ensure it's a valid date before formatting
      if (isNaN(date.getTime())) return "";

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    setSelectedInvoice({
      ...invoice,
      // Explicitly format these for the modal inputs
      creation_date: formatForInput(invoice.creation_date),
      due_date: formatForInput(invoice.due_date),
    });

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

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 15) {
        const h = hour.toString().padStart(2, "0");
        const m = min.toString().padStart(2, "0");
        times.push(`${h}:${m}`); // Format: HH:mm (24h format for the value)
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

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
      .filter((row) => row.label.trim() !== "")
      .map(
        (row) =>
          `${row.label.trim()}: ${parseFloat(row.value || 0).toFixed(2)}`,
      )
      .join(", ");

    const payload = {
      ...selectedInvoice,
      ...modalInvoiceData,
      package: titleString,
      location: currentLocation,
      totalamt: modalInvoiceData.Sub_Total,
      payable_amt: modalInvoiceData.payableAmount,
      discount: modalInvoiceData.discount,
      pdc: modalInvoiceData.pdc,
    };

    console.log(
      "Attempting to save invoice changes for ID:",
      selectedInvoice.invoice_id,
    );

    try {
      const response = await fetch(
        `${BASE_URL}/V1/invoice/${selectedInvoice.invoice_id}?location=${currentLocation}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (response.ok) {
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.invoice_id === selectedInvoice.invoice_id
              ? { ...inv, package: titleString }
              : inv,
          ),
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
    if (!invoice || typeof invoice !== "object" || !invoice.invoice_id) {
      Toast.fire({
        icon: "info",
        title: "Preparing invoice for print...",
        timer: 1500,
      });
      return;
    }
    console.log("printing invoice:", invoice);
    const clinicAddr = clinincLoc[currentLocation] || {
      address: "Healing Hands Clinic",
      phone: "8888288884",
    };

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
        body { margin: 0; padding: 20px; background: #fff; }
        body, table, tr, td, p { 
          font-family: Arial, sans-serif; 
          font-size: 10px !important; 
          color: #000;
        }

        .page-border {
          border: 1px solid #000; /* Solid border like the image */
          padding: 20px;
          margin: 0 auto;
          min-height: 95vh;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }
        
        .header-table { 
         width: auto; 
         margin-bottom: 15px; 
        }

        .header-logo { 
          padding-right: 15px; 
          vertical-align: middle;
        }

        .header-logo img {
          width: 150px;    
          height: auto;    
          max-height: 200px; 
          display: block;
        }

        .header-address { 
          text-align: left; 
          font-weight: bold; 
          font-size: 10px !important; 
          vertical-align: middle;
          line-height: 1.2;
        }
          
        .details-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .details-table td { padding: 5px 10px; width: 25%; vertical-align: top; }
        .details-table td:nth-child(odd) { font-weight: normal; color: #000000; font-weight: bold } 
        .details-table td:nth-child(even) { font-weight: 500; }
  
        .bill-title { text-align: center; font-weight: 700; padding: 10px 0; font-size: 12px !important; }
  
        .section-header-table { width: 100%; margin-top: 5px; margin-bottom: 10px }
        .section-header-table td { width: 50%; text-align: center; font-weight: bold; }
  
        .summary-container-table { width: 100%; border-collapse: collapse; }
        .left_align { text-align: left; width: 25%; }
        .right_align { text-align: right !important; width: 25%; }
        
        .itemized-table {table-layout: fixed; width: 100%; border-collapse: collapse; table-layout: fixed; }
        .itemized-table td { width: 50%; display: inline-block; padding: 4px 0;  }
        .itemized-table td:nth-child(odd) { text-align: left; width: 65%; }
        .itemized-table td:nth-child(even) { text-align: right; }
  
        .total-row-container { width: 100%; border: 2px solid #000; border-collapse: collapse; }
        .total-row-container td { padding: 8px 10px; }
  
        .footer { margin-top: 20px; border-top: 1px solid #4b897e; padding-top: 5px; }
        .footer-table { width: 100%; color: #000; }
        
        .btn-container { display: flex; justify-content: center; margin-top: 20px; }
        .print-btn { background: #2b9163; color: white; padding: 8px 20px; border: none; border-radius: 5px; cursor: pointer; }
  
        @media print { 
          .btn-container { display: none; } 
          body { margin: 10px; }
          .details-table td { border-bottom: none; }
        }
      </style>
    </head>
    <body>
      <table class="header-table">
        <tr>
          <td class="header-logo"><img src="${mainLogo}" alt="Logo"></td>
          <td class="header-address">${clinicAddr.invoiceAddress || "<b>Healing Hands Clinic</b>"}</td>
        </tr>
      </table>
  
      <table class="details-table">
        <tr>
          <td>Bill No:</td><td>${invoice.invoice_id}</td>
          <td>Bill Date:</td><td>${formatDateForDisplay(invoice.due_date)}</td>
        </tr>
        <tr>
          <td>Patient Name:</td><td>${invoice.prefix || ""} ${invoice.patient_name || invoice.name}</td>
          <td>Gender / Age:</td><td>${invoice.sex || invoice.gender || "N/A"} / ${invoice.age}</td>
        </tr>
        <tr>
          <td>Patient ID:</td><td>${invoice.admission_no}</td>
          <td>Admission No:</td><td>${invoice.admission_no}</td>
        </tr>
        <tr>
          <td>Insurance Name:</td><td>${invoice.status === "Cashless" ? invoice.insurance_company || "" : ""}</td>
          <td>Bed Category:</td><td>${invoice.bed_desc || invoice.bed_no || "N/A"}</td>
        </tr>
        <tr>
          <td>TPA Name:</td><td>${invoice.status === "Cashless" ? invoice.tpa_company || "" : ""}</td>
          <td>Admission Date & Time:</td><td>${formatDateForDisplay(invoice.creation_date)} &nbsp; ${invoice.admissiontime}</td>
        </tr>
        <tr>
          <td>Doctor Name:</td><td>${invoice.consultant}</td>
          <td>Discharge Date & Time:</td><td>${formatDateForDisplay(invoice.due_date)} &nbsp; ${invoice.dischargetime}</td>
        </tr>
        <tr>
          <td>Surgeon Name:</td><td>${invoice.prepared_doctor}</td>
          <td></td><td></td>
        </tr>
      </table>
  
      <div class="bill-title">FINAL BILL</div>
      <hr style="margin: 5px 0; border-top: 3px solid #4b897e; margin-bottom:5px">
  
      <table class="section-header-table">
        <tr>
          <td>Itemized Details</td>
          <td>Account Summary</td>
        </tr>
      </table>
  
      <table width="100%">
        <tr>
          <td style="width: 50%; vertical-align: top; border-right: 1px solid #666666;">
            <table class="itemized-table">
              <tr>
                <td style="font-weight:bold; color:#000; text-align:left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-bottom: 1px solid #666666;">
                  Items/Services
                </td>
                <td style="font-weight:bold; color:#000; text-align:right; width: 100px; white-space: nowrap; border-bottom: 1px solid #666666;">
                  Amount (INR)
                </td>
              </tr>
              ${dynamicRows
          .map(
            (row) => `
                <tr>
                <td style=" color:#000; text-align:left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-bottom: 1px dotted #666666;">${row.label}</td>
                <td style=" color:#000; text-align:right; width: 100px; white-space: nowrap; border-bottom: 1px dotted #666666;">${parseFloat(row.value).toFixed(2)}</td>
                </tr>
              `,
          )
          .join("")}
            </table>
          </td>
      <td style="width: 50%; vertical-align: top; padding-left: 10px;">
  <table width="100%" style="border-collapse: collapse;">
    <tr>
      <td style="font-weight:bold; color:#000; border-bottom: 1px solid #666666; padding-bottom: 5px;">Heading</td>
      <td style="font-weight:bold; color:#000; text-align:right; border-bottom: 1px solid #666666; padding-bottom: 5px;">Amount (INR)</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px dotted #666666;">
        Total
      </td>
      <td style="text-align:right; padding: 8px 0; border-bottom: 1px dotted #666666;">
        ${parseFloat(invoice.totalamt).toLocaleString()}.00
      </td>
    </tr>
    ${invoice.discount > 0
          ? `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px dotted #666666;">
        Discount
      </td>
      <td style="text-align:right; padding: 8px 0; border-bottom: 1px dotted #666666;">
        ${parseFloat(invoice.discount).toLocaleString()}.00
      </td>
    </tr>
    `
          : ""
        }
  </table>
</td>
        </tr>
      </table>
  
      <p style="padding: 5px 0;">* ${invoice.note || ""}</p>
  
      <table class="total-row-container" border="1">
        <tr>
          <td class="left_align" style="border-right:0;">Total:</td>
          <td class="right_align" style="border-left:0; font-weight:bold;">${parseFloat(invoice.totalamt).toLocaleString()}.00</td>
          <td class="left_align" style="border-right:0;">Please Pay:</td>
          <td class="right_align" style="border-left:0; font-weight:bold;">
            ${parseFloat(invoice.payable_amt).toLocaleString()}.00
          </td>
        </tr>
      </table>
  
<table width="100%" style="margin-top: 60px; table-layout: fixed;">
  <tr>
    <td style="text-align: center; vertical-align: bottom;">
      <div style="border-top: 1px solid #000; padding-top: 5px; margin: 0 10px;">
        Prepared By
      </div>
    </td>
    <td style="text-align: center; vertical-align: bottom;">
      <div style="border-top: 1px solid #000; padding-top: 5px; margin: 0 10px;">
        Checked By
      </div>
    </td>
     <td style="text-align: center; vertical-align: bottom;">
     <div style="border-top: 1px solid #000; padding-top: 5px; margin: 0 10px;">
        For Healing Hands Clinic
      </div>
    </td>
    <td style="text-align: center; vertical-align: bottom;">
      <div style="border-top: 1px solid #000; padding-top: 5px; margin: 0 10px;">
        Person Making Payment
      </div>
    </td>
  </tr>
</table>
  
      <div class="footer">
        <table class="footer-table">
          <tr>
            <td>For queries call ${clinicAddr.invoiceHelplineNo || "7774099753"}</td>
            <td style="text-align:right;">For Emergency SMS ${clinicAddr.EmergencySMS || "7774053187"}</td>
          </tr>
        </table>
      </div>

      <div class="btn-container">
        <button class="print-btn" onclick="window.print()">Print Invoice</button>
      </div>
    </body>
  </html>
  `;
      printWindow.document.write(printContent);
      printWindow.document.close();
      setTimeout(() => { }, 1000);
    });
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const searchTerm = filters1.global.value?.toLowerCase() || "";

    if (!searchTerm) return true;

    return (
      invoice.patient_name?.toLowerCase().includes(searchTerm) ||
      invoice.invoice_id?.toString().toLowerCase().includes(searchTerm) ||
      invoice.patient_phone?.toLowerCase().includes(searchTerm)
    );
  });

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                marginRight: "8px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Show
            </span>
            <Form.Select
              size="sm"
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value))}
              style={{
                width: "70px",
                height: "30px",
                border: "1px solid #4dd0e1",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Form.Select>
          </div>
          <Form.Group
            className="ms-2"
            style={{ display: "flex", alignItems: "center", margin: 0 }}
          >
            <span
              style={{
                marginRight: "10px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Search
            </span>
            <InputGroup>
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
                  padding: "5px 8px",
                  width: "200px",
                  height: "30px",
                  fontSize: "12px",
                }}
              />
            </InputGroup>
          </Form.Group>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1px solid #4dd0e1",
            borderRadius: "8px",
            padding: "8px",
            backgroundColor: "#f5fcfd",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "#00838f",
                marginBottom: "3px",
              }}
            >
              From Date
            </div>
            <DatePicker
              selected={fromDate}
              onChange={(date) => setFromDate(date)}
              dateFormat="dd-MM-yyyy"
              maxDate={new Date()}
              customInput={
                <Form.Control
                  style={{ padding: "5px 8px", fontSize: "12px" }}
                />
              }
            />
          </div>
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "#00838f",
                marginBottom: "3px",
              }}
            >
              To Date
            </div>
            <DatePicker
              selected={toDate}
              onChange={(date) => setToDate(date)}
              dateFormat="dd-MM-yyyy"
              minDate={fromDate}
              customInput={
                <Form.Control
                  style={{ padding: "5px 8px", fontSize: "12px" }}
                />
              }
            />
          </div>
          <Button
            variant="primary"
            onClick={() => fetchInvoices()}
            style={{
              backgroundColor: "#00bcd4",
              border: "none",
              borderRadius: "8px",
              padding: "6px 7px",
              fontSize: "12px",
              marginTop: "18px",
            }}
          >
            <FeatherIcon icon="refresh-ccw" size={12} className="me-1" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );

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
      <PageBreadcrumb pagename="IPD Bills" />
      <NavbarIpdBills />
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
              }}
            >
              <Card.Body>
                {/* <div className="d-flex justify-content-end">
                  <Link to="/invoice/add">
                    <Button variant="primary" style={{ padding: "12px", marginBottom: "7px", fontSize: "12px" }}>
                      <FaPlus /> Add New Invoice
                    </Button>
                  </Link>
                </div> */}
                {renderHeader()}
                {loading ? (
                  <div
                    className="d-flex justify-content-center py-5"
                    style={{ color: "#00bcd4" }}
                  >
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                ) : (
                  <DataTable
                    value={filteredInvoices}
                    paginator
                    rows={rows}
                    first={first}
                    onPage={(e) => {
                      setFirst(e.first);
                      setRows(e.rows);
                    }}
                    showGridlines
                    style={{ fontSize: "14px", marginTop: "10px" }}
                    pt={{
                      header: { style: { padding: "10px 12px" } },
                      bodyRow: { style: { height: "40px" } },
                      column: {
                        headerCell: {
                          style: {
                            padding: "10px 8px",
                            backgroundColor: "#f8f9fa",
                            textAlign: "center",
                            justifyContent: "center",
                          },
                        },
                        bodyCell: {
                          style: {
                            padding: "8px 10px",
                            textAlign: "center",
                          },
                        },
                      },
                    }}
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                    responsiveLayout="scroll"
                    className="custom-datatable-centered datatable-medium-small"
                  >
                    <Column
                      header="#"
                      headerClassName="datatable-header-center"
                      style={{ width: "50px", border: "1px solid #4dd0e1" }}
                      body={(rowData, options) => options.rowIndex + 1}
                    />
                    <Column
                      field="creation_date"
                      header="Date"
                      headerClassName="datatable-header-center"
                      body={(rowData) =>
                        formatDateForDisplay(rowData.creation_date)
                      }
                      style={{ width: "100px", border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      headerClassName="datatable-header-center"
                      field="invoice_id"
                      header="Invoice ID"
                      style={{ width: "100px", border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      headerClassName="datatable-header-center"
                      field="patient_name"
                      header="Patient Name"
                      style={{
                        width: "200px",
                        border: "1px solid #4dd0e1",
                        wordBreak: "break-word",
                      }}
                    />
                    <Column
                      headerClassName="datatable-header-center"
                      field="patient_phone"
                      header="Contact No"
                      style={{ width: "130px", border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      headerClassName="datatable-header-center"
                      field="pay_mode"
                      header="Payment Mode"
                      style={{ width: "110px", border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      headerClassName="datatable-header-center"
                      field="due_amt"
                      header="Due Amount"
                      body={(rowData) => rowData.due_amt.toFixed(2)}
                      style={{ width: "110px", border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      headerClassName="datatable-header-center"
                      field="payable_amt"
                      header="Payable Amount"
                      style={{ width: "110px", border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      headerClassName="datatable-header-center"
                      header="Actions"
                      style={{ width: "100px", border: "1px solid #4dd0e1" }}
                      body={(rowData) => (
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            style={{
                              borderRadius: "8px",
                              padding: "7px 11px",
                              fontSize: "14px",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            variant="primary"
                            onClick={() => handleEditInvoice(rowData)}
                          >
                            <FeatherIcon icon="edit" size="15" />
                          </Button>
                          <Button
                            style={{
                              variant: "primary",
                              borderRadius: "8px",
                              padding: "7px 11px",
                              fontSize: "14px",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onClick={() => handlePrint(rowData)}
                          >
                            <FeatherIcon icon="printer" size="15" />
                          </Button>
                        </div>
                      )}
                    />
                  </DataTable>
                )}
                {/* {!loading && !error && filteredInvoices.length === 0 && (
                  <div className="text-center p-5" style={{ color: "#00838f" }}>
                    <FeatherIcon icon="search" size={40} className="mb-3" style={{ opacity: 0.5 }} />
                    <h5>No invoices found matching your search.</h5>
                    <p className="text-muted">Try a different name, invoice ID, or phone number.</p>
                  </div>
                )} */}
                {!loading &&
                  !error &&
                  filteredInvoices.length === 0 &&
                  filters1.global.value && (
                    <div
                      className="text-center p-5"
                      style={{ color: "#00838f" }}
                    >
                      <FeatherIcon
                        icon="search"
                        size={40}
                        className="mb-3"
                        style={{ opacity: 0.5 }}
                      />
                      <h5>No invoices found matching your search.</h5>
                      <p className="text-muted">
                        Try a different name, invoice ID, or phone number.
                      </p>
                    </div>
                  )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "#e0f7fa",
            borderBottom: "1px solid #00bcd4",
            padding: "8px 15px",
          }}
        >
          <Modal.Title
            style={{ color: "#00838f", fontWeight: "bold", fontSize: "1.1rem" }}
          >
            <FeatherIcon icon="edit" className="me-2" size={18} />
            Edit Bill Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{
            background: "linear-gradient(to right, #e0f7fa, #f0fdff)",
            padding: "12px",
            maxHeight: "85vh",
            overflowY: "auto",
          }}
        >
          {selectedInvoice && (
            <Form>
              <Card
                style={{
                  border: "none",
                  borderRadius: "10px",
                  borderTop: "3px solid #00bcd4",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  marginBottom: "15px",
                }}
              >
                <Card.Body style={{ padding: "10px" }}>
                  <h6
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      color: "#00838f",
                    }}
                  >
                    Patient & Admission Details
                  </h6>
                  <Row className="g-2">
                    <Col md={4}>
                      <Form.Label
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          marginBottom: "2px",
                        }}
                        className="text-muted"
                      >
                        Invoice Number{" "}
                        <span style={{ color: "red" }} className="required">
                          *
                        </span>
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        value={selectedInvoice.invoice_id}
                        readOnly
                        style={{
                          borderRadius: "10px",
                          fontSize: "12px",
                          cursor: "not-allowed",
                          backgroundColor: "#e7ebebff",
                          border: "1px solid #4dd0e1",
                        }}
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Label
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          marginBottom: "2px",
                        }}
                        className="text-muted"
                      >
                        Admission Number
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        value={selectedInvoice.admission_no}
                        readOnly
                        style={{
                          borderRadius: "10px",
                          fontSize: "12px",
                          cursor: "not-allowed",
                          backgroundColor: "#e7ebebff",
                          border: "1px solid #4dd0e1",
                        }}
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Label
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          marginBottom: "2px",
                        }}
                        className="text-muted"
                      >
                        Patient Name{" "}
                        <span style={{ color: "red" }} className="required">
                          *
                        </span>
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        value={selectedInvoice.patient_name}
                        readOnly
                        style={{
                          borderRadius: "10px",
                          fontSize: "12px",
                          cursor: "not-allowed",
                          backgroundColor: "#e7ebebff",
                          border: "1px solid #4dd0e1",
                        }}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Label
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          marginBottom: "2px",
                        }}
                        className="text-muted"
                      >
                        Admission Date{" "}
                        <span style={{ color: "red" }} className="required">
                          *
                        </span>
                      </Form.Label>
                      <Form.Control
                        required
                        size="sm"
                        type="date"
                        style={{
                          borderRadius: "10px",
                          fontSize: "12px",
                          border: "1px solid #4dd0e1",
                        }}
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
                      <Form.Label
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          marginBottom: "2px",
                        }}
                        className="text-muted"
                      >
                        Admission Time{" "}
                        <span style={{ color: "red" }} className="required">
                          *
                        </span>
                      </Form.Label>
                      <Form.Select
                        required
                        size="sm"
                        style={{
                          borderRadius: "10px",
                          fontSize: "12px",
                          border: "1px solid #4dd0e1",
                        }}
                        value={selectedInvoice.admissiontime}
                        onChange={(e) =>
                          setSelectedInvoice({
                            ...selectedInvoice,
                            admissiontime: e.target.value,
                          })
                        }
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
                    <Col md={3}>
                      <Form.Label
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          marginBottom: "2px",
                        }}
                        className="text-muted"
                      >
                        Discharge Date{" "}
                        <span style={{ color: "red" }} className="required">
                          *
                        </span>
                      </Form.Label>
                      <Form.Control
                        required
                        size="sm"
                        type="date"
                        style={{
                          borderRadius: "10px",
                          fontSize: "12px",
                          border: "1px solid #4dd0e1",
                        }}
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
                      <Form.Label
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          marginBottom: "2px",
                        }}
                        className="text-muted"
                      >
                        Discharge Time{" "}
                        <span style={{ color: "red" }} className="required">
                          *
                        </span>
                      </Form.Label>
                      <Form.Select
                        required
                        size="sm"
                        style={{
                          borderRadius: "10px",
                          fontSize: "12px",
                          border: "1px solid #4dd0e1",
                        }}
                        value={selectedInvoice.dischargetime}
                        onChange={(e) =>
                          setSelectedInvoice({
                            ...selectedInvoice,
                            dischargetime: e.target.value,
                          })
                        }
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
                  </Row>
                </Card.Body>
              </Card>

              <Card
                style={{
                  border: "none",
                  borderRadius: "10px",
                  borderTop: "3px solid #00bcd4",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  marginBottom: "15px",
                }}
              >
                <Card.Body style={{ padding: "10px" }}>
                  <h6
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      color: "#00838f",
                    }}
                  >
                    Clinical Staff
                  </h6>
                  <Row className="g-2">
                    <Col md={4}>
                      <Form.Label
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          marginBottom: "2px",
                        }}
                        className="text-muted"
                      >
                        Consultant Name{" "}
                        <span style={{ color: "red" }} className="required">
                          *
                        </span>
                      </Form.Label>
                      <Form.Select
                        required
                        size="sm"
                        style={{
                          borderRadius: "10px",
                          fontSize: "12px",
                          border: "1px solid #4dd0e1",
                        }}
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
                      <Form.Label
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          marginBottom: "2px",
                        }}
                        className="text-muted"
                      >
                        Surgeon Name
                      </Form.Label>
                      <Form.Select
                        size="sm"
                        style={{
                          borderRadius: "10px",
                          fontSize: "12px",
                          border: "1px solid #4dd0e1",
                        }}
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
                      <Form.Label
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          marginBottom: "2px",
                        }}
                        className="text-muted"
                      >
                        Bed Category{" "}
                        <span style={{ color: "red" }} className="required">
                          *
                        </span>
                      </Form.Label>
                      <Form.Control
                        required
                        size="sm"
                        style={{
                          borderRadius: "10px",
                          fontSize: "12px",
                          border: "1px solid #4dd0e1",
                        }}
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
                  borderRadius: "10px",
                  borderTop: "3px solid #00bcd4",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  marginBottom: "15px",
                }}
              >
                <Card.Body style={{ padding: "10px" }}>
                  <h6
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      color: "#00838f",
                    }}
                  >
                    Billing Particulars
                  </h6>
                  {modalInvoiceData.dynamicRows.map((row, index) => (
                    <Row key={index} className="mb-2 g-2 align-items-end">
                      <Col md={6}>
                        <Form.Label
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            marginBottom: "2px",
                          }}
                          className="text-muted"
                        >
                          Label Name
                        </Form.Label>
                        <Form.Control
                          size="sm"
                          placeholder="e.g. Medicines"
                          style={{
                            borderRadius: "10px",
                            fontSize: "12px",
                            border: "1px solid #4dd0e1",
                          }}
                          type="text"
                          value={row.label || ""}
                          onChange={(e) =>
                            handleDynamicRowChange(
                              index,
                              "label",
                              e.target.value,
                            )
                          }
                        />
                      </Col>
                      <Col md={2}>
                        <Form.Label
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            marginBottom: "2px",
                          }}
                          className="text-muted"
                        >
                          Amount (₹)
                        </Form.Label>
                        <Form.Control
                          size="sm"
                          onWheel={(e) => e.target.blur()}
                          placeholder="0.00"
                          style={{
                            borderRadius: "10px",
                            fontSize: "12px",
                            border: "1px solid #4dd0e1",
                          }}
                          type="number"
                          value={row.value || ""}
                          onChange={(e) =>
                            handleDynamicRowChange(
                              index,
                              "value",
                              e.target.value,
                            )
                          }
                        />
                      </Col>
                      <Col md={4} className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-danger"
                          disabled={modalInvoiceData.dynamicRows.length <= 1}
                          style={{ fontSize: "12px", padding: "9px 8px" }}
                          onClick={() => deleteDynamicRow(index)}
                        >
                          - Delete Item
                        </Button>
                        {index === modalInvoiceData.dynamicRows.length - 1 && (
                          <Button
                            size="sm"
                            variant="outline-success"
                            style={{ fontSize: "12px", padding: "9px 8px" }}
                            onClick={addDynamicRow}
                          >
                            + Add Item
                          </Button>
                        )}
                      </Col>
                    </Row>
                  ))}
                </Card.Body>
              </Card>

              <Col md={12}>
                <Card
                  style={{
                    border: "none",
                    borderRadius: "10px",
                    borderTop: "3px solid #00bcd4",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <Card.Body style={{ padding: "10px" }}>
                    <h6
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: "600",
                        color: "#00838f",
                      }}
                    >
                      Billing Settings
                    </h6>
                    <Row className="g-2">
                      <Col md={3}>
                        <Form.Label
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            marginBottom: "2px",
                          }}
                          className="text-muted"
                        >
                          Bill Type{" "}
                          <span style={{ color: "red" }} className="required">
                            *
                          </span>
                        </Form.Label>
                        <Form.Select
                          required
                          size="sm"
                          style={{
                            borderRadius: "10px",
                            fontSize: "12px",
                            border: "1px solid #4dd0e1",
                          }}
                          value={selectedInvoice.bill_Type}
                          onChange={(e) => {
                            setSelectedInvoice({
                              ...selectedInvoice,
                              bill_Type: e.target.value,
                              bill_method: "",
                              chequeno: "",
                              pdc: "0.00",
                              insurancecompany: "",
                              tpa: "",
                            });
                          }}
                        >
                          <option value="">Select Type</option>
                          <option value="insurance">Insurance</option>
                          <option value="non_insurance">Non-Insurance</option>
                          <option value="charity">Charity</option>
                        </Form.Select>
                      </Col>

                      {selectedInvoice.bill_Type === "insurance" && (
                        <>
                          <Col md={9}>
                            <Form.Label
                              style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                marginBottom: "2px",
                              }}
                              className="text-muted"
                            >
                              Insurance Company
                            </Form.Label>
                            <Form.Select
                              size="sm"
                              style={{
                                borderRadius: "10px",
                                fontSize: "12px",
                                border: "1px solid #4dd0e1",
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
                          <Col md={8}>
                            <Form.Label
                              style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                marginBottom: "2px",
                              }}
                              className="text-muted"
                            >
                              TPA
                            </Form.Label>
                            <Form.Select
                              size="sm"
                              style={{
                                borderRadius: "10px",
                                fontSize: "12px",
                                border: "1px solid #4dd0e1",
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
                            <Form.Label
                              style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                marginBottom: "2px",
                              }}
                              className="text-muted"
                            >
                              Bill Method
                            </Form.Label>
                            <Form.Select
                              size="sm"
                              style={{
                                borderRadius: "10px",
                                fontSize: "12px",
                                border: "1px solid #4dd0e1",
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

                          {selectedInvoice.bill_method === "PDC" && (
                            <>
                              <Col md={6}>
                                <Form.Label
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    marginBottom: "2px",
                                  }}
                                  className="text-muted"
                                >
                                  Cheque No.
                                </Form.Label>
                                <Form.Control
                                  size="sm"
                                  type="text"
                                  style={{
                                    borderRadius: "10px",
                                    fontSize: "12px",
                                    border: "1px solid #4dd0e1",
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
                              <Col md={6}>
                                <Form.Label
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    marginBottom: "2px",
                                  }}
                                  className="text-muted"
                                >
                                  PDC Amount (₹)
                                </Form.Label>
                                <Form.Control
                                  size="sm"
                                  type="number"
                                  onWheel={(e) => e.target.blur()}
                                  style={{
                                    borderRadius: "10px",
                                    fontSize: "12px",
                                    border: "1px solid #4dd0e1",
                                  }}
                                  value={selectedInvoice.pdc || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const subTotal =
                                      parseFloat(modalInvoiceData.Sub_Total) ||
                                      0;
                                    const newPayable = Math.max(
                                      0,
                                      subTotal - (parseFloat(val) || 0),
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

                      {(selectedInvoice.bill_Type === "non_insurance" ||
                        selectedInvoice.bill_Type === "charity") && (
                          <Col md={4}>
                            <Form.Label
                              style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                marginBottom: "2px",
                              }}
                              className="text-muted"
                            >
                              Discount Amount (₹)
                            </Form.Label>
                            <Form.Control
                              size="sm"
                              onWheel={(e) => e.target.blur()}
                              type="number"
                              style={{
                                borderRadius: "10px",
                                fontSize: "12px",
                                border: "1px solid #4dd0e1",
                              }}
                              value={selectedInvoice.discount}
                              onChange={(e) => {
                                const disc = parseFloat(e.target.value) || 0;
                                const subTotal =
                                  parseFloat(modalInvoiceData.Sub_Total) || 0;
                                const newPayable = Math.max(
                                  0,
                                  subTotal - disc,
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

                      <Col md={5}>
                        <Form.Label
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            marginBottom: "2px",
                          }}
                          className="text-muted"
                        >
                          Note
                        </Form.Label>
                        <Form.Control
                          size="sm"
                          as="textarea"
                          rows={1}
                          style={{
                            borderRadius: "10px",
                            fontSize: "12px",
                            border: "1px solid #4dd0e1",
                          }}
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
                <Card
                  style={{
                    border: "none",
                    borderRadius: "10px",
                    borderTop: "3px solid #00bcd4",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    height: "100%",
                  }}
                >
                  <Card.Body
                    style={{
                      padding: "12px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <h6
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: "600",
                        color: "#00838f",
                        marginBottom: "7px",
                      }}
                    >
                      Summary
                    </h6>
                    <div
                      style={{
                        flexGrow: 1,
                        maxHeight: "120px",
                        overflowY: "auto",
                        marginBottom: "5px",
                      }}
                    >
                      <h6
                        style={{
                          fontSize: "12px",
                          textAlign: "left",
                          color: "#00838f",
                          marginBottom: "2px",
                        }}
                      >
                        Charge Breakdown:
                      </h6>
                      {modalInvoiceData.dynamicRows
                        .filter((r) => r.value > 0)
                        .map((row, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "12px",
                              color: "#555",
                              padding: "2px 0",
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
                        paddingTop: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "5px",
                          fontSize: "13px",
                        }}
                      >
                        <span>Sub-Total:</span>
                        <span style={{ fontWeight: "600" }}>
                          ₹{" "}
                          {parseFloat(
                            modalInvoiceData.Sub_Total,
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                          color: "#d32f2f",
                          fontSize: "13px",
                        }}
                      >
                        <span>Discount:</span>
                        <span style={{ fontWeight: "600" }}>
                          - ₹{" "}
                          {parseFloat(
                            selectedInvoice.discount || 0,
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div
                        style={{
                          backgroundColor: "#00bcd4",
                          color: "#ffffff",
                          padding: "10px",
                          borderRadius: "6px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: "13px", fontWeight: "500" }}>
                          Payable:
                        </span>
                        <span style={{ fontSize: "16px", fontWeight: "700" }}>
                          ₹{" "}
                          {parseFloat(
                            modalInvoiceData.payableAmount,
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Form>
          )}
        </Modal.Body>

        <Modal.Footer
          style={{ backgroundColor: "#f8f9fa", padding: "8px 15px" }}
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCloseModal}
            style={{ borderRadius: "10px", fontSize: "13px", padding: "10px" }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handleSaveChanges}
            style={{ borderRadius: "10px", fontSize: "13px", padding: "10px" }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InvoiceList;
