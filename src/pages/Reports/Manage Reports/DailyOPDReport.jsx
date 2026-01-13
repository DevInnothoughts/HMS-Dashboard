import React from "react";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import { Row, Col, Card, Container, Table, Button } from "react-bootstrap";

const reportData = {
  opdCounts: [
    { type: "New", count: 0 },
    { type: "Follow UP", count: 0 },
    { type: "PO", count: 0 },
    { type: "PROCTOSCOPY", count: 0 },
    { type: "TOTAL", count: 0 },
  ],
  opdDetails: [
    { type: "DNC", new: 0, followUp: 0, po: 0, total: 0 },
    { type: "DNP", new: 0, followUp: 0, po: 0, total: 0 },
    { type: "DNW", new: 0, followUp: 0, po: 0, total: 0 },
    { type: "DNT", new: 0, followUp: 0, po: 0, total: 0 },
    { type: "WALK IN", new: 0, followUp: 0, po: 0, total: 0 },
  ],
  collectionDetails: [
    { method: "Cash", amount: 0 },
    { method: "Card", amount: 0 },
    { method: "Online", amount: 0 },
    { method: "Paytm", amount: 0 },
    { method: "TOTAL", amount: 0 },
  ],
  testDetails: [{ testName: "Test A", amount: 0 }],
};

