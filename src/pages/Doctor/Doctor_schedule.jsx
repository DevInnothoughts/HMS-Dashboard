import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
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

const BASE_URL = "http://194.195.117.79:5100/api";

export default function DoctorSchedule() {
  const [appointmentData, setAppointmentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const formatDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`;
  };

  const formatTime = (time12h) => {
    if (!time12h) return "00:00:00";
    const timeParts = time12h.split(" ");
    if (timeParts.length !== 2) return "00:00:00";
    const [time, modifier] = timeParts;
    let [hours, minutes] = time.split(":");

    if (modifier === "PM" && hours !== "12") {
      hours = String(parseInt(hours) + 12);
    } else if (modifier === "AM" && hours === "12") {
      hours = "00";
    }

    return `${hours}:${minutes}:00`;
  };

  const fetchAppointmentData = async () => {
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

        const groupedAppointments = {};
        data.data.forEach((appointment) => {
          const eventDate = formatDate(appointment.date);
          if (!groupedAppointments[eventDate]) {
            groupedAppointments[eventDate] = [];
          }
          groupedAppointments[eventDate].push(appointment);
        });

        const formattedEvents = Object.entries(groupedAppointments).map(
          ([date, appointments]) => {
            const firstPatient = appointments[0].patientName;
            const totalAppointments = appointments.length;

            return {
              id: date,
              title:
                totalAppointments > 1
                  ? `${firstPatient} +${totalAppointments - 1}`
                  : firstPatient,
              start: date,
              backgroundColor: "#007bff",
              borderColor: "#007bff",
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
      alert("Error fetching appointments: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentData();
  }, []);

  const handleEventClick = (info) => {
    setSelectedAppointments(info.event.extendedProps.appointments);
    setSelectedDate(info.event.startStr);
    setShowModal(true);
  };

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
      {/* <div className="theme-body codex-calendar"> */}
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
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                      left: "prev,next today",
                      center: "title",
                      right: "dayGridMonth,timeGridWeek,timeGridDay",
                    }}
                    events={appointmentData}
                    navLinks={true}
                    editable={false}
                    eventStartEditable={false} // ❌ Prevent start time changes
                    eventDurationEditable={false} // ❌ Prevent duration changes
                    height="auto"
                    eventClick={handleEventClick}
                    slotDuration="00:15:00" // 15-minute slots
                    slotLabelInterval="00:15:00" // Show label for every 15 min
                    slotMinTime="07:00:00"
                    slotMaxTime="24:00:00"
                    allDaySlot={false}
                    eventContent={(eventInfo) => (
                      <div
                        style={{
                          backgroundColor: eventInfo.event.backgroundColor,
                          color: "#fff",
                          padding: "8px",
                          borderRadius: "5px",
                          fontSize: "14px",
                          textAlign: "center",
                        }}
                      >
                        {eventInfo.event.title}
                      </div>
                    )}
                    dayHeaderContent={(dateInfo) => (
                      <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                        {dateInfo.text}
                      </div>
                    )}
                    slotLabelContent={(info) => (
                      <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                        {info.text}
                      </span>
                    )}
                  />
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      {/* </div> */}

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
