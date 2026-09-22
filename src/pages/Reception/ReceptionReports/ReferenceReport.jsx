import React, { useState, useEffect } from "react";
import { Row, Col, Card, Container, Form, Spinner } from "react-bootstrap";
import SimpleBar from "simplebar-react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { ColumnGroup } from "primereact/columngroup";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
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
    return "-";
  }
  return val;
};

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return "";
  const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  return datePart.split("-").reverse().join("-");
};

const referenceTypeOptions = [
  { value: "All", label: "All Reference Types" },
  { value: "aggregators", label: "Aggregators (JustDial, Practo, etc.)" },
  { value: "dr_ref", label: "Doctor Reference" },
  { value: "internet", label: "Internet" },
  { value: "family_friends", label: "Family / Friends" },
  { value: "old_ref", label: "Old Patient Reference" },
  { value: "newspaper", label: "Newspaper / Magazine" },
  { value: "socialMedia", label: "Social Media" },
  { value: "MediaRef", label: "TV Show / Radio" },
  { value: "campaign", label: "Campaign" },
  { value: "brand_ambassador", label: "Brand Ambassador" },
  { value: "awareness_lecture", label: "Awareness Lecture" },
  { value: "hhc_board", label: "HHC Board on Building" },
  { value: "hhc_branch", label: "HHC Branch" },
  { value: "dr_privilege_card", label: "Doctor's Privilege Card" },
  { value: "other", label: "Other Reference" },
];

const ReferenceReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedRefType, setSelectedRefType] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState(10);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("default");

  const [referenceData, setReferenceData] = useState([]);
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

  const handleFindClick = async (e) => {
    if (e) e.preventDefault();
    if (!fromDate || !toDate) {
      alert("Please enter From Date and To Date.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/managereports/getReferenceReport`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            location: currentLocation,
            Fromdate: fromDate,
            Todate: toDate,
            selectedReferenceType: selectedRefType,
            type: "summary",
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      setReferenceData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Error fetching Reference Report:", error);
      alert("Failed to load reference statistics");
      setReferenceData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setSelectedRefType("All");
    setReferenceData([]);
    setSearchText("");
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setFilters({
      ...filters,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    });
    setSearchText(value);
  };

  const handlePrint = () => {
    window.print();
  };

  const getFilteredData = () => {
    if (!searchText) return referenceData;
    const query = searchText.toLowerCase().trim();
    return referenceData.filter((item) => {
      const type = (item.referenceType || "").toLowerCase();
      const sub = (item.subReference || "").toLowerCase();
      const count = String(item.count || "").toLowerCase();
      const pct = (item.pctOfTotal || "").toLowerCase();
      const conv = (item.conversionPct || "").toLowerCase();

      return (
        type.includes(query) ||
        sub.includes(query) ||
        count.includes(query) ||
        pct.includes(query) ||
        conv.includes(query)
      );
    });
  };

  const filteredData = getFilteredData();

  // Compute totals
  const totalPatientsCount = filteredData.reduce(
    (acc, curr) => acc + (Number(curr.count) || 0),
    0,
  );
  const totalVisitedCount = filteredData.reduce(
    (acc, curr) => acc + (Number(curr.visited) || 0),
    0,
  );
  const overallConversionPct =
    totalPatientsCount > 0
      ? ((totalVisitedCount / totalPatientsCount) * 100).toFixed(2) + "%"
      : "0.00%";

  const exportToExcel = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const excelData = filteredData.map((item, index) => ({
      "Sr No": index + 1,
      "Reference Type": item.referenceType || "-",
      "Sub Reference / Detail": item.subReference || "-",
      Count: item.count || 0,
      "% of Total": item.pctOfTotal || "0.00%",
      "Conversion to Visit %": item.conversionPct || "0.00%",
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    saveAs(data, "Reference_Report" + fileExtension);
  };

  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column
          footer="Total"
          colSpan={3}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatValue(totalPatientsCount)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer="100.00%"
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={overallConversionPct}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
      </Row>
    </ColumnGroup>
  );

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
      <PageBreadcrumb pagename="Reference Report" />
      <SimpleBar className="theme-body common-dash">
        <Container fluid>
          <Row>
            <Col md={12}>
              <Card
                style={{
                  borderRadius: "12px",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                  border: "1px solid #00bcd4",
                  background: "white",
                }}
              >
                <Card.Header
                  className="text-center"
                  style={{
                    background: "linear-gradient(to right, #00acc1, #007c91)",
                    color: "white",
                    padding: "0.8rem",
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: "18px" }}>
                    Reference Report
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
                      <Col style={{ padding: "0 5px", flex: "1 1 220px" }}>
                        <Form.Group className="mb-2">
                          <Form.Label
                            style={{
                              fontWeight: "bold",
                              color: "#006064",
                              fontSize: "12px",
                            }}
                          >
                            Reference Type
                          </Form.Label>
                          <Form.Select
                            value={selectedRefType}
                            onChange={(e) => setSelectedRefType(e.target.value)}
                            style={{
                              border: "2px solid #4dd0e1",
                              borderRadius: "8px",
                              padding: "6px",
                              backgroundColor: "#e0f7fa",
                              fontSize: "12px",
                            }}
                          >
                            {referenceTypeOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1 1 180px" }}>
                        <Form.Group className="mb-2 d-flex gap-2">
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
                            disabled={loading}
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
                            style={{
                              height: "35px",
                              width: "100%",
                              borderRadius: "8px",
                              fontWeight: "bold",
                              fontSize: "13px",
                            }}
                            disabled={loading}
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
                    className="p-datatable-sm custom-datatable mb-4"
                    stripedRows
                    rowHover
                    responsiveLayout="scroll"
                    style={{ fontSize: "12px" }}
                  >
                    <Column
                      header="Sr No"
                      body={(r, { rowIndex }) => rowIndex + 1}
                      style={{ width: "60px", textAlign: "center" }}
                    />
                    <Column
                      field="referenceType"
                      header="Reference Type"
                      body={(rowData) => formatValue(rowData.referenceType)}
                      style={{ width: "180px" }}
                    />
                    <Column
                      field="subReference"
                      header="Sub Reference / Detail"
                      body={(rowData) => formatValue(rowData.subReference)}
                      style={{
                        width: "220px",
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                      }}
                    />
                    <Column
                      field="count"
                      header="Count"
                      body={(rowData) => formatValue(rowData.count)}
                      style={{ width: "100px", textAlign: "center" }}
                    />
                    <Column
                      field="pctOfTotal"
                      header="% of Total"
                      body={(rowData) => formatValue(rowData.pctOfTotal)}
                      style={{ width: "110px", textAlign: "center" }}
                    />
                    <Column
                      field="conversionPct"
                      header="Conversion to Visit %"
                      body={(rowData) => formatValue(rowData.conversionPct)}
                      style={{ width: "150px", textAlign: "center" }}
                    />
                  </DataTable>

                  {/* Print-only container displaying all rows */}
                  <div className="print-table-container">
                    <table className="print-table">
                      <thead>
                        <tr>
                          <th style={{ width: "6%" }}>Sr No</th>
                          <th style={{ width: "24%" }}>Reference Type</th>
                          <th style={{ width: "30%" }}>
                            Sub Reference / Detail
                          </th>
                          <th style={{ width: "12%" }}>Count</th>
                          <th style={{ width: "13%" }}>% of Total</th>
                          <th style={{ width: "15%" }}>
                            Conversion to Visit %
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{formatValue(item.referenceType)}</td>
                            <td
                              style={{
                                wordBreak: "break-word",
                                whiteSpace: "normal",
                              }}
                            >
                              {formatValue(item.subReference)}
                            </td>
                            <td>{formatValue(item.count)}</td>
                            <td>{formatValue(item.pctOfTotal)}</td>
                            <td>{formatValue(item.conversionPct)}</td>
                          </tr>
                        ))}
                        <tr className="print-totals-row">
                          <td colSpan={3}>Total</td>
                          <td>{formatValue(totalPatientsCount)}</td>
                          <td>100.00%</td>
                          <td>{overallConversionPct}</td>
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
        .custom-datatable .p-datatable-header { background: #e0f7fa; border: 1px solid #4dd0e1; padding: 10px; border-radius: 8px 8px 0 0; }
        .custom-datatable .p-datatable-thead > tr > th { background-color: #b2ebf2 !important; color: black !important; font-size: 12px; border: 1px solid #90caf9 !important; text-align: center !important; }
        .custom-datatable .p-datatable-thead > tr > th .p-column-header-content { justify-content: center !important; }
        .custom-datatable .p-datatable-tbody > tr > td { font-size: 12px; padding: 8px; border: 1px solid #90caf9; text-align: center !important; }
        .custom-datatable .p-datatable-tfoot > tr > td { background-color: #e0f7fa !important; color: black !important; padding: 10px 8px; border: 1px solid #90caf9 !important; font-size: 12px; }
        .custom-datatable .p-paginator { background: #f8fdfe; border: 1px solid #4dd0e1; border-radius: 0 0 8px 8px; }

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

export default ReferenceReport;
