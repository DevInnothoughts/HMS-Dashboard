import React, { useState } from "react";
import PageBreadcrumb from "../../componets/PageBreadcrumb";
import { Row, Col, Card, Container, Form } from "react-bootstrap";
import SimpleBar from "simplebar-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BillingReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const billingReport = [
    { date: "2025-01-01", patient: "John Doe", amount: 5000, status: "Paid" },
    {
      date: "2025-01-03",
      patient: "Jane Smith",
      amount: 3000,
      status: "Pending",
    },
    {
      date: "2025-01-05",
      patient: "Bob Williams",
      amount: 7000,
      status: "Paid",
    },
  ];

  const filteredData = billingReport.filter((entry) => {
    const isDateValid =
      (!fromDate || new Date(entry.date) >= new Date(fromDate)) &&
      (!toDate || new Date(entry.date) <= new Date(toDate));
    return isDateValid;
  });

  const handleFindClick = (e) => {
    e.preventDefault();
    console.log(`Filtering Billing Report from ${fromDate} to ${toDate}`);
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
      <PageBreadcrumb pagename="Billing Report" />

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
                  <h4>Billing Report</h4>
                </Card.Header>
                <Card.Body style={{ padding: "25px" }}>
                  <Form onSubmit={handleFindClick}>
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
                              height: "50px",
                              width: "50%",
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

                  <table
                    className="table table-bordered"
                    style={{
                      border: "1px solid #4dd0e1",
                      marginTop: "20px",
                      width: "100%",
                      background: "white",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <thead
                      style={{
                        background:
                          "linear-gradient(to right, #00acc1, #007c91)",
                        color: "white",
                        fontSize: "16px",
                        textAlign: "center",
                      }}
                    >
                      <tr>
                        <th>Date</th>
                        <th>Patient</th>
                        <th>Amount (Rs)</th>
                        <th style={{ textAlign: "center" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.length > 0 ? (
                        filteredData.map((entry, index) => (
                          <tr
                            key={index}
                            style={{
                              backgroundColor:
                                index % 2 === 0 ? "#e0f7fa" : "white",
                              transition: "background-color 0.3s ease",
                            }}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor = "#b2ebf2";
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor =
                                index % 2 === 0 ? "#e0f7fa" : "white";
                            }}
                          >
                            <td
                              style={{ padding: "10px", textAlign: "center" }}
                            >
                              {entry.date}
                            </td>
                            <td
                              style={{ padding: "10px", textAlign: "center" }}
                            >
                              {entry.patient}
                            </td>
                            <td
                              style={{ padding: "10px", textAlign: "center" }}
                            >
                              {entry.amount}
                            </td>
                            <td
                              style={{ padding: "10px", textAlign: "center" }}
                            >
                              {entry.status}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            style={{ textAlign: "center", padding: "10px" }}
                          >
                            No records found for the selected date range.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </SimpleBar>
    </div>
  );
};

export default BillingReport;
