import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import { Row, Col, Card, Container, Form, Button, Modal, Spinner } from "react-bootstrap";
import PageBreadcrumb from "../../components/PageBreadcrumb";

// --- FULLCALENDAR IMPORTS (Required for Calendar View) ---
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import moment from 'moment';

// --- JWT DECODE UTILITY (Required for Location) ---
function decodeJwt(token) {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}
// --------------------------------------------------------

const BASE_URL = "http://localhost:5100/api"; 

export default function ReceptionistDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [currentLocation, setCurrentLocation] = useState('default');
  // State holds the date used to determine the month to fetch
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  
  // State for Modals and selected event details
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelComment, setCancelComment] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null); 
  const calendarRef = React.useRef(null);


  // --- Initial Load & JWT Location ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        const payload = decodeJwt(token);
        if (payload && payload.jobLocation) {
            setCurrentLocation(payload.jobLocation);
        }
    }
  }, []);

  // --- Appointment Counts for Legend ---
  const counts = useMemo(() => {
      return appointments.reduce((acc, event) => {
          // Use patientType from the formatted event data
          const type = event.patientType || 'Other'; 
          acc[type] = (acc[type] || 0) + 1;
          return acc;
      }, { New: 0, Follow: 0, Postoperative: 0, Other: 0 });
  }, [appointments]);


  // ------------------------- API Fetching -------------------------
  
  // Helper to format API response into calendar events
  const formatAppointments = useCallback((data) => {
    return data.map(app => ({
        // Title shown on the calendar
        title: `${app.appointment_time || 'N/A'} — ${app.patient_name || 'Patient'}`,

        // Full ISO timestamp for FullCalendar
        start: moment(
            moment(app.appointment_timestamp).format("YYYY-MM-DD") +
            " " +
            app.appointment_time,
            "YYYY-MM-DD HH:mm"
        ).toISOString(),

        // Details to show inside event click popup
        phone: app.patient_phone,
        date: moment(app.appointment_timestamp).format('DD-MM-YYYY'),
        time: app.appointment_time,

        patientName: app.patient_name,
        doctorName: app.doctor_name,
        patientType: app.patient_type || 'Other', // Ensure type exists
        status: app.status,
        note: app.note,
        confirmTime: app.confirm_time,

        // IDs
        patientid: app.patient_id,
        appointmentid: app.appointment_id,
        
        // Use patientType for styling FullCalendar events
        classNames: [app.patient_type || 'Other'],
        
    }));
}, []);


  const fetchDropdowns = useCallback(async () => {
    if (currentLocation === 'default') return;
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
  
  // New: Fetches all appointments for the calculated date range
  const fetchAllAppointments = useCallback(async (dateRange) => {
    const { start, end } = dateRange;
    if (currentLocation === 'default') return;

    setLoading(true);
    try {
        const from = moment(start).format('DD-MM-YYYY');
        const to = moment(end).format('DD-MM-YYYY');

        // URL without the 'doctor' parameter
        const url = `${BASE_URL}/V1/appointment/listAppointments?from=${from}&to=${to}&location=${currentLocation}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.statusCode === 200 && Array.isArray(data.data)) {
            const formattedEvents = formatAppointments(data.data);
            setAppointments(formattedEvents);
        } else {
             setAppointments([]);
        }
    } catch (error) {
        console.error("Error fetching all appointments:", error);
        setAppointments([]);
    } finally {
        setLoading(false);
    }
  }, [currentLocation, formatAppointments]);

  // Re-added: Fetches appointments for a specific doctor
  const fetchAppointments = useCallback(async (dateRange, doctorId) => {
    const { start, end } = dateRange;
    if (currentLocation === 'default' || !doctorId) return;

    setLoading(true);
    try {
        const from = moment(start).format('DD-MM-YYYY');
        const to = moment(end).format('DD-MM-YYYY');

        const url = `${BASE_URL}/V1/appointment/listAppointments?from=${from}&to=${to}&location=${currentLocation}&doctor=${doctorId}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.statusCode === 200 && Array.isArray(data.data)) { 
            const formattedEvents = formatAppointments(data.data);
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
  }, [currentLocation, formatAppointments]); 


  // Manual fetch handler triggered by the "Find" button or initial load
  const handleManualFetch = useCallback(() => {
    // Determine the target date based on the state. 
    // This state is updated either by the date picker or the calendar navigation.
    const targetMoment = moment(selectedDate, 'YYYY-MM-DD');
    
    // Ensure the calendar view focuses on the selected month
    if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.gotoDate(selectedDate);
    }
    
    // 1. Calculate the date range (start/end of month for the current target date)
    const dateRange = {
        start: targetMoment.clone().startOf('month').toDate(),
        end: targetMoment.clone().endOf('month').toDate(),
    };
    
    // 2. Call the appropriate fetch function
    if (selectedDoctorId) {
        fetchAppointments(dateRange, selectedDoctorId);
    } else {
        fetchAllAppointments(dateRange);
    }
  }, [selectedDate, selectedDoctorId, fetchAppointments, fetchAllAppointments]);


  // Initial load and dependency fetching
  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

  // Run initial fetch only when location FIRST becomes valid
  useEffect(() => {
    if (currentLocation !== "default") {
        // Use a short delay to ensure calendar has mounted and initialDate is set
        setTimeout(() => handleManualFetch(), 100); 
    }
  }, [currentLocation]); // Triggered only on location change


  // ------------------------- Action Handlers -------------------------

  const handleConfirm = async (appointmentId) => {
    if (!window.confirm("Confirmation: The patient has come to the clinic ...!")) {
        return;
    }

    try {
        const url = `${BASE_URL}/V1/appointment/confirm`;
        const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            AppointmentID: appointmentId,
            PatientType: selectedEvent.patientType,
            PatientID: selectedEvent.patientid
        })
        });

        const data = await response.json();
        if (data.statusCode === 200) {
        window.location.reload();
        }
    } catch (error) {
        console.error("Confirm error:", error);
    }
    }; 

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelComment) {
        alert("Please Enter the Cancellation details.");
        return;
    }

    try {
        const url = `${BASE_URL}/V1/appointment/cancel`;
        const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            cancelComment,
            cancelID: selectedEvent.appointmentid
        })
        });

        const data = await response.json();

        if (data.statusCode === 200) {
        setShowCancelModal(false);
        window.location.reload();
        }
    } catch (error) {
        console.error("Cancel error:", error);
    }
    };

 const handleEventClick = (clickInfo) => {
    const props = clickInfo.event.extendedProps;

    setSelectedEvent({
        title: clickInfo.event.title,     
        date: props.date,                 
        phone: props.phone,               
        time: props.time,                 
        
        patientName: props.patientName,
        doctorName: props.doctorName,
        patientType: props.patientType,

        note: props.note,

        patientid: props.patientid,
        appointmentid: props.appointmentid,
        confirmTime: props.confirmTime,
    });
};

  
  const handleDoctorChange = (e) => {
      setSelectedDoctorId(e.target.value);
  };

  const handleDateChange = (e) => {
      // Update the date state when the date picker changes
      setSelectedDate(e.target.value);
  };
  
  // The Find button now triggers the manual fetch and jumps the calendar view
  const handleFindClick = () => {
    if (!selectedDate) {
        alert('Please select a Date.');
        return;
    }
    handleManualFetch();
};


  // ------------------------- JSX RENDER HELPERS -------------------------

  const ColorLegend = ({ name, count, bgColor }) => (
      <div style={{ display: 'inline-flex', alignItems: 'center', marginRight: '20px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: bgColor, border: '1px solid #ccc', marginRight: '5px' }}></div>
          <p style={{ display: 'inline', margin: 0, fontSize: '14px' }}>
              {name} <b>({count})</b>
          </p>
      </div>
  );

  const AppointmentDetailsCard = () => {
    if (!selectedEvent) {
        return <p className="p-3">Select an appointment from the calendar to view details.</p>;
    }
    
    // Check confirmTime property
    const isConfirmed = selectedEvent.confirmTime !== '0' && selectedEvent.confirmTime !== 0;

    return (
        <div className="p-3" style={{ lineHeight: '30px' }}>
            {/* Display patientName */}
            <span className='font-weight-bold'>Patient Name</span>: <span className='text-danger font-weight-bold'>{selectedEvent.patientName || selectedEvent.title.split('—')[1]?.trim()}</span><br/>
            <span className='font-weight-bold'>Appointment Date</span>: <span className='text-danger font-weight-bold'>{selectedEvent.date}</span><br/>
            <span className='font-weight-bold'>Patient Phone No.</span>: <span className='text-danger font-weight-bold'>{selectedEvent.phone}</span><br/>
            <span className='font-weight-bold'>Appointment Time</span>: <span className='text-danger font-weight-bold'>{selectedEvent.time}</span><br/>
            <span className='font-weight-bold'>Patient Type</span>: <span className='text-danger font-weight-bold'>{selectedEvent.patientType}</span><br/>
            <span className='font-weight-bold'>Note</span>: {selectedEvent.note}<br/>
            
            <div className="mt-3 d-flex flex-wrap">
                <Button variant="primary" onClick={() => handleConfirm(selectedEvent.appointmentid)} disabled={isConfirmed} title="Confirm" className="me-2 mb-2">
                    <FeatherIcon icon="check" size={16} /> Confirm
                </Button>
                <Link to={`/edit-patient/${selectedEvent.patientid}`} className="me-2 mb-2">
                    <Button variant="info" disabled={isConfirmed}>
                        <FeatherIcon icon="edit" size={16} /> Edit Patient
                    </Button>
                </Link>
                <Button variant="danger" onClick={() => setShowCancelModal(true)} disabled={isConfirmed} title="Cancel" className="me-2 mb-2">
                    <FeatherIcon icon="trash-2" size={16} /> Cancel
                </Button>
                
                {isConfirmed && (
                    <Button variant="success" onClick={() => window.open(`//print-receipt-url/${selectedEvent.appointmentid}`)} title="Print" className="ms-0 ms-sm-2 mb-2">
                        <FeatherIcon icon="printer" size={16} /> Print
                    </Button>
                )}
            </div>
        </div>
    );
  };
  
  return (
    <div className="themebody-wrap">
      {/* Breadcrumb Start */}
      <PageBreadcrumb pagename={`RECEPTIONIST DASHBOARD (${currentLocation.toUpperCase()})`} />
      {/* Breadcrumb End */}
      
      {/* theme body start */}
      <div className="theme-body">
        <Container fluid className="cdxuser-profile">
          <Row>
            
            {/* ------------------------------------------------------------- */}
            {/* 1. DOCTOR SELECTOR / FIND / LEGEND ROW (FULL WIDTH) */}
            {/* ------------------------------------------------------------- */}
            <Col xxl={12} className="mb-4">
                <Row className="align-items-center">
                    {/* Selector & Find Button */}
                    <Col lg={6} md={12}>
                        <div className="d-flex align-items-center controls">
                            {/* Date Picker (Controls the month fetched) */}
                            <Form.Control 
                                type="date" 
                                placeholder="mm/dd/yyyy" 
                                value={selectedDate} 
                                onChange={handleDateChange}
                                style={{ width: 'auto', marginRight: '10px' }} 
                            />
                            
                            <Form.Select onChange={handleDoctorChange} value={selectedDoctorId} style={{ width: 'auto', marginRight: '10px' }}>
                                <option value="">ALL DOCTORS</option> 
                                {doctors.map(doc => (
                                    <option key={doc.doctor_id} value={doc.doctor_id}>{doc.name}</option>
                                ))}
                            </Form.Select>
                            
                            <Button variant="danger" onClick={handleFindClick}>
                                Find / Refresh
                            </Button>
                        </div>
                    </Col>

                    {/* Legend / Counts */}
                    <Col lg={6} md={12} className="mt-3 mt-lg-0">
                        <div className="d-flex justify-content-lg-end justify-content-start">
                            <ColorLegend name="New Patient" count={counts.New} bgColor="#000000" />
                            <ColorLegend name="Follow Patient" count={counts.Follow} bgColor="#ff8000" />
                            <ColorLegend name="Postoperative Patient" count={counts.Postoperative} bgColor="#8000ff" />
                            <ColorLegend name="Other Patient" count={counts.Other} bgColor="#ff0080" />
                        </div>
                    </Col>
                </Row>
            </Col>

            {/* ------------------------------------------------------------- */}
            {/* 2. CALENDAR (8 COL) AND DETAILS (4 COL) */}
            {/* ------------------------------------------------------------- */}
            <Col xxl={8} xl={12}> {/* Calendar takes 8 columns */}
                <Card>
                    <Card.Header><h4><FeatherIcon icon="calendar" size={18} className="me-2" />CALENDAR SCHEDULE</h4></Card.Header>
                    <Card.Body style={{ minHeight: '500px', padding: 0,  }}>
                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center h-100"><Spinner animation="border" /></div>
                        ) : (
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: 'prev,next,today',
                                    center: 'title',
                                    right: 'dayGridMonth, timeGridDay, listDay'
                                }}
                                
                                weekends={true}
                                events={appointments}
                                // 🔥 NEW: Update selectedDate state whenever user navigates months
                                datesSet={(info) => {
                                    // Set the selectedDate state to the start of the currently viewed month
                                    setSelectedDate(moment(info.start).format("YYYY-MM-DD"));
                                }}
                                eventClick={handleEventClick}
                                // Custom coloring
                                eventContent={({ event }) => {
                                    const colorMap = {
                                        New: "#000000",
                                        Follow: "#ff8000",
                                        Postoperative: "#8000ff",
                                        Other: "#ff0080"
                                    };
                                    // Use the patientType from the event's extendedProps
                                    const patientType = event.extendedProps.patientType || 'Other'; 

                                    return (
                                        <div
                                        style={{
                                            backgroundColor: colorMap[patientType] || "#000",
                                            color: "#fff",
                                            padding: "2px",
                                            borderRadius: "3px",
                                            whiteSpace: 'normal', 
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            fontSize: '10px' 
                                        }}
                                        >
                                        {event.title}
                                        </div>
                                    );
                                    }}
                            />
                        )}
                    </Card.Body>
                </Card>
            </Col>

            <Col xxl={4} xl={12}> {/* Details takes 4 columns */}
                <Card>
                    <Card.Header><h4><FeatherIcon icon="info" size={18} className="me-2" />APPOINTMENT DETAILS</h4></Card.Header>
                    <Card.Body>
                        <AppointmentDetailsCard />
                    </Card.Body>
                </Card>
            </Col>
          </Row>
        </Container>
      </div>
      {/* theme body end */}
      
      {/* Cancellation Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
          <Modal.Header closeButton>
              <Modal.Title>REASON OF CANCELLATION</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <Form onSubmit={handleCancelSubmit}>
                  <Form.Group className="mb-3">
                      <Form.Control
                          as="textarea"
                          rows={4}
                          name="cancelComment"
                          value={cancelComment}
                          onChange={(e) => setCancelComment(e.target.value)}
                          placeholder="Please Enter the Cancellation details..."
                      />
                  </Form.Group>
                  <input type="hidden" name="cancelid" value={selectedEvent?.appointmentid || ''} />
                  <Button variant="danger" type="submit" className="formBtn">
                      Submit
                  </Button>
              </Form>
          </Modal.Body>
      </Modal>
    </div>
  );
}