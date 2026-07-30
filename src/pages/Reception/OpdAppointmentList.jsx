import React, { useState, useEffect, useCallback } from "react";
import { decodeJwt } from "../../utils/decode-jwt";
import { FilterMatchMode } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import FeatherIcon from "feather-icons-react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Button,
  Spinner,
  Modal,
} from "react-bootstrap";
import AppointmentNavbar from "../../components/Navbar/AppointmentNavbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://194.195.117.79:5100/api";

const NoteCell = ({ note }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!note) return <span>-</span>;

  const noteStyle = {
    // Original styles from your file
    whiteSpace: isExpanded ? "normal" : "nowrap",
    textAlign: "center",
    fontSize: "12px",
    // Logic to hide overflow
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "125px", // Match your column width
    cursor: "pointer",
    display: "block",
  };

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      title={!isExpanded ? "Click to expand" : "Click to collapse"}
      style={noteStyle}
    >
      {note}
    </div>
  );
};

const TYPE_LIST = ["New", "Follow", "Postoperative", "MCDPA", "Other"];
const NEW_PATIENT_TYPES = ["New"];
const EXISTING_PATIENT_TYPES = ["Follow", "Postoperative", "MCDPA", "Other"];

const formatPatientType = (type) => {
  if (!type) return "";
  const upper = type.toUpperCase();
  if (upper === "NEW") return "New";
  if (upper === "FOLLOW") return "Follow";
  if (upper === "POSTOPERATIVE" || upper === "POST OPERATIVE") return "Postoperative";
  if (upper === "MCDPA") return "MCDPA";
  if (upper === "OTHER") return "Other";
  return type;
};
const REFERENCE_OPTIONS = [
  "Family / Friends",
  "Referred By Another Doctor",
  "Referred By Another Patient",
  "Internet",
  "Social Media",
  "Entertainment Media",
  "TV Show",
  "Newspaper / Magazine",
  "Awareness Lecture",
  "HHC Board on building",
  "I was treated here in past ",
  "Healing Hands Clinic Branch",
  "Aggregators",
  "Doctor's Privilege Card",
  "Campaign",
  "Brand Ambassador",
  "Other",
];

const REFERENCE_MAP = {
  family_friends: "Family / Friends",
  dr_ref: "Referred By Another Doctor",
  old_ref: "Referred By Another Patient",
  internet: "Internet",
  socialMedia: "Social Media",
  MediaRef: "Entertainment Media",
  newspaper: "Newspaper / Magazine",
  awareness_lecture: "Awareness Lecture",
  hhc_board: "HHC Board on building",
  self_old_pt: "I was treated here in past ",
  hhc_branch: "Healing Hands Clinic Branch",
  aggregators: "Aggregators",
  dr_privilege_card: "Doctor's Privilege Card",
  campaign: "Campaign",
  brand_ambassador: "Brand Ambassador",
  other: "Other",
};

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

const ActionButton = ({ title, onClick, disabled, icon, ...props }) => {
  const defaultBg = "#f1f1f1";
  const defaultBorder = "#000000ff";
  const defaultColor = "#555";
  const isDanger = title === "Cancel";
  const isConfirm = title === "Confirm";
  const isEdit = title === "Edit";
  const isBlueAction = [
    "Edit Patient",
    "Receipts",
    "History",
    "Diagnosis",
    "Prescription",
  ].includes(title);

  const baseStyle = {
    padding: "1px 3px",
    minWidth: "33px",
    borderRadius: "4px",
    border: `1px solid ${disabled
      ? "#ddd"
      : isDanger
        ? "#dc3545"
        : isEdit
          ? "#007bff"
          : isConfirm
            ? "#28a745"
            : isBlueAction
              ? "#0babb9ff"
              : defaultBorder
      }`,
    backgroundColor: disabled ? "#f8f9fa" : defaultBg,
    color: disabled
      ? "#aaa"
      : isDanger
        ? "#dc3545"
        : isEdit
          ? "#007bff"
          : isConfirm
            ? "#28a745"
            : isBlueAction
              ? "#0e8fb6ff"
              : defaultColor,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease-in-out",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: disabled ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
    opacity: disabled ? 0.6 : 1,
    ...props.style,
  };

  const iconColor = disabled
    ? "#aaa"
    : isDanger
      ? "#dc3545"
      : isEdit
        ? "#007bff"
        : isConfirm
          ? "#28a745"
          : isBlueAction
            ? "#0d81b7ff"
            : defaultColor;

  const iconStyle = {
    margin: "2px",
    width: "18px",
    height: "18px",
    stroke: iconColor,
  };

  const handleMouseOver = (e) => {
    if (!disabled) {
      e.currentTarget.style.backgroundColor = isDanger
        ? "#c82333"
        : isEdit
          ? "#007bff"
          : isConfirm
            ? "#218838"
            : isBlueAction
              ? "#15cbd8ff"
              : "#e0e0e0";

      e.currentTarget.style.border = `1px solid ${isDanger
        ? "#c82333"
        : isEdit
          ? "#007bff"
          : isConfirm
            ? "#218838"
            : isBlueAction
              ? "#007bff"
              : "#b0b0b0"
        }`;

      e.currentTarget.style.color = "white";
      if (e.currentTarget.children[0]) {
        e.currentTarget.children[0].style.stroke = "white";
      }
    }
  };

  const handleMouseOut = (e) => {
    if (!disabled) {
      e.currentTarget.style.backgroundColor = defaultBg;
      e.currentTarget.style.color = isDanger
        ? "#dc3545"
        : isEdit
          ? "#007bff"
          : isConfirm
            ? "#28a745"
            : isBlueAction
              ? "#23adb2ff"
              : defaultColor;

      e.currentTarget.style.border = `1px solid ${isDanger
        ? "#dc3545"
        : isEdit
          ? "#007bff"
          : isConfirm
            ? "#28a745"
            : isBlueAction
              ? "#007bff"
              : defaultBorder
        }`;

      if (e.currentTarget.children[0]) {
        e.currentTarget.children[0].style.stroke = iconColor;
      }
    }
  };

  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={baseStyle}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      <FeatherIcon icon={icon} style={iconStyle} />
    </button>
  );
};

