import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { FilterMatchMode } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Button,
  Modal,
  Badge,
  Spinner,
  Table,
  Nav,
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import DatePicker from "react-datepicker";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { decodeJwt } from "../Utility/decode-jwt";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import logo from "../../assets/images/logo/hhc.png";
import { clinincLoc } from "../Utility/IpdBill_ClinicLocations";
import DischargePrintView from "../Doctor/DischargePrintView";

const BASE_URL = "http://194.195.117.79:5100/api";

const formatOnlyDate = (value) => {
  if (!value) return "-";
  const trimmed = String(value).trim();
  const dateOnlyStr = trimmed.split("T")[0].split(" ")[0];
  const parsed = moment(dateOnlyStr, ["YYYY-MM-DD", "DD-MM-YYYY"]);
  if (parsed.isValid()) {
    return parsed.format("DD-MM-YYYY");
  }
  return value;
};

const formatOnlyTime = (value) => {
  if (!value) return "-";
  const trimmed = value.trim();
  // Check if there is a time component in the string
  const hasTime = /\d{1,2}:\d{2}/.test(trimmed);
  if (!hasTime) {
    return "-";
  }
  const parsed = moment(trimmed, [
    "YYYY-MM-DD HH:mm:ss",
    "YYYY-MM-DD HH:mm",
    "DD-MM-YYYY HH:mm",
    "DD-MM-YYYY hh:mm A",
    "YYYY-MM-DD hh:mm A",
  ]);
  if (parsed.isValid()) {
    return parsed.format("HH:mm");
  }
  return "-";
};

const normalizeDate = (value) => {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const parsed = moment(trimmed, [
    "YYYY-MM-DD HH:mm:ss",
    "YYYY-MM-DD HH:mm",
    "DD-MM-YYYY HH:mm",
    "DD-MM-YYYY hh:mm A",
    "YYYY-MM-DD hh:mm A",
    "YYYY-MM-DD",
    "DD-MM-YYYY",
  ]);
  if (parsed.isValid()) {
    return parsed.toDate();
  }
  return null;
};

const buildSurgeryValue = (date, time) => {
  if (!date) return "";
  if (!time) return date;
  return `${date} ${time}`;
};

const formatAgeGender = (age, sex) => {
  const ageText =
    age === null || age === undefined || age === "" ? "N/A" : `${age} yrs`;
  const sexText = sex ? sex : "N/A";
  return `${ageText} / ${sexText}`;
};

const getDynamicRowsFromInvoice = (invoice) => {
  const dynamicRows = [];
  let titleCalculatedTotal = 0;

  const rowSource =
    invoice.package &&
      typeof invoice.package === "string" &&
      invoice.package !== ""
      ? invoice.package
      : invoice.title && typeof invoice.title === "string"
        ? invoice.title
        : "";

  if (!rowSource) {
    return { dynamicRows: [], Sub_Total: "0.00", totalamt: "0.00" };
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
          parseFloat(
            String(parts[1] || "")
              .trim()
              .replace(/,/g, ""),
          ) || 0;
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
          label: parts[0].trim(),
          value: "0.00",
          field: "title_parsed",
        });
      }
    });
  }

  const Sub_Total =
    titleCalculatedTotal > 0
      ? titleCalculatedTotal
      : parseFloat(
        String(invoice.totalamt || invoice.totalAmt || 0).replace(/,/g, ""),
      ) || 0;

  return {
    dynamicRows:
      dynamicRows.length > 0
        ? dynamicRows
        : [{ label: "", value: "0", field: "" }],
    Sub_Total: Math.round(Sub_Total).toString(),
    totalamt: Math.round(Sub_Total).toString(),
  };
};

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
    img.onerror = () => resolve(imgUrl);
    img.src = imgUrl;
  });
};

