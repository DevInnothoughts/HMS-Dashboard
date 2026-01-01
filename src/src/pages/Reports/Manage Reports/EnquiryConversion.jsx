import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import './ReceptionistReport.css'; // Keep the existing CSS in a separate file
import PageBreadcrumb from "../../componets/PageBreadcrumb";
import {
  Row,
  Col,
  Card,
  Container,
  Table,
  Form,
  Button,
} from "react-bootstrap";
import SimpleBar from "simplebar-react";

const BASE_URL = "http://localhost:5100/api"; // Update your API base URL here

const EnquiryConversion = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportData, setReportData] = useState({
    bookedAppointments: "-",
    visited: "-",
    dnw: "-",
    dnt: "-",
    totalEnquiries: "-",
    callBack: "-",
  });

  const styles = {
    datePicker: {
      width: "100%",
    },
    table: {
      width: "100%",
      fontSize: "13px",
      marginBottom: "20px",
      backgroundColor: "transparent",
      borderCollapse: "collapse",
      borderSpacing: "0",
      display: "table",
    },
    tableBordered: {
      border: "1px solid #dddddd",
      borderCollapse: "separate",
      borderLeft: "0",
      WebkitBorderRadius: "4px",
      MozBorderRadius: "4px",
      borderRadius: "4px",
    },
    widgetHeader: {
      position: "relative",
      height: "40px",
      lineHeight: "40px",
      background: "linear-gradient(top, #fafafa 0%, #e9e9e9 100%)",
      textShadow: "0 1px 0 #fff",
      borderRadius: "5px 5px 0 0",
      boxShadow:
        "0 2px 5px rgba(0,0,0,0.1),inset 0 1px 0 white,inset 0 -1px 0 rgba(255,255,255,0.7)",
      borderBottom: "1px solid #bababa",
      border: "1px solid #D5D5D5",
      WebkitBorderTopLeftRadius: "4px",
      WebkitBorderTopRightRadius: "4px",
      MozBorderRadiusTopleft: "4px",
      MozBorderRadiusTopright: "4px",
      borderTopLeftRadius: "4px",
      borderTopRightRadius: "4px",
      WebkitBackgroundClip: "padding-box",
    },
    widgetContent: {
      padding: "20px 15px 15px",
      background: "#FFF",
      border: "1px solid #D5D5D5",
      MozBorderRadius: "5px",
      WebkitBorderRadius: "5px",
      borderRadius: "5px",
    },
    widgetTitle: {
      top: "2px",
      marginTop: "0px",
      position: "relative",
      left: "10px",
      display: "inline-block",
      marginRight: "3em",
      fontSize: "14px",
      fontWeight: "600",
      color: "#555",
      lineHeight: "18px",
      textShadow: "1px 1px 2px rgba(255, 255, 255, 0.5)",
    },
    icon: {
      display: "inline-block",
      marginLeft: "13px",
      marginRight: "-2px",
      fontSize: "16px",
      color: "#555",
      verticalAlign: "middle",
    },
  };

  const datePickerCustomStyles = {
    input: {
      width: "100%",
      padding: "8px 12px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      fontSize: "14px",
      backgroundColor: "white",
      cursor: "pointer",
    },
    calendar: {
      fontSize: "14px",
      width: "250px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      backgroundColor: "white",
    },
  };

  // Custom date input component
  const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
    <input
      ref={ref}
      className="form-control"
      value={value}
      onClick={onClick}
      readOnly
      style={datePickerCustomStyles.input}
      placeholder="Select Date"
    />
  ));

  // Placeholder data for enquiry conversations
  const enquiryConversionData = [
    { date: "2025-01-01", customer: "Jane Doe", topic: "Product Details" },
    { date: "2025-01-03", customer: "John Smith", topic: "Billing Inquiry" },
  ];

  // Filter data based on selected dates
  const filteredData = enquiryConversionData.filter((entry) => {
    const isDateValid =
      (!fromDate || new Date(entry.date) >= new Date(fromDate)) &&
      (!toDate || new Date(entry.date) <= new Date(toDate));
    return isDateValid;
  });

  const handleFind = async (e) => {
    e.preventDefault();

    if (!fromDate || !toDate) {
      alert("Please Enter all fields details..");
      return;
    }

    try {
      const formatDateForAPI = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      const formattedFromDate = formatDateForAPI(fromDate);
      const formattedToDate = formatDateForAPI(toDate);

      // Create URL with query parameters
      const appointmentURL = new URL(
        `${BASE_URL}/V1/appointment/listAppointments`
      );
      appointmentURL.searchParams.append("from", formattedFromDate);
      appointmentURL.searchParams.append("to", formattedToDate);

      // Fetch appointments
      const appointmentResponse = await fetch(
        `${BASE_URL}/V1/appointment/listAppointments?from=${formattedFromDate}&to=${formattedToDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!appointmentResponse.ok) {
        const errorText = await appointmentResponse.text();
        console.error("Appointment API Error:", errorText);
        throw new Error(
          `Failed to fetch appointment data: ${appointmentResponse.status}`
        );
      }

      const appointmentData = await appointmentResponse.json();
      console.log("Appointment Data:", appointmentData);

      // Fetch enquiries
      const enquiryResponse = await fetch(
        `${BASE_URL}/V1/enquiry/listEnquiry?from=${formattedFromDate}&to=${formattedToDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!enquiryResponse.ok) {
        const errorText = await enquiryResponse.text();
        console.error("Enquiry API Error:", errorText);
        throw new Error(
          `Failed to fetch enquiry data: ${enquiryResponse.status}`
        );
      }

      const enquiryData = await enquiryResponse.json();

      console.log("Appointment Data:", appointmentData);
      console.log("Enquiry Data:", enquiryData);

      // Calculate statistics
      let confirmedPatients = 0;
      let dnwPatients = 0;
      let dntPatients = 0;

      if (
        appointmentData &&
        appointmentData.data &&
        Array.isArray(appointmentData.data)
      ) {
        appointmentData.data.forEach((appointment) => {
          if (appointment.confirm_time !== 0) {
            confirmedPatients++;
          }
          if (
            appointment.executivechk === 0 &&
            appointment.confirm_time !== 0
          ) {
            dnwPatients++;
          }
          if (appointment.confirm_time === 0) {
            dntPatients++;
          }
        });
      }

      // Update report data with actual numbers
      setReportData({
        bookedAppointments: appointmentData?.data?.length || 0,
        visited: confirmedPatients,
        dnw: dnwPatients,
        dnt: dntPatients,
        totalEnquiries: enquiryData?.data?.length || 0,
        callBack: 0,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      alert(`Error fetching data: ${error.message}`);
      setReportData({
        bookedAppointments: "-",
        visited: "-",
        dnw: "-",
        dnt: "-",
        totalEnquiries: "-",
        callBack: "-",
      });
    }
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
      {/* Breadcrumb */}
      <PageBreadcrumb pagename="Enquiry Conversion Report" />

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
                  border: "4px solid #00bcd4",
                }}
              >
                <Card.Header
                  className="text-center"
                  style={{
                    fontWeight: "bold",
                    backgroundColor: "#e3f2fd",
                    borderBottom: "2px solid #0288d1",
                    padding: "1rem",
                    background: "linear-gradient(to right, #00acc1, #007c91)",
                    color: "white",
                    fontSize: "16px",
                  }}
                >
                  <h4>Enquiry Conversion Report</h4>
                </Card.Header>
                <Card.Body style={{ padding: "25px" }}>
                  {/* Filters */}
                  <Form onSubmit={handleFind}>
                    <Row className="align-items-end">
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <b>From Date</b>
                          </Form.Label>
                          <DatePicker
                            selected={fromDate}
                            onChange={(date) => setFromDate(date)}
                            dateFormat="dd/MM/yyyy"
                            className="form-control"
                            placeholderText="Select From Date"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <b>To Date</b>
                          </Form.Label>
                          <DatePicker
                            selected={toDate}
                            onChange={(date) => setToDate(date)}
                            dateFormat="dd/MM/yyyy"
                            className="form-control"
                            placeholderText="Select To Date"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <button
                            className="btn btn-primary"
                            type="submit"
                            style={{
                              marginTop: "30px",
                              height: "55px",
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
                            Find
                          </button>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>
                  <br />
                  <br />
                  {/* Show table regardless of showReport state */}
                  <div id="divToPrint">
                    <div className="tab-content">
                      <div className="tab-pane box active" id="list">
                        <div id="Assisted">
                          <div className="widget stacked widget-table action-table">
                            <div style={styles.widgetHeader}>
                              <i
                                className="icon-th-list"
                                style={styles.icon}
                              ></i>
                              <h3 style={styles.widgetTitle}>
                                Receptionist Performance
                              </h3>
                            </div>
                            <div style={styles.widgetContent}>
                              <table
                                style={{
                                  ...styles.table,
                                  ...styles.tableBordered,
                                }}
                              >
                                <thead>
                                  <tr>
                                    <th
                                      style={{
                                        padding: "8px",
                                        borderBottom: "1px solid #ddd",
                                      }}
                                    >
                                      Booked Appointment
                                    </th>
                                    <th
                                      style={{
                                        padding: "8px",
                                        borderBottom: "1px solid #ddd",
                                      }}
                                    >
                                      Visited
                                    </th>
                                    <th
                                      style={{
                                        padding: "8px",
                                        borderBottom: "1px solid #ddd",
                                      }}
                                    >
                                      DNW
                                    </th>
                                    <th
                                      style={{
                                        padding: "8px",
                                        borderBottom: "1px solid #ddd",
                                      }}
                                    >
                                      DNT
                                    </th>
                                    <th
                                      style={{
                                        padding: "8px",
                                        borderBottom: "1px solid #ddd",
                                      }}
                                    >
                                      Total Enquiries
                                    </th>
                                    <th
                                      style={{
                                        padding: "8px",
                                        borderBottom: "1px solid #ddd",
                                      }}
                                    >
                                      Call Back
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td
                                      style={{
                                        padding: "8px",
                                        borderBottom: "1px solid #ddd",
                                      }}
                                    >
                                      {reportData.bookedAppointments}
                                    </td>
                                    <td
                                      style={{
                                        padding: "8px",
                                        borderBottom: "1px solid #ddd",
                                      }}
                                    >
                                      {reportData.visited}
                                    </td>
                                    <td
                                      style={{
                                        padding: "8px",
                                        borderBottom: "1px solid #ddd",
                                      }}
                                    >
                                      {reportData.dnw}
                                    </td>
                                    <td
                                      style={{
                                        padding: "8px",
                                        borderBottom: "1px solid #ddd",
                                      }}
                                    >
                                      {reportData.dnt}
                                    </td>
                                    <td
                                      style={{
                                        padding: "8px",
                                        borderBottom: "1px solid #ddd",
                                      }}
                                    >
                                      {reportData.totalEnquiries}
                                    </td>
                                    <td
                                      style={{
                                        padding: "8px",
                                        borderBottom: "1px solid #ddd",
                                      }}
                                    >
                                      {reportData.callBack}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </SimpleBar>
    </div>
  );
};

// Add these styles to your component or in a global CSS file
const styles = `
  .custom-calendar {
    font-family: 'Arial', sans-serif;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .custom-calendar .react-datepicker__header {
    background-color: #e3f2fd;
    border-bottom: 1px solid #ddd;
  }

  .custom-calendar .react-datepicker__day--selected {
    background-color: #00acc1;
    color: white;
  }

  .custom-calendar .react-datepicker__day:hover {
    background-color: #e3f2fd;
  }

  .custom-datepicker-wrapper {
    width: 100%;
  }

  .custom-popper {
    z-index: 1000;
  }
`;

// Add this to your document head
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default EnquiryConversion;
