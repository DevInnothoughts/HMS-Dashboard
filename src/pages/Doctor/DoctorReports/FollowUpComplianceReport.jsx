import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Container,
  Form,
  Spinner,
  Badge,
} from "react-bootstrap";
import SimpleBar from "simplebar-react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { ColumnGroup } from "primereact/columngroup";
import * as XLSX from "xlsx";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import { decodeJwt } from "../../Utility/decode-jwt";

const BASE_URL = "http://194.195.117.79:5100/api";

const formatValue = (val) => {
  if (
    val === null ||
    val === undefined ||
    val === "" ||
    val === "N/A" ||
    val === 0 ||
    val === "0" ||
    val === "-"
  ) {
    return "-";
  }
  return val;
};

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return "-";
  const datePart = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const parts = datePart.split("-");
  if (parts.length === 3) {
    if (parts[0].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

const getStatusBadge = (status) => {
  switch (status) {
    case "On-time":
      return (
        <Badge
          bg="success"
          className="text-white"
          style={{ color: "#ffffff", fontWeight: "600" }}
        >
          On-time
        </Badge>
      );
    case "Late":
      return (
        <Badge
          bg="warning"
          className="text-white"
          style={{ color: "#ffffff", fontWeight: "600" }}
        >
          Late
        </Badge>
      );
    case "No-show":
      return (
        <Badge
          bg="danger"
          className="text-white"
          style={{ color: "#ffffff", fontWeight: "600" }}
        >
          No-show
        </Badge>
      );
    case "Sx Done":
      return (
        <Badge
          bg="primary"
          className="text-white"
          style={{ color: "#ffffff", fontWeight: "600" }}
        >
          Sx Done
        </Badge>
      );
    default:
      return (
        <Badge
          bg="secondary"
          className="text-white"
          style={{ color: "#ffffff", fontWeight: "600" }}
        >
          {status || "-"}
        </Badge>
      );
  }
};

const FollowUpComplianceReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [doctorOptions, setDoctorOptions] = useState([]);

  const [reportData, setReportData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState(10);
  const [currentLocation, setCurrentLocation] = useState("");

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    let loc = "";
    if (token) {
      const payload = decodeJwt(token);
      if (payload?.jobLocation) {
        loc = payload.jobLocation;
        setCurrentLocation(payload.jobLocation);
      }
    }
    fetchDoctorList(loc);
  }, []);

  const fetchDoctorList = async (locationStr) => {
    try {
      const loc = locationStr || currentLocation || "DP Road";
      const res = await fetch(
        `${BASE_URL}/V1/doctor/reports/getDoctors?location=${encodeURIComponent(loc)}`,
      );
      const result = await res.json();
      if (result.statusCode === 200 && Array.isArray(result.data)) {
        setDoctorOptions(result.data);
      }
    } catch (err) {
      console.error("Error fetching doctors list:", err);
    }
  };

  const handleSearch = async (overrideFrom, overrideTo) => {
    const fDate = overrideFrom !== undefined ? overrideFrom : fromDate;
    const tDate = overrideTo !== undefined ? overrideTo : toDate;

    if (!fDate || !tDate) {
      alert("Please select both From Date and To Date.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let loc = currentLocation;
      if (!loc && token) {
        const payload = decodeJwt(token);
        loc = payload?.jobLocation || "DP Road";
      }

      const res = await fetch(
        `${BASE_URL}/V1/doctor/reports/getFollowUpComplianceReport`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            location: loc || "DP Road",
            Fromdate: fDate,
            Todate: tDate,
            doctorId: selectedDoctor,
            status: selectedStatus,
          }),
        },
      );

      const result = await res.json();
      if (result.statusCode === 200 && Array.isArray(result.data)) {
        setReportData(result.data);
      } else {
        setReportData([]);
      }
    } catch (err) {
      console.error("Error fetching Follow-up Compliance Report:", err);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setSelectedDoctor("All");
    setSelectedStatus("All");
    setSearchText("");
    setReportData([]);
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setFilters({
      ...filters,
      global: { value, matchMode: FilterMatchMode.CONTAINS },
    });
    setSearchText(value);
  };

  const exportToExcel = () => {
    if (!reportData || reportData.length === 0) {
      alert("No data available to export.");
      return;
    }

    const excelData = reportData.map((item, index) => ({
      "Sr No": index + 1,
      "Patient Name": item.patientName || "-",
      Doctor: item.doctor || "-",
      "Last Visit Date": formatDateDisplay(item.lastVisitDate),
      "Follow-up Advised Date": formatDateDisplay(item.followUpAdvisedDate),
      "Actual Return Date": formatDateDisplay(item.actualReturnDate),
      Status: item.status || "-",
      "Days Overdue": item.daysOverdue ?? 0,
      "No. of Visits": item.noOfVisits ?? 1,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Follow-up Compliance");
    XLSX.writeFile(
      workbook,
      `FollowUp_Compliance_Report_${fromDate}_to_${toDate}.xlsx`,
    );
  };

  const handlePrint = () => {
    window.print();
  };

  // Summary Footer
  const filteredData = reportData.filter((item) => {
    if (!searchText) return true;
    const query = searchText.toLowerCase().trim();
    return (
      (item.patientName || "").toLowerCase().includes(query) ||
      (item.doctor || "").toLowerCase().includes(query) ||
      (item.status || "").toLowerCase().includes(query)
    );
  });

  const totalPatients = filteredData.length;
  const onTimeCount = filteredData.filter((r) => r.status === "On-time").length;
  const lateCount = filteredData.filter((r) => r.status === "Late").length;
  const noShowCount = filteredData.filter((r) => r.status === "No-show").length;
  const sxDoneCount = filteredData.filter((r) => r.status === "Sx Done").length;

  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column
          footer={`Total Patients: ${totalPatients}`}
          colSpan={3}
          footerStyle={{ textAlign: "center", fontWeight: "bold" }}
        />
        <Column
          footer={`On-time: ${onTimeCount}`}
          colSpan={2}
          footerStyle={{
            textAlign: "center",
            fontWeight: "bold",
            color: "#2e7d32",
          }}
        />
        <Column
          footer={`Late: ${lateCount}`}
          footerStyle={{
            textAlign: "center",
            fontWeight: "bold",
            color: "#ed6c02",
          }}
        />
        <Column
          footer={`No-show: ${noShowCount}`}
          footerStyle={{
            textAlign: "center",
            fontWeight: "bold",
            color: "#d32f2f",
          }}
        />
        <Column
          footer={`Sx Done: ${sxDoneCount}`}
          colSpan={2}
          footerStyle={{
            textAlign: "center",
            fontWeight: "bold",
            color: "#0288d1",
          }}
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
      </Col>
      <Col
        style={{ padding: "0 5px" }}
        className="d-flex justify-content-end gap-2"
      >
        <button
          className="btn btn-success btn-sm"
          onClick={exportToExcel}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            borderRadius: "8px",
            fontWeight: "600",
            height: "35px",
            marginBottom: "12px",
          }}
        >
          <i className="fa fa-file-excel-o"></i> Export Excel
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
            height: "35px",
            marginBottom: "12px",
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
      <PageBreadcrumb pagename="Follow-up Compliance Report" />
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
                  <h4 style={{ margin: 0 }}>Follow-up Compliance Report</h4>
                  {fromDate && toDate && (
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "normal",
                        marginTop: "5px",
                      }}
                    >
                      Date Range: <b>{formatDateDisplay(fromDate)}</b> to{" "}
                      <b>{formatDateDisplay(toDate)}</b>
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
                      className="align-items-end mb-4 flex-wrap"
                      style={{ margin: "0 -5px" }}
                    >
                      {/* From Date */}
                      <Col md={2} style={{ padding: "0 5px" }}>
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

                      {/* To Date */}
                      <Col md={2} style={{ padding: "0 5px" }}>
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

                      {/* Doctor Filter */}
                      <Col md={3} style={{ padding: "0 5px" }}>
                        <Form.Group className="mb-2">
                          <Form.Label
                            style={{
                              fontWeight: "bold",
                              color: "#006064",
                              fontSize: "12px",
                            }}
                          >
                            Doctor
                          </Form.Label>
                          <Form.Select
                            value={selectedDoctor}
                            onChange={(e) => setSelectedDoctor(e.target.value)}
                            style={{
                              border: "2px solid #4dd0e1",
                              borderRadius: "8px",
                              padding: "6px",
                              backgroundColor: "#e0f7fa",
                              fontSize: "12px",
                            }}
                          >
                            <option value="All">All Doctors</option>
                            {doctorOptions.map((doc) => (
                              <option key={doc.id} value={doc.id}>
                                {doc.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      {/* Status Filter */}
                      <Col md={3} style={{ padding: "0 5px" }}>
                        <Form.Group className="mb-2">
                          <Form.Label
                            style={{
                              fontWeight: "bold",
                              color: "#006064",
                              fontSize: "12px",
                            }}
                          >
                            Status
                          </Form.Label>
                          <Form.Select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            style={{
                              border: "2px solid #4dd0e1",
                              borderRadius: "8px",
                              padding: "6px",
                              backgroundColor: "#e0f7fa",
                              fontSize: "12px",
                            }}
                          >
                            <option value="All">All Statuses</option>
                            <option value="On-time">On-time</option>
                            <option value="Late">Late</option>
                            <option value="No-show">No-show</option>
                            <option value="Sx Done">Sx Done</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      {/* Search & Reset Buttons */}
                      <Col
                        md={2}
                        className="d-flex justify-content-end gap-2 mt-2"
                        style={{ padding: "0 5px" }}
                      >
                        <button
                          className="btn btn-primary"
                          type="submit"
                          style={{
                            height: "35px",
                            minWidth: "90px",
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
                        <button
                          className="btn btn-secondary"
                          type="button"
                          onClick={handleReset}
                          style={{
                            height: "35px",
                            minWidth: "80px",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            fontSize: "13px",
                          }}
                        >
                          Reset
                        </button>
                      </Col>
                    </Row>
                  </Form>

                  {/* Global Controls */}
                  <div className="mb-3 no-print">{renderHeader()}</div>

                  {/* Main DataTable */}
                  <div className="custom-datatable-wrapper">
                    <DataTable
                      value={reportData}
                      rows={rows}
                      filters={filters}
                      paginator
                      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                      footerColumnGroup={footerGroup}
                      className="p-datatable-sm custom-datatable"
                      stripedRows
                      rowHover
                      responsiveLayout="scroll"
                      style={{ fontSize: "12px" }}
                    >
                      <Column
                        header="Sr No"
                        body={(r, { rowIndex }) => rowIndex + 1}
                        style={{ width: "60px", textAlign: "center" }}
                      />
                      <Column
                        field="patientName"
                        header="Patient Name"
                        body={(rowData) => formatValue(rowData.patientName)}
                        style={{ width: "180px" }}
                      />
                      <Column
                        field="doctor"
                        header="Doctor Name"
                        body={(rowData) => formatValue(rowData.doctor)}
                        style={{ width: "160px" }}
                      />
                      <Column
                        field="lastVisitDate"
                        header="Last Visit Date"
                        body={(rowData) =>
                          formatDateDisplay(rowData.lastVisitDate)
                        }
                        style={{ width: "120px", textAlign: "center" }}
                      />
                      <Column
                        field="followUpAdvisedDate"
                        header="Follow-up Advised Date"
                        body={(rowData) =>
                          formatDateDisplay(rowData.followUpAdvisedDate)
                        }
                        style={{ width: "140px", textAlign: "center" }}
                      />
                      <Column
                        field="actualReturnDate"
                        header="Actual Return Date"
                        body={(rowData) =>
                          formatDateDisplay(rowData.actualReturnDate)
                        }
                        style={{ width: "130px", textAlign: "center" }}
                      />
                      <Column
                        field="status"
                        header="Status"
                        body={(rowData) => getStatusBadge(rowData.status)}
                        style={{ width: "110px", textAlign: "center" }}
                      />
                      <Column
                        field="daysOverdue"
                        header="Days Overdue"
                        body={(rowData) =>
                          rowData.daysOverdue > 0
                            ? `${rowData.daysOverdue} days`
                            : "-"
                        }
                        style={{ width: "110px", textAlign: "center" }}
                      />
                      <Column
                        field="noOfVisits"
                        header="No. of Visits"
                        body={(rowData) => formatValue(rowData.noOfVisits)}
                        style={{ width: "100px", textAlign: "center" }}
                      />
                    </DataTable>
                  </div>

                  {/* Print-only container */}
                  <div className="print-table-container">
                    <table className="print-table mb-4">
                      <thead>
                        <tr>
                          <th style={{ width: "50px" }}>Sr No</th>
                          <th style={{ width: "160px" }}>Patient Name</th>
                          <th style={{ width: "140px" }}>Doctor Name</th>
                          <th style={{ width: "110px" }}>Last Visit Date</th>
                          <th style={{ width: "130px" }}>
                            Follow-up Advised Date
                          </th>
                          <th style={{ width: "120px" }}>Actual Return Date</th>
                          <th style={{ width: "90px" }}>Status</th>
                          <th style={{ width: "90px" }}>Days Overdue</th>
                          <th style={{ width: "80px" }}>No. of Visits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{formatValue(item.patientName)}</td>
                            <td>{formatValue(item.doctor)}</td>
                            <td>{formatDateDisplay(item.lastVisitDate)}</td>
                            <td>
                              {formatDateDisplay(item.followUpAdvisedDate)}
                            </td>
                            <td>{formatDateDisplay(item.actualReturnDate)}</td>
                            <td>{item.status || "-"}</td>
                            <td>
                              {item.daysOverdue > 0
                                ? `${item.daysOverdue} d`
                                : "-"}
                            </td>
                            <td>{formatValue(item.noOfVisits)}</td>
                          </tr>
                        ))}
                        <tr className="print-totals-row">
                          <td colSpan={3}>Total Patients: {totalPatients}</td>
                          <td colSpan={2}>On-time: {onTimeCount}</td>
                          <td>Late: {lateCount}</td>
                          <td>No-show: {noShowCount}</td>
                          <td colSpan={2}>Sx Done: {sxDoneCount}</td>
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

export default FollowUpComplianceReport;
