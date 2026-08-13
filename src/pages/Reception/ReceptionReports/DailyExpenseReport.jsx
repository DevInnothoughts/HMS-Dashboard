import React, { useState, useEffect } from "react";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import { Row, Col, Card, Container, Form } from "react-bootstrap";
import SimpleBar from "simplebar-react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import moment from "moment";

import { decodeJwt } from "../../Utility/decode-jwt";

const BASE_URL = "http://194.195.117.79:5100/api";

const DailyExpenseReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportData, setReportData] = useState([]);
  const [startingBalance, setStartingBalance] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState(10);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("default");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  // 1. Get Location from JWT
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload?.jobLocation) {
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

  // 2. Fetch Data from Backend
  const handleFindClick = async (e) => {
    if (e) e.preventDefault();
    if (!fromDate || !toDate) {
      alert("Please select both From and To dates.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/managereports/getDailyExpenseReport`,
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

      if (!response.ok) throw new Error("Failed to fetch expense report data");

      const resJson = await response.json();
      const rawExpenses = Array.isArray(resJson.expenses) ? resJson.expenses : [];
      const rawFunds = Array.isArray(resJson.funds) ? resJson.funds : [];
      const backendStartBal = parseFloat(resJson.startingBalance || 0);

      setStartingBalance(backendStartBal);

      // Map Database fields to UI fields
      const combined = [
        ...rawExpenses.map((item) => {
          let displayDate = "N/A";
          if (item.date) {
            displayDate = moment(item.date).format("DD-MM-YYYY");
          }
          return {
            id: `exp-${item.id}`,
            date: item.date,
            displayDate,
            purpose: item.reason,
            credit: 0,
            debit: Math.round(parseFloat(item.expenseamt || 0)),
            type: "expense"
          };
        }),
        ...rawFunds.map((item) => {
          let displayDate = "N/A";
          if (item.date) {
            displayDate = moment(item.date).format("DD-MM-YYYY");
          }
          return {
            id: `fund-${item.id}`,
            date: item.date,
            displayDate,
            purpose: "Advance Funds Deposited",
            credit: Math.round(parseFloat(item.advanceamt || 0)),
            debit: 0,
            type: "fund"
          };
        })
      ];

      // Sort chronologically (earliest to latest) to calculate running balance
      combined.sort((a, b) => new Date(a.date) - new Date(b.date));

      let currentBal = backendStartBal;
      const combinedWithBalance = combined.map((item) => {
        currentBal = currentBal + item.credit - item.debit;
        return {
          ...item,
          balance: currentBal
        };
      });

      // Display latest first
      const finalReportData = [...combinedWithBalance].reverse();
      setReportData(finalReportData);
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("Error fetching daily expense report.");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredReportData = () => {
    if (!searchText) return reportData;
    const lowerSearch = searchText.toLowerCase();
    return reportData.filter((item) => {
      return (
        String(item.displayDate || "").toLowerCase().includes(lowerSearch) ||
        String(item.purpose || "").toLowerCase().includes(lowerSearch) ||
        String(item.credit || "").toLowerCase().includes(lowerSearch) ||
        String(item.debit || "").toLowerCase().includes(lowerSearch) ||
        String(item.balance || "").toLowerCase().includes(lowerSearch)
      );
    });
  };

  const filteredReportData = getFilteredReportData();

  const exportToExcel = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const excelRows = [];
    excelRows.push({
      "Sr No": "-",
      Date: "-",
      "Particulars / Purpose": "Opening Balance",
      "Credit (Funds Added)": "-",
      "Debit (Expenses)": "-",
      "Remaining Balance": startingBalance
    });

    filteredReportData.slice().reverse().forEach((item, index) => {
      excelRows.push({
        "Sr No": index + 1,
        Date: item.displayDate,
        "Particulars / Purpose": item.purpose,
        "Credit (Funds Added)": item.credit || 0,
        "Debit (Expenses)": item.debit || 0,
        "Remaining Balance": item.balance
      });
    });

    const ws = XLSX.utils.json_to_sheet(excelRows);
    const wb = { Sheets: { "Ledger": ws }, SheetNames: ["Ledger"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    saveAs(data, "Daily_Expense_Ledger_Report" + fileExtension);
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    return datePart.split("-").reverse().join("-");
  };

  const formatAmount = (val) => {
    if (val === null || val === undefined || val === "" || val === "N/A" || val === 0 || val === "0" || val === "-") {
      return "-";
    }
    const parsed = parseFloat(val);
    return isNaN(parsed) ? val : `₹ ${Math.round(parsed).toLocaleString("en-IN")}`;
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

  const header = renderHeader();

  const totalCredit = filteredReportData.reduce((sum, item) => sum + (item.credit || 0), 0);
  const totalDebit = filteredReportData.reduce((sum, item) => sum + (item.debit || 0), 0);

  const finalRemainingBalance = reportData[0]?.balance ?? startingBalance;

  const ledgerFooterGroup = (
    <ColumnGroup>
      <tr>
        <Column footer="Total:" colSpan={3} footerStyle={{ textAlign: "right", fontWeight: "bold" }} />
        <Column footer={formatAmount(totalCredit)} footerStyle={{ textAlign: "center", fontWeight: "bold" }} />
        <Column footer={formatAmount(totalDebit)} footerStyle={{ textAlign: "center", fontWeight: "bold" }} />
        <Column footer={formatAmount(finalRemainingBalance)} footerStyle={{ textAlign: "center", fontWeight: "bold" }} />
      </tr>
    </ColumnGroup>
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
      <PageBreadcrumb pagename="Daily Expense Report" />

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
                  <h4 style={{ margin: 0 }}>Daily Expense Report</h4>
                  {fromDate && toDate && (
                    <div style={{ fontSize: "13px", fontWeight: "normal", marginTop: "5px" }}>
                      Date Range: <b>{formatDateDisplay(fromDate)}</b> to <b>{formatDateDisplay(toDate)}</b>
                    </div>
                  )}
                </Card.Header>
                <Card.Body style={{ padding: "15px" }}>
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
                      <Col style={{ padding: "0 5px", flex: "1" }}>
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

                  {/* Header containing search & export actions */}
                  <div className="no-print mb-3">
                    {header}
                  </div>

                  <div className="no-print">
                    <DataTable
                      value={reportData}
                      paginator
                      rows={rows}
                      loading={loading}
                      filters={filters}
                      footerColumnGroup={ledgerFooterGroup}
                      className="p-datatable-sm custom-datatable"
                      style={{ fontSize: "12px", marginTop: "10px" }}
                      rowHover
                      stripedRows
                      responsiveLayout="scroll"
                      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                      currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                    >
                      <Column
                        header="Sr No"
                        body={(rowData, { rowIndex }) => rowIndex + 1}
                        style={{ width: "60px", textAlign: "center" }}
                      />
                      <Column
                        field="displayDate"
                        header="Date"
                        style={{ textAlign: "center", width: "120px" }}
                        body={(rowData) => <span style={{ color: "#212529", fontWeight: "500" }}>{rowData.displayDate}</span>}
                      />
                      <Column
                        field="purpose"
                        header="Particulars / Purpose"
                        style={{
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                          minWidth: "220px",
                          textAlign: "left"
                        }}
                        body={(rowData) => {
                          if (rowData.type === "fund") {
                            return (
                              <span style={{ fontWeight: "600", color: "#2e7d32" }}>
                                {rowData.purpose}
                              </span>
                            );
                          } else {
                            return <span style={{ color: "#212529", fontWeight: "500" }}>{rowData.purpose}</span>;
                          }
                        }}
                      />
                      <Column
                        field="credit"
                        header="Credit (Funds Added)"
                        style={{ textAlign: "center", width: "160px" }}
                        body={(rowData) => (
                          rowData.credit > 0 ? (
                            <span style={{ color: "#2e7d32" }}>
                              + {formatAmount(rowData.credit)}
                            </span>
                          ) : "-"
                        )}
                      />
                      <Column
                        field="debit"
                        header="Debit (Expenses Incurred)"
                        style={{ textAlign: "center", width: "180px" }}
                        body={(rowData) => (
                          rowData.debit > 0 ? (
                            <span style={{ color: "#c62828" }}>
                              - {formatAmount(rowData.debit)}
                            </span>
                          ) : "-"
                        )}
                      />
                      <Column
                        field="balance"
                        header="Remaining Balance"
                        style={{ textAlign: "center", width: "160px" }}
                        body={(rowData) => <span style={{ color: "#212529", fontWeight: "500" }}>{formatAmount(rowData.balance)}</span>}
                      />
                    </DataTable>
                  </div>

                  {/* Print-only container displaying all rows */}
                  <div className="print-table-container">
                    <table className="print-table">
                      <thead>
                        <tr>
                          <th>Sr No</th>
                          <th>Date</th>
                          <th>Particulars / Purpose</th>
                          <th>Credit (Funds Added)</th>
                          <th>Debit (Expenses)</th>
                          <th>Remaining Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Opening Balance Row */}
                        <tr>
                          <td>-</td>
                          <td>-</td>
                          <td style={{ textAlign: "left" }}>
                            Opening Balance (Before selected range)
                          </td>
                          <td>-</td>
                          <td>-</td>
                          <td>{formatAmount(startingBalance)}</td>
                        </tr>
                        {filteredReportData
                          .slice()
                          .reverse()
                          .map((item, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{item.displayDate}</td>
                              <td style={{ wordBreak: "break-word", whiteSpace: "normal", textAlign: "left" }}>
                                {item.purpose}
                              </td>
                              <td className={item.credit > 0 ? "text-success-print" : ""}>
                                {item.credit > 0 ? `+ ${formatAmount(item.credit)}` : "-"}
                              </td>
                              <td className={item.debit > 0 ? "text-danger-print" : ""}>
                                {item.debit > 0 ? `- ${formatAmount(item.debit)}` : "-"}
                              </td>
                              <td>{formatAmount(item.balance)}</td>
                            </tr>
                          ))}
                        {/* Totals row inside tbody to avoid page repetition on multiple pages */}
                        <tr className="print-totals-row">
                          <td colSpan={3} style={{ fontWeight: "bold", textAlign: "right" }}>
                            Total:
                          </td>
                          <td style={{ fontWeight: "bold" }}>{formatAmount(totalCredit)}</td>
                          <td style={{ fontWeight: "bold" }}>{formatAmount(totalDebit)}</td>
                          <td style={{ fontWeight: "bold" }}>
                            {formatAmount(finalRemainingBalance)}
                          </td>
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
          font-weight: bold !important;
        }
        .custom-datatable .p-datatable-thead > tr > th * {
          justify-content: center !important;
        }
        .custom-datatable .p-datatable-tbody > tr > td {
          font-size: 12px;
          padding: 8px !important;
          border: 1px solid #90caf9 !important;
          text-align: center !important;
          color: #212529 !important;
        }
        .custom-datatable .p-datatable-tfoot > tr > td {
          background-color: #b2ebf2 !important;
          color: black !important;
          padding: 10px 8px !important;
          border: 1px solid #90caf9 !important;
          font-size: 12px;
          text-align: center !important;
        }

        @media print {
          body {
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
          .text-success-print {
            color: #2e7d32 !important;
          }
          .text-danger-print {
            color: #c62828 !important;
          }
          .print-table tbody tr:nth-child(even) td {
            background-color: #e0f7fa !important;
          }
          .print-table .print-totals-row td {
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

export default DailyExpenseReport;
