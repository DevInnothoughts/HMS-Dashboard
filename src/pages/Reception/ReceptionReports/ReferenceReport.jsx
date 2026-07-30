import React, { useState, useEffect } from "react";
import { Row, Col, Card, Container, Form, Spinner } from "react-bootstrap";
import SimpleBar from "simplebar-react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { ColumnGroup } from "primereact/columngroup";
import ReactApexChart from "react-apexcharts";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import { decodeJwt } from "../../../utils/decode-jwt";

const BASE_URL = "http://194.195.117.79:5100/api";

const formatValue = (val) => {
  if (val === null || val === undefined || val === "" || val === "N/A" || val === 0 || val === "0" || val === "-") {
    return "-";
  }
  return val;
};

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return "";
  const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  return datePart.split("-").reverse().join("-");
};

const ReferenceReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
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

  const getFriendlyName = (type) => {
    const mapping = {
      newspaper: "Newspaper Reference",
      dr_ref: "Doctor Reference",
      internet: "Internet Reference",
      old_ref: "Old Reference",
      MediaRef: "Media Reference",
      hhc_board: "HHC Board Reference",
      WOM: "Word of Mouth",
      TVShow: "TV Show",
      dr_privilege_card: "Doctor's Privilege Card",
      campaign: "Campaign",
      brand_ambassador: "Brand Ambassador",
      "": "Not Visited",
    };
    return mapping[type] || type || "Other Reference";
  };

  const handleFindClick = async (e) => {
    if (e) e.preventDefault();
    if (!fromDate || !toDate) {
      alert("Please Enter all fields details..");
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
            type: "summary",
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      
      const formattedData = result.map((item) => ({
        type: getFriendlyName(item.reference_type),
        count: parseInt(item.referencecount) || 0,
      }));

      setReferenceData(formattedData);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to load reference statistics");
    } finally {
      setLoading(false);
    }
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
      const type = (item.type || "").toLowerCase();
      const count = String(item.count || "").toLowerCase();

      return type.includes(query) || count.includes(query);
    });
  };

  const filteredData = getFilteredData();

  const printTotals = filteredData.reduce(
    (acc, curr) => {
      acc.count += Number(curr.count) || 0;
      return acc;
    },
    { count: 0 }
  );

  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column
          footer="Total"
          colSpan={2}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatValue(printTotals.count)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
      </Row>
    </ColumnGroup>
  );

  const chartSeries = [
    {
      name: "Reference Count",
      data: referenceData.map((item) => item.count),
    },
  ];

  const chartOptions = {
    chart: { type: "bar", height: 380 },
    plotOptions: {
      bar: { borderRadius: 4, horizontal: true, distributed: true },
    },
    colors: ["#42A5F5", "#FFCA28", "#66BB6A", "#FFA726", "#AB47BC", "#EC407A"],
    xaxis: { categories: referenceData.map((item) => item.type) },
    title: {
      text: "Patient Source Distribution",
      align: "center",
      style: { color: "#006064" },
    },
  };

  const renderHeader = () => (
    <div className="d-flex justify-content-between align-items-center mb-1">
      <div className="d-flex align-items-center" style={{ gap: "20px" }}>
        <div className="d-flex align-items-center">
          <span
            className="me-1"
            style={{ fontWeight: "bold", color: "#006064", fontSize: "13px" }}
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
          </Form.Select>
        </div>
        <div className="d-flex align-items-center">
          <span
            className="me-1"
            style={{ fontWeight: "bold", color: "#006064", fontSize: "13px" }}
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
      <button
        className="btn btn-danger btn-sm"
        onClick={handlePrint}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          borderRadius: "8px",
          fontWeight: "600",
        }}
      >
        <i className="fa fa-print"></i> Print Report
      </button>
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
                  <h4 style={{ margin: 0 }}>Reference Report</h4>
                  {fromDate && toDate && (
                    <div style={{ fontSize: "13px", fontWeight: "normal", marginTop: "5px" }}>
                      Date Range: <b>{formatDateDisplay(fromDate)}</b> to <b>{formatDateDisplay(toDate)}</b>
                    </div>
                  )}
                </Card.Header>
                <Card.Body style={{ padding: "5px" }}>
                  <Form onSubmit={handleFindClick} className="no-print">
                    <Row
                      className="align-items-end mb-4 flex-nowrap"
                      style={{ margin: "0 -5px" }}
                    >
                      <Col style={{ padding: "0 5px", flex: "1" }}>
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
                      <Col style={{ padding: "0 5px", flex: "1" }}>
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
                      <Col style={{ padding: "0 5px", flex: "1" }}>
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
                            disabled={loading}
                          >
                            {loading ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              "Search"
                            )}
                          </button>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>

                  <DataTable
                    value={referenceData}
                    paginator
                    rows={rows}
                    filters={filters}
                    header={renderHeader()}
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
                      style={{ width: "100px", textAlign: "center" }}
                    />
                    <Column field="type" header="Reference Type" body={(rowData) => formatValue(rowData.type)} sortable />
                    <Column field="count" header="Reference Count" body={(rowData) => formatValue(rowData.count)} sortable />
                  </DataTable>

                  {/* Print-only container displaying all rows */}
                  <div className="print-table-container">
                    <table className="print-table">
                      <thead>
                        <tr>
                          <th>Sr No</th>
                          <th>Reference Type</th>
                          <th>Reference Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{formatValue(item.type)}</td>
                            <td>{formatValue(item.count)}</td>
                          </tr>
                        ))}
                        {/* Totals row inside tbody to avoid page repetition on multiple pages */}
                        <tr className="print-totals-row">
                          <td colSpan={2}>Total</td>
                          <td>{formatValue(printTotals.count)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {referenceData.length > 0 && (
                    <div className="mt-5 d-flex flex-column align-items-center print-chart-container">
                      <h5 style={{ color: "#006064", fontWeight: "bold" }}>
                        Reference Statistics
                      </h5>
                      <div style={{ width: "100%", maxWidth: "850px" }}>
                        <ReactApexChart
                          options={chartOptions}
                          series={chartSeries}
                          type="bar"
                          height={450}
                        />
                      </div>
                    </div>
                  )}
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
          .print-chart-container {
            page-break-inside: avoid !important;
            margin-top: 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReferenceReport;
