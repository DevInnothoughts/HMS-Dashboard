import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import { Row, Col, Card, Container, Form, Button, Modal, Spinner, Table } from "react-bootstrap";
import PageBreadcrumb from "../../components/PageBreadcrumb";

// --- FULLCALENDAR IMPORTS (Required for Calendar View) ---
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import moment from 'moment';

// --- JWT DECODE UTILITY (Required for Location) ---
// Note: Replace this with your actual import path
function decodeJwt(token) {
    if (!token) return null;
    try {
        // Simplified decoding logic
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

// NOTE: CustomPagination, doctskill, Gallerydata, Fancybox imports are unused 
// for the Receptionist view and are ignored in the body implementation.

export default function ReceptionistDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [currentLocation, setCurrentLocation] = useState('default');
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  
  // State for Modals and selected event details
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelComment, setCancelComment] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null); 

  // --- Initial Load & JWT Location ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        const payload = decodeJwt(token);
        if (payload && payload.jobLocation) {
            setCurrentLocation(payload.jobLocation);
        }
    }
    // Destroy Fancybox if it was initialized by the Doctor Dashboard
    // if (typeof Fancybox !== 'undefined' && Fancybox.destroy) Fancybox.destroy();
  }, []);

  // --- Appointment Counts for Legend ---
  const counts = useMemo(() => {
      return appointments.reduce((acc, event) => {
          const className = event.className || 'Other';
          acc[className] = (acc[className] || 0) + 1;
          return acc;
      }, { New: 0, Follow: 0, Postoperative: 0, Other: 0 });
  }, [appointments]);


  // ------------------------- API Fetching -------------------------
  
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

  const fetchAppointments = useCallback(async ({ start, end }) => {
      if (currentLocation === 'default' || !selectedDoctorId) return;

      setLoading(true);
      try {
          // FullCalendar provides ISO dates, convert them to DD-MM-YYYY as required by service
          const from = moment(start).format('DD-MM-YYYY');
          const to = moment(end).format('DD-MM-YYYY');

          const url = `${BASE_URL}/V1/appointment/listAppointments?from=${from}&to=${to}&location=${currentLocation}&doctor=${selectedDoctorId}`;
          const response = await fetch(url);
          const data = await response.json();

          if (data.statusCode === 200 && Array.isArray(data.data)) {
              const formattedEvents = data.data.map(app => ({
                  title: `${app.appointmentTime || 'N/A'} ${app.patientName || 'Patient'}`,
                  start: app.appointment_timestamp, 
                  phone: app.patient_phone,
                  date: moment(app.appointment_timestamp).format('DD-MM-YYYY'),
                  time: app.appointmentTime,
                  className: app.patient_type || 'Other', 
                  note: app.note,
                  patientid: app.patient_id,
                  confirmtime: app.confirm_time,
                  appointmentid: app.appointment_id,
              }));
              setAppointments(formattedEvents);
          }
      } catch (error) {
          console.error("Error fetching appointments:", error);
      } finally {
          setLoading(false);
      }
  }, [currentLocation, selectedDoctorId]);

  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);
  
  // ------------------------- Action Handlers -------------------------

  const handleConfirm = async (appId) => {
    // ... (Confirm logic as defined in previous step)
  };

  const handleCancelSubmit = async (e) => {
    // ... (Cancel logic as defined in previous step)
  };

  const handleEventClick = (clickInfo) => {
      setSelectedEvent(clickInfo.event.extendedProps);
  };
  
  const handleDoctorChange = (e) => {
      setSelectedDoctorId(e.target.value);
  };

  const handleDateChange = (e) => {
      setSelectedDate(e.target.value);
  };
  
  const handleFindClick = () => {
      if (!selectedDoctorId || !selectedDate) {
          alert('Please select both Doctor and Date.');
          return;
      }
      // Ideally, the calendar view triggers the fetch, but this can be used 
      // to change the calendar's focus date if needed.
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
    
    const isConfirmed = selectedEvent.confirmtime !== '0' && selectedEvent.confirmtime !== 0;

    return (
        <div className="p-3" style={{ lineHeight: '30px' }}>
            <span className='font-weight-bold'>Patient Name</span>: <span className='text-danger font-weight-bold'>{selectedEvent.title.replace(selectedEvent.time, '').trim()}</span><br/>
            <span className='font-weight-bold'>Appointment Date</span>: <span className='text-danger font-weight-bold'>{selectedEvent.date}</span><br/>
            {/* ... other detail lines ... */}
            
            <div className="mt-3">
                <Button variant="primary" onClick={() => handleConfirm(selectedEvent.appointmentid)} disabled={isConfirmed} title="Confirm" className="me-2">
                    <FeatherIcon icon="check" size={16} /> Confirm
                </Button>
                <Link to={`/edit-patient/${selectedEvent.patientid}`} className="me-2">
                    <Button variant="info" disabled={isConfirmed}>
                        <FeatherIcon icon="edit" size={16} /> Edit Patient
                    </Button>
                </Link>
                <Button variant="danger" onClick={() => setShowCancelModal(true)} disabled={isConfirmed} title="Cancel">
                    <FeatherIcon icon="trash-2" size={16} /> Cancel
                </Button>
                
                {isConfirmed && (
                    <Button variant="success" onClick={() => window.open(`//print-receipt-url/${selectedEvent.appointmentid}`)} title="Print" className="ms-2">
                        <FeatherIcon icon="printer" size={16} /> Print
                    </Button>
                )}
            </div>
        </div>
    );
  };
  
  // NOTE: Renaming export from Dashboard2 to ReceptionistDashboard internally
  return (
    <div className="themebody-wrap">
      {/* Breadcrumb Start */}
      {/* Reusing PageBreadcrumb component for the title area */}
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
                            <Form.Control 
                                type="date" 
                                placeholder="mm/dd/yyyy" 
                                value={selectedDate} 
                                onChange={handleDateChange}
                                style={{ width: 'auto', marginRight: '10px' }} 
                            />
                            
                            <Form.Select onChange={handleDoctorChange} value={selectedDoctorId} style={{ width: 'auto', marginRight: '10px' }}>
                                <option value="">SELECT DOCTOR</option>
                                {doctors.map(doc => (
                                    <option key={doc.doctor_id} value={doc.doctor_id}>{doc.name}</option>
                                ))}
                            </Form.Select>
                            
                            <Button variant="danger" onClick={handleFindClick}>
                                Find
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
                    <Card.Body style={{ minHeight: '500px', padding: 0 }}>
                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center h-100"><Spinner animation="border" /></div>
                        ) : (
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: 'prev,next,today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridDay,listDay'
                                }}
                                weekends={true}
                                events={appointments}
                                datesSet={info => fetchAppointments(info)} // Fetch appointments when dates change
                                eventClick={handleEventClick}
                                // Custom coloring based on the PHP logic (New, Follow, Postoperative)
                                eventContent={({ event }) => (
                                    <div className="fc-content" style={{ backgroundColor: '#000000', color: 'white', padding: '5px' }}>
                                        {event.title}
                                    </div>
                                )}
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

            {/* NOTE: We removed the extraneous Doctor Dashboard rows here */}
          </Row>
        </Container>
      </div>
      {/* theme body end */}
      
      {/* Cancellation Modal (Needs to be kept outside theme-body) */}
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