import React, { useState, useEffect, useCallback } from "react";
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

// const getDynamicRowsFromInvoice = (invoice) => {
//   const dynamicRows = [];
//   let titleCalculatedTotal = 0;

//   if (!invoice) return { dynamicRows: [], Sub_Total: "0.00" };
//   console.log(invoice.package);

//   if (invoice.package && typeof invoice.package === "string") {
//     invoice.package.split(",").forEach((entry) => {
//       const parts = entry.split(":");
//       if (parts.length === 2) {
//         const label = parts[0].trim();
//         const value = parseFloat(parts[1].trim()) || 0;

//         if (label !== "") {
//           dynamicRows.push({
//             label: label,
//             value: value.toFixed(2),
//             field: "title_parsed",
//           });
//           titleCalculatedTotal += value;
//         }
//       }
//     });

//     console.log("Dynamic rows:", dynamicRows);
//   }

//   const itemMap = {
//     surgeon_amt: invoice.surgeon_desc || "Surgeon Fee",
//     assistant_amt: invoice.assistant_desc || "Assistant Fee",
//     anaesthetists_amt: invoice.anaesthetists_desc || "Anaesthetist Fee",
//     bed_amt: invoice.bed_desc || "Bed Charges",
//     medico_amt: "Medication Charges",
//     medico_ot_amt: "Medication OT Charges",
//     visit_amt: invoice.visit_desc || "Doctor Visits",
//     lab_amt: "Lab Charges",
//     procedures_amt: "Other Procedures",
//     diet_amt: "Diet Charges",
//     consumables_amt: "Consumables",
//     miscellaneous_amt: "Miscellaneous",
//     admin_amt: invoice.admin_desc || "Admin Charges",
//     nurse_amt: invoice.nurse_desc || "Nursing Charges",
//     colonoscopy_amt: "Colonoscopy",
//     colonhydrotherapy_amt: "Colon Hydrotherapy",
//     ot_amt: "OT Charges",
//   };

//   const Sub_Total =
//     titleCalculatedTotal > 0
//       ? titleCalculatedTotal
//       : parseFloat(invoice.totalamt) || 0;
//   return { dynamicRows, Sub_Total: Sub_Total.toFixed(2) };
// };

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
      const value = parseFloat(entries[i + 1]) || 0;
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
        const value = parseFloat(parts[1].trim()) || 0;
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
      : parseFloat(invoice.totalamt || invoice.totalAmt || 0);

  return {
    dynamicRows:
      dynamicRows.length > 0
        ? dynamicRows
        : [{ label: "", value: "0.00", field: "" }],
    Sub_Total: Sub_Total.toFixed(2),
    totalamt: Sub_Total.toFixed(2),
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
  const totalAmt = parseFloat(subtotal) || 0;
  const disc = parseFloat(discount) || 0;
  const p = parseFloat(pdc) || 0;

  if (billMethod === "pdc" || billMethod === "PDC") {
    return Math.max(0, totalAmt - p).toFixed(0);
  }
  return Math.max(0, totalAmt - disc).toFixed(0);
};

const calculatePayableAmt = (invoice) => {
  const totalAmt = parseFloat(invoice.totalamt || invoice.total_amt || 0);
  const discount = parseFloat(invoice.discount || 0);
  const pdc = parseFloat(invoice.pdc || invoice.advance_amt || 0);
  const billMethod = (
    invoice.bill_method ||
    invoice.status ||
    ""
  ).toLowerCase();

  if (
    billMethod === "pdc" ||
    billMethod === "PDC" ||
    (invoice.status && invoice.status.toLowerCase() === "pdc")
  ) {
    return Math.max(0, totalAmt - pdc).toFixed(0);
  }
  return Math.max(0, totalAmt - discount).toFixed(0);
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
    status === "Charity" ||
    status === "NonInsurance" ||
    status.toLowerCase() === "charity" ||
    status.toLowerCase() === "noninsurance" ||
    status.toLowerCase() === "non_insurance";

  if (isTargetMode && creationDate !== currentDate && dueAmt > 0) {
    return "red-row text-white";
  }
  return "";
};

