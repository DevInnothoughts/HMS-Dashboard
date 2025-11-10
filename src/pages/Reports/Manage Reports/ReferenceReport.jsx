import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Container,
  Table,
  Form,
  Button,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PageBreadcrumb from "../../componets/PageBreadcrumb";
import SimpleBar from "simplebar-react";

const ReferenceReport = () => {
  // State for form inputs
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Placeholder data for enquiry data (can be replaced with real API data)
  const enquiryData = [
    {
      date: "2025-01-01",
      customer: "John Smith",
      enquiryType: "Service Inquiry",
    },
  ];

  // Filter data based on selected dates
  const filteredData = enquiryData.filter((entry) => {
    const isDateValid =
      (!fromDate || new Date(entry.date) >= new Date(fromDate)) &&
      (!toDate || new Date(entry.date) <= new Date(toDate));
    return isDateValid;
  });

  // Handle Find button click
  const handleFindClick = () => {
    console.log(`Filtering enquiry data from ${fromDate} to ${toDate}`);
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
      <PageBreadcrumb pagename="Reference Report" />

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
                    fontSize: "22px",
                    color: "#006064",
                    background: "linear-gradient(to right, #4dd0e1, #00acc1)",
                    borderBottom: "3px solid #00bcd4",
                    padding: "1rem",
                    backgroundColor: "white",
                  }}
                >
                  <h4>Reference Report</h4>
                </Card.Header>
                <Card.Body>
                  {/* Filters */}
                  <Form className="mb-4">
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
                        <Button
                          variant="primary"
                          onClick={handleFindClick}
                          className="w-100"
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
                        >
                          Find
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                  <br />
                  <br />
                  {/* Enquiry Data Table */}
                  <Table
                    striped
                    bordered
                    hover
                    className="mt-4"
                    style={{ textAlign: "center" }}
                  >
                    <thead className="thead-light">
                      <tr>
                        <th>Date</th>
                        <th>Customer</th>
                        <th style={{ textAlign: "center" }}>Enquiry Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.length > 0 ? (
                        filteredData.map((entry, index) => (
                          <tr key={index}>
                            <td>{entry.date}</td>
                            <td>{entry.customer}</td>
                            <td style={{ textAlign: "center" }}>
                              {entry.enquiryType}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="3"
                            className="text-center"
                            style={{ color: "red" }}
                          >
                            No records found for the selected date range.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </SimpleBar>
    </div>
  );
};

export default ReferenceReport;