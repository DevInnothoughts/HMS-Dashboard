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
  if (val === null || val === undefined || val === "" || val === "N/A" || val === 0 || val === "0" || val === "-") {
    return "-";
  }
  return val;
};

const formatAmount = (val) => {
  if (val === null || val === undefined || val === "" || val === "N/A" || val === 0 || val === "0" || val === "-") {
    return "₹ 0";
  }
  const parsed = parseFloat(val);
  return isNaN(parsed) ? val : `₹ ${Math.round(parsed).toLocaleString("en-IN")}`;
};

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return "";
  const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  return datePart.split("-").reverse().join("-");
};

const PharmacyCollectionReport = () => {
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

  const handleFind = async (e) => {
    if (e) e.preventDefault();
    if (!fromDate || !toDate) {
      alert("Please select From Date and To Date.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/managereports/getPharmacyReport`,
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
        }
      );

      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();

      const formattedData = data.map((item) => {
        const paymentMode = item.paymentmode;
        const total = parseFloat(item.final_total) || 0;
        const billNumber =
          item.bill_no ||
          item.billno ||
          (item.pharmacybill_id ? `PH-${item.pharmacybill_id}` : null) ||
          (item.bill_id ? `PH-${item.bill_id}` : null) ||
          (item.id ? `PH-${item.id}` : null) ||
          item.receipt_no ||
          "-";

        return {
          ...item,
          date: item.created_at ? item.created_at.split("T")[0] : "",
          billNo: billNumber,
          patientName: item.patient_name || item.patient || "N/A",
          prescriptionType: item.prescription_type || "General",
          cashamt: paymentMode === "Cash" ? total : 0,
          cardamt: paymentMode === "Card" ? total : 0,
          onlineUpiAmt:
            paymentMode === "Online" || paymentMode === "UPI" ? total : 0,
          discount: parseFloat(item.discountamt) || 0,
        };
      });

      setTableData(formattedData);

      if (formattedData.length === 0) {
        alert("No records found for the selected date range.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`Failed to fetch data: ${error.message}`);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
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
      const displayDate = formatDateDisplay(item.date).toLowerCase();
      const billNo = (item.billNo || "").toLowerCase();
      const patientName = (item.patientName || "").toLowerCase();
      const prescriptionType = (item.prescriptionType || "").toLowerCase();
      const cashamt = String(item.cashamt || "").toLowerCase();
      const onlineUpiAmt = String(item.onlineUpiAmt || "").toLowerCase();
      const cardamt = String(item.cardamt || "").toLowerCase();
      const discount = String(item.discount || "").toLowerCase();

      return (
        displayDate.includes(query) ||
        billNo.includes(query) ||
        patientName.includes(query) ||
        prescriptionType.includes(query) ||
        cashamt.includes(query) ||
        onlineUpiAmt.includes(query) ||
        cardamt.includes(query) ||
        discount.includes(query)
      );
    });
  };

  const filteredData = getFilteredData();

  const printTotals = filteredData.reduce(
    (acc, curr) => ({
      cash: acc.cash + (parseFloat(curr.cashamt) || 0),
      onlineUpi: acc.onlineUpi + (parseFloat(curr.onlineUpiAmt) || 0),
      card: acc.card + (parseFloat(curr.cardamt) || 0),
      discount: acc.discount + (parseFloat(curr.discount) || 0),
    }),
    { cash: 0, onlineUpi: 0, card: 0, discount: 0 }
  );

  const exportToExcel = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const excelData = filteredData.map((item, index) => ({
      "Sr No": index + 1,
      Date: formatDateDisplay(item.date),
      "Bill No": item.billNo,
      "Patient Name": item.patientName,
      Type: item.prescriptionType,
      Cash: item.cashamt,
      "Online/UPI": item.onlineUpiAmt,
      Card: item.cardamt,
      Discount: item.discount,
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    saveAs(data, "Pharmacy_Collection_Report" + fileExtension);
  };

  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column
          footer="Total"
          colSpan={5}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatAmount(printTotals.cash)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatAmount(printTotals.onlineUpi)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatAmount(printTotals.card)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatAmount(printTotals.discount)}
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
      <PageBreadcrumb pagename="Pharmacy Collection Report" />
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
                  <h4 style={{ margin: 0, fontSize: "18px" }}>Pharmacy Collection Report</h4>
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
                            {loading ? "Loading..." : "Search"}
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
                    value={tableData}
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
                      body={(rowData) => formatValue(formatDateDisplay(rowData.date))}
                      style={{ width: "110px", textAlign: "center" }}
                    />
                    <Column
                      field="billNo"
                      header="Bill No"
                      body={(rowData) => formatValue(rowData.billNo)}
                      style={{ width: "120px", textAlign: "center" }}
                    />
                    <Column
                      field="patientName"
                      header="Patient Name"
                      body={(rowData) => formatValue(rowData.patientName)}
                      style={{ width: "180px", wordBreak: "break-word" }}
                    />
                    <Column
                      field="prescriptionType"
                      header="Type"
                      body={(rowData) => formatValue(rowData.prescriptionType)}
                      style={{ width: "110px", textAlign: "center" }}
                    />
                    <Column
                      field="cashamt"
                      header="Cash"
                      body={(r) => formatAmount(r.cashamt)}
                      style={{ width: "120px", textAlign: "center" }}
                    />
                    <Column
                      field="onlineUpiAmt"
                      header="Online/UPI"
                      body={(r) => formatAmount(r.onlineUpiAmt)}
                      style={{ width: "120px", textAlign: "center" }}
                    />
                    <Column
                      field="cardamt"
                      header="Card"
                      body={(r) => formatAmount(r.cardamt)}
                      style={{ width: "120px", textAlign: "center" }}
                    />
                    <Column
                      field="discount"
                      header="Discount"
                      body={(r) => formatAmount(r.discount)}
                      style={{ width: "120px", textAlign: "center" }}
                    />
                  </DataTable>

                  {/* Print-only container displaying all rows */}
                  <div className="print-table-container">
                    <table className="print-table">
                      <thead>
                        <tr>
                          <th style={{ width: "6%" }}>Sr No</th>
                          <th style={{ width: "12%" }}>Date</th>
                          <th style={{ width: "12%" }}>Bill No</th>
                          <th style={{ width: "22%" }}>Patient Name</th>
                          <th style={{ width: "10%" }}>Type</th>
                          <th style={{ width: "10%" }}>Cash</th>
                          <th style={{ width: "10%" }}>Online/UPI</th>
                          <th style={{ width: "9%" }}>Card</th>
                          <th style={{ width: "9%" }}>Discount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{formatValue(formatDateDisplay(item.date))}</td>
                            <td>{formatValue(item.billNo)}</td>
                            <td>{formatValue(item.patientName)}</td>
                            <td>{formatValue(item.prescriptionType)}</td>
                            <td>{formatAmount(item.cashamt)}</td>
                            <td>{formatAmount(item.onlineUpiAmt)}</td>
                            <td>{formatAmount(item.cardamt)}</td>
                            <td>{formatAmount(item.discount)}</td>
                          </tr>
                        ))}
                        <tr className="print-totals-row">
                          <td colSpan={5}>Total</td>
                          <td>{formatAmount(printTotals.cash)}</td>
                          <td>{formatAmount(printTotals.onlineUpi)}</td>
                          <td>{formatAmount(printTotals.card)}</td>
                          <td>{formatAmount(printTotals.discount)}</td>
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

export default PharmacyCollectionReport;
