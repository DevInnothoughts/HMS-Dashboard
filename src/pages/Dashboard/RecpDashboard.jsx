// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import { Link } from "react-router-dom";
// import FeatherIcon from "feather-icons-react";
// import { Row, Col, Card, Container, Form, Button, Modal, Spinner } from "react-bootstrap";
// import PageBreadcrumb from "../../components/PageBreadcrumb";
// import { Calendar, momentLocalizer } from 'react-big-calendar';
// import moment from 'moment';
// import Swal from 'sweetalert2';

// const localizer = momentLocalizer(moment);

// const CustomEvent = ({ event }) => (
//     <div style={{ fontSize: '11px', lineHeight: '1.2', padding: '2px' }}>
//         <strong>{event.time}</strong>
//         <div style={{
//             whiteSpace: 'nowrap',
//             overflow: 'hidden',
//             textOverflow: 'ellipsis',
//             fontWeight: '500'
//         }}>
//             {event.patientName}
//         </div>
//     </div>
// );

// const Toast = Swal.mixin({
//     toast: true,
//     position: 'top-end',
//     showConfirmButton: false,
//     timer: 3000,
//     timerProgressBar: true,
//     didOpen: (toast) => {
//         toast.addEventListener('mouseenter', Swal.stopTimer)
//         toast.addEventListener('mouseleave', Swal.resumeTimer)
//     }
// });

// function decodeJwt(token) {
//     if (!token) return null;
//     try {
//         const base64Url = token.split('.')[1];
//         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//         const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
//         return JSON.parse(jsonPayload);
//     } catch (e) {
//         return null;
//     }
// }

// const BASE_URL = "http://localhost:5100/api";

// export default function ReceptionistDashboard() {
//     const [appointments, setAppointments] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [doctors, setDoctors] = useState([]);
//     const [selectedDoctorId, setSelectedDoctorId] = useState('');
//     const [currentLocation, setCurrentLocation] = useState('default');
//     const [selectedDate, setSelectedDate] = useState(new Date());
//     const [currentView, setCurrentView] = useState('month');
//     const [showCancelModal, setShowCancelModal] = useState(false);
//     const [cancelComment, setCancelComment] = useState('');
//     const [selectedEvent, setSelectedEvent] = useState(null);
//     const calendarRef = React.useRef(null);

//     useEffect(() => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             const payload = decodeJwt(token);
//             if (payload && payload.jobLocation) {
//                 setCurrentLocation(payload.jobLocation);
//             }
//         }
//     }, []);

//     const counts = useMemo(() => {
//         return appointments.reduce((acc, event) => {
//             const type = (event.patientType || 'Other').toUpperCase();
//             acc[type] = (acc[type] || 0) + 1;
//             return acc;
//         }, { NEW: 0, FOLLOW: 0, POSTOPERATIVE: 0, OTHER: 0 });
//     }, [appointments]);

//     const formatAppointments = useCallback((data) => {
//         return data.map(app => {

//             const startTime = moment(
//                 moment(app.appointment_timestamp).format("YYYY-MM-DD") + " " + app.appointment_time,
//                 "YYYY-MM-DD HH:mm"
//             );

//             const endTime = startTime.clone().add(30, 'minutes');

//             return {
//                 title: `${app.appointment_time || 'N/A'} — ${app.patient_name || 'Patient'}`,
//                 start: startTime.toDate(),
//                 end: endTime.toDate(),
//                 phone: app.patient_phone,
//                 date: moment(app.appointment_timestamp).format('DD-MM-YYYY'),
//                 time: app.appointment_time,
//                 patientName: app.patient_name,
//                 doctorName: app.doctor_name,
//                 patientType: app.patient_type || 'Other',
//                 status: app.status,
//                 note: app.note,
//                 confirmTime: app.confirm_time,
//                 patientid: app.patient_id,
//                 appointmentid: app.appointment_id,
//                 isConfirmed: app.confirm_time !== '0' && app.confirm_time !== 0,
//             };
//         });
//     }, []);

