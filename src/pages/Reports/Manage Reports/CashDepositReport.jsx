import React, { useState, useEffect } from "react";
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
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import SimpleBar from "simplebar-react";

const CashDepositReport = () => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [rows, setRows] = useState(10);

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });

    // Dummy data initialization
    useEffect(() => {
        const dummyData = [
            { id: 1, date: "2024-03-01", opdCash: 5000, ipdCash: 15000, total: 20000, cashDeposited: "", receiptNo: "", difference: "" },
            { id: 2, date: "2024-03-02", opdCash: 4500, ipdCash: 12000, total: 16500, cashDeposited: "", receiptNo: "", difference: "" },
            { id: 3, date: "2024-03-03", opdCash: 6000, ipdCash: 18000, total: 24000, cashDeposited: "", receiptNo: "", difference: "" },
            { id: 4, date: "2024-03-04", opdCash: 3500, ipdCash: 10000, total: 13500, cashDeposited: "", receiptNo: "", difference: "" },
            { id: 5, date: "2024-03-05", opdCash: 5500, ipdCash: 14000, total: 19500, cashDeposited: "", receiptNo: "", difference: "" },
        ];
        setTableData(dummyData);
    }, []);

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters["global"].value = value;
        setFilters(_filters);
        setSearchText(value);
    };

    const handleFind = (e) => {
        if (e) e.preventDefault();
        if (!fromDate || !toDate) {
            alert("Please Enter the all fields details..");
            return;
        }
        setLoading(true);
        // Simulate search
        setTimeout(() => {
            setLoading(false);
        }, 500);
    };

    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleInputChange = (e, rowData, field) => {
        const value = e.target.value;
        const updatedData = tableData.map((item) => {
            if (item.id === rowData.id) {
                const updatedItem = { ...item, [field]: value };
                // Automatically calculate difference if cashDeposited is changed
                if (field === "cashDeposited") {
                    const deposited = parseFloat(value) || 0;
                    updatedItem.difference = (updatedItem.total - deposited).toFixed(2);
                }
                return updatedItem;
            }
            return item;
        });
        setTableData(updatedData);
    };

    const handleAddReceipt = (rowData) => {
        alert(`Adding Receipt for Date: ${formatDateDisplay(rowData.date)}\nReceipt No: ${rowData.receiptNo}\nAmount: ${rowData.cashDeposited}`);
        // Implement save logic here
    };

    const renderHeader = () => {
        return (
            <div className="d-flex justify-content-between align-items-center mb-1">
                <div className="d-flex align-items-center" style={{ gap: "20px" }}>
                    <div className="d-flex align-items-center">
                        <span className="me-1" style={{ fontWeight: "bold", color: "#006064", fontSize: "12px" }}>Show</span>
                        <Form.Select
                            size="sm"
                            style={{ width: "70px", borderRadius: "8px", border: "1px solid #4dd0e1", fontSize: "12px" }}
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
                        <span className="me-1" style={{ fontWeight: "bold", color: "#006064", fontSize: "12px" }}>Search</span>
                        <span className="p-input-icon-left">
                            <InputText
                                value={searchText}
                                onChange={onGlobalFilterChange}
                                placeholder="Global Search..."
                                className="p-inputtext-sm"
                                style={{ width: "200px", borderRadius: "8px", border: "1px solid #4dd0e1", fontSize: "12px" }}
                            />
                        </span>
                    </div>
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
            <PageBreadcrumb pagename="Cash Deposit Report" />

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
                                    <h4 style={{ margin: 0 }}>Cash Deposit Report</h4>
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
                                        <Column field="date" header="Date" body={(rowData) => formatDateDisplay(rowData.date)} />
                                        <Column field="opdCash" header="OPD Cash" />
                                        <Column field="ipdCash" header="IPD Cash" />
                                        <Column field="total" header="Total" />
                                        <Column
                                            header="Cash Deposited"
                                            body={(rowData) => (
                                                <Form.Control
                                                    type="number"
                                                    size="sm"
                                                    value={rowData.cashDeposited}
                                                    onChange={(e) => handleInputChange(e, rowData, "cashDeposited")}
                                                    style={{ fontSize: "12px", borderRadius: "4px", border: "1px solid #4dd0e1" }}
                                                />
                                            )}
                                        />
                                        <Column
                                            header="Receipt No"
                                            body={(rowData) => (
                                                <Form.Control
                                                    type="text"
                                                    size="sm"
                                                    value={rowData.receiptNo}
                                                    onChange={(e) => handleInputChange(e, rowData, "receiptNo")}
                                                    style={{ fontSize: "12px", borderRadius: "4px", border: "1px solid #4dd0e1" }}
                                                />
                                            )}
                                        />
                                        <Column
                                            header="Difference"
                                            body={(rowData) => (
                                                <Form.Control
                                                    type="number"
                                                    size="sm"
                                                    value={rowData.difference}
                                                    onChange={(e) => handleInputChange(e, rowData, "difference")}
                                                    style={{ fontSize: "12px", borderRadius: "4px", border: "1px solid #4dd0e1" }}
                                                />
                                            )}
                                        />
                                        <Column
                                            header="Action"
                                            body={(rowData) => (
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleAddReceipt(rowData)}
                                                    style={{ fontSize: "11px", borderRadius: "4px", backgroundColor: "#00acc1", borderColor: "#00acc1" }}
                                                >
                                                    Add Receipt
                                                </button>
                                            )}
                                            style={{ textAlign: "center" }}
                                        />
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

export default CashDepositReport;
