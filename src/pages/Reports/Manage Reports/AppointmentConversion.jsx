import React, { useState } from "react";
import PageBreadcrumb from "../../componets/PageBreadcrumb";
import {
  Row,
  Col,
  Card,
  Container,
  Form,
  Table,
  Pagination,
} from "react-bootstrap";
import SimpleBar from "simplebar-react";

const BASE_URL = "http://194.195.117.79:5100/api"; // Update your API base URL here

const appointmentTypes = [
  { value: "New", label: "New" },
  { value: "Post Operative", label: "Post Operative" },
  { value: "Follow Up", label: "Follow Up" },
  { value: "Other", label: "Other" },
];

const AppointmentConversion = () => {
  // State for form inputs
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointmentdata] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsPerPage] = useState(10); // Show 10 appointments per page

  // Handle Find button click
  const handleFindClick = async (e) => {
    e.preventDefault();
    if (!fromDate || !toDate || !appointmentType) {
      alert("Please select all fields");
      return;
    }

    setLoading(true);
    try {
      const formatDateForAPI = (dateString) => {
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
      };

      const queryParams = new URLSearchParams({
        from: formatDateForAPI(fromDate),
        to: formatDateForAPI(toDate),
        patient_type: appointmentType,
      }).toString();

      const url = `${BASE_URL}/V1/appointment/listAppointments?${queryParams}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `HTTP error! status: ${response.status}${
            errorData ? ` - ${errorData.error}` : ""
          }`,
        );
      }

      const data = await response.json();
      console.log("Raw data:", data); // Debug log

      // Filter appointments based on type with flexible matching
      const filteredAppointments = data.data.filter((appointment) => {
        const currentType = (appointment.patient_type || "").toLowerCase();
        const selectedType = appointmentType.toLowerCase();

        // Handle different variations of appointment types
        switch (selectedType) {
          case "post operative":
            return (
              currentType.includes("post") || currentType.includes("operative")
            );
          case "follow up":
            return (
              currentType.includes("follow") || currentType === "follow up"
            );
          case "new":
            return currentType === "new";
          case "other":
            return currentType === "other";
          default:
            return false;
        }
      });

      // Sort by date
      const sortedAppointments = filteredAppointments.sort((a, b) => {
        const dateA = new Date(a.date || a.appointment_date);
        const dateB = new Date(b.date || b.appointment_date);
        return dateB - dateA; // newest first
      });

      console.log("Filtered and sorted appointments:", sortedAppointments); // Debug log
      setAppointments(sortedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      alert("Error fetching appointments: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add this pagination logic function
  const paginate = (appointments) => {
    const indexOfLastAppointment = currentPage * appointmentsPerPage;
    const indexOfFirstAppointment =
      indexOfLastAppointment - appointmentsPerPage;
    return appointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
  };

  return (
    <div
      className="themebody-wrap"
      style={{
        padding: "20px",
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        fontFamily: "'Poppins', Arial, sans-serif",
        minHeight: "100vh",
      }}
    >
      <PageBreadcrumb pagename="Appointment Conversion" />

      <SimpleBar className="theme-body common-dash">
        <Container fluid>
          <Row>
            <Col md={12}>
              <Card
                style={{
                  borderRadius: "12px",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                  borderColor: "#00bcd4",
                  background: "white",
                }}
              >
                <Card.Header
                  className="text-center"
                  style={{
                    fontWeight: "bold",
                    fontSize: "22px",
                    color: "#006064",
                    background: "linear-gradient(to right, #4dd0e1, #00acc1)",
                    borderBottom: "3px solid #00bcd4",
                    padding: "1rem",
                    backgroundColor: "white",
                  }}
                >
                  <h4>Manage Appointment Report</h4>
                </Card.Header>
                <Card.Body style={{ padding: "25px" }}>
                  <Form onSubmit={handleFindClick}>
                    <Row className="align-items-end">
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label
                            style={{ fontWeight: "bold", color: "#006064" }}
                          >
                            From Date
                          </Form.Label>
                          <Form.Control
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            style={{
                              border: "2px solid #4dd0e1",
                              textAlign: "center",
                              borderRadius: "8px",
                              padding: "10px",
                              backgroundColor: "#e0f7fa",
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label
                            style={{ fontWeight: "bold", color: "#006064" }}
                          >
                            To Date
                          </Form.Label>
                          <Form.Control
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            style={{
                              border: "2px solid #4dd0e1",
                              textAlign: "center",
                              borderRadius: "8px",
                              padding: "10px",
                              backgroundColor: "#e0f7fa",
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label
                            style={{ fontWeight: "bold", color: "#006064" }}
                          >
                            Appointment Type
                          </Form.Label>
                          <Form.Select
                            value={appointmentType}
                            onChange={(e) => setAppointmentType(e.target.value)}
                            style={{
                              border: "2px solid #4dd0e1",
                              borderRadius: "8px",
                              padding: "10px",
                              backgroundColor: "#e0f7fa",
                            }}
                          >
                            <option value="">Select Type</option>
                            {appointmentTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={loading}
                            style={{
                              marginTop: "30px",
                              height: "40px",
                              width: "100%",
                              backgroundColor: "#00acc1",
                              borderColor: "#00bcd4",
                              color: "white",
                              cursor: "pointer",
                              borderRadius: "8px",
                              transition: "0.3s all",
                              fontWeight: "bold",
                            }}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor = "#007c91";
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor = "#00acc1";
                            }}
                          >
                            {loading ? "Loading..." : "Find"}
                          </button>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>
                  <br />
                  <br />
                  <h4>Appointment Details</h4>
                  <Table
                    className="table table-bordered"
                    style={{
                      border: "1px solid #90caf9",
                      textAlign: "center",
                    }}
                  >
                    <thead
                      style={{
                        backgroundColor: "#0288d1",
                        color: "white",
                        fontSize: "16px",
                      }}
                    >
                      <tr>
                        <th style={{ padding: "10px" }}>Date</th>
                        <th style={{ padding: "10px" }}>Patient</th>
                        <th style={{ padding: "10px" }}>Doctor</th>
                        <th style={{ padding: "10px" }}>Appointment Type</th>
                        <th style={{ padding: "10px", textAlign: "center" }}>
                          Status
                        </th>
                        <th style={{ padding: "10px" }}>Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.length > 0 ? (
                        paginate(appointments).map((appointment) => (
                          <tr
                            key={appointment._id}
                            style={{ textAlign: "center" }}
                          >
                            <td style={{ padding: "10px" }}>
                              {appointment.date || appointment.appointment_date}
                            </td>
                            <td style={{ padding: "10px" }}>
                              {appointment.patientName}
                            </td>
                            <td style={{ padding: "10px" }}>
                              {appointment.doctorName}
                            </td>
                            <td style={{ padding: "10px" }}>
                              {appointment.patient_type ||
                                appointment.appointmentType}
                            </td>
                            <td
                              style={{
                                padding: "10px",
                                textAlign: "center",
                                color:
                                  appointment.status === "Scheduled"
                                    ? "#00796b"
                                    : appointment.status === "Completed"
                                      ? "#388e3c"
                                      : "#d32f2f",
                              }}
                            >
                              {appointment.status}
                            </td>
                            <td style={{ padding: "10px" }}>
                              {appointment.mobileNo ||
                                appointment.contact_number ||
                                appointment.phone}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            style={{ textAlign: "center", padding: "10px" }}
                          >
                            {loading
                              ? "Loading appointments..."
                              : "No appointments found for the selected criteria."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>

                  {/* Add Pagination Controls */}
                  {appointments.length > 0 && (
                    <div
                      className="d-flex justify-content-center align-items-center mt-4"
                      style={{ gap: "15px" }}
                    >
                      {/* First Page */}
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="btn btn-link"
                        style={{
                          textDecoration: "none",
                          fontSize: "24px",
                          padding: "5px 10px",
                          color: currentPage === 1 ? "#ccc" : "#0288d1",
                        }}
                      >
                        «
                      </button>

                      {/* Previous Page */}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="btn btn-link"
                        style={{
                          textDecoration: "none",
                          fontSize: "24px",
                          padding: "5px 10px",
                          color: currentPage === 1 ? "#ccc" : "#0288d1",
                        }}
                      >
                        ‹
                      </button>

                      {/* Current Page Number */}
                      <span
                        style={{
                          background: "#e0f7fa",
                          padding: "8px 15px",
                          borderRadius: "6px",
                          color: "#006064",
                          fontSize: "18px",
                          fontWeight: "500",
                          border: "2px solid #4dd0e1",
                        }}
                      >
                        {currentPage}
                      </span>

                      {/* Next Page */}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(
                              prev + 1,
                              Math.ceil(
                                appointments.length / appointmentsPerPage,
                              ),
                            ),
                          )
                        }
                        disabled={
                          currentPage ===
                          Math.ceil(appointments.length / appointmentsPerPage)
                        }
                        className="btn btn-link"
                        style={{
                          textDecoration: "none",
                          fontSize: "24px",
                          padding: "5px 10px",
                          color:
                            currentPage ===
                            Math.ceil(appointments.length / appointmentsPerPage)
                              ? "#ccc"
                              : "#0288d1",
                        }}
                      >
                        ›
                      </button>

                      {/* Last Page */}
                      <button
                        onClick={() =>
                          setCurrentPage(
                            Math.ceil(
                              appointments.length / appointmentsPerPage,
                            ),
                          )
                        }
                        disabled={
                          currentPage ===
                          Math.ceil(appointments.length / appointmentsPerPage)
                        }
                        className="btn btn-link"
                        style={{
                          textDecoration: "none",
                          fontSize: "24px",
                          padding: "5px 10px",
                          color:
                            currentPage ===
                            Math.ceil(appointments.length / appointmentsPerPage)
                              ? "#ccc"
                              : "#0288d1",
                        }}
                      >
                        »
                      </button>

                      {/* Page Info */}
                      <span
                        style={{
                          marginLeft: "20px",
                          color: "#006064",
                          fontSize: "16px",
                          fontWeight: "500",
                        }}
                      >
                        Showing {(currentPage - 1) * appointmentsPerPage + 1} to{" "}
                        {Math.min(
                          currentPage * appointmentsPerPage,
                          appointments.length,
                        )}{" "}
                        of {appointments.length}
                      </span>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </SimpleBar>
    </div>
  );
};

export default AppointmentConversion;