const InvoiceList = () => {
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
  const [insurance, setInsurance] = useState([]);
  const [tpa, setTpa] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDbSearching, setIsDbSearching] = useState(false);
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
  const [invoiceWarning, setInvoiceWarning] = useState("");
  const [originalInvoiceId, setOriginalInvoiceId] = useState(null);
  const [filters1, setFilters1] = useState({
    // global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    global: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  const [showCashlessModal, setShowCashlessModal] = useState(false);
  const [cashlessData, setCashlessData] = useState({
    invoiceid: "",
    totalamt: "0.00",
    receivedamt: "",
    coopay: "",
    deductionamt: "0.00",
    payableamt: "0.00",
  });

  const openCashlessModal = (rowData) => {
    const total = parseFloat(
      rowData.totalamt || rowData.total_amt || rowData.payable_amt || 0,
    ).toFixed(2);
    setCashlessData({
      invoiceid: rowData.invoice_id || "",
      totalamt: total,
      receivedamt: "",
      coopay: "",
      deductionamt: "0.00",
      payableamt: total,
    });
    setShowCashlessModal(true);
  };

  const handleCashlessChange = (field, value) => {
    const newVal = value.replace(/[^0-9.]/g, ""); // Allow digits and dot
    setCashlessData((prev) => {
      const updated = { ...prev, [field]: newVal };
      const received = parseFloat(updated.receivedamt) || 0;
      const coopay = parseFloat(updated.coopay) || 0;
      const total = parseFloat(updated.totalamt) || 0;

      const payable = total - received;
      const deduction = payable - coopay;

      updated.payableamt = payable.toFixed(2);
      updated.deductionamt = deduction.toFixed(2);
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

  const [formData, setFormData] = useState({
    dynamicRows: [],
    Sub_Total: "0.00",
    discount: "0.00",
    pdc: "0.00",
    payableAmount: "0.00",
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
          const pdc = parseFloat(invoice.pdc || invoice.advance_amt || 0) || 0;

          const payable_amt =
            parseFloat(invoice.payable_amt) ||
            calculatePayableAmt({ ...invoice, totalamt, discount, pdc });
          const due_amt =
            invoice.totaldue !== undefined
              ? parseFloat(invoice.totaldue)
              : payable_amt - receivedamt;

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
                  parseFloat(invoice.pdc || invoice.advance_amt || 0) || 0;
                const payable_amt =
                  parseFloat(invoice.payable_amt) ||
                  calculatePayableAmt({ ...invoice, totalamt, discount, pdc });
                const due_amt =
                  invoice.totaldue !== undefined
                    ? parseFloat(invoice.totaldue)
                    : payable_amt - receivedamt;

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

  const calculatePayableAmount = (data) => {
    const subTotal = parseFloat(data.Sub_Total || 0);
    const discountVal = parseFloat(data.discount || 0);
    const discountAmountVal = parseFloat(data.discountAmount || 0);
    const pdcVal = parseFloat(data.pdc || 0);

    let deduction = 0;
    if (data.bill_Type === "charity") {
      deduction = discountAmountVal;
    } else if (data.bill_method === "PDC") {
      deduction = pdcVal;
    } else if (data.bill_Type === "non_insurance") {
      deduction = discountVal;
    }

    return Math.max(0, subTotal - deduction).toFixed(2);
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
        Sub_Total: newSubTotal.toFixed(2),
      };

      updatedModalData.payableAmount = calculatePayableAmount(updatedModalData);

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

      updatedModalData.payableAmount = calculatePayableAmount(updatedModalData);

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

    setOriginalInvoiceId(invoice.invoice_id);
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

    /**
     * Helper to format time for <select> options which expect HH:mm (24h)
     */
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
          : "non_insurance");

    const chequeno =
      invoice.chequeno === "NULL" || !invoice.chequeno ? "" : invoice.chequeno;
    const pdc =
      invoice.pdc || (bill_method === "PDC" ? invoice.advance_amt : "0.00");

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
      // Ensure we have fallback for bed category from existing fields
      bed_no: invoice.bed_no || invoice.bed_desc || "",
    });

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
  };

  const handleSaveChanges = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedInvoice) return;

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
      status = modalInvoiceData.bill_method; // E.g., cashless, pdc, reimbursement
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
      totalamt: Math.round(parseFloat(modalInvoiceData.Sub_Total || 0)),
      payable_amt: Math.round(parseFloat(modalInvoiceData.payableAmount || 0)),
      discount: Math.round(parseFloat(modalInvoiceData.discount || 0)),
      advance_amt: Math.round(parseFloat(modalInvoiceData.pdc || 0)), // Map PDC amount to advance_amt column
      admissiontime: convertTo12Hour(selectedInvoice.admissiontime),
      dischargetime: convertTo12Hour(selectedInvoice.dischargetime),
    };



    setLoading(true);
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
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Invoice data has been updated successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchInvoices(); // Refresh the list from the server
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
    } finally {
      setLoading(false);
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

    const trimmedLocation = currentLocation ? currentLocation.trim() : "";
    const clinicAddr = clinincLoc[trimmedLocation] ||
      clinincLoc[currentLocation] || {
      invoiceAddress: "<b>Healing Hands Clinic</b>",
      invoiceHelplineNo: "8888288884",
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
          <td>Bill Date:</td><td>${formatDateForDisplay(invoice.due_date)}</td>
        </tr>
        <tr>
          <td>Patient Name:</td><td>${invoice.prefix || ""} ${invoice.patient_name || invoice.name}</td>
          <td>Gender / Age:</td><td>${invoice.sex || invoice.gender || "N/A"} / ${invoice.age}</td>
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
          <td>Admission Date & Time:</td><td>${formatDateForDisplay(invoice.creation_date)} &nbsp; ${invoice.admissiontime}</td>
        </tr>
        <tr>
          <td>Doctor Name:</td><td>${invoice.consultant_name}</td>
          <td>Discharge Date & Time:</td><td>${formatDateForDisplay(invoice.due_date)} &nbsp; ${invoice.dischargetime}</td>
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
                  <td>${Math.round(parseFloat(row.value))}</td>
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
      <td>${(Math.round(parseFloat(invoice.totalamt || Sub_Total)) || 0).toLocaleString()}</td>
    </tr>
    ${(Math.round(parseFloat(invoice.discount)) || 0) > 0
          ? `
    <tr>
      <td>Discount</td>
      <td>${(Math.round(parseFloat(invoice.discount)) || 0).toLocaleString()}</td>
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
          <td class="right_align" style="border-left:0; font-weight:bold;">₹ ${(Math.round(parseFloat(invoice.totalamt || Sub_Total)) || 0).toLocaleString()}</td>
          <td class="left_align" style="border-right:0;">Please Pay:</td>
          <td class="right_align" style="border-left:0; font-weight:bold;">
            ₹ ${(Math.round(parseFloat(invoice.payable_amt || calculatePayableAmt(invoice))) || 0).toLocaleString()}
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

  const filteredInvoices = invoices
    .filter((invoice) => {
      const searchTerm = filters1.global.value?.toLowerCase() || "";

      if (!searchTerm) return true;

      return (
        invoice.patient_name?.toLowerCase().includes(searchTerm) ||
        invoice.invoice_id?.toString().toLowerCase().includes(searchTerm) ||
        invoice.patient_phone?.toLowerCase().includes(searchTerm)
      );
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
            Today's Invoice
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
      <NavbarIpdBills />
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
                      header="Invoice ID"
                      style={{ width: "100px", border: "1px solid #4dd0e1" }}
                    />
                    <Column
                      headerClassName="datatable-header-center"
                      field="patient_name"
                      header="Patient Name"
                      body={(rowData) => (
                        <span>
                          {rowData.prefix ? `${rowData.prefix} ` : ""}
                          {rowData.patient_name || "-"}
                        </span>
                      )}
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
                      header="Payment Mode"
                      style={{ width: "110px", border: "1px solid #4dd0e1" }}
                      body={(rowData) => {
                        const status = rowData.status || "";
                        const isCashless = status.toLowerCase() === "cashless";
                        return (
                          <div
                            className={isCashless ? "cashless-patient" : ""}
                            style={
                              isCashless
                                ? {
                                  cursor: "pointer",
                                  color: "red",
                                  fontWeight: "bold",
                                }
                                : {}
                            }
                            onClick={
                              isCashless
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
                        const val = parseFloat(rowData.payable_amt) || 0;
                        return `₹ ${val.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}`;
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
                        const val = parseFloat(rowData.due_amt) || 0;
                        return `₹ ${val.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}`;
                      }}
                      style={{
                        width: "110px",
                        border: "1px solid #4dd0e1",
                        textAlign: "right",
                      }}
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
                            disabled={
                              rowData.payment_count > 0
                            }
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
                        Invoice Number
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
                    <Col md={4}>
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
                    <Col md={4}>
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
                    <Col md={4}>
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
                    <Col md={4}>
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
                    <Col md={4}>
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
                    <Col md={4}>
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
                    <Col md={4}>
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
                          <option key={i} value={c.doctor_id}>
                            {c.name}
                          </option>
                        ))}
                        {selectedInvoice.consultant &&
                          !consultants.some(
                            (c) => c.doctor_id == selectedInvoice.consultant,
                          ) && (
                            <option value={selectedInvoice.consultant}>
                              {selectedInvoice.consultant_name ||
                                selectedInvoice.consultant}
                            </option>
                          )}
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
                        value={
                          selectedInvoice.bed_no ||
                          selectedInvoice.bed_desc ||
                          ""
                        }
                        onChange={(e) =>
                          setSelectedInvoice({
                            ...selectedInvoice,
                            bed_no: e.target.value,
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
                            placeholder="0.00"
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
                            value={row.value || ""}
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
                      Billing Settings
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
                          Bill Type <span className="text-danger">*</span>
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
                            setSelectedInvoice((prev) => ({
                              ...prev,
                              bill_Type: type,
                              // Reset insurance details if switching away from insurance
                              ...(type !== "insurance" && {
                                insurancecompany: null,
                                tpa: null,
                                bill_method: "non_insurance",
                              }),
                            }));

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
                              Insurance Company
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
                            Bill Method
                          </Form.Label>
                          <Form.Select
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
                              Discount Amount (₹)
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
                                value={modalInvoiceData.discount || ""}
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
                                value={modalInvoiceData.pdc || ""}
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
                              Cheque No
                            </Form.Label>
                            <Form.Control
                              size="sm"
                              name="chequeno"
                              style={{
                                borderRadius: "10px",
                                fontSize: "12px",
                                border: "1px solid #4dd0e1",
                              }}
                              placeholder="Enter cheque No"
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
                      <Col md={12}>
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
                        <span>Sub-Total (₹):</span>
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
                        <span>
                          {selectedInvoice.bill_method === "PDC"
                            ? "PDC Amount"
                            : "Discount"}{" "}
                          (₹):
                        </span>
                        <span style={{ fontWeight: "600" }}>
                          - ₹{" "}
                          {parseFloat(
                            (selectedInvoice.bill_method === "PDC"
                              ? modalInvoiceData.pdc
                              : modalInvoiceData.discount) || 0,
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
                          Total Payable (₹):
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
            Add Cashless Amount
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={submitCashless} id="cashless-form">
            <Form.Group className="mb-10 d-flex align-items-center">
              <Form.Label
                style={{ width: "35%", margin: 0, fontWeight: "500" }}
              >
                Total Amount
              </Form.Label>
              <Form.Control
                type="text"
                readOnly
                value={cashlessData.totalamt}
                style={{
                  width: "65%",
                  backgroundColor: "#e9ecef",
                  cursor: "not-allowed",
                  border: "1px solid rgb(77, 208, 225)",
                }}
              />
            </Form.Group>
            <Form.Group className="mb-10 d-flex align-items-center">
              <Form.Label
                style={{ width: "35%", margin: 0, fontWeight: "500" }}
              >
                Approved Amount <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                required
                value={cashlessData.receivedamt}
                onChange={(e) =>
                  handleCashlessChange("receivedamt", e.target.value)
                }
                style={{ width: "65%", border: "1px solid rgb(77, 208, 225)" }}
              />
            </Form.Group>
            <Form.Group className="mb-10 d-flex align-items-center">
              <Form.Label
                style={{ width: "35%", margin: 0, fontWeight: "500" }}
              >
                CoPay <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                required
                value={cashlessData.coopay}
                onChange={(e) => handleCashlessChange("coopay", e.target.value)}
                style={{ width: "65%", border: "1px solid rgb(77, 208, 225)" }}
              />
            </Form.Group>
            <Form.Group className="mb-10 d-flex align-items-center">
              <Form.Label
                style={{ width: "35%", margin: 0, fontWeight: "500" }}
              >
                Deduction Amount
              </Form.Label>
              <Form.Control
                type="text"
                readOnly
                value={cashlessData.deductionamt}
                style={{
                  width: "65%",
                  backgroundColor: "#e9ecef",
                  cursor: "not-allowed",
                  border: "1px solid rgb(77, 208, 225)",
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3 d-flex align-items-center">
              <Form.Label
                style={{ width: "35%", margin: 0, fontWeight: "500" }}
              >
                Payable Amount
              </Form.Label>
              <Form.Control
                type="text"
                readOnly
                value={cashlessData.payableamt}
                style={{
                  width: "65%",
                  backgroundColor: "#e9ecef",
                  cursor: "not-allowed",
                  border: "1px solid rgb(77, 208, 225)",
                }}
              />
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

export default InvoiceList;
