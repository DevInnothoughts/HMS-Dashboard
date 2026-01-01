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
import axios from 'axios';

const styles = {
  widget: {
    marginBottom: '20px',
  },
  widgetHeader: {
    position: 'relative',
    height: '40px',
    lineHeight: '40px',
    background: 'linear-gradient(to bottom, #fafafa 0%, #e9e9e9 100%)',
    border: '1px solid #D5D5D5',
    borderRadius: '4px 4px 0 0',
    padding: '0 15px',
    textShadow: '0 1px 0 #fff',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1),inset 0 1px 0 white,inset 0 -1px 0 rgba(255,255,255,0.7)',
  },
  widgetTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#555',
  },
  widgetContent: {
    padding: '15px',
    background: '#FFF',
    border: '1px solid #D5D5D5',
    borderTop: 'none',
    borderRadius: '0 0 4px 4px',
  },
  table: {
    width: '100%',
    fontSize: '13px',
    marginBottom: '20px',
    backgroundColor: 'transparent',
    borderCollapse: 'collapse',
    borderSpacing: 0,
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  input: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
  }
};

const defaultTableStructure = [
  {
    doctorName: '',
    piles: 0,
    fistula: 0,
    hernia: 0,
    varicoseVeins: 0,
    prolapse: 0,
    circumcision: 0,
    abscess: 0,
    fissure: 0,
    ibs: 0
  }
];

const ReportTable = ({ title, data = defaultTableStructure }) => (
  <div style={styles.widget}>
    <div style={styles.widgetHeader}>
      <i className="icon-th-list"></i>
      <h3 style={styles.widgetTitle}>{title}</h3>
    </div>
    <div style={styles.widgetContent}>
      <Table striped bordered style={styles.table}>
        <thead style={styles.tableHeader}>
          <tr>
            <th style={{ width: "5%" }}>Sr No</th>
            <th style={{ width: "23%" }}>Doctor Name</th>
            <th style={{ width: "9%" }}>Piles</th>
            <th style={{ width: "9%" }}>Fistula</th>
            <th style={{ width: "9%" }}>Hernia</th>
            <th style={{ width: "9%" }}>Varicose Veins</th>
            <th style={{ width: "9%" }}>Prolapse</th>
            <th style={{ width: "9%" }}>Circumcision</th>
            <th style={{ width: "9%" }}>Abscess</th>
            <th style={{ width: "9%" }}>Fissure</th>
            <th style={{ width: "9%" }}>IBS</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 && data[0].doctorName ? (
            data.map((row, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{row.doctorName}</td>
                <td>{row.piles || 0}</td>
                <td>{row.fistula || 0}</td>
                <td>{row.hernia || 0}</td>
                <td>{row.varicoseVeins || 0}</td>
                <td>{row.prolapse || 0}</td>
                <td>{row.circumcision || 0}</td>
                <td>{row.abscess || 0}</td>
                <td>{row.fissure || 0}</td>
                <td>{row.ibs || 0}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" style={{ textAlign: "center", padding: "20px" }}>
                <b>No data available. Please select dates and click Find.</b>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  </div>
);


const ConditionWiseReport = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [assistedData, setAssistedData] = useState(defaultTableStructure);
  const [convertedData, setConvertedData] = useState(defaultTableStructure);
  const [totalPackageData, setTotalPackageData] = useState(defaultTableStructure);
  const [averagePackageData, setAveragePackageData] = useState(defaultTableStructure);
  const [showTables, setShowTables] = useState(false);

  const handleFind = async () => {
    if (!fromDate || !toDate) {
      alert('Please Enter all fields details..');
      return;
    }

    try {
      // Fetch Assisted Data
      const assistedResponse = await axios.post('/receptionist/AssistConditionWiseData', {
        Fromdate: fromDate,
        Todate: toDate
      });
      processAssistedData(assistedResponse.data);

      // Fetch Converted Data
      const convertedResponse = await axios.post('/receptionist/ConditionWiseData', {
        Fromdate: fromDate,
        Todate: toDate
      });
      processConvertedData(convertedResponse.data);
      
      setShowTables(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Condition Wise Report</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            .widget { margin-bottom: 20px; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          ${document.getElementById('divToPrint').innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
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
      <PageBreadcrumb pagename="Condition Wise Report" />

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
                  <h4>Condition Wise Report</h4>
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
                            height: "54px",
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
                  {/* Condition Wise Report Table */}
                  <div id="divToPrint">
                    <ReportTable
                      title="Assisted - Condition Wise Performance"
                      data={assistedData}
                    />
                    <ReportTable
                      title="Converted - Condition Wise Performance"
                      data={convertedData}
                    />
                    <ReportTable
                      title="Total Package - Condition Wise"
                      data={totalPackageData}
                    />
                    <ReportTable
                      title="Average Package - Condition Wise"
                      data={averagePackageData}
                    />
                    <button
                      style={{ ...styles.button, marginTop: "20px" }}
                      onClick={handlePrint}
                    >
                      Print Report
                    </button>
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

export default ConditionWiseReport;
