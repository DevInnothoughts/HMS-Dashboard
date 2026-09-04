import React, { useState, useEffect } from "react";
import { Row, Col, Card, Container, Form, Spinner } from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import SimpleBar from "simplebar-react";
import { decodeJwt } from "../../Utility/decode-jwt";

const BASE_URL = "http://localhost:5100/api";

const formatValue = (val) => {
  if (val === null || val === undefined || val === "" || val === "N/A" || val === 0 || val === "0" || val === "-") {
    return "-";
  }
  return val;
};

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }
  } catch (e) {
    // fallback
  }
  const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  return datePart.split("-").reverse().join("-");
};

const DiagnosisReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [selectedAdviceType, setSelectedAdviceType] = useState("All");
  
  const [doctorsList, setDoctorsList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState(10);
  const [currentLocation, setCurrentLocation] = useState("default");

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload?.jobLocation) {
        setCurrentLocation(payload.jobLocation);
        fetchDoctors(payload.jobLocation);
      } else {
        fetchDoctors("default");
      }
    } else {
      fetchDoctors("default");
    }
  }, []);

  const fetchDoctors = async (location) => {
    try {
      const response = await fetch(`${BASE_URL}/V1/doctorreports/getDoctors?location=${location}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const result = await response.json();
      if (result.statusCode === 200 && Array.isArray(result.data)) {
        setDoctorsList(result.data);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setSearchText(value);
  };

  const handleFind = async (e) => {
    if (e) e.preventDefault();
    if (!fromDate || !toDate) {
      alert("Please select From Date and To Date.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/V1/doctorreports/getDiagnosisReport`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          location: currentLocation,
          Fromdate: fromDate,
          Todate: toDate,
          doctorId: selectedDoctor,
          condition: selectedCondition,
          adviceType: selectedAdviceType,
        }),
      });

      const result = await response.json();
      if (result.statusCode === 200 && Array.isArray(result.data)) {
        setTableData(result.data);
        if (result.data.length === 0) {
          alert("No records found for the selected criteria.");
        }
      } else {
        alert(result.message || "Failed to fetch diagnosis report");
        setTableData([]);
      }
    } catch (error) {
      console.error("Search Error:", error);
      alert("Error connecting to server");
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setSelectedDoctor("All");
    setSelectedCondition("All");
    setSelectedAdviceType("All");
    setTableData([]);
    setSearchText("");
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const getFilteredData = () => {
    if (!searchText) return tableData;
    const query = searchText.toLowerCase().trim();
    return tableData.filter((item) => {
      const dt = formatDateDisplay(item.visitDate).toLowerCase();
      const pName = String(item.patientName || "").toLowerCase();
      const diag = String(item.diagnosis || "").toLowerCase();
      const grd = String(item.grade || "").toLowerCase();
      const adv = String(item.adviceType || "").toLowerCase();
      const cons = String(item.consultant || "").toLowerCase();
      const asst = String(item.assistingDoctor || "").toLowerCase();

      return (
        dt.includes(query) ||
        pName.includes(query) ||
        diag.includes(query) ||
        grd.includes(query) ||
        adv.includes(query) ||
        cons.includes(query) ||
        asst.includes(query)
      );
    });
  };

  const filteredData = getFilteredData();

  const exportToExcel = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const excelData = filteredData.map((item, index) => ({
      "Sr No": index + 1,
      "Visit Date": formatDateDisplay(item.visitDate),
      "Patient Name": item.patientName || "General Patient",
      Diagnosis: item.diagnosis || "General",
      Grade: item.grade || "-",
      "Advice Type": item.adviceType || "-",
      Consultant: item.consultant || "N/A",
      "Assisting Doctor": item.assistingDoctor || "N/A",
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    saveAs(data, "Diagnosis_Report" + fileExtension);
  };

  const renderHeader = () => (
    <div className="d-flex justify-content-between align-items-center mb-1">
      <div className="d-flex align-items-center" style={{ gap: "20px" }}>
        <div className="d-flex align-items-center">
          <span
            className="me-1"
            style={{ fontWeight: "bold", color: "#006064", fontSize: "12px" }}
          >
            Show
          </span>
          <Form.Select
            size="sm"
            style={{
              width: "70px",
              borderRadius: "8px",
              border: "1px solid #4dd0e1",
              fontSize: "12px",
            }}
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
          <span
            className="me-1"
            style={{ fontWeight: "bold", color: "#006064", fontSize: "12px" }}
          >
            Search
          </span>
          <span className="p-input-icon-left">
            <InputText
              value={searchText}
              onChange={onGlobalFilterChange}
              placeholder="Global Search..."
              className="p-inputtext-sm"
              style={{
                width: "200px",
                borderRadius: "8px",
                border: "1px solid #4dd0e1",
                fontSize: "12px",
              }}
            />
          </span>
        </div>
      </div>
      <div className="d-flex" style={{ gap: "10px" }}>
        <button
          className="btn btn-success btn-sm"
          onClick={exportToExcel}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            borderRadius: "8px",
            fontWeight: "600",
            marginBottom: "12px",
          }}
        >
          <i className="fa fa-file-excel-o"></i> Download Excel
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={handlePrint}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            borderRadius: "8px",
            fontWeight: "600",
            marginBottom: "12px",
          }}
        >
          <i className="fa fa-print"></i> Print Report
        </button>
      </div>
    </div>
  );

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
      <PageBreadcrumb pagename="Diagnosis Report" />

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
                    padding: "0.8rem",
                    background: "linear-gradient(to right, #00acc1, #007c91)",
                    color: "white",
                    fontSize: "16px",
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: "18px" }}>Diagnosis Report</h4>
                  {fromDate && toDate && (
                    <div style={{ fontSize: "13px", fontWeight: "normal", marginTop: "5px" }}>
                      Date Range: <b>{formatDateDisplay(fromDate)}</b> to <b>{formatDateDisplay(toDate)}</b>
                    </div>
                  )}
                </Card.Header>
                <Card.Body style={{ padding: "5px" }}>
                  <Form onSubmit={handleFind} className="no-print">
                    <Row
                      className="align-items-end mb-4 flex-wrap"
                      style={{ margin: "0 -5px", rowGap: "10px" }}
                    >
                      <Col style={{ padding: "0 5px", flex: "1 1 150px" }}>
                        <Form.Group className="mb-2">
                          <Form.Label
                            style={{
                              fontWeight: "bold",
                              color: "#006064",
                              fontSize: "12px",
                            }}
                          >
                            From Date
                          </Form.Label>
                          <Form.Control
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            style={{
                              border: "2px solid #4dd0e1",
                              borderRadius: "8px",
                              padding: "6px",
                              backgroundColor: "#e0f7fa",
                              fontSize: "12px",
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1 1 150px" }}>
                        <Form.Group className="mb-2">
                          <Form.Label
                            style={{
                              fontWeight: "bold",
                              color: "#006064",
                              fontSize: "12px",
                            }}
                          >
                            To Date
                          </Form.Label>
                          <Form.Control
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            style={{
                              border: "2px solid #4dd0e1",
                              borderRadius: "8px",
                              padding: "6px",
                              backgroundColor: "#e0f7fa",
                              fontSize: "12px",
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1 1 160px" }}>
                        <Form.Group className="mb-2">
                          <Form.Label
                            style={{
                              fontWeight: "bold",
                              color: "#006064",
                              fontSize: "12px",
                            }}
                          >
                            Doctor
                          </Form.Label>
                          <Form.Select
                            value={selectedDoctor}
                            onChange={(e) => setSelectedDoctor(e.target.value)}
                            style={{
                              border: "2px solid #4dd0e1",
                              borderRadius: "8px",
                              padding: "6px",
                              backgroundColor: "#e0f7fa",
                              fontSize: "12px",
                            }}
                          >
                            <option value="All">All Doctors</option>
                            {doctorsList.map((doc) => (
                              <option key={doc.id} value={doc.id}>
                                {doc.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1 1 160px" }}>
                        <Form.Group className="mb-2">
                          <Form.Label
                            style={{
                              fontWeight: "bold",
                              color: "#006064",
                              fontSize: "12px",
                            }}
                          >
                            Condition
                          </Form.Label>
                          <Form.Select
                            value={selectedCondition}
                            onChange={(e) => setSelectedCondition(e.target.value)}
                            style={{
                              border: "2px solid #4dd0e1",
                              borderRadius: "8px",
                              padding: "6px",
                              backgroundColor: "#e0f7fa",
                              fontSize: "12px",
                            }}
                          >
                            <option value="All">All Conditions</option>
                            <option value="Piles">Piles</option>
                            <option value="Fistula">Fistula</option>
                            <option value="Hernia">Hernia</option>
                            <option value="Varicose Vein">Varicose Veins</option>
                            <option value="Prolapse">Prolapse</option>
                            <option value="Circumcision">Circumcision</option>
                            <option value="Abscess">Abscess</option>
                            <option value="Fissure">Fissure</option>
                            <option value="IBS">IBS</option>
                            <option value="Other">Other</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1 1 160px" }}>
                        <Form.Group className="mb-2">
                          <Form.Label
                            style={{
                              fontWeight: "bold",
                              color: "#006064",
                              fontSize: "12px",
                            }}
                          >
                            Advice Type
                          </Form.Label>
                          <Form.Select
                            value={selectedAdviceType}
                            onChange={(e) => setSelectedAdviceType(e.target.value)}
                            style={{
                              border: "2px solid #4dd0e1",
                              borderRadius: "8px",
                              padding: "6px",
                              backgroundColor: "#e0f7fa",
                              fontSize: "12px",
                            }}
                          >
                            <option value="All">All Advice Types</option>
                            <option value="Surgery">Surgery</option>
                            <option value="Medical">Medical</option>
                            <option value="Procedure">Procedure</option>
                            <option value="Follow Up">Follow Up</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1 1 160px" }}>
                        <Form.Group className="mb-2 d-flex gap-2">
                          <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={loading}
                            style={{
                              height: "35px",
                              width: "100%",
                              backgroundColor: "#00acc1",
                              borderColor: "#00bcd4",
                              color: "white",
                              borderRadius: "8px",
                              fontWeight: "bold",
                              fontSize: "13px",
                            }}
                          >
                            {loading ? <Spinner animation="border" size="sm" /> : "Search"}
                          </button>
                          <button
                            className="btn btn-secondary"
                            type="button"
                            onClick={handleReset}
                            disabled={loading}
                            style={{
                              height: "35px",
                              width: "100%",
                              borderRadius: "8px",
                              fontWeight: "bold",
                              fontSize: "13px",
                            }}
                          >
                            Reset
                          </button>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>

                  {/* Header controls bar */}
                  <div className="no-print">{renderHeader()}</div>

                  <DataTable
                    value={filteredData}
                    paginator
                    rows={rows}
                    filters={filters}
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                    emptyMessage={loading ? "Loading..." : "No records found."}
                    className="p-datatable-sm custom-datatable mb-4"
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
                    <Column
                      field="visitDate"
                      header="Visit Date"
                      body={(rowData) => formatDateDisplay(rowData.visitDate)}
                      style={{ width: "110px", textAlign: "center" }}
                    />
                    <Column
                      field="patientName"
                      header="Patient Name"
                      body={(rowData) => formatValue(rowData.patientName)}
                      style={{ width: "180px" }}
                    />
                    <Column
                      field="diagnosis"
                      header="Diagnosis"
                      body={(rowData) => formatValue(rowData.diagnosis)}
                      style={{ width: "140px", textAlign: "center" }}
                    />
                    <Column
                      field="grade"
                      header="Grade"
                      body={(rowData) => formatValue(rowData.grade)}
                      style={{ width: "90px", textAlign: "center" }}
                    />
                    <Column
                      field="adviceType"
                      header="Advice Type"
                      body={(rowData) => formatValue(rowData.adviceType)}
                      style={{ width: "120px", textAlign: "center" }}
                    />
                    <Column
                      field="consultant"
                      header="Consultant"
                      body={(rowData) => formatValue(rowData.consultant)}
                      style={{ width: "160px" }}
                    />
                    <Column
                      field="assistingDoctor"
                      header="Assisting Doctor"
                      body={(rowData) => formatValue(rowData.assistingDoctor)}
                      style={{ width: "160px" }}
                    />
                  </DataTable>

                  {/* Print-only container displaying all rows */}
                  <div className="print-table-container">
                    <table className="print-table">
                      <thead>
                        <tr>
                          <th style={{ width: "6%" }}>Sr No</th>
                          <th style={{ width: "12%" }}>Visit Date</th>
                          <th style={{ width: "20%" }}>Patient Name</th>
                          <th style={{ width: "14%" }}>Diagnosis</th>
                          <th style={{ width: "10%" }}>Grade</th>
                          <th style={{ width: "12%" }}>Advice Type</th>
                          <th style={{ width: "13%" }}>Consultant</th>
                          <th style={{ width: "13%" }}>Assisting Doctor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{formatDateDisplay(item.visitDate)}</td>
                            <td>{formatValue(item.patientName)}</td>
                            <td>{formatValue(item.diagnosis)}</td>
                            <td>{formatValue(item.grade)}</td>
                            <td>{formatValue(item.adviceType)}</td>
                            <td>{formatValue(item.consultant)}</td>
                            <td>{formatValue(item.assistingDoctor)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </SimpleBar>

      <style>{`
        .print-table-container {
          display: none;
        }
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
        .custom-datatable .p-datatable-thead > tr > th .p-column-header-content {
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

        @media print {
          @page {
            size: landscape;
            margin: 20mm 15mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .codex-sidebar,
          .codex-header,
          .codex-breadcrumb,
          .scroll-top,
          .no-print,
          .p-datatable-header,
          .p-paginator,
          .simplebar-placeholder,
          .simplebar-track,
          .simplebar-scrollbar {
            display: none !important;
          }
          body, html {
            background: #fff !important;
            color: #000 !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: auto !important;
          }
          .themebody-wrap {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            min-height: auto !important;
            height: auto !important;
            page-break-after: avoid !important;
          }
          .theme-body,
          .simplebar-content-wrapper,
          .simplebar-mask,
          .simplebar-wrapper,
          .simplebar-offset,
          .simplebar-content {
            padding: 0 !important;
            margin: 0 !important;
            min-height: auto !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            position: relative !important;
          }
          .card {
            border: none !important;
            box-shadow: none !important;
          }
          .container-fluid {
            padding: 0 !important;
            width: 100% !important;
          }
          .custom-datatable {
            display: none !important;
          }
          .print-table-container {
            display: block !important;
            width: 100% !important;
          }
          .print-table {
            width: 100% !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
            margin-top: 10px !important;
          }
          .print-table th, .print-table td {
            border: 1px solid #90caf9 !important;
            padding: 6px 4px !important;
            font-size: 10px !important;
            color: #000 !important;
            text-align: center !important;
          }
          .print-table th {
            background-color: #b2ebf2 !important;
            font-weight: bold !important;
          }
          .print-table thead {
            display: table-header-group !important;
          }
          .print-table tbody {
            display: table-row-group !important;
          }
          .print-table tr {
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DiagnosisReport;
