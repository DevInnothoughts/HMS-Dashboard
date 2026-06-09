import React, { useState, useEffect } from "react";
import { Row, Col, Card, Container, Form } from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { ColumnGroup } from "primereact/columngroup";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import SimpleBar from "simplebar-react";
import { decodeJwt } from "../../../utils/decode-jwt";

const BASE_URL = "http://localhost:5100/api";

const InsuranceDueReport = () => {
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

  const [totals, setTotals] = useState({
    totalAmt: 0,
    approvedAmt: 0,
    receivedAmt: 0,
    dueAmt: 0,
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

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!fromDate || !toDate) {
      alert("Please Enter the all fields details..");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/managereports/getInsuranceDueReport`,
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

      if (!response.ok) throw new Error("Failed to fetch insurance data");
      const rawData = await response.json();

      const processedData = rawData.map((item) => {
        const received =
          (parseInt(item.receivedamt) || 0) + (parseInt(item.tdsamt) || 0);
        const approved = parseInt(item.authoamt) || 0;
        const due = approved - received;

        return {
          ...item,
          patientName: item.patientname,
          date: item.creationdate ? item.creationdate.split("T")[0] : "",
          companyName: item.companyname,
          invoiceNo: item.invoiceid,
          totalAmt: parseInt(item.totalamt) || 0,
          approvedAmt: approved,
          receivedAmt: received,
          dueAmt: isNaN(due) ? 0 : due,
        };
      });

      const newTotals = processedData.reduce(
        (acc, curr) => ({
          totalAmt: acc.totalAmt + curr.totalAmt,
          approvedAmt: acc.approvedAmt + curr.approvedAmt,
          receivedAmt: acc.receivedAmt + curr.receivedAmt,
          dueAmt: acc.dueAmt + curr.dueAmt,
        }),
        { totalAmt: 0, approvedAmt: 0, receivedAmt: 0, dueAmt: 0 },
      );

      setTotals(newTotals);
      setTableData(processedData);

      if (processedData.length === 0) {
        alert("No records found for the selected date range");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`Error: ${error.message}`);
      setTableData([]);
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
      Date: formatDateDisplay(item.date),
      "Patient Name": item.patientName,
      "Company Name": item.companyName,
      "Invoice No": item.invoiceNo,
      "Total Amt": item.totalAmt,
      "Approved Amt": item.approvedAmt,
      "Received Amt": item.receivedAmt,
      "Due Amt": item.dueAmt,
    }));

    excelData.push({
      "Sr No": "Total",
      Date: "",
      "Patient Name": "",
      "Company Name": "",
      "Invoice No": "",
      "Total Amt": totals.totalAmt,
      "Approved Amt": totals.approvedAmt,
      "Received Amt": totals.receivedAmt,
      "Due Amt": totals.dueAmt,
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([excelBuffer], { type: fileType }),
      "Insurance_Due_Report.xlsx",
    );
  };

  const downloadPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    doc.setFontSize(16);
    doc.text("Insurance Due Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Date: ${today}`, 14, 22);

    const tableColumn = [
      "Sr No",
      "Date",
      "Patient Name",
      "Company Name",
      "Invoice No",
      "Total Amt",
      "Approved Amt",
      "Received Amt",
      "Due Amt",
    ];
    const tableRows = tableData.map((item, index) => [
      index + 1,
      formatDateDisplay(item.date),
      item.patientName,
      item.companyName,
      item.invoiceNo,
      item.totalAmt,
      item.approvedAmt,
      item.receivedAmt,
      item.dueAmt,
    ]);

    tableRows.push([
      "Total",
      "",
      "",
      "",
      "",
      totals.totalAmt,
      totals.approvedAmt,
      totals.receivedAmt,
      totals.dueAmt,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 172, 193], halign: "center" },
      columnStyles: {
        0: { halign: "center" },
        1: { halign: "center" },
        2: { halign: "center" },
        3: { halign: "center" },
        4: { halign: "center" },
        5: { halign: "center" },
        6: { halign: "center" },
        7: { halign: "center" },
        8: { halign: "center" },
      },
      didParseCell: (data) => {
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = "bold";
        }
      },
    });
    doc.save("Insurance_Due_Report.pdf");
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
            onClick={downloadPDF}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              borderRadius: "8px",
            }}
          >
            <i className="fa fa-file-pdf-o"></i> Download PDF
          </button>
        </div>
      </div>
    );
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
          footer={totals.totalAmt}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={totals.approvedAmt}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={totals.receivedAmt}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={totals.dueAmt}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
      </Row>
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
      <PageBreadcrumb pagename="Insurance Due Report" />
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
                  <h4 style={{ margin: 0 }}>Insurance Due Report</h4>
                </Card.Header>
                <Card.Body style={{ padding: "5px" }}>
                  <Form onSubmit={handleSearch}>
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
                      body={(rowData, { rowIndex }) => rowIndex + 1}
                      style={{ width: "60px", textAlign: "center" }}
                    />
                    <Column
                      field="date"
                      header="Date"
                      body={(rowData) => formatDateDisplay(rowData.date)}
                    />
                    <Column field="patientName" header="Patient Name" />
                    <Column field="companyName" header="Company Name" />
                    <Column field="invoiceNo" header="Invoice No" />
                    <Column field="totalAmt" header="Total Amt" />
                    <Column field="approvedAmt" header="Approved Amt" />
                    <Column field="receivedAmt" header="Received Amt" />
                    <Column field="dueAmt" header="Due Amt" />
                  </DataTable>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </SimpleBar>
      <style>{`
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
      `}</style>
    </div>
  );
};

export default InsuranceDueReport;
