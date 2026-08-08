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

// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://194.195.117.79:5100/api";

const OPDCollectionReports = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState(10);
  const [currentLocation, setCurrentLocation] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [totals, setTotals] = useState({});

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
      alert("Please Enter the all fields details..");
      return;
    }

    setLoading(true);
    try {
      const formatDateForAPI = (dateStr) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const params = new URLSearchParams({
        location: currentLocation,
        Fromdate: formatDateForAPI(fromDate),
        Todate: formatDateForAPI(toDate),
      });

      const response = await fetch(
        `${BASE_URL}/V1/managereports/OpdCollectionReportDetails?${params}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch data");
      }

      const msg = await response.json();

      // 1. Handle Backup/File Download logic from PHP
      if (msg.serachdata2?.success) {
        if (
          window.confirm(
            msg.serachdata2.message +
            "\n\nDo you want to download the backup file?",
          )
        ) {
          window.location.href = msg.serachdata2.file_url;
          setLoading(false);
          return;
        }
      }

      // 2. Process Data logic (Replicating PHP calculation loop)
      const rawData = msg.serachdata1 || [];

      let TotalCash = 0,
        TotalCard = 0,
        TotalPaytm = 0,
        TotalOnline = 0,
        TotalDiscount = 0;

      const seenReceipts = new Set();

      const processedData = rawData.map((row) => {
        const total = isNaN(Number(row.total)) ? 0 : Number(row.total);
        
        let discount = 0;
        if (row.receipt_id) {
          if (!seenReceipts.has(row.receipt_id)) {
            discount = isNaN(Number(row.discountamt)) ? 0 : Number(row.discountamt);
            seenReceipts.add(row.receipt_id);
          }
        } else {
          // Fallback if receipt_id is missing
          discount = isNaN(Number(row.discountamt)) ? 0 : Number(row.discountamt);
        }

        const paymentMode = row.payment_mode || "";

        let cash = 0,
          card = 0,
          paytm = 0,
          online = 0;

        // Mapping amounts to columns based on payment mode logic
        switch (paymentMode) {
          case "Cash":
            cash = total;
            TotalCash += total;
            break;
          case "Card":
            card = total;
            TotalCard += total;
            break;
          case "Paytm":
            paytm = total;
            TotalPaytm += total;
            break;
          case "Online":
          case "UPI":
            online = total;
            TotalOnline += total;
            break;
          default:
            break;
        }
        TotalDiscount += discount;

        // Parse additional_info JSON logic (Case 1, 2, and 3)
        let utrValue = "";
        try {
          if (row.additional_info) {
            const info = JSON.parse(row.additional_info);
            if (Array.isArray(info) && info.length > 0) {
              utrValue =
                info[0].paymentMode === "CardPayment"
                  ? info[0].partnerTxnId
                  : info[0].pgwTxnid;
            } else if (info && typeof info === "object") {
              if (
                "ResponseCode" in info &&
                Array.isArray(info.TransactionData)
              ) {
                const rrnObj = info.TransactionData.find(
                  (e) => e.Tag === "RRN",
                );
                utrValue = rrnObj ? rrnObj.Value : "";
              } else if ("rrn" in info) {
                utrValue = info.rrn;
              }
            }
          }
        } catch (err) {
          console.warn("JSON parse error", err);
        }

        return {
          ...row,
          receipt_date: row.item_date || "N/A",
          patientName: row.patient || "N/A",
          consultation:
            row.consultation === "OTHERS"
              ? `OTHERS (${row.comment || ""})`
              : row.consultation,
          cashamt: cash,
          cardamt: card,
          paytmamt: paytm,
          onlineamt: online,
          discount: discount,
          utr: utrValue || "",
        };
      });

      // 3. Set State
      setTotals({
        cash: TotalCash,
        card: TotalCard,
        paytm: TotalPaytm,
        online: TotalOnline,
        discount: TotalDiscount,
      });
      setTableData(processedData);
    } catch (error) {
      console.error("Error:", error);
      alert(`Failed to fetch data: ${error.message}`);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const excelData = tableData.map((item, index) => ({
      "Sr No": index + 1,
      "Patient Name": item.patientName,
      "Receipt Date": formatDateDisplay(item.receipt_date),
      Consultation: item.consultation,
      Cash: item.cashamt,
      Card: item.cardamt,
      Paytm: item.paytmamt,
      Online: item.onlineamt,
      Discount: item.discount,
      "UTR No": item.utr,
    }));

    // Add totals row
    excelData.push({
      "Sr No": "Total",
      "Patient Name": "",
      "Receipt Date": "",
      Consultation: "",
      Cash: totals.cash,
      Card: totals.card,
      Paytm: totals.paytm,
      Online: totals.online,
      Discount: totals.discount,
      "UTR No": "",
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    saveAs(data, "OPD_Collection_Report" + fileExtension);
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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

  const formatValue = (val) => {
    if (val === null || val === undefined || val === "" || val === "N/A" || val === 0 || val === "0") {
      return "-";
    }
    if (typeof val === "string" && (val.trim() === "OTHERS ()" || val.trim() === "OTHERS" || val.trim() === "-")) {
      return "-";
    }
    return val;
  };

  const formatAmount = (val) => {
    if (val === null || val === undefined || val === "" || val === "N/A" || val === 0 || val === "0" || val === "-") {
      return "-";
    }
    const parsed = parseFloat(val);
    return isNaN(parsed) ? val : `₹ ${Math.round(parsed).toLocaleString("en-IN")}`;
  };

  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column
          footer="Total"
          colSpan={4}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatAmount(totals.cash || 0)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatAmount(totals.card || 0)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatAmount(totals.paytm || 0)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatAmount(totals.online || 0)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatAmount(totals.discount || 0)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer=""
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
      </Row>
    </ColumnGroup>
  );

  const getFilteredData = () => {
    if (!searchText) return tableData;
    const query = searchText.toLowerCase().trim();
    return tableData.filter((item) => {
      const patientName = (item.patientName || "").toLowerCase();
      const receiptDate = formatDateDisplay(item.receipt_date).toLowerCase();
      const consultation = (item.consultation || "").toLowerCase();
      const cash = String(item.cashamt || "").toLowerCase();
      const card = String(item.cardamt || "").toLowerCase();
      const paytm = String(item.paytmamt || "").toLowerCase();
      const online = String(item.onlineamt || "").toLowerCase();
      const discount = String(item.discount || "").toLowerCase();
      const utr = (item.utr || "").toLowerCase();

      return (
        patientName.includes(query) ||
        receiptDate.includes(query) ||
        consultation.includes(query) ||
        cash.includes(query) ||
        card.includes(query) ||
        paytm.includes(query) ||
        online.includes(query) ||
        discount.includes(query) ||
        utr.includes(query)
      );
    });
  };

  const filteredData = getFilteredData();
  const printTotals = filteredData.reduce(
    (acc, curr) => {
      acc.cash += Number(curr.cashamt) || 0;
      acc.card += Number(curr.cardamt) || 0;
      acc.paytm += Number(curr.paytmamt) || 0;
      acc.online += Number(curr.onlineamt) || 0;
      acc.discount += Number(curr.discount) || 0;
      return acc;
    },
    { cash: 0, card: 0, paytm: 0, online: 0, discount: 0 }
  );

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
      <PageBreadcrumb pagename="OPD Collection Report" />

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
                  <h4 style={{ margin: 0 }}>OPD Collection Report</h4>
                  {fromDate && toDate && (
                    <div style={{ fontSize: "13px", fontWeight: "normal", marginTop: "5px" }}>
                      Date Range: <b>{formatDateDisplay(fromDate)}</b> to <b>{formatDateDisplay(toDate)}</b>
                    </div>
                  )}
                </Card.Header>
                <Card.Body style={{ padding: "5px" }}>
                  <Form onSubmit={handleFind} className="no-print">
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
                      field="patientName"
                      header="Patient Name"
                      body={(rowData) => formatValue(rowData.patientName)}
                    />
                    <Column
                      field="receipt_date"
                      header="Receipt Date"
                      body={(rowData) =>
                        formatValue(formatDateDisplay(rowData.receipt_date))
                      }
                    />
                    <Column
                      field="consultation"
                      header="Consultation"
                      body={(rowData) => formatValue(rowData.consultation)}
                    />
                    <Column
                      field="cashamt"
                      header="Cash"
                      body={(rowData) => formatAmount(rowData.cashamt)}
                    />
                    <Column
                      field="cardamt"
                      header="Card"
                      body={(rowData) => formatAmount(rowData.cardamt)}
                    />
                    <Column
                      field="paytmamt"
                      header="Paytm"
                      body={(rowData) => formatAmount(rowData.paytmamt)}
                    />
                    <Column
                      field="onlineamt"
                      header="Online"
                      body={(rowData) => formatAmount(rowData.onlineamt)}
                    />
                    <Column
                      field="discount"
                      header="Discount"
                      body={(rowData) => formatAmount(rowData.discount)}
                    />
                    <Column
                      field="utr"
                      header="UTR No"
                      body={(rowData) => formatValue(rowData.utr)}
                    />
                  </DataTable>

                  {/* Print-only container displaying all rows */}
                  <div className="print-table-container">
                    <table className="print-table">
                      <thead>
                        <tr>
                          <th>Sr No</th>
                          <th>Patient Name</th>
                          <th>Receipt Date</th>
                          <th>Consultation</th>
                          <th>Cash</th>
                          <th>Card</th>
                          <th>Paytm</th>
                          <th>Online</th>
                          <th>Discount</th>
                          <th>UTR No</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{formatValue(item.patientName)}</td>
                            <td>{formatValue(formatDateDisplay(item.receipt_date))}</td>
                            <td>{formatValue(item.consultation)}</td>
                            <td>{formatValue(item.cashamt)}</td>
                            <td>{formatValue(item.cardamt)}</td>
                            <td>{formatValue(item.paytmamt)}</td>
                            <td>{formatValue(item.onlineamt)}</td>
                            <td>{formatValue(item.discount)}</td>
                            <td>{formatValue(item.utr)}</td>
                          </tr>
                        ))}
                        {/* Totals row inside tbody to avoid page repetition on multiple pages */}
                        <tr className="print-totals-row">
                          <td colSpan={4}>Total</td>
                          <td>{printTotals.cash || 0}</td>
                          <td>{printTotals.card || 0}</td>
                          <td>{printTotals.paytm || 0}</td>
                          <td>{printTotals.online || 0}</td>
                          <td>{printTotals.discount || 0}</td>
                          <td>-</td>
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
        .custom-datatable .p-datatable-footer {
          background-color: transparent !important;
          border-top: 1px solid #90caf9 !important;
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
          .print-table thead {
            display: table-header-group !important;
          }
          .print-table tbody {
            display: table-row-group !important;
          }
          .print-table tr {
            page-break-inside: avoid !important;
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
        }
      `}</style>
    </div>
  );
};

export default OPDCollectionReports;