export default function OpdAppointmentList() {
  const navigate = useNavigate();
  const location = useLocation();

  const [appointmentData, setAppointmentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDbSearching, setIsDbSearching] = useState(false);
  const [refreshNeeded, setRefreshNeeded] = useState(false); // ← triggers re-fetch after receipt generation
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    patient_type: { value: null, matchMode: FilterMatchMode.EQUALS },
    computedStatus: { value: null, matchMode: FilterMatchMode.EQUALS },
  });
  const [currentLocation, setCurrentLocation] = useState("default");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showPendingPast, setShowPendingPast] = useState(true);
  const [posTerminalList, setPosTerminalList] = useState([]);

  useEffect(() => {
    if (location.state?.searchPhone) {
      setFilters((prev) => ({
        ...prev,
        global: {
          value: location.state.searchPhone,
          matchMode: FilterMatchMode.CONTAINS,
        },
      }));
      if (location.state.appointmentDate) {
        const parsedDate = moment(
          location.state.appointmentDate,
          "DD-MM-YYYY",
        ).toDate();
        if (moment(parsedDate).isValid()) {
          setFromDate(parsedDate);
          setToDate(parsedDate);
        }
      }
    }
    if (location.state?.registered_appointment_id) {
      setRegisteredAppointments((prev) => {
        const newSet = new Set(prev);
        newSet.add(location.state.registered_appointment_id);
        return newSet;
      });
    }
    // ↓ Triggered when returning from OpdReceiptList after generating a receipt
    if (location.state?.receipt_generated) {
      setRefreshNeeded(true); // ← handled by a separate useEffect that has fetchAppointmentData in scope
      // Clear the flag so it doesn't re-fire on further navigation
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [registeredAppointments, setRegisteredAppointments] = useState(
    new Set(),
  );
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentIdToDelete, setAppointmentIdToDelete] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [fdeList, setFdeList] = useState([]);
  const [consultationList, setConsultationList] = useState([]);
  const [consultationTypesList, setConsultationTypesList] = useState([]);
  const [treatmentList, setTreatmentList] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [billingItems, setBillingItems] = useState([{ label: "", amount: "" }]);
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);
  const [receiptForm, setReceiptForm] = useState({
    consultationType: "",
    registrationType: "",
    regComment: "",
    discountAmt: "",
    discountNote: "",
    paymentMode: "",
    posTerminal: "",
    madeby: "",
  });

  const calculateTotals = () => {
    const subtotal = billingItems.reduce(
      (acc, curr) => acc + (parseFloat(String(curr.amount || "").replace(/,/g, "")) || 0),
      0,
    );
    const payable = subtotal - (parseFloat(String(receiptForm.discountAmt || "").replace(/,/g, "")) || 0);
    return { subtotal, payable };
  };

  const addBillingRow = () =>
    setBillingItems([...billingItems, { label: "", amount: "" }]);

  const removeBillingRow = (index) => {
    const list = [...billingItems];
    list.splice(index, 1);
    setBillingItems(list);
  };

  const handleGenerateReceipt = async (e) => {
    if (e && e.preventDefault) e.preventDefault();


    try {
      if (!selectedAppointment) {
        throw new Error("No appointment selected");
      }

      const { subtotal, payable } = calculateTotals();

      if (subtotal > 10000) {
        Swal.fire({
          icon: "error",
          title: "Limit Exceeded",
          text: "The subtotal exceeds the permissible limit of ₹10,000.",
        });
        return;
      }

      const consultationData = billingItems
        .filter((item) => item.label)
        .map((item) => [item.label, parseFloat(String(item.amount || "").replace(/,/g, "")) || 0]);

      const payload = {
        appointment_id: selectedAppointment.appointment_id,
        doctor_id: receiptForm.doctor_id,
        appointment_date: (selectedAppointment.appointment_timestamp && moment(selectedAppointment.appointment_timestamp).isValid())
          ? moment(selectedAppointment.appointment_timestamp).format("DD-MM-YYYY")
          : moment(new Date()).format("DD-MM-YYYY"),
        consultations: consultationData,
        paymentmode:
          receiptForm.paymentMode === "card"
            ? "Card"
            : receiptForm.paymentMode === "cash"
              ? "Cash"
              : receiptForm.paymentMode === "upi"
                ? "UPI"
                : receiptForm.paymentMode,
        regtype:
          receiptForm.registrationType === "Only Registration"
            ? "Registration"
            : receiptForm.registrationType,
        expectedamt: parseFloat(payable) || 0,
        discountamt: parseFloat(String(receiptForm.discountAmt || "").replace(/,/g, "")) || 0,
        discountnote: receiptForm.discountNote || "",
        comment: receiptForm.regComment || "",
        PosMachine: receiptForm.posTerminal,
        MachineType: "OPD",
        madeby: receiptForm.madeby || null,
      };



      const response = await fetch(
        `${BASE_URL}/V1/appointment/saveReceipt?location=${currentLocation}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();
      // console.log("SaVE receipt : ",result);
      if (result.statusCode === 201 || result.statusCode === 200) {
        Swal.fire("Success", "Receipt Generated Successfully", "success");
        setShowReceiptModal(false);
        navigate("/receipt-list", {
          state: {
            printReceiptId: result.data?.receipt_id,
            receipt_generated: true,     // ← tells OpdAppointmentList to refresh on back-nav
            returnTo: "/opd-appointment-list",
          },
        });
      } else if (
        result.statusCode === 202 &&
        (result.data?.result === "success" || result.data?.stat === "success")
      ) {
        // showPaymentPendingPopup(result.data.transaction_id, payload, result.data.pos_tid);
        showPaymentPendingPopup(
          result.data.reference_id, // ← gateway reference (Plutus ref for Pinelabs), NOT transaction_id
          { ...payload, transaction_id: result.data.transaction_id }, // keep txn id for status billNumber
          result.data,
        );
      } else {
        Swal.fire(
          "Error",
          result.message || "Failed to initiate payment",
          "error",
        );
      }
    } catch (error) {
      console.error("Frontend Error:", error);
      Swal.fire("Error", "Server Communication Failed", "error");
    }
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
            receiptData: originalPayload, // ← add: carries consultations + discountamt for amount calc
            apidata: apidata,
          }),
        },
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
            },
          );

          const result = await response.json();
          // console.log("status check backend response: ", result);
          if (response.ok && (result.success || result.statusCode === 201)) {
            return result;
          } else {
            Swal.showValidationMessage(
              result.message || "Swipe not detected yet",
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
        setShowReceiptModal(false);
        navigate("/receipt-list", { state: { receipt_generated: true, returnTo: "/opd-appointment-list" } });
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
            // console.log(referenceId, originalPayload, apidata);
            const cancelResult = await cancelPayment(
              referenceId,
              originalPayload,
              apidata,
            );
            // console.log(cancelResult);
            if (cancelResult?.success || cancelResult?.status) {
              await Swal.fire("Cancelled", "POS request stopped.", "success");
              setShowReceiptModal(false);
            } else {
              Swal.fire(
                "Error",
                cancelResult?.message ||
                "Remote cancel failed. Please cancel manually on machine.",
                "error",
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

  const handleReceiptFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "doctorName") {
      const selectedDoctor = doctors.find((d) => d.name === value);
      setReceiptForm((prev) => ({
        ...prev,
        doctorName: selectedDoctor ? selectedDoctor.name : "",
        doctor_id: selectedDoctor ? selectedDoctor.doctor_id : "",
      }));
    } else if (name === "registrationType") {
      setReceiptForm((prev) => ({
        ...prev,
        registrationType: value,
        // DNC defaults the POS terminal to OFFLINE; doctor can still change it.
        ...(value === "DNC" || value === "DNW"
          ? { posTerminal: "OFFLINE" }
          : {}),
      }));
    } else if (name === "discountAmt") {
      const cleanValue = value.replace(/[^0-9]/g, "");
      const formattedValue = cleanValue ? Number(cleanValue).toLocaleString("en-IN") : "";
      setReceiptForm((prev) => ({ ...prev, discountAmt: formattedValue }));
    } else {
      setReceiptForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetReceiptForm = () => {
    setReceiptForm({
      consultationType: "",
      registrationType: "",
      regComment: "",
      discountAmt: "",
      discountNote: "",
      paymentMode: "",
      posTerminal: "",
      madeby: "",
    });
    setBillingItems([{ label: "", amount: "" }]);
    setSelectedAppointment(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }

    }
  }, []);

  const formatDateToDDMMYYYY = (date) => {
    if (date instanceof Date) {
      return moment(date).format("DD-MM-YYYY");
    }
    return "";
  };

  const generateTimeSlots = () => {
    const slots = [];
    const startTime = new Date();
    const endTime = new Date();
    endTime.setHours(23, 45, 0);
    startTime.setHours(7, 0, 0);
    while (startTime <= endTime) {
      slots.push(
        startTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      );
      startTime.setMinutes(startTime.getMinutes() + 15);
    }
    return slots;
  };

  const searchFromDatabase = async (query) => {
    if (!currentLocation || currentLocation === "default" || isDbSearching)
      return;

    setIsDbSearching(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/appointment/searchAppointments?query=${encodeURIComponent(
          query,
        )}&location=${currentLocation}`,
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const mappedNewApps = data.data.map((app) => {
            const isConfirmed = app.confirm_time != 0;
            const hasHistory = Number(app.historychk) === 3;
            const hasExecution =
              Number(app.executivechk) === 1 || Number(app.executivechk) === 2;
            const hasConsultation = Number(app.consultationchk) === 4;
            const hasReceipt = Number(app.executivechk) === 2;

            const isExistingPatient =
              isConfirmed &&
              ["Follow", "Postoperative", "Post Operative", "MCDPA", "Other"].includes(
                app.patient_type,
              );

            const isHistoryDone = hasHistory || isExistingPatient;
            const isExecutionDone =
              (hasHistory && hasExecution) || isExistingPatient;
            const isConsultationDone =
              (hasHistory && hasExecution && hasConsultation) ||
              isExistingPatient;
            const isReceiptDone = hasReceipt;

            let computedStatus = "Appointment Confirmed";
            if (isReceiptDone) computedStatus = "Receipt Generated";
            else if (isConsultationDone)
              computedStatus = "Prescription Checked";
            else if (isExecutionDone) computedStatus = "Diagnosis Checked";
            else if (isHistoryDone) computedStatus = "History Checked";
            else if (!isConfirmed) computedStatus = "Pending Appointment";

            return {
              ...app,
              patient_phone: app.patient_phone ? String(app.patient_phone) : "",
              patient_type:
                app.patient_type === "Postoperative"
                  ? "Post Operative"
                  : app.patient_type || "",
              computedStatus,
            };
          });

          setAppointmentData((prev) => {
            const existingIds = new Set(prev.map((app) => app.appointment_id));
            const newUniqueApps = mappedNewApps.filter(
              (app) => !existingIds.has(app.appointment_id),
            );
            return [...prev, ...newUniqueApps];
          });
        }
      }
    } catch (error) {
      console.error("Error searching appointments from database:", error);
    } finally {
      setIsDbSearching(false);
    }
  };

  useEffect(() => {
    const searchValue = filters.global.value;
    if (!searchValue || searchValue.length < 3) return;

    const delayDebounceFn = setTimeout(() => {
      searchFromDatabase(searchValue);
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [filters.global.value]);

  const fetchAppointmentData = useCallback(
    async (manualShowPending = null) => {
      setLoading(true);
      try {
        if (!fromDate || !toDate || currentLocation === "default") return;

        const formattedFromDate = formatDateToDDMMYYYY(fromDate);
        const formattedToDate = formatDateToDDMMYYYY(toDate);

        const isToday =
          moment(fromDate).isSame(moment(), "day") &&
          moment(toDate).isSame(moment(), "day");

        // Logic:
        // 1. If manualShowPending is provided (e.g. from Refresh button), use it.
        // 2. Otherwise, if it's the 'Today' view, we want to show pending records from the past (as previously requested).
        // 3. If it's a specific date range (not today), we want strict filtering (showPending = false).
        const showPending =
          manualShowPending !== null ? manualShowPending : (isToday && showPendingPast);

        const url = `${BASE_URL}/V1/appointment/listAppointments?from=${formattedFromDate}&to=${formattedToDate}&location=${currentLocation}&showPending=${showPending}&_t=${Date.now()}`;



        const response = await fetch(url, { method: "GET" });
        const data = await response.json();

        if (response.ok && data.data) {

          const sortedData = data.data.sort((a, b) => {
            const timeA = a.appointment_time
              ? moment(a.appointment_time, ["HH:mm:ss", "hh:mm A"]).valueOf()
              : Number.MAX_SAFE_INTEGER;
            const timeB = b.appointment_time
              ? moment(b.appointment_time, ["HH:mm:ss", "hh:mm A"]).valueOf()
              : Number.MAX_SAFE_INTEGER;
            return timeA - timeB;
          });
          const mappedData = sortedData.map((app) => {
            const isConfirmed = app.confirm_time != 0;
            const hasHistory = Number(app.historychk) === 3;
            const hasExecution =
              Number(app.executivechk) === 1 || Number(app.executivechk) === 2;
            const hasConsultation = Number(app.consultationchk) === 4;
            const hasReceipt = Number(app.executivechk) === 2;

            const isExistingPatient =
              isConfirmed &&
              ["Follow", "Postoperative", "Post Operative", "MCDPA", "Other"].includes(
                app.patient_type,
              );

            const isHistoryDone = hasHistory || isExistingPatient;
            const isExecutionDone =
              (hasHistory && hasExecution) || isExistingPatient;
            const isConsultationDone =
              (hasHistory && hasExecution && hasConsultation) ||
              isExistingPatient;
            const isReceiptDone = hasReceipt;

            let computedStatus = "Appointment Confirmed";
            if (isReceiptDone) computedStatus = "Receipt Generated";
            else if (isConsultationDone)
              computedStatus = "Prescription Checked";
            else if (isExecutionDone) computedStatus = "Diagnosis Checked";
            else if (isHistoryDone) computedStatus = "History Checked";
            else if (!isConfirmed) computedStatus = "Pending Appointment";

            return {
              ...app,
              patient_phone: app.patient_phone ? String(app.patient_phone) : "",
              patient_type:
                app.patient_type === "Postoperative"
                  ? "Post Operative"
                  : app.patient_type,
              computedStatus,
            };
          });
          setAppointmentData(mappedData);
        } else {
          console.error(
            "Error fetching appointments:",
            data.message || "Unknown error",
          );
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    },
    [fromDate, toDate, currentLocation, showPendingPast],
  );

  const fetchDropdownData = useCallback(async () => {
    try {
      const endpoints = [
        `${BASE_URL}/V1/appointment/consultationDropdown?location=${currentLocation}`,
        `${BASE_URL}/V1/doctor/doctorDropdown?location=${currentLocation}`,
        `${BASE_URL}/V1/appointment/fdeDropdown?location=${currentLocation}`,
        `${BASE_URL}/V1/appointment/consultationDetailsDropdown?location=${currentLocation}`,
        `${BASE_URL}/V1/appointment/posTerminalDropdown?location=${currentLocation}`,
        `${BASE_URL}/V1/appointment/treatmentDropdown?location=${currentLocation}`,
      ];

      const [
        consultationResponse,
        doctorResponse,
        fdeResponse,
        consultationDetailsResponse,
        posTerminalResponse,
        treatmentResponse,
      ] = await Promise.all(
        endpoints.map((url) => fetch(url).then((res) => res.json())),
      );

      setConsultationList(
        Array.isArray(consultationResponse.data)
          ? consultationResponse.data
          : [],
      );
      setDoctors(Array.isArray(doctorResponse.data) ? doctorResponse.data : []);
      setFdeList(Array.isArray(fdeResponse.data) ? fdeResponse.data : []);
      setConsultationTypesList(
        Array.isArray(consultationDetailsResponse.data)
          ? consultationDetailsResponse.data
          : [],
      );
      setPosTerminalList(
        Array.isArray(posTerminalResponse.data) ? posTerminalResponse.data : [],
      );
      setTreatmentList(
        Array.isArray(treatmentResponse.data) ? treatmentResponse.data : [],
      );
    } catch (error) {
      console.error("Error fetching dropdown data:", error.message);
    }
  }, [currentLocation]);

  useEffect(() => {
    if (currentLocation !== "default") {
      fetchAppointmentData();
      fetchDropdownData();
    }
    // We want to fetch data whenever any of these values change
  }, [
    fromDate,
    toDate,
    currentLocation,
    fetchAppointmentData,
    fetchDropdownData,
  ]);

  // Refresh appointment data when returning from receipt generation
  useEffect(() => {
    if (refreshNeeded && currentLocation !== "default") {
      fetchAppointmentData();
      setRefreshNeeded(false);
    }
  }, [refreshNeeded, currentLocation, fetchAppointmentData]);

  useEffect(() => {
    if (selectedAppointment) {
      setTimeSlots(generateTimeSlots());
    }
  }, [selectedAppointment?.appointment_timestamp]);

  const handleDateChange = (date) => {
    if (!date || !selectedAppointment) return;

    setSelectedAppointment((prev) => ({
      ...prev,
      appointment_timestamp: date.toISOString(),
    }));
  };

  const handleEditModalInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedAppointment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    if (!selectedAppointment || !selectedAppointment.patient_phone) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Patient Phone number is missing!",
      });
      return;
    }

    const dateOnly = moment(selectedAppointment.appointment_timestamp).format(
      "YYYY-MM-DD",
    );

    const finalAppointmentTime = selectedAppointment.appointment_time
      ? moment(selectedAppointment.appointment_time, [
        "HH:mm:ss",
        "hh:mm A",
      ]).format("HH:mm")
      : null;

    const updatePayload = {
      ...selectedAppointment,
      patient_type:
        selectedAppointment.patient_type === "Post Operative"
          ? "Postoperative"
          : selectedAppointment.patient_type,
      appointment_timestamp: dateOnly,
      appointment_time: finalAppointmentTime,
      patient_location: currentLocation,
    };

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/appointment/editAppointment/${selectedAppointment.appointment_id}?location=${currentLocation}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        },
      );

      const result = await response.json();

      if (response.ok) {
        Toast.fire({
          icon: "success",
          title: "Appointment updated successfully!",
        });
        fetchAppointmentData();
        setShowEditModal(false);
        window.dispatchEvent(new CustomEvent("refreshApptCounts"));
      } else {
        console.error("Failed to update appointment:", result.message);
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: result.message || "Unknown error",
        });
      }
    } catch (error) {
      console.error("Error updating appointment:", error.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!appointmentIdToDelete) return;

    if (!cancellationReason.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Reason Required",
        text: "Please provide a reason for cancellation before submitting.",
        confirmButtonColor: "#1a5b61ff",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/appointment/delete/${appointmentIdToDelete}?location=${currentLocation}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cancellationReason: cancellationReason }),
        },
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Cancelled",
          text: "Appointment successfully cancelled.",
          timer: 2000,
        });
        fetchAppointmentData();
        setShowDeleteModal(false);
        setCancellationReason("");
        window.dispatchEvent(new CustomEvent("refreshApptCounts"));
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: "error",
          title: "Cancellation Failed",
          text: errorData.message || "Unknown error",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "An error occurred while deleting the appointment.",
      });
      console.error("Network Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessUpdate = async (
    appId,
    endpoint,
    patient_type,
    patient_phone,
    successMessage = "Confirmed!",
  ) => {
    try {

      let response = "";
      if (!patient_phone && !patient_type) {
        response = await fetch(
          `${BASE_URL}/V1/appointment/${endpoint}?appId=${appId}&location=${currentLocation}`,
          { method: "PUT", headers: { "Content-Type": "application/json" } },
        );

      } else {
        const mappedPatientType =
          patient_type === "Post Operative" ? "Postoperative" : patient_type;
        response = await fetch(
          `${BASE_URL}/V1/appointment/${endpoint}?appId=${appId}&location=${currentLocation}&patientType=${mappedPatientType}&patientPhone=${patient_phone}`,
          { method: "PUT", headers: { "Content-Type": "application/json" } },
        );

      }
      const data = await response.json();

      if (response.ok) {
        Toast.fire({
          icon: "success",
          title: successMessage,
        });
        fetchAppointmentData();
        window.dispatchEvent(new CustomEvent("refreshApptCounts"));

        if (endpoint === "confirmAppointment" && patient_type === "New") {
          navigate("/opd-patient-list", {
            state: {
              openEditForPhone: patient_phone,
              returnToAppointment: true,
              appointment_id: appId,
              appointment_patient_type: patient_type,
            },
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Process Error",
          text: data.message || "Unknown error",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Connection Error",
        text: error.message,
      });
    }
  };

  const checkDailyClosing = async (appointmentTimestamp, actionVerb = "confirming") => {
    if (!appointmentTimestamp) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Appointment date missing.",
      });
      return false;
    }

    try {
      // Calculate previous day
      const aptDate = moment(appointmentTimestamp);
      const prevDate = aptDate.clone().subtract(1, "days").format("YYYY-MM-DD");

      // Check daily closing status for prevDate
      const response = await fetch(
        `${BASE_URL}/V1/managereports/dailyclosing-status?location=${currentLocation}&date=${prevDate}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const result = await response.json();

      if (response.ok && result.success && result.data) {
        return true;
      } else {
        // Daily closing is missing
        Swal.fire({
          icon: "warning",
          title: "Daily Closing Pending",
          text: `Please fill the daily closing for ${moment(prevDate).format("DD-MM-YYYY")} before ${actionVerb} appointments for this day.`,
          showConfirmButton: false,
          showCancelButton: true,
          cancelButtonText: "Go to Daily Closing",
          cancelButtonColor: "#e67e22",
        }).then((res) => {
          if (res.dismiss === Swal.DismissReason.cancel) {
            navigate("/daily-closing");
          }
        });
        return false;
      }
    } catch (error) {
      console.error("Error checking daily closing status:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to verify daily closing status.",
      });
      return false;
    }
  };

  const confirmAppointmentWithCheck = async (rowData) => {
    const {
      appointment_id,
      patient_type,
      patient_phone,
      appointment_timestamp,
    } = rowData;

    const checkPassed = await checkDailyClosing(appointment_timestamp, "confirming");
    if (!checkPassed) return;

    handleProcessUpdate(
      appointment_id,
      "confirmAppointment",
      patient_type,
      patient_phone,
      "Appointment confirmed!",
    );
  };

  const getRowClassName = (rowData) => {
    const {
      ConfirmPatient,
      historychk,
      executivechk,
      consultationchk,
      confirm_time,
      patient_type,
    } = rowData;
    const isConfirmed = confirm_time != 0;
    const hasHistory = Number(historychk) === 3;
    const hasExecution =
      Number(executivechk) === 1 || Number(executivechk) === 2;
    const hasConsultation = Number(consultationchk) === 4;
    const hasReceipt = Number(executivechk) === 2;

    const isExistingPatient =
      isConfirmed &&
      ["Follow", "Postoperative", "Post Operative", "MCDPA", "Other"].includes(
        patient_type,
      );

    const isHistoryDone = hasHistory || isExistingPatient;
    const isExecutionDone = (hasHistory && hasExecution) || isExistingPatient;
    const isConsultationDone =
      (hasHistory && hasExecution && hasConsultation) || isExistingPatient;
    const isReceiptDone = hasReceipt;

    if (isReceiptDone) return "row-status-receipt";
    if (isConsultationDone) return "row-status-consultation";
    if (isExecutionDone) return "row-status-execution";
    if (isHistoryDone) return "row-status-history";
    if (!isConfirmed) return "row-status-unconfirmed";

    return "row-status-confirmed";
  };

  const renderActionBody = (rowData) => {
    const {
      appointment_id,
      confirm_time,
      historychk,
      executivechk,
      consultationchk,
      patient_phone,
      patient_type,
      ConfirmPatient,
    } = rowData;
    // console.log("ROW DATA:", rowData);
    const isConfirmed = confirm_time != 0;
    const hasHistory = Number(historychk) === 3;
    const hasExecution =
      Number(executivechk) === 1 || Number(executivechk) === 2;
    const hasConsultation = Number(consultationchk) === 4;
    const hasReceipt = Number(executivechk) === 2;

    const isExistingPatient =
      isConfirmed &&
      ["Follow", "Postoperative", "Post Operative", "MCDPA", "Other"].includes(
        patient_type,
      );

    const isHistoryDone = hasHistory || isExistingPatient;
    const isExecutionDone = (hasHistory && hasExecution) || isExistingPatient;
    const isConsultationDone =
      (hasHistory && hasExecution && hasConsultation) || isExistingPatient;
    const isReceiptDone = hasReceipt;

    const showFourButtons =
      registeredAppointments.has(appointment_id) ||
      Number(ConfirmPatient) === 1 ||
      hasHistory ||
      hasExecution ||
      hasConsultation ||
      hasReceipt ||
      isExistingPatient;

    return (
      <div
        className="cart-action"
        style={{
          margin: "0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2px",
          gap: "2px",
        }}
      >
        {!isConfirmed && (
          <>
            <ActionButton
              title="Edit"
              onClick={() => {
                setSelectedAppointment(rowData);
                setShowEditModal(true);
              }}
              disabled={isConfirmed}
              icon="edit"
            />
            <ActionButton
              title="Cancel"
              onClick={() => {
                setAppointmentIdToDelete(appointment_id);
                setShowDeleteModal(true);
              }}
              disabled={isConfirmed}
              icon="trash-2"
            />
            <ActionButton
              title="Confirm"
              onClick={() => confirmAppointmentWithCheck(rowData)}
              disabled={isConfirmed}
              icon="check"
            />
          </>
        )}

        {isConfirmed && !showFourButtons && (
          <ActionButton
            title="Edit Patient"
            onClick={() => {
              navigate("/opd-patient-list", {
                state: {
                  openEditForPhone: patient_phone,
                  returnToAppointment: true,
                  appointment_id: appointment_id,
                  appointment_patient_type: patient_type,
                },
              });
            }}
            icon="user-check"
          />
        )}

        {isConfirmed && showFourButtons && (
          <>
            <ActionButton
              title="History"
              onClick={() => { }}
              disabled={isHistoryDone || isReceiptDone}
              icon="book-open"
              style={{ cursor: "not-allowed" }}
            />

            <ActionButton
              title="Diagnosis"
              onClick={() => { }}
              disabled={!isHistoryDone || isExecutionDone || isReceiptDone}
              icon="activity"
              style={{ cursor: "not-allowed" }}
            />

            <ActionButton
              title="Prescription"
              onClick={() => { }}
              disabled={!isExecutionDone || isConsultationDone || isReceiptDone}
              icon="clipboard"
              style={{ cursor: "not-allowed" }}
            />

            <ActionButton
              title="Receipts"
              onClick={() => {
                setSelectedAppointment(rowData);
                setShowReceiptModal(true);
              }}
              disabled={!isConsultationDone}
              icon="credit-card"
            />
          </>
        )}
      </div>
    );
  };

  const ColorLegend = ({ name, count, bgColor }) => {
    const isSelected = filters.computedStatus?.value === name;
    return (
      <div
        onClick={() => {
          setFilters((prev) => {
            const currentVal = prev.computedStatus?.value;
            const newVal = currentVal === name ? null : name;
            return {
              ...prev,
              computedStatus: {
                value: newVal,
                matchMode: FilterMatchMode.EQUALS,
              },
            };
          });
        }}
        className={`color-legend-pill ${isSelected ? "selected" : ""}`}
        style={{
          "--status-hover-color": bgColor,
          "--status-hover-bg": `${bgColor}15`,
          ...(isSelected
            ? {
              borderColor: bgColor,
              backgroundColor: `${bgColor}25`,
              transform: "translateY(-1.5px)",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
            }
            : {}),
        }}
      >
        <div
          className="status-dot"
          style={{
            backgroundColor: bgColor,
            ...(isSelected
              ? { transform: "scale(1.25)", boxShadow: `0 0 8px ${bgColor}` }
              : {}),
          }}
        ></div>
        <p style={{ fontWeight: isSelected ? "700" : "600" }}>{name}</p>
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
              onChange={(e) => {
                setRows(parseInt(e.target.value));
                setFirst(0);
              }}
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
                value={filters.global.value || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    global: {
                      value: e.target.value,
                      matchMode: FilterMatchMode.CONTAINS,
                    },
                  }))
                }
                placeholder="Global Search"
                style={{
                  borderRadius: "6px",
                  border: "1px solid #4dd0e1",
                  padding: "5px 8px",
                  width: "200px",
                  height: "30px",
                  fontSize: "12px",
                  transition: "all 0.3s ease",
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
            variant={!showPendingPast ? "primary" : "outline-primary"}
            onClick={() => {
              const today = new Date();
              setShowPendingPast((prev) => !prev);
              setFromDate(today);
              setToDate(today);
              setFilters((prev) => ({
                ...prev,
                global: { value: null, matchMode: FilterMatchMode.CONTAINS },
                patient_type: {
                  value: null,
                  matchMode: FilterMatchMode.EQUALS,
                },
                computedStatus: {
                  value: null,
                  matchMode: FilterMatchMode.EQUALS,
                },
              }));
            }}
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
            Today's Appointments
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
              onChange={(date) => {
                setFromDate(date);
                setShowPendingPast(true);
              }}
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
              onChange={(date) => {
                setToDate(date);
                setShowPendingPast(true);
              }}
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
              setShowPendingPast(true);
              setFilters((prev) => ({
                ...prev,
                global: { value: null, matchMode: FilterMatchMode.CONTAINS },
                patient_type: {
                  value: null,
                  matchMode: FilterMatchMode.EQUALS,
                },
                computedStatus: {
                  value: null,
                  matchMode: FilterMatchMode.EQUALS,
                },
              }));
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
      <div style={{ marginTop: "15px" }}>
        <Col xs={12} style={{ padding: "2px" }}>
          <div className="d-flex flex-wrap justify-content-start align-items-center">
            <ColorLegend name="Pending Appointment" bgColor="#ffffff" />
            <ColorLegend name="Appointment Confirmed" bgColor="#3b82f6" />
            <ColorLegend name="History Checked" bgColor="#ec4899" />
            <ColorLegend name="Diagnosis Checked" bgColor="#e67e22" />
            <ColorLegend name="Prescription Checked" bgColor="#8e44ad" />
            <ColorLegend name="Receipt Generated" bgColor="#10b981" />
          </div>
        </Col>
      </div>
    </div>
  );

  const getColumnStyle = (width) => ({
    width: width,
    minWidth: width,
    maxWidth: width,
    border: "1px solid #000000ff",
    textAlign: "center",
    padding: "0.5rem",
  });

  const noteColumnStyle = {
    minWidth: "200px",
    maxWidth: "400px",
    border: "1px solid #000000ff",
    textAlign: "left",
    padding: "0.5rem",
    overflowWrap: "break-word",
  };

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
      <PageBreadcrumb pagename="Appointment List" />
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header
          style={{
            backgroundColor: "#e0f7fa",
            borderBottom: "2px solid #00bcd4",
            padding: "10px 15px",
          }}
          closeButton
        >
          <Modal.Title
            style={{ color: "#00838f", fontWeight: "bold", fontSize: "16px" }}
          >
            <FeatherIcon
              className="me-2"
              icon="trash"
              size="17"
              style={{ color: "#1a5b61ff" }}
            />
            Reason of Cancellation <span className="text-danger">*</span>
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleDelete}>
          <Modal.Body>
            <textarea
              required
              style={{
                fontSize: "12px",
                borderRadius: "10px",
                border: "2px solid rgb(77, 208, 225)",
                padding: "6px",
              }}
              className="form-control"
              placeholder="Enter the cancellation reason..."
              rows="4"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
            ></textarea>
          </Modal.Body>

          <div className="d-flex justify-content-end">
            <Button
              variant="danger"
              size="sm"
              type="submit"
              disabled={loading}
              className="me-2 px-3 mb-5"
              style={{
                borderRadius: "10px",
                fontSize: "12px",
                padding: "10px",
              }}
            >
              {loading ? "Cancelling..." : "Submit & Cancel"}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
        centered
      >
        <Modal.Header
          style={{
            backgroundColor: "#e0f7fa",
            borderBottom: "2px solid #00bcd4",
            padding: "10px 15px",
          }}
          closeButton
        >
          <Modal.Title
            style={{ color: "#00838f", fontWeight: "bold", fontSize: "16px" }}
          >
            <FeatherIcon
              className="me-2"
              icon="edit"
              size="18"
              style={{ color: "#1a5b61ff" }}
            />
            Edit Appointment Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "10px" }}>
          {selectedAppointment ? (
            <Form>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-10">
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      Appointment Date
                    </Form.Label>
                    <DatePicker
                      selected={
                        selectedAppointment.appointment_timestamp
                          ? new Date(selectedAppointment.appointment_timestamp)
                          : null
                      }
                      onChange={handleDateChange}
                      minDate={new Date()}
                      dateFormat="dd-MM-yyyy"
                      className="form-control custom-datepicker"
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      Appointment Time
                    </Form.Label>
                    <Form.Select
                      name="appointment_time"
                      value={
                        selectedAppointment.appointment_time
                          ? moment(selectedAppointment.appointment_time, [
                            "HH:mm:ss",
                            "hh:mm A",
                          ]).format("hh:mm A")
                          : ""
                      }
                      onChange={handleEditModalInputChange}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                      }}
                    >
                      <option value="">Select Time</option>
                      {timeSlots.map((time, index) => (
                        <option key={index} value={time}>
                          {time}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      Doctor Name
                    </Form.Label>
                    <Form.Select
                      name="doctor_name"
                      value={selectedAppointment.doctor_name || ""}
                      onChange={(e) => {
                        const selectedDoc = doctors.find(
                          (doc) => doc.name === e.target.value,
                        );
                        setSelectedAppointment((prev) => ({
                          ...prev,
                          doctor_name: e.target.value,
                          doctor_id: selectedDoc
                            ? selectedDoc.doctor_id
                            : prev.doctor_id,
                        }));
                      }}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                      }}
                    >
                      <option value="">Select a Doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.doctor_id} value={doctor.name}>
                          {doctor.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4} className="mb-10">
                  <Form.Group className="mb-2">
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      Patient Type
                    </Form.Label>
                    <Form.Select
                      name="patient_type"
                      value={
                        selectedAppointment.patient_type === "Post Operative"
                          ? "Postoperative"
                          : selectedAppointment.patient_type || ""
                      }
                      onChange={handleEditModalInputChange}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                      }}
                    >
                      <option value="">Select Type</option>
                      {(
                        (selectedAppointment.patient_type === "New" ||
                          selectedAppointment.patient_type === "NEW")
                          ? NEW_PATIENT_TYPES
                          : EXISTING_PATIENT_TYPES
                      ).map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                {(selectedAppointment.patient_type === "Other" ||
                  selectedAppointment.treatment ||
                  selectedAppointment.treatment_name) && (
                    <Col md={4}>
                      <Form.Group className="mb-2">
                        <Form.Label
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            marginBottom: "4px",
                          }}
                        >
                          Treatment <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          required
                          name="treatment"
                          value={
                            selectedAppointment.treatment ||
                            selectedAppointment.treatment_name ||
                            ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedAppointment((prev) => ({
                              ...prev,
                              treatment: val,
                              treatment_name: val,
                            }));
                          }}
                          style={{
                            border: "2px solid rgb(77, 208, 225)",
                            fontSize: "12px",
                          }}
                        >
                          <option value="">Select Treatment</option>
                          {treatmentList?.map((t) => (
                            <option
                              key={t.treatment_name}
                              value={t.treatment_name}
                            >
                              {t.treatment_name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  )}

                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      Patient Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedAppointment.patient_name || ""}
                      onChange={(e) =>
                        setSelectedAppointment((prev) => ({
                          ...prev,
                          patient_name: e.target.value,
                        }))
                      }
                      readOnly={!!selectedAppointment.patient_id}
                      style={{
                        fontSize: "12px",
                        borderRadius: "9px",
                        border: "2px solid rgb(77, 208, 225)",
                        backgroundColor: selectedAppointment.patient_id ? "#e7ebebff" : undefined,
                        cursor: selectedAppointment.patient_id ? "not-allowed" : "default",
                      }}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      Contact Number
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="patient_phone"
                      value={selectedAppointment.patient_phone || ""}
                      onChange={handleEditModalInputChange}
                      readOnly={
                        !(
                          selectedAppointment.patient_type === "New" ||
                          selectedAppointment.patient_type === "NEW"
                        )
                      }
                      style={{
                        fontSize: "12px",
                        borderRadius: "9px",
                        border: "2px solid rgb(77, 208, 225)",
                        backgroundColor: !(
                          selectedAppointment.patient_type === "New" ||
                          selectedAppointment.patient_type === "NEW"
                        )
                          ? "#e7ebebff"
                          : undefined,
                        cursor: !(
                          selectedAppointment.patient_type === "New" ||
                          selectedAppointment.patient_type === "NEW"
                        )
                          ? "not-allowed"
                          : "default",
                      }}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-10">
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      Patient Address
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      name="patient_location"
                      value={selectedAppointment?.patient_location || ""}
                      onChange={handleEditModalInputChange}
                      style={{
                        fontSize: "12px",
                        borderRadius: "9px",
                        border: "2px solid rgb(77, 208, 225)",
                      }}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-10">
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      Note
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="note"
                      value={selectedAppointment?.note || ""}
                      onChange={handleEditModalInputChange}
                      placeholder="Enter additional note..."
                      style={{
                        fontSize: "12px",
                        borderRadius: "9px",
                        border: "2px solid rgb(77, 208, 225)",
                      }}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      FDE Name
                    </Form.Label>
                    <Form.Select
                      name="FDE_Name"
                      value={selectedAppointment.FDE_Name || ""}
                      onChange={handleEditModalInputChange}
                      style={{
                        fontSize: "12px",
                        borderRadius: "9px",
                        border: "2px solid rgb(77, 208, 225)",
                      }}
                    >
                      <option value="">Select FDE</option>
                      {fdeList.map((fde, index) => (
                        <option key={index} value={fde.FDEName}>
                          {fde.FDEName}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-10">
                    <Form.Label
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      Reference
                    </Form.Label>
                    <Form.Select
                      name="reference"
                      value={selectedAppointment.reference || ""}
                      onChange={handleEditModalInputChange}
                      style={{
                        fontSize: "12px",
                        borderRadius: "9px",
                        border: "2px solid rgb(77, 208, 225)",
                      }}
                    >
                      <option value="">Select Reference</option>
                      {REFERENCE_OPTIONS.map((opt, index) => (
                        <option key={index} value={opt}>
                          {opt}
                        </option>
                      ))}
                      {selectedAppointment.reference &&
                        !REFERENCE_OPTIONS.includes(selectedAppointment.reference) && (
                          <option value={selectedAppointment.reference}>
                            {REFERENCE_MAP[selectedAppointment.reference] || selectedAppointment.reference}
                          </option>
                        )}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    borderRadius: "10px",
                    fontSize: "12px",
                    padding: "10px 20px",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveChanges}
                  disabled={loading}
                  style={{
                    backgroundColor: "#00bcd4",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "12px",
                    padding: "10px 20px",
                  }}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Form>
          ) : (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          )}
        </Modal.Body>
      </Modal>

      <AppointmentNavbar pagename="Appointment List" />
      <div className="theme-body">
        <Container fluid>
          <Row>
            <Col md={12}>
              <Card
                style={{
                  marginLeft: "-6px",
                  marginRight: "-5px",
                  borderRadius: "15px",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "1px solid #00bcd4",
                  marginTop: "-5px",
                }}
              >
                <Card.Body style={{ marginTop: "-6px" }}>
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
                      value={appointmentData}
                      paginator
                      rows={rows}
                      sortField="appointment_timestamp"
                      sortOrder={-1}
                      first={first}
                      onPage={(e) => {
                        setFirst(e.first);
                        setRows(e.rows);
                      }}
                      filters={filters}
                      header={renderHeader}
                      globalFilterFields={[
                        "patient_name",
                        "patient_phone",
                        "doctor_name",
                        "FDE_Name",
                        "patient_address",
                        "patient_location",
                      ]}
                      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                      currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                      className="p-datatable-customers p-datatable-gridlines p-datatable-striped datatable-compact-style datatable-medium-small"
                      rowClassName={getRowClassName}
                    >
                      <Column
                        header="Sr No"
                        style={{
                          ...getColumnStyle("50px"),
                          border: "1px solid #90caf9",
                        }}
                        body={(rowData, { rowIndex }) => rowIndex + 1}
                        headerClassName="datatable-header-center"
                      />

                      <Column
                        field="appointment_timestamp"
                        header="Date"
                        style={{
                          ...getColumnStyle("85px"),
                          border: "1px solid #90caf9",
                        }}
                        body={(rowData) => (
                          <span className="selectable-text">
                            {rowData.appointment_timestamp
                              ? moment(rowData.appointment_timestamp).format(
                                "DD-MM-YYYY",
                              )
                              : "-"}
                          </span>
                        )}
                        headerClassName="datatable-header-center"
                      />

                      <Column
                        field="appointment_time"
                        header="Appointment Time"
                        style={{
                          ...getColumnStyle("83px"),
                          border: "1px solid #90caf9",
                        }}
                        body={(rowData) => (
                          <span className="selectable-text">
                            {rowData.appointment_time
                              ? moment(rowData.appointment_time, [
                                "hh:mm A",
                                "HH:mm",
                              ]).format("HH:mm")
                              : "-"}
                          </span>
                        )}
                        headerClassName="datatable-header-center"
                      />

                      <Column
                        field="confirm_time"
                        header="Confirm Time"
                        style={{
                          ...getColumnStyle("65px"),
                          border: "1px solid #90caf9",
                        }}
                        body={(rowData) => <span className="selectable-text">{rowData.confirm_time || "-"}</span>}
                        headerClassName="datatable-header-center"
                      />

                      <Column
                        field="patient_type"
                        header={
                          <select
                            value={filters?.patient_type?.value || ""}
                            onChange={(e) => {
                              setFilters((prev) => ({
                                ...prev,
                                patient_type: {
                                  value: e.target.value || null,
                                  matchMode: FilterMatchMode.EQUALS,
                                },
                              }));
                            }}
                            style={{
                              fontSize: "12px",
                              fontWeight: "bold",
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              outline: "none",
                              color: "inherit",
                              textAlign: "center",
                            }}
                          >
                            <option value="">Patient Type</option>
                            {TYPE_LIST.map((type, idx) => (
                              <option key={idx} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        }
                        style={{
                          ...getColumnStyle("110px"),
                          border: "1px solid #90caf9",
                          padding: "0",
                        }}
                        body={(rowData) => <span className="selectable-text">{formatPatientType(rowData.patient_type) || "-"}</span>}
                        headerClassName="datatable-header-center"
                      />

                      <Column
                        field="computedStatus"
                        style={{ display: "none" }}
                      />

                      <Column
                        field="patient_name"
                        header="Patient Name"
                        style={{
                          ...getColumnStyle("120px"),
                          border: "1px solid #90caf9",
                        }}
                        body={(rowData) => (
                          <span className="selectable-text">
                            {rowData.prefix ? `${rowData.prefix} ` : ""}
                            {rowData.patient_name || "-"}
                          </span>
                        )}
                        headerClassName="datatable-header-center"
                      />

                      <Column
                        field="patient_phone"
                        header="Contact No"
                        style={{
                          ...getColumnStyle("110px"),
                          border: "1px solid #90caf9",
                        }}
                        body={(rowData) => <span className="selectable-text">{rowData.patient_phone || "-"}</span>}
                        headerClassName="datatable-header-center"
                      />

                      <Column
                        field="doctor_name"
                        header="Doctor"
                        style={{
                          ...getColumnStyle("110px"),
                          border: "1px solid #90caf9",
                        }}
                        body={(rowData) => <span className="selectable-text">{rowData.doctor_name || "-"}</span>}
                        headerClassName="datatable-header-center"
                      />

                      <Column
                        field="FDE_Name"
                        header="FDE Name"
                        style={{
                          ...getColumnStyle("90px"),
                          border: "1px solid #90caf9",
                        }}
                        body={(rowData) => <span className="selectable-text">{rowData.FDE_Name || "-"}</span>}
                        headerClassName="datatable-header-center"
                      />
                      <Column
                        field="note"
                        header="Note"
                        style={{
                          ...getColumnStyle("125px"), // Keep your original width
                          border: "1px solid #90caf9", // Keep your original border
                        }}
                        body={(rowData) => <NoteCell note={rowData.note} />}
                        headerClassName="datatable-header-center"
                      />

                      <Column
                        header="Actions"
                        body={renderActionBody}
                        exportable={false}
                        style={{
                          ...getColumnStyle("165px"),
                          border: "1px solid #90caf9",
                        }}
                        headerClassName="datatable-header-center"
                      />
                    </DataTable>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <Modal
        show={showReceiptModal}
        onHide={() => {
          resetReceiptForm();
          setShowReceiptModal(false);
        }}
        size="lg"
        centered
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
            <FeatherIcon icon="credit-card" size={16} className="me-2" />
            Generate OPD Receipt
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ backgroundColor: "#f5fcfd", padding: "12px" }}>
          <Form id="opd-receipt-form" onSubmit={handleGenerateReceipt}>
            <div className="mb-4">
              <h6
                style={{
                  color: "#05acc3ff",
                  borderBottom: "1px solid #00bcd4",
                  paddingBottom: "5px",
                  marginBottom: "5px",
                  fontSize: "14px",
                }}
              >
                Basic Details
              </h6>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Label style={{ fontSize: "12px", fontWeight: "500" }}>
                    Patient Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    readOnly
                    required
                    value={selectedAppointment?.patient_name || ""}
                    style={{
                      cursor: "not-allowed",
                      fontSize: "11.5px",
                      backgroundColor: "#e7ebebff",
                      border: "2px solid rgb(77, 208, 225)",
                      borderRadius: "10px",
                    }}
                  />
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: "12px", fontWeight: "500" }}>
                      Consultant Doctor <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      required
                      name="doctorName"
                      style={{
                        fontSize: "12px",
                        border: "2px solid rgb(77, 208, 225)",
                      }}
                      value={receiptForm.doctorName || ""}
                      onChange={handleReceiptFormChange}
                    >
                      <option value="">Select Consultant Doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.doctor_id} value={doctor.name}>
                          {doctor.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: "12px", fontWeight: "500" }}>
                      Made By <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      required
                      name="madeby"
                      style={{
                        fontSize: "12px",
                        border: "2px solid rgb(77, 208, 225)",
                      }}
                      value={receiptForm.madeby || ""}
                      onChange={handleReceiptFormChange}
                    >
                      <option value="">Select Made By</option>
                      {fdeList.map((fde) => (
                        <option key={fde.FDEID} value={fde.FDEID}>
                          {fde.FDEName}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      display: "block",
                    }}
                  >
                    Registration Type
                  </Form.Label>
                  <div
                    className="d-flex flex-wrap gap-3"
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      backgroundColor: "#94e2eeff",
                      borderRadius: "10px",
                    }}
                  >
                    {["DNC", "DNW", "Only Registration"].map((opt) => (
                      <Form.Check
                        inline
                        key={opt}
                        label={opt}
                        name="registrationType"
                        type="radio"
                        id={`reg-${opt}`}
                        value={opt}
                        checked={receiptForm.registrationType === opt}
                        onChange={handleReceiptFormChange}
                        style={{ fontSize: "13px", margin: "10px" }}
                      />
                    ))}
                    <Button
                      variant="danger"
                      size="sm"
                      className="ms-auto"
                      style={{
                        fontSize: "11px",
                        borderRadius: "8px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                      }}
                      onClick={() =>
                        setReceiptForm((prev) => ({
                          ...prev,
                          registrationType: "",
                          posTerminal: "",
                        }))
                      }
                    >
                      Clear
                    </Button>
                  </div>
                </Col>
              </Row>

              {receiptForm.registrationType && (
                <Row>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: "12px", fontWeight: "500" }}>
                      Registration Comment Box
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={1}
                      name="regComment"
                      placeholder="Enter Comment..."
                      style={{
                        fontSize: "12px",
                        border: "2px solid rgb(77, 208, 225)",
                        borderRadius: "10px",
                      }}
                      onChange={handleReceiptFormChange}
                    />
                  </Form.Group>
                </Row>
              )}
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <h6
                  style={{
                    color: "#05acc3ff",
                    borderBottom: "1px solid #00bcd4",
                    paddingBottom: "5px",
                    marginTop: "5px",
                    marginBottom: "5px",
                    fontSize: "14px",
                    flex: 1,
                  }}
                >
                  Billing Particulars
                </h6>
              </div>

              {billingItems.map((item, index) => (
                <Row key={index} className="mb-1 align-items-end">
                  <Col md={6}>
                    <Form.Label style={{ fontSize: "12px", fontWeight: "500" }}>
                      Consultation Type{" "}
                    </Form.Label>
                    <Form.Select
                      style={{
                        fontSize: "12px",
                        border: "2px solid rgb(77, 208, 225)",
                      }}
                      value={item.label}
                      onChange={(e) => {
                        const newItems = [...billingItems];
                        newItems[index].label = e.target.value;
                        setBillingItems(newItems);
                      }}
                    >
                      <option value="">Select Type</option>
                      {consultationTypesList.map((item) => (
                        <option
                          key={item.consultation_id}
                          value={item.consultation_name}
                        >
                          {item.consultation_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Form.Label style={{ fontSize: "11px" }}>Amount</Form.Label>
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
                        type="text"
                        placeholder="E.g. 1000"
                        style={{
                          fontSize: "11px",
                          border: "2px solid rgb(77, 208, 225)",
                          borderLeft: "none",
                          borderRadius: "0 10px 10px 0",
                        }}
                        value={
                          receiptForm.registrationType &&
                            receiptForm.registrationType !== "Only Registration"
                            ? 0
                            : item.amount
                        }
                        disabled={
                          !!receiptForm.registrationType &&
                          receiptForm.registrationType !== "Only Registration"
                        }
                        onChange={(e) => {
                          const cleanValue = e.target.value.replace(/[^0-9]/g, "");
                          const formattedValue = cleanValue ? Number(cleanValue).toLocaleString("en-IN") : "";
                          const newItems = [...billingItems];
                          newItems[index].amount = formattedValue;
                          setBillingItems(newItems);
                        }}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={4} className="d-flex">
                    <Button
                      variant="outline-danger"
                      className="me-2 btn-sm"
                      onClick={() => removeBillingRow(index)}
                      style={{ padding: "8px 8px" }}
                      disabled={billingItems.length <= 1}
                    >
                      - Delete Row
                    </Button>
                    <Button
                      variant="outline-success"
                      className="btn-sm"
                      onClick={addBillingRow}
                      style={{ padding: "8px 8px" }}
                    >
                      + Add Row
                    </Button>
                  </Col>
                </Row>
              ))}
            </div>

            <div className="mb-2">
              <h6
                style={{
                  color: "#05acc3ff",
                  borderBottom: "1px solid #00bcd4",
                  paddingBottom: "5px",
                  marginTop: "10px",
                  marginBottom: "5px",
                  fontSize: "14px",
                }}
              >
                Payment Details
              </h6>
              <Row>
                <Col md={4}>
                  <Form.Label style={{ fontSize: "12px", fontWeight: "500" }}>
                    Discount Amount
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text
                      style={{
                        fontSize: "12px",
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
                      type="text"
                      name="discountAmt"
                      placeholder="E.g. 1000"
                      style={{
                        fontSize: "12px",
                        border: "2px solid rgb(77, 208, 225)",
                        borderLeft: "none",
                        borderRadius: "0 10px 10px 0",
                      }}
                      value={
                        receiptForm.registrationType &&
                          receiptForm.registrationType !== "Only Registration"
                          ? 0
                          : receiptForm.discountAmt
                      }
                      disabled={
                        !!receiptForm.registrationType &&
                        receiptForm.registrationType !== "Only Registration"
                      }
                      onChange={handleReceiptFormChange}
                    />
                  </InputGroup>
                </Col>
                <Col md={8}>
                  <Form.Label style={{ fontSize: "12px", fontWeight: "500" }}>
                    Discount Note
                  </Form.Label>
                  <Form.Control
                    placeholder="Enter Discount Note"
                    name="discountNote"
                    style={{
                      fontSize: "12px",
                      borderRadius: "10px",
                      border: "2px solid rgb(77, 208, 225)",
                    }}
                    onChange={handleReceiptFormChange}
                  />
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Label style={{ fontSize: "12px", fontWeight: "500" }}>
                    Mode of Payment <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    required
                    style={{
                      fontSize: "12px",
                      border: "2px solid rgb(77, 208, 225)",
                      borderRadius: "10px",
                    }}
                    name="paymentMode"
                    value={receiptForm.paymentMode || ""}
                    onChange={handleReceiptFormChange}
                  >
                    <option value="">Select Mode</option>
                    {["card", "upi", "cash"].map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.toUpperCase()}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={8}>
                  <Form.Label
                    style={{
                      fontSize: "12px",
                      fontWeight: "500",
                      display: "block",
                    }}
                  >
                    PoS Terminal <span className="text-danger">*</span>
                  </Form.Label>
                  <div
                    className="d-flex flex-wrap gap-4 p-2"
                    style={{
                      border: "2px solid rgb(77, 208, 225)",

                      backgroundColor: "#94e2eeff",
                      borderRadius: "10px",
                    }}
                  >
                    {[...new Set([...posTerminalList, "OFFLINE"])].map(
                      (opt) => (
                        <Form.Check
                          required
                          inline
                          key={opt}
                          label={opt}
                          name="posTerminal"
                          type="radio"
                          id={`pos-${opt}`}
                          value={opt}
                          checked={receiptForm.posTerminal === opt}
                          onChange={handleReceiptFormChange}
                          style={{ fontSize: "12px", margin: "5px" }}
                        />
                      ),
                    )}
                  </div>
                </Col>
              </Row>
              <Row></Row>
              <div
                className="p-3"
                style={{
                  backgroundColor: "#e0f7fa",
                  borderRadius: "8px",
                  border: "1px dashed #00bcd4",
                }}
              >
                <Row className="text-end">
                  <Col>
                    <div
                      className="mb-2"
                      style={{
                        borderBottom: "1px solid #b2ebf2",
                        paddingBottom: "5px",
                      }}
                    >
                      <h6
                        style={{
                          fontSize: "12px",
                          textAlign: "left",
                          color: "#00838f",
                          marginBottom: "5px",
                        }}
                      >
                        Charge Breakdown:
                      </h6>
                      {billingItems.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            fontSize: "12px",
                            color: "#555",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>{item.label || `Item ${idx + 1}`} :</span>
                          <span>
                            ₹{" "}
                            {receiptForm.registrationType
                              ? 0
                              : item.amount || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#555",
                        marginTop: "5px",
                      }}
                    >
                      Total Amount: <strong>₹ {Math.round(calculateTotals().subtotal).toLocaleString("en-IN")}</strong>
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#d32f2f",
                        marginTop: "5px",
                      }}
                    >
                      Discount:{" "}
                      <strong>- ₹ {receiptForm.discountAmt || 0}</strong>
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        color: "#00838f",
                        fontWeight: "bold",
                        marginTop: "5px",
                      }}
                    >
                      Payable Amount: ₹ {Math.round(calculateTotals().payable).toLocaleString("en-IN")}
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer
          style={{
            backgroundColor: "#f5fcfd",
            borderTop: "1px solid #4dd0e1",
            padding: "5px",
          }}
        >
          {calculateTotals().subtotal > 10000 && (
            <span
              className="text-danger fw-bold me-auto d-flex align-items-center"
              style={{ fontSize: "14px", marginRight: "10px" }}
            >
              <FeatherIcon
                icon="alert-triangle"
                size="16"
                style={{ marginRight: "5px" }}
              />
              Warning: The subtotal exceeds the permissible limit of ₹10,000.
            </span>
          )}
          <Button
            variant="secondary"
            onClick={() => {
              resetReceiptForm();
              setShowReceiptModal(false);
            }}
            style={{ fontSize: "12px", borderRadius: "10px", padding: "11px" }}
          >
            Cancel
          </Button>

          <Button
            variant="success"
            type="submit"
            form="opd-receipt-form"
            disabled={calculateTotals().subtotal > 10000}
            style={{
              backgroundColor:
                calculateTotals().subtotal > 10000 ? "#cccccc" : "#00bcd4",
              cursor: calculateTotals().subtotal > 10000 ? "not-allowed" : "pointer",
              border: "none",
              fontSize: "12px",
              borderRadius: "10px",
              padding: "12px",
            }}
          >
            Generate Receipt
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
