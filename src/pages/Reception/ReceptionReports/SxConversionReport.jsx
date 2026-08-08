import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Container,
  Form,
  Spinner,
} from "react-bootstrap";
import SimpleBar from "simplebar-react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { ColumnGroup } from "primereact/columngroup";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import { decodeJwt } from "../../Utility/decode-jwt";

const BASE_URL = "http://194.195.117.79:5100/api";

const formatValue = (val) => {
  if (val === null || val === undefined || val === "" || val === "N/A" || val === 0 || val === "0" || val === "-") {
    return "-";
  }
  return val;
};

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return "";
  const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  return datePart.split("-").reverse().join("-");
};

const SxConversionReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState(10);
  const [currentLocation, setCurrentLocation] = useState("");

  // Performance Table States
  const [consultantData, setConsultantData] = useState([]);
  const [assistantData, setAssistantData] = useState([]);
  const [mainConversionData, setMainConversionData] = useState([]);
  const [assistantConversionData, setAssistantConversionData] = useState([]);
  const [mainOverallData, setMainOverallData] = useState([]);
  const [assistantOverallData, setAssistantOverallData] = useState([]);

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
    setFilters({
      ...filters,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    });
    setSearchText(value);
  };

  const processPerformanceData = (rawMsg) => {
    const uniqueIds = [];
    const doctorNames = [];

    rawMsg.forEach((item) => {
      const docId = item.consultantDoctor || item.assistanceDoctor;
      if (!uniqueIds.includes(docId)) {
        uniqueIds.push(docId);
        doctorNames.push(item.DoctorName);
      }
    });

    return uniqueIds.map((id, index) => {
      const stats = { new: 0, follow: 0, postop: 0, med: 0, sur: 0, test: 0 };

      rawMsg.forEach((msg) => {
        if ((msg.consultantDoctor || msg.assistanceDoctor) === id) {
          switch (msg.patient_type) {
            case "New":
              stats.new++;
              break;
            case "Follow":
              stats.follow++;
              break;
            case "Postoperative":
              stats.postop++;
              break;
            default:
              break;
          }
          const advice = msg.diagnosisAdvice || "";
          if (advice.includes("Medication")) stats.med++;
          if (advice.includes("Surgery")) stats.sur++;
          if (advice.includes("Test")) stats.test++;
        }
      });

      return {
        sr: index + 1,
        DoctorName: doctorNames[index],
        count: stats.sur,
        ...stats,
      };
    });
  };

  const handleSearch = async () => {
    if (!fromDate || !toDate) {
      alert("Please select a date range.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/managereports/getDoctorPerformanceAnalytics`,
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

      const result = await response.json();
      
      if (result.success) {
        const { data } = result;

        // Process Performance Data
        setConsultantData(processPerformanceData(data.mainPerformance));
        setAssistantData(processPerformanceData(data.asstPerformance));

        // Helper to map pcount -> count and handle capital DoctorName
        const mapData = (list) =>
          list.map((item) => ({
            ...item,
            count: item.pcount || 0,
            DoctorName: item.DoctorName || item.doctorName,
          }));

        setMainConversionData(mapData(data.mainConversion));
        setAssistantConversionData(mapData(data.asstConversion));
        setMainOverallData(mapData(data.mainOverall));
        setAssistantOverallData(mapData(data.asstOverall));
      }
    } catch (error) {
      console.error("Batch fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getFilteredData = (data) => {
    if (!searchText) return data;
    const query = searchText.toLowerCase().trim();
    return data.filter((item) => {
      const doctorName = (item.DoctorName || "").toLowerCase();
      const count = String(item.count || "").toLowerCase();
      return doctorName.includes(query) || count.includes(query);
    });
  };

  const filteredConsultant = getFilteredData(consultantData);
  const filteredAssistant = getFilteredData(assistantData);
  const filteredAssistantOverall = getFilteredData(assistantOverallData);
  const filteredMainOverall = getFilteredData(mainOverallData);

  const getTableTotal = (data) =>
    data.reduce((sum, item) => sum + (Number(item.count) || 0), 0);

  const consultantTotal = getTableTotal(filteredConsultant);
  const assistantTotal = getTableTotal(filteredAssistant);
  const assistantOverallTotal = getTableTotal(filteredAssistantOverall);
  const mainOverallTotal = getTableTotal(filteredMainOverall);

  const getFooterGroup = (total) => (
    <ColumnGroup>
      <Row>
        <Column
          footer="Total"
          colSpan={2}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={formatValue(total)}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
      </Row>
    </ColumnGroup>
  );

  const renderHeader = () => (
    <Row className="align-items-center" style={{ margin: "0 -5px" }}>
      <Col style={{ padding: "0 5px" }} className="d-flex align-items-center">
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
      </Col>
      <Col style={{ padding: "0 5px" }} className="d-flex justify-content-end">
        <button
          className="btn btn-danger btn-sm"
          onClick={handlePrint}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            borderRadius: "8px",
            fontWeight: "600",
            height: "35px",
          }}
        >
          <i className="fa fa-print"></i> Print Report
        </button>
      </Col>
    </Row>
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
      <PageBreadcrumb pagename="SX Conversion Report" />
      <SimpleBar className="theme-body common-dash">
        <Container fluid>
          <Row>
            <Col md={12}>
              <Card
                style={{
                  borderRadius: "12px",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                  border: "1px solid #00bcd4",
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
                  <h4 style={{ margin: 0 }}>SX Conversion Report</h4>
                  {fromDate && toDate && (
                    <div style={{ fontSize: "13px", fontWeight: "normal", marginTop: "5px" }}>
                      Date Range: <b>{formatDateDisplay(fromDate)}</b> to <b>{formatDateDisplay(toDate)}</b>
                    </div>
                  )}
                </Card.Header>
                <Card.Body className="p-3">
                  <Form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSearch();
                    }}
                    className="no-print"
                  >
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
                            disabled={loading}
                          >
                            {loading ? <Spinner size="sm" /> : "Search"}
                          </button>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>

                  {/* Global Controls */}
                  <div className="mb-3 no-print">{renderHeader()}</div>

                  <Row className="g-4">
                    {/* 1. Main Doctor Conversion */}
                    <Col lg={6} className="custom-datatable-wrapper">
                      <Card
                        className="h-100 border-0 shadow-sm"
                        style={{
                          borderRadius: "10px",
                          overflow: "hidden",
                          border: "1px solid #b2ebf2",
                        }}
                      >
                        <Card.Header
                          className="py-2"
                          style={{
                            background:
                              "linear-gradient(to right, #f1f8f9, #e0f2f1)",
                            borderBottom: "1px solid #b2ebf2",
                          }}
                        >
                          <h6
                            className="m-0 fw-bold"
                            style={{ color: "#006064", fontSize: "14px" }}
                          >
                            <i className="fa fa-user-md me-2"></i> Main Doctor
                            Conversion
                          </h6>
                        </Card.Header>
                        <Card.Body className="p-3">
                          <DataTable
                            value={consultantData}
                            rows={rows}
                            filters={filters}
                            footerColumnGroup={getFooterGroup(consultantTotal)}
                            className="p-datatable-sm custom-datatable"
                            stripedRows
                            rowHover
                            responsiveLayout="scroll"
                            style={{ fontSize: "12px" }}
                          >
                            <Column
                              header="Sr No"
                              body={(r, { rowIndex }) => rowIndex + 1}
                              style={{ width: "80px", textAlign: "center" }}
                            />
                            <Column
                              field="DoctorName"
                              header="Doctor Name"
                              body={(rowData) => formatValue(rowData.DoctorName)}
                              sortable
                            />
                            <Column
                              field="count"
                              header="Count"
                              body={(rowData) => formatValue(rowData.count)}
                              sortable
                              style={{ fontWeight: "bold", color: "#007c91" }}
                            />
                          </DataTable>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* 2. Assistance Doctor Conversion */}
                    <Col lg={6} className="custom-datatable-wrapper">
                      <Card
                        className="h-100 border-0 shadow-sm"
                        style={{
                          borderRadius: "10px",
                          overflow: "hidden",
                          border: "1px solid #b2ebf2",
                        }}
                      >
                        <Card.Header
                          className="py-2"
                          style={{
                            background:
                              "linear-gradient(to right, #f1f8f9, #e0f2f1)",
                            borderBottom: "1px solid #b2ebf2",
                          }}
                        >
                          <h6
                            className="m-0 fw-bold"
                            style={{ color: "#006064", fontSize: "14px" }}
                          >
                            <i className="fa fa-user-plus me-2"></i> Assistance
                            Doctor Conversion
                          </h6>
                        </Card.Header>
                        <Card.Body className="p-3">
                          <DataTable
                            value={assistantData}
                            rows={rows}
                            filters={filters}
                            footerColumnGroup={getFooterGroup(assistantTotal)}
                            className="p-datatable-sm custom-datatable"
                            stripedRows
                            rowHover
                            responsiveLayout="scroll"
                            style={{ fontSize: "12px" }}
                          >
                            <Column
                              header="Sr No"
                              body={(r, { rowIndex }) => rowIndex + 1}
                              style={{ width: "80px", textAlign: "center" }}
                            />
                            <Column
                              field="DoctorName"
                              header="Doctor Name"
                              body={(rowData) => formatValue(rowData.DoctorName)}
                              sortable
                            />
                            <Column
                              field="count"
                              header="Count"
                              body={(rowData) => formatValue(rowData.count)}
                              sortable
                              style={{ fontWeight: "bold", color: "#007c91" }}
                            />
                          </DataTable>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* 3. Assistance Doctor Overall Conversion */}
                    <Col lg={6} className="custom-datatable-wrapper">
                      <Card
                        className="h-100 border-0 shadow-sm"
                        style={{
                          borderRadius: "10px",
                          overflow: "hidden",
                          border: "1px solid #b2ebf2",
                        }}
                      >
                        <Card.Header
                          className="py-2"
                          style={{
                            background:
                              "linear-gradient(to right, #f1f8f9, #e0f2f1)",
                            borderBottom: "1px solid #b2ebf2",
                          }}
                        >
                          <h6
                            className="m-0 fw-bold"
                            style={{ color: "#006064", fontSize: "14px" }}
                          >
                            <i className="fa fa-pie-chart me-2"></i> Assistance
                            Doctor Overall Conversion
                          </h6>
                        </Card.Header>
                        <Card.Body className="p-3">
                          <DataTable
                            value={assistantOverallData}
                            rows={rows}
                            filters={filters}
                            footerColumnGroup={getFooterGroup(assistantOverallTotal)}
                            className="p-datatable-sm custom-datatable"
                            stripedRows
                            rowHover
                            responsiveLayout="scroll"
                            style={{ fontSize: "12px" }}
                          >
                            <Column
                              header="Sr No"
                              body={(r, { rowIndex }) => rowIndex + 1}
                              style={{ width: "80px", textAlign: "center" }}
                            />
                            <Column
                              field="DoctorName"
                              header="Doctor Name"
                              body={(rowData) => formatValue(rowData.DoctorName)}
                              sortable
                            />
                            <Column
                              field="count"
                              header="Count"
                              body={(rowData) => formatValue(rowData.count)}
                              sortable
                              style={{ fontWeight: "bold", color: "#007c91" }}
                            />
                          </DataTable>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* 4. Main Doctor Overall Conversion */}
                    <Col lg={6} className="custom-datatable-wrapper">
                      <Card
                        className="h-100 border-0 shadow-sm"
                        style={{
                          borderRadius: "10px",
                          overflow: "hidden",
                          border: "1px solid #b2ebf2",
                        }}
                      >
                        <Card.Header
                          className="py-2"
                          style={{
                            background:
                              "linear-gradient(to right, #f1f8f9, #e0f2f1)",
                            borderBottom: "1px solid #b2ebf2",
                          }}
                        >
                          <h6
                            className="m-0 fw-bold"
                            style={{ color: "#006064", fontSize: "14px" }}
                          >
                            <i className="fa fa-line-chart me-2"></i> Main
                            Doctor Overall Conversion
                          </h6>
                        </Card.Header>
                        <Card.Body className="p-3">
                          <DataTable
                            value={mainOverallData}
                            rows={rows}
                            filters={filters}
                            footerColumnGroup={getFooterGroup(mainOverallTotal)}
                            className="p-datatable-sm custom-datatable"
                            stripedRows
                            rowHover
                            responsiveLayout="scroll"
                            style={{ fontSize: "12px" }}
                          >
                            <Column
                              header="Sr No"
                              body={(r, { rowIndex }) => rowIndex + 1}
                              style={{ width: "80px", textAlign: "center" }}
                            />
                            <Column
                              field="DoctorName"
                              header="Doctor Name"
                              body={(rowData) => formatValue(rowData.DoctorName)}
                              sortable
                            />
                            <Column
                              field="count"
                              header="Count"
                              body={(rowData) => formatValue(rowData.count)}
                              sortable
                              style={{ fontWeight: "bold", color: "#007c91" }}
                            />
                          </DataTable>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* Print-only container displaying all tables */}
                  <div className="print-table-container">
                    <h5 className="print-section-title">Main Doctor Conversion</h5>
                    <table className="print-table mb-4">
                      <thead>
                        <tr>
                          <th>Sr No</th>
                          <th>Doctor Name</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredConsultant.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{formatValue(item.DoctorName)}</td>
                            <td>{formatValue(item.count)}</td>
                          </tr>
                        ))}
                        <tr className="print-totals-row">
                          <td colSpan={2}>Total</td>
                          <td>{formatValue(consultantTotal)}</td>
                        </tr>
                      </tbody>
                    </table>

                    <h5 className="print-section-title">Assistance Doctor Conversion</h5>
                    <table className="print-table mb-4">
                      <thead>
                        <tr>
                          <th>Sr No</th>
                          <th>Doctor Name</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAssistant.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{formatValue(item.DoctorName)}</td>
                            <td>{formatValue(item.count)}</td>
                          </tr>
                        ))}
                        <tr className="print-totals-row">
                          <td colSpan={2}>Total</td>
                          <td>{formatValue(assistantTotal)}</td>
                        </tr>
                      </tbody>
                    </table>

                    <h5 className="print-section-title">Assistance Doctor Overall Conversion</h5>
                    <table className="print-table mb-4">
                      <thead>
                        <tr>
                          <th>Sr No</th>
                          <th>Doctor Name</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAssistantOverall.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{formatValue(item.DoctorName)}</td>
                            <td>{formatValue(item.count)}</td>
                          </tr>
                        ))}
                        <tr className="print-totals-row">
                          <td colSpan={2}>Total</td>
                          <td>{formatValue(assistantOverallTotal)}</td>
                        </tr>
                      </tbody>
                    </table>

                    <h5 className="print-section-title">Main Doctor Overall Conversion</h5>
                    <table className="print-table mb-4">
                      <thead>
                        <tr>
                          <th>Sr No</th>
                          <th>Doctor Name</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMainOverall.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{formatValue(item.DoctorName)}</td>
                            <td>{formatValue(item.count)}</td>
                          </tr>
                        ))}
                        <tr className="print-totals-row">
                          <td colSpan={2}>Total</td>
                          <td>{formatValue(mainOverallTotal)}</td>
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
        .custom-datatable .p-datatable-header { background: #e0f7fa; border: 1px solid #4dd0e1; padding: 10px; border-radius: 8px 8px 0 0; }
        .custom-datatable .p-datatable-thead > tr > th { background-color: #b2ebf2 !important; color: black !important; font-size: 12px; border: 1px solid #90caf9 !important; text-align: center !important; }
        .custom-datatable .p-datatable-thead > tr > th .p-column-header-content { justify-content: center !important; }
        .custom-datatable .p-datatable-tbody > tr > td { font-size: 12px; padding: 8px; border: 1px solid #90caf9; text-align: center !important; }
        .custom-datatable .p-datatable-tfoot > tr > td { background-color: #e0f7fa !important; color: black !important; padding: 10px 8px; border: 1px solid #90caf9 !important; font-size: 12px; }
        .custom-datatable .p-paginator { background: #f8fdfe; border: 1px solid #4dd0e1; border-radius: 0 0 8px 8px; }

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
          .simplebar-scrollbar,
          .custom-datatable-wrapper {
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
            page-break-inside: avoid !important;
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
          .print-section-title {
            color: #006064 !important;
            font-size: 12px !important;
            font-weight: bold !important;
            margin-top: 15px !important;
            margin-bottom: 5px !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SxConversionReport;
