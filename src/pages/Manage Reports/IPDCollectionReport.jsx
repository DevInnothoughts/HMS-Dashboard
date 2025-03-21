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

const BASE_URL = "http://192.168.1.46:5000/api";

const IPDCollectionReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [totals, setTotals] = useState({
    cash: 0,
    card: 0,
    cheque: 0,
    online: 0,
    discount: 0,
  });

  const handleFind = async () => {
    if (!fromDate || !toDate) {
      alert("Please Enter the all fields details..");
      return;
    }

    try {
      const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const params = new URLSearchParams({
        Fromdate: formatDate(fromDate),
        Todate: formatDate(toDate),
      });

      const response = await fetch(
        `${BASE_URL}/V1/invoice/listInvoice?${params}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch data");
      }

      const responseData = await response.json();

      // Ensure we have an array of data
      const data = Array.isArray(responseData)
        ? responseData
        : responseData.data && Array.isArray(responseData.data)
        ? responseData.data
        : [];

      console.log("Received data:", data); // Debug log

      // Calculate totals only if we have data
      const newTotals =
        data.length > 0
          ? data.reduce(
              (acc, curr) => ({
                cash: acc.cash + (parseInt(curr.cashamt) || 0),
                card: acc.card + (parseInt(curr.cardamt) || 0),
                cheque: acc.cheque + (parseInt(curr.chequeamt) || 0),
                online: acc.online + (parseInt(curr.onlineamt) || 0),
                discount: acc.discount + (parseInt(curr.discountamt) || 0),
              }),
              { cash: 0, card: 0, cheque: 0, online: 0, discount: 0 }
            )
          : { cash: 0, card: 0, cheque: 0, online: 0, discount: 0 };

      setTotals(newTotals);
      setTableData(data);
      setShowTable(true);

      if (data.length === 0) {
        alert("No records found for the selected date range");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`Failed to fetch data: ${error.message}`);
      setTableData([]);
      setShowTable(false);
      setTotals({ cash: 0, card: 0, cheque: 0, online: 0, discount: 0 });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        fontFamily: "'Poppins', Arial, sans-serif",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      {/* Breadcrumb */}
      <PageBreadcrumb pagename="IPD Collection Report" />

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
                  <h4>IPD Collection Report</h4>
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
                          onClick={handleFind}
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
                  {showTable && (
                    <div className="widget stacked widget-table action-table">
                      <div className="widget-header">
                        <i className="icon-th-list"></i>
                        <h3>IPD Collection</h3>
                      </div>
                      <div className="widget-content">
                        <table className="table table-striped table-bordered">
                          <thead>
                            <tr>
                              <th>Sr No</th>
                              <th>Patient Name</th>
                              <th>Invoice Date</th>
                              <th>Receipt Date</th>
                              <th>Cash</th>
                              <th>Card</th>
                              <th>Cheque</th>
                              <th>Online</th>
                              <th>Discount</th>
                            </tr>
                          </thead>

                          <tbody>
                            {tableData.map((item, index) => (
                              <tr key={index}>
                                <td style={{ width: "6%", color: "black" }}>
                                  {index + 1}
                                </td>
                                <td style={{ width: "16%", color: "black" }}>
                                  {item.patientName}
                                </td>
                                <td style={{ width: "8%", color: "black" }}>
                                  {formatDateDisplay(item.invoicedate)}
                                </td>
                                <td style={{ width: "8%", color: "black" }}>
                                  {formatDateDisplay(item.admission_date)}
                                </td>
                                <td style={{ width: "8%", color: "black" }}>
                                  {item.cashamt}
                                </td>
                                <td style={{ width: "8%", color: "black" }}>
                                  {item.cardamt}
                                </td>
                                <td style={{ width: "8%", color: "black" }}>
                                  {item.chequeno}
                                </td>
                                <td style={{ width: "8%", color: "black" }}>
                                  {item.onlineamt}
                                </td>
                                <td style={{ width: "8%", color: "black" }}>
                                  {item.discount}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        <table className="table table-striped table-bordered">
                          <tbody>
                            <tr>
                              <td style={{ width: "43%" }}>Total</td>
                              <td style={{ width: "9%" }}>{totals.cash}</td>
                              <td style={{ width: "9%" }}>{totals.card}</td>
                              <td style={{ width: "9%" }}>{totals.cheque}</td>
                              <td style={{ width: "9%" }}>{totals.online}</td>
                              <td style={{ width: "9%" }}>{totals.discount}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </SimpleBar>

      {showTable && (
        <div className="form-actions">
          <button className="btn btn-blue" onClick={handlePrint}>
            Print
          </button>
        </div>
      )}
    </div>
  );
};

export default IPDCollectionReport;
