import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Modal,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FeatherIcon from "feather-icons-react";
import moment from "moment";
import Swal from "sweetalert2";

import PageBreadcrumb from "../../components/PageBreadcrumb";
import { LOCATIONS_LIST } from "../Auth/Login";
import { clinincLoc } from "../Utility/IpdBill_ClinicLocations";
import logo from "../../assets/images/logo/hhc.png";
import "../../styles/styles.css";

const BASE_URL = "http://194.195.117.79:5100/api";

const getISTDate = (dateValue) => {
  if (!dateValue) return "";
  const str = String(dateValue).trim();
  if (!str || str.startsWith("0000")) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split("-");
    return `${d}-${m}-${y}`;
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    return str;
  }
  const m = moment(dateValue);
  return m.isValid() ? m.format("DD-MM-YYYY") : "";
};

const getDynamicRowsFromInvoice = (invoice) => {
  const dynamicRows = [];
  let titleCalculatedTotal = 0;

  if (Array.isArray(invoice.dynamicRows) && invoice.dynamicRows.length > 0) {
    const sub =
      parseFloat(String(invoice.totalamt || invoice.totalAmt || 0).replace(/,/g, "")) || 0;
    return {
      dynamicRows: invoice.dynamicRows,
      Sub_Total: Math.round(sub).toString(),
      totalamt: Math.round(sub).toString(),
    };
  }

  const rowSource =
    invoice.package && typeof invoice.package === "string" && invoice.package !== ""
      ? invoice.package
      : invoice.title && typeof invoice.title === "string"
        ? invoice.title
        : "";

  if (!rowSource) {
    const tot =
      parseFloat(String(invoice.totalamt || invoice.totalAmt || 0).replace(/,/g, "")) || 0;
    return {
      dynamicRows: [{ label: "Total Package", value: Math.round(tot).toString(), field: "" }],
      Sub_Total: Math.round(tot).toString(),
      totalamt: Math.round(tot).toString(),
    };
  }

  const entries = rowSource.split(",").map((s) => s.trim());
  const hasColons = entries.some((e) => e.includes(":"));

  if (!hasColons && entries.length >= 2) {
    for (let i = 0; i < entries.length; i += 2) {
      const label = entries[i];
      const value =
        parseFloat(String(entries[i + 1] || "").replace(/,/g, "")) || 0;
      if (label) {
        dynamicRows.push({
          label,
          value: Math.round(value).toString(),
          field: "title_parsed",
        });
        titleCalculatedTotal += value;
      }
    }
  } else {
    entries.forEach((entry) => {
      const parts = entry.split(":");
      if (parts.length >= 2) {
        const label = parts[0].trim();
        const value =
          parseFloat(String(parts[1] || "").trim().replace(/,/g, "")) || 0;
        if (label) {
          dynamicRows.push({
            label,
            value: Math.round(value).toString(),
            field: "title_parsed",
          });
          titleCalculatedTotal += value;
        }
      } else if (parts[0].trim()) {
        dynamicRows.push({
          label,
          value: "0.00",
          field: "title_parsed",
        });
      }
    });
  }

  const Sub_Total =
    titleCalculatedTotal > 0
      ? titleCalculatedTotal
      : parseFloat(String(invoice.totalamt || invoice.totalAmt || 0).replace(/,/g, "")) || 0;

  return {
    dynamicRows:
      dynamicRows.length > 0
        ? dynamicRows
        : [{ label: "Total Package", value: Math.round(Sub_Total).toString(), field: "" }],
    Sub_Total: Math.round(Sub_Total).toString(),
    totalamt: Math.round(Sub_Total).toString(),
  };
};

const rowClassName = (rowData) => {
  const status = (rowData.status || "").trim();
  const creationDate = (rowData.creation_date || "").split("T")[0];
  const currentDate = new Date().toISOString().split("T")[0];
  const dueAmt =
    rowData.totaldue !== undefined ? rowData.totaldue : rowData.due_amt || 0;

  const isTargetMode =
    status === "NonInsurance" ||
    status.toLowerCase() === "noninsurance" ||
    status.toLowerCase() === "non_insurance";

  if (isTargetMode && creationDate !== currentDate && dueAmt > 0) {
    return "red-row text-white";
  }
  return "";
};