//     const fetchDropdowns = useCallback(async () => {
//         if (currentLocation === 'default') return;
//         try {
//             const url = `${BASE_URL}/V1/appointment/doctorDropdown?location=${currentLocation}`;
//             const response = await fetch(url);
//             const data = await response.json();
//             if (data.statusCode === 200 && Array.isArray(data.data)) {
//                 setDoctors(data.data);
//             }
//         } catch (error) {
//             console.error("Error fetching doctors:", error);
//         }
//     }, [currentLocation]);

//     const fetchAppointmentsForRange = useCallback(async (dateToFetch, doctorId) => {
//         if (currentLocation === 'default') return;

//         setLoading(true);

//         const targetMoment = moment(dateToFetch);
//         let start, end;

//         if (currentView === 'month') {
//             start = targetMoment.clone().startOf('month').toDate();
//             end = targetMoment.clone().endOf('month').toDate();
//         } else if (currentView === 'week') {
//             start = targetMoment.clone().startOf('week').toDate();
//             end = targetMoment.clone().endOf('week').toDate();
//         } else {
//             start = targetMoment.clone().startOf('day').toDate();
//             end = targetMoment.clone().endOf('day').toDate();
//         }

//         try {
//             const from = moment(start).format('DD-MM-YYYY');
//             const to = moment(end).format('DD-MM-YYYY');

//             let url = `${BASE_URL}/V1/appointment/listAppointments?from=${from}&to=${to}&location=${currentLocation}`;
//             if (doctorId) {
//                 url += `&doctor=${doctorId}`;
//             }

//             const response = await fetch(url);
//             const data = await response.json();
//             console.log(data);
//             if (data.statusCode === 200 && Array.isArray(data.data)) {
//                 let filteredData = data.data;
//                 if (doctorId) {
//                     filteredData = data.data.filter(app => String(app.doctor_id) === String(doctorId));
//                 }

//                 const formattedEvents = formatAppointments(filteredData);
//                 setAppointments(formattedEvents);
//             } else {
//                 setAppointments([]);
//                 Swal.fire({
//                     icon: 'error',
//                     title: 'Fetch Failed',
//                     text: 'Failed to fetch appointment data.'
//                 });
//             }
//         } catch (error) {
//             console.error("Error fetching appointments:", error);
//             setAppointments([]);
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Error',
//                 text: 'An error occurred while loading dashboard data.'
//             });
//         } finally {
//             setLoading(false);
//         }
//     }, [currentLocation, currentView, formatAppointments]);

//     useEffect(() => {
//         if (currentLocation !== 'default') {
//             fetchAppointmentsForRange(selectedDate, selectedDoctorId);
//         }
//     }, [selectedDate, selectedDoctorId, currentLocation, currentView, fetchAppointmentsForRange]);

//     useEffect(() => {
//         fetchDropdowns();
//     }, [fetchDropdowns]);

//     const handleCalendarNavigate = (newDate, view, action) => {
//         setSelectedDate(newDate);
//     };

//     const handleCalendarView = (newView) => {
//         setCurrentView(newView);
//     }

//     const handleDateChange = (e) => {
//         const newMomentDate = moment(e.target.value, "YYYY-MM-DD").toDate();
//         setSelectedDate(newMomentDate);
//     };

//     const handleDoctorChange = (e) => {
//         setSelectedDoctorId(e.target.value);
//     };

//     const handleRefreshClick = () => {
//         setSelectedDate(new Date());
//     };

//     const handleEventClick = (event) => {
//         setSelectedEvent({
//             title: event.title,
//             date: event.date,
//             phone: event.phone,
//             time: event.time,
//             patientName: event.patientName,
//             doctorName: event.doctorName,
//             patientType: event.patientType,
//             note: event.note,
//             patientid: event.patientid,
//             appointmentid: event.appointmentid,
//             confirmTime: event.confirmTime,
//         });
//     };

//     const handleConfirm = async (appointmentId, patientType, phone) => {
//         const result = await Swal.fire({
//             title: 'Are you sure?',
//             text: "Confirmation: The patient has come to the clinic...!",
//             icon: 'question',
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Yes, confirm it!'
//         });

//         if (!result.isConfirmed) return;