const DailyOPDReport = () => {
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
  const handlePrint = () => {
    window.print();
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
      <style>
        {`
        @media print {
          /* 1. Hide the Sidebar and Top Header */
          /* Note: You may need to inspect your page to find the exact class names */
          .sidebar-wrapper, 
          .page-header, 
          .nav-menu,
          .btn, 
          footer {
            display: none !important;
          }

          /* 2. Reset background colors/gradients for the printer */
          .themebody-wrap {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* 3. Ensure the report takes up the full page width */
          .container-fluid {
            width: 100% !important;
            padding: 0 !important;
          }

          /* 4. Remove shadows and borders from the Card container */
          .card {
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}
      </style>
      <PageBreadcrumb pagename="Daily OPD Report" />
      <Container fluid>
        <Row className="justify-content-center">
          <Col md={12}>
            <Card
              className="shadow-sm"
              style={{
                borderRadius: "12px",
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                borderColor: "#00bcd4",
                background: "white",
                border: "1.5px solid #00bcd4",
              }}
            >
              <Card.Header
                className="text-center"
                style={{
                  fontWeight: "bold",
                  backgroundColor: "#e3f2fd",
                  borderBottom: "2px solid #0288d1",
                  padding: "1rem",
                  background: "#00acc1",
                  color: "white",
                  fontSize: "16px",
                }}
              >
                DAILY OPD REPORT
              </Card.Header>
              <Card.Body style={{ padding: "15px" }}>
                <div className="d-flex justify-content-end">
                  Date: <div className="fw-bold ms-1">{formattedDate}</div>
                </div>
                <Row className="justify-content-center mb-4">
                  <Col xs={12} sm={8} md={6} lg={4}>
                    <Table
                      bordered
                      responsive
                      className="table-sm table-striped mx-auto"
                      style={{
                        border: "1px solid #00bcd4",
                        textAlign: "center",
                        boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
                      }}
                    >
                      <thead
                        style={{
                          backgroundColor: "#0288d1",
                          color: "white",
                          fontSize: "13px",
                        }}
                      >
                        <tr>
                          <th style={{ width: '60%', borderLeft: "1px solid #00bcd4", borderRight: "1px solid #00bcd4" }}>Type</th>
                          <th style={{ width: '40%', borderRight: "1px solid #00bcd4" }}>Total</th>
                        </tr>
                      </thead>
                      <tbody style={{ fontSize: "12px" }}>
                        {reportData.opdCounts.map((item, index) => (
                          <tr key={index}>
                            <td className="fw-bold text-secondary">{item.type}</td>
                            <td>{item.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Col>
                </Row>

                <Row className="justify-content-center mb-4">
                  <Col xs={12} md={10} lg={8}>
                    <Table
                      bordered
                      responsive
                      className="table-sm table-striped mx-auto"
                      style={{
                        border: "1px solid #00bcd4",
                        textAlign: "center",
                        boxShadow: "0px 2px 4px rgba(0,0,0,0.05)"
                      }}
                    >
                      <thead
                        style={{
                          backgroundColor: "#0288d1",
                          color: "white",
                          fontSize: "13px",
                        }}
                      >
                        <tr>
                          <th style={{ borderLeft: "1px solid #00bcd4", borderRight: "1px solid #00bcd4" }}>Type</th>
                          <th style={{ borderLeft: "1px solid #00bcd4", borderRight: "1px solid #00bcd4" }}>New</th>
                          <th style={{ borderLeft: "1px solid #00bcd4", borderRight: "1px solid #00bcd4" }}>Follow UP</th>
                          <th style={{ borderLeft: "1px solid #00bcd4", borderRight: "1px solid #00bcd4" }}>PO</th>
                          <th style={{ borderRight: "1px solid #00bcd4" }}>Total</th>
                        </tr>
                      </thead>
                      <tbody style={{ fontSize: "12px" }}>
                        {reportData.opdDetails.map((item, index) => (
                          <tr key={index}>
                            <td className="fw-bold text-secondary" >
                              {item.type}
                            </td>
                            <td>{item.new}</td>
                            <td>{item.followUp}</td>
                            <td>{item.po}</td>
                            <td>{item.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Col>
                </Row>

                <Row className="justify-content-center mb-4">
                  <Col xs={12} sm={8} md={6} lg={4}>
                    <Table
                      bordered
                      responsive
                      className="table-sm table-striped mx-auto"
                      style={{
                        border: "1px solid #00bcd4",
                        textAlign: "center",
                        boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
                        maxWidth: "300px",
                        margin: "0 auto"
                      }}
                    >
                      <thead
                        style={{
                          backgroundColor: "#0288d1",
                          color: "white",
                          fontSize: "13px",
                        }}
                      >
                        <tr>
                          <th style={{ borderLeft: "1px solid #00bcd4", borderRight: "1px solid #00bcd4" }}>Test</th>
                          <th style={{ borderRight: "1px solid #00bcd4" }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody style={{ fontSize: "12px" }}>
                        {reportData.testDetails.map((item, index) => (
                          <tr key={index}>
                            <td className="fw-bold text-secondary">{item.testName}</td>
                            <td>₹ {item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Col>
                </Row>

                <Row className="justify-content-center">
                  {[
                    { title: "Overall Collection Detail(Rs)", data: reportData.collectionDetails },
                    { title: "LAB Collection Detail(Rs)", data: reportData.collectionDetails },
                    { title: "Pharmacy Collection Detail(Rs)", data: reportData.collectionDetails },
                  ].map((section, idx) => (
                    <Col key={idx} xs={12} lg={4} className="mb-4">
                      <Table
                        bordered
                        responsive
                        className="table-sm table-striped mx-auto"
                        style={{
                          border: "1px solid #00bcd4",
                          textAlign: "center",
                          fontSize: "13px",
                          backgroundColor: "white"
                        }}
                      >
                        <thead>
                          <tr style={{ backgroundColor: "#e3f2fd" }}>
                            <th colSpan="2" style={{ textAlign: "left", paddingLeft: "10px", borderRight: "1px solid #00bcd4", borderLeft: "1px solid #00bcd4" }}>
                              {section.title}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.data.map((item, index) => (
                            <tr key={index}>
                              <td
                                className={`fw-bold ${item.method === "TOTAL" ? "" : "text-secondary"}`}
                                style={{
                                  textAlign: "left",
                                  paddingLeft: "10px",
                                  width: "70%"
                                }}
                              >
                                {item.method}
                              </td>
                              <td style={{ width: "30%", fontWeight: item.method === "TOTAL" ? "bold" : "normal" }}>
                                {item.amount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
              <Card.Footer
                className="text-center"
                style={{
                  padding: "1rem",
                  borderTop: "1px solid #0288d1",
                }}
              >
                <Button
                  variant="primary"
                  style={{ border: "none" }}
                  onClick={handlePrint}
                >
                  Print Report
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DailyOPDReport;