const IpdBillsDueList = () => {
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);

  // Default From 1st April 2025 and To Today
  const [fromDate, setFromDate] = useState(new Date("2025-04-01"));
  const [toDate, setToDate] = useState(new Date());
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [selectedBillMethod, setSelectedBillMethod] = useState("ALL");

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters1, setFilters1] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [previewInvoice, setPreviewInvoice] = useState(null);

  // Process branches list
  const branchDisplayList = useMemo(() => {
    return LOCATIONS_LIST.map((loc) => ({
      label: typeof loc === "object" ? loc.label : loc,
      value: typeof loc === "object" ? loc.value : loc,
    }));
  }, []);

  // Fetch due invoices
  const fetchDueInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const fromStr = fromDate ? moment(fromDate).format("YYYY-MM-DD") : "2025-04-01";
      const toStr = toDate ? moment(toDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
      const locParam = encodeURIComponent(selectedBranch);
      const statusParam =
        selectedBillMethod !== "ALL"
          ? `&status=${encodeURIComponent(selectedBillMethod)}`
          : "";

      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(
        `${BASE_URL}/V1/invoice/getStatuswiseIPDDueListV2?location=${locParam}&fromDate=${fromStr}&toDate=${toStr}&dueCategory=>90 days${statusParam}`,
        { headers }
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch due bills (Status: ${res.status})`);
      }

      const resData = await res.json();
      let list = [];
      if (resData && resData.data) {
        if (Array.isArray(resData.data.patients)) {
          list = resData.data.patients;
        } else if (Array.isArray(resData.data)) {
          list = resData.data;
        }
      } else if (Array.isArray(resData)) {
        list = resData;
      }

      // Filter for >90 days, creation_date >= '2025-04-01', and status IN ('Cashless', 'PDC')
      const filtered = list.filter((item) => {
        const creationDate = item.creation_date ? moment(item.creation_date).format("YYYY-MM-DD") : "";
        const isFromApril2025 = !creationDate || creationDate >= "2025-04-01";
        const totalDue = Number(item.totaldue) || 0;
        const dueDays = item.due_days !== undefined ? Number(item.due_days) : (item.creation_date ? moment().diff(moment(item.creation_date), "days") : 100);
        const itemStatus = (item.bill_method || item.status || "").toLowerCase().trim();
        const matchesMethod =
          selectedBillMethod === "ALL"
            ? (itemStatus === "cashless" || itemStatus === "pdc")
            : itemStatus === selectedBillMethod.toLowerCase();
        return isFromApril2025 && totalDue > 0 && dueDays > 90 && matchesMethod;
      });

      // Default order by location name alphabetically
      filtered.sort((a, b) => {
        const locA = (a.location || a.branch_name || "").toLowerCase();
        const locB = (b.location || b.branch_name || "").toLowerCase();
        return locA.localeCompare(locB);
      });

      setInvoices(filtered);
    } catch (err) {
      console.error("Error fetching IPD Bills Due List:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to load IPD Bills Due List.",
        confirmButtonColor: "#00acc1",
      });
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, selectedBranch, selectedBillMethod]);

  useEffect(() => {
    fetchDueInvoices();
  }, [fetchDueInvoices]);

  const handleClearFilters = () => {
    setFromDate(new Date("2025-04-01"));
    setToDate(new Date());
    setSelectedBranch("ALL");
    setSelectedBillMethod("ALL");
    setFilters1({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const buildInvoiceHtml = (invoice, mainLogo, showPrintBtn = true) => {
    const trimmedLocation = (invoice.location || invoice.branch_name || "").trim();
    const clinicAddr =
      clinincLoc[trimmedLocation] ||
      clinincLoc[invoice.location] || {
        invoiceAddress: "<b>Healing Hands Clinic</b>",
        invoiceHelplineNo: "8888288884",
      };

    const { dynamicRows, Sub_Total } = getDynamicRowsFromInvoice(invoice);

    const totAmt = parseFloat(invoice.totalamt || Sub_Total) || 0;
    const discAmt = parseFloat(invoice.discount) || 0;
    const isInsurance =
      (invoice.bill_Type || "").toLowerCase() === "insurance" ||
      (invoice.bill_type || "").toLowerCase() === "insurance" ||
      ["cashless", "reimbursement", "pdc"].includes(
        (invoice.status || "").toLowerCase()
      ) ||
      !!invoice.insurancecompany ||
      !!invoice.insurancecompany_name ||
      !!invoice.insurance_company_name;

    const pleasePayAmt = isInsurance ? totAmt : Math.max(0, totAmt - discAmt);

    const resolvedInsName =
      invoice.insurancecompany_name ||
      invoice.companyname ||
      invoice.insurance_company_name ||
      "";
    const resolvedTpaName = invoice.tpa_name || "";

    return `
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
          border: 1px solid #000;
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
        
        .itemized-table { width: 100%; border-collapse: collapse; }
        .itemized-table td { padding: 4px 0; vertical-align: top; border-bottom: 1px dotted #666666; color: #000; }
        .itemized-table tr:first-child td { border-bottom: 1px solid #666666; font-weight: bold; padding-bottom: 5px; }
        .itemized-table td:nth-child(odd) { text-align: left; }
        .itemized-table td:nth-child(even) { text-align: right; }
  
        .total-row-container { width: 100%; border: 2px solid #000; border-collapse: collapse; }
        .total-row-container td { padding: 8px 10px; }
  
        .footer { margin-top: 20px; border-top: 1px solid #4b897e; padding-top: 5px; }
        .footer-table { width: 100%; color: #000; }
        
        .btn-container { display: flex; justify-content: center; margin-top: 20px; }
        .print-btn { background: #2b9163; color: white; padding: 8px 20px; border: none; border-radius: 5px; cursor: pointer; }
  
        @media print { 
          .btn-container { display: none; } 
          body { margin: 10px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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
          <td>Bill No:</td><td>${invoice.invoice_id || "N/A"}</td>
          <td>Bill Date:</td><td>${getISTDate(invoice.due_date || invoice.creation_date)}</td>
        </tr>
        <tr>
          <td>Patient Name:</td><td>${invoice.prefix || ""} ${invoice.patient_name || invoice.name || ""}</td>
          <td>Gender / Age:</td><td>${invoice.sex || invoice.gender || "N/A"} / ${invoice.age || "N/A"} yrs </td>
        </tr>
        <tr>
          <td>Patient ID:</td><td>${invoice.patient_uid || "N/A"}</td>
          <td>Admission No:</td><td>${invoice.admission_no || "N/A"}</td>
        </tr>
        <tr>
          <td>Insurance Name:</td>
          <td>${resolvedInsName}</td>
          <td>Bed Category:</td><td>${invoice.bed_desc || invoice.bed_no || "N/A"}</td>
        </tr>
        <tr>
          <td>TPA Name:</td>
          <td>${resolvedTpaName}</td>
          <td>Admission Date & Time:</td><td>${getISTDate(invoice.creation_date)} &nbsp;${invoice.admissiontime || ""}</td>
        </tr>
        <tr>
          <td>Doctor Name:</td><td>${invoice.consultant_name || "N/A"}</td>
          <td>Discharge Date & Time:</td><td>${getISTDate(invoice.due_date)} &nbsp;${invoice.dischargetime || ""}</td>
        </tr>
        <tr>
          <td>Surgeon Name:</td><td>${invoice.surgeon_name || "N/A"}</td>
          <td>Branch:</td><td><b>${invoice.location || invoice.branch_name || "N/A"}</b></td>
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
          <td style="width: 50%; vertical-align: top; border-right: 1px solid #666666; padding-right: 10px;">
            <table class="itemized-table">
              <tr>
                <td>Items/Services</td>
                <td>Amount (INR)</td>
              </tr>
              ${dynamicRows
        .map(
          (row) => `
                <tr>
                  <td>${row.label}</td>
                  <td>${Math.round(parseFloat(row.value || 0)).toLocaleString("en-IN")}</td>
                </tr>
              `
        )
        .join("")}
            </table>
          </td>
          <td style="width: 50%; vertical-align: top; padding-left: 10px;">
            <table class="itemized-table">
              <tr>
                <td>Heading</td>
                <td>Amount (INR)</td>
              </tr>
              <tr>
                <td>Total</td>
                <td>${(Math.round(parseFloat(invoice.totalamt || Sub_Total)) || 0).toLocaleString("en-IN")}</td>
              </tr>
              ${(Math.round(parseFloat(invoice.discount)) || 0) > 0
        ? `
              <tr>
                <td>Discount</td>
                <td>${(Math.round(parseFloat(invoice.discount)) || 0).toLocaleString("en-IN")}</td>
              </tr>
              `
        : ""
      }
              <tr>
                <td style="color: #c62828; font-weight: bold;">Total Due</td>
                <td style="color: #c62828; font-weight: bold;">₹ ${(Math.round(parseFloat(invoice.totaldue)) || 0).toLocaleString("en-IN")}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
  
      <p style="padding: 5px 0;">* ${invoice.note || ""}</p>
  
      <table class="total-row-container" border="1">
        <tr>
          <td class="left_align" style="border-right:0;">Total:</td>
          <td class="right_align" style="border-left:0; font-weight:bold;">₹ ${(Math.round(parseFloat(invoice.totalamt || Sub_Total)) || 0).toLocaleString("en-IN")}</td>
          <td class="left_align" style="border-right:0;">Please Pay:</td>
          <td class="right_align" style="border-left:0; font-weight:bold;">
            ₹ ${Math.round(pleasePayAmt).toLocaleString("en-IN")}
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
            <td>For Queries Call: <b>${clinicAddr.invoiceHelplineNo || ""}</b></td>
            <td style="text-align:right;">For Emergency SMS: <b>${clinicAddr.EmergencySMS || ""}</b></td>
          </tr>
        </table>
      </div>

      <div class="btn-container" style="${showPrintBtn ? "" : "display: none;"}">
        <button class="print-btn" onclick="window.print()">Print Invoice</button>
      </div>
    </body>
  </html>
    `;
  };

  const handlePreview = (invoice) => {
    if (!invoice || !invoice.invoice_id) return;

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
        img.onerror = () => resolve("");
        img.src = imgUrl;
      });
    };

    getBase64Image(logo).then((mainLogo) => {
      const html = buildInvoiceHtml(invoice, mainLogo, false);
      setPreviewContent(html);
      setPreviewInvoice(invoice);
      setShowPreviewModal(true);
    });
  };

  const handlePrintPdf = () => {
    const iframe = document.getElementById("invoice-preview-iframe");
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        return;
      } catch (err) {
        console.error("Iframe print error:", err);
      }
    }

    if (previewContent) {
      const printWindow = window.open("", "_blank", "width=900,height=900");
      if (printWindow) {
        printWindow.document.write(previewContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
  };

  const filteredInvoices = useMemo(() => {
    const searchTerm = (filters1.global.value || "").toLowerCase().trim();
    const result = invoices.filter((inv) => {
      // Bill method filter
      if (selectedBillMethod !== "ALL") {
        const itemStatus = (inv.bill_method || inv.status || "").toLowerCase().trim();
        if (itemStatus !== selectedBillMethod.toLowerCase()) {
          return false;
        }
      }

      if (!searchTerm) return true;

      const patientName = (inv.patient_name || inv.name || "").toLowerCase();
      const branchName = (inv.location || inv.branch_name || "").toLowerCase();
      const phone = (inv.patient_phone || inv.phone || "").toLowerCase();
      const invoiceId = String(inv.invoice_id || "").toLowerCase();
      const dueAmt = String(inv.totaldue || "").toLowerCase();
      const billMethod = (inv.bill_method || inv.status || "").toLowerCase();
      const dateStr = inv.creation_date ? moment(inv.creation_date).format("DD-MM-YYYY") : "";
      const overdueStr = inv.due_days !== undefined ? `${inv.due_days} days overdue` : "";

      return (
        patientName.includes(searchTerm) ||
        branchName.includes(searchTerm) ||
        phone.includes(searchTerm) ||
        invoiceId.includes(searchTerm) ||
        dueAmt.includes(searchTerm) ||
        billMethod.includes(searchTerm) ||
        dateStr.includes(searchTerm) ||
        overdueStr.includes(searchTerm)
      );
    });

    return result.sort((a, b) => {
      const locA = (a.location || a.branch_name || "").toLowerCase();
      const locB = (b.location || b.branch_name || "").toLowerCase();
      return locA.localeCompare(locB);
    });
  }, [invoices, filters1.global.value, selectedBillMethod]);

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
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
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
            <InputGroup style={{ position: "relative" }}>
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
              {loading && (
                <div
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 5,
                    pointerEvents: "none",
                  }}
                >
                  <Spinner
                    animation="border"
                    size="sm"
                    variant="info"
                    style={{ width: "12px", height: "12px" }}
                  />
                </div>
              )}
            </InputGroup>
          </Form.Group>

          {/* Branch Filter for SuperAdmin */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Branch
            </span>
            <Form.Select
              size="sm"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              style={{
                width: "150px",
                height: "30px",
                border: "1px solid #4dd0e1",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            >
              <option value="ALL">All Branches</option>
              {branchDisplayList.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </Form.Select>
          </div>

          {/* Bill Method Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                color: "#333",
                whiteSpace: "nowrap",
              }}
            >
              Bill Method
            </span>
            <Form.Select
              size="sm"
              value={selectedBillMethod}
              onChange={(e) => setSelectedBillMethod(e.target.value)}
              style={{
                width: "130px",
                height: "30px",
                border: "1px solid #4dd0e1",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            >
              <option value="ALL">All Methods</option>
              <option value="Cashless">Cashless</option>
              <option value="PDC">PDC</option>
            </Form.Select>
          </div>
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
            flexWrap: "wrap",
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
              customInput={
                <Form.Control
                  style={{ padding: "5px 8px", fontSize: "12px" }}
                />
              }
            />
          </div>
          <Button
            variant="secondary"
            onClick={handleClearFilters}
            style={{
              backgroundColor: "#ff9800",
              border: "none",
              borderRadius: "8px",
              padding: "5px 5px",
              fontSize: "12px",
              fontWeight: "500",
              color: "white",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginTop: "13px",
            }}
          >
            <FeatherIcon icon="filter" size={12} className="me-1" />
            Clear Filter
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
      <PageBreadcrumb pagename="IPD Bills Due List" />

      <Container fluid className="p-0">
        <Row>
          <Col>
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                borderColor: "#00bcd4",
                background: "white",
                border: "1px solid #00bcd4",
                marginLeft: "17px",
                marginRight: "17px",
              }}
            >
              <Card.Body style={{ margin: "4px" }}>
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
                    sortField="location"
                    sortOrder={1}
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
                    rowClassName={rowClassName}
                    className="custom-datatable-centered datatable-medium-small"
                  >
                    {/* Sr No */}
                    <Column
                      header="Sr No"
                      headerClassName="datatable-header-center"
                      style={{ width: "60px", border: "1px solid #4dd0e1" }}
                      body={(rowData, options) => options.rowIndex + 1}
                    />

                    {/* Branch Name */}
                    <Column
                      field="location"
                      header="Branch Name"
                      headerClassName="datatable-header-center"
                      body={(rowData) => "📍" + (rowData.location || rowData.branch_name || "-")}
                      style={{ width: "140px", border: "1px solid #4dd0e1" }}
                    />

                    {/* Bill Date */}
                    <Column
                      field="creation_date"
                      header="Bill Date"
                      headerClassName="datatable-header-center"
                      body={(rowData) => {
                        const rawDate = rowData.creation_date || rowData.due_date;
                        const dateStr = rawDate ? moment(rawDate).format("DD-MM-YYYY") : "-";
                        const dueDays =
                          rowData.due_days !== undefined
                            ? Number(rowData.due_days)
                            : (rawDate ? moment().diff(moment(rawDate), "days") : 0);
                        return (
                          <div style={{ textAlign: "center", lineHeight: "1.3" }}>
                            <span style={{ fontWeight: 600, color: "#222" }}>{dateStr}</span>
                            <div style={{ marginTop: "3px" }}>
                              <span
                                style={{
                                  backgroundColor: "#ffebee",
                                  color: "#c62828",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  fontWeight: "bold",
                                  fontSize: "11px",
                                  display: "inline-block",
                                  border: "1px solid #ffcdd2",
                                }}
                              >
                                {dueDays} {dueDays === 1 ? "day" : "days"} overdue
                              </span>
                            </div>
                          </div>
                        );
                      }}
                      style={{ width: "150px", border: "1px solid #4dd0e1", textAlign: "center" }}
                    />

                    {/* Bill No */}
                    <Column
                      field="invoice_id"
                      header="Bill No"
                      headerClassName="datatable-header-center"
                      body={(rowData) => (
                        <span style={{ fontWeight: 600, color: "#006064" }}>
                          {rowData.invoice_id || rowData.bill_no || rowData.billno || "-"}
                        </span>
                      )}
                      style={{ width: "120px", border: "1px solid #4dd0e1", textAlign: "center" }}
                    />

                    {/* Patient Name */}
                    <Column
                      field="patient_name"
                      header="Patient Name"
                      headerClassName="datatable-header-center"
                      body={(rowData) => (
                        <span>
                          {rowData.prefix ? `${rowData.prefix} ` : ""}
                          {rowData.patient_name || rowData.name || "-"}
                        </span>
                      )}
                      style={{
                        width: "240px",
                        border: "1px solid #4dd0e1",
                        wordBreak: "break-word",
                      }}
                    />

                    {/* Bill Method */}
                    <Column
                      field="status"
                      header="Bill Method"
                      headerClassName="datatable-header-center"
                      body={(rowData) => {
                        const raw = (rowData.bill_method || rowData.status || "-").trim();
                        const isCashless = raw.toLowerCase() === "cashless";
                        const isPdc = raw.toLowerCase() === "pdc";
                        const display = isCashless ? "Cashless" : isPdc ? "PDC" : raw;
                        return (
                          <div className={isCashless ? "cashless-patient" : ""}>
                            <span
                              style={{
                                fontWeight: "bold",
                                color: isCashless ? "#e65100" : isPdc ? "#e65100" : "#333",
                              }}
                            >
                              {display}
                            </span>
                          </div>
                        );
                      }}
                      style={{ width: "130px", border: "1px solid #4dd0e1", textAlign: "center" }}
                    />

                    {/* Due Amount */}
                    <Column
                      field="totaldue"
                      header="Due Amount"
                      headerClassName="datatable-header-center"
                      body={(rowData) => {
                        const amt = Math.round(
                          parseFloat(String(rowData.totaldue || 0).replace(/,/g, "")) || 0
                        );
                        return `₹ ${amt.toLocaleString("en-IN")}`;
                      }}
                      style={{ width: "140px", border: "1px solid #4dd0e1" }}
                    />

                    {/* Action */}
                    <Column
                      header="Action"
                      headerClassName="datatable-header-center"
                      body={(rowData) => (
                        <div className="d-flex justify-content-center gap-1">
                          <Button
                            style={{
                              borderRadius: "8px",
                              padding: "7px 11px",
                              fontSize: "14px",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "#00acc1",
                              borderColor: "#00acc1",
                              color: "#fff",
                            }}
                            title="Preview IPD Bill"
                            onClick={() => handlePreview(rowData)}
                          >
                            <FeatherIcon icon="eye" size="15" />
                          </Button>
                        </div>
                      )}
                      style={{ width: "100px", border: "1px solid #4dd0e1" }}
                    />
                  </DataTable>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Invoice Print Preview Modal - matching IpdBillList.jsx */}
      <Modal
        show={showPreviewModal}
        onHide={() => setShowPreviewModal(false)}
        size="xl"
        centered
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "#e0f7fa",
            borderBottom: "1px solid #00bcd4",
          }}
        >
          <Modal.Title
            style={{ color: "#00838f", fontWeight: "bold", fontSize: "1.1rem" }}
          >
            <FeatherIcon icon="eye" className="me-2" size={18} />
            IPD Bill Preview
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="p-0 bg-light"
          style={{ maxHeight: "80vh", overflowY: "auto" }}
        >
          <div
            className="p-4 bg-white shadow-sm mx-auto"
            style={{ width: "210mm", minHeight: "297mm" }}
          >
            {previewContent ? (
              <iframe
                id="invoice-preview-iframe"
                title="Invoice Preview"
                srcDoc={previewContent}
                style={{ width: "100%", height: "120vh", border: "none" }}
              />
            ) : (
              <div className="text-center p-5">Loading Preview...</div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer
          style={{
            backgroundColor: "#e0f7fa",
            borderTop: "1px solid #00bcd4",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "10px 20px",
            gap: "10px",
          }}
        >
          <Button
            variant="secondary"
            onClick={() => setShowPreviewModal(false)}
            style={{
              borderRadius: "8px",
              padding: "7px 16px",
              fontSize: "13px",
              fontWeight: "500",
              backgroundColor: "#6c757d",
              borderColor: "#6c757d",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <FeatherIcon icon="x" size={14} />
            Cancel
          </Button>
          <Button
            onClick={handlePrintPdf}
            disabled={!previewContent}
            style={{
              borderRadius: "8px",
              padding: "7px 18px",
              fontSize: "13px",
              fontWeight: "600",
              backgroundColor: "#00acc1",
              borderColor: "#00acc1",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <FeatherIcon icon="printer" size={15} />
            Print PDF
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default IpdBillsDueList;
