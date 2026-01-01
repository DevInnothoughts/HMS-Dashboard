import React, { useState, useEffect } from "react";
import PageBreadcrumb from "../../componets/PageBreadcrumb";
import SimpleBar from "simplebar-react";
import { Row, Col, Card, Container, Form, Spinner } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import styles

const BASE_URL = "https://your-api.com"; // Replace with actual API URL

const OPDReceiptsReport = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [consultation, setConsultation] = useState("");
  const [patientStatus, setPatientStatus] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReceiptsData = async () => {
    setLoading(true);
    try {
      const url = new URL(`${BASE_URL}/V1/appointment/listReceipt`);
      const today = new Date();

      const formatToDDMMYYYY = (date) => {
        let d = new Date(date);
        return `${String(d.getUTCDate()).padStart(2, "0")}/${String(
          d.getUTCMonth() + 1
        ).padStart(2, "0")}/${d.getUTCFullYear()}`;
      };

      let finalFromDate = fromDate
        ? formatToDDMMYYYY(fromDate)
        : formatToDDMMYYYY(today);
      let finalToDate = toDate
        ? formatToDDMMYYYY(toDate)
        : formatToDDMMYYYY(today);

      console.log("📅 Final From Date (Frontend):", finalFromDate);
      console.log("📅 Final To Date (Frontend):", finalToDate);

      const params = {
        from: finalFromDate,
        to: finalToDate,
        consultation: consultation || undefined,
        patientStatus: patientStatus || undefined,
        paymentMode: paymentMode || undefined,
      };

      Object.keys(params).forEach((key) => {
        if (params[key]) url.searchParams.append(key, params[key]);
      });

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        setReceipts(Array.isArray(data.data) ? data.data : []);
        console.log("📥 Fetched Data:", data.data);
      } else {
        console.error(
          "❌ Error fetching receipts:",
          data.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("❌ Error fetching receipts:", error);
    } finally {
      setLoading(false);
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
      <PageBreadcrumb pagename="OPD Receipts Report" />

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
                    background: "#00acc1",
                    color: "white",
                  }}
                >
                  <h4>OPD Receipts Report</h4>
                </Card.Header>
                <Card.Body style={{ padding: "25px" }}>
                  <Row className="align-items-end">
                    {/* Date Pickers */}
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
                          isClearable
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
                          isClearable
                        />
                      </Form.Group>
                    </Col>

                    {/* Filters */}
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <b>Consultation</b>
                        </Form.Label>
                        <Form.Control
                          as="select"
                          value={consultation}
                          onChange={(e) => setConsultation(e.target.value)}
                        >
                          <option value="">NEW</option>
                          <option value="General">FOLLOW</option>
                          <option value="Specialist">POSTOPERATIVE</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <b>Patient Status</b>
                        </Form.Label>
                        <Form.Control
                          as="select"
                          value={patientStatus}
                          onChange={(e) => setPatientStatus(e.target.value)}
                        >
                          <option value="">All</option>
                          <option value="New">New</option>
                          <option value="Returning">Returning</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <b>Payment Mode</b>
                        </Form.Label>
                        <Form.Control
                          as="select"
                          value={paymentMode}
                          onChange={(e) => setPaymentMode(e.target.value)}
                        >
                          <option value="">All</option>
                          <option value="Cash">Cash</option>
                          <option value="Card">Card</option>
                          <option value="UPI">UPI</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <button
                        className="btn btn-primary mt-3"
                        onClick={fetchReceiptsData}
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
                        {loading ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          "Find"
                        )}
                      </button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Table Section */}
          <div
            className="card mt-4"
            style={{
              borderRadius: "12px",
              boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
              borderColor: "#00bcd4",
              background: "white",
              border: "4px solid #00bcd4",
            }}
          >
            <div className="card-body">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Sr.No</th>
                    <th>Date</th>
                    <th>Patient Name</th>
                    <th>Consultation</th>
                    <th>Patient Status</th>
                    <th>Spray Qty</th>
                    <th>Payment Mode</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        <Spinner animation="border" />
                      </td>
                    </tr>
                  ) : receipts.length > 0 ? (
                    receipts.map((receipt, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{receipt.date}</td>
                        <td>{receipt.patientName}</td>
                        <td>{receipt.consultation}</td>
                        <td>{receipt.patientStatus}</td>
                        <td>{receipt.sprayQty}</td>
                        <td>{receipt.paymentMode}</td>
                        <td>{receipt.amount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Container>
      </SimpleBar>
    </div>
  );
};

export default OPDReceiptsReport;
