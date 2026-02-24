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



// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://localhost:5100/api"

const OPDCollectionReports = () => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [tableData, setTableData] = useState([
        {
            patientName: "John Doe",
            receipt_date: "2024-05-10",
            consultation: "General",
            cashamt: 1000,
            cardamt: 2000,
            paytmamt: 1500,
            onlineamt: 4000,
            discount: 500,
            utr: "UTR123456"
        },
        {
            patientName: "Jane Smith",
            receipt_date: "2024-05-12",
            consultation: "Specialist",
            cashamt: 5000,
            cardamt: 0,
            paytmamt: 0,
            onlineamt: 1000,
            discount: 200,
            utr: "UTR789012"
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [rows, setRows] = useState(10);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [totals, setTotals] = useState({
        cash: 6000,
        card: 2000,
        paytm: 1500,
        online: 5000,
        discount: 700,
    });

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
                Fromdate: formatDateForAPI(fromDate),
                Todate: formatDateForAPI(toDate),
            });

            // Assuming same API endpoint or similar structure, keeping as placeholder or same URL
            const response = await fetch(
                `${BASE_URL}/V1/invoice/listInvoice?${params}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch data");
            }

            const responseData = await response.json();
            const data = Array.isArray(responseData)
                ? responseData
                : responseData.data && Array.isArray(responseData.data)
                    ? responseData.data
                    : [];

            const newTotals = data.reduce(
                (acc, curr) => ({
                    cash: acc.cash + (parseInt(curr.cashamt) || 0),
                    card: acc.card + (parseInt(curr.cardamt) || 0),
                    paytm: acc.paytm + (parseInt(curr.paytmamt) || 0),
                    online: acc.online + (parseInt(curr.onlineamt) || 0),
                    discount: acc.discount + (parseInt(curr.discountamt) || 0),
                }),
                { cash: 0, card: 0, paytm: 0, online: 0, discount: 0 },
            );

            setTotals(newTotals);
            setTableData(data);

            if (data.length === 0) {
                alert("No records found for the selected date range");
            }
        } catch (error) {
            console.error("Error:", error);
            alert(`Failed to fetch data: ${error.message}`);
            setTableData([]);
            setTotals({ cash: 0, card: 0, paytm: 0, online: 0, discount: 0 });
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const fileExtension = ".xlsx";

        const excelData = tableData.map((item, index) => ({
            "Sr No": index + 1,
            "Patient Name": item.patientName,
            "Receipt Date": formatDateDisplay(item.receipt_date),
            "Consultation": item.consultation,
            "Cash": item.cashamt,
            "Card": item.cardamt,
            "Paytm": item.paytmamt,
            "Online": item.onlineamt,
            "Discount": item.discount,
            "UTR No": item.utr,
        }));

        // Add totals row
        excelData.push({
            "Sr No": "Total",
            "Patient Name": "",
            "Receipt Date": "",
            "Consultation": "",
            "Cash": totals.cash,
            "Card": totals.card,
            "Paytm": totals.paytm,
            "Online": totals.online,
            "Discount": totals.discount,
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


    const downloadPDF = () => {
        const doc = new jsPDF("l", "mm", "a4");
        doc.text("OPD Collection Report", 14, 15);

        const tableColumn = ["Sr No", "Patient Name", "Receipt Date", "Consultation", "Cash", "Card", "Paytm", "Online", "Discount", "UTR No"];
        const tableRows = tableData.map((item, index) => [
            index + 1,
            item.patientName,
            formatDateDisplay(item.receipt_date),
            item.consultation,
            item.cashamt,
            item.cardamt,
            item.paytmamt,
            item.onlineamt,
            item.discount,
            item.utr,
        ]);

        // Add totals row
        tableRows.push([
            "Total",
            "",
            "",
            "",
            totals.cash,
            totals.card,
            totals.paytm,
            totals.online,
            totals.discount,
            ""
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [0, 172, 193] },
            didParseCell: (data) => {
                if (data.row.index === tableRows.length - 1) {
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        });

        doc.save("OPD_Collection_Report.pdf");
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
                <Column footer="Total" colSpan={4} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
                <Column footer={totals.cash} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
                <Column footer={totals.card} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
                <Column footer={totals.paytm} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
                <Column footer={totals.online} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
                <Column footer={totals.discount} footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
                <Column footer="" footerStyle={{ textAlign: 'center', fontWeight: 'bold' }} />
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
                                        padding: "1rem",
                                        background: "linear-gradient(to right, #00acc1, #007c91)",
                                        color: "white",
                                        fontSize: "16px",
                                    }}
                                >
                                    <h4 style={{ margin: 0 }}>OPD Collection Report</h4>
                                </Card.Header>
                                <Card.Body style={{ padding: "5px" }}>
                                    <Form onSubmit={handleFind}>
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
                                        <Column field="patientName" header="Patient Name" />
                                        <Column field="receipt_date" header="Receipt Date" body={(rowData) => formatDateDisplay(rowData.receipt_date)} />
                                        <Column field="consultation" header="Consultation" />
                                        <Column field="cashamt" header="Cash" />
                                        <Column field="cardamt" header="Card" />
                                        <Column field="paytmamt" header="Paytm" />
                                        <Column field="onlineamt" header="Online" />
                                        <Column field="discount" header="Discount" />
                                        <Column field="utr" header="UTR No" />
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
      `}</style>
        </div>
    );
};

export default OPDCollectionReports;
