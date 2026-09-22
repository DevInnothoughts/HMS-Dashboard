import React, { useState, useEffect } from "react";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import { Row, Col, Card, Container, Form, Spinner } from "react-bootstrap";
import SimpleBar from "simplebar-react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { ColumnGroup } from "primereact/columngroup";
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

const CallLogPerformanceReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
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
      if (payload?.jobLocation) setCurrentLocation(payload.jobLocation);
    }
  }, []);

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
      alert("Please select From Date and To Date.");
      return;
    }

    setLoading(true);
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    try {
      const res = await fetch(
        `${BASE_URL}/V1/managereports/getCallLogPerformanceReport`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            location: currentLocation,
            Fromdate: fromDate,
            Todate: toDate,
            status: statusFilter,
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to fetch Call Log Performance Report data");
      }

      const data = await res.json();
      setReportData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch error:", error);
      alert(
        "Error fetching Call Log Performance Report data. Please try again.",
      );
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
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
      const dt = formatDateDisplay(item.date).toLowerCase();
      const tot = String(item.totalInbound || "").toLowerCase();
      const ans = String(item.answered || "").toLowerCase();
      const mis = String(item.missed || "").toLowerCase();
      const cb = String(item.calledBackWithin1Hour || "").toLowerCase();
      const dur = String(item.avgDuration || "").toLowerCase();

      return (
        dt.includes(query) ||
        tot.includes(query) ||
        ans.includes(query) ||
        mis.includes(query) ||
        cb.includes(query) ||
        dur.includes(query)
      );
    });
  };

  const filteredData = getFilteredData();

  // Compute grand totals
  const totalInboundSum = filteredData.reduce(
    (acc, curr) => acc + (Number(curr.totalInbound) || 0),
    0,
  );
  const totalAnsweredSum = filteredData.reduce(
    (acc, curr) => acc + (Number(curr.answered) || 0),
    0,
  );
  const totalMissedSum = filteredData.reduce(
    (acc, curr) => acc + (Number(curr.missed) || 0),
    0,
  );
  const totalCalledBackSum = filteredData.reduce(
    (acc, curr) => acc + (Number(curr.calledBackWithin1Hour) || 0),
    0,
  );

  const overallAvgDurationSec =
    totalAnsweredSum > 0
      ? Math.round(
          filteredData.reduce(
            (acc, curr) =>
              acc +
              (Number(curr.avgDurationSec) || 0) * (Number(curr.answered) || 0),
            0,
          ) / totalAnsweredSum,
        )
      : 0;

  const overallMins = String(Math.floor(overallAvgDurationSec / 60)).padStart(
    2,
    "0",
  );
  const overallSecs = String(overallAvgDurationSec % 60).padStart(2, "0");
  const overallAvgDurationStr = `${overallMins}m ${overallSecs}s`;

  const exportToExcel = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const excelData = filteredData.map((item, index) => ({
      "Sr No": index + 1,
      Date: formatDateDisplay(item.date),
      "Total Inbound Calls": item.totalInbound || 0,
      Answered: item.answered || 0,
      Missed: item.missed || 0,
      "Missed Calls Called Back Within 1 Hour": item.calledBackWithin1Hour || 0,
      "Avg. Call Duration": item.avgDuration || "00m 00s",
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    saveAs(data, "Call_Log_Performance_Report" + fileExtension);
  };

  const handlePrint = () => {
    window.print();
  };

  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column
          footer="Total"
          colSpan={2}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatValue(totalInboundSum)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatValue(totalAnsweredSum)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatValue(totalMissedSum)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatValue(totalCalledBackSum)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={overallAvgDurationStr}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
      </Row>
    </ColumnGroup>
  );

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
      <PageBreadcrumb pagename="Call Log Performance Report" />

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
                    Call Log Performance Report
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
                      <Col style={{ padding: "0 5px", flex: "1 1 180px" }}>
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
                      <Col style={{ padding: "0 5px", flex: "1 1 180px" }}>
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
                      <Col style={{ padding: "0 5px", flex: "1 1 180px" }}>
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
                            <option value="Answered">Answered</option>
                            <option value="Missed">Missed</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1 1 180px" }}>
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
                            {loading ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              "Search"
                            )}
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
                    footerColumnGroup={footerGroup}
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
                      field="date"
                      header="Date"
                      body={(row) => formatDateDisplay(row.date)}
                      style={{ width: "110px", textAlign: "center" }}
                    />
                    <Column
                      field="totalInbound"
                      header="Total Inbound Calls"
                      body={(row) => formatValue(row.totalInbound)}
                      style={{ width: "140px", textAlign: "center" }}
                    />
                    <Column
                      field="answered"
                      header="Answered"
                      body={(row) => formatValue(row.answered)}
                      style={{ width: "110px", textAlign: "center" }}
                    />
                    <Column
                      field="missed"
                      header="Missed"
                      body={(row) => formatValue(row.missed)}
                      style={{ width: "110px", textAlign: "center" }}
                    />
                    <Column
                      field="calledBackWithin1Hour"
                      header="Missed Calls Called Back Within 1 Hour"
                      body={(row) => formatValue(row.calledBackWithin1Hour)}
                      style={{ width: "240px", textAlign: "center" }}
                    />
                    <Column
                      field="avgDuration"
                      header="Avg. Call Duration"
                      body={(row) => formatValue(row.avgDuration)}
                      style={{ width: "140px", textAlign: "center" }}
                    />
                  </DataTable>

                  {/* Print-only container displaying all rows */}
                  <div className="print-table-container">
                    <table className="print-table">
                      <thead>
                        <tr>
                          <th style={{ width: "6%" }}>Sr No</th>
                          <th style={{ width: "14%" }}>Date</th>
                          <th style={{ width: "16%" }}>Total Inbound Calls</th>
                          <th style={{ width: "14%" }}>Answered</th>
                          <th style={{ width: "14%" }}>Missed</th>
                          <th style={{ width: "22%" }}>
                            Called Back Within 1 Hour
                          </th>
                          <th style={{ width: "14%" }}>Avg. Call Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData && filteredData.length > 0 ? (
                          filteredData.map((item, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{formatDateDisplay(item.date)}</td>
                              <td>{formatValue(item.totalInbound)}</td>
                              <td>{formatValue(item.answered)}</td>
                              <td>{formatValue(item.missed)}</td>
                              <td>{formatValue(item.calledBackWithin1Hour)}</td>
                              <td>{formatValue(item.avgDuration)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7">No records found.</td>
                          </tr>
                        )}
                        <tr className="print-totals-row">
                          <td colSpan={2}>Total</td>
                          <td>{formatValue(totalInboundSum)}</td>
                          <td>{formatValue(totalAnsweredSum)}</td>
                          <td>{formatValue(totalMissedSum)}</td>
                          <td>{formatValue(totalCalledBackSum)}</td>
                          <td>{overallAvgDurationStr}</td>
                        </tr>
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
        .custom-datatable .p-datatable-tfoot > tr > td {
          background-color: #e0f7fa !important;
          color: black !important;
          padding: 10px 8px;
          border: 1px solid #90caf9 !important;
          font-size: 12px;
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
          .print-table .print-totals-row td {
            background-color: #e0f7fa !important;
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

export default CallLogPerformanceReport;
