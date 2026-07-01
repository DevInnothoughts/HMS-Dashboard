import React, { useEffect, useState, useCallback, useMemo } from "react";
import FeatherIcon from "feather-icons-react";
import {
  Row,
  Col,
  Card,
  Container,
  Button,
  Badge,
  Spinner,
  Form,
  Modal,
} from "react-bootstrap";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import IpdbillNavbar from "../../components/Navbar/IpdbillNavbar";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import Swal from "sweetalert2";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { decodeJwt } from "../../utils/decode-jwt";
import SimpleBar from "simplebar-react";

const BASE_URL = "http://localhost:5100/api";

const localizer = momentLocalizer(moment);

const CalendarCustomEvent = ({ event }) => (
  <div style={{ fontSize: "11px", lineHeight: "1.2" }}>
    <strong>{event.time}</strong>
    <div
      style={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        fontWeight: "bold"
      }}
    >
      {event.patientName}
    </div>
    <div
      style={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        fontSize: "10px",
        opacity: 0.95
      }}
    >
      {event.sxPlan || "Surgery"}
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

export default function IpdDashboard() {
  const [surgeries, setSurgeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("default");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("day");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelComment, setCancelComment] = useState("");

  const [viewMode, setViewMode] = useState("list"); // "calendar" or "list"
  const [daySearchTerm, setDaySearchTerm] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState(null); // null, "confirmed", "pending"

  const calendarRef = React.useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatSurgeries = useCallback((data) => {
    return data.map((p) => {
      const surgeryMoment = p.surgery_datetime
        ? moment(p.surgery_datetime, ["DD-MM-YYYY hh:mm A", "DD-MM-YYYY HH:mm", "YYYY-MM-DD HH:mm", "YYYY-MM-DD hh:mm A"])
        : moment(p.created_at);

      const startTime = surgeryMoment.toDate();
      const endTime = surgeryMoment.clone().add(1, "hour").toDate();

      return {
        title: `${surgeryMoment.format("HH:mm")} — ${p.name || "Patient"}`,
        start: startTime,
        end: endTime,
        phone: p.patient_phone,
        date: surgeryMoment.format("DD-MM-YYYY"),
        time: surgeryMoment.format("HH:mm"),
        patientName: p.name,
        sxPlan: p.sx_plan,
        uhid: p.uid,
        age: p.age,
        gender: p.sex,
        patientid: p.patient_id,
        isConfirmed:
          p.admission_no !== 0 &&
          p.admission_no !== "0" &&
          p.admission_no !== null,
        admissionNo: p.admission_no,
        doctorName: p.doctor_name || p.surgeon_name || "N/A",
        doctorId: p.doctor_id,
      };
    });
  }, []);

  const fetchSurgeries = useCallback(async (dateToFetch) => {
    if (currentLocation === "default") return;
    setLoading(true);
    const targetMoment = moment(dateToFetch || selectedDate);
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
      const fromDate = moment(start).format("YYYY-MM-DD");
      const toDate = moment(end).format("YYYY-MM-DD");

      const response = await fetch(
        `${BASE_URL}/V1/ipd/admin/listVerifiedPatients?location=${currentLocation}&from=${fromDate}&to=${toDate}`,
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
        const formattedEvents = formatSurgeries(result);
        setSurgeries(formattedEvents);
      }
    } catch (error) {
      console.error("Error fetching surgeries:", error);
    } finally {
      setLoading(false);
    }
  }, [currentLocation, selectedDate, currentView, formatSurgeries]);

  useEffect(() => {
    fetchSurgeries();
  }, [fetchSurgeries]);

  const fetchDoctors = useCallback(async () => {
    if (currentLocation === "default" || !currentLocation) return;
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

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    const handleSelectEvent = (e) => {
      const { uhid } = e.detail;
      const surgery = surgeries.find((s) => s.uhid === uhid);
      if (surgery) {
        setSelectedEvent(surgery);
        setViewMode("list");
      }
    };

    window.addEventListener("selectSurgery", handleSelectEvent);

    // Also check localStorage on mount/refresh
    const autoSelectUhid = localStorage.getItem("autoSelectSurgeryUhid");
    if (autoSelectUhid && surgeries.length > 0) {
      const surgery = surgeries.find((s) => s.uhid === autoSelectUhid);
      if (surgery) {
        setSelectedEvent(surgery);
        setViewMode("list");
        localStorage.removeItem("autoSelectSurgeryUhid");
      }
    }

    return () =>
      window.removeEventListener("selectSurgery", handleSelectEvent);
  }, [surgeries]);

  const filteredSurgeries = useMemo(() => {
    return surgeries.filter((s) => {
      if (selectedDoctorId) {
        const docMatch = s.doctorName?.toLowerCase().includes(selectedDoctorId.toLowerCase()) ||
          String(s.doctorId) === String(selectedDoctorId);
        if (!docMatch) return false;
      }
      if (activeStatusFilter) {
        if (activeStatusFilter === "confirmed" && !s.isConfirmed) return false;
        if (activeStatusFilter === "pending" && s.isConfirmed) return false;
      }
      return true;
    });
  }, [surgeries, selectedDoctorId, activeStatusFilter]);

  const counts = useMemo(() => {
    const monthStart = moment(selectedDate).startOf("month");
    const monthEnd = moment(selectedDate).endOf("month");

    return surgeries.filter((event) => {
      const eventDate = moment(event.start);
      return (
        eventDate.isSameOrAfter(monthStart, "day") &&
        eventDate.isSameOrBefore(monthEnd, "day")
      );
    }).length;
  }, [surgeries, selectedDate]);

  const handleCalendarNavigate = (newDate) => setSelectedDate(newDate);
  const handleCalendarView = (newView) => setCurrentView(newView);
  const handleRefreshClick = () => {
    fetchSurgeries();
    window.dispatchEvent(new CustomEvent("refreshIpdCount"));
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleConfirmSurgery = (contact, uhid) => {
    Swal.fire({
      title: "Confirm Admission?",
      text: "This will move the patient to the surgery list.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#15ab56ff",
      cancelButtonColor: "#dc1818ff",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${BASE_URL}/V1/ipd/admin/confirmAdmissionEntry`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contact,
                uhid,
                location: currentLocation,
              }),
            },
          );

          if (response.ok) {
            const data = await response.json();
            Swal.fire(
              "Confirmed!",
              `Admission No: ${data.admissionNo} generated.`,
              "success",
            );
            fetchSurgeries();
            window.dispatchEvent(new CustomEvent("refreshIpdCount"));
          }
        } catch (error) {
          Swal.fire("Error", "Could not confirm admission", "error");
        }
      }
    });
  };

  const handleCancelSurgery = () => {
    if (!selectedEvent) return;
    setCancelComment("");
    setShowCancelModal(true);
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();

    if (!cancelComment.trim()) {
      Swal.fire(
        "Required",
        "Please provide a reason for cancellation",
        "warning",
      );
      return;
    }

    Swal.fire({
      title: "Cancel Surgery?",
      text: `Are you sure you want to cancel the surgery for ${selectedEvent.patientName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel",
      cancelButtonText: "No",
      confirmButtonColor: "#dc3545",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: "Processing Cancellation...",
            didOpen: () => Swal.showLoading(),
            allowOutsideClick: false,
          });

          const response = await fetch(
            `${BASE_URL}/V1/ipd/admin/cancelAdmissionEntry`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                location: currentLocation,
                uhid: selectedEvent.uhid,
                contact: selectedEvent.phone,
                reason: cancelComment,
              }),
            },
          );

          const data = await response.json();
          if (response.ok) {
            setShowCancelModal(false);
            setCancelComment("");
            setSelectedEvent(null);

            Swal.fire(
              "Cancelled!",
              "The surgery entry has been removed.",
              "success",
            );

            fetchSurgeries();
            window.dispatchEvent(new CustomEvent("refreshIpdCount"));
          } else {
            throw new Error(data.message || "Failed to cancel entry");
          }
        } catch (error) {
          console.error("Cancellation error:", error);
          Swal.fire(
            "Error",
            error.message || "Server connection failed",
            "error",
          );
        }
      }
    });
  };

  const eventStyleGetter = useCallback((event) => {
    const isConf = event.isConfirmed;
    return {
      style: {
        backgroundColor: isConf ? "#10b981" : "#f59e0b",
        borderRadius: "4px",
        border: "none",
        color: "white",
        display: "block",
      },
    };
  }, []);

  const toggleStatusFilter = (status) => {
    setActiveStatusFilter((prev) => (prev === status ? null : status));
  };

  const ColorLegend = ({ name, type, count, bgColor }) => {
    const isSelected = activeStatusFilter === type;
    return (
      <div
        onClick={() => toggleStatusFilter(type)}
        className={`color-legend-pill ${isSelected ? "selected" : ""}`}
        style={{
          padding: "4px 10px",
          minWidth: "fit-content",
          border: "1px solid #cbd5e1",
          borderRadius: "50px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          backgroundColor: isSelected ? `${bgColor}25` : "#ffffff",
          borderColor: isSelected ? bgColor : "#cbd5e1",
          transition: "all 0.2s ease",
          userSelect: "none",
          cursor: "pointer",
        }}
      >
        <div
          className="status-dot"
          style={{
            width: "11px",
            height: "11px",
            borderRadius: "50%",
            backgroundColor: bgColor,
          }}
        ></div>
        <p
          style={{
            color: "#1e293b",
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
            style={{ fontSize: "11px", color: "#2a3748ff" }}
          >
            ({count || 0})
          </span>
        </p>
      </div>
    );
  };

  const SurgeryDetailsCard = () => {
    if (!selectedEvent) {
      return (
        <div className="text-center py-5">
          <FeatherIcon
            icon="layers"
            size={45}
            className="text-muted opacity-25 mb-3"
          />
          <p className="text-muted" style={{ padding: "5px" }}>
            Select a surgery entry to view the patient detail and status.
          </p>
        </div>
      );
    }

    return (
      <div className="clinical-card" style={{ margin: "10px" }}>
        <div className="clinical-body">
          <div className="data-item-inline mt-4">
            <label>
              <FeatherIcon icon="calendar" size={14} /> Surgery Date & Time:
            </label>
            <span className="data-value fw-bold">{selectedEvent.date} &nbsp;{selectedEvent.time}</span>
          </div>

          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="info" size={14} /> Admission No:
            </label>
            <span className="data-value fw-bold">
              {!selectedEvent.admissionNo || selectedEvent.admissionNo === "0" || selectedEvent.admissionNo === 0 ? (
                <span style={{ fontStyle: "italic", fontWeight: "normal", color: "red" }}>
                  not generated yet
                </span>
              ) : (
                selectedEvent.admissionNo
              )}
            </span>
          </div>

          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="hash" size={14} /> UID No:
            </label>
            <span className="data-value fw-bold">{selectedEvent.uhid}</span>
          </div>

          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="user" size={14} />
              Patient Name:
            </label>
            <span className="data-value fw-bold">
              {selectedEvent.patientName}
            </span>
          </div>

          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="phone" size={14} /> Contact No:
            </label>
            <span className="data-value fw-bold">{selectedEvent.phone}</span>
          </div>
          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="info" size={14} /> Age/Gender:
            </label>
            <span className="data-value fw-bold">
              {selectedEvent.age} / {selectedEvent.gender}
            </span>
          </div>
          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="activity" size={14} /> Surgeon:
            </label>
            <span className="data-value fw-bold">
              {selectedEvent.doctorName || "N/A"}
            </span>
          </div>
          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="clipboard" size={14} /> SX Plan:
            </label>
            <span className="data-value fw-bold">
              {selectedEvent.sxPlan || "N/A"}
            </span>
          </div>
        </div>

        <div
          className="mb-3"
          style={{ borderTop: "1px solid #a3b1b4ff" }}
        ></div>

        <div className="clinical-actions pt-2">
          <div className="d-grid gap-1">
            <Button
              variant={selectedEvent.isConfirmed ? "success" : "primary"}
              className="confirm-btn"
              style={{ borderRadius: "10px" }}
              onClick={() =>
                handleConfirmSurgery(selectedEvent.phone, selectedEvent.uhid)
              }
              disabled={selectedEvent.isConfirmed}
            >
              <FeatherIcon
                icon={selectedEvent.isConfirmed ? "user-check" : "check-circle"}
                size={16}
                className="me-1"
              />{" "}
              {selectedEvent.isConfirmed
                ? `Admitted (${selectedEvent.admissionNo})`
                : "Confirm Admission"}
            </Button>

            {!selectedEvent.isConfirmed && (
              <Button
                variant="danger"
                className="btn-sm border-0 mt-1"
                style={{ borderRadius: "10px" }}
                onClick={handleCancelSurgery}
              >
                <FeatherIcon icon="x-circle" size={14} className="me-1" />{" "}
                Cancel Admission
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        minHeight: "100vh",
        padding: "10px"
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
    font-weight: 700; 
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
    width: 9px; 
    height: 9px; 
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
    z-index: 10000 !important; 
    background: #fff;
    border: 1px solid #ccc;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.rbc-row-segment .rbc-show-more {
    margin-top: 2px;
    display: block;
    text-align: center;
}

.rbc-month-row {
    overflow: visible !important;
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
    width: 165px; 
    white-space: nowrap;
    color: #575d66ff;
    font-weight: 600;
    margin-bottom: 0;
    margin-right: 10px;
}

.data-item-inline label svg { margin-right: 9px; }

.confirm-btn {
    background-color: #1eb3caff;
    border: none;
    padding: 10px;
    font-weight: 600;
}

.confirm-btn:hover {
    background-color: #178aaeff;
}

.day-list-container {
    background: #fff;
    border-radius: 12px;
    padding: 10px;
}

.appointment-list-scroll {
    max-height: 400px;
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
    background: #00bcd4;
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
    border: 1px solid #00bcd4;
    box-shadow: 0 4px 6px -1px rgba(0, 188, 212, 0.1);
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
    background-color: #00bcd4;
    color: white;
    border-color: #00bcd4;
}
        `}</style>
      <PageBreadcrumb pagename="IPD Dashboard" />
      <div className="theme-body">
        <Container fluid>
          <div className="dashboard-header-bar" style={{ marginTop: "10px" }}>
            <Row className="align-items-center">
              <Col lg={7}>
                <div className="legend-title">
                  <h4 className="fw-bold mb-10">
                    {viewMode === "list" ? (
                      "Today's Surgery Overview"
                    ) : (
                      <>
                        Patient Surgery Calendar for{" "}
                        {moment(selectedDate).format("MMMM YYYY")}
                      </>
                    )}
                  </h4>
                </div>
                <div
                  className="d-flex align-items-center flex-nowrap"
                  style={{ gap: "6px", position: "relative", zIndex: 2 }}
                >
                  <ColorLegend
                    name="Surgery"
                    type="surgery"
                    count={counts}
                    bgColor="#00bcd4"
                  />
                </div>
              </Col>
              <Col lg={5}>
                <div className="d-flex align-items-end justify-content-lg-end gap-3 mt-3 mt-lg-0">
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
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      value={selectedDoctorId}
                      style={{
                        width: "200px",
                        height: "30px",
                        borderRadius: "8px",
                        border: "1px solid #00bcd4",
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
                      setActiveStatusFilter(null);
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
                  }}
                >
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="info" />
                    </div>
                  ) : viewMode === "calendar" ? (
                    <Calendar
                      ref={calendarRef}
                      localizer={localizer}
                      events={filteredSurgeries}
                      date={selectedDate}
                      view={currentView}
                      onNavigate={handleCalendarNavigate}
                      onSelectEvent={handleEventClick}
                      onView={handleCalendarView}
                      eventPropGetter={eventStyleGetter}
                      components={{ event: CalendarCustomEvent }}
                      style={{ height: 580 }}
                      popup={true}
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
                                border: "1.5px solid #00bcd4",
                                backgroundColor: "#fdfdfd",
                                width: "220px",
                              }}
                            />
                          </div>
                          <Badge bg="info" className="p-6">
                            {
                              filteredSurgeries.filter((s) =>
                                moment(s.start).isSame(selectedDate, "day"),
                              ).length
                            }{" "}
                            Surgeries
                          </Badge>
                        </div>
                      </div>

                      <SimpleBar style={{ maxHeight: "400px" }}>
                        <div className="appointment-list-scroll">
                          {filteredSurgeries
                            .filter((s) => {
                              const isSameDay = moment(s.start).isSame(
                                selectedDate,
                                "day",
                              );
                              if (!isSameDay) return false;

                              const term = daySearchTerm.toLowerCase();
                              const nameMatch = s.patientName
                                ?.toLowerCase()
                                .includes(term);
                              const phoneMatch = s.phone
                                ?.toLowerCase()
                                .includes(term);

                              return nameMatch || phoneMatch;
                            })
                            .sort((a, b) => moment(a.start).diff(moment(b.start)))
                            .map((s, index) => {
                              const typeColor = s.isConfirmed ? "#10b981" : "#f59e0b";
                              const isActive = selectedEvent?.uhid === s.uhid;
                              const listStatus = s.isConfirmed
                                ? { text: "Admitted", color: "#10b981", bg: "#ecfdf5" }
                                : { text: "Pending", color: "#d97706", bg: "#fef3c7" };

                              return (
                                <div
                                  key={s.uhid || index}
                                  className={`appointment-item ${isActive ? "active" : ""}`}
                                  onClick={() => handleEventClick(s)}
                                  style={{ position: "relative" }}
                                >
                                  <div className="time-slot">{s.time}</div>
                                  <div
                                    className="type-indicator mx-1"
                                    style={{
                                      width: "4px",
                                      height: "35px",
                                      backgroundColor: typeColor,
                                      borderRadius: "2px",
                                    }}
                                  ></div>
                                  <div className="patient-info">
                                    <div className="patient-name-text">
                                      {s.patientName}
                                    </div>
                                    <div className="doctor-info-text">
                                      <FeatherIcon
                                        icon="activity"
                                        size={12}
                                        className="me-1"
                                      />
                                      {s.doctorName}
                                    </div>
                                  </div>
                                  {listStatus && (
                                    <div className="d-flex align-items-center me-3">
                                      <span
                                        style={{
                                          backgroundColor: listStatus.bg,
                                          color: listStatus.color,
                                          border: `1px solid ${listStatus.color}40`,
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
                                        {listStatus.text}
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
                      </SimpleBar>

                      {filteredSurgeries.filter((s) =>
                        moment(s.start).isSame(selectedDate, "day"),
                      ).length === 0 && (
                          <div className="text-center py-5">
                            <FeatherIcon
                              icon="calendar"
                              size={50}
                              className="text-muted mb-3 opacity-25"
                            />
                            <p className="text-muted">
                              No surgeries scheduled for this day.
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
                className="shadow-sm border-0"
                style={{
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "2px solid rgb(77, 208, 225)",
                }}
              >
                <Card.Header
                  className="bg-white py-3 d-flex justify-content-center align-items-center"
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
                        padding: "7px",
                      }}
                    >
                      Surgery Details
                    </h5>
                  </div>
                </Card.Header>
                <Card.Body>
                  <SurgeryDetailsCard />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <Modal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        centered
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "#e0f7fa",
            borderBottom: "2px solid #00bcd4",
            padding: "10px 15px",
          }}>
          <Modal.Title
            style={{ color: "#00838f", fontWeight: "bold", fontSize: "16px" }}
          ><FeatherIcon
              className="me-2"
              icon="trash"
              size="17"
              style={{ color: "#1a5b61ff" }}
            />Reason of Cancellation <span className="text-danger">*</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-1 pt-0">
          <Form style={{ padding: "10px" }} onSubmit={handleCancelSubmit}>
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={4}
                value={cancelComment}
                onChange={(e) => setCancelComment(e.target.value)}
                placeholder="Enter the cancellation reason..."
                className="p-5"
                style={{
                  border: "1px solid #008cc8ff",
                  borderRadius: "10px",
                  marginBottom: "10px",
                }}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button
                variant="danger"
                type="submit"
                className="fw-bold px-4"
                style={{
                  borderRadius: "10px",
                  fontSize: "12px",
                  padding: "10px",
                }}>
                Confirm & Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
