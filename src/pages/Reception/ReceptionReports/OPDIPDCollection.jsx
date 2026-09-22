import React, { useState, useEffect } from "react";
import { Row, Col, Card, Container, Form } from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { ColumnGroup } from "primereact/columngroup";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import SimpleBar from "simplebar-react";
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

const formatAmount = (val) => {
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
  const parsed = parseFloat(val);
  return isNaN(parsed)
    ? val
    : `₹ ${Math.round(parsed).toLocaleString("en-IN")}`;
};

const OPDIPDCollection = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState(10);
  const [currentLocation, setCurrentLocation] = useState("default");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const handlePrint = () => {
    window.print();
  };

  const getFilteredData = () => {
    if (!searchText) return tableData;
    const query = searchText.toLowerCase().trim();
    return tableData.filter((item) => {
      const displayDate = formatDateDisplay(item.receiptDate).toLowerCase();
      const opdCash = String(item.opdCash || "").toLowerCase();
      const ipdCash = String(item.ipdCash || "").toLowerCase();
      const opdCard = String(item.opdCard || "").toLowerCase();
      const ipdCard = String(item.ipdCard || "").toLowerCase();
      const opdCheque = String(item.opdCheque || "").toLowerCase();
      const ipdCheque = String(item.ipdCheque || "").toLowerCase();
      const opdOnline = String(item.opdOnline || "").toLowerCase();
      const ipdOnline = String(item.ipdOnline || "").toLowerCase();

      return (
        displayDate.includes(query) ||
        opdCash.includes(query) ||
        ipdCash.includes(query) ||
        opdCard.includes(query) ||
        ipdCard.includes(query) ||
        opdCheque.includes(query) ||
        ipdCheque.includes(query) ||
        opdOnline.includes(query) ||
        ipdOnline.includes(query)
      );
    });
  };

  const filteredData = getFilteredData();

  const printTotals = filteredData.reduce(
    (acc, curr) => {
      acc.opdCash += Number(curr.opdCash) || 0;
      acc.ipdCash += Number(curr.ipdCash) || 0;
      acc.opdCard += Number(curr.opdCard) || 0;
      acc.ipdCard += Number(curr.ipdCard) || 0;
      acc.opdCheque += Number(curr.opdCheque) || 0;
      acc.ipdCheque += Number(curr.ipdCheque) || 0;
      acc.opdOnline += Number(curr.opdOnline) || 0;
      acc.ipdOnline += Number(curr.ipdOnline) || 0;
      return acc;
    },
    {
      opdCash: 0,
      ipdCash: 0,
      opdCard: 0,
      ipdCard: 0,
      opdCheque: 0,
      ipdCheque: 0,
      opdOnline: 0,
      ipdOnline: 0,
    },
  );

  const [totals, setTotals] = useState({
    opdCash: 0,
    ipdCash: 0,
    opdCard: 0,
    ipdCard: 0,
    opdCheque: 0,
    ipdCheque: 0,
    opdOnline: 0,
    ipdOnline: 0,
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

  const mergeCollectionData = (opdData, ipdData) => {
    const mergedMap = {};
    opdData.forEach((item) => {
      const dateKey = item.date.split("T")[0];
      mergedMap[dateKey] = {
        receiptDate: dateKey,
        opdCash: parseFloat(item.opdCash) || 0,
        opdCard: parseFloat(item.opdCard) || 0,
        opdCheque: parseFloat(item.opdCheque) || 0,
        opdOnline: parseFloat(item.opdOnline) || 0,
        ipdCash: 0,
        ipdCard: 0,
        ipdCheque: 0,
        ipdOnline: 0,
      };
    });

    ipdData.forEach((item) => {
      const dateKey = item.date.split("T")[0];
      if (!mergedMap[dateKey]) {
        mergedMap[dateKey] = {
          receiptDate: dateKey,
          opdCash: 0,
          opdCard: 0,
          opdCheque: 0,
          opdOnline: 0,
          ipdCash: parseFloat(item.ipdCash) || 0,
          ipdCard: parseFloat(item.ipdCard) || 0,
          ipdCheque: parseFloat(item.ipdCheque) || 0,
          ipdOnline: parseFloat(item.ipdOnline) || 0,
        };
      } else {
        mergedMap[dateKey].ipdCash = parseFloat(item.ipdCash) || 0;
        mergedMap[dateKey].ipdCard = parseFloat(item.ipdCard) || 0;
        mergedMap[dateKey].ipdCheque = parseFloat(item.ipdCheque) || 0;
        mergedMap[dateKey].ipdOnline = parseFloat(item.ipdOnline) || 0;
      }
    });

    return Object.values(mergedMap).sort(
      (a, b) => new Date(b.receiptDate) - new Date(a.receiptDate),
    );
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!fromDate || !toDate) {
      alert("Please Enter all date fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/managereports/getConsolidatedReport`,
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
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to fetch consolidated data");
      const result = await response.json();
      const mergedData = mergeCollectionData(
        result.opdData || [],
        result.ipdData || [],
      );

      const newTotals = mergedData.reduce(
        (acc, curr) => ({
          opdCash: acc.opdCash + curr.opdCash,
          ipdCash: acc.ipdCash + curr.ipdCash,
          opdCard: acc.opdCard + curr.opdCard,
          ipdCard: acc.ipdCard + curr.ipdCard,
          opdCheque: acc.opdCheque + curr.opdCheque,
          ipdCheque: acc.ipdCheque + curr.ipdCheque,
          opdOnline: acc.opdOnline + curr.opdOnline,
          ipdOnline: acc.ipdOnline + curr.ipdOnline,
        }),
        {
          opdCash: 0,
          ipdCash: 0,
          opdCard: 0,
          ipdCard: 0,
          opdCheque: 0,
          ipdCheque: 0,
          opdOnline: 0,
          ipdOnline: 0,
        },
      );

      setTotals(newTotals);
      setTableData(mergedData);
    } catch (error) {
      console.error("Error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.split("-").reverse().join("-");
  };

  const exportToExcel = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const excelData = tableData.map((item, index) => ({
      "Sr No": index + 1,
      Date: formatDateDisplay(item.receiptDate),
      "OPD Cash": item.opdCash,
      "IPD Cash": item.ipdCash,
      "OPD Card": item.opdCard,
      "IPD Card": item.ipdCard,
      "OPD Cheque": item.opdCheque,
      "IPD Cheque": item.ipdCheque,
      "OPD Online": item.opdOnline,
      "IPD Online": item.ipdOnline,
    }));
    excelData.push({ "Sr No": "TOTAL", Date: "", ...totals });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["Consolidated"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([excelBuffer], { type: fileType }),
      `Consolidated_Report.xlsx`,
    );
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
          footer={formatAmount(printTotals.opdCash)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatAmount(printTotals.ipdCash)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatAmount(printTotals.opdCard)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatAmount(printTotals.ipdCard)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatAmount(printTotals.opdCheque)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatAmount(printTotals.ipdCheque)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatAmount(printTotals.opdOnline)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatAmount(printTotals.ipdOnline)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
      </Row>
    </ColumnGroup>
  );

  const header = (
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
      <PageBreadcrumb pagename="OPD + IPD Collection" />
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
                  <h4 style={{ margin: 0 }}>OPD + IPD Collection Report</h4>
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
                  <Form onSubmit={handleSearch} className="no-print">
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
                          >
                            {loading ? "Loading..." : "Search"}
                          </button>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>

                  <DataTable
                    value={tableData}
                    paginator
                    rows={rows}
                    filters={filters}
                    header={header}
                    footerColumnGroup={footerGroup}
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
                      field="receiptDate"
                      header="Date"
                      body={(rowData) =>
                        formatValue(formatDateDisplay(rowData.receiptDate))
                      }
                    />
                    <Column
                      field="opdCash"
                      header="OPD Cash"
                      body={(rowData) => formatAmount(rowData.opdCash)}
                    />
                    <Column
                      field="ipdCash"
                      header="IPD Cash"
                      body={(rowData) => formatAmount(rowData.ipdCash)}
                    />
                    <Column
                      field="opdCard"
                      header="OPD Card"
                      body={(rowData) => formatAmount(rowData.opdCard)}
                    />
                    <Column
                      field="ipdCard"
                      header="IPD Card"
                      body={(rowData) => formatAmount(rowData.ipdCard)}
                    />
                    <Column
                      field="opdCheque"
                      header="OPD Chq"
                      body={(rowData) => formatAmount(rowData.opdCheque)}
                    />
                    <Column
                      field="ipdCheque"
                      header="IPD Chq"
                      body={(rowData) => formatAmount(rowData.ipdCheque)}
                    />
                    <Column
                      field="opdOnline"
                      header="OPD Onl"
                      body={(rowData) => formatAmount(rowData.opdOnline)}
                    />
                    <Column
                      field="ipdOnline"
                      header="IPD Onl"
                      body={(rowData) => formatAmount(rowData.ipdOnline)}
                    />
                  </DataTable>

                  {/* Print-only container displaying all rows */}
                  <div className="print-table-container">
                    <table className="print-table">
                      <thead>
                        <tr>
                          <th>Sr No</th>
                          <th>Date</th>
                          <th>OPD Cash</th>
                          <th>IPD Cash</th>
                          <th>OPD Card</th>
                          <th>IPD Card</th>
                          <th>OPD Chq</th>
                          <th>IPD Chq</th>
                          <th>OPD Onl</th>
                          <th>IPD Onl</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                              {formatValue(formatDateDisplay(item.receiptDate))}
                            </td>
                            <td>{formatValue(item.opdCash)}</td>
                            <td>{formatValue(item.ipdCash)}</td>
                            <td>{formatValue(item.opdCard)}</td>
                            <td>{formatValue(item.ipdCard)}</td>
                            <td>{formatValue(item.opdCheque)}</td>
                            <td>{formatValue(item.ipdCheque)}</td>
                            <td>{formatValue(item.opdOnline)}</td>
                            <td>{formatValue(item.ipdOnline)}</td>
                          </tr>
                        ))}
                        {/* Totals row inside tbody to avoid page repetition on multiple pages */}
                        <tr className="print-totals-row">
                          <td colSpan={2}>Total</td>
                          <td>{formatValue(printTotals.opdCash)}</td>
                          <td>{formatValue(printTotals.ipdCash)}</td>
                          <td>{formatValue(printTotals.opdCard)}</td>
                          <td>{formatValue(printTotals.ipdCard)}</td>
                          <td>{formatValue(printTotals.opdCheque)}</td>
                          <td>{formatValue(printTotals.ipdCheque)}</td>
                          <td>{formatValue(printTotals.opdOnline)}</td>
                          <td>{formatValue(printTotals.ipdOnline)}</td>
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
        .custom-datatable .p-datatable-header { background: #e0f7fa; border: 1px solid #4dd0e1; border-top-left-radius: 8px; border-top-right-radius: 8px; padding: 10px; }
        .custom-datatable .p-datatable-thead > tr > th { background-color: #b2ebf2 !important; color: black !important; font-size: 12px; padding: 10px 8px !important; border: 1px solid #90caf9 !important; text-align: center !important; }
        .custom-datatable .p-datatable-thead > tr > th .p-column-header-content { justify-content: center !important; }
        .custom-datatable .p-datatable-tbody > tr > td { font-size: 12px; padding: 8px; border: 1px solid #90caf9; text-align: center !important; }
        .custom-datatable .p-datatable-tfoot > tr > td { background-color: #e0f7fa !important; color: black !important; padding: 10px 8px; border: 1px solid #90caf9 !important; font-size: 12px; }
        .custom-datatable .p-paginator { background: #f8fdfe; border: 1px solid #4dd0e1; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; padding: 5px; }
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
        }
      `}</style>
    </div>
  );
};

export default OPDIPDCollection;
