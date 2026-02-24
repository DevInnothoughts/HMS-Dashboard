import React, { useState, useEffect } from "react";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import SimpleBar from "simplebar-react";
import { Row, Col, Card, Container, Form, Spinner } from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";



// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://localhost:5100/api" // Updated to local API based on previous files

const consultationOptions = [
  "CONSULTATION",
  "Follow-UP",
  "PROCTOSCOPY",
  "MCDPA",
  "COLON HYDROTHERAPY",
  "COLONOSCOPY",
  "USG",
  "USG ABDOMEN AND PELVIS",
  "MANOMETRY",
  "BIOFEEDBACK",
  "ECHODEFECOGRAPHY",
  "USG SCROTUM",
  "UNILATERAL DOPPLER",
  "BILATERAL DOPPLER",
  "PROCEDURE",
  "GASTROSCOPY",
  "3D ENDO ANAL IMAGING",
  "OTHERS",
  "MRI FISTULOGRAM",
  "2D SCAN",
  "LAB",
  "Postoperative",
  "BLOOD TESTS + ECG",
  "DIET",
  "UROFLOWMETRY",
  "DIET PLAN - 1 MONTH",
  "DIET PLAN - 3 MONTH",
  "DIET PLAN - 6 MONTH",
  "ENEMA",
  "MEDICINES",
  "DRESSING",
  "CYSTOSCOPY",
  "POST OPERATIVE FOLLOW UP",
  "POST OPERATIVE DRESSING + CONSULTATION",
];

