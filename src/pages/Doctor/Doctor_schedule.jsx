import React, { useEffect, useState, useCallback, useMemo } from "react";
// --- REACT BIG CALENDAR IMPORTS ---
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import {
  Row,
  Col,
  Card,
  Container,
  Spinner,
  Modal,
  Button,
  Table,
} from "react-bootstrap";
import PageBreadcrumb from "../../components/PageBreadcrumb";

// Initialize the localizer for React Big Calendar
const localizer = momentLocalizer(moment);

const BASE_URL = "http://194.195.117.79:5100/api";

export default function DoctorSchedule() {
  const [appointmentData, setAppointmentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  
  // State for RBC to control the current view date (defaults to today)
  const [currentDate, setCurrentDate] = useState(new Date()); 

  const formatDate = (dateString) => {
    // Converts "DD/MM/YYYY" to "YYYY-MM-DD"
    const [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`;
  };

  const fetchAppointmentData = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL(`${BASE_URL}/V1/appointment/listAppointments`);
      console.log("Fetching appointments from:", url.toString());

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok && Array.isArray(data.data)) {
        console.log("Fetched Appointments:", data.data);

        // Group appointments by date
        const groupedAppointments = {};
        data.data.forEach((appointment) => {
          // Note: Assuming `appointment.date` is in "DD/MM/YYYY" format
          const eventDate = formatDate(appointment.date);
          if (!groupedAppointments[eventDate]) {
            groupedAppointments[eventDate] = [];
          }
          groupedAppointments[eventDate].push(appointment);
        });

        // Format grouped appointments into RBC events
        const formattedEvents = Object.entries(groupedAppointments).map(
          ([date, appointments]) => {
            const firstPatient = appointments[0].patientName;
            const totalAppointments = appointments.length;
            
            // RBC requires Date objects for start and end
            const startDate = new Date(date + "T07:00:00"); // Start of the display window
            const endDate = new Date(date + "T23:59:59"); // End of the display window

            return {
              id: date,
              // Title to display on the calendar
              title:
                totalAppointments > 1
                  ? `${firstPatient} +${totalAppointments - 1}`
                  : firstPatient,
              start: startDate,
              end: endDate,
              allDay: true, // Treat as an all-day block for visibility
              extendedProps: { appointments },
            };
          }
        );

        setAppointmentData(formattedEvents);
      } else {
        console.warn("No appointments found.");
        setAppointmentData([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      // Using console.error instead of alert as per instructions
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch data on component mount
    fetchAppointmentData();
  }, [fetchAppointmentData]);

  // Handle event click for RBC
  const handleEventClick = (event) => {
    // event object contains the properties defined in formattedEvents
    setSelectedAppointments(event.extendedProps.appointments);
    
    // Format the date for display in the modal title
    const dateStr = moment(event.start).format("DD/MM/YYYY");
    setSelectedDate(dateStr); 
    setShowModal(true);
  };
  
  // RBC prop getter for event styling
  const eventPropGetter = useCallback((event) => {
      return {
          style: {
              backgroundColor: '#007bff', 
              borderColor: '#007bff',
              color: 'white',
              borderRadius: '5px',
              padding: '8px',
              fontSize: '14px',
              textAlign: 'center',
          },
      };
  }, []);

  // Handler for when the user navigates the calendar (prev, next, today)
  const handleNavigate = useCallback((newDate) => {
      setCurrentDate(newDate);
      // You can add logic here to refetch data for the new date range if needed,
      // but for now, we rely on the initial fetch spanning a wide range.
  }, []);
  
  // Handler for when the user changes the view (month, week, day)
  const handleViewChange = useCallback((newView) => {
      // This is generally not required unless you need to change logic based on the view
      console.log(`View changed to: ${newView}`);
  }, []);


  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #00bcd4, #80deea)",
        fontFamily: "'Poppins', Arial, sans-serif",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <PageBreadcrumb pagename="Doctor Schedule" />

      <Container fluid>
        <Row>
          <Col>
            <Card
              style={{
                borderRadius: "12px",
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                borderColor: "#00bcd4",
                background: "white",
                border: "4px solid #00bcd4",
              }}
            >
              <Card.Body>
                {loading ? ( // Show loader if data is being fetched
                  <div
                    className="d-flex justify-content-center py-5"
                    style={{ color: "#00bcd4", alignItems: "center" }}
                  >
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                ) : (
                  <div style={{ height: '75vh', minHeight: '600px', padding: '15px' }}>
                    <Calendar
                      localizer={localizer}
                      events={appointmentData}
                      
                      // Use currentDate state to control the visible date
                      date={currentDate} 
                      onNavigate={handleNavigate}
                      onView={handleViewChange} 
                      
                      // Configuration
                      defaultView="week" // Equivalent to timeGridWeek
                      views={['month', 'week', 'day']} // Simplified RBC views
                      
                      // Accessors
                      startAccessor="start"
                      endAccessor="end"
                      titleAccessor="title"
                      
                      // Event interaction
                      onSelectEvent={handleEventClick} 
                      
                      // Appearance
                      eventPropGetter={eventPropGetter}
                      step={15} // Sets the granularity of time slots to 15 minutes
                      timeslots={4} // Ensures 4 slots per hour (15 minutes each)
                      min={new Date(0, 0, 0, 7, 0, 0)} // Start time 7:00 AM
                      max={new Date(0, 0, 0, 24, 0, 0)} // End time 12:00 AM (24:00)
                      allDayAccessor="allDay"
                      style={{ height: '100%' }}
                    />
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal to Show Appointments */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Appointments on {selectedDate}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointments.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient Name</th>
                  <th>Appointment Time</th>
                  <th>Doctor Name</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {selectedAppointments.map((appt, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{appt.patientName}</td>
                    <td>{appt.appointmentTime}</td>
                    <td>{appt.doctorName}</td>
                    <td>{appt.departmentName}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No appointment details available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}