//         try {
//             const url = `${BASE_URL}/V1/appointment/confirmAppointment?location=${currentLocation}&appId=${appointmentId}&patientType=${patientType}&patientPhone=${phone}`;
//             const response = await fetch(url, {
//                 method: "PUT",
//                 headers: { "Content-Type": "application/json" },
//             });
//             const result = await response.json();
//             console.log(result);
//             if (!response.ok || result.statusCode !== 200) {
//                 Swal.fire({
//                     icon: 'error',
//                     title: 'Failed',
//                     text: 'Failed to confirm appointment!'
//                 });
//                 return;
//             }

//             Toast.fire({
//                 icon: 'success',
//                 title: 'Appointment confirmed successfully'
//             });

//             await fetchAppointmentsForRange(selectedDate, selectedDoctorId);
//         } catch (error) {
//             console.error("Confirm error:", error);
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Error',
//                 text: 'An error occurred during confirmation.'
//             });
//         }
//     };

//     const handleCancelSubmit = async (e) => {
//         e.preventDefault();

//         const appointmentIdToDelete = selectedEvent?.appointmentid;
//         const cancellationReason = cancelComment;

//         if (!appointmentIdToDelete) {
//             console.error("Missing appointment ID for cancellation.");
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Error',
//                 text: 'Cannot process cancellation. Appointment ID is missing.'
//             });
//             return;
//         }

//         if (!cancellationReason) {
//             Swal.fire({
//                 icon: 'warning',
//                 title: 'Reason Required',
//                 text: 'Please enter the reason for cancellation.'
//             });
//             return;
//         }

//         try {
//             const url = `${BASE_URL}/V1/appointment/delete/${appointmentIdToDelete}?location=${currentLocation}`;
//             const response = await fetch(url, {
//                 method: "DELETE",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ cancellationReason })
//             });

//             if (response.ok) {
//                 Toast.fire({
//                     icon: 'success',
//                     title: 'Appointment successfully cancelled'
//                 });

//                 fetchAppointmentsForRange(selectedDate, selectedDoctorId);
//                 setSelectedEvent(null);
//                 setShowCancelModal(false);
//                 setCancelComment("");
//             } else {
//                 const errorData = await response.json();
//                 Swal.fire({
//                     icon: 'error',
//                     title: 'Cancellation Failed',
//                     text: errorData.message || 'Failed to cancel appointment.'
//                 });
//             }
//         } catch (error) {
//             console.error("Network Error:", error);
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Error',
//                 text: 'An error occurred while cancelling the appointment.'
//             });
//         }
//     };

//     const ColorLegend = ({ name, count, bgColor }) => (
//         <div style={{ display: 'inline-flex', alignItems: 'center', marginRight: '20px' }}>
//             <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: bgColor, border: '1px solid #ccc', marginRight: '5px' }}></div>
//             <p style={{ display: 'inline', margin: 0, fontSize: '14px' }}>
//                 {name} <b>({count})</b>
//             </p>
//         </div>
//     );

//     const eventStyleGetter = useCallback((event) => {
//         const colorMap = {
//             NEW: "#000000",
//             FOLLOW: "#ff8000",
//             POSTOPERATIVE: "#8000ff",
//             OTHER: "#ff0080"
//         };

//         const backgroundColor = colorMap[event.patientType] || "#000";

//         return {
//             style: {
//                 backgroundColor,
//                 color: "#fff",
//                 borderRadius: "3px",
//                 border: '1px solid #ddd',
//             },
//         };
//     }, []);

//     const AppointmentDetailsCard = () => {
//         if (!selectedEvent) {
//             return <p className="p-3">Select an appointment from the calendar to view details.</p>;
//         }
//         console.log(selectedEvent);
//         const isConfirmed = selectedEvent.confirmTime !== '0' && selectedEvent.confirmTime !== 0;

//         return (
//             <div className="p-3" style={{ lineHeight: '30px' }}>
//                 <span className='font-weight-bold'>Patient Name</span>: <span className='text-danger font-weight-bold'>{selectedEvent.patientName || selectedEvent.title.split('—')[1]?.trim()}</span><br />
//                 <span className='font-weight-bold'>Appointment Date</span>: <span className='text-danger font-weight-bold'>{selectedEvent.date}</span><br />
//                 <span className='font-weight-bold'>Patient Phone No.</span>: <span className='text-danger font-weight-bold'>{selectedEvent.phone}</span><br />
//                 <span className='font-weight-bold'>Appointment Time</span>: <span className='text-danger font-weight-bold'>{selectedEvent.time}</span><br />
//                 <span className='font-weight-bold'>Patient Type</span>: <span className='text-danger font-weight-bold'>{selectedEvent.patientType}</span><br />
//                 <span className='font-weight-bold'>Note</span>: {selectedEvent.note}<br />

