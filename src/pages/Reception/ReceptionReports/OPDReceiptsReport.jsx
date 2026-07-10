import React, { useState, useEffect } from "react";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import SimpleBar from "simplebar-react";
import { Row, Col, Card, Container, Form, Spinner } from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { ColumnGroup } from "primereact/columngroup";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { decodeJwt } from "../../../utils/decode-jwt";

// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://194.195.117.79:5100/api"; // Updated to local API based on previous files

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

const OPDReceiptsReport = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [consultation, setConsultation] = useState("");
  const [patientStatus, setPatientStatus] = useState("");
  const [currentLocation, setCurrentLocation] = useState("default");
  const [consultationOptions, setConsultationOptions] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  useEffect(() => {
    const fetchConsultations = async () => {
      if (!currentLocation || currentLocation === "default") return;
      try {
        const response = await fetch(
          `${BASE_URL}/V1/managereports/consultationDetailsDropdown?location=${currentLocation}`
        );
        const resData = await response.json();
        if (response.ok && Array.isArray(resData.data)) {
          const names = resData.data.map((c) => c.consultation_name);
          if (!names.includes("Cleaning Agent")) {
            names.push("Cleaning Agent");
          }
          // Sort alphabetically ascending (case-insensitive)
          names.sort((a, b) => a.localeCompare(b));
          setConsultationOptions(names);
        }
      } catch (err) {
        console.error("Error fetching consultations:", err);
      }
    };
    fetchConsultations();
  }, [currentLocation]);
  const [paymentMode, setPaymentMode] = useState("");
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState(10);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const handlePrint = () => {
    window.print();
  };

  const getFilteredData = () => {
    if (!searchText) return receipts;
    const query = searchText.toLowerCase().trim();
    return receipts.filter((item) => {
      const displayDate = (item.item_date || "").toLowerCase();
      const patientName = (item.patient || "").toLowerCase();
      const consultation = (item.consultation || "").toLowerCase();
      const patientStatus = (item.chargeCondition || "").toLowerCase();
      // const sprayQty = String(item.sprayqty || "").toLowerCase();
      const paymentMode = (item.payment_mode || "").toLowerCase();
      const amount = String((Number(item.total || 0) - Number(item.discountamt || 0))).toLowerCase();

      return (
        displayDate.includes(query) ||
        patientName.includes(query) ||
        consultation.includes(query) ||
        patientStatus.includes(query) ||
        // sprayQty.includes(query) ||
        paymentMode.includes(query) ||
        amount.includes(query)
      );
    });
  };

  const filteredData = getFilteredData();

  const printTotals = filteredData.reduce(
    (acc, curr) => {
      acc.amount += (Number(curr.total || 0) - Number(curr.discountamt || 0));
      return acc;
    },
    { amount: 0 }
  );

  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column
          footer="Total"
          colSpan={6}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatValue(printTotals.amount)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
      </Row>
    </ColumnGroup>
  );

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setSearchText(value);
  };

  const fetchReceiptsData = async () => {
    setLoading(true);
    try {
      const url = new URL(`${BASE_URL}/V1/managereports/OpdCollectionReportDetails`);
      const today = new Date();

      const formatToDDMMYYYY = (date) => {
        let d = new Date(date);
        return `${String(d.getDate()).padStart(2, "0")}-${String(
          d.getMonth() + 1,
        ).padStart(2, "0")}-${d.getFullYear()}`;
      };

      let finalFromDate = fromDate
        ? formatToDDMMYYYY(fromDate)
        : formatToDDMMYYYY(today);
      let finalToDate = toDate
        ? formatToDDMMYYYY(toDate)
        : formatToDDMMYYYY(today);

      const params = {
        Fromdate: finalFromDate,
        Todate: finalToDate,
        location: currentLocation || undefined,
        Consultation: consultation || undefined,
        Patientstatus: patientStatus || undefined,
        Paymentmode: paymentMode || undefined,
      };

      Object.keys(params).forEach((key) => {
        if (params[key]) url.searchParams.append(key, params[key]);
      });

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        setReceipts(Array.isArray(data.serachdata1) ? data.serachdata1 : []);
      } else {
        console.error(
          "Error fetching receipts:",
          data.message || "Unknown error",
        );
      }
    } catch (error) {
      console.error("Error fetching receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentLocation && currentLocation !== "default") {
      fetchReceiptsData();
    }
  }, [currentLocation]);

  const exportToExcel = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const excelData = receipts.map((receipt, index) => ({
      "Sr No": index + 1,
      Date: formatDateDisplay(receipt.item_date),
      "Patient Name": receipt.patient,
      Consultation: receipt.consultation,
      "Patient Status": receipt.chargeCondition,
      // "Spray Qty": receipt.sprayqty,
      "Payment Mode": receipt.payment_mode,
      Amount: Number(receipt.total || 0) - Number(receipt.discountamt || 0),
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    saveAs(data, "OPD_Receipts_Report" + fileExtension);
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
      <PageBreadcrumb pagename="OPD Receipts Report" />

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
                  <h4 style={{ margin: 0 }}>OPD Receipts Report</h4>
                  {fromDate && toDate && (
                    <div style={{ fontSize: "13px", fontWeight: "normal", marginTop: "5px" }}>
                      Date Range: <b>{formatDateDisplay(fromDate)}</b> to <b>{formatDateDisplay(toDate)}</b>
                    </div>
                  )}
                </Card.Header>
                <Card.Body style={{ padding: "5px" }}>
                  <Row
                    className="align-items-end mb-4 flex-nowrap no-print"
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
                        <Form.Label
                          style={{
                            fontWeight: "bold",
                            color: "#006064",
                            whiteSpace: "nowrap",
                            fontSize: "12px",
                          }}
                        >
                          Consultation
                        </Form.Label>
                        <Form.Select
                          size="sm"
                          value={consultation}
                          onChange={(e) => setConsultation(e.target.value)}
                          style={{
                            border: "2px solid #4dd0e1",
                            borderRadius: "8px",
                            backgroundColor: "#e0f7fa",
                            fontSize: "12px",
                          }}
                        >
                          <option value="">Select</option>
                          {consultationOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </Form.Select>
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
                          Patient Status
                        </Form.Label>
                        <Form.Select
                          size="sm"
                          value={patientStatus}
                          onChange={(e) => setPatientStatus(e.target.value)}
                          style={{
                            border: "2px solid #4dd0e1",
                            borderRadius: "8px",
                            backgroundColor: "#e0f7fa",
                            fontSize: "12px",
                          }}
                        >
                          <option value="">All</option>
                          <option value="DNC">DNC ( Do not Charge )</option>
                          <option value="DNP">DNP ( Do not Pay )</option>
                          <option value="DNW">DNW ( Do not Wait )</option>
                        </Form.Select>
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
                          Payment Mode
                        </Form.Label>
                        <Form.Select
                          size="sm"
                          value={paymentMode}
                          onChange={(e) => setPaymentMode(e.target.value)}
                          style={{
                            border: "2px solid #4dd0e1",
                            borderRadius: "8px",
                            backgroundColor: "#e0f7fa",
                            fontSize: "12px",
                          }}
                        >
                          <option value="">All</option>
                          <option value="Cash">Cash</option>
                          <option value="Card">Card</option>
                          <option value="Paytm">Paytm</option>
                          <option value="Online">Online</option>
                          <option value="UPI">UPI</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col style={{ padding: "0 5px", flex: "1" }}>
                      <Form.Group className="mb-2">
                        <button
                          className="btn btn-primary"
                          onClick={fetchReceiptsData}
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
                      </Form.Group>
                    </Col>
                  </Row>

                  <DataTable
                    value={receipts}
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
                    footerColumnGroup={footerGroup}
                  >
                    <Column
                      header="Sr No"
                      body={(rowData, { rowIndex }) => rowIndex + 1}
                      style={{ width: "60px", textAlign: "center" }}
                    />
                    <Column field="item_date" header="Date" body={(rowData) => formatValue(formatDateDisplay(rowData.item_date))} />
                    <Column field="patient" header="Patient Name" body={(rowData) => formatValue(rowData.patient)} />
                    <Column field="consultation" header="Consultation" body={(rowData) => formatValue(rowData.consultation)} />
                    <Column field="chargeCondition" header="Patient Status" body={(rowData) => formatValue(rowData.chargeCondition)} />
                    {/* <Column field="sprayqty" header="Spray Qty" body={(rowData) => formatValue(rowData.sprayqty)} /> */}
                    <Column field="payment_mode" header="Payment Mode" body={(rowData) => formatValue(rowData.payment_mode)} />
                    <Column field="amount" header="Amount" body={(rowData) => formatValue(Number(rowData.total || 0) - Number(rowData.discountamt || 0))} />
                  </DataTable>

                  {/* Print-only container displaying all rows */}
                  <div className="print-table-container">
                    <table className="print-table">
                      <thead>
                        <tr>
                          <th>Sr No</th>
                          <th>Date</th>
                          <th>Patient Name</th>
                          <th>Consultation</th>
                          <th>Patient Status</th>
                          {/* <th>Spray Qty</th> */}
                          <th>Payment Mode</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{formatValue(formatDateDisplay(item.item_date))}</td>
                            <td>{formatValue(item.patient)}</td>
                            <td>{formatValue(item.consultation)}</td>
                            <td>{formatValue(item.chargeCondition)}</td>
                            {/* <td>{formatValue(item.sprayqty)}</td> */}
                            <td>{formatValue(item.payment_mode)}</td>
                            <td>{formatValue(Number(item.total || 0) - Number(item.discountamt || 0))}</td>
                          </tr>
                        ))}
                        {/* Totals row inside tbody to avoid page repetition on multiple pages */}
                        <tr className="print-totals-row">
                          <td colSpan={6}>Total</td>
                          <td>{formatValue(printTotals.amount)}</td>
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

export default OPDReceiptsReport;
