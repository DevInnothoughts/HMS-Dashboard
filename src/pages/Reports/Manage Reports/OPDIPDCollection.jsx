import React, { useState, useEffect } from "react";
import { Row, Col, Card, Container, Form } from "react-bootstrap";
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
import { decodeJwt } from "../../../utils/decode-jwt";

const BASE_URL = "http://194.195.117.79:5100/api";

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

  const [totals, setTotals] = useState({
    opdCash: 0, ipdCash: 0, opdCard: 0, ipdCard: 0,
    opdCheque: 0, ipdCheque: 0, opdOnline: 0, ipdOnline: 0,
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
    opdData.forEach(item => {
      const dateKey = item.date.split('T')[0];
      mergedMap[dateKey] = {
        receiptDate: dateKey,
        opdCash: parseFloat(item.opdCash) || 0,
        opdCard: parseFloat(item.opdCard) || 0,
        opdCheque: parseFloat(item.opdCheque) || 0,
        opdOnline: parseFloat(item.opdOnline) || 0,
        ipdCash: 0, ipdCard: 0, ipdCheque: 0, ipdOnline: 0
      };
    });

    ipdData.forEach(item => {
      const dateKey = item.date.split('T')[0];
      if (!mergedMap[dateKey]) {
        mergedMap[dateKey] = {
          receiptDate: dateKey,
          opdCash: 0, opdCard: 0, opdCheque: 0, opdOnline: 0,
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

    return Object.values(mergedMap).sort((a, b) => new Date(b.receiptDate) - new Date(a.receiptDate));
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!fromDate || !toDate) {
      alert("Please Enter all date fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/V1/managereports/getConsolidatedReport`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          location: currentLocation,
          Fromdate: fromDate,
          Todate: toDate
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch consolidated data");
      const result = await response.json();
      const mergedData = mergeCollectionData(result.opdData || [], result.ipdData || []);

      const newTotals = mergedData.reduce((acc, curr) => ({
        opdCash: acc.opdCash + curr.opdCash,
        ipdCash: acc.ipdCash + curr.ipdCash,
        opdCard: acc.opdCard + curr.opdCard,
        ipdCard: acc.ipdCard + curr.ipdCard,
        opdCheque: acc.opdCheque + curr.opdCheque,
        ipdCheque: acc.ipdCheque + curr.ipdCheque,
        opdOnline: acc.opdOnline + curr.opdOnline,
        ipdOnline: acc.ipdOnline + curr.ipdOnline,
      }), { opdCash: 0, ipdCash: 0, opdCard: 0, ipdCard: 0, opdCheque: 0, ipdCheque: 0, opdOnline: 0, ipdOnline: 0 });

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
    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const excelData = tableData.map((item, index) => ({
      "Sr No": index + 1,
      "Date": formatDateDisplay(item.receiptDate),
      "OPD Cash": item.opdCash, "IPD Cash": item.ipdCash,
      "OPD Card": item.opdCard, "IPD Card": item.ipdCard,
      "OPD Cheque": item.opdCheque, "IPD Cheque": item.ipdCheque,
      "OPD Online": item.opdOnline, "IPD Online": item.ipdOnline,
    }));
    excelData.push({ "Sr No": "TOTAL", "Date": "", ...totals });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["Consolidated"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: fileType }), `Consolidated_Report.xlsx`);
  };

  const downloadPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    doc.text("Consolidated OPD + IPD Collection Report", 14, 15);
    const tableColumn = ["Sr No", "Date", "OPD Cash", "IPD Cash", "OPD Card", "IPD Card", "OPD Chq", "IPD Chq", "OPD Onl", "IPD Onl"];
    const tableRows = tableData.map((item, index) => [
      index + 1, formatDateDisplay(item.receiptDate),
      item.opdCash, item.ipdCash, item.opdCard, item.ipdCard,
      item.opdCheque, item.ipdCheque, item.opdOnline, item.ipdOnline,
    ]);
    tableRows.push(["Total", "", totals.opdCash, totals.ipdCash, totals.opdCard, totals.ipdCard, totals.opdCheque, totals.ipdCheque, totals.opdOnline, totals.ipdOnline]);

    autoTable(doc, {
      head: [tableColumn], body: tableRows, startY: 20, theme: 'grid', styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 172, 193], halign: 'center' },
      didParseCell: (data) => { if (data.row.index === tableRows.length - 1) data.cell.styles.fontStyle = 'bold'; }
    });
    doc.save("Consolidated_Report.pdf");
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

  const header = (
    <div className="d-flex justify-content-between align-items-center mb-1">
      <div className="d-flex align-items-center" style={{ gap: "20px" }}>
        <div className="d-flex align-items-center">
          <span className="me-1" style={{ fontWeight: "bold", color: "#006064", fontSize: "12px" }}>Show</span>
          <Form.Select size="sm" style={{ width: "70px", borderRadius: "8px", border: "1px solid #4dd0e1", fontSize: "12px" }} value={rows} onChange={(e) => setRows(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </Form.Select>
        </div>
        <div className="d-flex align-items-center">
          <span className="me-1" style={{ fontWeight: "bold", color: "#006064", fontSize: "12px" }}>Search</span>
          <span className="p-input-icon-left">
            <InputText value={searchText} onChange={onGlobalFilterChange} placeholder="Global Search..." className="p-inputtext-sm" style={{ width: "200px", borderRadius: "8px", border: "1px solid #4dd0e1", fontSize: "12px" }} />
          </span>
        </div>
      </div>
      <div className="d-flex" style={{ gap: "10px" }}>
        <button className="btn btn-success btn-sm" onClick={exportToExcel} style={{ display: "flex", alignItems: "center", gap: "5px", borderRadius: "8px" }}>
          <i className="fa fa-file-excel-o"></i> Download Excel
        </button>
        <button className="btn btn-danger btn-sm" onClick={downloadPDF} style={{ display: "flex", alignItems: "center", gap: "5px", borderRadius: "8px" }}>
          <i className="fa fa-file-pdf-o"></i> Download PDF
        </button>
      </div>
    </div>
  );

  return (
    <div className="themebody-wrap" style={{ padding: "20px", background: "linear-gradient(to right, #e0f7fa, #80deea)", fontFamily: "'Poppins', Arial, sans-serif", minHeight: "100vh" }}>
      <PageBreadcrumb pagename="OPD + IPD Collection" />
      <SimpleBar className="theme-body common-dash">
        <Container fluid>
          <Row>
            <Col md={12}>
              <Card style={{ borderRadius: "12px", boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)", border: "1px solid #00bcd4", background: "white" }}>
                <Card.Header className="text-center" style={{ background: "linear-gradient(to right, #00acc1, #007c91)", color: "white", padding: "0.8rem" }}>
                  <h4 style={{ margin: 0 }}>OPD + IPD Collection Report</h4>
                </Card.Header>
                <Card.Body style={{ padding: "5px" }}>
                  <Form onSubmit={handleSearch}>
                    <Row className="align-items-end mb-4 flex-nowrap" style={{ margin: "0 -5px" }}>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ fontWeight: "bold", color: "#006064", fontSize: "12px" }}>From Date</Form.Label>
                          <Form.Control type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ border: "2px solid #4dd0e1", borderRadius: "8px", padding: "6px", backgroundColor: "#e0f7fa", fontSize: "12px" }} />
                        </Form.Group>
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ fontWeight: "bold", color: "#006064", fontSize: "12px" }}>To Date</Form.Label>
                          <Form.Control type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ border: "2px solid #4dd0e1", borderRadius: "8px", padding: "6px", backgroundColor: "#e0f7fa", fontSize: "12px" }} />
                        </Form.Group>
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <Form.Group className="mb-2">
                          <button className="btn btn-primary" type="submit" style={{ height: "35px", width: "100%", backgroundColor: "#00acc1", borderColor: "#00bcd4", color: "white", borderRadius: "8px", fontWeight: "bold", fontSize: "13px" }}>
                            {loading ? "Loading..." : "Search"}
                          </button>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>

                  <DataTable
                    value={tableData}
                    paginator rows={rows}
                    filters={filters}
                    header={header}
                    footerColumnGroup={footerGroup}
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                    emptyMessage={loading ? "Loading..." : "No records found."}
                    className="p-datatable-sm custom-datatable"
                    style={{ fontSize: "12px" }}
                    rowHover stripedRows responsiveLayout="scroll"
                  >
                    <Column header="Sr No" body={(rowData, { rowIndex }) => rowIndex + 1} style={{ width: "60px", textAlign: "center" }} />
                    <Column field="receiptDate" header="Date" body={(rowData) => formatDateDisplay(rowData.receiptDate)} />
                    <Column field="opdCash" header="OPD Cash" />
                    <Column field="ipdCash" header="IPD Cash" />
                    <Column field="opdCard" header="OPD Card" />
                    <Column field="ipdCard" header="IPD Card" />
                    <Column field="opdCheque" header="OPD Chq" />
                    <Column field="ipdCheque" header="IPD Chq" />
                    <Column field="opdOnline" header="OPD Onl" />
                    <Column field="ipdOnline" header="IPD Onl" />
                  </DataTable>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </SimpleBar>
      <style>{`
        .custom-datatable .p-datatable-header { background: #e0f7fa; border: 1px solid #4dd0e1; border-top-left-radius: 8px; border-top-right-radius: 8px; padding: 10px; }
        .custom-datatable .p-datatable-thead > tr > th { background-color: #b2ebf2 !important; color: black !important; font-size: 12px; padding: 10px 8px !important; border: 1px solid #90caf9 !important; text-align: center !important; }
        .custom-datatable .p-datatable-thead > tr > th .p-column-header-content { justify-content: center !important; }
        .custom-datatable .p-datatable-tbody > tr > td { font-size: 12px; padding: 8px; border: 1px solid #90caf9; text-align: center !important; }
        .custom-datatable .p-datatable-tfoot > tr > td { background-color: #e0f7fa !important; color: black !important; padding: 10px 8px; border: 1px solid #90caf9 !important; font-size: 12px; }
        .custom-datatable .p-paginator { background: #f8fdfe; border: 1px solid #4dd0e1; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; padding: 5px; }
      `}</style>
    </div>
  );
};

export default OPDIPDCollection;