//                 <div className="mt-3">
//                     {isConfirmed ? (
//                         <div className="alert alert-success d-flex align-items-center" style={{ borderRadius: '8px' }}>
//                             <FeatherIcon icon="check-circle" size={20} className="me-2" />
//                             <div>
//                                 <strong>Confirmed</strong>
//                                 <div style={{ fontSize: '12px', lineHeight: '14px' }}>
//                                     Checked in at: {selectedEvent.confirmTime}
//                                 </div>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="d-flex flex-wrap" style={{ borderRadius: "10px" }}>
//                             <Button
//                                 variant="primary"
//                                 onClick={() => handleConfirm(selectedEvent.appointmentid, selectedEvent.patientType, selectedEvent.phone)}
//                                 title="Confirm"
//                                 style={{ borderRadius: "10px" }}
//                                 className="me-2 mb-2"
//                             >
//                                 <FeatherIcon icon="check" size={16} /> Confirm Arrival
//                             </Button>

//                             <Button
//                                 style={{ borderRadius: "10px" }}
//                                 variant="danger"
//                                 onClick={() => setShowCancelModal(true)}
//                                 title="Cancel"
//                                 className=" mb-2"
//                             >
//                                 <FeatherIcon icon="trash-2" size={16} /> Cancel
//                             </Button>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div className="themebody-wrap">
//             <style>
//                 {`
//             .rbc-overlay {
//                 margin-top: -10px;
//                 max-height: 400px;
//                 overflow-y: auto;
//                 width: 250px;
//                 z-index: 1050;
//                 background: white;
//                 border: 1px solid #ccc;
//                 padding: 10px;
//                 box-shadow: 0 5px 15px rgba(0,0,0,0.2);
//             }
//             `}
//             </style>
//             <PageBreadcrumb pagename="Reception Dashboard" />
//             <div className="theme-body">
//                 <Container fluid className="cdxuser-profile">
//                     <Row>
//                         <Col xxl={12}>
//                             <Row className="align-items-center">
//                                 <Col lg={6} md={12}>
//                                     <div className="d-flex align-items-center controls">
//                                         <Form.Control
//                                             type="date"
//                                             placeholder="mm/dd/yyyy"
//                                             value={moment(selectedDate).format("YYYY-MM-DD")}
//                                             onChange={handleDateChange}
//                                             style={{ width: 'auto', marginRight: '10px' }}
//                                         />

//                                         <Form.Select onChange={handleDoctorChange} value={selectedDoctorId} style={{ width: 'auto', marginRight: '10px' }}>
//                                             <option value="">ALL DOCTORS</option>
//                                             {doctors.map(doc => (
//                                                 <option key={doc.doctor_id} value={doc.doctor_id}>{doc.name}</option>
//                                             ))}
//                                         </Form.Select>

