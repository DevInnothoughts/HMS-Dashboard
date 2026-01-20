import React, { useState, useEffect, useCallback } from "react";
import { decodeJwt } from "../../utils/decode-jwt";
import { FilterMatchMode } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
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
import NavBarA from "../../components/NavbarA";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

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
    display: "block"
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
const BASE_URL = "http://194.195.117.79:5100/api";
const TYPE_LIST = ["New", "Follow-UP", "POST-OPERATIVE", "OTHER"];
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
  "Other"
];

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
  const isBlueAction = ["Receipts", "History", "Executive", "Consultation"].includes(title);

  const baseStyle = {
    padding: "1px 3px",
    minWidth: "33px",
    borderRadius: "4px",
    border: `1px solid ${disabled ? "#ddd" :
      isDanger ? "#dc3545" :
        isEdit ? "#007bff" :
          isConfirm ? "#28a745" :
            isBlueAction ? "#0babb9ff" :
              defaultBorder
      }`,
    backgroundColor: disabled ? "#f8f9fa" : defaultBg,
    color: disabled ? "#aaa" :
      isDanger ? "#dc3545" :
        isEdit ? "#007bff" :
          isConfirm ? "#28a745" :
            isBlueAction ? "#0e8fb6ff" :
              defaultColor,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease-in-out",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: disabled ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
    opacity: disabled ? 0.6 : 1,
    ...props.style,
  };

  const iconColor = disabled ? "#aaa" :
    isDanger ? "#dc3545" :
      isEdit ? "#007bff" :
        isConfirm ? "#28a745" :
          isBlueAction ? "#0d81b7ff" :
            defaultColor;

  const iconStyle = {
    margin: "2px",
    width: "18px",
    height: "18px",
    stroke: iconColor,
  };

  const handleMouseOver = (e) => {
    if (!disabled) {
      e.currentTarget.style.backgroundColor =
        isDanger ? "#c82333" :
          isEdit ? "#007bff" :
            isConfirm ? "#218838" :
              isBlueAction ? "#15cbd8ff" : "#e0e0e0";

      e.currentTarget.style.border = `1px solid ${isDanger ? "#c82333" :
        isEdit ? "#007bff" :
          isConfirm ? "#218838" :
            isBlueAction ? "#007bff" : "#b0b0b0"
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
      e.currentTarget.style.color =
        isDanger ? "#dc3545" :
          isEdit ? "#007bff" :
            isConfirm ? "#28a745" :
              isBlueAction ? "#23adb2ff" : defaultColor;

      e.currentTarget.style.border = `1px solid ${isDanger ? "#dc3545" :
        isEdit ? "#007bff" :
          isConfirm ? "#28a745" :
            isBlueAction ? "#007bff" : defaultBorder
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

export default function Appointment_list() {
  const navigate = useNavigate();
  const [appointmentData, setAppointmentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    // global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    global: { value: null, matchMode: FilterMatchMode.EQUALS }
  });
  const [currentLocation, setCurrentLocation] = useState("default");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentIdToDelete, setAppointmentIdToDelete] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [fdeList, setFdeList] = useState([]);
  const [consultationList, setConsultationList] = useState([]);
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
  });

  const calculateTotals = () => {
    const subtotal = billingItems.reduce(
      (acc, curr) => acc + (parseFloat(curr.amount) || 0),
      0
    );
    const payable = subtotal - (parseFloat(receiptForm.discountAmt) || 0);
    return { subtotal, payable };
  };

  const addBillingRow = () =>
    setBillingItems([...billingItems, { label: "", amount: "" }]);

  const removeBillingRow = (index) => {
    const list = [...billingItems];
    list.splice(index, 1);
    setBillingItems(list);
  };

  const handleGenerateReceipt = async () => {
    const { subtotal, payable } = calculateTotals();

    const consultationData = billingItems
      .filter((item) => item.label)
      .map((item) => [item.label, parseFloat(item.amount) || 0]);

    const payload = {
      appointment_id: selectedAppointment.appointment_id,
      doctor_id: selectedAppointment.doctor_id,
      appointment_date: moment(new Date()).format("DD-MM-YYYY"),
      consultations: consultationData,
      paymentmode: receiptForm.paymentMode,
      regtype: receiptForm.registrationType,
      expectedamt: parseFloat(payable) || 0,
      discountamt: parseFloat(receiptForm.discountAmt) || 0,
      discountnote: receiptForm.discountNote || "",
      comment: receiptForm.regComment || "",
      PosMachine: receiptForm.posTerminal,
      MachineType: "OPD",
    };
    // console.log("check reg type:", payload);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/appointment/saveReceipt?location=${currentLocation}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      // console.log("SaVE receipt : ",result);
      if (result.statusCode === 201 || result.statusCode === 200) {
        Swal.fire("Success", "Receipt Generated Successfully", "success");
        setShowReceiptModal(false);
        navigate("/reports/receipts");
      } else if (
        result.statusCode === 202 &&
        (result.data?.result === "success" || result.data?.stat === "success")
      ) {
        // showPaymentPendingPopup(result.data.transaction_id, payload, result.data.pos_tid);
        showPaymentPendingPopup(
          result.data.transaction_id,
          payload,
          result.data
        );
      } else {
        Swal.fire(
          "Error",
          result.message || "Failed to initiate payment",
          "error"
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
          console.log(
            "Check status data sending: ",
            referenceId,
            originalPayload
          );
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
          // console.log("status check backend response: ", result);
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
        setShowReceiptModal(false);
        navigate("/receipt-list");
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
              apidata
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

  const handleReceiptFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "doctorName") {
      const selectedDoctor = doctors.find((d) => d.name === value);
      setReceiptForm((prev) => ({
        ...prev,
        doctorName: value,
        doctor_id: selectedDoctor ? selectedDoctor.doctor_id : "",
      }));
    } else {
      setReceiptForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token:", token);
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
      console.log(payload.jobLocation);
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
    const startTime = moment().startOf("day").add(7, "hours");
    const endTime = moment().startOf("day").add(23, "hours").add(45, "minutes");

    const isToday = moment(selectedAppointment?.appointment_timestamp).isSame(
      moment(),
      "day"
    );
    if (isToday) {
      let now = moment();
      let currentMinutes = now.minute();
      let nextInterval = Math.ceil(currentMinutes / 15) * 15;
      startTime
        .set({ hour: now.hour(), minute: 0, second: 0 })
        .add(nextInterval, "minutes");
    }

    let currentTime = startTime.clone();

    while (currentTime.isSameOrBefore(endTime)) {
      slots.push(currentTime.format("hh:mm A"));
      currentTime.add(15, "minutes");
    }
    return slots;
  };

  const fetchAppointmentData = useCallback(async () => {
    setLoading(true);
    try {
      if (!fromDate || !toDate || currentLocation === "default") return;

      const formattedFromDate = formatDateToDDMMYYYY(fromDate);
      const formattedToDate = formatDateToDDMMYYYY(toDate);
      // console.log(formattedFromDate, formattedToDate);
      const url = `${BASE_URL}/V1/appointment/listAppointments?from=${formattedFromDate}&to=${formattedToDate}&location=${currentLocation}`;

      const response = await fetch(url, { method: "GET" });
      const data = await response.json();

      if (response.ok && data.data) {
        console.log(data.data);
        setAppointmentData(data.data);
      } else {
        console.error(
          "Error fetching appointments:",
          data.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, currentLocation]);

  const fetchDropdownData = useCallback(async () => {
    try {
      const endpoints = [
        `${BASE_URL}/V1/appointment/consultationDropdown?location=${currentLocation}`,
        `${BASE_URL}/V1/appointment/doctorDropdown?location=${currentLocation}`,
        `${BASE_URL}/V1/appointment/fdeDropdown?location=${currentLocation}`,
      ];

      const [consultationResponse, doctorResponse, fdeResponse] =
        await Promise.all(
          endpoints.map((url) => fetch(url).then((res) => res.json()))
        );

      console.log("Current Location:", currentLocation);
      console.log("FDE API Full Response:", fdeResponse);

      setConsultationList(
        Array.isArray(consultationResponse.data)
          ? consultationResponse.data
          : []
      );
      setDoctors(Array.isArray(doctorResponse.data) ? doctorResponse.data : []);
      setFdeList(Array.isArray(fdeResponse.data) ? fdeResponse.data : []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error.message);
    }
  }, [currentLocation]);

  useEffect(() => {
    if (currentLocation !== "default") {
      fetchAppointmentData();
      fetchDropdownData();
    }
  }, [fetchAppointmentData, fetchDropdownData, currentLocation]);

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
      "YYYY-MM-DD"
    );
    console.log(dateOnly);
    const updatePayload = {
      ...selectedAppointment,
      appointment_timestamp: dateOnly,
      patient_location: currentLocation,
    };
    console.log(updatePayload);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/appointment/editAppointment/${selectedAppointment.patient_phone}?location=${currentLocation}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        }
      );

      const result = await response.json();

      if (response.ok) {
        Toast.fire({
          icon: "success",
          title: "Appointment updated successfully!",
        });
        fetchAppointmentData();
        setShowEditModal(false);
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
    }
  };

  const handleDelete = async () => {
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

    try {
      const response = await fetch(
        `${BASE_URL}/V1/appointment/delete/${appointmentIdToDelete}?location=${currentLocation}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: cancellationReason })
        }
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
    }
  };

  const handleProcessUpdate = async (
    appId,
    endpoint,
    patient_type,
    patient_phone,
    successMessage = "Confirmed!"
  ) => {
    try {
      console.log(appId, endpoint, successMessage);
      let response = "";
      if (!patient_phone && !patient_type) {
        response = await fetch(
          `${BASE_URL}/V1/appointment/${endpoint}?appId=${appId}&location=${currentLocation}`,
          { method: "PUT", headers: { "Content-Type": "application/json" } }
        );
        console.log(response);
      } else {
        response = await fetch(
          `${BASE_URL}/V1/appointment/${endpoint}?appId=${appId}&location=${currentLocation}&patientType=${patient_type}&patientPhone=${patient_phone}`,
          { method: "PUT", headers: { "Content-Type": "application/json" } }
        );
        console.log(response);
      }
      const data = await response.json();

      if (response.ok) {
        Toast.fire({
          icon: "success",
          title: successMessage,
        });
        fetchAppointmentData();
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

  const getRowClassName = (rowData) => {
    const {
      ConfirmPatient,
      historychk,
      executivechk,
      consultationchk,
      confirm_time,
    } = rowData;
    const isConfirmed = confirm_time != 0;
    const hasHistory = historychk === 3;
    const hasExecution = executivechk === 1;
    const hasConsultation = consultationchk === 2;
    const hasReceipt = executivechk === 4;

    if (!isConfirmed) return "row-status-unconfirmed";
    if (hasReceipt) return "row-status-receipt";
    if (hasConsultation) return "row-status-consultation";
    if (hasExecution) return "row-status-execution";
    if (hasHistory) return "row-status-history";

    return "";
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
    } = rowData;
    const isConfirmed = confirm_time != 0;
    const isHistoryDone = historychk === 3;
    const isExecutionDone = executivechk === 1 || executivechk === 4;
    const isConsultationDone = consultationchk === 2;
    const isReceiptDone = executivechk === 4;

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
              onClick={() =>
                setAppointmentIdToDelete(appointment_id) ||
                setShowDeleteModal(true)
              }
              disabled={isConfirmed}
              icon="trash-2"
            />
            <ActionButton
              title="Confirm"
              onClick={() =>
                handleProcessUpdate(
                  appointment_id,
                  "confirmAppointment",
                  patient_type,
                  patient_phone,
                  "Appointment confirmed!"
                )
              }
              disabled={isConfirmed}
              icon="check"
            />
          </>
        )}

        {isConfirmed && (
          <>
            <ActionButton
              title="History"
              onClick={() =>
                handleProcessUpdate(
                  appointment_id,
                  "updateHistoryChk",
                  null,
                  null,
                  "History process completed!"
                )
              }
              disabled={isHistoryDone}
              icon="book-open"
            />

            <ActionButton
              title="Executive"
              onClick={() =>
                handleProcessUpdate(
                  appointment_id,
                  "updateExecutionChk",
                  null,
                  null,
                  "Execution process completed!"
                )
              }
              disabled={!isHistoryDone || isExecutionDone}
              icon="list"
            />

            <ActionButton
              title="Consultation"
              onClick={() =>
                handleProcessUpdate(
                  appointment_id,
                  "updateConsultationChk",
                  null,
                  null,
                  "Consultation process completed!"
                )
              }
              disabled={!isExecutionDone || isConsultationDone}
              icon="user"
            />

            <ActionButton
              title="Receipts"
              onClick={() => {
                setSelectedAppointment(rowData);
                setShowReceiptModal(true);
              }}
              disabled={!isConsultationDone || isReceiptDone}
              icon="credit-card"
            />
          </>
        )}
      </div>
    );
  };

  const ColorLegend = ({ name, count, bgColor }) => (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        marginRight: "20px",
      }}
    >
      <div
        style={{
          width: "11px",
          height: "11px",
          borderRadius: "3px",
          backgroundColor: bgColor,
          border: "1px solid #ccc",
          marginRight: "5px",
        }}
      ></div>
      <p
        style={{
          display: "inline",
          margin: 0,
          fontSize: "12px",
          color: "#000",
        }}
      >
        {name}
      </p>
    </div>
  );

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
            <InputGroup>
              <Form.Control
                type="search"
                value={filters.global.value || ""}
                onChange={(e) =>
                  setFilters({
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
                  transition: "all 0.3s ease",
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
              onChange={setToDate}
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
            onClick={fetchAppointmentData}
            style={{
              backgroundColor: "#00bcd4",
              border: "none",
              borderRadius: "8px",
              padding: "6px 7px",
              fontSize: "12px",
              fontWeight: "500",
              color: "white",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginTop: "15px",
              ":hover": {
                backgroundColor: "#00acc1",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
              },
            }}
          >
            <FeatherIcon icon="refresh-ccw" size={12} className="me-1" />
            Refresh
          </Button>
        </div>
      </div>
      <div style={{ marginTop: "15px" }}>
        <Col xs={12} style={{ padding: "2px" }}>
          <div className="d-flex flex-wrap justify-content-start align-items-center">
            <ColorLegend name="Appointment Confirm" bgColor="#ffffff" />
            <ColorLegend name="History Checked" bgColor="#FFA500" />
            <ColorLegend name="Executive Checked" bgColor="#FFFF00" />
            <ColorLegend name="Consultation Checked" bgColor="#800080" />
            <ColorLegend name="Receipt Generated" bgColor="#008000" />
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
        <Modal.Header style={{
          backgroundColor: "#e0f7fa",
          borderBottom: "2px solid #00bcd4",
          padding: "10px 15px",
        }} closeButton>
          <Modal.Title style={{ color: "#00838f", fontWeight: "bold", fontSize: "16px" }}>
            <FeatherIcon
              className="me-2"
              icon="trash"
              size="17"
              style={{ color: "#1a5b61ff" }}
            />Reason of Cancellation <span className="text-danger">*</span></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea
            style={{
              fontSize: "12px", borderRadius: "10px",
              border: "2px solid rgb(77, 208, 225)",
              padding: "6px"
            }}
            className="form-control"
            placeholder="Enter the cancellation reason..."
            rows="4"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
          ></textarea>
        </Modal.Body>

        <div className="d-flex justify-content-end">
          <Button variant="danger"
            size="sm"
            className="me-2 px-3 mb-5"
            style={{ borderRadius: "10px", fontSize: "12px", padding: "10px" }} onClick={handleDelete}>
            Submit & Cancel
          </Button>
        </div>
      </Modal>

      {/* <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
        centered
      >
        <Modal.Header style={{
            backgroundColor: "#e0f7fa",
            borderBottom: "2px solid #00bcd4",
            padding: "10px 15px",
          }} closeButton>
          <Modal.Title style={{ color: "#00838f", fontWeight: "bold", fontSize: "16px" }}>
            <FeatherIcon
              className="me-2"
              icon="edit"
              size="18"
              style={{ color: "#1a5b61ff" }}
            />Edit Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointment ? (
            <Form>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-15">
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                      Appointment Date
                    </Form.Label>
                    <DatePicker
                      selected={
                        selectedAppointment.appointment_timestamp
                          ? new Date(selectedAppointment.appointment_timestamp)
                          : null
                      }
                      onChange={handleDateChange}
                      dateFormat="dd-MM-yyyy"
                      className="form-control custom-datepicker"
                      placeholderText="Select Date"
                      style={{ border: "2px solid rgb(77, 208, 225)", fontSize: "12px", borderRadius: "10px", }}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                      Appointment Time
                    </Form.Label>
                    <Form.Select
                      name="appointmentTime"
                      value={selectedAppointment.appointmentTime || ""}
                      onChange={handleEditModalInputChange}
                    style={{ border: "2px solid rgb(77, 208, 225)", fontSize: "12px" }}
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

                <Col md={4} className="mb-2">
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Patient Type</Form.Label>
                    <Form.Select
                      name="patient_type"
                      value={selectedAppointment.patient_type || ""}
                      onChange={handleEditModalInputChange}
                     style={{ border: "2px solid rgb(77, 208, 225)", fontSize: "12px" }}
                    >
                      <option value="">Select Type</option>
                      {TYPE_LIST.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-15">
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                      Doctor Name
                    </Form.Label>
                    <Form.Select
                      name="doctorName"
                      value={selectedAppointment.doctorName || ""}
                      onChange={(e) => {
                        const selectedDoc = doctors.find(doc => doc.name === e.target.value);
                        setSelectedAppointment(prev => ({
                          ...prev,
                          doctorName: e.target.value,
                          doctor_id: selectedDoc ? selectedDoc.doctor_id : prev.doctor_id
                        }));
                      }}
                      style={{ border: "2px solid rgb(77, 208, 225)", fontSize: "12px" }}
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

                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                      Patient Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="patientName"
                      value={selectedAppointment.patient_name || ""}
                      readOnly
                      style={{
                        fontSize: "12px",
                        borderRadius: "9px",
                        border: "2px solid rgb(77, 208, 225)",
                        backgroundColor: "#e7ebebff",
                        cursor: "not-allowed"
                      }}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                      Contact Number
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="patient_phone"
                      value={selectedAppointment.patient_phone || ""}
                      readOnly
                      style={{
                        fontSize: "12px",
                        borderRadius: "9px",
                        border: "2px solid rgb(77, 208, 225)",
                        backgroundColor: "#e7ebebff",
                        cursor: "not-allowed"
                      }}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-15">
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Patient Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="patient_address"
                      value={selectedAppointment?.patient_address || ""}
                      onChange={handleEditModalInputChange}
                      placeholder="Enter patient address"
                      style={{
                        fontSize: "12px",
                        borderRadius: "9px",
                        border: "2px solid rgb(77, 208, 225)",
                      }}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>FDE Name</Form.Label>
                    <Form.Select
                      name="FDE_Name"
                      value={selectedAppointment?.FDE_Name || ""}
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

                <Col md={6}>
                  <Form.Group className="mb-10">
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Reference</Form.Label>
                    <Form.Select
                      name="reference"
                      value={selectedAppointment?.reference || ""}
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
                    padding: "10px 20px",
                    fontSize: "12px",
                    padding: "10px"
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveChanges}
                  style={{
                    backgroundColor: "#00bcd4",
                    border: "none",
                    borderRadius: "10px",
                    padding: "10px 20px",
                    fontSize: "12px",
                    padding: "10px"
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </Form>
          ) : (
            <p>Loading appointment details...</p>
          )}
        </Modal.Body>
      </Modal> */}

      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
        centered
      >
        <Modal.Header style={{ backgroundColor: "#e0f7fa", borderBottom: "2px solid #00bcd4", padding: "10px 15px" }} closeButton>
          <Modal.Title style={{ color: "#00838f", fontWeight: "bold", fontSize: "16px" }}>
            <FeatherIcon className="me-2" icon="edit" size="18" style={{ color: "#1a5b61ff" }} />
            Edit Appointment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{padding:"10px"}}>
          {selectedAppointment ? (
            <Form>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-15">
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Appointment Date</Form.Label>
                    <DatePicker
                      selected={selectedAppointment.appointment_timestamp ? new Date(selectedAppointment.appointment_timestamp) : null}
                      onChange={handleDateChange}
                      dateFormat="dd-MM-yyyy"
                      className="form-control custom-datepicker"
                      style={{ border: "2px solid rgb(77, 208, 225)", fontSize: "12px", borderRadius: "10px" }}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                      Appointment Time
                    </Form.Label>
                    <Form.Select
                      name="appointment_time"
                      value={selectedAppointment.appointment_time || ""}
                      onChange={handleEditModalInputChange}
                      style={{ border: "2px solid rgb(77, 208, 225)", fontSize: "12px" }}
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
                  <Form.Group className="mb-15">
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Doctor Name</Form.Label>
                    <Form.Select
                      name="doctor_name"
                      value={selectedAppointment.doctor_name || ""}
                      onChange={(e) => {
                        const selectedDoc = doctors.find(doc => doc.name === e.target.value);
                        setSelectedAppointment(prev => ({
                          ...prev,
                          doctor_name: e.target.value,
                          doctor_id: selectedDoc ? selectedDoc.doctor_id : prev.doctor_id
                        }));
                      }}
                      style={{ border: "2px solid rgb(77, 208, 225)", fontSize: "12px" }}
                    >
                      <option value="">Select a Doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.doctor_id} value={doctor.name}>{doctor.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4} className="mb-2">
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Patient Type</Form.Label>
                    <Form.Select
                      name="patient_type"
                      value={selectedAppointment.patient_type || ""}
                      onChange={handleEditModalInputChange}
                      style={{ border: "2px solid rgb(77, 208, 225)", fontSize: "12px" }}
                    >
                      <option value="">Select Type</option>
                      {TYPE_LIST.map((type, index) => (
                        <option key={index} value={type}>{type}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Patient Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedAppointment.patient_name || ""}
                      readOnly
                      style={{ fontSize: "12px", borderRadius: "9px", border: "2px solid rgb(77, 208, 225)", backgroundColor: "#e7ebebff", cursor: "not-allowed" }}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Contact Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedAppointment.patient_phone || ""}
                      readOnly
                      style={{ fontSize: "12px", borderRadius: "9px", border: "2px solid rgb(77, 208, 225)", backgroundColor: "#e7ebebff", cursor: "not-allowed" }}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-15">
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Patient Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="patient_location"
                      value={selectedAppointment?.patient_location || ""}
                      onChange={handleEditModalInputChange}
                      style={{ fontSize: "12px", borderRadius: "9px", border: "2px solid rgb(77, 208, 225)" }}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>FDE Name</Form.Label>
                    <Form.Select
                      name="FDE_Name"
                      value={selectedAppointment.FDE_Name || ""}
                      onChange={handleEditModalInputChange}
                      style={{ fontSize: "12px", borderRadius: "9px", border: "2px solid rgb(77, 208, 225)" }}
                    >
                      <option value="">Select FDE</option>
                      {fdeList.map((fde, index) => (
                        <option key={index} value={fde.FDEName}>{fde.FDEName}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-10">
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Reference</Form.Label>
                    <Form.Select
                      name="reference"
                      value={selectedAppointment.reference || ""}
                      onChange={handleEditModalInputChange}
                      style={{ fontSize: "12px", borderRadius: "9px", border: "2px solid rgb(77, 208, 225)" }}
                    >
                      <option value="">Select Reference</option>
                      {REFERENCE_OPTIONS.map((opt, index) => (
                        <option key={index} value={opt}>{opt}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <Button variant="secondary" onClick={() => setShowEditModal(false)} style={{ borderRadius: "10px", fontSize: "12px", padding: "10px 20px" }}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveChanges} style={{ backgroundColor: "#00bcd4", border: "none", borderRadius: "10px", fontSize: "12px", padding: "10px 20px" }}>
                  Save Changes
                </Button>
              </div>
            </Form>
          ) : (
            <div className="text-center py-4"><Spinner animation="border" /></div>
          )}
        </Modal.Body>
      </Modal>

      <NavBarA pagename="Appointment List" />
      <div className="theme-body">
        <Container fluid>
          <Row>
            <Col md={12}>
              <Card
                style={{
                  marginLeft: "-10px",
                  marginRight: "-10px",
                  borderRadius: "15px",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "1px solid #00bcd4",
                }}
              >
                <Card.Body>
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
                        body={(rowData) =>
                          rowData.appointment_timestamp
                            ? moment(rowData.appointment_timestamp).format(
                              "DD-MM-YYYY"
                            )
                            : "-"
                        }
                        headerClassName="datatable-header-center"
                      />

                      <Column
                        field="appointment_time"
                        header="Appointment Time"
                        style={{
                          ...getColumnStyle("83px"),
                          border: "1px solid #90caf9",
                        }}
                        body={(rowData) =>
                          rowData.appointment_time
                            ? moment(rowData.appointment_time, ["hh:mm A", "HH:mm"]).format("HH:mm")
                            : "-"
                        }
                        headerClassName="datatable-header-center"
                      />

                      <Column
                        field="confirm_time"
                        header="Confirm Time"
                        style={{
                          ...getColumnStyle("65px"),
                          border: "1px solid #90caf9",
                        }}
                        body={(rowData) => rowData.confirm_time || "-"}
                        headerClassName="datatable-header-center"
                      />

                      <Column
                        field="patient_type"
                        header="Patient Type"
                        style={{
                          ...getColumnStyle("75px"),
                          border: "1px solid #90caf9",
                        }}
                        body={(rowData) => rowData.patient_type || "-"}
                        headerClassName="datatable-header-center"
                      />

                      <Column
                        field="patient_name"
                        header="Patient Name"
                        style={{
                          ...getColumnStyle("120px"),
                          border: "1px solid #90caf9",
                        }}
                        body={(rowData) => rowData.patient_name || "-"}
                        headerClassName="datatable-header-center"
                      />

                      <Column
                        field="patient_phone"
                        header="Contact No"
                        style={{
                          ...getColumnStyle("110px"),
                          border: "1px solid #90caf9",
                        }}
                        body={(rowData) => rowData.patient_phone || "-"}
                        headerClassName="datatable-header-center"
                      />

                      <Column
                        field="doctor_name"
                        header="Doctor"
                        style={{
                          ...getColumnStyle("110px"),
                          border: "1px solid #90caf9",
                        }}
                        body={(rowData) => rowData.doctor_name || "-"}
                        headerClassName="datatable-header-center"
                      />

                      <Column
                        field="FDE_Name"
                        header="FDE Name"
                        style={{
                          ...getColumnStyle("90px"),
                          border: "1px solid #90caf9",
                        }}
                        body={(rowData) => rowData.FDE_Name || "-"}
                        headerClassName="datatable-header-center"
                      />

                      {/* <Column
                        field="note"
                        header="Note"
                        style={{
                          ...getColumnStyle("125px"),
                          border: "1px solid #90caf9",
                        }}
                        body={(rowData) => (
                          <div
                            style={{
                              whiteSpace: "normal",
                              textAlign: "center",
                            }}
                          >
                            {rowData.note || "-"}
                          </div>
                        )}
                        headerClassName="datatable-header-center"
                      /> */}

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
        onHide={() => setShowReceiptModal(false)}
        size="lg"
        centered
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "#e0f7fa",
            borderBottom: "2px solid #4dd0e1",
            padding: "10px"
          }}
        >
          <Modal.Title
            style={{ fontSize: "16px", fontWeight: "600", color: "#00838f" }}
          >
            <FeatherIcon icon="credit-card" size={16} className="me-2" />
            Generate Receipt
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ backgroundColor: "#f5fcfd", padding: "12px" }}>
          <Form>
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
                <Col md={6}>
                  <Form.Label style={{ fontSize: "12px", fontWeight: "500" }}>
                    Patient Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    readOnly
                    value={selectedAppointment?.patient_name || ""}
                    style={{
                      cursor: "not-allowed",
                      fontSize: "11.5px",
                      backgroundColor: "#e7ebebff",
                      border: "2px solid rgb(77, 208, 225)",
                      borderRadius: "10px"

                    }}
                  />
                </Col>

                <Col>
                  <Form.Group>
                    <Form.Label style={{ fontSize: "12px", fontWeight: "500" }}>
                      Doctor Name <span className="text-danger">*</span>
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
                      <option value="">Select Doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.doctor_id} value={doctor.name}>
                          {doctor.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row >
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
                      borderRadius: "6px",
                      backgroundColor: "#94e2eeff",
                      borderRadius: "10px"
                    }}
                  >
                    {["DNC", "DNW", "DNP", "Only Registration"].map((opt) => (
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
                        borderRadius: "10px"
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
                <Row key={index} className="mb-10 align-items-end">
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
                      {[
                        "CONSULTATION",
                        "Follow-UP",
                        "PROCTOSCOPY",
                        "MCDPA",
                        "COLON HYDROTHERAPY",
                        "COLONOSCOPY",
                        "USG",
                        "USG ABDOMEN AND PELVIS",
                        "MANOMETRY",
                        "BIOFEEDBACK",
                        "ECHODEFECOGRAPHY",
                        "USG SCROTUM",
                        "UNILATERAL DOPPLER",
                        "BILATERAL DOPPLER",
                        "PROCEDURE",
                        "GASTROSCOPY",
                        "3D ENDO ANAL IMAGING",
                        "OTHERS",
                        "MRI FISTULOGRAM",
                        "2D SCAN",
                        "LAB",
                        "Postoperative",
                        "BLOOD TESTS + ECG",
                        "DIET",
                        "UROFLOWMETRY",
                        "DIET PLAN - 1 MONTH",
                        "DIET PLAN - 3 MONTH",
                        "DIET PLAN - 6 MONTH",
                        "ENEMA",
                        "MEDICINES",
                        "DRESSING",
                        "CYSTOSCOPY",
                        "POST OPERATIVE Follow UP",
                        "POST OPERATIVE DRESSING + CONSULTATION",
                      ].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Form.Label style={{ fontSize: "11px" }}>
                      Amount (₹)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="E.g. 1000"
                      style={{
                        fontSize: "11px",
                        border: "2px solid rgb(77, 208, 225)",
                        borderRadius: "10px"
                      }}
                      value={receiptForm.registrationType ? 0 : item.amount}
                      disabled={!!receiptForm.registrationType}
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => {
                        const newItems = [...billingItems];
                        newItems[index].amount = e.target.value;
                        setBillingItems(newItems);
                      }}
                    />
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
                    Discount Amount (₹)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="discountAmt"
                    placeholder="E.g. 1000"
                    style={{
                      fontSize: "12px",
                      border: "2px solid rgb(77, 208, 225)",
                      borderRadius: "10px"
                    }}
                    value={
                      receiptForm.registrationType ? 0 : receiptForm.discountAmt
                    }
                    disabled={!!receiptForm.registrationType}
                    onWheel={(e) => e.target.blur()}
                    onChange={handleReceiptFormChange}
                  />
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
                    Mode of Payment
                  </Form.Label>
                  <Form.Select
                    style={{
                      fontSize: "12px",
                      border: "2px solid rgb(77, 208, 225)",
                      borderRadius: "10px"
                    }}
                    name="paymentMode"
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
                    PoS Terminal
                  </Form.Label>
                  <div
                    className="d-flex flex-wrap gap-2 p-2"
                    style={{
                      border: "2px solid rgb(77, 208, 225)",
                      borderRadius: "6px",
                      backgroundColor: "#94e2eeff",
                      borderRadius: "10px"
                    }}
                  >
                    {[
                      "KOTAK",
                      "HDFC",
                      "BharatPe1",
                      "BharatPe2",
                      "PINE LABS",
                      "OFFLINE",
                    ].map((opt) => (
                      <Form.Check
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
                    ))}
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
                      Subtotal: <strong>₹ {calculateTotals().subtotal}</strong>
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
                      Payable Amount: ₹ {calculateTotals().payable}
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer
          style={{ backgroundColor: "#f5fcfd", borderTop: "1px solid #4dd0e1", padding: "5px" }}
        >
          <Button
            variant="secondary"
            onClick={() => setShowReceiptModal(false)}
            style={{ fontSize: "12px", borderRadius: "10px", padding: "9px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerateReceipt}
            style={{
              backgroundColor: "#00bcd4",
              border: "none",
              fontSize: "12px",
              borderRadius: "10px",
              padding: "10px"
            }}
          >
            Generate & Save Receipt
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
