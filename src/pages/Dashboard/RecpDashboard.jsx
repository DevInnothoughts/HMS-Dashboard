import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import { Row, Col, Card, Container, Form, Button, Modal, Spinner } from "react-bootstrap";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import Swal from 'sweetalert2';

const localizer = momentLocalizer(moment);

const CustomEvent = ({ event }) => (
    <div style={{ fontSize: '11px', lineHeight: '1.2', padding: '2px' }}>
        <strong>{event.time}</strong>
        <div style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontWeight: '500'
        }}>
            {event.patientName}
        </div>
    </div>
);

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
});

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
  
  // selectedDate is now a Date object or moment object for RBC internal use
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [currentView, setCurrentView] = useState('month'); // State for the calendar view

  // State for Modals and selected event details
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelComment, setCancelComment] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null); 
  
  // RBC doesn't need a ref for simple date navigation, but we'll keep it for potential future API use
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
          const type = (event.patientType || 'Other').toUpperCase();
          acc[type] = (acc[type] || 0) + 1;
          return acc;
      }, { NEW: 0, FOLLOW: 0, POSTOPERATIVE: 0, OTHER: 0 });
  }, [appointments]);


  // ------------------------- API Fetching -------------------------
  
  // Helper to format API response into react-big-calendar events
  const formatAppointments = useCallback((data) => {
    return data.map(app => {
        
        // Combine date and time to create the start date object
        const startTime = moment(
            moment(app.appointment_timestamp).format("YYYY-MM-DD") + " " + app.appointment_time,
            "YYYY-MM-DD HH:mm"
        );

        // For simplicity, we'll set the end time 30 minutes later, or just use the start time for the month view
        const endTime = startTime.clone().add(30, 'minutes');
        
        return {
            // Title shown on the calendar
            title: `${app.appointment_time || 'N/A'} — ${app.patient_name || 'Patient'}`,

            // Date objects required by RBC
            start: startTime.toDate(),
            end: endTime.toDate(), 

            // Custom props
            phone: app.patient_phone,
            date: moment(app.appointment_timestamp).format('DD-MM-YYYY'),
            time: app.appointment_time,

            patientName: app.patient_name,
            doctorName: app.doctor_name,
            patientType: app.patient_type || 'Other', 
            status: app.status,
            note: app.note,
            confirmTime: app.confirm_time,

            patientid: app.patient_id,
            appointmentid: app.appointment_id,
            
            // Used for custom styling/event component
            isConfirmed: app.confirm_time !== '0' && app.confirm_time !== 0,
        };
    });
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
  const fetchAppointmentsForRange = useCallback(async (dateToFetch, doctorId) => {
    if (currentLocation === 'default') return;

    setLoading(true);
    
    // Determine the date range based on the current view and the date
    const targetMoment = moment(dateToFetch);
    let start, end;

    if (currentView === 'month') {
        start = targetMoment.clone().startOf('month').toDate();
        end = targetMoment.clone().endOf('month').toDate();
    } else if (currentView === 'week') {
         start = targetMoment.clone().startOf('week').toDate();
        end = targetMoment.clone().endOf('week').toDate();
    } else { // 'day' or 'agenda'
        start = targetMoment.clone().startOf('day').toDate();
        end = targetMoment.clone().endOf('day').toDate();
    }

    try {
        const from = moment(start).format('DD-MM-YYYY');
        const to = moment(end).format('DD-MM-YYYY');

        let url = `${BASE_URL}/V1/appointment/listAppointments?from=${from}&to=${to}&location=${currentLocation}`;
        if (doctorId) {
            url += `&doctor=${doctorId}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        if (data.statusCode === 200 && Array.isArray(data.data)) {
            let filteredData = data.data;
            if (doctorId) {
                filteredData = data.data.filter(app => String(app.doctor_id) === String(doctorId));
            }

            const formattedEvents = formatAppointments(filteredData);
            setAppointments(formattedEvents);
        } else {
            setAppointments([]);
            Swal.fire({
                icon: 'error',
                title: 'Fetch Failed',
                text: 'Failed to fetch appointment data.'
            });
        }
    } catch (error) {
        console.error("Error fetching appointments:", error);
        setAppointments([]);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while loading dashboard data.'
        });
    } finally {
        setLoading(false);
    }
  }, [currentLocation, currentView, formatAppointments]); 


  // **EFFECT: API Fetch on state change**
  // This triggers fetch whenever the location, doctor, or the central date/view changes.
  useEffect(() => {
    if (currentLocation !== 'default') {
        fetchAppointmentsForRange(selectedDate, selectedDoctorId);
    }
  }, [selectedDate, selectedDoctorId, currentLocation, currentView, fetchAppointmentsForRange]);

  // Initial load dependency fetching
  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);


  // ------------------------- Action Handlers -------------------------

  // RBC: Called when user clicks 'next', 'prev', 'today', or selects a new view
  const handleCalendarNavigate = (newDate, view, action) => {
    setSelectedDate(newDate); 
    // The useEffect above automatically triggers the data fetch for this new date
  };

  // RBC: Called when user changes view (month, week, day)
  const handleCalendarView = (newView) => {
    setCurrentView(newView);
    // The useEffect above automatically triggers the data fetch for this new view range
  }
  
  // Date picker change: Must update the selectedDate state AND tell the calendar to jump
  const handleDateChange = (e) => {
      const newMomentDate = moment(e.target.value, "YYYY-MM-DD").toDate();
      setSelectedDate(newMomentDate);
      // RBC automatically navigates when 'date' prop changes, so we don't need 'navigate' here
  };
  
  // Doctor/Refresh change (Doctor change triggers fetch via useEffect)
  const handleDoctorChange = (e) => {
      setSelectedDoctorId(e.target.value);
  };
  
  const handleRefreshClick = () => {
    // Resetting the date to today forces the useEffect to run and refresh data
    setSelectedDate(new Date()); 
    // Note: RBC handles jumping to 'today' internally when 'selectedDate' changes to today.
  };

  // RBC: Event click handler
  const handleEventClick = (event) => {
    setSelectedEvent({
        title: event.title,     
        date: event.date,                 
        phone: event.phone,               
        time: event.time,                 
        patientName: event.patientName,
        doctorName: event.doctorName,
        patientType: event.patientType,
        note: event.note,
        patientid: event.patientid,
        appointmentid: event.appointmentid,
        confirmTime: event.confirmTime,
    });
  };

  const handleConfirm = async (appointmentId, patientType, phone) => {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "Confirmation: The patient has come to the clinic...!",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, confirm it!'
    });

    if (!result.isConfirmed) return;

    try {
       const url = `${BASE_URL}/V1/appointment/confirmAppointment?location=${currentLocation}&appId=${appointmentId}&patientType=${patientType}&patientPhone=${phone}`;
       const response = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          });      
          const result = await response.json();
          console.log(result);
          if (!response.ok || result.statusCode !== 200) {
            Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: 'Failed to confirm appointment!'
            });
            return;
        }

        Toast.fire({
            icon: 'success',
            title: 'Appointment confirmed successfully'
        });

        await fetchAppointmentsForRange(selectedDate, selectedDoctorId);
    } catch (error) {
        console.error("Confirm error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred during confirmation.'
        });
    }
};


  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    
    // Assuming selectedEvent.appointmentid and cancelComment are available in scope.
    const appointmentIdToDelete = selectedEvent?.appointmentid;
    const cancellationReason = cancelComment; // Use the cancellation reason text
    
    if (!appointmentIdToDelete) {
        console.error("Missing appointment ID for cancellation.");
        // HIPAA: Provide generic feedback
        alert("Cannot process cancellation. Appointment ID is missing."); 
        return;
    }
    if (!cancellationReason) {
        alert("Cancellation failed. Please enter the reason for cancellation.");
        return;
    }
    try {
        const url = `${BASE_URL}/V1/appointment/delete/${appointmentIdToDelete}?location=${currentLocation}`;
        // 2. Perform DELETE request
        const response = await fetch(url, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cancellationReason }) 
        });
        if (response.ok) {
            alert("Appointment successfully cancelled.");

            fetchAppointmentsForRange(selectedDate, selectedDoctorId);

            setSelectedEvent(null);

            setShowCancelModal(false);
            setCancelComment("");
        } else {
            const errorData = await response.json();
            alert("Failed to cancel appointment.");
            console.error("Backend Error:", errorData.message);
        }
    } catch (error) {
        alert("An error occurred while cancelling.");
        console.error("Network Error:", error);
    }
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

  // Custom styling for RBC events
  const eventStyleGetter = useCallback((event) => {
      const colorMap = {
          NEW: "#000000",
          FOLLOW: "#ff8000",
          POSTOPERATIVE: "#8000ff",
          OTHER: "#ff0080"
      };
      
      const backgroundColor = colorMap[event.patientType] || "#000";
      
      return {
          style: {
              backgroundColor,
              color: "#fff",
              borderRadius: "3px",
              border: '1px solid #ddd',
          },
      };
  }, []);

  const AppointmentDetailsCard = () => {
    if (!selectedEvent) {
        return <p className="p-3">Select an appointment from the calendar to view details.</p>;
    }
    console.log(selectedEvent);
    const isConfirmed = selectedEvent.confirmTime !== '0' && selectedEvent.confirmTime !== 0;

    return (
        <div className="p-3" style={{ lineHeight: '30px' }}>
            <span className='font-weight-bold'>Patient Name</span>: <span className='text-danger font-weight-bold'>{selectedEvent.patientName || selectedEvent.title.split('—')[1]?.trim()}</span><br/>
            <span className='font-weight-bold'>Appointment Date</span>: <span className='text-danger font-weight-bold'>{selectedEvent.date}</span><br/>
            <span className='font-weight-bold'>Patient Phone No.</span>: <span className='text-danger font-weight-bold'>{selectedEvent.phone}</span><br/>
            <span className='font-weight-bold'>Appointment Time</span>: <span className='text-danger font-weight-bold'>{selectedEvent.time}</span><br/>
            <span className='font-weight-bold'>Patient Type</span>: <span className='text-danger font-weight-bold'>{selectedEvent.patientType}</span><br/>
            <span className='font-weight-bold'>Note</span>: {selectedEvent.note}<br/>
            
            <div className="mt-3">
                    {isConfirmed ? (
                        /* Visual Indicator for Confirmed Status */
                        <div className="alert alert-success d-flex align-items-center" style={{ borderRadius: '8px' }}>
                            <FeatherIcon icon="check-circle" size={20} className="me-2" />
                            <div>
                                <strong>Confirmed</strong>
                                <div style={{ fontSize: '12px', lineHeight: '14px' }}>
                                    Checked in at: {selectedEvent.confirmTime}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Show Buttons only if NOT confirmed */
                        <div className="d-flex flex-wrap">
                            <Button
                                variant="primary"
                                onClick={() => handleConfirm(selectedEvent.appointmentid, selectedEvent.patientType, selectedEvent.phone)}
                                title="Confirm"
                                className="me-2 mb-2"
                            >
                                <FeatherIcon icon="check" size={16} /> Confirm Arrival
                            </Button>

                            <Button
                                variant="danger"
                                onClick={() => setShowCancelModal(true)}
                                title="Cancel"
                                className="me-2 mb-2"
                            >
                                <FeatherIcon icon="trash-2" size={16} /> Cancel
                            </Button>
                        </div>
                    )}
                </div>
        </div>
    );
  };
  
  return (
    <div className="themebody-wrap">
        <PageBreadcrumb pagename="Reception Dashboard" />
        <div className="theme-body">
            <Container fluid className="cdxuser-profile">
                <Row>
                    <Col xxl={12} className="mb-4">
                        <Row className="align-items-center">
                            <Col lg={6} md={12}>
                                <div className="d-flex align-items-center controls">
                                    <Form.Control
                                        type="date"
                                        placeholder="mm/dd/yyyy"
                                        value={moment(selectedDate).format("YYYY-MM-DD")}
                                        onChange={handleDateChange}
                                        style={{ width: 'auto', marginRight: '10px' }}
                                    />

                                    <Form.Select onChange={handleDoctorChange} value={selectedDoctorId} style={{ width: 'auto', marginRight: '10px' }}>
                                        <option value="">ALL DOCTORS</option>
                                        {doctors.map(doc => (
                                            <option key={doc.doctor_id} value={doc.doctor_id}>{doc.name}</option>
                                        ))}
                                    </Form.Select>

                                    <Button className="dashbutton" variant="danger" onClick={handleRefreshClick} style={{ fontSize: "13px", borderRadius: "10px", padding: "8px 10px" }} >
                                        <FeatherIcon icon="refresh-ccw" size={12} className="me-1" />Refresh
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={12} className="mb-5" style={{ marginLeft: "10px", marginTop: "20px" }}>
                        <div className="d-flex flex-wrap justify-content-start">
                            <ColorLegend name="New Patient" count={counts.NEW} bgColor="#000000" />
                            <ColorLegend name="Follow Patient" count={counts.FOLLOW} bgColor="#ff8000" />
                            <ColorLegend name="Postoperative Patient" count={counts.POSTOPERATIVE} bgColor="#8000ff" />
                            <ColorLegend name="Other Patient" count={counts.OTHER} bgColor="#ff0080" />
                        </div>
                    </Col>
                    <Col xxl={8} xl={12} >
                        <Card>
                            <Card.Header><h4><FeatherIcon icon="calendar" size={18} className="me-2" />CALENDAR SCHEDULE</h4></Card.Header>
                            <Card.Body style={{ minHeight: '500px', padding: 0 }}>
                                {loading ? (
                                    <div className="d-flex justify-content-center align-items-center h-100"><Spinner animation="border" /></div>
                                ) : (
                                    <Calendar
                                        ref={calendarRef}
                                        localizer={localizer}
                                        events={appointments}
                                        date={selectedDate}
                                        view={currentView}
                                        onNavigate={handleCalendarNavigate}
                                        onSelectEvent={handleEventClick}
                                        onView={handleCalendarView}
                                        startAccessor="start"
                                        endAccessor="end"
                                        // style={{ height: 600, padding: '15px' }}
                                        eventPropGetter={eventStyleGetter}
                                        views={['month', 'week', 'day', 'agenda']}
                                        defaultView='month'
                                        components={{
                                            event: CustomEvent
                                        }}
                                        step={15}
                                        timeslots={4}
                                        style={{ height: 800 }}
                                        dayLayoutAlgorithm={'no-overlap'}
                                    />
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xxl={4} xl={12}>
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