import React, { useState, useEffect } from "react";
import moment from "moment";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Modal,
  Spinner,
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import { decodeJwt } from "../../utils/decode-jwt";
import Swal from "sweetalert2";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

export default function CallingCalendar() {
  const [currentLocation, setCurrentLocation] = useState("default");
  const [selectedView, setSelectedView] = useState("dashboard"); // "dashboard" or "advised"
  const [selectedType, setSelectedType] = useState(""); // "Surgery", "Medication", "Test", "Dischargecard"
  const [selectedDays, setSelectedDays] = useState(3); // 3, 7, 15, 30, 0
  const [fromDate, setFromDate] = useState(moment().format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(moment().format("YYYY-MM-DD"));
  const [records, setRecords] = useState([]);
  const [noNotesRecords, setNoNotesRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveTime, setLiveTime] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [selectedRecordType, setSelectedRecordType] = useState("");
  const [noteComment, setNoteComment] = useState("");
  const [callbackDate, setCallbackDate] = useState(
    moment().format("YYYY-MM-DD"),
  );
  const [hoveredCard, setHoveredCard] = useState(null);

  // Today & Tomorrow Pending Appointments State
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [tomorrowAppointments, setTomorrowAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [fdeList, setFdeList] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  // Edit & Delete Modals State
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentIdToDelete, setAppointmentIdToDelete] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch Location from JWT
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  const fetchPendingAppointments = async () => {
    if (!currentLocation || currentLocation === "default") return;

    const fetchForDate = async (dateStr) => {
      try {
        const url = `${BASE_URL}/V1/appointment/listAppointments?from=${dateStr}&to=${dateStr}&location=${currentLocation}&showPending=false&_t=${Date.now()}`;
        const response = await fetch(url, { method: "GET" });
        if (response.ok) {
          const res = await response.json();
          if (res.data) {
            const filtered = res.data.filter(app => app.confirm_time == 0 && app.is_deleted === 0);
            return filtered.sort((a, b) => {
              const timeA = a.appointment_time
                ? moment(a.appointment_time, ["HH:mm:ss", "hh:mm A"]).valueOf()
                : Number.MAX_SAFE_INTEGER;
              const timeB = b.appointment_time
                ? moment(b.appointment_time, ["HH:mm:ss", "hh:mm A"]).valueOf()
                : Number.MAX_SAFE_INTEGER;
              return timeA - timeB;
            });
          }
        }
      } catch (err) {
        console.error("Error fetching appointments for " + dateStr, err);
      }
      return [];
    };

    const todayStr = moment().format("DD-MM-YYYY");
    const tomorrowStr = moment().add(1, "days").format("DD-MM-YYYY");

    const [todayList, tomorrowList] = await Promise.all([
      fetchForDate(todayStr),
      fetchForDate(tomorrowStr)
    ]);

    setTodayAppointments(todayList);
    setTomorrowAppointments(tomorrowList);
  };

  // Fetch dropdown lists (doctors, FDE list)
  const fetchDropdownData = async () => {
    if (!currentLocation || currentLocation === "default") return;
    try {
      const [doctorRes, fdeRes] = await Promise.all([
        fetch(`${BASE_URL}/V1/doctor/doctorDropdown?location=${currentLocation}`).then(res => res.json()),
        fetch(`${BASE_URL}/V1/appointment/fdeDropdown?location=${currentLocation}`).then(res => res.json()),
      ]);
      setDoctors(Array.isArray(doctorRes.data) ? doctorRes.data : []);
      setFdeList(Array.isArray(fdeRes.data) ? fdeRes.data : []);
    } catch (err) {
      console.error("Error fetching dropdown data", err);
    }
  };

  useEffect(() => {
    if (currentLocation !== "default") {
      fetchPendingAppointments();
      fetchDropdownData();
    }
  }, [currentLocation]);

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

    const dateOnly = moment(selectedAppointment.appointment_timestamp).format("YYYY-MM-DD");

    const finalAppointmentTime = selectedAppointment.appointment_time
      ? moment(selectedAppointment.appointment_time, ["HH:mm:ss", "hh:mm A"]).format("HH:mm")
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

    setModalLoading(true);
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
        fetchPendingAppointments();
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
      setModalLoading(false);
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

    setModalLoading(true);
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
        fetchPendingAppointments();
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
      setModalLoading(false);
    }
  };

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(
        now.toLocaleString("en-IN", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Advised Data from API
  const fetchAdvisedData = async (type, days, baseDateStr = toDate) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/V1/calling-calendar/filter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hms-location": currentLocation,
        },
        body: JSON.stringify({
          selected_date: baseDateStr,
          type: type,
          days: Number(days),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch records");
      }

      const resData = await response.json();
      if (resData.statusCode === 200 && resData.data) {
        setRecords(resData.data.records || []);
        setNoNotesRecords(resData.data.noNotesRecords || []);
      } else {
        setRecords([]);
        setNoNotesRecords([]);
      }
    } catch (error) {
      console.error("Error fetching advised data:", error);
      Toast.fire({
        icon: "error",
        title: "Error fetching records",
      });
      setRecords([]);
      setNoNotesRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdvised = (type) => {
    setSelectedType(type);
    setSelectedView("advised");
    setSelectedDays(3);
    fetchAdvisedData(type, 3);
  };

  const handleDayFilterChange = (days) => {
    setSelectedDays(days);
    fetchAdvisedData(selectedType, days);
  };

  const handleGoBack = () => {
    setSelectedView("dashboard");
    setRecords([]);
    setNoNotesRecords([]);
  };

  // Open modals
  const handleOpenNoteModal = (recordId, type) => {
    setSelectedRecordId(recordId);
    setSelectedRecordType(type);
    setNoteComment("");
    setShowNoteModal(true);
  };

  const handleOpenCallbackModal = (recordId, type) => {
    setSelectedRecordId(recordId);
    setSelectedRecordType(type);
    setCallbackDate(moment().format("YYYY-MM-DD"));
    setShowCallbackModal(true);
  };

  // Submit Note
  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (!noteComment.trim()) {
      Swal.fire("Warning", "Please enter the note details.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/calling-calendar/submitnote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-hms-location": currentLocation,
          },
          body: JSON.stringify({
            comment: noteComment.trim(),
            id: selectedRecordId,
            type: selectedRecordType,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to save note");
      }

      const resData = await response.json();
      if (resData.statusCode === 200) {
        setShowNoteModal(false);
        Toast.fire({
          icon: "success",
          title: "Note submitted successfully!",
        });
        // Refresh local data
        if (selectedRecordType === "todayAppointments" || selectedRecordType === "tomorrowAppointments") {
          fetchPendingAppointments();
        } else {
          fetchAdvisedData(selectedType, selectedDays);
        }
      } else {
        Swal.fire("Error", "Failed to save note.", "error");
      }
    } catch (error) {
      console.error("Error submitting note:", error);
      Swal.fire("Error", "Server error while saving note.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Callback
  const handleSubmitCallback = async (e) => {
    e.preventDefault();
    if (!callbackDate || !callbackDate.trim()) {
      Swal.fire("Warning", "Please select callback date.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/calling-calendar/submitcallback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-hms-location": currentLocation,
          },
          body: JSON.stringify({
            CallBackdatepicker: callbackDate,
            id: selectedRecordId,
            type: selectedRecordType,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to save callback date");
      }

      const resData = await response.json();
      if (resData.statusCode === 200) {
        setShowCallbackModal(false);
        Toast.fire({
          icon: "success",
          title: "Callback date updated successfully!",
        });
        // Refresh local data
        fetchAdvisedData(selectedType, selectedDays);
      } else {
        Swal.fire("Error", "Failed to save callback date.", "error");
      }
    } catch (error) {
      console.error("Error submitting callback:", error);
      Swal.fire("Error", "Server error while saving callback date.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excel Download
  const handleDownloadExcel = () => {
    const daysString = "3,7,15,30,0";
    const typeValue = (selectedView === "todayAppointments" || selectedView === "tomorrowAppointments")
      ? selectedView
      : selectedType;

    let fromDateValue = fromDate;
    let toDateValue = toDate;

    if (selectedView === "tomorrowAppointments") {
      const todayStr = moment().format("YYYY-MM-DD");
      if (fromDate === todayStr && toDate === todayStr) {
        fromDateValue = moment().add(1, "days").format("YYYY-MM-DD");
        toDateValue = moment().add(1, "days").format("YYYY-MM-DD");
      }
    }

    const downloadUrl = `${BASE_URL}/V1/calling-calendar/download-excel?Frdate=${fromDateValue}&date=${toDateValue}&days=${daysString}&type=${typeValue}&location=${currentLocation}`;
    window.location.href = downloadUrl;
  };

  const renderResultsHeader = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        borderBottom: "1.5px solid #d4e8e3",
        paddingBottom: "10px",
        marginBottom: "5px",
        paddingLeft: "15px",
        paddingRight: "15px",
      }}
    >
      <div style={{ width: "25%", color: "#0f7b63", fontSize: "15px", fontWeight: "700", letterSpacing: "1.2px", textTransform: "uppercase" }}>Patient Details</div>
      <div style={{ width: "35%", color: "#0f7b63", fontSize: "15px", fontWeight: "700", letterSpacing: "1.2px", textTransform: "uppercase" }}>Diagnosis</div>
      <div style={{ width: "30%", color: "#0f7b63", fontSize: "15px", fontWeight: "700", letterSpacing: "1.2px", textTransform: "uppercase" }}>Action Taken</div>
      <div style={{ width: "10%", color: "#0f7b63", fontSize: "15px", fontWeight: "700", letterSpacing: "1.2px", textTransform: "uppercase", textAlign: "right" }}>Actions</div>
    </div>
  );

  const renderRecordCard = (row) => {
    const recordId = selectedType === "Dischargecard"
      ? row.discharge_id
      : selectedType === "Enquiry"
        ? row.id
        : row.diag_id;

    let parsedNotes = [];
    if (row.calling_notes) {
      let parsed = row.calling_notes;
      if (typeof parsed === "string") {
        if (parsed === "{}" || parsed === "[]") {
          parsed = [];
        } else {
          try {
            parsed = JSON.parse(parsed);
          } catch (e) { }
        }
      }

      if (Array.isArray(parsed)) {
        parsedNotes = parsed;
      } else if (typeof parsed === "object" && parsed !== null && Object.keys(parsed).length > 0) {
        parsedNotes = [parsed];
      } else if (typeof parsed === "string" && parsed.trim() !== "") {
        parsedNotes = [{ note: parsed }];
      }

      let flattened = [];
      parsedNotes.forEach((item) => {
        if (item && Array.isArray(item.note)) {
          flattened.push(...item.note);
        } else if (item && typeof item.note === "string") {
          try {
            const inner = JSON.parse(item.note);
            if (Array.isArray(inner)) {
              flattened.push(...inner);
            } else {
              flattened.push(item);
            }
          } catch (e) {
            flattened.push(item);
          }
        } else if (item && typeof item === "string") {
          flattened.push({ note: item });
        } else if (item) {
          flattened.push(item);
        }
      });
      parsedNotes = flattened;
    }

    return (
      <Card
        key={recordId}
        style={{
          borderRadius: "16px",
          border: "1.5px solid #d4e8e3",
          boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
          marginBottom: "16px",
        }}
      >
        <Card.Body className="p-4">
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start" }}>
            {/* Patient Details */}
            <div style={{ width: "25%", padding: "5px" }}>
              {row.was_sunday === 1 && (
                <div
                  style={{
                    fontSize: "10px",
                    color: "#b26a00",
                    backgroundColor: "#fff8e1",
                    padding: "2px 6px",
                    borderRadius: "6px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    marginBottom: "6px",
                    fontWeight: "600",
                    border: "1px solid #ffe082",
                    textTransform: "none"
                  }}
                >
                  <span>⚠️ Scheduled Sunday (Moved to Saturday)</span>
                </div>
              )}
              <p style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "700", color: "#1a2b26", textTransform: "uppercase" }}>
                {row.name || "Unknown Patient"}
                <br />
                <span style={{ fontSize: "13px", color: "#4f6961ff" }}>{row.phone || "-"}</span>
              </p>
            </div>

            {/* Diagnosis */}
            <div style={{ width: "35%", paddingRight: "12px", fontSize: "14px", fontWeight: "600", color: "#1a2b26", textTransform: "uppercase" }}>
              {row.diagnosis || "-"}
            </div>

            {/* Action Taken */}
            <div style={{ width: "30%", paddingRight: "12px", fontSize: "12px" }}>
              {parsedNotes.length === 0 ? (
                <span className="text-muted" style={{ fontSize: "11px", fontStyle: "italic" }}>No notes added yet</span>
              ) : (
                parsedNotes.map((note, index) => {
                  let formattedDate = "";
                  if (note.date) {
                    try {
                      formattedDate = moment(note.date, ["DD-MM-YYYY HH:mm:ss", "YYYY-MM-DDTHH:mm:ss.SSSZ", "YYYY-MM-DD HH:mm:ss"]).format("DD-MM-YYYY HH:mm");
                    } catch (err) {
                      formattedDate = "";
                    }
                  }
                  return (
                    <div key={index} style={{ marginBottom: "8px", borderBottom: index < parsedNotes.length - 1 ? "1px solid #f0f7f5" : "none", paddingBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                        <FeatherIcon icon="clock" size={10} style={{ color: "#0f7b63" }} />
                        <span style={{ fontSize: "10px", fontWeight: "700", color: "#6b8f85" }}>{formattedDate || "N/A"}</span>
                      </div>
                      <div style={{ paddingLeft: "16px", color: "#4a5d58", fontWeight: "500", fontSize: "12px", wordBreak: "break-word" }}>
                        <span>
                          {typeof note === "string"
                            ? note
                            : typeof note.note === "object"
                              ? JSON.stringify(note.note)
                              : note.note || ""}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Actions */}
            <div style={{ width: "10%", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button
                onClick={() => handleOpenNoteModal(recordId, selectedType)}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", backgroundColor: "#0f7b63", border: "none", borderRadius: "8px", color: "white", padding: 0, boxShadow: "0 2px 6px rgba(15,123,99,0.15)" }}
                title="Add Note"
              >
                <FeatherIcon icon="edit-3" size={14} stroke="white" style={{ color: "white", stroke: "white" }} />
              </Button>
              <Button
                onClick={() => handleOpenCallbackModal(recordId, selectedType)}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", backgroundColor: "#0f7b63", border: "none", borderRadius: "8px", color: "white", padding: 0, boxShadow: "0 2px 6px rgba(15,123,99,0.15)" }}
                title="Add Callback Date"
              >
                <FeatherIcon icon="calendar" size={14} stroke="white" style={{ color: "white", stroke: "white" }} />
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const renderAppointmentsHeader = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        borderBottom: "1.5px solid #d4e8e3",
        paddingBottom: "10px",
        marginBottom: "15px",
        paddingLeft: "15px",
        paddingRight: "15px",
      }}
    >
      <div style={{ width: "25%", color: "#0f7b63", fontSize: "15px", fontWeight: "700", letterSpacing: "1.2px", textTransform: "uppercase" }}>Patient Details</div>
      <div style={{ width: "20%", color: "#0f7b63", fontSize: "15px", fontWeight: "700", letterSpacing: "1.2px", textTransform: "uppercase" }}>Date & Time</div>
      <div style={{ width: "25%", color: "#0f7b63", fontSize: "15px", fontWeight: "700", letterSpacing: "1.2px", textTransform: "uppercase" }}>Doctor & FDE</div>
      <div style={{ width: "20%", color: "#0f7b63", fontSize: "15px", fontWeight: "700", letterSpacing: "1.2px", textTransform: "uppercase" }}>Calling Notes</div>
      <div style={{ width: "10%", color: "#0f7b63", fontSize: "15px", fontWeight: "700", letterSpacing: "1.2px", textTransform: "uppercase", textAlign: "right" }}>Actions</div>
    </div>
  );

  const renderAppointmentCard = (app) => {
    let parsedNotes = [];
    if (app.calling_notes) {
      let parsed = app.calling_notes;
      if (typeof parsed === "string") {
        if (parsed === "{}" || parsed === "[]") {
          parsed = [];
        } else {
          try {
            parsed = JSON.parse(parsed);
          } catch (e) { }
        }
      }

      if (Array.isArray(parsed)) {
        parsedNotes = parsed;
      } else if (typeof parsed === "object" && parsed !== null && Object.keys(parsed).length > 0) {
        parsedNotes = [parsed];
      } else if (typeof parsed === "string" && parsed.trim() !== "") {
        parsedNotes = [{ note: parsed }];
      }

      let flattened = [];
      parsedNotes.forEach((item) => {
        if (item && Array.isArray(item.note)) {
          flattened.push(...item.note);
        } else if (item && typeof item.note === "string") {
          try {
            const inner = JSON.parse(item.note);
            if (Array.isArray(inner)) {
              flattened.push(...inner);
            } else {
              flattened.push(item);
            }
          } catch (e) {
            flattened.push(item);
          }
        } else if (item && typeof item === "string") {
          flattened.push({ note: item });
        } else if (item) {
          flattened.push(item);
        }
      });
      parsedNotes = flattened;
    }

    return (
      <Card
        key={app.appointment_id}
        style={{
          borderRadius: "16px",
          border: "1.5px solid #d4e8e3",
          boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
          marginBottom: "16px",
        }}
      >
        <Card.Body style={{ padding: "10px 5px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}>
            {/* Patient Details */}
            <div style={{ width: "25%", paddingLeft: "10px", paddingRight: "10px" }}>
              <p style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "700", color: "#1a2b26", textTransform: "uppercase" }}>
                {app.patient_name || "Unknown Patient"}
              </p>
              <span style={{ fontSize: "13px", color: "#4f6961ff", fontWeight: "600" }}>{app.patient_phone || "-"}</span>
              <div style={{ marginTop: "4px", fontSize: "12px", color: "#000000ff", fontWeight: "600" }}>
                {" "}
                <span className="badge" style={{ backgroundColor: "#e0f7fa", color: "#00838f", fontSize: "11px" }}>
                  {app.patient_type || "New"}
                </span>
              </div>
            </div>

            {/* Date & Time */}
            <div style={{ width: "20%", paddingRight: "12px", fontSize: "14px", fontWeight: "600", color: "#1a2b26" }}>
              <div className="d-flex align-items-center gap-1 mb-1">
                <i className="fa fa-calendar text-muted"></i>
                <span>{app.appointment_timestamp ? moment(app.appointment_timestamp).format("DD-MM-YYYY") : "-"}</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <i className="fa fa-clock-o text-muted"></i>
                <span>{app.appointment_time ? moment(app.appointment_time, ["HH:mm:ss", "hh:mm A"]).format("HH:mm") : "-"}</span>
              </div>
            </div>

            {/* Doctor & FDE */}
            <div style={{ width: "25%", paddingRight: "12px" }}>
              <div style={{ fontSize: "14px", color: "#1a2b26", marginBottom: "4px" }}>
                <strong>Doctor:</strong> {app.doctor_name || "N/A"}
              </div>
              <div style={{ fontSize: "14px", color: "#1a2b26" }}>
                <strong>FDE:</strong> {app.FDE_Name || "N/A"}
              </div>
            </div>

            {/* Note */}
            <div style={{ width: "20%", paddingRight: "12px", overflowY: "auto", maxHeight: "110px" }} className="scroll-note">
              {parsedNotes.length === 0 ? (
                <span style={{ color: "#6b8f85", fontSize: "13px" }}>No calling notes added yet.</span>
              ) : (
                parsedNotes.map((note, index) => {
                  const formattedNoteDate = note.date
                    ? moment(note.date, ["DD-MM-YYYY HH:mm:ss", "YYYY-MM-DDTHH:mm:ss.SSSZ", "YYYY-MM-DD HH:mm:ss"]).format("DD-MM-YYYY HH:mm")
                    : "";
                  return (
                    <div key={index} style={{ marginBottom: "8px", paddingBottom: "8px", borderBottom: index < parsedNotes.length - 1 ? "1px dashed #d4e8e3" : "none" }}>
                      <div style={{ fontSize: "13px", color: "#1a2b26", lineHeight: "1.4" }}>
                        <span style={{ fontWeight: "700", color: "#0f7b63" }}>{index + 1}.</span>{" "}
                        {formattedNoteDate && (
                          <>
                            <span style={{ fontWeight: "600", color: "#486f64ff" }}>{formattedNoteDate}</span>
                            <span style={{ margin: "0 4px", color: "#6f988eff" }}>|</span>
                          </>
                        )}
                        <span style={{ fontWeight: "600" }}>
                          {typeof note === "string"
                            ? note
                            : typeof note.note === "object"
                              ? JSON.stringify(note.note)
                              : note.note || ""}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Actions */}
            <div style={{ width: "10%", display: "flex", justifyContent: "flex-end", gap: "8px", paddingRight: "10px" }}>
              <Button
                onClick={() => {
                  setSelectedRecordId(app.appointment_id);
                  setSelectedRecordType(selectedView);
                  setNoteComment("");
                  setShowNoteModal(true);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "38px",
                  height: "35px",
                  backgroundColor: "#0f7b63",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  padding: 0,
                  boxShadow: "0 2px 6px rgba(15,123,99,0.15)"
                }}
                title="Add Calling Note"
              >
                <FeatherIcon icon="edit-3" size={15} stroke="white" style={{ color: "white", stroke: "white" }} />
              </Button>
              <Button
                onClick={() => {
                  setSelectedAppointment(app);
                  setShowEditModal(true);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "38px",
                  height: "35px",
                  backgroundColor: "#00bcd4",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  padding: 0,
                  boxShadow: "0 2px 6px rgba(0,188,212,0.15)"
                }}
                title="Edit Appointment"
              >
                <FeatherIcon icon="edit" size={15} stroke="white" style={{ color: "white", stroke: "white" }} />
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setAppointmentIdToDelete(app.appointment_id);
                  setShowDeleteModal(true);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "38px",
                  height: "35px",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  padding: 0,
                  boxShadow: "0 2px 6px rgba(220,53,69,0.15)"
                }}
                title="Cancel Appointment"
              >
                <FeatherIcon icon="trash-2" size={15} stroke="white" style={{ color: "white", stroke: "white" }} />
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };


  return (
    <>
      <div
        className="themebody-wrap"
        style={{
          background: "linear-gradient(to right, #e0f7fa, #80deea)",
          fontFamily: "'Poppins', Arial, sans-serif",
          minHeight: "100vh",
          padding: "10px",
        }}
      >
        <PageBreadcrumb pagename="Calling Calendar" />
        <div className="theme-body">
          <Container fluid style={{ padding: "10px", marginTop: "10px" }}>
            {/* Date Filter Bar */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "28px",
                border: "1px solid #4dd0e1",
                boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#6b8f85",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FeatherIcon
                  icon="filter"
                  size={14}
                  style={{ color: "#0f7b63" }}
                />{" "}
                Date Range
              </span>
              <div style={{ position: "relative", flex: 1 }}>
                <FeatherIcon
                  icon="calendar"
                  size={14}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#0f7b63",
                  }}
                />
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={{
                    paddingLeft: "36px",
                    border: "1.5px solid #d4e8e3",
                    borderRadius: "10px",
                    backgroundColor: "#f7faf9",
                  }}
                />
              </div>
              <span style={{ color: "#6b8f85", fontWeight: "600" }}>→</span>
              <div style={{ position: "relative", flex: 1 }}>
                <FeatherIcon
                  icon="check-square"
                  size={14}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#0f7b63",
                  }}
                />
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={{
                    paddingLeft: "36px",
                    border: "1.5px solid #d4e8e3",
                    borderRadius: "10px",
                    backgroundColor: "#f7faf9",
                  }}
                />
              </div>
              {selectedView !== "dashboard" && (
                <Button
                  onClick={handleDownloadExcel}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 18px",
                    background: "linear-gradient(135deg, #0f7b63, #1aab8a)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "13px",
                    boxShadow: "0 4px 12px rgba(15,123,99,0.3)",
                    marginLeft: "auto"
                  }}
                >
                  <i className="fa fa-file-excel"></i> Download Excel
                </Button>
              )}
            </div>

            {/* Views */}
            {selectedView === "dashboard" ? (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "20px",
                  }}
                >
                  <h2
                    style={{
                      fontWeight: "600",
                      fontSize: "22px",
                      fontFamily: "Syne, sans-serif",
                      margin: 0,
                    }}
                  >
                    Quick Actions
                  </h2>
                  <span
                    className="badge"
                    style={{
                      fontSize: "11px",
                      backgroundColor: "#c1e5ddff",
                      color: "#0f7b63",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontWeight: "700",
                    }}
                  >
                    OPD - IPD
                  </span>
                </div>

                <Row className="g-4">
                  {/* Card 1: Surgery Advised */}
                  {false && (
                    <>
                      <Col xs={12} sm={6} md={4}>
                        <Card
                          onClick={() => handleOpenAdvised("Surgery")}
                          onMouseEnter={() => setHoveredCard("Surgery")}
                          onMouseLeave={() => setHoveredCard(null)}
                          style={{
                            borderRadius: "16px",
                            border: "1.5px solid #d4e8e3",
                            boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
                            cursor: "pointer",
                            transition: "all 0.3s",
                            borderTop: "4px solid #e74c3c",
                            position: "relative",
                            overflow: "hidden",
                          }}
                          className="hover-card-elevate"
                        >
                          <Card.Body className="p-10 d-flex flex-column align-items-start gap-3">
                            <div
                              style={{
                                width: "52px",
                                height: "52px",
                                borderRadius: "14px",
                                backgroundColor: "#fdecea",
                                display: "flex",
                                alignItems: "center",
                                justifyCenter: "center",
                                color: "#e74c3c",
                                fontSize: "22px",
                                margin: "auto 0",
                              }}
                              className="d-flex align-items-center justify-content-center"
                            >
                              <i className="fa fa-stethoscope"></i>
                            </div>
                            <div>
                              <h5
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "700",
                                  margin: "0 0 4px 0",
                                }}
                              >
                                Surgery Advised
                              </h5>
                              <p
                                style={{
                                  fontSize: "12px",
                                  color: "#6b8f85",
                                  margin: 0,
                                }}
                              >
                                View surgery recommendations
                              </p>
                            </div>
                            <div
                              style={{
                                position: "absolute",
                                bottom: "18px",
                                right: "18px",
                                width: "30px",
                                height: "30px",
                                borderRadius: "50%",
                                backgroundColor:
                                  hoveredCard === "Surgery"
                                    ? "#e74c3c"
                                    : "#fdecea",
                                color:
                                  hoveredCard === "Surgery"
                                    ? "white"
                                    : "#e74c3c",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                                transition:
                                  "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                transform:
                                  hoveredCard === "Surgery"
                                    ? "translateX(4px)"
                                    : "none",
                                boxShadow:
                                  hoveredCard === "Surgery"
                                    ? "0 4px 10px rgba(231,76,60,0.3)"
                                    : "none",
                              }}
                            >
                              <i className="fa fa-arrow-right"></i>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      {/* Card 2: Medication Advised */}
                      <Col xs={12} sm={6} md={4}>
                        <Card
                          onClick={() => handleOpenAdvised("Medication")}
                          onMouseEnter={() => setHoveredCard("Medication")}
                          onMouseLeave={() => setHoveredCard(null)}
                          style={{
                            borderRadius: "16px",
                            border: "1.5px solid #d4e8e3",
                            boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
                            cursor: "pointer",
                            transition: "all 0.3s",
                            borderTop: "4px solid #2980b9",
                            position: "relative",
                            overflow: "hidden",
                          }}
                          className="hover-card-elevate"
                        >
                          <Card.Body className="p-10 d-flex flex-column align-items-start gap-3">
                            <div
                              style={{
                                width: "52px",
                                height: "52px",
                                borderRadius: "14px",
                                backgroundColor: "#eaf3fb",
                                display: "flex",
                                alignItems: "center",
                                justifyCenter: "center",
                                color: "#2980b9",
                                fontSize: "22px",
                              }}
                              className="d-flex align-items-center justify-content-center"
                            >
                              <i className="fa fa-medkit"></i>
                            </div>
                            <div>
                              <h5
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "700",
                                  margin: "0 0 4px 0",
                                }}
                              >
                                Medication Advised
                              </h5>
                              <p
                                style={{
                                  fontSize: "12px",
                                  color: "#6b8f85",
                                  margin: 0,
                                }}
                              >
                                Track prescribed medications
                              </p>
                            </div>
                            <div
                              style={{
                                position: "absolute",
                                bottom: "18px",
                                right: "18px",
                                width: "30px",
                                height: "30px",
                                borderRadius: "50%",
                                backgroundColor:
                                  hoveredCard === "Medication"
                                    ? "#2980b9"
                                    : "#eaf3fb",
                                color:
                                  hoveredCard === "Medication"
                                    ? "white"
                                    : "#2980b9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                                transition:
                                  "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                transform:
                                  hoveredCard === "Medication"
                                    ? "translateX(4px)"
                                    : "none",
                                boxShadow:
                                  hoveredCard === "Medication"
                                    ? "0 4px 10px rgba(41,128,185,0.3)"
                                    : "none",
                              }}
                            >
                              <i className="fa fa-arrow-right"></i>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      {/* Card 3: Test Advised */}
                      <Col xs={12} sm={6} md={4}>
                        <Card
                          onClick={() => handleOpenAdvised("Test")}
                          onMouseEnter={() => setHoveredCard("Test")}
                          onMouseLeave={() => setHoveredCard(null)}
                          style={{
                            borderRadius: "16px",
                            border: "1.5px solid #d4e8e3",
                            boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
                            cursor: "pointer",
                            transition: "all 0.3s",
                            borderTop: "4px solid #f39c12",
                            position: "relative",
                            overflow: "hidden",
                          }}
                          className="hover-card-elevate"
                        >
                          <Card.Body className="p-10 d-flex flex-column align-items-start gap-3">
                            <div
                              style={{
                                width: "52px",
                                height: "52px",
                                borderRadius: "14px",
                                backgroundColor: "#fef6e6",
                                display: "flex",
                                alignItems: "center",
                                justifyCenter: "center",
                                color: "#f39c12",
                                fontSize: "22px",
                              }}
                              className="d-flex align-items-center justify-content-center"
                            >
                              <i className="fa fa-flask"></i>
                            </div>
                            <div>
                              <h5
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "700",
                                  margin: "0 0 4px 0",
                                }}
                              >
                                Test Advised
                              </h5>
                              <p
                                style={{
                                  fontSize: "12px",
                                  color: "#6b8f85",
                                  margin: 0,
                                }}
                              >
                                Diagnostic tests overview
                              </p>
                            </div>
                            <div
                              style={{
                                position: "absolute",
                                bottom: "18px",
                                right: "18px",
                                width: "30px",
                                height: "30px",
                                borderRadius: "50%",
                                backgroundColor:
                                  hoveredCard === "Test"
                                    ? "#f39c12"
                                    : "#fef6e6",
                                color:
                                  hoveredCard === "Test" ? "white" : "#f39c12",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                                transition:
                                  "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                transform:
                                  hoveredCard === "Test"
                                    ? "translateX(4px)"
                                    : "none",
                                boxShadow:
                                  hoveredCard === "Test"
                                    ? "0 4px 10px rgba(243,156,18,0.3)"
                                    : "none",
                              }}
                            >
                              <i className="fa fa-arrow-right"></i>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      {/* Card 4: Post-OP Calls */}
                      <Col xs={12} sm={6} md={4}>
                        <Card
                          onClick={() => handleOpenAdvised("Dischargecard")}
                          onMouseEnter={() => setHoveredCard("Dischargecard")}
                          onMouseLeave={() => setHoveredCard(null)}
                          style={{
                            borderRadius: "16px",
                            border: "1.5px solid #d4e8e3",
                            boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
                            cursor: "pointer",
                            transition: "all 0.3s",
                            borderTop: "4px solid #8e44ad",
                            position: "relative",
                            overflow: "hidden",
                          }}
                          className="hover-card-elevate"
                        >
                          <Card.Body className="p-10 d-flex flex-column align-items-start gap-3">
                            <div
                              style={{
                                width: "52px",
                                height: "52px",
                                borderRadius: "14px",
                                backgroundColor: "#f4eef9",
                                display: "flex",
                                alignItems: "center",
                                justifyCenter: "center",
                                color: "#8e44ad",
                                fontSize: "22px",
                              }}
                              className="d-flex align-items-center justify-content-center"
                            >
                              <i className="fa fa-phone"></i>
                            </div>
                            <div>
                              <h5
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "700",
                                  margin: "0 0 4px 0",
                                }}
                              >
                                Post-OP Calls
                              </h5>
                              <p
                                style={{
                                  fontSize: "12px",
                                  color: "#6b8f85",
                                  margin: 0,
                                }}
                              >
                                Follow-up discharge calls
                              </p>
                            </div>
                            <div
                              style={{
                                position: "absolute",
                                bottom: "18px",
                                right: "18px",
                                width: "30px",
                                height: "30px",
                                borderRadius: "50%",
                                backgroundColor:
                                  hoveredCard === "Dischargecard"
                                    ? "#8e44ad"
                                    : "#f4eef9",
                                color:
                                  hoveredCard === "Dischargecard"
                                    ? "white"
                                    : "#8e44ad",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                                transition:
                                  "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                transform:
                                  hoveredCard === "Dischargecard"
                                    ? "translateX(4px)"
                                    : "none",
                                boxShadow:
                                  hoveredCard === "Dischargecard"
                                    ? "0 4px 10px rgba(142,68,173,0.3)"
                                    : "none",
                              }}
                            >
                              <i className="fa fa-arrow-right"></i>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </>
                  )}

                  {/* Card 5: Enquiry Calls */}
                  <Col xs={12} sm={6} md={4}>
                    <Card
                      onClick={() => handleOpenAdvised("Enquiry")}
                      onMouseEnter={() => setHoveredCard("Enquiry")}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        borderRadius: "16px",
                        border: "1.5px solid #d4e8e3",
                        boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        borderTop: "4px solid #16a085",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      className="hover-card-elevate"
                    >
                      <Card.Body className="p-10 d-flex flex-column align-items-start gap-3">
                        <div
                          style={{
                            width: "52px",
                            height: "52px",
                            borderRadius: "14px",
                            backgroundColor: "#e8f6f3",
                            display: "flex",
                            alignItems: "center",
                            justifyCenter: "center",
                            color: "#16a085",
                            fontSize: "22px",
                          }}
                          className="d-flex align-items-center justify-content-center"
                        >
                          <i className="fa fa-users"></i>
                        </div>
                        <div>
                          <h5
                            style={{
                              fontSize: "16px",
                              fontWeight: "700",
                              margin: "0 0 4px 0",
                            }}
                          >
                            Enquiry Calls
                          </h5>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#6b8f85",
                              margin: 0,
                            }}
                          >
                            Follow-up appointment enquiries
                          </p>
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            bottom: "18px",
                            right: "18px",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            backgroundColor:
                              hoveredCard === "Enquiry" ? "#16a085" : "#e8f6f3",
                            color:
                              hoveredCard === "Enquiry" ? "white" : "#16a085",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            transition:
                              "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform:
                              hoveredCard === "Enquiry"
                                ? "translateX(4px)"
                                : "none",
                            boxShadow:
                              hoveredCard === "Enquiry"
                                ? "0 4px 10px rgba(22,160,133,0.3)"
                                : "none",
                          }}
                        >
                          <i className="fa fa-arrow-right"></i>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Card 6: Today's Appointment */}
                  <Col xs={12} sm={6} md={4}>
                    <Card
                      onClick={() => setSelectedView("todayAppointments")}
                      onMouseEnter={() => setHoveredCard("TodayAppt")}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        borderRadius: "16px",
                        border: "1.5px solid #d4e8e3",
                        boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        borderTop: "4px solid #00bcd4",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      className="hover-card-elevate"
                    >
                      <Card.Body className="p-10 d-flex flex-column align-items-start gap-3">
                        <div
                          style={{
                            width: "52px",
                            height: "52px",
                            borderRadius: "14px",
                            backgroundColor: "#e0f7fa",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#00bcd4",
                            fontSize: "22px",
                          }}
                        >
                          <i className="fa fa-calendar-check-o"></i>
                        </div>
                        <div>
                          <h5
                            style={{
                              fontSize: "16px",
                              fontWeight: "700",
                              margin: "0 0 4px 0",
                            }}
                          >
                            Today's Appointment ({todayAppointments.length})
                          </h5>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#6b8f85",
                              margin: 0,
                            }}
                          >
                            Pending appointments for today
                          </p>
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            bottom: "18px",
                            right: "18px",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            backgroundColor:
                              hoveredCard === "TodayAppt" ? "#00bcd4" : "#e0f7fa",
                            color:
                              hoveredCard === "TodayAppt" ? "white" : "#00bcd4",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            transition:
                              "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform:
                              hoveredCard === "TodayAppt"
                                ? "translateX(4px)"
                                : "none",
                            boxShadow:
                              hoveredCard === "TodayAppt"
                                ? "0 4px 10px rgba(0,188,212,0.3)"
                                : "none",
                          }}
                        >
                          <i className="fa fa-arrow-right"></i>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Card 7: Tomorrow's Appointment */}
                  <Col xs={12} sm={6} md={4}>
                    <Card
                      onClick={() => setSelectedView("tomorrowAppointments")}
                      onMouseEnter={() => setHoveredCard("TomorrowAppt")}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        borderRadius: "16px",
                        border: "1.5px solid #d4e8e3",
                        boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        borderTop: "4px solid #3b82f6",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      className="hover-card-elevate"
                    >
                      <Card.Body className="p-10 d-flex flex-column align-items-start gap-3">
                        <div
                          style={{
                            width: "52px",
                            height: "52px",
                            borderRadius: "14px",
                            backgroundColor: "#e8f0fe",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#3b82f6",
                            fontSize: "22px",
                          }}
                        >
                          <i className="fa fa-calendar-plus-o"></i>
                        </div>
                        <div>
                          <h5
                            style={{
                              fontSize: "16px",
                              fontWeight: "700",
                              margin: "0 0 4px 0",
                            }}
                          >
                            Tomorrow's Appointment ({tomorrowAppointments.length})
                          </h5>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#6b8f85",
                              margin: 0,
                            }}
                          >
                            Pending appointments for tomorrow
                          </p>
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            bottom: "18px",
                            right: "18px",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            backgroundColor:
                              hoveredCard === "TomorrowAppt" ? "#3b82f6" : "#e8f0fe",
                            color:
                              hoveredCard === "TomorrowAppt" ? "white" : "#3b82f6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            transition:
                              "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform:
                              hoveredCard === "TomorrowAppt"
                                ? "translateX(4px)"
                                : "none",
                            boxShadow:
                              hoveredCard === "TomorrowAppt"
                                ? "0 4px 10px rgba(59,130,246,0.3)"
                                : "none",
                          }}
                        >
                          <i className="fa fa-arrow-right"></i>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            ) : selectedView === "todayAppointments" || selectedView === "tomorrowAppointments" ? (
              <div>
                {/* Header Toolbar */}
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: "10px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "20px",
                    border: "1px solid #d4e8e3",
                    boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
                  }}
                >
                  <Button
                    onClick={handleGoBack}
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      backgroundColor: "#0f7b63",
                      border: "none",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(15,123,99,0.2)",
                    }}
                    title="Go Back to Dashboard"
                  >
                    <i
                      className="fa fa-arrow-left"
                      style={{ fontSize: "16px" }}
                    ></i>
                  </Button>
                  <h3
                    style={{
                      margin: 0,
                      flex: 1,
                      fontFamily: "Syne, sans-serif",
                      fontSize: "18px",
                      fontWeight: "700",
                    }}
                  >
                    {selectedView === "todayAppointments"
                      ? "Today's Pending Appointments"
                      : "Tomorrow's Pending Appointments"}
                  </h3>
                </div>

                {/* Records List */}
                {(selectedView === "todayAppointments" ? todayAppointments : tomorrowAppointments).length === 0 ? (
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "16px",
                      padding: "60px 24px",
                      textAlign: "center",
                      border: "1.5px dashed #d4e8e3",
                      color: "#6b8f85",
                    }}
                  >
                    <i
                      className="fa fa-folder-open mb-3"
                      style={{ fontSize: "40px", color: "#d4e8e3" }}
                    ></i>
                    <p
                      style={{ fontSize: "15px", fontWeight: "500", margin: 0 }}
                    >
                      No pending appointments found
                    </p>
                  </div>
                ) : (
                  <div>
                    {renderAppointmentsHeader()}
                    {(selectedView === "todayAppointments" ? todayAppointments : tomorrowAppointments).map(renderAppointmentCard)}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Header Toolbar */}
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: "10px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "20px",
                    border: "1px solid #d4e8e3",
                    boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
                  }}
                >
                  <Button
                    onClick={handleGoBack}
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      backgroundColor: "#0f7b63",
                      border: "none",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(15,123,99,0.2)",
                    }}
                    title="Go Back to Dashboard"
                  >
                    <i
                      className="fa fa-arrow-left"
                      style={{ fontSize: "16px" }}
                    ></i>
                  </Button>
                  <h3
                    style={{
                      margin: 0,
                      flex: 1,
                      fontFamily: "Syne, sans-serif",
                      fontSize: "18px",
                      fontWeight: "700",
                    }}
                  >
                    {selectedType === "Dischargecard"
                      ? "Post-OP Calls"
                      : selectedType === "Enquiry"
                        ? "Enquiry Follow-up Calls"
                        : `${selectedType} Advised (OPD)`}
                  </h3>
                </div>

                {/* Days Filter Tabs */}
                <div
                  style={{
                    width: "100%",
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: "6px",
                    display: "inline-flex",
                    gap: "4px",
                    marginBottom: "24px",
                    border: "1px solid #d4e8e3",
                    boxShadow: "0 2px 8px rgba(15,123,99,0.08)",
                  }}
                >
                  <Button
                    onClick={() => handleDayFilterChange(3)}
                    variant="none"
                    style={{
                      flex: 1,
                      padding: "9px 20px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: selectedDays === 3 ? "white" : "#6b8f85",
                      background:
                        selectedDays === 3
                          ? "linear-gradient(135deg, #0f7b63, #1aab8a)"
                          : "none",
                      boxShadow:
                        selectedDays === 3
                          ? "0 4px 12px rgba(15,123,99,0.28)"
                          : "none",
                    }}
                  >
                    3 Days
                  </Button>
                  <Button
                    onClick={() => handleDayFilterChange(7)}
                    variant="none"
                    style={{
                      flex: 1,
                      padding: "9px 20px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: selectedDays === 7 ? "white" : "#6b8f85",
                      background:
                        selectedDays === 7
                          ? "linear-gradient(135deg, #0f7b63, #1aab8a)"
                          : "none",
                      boxShadow:
                        selectedDays === 7
                          ? "0 4px 12px rgba(15,123,99,0.28)"
                          : "none",
                    }}
                  >
                    7 Days
                  </Button>
                  <Button
                    onClick={() => handleDayFilterChange(15)}
                    variant="none"
                    style={{
                      flex: 1,
                      padding: "9px 20px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: selectedDays === 15 ? "white" : "#6b8f85",
                      background:
                        selectedDays === 15
                          ? "linear-gradient(135deg, #0f7b63, #1aab8a)"
                          : "none",
                      boxShadow:
                        selectedDays === 15
                          ? "0 4px 12px rgba(15,123,99,0.28)"
                          : "none",
                    }}
                  >
                    15 Days
                  </Button>
                  <Button
                    onClick={() => handleDayFilterChange(30)}
                    variant="none"
                    style={{
                      flex: 1,
                      padding: "9px 20px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: selectedDays === 30 ? "white" : "#6b8f85",
                      background:
                        selectedDays === 30
                          ? "linear-gradient(135deg, #0f7b63, #1aab8a)"
                          : "none",
                      boxShadow:
                        selectedDays === 30
                          ? "0 4px 12px rgba(15,123,99,0.28)"
                          : "none",
                    }}
                  >
                    30 Days
                  </Button>
                  <Button
                    onClick={() => handleDayFilterChange(0)}
                    variant="none"
                    style={{
                      flex: 1,
                      padding: "9px 20px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: selectedDays === 0 ? "white" : "#6b8f85",
                      background:
                        selectedDays === 0
                          ? "linear-gradient(135deg, #0f7b63, #1aab8a)"
                          : "none",
                      boxShadow:
                        selectedDays === 0
                          ? "0 4px 12px rgba(15,123,99,0.28)"
                          : "none",
                    }}
                  >
                    Call Back
                  </Button>
                </div>
                {/* Records List */}
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner
                      animation="border"
                      variant="success"
                      className="mb-2"
                    />
                    <p style={{ color: "#6b8f85", margin: 0 }}>
                      Fetching records...
                    </p>
                  </div>
                ) : selectedDays === 0 ? (
                  <div>
                    {/* Section 1: Today's Call Back Patients */}
                    <div style={{ marginBottom: "40px" }}>
                      <h4
                        style={{
                          fontWeight: "700",
                          fontSize: "16px",
                          color: "#0f7b63",
                          marginBottom: "15px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Today's Call Back Patients ({records.length})
                      </h4>
                      {records.length === 0 ? (
                        <div
                          style={{
                            backgroundColor: "white",
                            borderRadius: "16px",
                            padding: "30px 24px",
                            textAlign: "center",
                            border: "1.5px dashed #d4e8e3",
                            color: "#6b8f85",
                          }}
                        >
                          No callback scheduled for today
                        </div>
                      ) : (
                        <div>
                          {renderResultsHeader()}
                          {records.map((row) => renderRecordCard(row))}
                        </div>
                      )}
                    </div>

                    {/* Section 2: Pending Outreach List */}
                    <div style={{ marginTop: "40px" }}>
                      <h4
                        style={{
                          fontWeight: "700",
                          fontSize: "16px",
                          color: "#0f7b63",
                          marginBottom: "15px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Pending Outreach List ({noNotesRecords.length})
                      </h4>
                      {noNotesRecords.length === 0 ? (
                        <div
                          style={{
                            backgroundColor: "white",
                            borderRadius: "16px",
                            padding: "30px 24px",
                            textAlign: "center",
                            border: "1.5px dashed #d4e8e3",
                            color: "#6b8f85",
                          }}
                        >
                          No patients pending outreach (Above 30 days from enquiry without notes) since 1st July 2026
                        </div>
                      ) : (
                        <div>
                          {renderResultsHeader()}
                          {noNotesRecords.map((row) => renderRecordCard(row))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : records.length === 0 ? (
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "16px",
                      padding: "60px 24px",
                      textAlign: "center",
                      border: "1.5px dashed #d4e8e3",
                      color: "#6b8f85",
                    }}
                  >
                    <i
                      className="fa fa-folder-open mb-3"
                      style={{ fontSize: "40px", color: "#d4e8e3" }}
                    ></i>
                    <p
                      style={{ fontSize: "15px", fontWeight: "500", margin: 0 }}
                    >
                      No records available
                    </p>
                  </div>
                ) : (
                  <div>
                    {renderResultsHeader()}
                    {records.map((row) => renderRecordCard(row))}
                  </div>
                )}
              </div>
            )}
          </Container>
        </div>
      </div>

      {/* Note submission Modal */}
      <Modal
        show={showNoteModal}
        onHide={() => setShowNoteModal(false)}
        centered
      >
        <Modal.Header closeButton style={{ borderBottom: "none" }}>
          <Modal.Title
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "18px",
              fontWeight: "700",
            }}
          >
            Add Calling Note <span className="text-danger">*</span>
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitNote}>
          <Modal.Body className="pt-0">
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                rows={4}
                value={noteComment}
                onChange={(e) => setNoteComment(e.target.value)}
                placeholder="Enter your note or remarks here..."
                style={{
                  border: "1.5px solid #d4e8e3",
                  borderRadius: "10px",
                  padding: "12px",
                  fontSize: "13px",
                  backgroundColor: "#f7faf9",
                }}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: "none" }}>
            <Button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #0f7b63, #1aab8a)",
                border: "none",
                borderRadius: "10px",
                padding: "12px",
                fontWeight: "700",
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(15,123,99,0.28)",
              }}
            >
              {isSubmitting ? "Submitting Note..." : "Submit Note"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Callback Date submission Modal */}
      <Modal
        show={showCallbackModal}
        onHide={() => setShowCallbackModal(false)}
        centered
      >
        <Modal.Header closeButton style={{ borderBottom: "none" }}>
          <Modal.Title
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "18px",
              fontWeight: "700",
            }}
          >
            Add CallBack Date <span className="text-danger">*</span>
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitCallback}>
          <Modal.Body className="pt-0">
            <Form.Group className="mb-3">
              <Form.Control
                type="date"
                value={callbackDate}
                onChange={(e) => setCallbackDate(e.target.value)}
                style={{
                  border: "1.5px solid #d4e8e3",
                  borderRadius: "10px",
                  padding: "12px",
                  fontSize: "13px",
                  backgroundColor: "#f7faf9",
                }}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: "none" }}>
            <Button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #0f7b63, #1aab8a)",
                border: "none",
                borderRadius: "10px",
                padding: "12px",
                fontWeight: "700",
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(15,123,99,0.28)",
              }}
            >
              {isSubmitting ? "Submitting Date..." : "Submit Date"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      {/* Delete/Cancel Appointment Modal */}
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

          <div className="d-flex justify-content-end p-3">
            <Button
              variant="danger"
              size="sm"
              type="submit"
              disabled={modalLoading}
              className="px-3"
              style={{
                borderRadius: "10px",
                fontSize: "12px",
                padding: "10px",
              }}
            >
              {modalLoading ? "Cancelling..." : "Submit & Cancel"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Appointment Modal */}
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
        <Modal.Body style={{ padding: "15px" }}>
          {selectedAppointment ? (
            <Form>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
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
                  <Form.Group>
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
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
                        borderRadius: "10px",
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
                  <Form.Group>
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
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
                        borderRadius: "10px",
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

                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                      Patient Type
                    </Form.Label>
                    <Form.Select
                      name="patient_type"
                      value={selectedAppointment.patient_type || ""}
                      onChange={handleEditModalInputChange}
                      style={{
                        border: "2px solid rgb(77, 208, 225)",
                        fontSize: "12px",
                        borderRadius: "10px",
                      }}
                    >
                      <option value="">Select Type</option>
                      {["New", "Follow", "Postoperative", "MCDPA", "Other"].map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
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
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
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
                  <Form.Group>
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                      Patient Address
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
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
                  <Form.Group>
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
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
                  <Form.Group>
                    <Form.Label style={{ fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
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
                      {fdeList.map((f) => (
                        <option key={f.FDEID} value={f.FDEName}>
                          {f.FDEName}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowEditModal(false)}
            style={{ borderRadius: "10px", fontSize: "12px" }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveChanges}
            disabled={modalLoading}
            style={{
              borderRadius: "10px",
              fontSize: "12px",
              backgroundColor: "#00bcd4",
              border: "none",
            }}
          >
            {modalLoading ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
