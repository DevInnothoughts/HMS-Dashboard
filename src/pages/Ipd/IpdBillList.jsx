import React, { useState, useEffect, useCallback } from "react";
import { FaPlus } from "react-icons/fa";
import moment from "moment";
import { Paginator } from "primereact/paginator";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { InputGroup } from "react-bootstrap";
import { clinincLoc } from "../Utility/IpdBill_ClinicLocations";
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

import Swal from "sweetalert2";
import { decodeJwt } from "../Utility/decode-jwt";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo/hhc.png";
import { toast } from "react-hot-toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import FeatherIcon from "feather-icons-react";
import "../../styles/styles.css";

// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://194.195.117.79:5100/api";

const getLocalDateString = (date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split("T")[0];
};

const today = new Date();
const maxDate = getLocalDateString(today);

const minDateObj = new Date();
minDateObj.setDate(today.getDate() - 1);
const minDate = getLocalDateString(minDateObj);

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

import { LOCATIONS_LIST } from "../Auth/Login";

const FALLBACK_LOCATIONS = LOCATIONS_LIST;

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
    // Legacy format: Label, Value, Label, Value
    for (let i = 0; i < entries.length; i += 2) {
      const label = entries[i];
      const value = parseFloat(String(entries[i + 1] || "").replace(/,/g, "")) || 0;
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
    // New format or mixed: Label: Value, Label: Value
    entries.forEach((entry) => {
      const parts = entry.split(":");
      if (parts.length >= 2) {
        const label = parts[0].trim();
        const value = parseFloat(String(parts[1] || "").trim().replace(/,/g, "")) || 0;
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
      : parseFloat(String(invoice.totalamt || invoice.totalAmt || 0).replace(/,/g, "")) || 0;

  return {
    dynamicRows:
      dynamicRows.length > 0
        ? dynamicRows
        : [{ label: "", value: "0", field: "" }],
    Sub_Total: Math.round(Sub_Total).toString(),
    totalamt: Math.round(Sub_Total).toString(),
  };
};

const calculateActivePayableAmt = (
  invoice,
  subtotal,
  discount,
  pdc,
  billType,
  billMethod,
) => {
  const totalAmt = parseFloat(String(subtotal || 0).replace(/,/g, "")) || 0;
  const disc = parseFloat(String(discount || 0).replace(/,/g, "")) || 0;
  const p = parseFloat(String(pdc || 0).replace(/,/g, "")) || 0;

  if ((billType || "").toLowerCase() === "interbranch") {
    return totalAmt.toFixed(0);
  }

  if (
    (billType || "").toLowerCase() === "insurance" &&
    (billMethod || "").toLowerCase() === "cashless"
  ) {
    return "0";
  }

  if (billMethod === "pdc" || billMethod === "PDC") {
    return Math.max(0, totalAmt - p).toFixed(0);
  }
  return Math.max(0, totalAmt - disc).toFixed(0);
};

const calculatePayableAmt = (invoice) => {
  const totalAmt = parseFloat(String(invoice.totalamt || invoice.total_amt || 0).replace(/,/g, "")) || 0;
  const discount = parseFloat(String(invoice.discount || 0).replace(/,/g, "")) || 0;
  const pdc = parseFloat(String(invoice.pdc || invoice.receivedamt || invoice.advance_amt || 0).replace(/,/g, "")) || 0;

  const billMethod = (
    invoice.bill_method ||
    invoice.status ||
    ""
  ).toLowerCase();

  const billType = (
    invoice.bill_Type ||
    invoice.bill_type ||
    (invoice.status && (invoice.status.toLowerCase() === "interbranch" || invoice.status.toLowerCase() === "interbranch-bill") ? "interbranch" : "") ||
    ""
  ).toLowerCase();

  if (billType === "interbranch") {
    return totalAmt.toFixed(0);
  }

  if (
    billMethod === "cashless" &&
    (billType === "insurance" || invoice.insurancecompany || invoice.insurance_company_name)
  ) {
    return "0";
  }

  if (
    billMethod === "pdc" ||
    (invoice.status && invoice.status.toLowerCase() === "pdc")
  ) {
    return Math.max(0, totalAmt - pdc).toFixed(0);
  }
  return Math.max(0, totalAmt - discount).toFixed(0);
};

const formatDateForDisplay = (dateValue) => {
  if (!dateValue) return "N/A";
  const str = String(dateValue).trim();
  if (!str || str.startsWith("0000")) return "N/A";
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split("-");
    return `${d}-${m}-${y}`;
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    return str;
  }
  const m = moment(dateValue);
  return m.isValid() ? m.format("DD-MM-YYYY") : String(dateValue);
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

const rowClassName = (rowData) => {
  // Logic to match PHP: (status === "Charity" || status === "NonInsurance") && (creation_date != today && totaldue > 0)
  const status = (rowData.status || "").trim();
  const creationDate = (rowData.creation_date || "").split("T")[0];
  const currentDate = new Date().toISOString().split("T")[0];
  // Use backend totaldue if available, otherwise fallback to calculated due_amt
  const dueAmt =
    rowData.totaldue !== undefined ? rowData.totaldue : rowData.due_amt || 0;

  // Normalize status for comparisons (handle case-insensitivity just in case, but prioritize PHP exact strings)
  const isTargetMode =
    status === "NonInsurance" ||
    status.toLowerCase() === "noninsurance" ||
    status.toLowerCase() === "non_insurance";

  if (isTargetMode && creationDate !== currentDate && dueAmt > 0) {
    return "red-row text-white";
  }
  return "";
};

const IpdBillList = () => {
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const isTodayFiltered =
    fromDate &&
    toDate &&
    moment(fromDate).isSame(moment(), "day") &&
    moment(toDate).isSame(moment(), "day");

  const handleTodayFilterClick = () => {
    if (isTodayFiltered) {
      setFromDate(null);
      setToDate(null);
    } else {
      const today = new Date();
      setFromDate(today);
      setToDate(today);
      setFilters1({
        global: { value: null, matchMode: FilterMatchMode.EQUALS },
      });
    }
  };

  const [invoices, setInvoices] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [surgeons, setSurgeons] = useState([]);
  const [fdeOptions, setFdeOptions] = useState([]);
  const [insurance, setInsurance] = useState([]);
  const [tpa, setTpa] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDbSearching, setIsDbSearching] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [clinicLocations, setClinicLocations] = useState([]);
  const [selectedClinicPatient, setSelectedClinicPatient] = useState(null);
  const [isSearchingUid, setIsSearchingUid] = useState(false);
  const [errors, setErrors] = useState({});
  const [modalInvoiceData, setModalInvoiceData] = useState({
    dynamicRows: [],
    Sub_Total: "0",
    discount: "0",
    pdc: "0",
    payableAmount: "0",
  });
  const [invoiceWarning, setInvoiceWarning] = useState("");
  const [originalInvoiceId, setOriginalInvoiceId] = useState(null);
  const [filters1, setFilters1] = useState({
    // global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    global: { value: null, matchMode: FilterMatchMode.EQUALS },
  });
  const [paymentCategoryFilter, setPaymentCategoryFilter] = useState("All");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [previewInvoice, setPreviewInvoice] = useState(null);

  const [showCashlessModal, setShowCashlessModal] = useState(false);
  const [cashlessData, setCashlessData] = useState({
    invoiceid: "",
    totalamt: "0",
    receivedamt: "",
    coopay: "",
    deductionamt: "0",
    payableamt: "0",
    claimNo: "",
    status: "",
  });

  const openCashlessModal = (rowData) => {
    const total = parseFloat(
      rowData.totalamt || rowData.total_amt || rowData.payable_amt || 0,
    );
    const received = parseFloat(rowData.receivedamt) || 0;
    const coopay = parseFloat(rowData.coopay) || 0;

    const payable = total - received;
    const deduction = payable - coopay;

    setCashlessData({
      invoiceid: rowData.invoice_id || "",
      totalamt: total.toFixed(0),
      receivedamt: received > 0 ? received.toFixed(0) : "",
      coopay: coopay > 0 ? coopay.toFixed(0) : "",
      deductionamt: deduction.toFixed(0),
      payableamt: payable.toFixed(0),
      claimNo: rowData.claim_no || "",
      status: rowData.status || "",
    });
    setShowCashlessModal(true);
  };

  const handleCashlessChange = (field, value) => {
    const newVal = value.replace(/[^0-9]/g, ""); // Only allow integers
    setCashlessData((prev) => {
      const updated = { ...prev, [field]: newVal };
      const received = parseInt(updated.receivedamt) || 0;
      const coopay = parseInt(updated.coopay) || 0;
      const total = parseInt(updated.totalamt) || 0;

      const payable = total - received;
      const deduction = payable - coopay;

      updated.payableamt = payable.toFixed(0);
      updated.deductionamt = deduction.toFixed(0);
      return updated;
    });
  };

  const submitCashless = async (e) => {
    e.preventDefault();
    if (!cashlessData.receivedamt || !cashlessData.coopay) {
      alert("Please Enter the details..");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        invoice_id: cashlessData.invoiceid,
        receivedamt: parseFloat(cashlessData.receivedamt) || 0,
        coopay: parseFloat(cashlessData.coopay) || 0,
        deductionamt: parseFloat(cashlessData.deductionamt) || 0,
        claim_no: cashlessData.claimNo || "",
      };

      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${BASE_URL}/V1/invoice/insuranceSettlement?location=${currentLocation}`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && (data.statusCode === 200 || data.description?.status || data.status)) {
        Toast.fire({ icon: "success", title: "Cashless amounts updated successfully." });
        setShowCashlessModal(false);
        fetchInvoices();
      } else {
        alert(data.message || "Failed to update cashless amounts.");
      }
    } catch (err) {
      console.error("Cashless submission error:", err);
      alert("Error saving cashless amounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload?.jobLocation) setCurrentLocation(payload.jobLocation);
    }
  }, []);

  useEffect(() => {
    setClinicLocations(FALLBACK_LOCATIONS);
  }, []);

  const [formData, setFormData] = useState({
    dynamicRows: [],
    Sub_Total: "0",
    discount: "0",
    pdc: "0",
    payableAmount: "0",
  });

  const initialFormData = { ...formData };

  // Helper function moved to component scope
  const formatToApiDateLocal = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`; // Matches your DD-MM-YYYY backend expectation
  };

  useEffect(() => {
    // Only check if it's different from the record we are currently editing
    if (
      !currentLocation ||
      !selectedInvoice?.invoice_id ||
      selectedInvoice.invoice_id === originalInvoiceId
    ) {
      setInvoiceWarning("");
      return;
    }

    const checkTimeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/V1/invoice/checkInvoiceId?invoice_id=${selectedInvoice.invoice_id}&location=${currentLocation}`,
        );
        const result = await response.json();
        if (result.data?.exists) {
          setInvoiceWarning(
            `Bill Number already exists for patient: ${result.data.patient_name}`,
          );
        } else {
          setInvoiceWarning("");
        }
      } catch (err) {
        console.error("Invoice ID check failed:", err);
      }
    }, 500);

    return () => clearTimeout(checkTimeout);
  }, [selectedInvoice?.invoice_id, currentLocation, originalInvoiceId]);

  const fetchInvoices = useCallback(async () => {
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

        const processedInvoices = rawData.map((invoice) => {
          // Normalize values with fallbacks for different backend naming conventions
          const totalamt =
            parseFloat(invoice.totalamt || invoice.total_amt || 0) || 0;
          const receivedamt =
            parseFloat(invoice.receivedamt || invoice.received_amt || 0) || 0;
          const discount = parseFloat(invoice.discount || 0) || 0;
          const pdc = parseFloat(invoice.pdc || invoice.receivedamt || invoice.advance_amt || 0) || 0;

          const payable_amt =
            (invoice.payable_amt !== undefined && invoice.payable_amt !== null)
              ? parseFloat(invoice.payable_amt)
              : parseFloat(calculatePayableAmt({ ...invoice, totalamt, discount, pdc }));
          const due_amt =
            invoice.totaldue !== undefined
              ? parseFloat(invoice.totaldue)
              : (invoice.status === "PDC" || invoice.bill_method === "PDC" ? totalamt : payable_amt - receivedamt);

          return {
            ...invoice,
            totalamt,
            receivedamt,
            discount,
            pdc,
            due_amt,
            payable_amt,
            pay_mode:
              invoice.status === "PDC" ||
                invoice.bill_method === "PDC" ||
                (invoice.chequeno && invoice.chequeno !== "NULL")
                ? "PDC"
                : invoice.status === "Cashless" ||
                  invoice.bill_method === "Cashless"
                  ? "Cashless"
                  : invoice.status === "Reimbursement" ||
                    invoice.bill_method === "Reimbursement"
                    ? "Reimbursement"
                    : invoice.status === "Interbranch" ||
                      invoice.status === "Interbranch-Bill" ||
                      invoice.bill_Type === "interbranch"
                      ? "Interbranch"
                      : invoice.bill_Type === "charity" ||
                        invoice.status === "Charity"
                        ? "Charity"
                        : "NonInsurance",
            patient_name: invoice.patient_name || invoice.name || "N/A",
            patient_phone: invoice.patient_phone || invoice.phone || "N/A",
            patient_uid:
              invoice.patient_uid || invoice.Uid_no || invoice.uid || "N/A",
            status: invoice.status || "",
          };
        });

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
  }, [currentLocation, fromDate, toDate]);

  const searchFromDatabase = async (query) => {
    if (!currentLocation || isDbSearching) return;

    setIsDbSearching(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/invoice/searchInvoices?query=${encodeURIComponent(
          query,
        )}&location=${currentLocation}`,
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setInvoices((prev) => {
            const existingIds = new Set(
              prev.map((inv) => String(inv.invoice_id)),
            );
            const newUniqueInvoices = data.data
              .filter((inv) => !existingIds.has(String(inv.invoice_id)))
              .map((invoice) => {
                const totalamt =
                  parseFloat(invoice.totalamt || invoice.total_amt || 0) || 0;
                const receivedamt =
                  parseFloat(
                    invoice.receivedamt || invoice.received_amt || 0,
                  ) || 0;
                const discount = parseFloat(invoice.discount || 0) || 0;
                const pdc =
                  parseFloat(invoice.pdc || invoice.receivedamt || invoice.advance_amt || 0) || 0;
                const payable_amt =
                  (invoice.payable_amt !== undefined && invoice.payable_amt !== null)
                    ? parseFloat(invoice.payable_amt)
                    : parseFloat(calculatePayableAmt({ ...invoice, totalamt, discount, pdc }));
                const due_amt =
                  invoice.totaldue !== undefined
                    ? parseFloat(invoice.totaldue)
                    : (invoice.status === "PDC" || invoice.bill_method === "PDC" ? totalamt : payable_amt - receivedamt);

                return {
                  ...invoice,
                  totalamt,
                  receivedamt,
                  discount,
                  pdc,
                  due_amt,
                  payable_amt,
                  patient_name: invoice.patient_name || invoice.name || "N/A",
                  patient_phone:
                    invoice.patient_phone || invoice.phone || "N/A",
                  patient_uid:
                    invoice.patient_uid ||
                    invoice.Uid_no ||
                    invoice.uid ||
                    "N/A",
                  status: invoice.status || "",
                };
              });
            return [...prev, ...newUniqueInvoices];
          });
        }
      }
    } catch (error) {
      console.error("Error searching invoices from database:", error);
    } finally {
      setIsDbSearching(false);
    }
  };

  useEffect(() => {
    const searchValue = filters1.global.value;
    if (!searchValue || searchValue.length < 3) return;

    const hasLocalMatches = invoices.some((inv) => {
      const lowerSearch = searchValue.toLowerCase();
      return (
        (inv.invoice_id && String(inv.invoice_id).includes(searchValue)) ||
        (inv.patient_name &&
          inv.patient_name.toLowerCase().includes(lowerSearch)) ||
        (inv.patient_phone && inv.patient_phone.includes(searchValue))
      );
    });

    if (!hasLocalMatches) {
      const delayDebounceFn = setTimeout(() => {
        searchFromDatabase(searchValue);
      }, 800);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [filters1.global.value, invoices]);

  useEffect(() => {
    fetchInvoices();
  }, [currentLocation, fromDate, toDate]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      if (!currentLocation) return;

      try {
        const targetDate = selectedInvoice ? selectedInvoice.creation_date : "";
        const dateQuery = targetDate ? `&date=${targetDate}` : "";

        const endpoints = [
          { url: `consultant_dropdown?location=${encodeURIComponent(currentLocation)}`, setter: setConsultants },
          { url: `surgeon_dropdown?location=${encodeURIComponent(currentLocation)}`, setter: setSurgeons },
          { url: `insurance_co_dropdown?location=${encodeURIComponent(currentLocation)}${dateQuery}`, setter: setInsurance },
          { url: `tpa_dropdown?location=${encodeURIComponent(currentLocation)}${dateQuery}`, setter: setTpa },
        ];

        for (const { url, setter } of endpoints) {
          const response = await fetch(
            `${BASE_URL}/V1/invoice/${url}`,
          );

          const data = await response.json();
          if (response.ok) {
            setter(data.data || []);
          }
        }

        // Fetch FDE dropdown separately since its prefix is V1/appointment
        const fdeResponse = await fetch(
          `${BASE_URL}/V1/appointment/fdeDropdown?location=${encodeURIComponent(currentLocation)}`
        );
        const fdeData = await fdeResponse.json();
        if (fdeResponse.ok) {
          setFdeOptions(fdeData.data || []);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch dropdown data.");
      }
    };

    fetchDropdowns();
  }, [currentLocation, selectedInvoice ? selectedInvoice.creation_date : null]);

  useEffect(() => {
    const subTotal = parseFloat(formData.Sub_Total || 0);
    const discount = parseFloat(formData.discount || 0);
    const pdc = parseFloat(formData.pdc || 0);

    let payableAmount =
      subTotal - (formData.bill_method === "PDC" ? pdc : discount);
    payableAmount = Math.max(payableAmount, 0).toFixed(0);

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

  useEffect(() => {
    if (
      !selectedInvoice ||
      !selectedInvoice.isInterbranch ||
      selectedInvoice.interbranchLocation === "DP Road" ||
      !selectedInvoice.interbranchLocation ||
      !selectedInvoice.selectedClinicUid
    ) {
      setSelectedClinicPatient(null);
      setIsSearchingUid(false);
      return;
    }

    const query = selectedInvoice.selectedClinicUid.trim();
    if (query.length === 0) {
      setIsSearchingUid(false);
      return;
    }

    if (
      selectedClinicPatient &&
      selectedClinicPatient.Uid_no &&
      selectedClinicPatient.Uid_no.toLowerCase().trim() === query.toLowerCase().trim()
    ) {
      setIsSearchingUid(false);
      return;
    }

    setIsSearchingUid(true);

    const delayDebounce = setTimeout(async () => {
      try {
        const responseSelected = await fetch(
          `${BASE_URL}/V1/patient/searchPatient?query=${query}&location=${selectedInvoice.interbranchLocation}`
        );
        const resultSelected = await responseSelected.json();

        if (
          responseSelected.ok &&
          resultSelected.data &&
          resultSelected.data.length > 0
        ) {
          const matchedPatient = resultSelected.data.find(
            (p) => p.Uid_no.toLowerCase().trim() === query.toLowerCase().trim()
          );
          if (matchedPatient) {
            setSelectedClinicPatient(matchedPatient);
            setErrors((prev) => ({ ...prev, selectedClinicUid: null }));
          } else {
            setSelectedClinicPatient(null);
            setErrors((prev) => ({
              ...prev,
              selectedClinicUid:
                "*No patient found with this UID No at the selected clinic location.",
            }));
          }
        } else {
          setSelectedClinicPatient(null);
          setErrors((prev) => ({
            ...prev,
            selectedClinicUid:
              "*No patient found with this UID No at the selected clinic location.",
          }));
        }
      } catch (err) {
        setSelectedClinicPatient(null);
        setErrors((prev) => ({
          ...prev,
          selectedClinicUid: "Error searching patient at selected clinic location.",
        }));
      } finally {
        setIsSearchingUid(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [
    selectedInvoice?.selectedClinicUid,
    selectedInvoice?.interbranchLocation,
    selectedInvoice?.bill_Type,
  ]);

  const calculatePayableAmount = (data) => {
    const subTotal = parseFloat(data.Sub_Total || 0);
    const discountVal = parseFloat(data.discount || 0);
    const discountAmountVal = parseFloat(data.discountAmount || 0);
    const pdcVal = parseFloat(data.pdc || 0);

    if (data.bill_Type === "interbranch") {
      return Math.round(subTotal).toString();
    }

    if (
      (data.bill_Type || "").toLowerCase() === "insurance" &&
      (data.bill_method || "").toLowerCase() === "cashless"
    ) {
      return "0";
    }

    let deduction = 0;
    if (data.bill_Type === "charity") {
      deduction = discountAmountVal;
    } else if (data.bill_method === "PDC") {
      deduction = pdcVal;
    } else if (data.bill_Type === "non_insurance") {
      deduction = discountVal;
    }

    return Math.max(0, Math.round(subTotal - deduction)).toString();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Restriction for invoice_id and chequeno: only integers allowed
    if (name === "invoice_id" || name === "chequeno") {
      const integerOnly = value.replace(/[^0-9]/g, "");
      setSelectedInvoice((prev) => ({ ...prev, [name]: integerOnly }));
      return;
    }

    setSelectedInvoice((prev) => ({ ...prev, [name]: value }));

    if (
      [
        "bill_method",
        "bill_Type",
        "pdc",
        "discount",
        "discountAmount",
      ].includes(name)
    ) {
      setModalInvoiceData((prevModalData) => {
        const updatedModalData = { ...prevModalData, [name]: value };
        updatedModalData.payableAmount =
          calculatePayableAmount(updatedModalData);

        setSelectedInvoice((prevInvoice) => ({
          ...prevInvoice,
          payable_amt: updatedModalData.payableAmount,
        }));

        return updatedModalData;
      });
    }
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
        Sub_Total: Math.round(newSubTotal).toString(),
      };

      updatedModalData.payableAmount = calculatePayableAmount(updatedModalData);

      setSelectedInvoice((prevInvoice) => ({
        ...prevInvoice,
        totalamt: Math.round(newSubTotal).toString(),
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
        { label: "", value: "0", field: "title_parsed" },
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
        Sub_Total: Math.round(newSubTotal).toString(),
      };

      updatedModalData.payableAmount = calculatePayableAmount(updatedModalData);

      setSelectedInvoice((prevInvoice) => ({
        ...prevInvoice,
        totalamt: Math.round(newSubTotal).toString(),
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

    setOriginalInvoiceId(invoice.invoice_id);
    const { dynamicRows, Sub_Total } = getDynamicRowsFromInvoice(invoice);

    const displayRows =
      dynamicRows.length > 0
        ? dynamicRows
        : [{ label: "", value: "", field: "" }];

    const payableAmount = calculatePayableAmt(invoice);

    const formatForInput = (dateValue) => {
      if (!dateValue) return "";
      const str = String(dateValue).trim();
      if (!str || str.startsWith("0000")) return "";

      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return str;
      }
      if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
        const [d, m, y] = str.split("-");
        return `${y}-${m}-${d}`;
      }
      const parsed = moment(dateValue);
      return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
    };

    const formatTimeForInput = (timeStr) => {
      if (!timeStr) return "";
      // If already in 24h format "00:00"
      if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;

      // Handle "hh:mm AM/PM" or "hh:mm AM/PM" (case insensitive)
      const match = timeStr.match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
      if (match) {
        let [_, h, m, p] = match;
        let hours = parseInt(h, 10);
        const period = p.toUpperCase();
        if (period === "PM" && hours < 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        return `${String(hours).padStart(2, "0")}:${m}`;
      }
      return timeStr;
    };

    // Determine bill_method and bill_Type based on status as the source of truth
    const statusVal = (invoice.status || "").trim().toLowerCase();

    const bill_method =
      invoice.bill_method ||
      (statusVal === "cashless"
        ? "Cashless"
        : statusVal === "reimbursement"
          ? "Reimbursement"
          : statusVal === "pdc" ||
            (invoice.chequeno && invoice.chequeno !== "NULL")
            ? "PDC"
            : "NonInsurance");

    const bill_Type =
      invoice.bill_Type ||
      (statusVal === "cashless" ||
        statusVal === "reimbursement" ||
        statusVal === "pdc" ||
        invoice.insurancecompany
        ? "insurance"
        : statusVal === "charity"
          ? "charity"
          : (statusVal === "interbranch" || statusVal === "interbranch-bill")
            ? "interbranch"
            : "non_insurance");

    const chequeno =
      invoice.chequeno === "NULL" || !invoice.chequeno ? "" : invoice.chequeno;
    const pdc =
      invoice.pdc || (bill_method === "PDC" ? (invoice.receivedamt || invoice.advance_amt) : "0");

    const isInterbranch =
      invoice.patient_location !== null &&
      invoice.patient_location !== undefined &&
      invoice.patient_location !== "" &&
      invoice.patient_location !== "NULL" &&
      invoice.patient_location !== currentLocation;

    setSelectedInvoice({
      ...invoice,
      // Explicitly format dates and times for the modal inputs
      creation_date: formatForInput(invoice.creation_date),
      due_date: formatForInput(invoice.due_date),
      admissiontime: formatTimeForInput(invoice.admissiontime),
      dischargetime: formatTimeForInput(invoice.dischargetime),
      bill_method,
      bill_Type,
      chequeno,
      pdc,
      isInterbranch,
      // Ensure we have fallback for bed category from existing fields
      bed_no: invoice.bed_no || invoice.bed_desc || "",
      interbranchLocation: isInterbranch ? invoice.patient_location : "",
      selectedClinicUid: isInterbranch ? (invoice.patient_location === "DP Road" ? "N/A" : (invoice.selectedClinicUid || "")) : "",
    });

    setSelectedClinicPatient(null);
    setErrors({});

    if (isInterbranch && invoice.patient_location !== "DP Road") {
      if (
        statusVal === "interbranch" ||
        statusVal === "cashless" ||
        statusVal === "reimbursement" ||
        statusVal === "pdc"
      ) {
        const targetLocation = invoice.patient_location;
        if (targetLocation) {
          fetch(`${BASE_URL}/V1/invoice/searchByInvoiceId?invoice_id=${invoice.invoice_id}&location=${targetLocation}`)
            .then((res) => res.json())
            .then((data) => {
              if (data && data.length > 0) {
                const matched = data[0];
                setSelectedInvoice((prev) => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    selectedClinicUid: matched.Uid_no,
                    selectedClinicInvoiceId: matched.invoice_id,
                  };
                });
                setSelectedClinicPatient(matched);
              }
            })
            .catch((err) => console.error("Error fetching interbranch patient UID:", err));
        }
      } else if (statusVal === "interbranch-bill") {
        const uid = invoice.patient_uid || invoice.Uid_no || "";
        setSelectedInvoice((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            selectedClinicUid: uid,
          };
        });
        setSelectedClinicPatient({
          patient_id: invoice.patient_id,
          name: invoice.patient_name || "",
          phone: invoice.patient_phone || "",
          Uid_no: uid,
        });
      }
    }

    setModalInvoiceData({
      dynamicRows: displayRows,
      Sub_Total: Math.round(parseFloat(Sub_Total || 0)).toString(),
      discount: Math.round(parseFloat(invoice.discount || 0)).toString(),
      pdc: Math.round(parseFloat(pdc || 0)).toString(),
      payableAmount: Math.round(parseFloat(payableAmount || 0)).toString(),
      bill_method,
      bill_Type,
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
    setSelectedClinicPatient(null);
    setErrors({});
  };

  const handleSaveChanges = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedInvoice) return;

    if (!selectedInvoice.madeby) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Made By is required.",
        confirmButtonColor: "#00acc1",
      });
      return;
    }

    if (selectedInvoice.bill_Type === "insurance") {
      if (!selectedInvoice.insurancecompany) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Insurance Company is required.",
          confirmButtonColor: "#00acc1",
        });
        return;
      }
      if (!selectedInvoice.bill_method) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Bill Method is required.",
          confirmButtonColor: "#00acc1",
        });
        return;
      }
    }

    if (selectedInvoice.isInterbranch) {
      if (!selectedInvoice.interbranchLocation) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Clinic Location is required.",
          confirmButtonColor: "#00acc1",
        });
        return;
      }
      if (selectedInvoice.interbranchLocation !== "DP Road") {
        if (!selectedInvoice.selectedClinicUid) {
          Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: "Selected Clinic Location UID No is required.",
            confirmButtonColor: "#00acc1",
          });
          return;
        }
        if (!selectedClinicPatient) {
          Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: "Please verify and enter a valid UID No at the selected clinic location.",
            confirmButtonColor: "#00acc1",
          });
          return;
        }
      }
    }

    if (invoiceWarning) {
      Swal.fire({
        icon: "error",
        title: "Duplicate Invoice ID",
        text: invoiceWarning,
        confirmButtonColor: "#00acc1",
      });
      return;
    }

    if (!currentLocation) {
      toast.error("Cannot save changes: Location data is missing.");
      return;
    }

    const titleString = modalInvoiceData.dynamicRows
      .filter((row) => row.label.trim() !== "")
      .map(
        (row) =>
          `${row.label.trim()},${Math.round(parseFloat(row.value || 0))}`,
      )
      .join(",");

    // Map bill_method and bill_Type to backend 'status' field for persistence
    let status = "NonInsurance";
    if (modalInvoiceData.bill_Type === "insurance") {
      const method = modalInvoiceData.bill_method;
      if (method === "cashless") status = "Cashless";
      else if (method === "reimbursement") status = "Reimbursement";
      else if (method === "PDC") status = "PDC";
      else status = method || "NonInsurance";
    } else if (modalInvoiceData.bill_Type === "charity") {
      status = "Charity";
    }

    const convertTo12Hour = (time24) => {
      if (!time24) return "";
      if (time24.includes("AM") || time24.includes("PM")) return time24;
      let [hours, minutes] = time24.split(":");
      let period = "AM";
      hours = parseInt(hours, 10);
      if (hours === 0) {
        hours = 12;
      } else if (hours === 12) {
        period = "PM";
      } else if (hours > 12) {
        hours -= 12;
        period = "PM";
      }
      return `${String(hours).padStart(2, "0")}:${minutes} ${period}`;
    };

    const payload = {
      ...selectedInvoice,
      ...modalInvoiceData,
      status: status, // Sync backend status column
      package: titleString,
      location: currentLocation,
      patient_location: selectedInvoice.interbranchLocation || null,
      totalamt: Math.round(parseFloat(modalInvoiceData.Sub_Total || 0)),
      payable_amt: Math.round(parseFloat(modalInvoiceData.payableAmount || 0)),
      discount: Math.round(parseFloat(modalInvoiceData.discount || 0)),
      receivedamt: Math.round(parseFloat(modalInvoiceData.pdc || 0)), // Map PDC amount to receivedamt column
      advance_amt: null,
      totaldue: (status === "PDC" || status === "pdc")
        ? Math.round(parseFloat(modalInvoiceData.Sub_Total || 0))
        : Math.round(parseFloat(modalInvoiceData.payableAmount || 0)),
      admissiontime: convertTo12Hour(selectedInvoice.admissiontime),
      dischargetime: convertTo12Hour(selectedInvoice.dischargetime),
    };



    setLoading(true);
    try {
      if (selectedInvoice.interbranchLocation === "DP Road") {
        const localPayload = {
          ...payload,
          interbranch_id: 0,
        };
        const responseLoggedIn = await fetch(
          `${BASE_URL}/V1/invoice/${selectedInvoice.invoice_id}?location=${currentLocation}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(localPayload),
          },
        );
        const resultLoggedIn = await responseLoggedIn.json();

        if (!responseLoggedIn.ok) {
          Toast.fire({
            icon: "error",
            title: resultLoggedIn.message || `Failed to update invoice at current clinic (${currentLocation})`,
          });
          setLoading(false);
          return;
        }

        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: "Changes saved successfully",
          confirmButtonColor: "#00acc1",
        });
        setShowModal(false);
        fetchInvoices();
        setLoading(false);
        return;
      }

      if (selectedInvoice.interbranchLocation) {
        const responseLoggedIn = await fetch(
          `${BASE_URL}/V1/invoice/${selectedInvoice.invoice_id}?location=${currentLocation}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        const resultLoggedIn = await responseLoggedIn.json();

        if (!responseLoggedIn.ok) {
          Toast.fire({
            icon: "error",
            title: resultLoggedIn.message || `Failed to update invoice at current clinic (${currentLocation})`,
          });
          setLoading(false);
          return;
        }

        let responseSelected;
        const payloadSelected = {
          ...payload,
          invoice_id: selectedInvoice.selectedClinicInvoiceId || null,
          interbranch_id: selectedInvoice.invoice_id,
          status: status,
          patient_location: currentLocation,
          consultantName: null,
          surgeonName: null,
          madeby: null,
        };
        if (selectedClinicPatient) {
          payloadSelected.patient_id = selectedClinicPatient.patient_id;
        } else {
          delete payloadSelected.patient_id;
        }

        if (selectedInvoice.selectedClinicInvoiceId) {
          responseSelected = await fetch(
            `${BASE_URL}/V1/invoice/${selectedInvoice.selectedClinicInvoiceId}?location=${selectedInvoice.interbranchLocation}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payloadSelected),
            },
          );
        } else {
          responseSelected = await fetch(
            `${BASE_URL}/V1/invoice/addInvoice?location=${selectedInvoice.interbranchLocation}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payloadSelected),
            },
          );
        }
        const resultSelected = await responseSelected.json();

        if (!responseSelected.ok) {
          Toast.fire({
            icon: "error",
            title: resultSelected.message || `Failed to update/create invoice at selected clinic (${selectedInvoice.interbranchLocation})`,
          });
          setLoading(false);
          return;
        }

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Invoice data has been updated successfully in both clinic locations.",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchInvoices();
        handleCloseModal();
      } else {
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
          Swal.fire({
            icon: "success",
            title: "Updated!",
            text: "Invoice data has been updated successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
          fetchInvoices();
          handleCloseModal();
        } else {
          Toast.fire({
            icon: "error",
            title: "Failed to update invoice",
          });
          console.error("Backend Error:", result.message);
        }
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving changes.",
      });
      console.error("Network Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updatePayableAmt = (updatedInvoice) => {
    let payableAmt = updatedInvoice.Sub_Total;

    if (
      (updatedInvoice.bill_Type || "").toLowerCase() === "insurance" &&
      (updatedInvoice.bill_method || "").toUpperCase() === "PDC"
    ) {
      payableAmt = 0;
    } else if (updatedInvoice.bill_method === "PDC") {
      const pdcAmount = parseFloat(updatedInvoice.pdc) || 0;
      payableAmt = updatedInvoice.Sub_Total - pdcAmount;
    }

    updatedInvoice.payable_amt = payableAmt;
    setSelectedInvoice(updatedInvoice);
  };

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false);
  };

  const buildInvoiceHtml = (invoice, mainLogo, showPrintBtn = true) => {
    const trimmedLocation = currentLocation ? currentLocation.trim() : "";
    const clinicAddr = clinincLoc[trimmedLocation] ||
      clinincLoc[currentLocation] || {
      invoiceAddress: "<b>Healing Hands Clinic</b>",
      invoiceHelplineNo: "8888288884",
    };

    const { dynamicRows, Sub_Total } = getDynamicRowsFromInvoice(invoice);

    const totAmt = parseFloat(invoice.totalamt || Sub_Total) || 0;
    const discAmt = parseFloat(invoice.discount) || 0;
    const isInsurance =
      (invoice.bill_Type || "").toLowerCase() === "insurance" ||
      (invoice.bill_type || "").toLowerCase() === "insurance" ||
      ["cashless", "reimbursement", "pdc"].includes((invoice.status || "").toLowerCase()) ||
      !!invoice.insurancecompany ||
      !!invoice.insurance_company_name;

    const pleasePayAmt = isInsurance ? totAmt : Math.max(0, totAmt - discAmt);

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
          <td>Bill Date:</td><td>${getISTDate(invoice.due_date)}</td>
        </tr>
        <tr>
          <td>Patient Name:</td><td>${invoice.prefix || ""} ${invoice.patient_name || invoice.name}</td>
          <td>Gender / Age:</td><td>${invoice.sex || invoice.gender || "N/A"} / ${invoice.age} yrs </td>
        </tr>
        <tr>
          <td>Patient ID:</td><td>${invoice.patient_uid || "N/A"}</td>
          <td>Admission No:</td><td>${invoice.admission_no}</td>
        </tr>
        <tr>
          <td>Insurance Name:</td>
          <td>${(invoice.status || "").toLowerCase() === "cashless" || (invoice.status || "").toLowerCase() === "reimbursement" || (invoice.status || "").toLowerCase() === "pdc" || invoice.bill_Type === "insurance" ? invoice.insurance_company_name || "" : ""}</td>
          <td>Bed Category:</td><td>${invoice.bed_desc || invoice.bed_no || "N/A"}</td>
        </tr>
        <tr>
          <td>TPA Name:</td>
          <td>${(invoice.status || "").toLowerCase() === "cashless" || (invoice.status || "").toLowerCase() === "reimbursement" || (invoice.status || "").toLowerCase() === "pdc" || invoice.bill_Type === "insurance" ? invoice.tpa_name || "" : ""}</td>
          <td>Admission Date & Time:</td><td>${getISTDate(invoice.creation_date)} &nbsp;${invoice.admissiontime}</td>
        </tr>
        <tr>
          <td>Doctor Name:</td><td>${invoice.consultant_name}</td>
          <td>Discharge Date & Time:</td><td>${getISTDate(invoice.due_date)} &nbsp;${invoice.dischargetime}</td>
        </tr>
        <tr>
          <td>Surgeon Name:</td><td>${invoice.surgeon_name}</td>
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
              `,
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

      <div class="btn-container" style="${showPrintBtn ? '' : 'display: none;'}">
        <button class="print-btn" onclick="window.print()">Print Invoice</button>
      </div>
    </body>
  </html>
  `;
    return printContent;
  };

  const handlePrint = (invoice) => {
    console.log("🖨️ [PRINT INVOICE] Full Data fetched from database/state:", invoice);
    if (invoice && typeof invoice === "object") {
      const { dynamicRows, Sub_Total } = getDynamicRowsFromInvoice(invoice);
      console.log("📋 Invoice ID:", invoice.invoice_id);
      console.log("👤 Patient Name:", invoice.patient_name);
      console.log("📞 Phone:", invoice.patient_phone);
      console.log("🆔 UID No:", invoice.patient_uid);
      console.log("🏥 Admission No:", invoice.admission_no);
      console.log("🗓️ Admission Date & Time:", `${formatDateForDisplay(invoice.creation_date)} ${invoice.admissiontime || ""}`.trim());
      console.log("🚪 Discharge Date & Time:", `${formatDateForDisplay(invoice.due_date)} ${invoice.dischargetime || ""}`.trim());
      console.log("⏱️ Raw admissiontime field:", invoice.admissiontime);
      console.log("⏱️ Raw dischargetime field:", invoice.dischargetime);
      console.log("👨‍⚕️ Consultant:", invoice.consultant_name || invoice.consultant);
      console.log("🩺 Surgeon:", invoice.surgeon_name || invoice.prepared_doctor);
      console.log("📅 Bill Date (creation_date):", invoice.creation_date);
      console.log("📅 Due Date:", invoice.due_date);
      console.log("🏷️ Bill Type / Method:", invoice.bill_Type || invoice.bill_type || invoice.status);
      console.log("🏢 Insurance Co:", invoice.insurance_company_name || invoice.insurancecompany);
      console.log("🏢 TPA:", invoice.tpa_name || invoice.tpa);
      console.log("💵 Total Amount:", invoice.totalamt);
      console.log("🏷️ Discount Amount:", invoice.discount);
      console.log("💰 Received Amount:", invoice.receivedamt);
      console.log("❗ Total Due Amount:", invoice.totaldue);
      console.log("📊 Parsed Dynamic Rows (Particulars):", dynamicRows);
      console.log("🧮 Parsed Sub-Total:", Sub_Total);
    }

    if (!invoice || typeof invoice !== "object" || !invoice.invoice_id) {
      Toast.fire({
        icon: "info",
        title: "Preparing invoice for print...",
        timer: 1500,
      });
      return;
    }

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
      const html = buildInvoiceHtml(invoice, mainLogo, true);
      printWindow.document.write(html);
      printWindow.document.close();
    });
  };

  const handleViewInvoice = (invoice) => {
    console.log("👁️ [VIEW INVOICE PREVIEW] Full Data fetched from database/state:", invoice);
    if (!invoice || typeof invoice !== "object" || !invoice.invoice_id) {
      return;
    }
    setLoading(true);

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
      const html = buildInvoiceHtml(invoice, mainLogo, false);
      setPreviewContent(html);
      setPreviewInvoice(invoice);
      setShowPreviewModal(true);
      setLoading(false);
    });
  };

  const filteredInvoices = invoices
    .filter((invoice) => {
      const searchTerm = filters1.global.value?.toLowerCase() || "";

      let matchesSearch = true;
      if (searchTerm) {
        matchesSearch =
          invoice.patient_name?.toLowerCase().includes(searchTerm) ||
          invoice.invoice_id?.toString().toLowerCase().includes(searchTerm) ||
          invoice.patient_phone?.toLowerCase().includes(searchTerm);
      }

      let matchesCategory = true;
      if (paymentCategoryFilter !== "All") {
        const itemStatus = invoice.status || invoice.pay_mode || "";
        if (paymentCategoryFilter === "NonInsurance") {
          matchesCategory = itemStatus.toLowerCase() === "noninsurance" || itemStatus.toLowerCase() === "non_insurance";
        } else {
          matchesCategory = itemStatus.toLowerCase() === paymentCategoryFilter.toLowerCase();
        }
      }

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const dateA = a.creation_date ? new Date(a.creation_date).getTime() : 0;
      const dateB = b.creation_date ? new Date(b.creation_date).getTime() : 0;
      if (dateA !== dateB) {
        return dateB - dateA;
      }
      const idA = parseInt(a.invoice_id) || 0;
      const idB = parseInt(b.invoice_id) || 0;
      return idB - idA;
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
              {isDbSearching && (
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
          <Button
            variant={isTodayFiltered ? "primary" : "outline-primary"}
            onClick={handleTodayFilterClick}
            style={{
              borderRadius: "6px",
              padding: "5px 10px",
              fontSize: "12px",
              fontWeight: "500",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginLeft: "5px",
            }}
          >
            <FeatherIcon icon="calendar" size={12} className="me-1" />
            Today's IPD Bills
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
            onClick={() => {
              setFromDate(null);
              setToDate(null);
              setFilters1({
                global: { value: null, matchMode: FilterMatchMode.EQUALS },
              });
            }}
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
      <PageBreadcrumb pagename="IPD Bills" />

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
                      header="Bill No"
                      style={{ width: "100px", border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      headerClassName="datatable-header-center"
                      field="patient_name"
                      header="Patient Name"
                      body={(rowData) => {
                        const hasPatientLocation =
                          rowData.patient_location !== null &&
                          rowData.patient_location !== undefined &&
                          rowData.patient_location !== "" &&
                          rowData.patient_location !== "NULL";
                        return (
                          <span>
                            {hasPatientLocation && (
                              <small style={{ color: "red", fontWeight: "bold", marginRight: "5px" }}>
                                (Interbranch: {rowData.patient_location})<br></br>
                              </small>
                            )}
                            {rowData.prefix ? `${rowData.prefix} ` : ""}
                            {rowData.patient_name || "-"}
                          </span>
                        );
                      }}
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
                      field="status"
                      header={
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ marginBottom: '4px' }}>Payment Category</span>
                          <select
                            className="form-select form-select-sm"
                            style={{ width: '110px', fontSize: '11px', padding: '2px 18px 2px 5px', borderRadius: '4px', border: '1px solid #4dd0e1', cursor: 'pointer' }}
                            value={paymentCategoryFilter}
                            onChange={(e) => setPaymentCategoryFilter(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="All">All</option>
                            <option value="Cashless">Cashless</option>
                            <option value="NonInsurance">NonInsurance</option>
                            <option value="Reimbursement">Reimbursement</option>
                          </select>
                        </div>
                      }
                      style={{ width: "130px", border: "1px solid #4dd0e1" }}
                      body={(rowData) => {
                        const status = rowData.status || "";
                        const statusLower = status.toLowerCase();
                        const isInteractive =
                          statusLower === "cashless" ||
                          statusLower === "pdc" ||
                          statusLower === "reimbursement";
                        const isCashless = statusLower === "cashless";
                        return (
                          <div
                            className={isCashless ? "cashless-patient" : ""}
                            style={
                              isInteractive
                                ? {
                                  cursor: "pointer",
                                  fontWeight: "bold",
                                }
                                : {}
                            }
                            onClick={
                              isInteractive
                                ? () => openCashlessModal(rowData)
                                : undefined
                            }
                          >
                            {status || rowData.pay_mode}
                          </div>
                        );
                      }}
                    />
                    <Column
                      headerClassName="datatable-header-center"
                      field="payable_amt"
                      header="Payable Amount"
                      body={(rowData) => {
                        const val = Math.round(parseFloat(rowData.payable_amt) || 0);
                        return `₹ ${val.toLocaleString("en-IN")}`;
                      }}
                      style={{
                        width: "110px",
                        border: "1px solid #4dd0e1",
                        textAlign: "right",
                      }}
                    />
                    <Column
                      headerClassName="datatable-header-center"
                      field="due_amt"
                      header="Due Amount"
                      body={(rowData) => {
                        const val = Math.round(parseFloat(rowData.due_amt) || 0);
                        return `₹ ${val.toLocaleString("en-IN")}`;
                      }}
                      style={{
                        width: "110px",
                        border: "1px solid #4dd0e1",
                        textAlign: "right",
                      }}
                    />
                    <Column
                      headerClassName="datatable-header-center"
                      field="madeby_name"
                      header="Made By"
                      body={(rowData) => {
                        if (rowData.madeby_name) return rowData.madeby_name;
                        if (rowData.madeby) {
                          const found = fdeOptions.find((opt) => opt.FDEID == rowData.madeby);
                          if (found) return found.FDEName;
                          return rowData.madeby;
                        }
                        return "-";
                      }}
                      style={{
                        width: "120px",
                        border: "1px solid #4dd0e1",
                        textAlign: "center",
                      }}
                    />
                    <Column
                      headerClassName="datatable-header-center"
                      header="Actions"
                      style={{ width: "100px", border: "1px solid #4dd0e1" }}
                      body={(rowData) => {
                        const isMirror = rowData.status === "Interbranch-Bill" || (rowData.interbranch_id !== null && rowData.interbranch_id !== undefined && rowData.interbranch_id !== "" && rowData.interbranch_id !== 0 && rowData.interbranch_id !== "0");
                        return (
                          <div className="d-flex justify-content-center gap-2">
                            {!isMirror && (
                              <>
                                <Button
                                  style={{
                                    borderRadius: "8px",
                                    padding: "7px 11px",
                                    fontSize: "14px",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                  variant="primary"
                                  title="Edit Bill Details"
                                  disabled={
                                    rowData.payment_count > 0 ||
                                    (rowData.bill_method !== "PDC" && rowData.status !== "PDC" && parseFloat(rowData.receivedamt) > 0) ||
                                    (moment().startOf("day").diff(moment(rowData.creation_date).startOf("day"), "days") > 2) ||
                                    (moment().startOf("day").diff(moment(rowData.creation_date).startOf("day"), "days") < 0)
                                  }
                                  onClick={() => handleEditInvoice(rowData)}
                                >
                                  <FeatherIcon icon="edit" size="15" />
                                </Button>
                                <Link
                                  to="/ipd-collection"
                                  state={{
                                    invoiceId: rowData.invoice_id,
                                    patientDetails: {
                                      name: rowData.patient_name || rowData.name || "",
                                      uhid: rowData.patient_uid || rowData.Uid_no || "",
                                      patient_id: rowData.patient_id || "",
                                      phone: rowData.patient_phone || rowData.phone || "",
                                    },
                                  }}
                                  className="btn btn-primary text-white"
                                  title="IPD Collections"
                                  style={{
                                    borderRadius: "8px",
                                    padding: "7px 11px",
                                    fontSize: "14px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <FeatherIcon icon="credit-card" size="15" />
                                </Link>
                              </>
                            )}
                            {isMirror ? (
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
                                onClick={() => handleViewInvoice(rowData)}
                              >
                                <FeatherIcon icon="eye" size="15" />
                              </Button>
                            ) : (
                              <Button
                                style={{
                                  variant: "primary",
                                  borderRadius: "8px",
                                  padding: "7px 11px",
                                  fontSize: "14px",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                title="Print IPD Bill"
                                onClick={() => handlePrint(rowData)}
                              >
                                <FeatherIcon icon="printer" size="15" />
                              </Button>
                            )}
                          </div>
                        );
                      }}
                    />
                  </DataTable>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Invoice Print Preview Modal */}
      <Modal
        show={showPreviewModal}
        onHide={() => setShowPreviewModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton style={{ backgroundColor: "#e0f7fa", borderBottom: "1px solid #00bcd4" }}>
          <Modal.Title style={{ color: "#00838f", fontWeight: "bold", fontSize: "1.1rem" }}>
            <FeatherIcon icon="eye" className="me-2" size={18} />
            IPD Bill Preview
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 bg-light" style={{ maxHeight: "80vh", overflowY: "auto" }}>
          <div className="p-4 bg-white shadow-sm mx-auto" style={{ width: "210mm", minHeight: "297mm" }}>
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
      </Modal>

      <Modal show={showModal} onHide={handleCloseModal} size="xl" centered >
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
            <Form id="edit-invoice-form" onSubmit={handleSaveChanges}>
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
                    Patient & Clinical Information
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
                        Bill Number
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        name="invoice_id"
                        value={selectedInvoice.invoice_id}
                        onChange={handleInputChange}
                        isInvalid={!!invoiceWarning}
                        style={{
                          borderRadius: "10px",
                          fontSize: "12px",
                          backgroundColor: "#fff",
                          border: "1px solid #4dd0e1",
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
                    <Col md={3}>
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
                        style={{
                          borderRadius: "10px",
                          fontSize: "12px",
                          border: "1px solid #4dd0e1",
                        }}
                        onChange={(e) =>
                          setSelectedInvoice({
                            ...selectedInvoice,
                            admission_no: e.target.value,
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
                        Patient Name
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
                        Contact Number
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        value={selectedInvoice.patient_phone || "N/A"}
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
                        UID Number
                      </Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        value={selectedInvoice.patient_uid || "N/A"}
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
                        readOnly
                        required
                        size="sm"
                        type="text"
                        style={{
                          borderRadius: "10px",
                          fontSize: "12px",
                          border: "1px solid #4dd0e1",
                          cursor: "not-allowed",
                          backgroundColor: "#e7ebebff",
                        }}
                        value={
                          selectedInvoice.creation_date
                            ? selectedInvoice.creation_date.split("-").reverse().join("-")
                            : ""
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
                        onKeyDown={(e) => e.preventDefault()}   // ⛔ block typing
                        onPaste={(e) => e.preventDefault()}     // ⛔ block paste
                        onWheel={(e) => e.target.blur()}        // ⛔ prevent scroll change
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
                    <Col md={3}>
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
                      <Form.Select
                        required
                        size="sm"
                        style={{
                          borderRadius: "10px",
                          fontSize: "12px",
                          border: "1px solid #4dd0e1",
                          height: "33px",
                        }}
                        value={
                          selectedInvoice.bed_no ||
                          selectedInvoice.bed_desc ||
                          ""
                        }
                        onChange={(e) =>
                          setSelectedInvoice({
                            ...selectedInvoice,
                            bed_no: e.target.value,
                            bed_desc: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Bed Category</option>
                        <option value="General Ward">General Ward</option>
                        <option value="Semi Private">Semi Private</option>
                        <option value="Private">Private</option>
                        <option value="Deluxe">Deluxe</option>
                        <option value="Super Deluxe">Super Deluxe</option>
                        <option value="Suite">Suite</option>
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
                        Consultant Name{" "}
                        <span style={{ color: "red" }} className="required">
                          *
                        </span>
                      </Form.Label>
                      <Form.Control
                        readOnly
                        required
                        size="sm"
                        type="text"
                        style={{
                          borderRadius: "10px",
                          fontSize: "12px",
                          border: "1px solid #4dd0e1",
                          backgroundColor: "#e7ebebff",
                          cursor: "not-allowed",
                        }}
                        value={
                          consultants.find(
                            (c) =>
                              String(c.doctor_id) ===
                              String(selectedInvoice?.consultant)
                          )?.name ||
                          selectedInvoice?.consultant_name ||
                          selectedInvoice?.consultant ||
                          ""
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
                          <option key={i} value={s.doctor_id}>
                            {s.name}
                          </option>
                        ))}
                        {selectedInvoice.prepared_doctor &&
                          !surgeons.some(
                            (s) =>
                              s.doctor_id == selectedInvoice.prepared_doctor,
                          ) && (
                            <option value={selectedInvoice.prepared_doctor}>
                              {selectedInvoice.surgeon_name ||
                                selectedInvoice.prepared_doctor}
                            </option>
                          )}
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
                        Made By <span style={{ color: "red" }} className="required">*</span>
                      </Form.Label>
                      <Form.Select
                        required
                        size="sm"
                        style={{
                          borderRadius: "10px",
                          fontSize: "12px",
                          border: "1px solid #4dd0e1",
                        }}
                        value={selectedInvoice?.madeby || ""}
                        onChange={(e) =>
                          setSelectedInvoice({
                            ...selectedInvoice,
                            madeby: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Made By</option>
                        {fdeOptions.map((fde, i) => (
                          <option key={i} value={fde.FDEID}>
                            {fde.FDEName}
                          </option>
                        ))}
                        {selectedInvoice?.madeby &&
                          !fdeOptions.some(
                            (fde) => fde.FDEID == selectedInvoice.madeby,
                          ) && (
                            <option value={selectedInvoice.madeby}>
                              {selectedInvoice.madeby_name ||
                                selectedInvoice.madeby}
                            </option>
                          )}
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
                          Item/Procedure Name
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
                        <InputGroup size="sm" style={{ flexWrap: "nowrap" }}>
                          <InputGroup.Text
                            style={{
                              borderRadius: "10px",
                              fontSize: "12px",
                              border: "1px solid #4dd0e1",
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
                            size="sm"
                            onWheel={(e) => e.target.blur()}
                            placeholder="0"
                            style={{
                              borderRadius: "10px",
                              fontSize: "12px",
                              border: "1px solid #4dd0e1",
                              borderLeft: "none",
                              borderTopLeftRadius: 0,
                              borderBottomLeftRadius: 0,
                              paddingLeft: "5px",
                            }}
                            type="text"
                            value={
                              row.value !== "" && row.value !== null && row.value !== undefined
                                ? Number(String(row.value).replace(/,/g, "")).toLocaleString("en-IN")
                                : ""
                            }
                            onKeyDown={(e) => {
                              if (["e", "E", "+", "-", "."].includes(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            onChange={(e) =>
                              handleDynamicRowChange(
                                index,
                                "value",
                                e.target.value.replace(/[^0-9]/g, ""),
                              )
                            }
                          />
                        </InputGroup>
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
                      Payment Details
                    </h6>
                    <Row className="g-2">
                      <Col md={4}>
                        <Form.Label
                          style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            marginBottom: "4px",
                            color: "#e53935",
                          }}
                        >
                          *Please select the checkbox if it is an Interbranch bill
                        </Form.Label>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            height: "30px",
                          }}
                        >
                          <style>
                            {`
                              #edit-interbranch-checkbox {
                                border: 1.5px solid #000000 !important;
                                cursor: pointer;
                                transform: scale(1.30);
                                margin-right: 8px;
                              }
                              #edit-interbranch-checkbox:checked {
                                background-color: #00bcd4 !important;
                                border-color: #00bcd4 !important;
                              }
                            `}
                          </style>
                          <Form.Check
                            type="checkbox"
                            id="edit-interbranch-checkbox"
                            label="Interbranch Bill"
                            checked={!!selectedInvoice.isInterbranch}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSelectedClinicPatient(null);
                              setErrors((prev) => ({ ...prev, selectedClinicUid: null }));
                              setSelectedInvoice((prev) => {
                                if (!prev) return null;
                                return {
                                  ...prev,
                                  isInterbranch: checked,
                                  interbranchLocation: checked ? prev.interbranchLocation : "",
                                  selectedClinicUid: checked ? prev.selectedClinicUid : "",
                                  selectedClinicInvoiceId: checked ? prev.selectedClinicInvoiceId : null,
                                };
                              });
                            }}
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#333",
                              cursor: "pointer",
                              margin: 0,
                            }}
                          />
                        </div>
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
                          Payment Category <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          required
                          size="sm"
                          style={{
                            borderRadius: "10px",
                            fontSize: "12px",
                            border: "1px solid #4dd0e1",
                          }}
                          value={
                            selectedInvoice.bill_Type ||
                            (selectedInvoice.insurancecompany
                              ? "insurance"
                              : "non_insurance")
                          }
                          onChange={(e) => {
                            const type = e.target.value;
                            setSelectedInvoice((prev) => {
                              if (!prev) return null;
                              return {
                                ...prev,
                                bill_Type: type,
                                // Reset insurance details if switching away from insurance
                                ...(type !== "insurance" && {
                                  insurancecompany: null,
                                  tpa: null,
                                  bill_method: "non_insurance",
                                }),
                              };
                            });

                            // Also update modal calculation state
                            setModalInvoiceData((prev) => {
                              const updated = {
                                ...prev,
                                bill_Type: type,
                                discount: "",
                                pdc: "",
                                ...(type !== "insurance" && {
                                  bill_method: "non_insurance",
                                }),
                              };
                              const subTotal =
                                parseFloat(updated.Sub_Total) || 0;
                              const payable = subTotal;
                              updated.payableAmount = Math.max(
                                0,
                                payable,
                              ).toFixed(0);

                              setSelectedInvoice((prevInvoice) => ({
                                ...prevInvoice,
                                payable_amt: updated.payableAmount,
                              }));
                              return updated;
                            });
                          }}
                        >
                          <option value="non_insurance">Non-Insurance</option>
                          <option value="insurance">Insurance</option>
                          <option value="charity">Charity</option>
                        </Form.Select>
                      </Col>

                      {selectedInvoice.isInterbranch && (
                        <>
                          <Col md={4}>
                            <Form.Label
                              style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                marginBottom: "2px",
                              }}
                              className="text-muted"
                            >
                              Patient Origin Clinic <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Select
                              required
                              size="sm"
                              style={{
                                borderRadius: "10px",
                                fontSize: "12px",
                                border: "1px solid #4dd0e1",
                              }}
                              name="interbranchLocation"
                              value={selectedInvoice.interbranchLocation || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSelectedInvoice({
                                  ...selectedInvoice,
                                  interbranchLocation: val,
                                  selectedClinicUid: val === "DP Road" ? "N/A" : "",
                                });
                              }}
                            >
                              <option value="">SELECT LOCATION</option>
                              {clinicLocations
                                .filter((loc) => (typeof loc === "object" ? loc.value : loc) !== currentLocation)
                                .map((loc, idx) => (
                                  <option key={idx} value={typeof loc === "object" ? loc.value : loc}>
                                    {typeof loc === "object" ? loc.label : loc}
                                  </option>
                                ))}
                            </Form.Select>
                          </Col>

                          {selectedInvoice.interbranchLocation && (
                            <Col md={4}>
                              <Form.Label
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  marginBottom: "2px",
                                }}
                                className="text-muted"
                              >
                                Patient UID at Origin Clinic{" "}
                                {selectedInvoice.interbranchLocation !== "DP Road" && (
                                  <span className="text-danger">*</span>
                                )}
                              </Form.Label>
                              <div style={{ position: "relative" }}>
                                <Form.Control
                                  required={selectedInvoice.interbranchLocation !== "DP Road"}
                                  disabled={selectedInvoice.interbranchLocation === "DP Road"}
                                  size="sm"
                                  name="selectedClinicUid"
                                  style={{
                                    borderRadius: "10px",
                                    fontSize: "12px",
                                    paddingRight: isSearchingUid ? "30px" : "12px",
                                    border:
                                      selectedInvoice.interbranchLocation !== "DP Road" &&
                                        !!errors.selectedClinicUid
                                        ? "1px solid red"
                                        : "1px solid #4dd0e1",
                                  }}
                                  value={selectedInvoice.selectedClinicUid || ""}
                                  onChange={(e) =>
                                    setSelectedInvoice({
                                      ...selectedInvoice,
                                      selectedClinicUid: e.target.value,
                                    })
                                  }
                                  placeholder="Enter Patient UID No"
                                />
                                {isSearchingUid && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      right: "10px",
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      zIndex: 10,
                                      display: "flex",
                                      alignItems: "center"
                                    }}
                                  >
                                    <div
                                      className="spinner-border spinner-border-sm text-info"
                                      role="status"
                                      style={{ width: "1rem", height: "1rem" }}
                                    >
                                      <span className="visually-hidden">Loading...</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              {errors.selectedClinicUid && (
                                <div
                                  className="text-danger"
                                  style={{
                                    fontSize: "10px",
                                    marginTop: "4px",
                                    fontWeight: "600",
                                  }}
                                >
                                  {errors.selectedClinicUid}
                                </div>
                              )}
                              {selectedClinicPatient && (
                                <div
                                  className="text-success"
                                  style={{
                                    fontSize: "11px",
                                    marginTop: "4px",
                                    fontWeight: "600",
                                  }}
                                >
                                  <strong> *Patient Found: </strong> {selectedClinicPatient.name} - {selectedClinicPatient.phone || "N/A"} - {selectedClinicPatient.Uid_no || "N/A"}
                                </div>
                              )}
                            </Col>
                          )}
                        </>
                      )}

                      {/* 1. Show Insurance Company Dropdown */}
                      {(selectedInvoice.bill_Type === "insurance" ||
                        selectedInvoice.insurancecompany) && (
                          <Col md={4}>
                            <Form.Label
                              style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                marginBottom: "2px",
                              }}
                              className="text-muted"
                            >
                              Insurance Company <span style={{ color: "red" }} className="required">*</span>
                            </Form.Label>
                            <Form.Select
                              required
                              size="sm"
                              style={{
                                borderRadius: "10px",
                                fontSize: "12px",
                                border: "1px solid #4dd0e1",
                              }}
                              value={selectedInvoice.insurancecompany || ""}
                              onChange={(e) =>
                                setSelectedInvoice({
                                  ...selectedInvoice,
                                  insurancecompany: e.target.value,
                                })
                              }
                            >
                              <option value="">Select Company</option>
                              {insurance.map((co, idx) => (
                                <option key={idx} value={co.comapny_id}>
                                  {co.companyname}
                                </option>
                              ))}
                              {selectedInvoice.insurancecompany &&
                                !insurance.some(
                                  (co) =>
                                    co.comapny_id ==
                                    selectedInvoice.insurancecompany,
                                ) && (
                                  <option
                                    value={selectedInvoice.insurancecompany}
                                  >
                                    {selectedInvoice.insurance_company_name ||
                                      selectedInvoice.insurancecompany}
                                  </option>
                                )}
                            </Form.Select>
                          </Col>
                        )}

                      {/* 2. Show TPA Dropdown */}
                      {(selectedInvoice.bill_Type === "insurance" ||
                        selectedInvoice.tpa) && (
                          <Col md={4}>
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
                              value={selectedInvoice.tpa || ""}
                              onChange={(e) =>
                                setSelectedInvoice({
                                  ...selectedInvoice,
                                  tpa: e.target.value,
                                })
                              }
                            >
                              <option value="">Select TPA</option>
                              {tpa.map((t, idx) => (
                                <option key={idx} value={t.comapny_id}>
                                  {t.companyname}
                                </option>
                              ))}
                              {selectedInvoice.tpa &&
                                !tpa.some(
                                  (t) => t.comapny_id == selectedInvoice.tpa,
                                ) && (
                                  <option value={selectedInvoice.tpa}>
                                    {selectedInvoice.tpa_name ||
                                      selectedInvoice.tpa}
                                  </option>
                                )}
                            </Form.Select>
                          </Col>
                        )}

                      {/* 3. Bill Method - Only shown if type is insurance */}
                      {selectedInvoice.bill_Type === "insurance" && (
                        <Col md={4}>
                          <Form.Label
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              marginBottom: "2px",
                            }}
                            className="text-muted"
                          >
                            Bill Method <span style={{ color: "red" }} className="required">*</span>
                          </Form.Label>
                          <Form.Select
                            required
                            size="sm"
                            name="bill_method"
                            style={{
                              borderRadius: "10px",
                              fontSize: "12px",
                              border: "1px solid #4dd0e1",
                            }}
                            value={selectedInvoice.bill_method || ""}
                            onChange={(e) => {
                              const method = e.target.value;
                              setSelectedInvoice((prev) => ({
                                ...prev,
                                bill_method: method,
                              }));
                              setModalInvoiceData((prev) => ({
                                ...prev,
                                bill_method: method,
                                payableAmount: calculateActivePayableAmt(
                                  selectedInvoice,
                                  prev.Sub_Total,
                                  prev.discount,
                                  prev.pdc,
                                  prev.bill_Type,
                                  method,
                                ),
                              }));
                            }}
                          >
                            <option value="">Select Method</option>
                            <option value="Cashless">Cashless</option>
                            <option value="Reimbursement">Reimbursement</option>
                            <option value="PDC">PDC</option>
                          </Form.Select>
                        </Col>
                      )}

                      {/* 4. Deduction Fields (Discount/PDC) based on type/method */}
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
                              {selectedInvoice.bill_Type === "charity" ? "Charity Discount Amount (₹)" : "Non-Insurance Discount Amount (₹)"}
                            </Form.Label>
                            <InputGroup size="sm" style={{ flexWrap: "nowrap" }}>
                              <InputGroup.Text
                                style={{
                                  borderRadius: "10px",
                                  fontSize: "12px",
                                  border: "1px solid #4dd0e1",
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
                                size="sm"
                                type="text"
                                min="0"
                                onWheel={(e) => e.target.blur()}
                                onKeyDown={(e) => {
                                  if (["e", "E", "+", "-", "."].includes(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                                style={{
                                  borderRadius: "10px",
                                  fontSize: "12px",
                                  border: "1px solid #4dd0e1",
                                  borderLeft: "none",
                                  borderTopLeftRadius: 0,
                                  borderBottomLeftRadius: 0,
                                  paddingLeft: "5px",
                                }}
                                value={
                                  modalInvoiceData.discount !== "" && modalInvoiceData.discount !== null && modalInvoiceData.discount !== undefined
                                    ? Number(String(modalInvoiceData.discount).replace(/,/g, "")).toLocaleString("en-IN")
                                    : ""
                                }
                                onChange={(e) => {
                                  const val = e.target.value.replace(
                                    /[^0-9]/g,
                                    "",
                                  );
                                  setModalInvoiceData((prev) => ({
                                    ...prev,
                                    discount: val,
                                    payableAmount: calculateActivePayableAmt(
                                      selectedInvoice,
                                      prev.Sub_Total,
                                      val,
                                      prev.pdc,
                                      prev.bill_Type,
                                      prev.bill_method,
                                    ),
                                  }));
                                }}
                              />
                            </InputGroup>
                          </Col>
                        )}

                      {selectedInvoice.bill_Type === "insurance" &&
                        selectedInvoice.bill_method === "PDC" && (
                          <Col md={4}>
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
                            <InputGroup
                              size="sm"
                              style={{ flexWrap: "nowrap" }}
                            >
                              <InputGroup.Text
                                style={{
                                  borderRadius: "10px",
                                  fontSize: "12px",
                                  border: "1px solid #4dd0e1",
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
                                size="sm"
                                type="text"
                                min="0"
                                onWheel={(e) => e.target.blur()}
                                onKeyDown={(e) => {
                                  if (
                                    ["e", "E", "+", "-", "."].includes(e.key)
                                  ) {
                                    e.preventDefault();
                                  }
                                }}
                                style={{
                                  borderRadius: "10px",
                                  fontSize: "12px",
                                  border: "1px solid #4dd0e1",
                                  borderLeft: "none",
                                  borderTopLeftRadius: 0,
                                  borderBottomLeftRadius: 0,
                                  paddingLeft: "5px",
                                }}
                                value={
                                  modalInvoiceData.pdc !== "" && modalInvoiceData.pdc !== null && modalInvoiceData.pdc !== undefined
                                    ? Number(String(modalInvoiceData.pdc).replace(/,/g, "")).toLocaleString("en-IN")
                                    : ""
                                }
                                onChange={(e) => {
                                  const val = e.target.value.replace(
                                    /[^0-9]/g,
                                    "",
                                  );
                                  setModalInvoiceData((prev) => ({
                                    ...prev,
                                    pdc: val,
                                    payableAmount: calculateActivePayableAmt(
                                      selectedInvoice,
                                      prev.Sub_Total,
                                      prev.discount,
                                      val,
                                      prev.bill_Type,
                                      prev.bill_method,
                                    ),
                                  }));
                                }}
                              />
                            </InputGroup>
                          </Col>
                        )}

                      {selectedInvoice.bill_Type === "insurance" &&
                        selectedInvoice.bill_method === "PDC" && (
                          <Col md={4}>
                            <Form.Label
                              style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                marginBottom: "2px",
                              }}
                              className="text-muted"
                            >
                              Cheque Number
                            </Form.Label>
                            <Form.Control
                              size="sm"
                              name="chequeno"
                              style={{
                                borderRadius: "10px",
                                fontSize: "12px",
                                border: "1px solid #4dd0e1",
                              }}
                              placeholder="Enter cheque number"
                              type="text"
                              onKeyDown={(e) => {
                                if (["e", "E", "+", "-", "."].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              value={selectedInvoice.chequeno || ""}
                              onChange={handleInputChange}
                            />
                          </Col>
                        )}

                      {/* Note Area */}
                      <Col md={4}>
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
                          value={selectedInvoice.note || ""}
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
                    <div
                      style={{
                        flexGrow: 1,
                        maxHeight: "120px",
                        overflowY: "auto",
                        marginBottom: "5px",
                      }}
                    >
                      <h6
                        className="mb-5"
                        style={{
                          fontSize: "15px",
                          textAlign: "left",
                          color: "#00838f",
                          fontWeight: "600"
                        }}
                      >
                        Charge Breakdown
                      </h6>
                      {modalInvoiceData.dynamicRows
                        .filter((r) => r.value > 0)
                        .map((row, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "12.5px",
                              color: "#555",
                              padding: "2px 0",
                            }}
                          >
                            <span>{row.label || "Service"} :</span>
                            <span>
                              ₹ {Math.round(parseFloat(row.value || 0)).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        fontSize: "14px",
                        borderTop: "1px dashed #00bcd4",
                        paddingTop: "8px",
                      }}
                    >
                      <div>
                        Total Amount:{" "}
                        <strong>
                          ₹ {Math.round(parseFloat(modalInvoiceData.Sub_Total || 0)).toLocaleString("en-IN")}
                        </strong>
                      </div>
                      {selectedInvoice.bill_Type === "interbranch" ? (
                        <div
                          style={{
                            color: "#00a619ff",
                            fontStyle: "italic",
                            fontSize: "13px",
                            marginTop: "3px",
                            textAlign: "right",
                            fontWeight: "600"
                          }}
                        >
                          * Interbranch bill will be synchronized across both clinic locations.
                        </div>
                      ) : (
                        <div style={{ color: "#d32f2f" }}>
                          {selectedInvoice.bill_method === "PDC"
                            ? "PDC Amount"
                            : selectedInvoice.bill_Type === "charity"
                              ? "Charity Discount"
                              : "Discount"}{" "}
                          (₹):{" "}
                          <strong>
                            - ₹ {Math.round(parseFloat(
                              (selectedInvoice.bill_method === "PDC"
                                ? modalInvoiceData.pdc
                                : modalInvoiceData.discount) || 0,
                            )).toLocaleString("en-IN")}
                          </strong>
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: "18px",
                          color: "#00838f",
                          fontWeight: "bold",
                          marginTop: "8px",
                          borderTop: "2px solid #00bcd4",
                          paddingTop: "5px",
                          width: "30%",
                          textAlign: "right",
                        }}
                      >
                        Total Payable: ₹ {Math.round(parseFloat(modalInvoiceData.payableAmount || 0)).toLocaleString("en-IN")}
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
            variant="success"
            type="submit"
            disabled={loading}
            form="edit-invoice-form"
            style={{ borderRadius: "10px", fontSize: "13px", padding: "10px" }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Cashless Settlement Modal */}
      <Modal
        show={showCashlessModal}
        onHide={() => setShowCashlessModal(false)}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "#e0f7fa",
            borderBottom: "2px solid #4dd0e1",
            padding: "10px",
          }}
        >
          <Modal.Title
            style={{ fontSize: "16px", fontWeight: "600", color: "#00838f" }}
          >
            {String(cashlessData.status).toLowerCase() === "reimbursement"
              ? "Add Reimbursement Amount"
              : String(cashlessData.status).toLowerCase() === "pdc"
                ? "Add PDC Amount"
                : "Add Cashless Amount"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={submitCashless} id="cashless-form">
            <Form.Group className="mb-10 d-flex align-items-center">
              <Form.Label
                style={{ width: "35%", margin: 0, fontWeight: "600", fontSize: "13px" }}
              >
                Claim Number
              </Form.Label>
              <InputGroup style={{ width: "65%", flexWrap: "nowrap" }}>
                <Form.Control
                  type="text"
                  placeholder="Enter Claim Number"
                  value={cashlessData.claimNo}
                  onChange={(e) =>
                    setCashlessData((prev) => ({
                      ...prev,
                      claimNo: e.target.value,
                    }))
                  }
                  style={{
                    border: "1px solid rgb(77, 208, 225)",
                    borderRadius: "10px",
                    height: "32px",
                    fontSize: "13px",
                  }}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-10 d-flex align-items-center">
              <Form.Label
                style={{ width: "35%", margin: 0, fontWeight: "600", fontSize: "13px" }}
              >
                Total Amount
              </Form.Label>
              <InputGroup style={{ width: "65%", flexWrap: "nowrap" }}>
                <InputGroup.Text
                  style={{
                    backgroundColor: "#e9ecef",
                    border: "1px solid rgb(77, 208, 225)",
                    borderRight: "none",
                    borderTopLeftRadius: "10px",
                    borderBottomLeftRadius: "10px",
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    fontWeight: "500",
                    height: "32px",
                    fontSize: "13px",
                  }}
                >
                  ₹
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  readOnly
                  value={cashlessData.totalamt ? Number(String(cashlessData.totalamt).replace(/,/g, "")).toLocaleString("en-IN") : ""}
                  style={{
                    backgroundColor: "#e9ecef",
                    cursor: "not-allowed",
                    border: "1px solid rgb(77, 208, 225)",
                    borderLeft: "none",
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderTopRightRadius: "10px",
                    borderBottomRightRadius: "10px",
                    height: "32px",
                    fontSize: "13px",
                  }}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-10 d-flex align-items-center">
              <Form.Label
                style={{ width: "35%", margin: 0, fontWeight: "600", fontSize: "13px" }}
              >
                Approved Amount <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup style={{ width: "65%", flexWrap: "nowrap" }}>
                <InputGroup.Text
                  style={{
                    backgroundColor: "#f8f9fa",
                    border: "1px solid rgb(77, 208, 225)",
                    borderRight: "none",
                    borderTopLeftRadius: "10px",
                    borderBottomLeftRadius: "10px",
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    fontWeight: "500",
                    height: "32px",
                    fontSize: "13px",
                  }}
                >
                  ₹
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  required
                  value={cashlessData.receivedamt ? Number(String(cashlessData.receivedamt).replace(/,/g, "")).toLocaleString("en-IN") : ""}
                  onChange={(e) =>
                    handleCashlessChange("receivedamt", e.target.value.replace(/[^0-9]/g, ""))
                  }
                  style={{
                    border: "1px solid rgb(77, 208, 225)",
                    borderLeft: "none",
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderTopRightRadius: "10px",
                    borderBottomRightRadius: "10px",
                    height: "32px",
                    fontSize: "13px",
                  }}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-10 d-flex align-items-center">
              <Form.Label
                style={{ width: "35%", margin: 0, fontWeight: "600", fontSize: "13px" }}
              >
                CoPay <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup style={{ width: "65%", flexWrap: "nowrap" }}>
                <InputGroup.Text
                  style={{
                    backgroundColor: "#f8f9fa",
                    border: "1px solid rgb(77, 208, 225)",
                    borderRight: "none",
                    borderTopLeftRadius: "10px",
                    borderBottomLeftRadius: "10px",
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    fontWeight: "500",
                    height: "32px",
                    fontSize: "13px",
                  }}
                >
                  ₹
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  required
                  value={cashlessData.coopay ? Number(String(cashlessData.coopay).replace(/,/g, "")).toLocaleString("en-IN") : ""}
                  onChange={(e) => handleCashlessChange("coopay", e.target.value.replace(/[^0-9]/g, ""))}
                  style={{
                    border: "1px solid rgb(77, 208, 225)",
                    borderLeft: "none",
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderTopRightRadius: "10px",
                    borderBottomRightRadius: "10px",
                    height: "32px",
                    fontSize: "13px",
                  }}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-10 d-flex align-items-center">
              <Form.Label
                style={{ width: "35%", margin: 0, fontWeight: "600", fontSize: "13px" }}
              >
                Deduction Amount
              </Form.Label>
              <InputGroup style={{ width: "65%", flexWrap: "nowrap" }}>
                <InputGroup.Text
                  style={{
                    backgroundColor: "#e9ecef",
                    border: "1px solid rgb(77, 208, 225)",
                    borderRight: "none",
                    borderTopLeftRadius: "10px",
                    borderBottomLeftRadius: "10px",
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    fontWeight: "500",
                    height: "32px",
                    fontSize: "13px",
                  }}
                >
                  ₹
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  readOnly
                  value={cashlessData.deductionamt ? Number(String(cashlessData.deductionamt).replace(/,/g, "")).toLocaleString("en-IN") : ""}
                  style={{
                    backgroundColor: "#e9ecef",
                    cursor: "not-allowed",
                    border: "1px solid rgb(77, 208, 225)",
                    borderLeft: "none",
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderTopRightRadius: "10px",
                    borderBottomRightRadius: "10px",
                    height: "32px",
                    fontSize: "13px",
                  }}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3 d-flex align-items-center">
              <Form.Label
                style={{ width: "35%", margin: 0, fontWeight: "600", fontSize: "13px" }}
              >
                Payable Amount
              </Form.Label>
              <InputGroup style={{ width: "65%", flexWrap: "nowrap" }}>
                <InputGroup.Text
                  style={{
                    backgroundColor: "#e9ecef",
                    border: "1px solid rgb(77, 208, 225)",
                    borderRight: "none",
                    borderTopLeftRadius: "10px",
                    borderBottomLeftRadius: "10px",
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    fontWeight: "500",
                    height: "32px",
                    fontSize: "13px",
                  }}
                >
                  ₹
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  readOnly
                  value={cashlessData.payableamt ? Number(String(cashlessData.payableamt).replace(/,/g, "")).toLocaleString("en-IN") : ""}
                  style={{
                    backgroundColor: "#e9ecef",
                    cursor: "not-allowed",
                    border: "1px solid rgb(77, 208, 225)",
                    borderLeft: "none",
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderTopRightRadius: "10px",
                    borderBottomRightRadius: "10px",
                    height: "32px",
                    fontSize: "13px",
                  }}
                />
              </InputGroup>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            style={{ borderRadius: "10px" }}
            variant="secondary"
            onClick={() => setShowCashlessModal(false)}
          >
            Close
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            form="cashless-form"
            style={{
              backgroundColor: "teal",
              border: "none",
              borderRadius: "10px",
            }}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default IpdBillList;
