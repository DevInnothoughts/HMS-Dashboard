import React, { useState, useEffect, useCallback } from "react";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import {
  Row,
  Col,
  Card,
  Container,
  Spinner,
  Form,
  Button,
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import { InputText } from "primereact/inputtext";
import SimpleBar from "simplebar-react";
import moment from "moment";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { decodeJwt } from "../../Utility/decode-jwt";

// const BASE_URL_ENV = import.meta.env.VITE_FRONTEND_SERVER_URL;
const BASE_URL = "http://194.195.117.79:5100/api";

const BirthdayAlert = () => {
  const currentDate = moment().format("DD-MM-YYYY");
  const [patients, setPatients] = useState([]);

  const formatBirthDate = (birthDate) => {
    if (!birthDate || birthDate === "-" || birthDate === "--") return "-";
    const m = moment(birthDate, [
      "DD-MM-YYYY",
      "DD/MM/YYYY",
      "DDMMYYYY",
      "YYYY-MM-DD",
    ]);
    return m.isValid() ? m.format("DD-MM-YYYY") : birthDate;
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr || dateStr === "-" || dateStr === "--") return "-";
    const cleanDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    const parts = cleanDate.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("default");
  const [rows, setRows] = useState(10);
  const [first, setFirst] = useState(0);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload?.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  const fetchBirthdays = useCallback(async () => {
    if (currentLocation === "default") return;

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/managereports/getBirthdayAlerts?location=${currentLocation}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Birthday API raw response:", result);

        // Extracting data from your controller's structure: result.reportsdetails.data
        const birthdayData = result.reportsdetails?.data || [];
        console.log("Extracted birthday patients list:", birthdayData);
        setPatients(birthdayData);
      } else {
        console.error(
          "Birthday API error response:",
          response.status,
          response.statusText,
        );
      }
    } catch (error) {
      console.error("Error fetching birthdays:", error);
    } finally {
      setLoading(false);
    }
  }, [currentLocation]);

  useEffect(() => {
    fetchBirthdays();
  }, [fetchBirthdays]);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

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

  const handlePrint = () => {
    window.print();
  };

  const exportToExcel = () => {
    if (!patients || patients.length === 0) {
      alert("No data available to export.");
      return;
    }

    const excelData = filteredData.map((item, index) => ({
      "Sr No": index + 1,
      "Birth Date": formatBirthDate(item.birth_date),
      "Patient Name": item.name || "-",
      "Contact Number": item.phone || "-",
      Address: item.address || "-",
      "Last Visited Date": formatDateDisplay(
        item.last_visited_date || item.lastVisitedDate,
      ),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Birthday Alerts");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    saveAs(
      new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      }),
      `Birthday_Alerts_${currentDate}.xlsx`,
    );
  };

  const getFilteredData = () => {
    const data = [...patients];
    data.sort((a, b) => {
      const dateA = moment(a.birth_date, [
        "DD-MM-YYYY",
        "DD/MM/YYYY",
        "DDMMYYYY",
        "YYYY-MM-DD",
      ]);
      const dateB = moment(b.birth_date, [
        "DD-MM-YYYY",
        "DD/MM/YYYY",
        "DDMMYYYY",
        "YYYY-MM-DD",
      ]);
      return dateA.diff(dateB);
    });

    if (!globalFilterValue) return data;
    const query = globalFilterValue.toLowerCase().trim();
    return data.filter((item) => {
      const name = (item.name || "").toLowerCase();
      const phone = (item.phone || "").toLowerCase();
      const address = (item.address || "").toLowerCase();
      const birthDate = formatBirthDate(item.birth_date).toLowerCase();
      const lastVisited = formatDateDisplay(
        item.last_visited_date || item.lastVisitedDate,
      ).toLowerCase();

      return (
        name.includes(query) ||
        phone.includes(query) ||
        address.includes(query) ||
        birthDate.includes(query) ||
        lastVisited.includes(query)
      );
    });
  };

  const filteredData = getFilteredData();

  const renderHeader = () => {
    return (
      <div
        className="d-flex justify-content-between align-items-center no-print"
        style={{
          backgroundColor: "#e0f7fa",
          padding: "6px 12px",
          borderRadius: "8px",
          border: "1.5px solid #4dd0e1",
          marginBottom: "12px",
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center">
            <span
              style={{
                marginRight: "10px",
                fontSize: "13px",
                fontWeight: "600",
                color: "#00838f",
              }}
            >
              Show
            </span>
            <Form.Select
              size="sm"
              value={rows}
              onChange={(e) => {
                setRows(parseInt(e.target.value));
                setFirst(0);
              }}
              style={{
                width: "80px",
                height: "35px",
                borderRadius: "8px",
                border: "1.5px solid #4dd0e1",
                fontSize: "13px",
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </Form.Select>
          </div>

          <div className="d-flex align-items-center">
            <span
              style={{
                marginRight: "10px",
                fontSize: "13px",
                fontWeight: "600",
                color: "#00838f",
              }}
            >
              Search
            </span>
            <span className="p-input-icon-left">
              <InputText
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                placeholder="Global Search"
                style={{
                  borderRadius: "8px",
                  padding: "5px 1px 5px 5px",
                  fontSize: "12px",
                  border: "1.5px solid #4dd0e1",
                  width: "200px",
                  height: "35px",
                }}
              />
            </span>
          </div>
        </div>

        <div className="d-flex gap-2">
          <Button
            variant="success"
            onClick={exportToExcel}
            style={{
              backgroundColor: "#2e7d32",
              border: "none",
              borderRadius: "8px",
              padding: "8px 15px",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginBottom: "12px",
            }}
          >
            <i className="fa fa-file-excel-o"></i>
            Download Excel
          </Button>
          <Button
            variant="danger"
            onClick={handlePrint}
            style={{
              backgroundColor: "#ef5350",
              border: "none",
              borderRadius: "8px",
              padding: "8px 15px",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginBottom: "12px",
            }}
          >
            <i className="fa fa-print"></i>
            Print List
          </Button>
        </div>
      </div>
    );
  };

  const header = renderHeader();

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        fontFamily: "'Poppins', Arial, sans-serif",
        minHeight: "100vh",
        padding: "10px",
      }}
    >
      <PageBreadcrumb pagename="Birthday Alert" />

      <div className="theme-body">
        <Container fluid>
          <Row className="justify-content-center">
            <Col md={12}>
              <Card
                style={{
                  borderRadius: "12px",
                  boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "1.5px solid #00bcd4",
                  overflow: "hidden",
                }}
              >
                <Card.Header
                  className="text-center"
                  style={{
                    fontWeight: "bold",
                    borderBottom: "none",
                    padding: "0.8rem",
                    background: "linear-gradient(to right, #00acc1, #007c91)",
                    color: "white",
                  }}
                >
                  <h4 style={{ margin: 0, letterSpacing: "0.5px" }}>
                    Today's Birthday Alert
                  </h4>
                  <div
                    style={{ fontSize: "16px", marginTop: "5px", opacity: 0.9 }}
                  >
                    {currentDate}
                  </div>
                </Card.Header>
                <Card.Body style={{ padding: "5px" }}>
                  {renderHeader()}
                  <DataTable
                    value={[...patients].sort((a, b) => {
                      const dateA = moment(a.birth_date, [
                        "DD-MM-YYYY",
                        "DD/MM/YYYY",
                        "DDMMYYYY",
                        "YYYY-MM-DD",
                      ]);
                      const dateB = moment(b.birth_date, [
                        "DD-MM-YYYY",
                        "DD/MM/YYYY",
                        "DDMMYYYY",
                        "YYYY-MM-DD",
                      ]);
                      return dateA.diff(dateB);
                    })}
                    paginator
                    rows={rows}
                    first={first}
                    onPage={(e) => {
                      setFirst(e.first);
                      setRows(e.rows);
                    }}
                    filters={filters}
                    globalFilterFields={["name", "phone", "address"]}
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                    className="p-datatable-sm custom-datatable"
                    stripedRows
                    rowHover
                    responsiveLayout="scroll"
                    style={{ fontSize: "12px" }}
                  >
                    <Column
                      header="Sr No"
                      body={(rowData, { rowIndex }) => rowIndex + 1}
                      style={{ width: "80px", textAlign: "center" }}
                    />
                    <Column
                      field="birth_date"
                      header="Birth Date"
                      body={(rowData) =>
                        formatValue(formatBirthDate(rowData.birth_date))
                      }
                      style={{ width: "130px", textAlign: "center" }}
                    />
                    <Column
                      field="name"
                      header="Patient Name"
                      body={(rowData) => formatValue(rowData.name)}
                    />
                    <Column
                      field="phone"
                      header="Contact Number"
                      body={(rowData) => formatValue(rowData.phone)}
                    />
                    <Column
                      field="address"
                      header="Address"
                      body={(rowData) => formatValue(rowData.address)}
                    />
                    <Column
                      field="last_visited_date"
                      header="Last Visited Date"
                      body={(rowData) =>
                        formatDateDisplay(
                          rowData.last_visited_date || rowData.lastVisitedDate,
                        )
                      }
                      style={{ textAlign: "center", width: "150px" }}
                    />
                  </DataTable>

                  {/* Print-only container displaying all rows */}
                  <div className="print-table-container">
                    <table className="print-table">
                      <thead>
                        <tr>
                          <th>Sr No</th>
                          <th>Birth Date</th>
                          <th>Patient Name</th>
                          <th>Contact Number</th>
                          <th>Address</th>
                          <th>Last Visited Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                              {formatValue(formatBirthDate(item.birth_date))}
                            </td>
                            <td>{formatValue(item.name)}</td>
                            <td>{formatValue(item.phone)}</td>
                            <td>{formatValue(item.address)}</td>
                            <td>
                              {formatDateDisplay(
                                item.last_visited_date || item.lastVisitedDate,
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
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

export default BirthdayAlert;
