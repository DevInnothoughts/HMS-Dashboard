import React, { useState, useEffect } from "react";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import { Row, Col, Card, Container, Form } from "react-bootstrap";
import SimpleBar from "simplebar-react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { decodeJwt } from "../../Utility/decode-jwt";

const BASE_URL = "http://194.195.117.79:5100/api";

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return "";
  const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  return datePart.split("-").reverse().join("-");
};

const formatValue = (val) => {
  if (val === null || val === undefined || val === "" || val === "N/A" || val === 0 || val === "0" || val === "-") {
    return "-";
  }
  return val;
};

const getColumnsConfig = (channel, activeTab) => {
  if (activeTab === "summary") {
    return [
      { field: "Branch", header: "Branch" },
      { field: "Total Leads", header: "Total Leads" },
      { field: "No Appointment", header: "No Appointment" },
      { field: "Appointment Not Visited", header: "Appointment Not Visited" },
      { field: "Converted", header: "Converted" },
      { field: "Lost %", header: "Lost %" },
    ];
  }

  if (!channel) {
    return [];
  }

  if (channel === "helpline") {
    const base = [
      { field: "Branch", header: "Branch" },
      { field: "Caller No", header: "Caller No" },
      { field: "First Call", header: "First Call" },
      { field: "Last Call", header: "Last Call" },
      { field: "Inbound Calls", header: "Inbound Calls" },
      { field: "Missed", header: "Missed" },
      { field: "Answered", header: "Answered" },
      { field: "Called Back", header: "Called Back" },
      { field: "Talk Time (s)", header: "Talk Time (s)" },
      { field: "Note", header: "Note" },
    ];
    if (activeTab === "notConverted") {
      return [...base, { field: "Days Since Last Call", header: "Days Since Last Call" }];
    } else {
      return [
        ...base,
        { field: "Appointment Date", header: "Appointment Date" },
        { field: "Days Since Appointment", header: "Days Since Appointment" },
      ];
    }
  }

  if (channel === "ivr") {
    const base = [
      { field: "Branch", header: "Branch" },
      { field: "Call Date", header: "Call Date" },
      { field: "Call Time", header: "Call Time" },
      { field: "Caller No", header: "Caller No" },
      { field: "Call Status", header: "Call Status" },
      { field: "Duration (s)", header: "Duration (s)" },
      { field: "Received On", header: "Received On" },
      { field: "Note", header: "Note" },
    ];
    if (activeTab === "notConverted") {
      return [...base, { field: "Days Since Call", header: "Days Since Call" }];
    } else {
      return [
        ...base,
        { field: "Appointment Date", header: "Appointment Date" },
        { field: "Days Since Appointment", header: "Days Since Appointment" },
      ];
    }
  }

  // Web and Bot channels
  const base = [
    { field: "Branch", header: "Branch" },
    { field: "Channel", header: "Channel" },
    { field: "Lead Date", header: "Lead Date" },
    { field: "Name", header: "Name" },
    { field: "Phone", header: "Phone" },
    { field: "Email", header: "Email" },
    { field: "Condition", header: "Condition" },
    { field: "Enquiry", header: "Enquiry" },
    { field: "Lead Status", header: "Lead Status" },
    { field: "Note", header: "Note" },
  ];
  if (activeTab === "notConverted") {
    return [...base, { field: "Days Since Enquiry", header: "Days Since Enquiry" }];
  } else {
    return [
      ...base,
      { field: "Appointment Date", header: "Appointment Date" },
      { field: "Days Since Appointment", header: "Days Since Appointment" },
    ];
  }
};

const LostLeadReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [channel, setChannel] = useState("");
  const [activeTab, setActiveTab] = useState("notConverted");
  const [notConvertedData, setNotConvertedData] = useState([]);
  const [notVisitedData, setNotVisitedData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState(10);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("default");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const handlePrint = () => {
    window.print();
  };

  const getFilteredDataset = (dataset) => {
    if (!searchText) return dataset;
    const query = searchText.toLowerCase().trim();
    return dataset.filter((item) => {
      return Object.values(item).some((val) =>
        String(val || "").toLowerCase().includes(query)
      );
    });
  };

  const getFilteredData = () => {
    const dataToFilter =
      activeTab === "notConverted" ? notConvertedData :
        activeTab === "notVisited" ? notVisitedData :
          summaryData;
    return getFilteredDataset(dataToFilter);
  };

  const filteredData = getFilteredData();

  // Fetch location from JWT on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

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
      alert("Please select both From and To dates.");
      return;
    }

    if (!channel) {
      alert("Please select a channel.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/managereports/getLostLeadsReport`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            location: currentLocation,
            channel: channel,
            Fromdate: fromDate,
            Todate: toDate,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Server error");
      }

      const resData = await response.json();

      setNotConvertedData(resData.notConverted || []);
      setNotVisitedData(resData.notVisited || []);
      setSummaryData(resData.summary || []);

      if (
        (!resData.notConverted || resData.notConverted.length === 0) &&
        (!resData.notVisited || resData.notVisited.length === 0)
      ) {
        alert("No records found for this range.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert(`Error: ${error.message}`);
      setNotConvertedData([]);
      setNotVisitedData([]);
      setSummaryData([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    // Sheet 1: Enquiry - No Appointment
    const noApptCols = getColumnsConfig(channel, "notConverted");
    const noApptFiltered = getFilteredDataset(notConvertedData);
    const noApptRows = noApptFiltered.map((item, index) => {
      const row = { "Sr No": index + 1 };
      noApptCols.forEach((col) => {
        row[col.header] = formatValue(item[col.field]);
      });
      return row;
    });
    const wsNoAppt = XLSX.utils.json_to_sheet(noApptRows);

    // Sheet 2: Appointment - Not Visited
    const notVisitedCols = getColumnsConfig(channel, "notVisited");
    const notVisitedFiltered = getFilteredDataset(notVisitedData);
    const notVisitedRows = notVisitedFiltered.map((item, index) => {
      const row = { "Sr No": index + 1 };
      notVisitedCols.forEach((col) => {
        row[col.header] = formatValue(item[col.field]);
      });
      return row;
    });
    const wsNotVisited = XLSX.utils.json_to_sheet(notVisitedRows);

    // Sheet 3: Summary Statistics
    const summaryCols = getColumnsConfig(channel, "summary");
    const summaryFiltered = getFilteredDataset(summaryData);
    const summaryRows = summaryFiltered.map((item, index) => {
      const row = { "Sr No": index + 1 };
      summaryCols.forEach((col) => {
        row[col.header] = formatValue(item[col.field]);
      });
      return row;
    });
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);

    // Create workbook and append sheets
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsNoAppt, "Enquiry - No Appointment");
    XLSX.utils.book_append_sheet(wb, wsNotVisited, "Appointment - Not Visited");
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary Statistics");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: fileType });
    saveAs(dataBlob, `lost_leads_${channel}_report` + fileExtension);
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

  const header = renderHeader();
  const currentColumns = getColumnsConfig(channel, activeTab);

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
      <PageBreadcrumb pagename="Lost Lead Report" />
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
                  <h4 style={{ margin: 0 }}>Lost Lead Report</h4>
                  {fromDate && toDate && (
                    <div style={{ fontSize: "13px", fontWeight: "normal", marginTop: "5px" }}>
                      Date Range: <b>{formatDateDisplay(fromDate)}</b> to <b>{formatDateDisplay(toDate)}</b> {channel && <> | Channel: <b>{channel.toUpperCase()}</b></>}
                    </div>
                  )}
                </Card.Header>
                <Card.Body style={{ padding: "10px" }}>
                  <Form onSubmit={handleFind} className="no-print mb-4">
                    <Row
                      className="align-items-end"
                      style={{ margin: "0 -5px" }}
                    >
                      <Col md={3} style={{ padding: "0 5px" }}>
                        <Form.Group className="mb-2">
                          <Form.Label
                            style={{
                              fontWeight: "bold",
                              color: "#006064",
                              whiteSpace: "nowrap",
                              fontSize: "12px",
                            }}
                          >
                            Channel
                          </Form.Label>
                          <Form.Select
                            value={channel}
                            onChange={(e) => setChannel(e.target.value)}
                            style={{
                              border: "2px solid #4dd0e1",
                              borderRadius: "8px",
                              padding: "6px",
                              backgroundColor: "#e0f7fa",
                              fontSize: "12px",
                            }}
                          >
                            <option value="">Select Channel</option>
                            <option value="web">Web Lead</option>
                            <option value="bot">Bot Lead</option>
                            <option value="ivr">IVR</option>
                            <option value="helpline">Helpline</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={3} style={{ padding: "0 5px" }}>
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
                      <Col md={3} style={{ padding: "0 5px" }}>
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
                      <Col md={3} style={{ padding: "0 5px" }}>
                        <Form.Group className="mb-2">
                          <button
                            className="btn btn-primary"
                            type="submit"
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
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>

                  {/* Tabs Switcher */}
                  <div className="no-print d-flex justify-content-start mb-3" style={{ gap: "10px" }}>
                    <button
                      type="button"
                      className={`btn btn-sm ${activeTab === "notConverted" ? "btn-info text-white" : "btn-outline-info"}`}
                      onClick={() => setActiveTab("notConverted")}
                      style={{ borderRadius: "8px", fontWeight: "bold" }}
                    >
                      Enquiry - No Appointment
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${activeTab === "notVisited" ? "btn-info text-white" : "btn-outline-info"}`}
                      onClick={() => setActiveTab("notVisited")}
                      style={{ borderRadius: "8px", fontWeight: "bold" }}
                    >
                      Appointment - Not Visited
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${activeTab === "summary" ? "btn-info text-white" : "btn-outline-info"}`}
                      onClick={() => setActiveTab("summary")}
                      style={{ borderRadius: "8px", fontWeight: "bold" }}
                    >
                      Summary Statistics
                    </button>
                  </div>

                  <DataTable
                    value={filteredData}
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
                    {currentColumns.map((col) => {
                      const isNote = col.field === "Note";
                      return (
                        <Column
                          key={col.field}
                          style={{
                            textAlign: "center",
                            minWidth: isNote ? "100px" : "120px",
                            maxWidth: isNote ? "150px" : "none",
                            wordBreak: isNote ? "break-word" : "normal",
                            whiteSpace: isNote ? "normal" : "nowrap"
                          }}
                          field={col.field}
                          header={col.header}
                          body={(rowData) => formatValue(rowData[col.field])}
                        />
                      );
                    })}
                  </DataTable>

                  {/* Print-only container displaying all three tabs */}
                  <div className="print-table-container">
                    <h3 className="print-section-title">Enquiry - No Appointment</h3>
                    <table className="print-table">
                      <thead>
                        <tr>
                          <th>Sr No</th>
                          {getColumnsConfig(channel, "notConverted").map((col) => {
                            const isNote = col.field === "Note";
                            return (
                              <th
                                key={col.field}
                                style={{
                                  width: isNote ? "120px" : "auto",
                                  maxWidth: isNote ? "150px" : "none",
                                  wordBreak: isNote ? "break-all" : "normal",
                                }}
                              >
                                {col.header}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {notConvertedData.length === 0 ? (
                          <tr>
                            <td colSpan={getColumnsConfig(channel, "notConverted").length + 1}>No records found.</td>
                          </tr>
                        ) : (
                          getFilteredDataset(notConvertedData).map((item, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              {getColumnsConfig(channel, "notConverted").map((col) => {
                                const isNote = col.field === "Note";
                                return (
                                  <td
                                    key={col.field}
                                    style={{
                                      width: isNote ? "120px" : "auto",
                                      maxWidth: isNote ? "150px" : "none",
                                      wordBreak: isNote ? "break-all" : "normal",
                                      whiteSpace: isNote ? "normal" : "normal",
                                    }}
                                  >
                                    {formatValue(item[col.field])}
                                  </td>
                                );
                              })}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    <div className="page-break"></div>

                    <h3 className="print-section-title">Appointment - Not Visited</h3>
                    <table className="print-table">
                      <thead>
                        <tr>
                          <th>Sr No</th>
                          {getColumnsConfig(channel, "notVisited").map((col) => {
                            const isNote = col.field === "Note";
                            return (
                              <th
                                key={col.field}
                                style={{
                                  width: isNote ? "120px" : "auto",
                                  maxWidth: isNote ? "150px" : "none",
                                  wordBreak: isNote ? "break-all" : "normal",
                                }}
                              >
                                {col.header}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {notVisitedData.length === 0 ? (
                          <tr>
                            <td colSpan={getColumnsConfig(channel, "notVisited").length + 1}>No records found.</td>
                          </tr>
                        ) : (
                          getFilteredDataset(notVisitedData).map((item, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              {getColumnsConfig(channel, "notVisited").map((col) => {
                                const isNote = col.field === "Note";
                                return (
                                  <td
                                    key={col.field}
                                    style={{
                                      width: isNote ? "120px" : "auto",
                                      maxWidth: isNote ? "150px" : "none",
                                      wordBreak: isNote ? "break-all" : "normal",
                                      whiteSpace: isNote ? "normal" : "normal",
                                    }}
                                  >
                                    {formatValue(item[col.field])}
                                  </td>
                                );
                              })}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    <div className="page-break"></div>

                    <h3 className="print-section-title">Summary Statistics</h3>
                    <table className="print-table">
                      <thead>
                        <tr>
                          <th>Sr No</th>
                          {getColumnsConfig(channel, "summary").map((col) => (
                            <th key={col.field}>{col.header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {summaryData.length === 0 ? (
                          <tr>
                            <td colSpan={getColumnsConfig(channel, "summary").length + 1}>No records found.</td>
                          </tr>
                        ) : (
                          getFilteredDataset(summaryData).map((item, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              {getColumnsConfig(channel, "summary").map((col) => (
                                <td key={col.field}>{formatValue(item[col.field])}</td>
                              ))}
                            </tr>
                          ))
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
          .page-break {
            display: block;
            page-break-before: always;
          }
          .print-section-title {
            margin-top: 25px !important;
            margin-bottom: 10px !important;
            font-size: 14px !important;
            font-weight: bold !important;
            color: #006064 !important;
            text-align: center !important;
            border-bottom: 2px solid #00acc1 !important;
            padding-bottom: 5px !important;
          }
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
            width: 100% !important;
            max-width: none !important;
          }
          .themebody-wrap {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            min-height: auto !important;
            height: auto !important;
            page-break-after: avoid !important;
            width: 100% !important;
            max-width: none !important;
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
            width: 100% !important;
          }
          .card {
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
          }
          .container-fluid {
            padding: 0 !important;
            width: 100% !important;
            max-width: none !important;
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
            border-collapse: collapse !important;
            margin-top: 10px !important;
            table-layout: auto !important;
          }
          .print-table th, .print-table td {
            border: 1px solid #90caf9 !important;
            padding: 4px 2px !important;
            font-size: 8px !important;
            color: #000 !important;
            text-align: center !important;
            word-break: break-all !important;
            white-space: normal !important;
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

export default LostLeadReport;