const OPDReceiptsReport = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [consultation, setConsultation] = useState("");
  const [patientStatus, setPatientStatus] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState(10);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setSearchText(value);
  };

  const fetchReceiptsData = async () => {
    setLoading(true);
    try {
      const url = new URL(`${BASE_URL}/V1/appointment/listReceipt`);
      const today = new Date();

      const formatToDDMMYYYY = (date) => {
        let d = new Date(date);
        return `${String(d.getDate()).padStart(2, "0")}/${String(
          d.getMonth() + 1
        ).padStart(2, "0")}/${d.getFullYear()}`;
      };

      let finalFromDate = fromDate
        ? formatToDDMMYYYY(fromDate)
        : formatToDDMMYYYY(today);
      let finalToDate = toDate
        ? formatToDDMMYYYY(toDate)
        : formatToDDMMYYYY(today);

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
      } else {
        console.error("Error fetching receipts:", data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const excelData = receipts.map((receipt, index) => ({
      "Sr No": index + 1,
      "Date": receipt.date,
      "Patient Name": receipt.patientName,
      "Consultation": receipt.consultation,
      "Patient Status": receipt.patientStatus,
      "Spray Qty": receipt.sprayQty,
      "Payment Mode": receipt.paymentMode,
      "Amount": receipt.amount,
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    saveAs(data, "OPD_Receipts_Report" + fileExtension);
  };


  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("OPD Receipts Report", 14, 15);

    const tableColumn = ["Sr No", "Date", "Patient Name", "Consultation", "Patient Status", "Spray Qty", "Payment Mode", "Amount"];
    const tableRows = receipts.map((receipt, index) => [
      index + 1,
      receipt.date,
      receipt.patientName,
      receipt.consultation,
      receipt.patientStatus,
      receipt.sprayQty,
      receipt.paymentMode,
      receipt.amount,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 172, 193] }
    });

    doc.save("OPD_Receipts_Report.pdf");
  };

  const renderHeader = () => {
    return (
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="d-flex align-items-center" style={{ gap: "20px" }}>
          <div className="d-flex align-items-center">
            <span className="me-1" style={{ fontWeight: "bold", color: "#006064" }}>Show</span>
            <Form.Select
              size="sm"
              style={{ width: "70px", borderRadius: "8px", border: "1px solid #4dd0e1" }}
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Form.Select>
          </div>
          <div className="d-flex align-items-center">
            <span className="me-1" style={{ fontWeight: "bold", color: "#006064" }}>Search</span>
            <span className="p-input-icon-left">
              <InputText
                value={searchText}
                onChange={onGlobalFilterChange}
                placeholder="Global Search..."
                className="p-inputtext-sm"
                style={{ width: "200px", borderRadius: "8px", border: "1px solid #4dd0e1" }}
              />
            </span>
          </div>
        </div>
        <div className="d-flex" style={{ gap: "10px" }}>
          <button
            className="btn btn-success btn-sm"
            onClick={exportToExcel}
            style={{ display: "flex", alignItems: "center", gap: "5px", borderRadius: "8px" }}
          >
            <i className="fa fa-file-excel-o"></i> Download Excel
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={downloadPDF}
            style={{ display: "flex", alignItems: "center", gap: "5px", borderRadius: "8px" }}
          >
            <i className="fa fa-file-pdf-o"></i> Download PDF
          </button>
        </div>
      </div>
    );
  };

  const header = renderHeader();

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
                  border: "1px solid #00bcd4",
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
                  <h4>OPD Receipts Report</h4>
                </Card.Header>
                <Card.Body style={{ padding: "5px" }}>
                  <Row className="align-items-end mb-4 flex-nowrap" style={{ margin: "0 -5px" }}>
                    <Col style={{ padding: "0 5px", flex: "1" }}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ fontWeight: "bold", color: "#006064", whiteSpace: "nowrap", fontSize: "12px" }}>From Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          style={{ border: "2px solid #4dd0e1", borderRadius: "8px", padding: "6px", backgroundColor: "#e0f7fa", fontSize: "12px" }}
                        />
                      </Form.Group>
                    </Col>
                    <Col style={{ padding: "0 5px", flex: "1" }}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ fontWeight: "bold", color: "#006064", whiteSpace: "nowrap", fontSize: "12px" }}>To Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          style={{ border: "2px solid #4dd0e1", borderRadius: "8px", padding: "6px", backgroundColor: "#e0f7fa", fontSize: "12px" }}
                        />
                      </Form.Group>
                    </Col>
                    <Col style={{ padding: "0 5px", flex: "1" }}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ fontWeight: "bold", color: "#006064", whiteSpace: "nowrap", fontSize: "12px" }}>Consultation</Form.Label>
                        <Form.Select
                          size="sm"
                          value={consultation}
                          onChange={(e) => setConsultation(e.target.value)}
                          style={{ border: "2px solid #4dd0e1", borderRadius: "8px", backgroundColor: "#e0f7fa", fontSize: "12px" }}
                        >
                          <option value="">Select</option>
                          {consultationOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col style={{ padding: "0 5px", flex: "1" }}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ fontWeight: "bold", color: "#006064", whiteSpace: "nowrap", fontSize: "12px" }}>Patient Status</Form.Label>
                        <Form.Select
                          size="sm"
                          value={patientStatus}
                          onChange={(e) => setPatientStatus(e.target.value)}
                          style={{ border: "2px solid #4dd0e1", borderRadius: "8px", backgroundColor: "#e0f7fa", fontSize: "12px" }}
                        >
                          <option value="">All</option>
                          <option value="DNC">DNC ( Do not Charge )</option>
                          <option value="DNP">DNP ( Do not Pay )</option>
                          <option value="DNW">DNW ( Do not Wait )</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col style={{ padding: "0 5px", flex: "1" }}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ fontWeight: "bold", color: "#006064", whiteSpace: "nowrap", fontSize: "12px" }}>Payment Mode</Form.Label>
                        <Form.Select
                          size="sm"
                          value={paymentMode}
                          onChange={(e) => setPaymentMode(e.target.value)}
                          style={{ border: "2px solid #4dd0e1", borderRadius: "8px", backgroundColor: "#e0f7fa", fontSize: "12px" }}
                        >
                          <option value="">All</option>
                          <option value="Cash">Cash</option>
                          <option value="Card">Card</option>
                          <option value="Paytm">Paytm</option>
                          <option value="Online">Online</option>
                          <option value="UPI">UPI</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col style={{ padding: "0 5px", flex: "1" }}>
                      <Form.Group className="mb-2">
                        <button
                          className="btn btn-primary"
                          onClick={fetchReceiptsData}
                          disabled={loading}
                          style={{
                            height: "35px",
                            width: "100%",
                            backgroundColor: "#00acc1",
                            borderColor: "#00bcd4",
                            color: "white",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            fontSize: "13px"
                          }}
                        >
                          {loading ? <Spinner animation="border" size="sm" /> : "Search"}
                        </button>
                      </Form.Group>
                    </Col>
                  </Row>

                  <DataTable
                    value={receipts}
                    paginator
                    rows={rows}
                    filters={filters}
                    header={header}
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                    emptyMessage={loading ? "Loading..." : "No records found."}
                    className="p-datatable-sm custom-datatable"
                    style={{ fontSize: "12px" }}
                    rowHover
                    stripedRows
                    responsiveLayout="scroll"
                  >
                    <Column
                      header="Sr No"
                      body={(rowData, { rowIndex }) => rowIndex + 1}
                      style={{ width: "60px", textAlign: "center" }}
                    />
                    <Column field="date" header="Date" />
                    <Column field="patientName" header="Patient Name" />
                    <Column field="consultation" header="Consultation" />
                    <Column field="patientStatus" header="Patient Status" />
                    <Column field="sprayQty" header="Spray Qty" />
                    <Column field="paymentMode" header="Payment Mode" />
                    <Column field="amount" header="Amount" />
                  </DataTable>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </SimpleBar>
      <style>{`
        .custom-datatable .p-datatable-header {
          background: #e0f7fa;
          border: 1px solid #4dd0e1;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          padding: 10px;
        }
        .custom-datatable .p-datatable-thead > tr > th {
          background-color: #b2ebf2 !important;
          color: black !important;
          font-size: 12px;
          padding: 10px 8px !important;
          border: 1px solid #90caf9 !important;
          text-align: center !important;
        }
        .custom-datatable .p-datatable-thead > tr > th * {
          color: black !important;
          justify-content: center !important;
        }
        .custom-datatable .p-datatable-tbody > tr > td {
          font-size: 12px;
          padding: 8px;
          border: 1px solid #90caf9;
          text-align: center !important;
        }
        .custom-datatable .p-paginator {
          background: #f8fdfe;
          border: 1px solid #4dd0e1;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          padding: 5px;
        }
      `}</style>
    </div>
  );
};

export default OPDReceiptsReport;