const buildInvoiceHtml = (invoice, mainLogo, location, showPrintBtn = true) => {
  const trimmedLocation = location ? location.trim() : "";
  const clinicAddr = clinincLoc[trimmedLocation] ||
    clinincLoc[location] || {
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
      (invoice.status || "").toLowerCase(),
    ) ||
    !!invoice.insurancecompany ||
    !!invoice.insurance_company_name;

  const pleasePayAmt = isInsurance ? totAmt : Math.max(0, totAmt - discAmt);

  return `
<html>
  <head>
    <title>Invoice - ${invoice.invoice_id || ""}</title>
    <style>
      body { margin: 0; padding: 20px; background: #fff; font-family: Arial, sans-serif; font-size: 10px !important; color: #000; }
      .header-table { width: auto; margin-bottom: 15px; }
      .header-logo img { width: 150px; height: auto; max-height: 200px; display: block; }
      .header-address { text-align: left; font-weight: bold; font-size: 10px !important; vertical-align: middle; line-height: 1.2; padding-left: 15px; }
      .details-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
      .details-table td { padding: 4px 8px; width: 25%; vertical-align: top; }
      .details-table td:nth-child(odd) { font-weight: bold; color: #000; }
      .details-table td:nth-child(even) { font-weight: 500; }
      .bill-title { text-align: center; font-weight: 700; padding: 10px 0; font-size: 12px !important; }
      .section-header-table { width: 100%; margin-top: 5px; margin-bottom: 10px; }
      .section-header-table td { width: 50%; text-align: center; font-weight: bold; }
      .itemized-table { width: 100%; border-collapse: collapse; }
      .itemized-table td { padding: 4px 0; vertical-align: top; border-bottom: 1px dotted #666; color: #000; }
      .itemized-table tr:first-child td { border-bottom: 1px solid #666; font-weight: bold; padding-bottom: 5px; }
      .itemized-table td:nth-child(odd) { text-align: left; }
      .itemized-table td:nth-child(even) { text-align: right; }
      .total-row-container { width: 100%; border: 2px solid #000; border-collapse: collapse; margin-top: 10px; }
      .total-row-container td { padding: 6px 10px; }
      .footer { margin-top: 20px; border-top: 1px solid #4b897e; padding-top: 5px; }
      .footer-table { width: 100%; color: #000; }
      .btn-container { display: flex; justify-content: center; margin-top: 20px; }
      .print-btn { background: #2b9163; color: white; padding: 8px 20px; border: none; border-radius: 5px; cursor: pointer; }
      @media print { .btn-container { display: none; } body { margin: 10px; } }
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
        <td>Bill No:</td><td>${invoice.invoice_id || ""}</td>
        <td>Bill Date:</td><td>${getISTDate(invoice.due_date || invoice.creation_date)}</td>
      </tr>
      <tr>
        <td>Patient Name:</td><td>${invoice.prefix || ""} ${invoice.patient_name || invoice.name || ""}</td>
        <td>Gender / Age:</td><td>${invoice.sex || invoice.gender || "N/A"} / ${invoice.age || ""} yrs</td>
      </tr>
      <tr>
        <td>Patient ID:</td><td>${invoice.patient_uid || invoice.Uid_no || "N/A"}</td>
        <td>Admission No:</td><td>${invoice.admission_no || "N/A"}</td>
      </tr>
      <tr>
        <td>Insurance Name:</td>
        <td>${(invoice.status || "").toLowerCase() === "cashless" || (invoice.status || "").toLowerCase() === "reimbursement" || (invoice.status || "").toLowerCase() === "pdc" || invoice.bill_Type === "insurance" ? invoice.insurance_company_name || "" : ""}</td>
        <td>Bed Category:</td><td>${invoice.bed_desc || invoice.bed_no || "N/A"}</td>
      </tr>
      <tr>
        <td>TPA Name:</td>
        <td>${(invoice.status || "").toLowerCase() === "cashless" || (invoice.status || "").toLowerCase() === "reimbursement" || (invoice.status || "").toLowerCase() === "pdc" || invoice.bill_Type === "insurance" ? invoice.tpa_name || "" : ""}</td>
        <td>Admission Date:</td><td>${getISTDate(invoice.creation_date)} ${invoice.admissiontime || ""}</td>
      </tr>
      <tr>
        <td>Doctor Name:</td><td>${invoice.consultant_name || invoice.consultant || "-"}</td>
        <td>Discharge Date:</td><td>${getISTDate(invoice.due_date)} ${invoice.dischargetime || ""}</td>
      </tr>
      <tr>
        <td>Surgeon Name:</td><td>${invoice.surgeon_name || invoice.prepared_doctor || "-"}</td>
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
        <td style="width: 50%; vertical-align: top; border-right: 1px solid #666; padding-right: 10px;">
          <table class="itemized-table">
            <tr>
              <td>Items/Services</td>
              <td>Amount (INR)</td>
            </tr>
            ${dynamicRows.map((row) => `
              <tr>
                <td>${row.label}</td>
                <td>${Math.round(parseFloat(row.value || 0)).toLocaleString("en-IN")}</td>
              </tr>
            `).join("")}
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
            ${(Math.round(parseFloat(invoice.discount)) || 0) > 0 ? `
              <tr>
                <td>Discount</td>
                <td>${(Math.round(parseFloat(invoice.discount)) || 0).toLocaleString("en-IN")}</td>
              </tr>
            ` : ""}
          </table>
        </td>
      </tr>
    </table>
    <p style="padding: 5px 0;">* ${invoice.note || ""}</p>
    <table class="total-row-container" border="1">
      <tr>
        <td style="border-right:0;">Total:</td>
        <td style="border-left:0; font-weight:bold; text-align:right;">₹ ${(Math.round(parseFloat(invoice.totalamt || Sub_Total)) || 0).toLocaleString("en-IN")}</td>
        <td style="border-right:0;">Please Pay:</td>
        <td style="border-left:0; font-weight:bold; text-align:right;">₹ ${Math.round(pleasePayAmt).toLocaleString("en-IN")}</td>
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

export default function IpdPatientList() {
  const navigate = useNavigate();
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("default");
  const [filters1] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  // Patient Details & Records State (Documents, Bill, Discharge Card)
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("documents");
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // 1. Admission Documents State
  const [patientDocuments, setPatientDocuments] = useState({
    aadharCard: null,
    panCard: null,
    cancelledCheque: null,
    pdcCheque: null,
    policyCopy: null,
  });
  const [fullScreenImage, setFullScreenImage] = useState(null);

  // 2. IPD Bills State
  const [patientInvoices, setPatientInvoices] = useState([]);
  const [showBillPreviewModal, setShowBillPreviewModal] = useState(false);
  const [previewInvoiceContent, setPreviewInvoiceContent] = useState("");
  const [selectedPreviewInvoice, setSelectedPreviewInvoice] = useState(null);

  // 3. Discharge Card State
  const [dischargeData, setDischargeData] = useState(null);
  const [showDischargePrintModal, setShowDischargePrintModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [assistanceDoctors, setAssistanceDoctors] = useState([]);

  const dischargePrintRef = useRef(null);
  const triggerPrintDischarge = useReactToPrint({
    contentRef: dischargePrintRef,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCurrentLocation("default");
      return;
    }

    const payload = decodeJwt(token);
    if (payload?.jobLocation) {
      setCurrentLocation(payload.jobLocation);
    }
  }, []);

  const loadPatients = useCallback(async () => {
    if (!currentLocation || currentLocation === "default") {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/admission/list-admissions?location=${encodeURIComponent(currentLocation)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch IPD patients");
      }

      const result = await response.json();
      const normalizedPatients = Array.isArray(result)
        ? result.map((patient) => ({
          ...patient,
          surgeryDate: buildSurgeryValue(
            patient.surgery_date,
            patient.surgery_time,
          ),
          admissionNo: patient.adm_no || "",
          patientName: patient.patient_name || "",
          name: patient.patient_name || "",
          ageGender: formatAgeGender(patient.age, patient.sex),
          roomType: patient.room_type || "N/A",
          surgeonName: patient.surgeon_name || "N/A",
          sxPlan: patient.sx_plan || "N/A",
          Uid_no: patient.uid_no || "",
          patient_type: patient.patient_type ?? 0,
          phone: patient.phone || "",
          age: patient.age || "",
          sex: patient.sex || "",
          address: patient.address || "",
        }))
        : [];

      setPatients(normalizedPatients);
      setFirst(0);
    } catch (error) {
      console.error("Error loading IPD patients:", error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [currentLocation]);

  useEffect(() => {
    if (currentLocation !== "default") {
      loadPatients();
    }
  }, [currentLocation, loadPatients]);

  const filteredPatients = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase();

    return patients.filter((patient) => {
      const matchesSearch =
        !searchValue ||
        [
          patient.surgeryDate,
          patient.admissionNo,
          patient.patientName,
          patient.phone,
          patient.ageGender,
          patient.roomType,
          patient.roomNo,
          patient.surgeonName,
          patient.sxPlan,
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchValue);

      const patientDate = normalizeDate(patient.surgeryDate);

      let matchesFrom = true;
      if (fromDate && patientDate) {
        const startOfFrom = moment(fromDate).startOf("day").toDate();
        matchesFrom = patientDate >= startOfFrom;
      }

      let matchesTo = true;
      if (toDate && patientDate) {
        const endOfTo = moment(toDate).endOf("day").toDate();
        matchesTo = patientDate <= endOfTo;
      }

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [fromDate, patients, searchTerm, toDate]);

  const handleTodayPatients = () => {
    const today = new Date();
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const end = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    setFromDate(start);
    setToDate(end);
  };

  const handleClearFilters = () => {
    setFromDate(null);
    setToDate(null);
    setSearchTerm("");
    setFirst(0);
  };

  useEffect(() => {
    if (currentLocation && currentLocation !== "default") {
      fetch(
        `${BASE_URL}/V1/doctor/mainDoctorDropdown?location=${encodeURIComponent(currentLocation)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          const list = Array.isArray(data) ? data : data?.data || [];
          setDoctors(list);
        })
        .catch(() => { });

      fetch(
        `${BASE_URL}/V1/doctor/assistanceDoctorDropdown?location=${encodeURIComponent(currentLocation)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          const list = Array.isArray(data) ? data : data?.data || [];
          setAssistanceDoctors(list);
        })
        .catch(() => { });
    }
  }, [currentLocation]);

  const getDoctorName = (docId) => {
    if (!docId) return "-";
    const found =
      doctors.find((d) => String(d.doctor_id) === String(docId)) ||
      assistanceDoctors.find((d) => String(d.doctor_id) === String(docId));
    return found ? found.name : String(docId);
  };

  const printInvoice = (invoice) => {
    if (!invoice || typeof invoice !== "object" || !invoice.invoice_id) return;
    getBase64Image(logo).then((mainLogo) => {
      const html = buildInvoiceHtml(invoice, mainLogo, currentLocation, true);
      const printWindow = window.open("", "_blank", "width=900,height=900");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
      }
    });
  };

  const previewInvoice = (invoice) => {
    if (!invoice || typeof invoice !== "object" || !invoice.invoice_id) return;
    getBase64Image(logo).then((mainLogo) => {
      const html = buildInvoiceHtml(invoice, mainLogo, currentLocation, false);
      setPreviewInvoiceContent(html);
      setSelectedPreviewInvoice(invoice);
      setShowBillPreviewModal(true);
    });
  };

  const handleOpenPatientDetails = (patient) => {
    setSelectedPatient(patient);
    setShowDetailsModal(true);
    setActiveModalTab("documents");
    fetchPatientRecords(patient);
  };

  const fetchPatientRecords = async (patient) => {
    setDetailsLoading(true);

    const uhid = patient.Uid_no || patient.uid_no || "";
    const phone = patient.phone || "";
    const admNo = patient.admissionNo || patient.adm_no || "";
    const name = patient.patientName || patient.name || "";
    const patientId = patient.patient_id || null;

    // 1. Fetch Admission Documents
    let docs = {
      aadharCard: null,
      panCard: null,
      cancelledCheque: null,
      pdcCheque: null,
      policyCopy: null,
    };
    try {
      const q = uhid || admNo || phone || name;
      if (q) {
        const docRes = await fetch(
          `${BASE_URL}/V1/doctor/manage-admission/search?query=${encodeURIComponent(q)}&location=${encodeURIComponent(currentLocation)}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (docRes.ok) {
          const docList = await docRes.json();
          if (Array.isArray(docList) && docList.length > 0) {
            const matched =
              docList.find(
                (d) =>
                  (uhid && String(d.uid).trim() === String(uhid).trim()) ||
                  (admNo && String(d.admission_no).trim() === String(admNo).trim()) ||
                  (phone && String(d.patient_phone).trim() === String(phone).trim())
              ) || docList[0];

            docs = {
              aadharCard: matched.aadharcard || null,
              panCard: matched.pancard || null,
              cancelledCheque: matched.cancelled_cheque || null,
              pdcCheque: matched.pdc_cheque || null,
              policyCopy: matched.policy_copy || null,
            };
          }
        }
      }
    } catch (err) {
      console.error("Error loading patient documents:", err);
    }
    setPatientDocuments(docs);

    // 2. Fetch IPD Bills
    let bills = [];
    try {
      const billQuery = phone || name || uhid;
      if (billQuery) {
        const billRes = await fetch(
          `${BASE_URL}/V1/invoice/searchInvoices?query=${encodeURIComponent(billQuery)}&location=${encodeURIComponent(currentLocation)}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (billRes.ok) {
          const billData = await billRes.json();
          const rawInvoices = Array.isArray(billData.data) ? billData.data : [];
          const matchedBills = rawInvoices.filter((inv) => {
            const pPhone = inv.patient_phone || inv.phone;
            const pUid = inv.patient_uid || inv.Uid_no || inv.uid;
            const pName = (inv.patient_name || inv.name || "").toLowerCase().trim();
            const pAdm = inv.admission_no;

            const matchesPhone = phone && pPhone && String(pPhone).trim() === String(phone).trim();
            const matchesUid = uhid && pUid && String(pUid).trim() === String(uhid).trim();
            const matchesAdm = admNo && pAdm && String(pAdm).trim() === String(admNo).trim();
            const matchesName = name && pName && pName === name.toLowerCase().trim();

            return matchesPhone || matchesUid || matchesAdm || matchesName;
          });

          bills = matchedBills.length > 0 ? matchedBills : rawInvoices;
        }
      }
    } catch (err) {
      console.error("Error loading patient IPD bills:", err);
    }
    setPatientInvoices(bills);

    // 3. Fetch Discharge Card
    let dData = null;
    try {
      let resolvedPatientId = null;

      // Primary check: Resolve master patient_id using Uid_no (e.g. HHC/KOP/116)
      if (uhid) {
        try {
          const pRes = await fetch(
            `${BASE_URL}/V1/patient/getPatient/${encodeURIComponent(uhid)}?location=${encodeURIComponent(currentLocation)}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (pRes.ok) {
            const pJson = await pRes.json();
            if (pJson.data?.patient_id) {
              resolvedPatientId = pJson.data.patient_id;
            }
          }
        } catch (err) {
          console.error("Error resolving patient by UID:", err);
        }
      }

      // Secondary check: Resolve master patient_id using phone if UID didn't resolve
      if (!resolvedPatientId && phone) {
        try {
          const pRes = await fetch(
            `${BASE_URL}/V1/appointment/getPatientByMobile?patient_phone=${encodeURIComponent(phone)}&location=${encodeURIComponent(currentLocation)}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (pRes.ok) {
            const pJson = await pRes.json();
            const pData = Array.isArray(pJson.data) ? pJson.data[0] : (pJson.data || pJson);
            if (pData?.patient_id) {
              resolvedPatientId = pData.patient_id;
            }
          }
        } catch (err) {
          console.error("Error resolving patient by phone:", err);
        }
      }

      // Tertiary fallback: If still null, fallback to patientId
      if (!resolvedPatientId) {
        resolvedPatientId = patientId;
      }

      if (resolvedPatientId) {
        // Step A: Check list of discharge dates
        const datesRes = await fetch(
          `${BASE_URL}/V1/doctor/list-discharge-dates/${resolvedPatientId}?location=${encodeURIComponent(currentLocation)}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (datesRes.ok) {
          const datesData = await datesRes.json();
          if (datesData.statusCode === 200 && Array.isArray(datesData.data) && datesData.data.length > 0) {
            const latestId = datesData.data[0].id;
            const cardRes = await fetch(
              `${BASE_URL}/V1/doctor/get-discharge-card/${resolvedPatientId}?dischargeId=${latestId}&location=${encodeURIComponent(currentLocation)}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            if (cardRes.ok) {
              const cardData = await cardRes.json();
              if (cardData.statusCode === 200 && cardData.data) {
                dData = cardData.data;
              }
            }
          }
        }

        // Step B: Direct fallback to get-discharge-card if list-discharge-dates didn't return a card
        if (!dData) {
          const directRes = await fetch(
            `${BASE_URL}/V1/doctor/get-discharge-card/${resolvedPatientId}?location=${encodeURIComponent(currentLocation)}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (directRes.ok) {
            const directData = await directRes.json();
            if (directData.statusCode === 200 && directData.data) {
              dData = directData.data;
            }
          }
        }
      }

      // Step C: If still not found and patientId is different from resolvedPatientId, attempt fallback with patientId
      if (!dData && patientId && String(patientId) !== String(resolvedPatientId)) {
        const fallbackRes = await fetch(
          `${BASE_URL}/V1/doctor/get-discharge-card/${patientId}?location=${encodeURIComponent(currentLocation)}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (fallbackData.statusCode === 200 && fallbackData.data) {
            dData = fallbackData.data;
          }
        }
      }
    } catch (err) {
      console.error("Error loading discharge card:", err);
    }
    setDischargeData(dData);

    setDetailsLoading(false);
  };

  const handleRefresh = () => {
    loadPatients();
  };

  const actionsBodyTemplate = (rowData) => {
    return (
      <div className="d-flex align-items-center justify-content-center gap-1">
        {/* IPD Forms button commented as requested:
        <Button
          variant="primary"
          className="btn-primary btn-extra-small btn-icon"
          title="IPD Forms"
          onClick={() =>
            navigate("/ipd-patient-forms", { state: { patient: rowData } })
          }
          style={{
            borderRadius: "6px",
            padding: "5px 8px",
          }}
        >
          <FeatherIcon icon="file-text" size="16" />
        </Button>
        */}

        <Button
          variant="info"
          className="btn-info btn-extra-small btn-icon"
          title="View Patient Records (Documents, IPD Bill & Discharge Card)"
          onClick={() => handleOpenPatientDetails(rowData)}
          style={{
            borderRadius: "6px",
            padding: "5px 8px",
            color: "#fff",
            backgroundColor: "#00bcd4",
            borderColor: "#00bcd4",
          }}
        >
          <FeatherIcon icon="eye" size="16" />
        </Button>
      </div>
    );
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
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
              onChange={(e) => setRows(parseInt(e.target.value, 10))}
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
            style={{
              display: "flex",
              alignItems: "center",
              margin: 0,
            }}
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Global Search"
                style={{
                  borderRadius: "6px",
                  border: "1px solid #4dd0e1",
                  padding: "3px 8px",
                  width: "200px",
                  height: "26px",
                  fontSize: "12px",
                  transition: "all 0.3s ease",
                }}
              />
            </InputGroup>
          </Form.Group>

          <Button
            variant="info"
            onClick={handleTodayPatients}
            style={{
              backgroundColor: "#29b6f6",
              border: "none",
              borderRadius: "6px",
              padding: "5px 10px",
              fontSize: "12px",
              fontWeight: "500",
              color: "white",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <FeatherIcon icon="calendar" size={12} className="me-1" />
            Today's Patients
          </Button>
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
              placeholderText="Select from date"
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
              placeholderText="Select to date"
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
        fontFamily: "'Poppins', Arial, sans-serif",
        minHeight: "100vh",
        padding: "10px",
      }}
    >
      <PageBreadcrumb pagename="IPD Patient List" />

      <div className="theme-body" style={{ minHeight: "100vh" }}>
        <Container fluid>
          <Row>
            <Col>
              <Card
                style={{
                  borderRadius: "10px",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "1.5px solid #00bcd4",
                  margin: "10px -10px 12px -10px",
                }}
              >
                <Card.Body style={{ marginTop: "-6px" }}>
                  <DataTable
                    value={filteredPatients}
                    paginator
                    rows={rows}
                    first={first}
                    onPage={(e) => {
                      setFirst(e.first);
                      setRows(e.rows);
                    }}
                    filters={filters1}
                    header={renderHeader()}
                    globalFilterFields={[
                      "admissionNo",
                      "patientName",
                      "ageGender",
                      "roomType",
                      "roomNo",
                      "surgeonName",
                      "sxPlan",
                    ]}
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                    responsiveLayout="scroll"
                    className="datatable-compact-style datatable-medium-small"
                  >
                    <Column
                      header="Sr. No."
                      body={(rowData, options) => (
                        <span className="selectable-text">
                          {options.rowIndex + 1}
                        </span>
                      )}
                      headerClassName="datatable-header-center"
                      style={{
                        border: "1px solid #90caf9",
                        textAlign: "center",
                        padding: "0.75rem",
                        width: "70px",
                      }}
                    />

                    <Column
                      field="surgeryDate"
                      header="Surgery Date"
                      body={(rowData) => (
                        <span className="selectable-text">
                          {formatOnlyDate(rowData.surgeryDate)}
                        </span>
                      )}
                      headerClassName="datatable-header-center"
                      style={{
                        border: "1px solid #90caf9",
                        textAlign: "center",
                        padding: "0.75rem",
                        width: "140px",
                      }}
                    />

                    <Column
                      field="surgeryDate"
                      header="Surgery Time"
                      body={(rowData) => (
                        <span className="selectable-text">
                          {formatOnlyTime(rowData.surgeryDate)}
                        </span>
                      )}
                      headerClassName="datatable-header-center"
                      style={{
                        border: "1px solid #90caf9",
                        textAlign: "center",
                        padding: "0.75rem",
                        width: "110px",
                      }}
                    />

                    <Column
                      field="admissionNo"
                      header="Admission Number"
                      body={(rowData) => {
                        const isPending =
                          !rowData.admissionNo ||
                          rowData.admissionNo === "PENDING";
                        return isPending ? (
                          <span
                            className="selectable-text text-danger fw-bold"
                            title="Confirm admission and create an IPD bill. The assigned admission number will reflect here."
                            style={{ cursor: "help" }}
                          >
                            Pending
                          </span>
                        ) : (
                          <span className="selectable-text">
                            {rowData.admissionNo}
                          </span>
                        );
                      }}
                      headerClassName="datatable-header-center"
                      style={{
                        border: "1px solid #90caf9",
                        textAlign: "center",
                        padding: "0.75rem",
                        width: "130px",
                      }}
                    />

                    <Column
                      field="patientName"
                      header="Patient Name"
                      body={(rowData) => (
                        <span className="selectable-text">
                          {rowData.patientName || "-"}
                        </span>
                      )}
                      headerClassName="datatable-header-center"
                      style={{
                        border: "1px solid #90caf9",
                        textAlign: "center",
                        padding: "0.75rem",
                        minWidth: "160px",
                      }}
                    />

                    <Column
                      field="phone"
                      header="Contact Number"
                      body={(rowData) => (
                        <span className="selectable-text">
                          {rowData.phone || "-"}
                        </span>
                      )}
                      headerClassName="datatable-header-center"
                      style={{
                        border: "1px solid #90caf9",
                        textAlign: "center",
                        padding: "0.75rem",
                        width: "130px",
                      }}
                    />

                    <Column
                      field="ageGender"
                      header="Age/Gender"
                      body={(rowData) => (
                        <span className="selectable-text">
                          {rowData.ageGender || "-"}
                        </span>
                      )}
                      headerClassName="datatable-header-center"
                      style={{
                        border: "1px solid #90caf9",
                        textAlign: "center",
                        padding: "0.75rem",
                        width: "120px",
                      }}
                    />

                    {/* <Column
                      field="roomType"
                      header="Bed Category"
                      body={(rowData) => <span className="selectable-text">{rowData.roomType || "-"}</span>}
                      headerClassName="datatable-header-center"
                      style={{
                        border: "1px solid #90caf9",
                        textAlign: "center",
                        padding: "0.75rem",
                        width: "140px",
                      }}
                    /> */}

                    <Column
                      field="surgeonName"
                      header="Surgeon Name"
                      body={(rowData) => (
                        <span className="selectable-text">
                          {rowData.surgeonName || "-"}
                        </span>
                      )}
                      headerClassName="datatable-header-center"
                      style={{
                        border: "1px solid #90caf9",
                        textAlign: "center",
                        padding: "0.75rem",
                        minWidth: "160px",
                      }}
                    />

                    <Column
                      field="sxPlan"
                      header="SX Plan"
                      body={(rowData) => (
                        <span className="selectable-text">
                          {rowData.sxPlan || "-"}
                        </span>
                      )}
                      headerClassName="datatable-header-center"
                      style={{
                        border: "1px solid #90caf9",
                        textAlign: "center",
                        padding: "0.75rem",
                        minWidth: "200px",
                      }}
                    />

                    <Column
                      header="Actions"
                      body={actionsBodyTemplate}
                      headerClassName="datatable-header-center"
                      style={{
                        border: "1px solid #90caf9",
                        textAlign: "center",
                        padding: "0.75rem",
                        width: "100px",
                      }}
                    />
                  </DataTable>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {/* Patient Records Modal (Documents, IPD Bill, Discharge Card) */}
          <Modal
            show={showDetailsModal}
            onHide={() => setShowDetailsModal(false)}
            size="xl"
            centered
          >
            <Modal.Header
              closeButton
              style={{
                backgroundColor: "#e0f7fa",
                borderBottom: "2px solid #00bcd4",
                padding: "12px 20px",
              }}
            >
              <Modal.Title style={{ color: "#00838f", fontWeight: "bold", fontSize: "16px" }}>
                <FeatherIcon icon="folder" className="me-2" size={18} />
                Patient Records - {selectedPatient?.patientName || "Patient Details"} ({selectedPatient?.phone})
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: "10px 10px", maxHeight: "80vh", overflowY: "auto" }}>
              {/* Header Summary Banner */}
              <div
                style={{
                  backgroundColor: "#e0f7fa",
                  border: "1px solid #4dd0e1",
                  borderRadius: "8px",
                  padding: "2px 16px",
                  marginBottom: "10px",
                }}
              >
                <Row className="align-items-center g-2" style={{ fontSize: "13px" }}>
                  <Col md={3} sm={6}>
                    <span className="text-muted d-block" style={{ fontSize: "11px" }}>Surgery Date</span>
                    <strong style={{ color: "#00838f", fontSize: "14px" }}>
                      {selectedPatient?.surgeryDate ? formatOnlyDate(selectedPatient.surgeryDate) : "-"}
                    </strong>
                  </Col>
                  <Col md={3} sm={6}>
                    <span className="text-muted d-block" style={{ fontSize: "11px" }}>UID No</span>
                    <strong>{selectedPatient?.Uid_no || "-"}</strong>
                  </Col>
                  <Col md={3} sm={6}>
                    <span className="text-muted d-block" style={{ fontSize: "11px" }}>Patient Name</span>
                    <strong style={{ color: "#00838f", fontSize: "14px" }}>
                      {selectedPatient?.patientName || "-"}
                    </strong>
                  </Col>
                  <Col md={3} sm={6}>
                    <span className="text-muted d-block" style={{ fontSize: "11px" }}>Contact No</span>
                    <strong>{selectedPatient?.phone || "-"}</strong>
                  </Col>
                </Row>
              </div>

              {/* Navigation Pills */}
              <Nav
                variant="pills"
                className="mb-3 d-flex gap-2"
                activeKey={activeModalTab}
                onSelect={(k) => setActiveModalTab(k)}
                style={{
                  borderBottom: "1px solid #dee2e6",
                  paddingBottom: "8px",
                }}
              >
                <Nav.Item>
                  <Nav.Link
                    eventKey="documents"
                    style={{
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "13px",
                      padding: "8px 16px",
                      cursor: "pointer",
                      backgroundColor: activeModalTab === "documents" ? "#00bcd4" : "#f1f3f5",
                      color: activeModalTab === "documents" ? "#fff" : "#495057",
                    }}
                  >
                    <FeatherIcon icon="file" size={14} className="me-1" />
                    Admission Documents
                    <Badge
                      bg={Object.values(patientDocuments).filter(Boolean).length > 0 ? "success" : "secondary"}
                      className="ms-2"
                      style={{ fontSize: "10px" }}
                    >
                      {Object.values(patientDocuments).filter(Boolean).length} / 5
                    </Badge>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    eventKey="bill"
                    style={{
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "13px",
                      padding: "8px 16px",
                      cursor: "pointer",
                      backgroundColor: activeModalTab === "bill" ? "#00bcd4" : "#f1f3f5",
                      color: activeModalTab === "bill" ? "#fff" : "#495057",
                    }}
                  >
                    <FeatherIcon icon="credit-card" size={14} className="me-1" />
                    IPD Bill
                    <Badge
                      bg={patientInvoices.length > 0 ? "success" : "secondary"}
                      className="ms-2"
                      style={{ fontSize: "10px" }}
                    >
                      {patientInvoices.length}
                    </Badge>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    eventKey="discharge"
                    style={{
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "13px",
                      padding: "8px 16px",
                      cursor: "pointer",
                      backgroundColor: activeModalTab === "discharge" ? "#00bcd4" : "#f1f3f5",
                      color: activeModalTab === "discharge" ? "#fff" : "#495057",
                    }}
                  >
                    <FeatherIcon icon="clipboard" size={14} className="me-1" />
                    Discharge Card
                    <Badge
                      bg={dischargeData ? "success" : "secondary"}
                      className="ms-2"
                      style={{ fontSize: "10px" }}
                    >
                      {dischargeData ? "Available" : "Not Created"}
                    </Badge>
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              {detailsLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="info" />
                  <p className="mt-2 text-muted" style={{ fontSize: "13px" }}>
                    Loading patient documents, bill & discharge card...
                  </p>
                </div>
              ) : (
                <div>
                  {/* Tab 1: Admission Documents */}
                  {activeModalTab === "documents" && (
                    <div>
                      <Row className="g-3">
                        {[
                          { key: "aadharCard", title: "Aadhar Card", icon: "credit-card" },
                          { key: "panCard", title: "PAN Card", icon: "credit-card" },
                          { key: "cancelledCheque", title: "Cancelled Cheque", icon: "file-text" },
                          { key: "pdcCheque", title: "PDC Cheque", icon: "calendar" },
                          { key: "policyCopy", title: "Policy Copy", icon: "file" },
                        ].map((doc) => {
                          const docUrl = patientDocuments[doc.key];
                          return (
                            <Col md={4} sm={6} key={doc.key}>
                              <Card className="h-100 shadow-sm" style={{ borderRadius: "10px", border: "1px solid #b2ebf2" }}>
                                <Card.Header
                                  style={{
                                    backgroundColor: "#e0f7fa",
                                    borderBottom: "1px solid #b2ebf2",
                                    padding: "8px 12px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <span style={{ fontWeight: "600", fontSize: "12.5px", color: "#00838f" }}>
                                    <FeatherIcon icon={doc.icon} size={14} className="me-1" />
                                    {doc.title}
                                  </span>
                                  <Badge bg={docUrl ? "success" : "secondary"} style={{ fontSize: "10px" }}>
                                    {docUrl ? "Uploaded" : "Not Uploaded"}
                                  </Badge>
                                </Card.Header>
                                <Card.Body className="text-center p-3 d-flex flex-column justify-content-center align-items-center">
                                  {docUrl ? (
                                    <>
                                      <div
                                        onClick={() => setFullScreenImage(docUrl)}
                                        title="Click to view full image"
                                        style={{
                                          width: "100%",
                                          height: "140px",
                                          borderRadius: "8px",
                                          overflow: "hidden",
                                          border: "1px solid #00bcd4",
                                          cursor: "pointer",
                                          backgroundColor: "#f8f9fa",
                                          marginBottom: "8px",
                                        }}
                                      >
                                        <img
                                          src={docUrl}
                                          alt={doc.title}
                                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                      </div>
                                      <div className="d-flex gap-2">
                                        <Button
                                          variant="outline-info"
                                          size="sm"
                                          onClick={() => setFullScreenImage(docUrl)}
                                          style={{ fontSize: "11px", borderRadius: "6px" }}
                                        >
                                          <FeatherIcon icon="eye" size={12} className="me-1" />
                                          Full Preview
                                        </Button>
                                        <Button
                                          variant="outline-secondary"
                                          size="sm"
                                          as="a"
                                          href={docUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{ fontSize: "11px", borderRadius: "6px" }}
                                        >
                                          <FeatherIcon icon="external-link" size={12} className="me-1" />
                                          Open
                                        </Button>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="py-4 text-muted">
                                      <FeatherIcon icon="file-text" size={36} className="text-black-50 mb-2" />
                                      <div style={{ fontSize: "12px" }}>Not Uploaded</div>
                                    </div>
                                  )}
                                </Card.Body>
                              </Card>
                            </Col>
                          );
                        })}
                      </Row>
                    </div>
                  )}

                  {/* Tab 2: IPD Bill */}
                  {activeModalTab === "bill" && (
                    <div>
                      {patientInvoices.length > 0 ? (
                        <>
                          <Row className="g-2 mb-3">
                            <Col md={3} sm={6}>
                              <div style={{ backgroundColor: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: "8px", padding: "10px" }}>
                                <small className="text-muted d-block" style={{ fontSize: "11px" }}>Total Invoices</small>
                                <strong style={{ fontSize: "18px", color: "#2e7d32" }}>{patientInvoices.length}</strong>
                              </div>
                            </Col>
                            <Col md={3} sm={6}>
                              <div style={{ backgroundColor: "#e3f2fd", border: "1px solid #90caf9", borderRadius: "8px", padding: "10px" }}>
                                <small className="text-muted d-block" style={{ fontSize: "11px" }}>Total Amount</small>
                                <strong style={{ fontSize: "18px", color: "#1565c0" }}>
                                  ₹ {Math.round(patientInvoices.reduce((acc, inv) => acc + (parseFloat(inv.totalamt || inv.total_amt || 0) || 0), 0)).toLocaleString("en-IN")}
                                </strong>
                              </div>
                            </Col>
                            <Col md={3} sm={6}>
                              <div style={{ backgroundColor: "#fff8e1", border: "1px solid #ffe082", borderRadius: "8px", padding: "10px" }}>
                                <small className="text-muted d-block" style={{ fontSize: "11px" }}>Received / Paid</small>
                                <strong style={{ fontSize: "18px", color: "#f57f17" }}>
                                  ₹ {Math.round(patientInvoices.reduce((acc, inv) => acc + (parseFloat(inv.receivedamt || inv.received_amt || 0) || 0), 0)).toLocaleString("en-IN")}
                                </strong>
                              </div>
                            </Col>
                            <Col md={3} sm={6}>
                              <div style={{ backgroundColor: "#ffebee", border: "1px solid #ffcdd2", borderRadius: "8px", padding: "10px" }}>
                                <small className="text-muted d-block" style={{ fontSize: "11px" }}>Total Due</small>
                                <strong style={{ fontSize: "18px", color: "#c62828" }}>
                                  ₹ {Math.round(patientInvoices.reduce((acc, inv) => acc + (parseFloat(inv.totaldue !== undefined ? inv.totaldue : (inv.due_amt || 0)) || 0), 0)).toLocaleString("en-IN")}
                                </strong>
                              </div>
                            </Col>
                          </Row>

                          <Table responsive bordered hover style={{ fontSize: "12.5px" }}>
                            <thead style={{ backgroundColor: "#e0f7fa" }}>
                              <tr>
                                <th>#</th>
                                <th>Bill No</th>
                                <th>Date</th>
                                <th>Payment Category</th>
                                <th>Total (₹)</th>
                                <th>Discount (₹)</th>
                                <th>Received (₹)</th>
                                <th>Due (₹)</th>
                                <th style={{ textAlign: "center" }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {patientInvoices.map((inv, idx) => (
                                <tr key={inv.invoice_id || idx}>
                                  <td>{idx + 1}</td>
                                  <td><strong style={{ color: "#00838f" }}>{inv.invoice_id}</strong></td>
                                  <td>{formatOnlyDate(inv.creation_date)}</td>
                                  <td>
                                    <Badge bg="info" style={{ fontSize: "11px" }}>
                                      {inv.status || inv.pay_mode || "NonInsurance"}
                                    </Badge>
                                  </td>
                                  <td>₹ {Math.round(parseFloat(inv.totalamt || inv.total_amt || 0)).toLocaleString("en-IN")}</td>
                                  <td>₹ {Math.round(parseFloat(inv.discount || 0)).toLocaleString("en-IN")}</td>
                                  <td className="text-success fw-bold">₹ {Math.round(parseFloat(inv.receivedamt || inv.received_amt || 0)).toLocaleString("en-IN")}</td>
                                  <td className="text-danger fw-bold">₹ {Math.round(parseFloat(inv.totaldue !== undefined ? inv.totaldue : (inv.due_amt || 0))).toLocaleString("en-IN")}</td>
                                  <td style={{ textAlign: "center" }}>
                                    <div className="d-flex justify-content-center gap-1">
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        title="Preview & Print Bill"
                                        onClick={() => previewInvoice(inv)}
                                        style={{ fontSize: "11px", borderRadius: "6px", padding: "4px 8px" }}
                                      >
                                        <FeatherIcon icon="eye" size={12} className="me-1" />
                                        View Bill
                                      </Button>
                                      <Button
                                        variant="outline-success"
                                        size="sm"
                                        title="Direct Print"
                                        onClick={() => printInvoice(inv)}
                                        style={{ fontSize: "11px", borderRadius: "6px", padding: "4px 8px" }}
                                      >
                                        <FeatherIcon icon="printer" size={12} className="me-1" />
                                        Print
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </>
                      ) : (
                        <div className="text-center py-5 text-muted">
                          <FeatherIcon icon="credit-card" size={42} className="text-black-50 mb-2" />
                          <h5>No IPD Bill Found</h5>
                          <p style={{ fontSize: "12.5px" }}>An IPD bill has not been generated for this patient yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 3: Discharge Card */}
                  {activeModalTab === "discharge" && (
                    <div>
                      {dischargeData ? (
                        <div>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex gap-2 align-items-center">
                              <Badge bg="primary" style={{ fontSize: "12px", padding: "6px 10px" }}>
                                Discharge Type: {dischargeData.discharge_type || "Normal"}
                              </Badge>
                              {dischargeData.final_dc && (
                                <Badge bg="success" style={{ fontSize: "12px", padding: "6px 10px" }}>
                                  Final DC
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="info"
                              className="text-white"
                              size="sm"
                              onClick={() => setShowDischargePrintModal(true)}
                              style={{ borderRadius: "8px", fontWeight: "600" }}
                            >
                              <FeatherIcon icon="printer" size={14} className="me-1" />
                              Print Discharge Card
                            </Button>
                          </div>

                          <Row className="g-3">
                            <Col md={6}>
                              <Card className="h-100" style={{ borderRadius: "8px", border: "1px solid #b2ebf2" }}>
                                <Card.Header style={{ backgroundColor: "#e0f7fa", fontWeight: "600", fontSize: "13px", color: "#00838f" }}>
                                  <FeatherIcon icon="clock" size={14} className="me-1" /> Admission & Discharge Schedule
                                </Card.Header>
                                <Card.Body style={{ fontSize: "12.5px" }}>
                                  <Row className="mb-2">
                                    <Col sm={5} className="text-muted">Date of Admission:</Col>
                                    <Col sm={7}><strong>{formatOnlyDate(dischargeData.doa)} {dischargeData.admission_time || ""}</strong></Col>
                                  </Row>
                                  <Row className="mb-2">
                                    <Col sm={5} className="text-muted">Date of Discharge:</Col>
                                    <Col sm={7}><strong>{formatOnlyDate(dischargeData.dod)} {dischargeData.discharge_time || ""}</strong></Col>
                                  </Row>
                                  <Row className="mb-2">
                                    <Col sm={5} className="text-muted">IPD No:</Col>
                                    <Col sm={7}><strong>{dischargeData.ipd_no || selectedPatient?.admissionNo || "-"}</strong></Col>
                                  </Row>
                                  <Row className="mb-2">
                                    <Col sm={5} className="text-muted">Reason for Admission:</Col>
                                    <Col sm={7}>{dischargeData.reason_for_admission || "-"}</Col>
                                  </Row>
                                </Card.Body>
                              </Card>
                            </Col>

                            <Col md={6}>
                              <Card className="h-100" style={{ borderRadius: "8px", border: "1px solid #b2ebf2" }}>
                                <Card.Header style={{ backgroundColor: "#e0f7fa", fontWeight: "600", fontSize: "13px", color: "#00838f" }}>
                                  <FeatherIcon icon="activity" size={14} className="me-1" /> Vitals & Examination
                                </Card.Header>
                                <Card.Body style={{ fontSize: "12.5px" }}>
                                  <Row className="g-2 text-center">
                                    <Col xs={4}>
                                      <div className="p-2 border rounded bg-light">
                                        <small className="text-muted d-block">BP</small>
                                        <strong>{dischargeData.bp || "-"}</strong>
                                      </div>
                                    </Col>
                                    <Col xs={4}>
                                      <div className="p-2 border rounded bg-light">
                                        <small className="text-muted d-block">Pulse</small>
                                        <strong>{dischargeData.pulse || "-"}</strong>
                                      </div>
                                    </Col>
                                    <Col xs={4}>
                                      <div className="p-2 border rounded bg-light">
                                        <small className="text-muted d-block">Temp</small>
                                        <strong>{dischargeData.temp || "-"}</strong>
                                      </div>
                                    </Col>
                                    <Col xs={4}>
                                      <div className="p-2 border rounded bg-light">
                                        <small className="text-muted d-block">RR</small>
                                        <strong>{dischargeData.rr || "-"}</strong>
                                      </div>
                                    </Col>
                                    <Col xs={4}>
                                      <div className="p-2 border rounded bg-light">
                                        <small className="text-muted d-block">SpO2</small>
                                        <strong>{dischargeData.spo2 || "-"}</strong>
                                      </div>
                                    </Col>
                                    <Col xs={4}>
                                      <div className="p-2 border rounded bg-light">
                                        <small className="text-muted d-block">Pain Score</small>
                                        <strong>{dischargeData.pain_score || "-"}</strong>
                                      </div>
                                    </Col>
                                  </Row>
                                </Card.Body>
                              </Card>
                            </Col>

                            <Col md={12}>
                              <Card style={{ borderRadius: "8px", border: "1px solid #b2ebf2" }}>
                                <Card.Header style={{ backgroundColor: "#e0f7fa", fontWeight: "600", fontSize: "13px", color: "#00838f" }}>
                                  <FeatherIcon icon="file-text" size={14} className="me-1" /> Clinical Summary & Surgery
                                </Card.Header>
                                <Card.Body style={{ fontSize: "12.5px" }}>
                                  <Row className="mb-2">
                                    <Col md={2} className="text-muted">Diagnosis:</Col>
                                    <Col md={10}><strong>{dischargeData.diagnosis || "-"}</strong></Col>
                                  </Row>
                                  <Row className="mb-2">
                                    <Col md={2} className="text-muted">Surgery Type:</Col>
                                    <Col md={10}>
                                      {Array.isArray(dischargeData.surgery_type)
                                        ? dischargeData.surgery_type.join(", ")
                                        : dischargeData.surgery_type || "-"}
                                    </Col>
                                  </Row>
                                  <Row className="mb-2">
                                    <Col md={2} className="text-muted">Surgery Date:</Col>
                                    <Col md={10}>{dischargeData.surgery_date ? formatOnlyDate(dischargeData.surgery_date) : "-"}</Col>
                                  </Row>
                                  {dischargeData.surgery_note && (
                                    <Row className="mb-2">
                                      <Col md={2} className="text-muted">Surgery Notes:</Col>
                                      <Col md={10}>{dischargeData.surgery_note}</Col>
                                    </Row>
                                  )}
                                  {dischargeData.plan_of_treatment && (
                                    <Row className="mb-2">
                                      <Col md={2} className="text-muted">Plan of Treatment:</Col>
                                      <Col md={10}>{dischargeData.plan_of_treatment}</Col>
                                    </Row>
                                  )}
                                  <Row className="mb-2">
                                    <Col md={2} className="text-muted">Consultant Doctor:</Col>
                                    <Col md={4}><strong>{getDoctorName(dischargeData.consultant_doctor)}</strong></Col>
                                    <Col md={2} className="text-muted">Treating Doctor:</Col>
                                    <Col md={4}><strong>{getDoctorName(dischargeData.treating_by)}</strong></Col>
                                  </Row>
                                </Card.Body>
                              </Card>
                            </Col>

                            {Array.isArray(dischargeData.treatment_on_discharge) && dischargeData.treatment_on_discharge.length > 0 && (
                              <Col md={12}>
                                <Card style={{ borderRadius: "8px", border: "1px solid #b2ebf2" }}>
                                  <Card.Header style={{ backgroundColor: "#e0f7fa", fontWeight: "600", fontSize: "13px", color: "#00838f" }}>
                                    <FeatherIcon icon="plus-circle" size={14} className="me-1" /> Treatment on Discharge (Prescriptions)
                                  </Card.Header>
                                  <Card.Body className="p-0">
                                    <Table responsive bordered hover className="m-0" style={{ fontSize: "12px" }}>
                                      <thead className="table-light">
                                        <tr>
                                          <th>#</th>
                                          <th>Medicine Name</th>
                                          <th>Frequency / Times</th>
                                          <th>Days</th>
                                          <th>Qty</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {dischargeData.treatment_on_discharge.map((item, idx) => (
                                          <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td><strong>{item.medicine_name}</strong></td>
                                            <td>{Array.isArray(item.medicine_time) ? item.medicine_time.join(", ") : item.frequency || "-"}</td>
                                            <td>{item.days ? `${item.days} days` : "-"}</td>
                                            <td>{item.qty || "-"}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </Table>
                                  </Card.Body>
                                </Card>
                              </Col>
                            )}

                            {(dischargeData.local_care || dischargeData.note_advice) && (
                              <Col md={12}>
                                <Card style={{ borderRadius: "8px", border: "1px solid #b2ebf2" }}>
                                  <Card.Header style={{ backgroundColor: "#e0f7fa", fontWeight: "600", fontSize: "13px", color: "#00838f" }}>
                                    <FeatherIcon icon="alert-circle" size={14} className="me-1" /> Local Care & Follow-up Advice
                                  </Card.Header>
                                  <Card.Body style={{ fontSize: "12.5px" }}>
                                    {dischargeData.local_care && (
                                      <div className="mb-2">
                                        <strong>Local Care:</strong>
                                        <p className="mb-1 text-secondary">{dischargeData.local_care}</p>
                                      </div>
                                    )}
                                    {dischargeData.note_advice && (
                                      <div>
                                        <strong>Advice & Instructions:</strong>
                                        <p className="mb-0 text-secondary">{dischargeData.note_advice}</p>
                                      </div>
                                    )}
                                  </Card.Body>
                                </Card>
                              </Col>
                            )}
                          </Row>
                        </div>
                      ) : (
                        <div className="text-center py-5 text-muted">
                          <FeatherIcon icon="clipboard" size={42} className="text-black-50 mb-2" />
                          <h5>No Discharge Card Found</h5>
                          <p style={{ fontSize: "12.5px" }}>A discharge card has not been created for this patient yet.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Modal.Body>
            <Modal.Footer style={{ padding: "10px" }}>
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)} style={{ borderRadius: "6px" }}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Bill Preview Modal */}
          <Modal
            show={showBillPreviewModal}
            onHide={() => setShowBillPreviewModal(false)}
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
              <Modal.Title style={{ color: "#00838f", fontWeight: "bold", fontSize: "16px" }}>
                <FeatherIcon icon="eye" className="me-2" size={18} />
                IPD Bill Preview
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: "80vh", overflowY: "auto" }}>
              <div dangerouslySetInnerHTML={{ __html: previewInvoiceContent }} />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowBillPreviewModal(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (selectedPreviewInvoice) {
                    printInvoice(selectedPreviewInvoice);
                  }
                }}
              >
                <FeatherIcon icon="printer" size={16} className="me-1" />
                Print Bill
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Discharge Card Print Preview Modal */}
          <Modal
            show={showDischargePrintModal}
            onHide={() => setShowDischargePrintModal(false)}
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
              <Modal.Title style={{ color: "#00838f", fontWeight: "bold", fontSize: "16px" }}>
                <FeatherIcon icon="printer" className="me-2" size={18} />
                Discharge Card Preview
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-3 bg-light" style={{ maxHeight: "80vh", overflowY: "auto" }}>
              <div
                className="p-4 bg-white shadow-sm mx-auto"
                style={{ width: "210mm", minHeight: "297mm" }}
              >
                {dischargeData && (
                  <DischargePrintView
                    ref={dischargePrintRef}
                    dischargeData={dischargeData}
                    formData={{
                      patient_id: selectedPatient?.patient_id || "",
                      Uid_no: selectedPatient?.Uid_no || "",
                      name: selectedPatient?.patientName || selectedPatient?.name || "",
                      phone: selectedPatient?.phone || "",
                      age: selectedPatient?.age || "",
                      sex: selectedPatient?.sex || "",
                      address: selectedPatient?.address || "",
                      adm_no: selectedPatient?.admissionNo || "",
                    }}
                    doctors={doctors}
                    assistanceDoctors={assistanceDoctors}
                    location={currentLocation}
                    historyData={{}}
                  />
                )}
              </div>
            </Modal.Body>
            <Modal.Footer className="bg-white border-top shadow-sm justify-content-center" >
              <Button variant="secondary" onClick={() => setShowDischargePrintModal(false)} >
                Close
              </Button>
              <Button
                variant="info"
                className="text-white"
                onClick={() => triggerPrintDischarge()}
              >
                <FeatherIcon icon="printer" size={16} className="me-1" />
                Print Discharge Card
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Full Screen Image Preview Modal */}
          <Modal
            show={!!fullScreenImage}
            onHide={() => setFullScreenImage(null)}
            centered
            size="lg"
          >
            <Modal.Header
              closeButton
              style={{ border: "none", backgroundColor: "#f8f9fa" }}
            >
              <Modal.Title style={{ fontSize: "14px", fontWeight: "bold", color: "#333" }}>
                Document Preview
              </Modal.Title>
            </Modal.Header>
            <Modal.Body
              className="text-center p-3"
              style={{ backgroundColor: "#fff" }}
            >
              {fullScreenImage && (
                <img
                  src={fullScreenImage}
                  alt="Full Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "80vh",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
              )}
            </Modal.Body>
          </Modal>

        </Container>
      </div>
    </div>
  );
}
