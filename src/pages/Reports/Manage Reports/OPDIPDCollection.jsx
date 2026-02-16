import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Container,
  Form,
} from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { ColumnGroup } from 'primereact/columngroup';
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import SimpleBar from "simplebar-react";

const BASE_URL = "http://localhost:5100/api";

const OPDIPDCollection = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tableData, setTableData] = useState([
    {
      receiptDate: "2025-01-07",
      opdCash: 15000,
      ipdCash: 25000,
      opdCard: 5000,
      ipdCard: 10000,
      opdCheque: 0,
      ipdCheque: 0,
      opdOnline: 8000,
      ipdOnline: 12000,
    },
    {
      receiptDate: "2025-01-08",
      opdCash: 12000,
      ipdCash: 30000,
      opdCard: 8000,
      ipdCard: 15000,
      opdCheque: 2000,
      ipdCheque: 0,
      opdOnline: 10000,
      ipdOnline: 18000,
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState(10);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [totals, setTotals] = useState({
    opdCash: 27000,
    ipdCash: 55000,
    opdCard: 13000,
    ipdCard: 25000,
    opdCheque: 2000,
    ipdCheque: 0,
    opdOnline: 18000,
    ipdOnline: 30000,
  });

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
      // Placeholder for API call
      // const response = await axios.post(`${BASE_URL}/v1/report/opdipdcollection`, { Fromdate: fromDate, Todate: toDate });
      // const data = response.data;

      // For now using mock update to show functionality
      const data = tableData;

      const newTotals = data.reduce((acc, curr) => ({
        opdCash: acc.opdCash + (curr.opdCash || 0),
        ipdCash: acc.ipdCash + (curr.ipdCash || 0),
        opdCard: acc.opdCard + (curr.opdCard || 0),
        ipdCard: acc.ipdCard + (curr.ipdCard || 0),
        opdCheque: acc.opdCheque + (curr.opdCheque || 0),
        ipdCheque: acc.ipdCheque + (curr.ipdCheque || 0),
        opdOnline: acc.opdOnline + (curr.opdOnline || 0),
        ipdOnline: acc.ipdOnline + (curr.ipdOnline || 0),
      }), { opdCash: 0, ipdCash: 0, opdCard: 0, ipdCard: 0, opdCheque: 0, ipdCheque: 0, opdOnline: 0, ipdOnline: 0 });

      setTotals(newTotals);
      setTableData(data);

      if (data.length === 0) {
        alert("No records found for the selected date range");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`Failed to fetch data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const exportToExcel = () => {
    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const excelData = tableData.map((item, index) => ({
      "Sr No": index + 1,
      "Receipt Date": formatDateDisplay(item.receiptDate),
      "OPD Cash": item.opdCash,
      "IPD Cash": item.ipdCash,
      "OPD Card": item.opdCard,
      "IPD Card": item.ipdCard,
      "OPD Cheque": item.opdCheque,
      "IPD Cheque": item.ipdCheque,
      "OPD Online": item.opdOnline,
      "IPD Online": item.ipdOnline,
    }));

    // Add totals row
    excelData.push({
      "Sr No": "Total",
      "Receipt Date": "",
      "OPD Cash": totals.opdCash,
      "IPD Cash": totals.ipdCash,
      "OPD Card": totals.opdCard,
      "IPD Card": totals.ipdCard,
      "OPD Cheque": totals.opdCheque,
      "IPD Cheque": totals.ipdCheque,
      "OPD Online": totals.opdOnline,
      "IPD Online": totals.ipdOnline,
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    saveAs(data, "OPD_IPD_Collection_Report" + fileExtension);
  };

  const downloadPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    doc.setFontSize(16);
    doc.text("OPD+IPD Collection Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Date: ${today}`, 14, 22);

    const tableColumn = [
      "Sr No", "Receipt Date", "OPD Cash", "IPD Cash", "OPD Card", "IPD Card", "OPD Cheque", "IPD Cheque", "OPD Online", "IPD Online"
    ];
    const tableRows = tableData.map((item, index) => [
      index + 1,
      formatDateDisplay(item.receiptDate),
      item.opdCash,
      item.ipdCash,
      item.opdCard,
      item.ipdCard,
      item.opdCheque,
      item.ipdCheque,
      item.opdOnline,
      item.ipdOnline,
    ]);

    // Add totals row
    tableRows.push([
      "Total", "", totals.opdCash, totals.ipdCash, totals.opdCard, totals.ipdCard, totals.opdCheque, totals.ipdCheque, totals.opdOnline, totals.ipdOnline
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 172, 193] },
      didParseCell: (data) => {
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    doc.save("OPD_IPD_Collection_Report.pdf");
  };

  const renderHeader = () => {
    return (
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="d-flex align-items-center" style={{ gap: "20px" }}>
          <div className="d-flex align-items-center">
            <span className="me-1" style={{ fontWeight: "bold", color: "#006064" }}>Show</span>
            <Form.Select
              size="sm"
              style={{ width: "70px", borderRadius: "8px", border: "1px solid #4dd0e1" }}
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
            <span className="me-1" style={{ fontWeight: "bold", color: "#006064" }}>Search</span>
            <span className="p-input-icon-left">
              <InputText
                value={searchText}
                onChange={onGlobalFilterChange}
                placeholder="Global Search..."
                className="p-inputtext-sm"
                style={{ width: "200px", borderRadius: "8px", border: "1px solid #4dd0e1" }}
              />
            </span>
          </div>
        </div>
        <div className="d-flex" style={{ gap: "10px" }}>
          <button
            className="btn btn-success btn-sm"
            onClick={exportToExcel}
            style={{ display: "flex", alignItems: "center", gap: "5px", borderRadius: "8px" }}
          >
            <i className="fa fa-file-excel-o"></i> Download Excel
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={downloadPDF}
            style={{ display: "flex", alignItems: "center", gap: "5px", borderRadius: "8px" }}
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
        <Column footer="Total" colSpan={2} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
        <Column footer={totals.opdCash} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
        <Column footer={totals.ipdCash} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
        <Column footer={totals.opdCard} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
        <Column footer={totals.ipdCard} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
        <Column footer={totals.opdCheque} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
        <Column footer={totals.ipdCheque} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
        <Column footer={totals.opdOnline} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
        <Column footer={totals.ipdOnline} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
      </Row>
    </ColumnGroup>
  );

  const header = renderHeader();

  return (
    <div
      className="themebody-wrap"
      style={{
        padding: "20px",
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
                    padding: "1rem",
                    background: "linear-gradient(to right, #00acc1, #007c91)",
                    color: "white",
                    fontSize: "16px",
                  }}
                >
                  <h4 style={{ margin: 0 }}>Consolidated Collection (OPD + IPD)</h4>
                </Card.Header>
                <Card.Body style={{ padding: "5px" }}>
                  <Form onSubmit={handleSearch}>
                    <Row className="align-items-end mb-4 flex-nowrap" style={{ margin: "0 -5px" }}>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ fontWeight: "bold", color: "#006064", whiteSpace: "nowrap", fontSize: "12px" }}>From Date</Form.Label>
                          <Form.Control
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            style={{ border: "2px solid #4dd0e1", borderRadius: "8px", padding: "6px", backgroundColor: "#e0f7fa", fontSize: "12px" }}
                          />
                        </Form.Group>
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ fontWeight: "bold", color: "#006064", whiteSpace: "nowrap", fontSize: "12px" }}>To Date</Form.Label>
                          <Form.Control
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            style={{ border: "2px solid #4dd0e1", borderRadius: "8px", padding: "6px", backgroundColor: "#e0f7fa", fontSize: "12px" }}
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
                              fontSize: "13px"
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
                    <Column field="receiptDate" header="Receipt Date" body={(rowData) => formatDateDisplay(rowData.receiptDate)} />
                    <Column field="opdCash" header="OPD Cash" />
                    <Column field="ipdCash" header="IPD Cash" />
                    <Column field="opdCard" header="OPD Card" />
                    <Column field="ipdCard" header="IPD Card" />
                    <Column field="opdCheque" header="OPD Cheque" />
                    <Column field="ipdCheque" header="IPD Cheque" />
                    <Column field="opdOnline" header="OPD Online" />
                    <Column field="ipdOnline" header="IPD Online" />
                  </DataTable>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </SimpleBar>
      <style>{`
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
          font-size: 11px;
          padding: 10px 4px !important;
          border: 1px solid #90caf9 !important;
          text-align: center !important;
        }
        .custom-datatable .p-datatable-thead > tr > th * {
          color: black !important;
          justify-content: center !important;
        }
        .custom-datatable .p-datatable-tbody > tr > td {
          font-size: 11px;
          padding: 8px 4px;
          border: 1px solid #90caf9;
          text-align: center !important;
        }
        .custom-datatable .p-datatable-tfoot > tr > td {
          background-color: #e0f7fa !important;
          color: black !important;
          padding: 10px 4px;
          border: 1px solid #90caf9 !important;
          font-size: 11px;
          text-align: center !important;
        }
        .custom-datatable .p-paginator {
          background: #f8fdfe;
          border: 1px solid #4dd0e1;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          padding: 5px;
        }
      `}</style>
    </div>
  );
};

export default OPDIPDCollection;
