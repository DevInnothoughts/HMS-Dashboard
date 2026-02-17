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
import { decodeJwt } from "../../../utils/decode-jwt"; // Utility for location extraction

const BASE_URL = "http://localhost:5100/api";

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

  // 1. Get Location Context from Token
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

  // 2. Data Merging Logic
  const mergeCollectionData = (opdData, ipdData) => {
    const mergedMap = {};

    // Process OPD Data
    opdData.forEach(item => {
      const dateKey = item.date.split('T')[0];
      mergedMap[dateKey] = {
        receiptDate: dateKey,
        opdCash: parseFloat(item.opdCash) || 0,
        opdCard: parseFloat(item.opdCard) || 0,
        opdCheque: parseFloat(item.opdCheque) || 0,
        opdOnline: parseFloat(item.opdOnline) || 0,
        ipdCash: 0, ipdCard: 0, ipdCheque: 0, ipdOnline: 0 // placeholders
      };
    });

    // Process and Merge IPD Data
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

    // Convert map to sorted array
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
      
      // Merge OPD and IPD arrays into one table-ready array
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

      if (mergedData.length === 0) {
        alert("No records found for selected range.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "N/A";
    return dateStr.split("-").reverse().join("-"); // YYYY-MM-DD to DD-MM-YYYY
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

    excelData.push({ "Sr No": "TOTAL", ...totals });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["Consolidated"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: fileType }), `Consolidated_Report_${fromDate}.xlsx`);
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
      head: [tableColumn], body: tableRows, startY: 25, theme: 'grid', styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 172, 193] }
    });
    doc.save(`Consolidated_Report_${fromDate}.pdf`);
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

  return (
    <div className="themebody-wrap" style={{ padding: "20px", background: "linear-gradient(to right, #e0f7fa, #80deea)", minHeight: "100vh" }}>
      <PageBreadcrumb pagename="OPD + IPD Collection" />
      <SimpleBar className="theme-body common-dash">
        <Container fluid>
          <Row>
            <Col md={12}>
              <Card style={{ borderRadius: "12px", border: "1px solid #00bcd4", boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)" }}>
                <Card.Header className="text-center py-3" style={{ background: "linear-gradient(to right, #00acc1, #007c91)", color: "white" }}>
                  <h4 style={{ margin: 0, fontWeight: "700" }}>Consolidated Collection (OPD + IPD)</h4>
                </Card.Header>
                <Card.Body style={{ padding: "10px" }}>
                  <Form onSubmit={handleSearch}>
                    <Row className="align-items-end mb-4 flex-nowrap" style={{ margin: "0 -5px" }}>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <Form.Label style={{ fontWeight: "bold", fontSize: "12px", color: "#006064" }}>From Date</Form.Label>
                        <Form.Control type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ border: "2px solid #4dd0e1", borderRadius: "8px" }} />
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <Form.Label style={{ fontWeight: "bold", fontSize: "12px", color: "#006064" }}>To Date</Form.Label>
                        <Form.Control type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ border: "2px solid #4dd0e1", borderRadius: "8px" }} />
                      </Col>
                      <Col style={{ padding: "0 5px", flex: "1" }}>
                        <button className="btn btn-primary w-100" type="submit" style={{ height: "35px", background: "#00acc1", borderRadius: "8px", fontWeight: "bold" }}>
                          {loading ? "Searching..." : "Search"}
                        </button>
                      </Col>
                    </Row>
                  </Form>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex gap-3 align-items-center">
                      <Form.Select size="sm" value={rows} onChange={(e) => setRows(Number(e.target.value))} style={{ width: "80px" }}>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </Form.Select>
                      <InputText value={searchText} onChange={onGlobalFilterChange} placeholder="Filter records..." className="p-inputtext-sm" />
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-success btn-sm" onClick={exportToExcel} style={{ borderRadius: "8px" }}>Excel</button>
                      <button className="btn btn-danger btn-sm" onClick={downloadPDF} style={{ borderRadius: "8px" }}>PDF</button>
                    </div>
                  </div>

                  <DataTable
                    value={tableData}
                    paginator rows={rows}
                    filters={filters}
                    header={null} // custom header used above
                    footerColumnGroup={footerGroup}
                    className="p-datatable-sm custom-datatable"
                    emptyMessage={loading ? "Loading..." : "No records found."}
                    stripedRows
                    responsiveLayout="scroll"
                  >
                    <Column header="Sr No" body={(r, { rowIndex }) => rowIndex + 1} style={{ width: "50px", textAlign: "center" }} />
                    <Column field="receiptDate" header="Date" body={(r) => formatDateDisplay(r.receiptDate)} />
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
        .custom-datatable .p-datatable-thead > tr > th { background-color: #b2ebf2 !important; font-size: 11px; border: 1px solid #90caf9 !important; text-align: center !important; color: black !important; }
        .custom-datatable .p-datatable-tbody > tr > td { font-size: 11px; border: 1px solid #90caf9; text-align: center !important; }
      `}</style>
    </div>
  );
};

export default OPDIPDCollection;