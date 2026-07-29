import React, { useState, useEffect, useCallback } from "react";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import {
  Row,
  Col,
  Card,
  Container,
  Table,
  Button,
  Spinner,
} from "react-bootstrap";
import { decodeJwt } from "../../../utils/decode-jwt";
import { FaPrint } from "react-icons/fa";

// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://194.195.117.79:5100/api";

const initialReportState = {
  opdCounts: [],
  opdDetails: [],
  overallCollectionDetails: [],
  labCollectionDetails: [],
  pharmacyCollectionDetails: [],
  opdCollectionDetails: [],
  testDetails: [],
};

const formatDateIST = (date) => {
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(date.getTime() + istOffsetMs);
  const year = istTime.getUTCFullYear();
  const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(istTime.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDisplayDateIST = (date) => {
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(date.getTime() + istOffsetMs);
  const day = String(istTime.getUTCDate()).padStart(2, '0');
  const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
  const year = istTime.getUTCFullYear();
  return `${day}-${month}-${year}`;
};

const formatAmount = (val) => {
  if (val === null || val === undefined || val === "" || val === "N/A" || val === 0 || val === "0" || val === "-") {
    return "-";
  }
  const parsed = parseFloat(val);
  return isNaN(parsed) ? val : `₹ ${Math.round(parsed).toLocaleString("en-IN")}`;
};

const DailyOPDReport = () => {
  const [reportData, setReportData] = useState(initialReportState);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState("");

  // 1. Memoize or format the date only once, or handle it inside the fetch
  const today = new Date();
  const formattedDate = formatDisplayDateIST(today);

  // 2. Remove 'selectedDate' from the useCallback dependencies
  const fetchDailyReport = useCallback(
    async (currentLocation, isBackground = false) => {
      try {
        if (!isBackground) setLoading(true);

        // Define the static date string here so it doesn't trigger re-renders
        const today = new Date();
        const apiDate = formatDateIST(today);

        const response = await fetch(
          `${BASE_URL}/V1/daily-opd-report?location=${currentLocation}&date=${apiDate}`,
        );
        const result = await response.json();

        if (result.statusCode === 200) {
          const d = result.description;
          setReportData({
            opdCounts: [
              { type: "New", count: d.dailyOPDReport[0][0] },
              { type: "Follow UP", count: d.dailyOPDReport[0][1] },
              { type: "PO", count: d.dailyOPDReport[0][2] },
              { type: "PROCTOSCOPY", count: d.dailyOPDReport[0][3] },
              { type: "MCDPA", count: d.dailyOPDReport[0][5] || 0 },
              { type: "TOTAL", count: d.dailyOPDReport[0][4] },
            ],
            opdDetails: d.detailedData.map((row, index) => {
              const labels = [
                "DNC",
                "DNP",
                "DNW",
                "DNT",
                "ONLY REGISTRATION",
                "WALK IN",
              ];
              return {
                type: labels[index],
                new: row[0],
                followUp: row[1],
                po: row[2],
                total: row[3],
              };
            }),
            overallCollectionDetails: d.overallCollection.map((item) => ({
              method: item[0],
              amount: item[1],
            })),
            labCollectionDetails: d.labCollection.map((item) => ({
              method: item[0],
              amount: item[1],
            })),
            pharmacyCollectionDetails: d.pharmacyCollection.map((item) => ({
              method: item[0],
              amount: item[1],
            })),
            opdCollectionDetails: (d.opdCollection || []).map((item) => ({
              method: item[0],
              amount: item[1],
            })),
            testDetails: d.testReport.map((test) => ({
              testName: test[0],
              amount: test[1],
            })),
          });
        }
      } catch (error) {
        console.error("Error setting report data:", error);
      } finally {
        if (!isBackground) setLoading(false);
      }
    },
    [],
  ); // Empty dependency array means this function is created only once

  // 3. Effect triggers only when the function or identity changes (which is now never)
  useEffect(() => {
    const token = localStorage.getItem("token");
    let loc = "";
    if (token) {
      const payload = decodeJwt(token);
      if (payload?.jobLocation) {
        loc = payload.jobLocation;
        setCurrentLocation(loc);
        fetchDailyReport(loc);
      }
    }

    // Auto-refresh data every 15 seconds in the background
    const interval = setInterval(() => {
      if (loc) {
        fetchDailyReport(loc, true);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchDailyReport]);

  // const handlePrint = () => {
  //   window.print();
  // };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=1000,height=900");

    const buildCollectionTableContent = (title, data) => `
      <table class="table table-bordered table-sm table-striped mx-auto"
        style="border:1px solid #00bcd4; background:white; font-size:13px; text-align:center; border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color:#e3f2fd !important;">
            <th colspan="2" style="background-color:#e3f2fd !important; color:#000 !important; text-align:left; padding-left:10px; border-right:1px solid #00bcd4 !important; border-left:1px solid #00bcd4 !important;">
              ${title}
            </th>
          </tr>
        </thead>
        <tbody>
          ${data
        .map(
          (item) => `
            <tr>
              <td style="text-align:left;padding-left:10px;width:70%;
                  font-weight:bold;
                  color:${item.method?.toUpperCase() === "TOTAL" ? "inherit" : "#343030ff"} !important;">
                ${item.method}
              </td>
              <td style="width:30%;
                  font-weight:${item.method?.toUpperCase() === "TOTAL" ? "bold" : "normal"};">
                ${formatAmount(item.amount)}
              </td>
            </tr>
          `,
        )
        .join("")}
        </tbody>
      </table>
    `;

    const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Daily OPD Report - ${formattedDate}</title>
  
    <!-- Bootstrap CSS (for Row/Col exact behavior) -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

      body { 
        font-family: 'Poppins', Arial, sans-serif;
        background: white; 
        padding: 5px; 
      }
  
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          zoom: 0.85; /* Scale down the whole page to fit perfectly */
        }
        .card {
          page-break-inside: avoid;
        }
      }
      table { border-collapse: collapse; width: 100%; border: 1px solid #00bcd4 !important; }
      th, td { 
        border: 1px solid #00bcd4 !important; 
        padding: 2px 4px !important; /* Aggressively reduce padding */
      }

      .card-header {
        background-color: #00acc1 !important;
        color: white !important;
      }
    </style>
  </head>
  
  <body>
  
  <div class="row">
    <div class="col-12">
  
      <div class="card shadow-sm"
        style="border-radius:12px;
               box-shadow:0px 6px 12px rgba(0,0,0,0.15);
               border:1.5px solid #00bcd4;
               width: 100%;">
  
        <div class="card-header text-center"
          style="font-weight:bold;
                 font-size:16px;
                 border-bottom:2px solid #0288d1;">
          DAILY OPD REPORT
        </div>
  
        <div class="card-body" style="padding:15px;">
  
          <div class="d-flex justify-content-end mb-2">
            Date: <b class="ms-1">${formattedDate}</b>
          </div>
  
          <!-- OPD COUNT -->
          <div class="row justify-content-center mb-2">
            <div class="col-6">
              <table class="table table-sm table-striped text-center"
                style="border:1px solid #00bcd4; border-collapse: collapse; width: 100%;">
                <thead style="background:#e3f2fd;color:#000;font-size:13px;">
                  <tr>
                    <th style="background-color:#e3f2fd !important; color:#000 !important; width:60%; border-right:1px solid #00bcd4 !important; border-left:1px solid #00bcd4 !important;">Type</th>
                    <th style="background-color:#e3f2fd !important; color:#000 !important; width:40%; border-right:1px solid #00bcd4 !important; border-left:1px solid #00bcd4 !important;">Total</th>
                  </tr>
                </thead>
                <tbody style="font-size:12px;">
                  ${reportData.opdCounts
        .map(
          (i) => `
                    <tr>
                      <td class="fw-bold" style="color:${i.type === "TOTAL" ? "#000" : "#343030ff"} !important;">${i.type}</td>
                      <td style="font-weight:${i.type === "TOTAL" ? "bold" : "normal"};">${i.count}</td>
                    </tr>
                  `,
        )
        .join("")}
                </tbody>
              </table>
            </div>
          </div>
  
          <!-- OPD DETAILS -->
          <div class="row justify-content-center mb-2">
            <div class="col-10">
              <table class="table table-sm table-striped text-center"
                style="border:1px solid #00bcd4; border-collapse: collapse; width: 100%;">
                <thead style="background:#e3f2fd;color:#000;font-size:13px;">
                  <tr>
                    <th style="background-color:#e3f2fd !important; color:#000 !important; border-right:1px solid #00bcd4 !important; border-left:1px solid #00bcd4 !important;">Type</th>
                    <th style="background-color:#e3f2fd !important; color:#000 !important; border-right:1px solid #00bcd4 !important; border-left:1px solid #00bcd4 !important;">New</th>
                    <th style="background-color:#e3f2fd !important; color:#000 !important; border-right:1px solid #00bcd4 !important; border-left:1px solid #00bcd4 !important;">Follow UP</th>
                    <th style="background-color:#e3f2fd !important; color:#000 !important; border-right:1px solid #00bcd4 !important; border-left:1px solid #00bcd4 !important;">PO</th>
                    <th style="background-color:#e3f2fd !important; color:#000 !important; border-right:1px solid #00bcd4 !important; border-left:1px solid #00bcd4 !important;">Total</th>
                  </tr>
                </thead>
                <tbody style="font-size:12px;">
                  ${reportData.opdDetails
        .map(
          (i) => `
                    <tr>
                      <td class="fw-bold" style="color:#000 !important;">${i.type}</td>
                      <td>${i.new}</td>
                      <td>${i.followUp}</td>
                      <td>${i.po}</td>
                      <td>${i.total}</td>
                    </tr>
                  `,
        )
        .join("")}
                </tbody>
              </table>
            </div>
          </div>
  
          <!-- TEST DETAILS -->
          <div class="row justify-content-center mb-2">
            <div class="col-6">
              <table class="table table-sm table-striped text-center"
                style="border:1px solid #00bcd4; border-collapse: collapse; width: 100%;">
                <thead style="background:#e3f2fd;color:#000;font-size:13px;">
                  <tr>
                    <th style="background-color:#e3f2fd !important; color:#000 !important; border-right:1px solid #00bcd4 !important; border-left:1px solid #00bcd4 !important;">Test</th>
                    <th style="background-color:#e3f2fd !important; color:#000 !important; border-right:1px solid #00bcd4 !important; border-left:1px solid #00bcd4 !important;">Amount</th>
                  </tr>
                </thead>
                <tbody style="font-size:12px;">
                  ${reportData.testDetails
        .map(
          (i) => `
                    <tr>
                       <td class="fw-bold" style="color:#000 !important;">${i.testName}</td>
                       <td>${formatAmount(i.amount)}</td>
                     </tr>
                  `,
        )
        .join("")}
                </tbody>
              </table>
            </div>
          </div>
  
          <!-- COLLECTIONS -->
          <div class="row justify-content-center">
            <div class="col-4 mb-2">
              ${buildCollectionTableContent("OPD Collection Details(Rs)", reportData.opdCollectionDetails)}
            </div>
            <div class="col-4 mb-2">
              ${buildCollectionTableContent("LAB Collection Details(Rs)", reportData.labCollectionDetails)}
              <div style="margin-top: 25px;"></div>  
              ${buildCollectionTableContent("Overall Collection Details(Rs)", reportData.overallCollectionDetails)}
            </div>
            <div class="col-4 mb-2">
              ${buildCollectionTableContent("Pharmacy Collection Details(Rs)", reportData.pharmacyCollectionDetails)}
            </div>
          </div>
  
        </div>
      </div>
    </div>
  </div>
  
  <script>
  window.onload = function() {
    window.print();
    setTimeout(() => window.close(), 500);
  };
  </script>
  
  </body>
  </html>
  `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" variant="info" />
      </div>
    );
  }

  return (
    <div
      className="themebody-wrap"
      style={{
        padding: "10px",
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
                className="d-flex justify-content-between align-items-center"
                style={{
                  fontWeight: "bold",
                  backgroundColor: "#e3f2fd",
                  borderBottom: "2px solid #0288d1",
                  padding: "0.5rem 1.2rem",
                  background: "#00acc1",
                  color: "white",
                  fontSize: "16px",
                }}
              >
                <div style={{ width: "120px" }}></div>
                <div style={{ flexGrow: 1, textAlign: "center" }}>DAILY OPD REPORT</div>
                <Button
                  variant="warning"
                  size="sm"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontWeight: "bold",
                  }}
                  onClick={handlePrint}
                >
                  <FaPrint /> Print Report
                </Button>
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
                          backgroundColor: "#e3f2fd",
                          color: "#000",
                          fontSize: "13px",
                        }}
                      >
                        <tr>
                          <th
                            style={{
                              width: "60%",
                              borderLeft: "1px solid #00bcd4",
                              borderRight: "1px solid #00bcd4",
                            }}
                          >
                            Type
                          </th>
                          <th
                            style={{
                              width: "40%",
                              borderRight: "1px solid #00bcd4",
                            }}
                          >
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody style={{ fontSize: "12px" }}>
                        {reportData.opdCounts.map((item, index) => (
                          <tr key={index}>
                            <td className={`fw-bold ${item.type === "TOTAL" ? "text-dark" : "text-secondary"}`}>
                              {item.type}
                            </td>
                            <td className={item.type === "TOTAL" ? "fw-bold" : ""}>
                              {item.count}
                            </td>
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
                        boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
                      }}
                    >
                      <thead
                        style={{
                          backgroundColor: "#e3f2fd",
                          color: "#000",
                          fontSize: "13px",
                        }}
                      >
                        <tr>
                          <th
                            style={{
                              borderLeft: "1px solid #00bcd4",
                              borderRight: "1px solid #00bcd4",
                            }}
                          >
                            Type
                          </th>
                          <th
                            style={{
                              borderLeft: "1px solid #00bcd4",
                              borderRight: "1px solid #00bcd4",
                            }}
                          >
                            New
                          </th>
                          <th
                            style={{
                              borderLeft: "1px solid #00bcd4",
                              borderRight: "1px solid #00bcd4",
                            }}
                          >
                            Follow UP
                          </th>
                          <th
                            style={{
                              borderLeft: "1px solid #00bcd4",
                              borderRight: "1px solid #00bcd4",
                            }}
                          >
                            PO
                          </th>
                          <th style={{ borderRight: "1px solid #00bcd4" }}>
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody style={{ fontSize: "12px" }}>
                        {reportData.opdDetails.map((item, index) => (
                          <tr key={index}>
                            <td className="fw-bold text-secondary">
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
                        margin: "0 auto",
                      }}
                    >
                      <thead
                        style={{
                          backgroundColor: "#e3f2fd",
                          color: "#000",
                          fontSize: "13px",
                        }}
                      >
                        <tr>
                          <th
                            style={{
                              borderLeft: "1px solid #00bcd4",
                              borderRight: "1px solid #00bcd4",
                            }}
                          >
                            Test
                          </th>
                          <th style={{ borderRight: "1px solid #00bcd4" }}>
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody style={{ fontSize: "12px" }}>
                        {reportData.testDetails.map((item, index) => (
                          <tr key={index}>
                             <td className="fw-bold text-secondary">
                               {item.testName}
                             </td>
                             <td>{formatAmount(item.amount)}</td>
                           </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Col>
                </Row>

                <Row className="justify-content-center">
                  {/* OPD Collection Details */}
                  <Col xs={12} lg={4} className="mb-4">
                    <Table
                      bordered
                      responsive
                      className="table-sm table-striped mx-auto"
                      style={{
                        border: "1px solid #00bcd4",
                        textAlign: "center",
                        fontSize: "13px",
                        backgroundColor: "white",
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: "#e3f2fd" }}>
                          <th
                            colSpan="2"
                            style={{
                              textAlign: "left",
                              paddingLeft: "10px",
                              borderRight: "1px solid #00bcd4",
                              borderLeft: "1px solid #00bcd4",
                            }}
                          >
                            OPD Collection Details(Rs)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.opdCollectionDetails.map((item, index) => (
                          <tr key={index}>
                            <td
                              className={`fw-bold ${item.method?.toUpperCase() === "TOTAL" ? "" : "text-secondary"}`}
                              style={{
                                textAlign: "left",
                                paddingLeft: "10px",
                                width: "70%",
                              }}
                            >
                              {item.method}
                            </td>
                            <td
                              style={{
                                width: "30%",
                                fontWeight:
                                  item.method?.toUpperCase() === "TOTAL" ? "bold" : "normal",
                              }}
                            >
                              {formatAmount(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Col>

                  {/* LAB & Overall Collection Details */}
                  <Col xs={12} lg={4} className="mb-4">
                    {/* LAB Collection Details */}
                    <Table
                      bordered
                      responsive
                      className="table-sm table-striped mx-auto mb-3"
                      style={{
                        border: "1px solid #00bcd4",
                        textAlign: "center",
                        fontSize: "13px",
                        backgroundColor: "white",
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: "#e3f2fd" }}>
                          <th
                            colSpan="2"
                            style={{
                              textAlign: "left",
                              paddingLeft: "10px",
                              borderRight: "1px solid #00bcd4",
                              borderLeft: "1px solid #00bcd4",
                            }}
                          >
                            LAB Collection Details(Rs)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.labCollectionDetails.map((item, index) => (
                          <tr key={index}>
                            <td
                              className={`fw-bold ${item.method?.toUpperCase() === "TOTAL" ? "" : "text-secondary"}`}
                              style={{
                                textAlign: "left",
                                paddingLeft: "10px",
                                width: "70%",
                              }}
                            >
                              {item.method}
                            </td>
                            <td
                              style={{
                                width: "30%",
                                fontWeight:
                                  item.method?.toUpperCase() === "TOTAL" ? "bold" : "normal",
                              }}
                            >
                              {formatAmount(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>

                    {/* Overall Collection Details */}
                    <Table
                      bordered
                      responsive
                      className="table-sm table-striped mx-auto"
                      style={{
                        border: "1px solid #00bcd4",
                        textAlign: "center",
                        fontSize: "13px",
                        backgroundColor: "white",
                        marginTop: "20px"
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: "#e3f2fd" }}>
                          <th
                            colSpan="2"
                            style={{
                              textAlign: "left",
                              paddingLeft: "10px",
                              borderRight: "1px solid #00bcd4",
                              borderLeft: "1px solid #00bcd4",
                            }}
                          >
                            Overall Collection Details(Rs)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.overallCollectionDetails.map((item, index) => (
                          <tr key={index}>
                            <td
                              className={`fw-bold ${item.method?.toUpperCase() === "TOTAL" ? "" : "text-secondary"}`}
                              style={{
                                textAlign: "left",
                                paddingLeft: "10px",
                                width: "70%",
                              }}
                            >
                              {item.method}
                            </td>
                            <td
                              style={{
                                width: "30%",
                                fontWeight:
                                  item.method?.toUpperCase() === "TOTAL" ? "bold" : "normal",
                              }}
                            >
                              {formatAmount(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Col>

                  {/* Pharmacy Collection Details */}
                  <Col xs={12} lg={4} className="mb-4">
                    <Table
                      bordered
                      responsive
                      className="table-sm table-striped mx-auto"
                      style={{
                        border: "1px solid #00bcd4",
                        textAlign: "center",
                        fontSize: "13px",
                        backgroundColor: "white",
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: "#e3f2fd" }}>
                          <th
                            colSpan="2"
                            style={{
                              textAlign: "left",
                              paddingLeft: "10px",
                              borderRight: "1px solid #00bcd4",
                              borderLeft: "1px solid #00bcd4",
                            }}
                          >
                            Pharmacy Collection Details(Rs)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.pharmacyCollectionDetails.map((item, index) => (
                          <tr key={index}>
                            <td
                              className={`fw-bold ${item.method?.toUpperCase() === "TOTAL" ? "" : "text-secondary"}`}
                              style={{
                                textAlign: "left",
                                paddingLeft: "10px",
                                width: "70%",
                              }}
                            >
                              {item.method}
                            </td>
                            <td
                              style={{
                                width: "30%",
                                fontWeight:
                                  item.method?.toUpperCase() === "TOTAL" ? "bold" : "normal",
                              }}
                            >
                              {formatAmount(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Col>
                </Row>

              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DailyOPDReport;