//                                         <Button className="dashbutton" variant="primary" onClick={handleRefreshClick} style={{ fontSize: "13px", borderRadius: "10px", padding: "8px 10px" }} >
//                                             <FeatherIcon icon="refresh-ccw" size={12} className="me-1" />Refresh
//                                         </Button>
//                                     </div>
//                                 </Col>
//                             </Row>
//                         </Col>
//                         <Col xs={12} className="mb-5" style={{ marginLeft: "10px", marginTop: "10px" }}>
//                             <div className="d-flex flex-wrap justify-content-start">
//                                 <ColorLegend name="New Patient" count={counts.NEW} bgColor="#000000" />
//                                 <ColorLegend name="Follow Patient" count={counts.FOLLOW} bgColor="#ff8000" />
//                                 <ColorLegend name="Postoperative Patient" count={counts.POSTOPERATIVE} bgColor="#8000ff" />
//                                 <ColorLegend name="Other Patient" count={counts.OTHER} bgColor="#ff0080" />
//                             </div>
//                         </Col>
//                         <Col xxl={8} xl={12} >
//                             <Card>
//                                 <Card.Header className="mb-10" style={{ backgroundColor: "#67c5cfff", }} ><h4 className="m-0" style={{ color: "#1a5b61ff", fontWeight: "600", fontSize: "1.25rem" }}><FeatherIcon icon="calendar" size={18} className="me-2" />CALENDAR SCHEDULE</h4></Card.Header>
//                                 <Card.Body style={{ minHeight: '500px', padding: 0 }}>
//                                     {loading ? (
//                                         <div className="d-flex justify-content-center align-items-center h-100"><Spinner animation="border" /></div>
//                                     ) : (
//                                         <Calendar
//                                             ref={calendarRef}
//                                             localizer={localizer}
//                                             events={appointments}
//                                             date={selectedDate}
//                                             view={currentView}
//                                             onNavigate={handleCalendarNavigate}
//                                             onSelectEvent={handleEventClick}
//                                             onView={handleCalendarView}
//                                             startAccessor="start"
//                                             endAccessor="end"
//                                             eventPropGetter={eventStyleGetter}
//                                             views={['month', 'week', 'day', 'agenda']}
//                                             defaultView='month'
//                                             components={{
//                                                 event: CustomEvent
//                                             }}
//                                             step={15}
//                                             timeslots={4}
//                                             style={{ height: 800 }}
//                                             dayLayoutAlgorithm={'no-overlap'}
//                                             popup={true}
//                                         />
//                                     )}
//                                 </Card.Body>
//                             </Card>
//                         </Col>

//                         <Col xxl={4} xl={12}>
//                             <Card>
//                                 <Card.Header style={{ backgroundColor: "#67c5cfff" }}><h4 style={{ color: "#1a5b61ff", fontWeight: "600", fontSize: "1.25rem" }}><FeatherIcon icon="info" size={18} className="me-2" />APPOINTMENT DETAILS</h4></Card.Header>
//                                 <Card.Body>
//                                     <AppointmentDetailsCard />
//                                 </Card.Body>
//                             </Card>
//                         </Col>
//                     </Row>
//                 </Container>
//             </div>

