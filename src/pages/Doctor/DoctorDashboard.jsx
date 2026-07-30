import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import {
  Row,
  Col,
  Card,
  Container,
  Form,
  Button,
  Modal,
  Spinner,
  Badge,
} from "react-bootstrap";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import Swal from "sweetalert2";
import "react-big-calendar/lib/css/react-big-calendar.css";

// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://194.195.117.79:5100/api";

const localizer = momentLocalizer(moment);

const CustomEvent = ({ event }) => (
  <div style={{ fontSize: "11px", lineHeight: "1.2" }}>
    <strong>{event.time}</strong>
    <div
      style={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {event.patientName}
    </div>
  </div>
);

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

function decodeJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

const getPatientStatus = (app) => {
  if (!app) return null;
  if (app.isIpd) {
    if (!app.isConfirmed) {
      return {
        key: "PENDING",
        text: "Pending",
        color: "#475569",
        bg: "#f1f5f9",
        rowBg: "#ffffff",
        rowBorder: "#cbd5e1",
        icon: "clock",
      };
    }
    return {
      key: "IPD",
      text: "Admitted",
      color: "#1e40af",
      bg: "#eff6ff",
      rowBg: "#eff6ff",
      rowBorder: "#1e40af",
      icon: "activity",
    };
  }
  const isConfirmed =
    app.confirmTime && app.confirmTime !== "0" && app.confirmTime !== 0;
  if (!isConfirmed) {
    return {
      key: "PENDING",
      text: "Pending",
      color: "#475569",
      bg: "#f1f5f9",
      rowBg: "#ffffff",
      rowBorder: "#cbd5e1",
      icon: "clock",
    };
  }
  const isExistingPatient = [
    "FOLLOW",
    "POSTOPERATIVE",
    "MCDPA",
    "OTHER",
  ].includes(app.patientType?.toUpperCase());
  const hasHistory = Number(app.historychk) === 3;
  const hasExecution = Number(app.executivechk) === 1 || Number(app.executivechk) === 2;
  const hasConsultation = Number(app.consultationchk) === 4;
  const hasReceipt = Number(app.executivechk) === 2;

  const isHistoryDone = hasHistory || isExistingPatient;
  const isExecutionDone = (hasHistory && hasExecution) || isExistingPatient;
  const isConsultationDone =
    (hasHistory && hasExecution && hasConsultation) || isExistingPatient;
  const isReceiptDone = hasReceipt;

  if (isReceiptDone) {
    return {
      key: "RECEIPT_GENERATED",
      text: "Receipt Generated",
      color: "#10b981",
      bg: "#ecfdf5",
      rowBg: "#ecfdf5",
      rowBorder: "#10b981",
      icon: "file-text",
    };
  }
  if (isConsultationDone) {
    return {
      key: "PRESCRIPTION_CHECKED",
      text: "Prescription Checked",
      color: "#8e44ad",
      bg: "#8e44ad15",
      rowBg: "#f3e8ff",
      rowBorder: "#8e44ad",
      icon: "clipboard",
    };
  }
  if (isExecutionDone) {
    return {
      key: "DIAGNOSIS_CHECKED",
      text: "Diagnosis Checked",
      color: "#e67e22",
      bg: "#e67e2215",
      rowBg: "#fff7ed",
      rowBorder: "#e67e22",
      icon: "activity",
    };
  }
  if (isHistoryDone) {
    return {
      key: "HISTORY_CHECKED",
      text: "History Checked",
      color: "#ec4899",
      bg: "#ec489915",
      rowBg: "#fdf4ff",
      rowBorder: "#ec4899",
      icon: "check-circle",
    };
  }
  return {
    key: "PATIENT_ARRIVED",
    text: "Patient Arrived",
    color: "#0ea5e9",
    bg: "#f0f9ff",
    rowBg: "#f0f9ff",
    rowBorder: "#0ea5e9",
    icon: "user-check",
  };
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const formatPatientType = (type) => {
    if (!type) return "";
    const upper = type.toUpperCase();
    if (upper === "NEW") return "New";
    if (upper === "FOLLOW") return "Follow";
    if (upper === "POSTOPERATIVE") return "Postoperative";
    if (upper === "MCDPA") return "MCDPA";
    if (upper === "IPD") return "IPD";
    if (upper === "OTHER") return "Other";
    return type;
  };
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [currentLocation, setCurrentLocation] = useState("default");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("day");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "calendar" or "list"
  const [daySearchTerm, setDaySearchTerm] = useState("");
  const [activePatientTypeFilter, setActivePatientTypeFilter] = useState(null);
  const [billedUhids, setBilledUhids] = useState(new Map()); // uid -> { createdAt, dischargeAt }
  const calendarRef = React.useRef(null);

  const togglePatientTypeFilter = (type) => {
    setActivePatientTypeFilter((prev) => (prev === type ? null : type));
  };

  const filteredAppointments = appointments.filter((a) => {
    if (!activePatientTypeFilter) return true;
    return a.patientType === activePatientTypeFilter;
  });
  useEffect(() => {
    const handleSelectEvent = (e) => {
      const { appointmentId } = e.detail;
      // Match regular appointment OR ipd-prefixed format
      const appt = appointments.find(
        (a) =>
          a.appointmentid === appointmentId ||
          a.appointmentid === parseInt(appointmentId) ||
          a.appointmentid === `ipd-${appointmentId}`,
      );
      if (appt) {
        setSelectedEvent(appt);
        setViewMode("list");
      }
    };

    window.addEventListener("selectAppointment", handleSelectEvent);

    // Also check localStorage on mount/refresh
    const autoSelectId = localStorage.getItem("autoSelectAppointmentId");
    if (autoSelectId && appointments.length > 0) {
      const appt = appointments.find(
        (a) =>
          a.appointmentid === parseInt(autoSelectId) ||
          a.appointmentid === autoSelectId ||
          a.appointmentid === `ipd-${autoSelectId}`,
      );
      if (appt) {
        setSelectedEvent(appt);
        setViewMode("list");
        localStorage.removeItem("autoSelectAppointmentId");
      }
    }

    return () =>
      window.removeEventListener("selectAppointment", handleSelectEvent);
  }, [appointments]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  const counts = useMemo(() => {
    const monthStart = moment(selectedDate).startOf("month");
    const monthEnd = moment(selectedDate).endOf("month");

    return appointments
      .filter((event) => {
        const eventDate = moment(event.start);
        return (
          eventDate.isSameOrAfter(monthStart, "day") &&
          eventDate.isSameOrBefore(monthEnd, "day")
        );
      })
      .reduce(
        (acc, event) => {
          acc[event.patientType] = (acc[event.patientType] || 0) + 1;
          return acc;
        },
        { NEW: 0, FOLLOW: 0, POSTOPERATIVE: 0, MCDPA: 0, OTHER: 0, IPD: 0 },
      );
  }, [appointments, selectedDate]);

  const formatAppointments = useCallback((data) => {
    return data.map((app) => {
      const datePart = moment(app.appointment_timestamp).format("YYYY-MM-DD");
      const startTime = moment(
        `${datePart} ${app.appointment_time}`,
        "YYYY-MM-DD hh:mm A",
      );
      const endTime = startTime.clone().add(30, "minutes");

      // --- STANDARDIZATION LOGIC ---
      let rawType = (app.patient_type || "OTHER").toUpperCase();
      let standardizedType = "OTHER";

      if (rawType.includes("NEW")) standardizedType = "NEW";
      else if (rawType.includes("FOLLOW")) standardizedType = "FOLLOW";
      else if (rawType.includes("POST") || rawType.includes("OPERATIVE"))
        standardizedType = "POSTOPERATIVE";
      else if (rawType.includes("MCDPA")) standardizedType = "MCDPA";
      // ------------------------------

      const appointmentTime24 = startTime.isValid()
        ? startTime.format("HH:mm")
        : app.appointment_time;

      return {
        title: `${appointmentTime24 || "N/A"} — ${app.patient_name || "Patient"}`,
        start: startTime.toDate(),
        end: endTime.toDate(),
        phone: app.patient_phone,
        date: moment(app.appointment_timestamp).format("DD-MM-YYYY"),
        time: appointmentTime24,
        patientName: app.patient_name,
        doctorName: app.doctor_name,
        patientType: standardizedType, // Now always NEW, FOLLOW, POSTOPERATIVE, or OTHER
        status: app.status,
        note: app.note,
        confirmTime: app.confirm_time,
        historyTime: app.history_time,
        executionTime: app.execution_time,
        consultationTime: app.consultation_time,
        receiptTime: app.receipt_time,
        historychk: app.historychk,
        executivechk: app.executivechk,
        consultationchk: app.consultationchk,
        patientid: app.patient_id,
        appointmentid: app.appointment_id,
        isConfirmed: app.confirm_time !== "0" && app.confirm_time !== 0,
      };
    });
  }, []);

  const formatIpdAppointments = useCallback((ipdData) => {
    return ipdData.map((ipd) => {
      let admissionTime = "12:00";
      let dateString = moment(ipd.created_at).format("DD-MM-YYYY");
      let start = new Date(ipd.created_at);

      if (ipd.admission_datetime) {
        const parsed = moment(ipd.admission_datetime, [
          "DD-MM-YYYY HH:mm",
          "DD-MM-YYYY hh:mm A",
          "YYYY-MM-DD HH:mm",
          "YYYY-MM-DD hh:mm A",
          "YYYY-MM-DDTHH:mm:ss.SSSZ",
        ]);
        if (parsed.isValid()) {
          start = parsed.toDate();
          dateString = parsed.format("DD-MM-YYYY");
          admissionTime = parsed.format("HH:mm");
        } else {
          const parts = ipd.admission_datetime.split(" ");
          if (parts.length >= 3) {
            admissionTime = `${parts[1]}`;
          } else if (parts.length === 2) {
            admissionTime = parts[1];
          } else {
            admissionTime = parts[1] || "12:00";
          }
        }
      }

      let formattedSurgery = "Not Scheduled";
      if (ipd.surgery_datetime && ipd.surgery_datetime !== "Not Scheduled") {
        const parsedSx = moment(ipd.surgery_datetime, [
          "DD-MM-YYYY HH:mm",
          "DD-MM-YYYY hh:mm A",
          "YYYY-MM-DD HH:mm",
          "YYYY-MM-DD hh:mm A",
          "YYYY-MM-DDTHH:mm:ss.SSSZ",
        ]);
        if (parsedSx.isValid()) {
          formattedSurgery = parsedSx.format("DD-MM-YYYY HH:mm");
        } else {
          const parts = ipd.surgery_datetime.split(" ");
          if (parts.length >= 3) {
            formattedSurgery = ipd.surgery_datetime;
          } else if (parts.length === 2) {
            formattedSurgery = `${parts[0]} ${parts[1]}`;
          } else {
            formattedSurgery = ipd.surgery_datetime;
          }
        }
      }

      const end = moment(start).clone().add(30, "minutes").toDate();

      return {
        title: `${admissionTime} — ${ipd.name || "Patient"} [IPD]`,
        start,
        end,
        phone: ipd.patient_phone,
        date: dateString,
        time: admissionTime,
        patientName: ipd.name,
        doctorName: ipd.surgeon_name || "N/A",
        patientType: "IPD",
        status:
          ipd.admission_no && ipd.admission_no !== "0" && ipd.admission_no !== 0 ? "Admitted" : "Pending",
        note: `Room Details: Room ${ipd.room_no || "N/A"} (${ipd.room_type || "N/A"})`,
        confirmTime:
          ipd.admission_no && ipd.admission_no !== "0" && ipd.admission_no !== 0 ? ipd.created_at : "0",
        patientid: ipd.patient_id,
        appointmentid: `ipd-${ipd.id}`,
        isConfirmed:
          ipd.admission_no &&
          ipd.admission_no !== "0" &&
          ipd.admission_no !== 0,
        isIpd: true,
        uid: ipd.uid,
        uhid: ipd.uid,
        age: ipd.age,
        gender: ipd.sex,
        admissionNo: ipd.admission_no,
        surgeryDatetime: formattedSurgery,
        sxPlan: ipd.sx_plan,
        roomNo: ipd.room_no,
        roomType: ipd.room_type,
      };
    });
  }, []);

  const fetchDropdowns = useCallback(async () => {
    if (currentLocation === "default") return;
    try {
      const url = `${BASE_URL}/V1/doctor/doctorDropdown?location=${currentLocation}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.statusCode === 200 && Array.isArray(data.data)) {
        setDoctors(data.data);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  }, [currentLocation]);

  const fetchAppointmentsForRange = useCallback(
    async (dateToFetch, doctorId) => {
      if (currentLocation === "default") return;
      setLoading(true);
      const targetMoment = moment(dateToFetch);
      let start, end;

      if (currentView === "month") {
        start = targetMoment.clone().startOf("month").toDate();
        end = targetMoment.clone().endOf("month").toDate();
      } else if (currentView === "week") {
        start = targetMoment.clone().startOf("week").toDate();
        end = targetMoment.clone().endOf("week").toDate();
      } else {
        start = targetMoment.clone().startOf("day").toDate();
        end = targetMoment.clone().endOf("day").toDate();
      }

      try {
        const from = moment(start).format("DD-MM-YYYY");
        const to = moment(end).format("DD-MM-YYYY");
        // console.log(from, to);
        let url = `${BASE_URL}/V1/appointment/listAppointments?from=${from}&to=${to}&location=${currentLocation}`;
        if (doctorId) url += `&doctor=${doctorId}`;

        const response = await fetch(url);
        const data = await response.json();

        let apptEvents = [];
        if (data.statusCode === 200 && Array.isArray(data.data)) {
          let filteredData = data.data;
          if (doctorId) {
            filteredData = data.data.filter(
              (app) => String(app.doctor_id) === String(doctorId),
            );
          }
          apptEvents = formatAppointments(filteredData);
        }

        // Fetch IPD Admissions for date range
        let ipdEvents = [];
        try {
          const fromIpd = moment(start).format("YYYY-MM-DD");
          const toIpd = moment(end).format("YYYY-MM-DD");
          const ipdResponse = await fetch(
            `${BASE_URL}/V1/doctor/manage-admission/list?location=${currentLocation}&from=${fromIpd}&to=${toIpd}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );
          if (ipdResponse.ok) {
            const ipdData = await ipdResponse.json();
            if (Array.isArray(ipdData)) {
              let filteredIpd = ipdData;
              if (doctorId) {
                filteredIpd = ipdData.filter(
                  (ipd) => String(ipd.doctor_id) === String(doctorId),
                );
              }
              ipdEvents = formatIpdAppointments(filteredIpd);
            }
          }
        } catch (ipdErr) {
          console.error("Error fetching IPD admissions for range:", ipdErr);
        }

        setAppointments([...apptEvents, ...ipdEvents]);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    },
    [currentLocation, currentView, formatAppointments],
  );

  useEffect(() => {
    if (currentLocation !== "default") {
      fetchAppointmentsForRange(selectedDate, selectedDoctorId);
    }
  }, [
    selectedDate,
    selectedDoctorId,
    currentLocation,
    currentView,
    fetchAppointmentsForRange,
  ]);

  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

  // Fetch IPD bills to know which patients already have a bill
  const fetchBilledUhids = useCallback(async () => {
    if (currentLocation === "default" || !currentLocation) return;
    try {
      const response = await fetch(
        `${BASE_URL}/V1/invoice/listInvoice?location=${currentLocation}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (response.ok) {
        const result = await response.json();
        const rawData = Array.isArray(result.data?.[0])
          ? result.data[0]
          : result.data || [];
        const uidsMap = new Map();
        rawData.forEach((inv) => {
          const uid = String(inv.patient_uid || inv.Uid_no || inv.uid || "");
          if (uid) {
            if (!uidsMap.has(uid)) {
              uidsMap.set(uid, {
                createdAt: inv.creation_date || null,
                admissionTime: inv.admissiontime || null,
                dischargeAt: inv.due_date || null,
                dischargeTime: inv.dischargetime || null,
              });
            }
          }
        });
        setBilledUhids(uidsMap);
      }
    } catch (err) {
      console.error("Error fetching IPD bills:", err);
    }
  }, [currentLocation]);

  useEffect(() => {
    fetchBilledUhids();
  }, [fetchBilledUhids]);

  const handleCalendarNavigate = (newDate) => setSelectedDate(newDate);
  const handleCalendarView = (newView) => setCurrentView(newView);
  const handleDateChange = (e) =>
    setSelectedDate(moment(e.target.value, "YYYY-MM-DD").toDate());
  const handleDoctorChange = (e) => setSelectedDoctorId(e.target.value);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const eventStyleGetter = useCallback((event) => {
    if (event.isIpd) {
      const hasBill = billedUhids.has(String(event.uid || event.uhid));
      const bgColor = hasBill
        ? "#16a34a"
        : event.isConfirmed
          ? "#1e40af"
          : "#475569";
      return {
        style: {
          backgroundColor: bgColor,
          borderRadius: "4px",
          border: "none",
          color: "white",
          display: "block",
        },
      };
    }
    const st = getPatientStatus(event);
    return {
      style: {
        backgroundColor: st ? st.color : "#475569",
        borderRadius: "4px",
        border: "none",
        color: "white",
        display: "block",
      },
    };
  }, [billedUhids]);

  const AppointmentDetailsCard = () => {
    if (!selectedEvent) {
      return (
        <div className="text-center py-5">
          <FeatherIcon
            icon="layers"
            size={45}
            className="text-muted opacity-25 mb-3"
          />
          <p className="text-muted" style={{ padding: "5px" }}>
            Select an appointment entry to view the patient detail and status.
          </p>
        </div>
      );
    }

    if (selectedEvent.isIpd) {
      const hasBill = billedUhids.has(String(selectedEvent.uid || selectedEvent.uhid));
      return (
        <div className="clinical-card" style={{ margin: "10px" }}>
          <div className="clinical-body">
            <div className="data-item-inline mt-4">
              <label style={{ minWidth: "155px", marginBottom: "0", whiteSpace: "nowrap" }}>
                <FeatherIcon icon="calendar" size={14} /> Surgery Date & Time:
              </label>
              <span className="data-value fw-bold" style={{ marginLeft: "10px" }}>
                {selectedEvent.surgeryDatetime || "Not Scheduled"}
              </span>
            </div>

            <div className="data-item-inline">
              <label style={{ minWidth: "155px", marginBottom: "0" }}>
                <FeatherIcon icon="clipboard" size={14} /> Admission No:
              </label>
              <span className="data-value fw-bold" style={{ marginLeft: "10px" }}>
                {selectedEvent.admissionNo &&
                  selectedEvent.admissionNo !== "0" &&
                  selectedEvent.admissionNo !== 0 &&
                  selectedEvent.admissionNo !== "PENDING" ? (
                  <span>{selectedEvent.admissionNo}</span>
                ) : (
                  <span
                    className="selectable-text text-danger fw-bold"
                    title="Confirm admission and create an IPD bill. The assigned admission number will reflect here."
                    style={{ cursor: "help" }}
                  >
                    Pending
                  </span>
                )}
              </span>
            </div>

            <div className="data-item-inline">
              <label style={{ minWidth: "155px", marginBottom: "0" }}>
                <FeatherIcon icon="hash" size={14} /> UID No:
              </label>
              <span className="data-value fw-bold" style={{ marginLeft: "10px" }}>
                {selectedEvent.uid || selectedEvent.uhid}
              </span>
            </div>

            <div className="data-item-inline">
              <label style={{ minWidth: "155px", marginBottom: "0" }}>
                <FeatherIcon icon="user" size={14} /> Patient Name:
              </label>
              <span className="data-value fw-bold" style={{ marginLeft: "10px" }}>
                {selectedEvent.patientName}
              </span>
            </div>

            <div className="data-item-inline">
              <label style={{ minWidth: "155px", marginBottom: "0" }}>
                <FeatherIcon icon="phone" size={14} /> Contact No:
              </label>
              <span className="data-value fw-bold" style={{ marginLeft: "10px" }}>{selectedEvent.phone}</span>
            </div>

            <div className="data-item-inline">
              <label style={{ minWidth: "155px", marginBottom: "0" }}>
                <FeatherIcon icon="info" size={14} /> Age/Gender:
              </label>
              <span className="data-value fw-bold" style={{ marginLeft: "10px" }}>
                {selectedEvent.age} yrs / {selectedEvent.gender || "N/A"}
              </span>
            </div>

            <div className="data-item-inline">
              <label style={{ minWidth: "155px", marginBottom: "0" }}>
                <FeatherIcon icon="tag" size={14} /> Type:
              </label>
              <span className="data-value" style={{ marginLeft: "10px" }}>
                <span
                  style={{
                    backgroundColor: hasBill
                      ? "#16a34a"
                      : selectedEvent.isConfirmed
                        ? "#1e40af"
                        : "#475569",
                    color: "white",
                    fontSize: "11px",
                    padding: "4px 12px",
                    borderRadius: "50px",
                    minWidth: "90px",
                    display: "inline-block",
                    textAlign: "center",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  IPD
                </span>
              </span>
            </div>

            <div className="data-item-inline">
              <label style={{ minWidth: "155px", marginBottom: "0" }}>
                <FeatherIcon icon="activity" size={14} /> Surgeon:
              </label>
              <span className="data-value fw-bold" style={{ marginLeft: "10px" }}>
                {selectedEvent.doctorName || "N/A"}
              </span>
            </div>

            <div className="data-item-inline">
              <label style={{ minWidth: "155px", marginBottom: "0" }}>
                <FeatherIcon icon="clipboard" size={14} /> SX Plan:
              </label>
              <span className="data-value fw-bold" style={{ marginLeft: "10px" }}>
                {selectedEvent.sxPlan || "N/A"}
              </span>
            </div>


          </div>
          <div
            className="mb-5"
            style={{ borderTop: "1px solid rgba(217, 70, 239, 0.25)" }}
          ></div>
          <div className="clinical-actions pt-5">
            {!selectedEvent.isConfirmed ? (
              <div className="text-center py-3">
                <p className="text-muted fw-bold mb-0">
                  <FeatherIcon icon="lock" size={14} className="me-1" />
                  Admission is not confirmed yet
                </p>
              </div>
            ) : (
              !billedUhids.has(String(selectedEvent.uid || selectedEvent.uhid)) && (
                <div
                  className="d-flex align-items-center p-3 mb-5"
                  style={{
                    borderRadius: "8px",
                    backgroundColor: "#eff6ff",
                    color: "#1e40af",
                    border: "1px solid rgba(30, 64, 175, 0.2)",
                  }}
                >
                  <FeatherIcon
                    icon="check-circle"
                    size={20}
                    className="me-2"
                  />
                  <div className="d-flex align-items-center py-4 justify-content-between flex-grow-1">
                    <strong>Admission Confirmed</strong>
                    <div
                      style={{
                        fontSize: "13px",
                        opacity: 1.0,
                        marginLeft: "10px",
                        textAlign: "right",
                      }}
                    >
                      {`Admitted at: ${selectedEvent.confirmTime && selectedEvent.confirmTime !== "0"
                        ? moment(selectedEvent.confirmTime).format("HH:mm")
                        : "N/A"
                      }`}
                    </div>
                  </div>
                </div>
              )
            )}
            {selectedEvent.isConfirmed && (() => {
              const uhid = String(selectedEvent.uid || selectedEvent.uhid);
              if (!billedUhids.has(uhid)) return null;
              const billInfo = billedUhids.get(uhid);
              const dischargeAt = billInfo?.dischargeTime
                ? billInfo.dischargeTime
                : billInfo?.dischargeAt
                  ? moment(billInfo.dischargeAt).format("DD-MM-YY")
                  : "N/A";
              return (
                <div
                  className="d-flex align-items-center p-3 mb-5"
                  style={{
                    borderRadius: "8px",
                    backgroundColor: "#dcfce780",
                    color: "#15803d",
                    border: "1px solid rgba(22, 163, 74, 0.2)",
                  }}
                >
                  <FeatherIcon
                    icon="file-text"
                    size={20}
                    className="me-2"
                    style={{ flexShrink: 0 }}
                  />
                  <div className="d-flex align-items-center py-2 justify-content-between flex-grow-1">
                    <strong>IPD Bill Made</strong>
                    <div
                      style={{
                        fontSize: "13px",
                        opacity: 1.0,
                        marginLeft: "10px",
                        textAlign: "right",
                      }}
                    >
                      <div>Made at: {dischargeAt}</div>
                    </div>
                  </div>
                </div>
              );
            })()}
            {selectedEvent.isConfirmed && (
              <div className="d-grid mt-2">
                <Button
                  className="d-flex align-items-center justify-content-center"
                  onClick={() => {
                    localStorage.setItem("autoSelectUhid", selectedEvent.uid || selectedEvent.uhid);
                    navigate("/doctor-ipd-patient-list");
                  }}
                  style={{
                    backgroundColor: "#178aaeff",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "13px",
                    padding: "8px",
                    transition: "all 0.2s ease-in-out",
                    width: "100%",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#1199bbff";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#178aaeff";
                  }}
                >
                  <FeatherIcon icon="eye" size={14} className="me-2" />
                  View Patient Details
                </Button>
              </div>
            )}
          </div>
        </div>
      );
    }

    const isConfirmed =
      selectedEvent.confirmTime &&
      selectedEvent.confirmTime !== "0" &&
      selectedEvent.confirmTime !== 0;
    const selectedSt = getPatientStatus(selectedEvent);
    const indicatorColorMap = {
      PENDING: "#334155",
      PATIENT_ARRIVED: "#0284c7",
      HISTORY_CHECKED: "#ec4899",
      DIAGNOSIS_CHECKED: "#d35400",
      PRESCRIPTION_CHECKED: "#7b1fa2",
      RECEIPT_GENERATED: "#059669",
      IPD: "#d946ef",
    };
    const typeColor = indicatorColorMap[selectedSt?.key] || "#475569";

    const getDetailedStatus = () => {
      if (!isConfirmed) return null;
      const isExistingPatient = ["FOLLOW", "POSTOPERATIVE", "MCDPA", "OTHER"].includes(
        selectedEvent.patientType?.toUpperCase(),
      );
      const hasHistory = Number(selectedEvent.historychk) === 3;
      const hasExecution =
        Number(selectedEvent.executivechk) === 1 || Number(selectedEvent.executivechk) === 2;
      const hasConsultation =
        Number(selectedEvent.consultationchk) === 4;
      const hasReceipt = Number(selectedEvent.executivechk) === 2;

      const isHistoryDone = hasHistory || isExistingPatient;
      const isExecutionDone = (hasHistory && hasExecution) || isExistingPatient;
      const isConsultationDone =
        (hasHistory && hasExecution && hasConsultation) || isExistingPatient;
      const isReceiptDone = hasReceipt;

      if (isReceiptDone) {
        return {
          text: "Receipt Generated",
          icon: "file-text",
          color: "#10b981",
          bg: "#ecfdf5",
          time: selectedEvent.receiptTime || selectedEvent.confirmTime,
          label: "Completed at:",
        };
      }
      if (isConsultationDone) {
        return {
          text: "Prescription Checked",
          icon: "clipboard",
          color: "#8e44ad",
          bg: "#8e44ad15",
          time: selectedEvent.consultationTime || selectedEvent.confirmTime,
          label: "Completed at:",
        };
      }
      if (isExecutionDone) {
        return {
          text: "Diagnosis Checked",
          icon: "activity",
          color: "#e67e22",
          bg: "#e67e2215",
          time: selectedEvent.executionTime || selectedEvent.confirmTime,
          label: "Completed at:",
        };
      }
      if (isHistoryDone) {
        return {
          text: "History Checked",
          icon: "book-open",
          color: "#ec4899",
          bg: "#ec489915",
          time: selectedEvent.historyTime || selectedEvent.confirmTime,
          label: "Completed at:",
        };
      }
      return {
        text: "Patient Arrived",
        icon: "check-circle",
        color: "#0ea5e9",
        bg: "#f0f9ff",
        time: selectedEvent.confirmTime,
        label: "Checked in at:",
      };
    };

    const detailedStatus = getDetailedStatus();

    return (
      <div className="clinical-card" style={{ margin: "10px" }}>
        <div className="clinical-body">
          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="user" size={14} /> Name:
            </label>
            <span className="data-value fw-bold">
              {selectedEvent.patientName}
            </span>
          </div>
          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="phone" size={14} /> Contact:
            </label>
            <span className="data-value fw-bold">{selectedEvent.phone}</span>
          </div>

          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="calendar" size={14} />
              Appt Date:
            </label>
            <span className="data-value fw-bold">{selectedEvent.date}</span>
          </div>

          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="clock" size={14} /> Appt Time:
            </label>
            <span className="data-value fw-bold">{selectedEvent.time}</span>
          </div>
          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="tag" size={14} /> Type:
            </label>
            <span className="data-value">
              <span
                pill
                style={{
                  backgroundColor: typeColor,
                  color: "white",
                  fontSize: "11px",
                  padding: "4px 12px",
                  borderRadius: "50px",
                  minWidth: "90px",
                  display: "inline-block",
                  textAlign: "center",
                  fontWeight: "700",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {formatPatientType(selectedEvent.patientType)}
              </span>
            </span>
          </div>

          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="activity" size={14} /> Doctor:
            </label>
            <span className="data-value fw-bold">
              {selectedEvent.doctorName}
            </span>
          </div>

          <div className="data-item-inline mt-4 align-items-start">
            <label>
              <FeatherIcon icon="edit-3" size={14} /> Note:
            </label>
            <div
              className="note-box-modern fw-bold flex-grow-1"
              style={{ marginLeft: "5px" }}
            >
              {selectedEvent.note || "No notes available."}
            </div>
          </div>
        </div>
        <div
          className="mb-5"
          style={{ borderTop: "1px solid #a3b1b4ff" }}
        ></div>
        <div className="clinical-actions pt-5">
          {isConfirmed && detailedStatus ? (
            <>
              <div
                className="d-flex align-items-center p-3 mb-2"
                style={{
                  borderRadius: "8px",
                  backgroundColor: detailedStatus.bg,
                  color: detailedStatus.color,
                  border: `1px solid ${detailedStatus.color}40`,
                }}
              >
                <FeatherIcon
                  icon={detailedStatus.icon}
                  size={20}
                  className="me-2"
                />
                <div className="d-flex align-items-center py-4 justify-content-between flex-grow-1">
                  <strong>{detailedStatus.text}</strong>
                  <div
                    style={{
                      fontSize: "13px",
                      opacity: 1.0,
                      marginLeft: "10px",
                      textAlign: "right",
                    }}
                  >
                    {detailedStatus.label} {detailedStatus.time}
                  </div>
                </div>
              </div>
              <Button
                variant="outline-info"
                className="mt-10 d-flex align-items-center justify-content-center"
                onClick={() => {
                  navigate("/personal-details-card", {
                    state: {
                      patient: {
                        patient_id: selectedEvent.patientid,
                        name: selectedEvent.patientName,
                        phone: selectedEvent.phone,
                        contact: selectedEvent.phone,
                        age: selectedEvent.age,
                        sex: selectedEvent.gender,
                      },
                    },
                  });
                }}
                style={{
                  backgroundColor: "#178aaeff",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "13px",
                  padding: "8px",
                  transition: "all 0.2s ease-in-out",
                  width: "100%",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#1199bbff";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#178aaeff";
                }}
              >
                <FeatherIcon icon="eye" size={14} className="me-2" />
                View Patient Details
              </Button>
            </>
          ) : (
            <div className="text-center py-3">
              <p className="text-muted fw-bold mb-0">
                <FeatherIcon icon="lock" size={14} className="me-1" />
                Appointment is not confirmed yet
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ColorLegend = ({ name, type, count }) => {
    const isSelected = activePatientTypeFilter === type;
    return (
      <div
        onClick={() => togglePatientTypeFilter(type)}
        className={`color-legend-pill ${isSelected ? "selected" : ""}`}
        style={{
          padding: "4px 10px",
          minWidth: "fit-content",
          cursor: "pointer",
          border: isSelected ? "2px solid #0284c7" : "1.5px solid #009bad",
          borderRadius: "50px",
          backgroundColor: isSelected ? "#e0f2fe" : "#ffffff",
          transform: isSelected ? "translateY(-1.5px)" : "none",
          boxShadow: isSelected
            ? "0 4px 6px -1px rgba(2, 132, 199, 0.2)"
            : "0 1px 3px rgba(0, 0, 0, 0.05)",
          transition: "all 0.2s ease-in-out",
        }}
      >
        <div
          className="status-dot"
          style={{
            width: "11px",
            height: "11px",
            backgroundColor: "#475569",
            borderRadius: "50%",
            ...(isSelected
              ? { transform: "scale(1.25)", boxShadow: "0 0 8px rgba(71,85,105,0.4)" }
              : {}),
          }}
        ></div>
        <p
          style={{
            color: "#000000",
            fontWeight: isSelected ? "700" : "600",
            margin: 0,
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            gap: "3px",
            whiteSpace: "nowrap",
          }}
        >
          {name}{" "}
          <span
            className="cnt"
            style={{ fontSize: "11px", color: "#000000" }}
          >
            ({count || 0})
          </span>
        </p>
      </div>
    );
  };

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        minHeight: "100vh",
        padding: "10px",
      }}
    >
      <style>{`
.sidebar-wrapper, 
.header-wrapper, 
.page-main-header { 
    z-index: 9999 !important; 
}

.theme-body { 
    position: relative; 
    z-index: 1; 
}

.dashboard-header-bar {
    background: #fff; 
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.03); 
    margin-bottom: 10px;
    border: 2px solid rgb(77, 208, 225);
    padding: 1px;
    position: relative;
    z-index: 5;
}

.legend-title { 
    font-size: 7px; 
    color: #1eb3caff; 
    font-weight: 600; 
    margin-bottom: 5px; 
    letter-spacing: 0.4px; 
    text-transform: uppercase;
}

.legend-item { 
    display: flex; 
    align-items: center; 
    margin-right: 22px; 
    font-size: 13px; 
    font-weight: 600; 
    color: rgb(0, 0, 0); 
}

.dot { 
    width: 10px; 
    height: 10px; 
    border-radius: 50%; 
    margin-right: 6px; 
}

.rbc-calendar { 
    background: #fff; 
    border-radius: 12px; 
    padding: 3px;
    position: relative;
    z-index: 1;
    overflow: visible !important; 
}

.rbc-toolbar .rbc-toolbar-label {
    font-weight: 800 !important;
    font-size: 20px !important;
    color: #0f172a !important;
    letter-spacing: 0.5px;
}

.rbc-header { 
    padding: 12px 0 !important; 
    font-weight: 7000 !important; 
    color: rgb(0, 0, 0) !important; 
    border-bottom: 2px solid #f1f5f9 !important; 
}

.rbc-show-more { 
    color: #016f69ff !important; 
    background: #b0eff3ff !important; 
    border-radius: 4px !important; 
    font-weight: 900 !important; 
    font-size: 11px !important; 
    padding: 2px 6px !important; 
}

.rbc-overlay { 
    position: absolute !important;
    z-index: 100000 !important; 
    background: #fff !important;
    border: 1.5px solid #009bad !important;
    border-radius: 10px !important;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important;
    padding: 8px !important;
    min-width: 230px !important;
    width: max-content !important;
    max-width: 320px !important;
    max-height: 350px !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
}

.rbc-overlay .rbc-event {
    margin-bottom: 4px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
}

.rbc-overlay-header {
    border-bottom: 1px solid #cbd5e1 !important;
    padding: 8px 10px 6px 10px !important;
    margin: -8px -8px 6px -8px !important;
    font-weight: 700 !important;
    font-size: 13px !important;
    color: #0f172a !important;
    position: sticky !important;
    top: -8px !important;
    background: #ffffff !important;
    z-index: 10 !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
}

.clinical-header-centered {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-bottom: 20px;
    border-bottom: 1px solid #f1f5f9;
}

.patient-name { 
    margin: 5px 0; 
    font-weight: 700; 
    color: #0447a5ff; 
    font-size: 15px;
}

.data-item-inline {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-size: 13px;
}

.data-item-inline label {
    display: flex;
    align-items: center;
    width: 110px; 
    color: #575d66ff;
    font-weight: 600;
    margin-bottom: 0;
}

.data-item-inline label svg { margin-right: 9px; }

.arrival-badge { 
    background: #baf8ccff; 
    color: #166534; 
    padding: 10px; 
    border-radius: 8px; 
    text-align: center; 
    font-weight: 700; 
    font-size: 13px; 
    border: 1px solid #bbf7d0; 
}

.note-section-modern label {
    display: flex;
    align-items: center;
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    margin-bottom: 8px;
}

.note-box-modern {
    background: #f8fafc;
    border: 1px solid #d0d8e3ff;
    padding: 5px;      
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.5;
    min-height: 60px;
    white-space: pre-wrap;        
    word-break: break-word; 
}

.rbc-row-segment .rbc-show-more {
    margin-top: 2px;
    display: block;
    text-align: center;
}

.rbc-month-row {
    overflow: hidden;
} 

.cnt{
font-size: 13px;
font-weight: 800;
margin-left: 1px;
}

.day-list-container {
    background: #fff;
    border-radius: 12px;
    padding: 10px;
}

.appointment-list-scroll {
    max-height: 400px; /* Fits approximately 4-5 items */
    overflow-y: auto;
    padding-right: 5px;
}

.appointment-list-scroll::-webkit-scrollbar {
    width: 6px;
}

.appointment-list-scroll::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 10px;
}

.appointment-list-scroll::-webkit-scrollbar-thumb {
    background: #009bad;
    border-radius: 10px;
}

.appointment-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border: 1px solid #cbd5e1;
    transition: all 0.2s ease;
    cursor: pointer;
    border-radius: 8px;
    margin-bottom: 8px;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.appointment-item:hover {
    background-color: #f8fafc;
    transform: translateX(5px);
}

.appointment-item.active {
    background-color: #f0f9ff;
    border: 1px solid #0284c7;
    box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.1);
}

.time-slot {
    min-width: 65px;
    font-weight: 700;
    color: #1e293b;
    font-size: 13px;
}

.patient-info {
    flex-grow: 1;
    margin-left: 10px;
}

.patient-name-text {
    font-weight: 600;
    color: #0f172a;
    font-size: 15px;
}

.doctor-info-text {
    font-size: 12px;
    color: #586679ff;
}

.status-badge-container {
    margin-left: 15px;
}

.view-toggle-btn {
    border-radius: 8px;
    padding: 5px 12px;
    font-weight: 600;
    font-size: 12px;
    transition: all 0.3s ease;
}

.view-toggle-btn.active {
    background-color: #009bad;
    color: white;
    border-color: #009bad;
}
                `}</style>
      <PageBreadcrumb pagename="Doctor Dashboard" />
      <div className="theme-body">
        <Container fluid>
          <div className="dashboard-header-bar" style={{ marginTop: "10px" }}>
            <Row className="align-items-center">
              <Col lg={7}>
                <div className="legend-title">
                  <h4 className="fw-bold mb-10">
                    {viewMode === "list" ? (
                      "Today's Patient Overview"
                    ) : (
                      <>
                        <span style={{ fontWeight: "700", fontSize: "20px", color: "#000000ff" }}>Patient Appointment & Surgery Calendar for</span>{" "}
                        <span style={{ fontWeight: "700", color: "#007e8bff" }}> {moment(selectedDate).format("MMMM YYYY")} </span>
                      </>
                    )}
                  </h4>
                </div>
                <div
                  className="d-flex align-items-center flex-nowrap"
                  style={{ gap: "6px", position: "relative", zIndex: 2 }}
                >
                  <ColorLegend
                    name="New Patient"
                    type="NEW"
                    count={counts.NEW}
                    bgColor="#0284c7"
                  />
                  <ColorLegend
                    name="Follow Patient"
                    type="FOLLOW"
                    count={counts.FOLLOW}
                    bgColor="#10b981"
                  />
                  <ColorLegend
                    name="Postoperative Patient"
                    type="POSTOPERATIVE"
                    count={counts.POSTOPERATIVE}
                    bgColor="#8b5cf6"
                  />
                  <ColorLegend
                    name="MCDPA Patient"
                    type="MCDPA"
                    count={counts.MCDPA}
                    bgColor="#475569"
                  />
                  <ColorLegend
                    name="Other Patient"
                    type="OTHER"
                    count={counts.OTHER}
                    bgColor="#f59e0b"
                  />
                  <ColorLegend
                    name="IPD Patient"
                    type="IPD"
                    count={counts.IPD}
                    bgColor="#d946ef"
                  />
                </div>
              </Col>
              <Col lg={5}>
                <div className="d-flex align-items-end justify-content-lg-end gap-3 mt-3 mt-lg-0">
                  {/* <div className="d-flex flex-column">
                                        <label className="text-muted fw-bold mb-1" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Select Date:</label>
                                        <Form.Control
                                            type="date"
                                            value={moment(selectedDate).format("YYYY-MM-DD")}
                                            onChange={handleDateChange}
                                            style={{ width: '160px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                                        />
                                    </div> */}
                  <div
                    className="d-flex flex-column"
                    style={{
                      justifyContent: "center",
                      alignContent: "center",
                      alignSelf: "center",
                    }}
                  >
                    <label
                      className="text-muted fw-bold mb-2"
                      style={{ fontSize: "13px" }}
                    >
                      Filter by Doctor:
                    </label>
                    <Form.Select
                      onChange={handleDoctorChange}
                      value={selectedDoctorId}
                      style={{
                        width: "200px",
                        height: "30px",
                        borderRadius: "8px",
                        border: "1px solid #009bad",
                        fontSize: "11px",
                      }}
                    >
                      <option value="">All Doctors</option>
                      {doctors.map((doc) => (
                        <option key={doc.doctor_id} value={doc.doctor_id}>
                          {doc.name}
                        </option>
                      ))}
                    </Form.Select>
                  </div>

                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedDoctorId("");
                      setActivePatientTypeFilter(null);
                      setDaySearchTerm("");
                    }}
                    style={{
                      backgroundColor: "#ff9800",
                      color: "white",
                      border: "none",
                      height: "27px",
                      width: "90px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "12px",
                      padding: 0,
                      borderRadius: "10px",
                      alignSelf: "flex-end",
                      marginBottom: "3px",
                    }}
                  >
                    <FeatherIcon icon="filter" size={10} className="me-1" />
                    Clear Filter
                  </Button>
                </div>
              </Col>
            </Row>
          </div>

          <Row>
            <Col xxl={8} xl={8} lg={12} className="mb-4">
              <Card
                className="border-0 shadow-sm"
                style={{ borderRadius: "10px" }}
              >
                <Card.Header
                  className="bg-white py-2 px-3 d-flex justify-content-between align-items-center"
                  style={{
                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px",
                    border: "2px solid rgb(77, 208, 225)",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <FeatherIcon
                      icon={viewMode === "calendar" ? "calendar" : "list"}
                      size={18}
                      className="text-primary me-2"
                    />
                    <h6 className="mb-0 fw-bold text-dark">
                      {viewMode === "calendar"
                        ? "Calendar View"
                        : "Day Schedule"}
                    </h6>
                  </div>
                  <div className="btn-group bg-light p-1 rounded-3">
                    <Button
                      variant={viewMode === "calendar" ? "primary" : "light"}
                      className={`view-toggle-btn py-1 px-3 ${viewMode === "calendar" ? "active shadow-sm" : ""}`}
                      onClick={() => {
                        setViewMode("calendar");
                        setCurrentView("month");
                      }}
                      size="sm"
                      style={{
                        height: "28px",
                        border: "none",
                        fontSize: "11px",
                      }}
                    >
                      Calendar
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "primary" : "light"}
                      className={`view-toggle-btn py-1 px-3 ${viewMode === "list" ? "active shadow-sm" : ""}`}
                      onClick={() => {
                        setViewMode("list");
                        setCurrentView("day");
                        setSelectedDate(new Date());
                      }}
                      size="sm"
                      style={{
                        height: "28px",
                        border: "none",
                        fontSize: "11px",
                      }}
                    >
                      Day Schedule
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body
                  className="p-3"
                  style={{
                    border: "2px solid rgb(77, 208, 225)",
                    borderTop: "none",
                    borderBottomLeftRadius: "10px",
                    borderBottomRightRadius: "10px",
                    overflow: "visible",
                  }}
                >
                  {viewMode === "calendar" ? (
                    <Calendar
                      ref={calendarRef}
                      localizer={localizer}
                      events={filteredAppointments}
                      date={selectedDate}
                      view={currentView}
                      onNavigate={handleCalendarNavigate}
                      onSelectEvent={handleEventClick}
                      onView={handleCalendarView}
                      eventPropGetter={eventStyleGetter}
                      components={{ event: CustomEvent }}
                      style={{ height: 830 }}
                      popup={true}
                      views={{
                        month: true,
                        week: true,
                        day: true,
                      }}
                      length={3}
                      maxEvents={3}
                    />
                  ) : (
                    <div className="day-list-container">
                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center">
                          <div
                            className="search-box-day"
                            style={{
                              position: "relative",
                              marginBottom: "5px",
                            }}
                          >
                            <FeatherIcon
                              icon="search"
                              size={14}
                              style={{
                                position: "absolute",
                                left: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#94a3b8",
                              }}
                            />
                            <Form.Control
                              type="text"
                              placeholder="Search name or contact..."
                              value={daySearchTerm}
                              onChange={(e) => setDaySearchTerm(e.target.value)}
                              style={{
                                paddingLeft: "32px",
                                height: "32px",
                                fontSize: "12px",
                                borderRadius: "8px",
                                border: "1.5px solid #009bad",
                                backgroundColor: "#fdfdfd",
                                width: "220px",
                              }}
                            />
                          </div>
                          <Badge bg="primary" className="p-6">
                            {
                              filteredAppointments.filter((a) =>
                                moment(a.start).isSame(selectedDate, "day"),
                              ).length
                            }{" "}
                            Appointments
                          </Badge>
                        </div>
                      </div>

                      <div className="appointment-list-scroll">
                        {filteredAppointments
                          .filter((app) => {
                            const isSameDay = moment(app.start).isSame(
                              selectedDate,
                              "day",
                            );
                            if (!isSameDay) return false;

                            const term = daySearchTerm.toLowerCase();
                            const nameMatch = app.patientName
                              ?.toLowerCase()
                              .includes(term);
                            const phoneMatch = app.phone
                              ?.toLowerCase()
                              .includes(term);

                            return nameMatch || phoneMatch;
                          })
                          .sort((a, b) => moment(a.start).diff(moment(b.start)))
                          .map((app, index) => {
                            const listStatus = getPatientStatus(app);

                            const indicatorColorMap = {
                              PENDING: "#334155",
                              PATIENT_ARRIVED: "#0284c7",
                              HISTORY_CHECKED: "#ec4899",
                              DIAGNOSIS_CHECKED: "#d35400",
                              PRESCRIPTION_CHECKED: "#7b1fa2",
                              RECEIPT_GENERATED: "#059669",
                              IPD: "#d946ef",
                            };

                            // Check if an IPD bill exists for this patient
                            const patientUhid = app.isIpd ? (app.uid || app.uhid) : null;
                            const hasBill = patientUhid ? billedUhids.has(String(patientUhid)) : false;

                            const indicatorColor = hasBill
                              ? "#16a34a"
                              : app.isIpd
                                ? (app.isConfirmed ? "#1e40af" : "#334155")
                                : indicatorColorMap[listStatus.key] || "#475569";

                            // Override listStatus for billed IPD patients to show green
                            const effectiveListStatus = hasBill
                              ? { ...listStatus, text: "Bill Made", color: "#16a34a", bg: "#dcfce7", rowBg: "#f0fdf4", rowBorder: "#16a34a" }
                              : listStatus;

                            const isActive =
                              selectedEvent?.appointmentid ===
                              app.appointmentid;

                            const isPending = !hasBill && listStatus.key === "PENDING";
                            const itemStyle = isPending
                              ? {
                                position: "relative",
                                backgroundColor: isActive ? "#f0f9ff" : "#ffffff",
                                border: isActive
                                  ? "1.5px solid #0284c7"
                                  : "1px solid #cbd5e1",
                                boxShadow: isActive
                                  ? "0 4px 6px -1px rgba(2, 132, 199, 0.15)"
                                  : "0 1px 3px rgba(0,0,0,0.02)",
                              }
                              : {
                                position: "relative",
                                backgroundColor: effectiveListStatus.rowBg,
                                border: isActive
                                  ? `2px solid ${effectiveListStatus.rowBorder}`
                                  : `1.5px solid ${effectiveListStatus.rowBorder}80`,
                                boxShadow: isActive
                                  ? `0 4px 8px -1px ${effectiveListStatus.color}40`
                                  : `0 1px 3px ${effectiveListStatus.color}20`,
                              };

                            return (
                              <div
                                key={app.appointmentid || index}
                                className={`appointment-item ${isActive ? "active" : ""}`}
                                onClick={() => handleEventClick(app)}
                                style={itemStyle}
                              >
                                <div className="time-slot">{app.time}</div>
                                <div
                                  className="type-indicator mx-1"
                                  style={{
                                    width: "4px",
                                    height: "35px",
                                    backgroundColor: indicatorColor,
                                    borderRadius: "2px",
                                  }}
                                ></div>
                                <div className="patient-info">
                                  <div className="patient-name-text">
                                    {app.patientName}
                                  </div>
                                  <div className="doctor-info-text">
                                    <FeatherIcon
                                      icon="activity"
                                      size={12}
                                      className="me-1"
                                    />
                                    {app.doctorName}
                                  </div>
                                </div>
                                <div
                                  className="status-badge-container d-flex gap-2 align-items-center"
                                  style={{
                                    position: "absolute",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    margin: 0,
                                  }}
                                >
                                  <span
                                    style={{
                                      backgroundColor: indicatorColor,
                                      color: "white",
                                      fontSize: "10px",
                                      padding: "2px 8px",
                                      borderRadius: "4px",
                                      minWidth: "70px",
                                      display: "inline-block",
                                      textAlign: "center",
                                      fontWeight: "700",
                                    }}
                                  >
                                    {formatPatientType(app.patientType)}
                                  </span>
                                </div>
                                {effectiveListStatus && (
                                  <div className="d-flex align-items-center">
                                    <span
                                      style={{
                                        backgroundColor: effectiveListStatus.bg,
                                        color: indicatorColor,
                                        border: `1px solid ${indicatorColor}60`,
                                        fontSize: "10px",
                                        padding: "2px 8px",
                                        borderRadius: "4px",
                                        minWidth: "70px",
                                        display: "inline-block",
                                        textAlign: "center",
                                        fontWeight: "700",
                                        textTransform: "uppercase",
                                      }}
                                    >
                                      {effectiveListStatus.text}
                                    </span>
                                  </div>
                                )}
                                <div className="ms-3">
                                  <FeatherIcon
                                    icon="chevron-right"
                                    size={16}
                                    className="text-muted"
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      {filteredAppointments.filter((a) =>
                        moment(a.start).isSame(selectedDate, "day"),
                      ).length === 0 && (
                          <div className="text-center py-5">
                            <FeatherIcon
                              icon="calendar"
                              size={50}
                              className="text-muted mb-3 opacity-25"
                            />
                            <p className="text-muted">
                              No appointments scheduled for this day.
                            </p>
                          </div>
                        )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col xxl={4} xl={4} lg={12}>
              <Card
                className="shadow-sm sticky-sidebar"
                style={{
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "2px solid rgb(77, 208, 225)",
                }}
              >
                <Card.Header
                  className="bg-white py-5 d-flex justify-content-center align-items-center"
                  style={{ borderBottom: "1px solid rgb(77, 208, 225)" }}
                >
                  <div className="d-flex align-items-center justify-content-center w-100">
                    <div
                      className="d-flex align-items-center justify-content-center me-1"
                      style={{
                        background: "#e0f2fe",
                        width: "27px",
                        height: "27px",
                        borderRadius: "10px",
                        flexShrink: 0,
                      }}
                    >
                      <FeatherIcon
                        icon="clipboard"
                        size={16}
                        className="text-primary"
                      />
                    </div>
                    <h5
                      className="mb-0 fw-bold"
                      style={{
                        color: "#3f444bff",
                        whiteSpace: "nowrap",
                        fontSize: "16px",
                      }}
                    >
                      {selectedEvent?.isIpd ? "Surgery Details" : "Appointment Details"}
                    </h5>
                  </div>
                </Card.Header>
                <Card.Body className="p-4">
                  <AppointmentDetailsCard />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}
