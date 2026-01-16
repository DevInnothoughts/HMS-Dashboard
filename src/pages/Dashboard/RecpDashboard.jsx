import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
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
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

const BASE_URL = "http://localhost:5100/api";

export default function ReceptionistDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [currentLocation, setCurrentLocation] = useState("default");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelComment, setCancelComment] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
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

  // const counts = useMemo(() => {
  //   return appointments.reduce(
  //     (acc, event) => {
  //       const type = (event.patientType || "Other").toUpperCase();
  //       acc[type] = (acc[type] || 0) + 1;
  //       return acc;
  //     },
  //     { New: 0, Follow: 0, Postoperative: 0, OTHER: 0 }
  //   );
  // }, [appointments]);

  const counts = useMemo(() => {
    const monthStart = moment(selectedDate).startOf('month');
    const monthEnd = moment(selectedDate).endOf('month');
    const visibleAppointments = appointments.filter(event => {
      const eventDate = moment(event.start);
      return eventDate.isSameOrAfter(monthStart, 'day') &&
        eventDate.isSameOrBefore(monthEnd, 'day');
    });

    return visibleAppointments.reduce(
      (acc, event) => {
        const type = (event.patientType || "Other").toUpperCase();
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      { New: 0, Follow: 0, Postoperative: 0, OTHER: 0 }
    );
  }, [appointments, selectedDate]);

  const formatAppointments = useCallback((data) => {
    return data.map((app) => {
      const startTime = moment(
        moment(app.appointment_timestamp).format("YYYY-MM-DD") +
        " " +
        app.appointment_time,
        "YYYY-MM-DD HH:mm"
      );
      const endTime = startTime.clone().add(30, "minutes");

      return {
        title: `${app.appointment_time || "N/A"} — ${app.patient_name || "Patient"
          }`,
        start: startTime.toDate(),
        end: endTime.toDate(),
        phone: app.patient_phone,
        date: moment(app.appointment_timestamp).format("DD-MM-YYYY"),
        time: app.appointment_time,
        patientName: app.patient_name,
        doctorName: app.doctor_name,
        patientType: app.patient_type || "Other",
        status: app.status,
        note: app.note,
        confirmTime: app.confirm_time,
        patientid: app.patient_id,
        appointmentid: app.appointment_id,
        isConfirmed: app.confirm_time !== "0" && app.confirm_time !== 0,
      };
    });
  }, []);

  const fetchDropdowns = useCallback(async () => {
    if (currentLocation === "default") return;
    try {
      const url = `${BASE_URL}/V1/appointment/doctorDropdown?location=${currentLocation}`;
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
        let url = `${BASE_URL}/V1/appointment/listAppointments?from=${from}&to=${to}&location=${currentLocation}`;
        if (doctorId) url += `&doctor=${doctorId}`;

        const response = await fetch(url);
        const data = await response.json();
        if (data.statusCode === 200 && Array.isArray(data.data)) {
          let filteredData = data.data;
          if (doctorId) {
            filteredData = data.data.filter(
              (app) => String(app.doctor_id) === String(doctorId)
            );
          }
          const formattedEvents = formatAppointments(filteredData);
          setAppointments(formattedEvents);
        } else {
          setAppointments([]);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    },
    [currentLocation, currentView, formatAppointments]
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

  const handleCalendarNavigate = (newDate) => setSelectedDate(newDate);
  const handleCalendarView = (newView) => setCurrentView(newView);
  const handleDateChange = (e) =>
    setSelectedDate(moment(e.target.value, "YYYY-MM-DD").toDate());
  const handleDoctorChange = (e) => setSelectedDoctorId(e.target.value);
  const handleRefreshClick = () => setSelectedDate(new Date());

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleConfirm = async (appointmentId, patientType, phone) => {
    const result = await Swal.fire({
      title: "Confirm Arrival?",
      text: "Mark patient as arrived at the facility?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm Arrival",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: "btn btn-primary swal-clinical-btn",
        cancelButton: "btn btn-danger swal-clinical-btn me-2",
      },
    });
    if (!result.isConfirmed) return;
    try {
      const url = `${BASE_URL}/V1/appointment/confirmAppointment?location=${currentLocation}&appId=${appointmentId}&patientType=${patientType}&patientPhone=${phone}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      const resData = await response.json();
      if (resData.statusCode === 200) {
        Toast.fire({ icon: "success", title: "Arrival Confirmed" });
        setSelectedEvent((prev) => ({
          ...prev,
          confirmTime: moment().format("HH:mm"), // Sets a visual check-in time immediately
        }));
        await fetchAppointmentsForRange(selectedDate, selectedDoctorId);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelComment) return;
    try {
      const url = `${BASE_URL}/V1/appointment/delete/${selectedEvent.appointmentid}?location=${currentLocation}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancellationReason: cancelComment }),
      });
      if (response.ok) {
        Toast.fire({ icon: "success", title: "Cancelled" });
        fetchAppointmentsForRange(selectedDate, selectedDoctorId);
        setSelectedEvent(null);
        setShowCancelModal(false);
        setCancelComment("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const eventStyleGetter = useCallback((event) => {
    const colorMap = {
      New: "#000000",
      Follow: "#ff8000",
      Postoperative: "#8000ff",
      OTHER: "#ff0080",
    };
    return {
      style: {
        backgroundColor: colorMap[event.patientType.toUpperCase()] || "#000",
        borderRadius: "4px",
        border: "none",
        color: "white",
      },
    };
  }, []);

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

    const isConfirmed =
      selectedEvent.confirmTime &&
      selectedEvent.confirmTime !== "0" &&
      selectedEvent.confirmTime !== 0;
    const typeColor = eventStyleGetter({
      patientType: selectedEvent.patientType,
    }).style.backgroundColor;

    const statusTemplate = (rowData) => {
      // If confirm_time is not '0' or 0, the patient has arrived
      const isConfirmed =
        rowData.confirm_time !== "0" && rowData.confirm_time !== 0;
      return (
        <span className={isConfirmed ? "text-success fw-bold" : "text-muted"}>
          {isConfirmed ? "Patient Arrived" : "Pending"}
        </span>
      );
    };

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
              <FeatherIcon icon="calendar" size={14} />Apt Date:
            </label>
            <span className="data-value fw-bold">{selectedEvent.date}</span>
          </div>

          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="clock" size={14} /> Apt Time:
            </label>
            <span className="data-value fw-bold">{selectedEvent.time}</span>
          </div>
          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="tag" size={14} /> Type:
            </label>
            <span className="data-value">
              <Badge
                pill
                style={{
                  backgroundColor: typeColor,
                  fontSize: "10px",
                  padding: "8px 12px",
                }}
              >
                {selectedEvent.patientType.toUpperCase()}
              </Badge>
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
          {isConfirmed ? (
            <div
              className="alert alert-success d-flex align-items-center"
              style={{ borderRadius: "8px" }}
            >
              <FeatherIcon icon="check-circle" size={20} className="me-2" />
              <div>
                <strong>Patient Arrived</strong>
                <div style={{ fontSize: "12px", lineHeight: "14px" }}>
                  Checked in at: {selectedEvent.confirmTime}
                </div>
              </div>
            </div>
          ) : (
            <div className="d-grid gap-1">
              <Button
                variant="primary"
                className="confirm-btn"
                style={{ borderRadius: "10px" }}
                onClick={() =>
                  handleConfirm(
                    selectedEvent.appointmentid,
                    selectedEvent.patientType,
                    selectedEvent.phone
                  )
                }
              >
                <FeatherIcon icon="user-plus" size={16} className="me-1" />{" "}
                Confirm Appointment
              </Button>
              <Button
                variant="danger"
                className="btn-sm border-0 mt-1"
                style={{ borderRadius: "10px" }}
                onClick={() => setShowCancelModal(true)}
              >
                <FeatherIcon icon="slash" size={14} className="me-1" /> Cancel
                Appointment
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="themebody-wrap"
      style={{ background: "#f0f2f5", minHeight: "100vh" }}
    >
      <style>{`
                    /* --- 1. Layout & Stacking Contexts --- */
.sidebar-wrapper, 
.header-wrapper, 
.page-main-header { 
    z-index: 9999 !important; 
}

.theme-body { 
    position: relative; 
    z-index: 1; 
}

/* --- 2. Dashboard Header & Legend --- */
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
    letter-spacing: 0.5px; 
    text-transform: uppercase;
}

.legend-item { 
    display: flex; 
    align-items: center; 
    margin-right: 22px; 
    font-size: 13px; 
    font-weight: 600; 
    color: #295261ff; 
}

.dot { 
    width: 9px; 
    height: 9px; 
    border-radius: 50%; 
    margin-right: 6px; 
}

/* --- 3. Calendar Specific Fixes --- */
.rbc-calendar { 
    background: #fff; 
    border-radius: 12px; 
    padding: 3px;
    position: relative;
    z-index: 1;
    overflow: visible !important; /* Critical to prevent clipping popups */
}

.rbc-header { 
    padding: 12px 0 !important; 
    font-weight: 700 !important; 
    color: #454b53ff !important; 
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

/* The popup that appears when clicking '+ more' */
.rbc-overlay { 
    position: absolute !important;
    z-index: 10000 !important; /* Must be higher than dashboard-header-bar */
    background: #fff;
    border: 1px solid #ccc;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

/* --- 4. Patient & Clinical Data Styling --- */
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

/* --- 5. Notes Section --- */
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

/* Optional: Slight padding adjustment for the event rows */
.rbc-month-row {
    overflow: visible !important;
}
                `}</style>
      <PageBreadcrumb pagename="Receptionist Dashboard" />
      <div className="theme-body">
        <Container fluid>
          <div className="dashboard-header-bar" style={{ marginTop: "10px" }}>
            <Row className="align-items-center">
              <Col lg={7}>
                <div className="legend-title">
                  {/* <h4 className="fw-bold mb-10">Patient Appointment Live Statistics</h4> */}
                  <h4 className="fw-bold mb-10">
                    Patient Appointment Statistics for {moment(selectedDate).format("MMMM YYYY")}
                  </h4>
                </div>
                <div className="d-flex align-items-center flex-wrap">
                  <div className="legend-item">
                    <span className="dot" style={{ background: "#000" }}></span>{" "}
                    New <span className="cnt">({counts.NEW})</span>
                  </div>
                  <div className="legend-item">
                    <span
                      className="dot"
                      style={{ background: "#ff8000" }}
                    ></span>{" "}
                    Follow-up <span className="cnt">({counts.FOLLOW})</span>
                  </div>
                  <div className="legend-item">
                    <span
                      className="dot"
                      style={{ background: "#8000ff" }}
                    ></span>{" "}
                    Post-Operative{" "}
                    <span className="cnt">({counts.POSTOPERATIVE})</span>
                  </div>
                  <div className="legend-item">
                    <span
                      className="dot"
                      style={{ background: "#ff0080" }}
                    ></span>{" "}
                    Other <span className="cnt">({counts.OTHER})</span>
                  </div>
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

                  <div className="d-flex flex-column">
                    <label
                      className="text-muted fw-bold mb-4"
                      style={{ fontSize: "13px" }}
                    >
                      Filter by Doctor:
                    </label>
                    <Form.Select
                      onChange={handleDoctorChange}
                      value={selectedDoctorId}
                      style={{
                        width: "200px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        fontSize: "11px"
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
                    variant="primary"
                    onClick={handleRefreshClick}
                    style={{
                      height: "27px",
                      width: "90px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 0,
                      alignSelf: "flex-end"
                    }}
                  >
                    <FeatherIcon icon="refresh-cw" size={12} className="me-1" />Refresh
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
                <Card.Body className="p-3" style={{ border: "2px solid rgb(77, 208, 225)", borderRadius: "10px" }}>
                  <Calendar
                    ref={calendarRef}
                    localizer={localizer}
                    events={appointments}
                    date={selectedDate}
                    view={currentView}
                    onNavigate={handleCalendarNavigate}
                    onSelectEvent={handleEventClick}
                    onView={handleCalendarView}
                    eventPropGetter={eventStyleGetter}
                    components={{ event: CustomEvent }}
                    style={{ height: 770 }}
                    popup={true}
                    views={{
                      month: true, 
                      week: true, 
                      day: true  
                    }}
                    length={3}
                    maxEvents={3}
                  />
                </Card.Body>
              </Card>
            </Col>

            <Col xxl={4} xl={4} lg={12}>
              <Card
                className="shadow-sm sticky-sidebar"
                style={{ borderRadius: "10px", overflow: "hidden", border: "2px solid rgb(77, 208, 225)" }}
              >
                <Card.Header className="bg-white py-5 d-flex justify-content-center align-items-center" style={{ borderBottom: "1px solid rgb(77, 208, 225)" }} >
                  <div className="d-flex align-items-center justify-content-center w-100">
                    <div
                      className="d-flex align-items-center justify-content-center me-2"
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
                      style={{ color: "#3f444bff", whiteSpace: "nowrap", fontSize: "16px" }}
                    >
                      Appointment Detail
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

      <Modal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="h5 fw-bold" style={{ color: "#0f7fa4ff" }}>
            CANCELLATION REASON
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
                placeholder="State the reason for cancellation (e.g., patient request, reschedule)..."
                className="p-5 mb-10"
                style={{ border: "1px solid #008cc8ff'", borderRadius: "10px" }}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button
                variant="danger"
                type="submit"
                className="fw-bold px-4"
                style={{ borderRadius: "10px", padding: "10px 0" }}
              >
                Confirm Cancellation
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
