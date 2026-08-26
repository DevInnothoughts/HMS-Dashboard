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
  if (val === null || val === undefined || val === "" || val === "N/A" || val === 0 || val === "0") {
    return "-";
  }
  return val;
};

const formatAmountValue = (val) => {
  if (val === null || val === undefined || val === "" || val === "N/A" || val === 0 || val === "0") {
    return "-";
  }
  const num = Math.round(parseFloat(String(val).replace(/,/g, "")) || 0);
  return num.toLocaleString("en-IN");
};

const IPDDueReport = () => {
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
      const displayDate = formatDateDisplay(item.date).toLowerCase();
      const patientName = (item.patientName || "").toLowerCase();
      const totalPackage = String(item.totalPackage || "").toLowerCase();
      const invoiceType = (item.invoiceType || "").toLowerCase();
      const cash = String(item.cash || "").toLowerCase();
      const card = String(item.card || "").toLowerCase();
      const cheque = String(item.cheque || "").toLowerCase();
      const online = String(item.online || "").toLowerCase();
      const discount = String(item.discount || "").toLowerCase();
      const totalDue = String(item.totalDue || "").toLowerCase();

      return (
        displayDate.includes(query) ||
        patientName.includes(query) ||
        totalPackage.includes(query) ||
        invoiceType.includes(query) ||
        cash.includes(query) ||
        card.includes(query) ||
        cheque.includes(query) ||
        online.includes(query) ||
        discount.includes(query) ||
        totalDue.includes(query)
      );
    });
  };

  const filteredData = getFilteredData();

  const printTotals = filteredData.reduce(
    (acc, curr) => {
      acc.totalPackage += Number(curr.totalPackage) || 0;
      acc.cash += Number(curr.cash) || 0;
      acc.card += Number(curr.card) || 0;
      acc.cheque += Number(curr.cheque) || 0;
      acc.online += Number(curr.online) || 0;
      acc.discount += Number(curr.discount) || 0;
      acc.totalDue += Number(curr.totalDue) || 0;
      return acc;
    },
    { totalPackage: 0, cash: 0, card: 0, cheque: 0, online: 0, discount: 0, totalDue: 0 }
  );

  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column
          footer="Total"
          colSpan={3}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatAmountValue(printTotals.totalPackage)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer=""
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatAmountValue(printTotals.cash)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatAmountValue(printTotals.card)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatAmountValue(printTotals.cheque)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatAmountValue(printTotals.online)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatAmountValue(printTotals.discount)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatAmountValue(printTotals.totalDue)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
      </Row>
    </ColumnGroup>
  );

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

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!fromDate || !toDate) {
      alert("Please Enter all fields details..");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/managereports/getBillingCollectionReport`,
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch data");
      }

      const data = await response.json();
      const formattedData = data.map((item) => ({
        ...item,
        date: item.creation_date ? item.creation_date.split("T")[0] : "",
        patientName: item.PatientName,
        totalPackage: item.TotalAmount,
        invoiceType: item.status,
        cash: item.CashAmt,
        card: item.CardAmt,
        cheque: item.ChequeAmt,
        online: item.OnlineAmt,
        discount: item.DiscountAmt,
        totalDue: item.TotalDue,
      }));

      setTableData(formattedData);
      if (formattedData.length === 0)
        alert("No records found for the selected date range");
    } catch (error) {
      console.error("Error:", error);
      alert(`Failed to fetch data: ${error.message}`);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateStr;
  };

  const exportToExcel = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const excelData = tableData.map((item, index) => ({
      "Sr No": index + 1,
      Date: formatDateDisplay(item.date),
      "Patient Name": item.patientName,
      "Total Package": item.totalPackage,
      "Invoice Type": item.invoiceType,
      Cash: item.cash,
      Card: item.card,
      Cheque: item.cheque,
      Online: item.online,
      Discount: item.discount,
      "Total Due": item.totalDue,
    }));
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([excelBuffer], { type: fileType }),
      `IPD_Due_Report_${fromDate}.xlsx`,
    );
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
      <PageBreadcrumb pagename="IPD Due Report" />
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
                    borderBottom: "2px solid #0288d1",
                  }}
                >
                  <h4 style={{ margin: 0 }}>IPD Due Report</h4>
                  {fromDate && toDate && (
                    <div style={{ fontSize: "13px", fontWeight: "normal", marginTop: "5px" }}>
                      Date Range: <b>{formatDateDisplay(fromDate)}</b> to <b>{formatDateDisplay(toDate)}</b>
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
                    header={renderHeader()}
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
                      body={(r, { rowIndex }) => rowIndex + 1}
                      style={{ width: "60px", textAlign: "center" }}
                    />
                    <Column
                      field="date"
                      header="Date"
                      body={(r) => formatValue(formatDateDisplay(r.date))}
                      style={{ textAlign: "center" }}
                    />
                    <Column
                      field="patientName"
                      header="Patient Name"
                      body={(r) => formatValue(r.patientName)}
                      style={{ textAlign: "center" }}
                    />
                    <Column
                      field="totalPackage"
                      header="Total Package"
                      body={(r) => formatAmountValue(r.totalPackage)}
                      style={{ textAlign: "center" }}
                    />
                    <Column
                      field="invoiceType"
                      header="Invoice Type"
                      body={(r) => formatValue(r.invoiceType)}
                      style={{ textAlign: "center" }}
                    />
                    <Column
                      field="cash"
                      header="Cash"
                      body={(r) => formatAmountValue(r.cash)}
                      style={{ textAlign: "center" }}
                    />
                    <Column
                      field="card"
                      header="Card"
                      body={(r) => formatAmountValue(r.card)}
                      style={{ textAlign: "center" }}
                    />
                    <Column
                      field="cheque"
                      header="Cheque"
                      body={(r) => formatAmountValue(r.cheque)}
                      style={{ textAlign: "center" }}
                    />
                    <Column
                      field="online"
                      header="Online"
                      body={(r) => formatAmountValue(r.online)}
                      style={{ textAlign: "center" }}
                    />
                    <Column
                      field="discount"
                      header="Discount"
                      body={(r) => formatAmountValue(r.discount)}
                      style={{ textAlign: "center" }}
                    />
                    <Column
                      field="totalDue"
                      header="Total Due"
                      body={(r) => formatAmountValue(r.totalDue)}
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        color: "#006064",
                      }}
                    />
                  </DataTable>

                  {/* Print-only container displaying all rows */}
                  <div className="print-table-container">
                    <table className="print-table">
                      <thead>
                        <tr>
                          <th>Sr No</th>
                          <th>Date</th>
                          <th>Patient Name</th>
                          <th>Total Package</th>
                          <th>Invoice Type</th>
                          <th>Cash</th>
                          <th>Card</th>
                          <th>Cheque</th>
                          <th>Online</th>
                          <th>Discount</th>
                          <th>Total Due</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{formatValue(formatDateDisplay(item.date))}</td>
                            <td>{formatValue(item.patientName)}</td>
                            <td>{formatAmountValue(item.totalPackage)}</td>
                            <td>{formatValue(item.invoiceType)}</td>
                            <td>{formatAmountValue(item.cash)}</td>
                            <td>{formatAmountValue(item.card)}</td>
                            <td>{formatAmountValue(item.cheque)}</td>
                            <td>{formatAmountValue(item.online)}</td>
                            <td>{formatAmountValue(item.discount)}</td>
                            <td>{formatAmountValue(item.totalDue)}</td>
                          </tr>
                        ))}
                        {/* Totals row inside tbody to avoid page repetition on multiple pages */}
                        <tr className="print-totals-row">
                          <td colSpan={3}>Total</td>
                          <td>{formatAmountValue(printTotals.totalPackage)}</td>
                          <td></td>
                          <td>{formatAmountValue(printTotals.cash)}</td>
                          <td>{formatAmountValue(printTotals.card)}</td>
                          <td>{formatAmountValue(printTotals.cheque)}</td>
                          <td>{formatAmountValue(printTotals.online)}</td>
                          <td>{formatAmountValue(printTotals.discount)}</td>
                          <td>{formatAmountValue(printTotals.totalDue)}</td>
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
          justify-content: center !important;
          text-align: center !important;
        }
        .custom-datatable .p-datatable-tbody > tr > td {
          font-size: 11px;
          padding: 8px;
          border: 1px solid #90caf9;
          text-align: center !important;
        }
        .custom-datatable .p-datatable-tfoot > tr > td { background-color: #e0f7fa !important; color: black !important; padding: 10px 8px; border: 1px solid #90caf9 !important; font-size: 12px; }
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

export default IPDDueReport;