//             <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
//                 <Modal.Header closeButton>
//                     <Modal.Title>REASON OF CANCELLATION</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body>
//                     <Form onSubmit={handleCancelSubmit}>
//                         <Form.Group className="mb-3">
//                             <Form.Control
//                                 as="textarea"
//                                 rows={4}
//                                 name="cancelComment"
//                                 value={cancelComment}
//                                 onChange={(e) => setCancelComment(e.target.value)}
//                                 placeholder="Please Enter the Cancellation details..."
//                             />
//                         </Form.Group>
//                         <input type="hidden" name="cancelid" value={selectedEvent?.appointmentid || ''} />
//                         <Button variant="danger" type="submit" className="formBtn">
//                             Submit
//                         </Button>
//                     </Form>
//                 </Modal.Body>
//             </Modal>
//         </div>
//     );
// }

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

  const counts = useMemo(() => {
    return appointments.reduce(
      (acc, event) => {
        const type = (event.patientType || "Other").toUpperCase();
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      { NEW: 0, FOLLOW: 0, POSTOPERATIVE: 0, OTHER: 0 }
    );
  }, [appointments]);

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
        title: `${app.appointment_time || "N/A"} — ${
          app.patient_name || "Patient"
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
      NEW: "#000000",
      FOLLOW: "#ff8000",
      POSTOPERATIVE: "#8000ff",
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
        <div className="text-center py-10">
          <FeatherIcon
            icon="layers"
            size={48}
            className="text-muted opacity-25 mb-3"
          />
          <p className="text-muted" style={{ padding: "10px" }}>
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
              <FeatherIcon icon="user" size={14} /> Patient:
            </label>
            <span className="data-value fw-bold">
              {selectedEvent.patientName}
            </span>
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
              <FeatherIcon icon="clock" size={14} /> Time:
            </label>
            <span className="data-value fw-bold">{selectedEvent.time}</span>
          </div>

          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="calendar" size={14} /> Date:
            </label>
            <span className="data-value fw-bold">{selectedEvent.date}</span>
          </div>

          <div className="data-item-inline">
            <label>
              <FeatherIcon icon="phone" size={14} /> Contact:
            </label>
            <span className="data-value fw-bold">{selectedEvent.phone}</span>
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
                {/* CHANGE THIS LINE FROM "Confirmed" TO: */}
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
                    /* Legend & Filter Bar */
                    .dashboard-header-bar {
                        background: #fff; padding: 1px 2px; border-radius: 12px;
                        box-shadow: 0 40px 10px rgba(0,0,0,0.03); margin-bottom: 10px;
                        border: 1px solid #e1e4e8;
                    }
                        
                    .legend-title { font-size: 11px; text-transform: uppercase; color: #1eb3caff; font-weight: 800; margin-bottom: 10px; letter-spacing: 1px; }
                    .legend-item { display: flex; align-items: center; margin-right: 22px; font-size: 14px; font-weight: 600; color: #295261ff; }
                    .dot { width: 11px; height:11px; border-radius: 50%; margin-right: 6px; }
                    .cnt { font-size: 13px; color: #000000ff; margin-left: 4px; }

                    .rbc-calendar { background: #fff; border-radius: 12px; border: none !important; padding: 3px }
                    .rbc-header { padding: 12px 0 !important; font-weight: 700 !important; color: #454b53ff !important; border-bottom: 2px solid #f1f5f9 !important; }
                    .rbc-show-more { color: #016f69ff !important; background: #b0eff3ff !important; border-radius: 4px !important; font-weight: 900 !important; font-size: 11px !important; padding: 0px 6px !important; }

                    /* Center the header content */
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

.data-value{
   font-size: 14px;
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
    text-transform: none;
}

.data-item-inline label svg {
    margin-right: 9px;
    color: #575d66ff;
}

.data-item-inline span {
    font-weight: 500;
    flex: 1;
}

.note-section-modern label {
    display: flex;
    align-items: center;
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    margin-bottom: 8px;
}

.note-section-modern label svg { margin-right: 6px; }

.note-box-modern {
    background: #f8fafc;
    border: 1px solid #d0d8e3ff;
    padding: 5px;      
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.5;
    min-height: 60px;
    height: auto;    
    word-wrap: break-word;   
    word-break: break-word; 
    white-space: pre-wrap;  
}

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
                `}</style>
      <PageBreadcrumb pagename="Receptionist Dashboard" />
      <div className="theme-body">
        <Container fluid>
          <div className="dashboard-header-bar" style={{ marginTop: "10px" }}>
            <Row className="align-items-center">
              <Col lg={7}>
                <div className="legend-title">
                  <h4 className="fw-bold mb-10">Live Appointment Statistics</h4>
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
                      className="text-muted fw-bold mb-1"
                      style={{ fontSize: "14px" }}
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
                    style={{ height: "38px", alignSelf: "flex-end" }}
                  >
                    <FeatherIcon icon="refresh-cw" size={14} />
                  </Button>
                </div>
              </Col>
            </Row>
          </div>

          <Row>
            <Col xxl={8} xl={8} lg={12} className="mb-4">
              <Card
                className="border-0 shadow-sm"
                style={{ borderRadius: "15px" }}
              >
                <Card.Body className="p-3">
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
                    style={{ height: 750 }}
                    popup={true}
                  />
                </Card.Body>
              </Card>
            </Col>

            <Col xxl={4} xl={4} lg={12}>
              <Card
                className="border-0 shadow-sm sticky-sidebar"
                style={{ borderRadius: "15px", overflow: "hidden" }}
              >
                <Card.Header className="bg-white border-bottom py-5 d-flex justify-content-center align-items-center">
                  <div className="d-flex align-items-center justify-content-center w-100">
                    <div
                      className="d-flex align-items-center justify-content-center me-2"
                      style={{
                        background: "#e0f2fe",
                        width: "35px",
                        height: "35px",
                        borderRadius: "10px",
                        flexShrink: 0,
                      }}
                    >
                      <FeatherIcon
                        icon="clipboard"
                        size={19}
                        className="text-primary"
                      />
                    </div>
                    <h5
                      className="mb-0 fw-bold text-uppercase"
                      style={{ color: "#1e293b", whiteSpace: "nowrap" }}
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
