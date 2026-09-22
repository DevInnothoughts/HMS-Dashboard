import React, { useState, useEffect } from "react";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import { Row, Col, Card, Container, Form } from "react-bootstrap";
import SimpleBar from "simplebar-react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { decodeJwt } from "../../Utility/decode-jwt";

const BASE_URL = "http://194.195.117.79:5100/api";

const formatValue = (val) => {
  if (
    val === null ||
    val === undefined ||
    val === "" ||
    val === "N/A" ||
    val === 0 ||
    val === "0" ||
    val === "-"
  ) {
    return "0";
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
    // Fallback if parsing fails
  }
  const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  return datePart.split("-").reverse().join("-");
};

const EnquiryConversion = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fdeFilter, setFdeFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [fdeOptions, setFdeOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState(10);
  const [currentLocation, setCurrentLocation] = useState("");

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  // Fetch FDE dropdown options on mount or location change
  useEffect(() => {
    const fetchFDEs = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/V1/managereports/getFDEDropdownList?location=${currentLocation || "default"}`,
        );
        if (res.ok) {
          const data = await res.json();
          setFdeOptions(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load FDE dropdown:", err);
      }
    };
    fetchFDEs();
  }, [currentLocation]);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setSearchText(value);
  };

  const handleFindClick = async (e) => {
    if (e) e.preventDefault();
    if (!fromDate || !toDate) {
      alert("Please select date range");
      return;
    }

    setLoading(true);
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    try {
      const res = await fetch(
        `${BASE_URL}/V1/managereports/getEnquiryConversionReport`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            location: currentLocation,
            Fromdate: fromDate,
            Todate: toDate,
            fdeId: fdeFilter,
            source: sourceFilter,
            status: statusFilter,
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to fetch conversion report data");
      }

      const data = await res.json();
      setReportData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Error fetching Enquiry Conversion report data. Please try again.");
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setFdeFilter("All");
    setSourceFilter("All");
    setStatusFilter("All");
    setReportData([]);
    setSearchText("");
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const getFilteredData = () => {
    if (!searchText) return reportData;
    const query = searchText.toLowerCase().trim();
    return reportData.filter((item) => {
      const fde = String(item.fdeName || "").toLowerCase();
      const total = String(item.totalEnquiries || "").toLowerCase();
      const booked = String(item.booked || "").toLowerCase();
      const visited = String(item.visited || "").toLowerCase();
      const dnw = String(item.dnw || "").toLowerCase();
      const dnt = String(item.dnt || "").toLowerCase();
      const callBack = String(item.callBackPending || "").toLowerCase();
      const conv = String(item.conversionPercent || "").toLowerCase();

      return (
        fde.includes(query) ||
        total.includes(query) ||
        booked.includes(query) ||
        visited.includes(query) ||
        dnw.includes(query) ||
        dnt.includes(query) ||
        callBack.includes(query) ||
        conv.includes(query)
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
      FDE: item.fdeName || "Unassigned",
      "Total Enquiries": item.totalEnquiries || 0,
      Booked: item.booked || 0,
      Visited: item.visited || 0,
      "DNW (Did Not Wait)": item.dnw || 0,
      "DNT (Did Not Turn Up)": item.dnt || 0,
      "Call Back Pending": item.callBackPending || 0,
      "Conversion %": item.conversionPercent || "0.00%",
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    saveAs(data, "Enquiry_Conversion_Report" + fileExtension);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderHeader = () => {
    return (
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
            }}
          >
            <i className="fa fa-print"></i> Print Report
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="themebody-wrap"
      style={{
        padding: "10px",
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        fontFamily: "'Poppins', Arial, sans-serif",
        minHeight: "100vh",
        fontSize: "13px",
      }}
    >
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
                  <h4 style={{ margin: 0, fontSize: "18px" }}>
                    Enquiry Conversion Report
                  </h4>
                  {fromDate && toDate && (
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "normal",
                        marginTop: "5px",
                      }}
                    >
                      Date Range: <b>{formatDateDisplay(fromDate)}</b> to{" "}
                      <b>{formatDateDisplay(toDate)}</b>
                    </div>
                  )}
                </Card.Header>
                <Card.Body style={{ padding: "5px" }}>
                  <Form onSubmit={handleFindClick} className="no-print">
                    <Row
                      className="align-items-end mb-4 flex-wrap"
                      style={{ margin: "0 -5px", rowGap: "10px" }}
                    >
                      <Col style={{ padding: "0 5px", flex: "1 1 160px" }}>
                        <Form.Group className="mb-2">
                          <Form.Label
                            style={{
                              fontWeight: "bold",
                              color: "#006064",
                              whiteSpace: "nowrap",
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
                      <Col style={{ padding: "0 5px", flex: "1 1 160px" }}>
                        <Form.Group className="mb-2">
                          <Form.Label
                            style={{
                              fontWeight: "bold",
                              color: "#006064",
                              whiteSpace: "nowrap",
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
                              whiteSpace: "nowrap",
                              fontSize: "12px",
                            }}
                          >
                            FDE
                          </Form.Label>
                          <Form.Select
                            value={fdeFilter}
                            onChange={(e) => setFdeFilter(e.target.value)}
                            style={{
                              border: "2px solid #4dd0e1",
                              borderRadius: "8px",
                              padding: "6px",
                              backgroundColor: "#e0f7fa",
                              fontSize: "12px",
                            }}
                          >
                            <option value="All">All FDEs</option>
                            {fdeOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
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
                              whiteSpace: "nowrap",
                              fontSize: "12px",
                            }}
                          >
                            Enquiry Source
                          </Form.Label>
                          <Form.Select
                            value={sourceFilter}
                            onChange={(e) => setSourceFilter(e.target.value)}
                            style={{
                              border: "2px solid #4dd0e1",
                              borderRadius: "8px",
                              padding: "6px",
                              backgroundColor: "#e0f7fa",
                              fontSize: "12px",
                            }}
                          >
                            <option value="All">All Sources</option>
                            <option value="Web">
                              Web (WebFormEnquiryList)
                            </option>
                            <option value="Bot">
                              Bot (ChatbotEnquiryList)
                            </option>
                            <option value="IVR">IVR (IvrEnquiryList)</option>
                            <option value="Direct">Direct (EnquiryList)</option>
                            <option value="Helpline">Helpline</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1 1 160px" }}>
                        <Form.Group className="mb-2">
                          <Form.Label
                            style={{
                              fontWeight: "bold",
                              color: "#006064",
                              whiteSpace: "nowrap",
                              fontSize: "12px",
                            }}
                          >
                            Status
                          </Form.Label>
                          <Form.Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                              border: "2px solid #4dd0e1",
                              borderRadius: "8px",
                              padding: "6px",
                              backgroundColor: "#e0f7fa",
                              fontSize: "12px",
                            }}
                          >
                            <option value="All">All Statuses</option>
                            <option value="Visited">Visited</option>
                            <option value="Booked">Booked</option>
                            <option value="DNW">DNW (Did Not Wait)</option>
                            <option value="DNT">DNT (Did Not Turn Up)</option>
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
                            {loading ? "Loading..." : "Search"}
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

                  {/* Controls bar matching AppointmentConversion.jsx */}
                  <div className="mb-3 no-print">{renderHeader()}</div>

                  <DataTable
                    value={filteredData}
                    paginator
                    rows={rows}
                    filters={filters}
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
                    <Column
                      field="fdeName"
                      header="FDE"
                      body={(row) => formatValue(row.fdeName)}
                      style={{ width: "180px" }}
                    />
                    <Column
                      field="totalEnquiries"
                      header="Total Enquiries"
                      body={(row) => formatValue(row.totalEnquiries)}
                      style={{ width: "120px", textAlign: "center" }}
                    />
                    <Column
                      field="booked"
                      header="Booked"
                      body={(row) => formatValue(row.booked)}
                      style={{ width: "100px", textAlign: "center" }}
                    />
                    <Column
                      field="visited"
                      header="Visited"
                      body={(row) => formatValue(row.visited)}
                      style={{ width: "100px", textAlign: "center" }}
                    />
                    <Column
                      field="dnw"
                      header="DNW (Did Not Wait)"
                      body={(row) => formatValue(row.dnw)}
                      style={{ width: "140px", textAlign: "center" }}
                    />
                    <Column
                      field="dnt"
                      header="DNT (Did Not Turn Up)"
                      body={(row) => formatValue(row.dnt)}
                      style={{ width: "140px", textAlign: "center" }}
                    />
                    <Column
                      field="callBackPending"
                      header="Call Back Pending"
                      body={(row) => formatValue(row.callBackPending)}
                      style={{ width: "140px", textAlign: "center" }}
                    />
                    <Column
                      field="conversionPercent"
                      header="Conversion % (Visited/Enquiries)"
                      body={(row) => formatValue(row.conversionPercent)}
                      style={{ width: "150px", textAlign: "center" }}
                    />
                  </DataTable>

                  {/* Print-only container displaying all rows */}
                  <div className="print-table-container">
                    <table className="print-table">
                      <thead>
                        <tr>
                          <th style={{ width: "5%" }}>Sr No</th>
                          <th style={{ width: "20%" }}>FDE</th>
                          <th style={{ width: "12%" }}>Total Enquiries</th>
                          <th style={{ width: "10%" }}>Booked</th>
                          <th style={{ width: "10%" }}>Visited</th>
                          <th style={{ width: "13%" }}>DNW</th>
                          <th style={{ width: "13%" }}>DNT</th>
                          <th style={{ width: "13%" }}>Call Back Pending</th>
                          <th style={{ width: "14%" }}>Conversion %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData && filteredData.length > 0 ? (
                          filteredData.map((item, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{formatValue(item.fdeName)}</td>
                              <td>{formatValue(item.totalEnquiries)}</td>
                              <td>{formatValue(item.booked)}</td>
                              <td>{formatValue(item.visited)}</td>
                              <td>{formatValue(item.dnw)}</td>
                              <td>{formatValue(item.dnt)}</td>
                              <td>{formatValue(item.callBackPending)}</td>
                              <td>{formatValue(item.conversionPercent)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="9">No records found.</td>
                          </tr>
                        )}
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

export default EnquiryConversion;
